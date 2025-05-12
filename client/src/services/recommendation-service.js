import axios from 'axios';

/**
 * Enregistre une interaction utilisateur avec un produit
 * @param {String} productId ID du produit
 * @param {String} interactionType Type d'interaction ('view', 'cart', 'purchase')
 * @returns {Promise} Promesse résolue avec la réponse de l'API
 */
export const recordProductInteraction = async (productId, interactionType) => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/shop/recommendation/interaction',
      { productId, interactionType },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'interaction:', error);
    throw error;
  }
};

/**
 * Obtient les produits similaires à un produit spécifique
 * @param {String} productId ID du produit
 * @param {Number} limit Nombre maximum de recommandations à retourner
 * @returns {Promise} Promesse résolue avec la liste des produits similaires
 */
export const getSimilarProducts = async (productId, limit = 5) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/shop/recommendation/similar/${productId}?limit=${limit}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des produits similaires:', error);
    throw error;
  }
};

/**
 * Obtient les produits recommandés pour l'utilisateur actuel
 * @param {Number} limit Nombre maximum de recommandations à retourner
 * @returns {Promise} Promesse résolue avec la liste des produits recommandés
 */
export const getRecommendedProducts = async (limit = 5) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/shop/recommendation/for-user?limit=${limit}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des produits recommandés:', error);
    throw error;
  }
};
