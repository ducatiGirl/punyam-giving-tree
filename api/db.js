const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/needs.db'); // Change to a file path

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS needs (
      id TEXT PRIMARY KEY,
      schoolName TEXT,
      name TEXT,
      story TEXT,
      category TEXT,
      cost REAL,
      wishlist TEXT,
      sponsored INTEGER
  )`);
});

module.exports = db;