import logging
from celery import shared_task
from celery_progress.backend import ProgressRecorder
from django.utils import timezone
from django.db import transaction

from .models import Document, ExtractedTable, ScrapedURL
from companies.models import Company
from core.rag_processor import DjangoFinancialRAGProcessor

logger = logging.getLogger(__name__)


@shared_task(bind=True)
def process_document_task(self, document_id):
    """
    Process a PDF document asynchronously
    """
    progress_recorder = ProgressRecorder(self)
    
    try:
        document = Document.objects.get(id=document_id)
        progress_recorder.set_progress(10, 100, description="Starting PDF processing...")
        
        # Update status
        document.status = 'processing'
        document.processing_started_at = timezone.now()
        document.save()
        
        # Initialize RAG processor
        processor = DjangoFinancialRAGProcessor()
        progress_recorder.set_progress(20, 100, description="Initializing RAG processor...")
        
        # Process the PDF
        result = processor.add_to_knowledge_base(
            content=document.file.path,
            content_type="pdf",
            company_name=document.company.name
        )
        progress_recorder.set_progress(80, 100, description="Adding to knowledge base...")
        
        # Update document with results
        with transaction.atomic():
            document.status = 'completed'
            document.processing_completed_at = timezone.now()
            document.chunks_created = result['chunks_added']
            document.tables_count = result['tables_extracted']
            document.save()
            
            # Save extracted tables
            for table_info in result.get('tables', []):
                ExtractedTable.objects.create(
                    document=document,
                    page_number=table_info['page'],
                    table_index=table_info['table_index'],
                    headers=table_info['headers'],
                    data=table_info['rows']
                )
            
            # Update company counts
            company = document.company
            company.document_count = company.documents.filter(status='completed').count()
            company.last_processed_at = timezone.now()
            company.save()
        
        progress_recorder.set_progress(100, 100, description="PDF processing completed!")
        
        logger.info(f"Successfully processed document {document_id}")
        return {
            'status': 'success',
            'document_id': document_id,
            'chunks_added': result['chunks_added'],
            'tables_extracted': result['tables_extracted']
        }
        
    except Document.DoesNotExist:
        error_msg = f"Document {document_id} not found"
        logger.error(error_msg)
        return {'status': 'error', 'message': error_msg}
        
    except Exception as e:
        error_msg = f"Error processing document {document_id}: {str(e)}"
        logger.error(error_msg)
        
        # Update document status
        try:
            document = Document.objects.get(id=document_id)
            document.status = 'failed'
            document.error_message = str(e)
            document.processing_completed_at = timezone.now()
            document.save()
        except:
            pass
        
        return {'status': 'error', 'message': error_msg}


@shared_task(bind=True)
def process_url_task(self, scraped_url_id):
    """
    Process a URL asynchronously
    """
    progress_recorder = ProgressRecorder(self)
    
    try:
        scraped_url = ScrapedURL.objects.get(id=scraped_url_id)
        progress_recorder.set_progress(10, 100, description="Starting URL scraping...")
        
        # Update status
        scraped_url.status = 'processing'
        scraped_url.processing_started_at = timezone.now()
        scraped_url.save()
        
        # Initialize RAG processor
        processor = DjangoFinancialRAGProcessor()
        progress_recorder.set_progress(30, 100, description="Initializing RAG processor...")
        
        # Process the URL
        result = processor.add_to_knowledge_base(
            content=scraped_url.url,
            content_type="news",
            company_name=scraped_url.company.name
        )
        progress_recorder.set_progress(80, 100, description="Adding to knowledge base...")
        
        # Scrape article info for metadata
        article_info = processor.scrape_news_article(scraped_url.url)
        
        # Update scraped_url with results
        with transaction.atomic():
            scraped_url.status = 'completed'
            scraped_url.processing_completed_at = timezone.now()
            scraped_url.chunks_created = result['chunks_added']
            scraped_url.title = article_info.get('title', '')[:500]
            scraped_url.word_count = len(article_info.get('text', '').split()) if article_info.get('text') else 0
            scraped_url.publish_date = article_info.get('publish_date')
            scraped_url.save()
            
            # Update company counts
            company = scraped_url.company
            company.url_count = company.scraped_urls.filter(status='completed').count()
            company.last_processed_at = timezone.now()
            company.save()
        
        progress_recorder.set_progress(100, 100, description="URL scraping completed!")
        
        logger.info(f"Successfully processed URL {scraped_url_id}")
        return {
            'status': 'success',
            'scraped_url_id': scraped_url_id,
            'chunks_added': result['chunks_added'],
            'title': scraped_url.title
        }
        
    except ScrapedURL.DoesNotExist:
        error_msg = f"ScrapedURL {scraped_url_id} not found"
        logger.error(error_msg)
        return {'status': 'error', 'message': error_msg}
        
    except Exception as e:
        error_msg = f"Error processing URL {scraped_url_id}: {str(e)}"
        logger.error(error_msg)
        
        # Update scraped_url status
        try:
            scraped_url = ScrapedURL.objects.get(id=scraped_url_id)
            scraped_url.status = 'failed'
            scraped_url.error_message = str(e)
            scraped_url.processing_completed_at = timezone.now()
            scraped_url.save()
        except:
            pass
        
        return {'status': 'error', 'message': error_msg}