const express = require("express");
const cors = require("cors");
const db = require("./db");
const app = express();
const PORT = 8081;
const crypto = require('crypto'); // We need the crypto module for UUID

app.use(cors());
app.use(express.json());

// --- PASTE YOUR GOOGLE APPS SCRIPT URL HERE ---
const GOOGLE_SHEET_API_URL =
    "https://script.google.com/macros/s/AKfycbx0aMI9tRa5F3l1MTq3sAgdUFZWtbAKG1W7TCGf4KNwKD01Sv_ZKLZwl2esaCPjl0z6/exec";

// This function will fetch data from the Google Apps Script and populate the database
async function fetchAndPopulateDatabase() {
    try {
        const response = await fetch(GOOGLE_SHEET_API_URL);
        const sheetData = await response.json();

        return new Promise((resolve, reject) => {
            db.serialize(() => {
                // Step 1: Clear all existing data
                db.run("DELETE FROM mango_stories", (err) => {
                    if (err) {
                        console.error("Error clearing database:", err.message);
                        return reject(err);
                    }

                    // Step 2: Prepare and run the insert statements
                    const stmt = db.prepare(
                        "INSERT INTO mango_stories (id, schoolName, name, story, category, cost, wishlist, sponsored) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
                    );
                    let completed = 0;

                    // This is where the data transformation happens
                    sheetData.data.forEach((row) => {
                        // Map the messy Google Sheet headers to clean variable names
                        const schoolName = row["00 School Name\n"] || "";
                        const needsDetails = row["01 Needs Details :"] || "";
                        const category = row["02 Category \nPlease categorize the needs as Financial help, bicycle, phone, house repair, house building, phone, wheel chair"] || "";
                        const cost = parseFloat(row["03 Cost"]) || 0;

                        // Re-create the `name` and `story` fields from the combined column
                        const parts = needsDetails.split("--");
                        const name = parts[0]?.trim() || "N/A";
                        const story = parts.length > 1 ? parts.slice(1).join("--").trim() : "N/A";

                        // Re-create the `wishlist` and `sponsored` fields
                        const wishlist = row["03 Cost"] || "N/A";
                        const isSponsored = row["Sponsored?"] === "TRUE" ? 1 : 0;

                        // Create a truly unique ID using the crypto module
                        const id = crypto.randomUUID();

                        stmt.run(
                            id,
                            schoolName,
                            name,
                            story,
                            category,
                            cost,
                            wishlist,
                            isSponsored,
                            (err) => {
                                if (err) {
                                    console.error("Error inserting row:", err.message);
                                }
                                completed++;
                                if (completed === sheetData.data.length) {
                                    stmt.finalize();
                                    console.log("Database initialized from Google Sheet API.");
                                    resolve();
                                }
                            }
                        );
                    });
                    if (sheetData.data.length === 0) {
                        stmt.finalize();
                        resolve();
                    }
                });
            });
        });
    } catch (error) {
        console.error("Failed to fetch data from Google Sheet API:", error);
    }
}

// Wrap the entire app.listen in an async function that waits for the database to be ready
async function startServer() {
    await fetchAndPopulateDatabase();
    app.get("/api/total-needs", (req, res) => {
        db.get("SELECT COUNT(*) AS count FROM mango_stories", [], (err, row) => {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.json({
                message: "success",
                count: row.count,
            });
        });
    });
    app.get("/api/all-needs", (req, res) => {
        db.all("SELECT * FROM mango_stories", [], (err, rows) => {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.json({
                message: "success",
                data: rows,
            });
        });
    });

    app.get("/api/needs", (req, res) => {
        db.all("SELECT * FROM mango_stories WHERE sponsored = 0", [], (err, rows) => {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.json({
                message: "success",
                data: rows,
            });
        });
    });

    app.put("/api/needs/:id", (req, res) => {
        const { id } = req.params;
        db.run(`UPDATE mango_stories SET sponsored = 1 WHERE id = ?`, id, function(err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.json({ message: "success", changes: this.changes });
        });
    });

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

// Start the server
startServer();
