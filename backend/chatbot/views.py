import json
import uuid
from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from .models import ChatSession, ChatMessage
from .services.openai_service import OpenAIService
from .services.speech_to_text_service import SpeechToTextService
from rest_framework.permissions import AllowAny

class ChatMessageAPIView(views.APIView):
    """API view for handling text chat messages"""
    permission_classes = [AllowAny]    
    def post(self, request):
        try:
            print(f"Received message: {request.data.get('message')}")
            print(f"User authenticated: {request.user.is_authenticated}")
            message = request.data.get('message')
            current_path = request.data.get('currentPath', '/')
            
            if not message:
                return Response(
                    {"error": "No message provided"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get or create a chat session
            session_id = request.session.get('chat_session_id')
            if not session_id:
                session_id = str(uuid.uuid4())
                request.session['chat_session_id'] = session_id
            
            chat_session, _ = ChatSession.objects.get_or_create(
                session_id=session_id,
                defaults={'user': request.user}
            )
            
            # Create session with or without user
            defaults = {}
            if request.user.is_authenticated:
                defaults['user'] = request.user
            
            chat_session, _ = ChatSession.objects.get_or_create(
                session_id=session_id,
                defaults=defaults
            )
            
            # Get previous messages for context
            previous_messages = ChatMessage.objects.filter(
                session=chat_session
            ).order_by('-created_at')[:10]  # Get last 10 messages
            
            # Get AI response
            openai_service = OpenAIService()
            ai_response = openai_service.get_ai_response(
                message, 
                current_path, 
                previous_messages
            )
            
            # Save AI response
            ChatMessage.objects.create(
                session=chat_session,
                content=ai_response['message'],
                from_user=False,
                message_type=ai_response.get('type', 'text'),
                path=current_path
            )
            
            return Response(ai_response, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            print(f"Error in ChatMessageAPIView: {str(e)}")
            traceback.print_exc()
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class VoiceMessageAPIView(views.APIView):
    """API view for handling voice messages"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            audio_file = request.FILES.get('audio')
            current_path = request.data.get('currentPath', '/')
            
            if not audio_file:
                return Response(
                    {"error": "No audio file provided"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Transcribe audio
            speech_service = SpeechToTextService()
            transcription = speech_service.transcribe_audio(audio_file)
            
            if not transcription:
                return Response(
                    {"error": "Could not transcribe audio"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get or create a chat session
            session_id = request.session.get('chat_session_id')
            if not session_id:
                session_id = str(uuid.uuid4())
                request.session['chat_session_id'] = session_id
            
            # Create session with or without user
            defaults = {}
            if request.user.is_authenticated:
                defaults['user'] = request.user
            
            chat_session, _ = ChatSession.objects.get_or_create(
                session_id=session_id,
                defaults=defaults
            )
            
            # Save user message
            user_message = ChatMessage.objects.create(
                session=chat_session,
                content=transcription,
                from_user=True,
                message_type='voice',
                path=current_path
            )
            
            # Get previous messages for context
            previous_messages = ChatMessage.objects.filter(
                session=chat_session
            ).order_by('-created_at')[:10]
            
            # Get AI response
            openai_service = OpenAIService()
            ai_response = openai_service.get_ai_response(
                transcription, 
                current_path, 
                previous_messages
            )
            
            # Save AI response
            ChatMessage.objects.create(
                session=chat_session,
                content=ai_response['message'],
                from_user=False,
                message_type=ai_response.get('type', 'text'),
                path=current_path
            )
            
            # Add transcription to response
            ai_response['transcription'] = transcription
            
            return Response(ai_response, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CodeAnalysisAPIView(views.APIView):
    """API view for analyzing code"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            code = request.data.get('code')
            language = request.data.get('language', 'javascript')
            analysis_type = request.data.get('type', 'security')  # 'security' or 'quality'
            
            if not code:
                return Response(
                    {"error": "No code provided"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Analyze code
            openai_service = OpenAIService()
            analysis = openai_service.analyze_code(
                code,
                language,
                analysis_type
            )
            
            return Response(analysis, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )