const mongoose = require("mongoose");

const ProductInteractionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    interactionType: {
      type: String,
      enum: ["view", "cart", "purchase"],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true,
  }
);

// Index pour accélérer les requêtes
ProductInteractionSchema.index({ userId: 1 });
ProductInteractionSchema.index({ productId: 1 });
ProductInteractionSchema.index({ interactionType: 1 });

module.exports = mongoose.model("ProductInteraction", ProductInteractionSchema);
