from rest_framework import serializers
from .models import Document, ExtractedTable, ScrapedURL


class ExtractedTableSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExtractedTable
        fields = ['id', 'page_number', 'table_index', 'headers', 'data', 'created_at']


class DocumentSerializer(serializers.ModelSerializer):
    extracted_tables = ExtractedTableSerializer(many=True, read_only=True)
    file_size_mb = serializers.ReadOnlyField()
    company_name = serializers.CharField(source='company.name', read_only=True)
    
    class Meta:
        model = Document
        fields = [
            'id', 'company', 'company_name', 'original_filename', 'file_size',
            'file_size_mb', 'file_type', 'status', 'processing_started_at',
            'processing_completed_at', 'pages_count', 'tables_count',
            'chunks_created', 'created_at', 'updated_at', 'error_message',
            'extracted_tables'
        ]
        read_only_fields = [
            'id', 'file_size', 'file_type', 'status', 'processing_started_at',
            'processing_completed_at', 'pages_count', 'tables_count',
            'chunks_created', 'created_at', 'updated_at', 'error_message'
        ]


class DocumentUploadSerializer(serializers.ModelSerializer):
    file = serializers.FileField()
    
    class Meta:
        model = Document
        fields = ['company', 'file']

    def validate_file(self, value):
        # Check file size (50MB limit)
        max_size = 50 * 1024 * 1024  # 50MB
        if value.size > max_size:
            raise serializers.ValidationError(f"File size must be less than 50MB. Current size: {value.size / (1024*1024):.2f}MB")
        
        # Check file type
        if not value.name.lower().endswith('.pdf'):
            raise serializers.ValidationError("Only PDF files are allowed.")
        
        return value

    def create(self, validated_data):
        file = validated_data['file']
        validated_data.update({
            'uploaded_by': self.context['request'].user,
            'original_filename': file.name,
            'file_size': file.size,
            'file_type': 'application/pdf'
        })
        return super().create(validated_data)


class ScrapedURLSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    
    class Meta:
        model = ScrapedURL
        fields = [
            'id', 'company', 'company_name', 'url', 'title', 'source_domain',
            'status', 'processing_started_at', 'processing_completed_at',
            'word_count', 'chunks_created', 'publish_date', 'created_at',
            'updated_at', 'error_message'
        ]
        read_only_fields = [
            'id', 'title', 'source_domain', 'status', 'processing_started_at',
            'processing_completed_at', 'word_count', 'chunks_created',
            'publish_date', 'created_at', 'updated_at', 'error_message'
        ]

    def validate_url(self, value):
        from urllib.parse import urlparse
        
        # Basic URL validation
        parsed = urlparse(value)
        if not parsed.scheme or not parsed.netloc:
            raise serializers.ValidationError("Please provide a valid URL.")
        
        if parsed.scheme not in ['http', 'https']:
            raise serializers.ValidationError("URL must use HTTP or HTTPS protocol.")
        
        return value

    def create(self, validated_data):
        from urllib.parse import urlparse
        
        url = validated_data['url']
        parsed_url = urlparse(url)
        
        validated_data.update({
            'added_by': self.context['request'].user,
            'source_domain': parsed_url.netloc
        })
        return super().create(validated_data)