from django.db import models
from django.contrib.auth.models import User
from companies.models import Company


class Query(models.Model):
    CATEGORY_CHOICES = [
        ('revenue', 'Revenue'),
        ('expenses', 'Expenses'),
        ('risks', 'Risks'),
        ('performance', 'Performance'),
        ('general', 'General'),
    ]
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='queries')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Query details
    question = models.TextField()
    answer = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general')
    
    # Metadata
    sources_count = models.IntegerField(default=0)
    response_time_ms = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Context information
    context_found = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.question[:50]}... - {self.company.name}"


class QuerySource(models.Model):
    SOURCE_TYPES = [
        ('pdf', 'PDF Document'),
        ('url', 'Web Content'),
        ('financial_table', 'Financial Table'),
    ]
    
    query = models.ForeignKey(Query, on_delete=models.CASCADE, related_name='sources')
    
    # Source information
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPES)
    source_name = models.CharField(max_length=500)  # filename or URL
    content_snippet = models.TextField()  # First 300 chars of content
    
    # Additional metadata based on source type
    metadata = models.JSONField(default=dict)  # Store additional source-specific info
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['query', 'id']

    def __str__(self):
        return f"{self.source_type}: {self.source_name} for query {self.query.id}"