const express = require("express");
const {
  recordProductInteraction,
  getSimilarProductsForProduct,
  getRecommendedProducts,
  trainModel
} = require("../../controllers/shop/recommendation-controller");
const { authMiddleware } = require("../../controllers/auth/auth-controller");

const router = express.Router();

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware);

// Route pour enregistrer une interaction utilisateur avec un produit
router.post("/interaction", recordProductInteraction);

// Route pour obtenir des produits similaires à un produit spécifique
router.get("/similar/:productId", getSimilarProductsForProduct);

// Route pour obtenir des produits recommandés pour l'utilisateur actuel
router.get("/for-user", getRecommendedProducts);

// Route pour entraîner le modèle de recommandation IA
router.post("/train", trainModel);

module.exports = router;
