from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'pdfs', views.DocumentViewSet, basename='document')
router.register(r'urls', views.ScrapedURLViewSet, basename='scraped-url')

urlpatterns = [
    path('', include(router.urls)),
]