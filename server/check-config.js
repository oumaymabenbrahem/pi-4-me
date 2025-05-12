// Script pour vérifier la configuration
require('dotenv').config();

console.log('=== Vérification de la configuration OpenAI ===');

const apiKey = process.env.OPENAI_API_KEY;

if (apiKey) {
  console.log('✅ Clé API OpenAI trouvée');
  console.log('Longueur de la clé:', apiKey.length);
  console.log('Début de la clé:', apiKey.substring(0, 5) + '...');
} else {
  console.log('❌ Clé API OpenAI NON trouvée!');
  console.log('Veuillez créer un fichier .env avec la variable OPENAI_API_KEY.');
}

console.log('\n=== Autres vérifications ===');

// Vérifier l'installation du module OpenAI
try {
  const OpenAI = require('openai');
  console.log('✅ Module OpenAI installé correctement');
  
  if (apiKey) {
    console.log('Tentative d\'initialisation du client OpenAI...');
    const openai = new OpenAI({ apiKey });
    console.log('✅ Client OpenAI initialisé avec succès');
  }
} catch (error) {
  console.log('❌ Problème avec le module OpenAI:', error.message);
}

// Vérifier l'accès réseau (fonction simple)
const testUrl = 'https://api.openai.com';
const https = require('https');

console.log(`\nTest d'accès réseau à ${testUrl}...`);
const req = https.get(testUrl, (res) => {
  console.log(`✅ Connexion réussie à ${testUrl} (status: ${res.statusCode})`);
  req.end();
}).on('error', (err) => {
  console.log(`❌ Erreur de connexion à ${testUrl}: ${err.message}`);
});

console.log('\nExécutez ce script avec la commande: node check-config.js'); 