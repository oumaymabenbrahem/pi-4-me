const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    image: String, 
    title: String, 
    description: String, 
    category: String, 
    brand: String, 
    expirationDate: Date, 
    quantity: Number, 
    unit: { type: String, enum: ["kg", "L", "pcs"], default: "pcs" }, 
    price: { type: Number, default: 0 },
    storeLocation: String,
    storeGeoLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: undefined
      }
    }, 
    isCollected: { type: Boolean, default: false }, 
  },
  { timestamps: true, collection: 'productsTree' }
);

// Création explicite de l'index géospatial
ProductSchema.index({ "storeGeoLocation": "2dsphere" });

module.exports = mongoose.model("Product", ProductSchema);
