const express = require("express");
const pool = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/sambutan - publik
router.get("/", async (req, res) => {
  try {
    const [[row]] = await pool.query("SELECT * FROM sambutan WHERE id = 1");
    res.json(row || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil data sambutan." });
  }
});

// PUT /api/sambutan - admin
router.put("/", requireAdmin, async (req, res) => {
  const { namaKepalaDesa, jabatan, fotoUrl, pesan } = req.body;
  try {
    await pool.query(
      `INSERT INTO sambutan (id, nama_kepala_desa, jabatan, foto_url, pesan) VALUES (1, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE nama_kepala_desa=?, jabatan=?, foto_url=?, pesan=?`,
      [namaKepalaDesa, jabatan, fotoUrl, pesan, namaKepalaDesa, jabatan, fotoUrl, pesan]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menyimpan sambutan." });
  }
});

module.exports = router;
