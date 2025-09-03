from django.urls import path
from .views import ChatMessageAPIView, VoiceMessageAPIView, CodeAnalysisAPIView

urlpatterns = [
    path('message', ChatMessageAPIView.as_view(), name='chat_message'),
    path('voice', VoiceMessageAPIView.as_view(), name='voice_message'),
    path('code-analysis', CodeAnalysisAPIView.as_view(), name='code_analysis'),
]