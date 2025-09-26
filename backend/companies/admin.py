from django.contrib import admin
from .models import Company


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_by', 'document_count', 'url_count', 'created_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['name', 'description']
    readonly_fields = ['slug', 'qdrant_collection_name', 'created_at', 'updated_at']
    
    fieldsets = (
        (None, {
            'fields': ('name', 'slug', 'description', 'website')
        }),
        ('RAG Information', {
            'fields': ('qdrant_collection_name', 'document_count', 'url_count', 'last_processed_at')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at')
        }),
    )