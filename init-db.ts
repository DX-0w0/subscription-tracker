
import pool from './lib/db.js';

const createTables = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
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
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        cancelled_at TIMESTAMPTZ
      )
    `);

    // Add renewal_date column if it doesn't exist
    const res = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name='subscriptions' and column_name='renewal_date'
    `);

    if (res.rows.length === 0) {
        await client.query('ALTER TABLE subscriptions ADD COLUMN renewal_date INTEGER');
    }

    // Add a default value to existing rows if renewal_date was just added
    await client.query('UPDATE subscriptions SET renewal_date = 1 WHERE renewal_date IS NULL');

    // Now, alter the column to be NOT NULL
    await client.query('ALTER TABLE subscriptions ALTER COLUMN renewal_date SET NOT NULL');

    await client.query('ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS renewal_date_check');
    await client.query('ALTER TABLE subscriptions ADD CONSTRAINT renewal_date_check CHECK (renewal_date >= 1 AND renewal_date <= 31)');

    // Add user_id to categories if it doesn't exist
    const catRes = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name='categories' and column_name='user_id'
    `);

    if (catRes.rows.length === 0) {
        await client.query('ALTER TABLE categories ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE');
    }

    // Drop the unique constraint on category name and add a composite unique constraint on name and user_id
    await client.query('ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_key');
    await client.query('ALTER TABLE categories ADD CONSTRAINT categories_name_user_id_key UNIQUE (name, user_id)');

    console.log('Tables created and updated successfully!');
  } catch (err) {
    console.error('Error creating/updating tables:', err);
  } finally {
    client.release();
    pool.end();
  }
};

createTables();
