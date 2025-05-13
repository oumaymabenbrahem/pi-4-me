const express = require("express");
const { 
  createComplaint, 
  getUserComplaints, 
  getAllComplaints, 
  updateComplaintStatus, 
  respondToComplaint, 
  deleteComplaint,
  getComplaintDetails
} = require("../controllers/complaint-controller");
const { authMiddleware } = require("../controllers/auth/auth-controller");

const router = express.Router();

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware);

// Routes pour les utilisateurs
router.post("/create", createComplaint);
router.get("/user", getUserComplaints);
router.get("/details/:complaintId", getComplaintDetails);

// Routes pour les administrateurs
router.get("/all", getAllComplaints);
router.put("/status/:complaintId", updateComplaintStatus);
router.put("/respond/:complaintId", respondToComplaint);
router.delete("/:complaintId", deleteComplaint);

module.exports = router;
