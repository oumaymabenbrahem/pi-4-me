const express = require("express");
const { authMiddleware } = require("../../controllers/auth/auth-controller");
const {
  createPaymentIntent,
  confirmPayment,
  getStripePublicKey
} = require("../../controllers/shop/payment-controller");

const router = express.Router();

// Apply auth middleware to all payment routes
router.use(authMiddleware);

router.post("/create-payment-intent", createPaymentIntent);
router.post("/confirm-payment", confirmPayment);
router.get("/config", getStripePublicKey);

module.exports = router; 