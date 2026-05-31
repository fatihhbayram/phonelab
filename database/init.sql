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

-- Örnek cihaz verileri (Kapsamlı ve Güncel Apple Ürün Listesi)
INSERT INTO devices (brand, model) VALUES
  -- iPhone 17 Serisi
  ('Apple', 'iPhone 17 Pro Max'),
  ('Apple', 'iPhone 17 Pro'),
  ('Apple', 'iPhone 17 Air'),
  ('Apple', 'iPhone 17'),
  ('Apple', 'iPhone 17e'),
  -- iPhone 16 Serisi
  ('Apple', 'iPhone 16 Pro Max'),
  ('Apple', 'iPhone 16 Pro'),
  ('Apple', 'iPhone 16 Plus'),
  ('Apple', 'iPhone 16'),
  ('Apple', 'iPhone 16e'),
  -- iPhone 15 Serisi
  ('Apple', 'iPhone 15 Pro Max'),
  ('Apple', 'iPhone 15 Pro'),
  ('Apple', 'iPhone 15 Plus'),
  ('Apple', 'iPhone 15'),
  -- iPhone 14 Serisi
  ('Apple', 'iPhone 14 Pro Max'),
  ('Apple', 'iPhone 14 Pro'),
  ('Apple', 'iPhone 14 Plus'),
  ('Apple', 'iPhone 14'),
  -- iPhone 13 Serisi
  ('Apple', 'iPhone 13 Pro Max'),
  ('Apple', 'iPhone 13 Pro'),
  ('Apple', 'iPhone 13'),
  ('Apple', 'iPhone 13 mini'),
  -- iPhone 12 Serisi
  ('Apple', 'iPhone 12 Pro Max'),
  ('Apple', 'iPhone 12 Pro'),
  ('Apple', 'iPhone 12'),
  ('Apple', 'iPhone 12 mini'),
  -- iPhone 11 Serisi
  ('Apple', 'iPhone 11 Pro Max'),
  ('Apple', 'iPhone 11 Pro'),
  ('Apple', 'iPhone 11'),
  -- iPhone SE & Diğer Popüler Modeller
  ('Apple', 'iPhone SE (3. Nesil)'),
  ('Apple', 'iPhone SE (2. Nesil)'),
  ('Apple', 'iPhone XS Max'),
  ('Apple', 'iPhone XS'),
  ('Apple', 'iPhone XR'),
  ('Apple', 'iPhone X'),
  -- iPads
  ('Apple', 'iPad Pro 13\" (M4)'),
  ('Apple', 'iPad Pro 11\" (M4)'),
  ('Apple', 'iPad Pro 12.9\" (6. Nesil)'),
  ('Apple', 'iPad Pro 11\" (4. Nesil)'),
  ('Apple', 'iPad Air (M3)'),
  ('Apple', 'iPad Air (5. Nesil)'),
  ('Apple', 'iPad (10. Nesil)'),
  ('Apple', 'iPad (9. Nesil)'),
  ('Apple', 'iPad mini (6. Nesil)'),
  -- Apple Watches
  ('Apple', 'Apple Watch Ultra 3'),
  ('Apple', 'Apple Watch Ultra 2'),
  ('Apple', 'Apple Watch Ultra'),
  ('Apple', 'Apple Watch Series 11'),
  ('Apple', 'Apple Watch Series 10'),
  ('Apple', 'Apple Watch Series 9'),
  ('Apple', 'Apple Watch Series 8'),
  ('Apple', 'Apple Watch Series 7'),
  ('Apple', 'Apple Watch SE (3. Nesil)'),
  ('Apple', 'Apple Watch SE (2. Nesil)');

