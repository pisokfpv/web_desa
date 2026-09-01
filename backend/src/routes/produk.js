const express = require("express");
const pool = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/produk - publik, terbaru dulu
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM produk ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil data produk." });
  }
});

// POST /api/produk - admin
router.post("/", requireAdmin, async (req, res) => {
  const { name, harga, unit, umkm, fotoUrl, nomorWa } = req.body;
  if (!name) return res.status(400).json({ error: "Nama produk wajib diisi." });
  try {
    const [result] = await pool.query(
      "INSERT INTO produk (name, harga, unit, umkm, foto_url, nomor_wa) VALUES (?, ?, ?, ?, ?, ?)",
      [name, harga || "", unit || "", umkm || "", fotoUrl || "", nomorWa || ""]
    );
    res.status(201).json({ id: result.insertId, name, harga, unit, umkm, fotoUrl, nomorWa });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menambah produk." });
  }
});

// PUT /api/produk/:id - admin
router.put("/:id", requireAdmin, async (req, res) => {
  const { name, harga, unit, umkm, fotoUrl, nomorWa } = req.body;
  try {
    await pool.query(
      "UPDATE produk SET name = ?, harga = ?, unit = ?, umkm = ?, foto_url = ?, nomor_wa = ? WHERE id = ?",
      [name, harga, unit, umkm, fotoUrl, nomorWa, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal memperbarui produk." });
  }
});

// DELETE /api/produk/:id - admin
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM produk WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menghapus produk." });
  }
});

module.exports = router;