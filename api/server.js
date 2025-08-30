const express = require("express");
const cors = require("cors");
const db = require("./db");
const app = express();
const PORT = 8081;

app.use(cors());
app.use(express.json());

// --- PASTE YOUR GOOGLE APPS SCRIPT URL HERE ---
const GOOGLE_SHEET_API_URL =
  "https://script.google.com/macros/s/AKfycbyayBW-UfQxXQMJI4Ih7wiskUrruPzxsHNr53IZZtsAntMKQdW2oGipDI7JjwnzOjA1bA/exec";

// This function will fetch data from the Google Apps Script and populate the database
async function fetchAndPopulateDatabase() {
  try {
    const response = await fetch(GOOGLE_SHEET_API_URL);
    const sheetData = await response.json();

    return new Promise((resolve, reject) => {
      // Use serialize to ensure commands run sequentially
      db.serialize(() => {
        // Step 1: Clear all existing data
        db.run("DELETE FROM needs", (err) => {
          if (err) {
            console.error("Error clearing database:", err.message);
            return reject(err);
          }

          // Step 2: Prepare and run the insert statements
          const stmt = db.prepare(
            "INSERT INTO needs VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
          );
          let completed = 0;
          sheetData.data.forEach((row) => {
            const schoolName =
              row["00 School Name\n"]?.replace(/^\d+\s?/, "").trim() || "";
            const nameAndStory = row["01 Needs Details :\n"] || "";
            const parts = nameAndStory.split("--");
            const name = parts[0]?.trim() || "N/A";
            const story =
              parts.length > 1 ? parts.slice(1).join("--").trim() : "N/A";
            const category =
              row[
                "01 Category \nPlease categorize the needs as Financial help, bicycle, phone, house repair, house bulding, phone, wheel chair"
              ] || "N/A";
            const cost = parseFloat(row["Cost"]) || 0;
            const wishlist = row["Items:"] || "N/A";
            const isSponsored = row["Sponsored?"] === "TRUE" ? 1 : 0;

            const id = `${cost}-${name}`.replace(/\s/g, "");
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
                  resolve(); // Resolve promise when all insertions are done
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
    db.get("SELECT COUNT(*) AS count FROM needs", [], (err, row) => {
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
    db.all("SELECT * FROM needs", [], (err, rows) => {
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
    db.all("SELECT * FROM needs WHERE sponsored = 0", [], (err, rows) => {
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
    db.run(`UPDATE needs SET sponsored = 1 WHERE id = ?`, id, function (err) {
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
