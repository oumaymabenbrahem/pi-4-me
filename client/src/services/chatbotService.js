import axios from 'axios';

const API_URL = 'http://localhost:5000/api/chatbot';

// Service pour communiquer avec l'API du chatbot
const chatbotService = {
  // Envoyer un message au chatbot
  sendMessage: async (message, context = []) => {
    try {
      const response = await axios.post(`${API_URL}/message`, {
        message,
        context
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message au chatbot:', error);
      throw new Error(error.response?.data?.message || 'Une erreur est survenue lors de l\'envoi du message');
    }
  }
};

export default chatbotService; 