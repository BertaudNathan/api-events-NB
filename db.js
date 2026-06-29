const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/events'
});

const initDB = () => pool.query(`
    CREATE TABLE IF NOT EXISTS events (
        id           SERIAL  PRIMARY KEY,
        title        TEXT    NOT NULL,
        date         TEXT    NOT NULL,
        lieu         TEXT    NOT NULL,
        categorie    TEXT    NOT NULL,
        participants INTEGER NOT NULL
    )
`);

module.exports = { pool, initDB };
