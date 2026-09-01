const express = require("express");
const pool = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM potensi ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil data potensi." });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  const { judul, deskripsi, fotoUrl } = req.body;
  if (!judul) return res.status(400).json({ error: "Judul wajib diisi." });
  try {
    const [result] = await pool.query(
      "INSERT INTO potensi (judul, deskripsi, foto_url) VALUES (?, ?, ?)",
      [judul, deskripsi || "", fotoUrl || ""]
    );
    res.status(201).json({ id: result.insertId, judul, deskripsi, fotoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menambah potensi." });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  const { judul, deskripsi, fotoUrl } = req.body;
  try {
    await pool.query(
      "UPDATE potensi SET judul = ?, deskripsi = ?, foto_url = ? WHERE id = ?",
      [judul, deskripsi, fotoUrl, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal memperbarui potensi." });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM potensi WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menghapus potensi." });
  }
});

module.exports = router;
