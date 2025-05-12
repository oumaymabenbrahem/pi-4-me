// Charger les variables d'environnement au tout début
require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");
const superadminRouter = require("./routes/superadmin/superadmin-routes");
const userRouter = require("./routes/user-routes");
const brandRouter = require("./routes/brand-routes");

const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopPaymentRouter = require("./routes/shop/payment-routes");
const shopRecommendationRouter = require("./routes/shop/recommendation-routes");
const commonFeatureRouter = require("./routes/common/feature-routes");
const chatbotRouter = require("./routes/common/chatbot-routes");
const locationRouter = require("./routes/common/location-routes");

// Importer la fonction d'initialisation des marques par défaut
const { initDefaultBrands } = require("./controllers/brand-controller");

//create a database connection -> u can also
//create a separate file for this and then import/use that file here

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
      "X-Requested-With",
    ],
    credentials: true,
    exposedHeaders: ["Set-Cookie"],
  })
);

// Add security headers
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/superadmin", superadminRouter);
app.use("/api/user", userRouter);
app.use("/api/brands", brandRouter);

app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/payment", shopPaymentRouter);
app.use("/api/shop/recommendation", shopRecommendationRouter);

app.use("/api/common/feature", commonFeatureRouter);
app.use("/api/chatbot", chatbotRouter);
app.use("/api/location", locationRouter);

// Initialiser les marques par défaut
mongoose.connection.once('open', async () => {
  console.log("Initializing default brands...");
  await initDefaultBrands();
});

app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));
