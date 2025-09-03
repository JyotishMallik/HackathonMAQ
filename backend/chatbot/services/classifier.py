def classify_message_intent(message):
    """
    Classify the intent of a user message
    """
    message = message.lower()
    
    # Simple rule-based classification
    if any(word in message for word in ['product', 'buy', 'price', 'item', 'purchase', 'shop']):
        return 'product_catalog'
    
    if any(word in message for word in ['ticket', 'issue', 'problem', 'help', 'support', 'fix']):
        return 'support_ticket'
    
    if any(word in message for word in ['code', 'scan', 'vulnerability', 'security', 'hack']):
        return 'code_security'
    
    if any(word in message for word in ['quality', 'convention', 'format', 'style', 'naming']):
        return 'code_quality'
    
    # Default intent
    return 'general'