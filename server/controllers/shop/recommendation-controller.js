// Utiliser le service de recommandation IA amélioré
const {
  recordInteraction,
  getSimilarProducts,
  getRecommendedProductsForUser,
  trainRecommendationModel
} = require('../../services/recommendation-service-ai');

/**
 * Enregistre une interaction utilisateur avec un produit
 */
const recordProductInteraction = async (req, res) => {
  try {
    const { productId, interactionType } = req.body;
    const userId = req.user._id;

    if (!userId || !productId || !interactionType) {
      return res.status(400).json({
        success: false,
        message: "Paramètres manquants"
      });
    }

    await recordInteraction(userId, productId, interactionType);

    res.status(200).json({
      success: true,
      message: "Interaction enregistrée avec succès"
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'interaction:", error);
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de l'enregistrement de l'interaction"
    });
  }
};

/**
 * Obtient les produits similaires à un produit spécifique
 */
const getSimilarProductsForProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit) || 5;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "ID de produit manquant"
      });
    }

    const similarProducts = await getSimilarProducts(productId, limit);

    res.status(200).json({
      success: true,
      data: similarProducts
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des produits similaires:", error);
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la récupération des produits similaires"
    });
  }
};

/**
 * Obtient les produits recommandés pour l'utilisateur actuel
 */
const getRecommendedProducts = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 5;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Utilisateur non authentifié"
      });
    }

    const recommendedProducts = await getRecommendedProductsForUser(userId, limit);

    res.status(200).json({
      success: true,
      data: recommendedProducts
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des produits recommandés:", error);
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la récupération des produits recommandés"
    });
  }
};

/**
 * Entraîne le modèle de recommandation IA
 */
const trainModel = async (req, res) => {
  try {
    const success = await trainRecommendationModel();

    if (success) {
      res.status(200).json({
        success: true,
        message: "Modèle de recommandation entraîné avec succès"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'entraînement du modèle de recommandation"
      });
    }
  } catch (error) {
    console.error("Erreur lors de l'entraînement du modèle:", error);
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de l'entraînement du modèle"
    });
  }
};

module.exports = {
  recordProductInteraction,
  getSimilarProductsForProduct,
  getRecommendedProducts,
  trainModel
};
