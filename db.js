const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'recipes.db');

function initializeDatabase() {
    const db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            console.log('Connected to SQLite database.');
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS recipes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                short_description TEXT,
                image_url TEXT,
                ingredients TEXT NOT NULL,
                instructions TEXT NOT NULL,
                user_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`);
            console.log('Tables checked/created.');

            db.run("ALTER TABLE recipes ADD COLUMN image_url TEXT", (err) => {
                if (err && !err.message.includes("duplicate column name: image_url")) {
                    console.error("Error adding image_url column:", err.message);
                } else if (!err) {
                    console.log("Column 'image_url' successfully added to 'recipes' table.");
                }
            });
        }
    });
    return db;
}

module.exports = {
    initializeDatabase
};