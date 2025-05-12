const express = require("express");
const { getAllUsers, deleteUser, updateUser } = require("../controllers/user-controller");
const { authMiddleware } = require("../controllers/auth/auth-controller");
const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// User management
router.get("/users", getAllUsers);
router.put("/update-user/:userId", updateUser);
router.delete("/users/:userId", deleteUser);

module.exports = router; 