const express = require('express');
const router = express.Router();
const { scrapeFromSite, getScrapedProducts, getAvailableSites } = require('../controllers/shop/scraping-controller');
const { verifyToken } = require('../helpers/auth-helper');

// Routes publiques
router.get('/products', getScrapedProducts);

// Routes protégées (nécessitent une authentification)
router.get('/sites', verifyToken, getAvailableSites);
router.post('/scrape', verifyToken, scrapeFromSite);

module.exports = router;
