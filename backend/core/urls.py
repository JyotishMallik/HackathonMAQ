from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/products/', include('products.urls')),
    path('api/tickets/', include('tickets.urls')),
    path('api/vulnerability/', include('vulnerability.urls')),
    path('api/inventory/', include('inventory.urls')),
    path('api/chatbot/', include('chatbot.urls')),  # Add this line
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)