-- PhoneLab — Veritabanı Başlangıç Şeması
-- charset: utf8mb4 (Türkçe karakter desteği)

CREATE DATABASE IF NOT EXISTS phonelab CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci;
USE phonelab;

CREATE TABLE IF NOT EXISTS devices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  brand VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_brand (brand)
) CHARACTER SET utf8mb4;

CREATE TABLE IF NOT EXISTS prices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id INT NOT NULL,
  issue_type VARCHAR(100) NOT NULL,
  condition_type VARCHAR(50) NOT NULL,
  min_price DECIMAL(10,2) NOT NULL,
  max_price DECIMAL(10,2) NOT NULL,
  estimated_days TINYINT DEFAULT 1,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  INDEX idx_device_issue (device_id, issue_type)
) CHARACTER SET utf8mb4;

CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  device_id INT,
  issue_description TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status ENUM('pending','confirmed','completed','cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL
) CHARACTER SET utf8mb4;

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4;

-- Örnek cihaz verileri
INSERT INTO devices (brand, model) VALUES
  ('Apple', 'iPhone 15 Pro Max'),
  ('Apple', 'iPhone 15 Pro'),
  ('Apple', 'iPhone 15'),
  ('Apple', 'iPhone 14 Pro Max'),
  ('Apple', 'iPhone 14 Pro'),
  ('Apple', 'iPhone 14'),
  ('Apple', 'iPhone 13'),
  ('Apple', 'iPhone 12'),
  ('Samsung', 'Galaxy S24 Ultra'),
  ('Samsung', 'Galaxy S24'),
  ('Samsung', 'Galaxy S23'),
  ('Samsung', 'Galaxy A54'),
  ('Xiaomi', 'Xiaomi 14'),
  ('Xiaomi', 'Redmi Note 13');

-- Örnek fiyat verileri (iPhone 15 için)
INSERT INTO prices (device_id, issue_type, condition_type, min_price, max_price, estimated_days) VALUES
  (3, 'screen_broken', 'working', 1200.00, 1500.00, 1),
  (3, 'screen_broken', 'partial', 1200.00, 1800.00, 2),
  (3, 'battery', 'working', 600.00, 800.00, 1),
  (3, 'charging_port', 'working', 400.00, 600.00, 1),
  (3, 'camera', 'working', 800.00, 1200.00, 3);
