const Product = require("../../models/Product");
const ScrapedProduct = require("../../models/ScrapedProduct");

const getFilteredProducts = async (req, res) => {
  try {
    const { category = [], brand = [], sortBy = "expiration-soonest", includeScraped = "true" } = req.query;

    let filters = {};

    if (category.length) {
      filters.category = { $in: category.split(",") };
    }

    if (brand.length) {
      filters.brand = { $in: brand.split(",") };
    }

    let sort = {};

    switch (sortBy) {
      case "expiration-soonest":
        sort.expirationDate = 1;
        break;
      case "expiration-latest":
        sort.expirationDate = -1;
        break;
      case "quantity-lowtohigh":
        sort.quantity = 1;
        break;
      case "quantity-hightolow":
        sort.quantity = -1;
        break;
      case "title-atoz":
        sort.title = 1;
        break;
      case "title-ztoa":
        sort.title = -1;
        break;
      default:
        sort.expirationDate = 1;
        break;
    }

    // Récupérer les produits normaux
    const products = await Product.find(filters).sort(sort);

    // Si includeScraped est true, récupérer également les produits scrapés
    let allProducts = [...products];

    if (includeScraped === "true") {
      console.log("Including scraped products in results");
      // Ajouter un filtre pour les produits scrapés actifs
      const scrapedFilters = { ...filters, isActive: true };
      const scrapedProducts = await ScrapedProduct.find(scrapedFilters).sort(sort);

      console.log(`Found ${scrapedProducts.length} scraped products`);

      // Combiner les produits normaux et les produits scrapés
      allProducts = [...products, ...scrapedProducts];

      // Trier à nouveau tous les produits selon le critère de tri
      if (sortBy.includes("expiration")) {
        allProducts.sort((a, b) => {
          const dateA = new Date(a.expirationDate);
          const dateB = new Date(b.expirationDate);
          return sortBy === "expiration-soonest" ? dateA - dateB : dateB - dateA;
        });
      } else if (sortBy.includes("quantity")) {
        allProducts.sort((a, b) => {
          return sortBy === "quantity-lowtohigh" ? a.quantity - b.quantity : b.quantity - a.quantity;
        });
      } else if (sortBy.includes("title")) {
        allProducts.sort((a, b) => {
          return sortBy === "title-atoz" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
        });
      }
    }

    res.status(200).json({
      success: true,
      data: allProducts,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Chercher d'abord dans les produits normaux
    let product = await Product.findById(id);

    // Si le produit n'est pas trouvé, chercher dans les produits scrapés
    if (!product) {
      console.log(`Product not found in regular products, checking scraped products: ${id}`);
      product = await ScrapedProduct.findById(id);
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

module.exports = { getFilteredProducts, getProductDetails };
