require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Use DATABASE_URL if available (Render), otherwise use local Postgres
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // required on Render
    })
  : new Pool({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'blog_app',
      port: process.env.DB_PORT || 5432,
    });

// Connect and test
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ PostgreSQL connection error:", err);
    process.exit(1);
  } else {
    console.log("✅ PostgreSQL Connected...");
    release();
    runInitSQL();
  }
});

// Run init.sql
function runInitSQL() {
  const initPath = path.join(__dirname, '..', 'init.sql');
  fs.readFile(initPath, 'utf8', async (err, sql) => {
    if (err) {
      console.error("Error reading init.sql:", err);
      return;
    }
    try {
      await pool.query(sql);
      console.log("✅ Database tables ensured (init.sql executed).");
    } catch (err) {
      console.error("❌ Error executing init.sql:", err);
    }
  });
}

module.exports = pool;
