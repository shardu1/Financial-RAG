from django.contrib import admin
from .models import Query, QuerySource


class QuerySourceInline(admin.TabularInline):
    model = QuerySource
    extra = 0
    readonly_fields = ['source_type', 'source_name', 'content_snippet', 'metadata']


@admin.register(Query)
class QueryAdmin(admin.ModelAdmin):
    list_display = ['question_preview', 'company', 'user', 'category', 'sources_count', 'response_time_ms', 'created_at']
    list_filter = ['category', 'created_at', 'company', 'context_found']
    search_fields = ['question', 'answer', 'company__name', 'user__username']
    readonly_fields = ['created_at', 'response_time_ms', 'sources_count']
    inlines = [QuerySourceInline]
    
    fieldsets = (
        (None, {
            'fields': ('company', 'user', 'category')
        }),
        ('Query Content', {
            'fields': ('question', 'answer')
        }),
        ('Results', {
            'fields': ('context_found', 'sources_count', 'response_time_ms')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )
    
    def question_preview(self, obj):
        return obj.question[:50] + "..." if len(obj.question) > 50 else obj.question
    question_preview.short_description = "Question"


@admin.register(QuerySource)
class QuerySourceAdmin(admin.ModelAdmin):
    list_display = ['query_preview', 'source_type', 'source_name_preview', 'created_at']
    list_filter = ['source_type', 'created_at']
    search_fields = ['source_name', 'content_snippet', 'query__question']
    readonly_fields = ['created_at']
    
    def query_preview(self, obj):
        return obj.query.question[:30] + "..." if len(obj.query.question) > 30 else obj.query.question
    query_preview.short_description = "Query"
    
    def source_name_preview(self, obj):
        return obj.source_name[:50] + "..." if len(obj.source_name) > 50 else obj.source_name
    source_name_preview.short_description = "Source"