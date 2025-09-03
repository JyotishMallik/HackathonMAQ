from rest_framework import serializers
from .models import InventoryRecord
from products.models import Product

class InventoryRecordSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = InventoryRecord
        fields = ['id', 'product', 'product_name', 'quantity_change', 'previous_quantity', 
                  'new_quantity', 'transaction_type', 'transaction_date', 'created_by', 
                  'created_by_name', 'notes']
        read_only_fields = ['id', 'created_by', 'transaction_date', 'previous_quantity', 'new_quantity']

class ProductInventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'stock_quantity', 'price']