import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const LATITUDE = 38.2673;
const LONGITUDE = -85.4709;
const apiCallStatsPath = path.join(__dirname, "data/api-call-stats.json");
const defaultApiCallStats = {
  date: new Date().toISOString().slice(0, 10),
  count: 0,
  limit: null,
  remaining: null
};

const loadApiCallStats = () => {
  try {
    if (!fs.existsSync(apiCallStatsPath)) return defaultApiCallStats;

    const savedStats = JSON.parse(fs.readFileSync(apiCallStatsPath, "utf8"));
    if (savedStats.date !== defaultApiCallStats.date) return defaultApiCallStats;

    return { ...defaultApiCallStats, ...savedStats };
  } catch (error) {
    console.error("Unable to read API call stats; starting a new daily count:", error);
    return defaultApiCallStats;
  }
};

let apiCallStats = loadApiCallStats();

const saveApiCallStats = () => {
  fs.writeFileSync(apiCallStatsPath, JSON.stringify(apiCallStats, null, 2));
};

const getRateLimitHeader = (headers, name) => {
  const value = headers.get(name);
  return value === null ? null : Number(value);
};

const recordApiCall = (response, startDate, endDate) => {
  const today = new Date().toISOString().slice(0, 10);
  if (apiCallStats.date !== today) {
    apiCallStats = { date: today, count: 0, limit: null, remaining: null };
  }

  apiCallStats.count += 1;
  apiCallStats.limit = getRateLimitHeader(response.headers, "x-ratelimit-limit");
  apiCallStats.remaining = getRateLimitHeader(response.headers, "x-ratelimit-remaining");
  saveApiCallStats();

  console.log(
    `[Open-Meteo] API call #${apiCallStats.count} today (${today}) ` +
    `${startDate} to ${endDate} | ` +
    `daily limit: ${apiCallStats.limit ?? "not provided"} | ` +
    `remaining: ${apiCallStats.remaining ?? "not provided"}`
  );
};

// Middleware
app.use(cors());
app.use(express.json());

const isValidDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

/**
 * GET /api/weather?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
 * Fetches daily maximum temperatures from Open-Meteo for the requested range.
 */
app.get("/api/weather", async (req, res) => {
  try {
    const { start_date: startDate, end_date: endDate } = req.query;

    if (typeof startDate !== "string" || typeof endDate !== "string" ||
      !isValidDate(startDate) || !isValidDate(endDate) || startDate > endDate) {
      return res.status(400).json({
        error: "Invalid date range",
        message: "Provide start_date and end_date as YYYY-MM-DD values, with start_date before end_date."
      });

      app.get("/api/weather/2025", (req, res) => {
        try {
          const dataPath = path.join(__dirname, "data/weather2025.json");
          if (!fs.existsSync(dataPath)) {
            return res.status(404).json({
              error: "Weather data not found",
              message: "Run npm run fetch-weather to create the 2025 data file."
            });
          }

          const weatherData = JSON.parse(fs.readFileSync(dataPath, "utf8"));
          res.json({ success: true, count: weatherData.length, data: weatherData });
        } catch (error) {
          console.error("Error reading legacy weather data:", error);
          res.status(500).json({ error: "Failed to load weather data", message: error.message });
        }
      });
    }

    const url = new URL("https://archive-api.open-meteo.com/v1/archive");
    url.search = new URLSearchParams({
      latitude: LATITUDE.toString(),
      longitude: LONGITUDE.toString(),
      start_date: startDate,
      end_date: endDate,
      daily: "temperature_2m_max",
      temperature_unit: "fahrenheit",
      timezone: "auto"
    });

    const response = await fetch(url);
    recordApiCall(response, startDate, endDate);
    if (!response.ok) {
      throw new Error(`Open-Meteo request failed: ${response.status} ${response.statusText}`);
    }

    const weatherResponse = await response.json();
    const weatherData = weatherResponse.daily.time.map((date, index) => {
      const temp = Math.round(weatherResponse.daily.temperature_2m_max[index]);
      return {
        date,
        temp_f: temp
      };
    });

    res.json({
      success: true,
      count: weatherData.length,
      data: weatherData,
      source: "Open-Meteo historical weather API",
      location: { latitude: LATITUDE, longitude: LONGITUDE },
      start_date: startDate,
      end_date: endDate
    });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(502).json({
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
  console.log(`📊 Weather API: http://localhost:${PORT}/api/weather?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`);
  console.log(
    `[Open-Meteo] Daily API call counter started for ${apiCallStats.date}. ` +
    "Only outbound weather API requests are counted."
  );
});