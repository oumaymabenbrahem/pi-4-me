const Order = require("../../models/Order");
const Product = require("../../models/Product");
const mongoose = require("mongoose");
const { clearCartByUserId } = require("./cart-controller");

// Create a new order
const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartId,
      cartItems,
      addressInfo,
      paymentMethod,
      totalAmount
    } = req.body;

    console.log("Order creation request body:", req.body);

    // Vérification détaillée des champs requis
    const missingFields = [];
    if (!userId) missingFields.push('userId');
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) missingFields.push('cartItems');
    if (!addressInfo || !addressInfo.address) missingFields.push('addressInfo');
    if (!paymentMethod) missingFields.push('paymentMethod');
    if (totalAmount === undefined || totalAmount === null) missingFields.push('totalAmount');

    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // S'assurer que chaque produit a un champ brand
    const enhancedCartItems = await Promise.all(cartItems.map(async (item) => {
      // Si le produit n'a pas de brand ou la brand est manquante
      if (!item.brand) {
        try {
          // Chercher le produit dans la base de données pour obtenir sa marque
          const product = await Product.findById(item.productId);
          if (product && product.brand) {
            return { ...item, brand: product.brand };
          }
        } catch (err) {
          console.error(`Failed to fetch brand for product ${item.productId}:`, err);
        }
      }
      return item;
    }));

    const newOrder = new Order({
      userId,
      cartId,
      cartItems: enhancedCartItems, // Utiliser les items avec la marque
      addressInfo,
      orderStatus: "pending",
      paymentMethod,
      paymentStatus: "pending",
      totalAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date()
    });

    await newOrder.save();

    // Clear the user's cart after successful order creation
    await clearCartByUserId(userId);

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      orderId: newOrder._id
    });
  } catch (error) {
    console.error("Error creating order:", error);

    // Détection des erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));

      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message
    });
  }
};

// Get all orders for a specific user
const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const orders = await Order.find({ userId }).sort({ orderDate: -1 });

    return res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user orders",
      error: error.message
    });
  }
};

// Get details of a specific order
const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
      error: error.message
    });
  }
};

// Capture payment for virtual payment processing
const capturePayment = async (req, res) => {
  try {
    const { orderId, paymentId, payerId } = req.body;

    if (!orderId || !paymentId) {
      return res.status(400).json({ message: "Order ID and Payment ID are required" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order with payment information
    order.paymentStatus = "completed";
    order.orderStatus = "processing";
    order.paymentId = paymentId;
    order.payerId = payerId;
    order.orderUpdateDate = new Date();

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment captured successfully",
      order
    });
  } catch (error) {
    console.error("Error capturing payment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to capture payment",
      error: error.message
    });
  }
};

module.exports = {
  createOrder,
  getAllOrdersByUser,
  getOrderDetails,
  capturePayment
};