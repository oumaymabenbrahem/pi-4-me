const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../controllers/auth/auth-controller');
const recommendationController = require('../controllers/recommendation/recommendation-controller');

// Route pour vérifier l'état du service de recommandation
router.get('/health', recommendationController.checkRecommendationServiceHealth);

// Route pour entraîner le modèle de recommandation (protégée par authentification)
router.post('/train', authMiddleware, recommendationController.trainRecommendationModel);

// Route pour obtenir des recommandations pour un utilisateur
router.get('/user/:userId', authMiddleware, recommendationController.getRecommendationsForUser);

// Route pour obtenir des produits similaires à un produit
router.get('/similar/:productId', recommendationController.getSimilarProducts);

// Route pour enregistrer une interaction utilisateur-produit
router.post('/interaction', authMiddleware, recommendationController.recordInteraction);

module.exports = router;
