require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const profilRoutes = require("./routes/profil");
const pendudukRoutes = require("./routes/penduduk");
const apbdesRoutes = require("./routes/apbdes");
const idmRoutes = require("./routes/idm");
const sdgsRoutes = require("./routes/sdgs");
const beritaRoutes = require("./routes/berita");
const produkRoutes = require("./routes/produk");
const sambutanRoutes = require("./routes/sambutan");
const potensiRoutes = require("./routes/potensi");
const wisataRoutes = require("./routes/wisata");
const galeriRoutes = require("./routes/galeri");
const uploadRoutes = require("./routes/upload");

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

// Folder gambar yang diunggah lewat panel admin - bisa diakses langsung, mis.
// http://localhost:4000/uploads/namafile.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/profil", profilRoutes);
app.use("/api/dusun", pendudukRoutes);
app.use("/api/apbdes", apbdesRoutes);
app.use("/api/idm", idmRoutes);
app.use("/api/sdgs", sdgsRoutes);
app.use("/api/berita", beritaRoutes);
app.use("/api/produk", produkRoutes);
app.use("/api/sambutan", sambutanRoutes);
app.use("/api/potensi", potensiRoutes);
app.use("/api/wisata", wisataRoutes);
app.use("/api/galeri", galeriRoutes);
app.use("/api/upload", uploadRoutes);

app.use((req, res) => res.status(404).json({ error: "Rute tidak ditemukan." }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API website desa berjalan di port ${PORT}`));