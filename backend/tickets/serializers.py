from rest_framework import serializers
from .models import Ticket, TicketComment
from django.contrib.auth import get_user_model

User = get_user_model()

class TicketCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = TicketComment
        fields = ['id', 'ticket', 'user', 'user_name', 'content', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

class TicketSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)
    comments = TicketCommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Ticket
        fields = ['id', 'title', 'description', 'created_by', 'created_by_name', 'assigned_to', 'assigned_to_name', 
                  'status', 'priority', 'created_at', 'updated_at', 'comments']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']