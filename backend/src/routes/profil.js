const express = require("express");
const pool = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/profil - publik
router.get("/", async (req, res) => {
  try {
    const [[profil]] = await pool.query("SELECT * FROM profil_desa WHERE id = 1");
    const [misi] = await pool.query("SELECT teks FROM profil_misi ORDER BY urutan ASC");
    const [struktur] = await pool.query("SELECT urutan, jabatan, nama, foto_url FROM profil_struktur ORDER BY urutan ASC");

    res.json({
      ...profil,
      misi: misi.map((m) => m.teks),
      struktur, // [{ urutan, jabatan, nama, foto_url }]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil data profil." });
  }
});

// PUT /api/profil - admin
router.put("/", requireAdmin, async (req, res) => {
  const {
    nama, kecamatan, sejarah, visi, luas, jumlahDusun, rtRw, ketinggian,
    jumlahKk, pendudukSementara, mutasiPenduduk, latitude, longitude,
    bannerUrl, fotoProfilUrl, logoUrl,
    misi, struktur,
  } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO profil_desa
         (id, nama, kecamatan, sejarah, visi, luas, jumlah_dusun, rt_rw, ketinggian, jumlah_kk, penduduk_sementara, mutasi_penduduk, latitude, longitude, banner_url, foto_profil_url, logo_url)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         nama=?, kecamatan=?, sejarah=?, visi=?, luas=?, jumlah_dusun=?, rt_rw=?, ketinggian=?,
         jumlah_kk=?, penduduk_sementara=?, mutasi_penduduk=?, latitude=?, longitude=?, banner_url=?, foto_profil_url=?, logo_url=?`,
      [
        nama, kecamatan, sejarah, visi, luas, jumlahDusun, rtRw, ketinggian,
        jumlahKk || 0, pendudukSementara || 0, mutasiPenduduk || 0, latitude || null, longitude || null,
        bannerUrl || "", fotoProfilUrl || "", logoUrl || "",
        nama, kecamatan, sejarah, visi, luas, jumlahDusun, rtRw, ketinggian,
        jumlahKk || 0, pendudukSementara || 0, mutasiPenduduk || 0, latitude || null, longitude || null,
        bannerUrl || "", fotoProfilUrl || "", logoUrl || "",
      ]
    );

    if (Array.isArray(misi)) {
      await conn.query("DELETE FROM profil_misi");
      for (let i = 0; i < misi.length; i++) {
        await conn.query("INSERT INTO profil_misi (urutan, teks) VALUES (?, ?)", [i, misi[i]]);
      }
    }

    // struktur: array of { jabatan, nama, fotoUrl }
    if (Array.isArray(struktur)) {
      await conn.query("DELETE FROM profil_struktur");
      for (let i = 0; i < struktur.length; i++) {
        const s = struktur[i];
        await conn.query(
          "INSERT INTO profil_struktur (urutan, jabatan, nama, foto_url) VALUES (?, ?, ?, ?)",
          [i, s.jabatan || "", s.nama || "", s.fotoUrl || s.foto_url || ""]
        );
      }
    }

    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Gagal menyimpan profil." });
  } finally {
    conn.release();
  }
});

module.exports = router;