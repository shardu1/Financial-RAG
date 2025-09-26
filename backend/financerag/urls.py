"""
URL configuration for financerag project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/companies/', include('companies.urls')),
    path('api/v1/documents/', include('documents.urls')),
    path('api/v1/queries/', include('queries.urls')),
    path('api/v1/', include('core.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)