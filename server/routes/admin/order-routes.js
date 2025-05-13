const express = require("express");
const { authMiddleware } = require("../../controllers/auth/auth-controller");

const {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} = require("../../controllers/admin/order-controller");
const { generateInvoice } = require("../../controllers/admin/invoice-controller");

const router = express.Router();

router.get("/get", authMiddleware, getAllOrdersOfAllUsers);
router.get("/details/:id", authMiddleware, getOrderDetailsForAdmin);
router.put("/update/:id", authMiddleware, updateOrderStatus);
router.get("/invoice/:id", authMiddleware, generateInvoice);

module.exports = router;
