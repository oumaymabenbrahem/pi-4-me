const axios = require('axios');
const ProductInteraction = require('../models/ProductInteraction');
const Product = require('../models/Product');

// URL du service de recommandation
const RECOMMENDATION_SERVICE_URL = process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:5001';

/**
 * Enregistre une interaction utilisateur avec un produit
 * @param {String} userId ID de l'utilisateur
 * @param {String} productId ID du produit
 * @param {String} interactionType Type d'interaction ('view', 'cart', 'purchase')
 * @returns L'interaction enregistrée
 */
const recordInteraction = async (userId, productId, interactionType) => {
  try {
    if (!userId || !productId || !interactionType) {
      throw new Error('Paramètres manquants pour l\'enregistrement de l\'interaction');
    }

    // Vérifier si le type d'interaction est valide
    if (!['view', 'cart', 'purchase'].includes(interactionType)) {
      throw new Error('Type d\'interaction invalide');
    }

    // Créer une nouvelle interaction dans la base de données locale
    const interaction = new ProductInteraction({
      userId,
      productId,
      interactionType,
    });

    await interaction.save();

    // Envoyer l'interaction au service de recommandation IA
    try {
      await axios.post(`${RECOMMENDATION_SERVICE_URL}/record-interaction`, {
        userId: userId.toString(),
        productId: productId.toString(),
        interactionType
      });
      console.log('Interaction enregistrée dans le service de recommandation IA');
    } catch (aiError) {
      console.error('Erreur lors de l\'enregistrement de l\'interaction dans le service IA:', aiError.message);
      // Continuer même si l'envoi au service IA échoue
    }

    return interaction;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'interaction:', error);
    throw error;
  }
};

/**
 * Obtient les produits similaires basés sur le modèle d'IA
 * @param {String} productId ID du produit actuel
 * @param {Number} limit Nombre maximum de recommandations à retourner
 * @returns Liste de produits recommandés
 */
const getSimilarProducts = async (productId, limit = 5) => {
  try {
    if (!productId) {
      throw new Error('ID de produit manquant');
    }

    try {
      // Essayer d'obtenir des recommandations du service IA
      const response = await axios.get(
        `${RECOMMENDATION_SERVICE_URL}/recommend/similar/${productId}?limit=${limit}`
      );

      if (response.data.success && response.data.data.length > 0) {
        // Convertir les IDs en ObjectId et récupérer les produits complets
        const productIds = response.data.data.map(p => p._id);
        const products = await Product.find({
          _id: { $in: productIds },
          isCollected: false
        });

        // Trier les produits selon l'ordre des recommandations
        products.sort((a, b) => {
          const indexA = productIds.indexOf(a._id.toString());
          const indexB = productIds.indexOf(b._id.toString());
          return indexA - indexB;
        });

        return products;
      }
    } catch (aiError) {
      console.error('Erreur lors de la récupération des recommandations IA:', aiError.message);
      // Continuer avec la méthode de secours si le service IA échoue
    }

    // Méthode de secours: utiliser l'algorithme existant
    console.log('Utilisation de l\'algorithme de secours pour les produits similaires');
    
    // Trouver les utilisateurs qui ont interagi avec ce produit
    const interactions = await ProductInteraction.find({ 
      productId,
      interactionType: { $in: ['view', 'cart', 'purchase'] }
    });

    // Si aucune interaction n'est trouvée, retourner une liste vide
    if (!interactions || interactions.length === 0) {
      return [];
    }

    // Extraire les IDs des utilisateurs
    const userIds = interactions.map(interaction => interaction.userId);

    // Trouver d'autres produits avec lesquels ces utilisateurs ont interagi
    const otherInteractions = await ProductInteraction.find({
      userId: { $in: userIds },
      productId: { $ne: productId }
    }).sort({ timestamp: -1 });

    // Compter les occurrences de chaque produit
    const productCounts = {};
    otherInteractions.forEach(interaction => {
      const pid = interaction.productId.toString();
      productCounts[pid] = (productCounts[pid] || 0) + 1;
    });

    // Trier les produits par nombre d'interactions
    const sortedProductIds = Object.keys(productCounts).sort(
      (a, b) => productCounts[b] - productCounts[a]
    );

    // Limiter le nombre de produits et récupérer leurs détails
    const limitedProductIds = sortedProductIds.slice(0, limit);
    const recommendedProducts = await Product.find({
      _id: { $in: limitedProductIds },
      isCollected: false // Ne recommander que les produits disponibles
    });

    // Trier les produits recommandés selon l'ordre de popularité
    recommendedProducts.sort((a, b) => {
      const indexA = limitedProductIds.indexOf(a._id.toString());
      const indexB = limitedProductIds.indexOf(b._id.toString());
      return indexA - indexB;
    });

    return recommendedProducts;
  } catch (error) {
    console.error('Erreur lors de la récupération des produits similaires:', error);
    throw error;
  }
};

/**
 * Obtient les produits recommandés pour un utilisateur spécifique
 * @param {String} userId ID de l'utilisateur
 * @param {Number} limit Nombre maximum de recommandations à retourner
 * @returns Liste de produits recommandés
 */
const getRecommendedProductsForUser = async (userId, limit = 5) => {
  try {
    if (!userId) {
      throw new Error('ID utilisateur manquant');
    }

    try {
      // Essayer d'obtenir des recommandations du service IA
      const response = await axios.get(
        `${RECOMMENDATION_SERVICE_URL}/recommend/user/${userId}?limit=${limit}`
      );

      if (response.data.success && response.data.data.length > 0) {
        // Convertir les IDs en ObjectId et récupérer les produits complets
        const productIds = response.data.data.map(p => p._id);
        const products = await Product.find({
          _id: { $in: productIds },
          isCollected: false
        });

        // Trier les produits selon l'ordre des recommandations
        products.sort((a, b) => {
          const indexA = productIds.indexOf(a._id.toString());
          const indexB = productIds.indexOf(b._id.toString());
          return indexA - indexB;
        });

        return products;
      }
    } catch (aiError) {
      console.error('Erreur lors de la récupération des recommandations IA:', aiError.message);
      // Continuer avec la méthode de secours si le service IA échoue
    }

    // Méthode de secours: utiliser l'algorithme existant
    console.log('Utilisation de l\'algorithme de secours pour les recommandations utilisateur');
    
    // Trouver les produits avec lesquels l'utilisateur a interagi
    const userInteractions = await ProductInteraction.find({ userId })
      .sort({ timestamp: -1 })
      .limit(10); // Utiliser les 10 dernières interactions

    // Si aucune interaction n'est trouvée, retourner une liste vide
    if (!userInteractions || userInteractions.length === 0) {
      return [];
    }

    // Extraire les IDs des produits
    const productIds = userInteractions.map(interaction => interaction.productId);

    // Pour chaque produit, trouver des produits similaires
    let recommendedProductIds = [];
    for (const productId of productIds) {
      const similarProducts = await getSimilarProducts(productId, 3);
      recommendedProductIds = [
        ...recommendedProductIds,
        ...similarProducts.map(p => p._id.toString())
      ];
    }

    // Éliminer les doublons et les produits déjà vus par l'utilisateur
    const uniqueRecommendedProductIds = [...new Set(recommendedProductIds)]
      .filter(id => !productIds.includes(id));

    // Limiter le nombre de produits et récupérer leurs détails
    const limitedProductIds = uniqueRecommendedProductIds.slice(0, limit);
    const recommendedProducts = await Product.find({
      _id: { $in: limitedProductIds },
      isCollected: false // Ne recommander que les produits disponibles
    });

    return recommendedProducts;
  } catch (error) {
    console.error('Erreur lors de la récupération des produits recommandés:', error);
    throw error;
  }
};

/**
 * Entraîne le modèle de recommandation IA
 * @returns {Promise<boolean>} True si l'entraînement a réussi, False sinon
 */
const trainRecommendationModel = async () => {
  try {
    const response = await axios.post(`${RECOMMENDATION_SERVICE_URL}/train`);
    return response.data.success;
  } catch (error) {
    console.error('Erreur lors de l\'entraînement du modèle de recommandation:', error);
    return false;
  }
};

module.exports = {
  recordInteraction,
  getSimilarProducts,
  getRecommendedProductsForUser,
  trainRecommendationModel
};
