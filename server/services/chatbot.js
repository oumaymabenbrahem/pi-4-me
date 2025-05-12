const axios = require('axios');

// Base de connaissances pour le chatbot local
const knowledgeBase = {
  // Salutations
  greetings: {
    patterns: ['bonjour', 'salut', 'hello', 'hi', 'hey', 'coucou', 'bonsoir'],
    responses: [
      "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
      "Salut ! Que puis-je faire pour vous ?",
      "Bonjour, je suis votre assistant virtuel. Comment puis-je vous être utile ?"
    ]
  },
  
  // Produits
  products: {
    patterns: ['produit', 'article', 'catalogue', 'collection', 'gamme', 'offre', 'achat'],
    responses: [
      "Nous proposons une large gamme de produits incluant des vêtements, accessoires, et articles électroniques. Que recherchez-vous en particulier ?",
      "Notre catalogue comprend des produits de qualité dans différentes catégories. Je peux vous aider à trouver ce que vous cherchez.",
      "Vous pouvez consulter notre catalogue complet sur notre site web. Y a-t-il un type de produit qui vous intéresse ?"
    ]
  },
  
  // Prix
  pricing: {
    patterns: ['prix', 'coût', 'tarif', 'combien', 'cher', 'promotion', 'réduction', 'solde'],
    responses: [
      "Nos prix sont très compétitifs et nous proposons régulièrement des promotions. Quel type de produit vous intéresse ?",
      "Nous avons des produits pour tous les budgets. Puis-je vous montrer notre gamme ?",
      "Les prix varient selon les produits, mais nous garantissons le meilleur rapport qualité-prix."
    ]
  },
  
  // Livraison
  shipping: {
    patterns: ['livraison', 'délai', 'expédition', 'colis', 'envoi', 'recevoir', 'arrivée'],
    responses: [
      "La livraison est gratuite pour toute commande supérieure à 50€. Le délai habituel est de 2-3 jours ouvrés.",
      "Nous livrons partout en France métropolitaine. Voulez-vous plus de détails sur nos options de livraison ?",
      "Votre commande sera traitée sous 24h et livrée en 2-3 jours ouvrés. Nous proposons également une option express."
    ]
  },
  
  // Paiement
  payment: {
    patterns: ['paiement', 'payer', 'carte', 'bancaire', 'paypal', 'virement', 'espèces', 'facture'],
    responses: [
      "Nous acceptons les cartes bancaires, PayPal et les virements. Le paiement est 100% sécurisé.",
      "Vous pouvez payer en toute sécurité par carte, PayPal ou virement bancaire. Quelle méthode préférez-vous ?",
      "Toutes nos transactions sont sécurisées et nous acceptons plusieurs moyens de paiement."
    ]
  },
  
  // Réclamations
  complaints: {
    patterns: ['problème', 'réclamation', 'plainte', 'erreur', 'défaut', 'insatisfait', 'retour', 'remboursement'],
    responses: [
      "Je suis désolé d'apprendre que vous rencontrez un problème. Veuillez contacter notre service client à support@example.com.",
      "Nous prenons votre satisfaction très au sérieux. Pourriez-vous nous donner plus de détails sur le problème ?",
      "Nous traiterons votre problème dans les plus brefs délais. Vous pouvez également nous appeler au 01 23 45 67 89."
    ]
  },
  
  // Par défaut
  default: {
    responses: [
      "Je suis là pour vous aider. Que puis-je faire pour vous ?",
      "Comment puis-je vous assister aujourd'hui ?",
      "Je suis votre assistant virtuel. Que souhaitez-vous savoir ?"
    ]
  }
};

// Fonction principale pour générer une réponse
const generateChatResponse = async (message, context = []) => {
  try {
    console.log('Message reçu:', message);

    if (!message || typeof message !== 'string') {
      throw new Error('Message invalide');
    }

    // Conversion en minuscules pour la recherche
    const messageLower = message.toLowerCase();
    
    // Recherche de correspondances dans la base de connaissances
    let category = 'default';
    let highestMatchCount = 0;
    
    // Parcourir toutes les catégories (sauf default)
    Object.keys(knowledgeBase).forEach(key => {
      if (key !== 'default') {
        const patterns = knowledgeBase[key].patterns || [];
        const matchCount = patterns.filter(pattern => messageLower.includes(pattern)).length;
        
        if (matchCount > highestMatchCount) {
          highestMatchCount = matchCount;
          category = key;
        }
      }
    });
    
    // Sélection aléatoire parmi les réponses disponibles
    const responses = knowledgeBase[category].responses;
    const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
    
    console.log(`Catégorie identifiée: ${category}`);
    
    return {
      success: true,
      data: selectedResponse
    };

  } catch (error) {
    console.error('Erreur:', error.message);
    
    return {
      success: false,
      error: "Je suis désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer."
    };
  }
};

module.exports = {
  generateChatResponse
};
