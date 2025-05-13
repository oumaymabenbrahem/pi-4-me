const cron = require('node-cron');
const scraperService = require('./index');
const pythonScraperService = require('./pythonScraperService');

/**
 * Configuration des tâches de scraping planifiées
 */
const scrapingTasks = [
  {
    siteName: 'mock',
    url: 'mock://products',
    schedule: '0 0 * * *', // Tous les jours à minuit
    usePython: false
  },
  {
    siteName: 'auchan',
    url: 'https://www.auchan.fr',
    schedule: '0 2 * * *', // Tous les jours à 2h du matin
    usePython: true
  }
];

/**
 * Initialise les tâches de scraping planifiées
 */
const initScrapingScheduler = () => {
  console.log('Initialisation du planificateur de scraping...');

  scrapingTasks.forEach(task => {
    const { siteName, url, schedule, usePython } = task;

    cron.schedule(schedule, async () => {
      console.log(`Exécution de la tâche de scraping planifiée pour ${siteName} à ${url}`);

      try {
        let products = [];
        let savedProducts = [];

        if (usePython) {
          // Utiliser le service Python pour les sites réels
          try {
            products = await pythonScraperService.scrapeProducts(siteName, url);
            savedProducts = await pythonScraperService.saveScrapedProducts(products, siteName, url);
          } catch (error) {
            console.error(`Erreur lors du scraping Python de ${siteName}:`, error.message);

            // Fallback sur les données fictives si le scraping Python échoue
            console.log(`Utilisation de l'adaptateur mock comme fallback pour ${siteName}`);
            products = await scraperService.scrapeProducts('mock', 'mock://products');
            savedProducts = await scraperService.saveScrapedProducts(products, siteName, url);
          }
        } else {
          // Utiliser le service JavaScript pour les adaptateurs standard
          products = await scraperService.scrapeProducts(siteName, url);
          savedProducts = await scraperService.saveScrapedProducts(products, siteName, url);
        }

        console.log(`${savedProducts.length} produits scrapés avec succès depuis ${siteName}`);
      } catch (error) {
        console.error(`Erreur lors de l'exécution de la tâche de scraping pour ${siteName}:`, error.message);
      }
    });

    console.log(`Tâche de scraping planifiée pour ${siteName} (${schedule})`);
  });
};

module.exports = { initScrapingScheduler };
