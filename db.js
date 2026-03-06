const Database = require('better-sqlite3');
const path = require('path');

// En mode test, on utilise une base en mémoire (isolée, sans fichier)
const dbPath = process.env.NODE_ENV === 'test'
    ? ':memory:'
    : path.join(__dirname, 'events.db');

const db = new Database(dbPath);

db.exec(`
    CREATE TABLE IF NOT EXISTS events (
        id    INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT    NOT NULL,
        date  TEXT    NOT NULL
    )
`);

module.exports = db;
