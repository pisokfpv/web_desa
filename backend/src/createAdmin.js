// Buat akun admin pertama.
// Jalankan: node src/createAdmin.js <username> <password>
require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("./db");

async function main() {
  const [, , username, password] = process.argv;
  if (!username || !password) {
    console.error("Pemakaian: node src/createAdmin.js <username> <password>");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    "INSERT INTO admin_users (username, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = ?",
    [username, hash, hash]
  );

  console.log(`Akun admin "${username}" berhasil dibuat/diperbarui.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});