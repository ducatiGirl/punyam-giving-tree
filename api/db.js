const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('/tmp/full-story-for-mango-tree.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS full_story_for_mango_tree (
      id TEXT PRIMARY KEY,
      schoolName TEXT,
      name TEXT,
      story TEXT,
      wishlist TEXT,
      cost REAL,
      sponsored INTEGER
  )`);
});

module.exports = db;
