const Order = require("../../models/Order");
const Product = require("../../models/Product");

const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un admin avec une brand assignée
    const user = req.user;

    if (user && user.role === 'admin' && user.brand && user.brand !== 'none') {
      // Pour un admin avec brand, récupérer uniquement les commandes contenant des produits de sa marque
      const orders = await Order.find({
        "cartItems.brand": user.brand
      });

      if (!orders.length) {
        return res.status(404).json({
          success: false,
          message: "No orders found for your brand!",
        });
      }

      res.status(200).json({
        success: true,
        data: orders,
      });
    } else if (user && user.role === 'superadmin') {
      // Pour un superadmin, récupérer toutes les commandes
      const orders = await Order.find({});

      if (!orders.length) {
        return res.status(404).json({
          success: false,
          message: "No orders found!",
        });
      }

      res.status(200).json({
        success: true,
        data: orders,
      });
    } else {
      // Pour un admin sans brand assignée, renvoyer une liste vide
      return res.status(403).json({
        success: false,
        message: "You need to have a brand assigned to view orders",
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    // Vérifier si l'utilisateur est un admin avec le droit d'accéder à cette commande
    if (user && user.role === 'admin' && user.brand && user.brand !== 'none') {
      // Vérifier si la commande contient au moins un produit de la marque de l'admin
      const hasBrandProduct = order.cartItems.some(item => item.brand === user.brand);
      
      if (!hasBrandProduct) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to view this order!",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;
    const user = req.user;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    // Vérifier si l'utilisateur est un admin avec le droit de modifier cette commande
    if (user && user.role === 'admin' && user.brand && user.brand !== 'none') {
      // Vérifier si la commande contient au moins un produit de la marque de l'admin
      const hasBrandProduct = order.cartItems.some(item => item.brand === user.brand);
      
      if (!hasBrandProduct) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to update this order!",
        });
      }
    }

    await Order.findByIdAndUpdate(id, { orderStatus });

    res.status(200).json({
      success: true,
      message: "Order status is updated successfully!",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
};
