const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const experimentRoutes = require("./routes/experimentRoutes");
const vivaRoutes = require("./routes/vivaRoutes");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://lab-mate-chi.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/experiments", experimentRoutes);
app.use("/api/viva", vivaRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port 5000`);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));