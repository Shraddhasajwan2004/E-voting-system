-- MySQL Database Schema for Voting Application

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
);

CREATE TABLE IF NOT EXISTS voters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  epic_number VARCHAR(50) UNIQUE NOT NULL,
  constituency VARCHAR(255) NOT NULL,
  polling_station VARCHAR(255) NOT NULL,
  has_voted BOOLEAN DEFAULT 0,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS candidates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  party_name VARCHAR(255) NOT NULL,
  party_symbol VARCHAR(255) NOT NULL,
  constituency VARCHAR(255) NOT NULL,
  city VARCHAR(255),
  state VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  candidate_id INT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(candidate_id) REFERENCES candidates(id)
);

CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS settings (
  setting_key VARCHAR(255) PRIMARY KEY,
  setting_value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS face_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  face_descriptor TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS constituencies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  state VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS omega_relational_matrix (
  nexus_id VARCHAR(255) PRIMARY KEY,
  alpha_entity_hash VARCHAR(255) NOT NULL,
  beta_entity_hash VARCHAR(255) NOT NULL,
  sigma_relation_vector TEXT NOT NULL,
  temporal_entanglement DATETIME DEFAULT CURRENT_TIMESTAMP
);
