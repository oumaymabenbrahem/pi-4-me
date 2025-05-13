const scraperService = require('./scraper');
const jumiaAdapter = require('./jumiaAdapter');
const mockAdapter = require('./mockAdapter');
const carrefourAdapter = require('./carrefourAdapter');

// Enregistrer les adaptateurs disponibles
scraperService.registerAdapter('jumia', jumiaAdapter);
scraperService.registerAdapter('mock', mockAdapter);
scraperService.registerAdapter('carrefour', carrefourAdapter);

// Vous pouvez ajouter d'autres adaptateurs ici
// scraperService.registerAdapter('monoprix', monoprixAdapter);

module.exports = scraperService;
