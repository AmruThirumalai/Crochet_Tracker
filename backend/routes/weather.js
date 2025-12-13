import express from "express";
import { db } from "../db/db.js";

const router = express.Router();

router.get("/:year", async (req, res) => {
    const { year } = req.params;

    try {
        const rows = await db.all(
            `SELECT date, temp_f, year
            FROM weather_data
            WHERE year = ?
            ORDER BY date ASC`,
            [year]
        );
        
        res.json(rows);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;