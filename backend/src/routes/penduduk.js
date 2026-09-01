const express = require("express");
const pool = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/dusun - publik
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM dusun ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil data penduduk." });
  }
});

// POST /api/dusun - admin, tambah dusun baru
router.post("/", requireAdmin, async (req, res) => {
  const { name, laki, perempuan } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO dusun (name, laki, perempuan) VALUES (?, ?, ?)",
      [name, laki || 0, perempuan || 0]
    );
    res.status(201).json({ id: result.insertId, name, laki, perempuan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menambah dusun." });
  }
});

// PUT /api/dusun/:id - admin
router.put("/:id", requireAdmin, async (req, res) => {
  const { name, laki, perempuan } = req.body;
  try {
    await pool.query(
      "UPDATE dusun SET name = ?, laki = ?, perempuan = ? WHERE id = ?",
      [name, laki || 0, perempuan || 0, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal memperbarui dusun." });
  }
});

// DELETE /api/dusun/:id - admin
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM dusun WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menghapus dusun." });
  }
});

module.exports = router;