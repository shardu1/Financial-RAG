from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
import logging

from .rag_processor import DjangoFinancialRAGProcessor

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint"""
    return Response({
        'status': 'healthy',
        'message': 'FinanceRAG API is running'
    })


@api_view(['GET'])
def rag_status(request):
    """Check RAG pipeline status"""
    try:
        processor = DjangoFinancialRAGProcessor()
        return Response({
            'status': 'operational',
            'qdrant_connected': True,
            'llm_available': processor.llm is not None,
            'embedding_model': processor.embeddings.model_name if hasattr(processor.embeddings, 'model_name') else 'Unknown'
        })
    except Exception as e:
        logger.error(f"RAG status check failed: {e}")
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)