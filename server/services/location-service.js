const Product = require('../models/Product');
const Address = require('../models/Address');

/**
 * Trouver les produits des magasins à proximité
 * @param {Array} coordinates Coordonnées [longitude, latitude] 
 * @param {Number} maxDistanceKm Distance maximale en kilomètres
 * @param {Object} filters Filtres supplémentaires pour les produits
 * @returns Liste de produits à proximité
 */
const findNearbyProducts = async (coordinates, maxDistanceKm = 10, filters = {}) => {
  try {
    console.log('Recherche de produits à proximité:', {
      coordinates,
      maxDistanceKm,
      filters
    });
    
    // Vérification des coordonnées
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2 ||
        isNaN(parseFloat(coordinates[0])) || isNaN(parseFloat(coordinates[1]))) {
      throw new Error('Coordonnées invalides ou mal formatées');
    }
    
    // S'assurer que les coordonnées sont des nombres
    const validCoordinates = [parseFloat(coordinates[0]), parseFloat(coordinates[1])];
    
    // Convertir la distance en mètres pour MongoDB
    const maxDistanceMeters = maxDistanceKm * 1000;
    
    // Créer la requête géospatiale
    const geoQuery = {
      'storeGeoLocation': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: validCoordinates
          },
          $maxDistance: maxDistanceMeters
        }
      },
      // Ne retourner que les produits non collectés
      'isCollected': false,
      // Ajouter les filtres supplémentaires
      ...filters
    };
    
    console.log('Requête géospatiale:', JSON.stringify(geoQuery));
    
    // Exécuter la requête et retourner les produits
    const products = await Product.find(geoQuery);
    console.log(`${products.length} produits trouvés à proximité`);
    return products;
  } catch (error) {
    console.error('Erreur lors de la recherche de produits à proximité:', error);
    throw error;
  }
};

/**
 * Enregistrer l'adresse d'un utilisateur avec ses coordonnées
 * @param {String} userId ID de l'utilisateur
 * @param {Object} addressData Données d'adresse
 * @returns L'adresse enregistrée
 */
const saveUserAddress = async (userId, addressData) => {
  try {
    const { address, city, pincode, phone, notes, coordinates } = addressData;
    
    // Vérifier les coordonnées
    if (!coordinates || coordinates.length !== 2) {
      throw new Error('Coordonnées invalides');
    }
    
    // Créer ou mettre à jour l'adresse
    const addressObj = await Address.findOneAndUpdate(
      { userId },
      {
        userId,
        address,
        city,
        pincode,
        phone,
        notes,
        location: {
          type: 'Point',
          coordinates
        }
      },
      { upsert: true, new: true }
    );
    
    return addressObj;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'adresse:', error);
    throw error;
  }
};

/**
 * Récupérer l'adresse d'un utilisateur
 * @param {String} userId ID de l'utilisateur
 * @returns L'adresse de l'utilisateur
 */
const getUserAddress = async (userId) => {
  try {
    const address = await Address.findOne({ userId });
    return address;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'adresse:', error);
    throw error;
  }
};

module.exports = {
  findNearbyProducts,
  saveUserAddress,
  getUserAddress
}; 