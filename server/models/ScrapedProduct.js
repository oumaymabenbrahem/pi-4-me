const mongoose = require("mongoose");
const ProductSchema = require("./Product").schema;

// Étendre le schéma de produit existant avec des champs spécifiques au scraping
const ScrapedProductSchema = new mongoose.Schema(
  {
    // Champs hérités du schéma de produit
    ...ProductSchema.obj,
    
    // Champs spécifiques aux produits scrapés
    sourceUrl: {
      type: String,
      required: true
    },
    sourceSite: {
      type: String,
      required: true
    },
    originalId: {
      type: String
    },
    lastScraped: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true, collection: 'scrapedProducts' }
);

// Création explicite de l'index géospatial
ScrapedProductSchema.index({ "storeGeoLocation": "2dsphere" });

module.exports = mongoose.model("ScrapedProduct", ScrapedProductSchema);
