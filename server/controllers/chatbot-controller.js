const { generateGeminiResponse } = require('../services/gemini-service');

const handleChatMessage = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Le message est requis'
      });
    }

    const response = await generateGeminiResponse(message, context || []);

    if (!response.success) {
      return res.status(500).json({
        success: false,
        message: response.error
      });
    }

    return res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Erreur contrôleur chatbot :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

module.exports = { handleChatMessage };
