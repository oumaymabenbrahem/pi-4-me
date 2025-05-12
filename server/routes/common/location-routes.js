const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../controllers/auth/auth-controller');
const {
  updateUserAddress,
  getAddress,
  getNearbyProducts,
  searchProductsByLocation
} = require('../../controllers/common/location-controller');

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware);

// Routes de localisation
router.post('/address', updateUserAddress);
router.get('/address', getAddress);
router.get('/nearby-products', getNearbyProducts);
router.post('/search-products', searchProductsByLocation);

module.exports = router; 