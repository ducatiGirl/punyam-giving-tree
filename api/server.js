const express = require("express");
const cors = require("cors");
const db = require("./db");
const app = express();
const PORT = 8081;

app.use(cors());
app.use(express.json());

const GOOGLE_SHEET_API_URL =
  "https://script.google.com/macros/s/AKfycbyayBW-UfQxXQMJI4Ih7wiskUrruPzxsHNr53IZZtsAntMKQdW2oGipDI7JjwnzOjA1bA/exec";

async function fetchAndPopulateDatabase() {
  try {
    const response = await fetch(GOOGLE_SHEET_API_URL);
    const sheetData = await response.json();

    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run("DELETE FROM full_story_for_mango_tree", (err) => {
          if (err) {
            console.error("Error clearing database:", err.message);
            return reject(err);
          }

          const stmt = db.prepare(
            "INSERT INTO full_story_for_mango_tree VALUES (?, ?, ?, ?, ?, ?, ?)"
          );
          let completed = 0;
          sheetData.data.forEach((row, index) => {
            const schoolName = row["00 School Name\n"]?.replace(/^\d+\s?/, "").trim() || "";
            const nameAndStory = row["01 Needs Details :\n"] || "";
            const parts = nameAndStory.split("--");
            const name = parts[0]?.trim() || "N/A";
            const story = parts.length > 1 ? parts.slice(1).join("--").trim() : "N/A";
            const wishlist = row["02 Category \nPlease categorize the needs as Financial help, bicycle, phone, house repair, house building, phone, wheel chair"] || "N/A";
            const cost = parseFloat(row["03 Cost"]) || 0;
            const isSponsored = row["Sponsored?"] === "TRUE" ? 1 : 0;

            const id = `${cost}-${name}-${index}`.replace(/\s/g, "");
            
            stmt.run(
              id,
              schoolName,
              name,
              story,
              wishlist,
              cost,
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

async function startServer() {
  await fetchAndPopulateDatabase();

  app.get("/api/total-needs", (req, res) => {
    db.get("SELECT COUNT(*) AS count FROM full_story_for_mango_tree", [], (err, row) => {
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
    db.all("SELECT * FROM full_story_for_mango_tree", [], (err, rows) => {
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
    // CORRECTED: Removed WHERE clause to return all 30 needs, sponsored or not.
    db.all("SELECT * FROM full_story_for_mango_tree LIMIT 30", [], (err, rows) => {
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
    db.run(`UPDATE full_story_for_mango_tree SET sponsored = 1 WHERE id = ?`, id, function (err) {
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

startServer();
