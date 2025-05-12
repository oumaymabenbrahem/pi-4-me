// Assurez-vous que dotenv est chargé avant d'utiliser des variables d'environnement
require('dotenv').config();

// S'assurer que la clé API est disponible et valide
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error('ERREUR: STRIPE_SECRET_KEY non définie dans le fichier .env');
  console.error('Veuillez ajouter STRIPE_SECRET_KEY=sk_test_... à votre fichier .env');
} else {
  console.log('Clé Stripe détectée - Premiers caractères:', STRIPE_SECRET_KEY.substring(0, 10) + '...');
}

let stripe;
try {
  stripe = require('stripe')(STRIPE_SECRET_KEY);
  console.log('Stripe initialisé avec succès');
} catch (error) {
  console.error('Erreur lors de l\'initialisation de Stripe:', error.message);
}

const Order = require('../../models/Order');

// Créer une intention de paiement
const createPaymentIntent = async (req, res) => {
  try {
    if (!stripe) {
      throw new Error('Stripe n\'est pas correctement initialisé');
    }
    
    const { amount, orderId, currency = 'eur' } = req.body;
    
    if (!amount || !orderId) {
      return res.status(400).json({ 
        success: false,
        message: "Le montant et l'ID de commande sont requis" 
      });
    }

    // Multiplier par 100 car Stripe utilise les centimes (1€ = 100 centimes)
    const amountInCents = Math.round(amount * 100);
    
    // Création de l'intention de paiement
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      metadata: {
        orderId
      }
    });

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'intention de paiement:", error);
    return res.status(500).json({
      success: false,
      message: "Échec de la création de l'intention de paiement",
      error: error.message
    });
  }
};

// Confirmation d'un paiement Stripe
const confirmPayment = async (req, res) => {
  try {
    if (!stripe) {
      throw new Error('Stripe n\'est pas correctement initialisé');
    }
    
    const { orderId, paymentIntentId } = req.body;
    
    if (!orderId || !paymentIntentId) {
      return res.status(400).json({ 
        success: false,
        message: "L'ID de commande et l'ID d'intention de paiement sont requis" 
      });
    }

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Commande non trouvée" 
      });
    }
    
    // Vérification du statut de l'intention de paiement
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: "Le paiement n'a pas été complété avec succès",
        status: paymentIntent.status
      });
    }
    
    // Mise à jour de la commande
    order.paymentStatus = "completed";
    order.orderStatus = "processing";
    order.paymentId = paymentIntentId;
    order.orderUpdateDate = new Date();
    
    await order.save();
    
    return res.status(200).json({
      success: true,
      message: "Paiement confirmé avec succès",
      order
    });
  } catch (error) {
    console.error("Erreur lors de la confirmation du paiement:", error);
    return res.status(500).json({
      success: false,
      message: "Échec de la confirmation du paiement",
      error: error.message
    });
  }
};

// Récupérer la clé publique Stripe
const getStripePublicKey = (req, res) => {
  try {
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      return res.status(500).json({
        success: false,
        message: "Clé publique Stripe non configurée"
      });
    }
    
    return res.status(200).json({
      success: true,
      publishableKey
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la clé publique Stripe:", error);
    return res.status(500).json({
      success: false,
      message: "Échec de la récupération de la clé publique Stripe",
      error: error.message
    });
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  getStripePublicKey
}; 