import logging
import time
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import Query, QuerySource
from .serializers import (
    QuerySerializer, QueryRequestSerializer, QueryResponseSerializer
)
from companies.models import Company
from core.rag_processor import DjangoFinancialRAGProcessor

logger = logging.getLogger(__name__)


class QueryViewSet(viewsets.ModelViewSet):
    serializer_class = QuerySerializer
    
    def get_queryset(self):
        return Query.objects.filter(company__created_by=self.request.user)

    @action(detail=False, methods=['post'])
    def ask(self, request):
        """Ask a question using the RAG pipeline"""
        serializer = QueryRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        company_id = serializer.validated_data['company_id']
        question = serializer.validated_data['question']
        category = serializer.validated_data.get('category', 'general')
        
        # Verify user owns the company
        company = get_object_or_404(Company, id=company_id, created_by=request.user)
        
        start_time = time.time()
        
        try:
            # Initialize RAG processor
            processor = DjangoFinancialRAGProcessor()
            
            # Get answer from RAG pipeline
            result = processor.analyze_company(question, company.name)
            
            end_time = time.time()
            response_time_ms = int((end_time - start_time) * 1000)
            
            # Save query and sources to database
            with transaction.atomic():
                query = Query.objects.create(
                    company=company,
                    user=request.user,
                    question=question,
                    answer=result['answer'],
                    category=category,
                    sources_count=len(result['sources']),
                    response_time_ms=response_time_ms,
                    context_found=result.get('context_found', True)
                )
                
                # Save sources
                for source_data in result['sources']:
                    QuerySource.objects.create(
                        query=query,
                        source_type=source_data['type'],
                        source_name=source_data['source'],
                        content_snippet=source_data['content'],
                        metadata={
                            'title': source_data.get('title', ''),
                            'url': source_data.get('url', ''),
                            'page': source_data.get('page', ''),
                            'date': source_data.get('date', ''),
                            'headers': source_data.get('headers', [])
                        }
                    )
            
            # Prepare response
            response_data = {
                'query_id': query.id,
                'question': question,
                'answer': result['answer'],
                'company': company.name,
                'sources': result['sources'],
                'context_found': result.get('context_found', True),
                'response_time_ms': response_time_ms,
                'created_at': query.created_at
            }
            
            logger.info(f"Successfully answered query {query.id} for company {company.name}")
            
            return Response(
                QueryResponseSerializer(response_data).data,
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            logger.error(f"Error processing query for company {company.name}: {e}")
            
            # Still save the failed query for debugging
            try:
                with transaction.atomic():
                    query = Query.objects.create(
                        company=company,
                        user=request.user,
                        question=question,
                        answer=f"Error processing query: {str(e)}",
                        category=category,
                        sources_count=0,
                        response_time_ms=int((time.time() - start_time) * 1000),
                        context_found=False
                    )
            except:
                pass
            
            return Response({
                'error': 'Failed to process query',
                'message': str(e),
                'question': question,
                'company': company.name
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get query statistics"""
        queryset = self.get_queryset()
        
        stats = {
            'total_queries': queryset.count(),
            'by_category': {},
            'avg_response_time': 0,
            'successful_queries': queryset.filter(context_found=True).count()
        }
        
        # Calculate stats by category
        for category_code, category_name in Query.CATEGORY_CHOICES:
            count = queryset.filter(category=category_code).count()
            stats['by_category'][category_code] = {
                'name': category_name,
                'count': count
            }
        
        # Calculate average response time
        avg_time = queryset.exclude(response_time_ms__isnull=True).aggregate(
            avg_time=models.Avg('response_time_ms')
        )['avg_time']
        stats['avg_response_time'] = int(avg_time) if avg_time else 0
        
        return Response(stats)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent queries"""
        recent_queries = self.get_queryset()[:10]
        serializer = self.get_serializer(recent_queries, many=True)
        return Response(serializer.data)