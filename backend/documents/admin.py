from django.contrib import admin
from .models import Document, ExtractedTable, ScrapedURL


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['original_filename', 'company', 'status', 'file_size_mb', 'pages_count', 'created_at']
    list_filter = ['status', 'created_at', 'company']
    search_fields = ['original_filename', 'company__name']
    readonly_fields = ['file_size', 'file_type', 'created_at', 'updated_at', 'file_size_mb']
    
    fieldsets = (
        (None, {
            'fields': ('company', 'uploaded_by', 'file', 'original_filename')
        }),
        ('File Information', {
            'fields': ('file_size', 'file_size_mb', 'file_type')
        }),
        ('Processing', {
            'fields': ('status', 'processing_started_at', 'processing_completed_at', 'error_message')
        }),
        ('Results', {
            'fields': ('pages_count', 'tables_count', 'chunks_created')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(ExtractedTable)
class ExtractedTableAdmin(admin.ModelAdmin):
    list_display = ['document', 'page_number', 'table_index', 'created_at']
    list_filter = ['created_at', 'page_number']
    search_fields = ['document__original_filename']


@admin.register(ScrapedURL)
class ScrapedURLAdmin(admin.ModelAdmin):
    list_display = ['url', 'company', 'status', 'word_count', 'created_at']
    list_filter = ['status', 'created_at', 'company', 'source_domain']
    search_fields = ['url', 'title', 'company__name']
    readonly_fields = ['source_domain', 'created_at', 'updated_at']
    
    fieldsets = (
        (None, {
            'fields': ('company', 'added_by', 'url', 'source_domain')
        }),
        ('Content', {
            'fields': ('title', 'word_count', 'publish_date')
        }),
        ('Processing', {
            'fields': ('status', 'processing_started_at', 'processing_completed_at', 'error_message')
        }),
        ('Results', {
            'fields': ('chunks_created',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at')
        }),
    )