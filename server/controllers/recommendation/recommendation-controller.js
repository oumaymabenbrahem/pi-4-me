const axios = require('axios');
const { handleError } = require('../../utils/error-handler');

// URL du service de recommandation
const RECOMMENDATION_SERVICE_URL = process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:5001';

/**
 * Vérifier l'état du service de recommandation
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const checkRecommendationServiceHealth = async (req, res) => {
    try {
        const response = await axios.get(`${RECOMMENDATION_SERVICE_URL}/health`);
        return res.status(200).json(response.data);
    } catch (error) {
        return handleError(res, error, 'Erreur lors de la vérification de l\'état du service de recommandation');
    }
};

/**
 * Entraîner le modèle de recommandation
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const trainRecommendationModel = async (req, res) => {
    try {
        const response = await axios.post(`${RECOMMENDATION_SERVICE_URL}/train`);
        return res.status(200).json(response.data);
    } catch (error) {
        return handleError(res, error, 'Erreur lors de l\'entraînement du modèle de recommandation');
    }
};

/**
 * Obtenir des recommandations pour un utilisateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const getRecommendationsForUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = req.query.limit || 5;
        
        const response = await axios.get(`${RECOMMENDATION_SERVICE_URL}/recommend/user/${userId}?limit=${limit}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return handleError(res, error, 'Erreur lors de la récupération des recommandations pour l\'utilisateur');
    }
};

/**
 * Obtenir des produits similaires à un produit
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const getSimilarProducts = async (req, res) => {
    try {
        const { productId } = req.params;
        const limit = req.query.limit || 5;
        
        const response = await axios.get(`${RECOMMENDATION_SERVICE_URL}/recommend/similar/${productId}?limit=${limit}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return handleError(res, error, 'Erreur lors de la récupération des produits similaires');
    }
};

/**
 * Enregistrer une interaction utilisateur-produit
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const recordInteraction = async (req, res) => {
    try {
        const { userId, productId, interactionType } = req.body;
        
        if (!userId || !productId || !interactionType) {
            return res.status(400).json({
                success: false,
                message: 'Paramètres manquants'
            });
        }
        
        const response = await axios.post(`${RECOMMENDATION_SERVICE_URL}/record-interaction`, {
            userId,
            productId,
            interactionType
        });
        
        return res.status(200).json(response.data);
    } catch (error) {
        return handleError(res, error, 'Erreur lors de l\'enregistrement de l\'interaction');
    }
};

module.exports = {
    checkRecommendationServiceHealth,
    trainRecommendationModel,
    getRecommendationsForUser,
    getSimilarProducts,
    recordInteraction
};
