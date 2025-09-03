from openai import OpenAI
from django.conf import settings

class OpenAIService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
    
    def get_message_intent(self, message):
        """
        Use OpenAI to classify the intent of the message with fallback for API issues
        """
        try:
            # Simple rule-based intent classification as fallback
            message_lower = message.lower()
            
            # Common keywords for different intents
            intents = {
                'product_catalog': ['product', 'price', 'cost', 'buy', 'purchase', 'how much'],
                'support_ticket': ['help', 'issue', 'problem', 'broken', 'error', 'not working'],
                'faq_query': ['what is', 'how do i', 'where can i', 'when', 'policy', 'procedure'],
                'customer_service': ['order', 'return', 'shipping', 'delivery', 'track'],
                'inventory_query': ['stock', 'available', 'inventory', 'when will', 'in stock'],
                'code_quality': ['code', 'review', 'quality', 'format', 'style'],
                'code_security': ['security', 'vulnerability', 'secure', 'risk'],
            }

            try:
                prompt = f"""
                Analyze the following message and classify its intent into one of these categories:
                - product_catalog: Questions about products, prices, features, reviews
                - support_ticket: IT support issues, technical problems
                - faq_query: General FAQ questions about policies, HR, IT
                - customer_service: Order status, returns, store hours
                - inventory_query: Stock availability, low-stock alerts, shipments
                - product_exploration: Product ratings, reviews, launch dates, trends
                - code_quality: Code quality checks, naming conventions, formatting
                - code_security: Security vulnerability checks
                - general: Any other general queries

                Message: {message}
                
                Return only the category name without explanation.
                """
                
                response = self.client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{
                        "role": "system",
                        "content": "You are a message intent classifier. Respond only with the category name."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }],
                    max_tokens=50,
                    temperature=0.3
                )
                
                intent = response.choices[0].message.content.strip().lower()
                return intent
                
            except Exception as api_error:
                print(f"OpenAI API Error: {str(api_error)}")
                
                # Fallback to keyword-based classification
                for intent, keywords in intents.items():
                    if any(keyword in message_lower for keyword in keywords):
                        return intent
                
                # Default to general if no keywords match
                return "general"
                
        except Exception as e:
            print(f"Error in intent classification: {str(e)}")
            return "general"
    
    def get_ai_response(self, message, current_path, previous_messages=None):
        """
        Get AI response based on message intent and context with fallback responses
        """
        try:
            # First, get the intent of the message
            intent = self.get_message_intent(message)
            
            # Fallback responses for different intents
            fallback_responses = {
                'product_catalog': "I can help you with product information, but I'm having trouble accessing the catalog right now. Please try again later or contact our sales team.",
                'support_ticket': "I understand you're having an issue. While I'm having trouble processing it right now, please try describing your problem again or contact our support team directly.",
                'faq_query': "I'll be happy to answer your question when our systems are back to normal. In the meantime, you can check our FAQ section on the website.",
                'customer_service': "I'd like to help with your customer service request. Please try again in a moment or reach out to our customer service team directly.",
                'inventory_query': "I'm unable to check the inventory status right now. Please try again later or contact our stock management team.",
                'code_quality': "I can't perform a detailed code analysis right now. Please try again later or consider using a local linting tool.",
                'code_security': "I'm unable to perform a security analysis at the moment. Please try again later or consult our security guidelines.",
                'general': "I'm here to help, but I'm having trouble processing your request right now. Please try again in a moment."
            }

            try:
                # Build context based on intent and current path
                context = self._build_context(intent, current_path)
                
                # Build conversation history
                conversation = self._build_conversation_history(previous_messages, message)
                
                # Generate response using OpenAI
                prompt = f"""
                {context}

                Previous conversation:
                {conversation}

                User: {message}
                Assistant: """

                response = self.client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{
                        "role": "system",
                        "content": context
                    },
                    {
                        "role": "user",
                        "content": f"{conversation}\n\nUser: {message}"
                    }],
                    max_tokens=500,
                    temperature=0.7
                )

                # Extract and process the response
                ai_response = response.choices[0].message.content.strip()
                
            except Exception as api_error:
                print(f"OpenAI API Error: {str(api_error)}")
                # Use fallback response based on intent
                ai_response = fallback_responses.get(intent, fallback_responses['general'])
            
            # Return formatted response with type and data
            return self._format_response(ai_response, intent)
            
        except Exception as e:
            print(f"Error getting AI response: {str(e)}")
            return {
                "message": "I apologize, but I'm having trouble processing your request right now. Please try again later.",
                "type": "error",
                "intent": "error"
            }
    
    def analyze_code(self, code, language, analysis_type):
        """
        Analyze code for security or quality issues using OpenAI
        """
        try:
            if analysis_type == 'security':
                prompt = f"""
                Analyze the following {language} code for security vulnerabilities.
                Focus on:
                - SQL injection risks
                - Hard-coded secrets
                - Authentication bypass risks
                - XSS vulnerabilities
                - Insecure direct object references
                - Other security best practices

                Code:
                {code}

                Provide a detailed analysis with specific issues found and recommendations.
                Format the response as a list of issues.
                """
            else:
                prompt = f"""
                Analyze the following {language} code for quality and best practices.
                Focus on:
                - Naming conventions
                - Code formatting
                - Best practices
                - Code organization
                - Readability
                - Performance considerations

                Code:
                {code}

                Provide a detailed analysis with specific issues found and recommendations.
                Format the response as a list of issues.
                """

            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{
                    "role": "system",
                    "content": "You are a code analysis expert. Provide detailed analysis and format the response as a list of issues."
                },
                {
                    "role": "user",
                    "content": prompt
                }],
                max_tokens=1000,
                temperature=0.5
            )

            analysis = response.choices[0].message.content.strip()
            issues = [issue.strip() for issue in analysis.split('\n') if issue.strip()]

            return {
                "message": f"Analysis complete for your {language} code.",
                "type": "code_analysis",
                "data": {
                    "language": language,
                    "analysis_type": analysis_type,
                    "issues": issues
                }
            }

        except Exception as e:
            print(f"Error in code analysis: {str(e)}")
            return {
                "message": "An error occurred during code analysis.",
                "type": "error",
                "data": {
                    "language": language,
                    "analysis_type": analysis_type,
                    "issues": ["Error performing analysis"]
                }
            }

    def _build_context(self, intent, current_path):
        """
        Build context prompt based on intent and current path
        """
        context_prompts = {
            "product_catalog": """You are a helpful product catalog assistant. Help users find products, 
            answer questions about features, prices, and make relevant suggestions.""",
            
            "support_ticket": """You are an IT support assistant. Help users describe their technical issues 
            and create structured support tickets with appropriate categories and urgency levels.""",
            
            "faq_query": """You are a knowledgeable FAQ assistant. Provide clear and accurate answers about 
            company policies, HR matters, and IT procedures.""",
            
            "customer_service": """You are a customer service representative. Help users with order status, 
            returns, store hours, and other service-related queries.""",
            
            "inventory_query": """You are an inventory management assistant. Provide information about stock 
            availability, low-stock alerts, and incoming shipments.""",
            
            "product_exploration": """You are a product discovery assistant. Help users explore products through 
            ratings, reviews, launch dates, and trending items.""",
            
            "code_quality": """You are a code quality expert. Review code for naming conventions, formatting, 
            and best practice adherence.""",
            
            "code_security": """You are a security code reviewer. Analyze code for potential security issues 
            like SQL injection risks, hard-coded secrets, and other vulnerabilities."""
        }
        
        return context_prompts.get(intent, "You are a helpful AI assistant.")

    def _build_conversation_history(self, previous_messages, current_message):
        """
        Build conversation history string from previous messages
        """
        if not previous_messages:
            return "No previous conversation."
            
        history = []
        for msg in previous_messages[-5:]:  # Only include last 5 messages for context
            role = "User" if msg.get('fromUser') else "Assistant"
            history.append(f"{role}: {msg.get('text', '')}")
            
        return "\n".join(history)

    def _format_response(self, response, intent):
        """
        Format the AI response based on intent
        """
        response_types = {
            "product_catalog": "product",
            "support_ticket": "ticket",
            "faq_query": "faq",
            "customer_service": "service",
            "inventory_query": "inventory",
            "product_exploration": "product",
            "code_quality": "code",
            "code_security": "security"
        }
        
        return {
            "message": response,
            "type": response_types.get(intent, "text"),
            "intent": intent
        }