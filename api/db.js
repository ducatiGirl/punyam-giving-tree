const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../full_story_of_mango_tree.db');

db.serialize(() => {
    // Drop the table if it already exists to ensure a clean slate.
    // This fixes schema-related errors when columns are changed or added.
    db.run(`DROP TABLE IF EXISTS mango_stories`);
    
    // This CREATE TABLE statement defines the clean and organized schema
    // that the server.js file will use after it transforms the data
    // from the Google Sheet's messy column headers.
    db.run(`CREATE TABLE IF NOT EXISTS mango_stories (
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
