const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Load environment variables
const http = require('http');


const app = express();

http.createServer(app).listen(5000, () => {
    console.log('HTTP server running on port 5000');
});


// Routes
const jobRoutes = require("./routes/jobs_bulk");
const authRoutes = require("./routes/auth"); // ✅ Import auth routes

// App Setup
app.use(cors());
app.use(express.json());

// Debugging environment variables (optional)
console.log("Mongo URI:", process.env.MONGO_URI);
console.log("JWT Secret:", process.env.JWT_SECRET);

// Routes
app.get("/", (req, res) => {
  res.send("Server is running on port 5000");
});

app.use("/api", authRoutes);  // ✅ Register /api/signup, /api/login
app.use("/api", jobRoutes);   // ✅ Register /api/jobs, etc.

// Database & Server Initialization
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;



mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
