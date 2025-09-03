from django.db import models

class InventoryRecord(models.Model):
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='inventory_records')
    quantity_change = models.IntegerField()
    previous_quantity = models.IntegerField()
    new_quantity = models.IntegerField()
    transaction_type = models.CharField(max_length=20, choices=[('PURCHASE', 'Purchase'), ('SALE', 'Sale'), ('ADJUSTMENT', 'Adjustment')])
    transaction_date = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE)
    notes = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.transaction_type} of {self.product.name} ({self.quantity_change})"
    
    def save(self, *args, **kwargs):
        if not self.pk:  # Only run this logic when creating, not updating
            # Update product stock quantity
            product = self.product
            self.previous_quantity = product.stock_quantity
            product.stock_quantity += self.quantity_change
            self.new_quantity = product.stock_quantity
            product.save()
        super().save(*args, **kwargs)