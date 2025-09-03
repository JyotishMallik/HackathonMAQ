from .openai_service import OpenAIService

class IntentClassifier:
    def __init__(self):
        self.openai_service = OpenAIService()
        self.intent_patterns = {
            'product_catalog': ['product', 'buy', 'price', 'item', 'purchase', 'shop', 'catalog', 'cost'],
            'support_ticket': ['ticket', 'issue', 'problem', 'help', 'support', 'fix', 'broken', 'error'],
            'faq_query': ['faq', 'policy', 'hr', 'procedure', 'rule', 'guideline', 'how to'],
            'customer_service': ['order', 'return', 'shipping', 'delivery', 'status', 'track', 'hours'],
            'inventory_query': ['stock', 'available', 'inventory', 'shipment', 'quantity', 'supply'],
            'product_exploration': ['review', 'rating', 'trending', 'popular', 'new', 'launch', 'best'],
            'code_quality': ['quality', 'convention', 'format', 'style', 'naming', 'lint'],
            'code_security': ['security', 'vulnerability', 'hack', 'exploit', 'injection', 'risk']
        }

    def classify_message_intent(self, message):
        """
        Classify the intent of a user message using both pattern matching and OpenAI
        """
        message = message.lower()
        
        # First try pattern matching for quick responses
        for intent, patterns in self.intent_patterns.items():
            if any(pattern in message for pattern in patterns):
                return intent
        
        # If no clear pattern match, use OpenAI for more nuanced classification
        try:
            intent = self.openai_service.get_message_intent(message)
            return intent
        except Exception as e:
            print(f"Error in OpenAI intent classification: {str(e)}")
            return "general"

    def get_intent_confidence(self, message, intent):
        """
        Get confidence score for an intent classification
        """
        message = message.lower()
        patterns = self.intent_patterns.get(intent, [])
        
        # Count how many patterns match
        matches = sum(1 for pattern in patterns if pattern in message)
        
        # Calculate confidence based on matches
        if matches > 0:
            return min(1.0, matches / len(patterns))
        return 0.0