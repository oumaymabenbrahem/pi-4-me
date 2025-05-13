const { imageUploadUtil } = require("../../helpers/cloudinary");
const Product = require("../../models/Product");
const mongoose = require("mongoose");
const { generateProductData } = require("../../services/ai-service");
const xlsx = require('xlsx');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configuration de multer pour le stockage temporaire des fichiers Excel
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware d'upload qui peut être exporté
const uploadExcelMiddleware = upload.single('excelFile');

const handleImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await imageUploadUtil(url);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while uploading image",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

//add a new product
const addProduct = async (req, res) => {
  try {
    const {
      image,
      title,
      description,
      category,
      expirationDate,
      quantity,
      unit,
      price,
      storeLocation,
      storeGeoLocation,
      isCollected,
    } = req.body;

    // Vérifier l'authentification et récupérer la brand de l'admin
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Vérifier que l'admin a une marque assignée
    if (user.role === 'admin' && (!user.brand || user.brand === 'none')) {
      return res.status(403).json({
        success: false,
        message: "You need to have a brand assigned to add products",
      });
    }

    // Utiliser la brand de l'admin connecté si c'est un admin
    const brandToUse = user.role === 'admin' ? user.brand : req.body.brand;

    // Validate required fields
    if (!title || !description || !category || !expirationDate || !quantity || !storeLocation) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Convert expirationDate string to Date object
    const formattedExpirationDate = new Date(expirationDate);

    // Validate quantity is a number
    const numericQuantity = Number(quantity);
    if (isNaN(numericQuantity)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a number",
      });
    }

    // Validate price is a number
    const numericPrice = price ? Number(price) : 0;
    if (isNaN(numericPrice)) {
      return res.status(400).json({
        success: false,
        message: "Price must be a number",
      });
    }

    // Préparer les coordonnées géographiques si présentes
    let storeGeoLocationObj = undefined;
    if (storeGeoLocation && storeGeoLocation.coordinates &&
        storeGeoLocation.coordinates.length === 2 &&
        !isNaN(storeGeoLocation.coordinates[0]) &&
        !isNaN(storeGeoLocation.coordinates[1])) {
      storeGeoLocationObj = {
        type: 'Point',
        coordinates: [
          Number(storeGeoLocation.coordinates[0]),
          Number(storeGeoLocation.coordinates[1])
        ]
      };
    }

    const newlyCreatedProduct = new Product({
      image: image || null,
      title,
      description,
      category,
      brand: brandToUse,
      expirationDate: formattedExpirationDate,
      quantity: numericQuantity,
      unit: unit || "pcs",
      price: numericPrice,
      storeLocation,
      storeGeoLocation: storeGeoLocationObj,
      isCollected: isCollected || false,
    });

    await newlyCreatedProduct.save();
    res.status(201).json({
      success: true,
      data: newlyCreatedProduct,
    });
  } catch (e) {
    console.error("Error adding product:", e);
    res.status(500).json({
      success: false,
      message: e.message || "Error occurred while adding product",
    });
  }
};

//fetch all products
const fetchAllProducts = async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un admin avec une brand assignée
    const user = req.user;

    if (user && user.role === 'admin' && user.brand && user.brand !== 'none') {
      // Si c'est un admin avec une brand, ne récupérer que les produits de sa brand
      const listOfProducts = await Product.find({ brand: user.brand });
      return res.status(200).json({
        success: true,
        data: listOfProducts,
      });
    } else if (user && user.role === 'superadmin') {
      // Si c'est un superadmin, récupérer tous les produits
      const listOfProducts = await Product.find({});
      return res.status(200).json({
        success: true,
        data: listOfProducts,
      });
    } else {
      // Pour tous les autres cas (admin sans brand ou autre rôle), renvoyer une liste vide
      return res.status(200).json({
        success: true,
        data: [],
        message: "You need to have a brand assigned to view products"
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

//edit a product
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Received edit request for product ID:", id);
    console.log("Request body:", req.body);

    // Validate product ID
    if (!id) {
      console.error("No product ID provided");
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error("Invalid product ID format:", id);
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    let findProduct = await Product.findById(id);
    if (!findProduct) {
      console.error("Product not found with ID:", id);
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Vérifier que l'utilisateur peut modifier ce produit
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Si c'est un admin, vérifier qu'il a la bonne brand
    if (user.role === 'admin') {
      if (!user.brand || user.brand === 'none') {
        return res.status(403).json({
          success: false,
          message: "You need to have a brand assigned to edit products",
        });
      }

      if (findProduct.brand !== user.brand) {
        return res.status(403).json({
          success: false,
          message: "You can only edit products from your brand",
        });
      }
    }

    console.log("Found product:", findProduct);

    const {
      image,
      title,
      description,
      category,
      expirationDate,
      quantity,
      unit,
      price,
      storeLocation,
      storeGeoLocation,
      isCollected,
    } = req.body;

    console.log("Received storeGeoLocation:", storeGeoLocation);

    // Update fields only if they are provided and valid
    if (title !== undefined) {
      console.log("Updating title:", title);
      findProduct.title = title;
    }
    if (description !== undefined) {
      console.log("Updating description:", description);
      findProduct.description = description;
    }
    if (category !== undefined) {
      console.log("Updating category:", category);
      findProduct.category = category;
    }
    // Note: La marque du produit ne peut JAMAIS être modifiée
    if (expirationDate !== undefined) {
      console.log("Updating expirationDate:", expirationDate);
      const date = new Date(expirationDate);
      if (isNaN(date.getTime())) {
        console.error("Invalid expiration date format:", expirationDate);
        return res.status(400).json({
          success: false,
          message: "Invalid expiration date format",
        });
      }
      findProduct.expirationDate = date;
    }
    if (quantity !== undefined) {
      console.log("Updating quantity:", quantity);
      const numQuantity = Number(quantity);
      if (isNaN(numQuantity)) {
        console.error("Invalid quantity format:", quantity);
        return res.status(400).json({
          success: false,
          message: "Quantity must be a number",
        });
      }
      findProduct.quantity = numQuantity;
    }
    if (unit !== undefined) {
      console.log("Updating unit:", unit);
      findProduct.unit = unit;
    }
    if (price !== undefined) {
      const numericPrice = Number(price);
      if (!isNaN(numericPrice)) {
        console.log("Updating price:", numericPrice);
        findProduct.price = numericPrice;
      }
    }
    if (storeLocation !== undefined) {
      console.log("Updating storeLocation:", storeLocation);
      findProduct.storeLocation = storeLocation;
    }

    // Mettre à jour les coordonnées géographiques si elles sont fournies
    if (storeGeoLocation !== undefined) {
      console.log("Updating storeGeoLocation:", storeGeoLocation);

      // Vérifier que les coordonnées sont valides
      if (storeGeoLocation &&
          storeGeoLocation.coordinates &&
          Array.isArray(storeGeoLocation.coordinates) &&
          storeGeoLocation.coordinates.length === 2 &&
          !isNaN(Number(storeGeoLocation.coordinates[0])) &&
          !isNaN(Number(storeGeoLocation.coordinates[1]))) {

        // Formater correctement les coordonnées
        findProduct.storeGeoLocation = {
          type: 'Point',
          coordinates: [
            Number(storeGeoLocation.coordinates[0]),
            Number(storeGeoLocation.coordinates[1])
          ]
        };
        console.log("Updated storeGeoLocation to:", findProduct.storeGeoLocation);
      } else {
        console.warn("Invalid storeGeoLocation format, not updating this field");
      }
    }
    if (isCollected !== undefined) {
      console.log("Updating isCollected:", isCollected);
      // Ensure isCollected is a boolean
      findProduct.isCollected = Boolean(isCollected);
    }
    if (image !== undefined) {
      console.log("Updating image:", image);
      findProduct.image = image;
    }

    console.log("Saving updated product...");
    await findProduct.save();
    console.log("Product updated successfully");

    res.status(200).json({
      success: true,
      data: findProduct,
    });
  } catch (e) {
    console.error("Error editing product:", {
      message: e.message,
      stack: e.stack,
    });
    res.status(500).json({
      success: false,
      message: e.message || "Error occurred while editing product",
    });
  }
};

//delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate product ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    // D'abord, trouver le produit pour vérifier la brand
    const findProduct = await Product.findById(id);
    if (!findProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Vérifier que l'utilisateur peut supprimer ce produit
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Si c'est un admin, vérifier qu'il a la bonne brand
    if (user.role === 'admin') {
      if (!user.brand || user.brand === 'none') {
        return res.status(403).json({
          success: false,
          message: "You need to have a brand assigned to delete products",
        });
      }

      if (findProduct.brand !== user.brand) {
        return res.status(403).json({
          success: false,
          message: "You can only delete products from your brand",
        });
      }
    }

    // Maintenant, supprimer le produit
    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

// Générer des données de produit à partir d'une image
const generateProductDataFromImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    console.log("Requête de génération de données produit reçue pour l'image:", imageUrl);

    if (!imageUrl) {
      console.warn("Aucune URL d'image fournie dans la requête");
      return res.status(400).json({
        success: false,
        message: "L'URL de l'image est requise",
      });
    }

    // Vérifier que l'URL est bien formée
    try {
      new URL(imageUrl); // Ceci lancera une erreur si l'URL est mal formée
    } catch (urlError) {
      console.error("URL d'image mal formée:", imageUrl);
      return res.status(400).json({
        success: false,
        message: "L'URL de l'image est invalide",
      });
    }

    console.log("Appel au service de génération de données produit...");
    // Génération des données du produit
    const productData = await generateProductData(imageUrl);
    console.log("Données produit générées:", productData);

    // Renvoyer les données générées au client
    res.status(200).json({
      success: true,
      data: productData,
    });
  } catch (error) {
    console.error("Erreur lors de la génération des données produit:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la génération des données produit",
    });
  }
};

// Import products from Excel file
const importProductsFromExcel = async (req, res) => {
  try {
    // Vérifier l'authentification et récupérer la brand de l'admin
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Vérifier que l'admin a une marque assignée
    if (user.role === 'admin' && (!user.brand || user.brand === 'none')) {
      return res.status(403).json({
        success: false,
        message: "You need to have a brand assigned to import products",
      });
    }

    // Vérifier si un fichier a été uploadé
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No Excel file uploaded",
      });
    }

    // Utiliser la brand de l'admin connecté si c'est un admin
    const brandToUse = user.role === 'admin' ? user.brand : null;

    // Lire le fichier Excel
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Excel file is empty or has no valid data",
      });
    }

    // Validation des données
    const requiredFields = ['title', 'description', 'category', 'expirationDate', 'quantity', 'storeLocation'];
    const validationErrors = [];

    jsonData.forEach((row, index) => {
      requiredFields.forEach(field => {
        if (!row[field]) {
          validationErrors.push(`Row ${index + 1}: Missing required field '${field}'`);
        }
      });

      // Validation spécifique pour certains champs
      if (row.quantity && isNaN(Number(row.quantity))) {
        validationErrors.push(`Row ${index + 1}: Quantity must be a number`);
      }

      if (row.price && isNaN(Number(row.price))) {
        validationErrors.push(`Row ${index + 1}: Price must be a number`);
      }

      if (row.expirationDate && isNaN(new Date(row.expirationDate).getTime())) {
        validationErrors.push(`Row ${index + 1}: Invalid expiration date format`);
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation errors in Excel data",
        errors: validationErrors,
      });
    }

    // Créer les produits avec prise en charge des images
    const productsToCreate = [];

    // Traiter chaque ligne, incluant l'upload d'images si nécessaire
    for (const row of jsonData) {
      let imageUrl = row.image || null;

      // Si l'image est une chaîne base64 ou une URL d'image valide
      if (imageUrl) {
        try {
          // Vérifier si c'est une chaîne base64 pour une image
          if (imageUrl.startsWith('data:image')) {
            // Upload l'image via la fonction Cloudinary existante
            const result = await imageUploadUtil(imageUrl);
            imageUrl = result.secure_url || result.url;
            console.log(`Image uploaded to Cloudinary: ${imageUrl}`);
          }
          // Si c'est une URL d'image, on peut la conserver telle quelle
          else if (imageUrl.startsWith('http')) {
            console.log(`Using image URL: ${imageUrl}`);
          }
          // Si c'est une chaîne base64 sans préfixe
          else if (/^[A-Za-z0-9+/=]+$/.test(imageUrl) && imageUrl.length > 100) {
            // Ajouter le préfixe data:image pour l'upload
            const dataUrl = `data:image/jpeg;base64,${imageUrl}`;
            const result = await imageUploadUtil(dataUrl);
            imageUrl = result.secure_url || result.url;
            console.log(`Base64 image uploaded to Cloudinary: ${imageUrl}`);
          }
        } catch (error) {
          console.error(`Failed to upload image for product: ${row.title}`, error);
          // En cas d'échec, continuer avec null pour l'image
          imageUrl = null;
        }
      }

      // Préparer les données de géolocalisation si disponibles
      let storeGeoLocation;
      if (row.storeGeoLongitude && row.storeGeoLatitude) {
        const longitude = Number(row.storeGeoLongitude);
        const latitude = Number(row.storeGeoLatitude);

        if (!isNaN(longitude) && !isNaN(latitude)) {
          storeGeoLocation = {
            type: 'Point',
            coordinates: [longitude, latitude]
          };
        }
      }

      // Vérifier que storeGeoLocation est correctement formaté
      // Si les coordonnées ne sont pas disponibles, ne pas inclure storeGeoLocation
      const productData = {
        image: imageUrl,
        title: row.title,
        description: row.description,
        category: row.category,
        brand: brandToUse || row.brand,
        expirationDate: new Date(row.expirationDate),
        quantity: Number(row.quantity),
        unit: row.unit || "pcs",
        price: row.price ? Number(row.price) : 0,
        storeLocation: row.storeLocation,
        isCollected: row.isCollected === true || row.isCollected === 'true' || false,
      };

      // N'ajouter storeGeoLocation que si les coordonnées sont valides
      if (storeGeoLocation &&
          storeGeoLocation.coordinates &&
          Array.isArray(storeGeoLocation.coordinates) &&
          storeGeoLocation.coordinates.length === 2) {
        productData.storeGeoLocation = storeGeoLocation;
      }

      // Ajouter le produit à la liste
      productsToCreate.push(productData);
    }

    // Insérer les produits dans la base de données
    const insertedProducts = await Product.insertMany(productsToCreate);

    res.status(201).json({
      success: true,
      message: `Successfully imported ${insertedProducts.length} products`,
      data: insertedProducts,
    });
  } catch (error) {
    console.error("Error importing products from Excel:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error occurred while importing products",
    });
  }
};

module.exports = {
  handleImageUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
  generateProductDataFromImage,
  importProductsFromExcel,
  uploadExcelMiddleware,
};
