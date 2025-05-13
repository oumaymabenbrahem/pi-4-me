const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
let ScrapedProduct;

// Vérifier si le modèle existe déjà pour éviter les erreurs de redéfinition
try {
  ScrapedProduct = mongoose.model('ScrapedProduct');
} catch (error) {
  // Si le modèle n'existe pas, l'importer
  ScrapedProduct = require('../../models/ScrapedProduct');
}

/**
 * Service de scraping utilisant un script Python
 */
class PythonScraperService {
  constructor() {
    this.pythonPath = 'python'; // ou 'python3' selon votre système
    this.scriptPath = path.join(__dirname, '../../scripts/scraper.py');
    this.tempDir = path.join(__dirname, '../../temp');

    // Créer le répertoire temporaire s'il n'existe pas
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Exécute le script Python de scraping
   * @param {string} site - Nom du site à scraper (carrefour, monoprix, etc.)
   * @param {string} url - URL de la page à scraper
   * @returns {Promise<Array>} Liste des produits scrapés
   */
  async scrapeProducts(site, url) {
    try {
      console.log(`Scraping de ${site} à l'URL: ${url}`);

      // Créer un fichier temporaire pour stocker les résultats
      const timestamp = Date.now();
      const outputFile = path.join(this.tempDir, `scrape_${site}_${timestamp}.json`);

      // Exécuter le script Python
      const products = await this.runPythonScript(site, url, outputFile);

      console.log(`${products.length} produits scrapés depuis ${site}`);

      return products;
    } catch (error) {
      console.error(`Erreur lors du scraping de ${site}:`, error.message);
      throw error;
    }
  }

  /**
   * Exécute le script Python et retourne les résultats
   * @param {string} site - Nom du site
   * @param {string} url - URL à scraper
   * @param {string} outputFile - Chemin du fichier de sortie
   * @returns {Promise<Array>} Liste des produits scrapés
   */
  runPythonScript(site, url, outputFile) {
    return new Promise((resolve, reject) => {
      // Lancer le script Python avec les arguments appropriés
      const pythonProcess = spawn(this.pythonPath, [
        this.scriptPath,
        site,
        url,
        outputFile
      ]);

      let errorOutput = '';

      // Capturer la sortie d'erreur
      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(`Erreur Python: ${data.toString()}`);
      });

      // Gérer la fin du processus
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          return reject(new Error(`Le script Python a échoué avec le code ${code}: ${errorOutput}`));
        }

        try {
          // Lire le fichier de sortie
          if (fs.existsSync(outputFile)) {
            const data = fs.readFileSync(outputFile, 'utf8');
            const products = JSON.parse(data);

            // Supprimer le fichier temporaire
            fs.unlinkSync(outputFile);

            resolve(products);
          } else {
            reject(new Error(`Le fichier de sortie ${outputFile} n'a pas été créé`));
          }
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Sauvegarde les produits scrapés dans la base de données
   * @param {Array} products - Liste des produits à sauvegarder
   * @param {string} siteName - Nom du site source
   * @param {string} sourceUrl - URL source
   * @returns {Promise<Array>} Liste des produits sauvegardés
   */
  async saveScrapedProducts(products, siteName, sourceUrl) {
    try {
      const savedProducts = [];

      for (const product of products) {
        // Vérifier si le produit existe déjà (par URL source et ID original)
        let existingProduct = await ScrapedProduct.findOne({
          sourceSite: siteName,
          originalId: product.originalId
        });

        if (existingProduct) {
          // Mettre à jour le produit existant
          Object.assign(existingProduct, {
            ...product,
            sourceSite: siteName,
            sourceUrl: sourceUrl,
            lastScraped: new Date()
          });

          await existingProduct.save();
          savedProducts.push(existingProduct);
        } else {
          // Créer un nouveau produit
          const newProduct = new ScrapedProduct({
            ...product,
            sourceSite: siteName,
            sourceUrl: sourceUrl,
            lastScraped: new Date()
          });

          await newProduct.save();
          savedProducts.push(newProduct);
        }
      }

      return savedProducts;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des produits scrapés:', error.message);
      throw error;
    }
  }
}

module.exports = new PythonScraperService();
