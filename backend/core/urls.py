from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('rag-status/', views.rag_status, name='rag_status'),
]