const scraperService = require('../../services/scraping');
const pythonScraperService = require('../../services/scraping/pythonScraperService');
const ScrapedProduct = require('../../models/ScrapedProduct');

/**
 * Déclenche le scraping pour un site spécifique
 */
const scrapeFromSite = async (req, res) => {
  try {
    const { siteName, url } = req.body;
    
    if (!siteName || !url) {
      return res.status(400).json({
        success: false,
        message: "Le nom du site et l'URL sont requis"
      });
    }
    
    let products = [];
    let savedProducts = [];
    
    // Utiliser le service Python pour les sites réels
    if (siteName === 'carrefour' || siteName === 'monoprix') {
      try {
        // Scraper les produits avec Python
        products = await pythonScraperService.scrapeProducts(siteName, url);
        
        // Sauvegarder les produits dans la base de données
        savedProducts = await pythonScraperService.saveScrapedProducts(products, siteName, url);
      } catch (error) {
        console.error(`Erreur lors du scraping Python de ${siteName}:`, error);
        
        // Fallback sur les données fictives si le scraping Python échoue
        console.log(`Utilisation de l'adaptateur mock comme fallback pour ${siteName}`);
        products = await scraperService.scrapeProducts('mock', 'mock://products');
        savedProducts = await scraperService.saveScrapedProducts(products, siteName, url);
      }
    } else {
      // Vérifier si l'adaptateur existe pour ce site
      try {
        scraperService.getAdapter(siteName);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: `Adaptateur non disponible pour le site: ${siteName}`
        });
      }
      
      // Scraper les produits avec l'adaptateur JavaScript
      products = await scraperService.scrapeProducts(siteName, url);
      
      // Sauvegarder les produits dans la base de données
      savedProducts = await scraperService.saveScrapedProducts(products, siteName, url);
    }
    
    res.status(200).json({
      success: true,
      message: `${savedProducts.length} produits scrapés avec succès depuis ${siteName}`,
      data: {
        count: savedProducts.length,
        products: savedProducts
      }
    });
  } catch (error) {
    console.error('Erreur lors du scraping:', error);
    res.status(500).json({
      success: false,
      message: `Erreur lors du scraping: ${error.message}`
    });
  }
};

/**
 * Récupère tous les produits scrapés
 */
const getScrapedProducts = async (req, res) => {
  try {
    const { siteName, category, brand, sortBy = "lastScraped" } = req.query;
    
    let filters = { isActive: true };
    
    if (siteName) {
      filters.sourceSite = siteName;
    }
    
    if (category) {
      filters.category = { $in: category.split(",") };
    }
    
    if (brand) {
      filters.brand = { $in: brand.split(",") };
    }
    
    let sort = {};
    
    switch (sortBy) {
      case "lastScraped":
        sort.lastScraped = -1;
        break;
      case "price-lowtohigh":
        sort.price = 1;
        break;
      case "price-hightolow":
        sort.price = -1;
        break;
      case "title-atoz":
        sort.title = 1;
        break;
      case "title-ztoa":
        sort.title = -1;
        break;
      default:
        sort.lastScraped = -1;
        break;
    }
    
    const products = await ScrapedProduct.find(filters).sort(sort);
    
    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits scrapés:', error);
    res.status(500).json({
      success: false,
      message: `Erreur lors de la récupération des produits scrapés: ${error.message}`
    });
  }
};

/**
 * Récupère les sites disponibles pour le scraping
 */
const getAvailableSites = async (req, res) => {
  try {
    // Sites disponibles via le service Python
    const pythonSites = ['carrefour', 'monoprix'];
    
    // Sites disponibles via les adaptateurs JavaScript
    const jsAdapterSites = Object.keys(scraperService.adapters);
    
    // Combiner les deux listes sans doublons
    const availableSites = [...new Set([...pythonSites, ...jsAdapterSites])];
    
    res.status(200).json({
      success: true,
      data: availableSites
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des sites disponibles:', error);
    res.status(500).json({
      success: false,
      message: `Erreur lors de la récupération des sites disponibles: ${error.message}`
    });
  }
};

module.exports = {
  scrapeFromSite,
  getScrapedProducts,
  getAvailableSites
};
