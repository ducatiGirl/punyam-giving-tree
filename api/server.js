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

          if (sheetData.data.length === 0) {
            console.log("No data found in Google Sheet. Database remains empty.");
            return resolve();
          }

          const headers = Object.keys(sheetData.data[0]);
          const schoolNameKey = headers.find(key => key.includes("00 School Name"));
          const needsDetailsKey = headers.find(key => key.includes("01 Needs Details"));
          const categoryKey = headers.find(key => key.includes("02 Category"));
          const costKey = headers.find(key => key.includes("03 Cost"));
          const sponsoredKey = headers.find(key => key.includes("Sponsored"));

          const stmt = db.prepare(
            "INSERT INTO full_story_for_mango_tree VALUES (?, ?, ?, ?, ?, ?, ?)"
          );
          let completed = 0;
          sheetData.data.forEach((row, index) => {
            const schoolName = row[schoolNameKey]?.replace(/^\d+\s?/, "").trim() || "";
            const nameAndStory = row[needsDetailsKey] || "";
            const parts = nameAndStory.split("--");
            const name = parts[0]?.trim() || "N/A";
            const story = parts.length > 1 ? parts.slice(1).join("--").trim() : "N/A";

            // CORRECTED: Dynamically find keys to handle unexpected characters
            const wishlist = row[categoryKey] || "N/A";
            const cost = parseFloat(row[costKey]) || 0;
            const isSponsored = row[sponsoredKey] === "TRUE" ? 1 : 0;

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
