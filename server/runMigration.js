const pool = require('./db.js');
require('dotenv').config();

async function runMigration() {
  const connection = await pool.getConnection();
  try {
    console.log('Running migration: Increase accreditation_status column size...');
    await connection.query(`
      ALTER TABLE intake_details
      MODIFY COLUMN accreditation_status VARCHAR(200) DEFAULT NULL
    `);
    console.log('✓ Migration completed successfully');
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
  } finally {
    connection.release();
    process.exit(0);
  }
}

runMigration();
