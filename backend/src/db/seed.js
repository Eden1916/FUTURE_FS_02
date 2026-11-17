/**
 * Seed script: creates the schema and inserts a default admin.
 * Run once: node src/db/seed.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
// Fallback: also try one level up in case directory depth differs
if (!process.env.DB_PASSWORD) {
  require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
}
const fs = require('fs');
const path = require('path');
const pool = require('./index');
const bcrypt = require('bcryptjs');

async function seed() {
  const client = await pool.connect();
  try {
    // Apply schema
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(sql);
    console.log('✅  Schema applied');

    // Create default admin
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123';
    const name = 'Super Admin';

    const existing = await client.query('SELECT id FROM admins WHERE email = $1', [email]);
    if (existing.rows.length === 0) {
      const hash = await bcrypt.hash(password, 12);
      await client.query(
        'INSERT INTO admins (name, email, password_hash) VALUES ($1, $2, $3)',
        [name, email, hash]
      );
      console.log(`✅  Admin created: ${email} / ${password}`);
    } else {
      console.log('ℹ️   Admin already exists, skipping.');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
