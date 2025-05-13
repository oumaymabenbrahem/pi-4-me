const Brand = require("../models/Brand");

// Récupérer toutes les marques
const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ label: 1 });
    res.status(200).json({
      success: true,
      brands,
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching brands",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Ajouter une nouvelle marque
const addBrand = async (req, res) => {
  try {
    const { id, label } = req.body;

    // Vérifier si les champs requis sont présents
    if (!id || !label) {
      return res.status(400).json({
        success: false,
        message: "Brand ID and label are required",
      });
    }

    // Vérifier si la marque existe déjà
    const existingBrand = await Brand.findOne({ id });
    if (existingBrand) {
      return res.status(200).json({
        success: true,
        message: "Brand already exists",
        brand: existingBrand,
      });
    }

    // Créer une nouvelle marque
    const newBrand = new Brand({
      id,
      label,
      isCustom: true,
    });

    await newBrand.save();

    res.status(201).json({
      success: true,
      message: "Brand added successfully",
      brand: newBrand,
    });
  } catch (error) {
    console.error("Error adding brand:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while adding brand",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Initialiser les marques par défaut
const initDefaultBrands = async () => {
  try {
    const defaultBrands = [
      { id: "none", label: "None", isCustom: false },
      { id: "aziza", label: "Aziza", isCustom: false },
      { id: "mg", label: "MG", isCustom: false },
      { id: "geant", label: "Geant", isCustom: false },
      { id: "monoprix", label: "Monoprix", isCustom: false },
      { id: "carrefour", label: "Carrefour", isCustom: false },
      { id: "other", label: "Autres", isCustom: false },
    ];

    // Vérifier si les marques par défaut existent déjà
    for (const brand of defaultBrands) {
      const existingBrand = await Brand.findOne({ id: brand.id });
      if (!existingBrand) {
        await Brand.create(brand);
        console.log(`Default brand ${brand.label} created`);
      }
    }

    console.log("Default brands initialized");
  } catch (error) {
    console.error("Error initializing default brands:", error);
  }
};

module.exports = {
  getAllBrands,
  addBrand,
  initDefaultBrands,
};
