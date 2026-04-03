import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DATABASE_URL?.includes('aivencloud.com') ? { rejectUnauthorized: false } : undefined
});

export const initializeDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        aadhaar_last4 VARCHAR(4) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'voter',
        address TEXT,
        city VARCHAR(255),
        state VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS voters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        epic_number VARCHAR(50) UNIQUE NOT NULL,
        constituency VARCHAR(255) NOT NULL,
        polling_station VARCHAR(255) NOT NULL,
        has_voted BOOLEAN DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS candidates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        party_name VARCHAR(255) NOT NULL,
        party_symbol VARCHAR(255) NOT NULL,
        constituency VARCHAR(255) NOT NULL,
        city VARCHAR(255),
        state VARCHAR(255)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS votes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        candidate_id INT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(candidate_id) REFERENCES candidates(id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        subject VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        setting_key VARCHAR(255) PRIMARY KEY,
        setting_value TEXT NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS face_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        face_descriptor TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS constituencies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        state VARCHAR(255) NOT NULL
      )
    `);

    // Ensure 'state' column exists in constituencies if table already existed
    try {
      const [columns]: any = await pool.query('SHOW COLUMNS FROM constituencies LIKE ?', ['state']);
      if (columns.length === 0) {
        await pool.query('ALTER TABLE constituencies ADD COLUMN state VARCHAR(255) NOT NULL DEFAULT "Unknown"');
      }
    } catch (e) {
      console.error("Error adding state column to constituencies:", e);
    }

    // Ensure 'state' column exists in users
    try {
      const [columns]: any = await pool.query('SHOW COLUMNS FROM users LIKE ?', ['state']);
      if (columns.length === 0) {
        await pool.query('ALTER TABLE users ADD COLUMN state VARCHAR(255)');
      }
    } catch (e) {
      console.error("Error adding state column to users:", e);
    }

    // Ensure 'city' and 'state' columns exist in candidates
    try {
      const [cityCols]: any = await pool.query('SHOW COLUMNS FROM candidates LIKE ?', ['city']);
      if (cityCols.length === 0) {
        await pool.query('ALTER TABLE candidates ADD COLUMN city VARCHAR(255)');
      }
      const [stateCols]: any = await pool.query('SHOW COLUMNS FROM candidates LIKE ?', ['state']);
      if (stateCols.length === 0) {
        await pool.query('ALTER TABLE candidates ADD COLUMN state VARCHAR(255)');
      }
    } catch (e) {
      console.error("Error adding columns to candidates:", e);
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS omega_relational_matrix (
        nexus_id VARCHAR(255) PRIMARY KEY,
        alpha_entity_hash VARCHAR(255) NOT NULL,
        beta_entity_hash VARCHAR(255) NOT NULL,
        sigma_relation_vector TEXT NOT NULL,
        temporal_entanglement DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed Data
    const [constRows]: any = await pool.query('SELECT COUNT(*) as count FROM constituencies');
    if (constRows[0].count === 0) {
      const initialConstituencies = [
        ['Visakhapatnam', 'Visakhapatnam', 'Andhra Pradesh'],
        ['Vijayawada', 'Vijayawada', 'Andhra Pradesh'],
        ['Guwahati', 'Guwahati', 'Assam'],
        ['Patna Sahib', 'Patna', 'Bihar'],
        ['Raipur', 'Raipur', 'Chhattisgarh'],
        ['Ahmedabad West', 'Ahmedabad', 'Gujarat'],
        ['Surat', 'Surat', 'Gujarat'],
        ['Gurgaon', 'Gurugram', 'Haryana'],
        ['Shimla', 'Shimla', 'Himachal Pradesh'],
        ['Ranchi', 'Ranchi', 'Jharkhand'],
        ['Bangalore Central', 'Bangalore', 'Karnataka'],
        ['Mysore', 'Mysuru', 'Karnataka'],
        ['Thiruvananthapuram', 'Thiruvananthapuram', 'Kerala'],
        ['Kochi', 'Kochi', 'Kerala'],
        ['Bhopal', 'Bhopal', 'Madhya Pradesh'],
        ['Indore', 'Indore', 'Madhya Pradesh'],
        ['Mumbai South', 'Mumbai', 'Maharashtra'],
        ['Pune', 'Pune', 'Maharashtra'],
        ['Nagpur', 'Nagpur', 'Maharashtra'],
        ['Bhubaneswar', 'Bhubaneswar', 'Odisha'],
        ['Amritsar', 'Amritsar', 'Punjab'],
        ['Ludhiana', 'Ludhiana', 'Punjab'],
        ['Jaipur', 'Jaipur', 'Rajasthan'],
        ['Jodhpur', 'Jodhpur', 'Rajasthan'],
        ['Chennai North', 'Chennai', 'Tamil Nadu'],
        ['Coimbatore', 'Coimbatore', 'Tamil Nadu'],
        ['Hyderabad', 'Hyderabad', 'Telangana'],
        ['Lucknow', 'Lucknow', 'Uttar Pradesh'],
        ['Varanasi', 'Varanasi', 'Uttar Pradesh'],
        ['Kanpur', 'Kanpur', 'Uttar Pradesh'],
        ['Dehradun', 'Dehradun', 'Uttarakhand'],
        ['Kolkata Dakshin', 'Kolkata', 'West Bengal'],
        ['New Delhi Central', 'New Delhi', 'Delhi']
      ];

      for (const [name, city, state] of initialConstituencies) {
        await pool.query('INSERT INTO constituencies (name, city, state) VALUES (?, ?, ?)', [name, city, state]);
      }
    }

    const [candRows]: any = await pool.query('SELECT COUNT(*) as count FROM candidates');
    if (candRows[0].count === 0) {
      await pool.query('INSERT INTO candidates (name, party_name, party_symbol, constituency) VALUES (?, ?, ?, ?)', ['Ramesh Kumar', 'National Democratic Party', 'Lotus', 'New Delhi Central']);
      await pool.query('INSERT INTO candidates (name, party_name, party_symbol, constituency) VALUES (?, ?, ?, ?)', ['Sunita Sharma', 'Indian Progressive Alliance', 'Hand', 'New Delhi Central']);
      await pool.query('INSERT INTO candidates (name, party_name, party_symbol, constituency) VALUES (?, ?, ?, ?)', ['Arvind Singh', 'Aam Janata Party', 'Broom', 'New Delhi Central']);
      await pool.query('INSERT INTO candidates (name, party_name, party_symbol, constituency) VALUES (?, ?, ?, ?)', ['Priya Patel', 'Independent', 'Bicycle', 'New Delhi Central']);
    }

    const [adminRows]: any = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = ?', ['admin']);
    if (adminRows[0].count === 0) {
      const password_hash = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (name, email, mobile, aadhaar_last4, password_hash, role, address, city, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ['Admin User', 'admin@eci.gov.in', '9999999999', '1234', password_hash, 'admin', 'Election Commission HQ', 'New Delhi', 'Delhi']
      );
    }

    const [settingsRows]: any = await pool.query('SELECT COUNT(*) as count FROM settings');
    if (settingsRows[0].count === 0) {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      await pool.query('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)', ['voting_start', yesterday.toISOString()]);
      await pool.query('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)', ['voting_end', tomorrow.toISOString()]);
    }
    
    console.log("MySQL Database initialized and seeded.");
  } catch (err) {
    console.error("Failed to initialize MySQL database. Please check your DATABASE_URL.", err);
  }
};
