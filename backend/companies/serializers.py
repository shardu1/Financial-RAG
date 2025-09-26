from rest_framework import serializers
from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'slug', 'description', 'website',
            'created_at', 'updated_at', 'document_count', 'url_count',
            'last_processed_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at', 'document_count', 'url_count']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class CompanyStatsSerializer(serializers.ModelSerializer):
    query_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'document_count', 'url_count', 'query_count',
            'last_processed_at'
        ]

    def get_query_count(self, obj):
        return obj.queries.count()