const express = require("express");
const pool = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM galeri ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil data galeri." });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  const { judul, fotoUrl, tanggal } = req.body;
  if (!judul || !fotoUrl) return res.status(400).json({ error: "Judul dan URL foto wajib diisi." });
  try {
    const [result] = await pool.query(
      "INSERT INTO galeri (judul, foto_url, tanggal) VALUES (?, ?, ?)",
      [judul, fotoUrl, tanggal || ""]
    );
    res.status(201).json({ id: result.insertId, judul, fotoUrl, tanggal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menambah foto galeri." });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  const { judul, fotoUrl, tanggal } = req.body;
  try {
    await pool.query(
      "UPDATE galeri SET judul = ?, foto_url = ?, tanggal = ? WHERE id = ?",
      [judul, fotoUrl, tanggal, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal memperbarui foto galeri." });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM galeri WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menghapus foto galeri." });
  }
});

module.exports = router;
