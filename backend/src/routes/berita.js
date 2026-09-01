const express = require("express");
const pool = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/berita - publik, terbaru dulu
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM berita ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil data berita." });
  }
});

// POST /api/berita - admin
router.post("/", requireAdmin, async (req, res) => {
  const { tag, title, tanggal, excerpt, fotoUrl } = req.body;
  if (!title) return res.status(400).json({ error: "Judul wajib diisi." });
  try {
    const [result] = await pool.query(
      "INSERT INTO berita (tag, title, tanggal, excerpt, foto_url) VALUES (?, ?, ?, ?, ?)",
      [tag || "Umum", title, tanggal || "", excerpt || "", fotoUrl || ""]
    );
    res.status(201).json({ id: result.insertId, tag, title, tanggal, excerpt, fotoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menambah berita." });
  }
});

// PUT /api/berita/:id - admin
router.put("/:id", requireAdmin, async (req, res) => {
  const { tag, title, tanggal, excerpt, fotoUrl } = req.body;
  try {
    await pool.query(
      "UPDATE berita SET tag = ?, title = ?, tanggal = ?, excerpt = ?, foto_url = ? WHERE id = ?",
      [tag, title, tanggal, excerpt, fotoUrl, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal memperbarui berita." });
  }
});

// DELETE /api/berita/:id - admin
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM berita WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menghapus berita." });
  }
});

module.exports = router;