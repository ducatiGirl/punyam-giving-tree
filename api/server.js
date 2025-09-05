const express = require("express");
const cors = require("cors");
const db = require("./db"); // This path is correct if db.js is in the same folder
const app = express();
const PORT = 8081;

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
                db.run("DELETE FROM mango_stories", (err) => { // Updated table name
                    if (err) {
                        console.error("Error clearing database:", err.message);
                        return reject(err);
                    }

                    // Step 2: Prepare and run the insert statements
                    // Note: The new data has only 4 columns. We must match the table schema.
                    const stmt = db.prepare(
                        `INSERT INTO mango_stories (
              school_name,
              needs_details,
              category,
              cost
          ) VALUES (?, ?, ?, ?)`
                    );
                    let completed = 0;
                    sheetData.data.forEach((row) => {
                        // Extract the new column values
                        const schoolName = row["00 School Name\n"] || "";
                        const needsDetails = row["01 Needs Details :"] || "";
                        const category = row["02 Category \nPlease categorize the needs as Financial help, bicycle, phone, house repair, house building, phone, wheel chair"] || "";
                        const cost = parseFloat(row["03 Cost"]) || 0;

                        stmt.run(
                            schoolName,
                            needsDetails,
                            category,
                            cost,
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

async function startServer() {
    await fetchAndPopulateDatabase();

    // The API endpoints will need to be updated to match the new database schema
    // and new table name.

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

    // Note: Since 'sponsored' is no longer a column, this route might not be
    // relevant for your new data unless you add that column to your table.
    // I am commenting it out as it will not work as is.
    // app.get("/api/needs", (req, res) => {
    //   db.all("SELECT * FROM mango_stories WHERE sponsored = 0", [], (err, rows) => {
    //     if (err) {
    //       res.status(400).json({ error: err.message });
    //       return;
    //     }
    //     res.json({
    //       message: "success",
    //       data: rows,
    //     });
    //   });
    // });

    // This route will also not work unless you add an 'id' column and 'sponsored'
    // column to your new database schema and populate it. I am commenting it out.
    // app.put("/api/needs/:id", (req, res) => {
    //   const { id } = req.params;
    //   db.run(`UPDATE mango_stories SET sponsored = 1 WHERE id = ?`, id, function (err) {
    //     if (err) {
    //       res.status(400).json({ error: err.message });
    //       return;
    //     }
    //     res.json({ message: "success", changes: this.changes });
    //   });
    // });

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();
