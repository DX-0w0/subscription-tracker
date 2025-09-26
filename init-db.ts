
import pool from './lib/db.js';

const createTables = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        cost NUMERIC(10, 2) NOT NULL,
        billing_cycle TEXT NOT NULL,
        account_info TEXT,
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        cancelled_at TIMESTAMPTZ
      )
    `);

    console.log('Tables created successfully!');
  } catch (err) {
    console.error('Error creating tables:', err);
  } finally {
    client.release();
    pool.end();
  }
};

createTables();
