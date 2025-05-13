const express = require("express");

const {
  handleImageUpload,
  addProduct,
  editProduct,
  fetchAllProducts,
  deleteProduct,
  generateProductDataFromImage,
  importProductsFromExcel,
  uploadExcelMiddleware,
} = require("../../controllers/admin/products-controller");

const { upload } = require("../../helpers/cloudinary");
const { authMiddleware } = require("../../controllers/auth/auth-controller");

const router = express.Router();

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware);

router.post("/upload-image", upload.single("my_file"), handleImageUpload);
router.post("/generate-product-data", generateProductDataFromImage);
router.post("/add-product", addProduct);
router.put("/edit-product/:id", editProduct);
router.get("/all-products", fetchAllProducts);
router.delete("/:id", deleteProduct);
router.post("/import-excel", uploadExcelMiddleware, importProductsFromExcel);

module.exports = router;
