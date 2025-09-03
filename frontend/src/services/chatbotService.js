import api from './api';

const chatbotService = {
    // Send text message to the AI assistant
    sendMessage: async (message, currentPath) => {
        try {
            const response = await api.post('/chatbot/message', {
                message,
                currentPath,
                type: 'text'
            });
            return response.data;
        } catch (error) {
            console.error('Error sending message to chatbot:', error);
            throw error;
        }
    },

    // Process voice input
    processVoiceInput: async (audioBlob, currentPath) => {
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob);
            formData.append('currentPath', currentPath);
            
            const response = await api.post('/chatbot/voice', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error processing voice input:', error);
            throw error;
        }
    },

    // Analyze code for vulnerabilities
    analyzeCode: async (code, language) => {
        try {
            const response = await api.post('/chatbot/code-analysis', {
                code,
                language,
                type: 'security'
            });
            return response.data;
        } catch (error) {
            console.error('Error analyzing code:', error);
            throw error;
        }
    },
    
    // Check code for best practices
    checkCodeQuality: async (code, language) => {
        try {
            const response = await api.post('/chatbot/code-analysis', {
                code,
                language,
                type: 'quality'
            });
            return response.data;
        } catch (error) {
            console.error('Error checking code quality:', error);
            throw error;
        }
    }
};

export default chatbotService;