import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone

from .models import Company
from .serializers import CompanySerializer, CompanyStatsSerializer
from core.rag_processor import DjangoFinancialRAGProcessor

logger = logging.getLogger(__name__)


class CompanyViewSet(viewsets.ModelViewSet):
    serializer_class = CompanySerializer
    
    def get_queryset(self):
        return Company.objects.filter(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get company statistics"""
        companies = self.get_queryset()
        serializer = CompanyStatsSerializer(companies, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def clear_knowledge_base(self, request, pk=None):
        """Clear company's knowledge base"""
        company = self.get_object()
        
        try:
            processor = DjangoFinancialRAGProcessor()
            success = processor.delete_collection(company.name)
            
            if success:
                # Reset counters
                company.document_count = 0
                company.url_count = 0
                company.last_processed_at = timezone.now()
                company.save()
                
                # Also clear related database records
                company.documents.all().delete()
                company.scraped_urls.all().delete()
                
                logger.info(f"Cleared knowledge base for company: {company.name}")
                return Response({
                    'message': f'Knowledge base cleared for {company.name}',
                    'success': True
                })
            else:
                return Response({
                    'message': 'Failed to clear knowledge base',
                    'success': False
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            logger.error(f"Error clearing knowledge base for {company.name}: {e}")
            return Response({
                'message': f'Error clearing knowledge base: {str(e)}',
                'success': False
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def collection_info(self, request, pk=None):
        """Get Qdrant collection information"""
        company = self.get_object()
        
        try:
            processor = DjangoFinancialRAGProcessor()
            collection_info = processor.get_collection_info(company.name)
            
            if collection_info:
                return Response(collection_info)
            else:
                return Response({
                    'message': 'Collection not found or error retrieving info'
                }, status=status.HTTP_404_NOT_FOUND)
                
        except Exception as e:
            logger.error(f"Error getting collection info for {company.name}: {e}")
            return Response({
                'message': f'Error retrieving collection info: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)