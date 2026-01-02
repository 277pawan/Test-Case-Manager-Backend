const { Pool } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function runMigration() {
    const client = await pool.connect();

    try {
        console.log('🔄 Running migration: add_assigned_to_column.sql');

        const migrationSQL = fs.readFileSync(
            path.join(__dirname, 'migrations', 'add_assigned_to_column.sql'),
            'utf8'
        );

        await client.query(migrationSQL);

        console.log('✅ Migration completed successfully!');
        console.log('   - Added column: assigned_to to test_cases');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration()
    .then(() => {
        console.log('\n✨ All done! You can now use the permission system.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Error:', error);
        process.exit(1);
    });
