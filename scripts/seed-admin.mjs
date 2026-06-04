// PhoneLab — Varsayılan admin tohumlama (container içinde çalıştırılır).
// Kullanım:
//   sudo docker compose exec nextjs node scripts/seed-admin.mjs
// İsteğe bağlı:
//   ADMIN_USERNAME=admin ADMIN_PASSWORD=YeniSifre node scripts/seed-admin.mjs
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

const USERNAME = process.env.ADMIN_USERNAME || 'admin';
const PASSWORD = process.env.ADMIN_PASSWORD || 'Phonelab2026';

const hash = await bcrypt.hash(PASSWORD, 10);

const conn = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

try {
  // username UNIQUE — varsa şifre hash'i güncellenir (idempotent)
  await conn.execute(
    `INSERT INTO admins (username, password_hash) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
    [USERNAME, hash],
  );
  console.log(`✅ Admin '${USERNAME}' tohumlandı/güncellendi.`);
} finally {
  await conn.end();
}
