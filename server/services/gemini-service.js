const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
require('dotenv').config();

// Initialiser l'API Gemini avec la clé API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Génère une réponse de chat en utilisant l'API Gemini
 * @param {string} message - Le message de l'utilisateur
 * @param {Array} context - Historique du chat (facultatif)
 * @returns {Promise<Object>} - Objet contenant le succès et la réponse
 */
const generateGeminiResponse = async (message, context = []) => {
  try {
    // Vérifier que le message est valide
    if (!message || typeof message !== 'string') {
      throw new Error('Message invalide');
    }

    console.log('Message reçu pour Gemini:', message);

    // Configurer le modèle (Gemini 1.5 Flash est la version gratuite)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Préparer l'historique du chat pour Gemini
    let chatHistory = [];
    if (context && context.length > 0) {
      // Assurez-vous que le premier message est toujours de l'utilisateur
      let hasUserMessage = false;

      for (const entry of context) {
        if (entry.role === 'user') {
          chatHistory.push({ role: 'user', parts: [{ text: entry.content }] });
          hasUserMessage = true;
        } else if (entry.role === 'assistant') {
          // Seulement ajouter un message de l'assistant si un message utilisateur existe déjà
          if (hasUserMessage) {
            chatHistory.push({ role: 'model', parts: [{ text: entry.content }] });
          }
        }
      }

      // Si l'historique ne commence pas par un message d'utilisateur, on le vide
      if (chatHistory.length > 0 && chatHistory[0].role !== 'user') {
        chatHistory = [];
      }
    }

    // Créer une session de chat
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    // Envoyer le message et recevoir une réponse
    const result = await chat.sendMessage(message);
    const response = result.response;
    const responseText = response.text();

    console.log('Réponse de Gemini obtenue');

    return {
      success: true,
      data: responseText
    };
  } catch (error) {
    console.error('Erreur Gemini:', error.message);

    return {
      success: false,
      error: "Je suis désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer."
    };
  }
};

/**
 * Analyse une image de produit et génère des données structurées
 * @param {string} imageUrl - L'URL de l'image du produit
 * @returns {Promise<Object>} - Données du produit générées (titre, description, catégorie, etc.)
 */
const analyzeProductImage = async (imageUrl) => {
  try {
    console.log('Analyse d\'image avec Gemini pour:', imageUrl);

    // Vérifier que l'URL de l'image est valide
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
      throw new Error('URL d\'image invalide');
    }

    // Télécharger l'image pour l'analyser
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageData = Buffer.from(imageResponse.data).toString('base64');

    // Configurer le modèle Gemini Pro Vision
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Préparer le prompt pour l'analyse du produit
    const prompt = `
    Analyse cette image de produit alimentaire et fournit les informations suivantes au format JSON:

    1. title: Un titre court et précis pour ce produit
    2. description: Une description détaillée et attrayante du produit
    3. category: La catégorie du produit (UNIQUEMENT une de ces valeurs exactes: "fruits_legumes", "produits_frais", "epicerie_salee", "epicerie_sucree", "boissons", "pains_viennoiseries", "surgeles", "plats_prepares", "condiments_sauces")
    4. expirationDays: Nombre de jours suggérés avant expiration (entre 3 et 30)
    5. quantity: Quantité suggérée (nombre entre 1 et 20)
    6. unit: Unité de mesure (UNIQUEMENT une de ces valeurs: "kg", "L", "pcs")
    7. price: Prix suggéré (nombre entre 0.5 et 20)

    Réponds UNIQUEMENT avec un objet JSON valide sans aucun texte supplémentaire.
    Assure-toi que la catégorie est correctement identifiée en fonction du type de produit:
    - Les produits laitiers (lait, fromage, yaourt) doivent être dans "produits_frais"
    - Les fruits et légumes doivent être dans "fruits_legumes"
    - Les boissons (eau, jus, soda) doivent être dans "boissons"
    - Le pain et les viennoiseries doivent être dans "pains_viennoiseries"
    - Les pâtes, riz et conserves doivent être dans "epicerie_salee"
    - Les biscuits, céréales et confitures doivent être dans "epicerie_sucree"
    - Les huiles, vinaigres et sauces doivent être dans "condiments_sauces"
    `;

    // Créer une partie pour l'image
    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType: imageResponse.headers['content-type'] || 'image/jpeg'
      }
    };

    // Envoyer la requête à Gemini
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    console.log('Réponse brute de Gemini:', text);

    // Extraire et parser le JSON
    try {
      // Nettoyer la réponse pour s'assurer qu'elle ne contient que du JSON
      const jsonStr = text.replace(/```json|```/g, '').trim();
      const productData = JSON.parse(jsonStr);

      // Formater la date d'expiration
      if (productData.expirationDays) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + parseInt(productData.expirationDays));
        productData.expirationDate = expirationDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
        delete productData.expirationDays; // Supprimer le champ temporaire
      }

      // S'assurer que les valeurs numériques sont des nombres
      if (productData.quantity) productData.quantity = Number(productData.quantity);
      if (productData.price) productData.price = Number(productData.price);

      console.log('Données produit générées avec succès:', productData);

      return {
        success: true,
        data: productData
      };
    } catch (parseError) {
      console.error('Erreur lors du parsing JSON:', parseError);
      throw new Error('Format de réponse invalide');
    }
  } catch (error) {
    console.error('Erreur lors de l\'analyse d\'image:', error.message);
    return {
      success: false,
      error: "Impossible d'analyser l'image du produit. Veuillez réessayer ou saisir les informations manuellement."
    };
  }
};

module.exports = {
  generateGeminiResponse,
  analyzeProductImage
};