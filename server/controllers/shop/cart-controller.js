const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const ScrapedProduct = require("../../models/ScrapedProduct");

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    if (!productId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    // Chercher d'abord dans les produits normaux
    let product = await Product.findById(productId);

    // Si le produit n'est pas trouvé, chercher dans les produits scrapés
    if (!product) {
      console.log(`Product not found in regular products, checking scraped products: ${productId}`);
      product = await ScrapedProduct.findById(productId);
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const findCurrentProductIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (findCurrentProductIndex === -1) {
      cart.items.push({ productId, quantity });
    } else {
      cart.items[findCurrentProductIndex].quantity += quantity;
    }

    await cart.save();
    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const fetchCartItems = async (req, res) => {
  try {
    const userId = req.user._id;

    // Récupérer le panier sans population
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    // Filtrer les éléments valides
    const validItems = cart.items.filter(
      (productItem) => productItem.productId
    );

    if (validItems.length < cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    // Récupérer les détails des produits (normaux et scrapés)
    const populateCartItems = [];

    for (const item of validItems) {
      // Chercher d'abord dans les produits normaux
      let product = await Product.findById(item.productId);

      // Si le produit n'est pas trouvé, chercher dans les produits scrapés
      if (!product) {
        console.log(`Cart item product not found in regular products, checking scraped products: ${item.productId}`);
        product = await ScrapedProduct.findById(item.productId);
      }

      if (product) {
        populateCartItems.push({
          productId: product._id,
          image: product.image,
          title: product.title,
          quantity: product.quantity,
          unit: product.unit,
          price: product.price || 0,
          storeLocation: product.storeLocation,
          expirationDate: product.expirationDate,
          brand: product.brand,
          sourceSite: product.sourceSite, // Pour les produits scrapés
          requestedQuantity: item.quantity,
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const updateCartItemQty = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    if (!productId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    const findCurrentProductIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (findCurrentProductIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Cart item not present !",
      });
    }

    cart.items[findCurrentProductIndex].quantity = quantity;
    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title quantity unit price storeLocation expirationDate brand",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : "Product not found",
      quantity: item.productId ? item.productId.quantity : null,
      unit: item.productId ? item.productId.unit : null,
      price: item.productId ? item.productId.price : 0,
      storeLocation: item.productId ? item.productId.storeLocation : null,
      expirationDate: item.productId ? item.productId.expirationDate : null,
      brand: item.productId ? item.productId.brand : null,
      requestedQuantity: item.quantity,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "image title quantity unit price storeLocation expirationDate brand",
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.productId._id.toString() !== productId
    );

    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title quantity unit price storeLocation expirationDate brand",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : "Product not found",
      quantity: item.productId ? item.productId.quantity : null,
      unit: item.productId ? item.productId.unit : null,
      price: item.productId ? item.productId.price : 0,
      storeLocation: item.productId ? item.productId.storeLocation : null,
      expirationDate: item.productId ? item.productId.expirationDate : null,
      brand: item.productId ? item.productId.brand : null,
      requestedQuantity: item.quantity,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

// Clear all items from the cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    // Clear all items from the cart
    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: {
        ...cart._doc,
        items: [],
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error clearing cart",
      error: error.message,
    });
  }
};

// Clear cart by user ID (for internal use)
const clearCartByUserId = async (userId) => {
  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      console.log(`Cart not found for user ${userId}`);
      return false;
    }

    // Clear all items from the cart
    cart.items = [];
    await cart.save();
    console.log(`Cart cleared successfully for user ${userId}`);
    return true;
  } catch (error) {
    console.error(`Error clearing cart for user ${userId}:`, error);
    return false;
  }
};

module.exports = {
  addToCart,
  updateCartItemQty,
  deleteCartItem,
  fetchCartItems,
  clearCart,
  clearCartByUserId,
};
