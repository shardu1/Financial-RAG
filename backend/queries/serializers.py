from rest_framework import serializers
from .models import Query, QuerySource


class QuerySourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuerySource
        fields = [
            'id', 'source_type', 'source_name', 'content_snippet', 'metadata'
        ]


class QuerySerializer(serializers.ModelSerializer):
    sources = QuerySourceSerializer(many=True, read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    
    class Meta:
        model = Query
        fields = [
            'id', 'company', 'company_name', 'question', 'answer', 'category',
            'sources_count', 'response_time_ms', 'created_at', 'context_found',
            'sources'
        ]
        read_only_fields = [
            'id', 'answer', 'sources_count', 'response_time_ms', 'created_at',
            'context_found'
        ]


class QueryRequestSerializer(serializers.Serializer):
    company_id = serializers.IntegerField()
    question = serializers.CharField(max_length=2000)
    category = serializers.ChoiceField(
        choices=Query.CATEGORY_CHOICES,
        default='general',
        required=False
    )

    def validate_question(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                "Question must be at least 10 characters long."
            )
        return value.strip()


class QueryResponseSerializer(serializers.Serializer):
    query_id = serializers.IntegerField()
    question = serializers.CharField()
    answer = serializers.CharField()
    company = serializers.CharField()
    sources = QuerySourceSerializer(many=True)
    context_found = serializers.BooleanField()
    response_time_ms = serializers.IntegerField()
    created_at = serializers.DateTimeField()