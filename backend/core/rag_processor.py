"""
Django wrapper for the FinancialRAGProcessor
"""
import os
import warnings
import tempfile
import requests
from bs4 import BeautifulSoup
import pdfplumber
import pandas as pd
import time
import logging

from langchain_community.document_loaders import PyPDFLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain_core._api import LangChainDeprecationWarning

from transformers import pipeline
import torch
from qdrant_client import QdrantClient
from qdrant_client.http import exceptions as qdrant_exceptions
from newspaper import Article
from urllib.parse import urlparse

from django.conf import settings

logger = logging.getLogger(__name__)
warnings.filterwarnings("ignore", category=LangChainDeprecationWarning)


class DjangoFinancialRAGProcessor:
    """
    Django-integrated version of FinancialRAGProcessor
    """
    
    def __init__(self):
        # Get settings from Django configuration
        rag_settings = settings.RAG_SETTINGS
        
        # Initialize Embedding Model
        self.embeddings = HuggingFaceEmbeddings(
            model_name=rag_settings['EMBEDDING_MODEL'],
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )

        # Text splitter
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=rag_settings['CHUNK_SIZE'],
            chunk_overlap=rag_settings['CHUNK_OVERLAP']
        )

        # Qdrant client
        self.qdrant_client = QdrantClient(
            host=rag_settings['QDRANT_HOST'], 
            port=rag_settings['QDRANT_PORT']
        )

        # Initialize LLM
        self.llm = self._initialize_llm(rag_settings['LLM_MODEL'])
        
        logger.info("FinancialRAGProcessor initialized successfully")

    def _initialize_llm(self, model_name):
        try:
            from langchain_community.llms import Ollama
            llm = Ollama(model=model_name, temperature=0.1)
            logger.info(f"Using Ollama with {model_name}")
            return llm
        except Exception as e:
            logger.error(f'Could not load LLM model {model_name}: {e}')
            return None

    def create_prompt(self, question, context, company_name):
        return f"""<|system|>
Analyze this data for {company_name} and strictly answer the question based on the context provided:

Context: {context}

<|end|>
<|user|>
{question} for {company_name}.<|end|>
<|assistant|>
"""

    def scrape_news_article(self, url):
        """Scrape news article with error handling"""
        try:
            article = Article(url)
            article.download()
            article.parse()

            return {
                'title': article.title,
                'text': article.text,
                'publish_date': article.publish_date,
                'source': urlparse(url).netloc,
                'url': url
            }
        except Exception as e:
            logger.warning(f"Article parsing failed for {url}, falling back to BeautifulSoup: {e}")
            try:
                response = requests.get(url, timeout=30)
                response.raise_for_status()
                soup = BeautifulSoup(response.content, 'html.parser')

                # Remove script, style, nav, footer, header elements
                for element in soup(['script', 'style', 'nav', 'footer', 'header']):
                    element.decompose()

                return {
                    'title': soup.title.string if soup.title else 'No title',
                    'text': soup.get_text(separator=' ', strip=True),
                    'source': urlparse(url).netloc,
                    'url': url,
                    'publish_date': None
                }
            except Exception as fallback_error:
                logger.error(f"Both article parsing and BeautifulSoup failed for {url}: {fallback_error}")
                raise

    def extract_financial_tables(self, pdf_path):
        """Extract tables from PDF with enhanced error handling"""
        tables = []
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    try:
                        page_tables = page.extract_tables()
                        if page_tables:
                            for table_idx, table in enumerate(page_tables):
                                try:
                                    clean_table = [
                                        [str(cell).strip() if cell else "" for cell in row]
                                        for row in table
                                    ]
                                    if len(clean_table) > 1 and any(clean_table[0]):
                                        df = pd.DataFrame(clean_table[1:], columns=clean_table[0])
                                        table_text = df.to_string(index=False)
                                        tables.append({
                                            'content': f"Financial Table (Page {page_num + 1}):\n{table_text}",
                                            'page': page_num + 1,
                                            'table_index': table_idx,
                                            'headers': clean_table[0],
                                            'rows': clean_table[1:]
                                        })
                                except Exception as table_error:
                                    logger.warning(f"Error processing table {table_idx} on page {page_num + 1}: {table_error}")
                    except Exception as page_error:
                        logger.warning(f"Error processing page {page_num + 1}: {page_error}")
        except Exception as e:
            logger.error(f"Error opening PDF {pdf_path}: {e}")
            raise
        
        logger.info(f"Extracted {len(tables)} tables from {pdf_path}")
        return tables

    def process_financial_pdf(self, file_path):
        """Load PDF and append extracted tables"""
        try:
            loader = PyPDFLoader(file_path)
            documents = loader.load_and_split()
            
            # Extract tables
            tables = self.extract_financial_tables(file_path)
            
            # Add tables as separate documents
            for table_info in tables:
                documents.append(Document(
                    page_content=table_info['content'],
                    metadata={
                        "source": file_path, 
                        "page": table_info['page'], 
                        "type": "financial_table",
                        "table_index": table_info['table_index'],
                        "headers": table_info['headers']
                    }
                ))
            
            logger.info(f"Processed PDF with {len(documents)} total chunks ({len(tables)} tables)")
            return documents, tables
            
        except Exception as e:
            logger.error(f"Error processing PDF {file_path}: {e}")
            raise

    def add_to_knowledge_base(self, content, content_type, company_name):
        """Add documents to Qdrant with improved error handling"""
        collection_name = f"company_{company_name.lower().replace(' ', '_').replace('.', '')}"
        
        try:
            if content_type == "news":
                article_content = self.scrape_news_article(content)
                documents = [Document(
                    page_content=article_content['text'],
                    metadata={
                        "source": article_content['source'],
                        "title": article_content['title'],
                        "type": "news",
                        "company": company_name,
                        "date": str(article_content.get('publish_date', '')),
                        "url": article_content['url']
                    }
                )]
                texts = self.text_splitter.split_documents(documents)
                tables = []

            elif content_type == "pdf":
                texts, tables = self.process_financial_pdf(content)
                for doc in texts:
                    doc.metadata.update({"company": company_name, "type": "financial_report"})

            else:
                raise ValueError(f"Unsupported content type: {content_type}")

            # Add to Qdrant
            vector_store = QdrantVectorStore.from_documents(
                texts,
                self.embeddings,
                url=f"http://{settings.RAG_SETTINGS['QDRANT_HOST']}:{settings.RAG_SETTINGS['QDRANT_PORT']}",
                collection_name=collection_name,
            )
            
            logger.info(f"Added {len(texts)} chunks to collection {collection_name}")
            
            return {
                'chunks_added': len(texts),
                'tables_extracted': len(tables) if content_type == "pdf" else 0,
                'collection_name': collection_name,
                'tables': tables if content_type == "pdf" else []
            }
            
        except Exception as e:
            logger.error(f"Error adding to knowledge base: {e}")
            raise

    def answer_question(self, question, collection_name):
        """RAG pipeline with enhanced error handling"""
        try:
            vector_store = QdrantVectorStore(
                client=self.qdrant_client,
                collection_name=collection_name,
                embedding=self.embeddings
            )

            retriever = vector_store.as_retriever(search_kwargs={"k": 5})
            relevant_docs = retriever.invoke(question)
            
            if not relevant_docs:
                return {
                    "answer": "I couldn't find relevant information to answer your question.",
                    "sources": [],
                    "context_found": False
                }

            context = "\n\n".join([doc.page_content for doc in relevant_docs])
            company_name = collection_name.replace('company_', '').replace('_', ' ').title()
            prompt = self.create_prompt(question, context, company_name)

            # Generate answer
            if not self.llm:
                return {
                    "answer": "LLM model is not available. Please check the configuration.",
                    "sources": self._format_sources(relevant_docs),
                    "context_found": True
                }

            try:
                if hasattr(self.llm, "invoke"):
                    result = self.llm.invoke(prompt)
                    answer = result if isinstance(result, str) else str(result)
                else:
                    result = self.llm(
                        prompt,
                        max_new_tokens=500,
                        temperature=0.1,
                        do_sample=True
                    )
                    if isinstance(result, str):
                        answer = result.strip()
                    elif isinstance(result, list) and len(result) > 0:
                        if 'generated_text' in result[0]:
                            answer = result[0]['generated_text'].strip()
                        else:
                            answer = str(result[0]).strip()
                    else:
                        answer = str(result).strip()
            except Exception as llm_error:
                logger.error(f"LLM generation error: {llm_error}")
                answer = f"Error generating response: {str(llm_error)}"

            return {
                "answer": answer,
                "sources": self._format_sources(relevant_docs),
                "context_found": True,
                "company": company_name
            }
            
        except Exception as e:
            logger.error(f"Error in answer_question: {e}")
            raise

    def _format_sources(self, relevant_docs):
        """Format sources for API response"""
        sources = []
        for doc in relevant_docs:
            source_info = {
                "content": doc.page_content[:300] + "..." if len(doc.page_content) > 300 else doc.page_content,
                "type": doc.metadata.get("type", "unknown"),
                "source": doc.metadata.get("source", "unknown"),
            }
            
            # Add additional metadata based on type
            if doc.metadata.get("type") == "news":
                source_info["title"] = doc.metadata.get("title", "")
                source_info["url"] = doc.metadata.get("url", "")
                source_info["date"] = doc.metadata.get("date", "")
            elif doc.metadata.get("type") == "financial_table":
                source_info["page"] = doc.metadata.get("page", "")
                source_info["table_index"] = doc.metadata.get("table_index", "")
                source_info["headers"] = doc.metadata.get("headers", [])
                
            sources.append(source_info)
        
        return sources

    def analyze_company(self, question, company_name):
        """Convenience wrapper"""
        collection_name = f"company_{company_name.lower().replace(' ', '_').replace('.', '')}"
        return self.answer_question(question, collection_name)

    def get_collection_info(self, company_name):
        """Get information about a company's collection"""
        try:
            collection_name = f"company_{company_name.lower().replace(' ', '_').replace('.', '')}"
            collection_info = self.qdrant_client.get_collection(collection_name)
            return {
                'collection_name': collection_name,
                'points_count': collection_info.points_count,
                'status': collection_info.status
            }
        except Exception as e:
            logger.error(f"Error getting collection info for {company_name}: {e}")
            return None

    def delete_collection(self, company_name):
        """Delete a company's collection"""
        try:
            collection_name = f"company_{company_name.lower().replace(' ', '_').replace('.', '')}"
            self.qdrant_client.delete_collection(collection_name)
            logger.info(f"Deleted collection {collection_name}")
            return True
        except Exception as e:
            logger.error(f"Error deleting collection for {company_name}: {e}")
            return False