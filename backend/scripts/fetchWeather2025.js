import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LATITUDE = 38.2673;
const LONGITUDE = -85.4709;

const START_DATE = "2025-01-01";
// today in YYYY-MM-DD
const END_DATE = new Date().toISOString().split("T")[0];

const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${LATITUDE}&longitude=${LONGITUDE}&start_date=${START_DATE}&end_date=${END_DATE}&daily=temperature_2m_max&temperature_unit=fahrenheit&timezone=auto`;

/**
 * Get color name based on temperature
 * @param {number} temp - Temperature in Fahrenheit
 * @returns {string} Color name
 */
function getColorForTemp(temp) {
  if (temp < 20) return "Gray";
  if (temp < 30) return "Royal Blue";
  if (temp < 40) return "Skylight";
  if (temp < 50) return "Sage";
  if (temp < 60) return "Butter";
  if (temp < 70) return "Gold";
  if (temp < 80) return "Pumpkin";
  if (temp < 90) return "Clay";
  return "Red";
}

/**
 * Fetch weather data from Open-Meteo API and save to JSON file
 */
async function fetchWeather() {
  try {
    console.log("Fetching weather data...");
    console.log(`Date range: ${START_DATE} to ${END_DATE}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();

    const dates = data.daily.time;
    const temps = data.daily.temperature_2m_max;

    // Map the results with temperature and color
    const results = dates.map((date, index) => {
      const temp = Math.round(temps[index]);
      return {
        date,
        temp_f: temp,
        color_name: getColorForTemp(temp),
      };
    });

    // Save to JSON file
    const outputPath = path.join(__dirname, "../data/weather2025.json");
    const outputDir = path.dirname(outputPath);
    
    // Create data directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    
    console.log(`✓ Successfully fetched ${results.length} days of weather data`);
    console.log(`✓ Data saved to: ${outputPath}`);
    
    // Log first and last few entries
    console.log("\nFirst 3 entries:");
    console.log(results.slice(0, 3));
    console.log("\nLast 3 entries:");
    console.log(results.slice(-3));
    
  } catch (error) {
    console.error("Error fetching weather data:", error.message);
    process.exit(1);
  }
}

// Run the script
fetchWeather();