import os
from django.db import models
from django.contrib.auth.models import User
from companies.models import Company


class Document(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='documents')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # File information
    file = models.FileField(upload_to='documents/%Y/%m/%d/')
    original_filename = models.CharField(max_length=255)
    file_size = models.BigIntegerField()
    file_type = models.CharField(max_length=50)
    
    # Processing information
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    processing_started_at = models.DateTimeField(blank=True, null=True)
    processing_completed_at = models.DateTimeField(blank=True, null=True)
    
    # Extracted information
    pages_count = models.IntegerField(blank=True, null=True)
    tables_count = models.IntegerField(blank=True, null=True)
    chunks_created = models.IntegerField(blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Error handling
    error_message = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.original_filename} - {self.company.name}"

    @property
    def file_size_mb(self):
        return round(self.file_size / (1024 * 1024), 2)

    def delete(self, *args, **kwargs):
        # Delete the file when the model is deleted
        if self.file:
            if os.path.isfile(self.file.path):
                os.remove(self.file.path)
        super().delete(*args, **kwargs)


class ExtractedTable(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='extracted_tables')
    page_number = models.IntegerField()
    table_index = models.IntegerField()
    headers = models.JSONField()
    data = models.JSONField()  # Store table data as JSON
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['document', 'page_number', 'table_index']

    def __str__(self):
        return f"Table {self.table_index} from {self.document.original_filename} (Page {self.page_number})"


class ScrapedURL(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='scraped_urls')
    added_by = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # URL information
    url = models.URLField(max_length=2000)
    title = models.CharField(max_length=500, blank=True, null=True)
    source_domain = models.CharField(max_length=255, blank=True, null=True)
    
    # Processing information
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    processing_started_at = models.DateTimeField(blank=True, null=True)
    processing_completed_at = models.DateTimeField(blank=True, null=True)
    
    # Extracted information
    word_count = models.IntegerField(blank=True, null=True)
    chunks_created = models.IntegerField(blank=True, null=True)
    publish_date = models.DateTimeField(blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Error handling
    error_message = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['company', 'url']

    def __str__(self):
        return f"{self.url} - {self.company.name}"