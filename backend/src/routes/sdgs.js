const express = require("express");
const pool = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/sdgs - publik
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM sdgs ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil data SDGs." });
  }
});

// POST /api/sdgs - admin
router.post("/", requireAdmin, async (req, res) => {
  const { goal, pct } = req.body;
  try {
    const [result] = await pool.query("INSERT INTO sdgs (goal, pct) VALUES (?, ?)", [goal, pct || 0]);
    res.status(201).json({ id: result.insertId, goal, pct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menambah tujuan SDGs." });
  }
});

// PUT /api/sdgs/:id - admin
router.put("/:id", requireAdmin, async (req, res) => {
  const { goal, pct } = req.body;
  try {
    await pool.query("UPDATE sdgs SET goal = ?, pct = ? WHERE id = ?", [goal, pct || 0, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal memperbarui tujuan SDGs." });
  }
});

// DELETE /api/sdgs/:id - admin
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM sdgs WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menghapus tujuan SDGs." });
  }
});

module.exports = router;