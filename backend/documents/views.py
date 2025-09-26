import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404

from .models import Document, ScrapedURL
from .serializers import (
    DocumentSerializer, DocumentUploadSerializer, 
    ScrapedURLSerializer
)
from .tasks import process_document_task, process_url_task
from companies.models import Company

logger = logging.getLogger(__name__)


class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        return Document.objects.filter(company__created_by=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return DocumentUploadSerializer
        return DocumentSerializer

    def create(self, request, *args, **kwargs):
        """Upload and process PDF document"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Verify user owns the company
        company = get_object_or_404(Company, id=serializer.validated_data['company'].id, created_by=request.user)
        
        # Create document
        document = serializer.save()
        
        # Start async processing
        task = process_document_task.delay(document.id)
        
        logger.info(f"Started processing document {document.id} with task {task.id}")
        
        return Response({
            'document': DocumentSerializer(document).data,
            'task_id': task.id,
            'message': 'Document uploaded successfully. Processing started.'
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def processing_status(self, request, pk=None):
        """Get document processing status"""
        document = self.get_object()
        
        # If completed or failed, return current status
        if document.status in ['completed', 'failed']:
            return Response({
                'status': document.status,
                'progress': 100 if document.status == 'completed' else 0,
                'error_message': document.error_message
            })
        
        # For pending/processing, we could check Celery task status
        # This would require storing task_id in the document model
        return Response({
            'status': document.status,
            'progress': 50 if document.status == 'processing' else 0
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get document processing statistics"""
        queryset = self.get_queryset()
        
        stats = {
            'total': queryset.count(),
            'completed': queryset.filter(status='completed').count(),
            'processing': queryset.filter(status='processing').count(),
            'failed': queryset.filter(status='failed').count(),
            'pending': queryset.filter(status='pending').count(),
        }
        
        return Response(stats)


class ScrapedURLViewSet(viewsets.ModelViewSet):
    serializer_class = ScrapedURLSerializer
    
    def get_queryset(self):
        return ScrapedURL.objects.filter(company__created_by=self.request.user)

    def create(self, request, *args, **kwargs):
        """Add and process URL"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Verify user owns the company
        company = get_object_or_404(Company, id=serializer.validated_data['company'].id, created_by=request.user)
        
        # Check if URL already exists for this company
        existing = ScrapedURL.objects.filter(
            company=company,
            url=serializer.validated_data['url']
        ).first()
        
        if existing:
            return Response({
                'message': 'This URL has already been added for this company.',
                'scraped_url': ScrapedURLSerializer(existing).data
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create scraped URL
        scraped_url = serializer.save()
        
        # Start async processing
        task = process_url_task.delay(scraped_url.id)
        
        logger.info(f"Started processing URL {scraped_url.id} with task {task.id}")
        
        return Response({
            'scraped_url': ScrapedURLSerializer(scraped_url).data,
            'task_id': task.id,
            'message': 'URL added successfully. Processing started.'
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def processing_status(self, request, pk=None):
        """Get URL processing status"""
        scraped_url = self.get_object()
        
        # If completed or failed, return current status
        if scraped_url.status in ['completed', 'failed']:
            return Response({
                'status': scraped_url.status,
                'progress': 100 if scraped_url.status == 'completed' else 0,
                'error_message': scraped_url.error_message
            })
        
        return Response({
            'status': scraped_url.status,
            'progress': 50 if scraped_url.status == 'processing' else 0
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get URL processing statistics"""
        queryset = self.get_queryset()
        
        stats = {
            'total': queryset.count(),
            'completed': queryset.filter(status='completed').count(),
            'processing': queryset.filter(status='processing').count(),
            'failed': queryset.filter(status='failed').count(),
            'pending': queryset.filter(status='pending').count(),
        }
        
        return Response(stats)