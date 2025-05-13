const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Order = require('../models/Order');
const User = require('../models/User');

/**
 * Génère une facture PDF pour une commande
 * @param {string} orderId - ID de la commande
 * @param {Object} res - Objet response Express pour envoyer le PDF
 * @returns {Promise<void>}
 */
const generateInvoicePDF = async (orderId, res) => {
  try {
    // Récupérer les détails de la commande
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Commande non trouvée');
    }

    // Récupérer les informations de l'utilisateur
    const user = await User.findById(order.userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Créer un nouveau document PDF
    const doc = new PDFDocument({ margin: 50 });

    // Configurer les en-têtes pour le téléchargement
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=facture-${orderId}.pdf`);

    // Pipe le PDF directement vers la réponse HTTP
    doc.pipe(res);

    // Ajouter le logo et les informations d'en-tête
    doc.fontSize(20).text('SustainaFood', { align: 'center' });
    doc.fontSize(12).text('Facture', { align: 'center' });
    doc.moveDown();

    // Informations de la facture
    doc.fontSize(14).text('Détails de la facture', { underline: true });
    doc.fontSize(10).text(`Numéro de facture: ${orderId}`);
    doc.text(`Date: ${new Date(order.orderDate).toLocaleDateString()}`);
    doc.text(`Statut de paiement: ${order.paymentStatus}`);
    doc.text(`Méthode de paiement: ${order.paymentMethod}`);
    doc.moveDown();

    // Informations du client
    doc.fontSize(14).text('Informations du client', { underline: true });
    doc.fontSize(10).text(`Nom: ${user.firstname || ''} ${user.lastname || ''}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Téléphone: ${user.phone || 'Non spécifié'}`);
    doc.moveDown();

    // Adresse de livraison
    doc.fontSize(14).text('Adresse de livraison', { underline: true });
    doc.fontSize(10).text(`Adresse: ${order.addressInfo.address || 'Non spécifiée'}`);
    doc.text(`Ville: ${order.addressInfo.city || 'Non spécifiée'}`);
    doc.text(`Code postal: ${order.addressInfo.pincode || 'Non spécifié'}`);
    doc.text(`Téléphone: ${order.addressInfo.phone || 'Non spécifié'}`);
    doc.text(`Notes: ${order.addressInfo.notes || 'Aucune'}`);
    doc.moveDown();

    // Tableau des produits
    doc.fontSize(14).text('Produits commandés', { underline: true });
    doc.moveDown();

    // En-têtes du tableau
    const tableTop = doc.y;
    const tableHeaders = ['Produit', 'Quantité', 'Prix unitaire', 'Total'];
    const columnWidths = [250, 70, 100, 80];
    
    // Dessiner les en-têtes
    doc.fontSize(10);
    let currentX = 50;
    tableHeaders.forEach((header, i) => {
      doc.text(header, currentX, tableTop, { width: columnWidths[i], align: 'left' });
      currentX += columnWidths[i];
    });
    
    // Ligne de séparation
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
    doc.moveDown();

    // Contenu du tableau
    let tableY = tableTop + 25;
    order.cartItems.forEach((item, index) => {
      let currentX = 50;
      
      // Produit
      doc.text(item.title, currentX, tableY, { width: columnWidths[0], align: 'left' });
      currentX += columnWidths[0];
      
      // Quantité
      doc.text(`${item.quantity} ${item.unit || 'pcs'}`, currentX, tableY, { width: columnWidths[1], align: 'left' });
      currentX += columnWidths[1];
      
      // Prix unitaire
      doc.text(`$${item.price.toFixed(2)}`, currentX, tableY, { width: columnWidths[2], align: 'left' });
      currentX += columnWidths[2];
      
      // Total
      doc.text(`$${(item.price * item.quantity).toFixed(2)}`, currentX, tableY, { width: columnWidths[3], align: 'left' });
      
      // Passer à la ligne suivante
      tableY += 20;
      
      // Ajouter une page si nécessaire
      if (tableY > 700) {
        doc.addPage();
        tableY = 50;
      }
    });

    // Ligne de séparation
    doc.moveTo(50, tableY).lineTo(550, tableY).stroke();
    tableY += 15;

    // Total
    doc.fontSize(12).text(`Total: $${order.totalAmount.toFixed(2)}`, 400, tableY, { align: 'right' });
    doc.moveDown(2);

    // Pied de page
    doc.fontSize(10).text('Merci pour votre commande!', { align: 'center' });
    doc.text('SustainaFood - Réduire le gaspillage alimentaire ensemble', { align: 'center' });
    
    // Finaliser le PDF
    doc.end();
    
  } catch (error) {
    console.error('Erreur lors de la génération de la facture:', error);
    throw error;
  }
};

module.exports = {
  generateInvoicePDF
};
