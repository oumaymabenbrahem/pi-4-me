// Script pour tester le scraping Python
require('dotenv').config();
const mongoose = require('mongoose');
const pythonScraperService = require('../services/scraping/pythonScraperService');

// Référence au modèle ScrapedProduct
let ScrapedProduct;
try {
  ScrapedProduct = mongoose.model('ScrapedProduct');
} catch (error) {
  // Si le modèle n'existe pas encore, l'importer
  ScrapedProduct = require('../models/ScrapedProduct');
}

// Sites et URLs à tester
const TEST_SITES = [
  {
    siteName: 'auchan',
    url: 'https://www.auchan.fr'
  }
];

// Fonction principale
async function testPythonScraping() {
  try {
    // Connexion à la base de données
    console.log('Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connecté à MongoDB');

    // Tester chaque site
    for (const site of TEST_SITES) {
      const { siteName, url } = site;

      console.log(`\n=== Test de scraping pour ${siteName} ===`);
      console.log(`URL: ${url}`);

      try {
        // Scraper les produits
        console.log(`Scraping de ${siteName}...`);
        const products = await pythonScraperService.scrapeProducts(siteName, url);
        console.log(`${products.length} produits scrapés`);

        // Afficher les détails du premier produit
        if (products.length > 0) {
          console.log('\nDétails du premier produit:');
          console.log(JSON.stringify(products[0], null, 2));
        }

        // Sauvegarder les produits dans la base de données
        console.log('\nSauvegarde des produits dans la base de données...');
        const savedProducts = await pythonScraperService.saveScrapedProducts(products, siteName, url);
        console.log(`${savedProducts.length} produits sauvegardés`);

        // Vérifier les produits dans la base de données
        const productsInDB = await ScrapedProduct.find({ sourceSite: siteName });
        console.log(`\nNombre total de produits ${siteName} dans la base de données: ${productsInDB.length}`);
      } catch (error) {
        console.error(`Erreur lors du test de scraping pour ${siteName}:`, error.message);
      }
    }

    console.log('\nTest de scraping Python terminé');
  } catch (error) {
    console.error('Erreur lors du test de scraping Python:', error);
  } finally {
    // Fermer la connexion à la base de données
    await mongoose.connection.close();
    console.log('Connexion à MongoDB fermée');
    process.exit(0);
  }
}

// Exécuter le test
testPythonScraping();
