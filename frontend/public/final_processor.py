import os
import warnings
import tempfile
import requests
from bs4 import BeautifulSoup
import pdfplumber
import pandas as pd
import time

from langchain_community.document_loaders import PyPDFLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain_core._api import LangChainDeprecationWarning  # for suppression

from transformers import pipeline
import torch
from qdrant_client import QdrantClient
from qdrant_client.http import exceptions as qdrant_exceptions
from newspaper import Article
from urllib.parse import urlparse


warnings.filterwarnings("ignore", category=LangChainDeprecationWarning)


class FinancialRAGProcessor:
    def __init__(self):
        # Initialize Embedding Model
        self.embeddings = HuggingFaceEmbeddings(
            model_name="BAAI/bge-large-en-v1.5",
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )

        # Text splitter
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )

        # Qdrant client
        self.qdrant_client = QdrantClient(host="localhost", port=6333)

        # Initialize LLM
        self.llm = self._initialize_llm()

    def _initialize_llm(self):
        try:
            from langchain_community.llms import Ollama
            llm = Ollama(model="phi3:mini", temperature=0.1)
            print("Using Ollama with Phi-3-mini")
            return llm
        except Exception:
            print('Colud not load Model')

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
        """Scrape news article"""
        try:
            article = Article(url)
            article.download()
            article.parse()

            return {
                'title': article.title,
                'text': article.text,
                'publish_date': article.publish_date,
                'source': urlparse(url).netloc
            }
        except:
            response = requests.get(url)
            soup = BeautifulSoup(response.content, 'html.parser')

            for element in soup(['script', 'style', 'nav', 'footer', 'header']):
                element.decompose()

            return {
                'title': soup.title.string if soup.title else 'No title',
                'text': soup.get_text(separator=' ', strip=True),
                'source': urlparse(url).netloc
            }

    def extract_financial_tables(self, pdf_path):
        """Extract tables from PDF"""
        tables = []
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                page_tables = page.extract_tables()
                if page_tables:
                    for table in page_tables:
                        try:
                            clean_table = [
                                [str(cell).strip() if cell else "" for cell in row]
                                for row in table
                            ]
                            if len(clean_table) > 1 and any(clean_table[0]):
                                df = pd.DataFrame(clean_table[1:], columns=clean_table[0])
                                table_text = df.to_string(index=False)
                                tables.append(f"Financial Table:\n{table_text}")
                        except Exception as e:
                            print(f"Error processing table: {e}")
        return tables

    def process_financial_pdf(self, file_path):
        """Load PDF and append extracted tables"""
        loader = PyPDFLoader(file_path)
        documents = loader.load_and_split()

        tables = self.extract_financial_tables(file_path)
        for i, table_text in enumerate(tables):
            documents.append(Document(
                page_content=table_text,
                metadata={"source": file_path, "page": i, "type": "financial_table"}
            ))
        return documents

    def add_to_knowledge_base(self, content, content_type, company_name):
        """Add documents to Qdrant"""
        collection_name = f"company_{company_name.lower().replace(' ', '_')}"

        if content_type == "news":
            article_content = self.scrape_news_article(content)
            documents = [Document(
                page_content=article_content['text'],
                metadata={
                    "source": article_content['source'],
                    "title": article_content['title'],
                    "type": "news",
                    "company": company_name,
                    "date": str(article_content.get('publish_date', ''))
                }
            )]
            texts = self.text_splitter.split_documents(documents)

        elif content_type == "pdf":
            texts = self.process_financial_pdf(content)
            for doc in texts:
                doc.metadata.update({"company": company_name, "type": "financial_report"})

       
        QdrantVectorStore.from_documents(
            texts,
            self.embeddings,
            url="http://localhost:6333",
            collection_name=collection_name,
        )
        return len(texts)

    def answer_question(self, question, collection_name):
        """RAG pipeline"""
        vector_store = QdrantVectorStore(
            client=self.qdrant_client,
            collection_name=collection_name,
            embedding=self.embeddings
        )

        retriever = vector_store.as_retriever(search_kwargs={"k": 3})

        # Updated retriever usage
        relevant_docs = retriever.invoke(question)
        context = "\n\n".join([doc.page_content for doc in relevant_docs])

        company_name = collection_name.replace('company_', '').replace('_', ' ').title()
        prompt = self.create_prompt(question, context, company_name)

        # Updated LLM call
        if hasattr(self.llm, "invoke"):
            result = self.llm.invoke(prompt)
            answer = result if isinstance(result, str) else str(result)
        else:
            result = self.llm(
                prompt,
                max_new_tokens=200,
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

        return {
            "answer": answer,
            "sources": [{
                "content": doc.page_content[:200] + "...",
                "type": doc.metadata.get("type", "unknown"),
                "source": doc.metadata.get("source", "unknown")
            } for doc in relevant_docs]
        }

    def analyze_company(self, question, company_name):
        """Convenience wrapper"""
        collection_name = f"company_{company_name.lower().replace(' ', '_')}"
        return self.answer_question(question, collection_name)


#  Example usage
if __name__ == "__main__":
    processor = FinancialRAGProcessor()

    result = processor.analyze_company(
        "What are the net liabilities of the company given in the annual report?",
        "hal"
    )

    print(result["answer"])
