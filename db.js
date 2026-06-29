const { Pool } = require('pg');

let pool;

if (process.env.DATABASE_URL) {
    // CI ou production : vraie base PostgreSQL
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
} else {
    // Local sans Postgres : base en mémoire via pg-mem
    const { newDb } = require('pg-mem');
    const memDb = newDb();
    const adapter = memDb.adapters.createPg();
    pool = new adapter.Pool();
}

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
