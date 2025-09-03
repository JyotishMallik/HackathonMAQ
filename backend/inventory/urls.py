from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import InventoryRecordViewSet, ProductInventoryViewSet

router = DefaultRouter()
router.register(r'records', InventoryRecordViewSet)
router.register(r'products', ProductInventoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]