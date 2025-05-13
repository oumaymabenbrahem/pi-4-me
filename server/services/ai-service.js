const axios = require('axios');
require('dotenv').config();
const { analyzeProductImage } = require('./gemini-service');

/**
 * Génère des données de produit complètes à partir d'une image
 * Cette version utilise l'API Gemini pour une analyse d'image avancée
 *
 * @param {string} imageUrl - L'URL de l'image du produit
 * @returns {Promise<Object>} - Les données du produit générées (titre, description, catégorie, etc.)
 */
const generateProductData = async (imageUrl) => {
  try {
    console.log("Analyse d'image avec IA pour:", imageUrl);

    // Vérifier que l'URL de l'image est valide
    if (!imageUrl || !imageUrl.startsWith('http')) {
      console.error("URL d'image invalide:", imageUrl);
      throw new Error("URL d'image invalide. L'URL doit commencer par http:// ou https://");
    }

    // Utiliser l'API Gemini pour analyser l'image
    const result = await analyzeProductImage(imageUrl);

    if (!result.success) {
      console.error("Erreur lors de l'analyse d'image:", result.error);
      throw new Error(result.error);
    }

    console.log("Données produit générées avec succès par l'IA:", result.data);
    return result.data;
  } catch (error) {
    console.error("Erreur lors de la génération des données produit:", error.message);
    // Retourner des données par défaut en cas d'erreur
    return {
      title: "Produit alimentaire",
      description: "Produit alimentaire de qualité sélectionné pour réduire le gaspillage alimentaire. Consultez les détails pour en savoir plus.",
      category: "epicerie_salee",
      expirationDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
      quantity: 1,
      unit: "pcs",
      price: 5.99
    };
  }
};

module.exports = {
  generateProductData
};