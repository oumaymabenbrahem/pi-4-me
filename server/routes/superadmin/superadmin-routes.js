const express = require("express");
const { 
  getDashboardStats,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdmin,
  getUsersWithVerificationImages,
  approveUserAsAdmin,
  rejectUserAdminRequest
} = require("../../controllers/superadmin/superadmin-controller");
const { authMiddleware } = require("../../controllers/auth/auth-controller");
const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Dashboard stats
router.get("/dashboard", getDashboardStats);

// Admin management
router.get("/admins", getAdmins);
router.post("/admins", createAdmin);
router.get("/admins/:adminId", getAdmin);
router.put("/admins/:adminId", updateAdmin);
router.delete("/admins/:adminId", deleteAdmin);

// Admin requests management
router.get("/admin-requests", getUsersWithVerificationImages);
router.post("/admin-requests/:userId/approve", approveUserAsAdmin);
router.post("/admin-requests/:userId/reject", rejectUserAdminRequest);

module.exports = router; 