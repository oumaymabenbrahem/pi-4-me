import { useState, useRef, useEffect } from 'react';
import chatbotService from '../../services/chatbotService';
import { Send, X, MessageSquare } from 'lucide-react';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Bonjour ! Comment puis-je vous aider aujourd'hui ?", sender: 'bot', role: 'assistant', content: "Bonjour ! Comment puis-je vous aider aujourd'hui ?" }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll vers le dernier message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Préparer le contexte de la conversation pour l'API
  const prepareContext = () => {
    // Exclure le premier message de bienvenue si nécessaire
    const conversationHistory = messages.slice(0, -1); // Exclure le dernier message (utilisateur)
    
    // Convertir dans le format attendu par l'API
    return conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  };

  // Gérer l'envoi d'un message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    // Ajouter le message de l'utilisateur à la liste
    const userMessage = { 
      id: messages.length + 1, 
      text: newMessage, 
      sender: 'user',
      role: 'user',
      content: newMessage
    };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      // Préparer le contexte de la conversation
      const context = prepareContext();
      
      // Envoyer le message au service avec le contexte
      const response = await chatbotService.sendMessage(newMessage, context);
      
      // Ajouter la réponse du bot à la liste
      const botMessage = { 
        id: messages.length + 2, 
        text: response.data, 
        sender: 'bot',
        role: 'assistant',
        content: response.data
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Erreur de chatbot:', error);
      // Ajouter un message d'erreur
      const errorMessage = { 
        id: messages.length + 2, 
        text: "Désolé, je rencontre un problème. Veuillez réessayer plus tard.", 
        sender: 'bot',
        role: 'assistant',
        content: "Désolé, je rencontre un problème. Veuillez réessayer plus tard."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Ouvrir/fermer le chatbot
  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Bouton pour ouvrir/fermer le chatbot */}
      <button 
        onClick={toggleChatbot}
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Fenêtre du chatbot */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
          {/* En-tête */}
          <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold">Assistant virtuel</h3>
            <button onClick={toggleChatbot} className="text-white hover:text-gray-200">
              <X size={18} />
            </button>
          </div>
          
          {/* Messages */}
          <div className="p-3 flex-1 overflow-y-auto max-h-80 min-h-60">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`mb-3 ${
                  message.sender === 'user' 
                    ? 'text-right' 
                    : 'text-left'
                }`}
              >
                <div 
                  className={`inline-block p-3 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-left mb-3">
                <div className="inline-block p-3 rounded-lg bg-gray-200 text-gray-800 rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Formulaire de saisie */}
          <form onSubmit={handleSendMessage} className="border-t p-3 flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrivez votre message..."
              className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-lg"
              disabled={isLoading || !newMessage.trim()}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot; 