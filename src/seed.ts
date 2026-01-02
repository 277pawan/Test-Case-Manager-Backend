import bcrypt from 'bcrypt';
import { pool } from './config/db';

async function seed() {
    try {
        console.log('🌱 Seeding database...');

        // Check if admin already exists
        const adminCheck = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@testmanager.com']);

        if (adminCheck.rows.length > 0) {
            console.log('✅ Admin user already exists');
            return;
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash('Admin@123', 10);

        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
            ['admin', 'admin@testmanager.com', hashedPassword, 'admin']
        );

        console.log('✅ Admin user created successfully!');
        console.log('📧 Email: admin@testmanager.com');
        console.log('🔑 Password: Admin@123');
        console.log('👤 Role: admin');
        console.log('\n⚠️  Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seed();
