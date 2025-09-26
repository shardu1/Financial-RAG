# FinanceRAG Django Backend

A Django REST API backend that wraps the FinancialRAGProcessor for document processing, URL scraping, and AI-powered financial analysis.

## Features

- **PDF Document Processing**: Upload and process financial documents with table extraction
- **URL Content Scraping**: Add news articles and web content to the knowledge base
- **AI-Powered Q&A**: Query financial data using natural language
- **Async Processing**: Non-blocking document and URL processing with Celery
- **PostgreSQL Storage**: Robust data persistence with proper relationships
- **RESTful API**: Clean API endpoints for frontend integration

## Architecture

- **Django + DRF**: Web framework and REST API
- **PostgreSQL**: Primary database
- **Celery + Redis**: Async task processing
- **Qdrant**: Vector database for RAG
- **HuggingFace**: Embeddings model
- **Ollama**: Local LLM inference

## Setup Instructions

### 1. Prerequisites

- Python 3.9+
- PostgreSQL 13+
- Redis 6+
- Qdrant vector database
- Ollama (for LLM inference)

### 2. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb financerag

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### 4. Environment Configuration

```bash
cp .env.example .env
# Edit .env with your configurations
```

### 5. Start Services

```bash
# Terminal 1: Django server
python manage.py runserver

# Terminal 2: Celery worker
celery -A financerag worker --loglevel=info

# Terminal 3: Celery beat (for scheduled tasks)
celery -A financerag beat --loglevel=info
```

## API Endpoints

### Companies
- `GET /api/v1/companies/` - List companies
- `POST /api/v1/companies/` - Create company
- `GET /api/v1/companies/{id}/` - Get company details
- `PUT /api/v1/companies/{id}/` - Update company
- `DELETE /api/v1/companies/{id}/` - Delete company
- `POST /api/v1/companies/{id}/clear_knowledge_base/` - Clear company data
- `GET /api/v1/companies/stats/` - Get company statistics

### Documents
- `GET /api/v1/documents/pdfs/` - List PDF documents
- `POST /api/v1/documents/pdfs/` - Upload PDF document
- `GET /api/v1/documents/pdfs/{id}/` - Get document details
- `GET /api/v1/documents/pdfs/{id}/processing_status/` - Get processing status
- `GET /api/v1/documents/pdfs/stats/` - Get processing statistics

### URLs
- `GET /api/v1/documents/urls/` - List scraped URLs
- `POST /api/v1/documents/urls/` - Add URL for scraping
- `GET /api/v1/documents/urls/{id}/` - Get URL details
- `GET /api/v1/documents/urls/{id}/processing_status/` - Get processing status
- `GET /api/v1/documents/urls/stats/` - Get scraping statistics

### Queries
- `GET /api/v1/queries/` - List query history
- `POST /api/v1/queries/ask/` - Ask a question
- `GET /api/v1/queries/{id}/` - Get query details
- `GET /api/v1/queries/stats/` - Get query statistics
- `GET /api/v1/queries/recent/` - Get recent queries

### Health & Status
- `GET /api/v1/health/` - Health check
- `GET /api/v1/rag-status/` - RAG pipeline status

## Usage Examples

### Upload PDF Document

```bash
curl -X POST http://localhost:8000/api/v1/documents/pdfs/ \
  -H "Authorization: Token your-token" \
  -F "company=1" \
  -F "file=@financial_report.pdf"
```

### Add URL for Scraping

```bash
curl -X POST http://localhost:8000/api/v1/documents/urls/ \
  -H "Authorization: Token your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "company": 1,
    "url": "https://investor.apple.com/news/press-releases/2024/01/25/Apple-reports-first-quarter-results"
  }'
```

### Ask a Question

```bash
curl -X POST http://localhost:8000/api/v1/queries/ask/ \
  -H "Authorization: Token your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": 1,
    "question": "What was the revenue for Q4 2023?",
    "category": "revenue"
  }'
```

## Configuration

### RAG Pipeline Settings

Configure in `settings.py` or environment variables:

- `QDRANT_HOST`: Qdrant server host
- `QDRANT_PORT`: Qdrant server port
- `EMBEDDING_MODEL`: HuggingFace embedding model
- `LLM_MODEL`: Ollama model name
- `CHUNK_SIZE`: Text chunking size
- `CHUNK_OVERLAP`: Text chunk overlap
- `MAX_FILE_SIZE`: Maximum upload file size

### Celery Configuration

- `CELERY_BROKER_URL`: Redis broker URL
- `CELERY_RESULT_BACKEND`: Redis results backend

## Development

### Running Tests

```bash
python manage.py test
```

### Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Admin Interface

Access Django admin at `http://localhost:8000/admin/`

## Production Deployment

1. Set `DEBUG=False` in production
2. Configure proper database credentials
3. Use environment variables for secrets
4. Set up proper logging
5. Configure CORS for frontend domain
6. Use a production WSGI server (gunicorn)
7. Set up SSL/TLS
8. Configure static file serving

## Monitoring

- Check `/api/v1/health/` for basic health
- Check `/api/v1/rag-status/` for RAG pipeline status
- Monitor Celery tasks in Django admin
- Check logs in `logs/django.log`

## Troubleshooting

### Common Issues

1. **Qdrant Connection**: Ensure Qdrant is running on configured port
2. **Redis Connection**: Verify Redis is running for Celery
3. **LLM Model**: Ensure Ollama is installed and model is pulled
4. **File Uploads**: Check `MEDIA_ROOT` and permissions
5. **Database**: Verify PostgreSQL connection and migrations