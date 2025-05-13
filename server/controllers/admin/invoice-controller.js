const { generateInvoicePDF } = require('../../services/invoice-service');
const Order = require('../../models/Order');

/**
 * Génère et renvoie une facture PDF pour une commande spécifique
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Promise<void>}
 */
const generateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Vérifier si la commande existe
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Commande non trouvée!"
      });
    }

    // Vérifier les permissions (si admin avec brand, vérifier que la commande contient des produits de sa marque)
    if (user && user.role === 'admin' && user.brand && user.brand !== 'none') {
      // Vérifier si la commande contient au moins un produit de la marque de l'admin
      const hasBrandProduct = order.cartItems.some(item => item.brand === user.brand);
      
      if (!hasBrandProduct) {
        return res.status(403).json({
          success: false,
          message: "Vous n'avez pas la permission de générer une facture pour cette commande!"
        });
      }
    }

    // Générer et envoyer la facture PDF
    await generateInvoicePDF(id, res);
    
    // Note: Pas besoin de renvoyer une réponse JSON car le PDF est directement envoyé dans la réponse
  } catch (error) {
    console.error("Erreur lors de la génération de la facture:", error);
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la génération de la facture"
    });
  }
};

module.exports = {
  generateInvoice
};
