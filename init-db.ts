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

    // Add renewal_date column if it doesn't exist
    const res = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name='subscriptions' and column_name='renewal_date'
    `);

    if (res.rows.length === 0) {
        await client.query(`ALTER TABLE subscriptions ADD COLUMN renewal_date INTEGER`);
    }
    
    // Add a default value to existing rows if renewal_date was just added
    await client.query(`UPDATE subscriptions SET renewal_date = 1 WHERE renewal_date IS NULL`);

    // Now, alter the column to be NOT NULL
    await client.query(`ALTER TABLE subscriptions ALTER COLUMN renewal_date SET NOT NULL`);

    await client.query(`ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS renewal_date_check`);
    await client.query(`ALTER TABLE subscriptions ADD CONSTRAINT renewal_date_check CHECK (renewal_date >= 1 AND renewal_date <= 31)`);


    console.log('Tables created and updated successfully!');
  } catch (err) {
    console.error('Error creating/updating tables:', err);
  } finally {
    client.release();
    pool.end();
  }
};

createTables();
