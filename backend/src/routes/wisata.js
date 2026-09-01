const express = require("express");
const pool = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM wisata ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil data wisata." });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  const { nama, deskripsi, fotoUrl, lokasi } = req.body;
  if (!nama) return res.status(400).json({ error: "Nama wisata wajib diisi." });
  try {
    const [result] = await pool.query(
      "INSERT INTO wisata (nama, deskripsi, foto_url, lokasi) VALUES (?, ?, ?, ?)",
      [nama, deskripsi || "", fotoUrl || "", lokasi || ""]
    );
    res.status(201).json({ id: result.insertId, nama, deskripsi, fotoUrl, lokasi });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menambah wisata." });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  const { nama, deskripsi, fotoUrl, lokasi } = req.body;
  try {
    await pool.query(
      "UPDATE wisata SET nama = ?, deskripsi = ?, foto_url = ?, lokasi = ? WHERE id = ?",
      [nama, deskripsi, fotoUrl, lokasi, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal memperbarui wisata." });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM wisata WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menghapus wisata." });
  }
});

module.exports = router;
