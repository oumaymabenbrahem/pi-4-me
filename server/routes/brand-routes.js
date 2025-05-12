const express = require("express");
const { getAllBrands, addBrand } = require("../controllers/brand-controller");
const { authMiddleware } = require("../controllers/auth/auth-controller");

const router = express.Router();

// Route publique pour récupérer toutes les marques
router.get("/", getAllBrands);

// Route protégée pour ajouter une nouvelle marque
router.post("/", authMiddleware, addBrand);

module.exports = router;
