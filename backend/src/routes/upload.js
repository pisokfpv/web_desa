const express = require("express");
const { requireAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

// POST /api/upload - admin, form-data field name "image"
router.post("/", requireAdmin, (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Gagal mengunggah gambar." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Tidak ada file yang diunggah." });
    }
    const url = `/uploads/${req.file.filename}`;
    res.status(201).json({ url, filename: req.file.filename });
  });
});

module.exports = router;