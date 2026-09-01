const express = require("express");
const pool = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/idm - publik
router.get("/", async (req, res) => {
  try {
    const [[row]] = await pool.query("SELECT * FROM idm WHERE id = 1");
    res.json(row || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil data IDM." });
  }
});

// PUT /api/idm - admin
router.put("/", requireAdmin, async (req, res) => {
  const { score, status, iks, ike, ikl } = req.body;
  try {
    await pool.query(
      `INSERT INTO idm (id, score, status, iks, ike, ikl) VALUES (1, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE score=?, status=?, iks=?, ike=?, ikl=?`,
      [score, status, iks, ike, ikl, score, status, iks, ike, ikl]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menyimpan data IDM." });
  }
});

module.exports = router;