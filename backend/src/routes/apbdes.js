const express = require("express");
const pool = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/apbdes - publik, mengembalikan pendapatan, belanja, dan pembiayaan sekaligus
router.get("/", async (req, res) => {
  try {
    const [pendapatan] = await pool.query("SELECT id, name, value FROM apbdes_pendapatan ORDER BY id ASC");
    const [belanja] = await pool.query("SELECT id, name, value FROM apbdes_belanja ORDER BY id ASC");
    const [[pembiayaan]] = await pool.query("SELECT penerimaan, pengeluaran FROM apbdes_pembiayaan WHERE id = 1");
    res.json({ pendapatan, belanja, pembiayaan: pembiayaan || { penerimaan: 0, pengeluaran: 0 } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil data APBDes." });
  }
});

// PUT /api/apbdes/pembiayaan - admin, update penerimaan & pengeluaran pembiayaan
router.put("/pembiayaan", requireAdmin, async (req, res) => {
  const { penerimaan, pengeluaran } = req.body;
  try {
    await pool.query(
      `INSERT INTO apbdes_pembiayaan (id, penerimaan, pengeluaran) VALUES (1, ?, ?)
       ON DUPLICATE KEY UPDATE penerimaan=?, pengeluaran=?`,
      [penerimaan || 0, pengeluaran || 0, penerimaan || 0, pengeluaran || 0]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menyimpan pembiayaan." });
  }
});

function crudFor(table) {
  const r = express.Router();

  r.post("/", requireAdmin, async (req, res) => {
    const { name, value } = req.body;
    try {
      const [result] = await pool.query(`INSERT INTO ${table} (name, value) VALUES (?, ?)`, [name, value || 0]);
      res.status(201).json({ id: result.insertId, name, value });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Gagal menambah pos anggaran." });
    }
  });

  r.put("/:id", requireAdmin, async (req, res) => {
    const { name, value } = req.body;
    try {
      await pool.query(`UPDATE ${table} SET name = ?, value = ? WHERE id = ?`, [name, value || 0, req.params.id]);
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Gagal memperbarui pos anggaran." });
    }
  });

  r.delete("/:id", requireAdmin, async (req, res) => {
    try {
      await pool.query(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Gagal menghapus pos anggaran." });
    }
  });

  return r;
}

// /api/apbdes/pendapatan/... dan /api/apbdes/belanja/...
router.use("/pendapatan", crudFor("apbdes_pendapatan"));
router.use("/belanja", crudFor("apbdes_belanja"));

module.exports = router;
