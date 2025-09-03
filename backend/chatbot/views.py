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
            message_type = request.data.get('type', 'text')  # text, code, voice
            
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
            
            # Create session with or without user
            defaults = {}
            if request.user.is_authenticated:
                defaults['user'] = request.user
            
            chat_session, _ = ChatSession.objects.get_or_create(
                session_id=session_id,
                defaults=defaults
            )
            
            # Save user message
            ChatMessage.objects.create(
                session=chat_session,
                content=message,
                from_user=True,
                message_type=message_type,
                path=current_path
            )
            
            # Get previous messages for context
            previous_messages = list(ChatMessage.objects.filter(
                session=chat_session
            ).order_by('-created_at')[:10])  # Get last 10 messages
            
            # Convert messages to format expected by OpenAI service
            previous_messages_formatted = [
                {
                    'text': msg.content,
                    'fromUser': msg.from_user,
                    'type': msg.message_type
                } for msg in reversed(previous_messages)  # Reverse to get chronological order
            ]
            
            # Get AI response
            openai_service = OpenAIService()
            ai_response = openai_service.get_ai_response(
                message, 
                current_path, 
                previous_messages_formatted
            )
            
            # Handle special message types
            if ai_response['type'] in ['ticket', 'service', 'inventory']:
                # Store structured data if available
                structured_data = {}
                if ai_response['type'] == 'ticket':
                    # Parse ticket info from response
                    structured_data = self._extract_ticket_info(ai_response['message'])
                elif ai_response['type'] == 'inventory':
                    # Parse inventory info from response
                    structured_data = self._extract_inventory_info(ai_response['message'])
                
                if structured_data:
                    ai_response['data'] = structured_data
            
            # Save AI response
            ChatMessage.objects.create(
                session=chat_session,
                content=ai_response['message'],
                from_user=False,
                message_type=ai_response['type'],
                path=current_path,
                metadata=ai_response.get('data', {})
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
    
    def _extract_ticket_info(self, message):
        """Extract structured ticket information from AI response"""
        try:
            # Use OpenAI to parse the message into structured ticket data
            openai_service = OpenAIService()
            prompt = f"""
            Extract the following information from this IT support message into JSON format:
            - summary: A brief description of the issue
            - category: The type of issue (Hardware, Software, Network, Access, Other)
            - urgency: Priority level (Low, Medium, High, Critical)
            - impact: Impact level (Individual, Team, Department, Organization)
            
            Message: {message}
            
            Return only the JSON object without explanation.
            """
            
            response = openai_service.get_ai_response(prompt, '/tickets', None)
            
            # Convert the response to a dictionary if it's a string
            if isinstance(response['message'], str):
                try:
                    ticket_info = json.loads(response['message'])
                except json.JSONDecodeError:
                    ticket_info = {
                        "summary": message[:100],
                        "category": "Other",
                        "urgency": "Medium",
                        "impact": "Individual"
                    }
            else:
                ticket_info = response['message']
                
            return ticket_info
            
        except Exception as e:
            print(f"Error extracting ticket info: {str(e)}")
            return None
    
    def _extract_inventory_info(self, message):
        """Extract structured inventory information from AI response"""
        try:
            # Use OpenAI to parse the message into structured inventory data
            openai_service = OpenAIService()
            prompt = f"""
            Extract the following information from this inventory message into JSON format:
            - item_name: Name of the product
            - quantity: Number of items (if mentioned)
            - status: Stock status (In Stock, Low Stock, Out of Stock)
            - action_needed: Whether any action is needed (Reorder, Review, None)
            
            Message: {message}
            
            Return only the JSON object without explanation.
            """
            
            response = openai_service.get_ai_response(prompt, '/inventory', None)
            
            # Convert the response to a dictionary if it's a string
            if isinstance(response['message'], str):
                try:
                    inventory_info = json.loads(response['message'])
                except json.JSONDecodeError:
                    inventory_info = {
                        "item_name": "Unknown",
                        "quantity": None,
                        "status": "Unknown",
                        "action_needed": "Review"
                    }
            else:
                inventory_info = response['message']
                
            return inventory_info
            
        except Exception as e:
            print(f"Error extracting inventory info: {str(e)}")
            return None
            
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