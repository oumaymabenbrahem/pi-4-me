const express = require('express');
const { handleChatMessage } = require('../../controllers/chatbot-controller');

const router = express.Router();

// Route pour envoyer un message au chatbot
router.post('/message', handleChatMessage);

module.exports = router; 