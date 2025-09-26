from django.db import models
from django.contrib.auth.models import User


class Company(models.Model):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # RAG-specific fields
    qdrant_collection_name = models.CharField(max_length=255, blank=True, null=True)
    document_count = models.IntegerField(default=0)
    url_count = models.IntegerField(default=0)
    last_processed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        verbose_name_plural = "Companies"
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.name)
        
        if not self.qdrant_collection_name:
            self.qdrant_collection_name = f"company_{self.slug.replace('-', '_')}"
        
        super().save(*args, **kwargs)