-- PhoneLab — Sprint 5: Cihaz Alım (Buyback) talepleri tablosu.
-- Çalışan veritabanına uygulamak için:
--   sudo docker compose exec -T db mysql -u root -p phonelab < database/buyback_requests.sql
-- (init.sql yalnızca boş volume'de çalışır; mevcut DB için bu migration'ı elle uygula.)
USE phonelab;

CREATE TABLE IF NOT EXISTS buyback_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  kvkk_consent TINYINT(1) NOT NULL DEFAULT 0,
  price_group VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  storage VARCHAR(20) NOT NULL,
  screen_status VARCHAR(30) NOT NULL,
  battery_status VARCHAR(30) NOT NULL,
  cosmetic_status VARCHAR(30) NOT NULL,
  has_box_invoice TINYINT(1) NOT NULL DEFAULT 0,
  offered_price_min DECIMAL(10,2) NOT NULL,
  offered_price_max DECIMAL(10,2) NOT NULL,
  status ENUM('pending','contacted','completed','rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) CHARACTER SET utf8mb4;
