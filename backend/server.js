import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * GET /api/weather/2025
 * Returns weather data for 2025
 */
app.get("/api/weather/2025", (req, res) => {
  try {
    const dataPath = path.join(__dirname, "data/weather2025.json");
    
    // Check if file exists
    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({ 
        error: "Weather data not found. Please run the fetch script first.",
        message: "Run: node backend/scripts/fetchWeather2025.js"
      });
    }
    
    // Read and parse the JSON file
    const data = fs.readFileSync(dataPath, "utf8");
    const weatherData = JSON.parse(data);
    
    res.json({
      success: true,
      count: weatherData.length,
      data: weatherData
    });
    
  } catch (error) {
    console.error("Error reading weather data:", error);
    res.status(500).json({ 
      error: "Failed to load weather data",
      message: error.message 
    });
  }
});

/**
 * Health check endpoint
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Weather API: http://localhost:${PORT}/api/weather/2025`);
});