import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./utils/db.js";
import userRoutes from "./routes/user.route.js"; // ✅ You forgot this import
import skillRoutes from "./routes/skillRoutes.js"; // Example for skills route
import listingRoutes from "./routes/listingRoutes.js"; // Import skill listing routes


// Initialize environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS Configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
};
app.use(cors(corsOptions));

// ✅ MOUNT YOUR ROUTES HERE!
app.use('/api/v1/user', userRoutes); // 🔥 This is what was missing!

// Import other routes as needed

app.use('/api/v1/skills', skillRoutes); // Example for skills route
app.use('/api/v1/listings', listingRoutes); // Mount skill listing routes



// Basic route for testing
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Database Connection
connectDB().then(() => {
  console.log("Database connection established");
}).catch((err) => {
  console.error("Database connection failed:", err);
  process.exit(1);
});

// Start Server
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down server gracefully...");
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  });
});

export default app;
