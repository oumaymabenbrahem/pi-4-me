const { findNearbyProducts, saveUserAddress, getUserAddress } = require('../../services/location-service');

/**
 * Enregistrer ou mettre à jour l'adresse d'un utilisateur
 */
const updateUserAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const addressData = req.body;
    
    // Vérifier les données requises
    if (!addressData.address || !addressData.coordinates || 
        !Array.isArray(addressData.coordinates) || 
        addressData.coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: "Adresse ou coordonnées invalides"
      });
    }
    
    const savedAddress = await saveUserAddress(userId, addressData);
    
    return res.status(200).json({
      success: true,
      data: savedAddress
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'adresse:', error);
    return res.status(500).json({
      success: false,
      message: error.message || "Une erreur est survenue lors de la mise à jour de l'adresse"
    });
  }
};

/**
 * Récupérer l'adresse d'un utilisateur
 */
const getAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const address = await getUserAddress(userId);
    
    return res.status(200).json({
      success: true,
      data: address || null
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'adresse:', error);
    return res.status(500).json({
      success: false,
      message: error.message || "Une erreur est survenue lors de la récupération de l'adresse"
    });
  }
};

/**
 * Récupérer les produits à proximité de l'utilisateur
 */
const getNearbyProducts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { maxDistance, category, brand } = req.query;
    
    console.log(`Récupération des produits à proximité pour l'utilisateur ${userId}`);
    console.log('Paramètres de recherche:', { maxDistance, category, brand });
    
    // Récupérer l'adresse de l'utilisateur
    const userAddress = await getUserAddress(userId);
    
    if (!userAddress) {
      console.log(`Aucune adresse trouvée pour l'utilisateur ${userId}`);
      return res.status(400).json({
        success: false,
        message: "Adresse de l'utilisateur introuvable. Veuillez définir votre adresse."
      });
    }
    
    if (!userAddress.location || !userAddress.location.coordinates || 
        !Array.isArray(userAddress.location.coordinates) || 
        userAddress.location.coordinates.length !== 2) {
      console.log(`Coordonnées invalides pour l'utilisateur ${userId}:`, userAddress.location);
      return res.status(400).json({
        success: false,
        message: "Coordonnées de l'adresse invalides. Veuillez mettre à jour votre adresse."
      });
    }
    
    console.log(`Coordonnées de l'utilisateur ${userId}:`, userAddress.location.coordinates);
    
    // Filtres supplémentaires
    const filters = {};
    if (category) filters.category = category;
    if (brand) filters.brand = brand;
    
    // Rechercher les produits à proximité
    const products = await findNearbyProducts(
      userAddress.location.coordinates,
      maxDistance ? Number(maxDistance) : 10,
      filters
    );
    
    console.log(`${products.length} produits trouvés à proximité pour l'utilisateur ${userId}`);
    
    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Erreur lors de la recherche de produits à proximité:', error);
    return res.status(500).json({
      success: false,
      message: error.message || "Une erreur est survenue lors de la recherche de produits à proximité"
    });
  }
};

/**
 * Rechercher des produits à proximité d'une position donnée
 */
const searchProductsByLocation = async (req, res) => {
  try {
    const { coordinates, maxDistance, category, brand } = req.body;
    
    // Vérifier les coordonnées
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: "Coordonnées invalides"
      });
    }
    
    // Filtres supplémentaires
    const filters = {};
    if (category) filters.category = category;
    if (brand) filters.brand = brand;
    
    // Rechercher les produits à proximité
    const products = await findNearbyProducts(
      coordinates,
      maxDistance ? Number(maxDistance) : 10,
      filters
    );
    
    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Erreur lors de la recherche de produits à proximité:', error);
    return res.status(500).json({
      success: false,
      message: error.message || "Une erreur est survenue lors de la recherche de produits à proximité"
    });
  }
};

module.exports = {
  updateUserAddress,
  getAddress,
  getNearbyProducts,
  searchProductsByLocation
}; 