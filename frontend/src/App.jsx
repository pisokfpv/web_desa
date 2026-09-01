import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

// ---------- API ----------
const API_BASE = "/api";

async function apiRequest(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Terjadi kesalahan pada server.");
  return json;
}

// ---------- Theme ----------
const theme = {
  bg: "#FAF9F4",
  panel: "#FFFFFF",
  pine: "#1F3B2C",
  pineSoft: "#2F5540",
  gold: "#B8862E",
  goldSoft: "#EFE1C4",
  clay: "#B5583A",
  text: "#1A1A18",
  textSoft: "#5C5C56",
  line: "#E4E1D6",
  danger: "#B5583A",
};
const pieColors = [theme.pine, theme.pineSoft, theme.gold, theme.clay, "#8A8A80"];

// ---------- Small building blocks ----------
function Stat({ label, value, sub }) {
  return (
    <div style={{ background: theme.panel, border: `0.5px solid ${theme.line}`, borderRadius: 14, padding: "1.1rem 1.25rem" }}>
      <p style={{ margin: 0, fontSize: 13, color: theme.textSoft }}>{label}</p>
      <p style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 500, color: theme.text }}>{value}</p>
      {sub && <p style={{ margin: "2px 0 0", fontSize: 12.5, color: theme.textSoft }}>{sub}</p>}
    </div>
  );
}

function SectionHeading({ eyebrow, title, desc }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      {eyebrow && <p style={{ margin: "0 0 4px", fontSize: 13, color: theme.gold, fontWeight: 500 }}>{eyebrow}</p>}
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 500, color: theme.text, fontFamily: "'Sora', sans-serif" }}>{title}</h2>
      {desc && <p style={{ margin: "6px 0 0", fontSize: 14.5, color: theme.textSoft, maxWidth: 560 }}>{desc}</p>}
    </div>
  );
}

const inputStyle = { width: "100%", fontSize: 13.5, padding: "8px 10px", borderRadius: 8, border: `0.5px solid ${theme.line}`, background: theme.bg, color: theme.text };
const labelStyle = { display: "block", fontSize: 12, color: theme.textSoft, margin: "0 0 4px" };
const fieldWrap = { marginBottom: 12 };

function Field({ label, ...props }) {
  return (
    <div style={fieldWrap}>
      <label style={labelStyle}>{label}</label>
      <input style={inputStyle} {...props} />
    </div>
  );
}
function ErrorText({ children }) {
  return <p style={{ fontSize: 12.5, color: theme.danger, margin: "0 0 12px" }}>{children}</p>;
}
function PrimaryBtn({ children, ...props }) {
  return (
    <button {...props} style={{ fontSize: 13, fontWeight: 500, background: theme.pine, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", opacity: props.disabled ? 0.6 : 1 }}>
      {children}
    </button>
  );
}
function GhostBtn({ children, danger, ...props }) {
  return (
    <button {...props} style={{ fontSize: 12.5, background: "transparent", color: danger ? theme.danger : theme.textSoft, border: `0.5px solid ${danger ? theme.danger : theme.line}`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", opacity: props.disabled ? 0.6 : 1 }}>
      {children}
    </button>
  );
}

function ImageUploadField({ label, value, onChange, token, compact }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Gagal mengunggah gambar.");
      onChange(json.url);
    } catch (err) {
      setError(err.message);
    }
    setUploading(false);
    e.target.value = "";
  };

  const thumbSize = compact ? 44 : 56;

  return (
    <div style={compact ? {} : fieldWrap}>
      {label && <label style={labelStyle}>{label}</label>}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {value ? (
          <img src={value} alt="" style={{ width: thumbSize, height: thumbSize, borderRadius: 8, objectFit: "cover", border: `0.5px solid ${theme.line}`, flexShrink: 0 }} />
        ) : (
          <div style={{ width: thumbSize, height: thumbSize, borderRadius: 8, background: theme.goldSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: theme.textSoft, textAlign: "center", flexShrink: 0 }}>Tanpa foto</div>
        )}
        <div>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
          <GhostBtn onClick={() => inputRef.current?.click()} disabled={uploading}>{uploading ? "Mengunggah…" : value ? "Ganti foto" : "Unggah foto"}</GhostBtn>
          {value && <GhostBtn danger onClick={() => onChange("")} style={{ marginLeft: 6 }}>Hapus</GhostBtn>}
        </div>
      </div>
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

// ---------- Shared helpers for new Beranda sections ----------
function Avatar({ name, url, size = 56 }) {
  if (url) {
    return <img src={url} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", background: theme.goldSoft }} />;
  }
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: theme.pineSoft, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4, fontWeight: 500, fontFamily: "'Sora', sans-serif" }}>
      {initial}
    </div>
  );
}
function IconStat({ icon, label, value }) {
  return (
    <div style={{ background: theme.panel, border: `0.5px solid ${theme.line}`, borderRadius: 14, padding: "1rem", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: theme.goldSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ margin: 0, fontSize: 20, fontWeight: 500, color: theme.text }}>{value.toLocaleString("id-ID")}</p>
        <p style={{ margin: 0, fontSize: 12, color: theme.textSoft }}>{label}</p>
      </div>
    </div>
  );
}
function PhotoCard({ image, title, subtitle, tag }) {
  return (
    <div style={{ background: theme.panel, border: `0.5px solid ${theme.line}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ height: 130, background: theme.goldSoft, backgroundImage: image ? `url(${image})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div style={{ padding: "0.9rem 1rem" }}>
        {tag && <span style={{ fontSize: 11, fontWeight: 500, color: theme.gold, background: theme.goldSoft, padding: "2px 8px", borderRadius: 99 }}>{tag}</span>}
        <p style={{ margin: "8px 0 0", fontSize: 14, fontWeight: 500, color: theme.text }}>{title}</p>
        {subtitle && <p style={{ margin: "4px 0 0", fontSize: 12.5, color: theme.textSoft, lineHeight: 1.5 }}>{subtitle}</p>}
      </div>
    </div>
  );
}

// ---------- Public pages ----------
function Home({ go, data }) {
  const totalPenduduk = data.dusun.reduce((s, d) => s + d.laki + d.perempuan, 0);
  const totalAPBDes = data.apbdesPendapatan.reduce((s, d) => s + Number(d.value), 0);
  const totalPendapatan = data.apbdesPendapatan.reduce((s, d) => s + Number(d.value), 0);
  const totalBelanja = data.apbdesBelanja.reduce((s, d) => s + Number(d.value), 0);
  const penerimaan = Number(data.apbdesPembiayaan?.penerimaan) || 0;
  const pengeluaran = Number(data.apbdesPembiayaan?.pengeluaran) || 0;
  const surplus = (totalPendapatan - totalBelanja) + (penerimaan - pengeluaran);
  const cards = [
    { key: "profil", title: "Profil Desa", desc: "Sejarah, geografis, visi misi, dan struktur pemerintahan desa." },
    { key: "infografis", title: "Infografis", desc: `Data penduduk, APBDes, IDM ${Number(data.idm.score).toFixed(2)}, dan capaian SDGs Desa.` },
    { key: "berita", title: "Berita", desc: `${data.berita.length} kabar terbaru seputar kegiatan dan pembangunan desa.` },
    { key: "belanja", title: "Belanja", desc: `${data.produk.length} produk UMKM warga siap dipesan langsung.` },
  ];
  return (
    <div>
      <div style={{ padding: "3rem 0 2.5rem", borderBottom: `0.5px solid ${theme.line}` }}>
        {data.profil.banner_url && (
          <div style={{ borderRadius: 16, overflow: "hidden", height: 260, marginBottom: 28, backgroundImage: `url(${data.profil.banner_url})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        )}
        <p style={{ margin: "0 0 10px", fontSize: 13, color: theme.gold, fontWeight: 500 }}>Website Resmi</p>
        <h1 style={{ margin: 0, fontSize: 40, lineHeight: 1.15, fontWeight: 500, color: theme.text, fontFamily: "'Sora', sans-serif", maxWidth: 620 }}>
          {data.profil.nama}, {data.profil.kecamatan}
        </h1>
        <p style={{ marginTop: 14, fontSize: 16, color: theme.textSoft, maxWidth: 520, lineHeight: 1.6 }}>
          Transparan dalam anggaran, terbuka dalam informasi, dan dekat dengan warganya. Semua data dan kegiatan desa tersedia di sini.
        </p>
        <div style={{ display: "flex", gap: 24, marginTop: 28, flexWrap: "wrap" }}>
          <div><p style={{ margin: 0, fontSize: 24, fontWeight: 500 }}>{totalPenduduk.toLocaleString("id-ID")}</p><p style={{ margin: 0, fontSize: 12.5, color: theme.textSoft }}>Jiwa</p></div>
          <div><p style={{ margin: 0, fontSize: 24, fontWeight: 500 }}>{Number(data.idm.score).toFixed(2)}</p><p style={{ margin: 0, fontSize: 12.5, color: theme.textSoft }}>Skor IDM · {data.idm.status}</p></div>
          <div><p style={{ margin: 0, fontSize: 24, fontWeight: 500 }}>Rp {(totalAPBDes / 1000).toFixed(2)} M</p><p style={{ margin: 0, fontSize: 12.5, color: theme.textSoft }}>APBDes 2026</p></div>
        </div>
      </div>

      <div style={{ padding: "2.5rem 0" }}>
        <SectionHeading eyebrow="Jelajahi" title="Ringkasan halaman" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {cards.map((c) => (
            <button key={c.key} onClick={() => go(c.key)} style={{ textAlign: "left", cursor: "pointer", background: theme.panel, border: `0.5px solid ${theme.line}`, borderRadius: 14, padding: "1.25rem" }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: theme.text }}>{c.title}</p>
              <p style={{ margin: "8px 0 0", fontSize: 13.5, color: theme.textSoft, lineHeight: 1.55 }}>{c.desc}</p>
              <p style={{ margin: "14px 0 0", fontSize: 13, color: theme.pine, fontWeight: 500 }}>Buka halaman →</p>
            </button>
          ))}
        </div>
      </div>

      {data.sambutan?.pesan && (
        <div style={{ padding: "2.5rem 0", borderTop: `0.5px solid ${theme.line}` }}>
          <SectionHeading eyebrow="Kata Sambutan" title="Sambutan Kepala Desa" />
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", background: theme.panel, border: `0.5px solid ${theme.line}`, borderRadius: 14, padding: "1.5rem" }}>
            <Avatar name={data.sambutan.nama_kepala_desa} url={data.sambutan.foto_url} size={64} />
            <div>
              <p style={{ fontSize: 14.5, color: theme.textSoft, lineHeight: 1.75, margin: "0 0 12px", fontStyle: "italic" }}>“{data.sambutan.pesan}”</p>
              <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{data.sambutan.nama_kepala_desa}</p>
              <p style={{ fontSize: 12.5, color: theme.textSoft, margin: 0 }}>{data.sambutan.jabatan}</p>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: "2.5rem 0", borderTop: `0.5px solid ${theme.line}` }}>
        <SectionHeading eyebrow="Kependudukan" title="Administrasi Penduduk" desc="Data kependudukan terkini Desa Sukamaju." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <IconStat icon="👥" label="Total Penduduk" value={totalPenduduk} />
          <IconStat icon="👨" label="Laki-laki" value={data.dusun.reduce((s, d) => s + d.laki, 0)} />
          <IconStat icon="👩" label="Perempuan" value={data.dusun.reduce((s, d) => s + d.perempuan, 0)} />
          <IconStat icon="🏠" label="Kepala Keluarga" value={Number(data.profil.jumlah_kk) || 0} />
          <IconStat icon="🧳" label="Penduduk Sementara" value={Number(data.profil.penduduk_sementara) || 0} />
          <IconStat icon="🔁" label="Mutasi Penduduk" value={Number(data.profil.mutasi_penduduk) || 0} />
        </div>
      </div>

      {data.profil.struktur?.length > 0 && (
        <div style={{ padding: "2.5rem 0", borderTop: `0.5px solid ${theme.line}` }}>
          <SectionHeading eyebrow="Pemerintahan" title="Struktur Organisasi (SOTK)" desc="Perangkat Desa Sukamaju." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
            {data.profil.struktur.map((s, i) => (
              <div key={i} style={{ background: theme.panel, border: `0.5px solid ${theme.line}`, borderRadius: 14, padding: "1.1rem", textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                  <Avatar name={s.nama || s.jabatan} url={s.foto_url} />
                </div>
                <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500 }}>{s.nama || "—"}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: theme.textSoft }}>{s.jabatan}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.profil.latitude && data.profil.longitude && (
        <div style={{ padding: "2.5rem 0", borderTop: `0.5px solid ${theme.line}` }}>
          <SectionHeading eyebrow="Lokasi" title="Peta Desa" />
          <div style={{ borderRadius: 14, overflow: "hidden", border: `0.5px solid ${theme.line}` }}>
            <iframe
              title="Peta Desa"
              width="100%"
              height="300"
              style={{ border: 0, display: "block" }}
              src={`https://www.google.com/maps?q=${data.profil.latitude},${data.profil.longitude}&output=embed`}
            />
          </div>
        </div>
      )}

      <div style={{ padding: "2.5rem 0", borderTop: `0.5px solid ${theme.line}` }}>
        <SectionHeading eyebrow="Transparansi" title="APB Desa" desc="Akses cepat terhadap anggaran pendapatan dan belanja desa." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 14 }}>
          <Stat label="Pendapatan" value={`Rp ${totalPendapatan.toLocaleString("id-ID")} jt`} />
          <Stat label="Belanja" value={`Rp ${totalBelanja.toLocaleString("id-ID")} jt`} />
          <Stat label="Penerimaan Pembiayaan" value={`Rp ${penerimaan.toLocaleString("id-ID")} jt`} />
          <Stat label="Pengeluaran Pembiayaan" value={`Rp ${pengeluaran.toLocaleString("id-ID")} jt`} />
        </div>
        <div style={{ background: theme.pine, borderRadius: 14, padding: "1.1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ color: "#fff", fontSize: 13.5 }}>Surplus / Defisit {surplus < 0 ? "(defisit)" : ""}</span>
          <span style={{ color: "#fff", fontSize: 18, fontWeight: 500 }}>Rp {surplus.toLocaleString("id-ID")} jt</span>
        </div>
        <button onClick={() => go("infografis")} style={{ marginTop: 14, fontSize: 13, color: theme.pine, background: "transparent", border: "none", cursor: "pointer", fontWeight: 500, padding: 0 }}>Lihat detail infografis →</button>
      </div>

      {data.potensi?.length > 0 && (
        <div style={{ padding: "2.5rem 0", borderTop: `0.5px solid ${theme.line}` }}>
          <SectionHeading eyebrow="Ekonomi Lokal" title="Potensi Desa" desc="Sumber daya dan kegiatan unggulan warga." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {data.potensi.map((p) => <PhotoCard key={p.id} image={p.foto_url} title={p.judul} subtitle={p.deskripsi} />)}
          </div>
        </div>
      )}

      {data.wisata?.length > 0 && (
        <div style={{ padding: "2.5rem 0", borderTop: `0.5px solid ${theme.line}` }}>
          <SectionHeading eyebrow="Kunjungi" title="Wisata Desa" desc="Titik-titik wisata di sekitar desa." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {data.wisata.map((w) => <PhotoCard key={w.id} image={w.foto_url} title={w.nama} subtitle={w.deskripsi} tag={w.lokasi} />)}
          </div>
        </div>
      )}

      {data.berita.length > 0 && (
        <div style={{ padding: "2.5rem 0", borderTop: `0.5px solid ${theme.line}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <SectionHeading eyebrow="Kabar Desa" title="Berita Desa" desc="Informasi terbaru seputar kegiatan dan pembangunan desa." />
            <button onClick={() => go("berita")} style={{ fontSize: 13, color: theme.pine, background: "transparent", border: "none", cursor: "pointer", fontWeight: 500, marginBottom: 24 }}>Lihat semua →</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {data.berita.slice(0, 3).map((b) => <PhotoCard key={b.id} image={b.foto_url} title={b.title} subtitle={b.excerpt} tag={b.tag} />)}
          </div>
        </div>
      )}

      {data.produk.length > 0 && (
        <div style={{ padding: "2.5rem 0", borderTop: `0.5px solid ${theme.line}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <SectionHeading eyebrow="UMKM Desa" title="Beli dari Desa" desc="Produk unggulan warga siap dipesan langsung." />
            <button onClick={() => go("belanja")} style={{ fontSize: 13, color: theme.pine, background: "transparent", border: "none", cursor: "pointer", fontWeight: 500, marginBottom: 24 }}>Lihat semua →</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {data.produk.slice(0, 3).map((p) => <PhotoCard key={p.id} image={p.foto_url} title={p.name} subtitle={`${p.harga}${p.unit} · ${p.umkm}`} />)}
          </div>
        </div>
      )}

      {data.galeri?.length > 0 && (
        <div style={{ padding: "2.5rem 0", borderTop: `0.5px solid ${theme.line}` }}>
          <SectionHeading eyebrow="Dokumentasi" title="Galeri Desa" desc="Kegiatan-kegiatan yang berlangsung di desa." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            {data.galeri.map((g) => <PhotoCard key={g.id} image={g.foto_url} title={g.judul} subtitle={g.tanggal} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfilDesa({ profil }) {
  return (
    <div style={{ padding: "2.5rem 0" }}>
      <SectionHeading eyebrow="Tentang Kami" title={`Profil ${profil.nama}`} desc="Mengenal sejarah, wilayah, dan arah pembangunan desa." />
      {profil.foto_profil_url && (
        <div style={{ borderRadius: 16, overflow: "hidden", height: 240, marginBottom: 28, backgroundImage: `url(${profil.foto_profil_url})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 32 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 500, margin: "0 0 8px" }}>Sejarah singkat</h3>
          <p style={{ fontSize: 14.5, color: theme.textSoft, lineHeight: 1.75, margin: "0 0 20px" }}>{profil.sejarah}</p>
          <h3 style={{ fontSize: 15, fontWeight: 500, margin: "0 0 8px" }}>Visi</h3>
          <p style={{ fontSize: 14.5, color: theme.textSoft, lineHeight: 1.75, margin: "0 0 20px" }}>{profil.visi}</p>
          <h3 style={{ fontSize: 15, fontWeight: 500, margin: "0 0 8px" }}>Misi</h3>
          <ul style={{ fontSize: 14.5, color: theme.textSoft, lineHeight: 1.9, margin: 0, paddingLeft: 18 }}>
            {(profil.misi || []).map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
        <div>
          <div style={{ background: theme.panel, border: `0.5px solid ${theme.line}`, borderRadius: 14, padding: "1.25rem", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 500, margin: "0 0 12px" }}>Data wilayah</h3>
            {[["Luas wilayah", profil.luas], ["Jumlah dusun", profil.jumlah_dusun], ["Jumlah RT/RW", profil.rt_rw], ["Ketinggian", profil.ketinggian]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderTop: `0.5px solid ${theme.line}`, fontSize: 13.5 }}>
                <span style={{ color: theme.textSoft }}>{k}</span><span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ background: theme.panel, border: `0.5px solid ${theme.line}`, borderRadius: 14, padding: "1.25rem" }}>
            <h3 style={{ fontSize: 15, fontWeight: 500, margin: "0 0 12px" }}>Struktur pemerintahan</h3>
            {(profil.struktur || []).map((r, i) => (
              <div key={i} style={{ padding: "7px 0", borderTop: `0.5px solid ${theme.line}`, fontSize: 13.5, color: theme.textSoft, display: "flex", justifyContent: "space-between" }}>
                <span>{r.jabatan}</span>
                {r.nama && <span style={{ color: theme.text, fontWeight: 500 }}>{r.nama}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Infografis({ data }) {
  const { dusun, apbdesPendapatan, apbdesBelanja, idm, sdgs } = data;
  const totalPenduduk = dusun.reduce((s, d) => s + d.laki + d.perempuan, 0);
  const totalLaki = dusun.reduce((s, d) => s + d.laki, 0);
  const totalPerempuan = dusun.reduce((s, d) => s + d.perempuan, 0);

  return (
    <div style={{ padding: "2.5rem 0" }}>
      <SectionHeading eyebrow="Data Desa" title="Infografis" desc="Data ini diambil langsung dari server dan bisa diperbarui lewat halaman Admin." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        <Stat label="Total penduduk" value={totalPenduduk.toLocaleString("id-ID")} sub={`${totalLaki} laki-laki · ${totalPerempuan} perempuan`} />
        <Stat label="Jumlah dusun" value={dusun.length} />
        <Stat label="Skor IDM" value={Number(idm.score).toFixed(4)} sub={`Status: ${idm.status}`} />
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 500, margin: "0 0 10px" }}>Penduduk per dusun</h3>
      <div style={{ background: theme.panel, border: `0.5px solid ${theme.line}`, borderRadius: 14, padding: "1rem", marginBottom: 28, height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dusun} barGap={4}>
            <CartesianGrid stroke={theme.line} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: theme.textSoft }} axisLine={{ stroke: theme.line }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: theme.textSoft }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `0.5px solid ${theme.line}` }} />
            <Bar dataKey="laki" name="Laki-laki" fill={theme.pine} radius={[4, 4, 0, 0]} />
            <Bar dataKey="perempuan" name="Perempuan" fill={theme.gold} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 500, margin: "0 0 10px" }}>APBDes 2026 — Pendapatan</h3>
          <div style={{ background: theme.panel, border: `0.5px solid ${theme.line}`, borderRadius: 14, padding: "1rem", height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={apbdesPendapatan} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {apbdesPendapatan.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `Rp ${v} jt`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11.5 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 500, margin: "0 0 10px" }}>APBDes 2026 — Belanja (juta Rp)</h3>
          <div style={{ background: theme.panel, border: `0.5px solid ${theme.line}`, borderRadius: 14, padding: "1rem", height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={apbdesBelanja} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid stroke={theme.line} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: theme.textSoft }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 10.5, fill: theme.textSoft }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => `Rp ${v} jt`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="value" fill={theme.clay} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 20 }}>
        <div style={{ background: theme.panel, border: `0.5px solid ${theme.line}`, borderRadius: 14, padding: "1.25rem" }}>
          <h3 style={{ fontSize: 15, fontWeight: 500, margin: "0 0 12px" }}>Indeks Desa Membangun</h3>
          {[["IKS · Sosial", idm.iks], ["IKE · Ekonomi", idm.ike], ["IKL · Lingkungan", idm.ikl]].map(([k, v]) => (
            <div key={k} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                <span style={{ color: theme.textSoft }}>{k}</span><span style={{ fontWeight: 500 }}>{Number(v).toFixed(2)}</span>
              </div>
              <div style={{ background: theme.line, borderRadius: 99, height: 6 }}>
                <div style={{ width: `${Number(v) * 100}%`, background: theme.pine, height: 6, borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: theme.panel, border: `0.5px solid ${theme.line}`, borderRadius: 14, padding: "1.25rem" }}>
          <h3 style={{ fontSize: 15, fontWeight: 500, margin: "0 0 12px" }}>Capaian SDGs Desa</h3>
          {sdgs.map((s) => (
            <div key={s.id} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                <span style={{ color: theme.textSoft }}>{s.goal}</span><span style={{ fontWeight: 500 }}>{s.pct}%</span>
              </div>
              <div style={{ background: theme.line, borderRadius: 99, height: 6 }}>
                <div style={{ width: `${s.pct}%`, background: theme.gold, height: 6, borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Berita({ berita }) {
  return (
    <div style={{ padding: "2.5rem 0" }}>
      <SectionHeading eyebrow="Kabar Desa" title="Berita" desc="Informasi terbaru seputar kegiatan dan pembangunan desa." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {berita.map((b) => (
          <div key={b.id} style={{ background: theme.panel, border: `0.5px solid ${theme.line}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ height: 150, background: theme.goldSoft, backgroundImage: b.foto_url ? `url(${b.foto_url})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }} />
            <div style={{ padding: "1.25rem" }}>
              <span style={{ fontSize: 11.5, fontWeight: 500, color: theme.gold, background: theme.goldSoft, padding: "3px 10px", borderRadius: 99 }}>{b.tag}</span>
              <h3 style={{ fontSize: 16, fontWeight: 500, margin: "12px 0 6px", color: theme.text }}>{b.title}</h3>
              <p style={{ fontSize: 13.5, color: theme.textSoft, lineHeight: 1.6, margin: "0 0 12px" }}>{b.excerpt}</p>
              <p style={{ fontSize: 12, color: theme.textSoft, margin: 0 }}>{b.tanggal}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildWaLink(nomorWa, produkName, harga) {
  if (!nomorWa) return null;
  let digits = nomorWa.replace(/[^0-9]/g, "");
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  if (!digits.startsWith("62")) digits = "62" + digits;
  const pesan = `Halo, saya mau pesan produk *${produkName}*${harga ? ` (${harga})` : ""} dari website desa. Apakah masih tersedia?`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(pesan)}`;
}

function Belanja({ produk }) {
  return (
    <div style={{ padding: "2.5rem 0" }}>
      <SectionHeading eyebrow="UMKM Desa" title="Belanja" desc="Produk unggulan warga — dapat dipesan langsung ke pelaku UMKM." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {produk.map((p) => {
          const waLink = buildWaLink(p.nomor_wa, p.name, p.harga);
          return (
            <div key={p.id} style={{ background: theme.panel, border: `0.5px solid ${theme.line}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ height: 110, background: theme.goldSoft, backgroundImage: p.foto_url ? `url(${p.foto_url})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }} />
              <div style={{ padding: "1rem" }}>
                <p style={{ fontSize: 14.5, fontWeight: 500, margin: "0 0 4px", color: theme.text }}>{p.name}</p>
                <p style={{ fontSize: 12, color: theme.textSoft, margin: "0 0 10px" }}>{p.umkm}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: theme.pine }}>{p.harga}<span style={{ fontSize: 11.5, color: theme.textSoft, fontWeight: 400 }}>{p.unit}</span></p>
                  {waLink ? (
                    <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, border: `0.5px solid ${theme.pine}`, color: theme.pine, background: "transparent", borderRadius: 8, padding: "5px 10px", textDecoration: "none", display: "inline-block" }}>Pesan via WA</a>
                  ) : (
                    <span style={{ fontSize: 11.5, color: theme.textSoft }}>Nomor WA belum diatur</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Admin: login ----------
function AdminLogin({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!user.trim() || !pass.trim()) { setError("Isi username dan password."); return; }
    setError(""); setLoading(true);
    try {
      const res = await apiRequest("/auth/login", { method: "POST", body: { username: user, password: pass } });
      onLogin(res.token);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "4rem 0", display: "flex", justifyContent: "center" }}>
      <div style={{ width: 320, background: theme.panel, border: `0.5px solid ${theme.line}`, borderRadius: 14, padding: "1.75rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, margin: "0 0 4px" }}>Masuk admin</h2>
        <p style={{ fontSize: 13, color: theme.textSoft, margin: "0 0 20px" }}>Khusus perangkat desa untuk mengelola data situs.</p>
        <Field label="Username" placeholder="admin" value={user} onChange={(e) => setUser(e.target.value)} />
        <Field label="Password" type="password" placeholder="••••••••" value={pass} onChange={(e) => setPass(e.target.value)} />
        {error && <ErrorText>{error}</ErrorText>}
        <PrimaryBtn onClick={submit} disabled={loading} style={{ width: "100%" }}>{loading ? "Memeriksa…" : "Masuk"}</PrimaryBtn>
        <p style={{ fontSize: 11.5, color: theme.textSoft, margin: "12px 0 0" }}>Login ini terhubung ke API backend sungguhan di {API_BASE}.</p>
      </div>
    </div>
  );
}

// ---------- Admin: shell with sub-tabs ----------
function AdminPanel({ data, token, reload, onLogout }) {
  const [tab, setTab] = useState("profil");
  const tabs = [
    { key: "profil", label: "Profil Desa" },
    { key: "sambutan", label: "Sambutan" },
    { key: "sotk", label: "SOTK" },
    { key: "penduduk", label: "Penduduk" },
    { key: "apbdes", label: "APBDes" },
    { key: "idm", label: "IDM" },
    { key: "sdgs", label: "SDGs" },
    { key: "berita", label: "Berita" },
    { key: "produk", label: "Produk" },
    { key: "potensi", label: "Potensi" },
    { key: "wisata", label: "Wisata" },
    { key: "galeri", label: "Galeri" },
  ];
  return (
    <div style={{ padding: "2.5rem 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <SectionHeading eyebrow="Panel Admin" title="Kelola data situs" desc="Perubahan di sini disimpan ke database lalu langsung terlihat di halaman publik." />
        <GhostBtn onClick={onLogout}>Keluar</GhostBtn>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1.5rem", borderBottom: `0.5px solid ${theme.line}`, paddingBottom: 12 }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ fontSize: 13, padding: "6px 12px", borderRadius: 8, cursor: "pointer", background: tab === t.key ? theme.pine : theme.panel, color: tab === t.key ? "#fff" : theme.textSoft, border: `0.5px solid ${tab === t.key ? theme.pine : theme.line}` }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profil" && <AdminProfil profil={data.profil} token={token} reload={reload} />}
      {tab === "sambutan" && <AdminSambutan sambutan={data.sambutan} token={token} reload={reload} />}
      {tab === "sotk" && <AdminSotk profil={data.profil} token={token} reload={reload} />}
      {tab === "penduduk" && <AdminPenduduk dusun={data.dusun} token={token} reload={reload} />}
      {tab === "apbdes" && <AdminApbdes pendapatan={data.apbdesPendapatan} belanja={data.apbdesBelanja} pembiayaan={data.apbdesPembiayaan} token={token} reload={reload} />}
      {tab === "idm" && <AdminIdm idm={data.idm} token={token} reload={reload} />}
      {tab === "sdgs" && <AdminSdgs sdgs={data.sdgs} token={token} reload={reload} />}
      {tab === "berita" && <AdminBerita berita={data.berita} token={token} reload={reload} />}
      {tab === "produk" && <AdminProduk produk={data.produk} token={token} reload={reload} />}
      {tab === "potensi" && <AdminPotensi potensi={data.potensi} token={token} reload={reload} />}
      {tab === "wisata" && <AdminWisata wisata={data.wisata} token={token} reload={reload} />}
      {tab === "galeri" && <AdminGaleri galeri={data.galeri} token={token} reload={reload} />}
    </div>
  );
}

function AdminCard({ children }) {
  return <div style={{ background: theme.panel, border: `0.5px solid ${theme.line}`, borderRadius: 14, padding: "1.25rem", marginBottom: 16 }}>{children}</div>;
}
function AdminRowHeader({ title }) {
  return <h3 style={{ fontSize: 14.5, fontWeight: 500, margin: "0 0 12px" }}>{title}</h3>;
}

// ---- Profil ----
function AdminProfil({ profil, token, reload }) {
  const [form, setForm] = useState({ ...profil, misi: profil.misi || [], struktur: profil.struktur || [] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => setForm({ ...profil, misi: profil.misi || [], struktur: profil.struktur || [] }), [profil]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setMisi = (i) => (e) => { const misi = [...form.misi]; misi[i] = e.target.value; setForm({ ...form, misi }); };
  const addMisi = () => setForm({ ...form, misi: [...form.misi, ""] });
  const removeMisi = (i) => setForm({ ...form, misi: form.misi.filter((_, idx) => idx !== i) });

  const save = async () => {
    setSaving(true); setError("");
    try {
      await apiRequest("/profil", {
        method: "PUT", token,
        body: {
          nama: form.nama, kecamatan: form.kecamatan, sejarah: form.sejarah, visi: form.visi,
          luas: form.luas, jumlahDusun: form.jumlah_dusun, rtRw: form.rt_rw, ketinggian: form.ketinggian,
          jumlahKk: form.jumlah_kk, pendudukSementara: form.penduduk_sementara, mutasiPenduduk: form.mutasi_penduduk,
          latitude: form.latitude, longitude: form.longitude,
          bannerUrl: form.banner_url, fotoProfilUrl: form.foto_profil_url, logoUrl: form.logo_url,
          misi: form.misi, struktur: form.struktur,
        },
      });
      await reload();
    } catch (err) { setError(err.message); }
    setSaving(false);
  };

  return (
    <AdminCard>
      <AdminRowHeader title="Profil dan visi misi" />
      {error && <ErrorText>{error}</ErrorText>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 4 }}>
        <ImageUploadField label="Logo (header)" value={form.logo_url} onChange={(url) => setForm({ ...form, logo_url: url })} token={token} />
        <ImageUploadField label="Foto hero Beranda" value={form.banner_url} onChange={(url) => setForm({ ...form, banner_url: url })} token={token} />
        <ImageUploadField label="Foto banner Profil Desa" value={form.foto_profil_url} onChange={(url) => setForm({ ...form, foto_profil_url: url })} token={token} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Nama desa" value={form.nama || ""} onChange={set("nama")} />
        <Field label="Kecamatan" value={form.kecamatan || ""} onChange={set("kecamatan")} />
        <Field label="Luas wilayah" value={form.luas || ""} onChange={set("luas")} />
        <Field label="Jumlah dusun" value={form.jumlah_dusun || ""} onChange={set("jumlah_dusun")} />
        <Field label="RT / RW" value={form.rt_rw || ""} onChange={set("rt_rw")} />
        <Field label="Ketinggian" value={form.ketinggian || ""} onChange={set("ketinggian")} />
        <Field label="Jumlah KK" type="number" value={form.jumlah_kk ?? 0} onChange={set("jumlah_kk")} />
        <Field label="Penduduk sementara" type="number" value={form.penduduk_sementara ?? 0} onChange={set("penduduk_sementara")} />
        <Field label="Mutasi penduduk" type="number" value={form.mutasi_penduduk ?? 0} onChange={set("mutasi_penduduk")} />
        <span />
        <Field label="Latitude peta" placeholder="-0.63" value={form.latitude ?? ""} onChange={set("latitude")} />
        <Field label="Longitude peta" placeholder="123.97" value={form.longitude ?? ""} onChange={set("longitude")} />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Sejarah singkat</label>
        <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.sejarah || ""} onChange={set("sejarah")} />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Visi</label>
        <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={form.visi || ""} onChange={set("visi")} />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Misi</label>
        {form.misi.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input style={inputStyle} value={m} onChange={setMisi(i)} />
            <GhostBtn danger onClick={() => removeMisi(i)}>Hapus</GhostBtn>
          </div>
        ))}
        <GhostBtn onClick={addMisi}>+ Tambah misi</GhostBtn>
      </div>
      <PrimaryBtn onClick={save} disabled={saving}>{saving ? "Menyimpan…" : "Simpan profil"}</PrimaryBtn>
    </AdminCard>
  );
}

// ---- Sambutan ----
function AdminSambutan({ sambutan, token, reload }) {
  const empty = { nama_kepala_desa: "", jabatan: "Kepala Desa", foto_url: "", pesan: "" };
  const [form, setForm] = useState(sambutan || empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => setForm(sambutan || empty), [sambutan]);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    setSaving(true); setError("");
    try {
      await apiRequest("/sambutan", {
        method: "PUT", token,
        body: { namaKepalaDesa: form.nama_kepala_desa, jabatan: form.jabatan, fotoUrl: form.foto_url, pesan: form.pesan },
      });
      await reload();
    } catch (err) { setError(err.message); }
    setSaving(false);
  };

  return (
    <AdminCard>
      <AdminRowHeader title="Sambutan Kepala Desa" />
      {error && <ErrorText>{error}</ErrorText>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Nama Kepala Desa" value={form.nama_kepala_desa || ""} onChange={set("nama_kepala_desa")} />
        <Field label="Jabatan" value={form.jabatan || ""} onChange={set("jabatan")} />
      </div>
      <ImageUploadField label="Foto Kepala Desa (opsional)" value={form.foto_url} onChange={(url) => setForm({ ...form, foto_url: url })} token={token} />
      <div style={fieldWrap}>
        <label style={labelStyle}>Pesan sambutan</label>
        <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} value={form.pesan || ""} onChange={set("pesan")} />
      </div>
      <PrimaryBtn onClick={save} disabled={saving}>{saving ? "Menyimpan…" : "Simpan sambutan"}</PrimaryBtn>
    </AdminCard>
  );
}

// ---- SOTK (bagian dari data profil - array struktur) ----
function AdminSotk({ profil, token, reload }) {
  const [rows, setRows] = useState(profil.struktur || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => setRows(profil.struktur || []), [profil]);

  const update = (i, key, val) => { const r = [...rows]; r[i] = { ...r[i], [key]: val }; setRows(r); };
  const remove = (i) => setRows(rows.filter((_, idx) => idx !== i));
  const add = () => setRows([...rows, { jabatan: "", nama: "", foto_url: "" }]);

  const save = async () => {
    setSaving(true); setError("");
    try {
      await apiRequest("/profil", {
        method: "PUT", token,
        body: {
          nama: profil.nama, kecamatan: profil.kecamatan, sejarah: profil.sejarah, visi: profil.visi,
          luas: profil.luas, jumlahDusun: profil.jumlah_dusun, rtRw: profil.rt_rw, ketinggian: profil.ketinggian,
          jumlahKk: profil.jumlah_kk, pendudukSementara: profil.penduduk_sementara, mutasiPenduduk: profil.mutasi_penduduk,
          latitude: profil.latitude, longitude: profil.longitude,
          misi: profil.misi,
          struktur: rows.map((r) => ({ jabatan: r.jabatan, nama: r.nama, fotoUrl: r.foto_url })),
        },
      });
      await reload();
    } catch (err) { setError(err.message); }
    setSaving(false);
  };

  return (
    <AdminCard>
      <AdminRowHeader title="Struktur Organisasi dan Tata Kerja (SOTK)" />
      {error && <ErrorText>{error}</ErrorText>}
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input style={{ ...inputStyle, flex: "1 1 130px" }} placeholder="Jabatan" value={r.jabatan || ""} onChange={(e) => update(i, "jabatan", e.target.value)} />
          <input style={{ ...inputStyle, flex: "1 1 130px" }} placeholder="Nama" value={r.nama || ""} onChange={(e) => update(i, "nama", e.target.value)} />
          <ImageUploadField compact value={r.foto_url} onChange={(url) => update(i, "foto_url", url)} token={token} />
          <GhostBtn danger onClick={() => remove(i)}>Hapus</GhostBtn>
        </div>
      ))}
      <GhostBtn onClick={add}>+ Tambah anggota</GhostBtn>
      <div style={{ marginTop: 14 }}>
        <PrimaryBtn onClick={save} disabled={saving}>{saving ? "Menyimpan…" : "Simpan SOTK"}</PrimaryBtn>
      </div>
    </AdminCard>
  );
}

// ---- Penduduk ----
function AdminPenduduk({ dusun, token, reload }) {
  const [rows, setRows] = useState(dusun);
  const [newRow, setNewRow] = useState({ name: "", laki: 0, perempuan: 0 });
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => setRows(dusun), [dusun]);

  const updateLocal = (id, key, val) => setRows(rows.map((r) => (r.id === id ? { ...r, [key]: key === "name" ? val : Number(val) || 0 } : r)));

  const save = async (row) => {
    setBusyId(row.id); setError("");
    try { await apiRequest(`/dusun/${row.id}`, { method: "PUT", token, body: row }); await reload(); }
    catch (err) { setError(err.message); }
    setBusyId(null);
  };
  const remove = async (id) => {
    setBusyId(id); setError("");
    try { await apiRequest(`/dusun/${id}`, { method: "DELETE", token }); await reload(); }
    catch (err) { setError(err.message); }
    setBusyId(null);
  };
  const add = async () => {
    if (!newRow.name.trim()) return;
    setError("");
    try { await apiRequest("/dusun", { method: "POST", token, body: newRow }); setNewRow({ name: "", laki: 0, perempuan: 0 }); await reload(); }
    catch (err) { setError(err.message); }
  };

  return (
    <AdminCard>
      <AdminRowHeader title="Data penduduk per dusun" />
      {error && <ErrorText>{error}</ErrorText>}
      {rows.map((d) => (
        <div key={d.id} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr auto auto", gap: 8, marginBottom: 8, alignItems: "center" }}>
          <input style={inputStyle} value={d.name} onChange={(e) => updateLocal(d.id, "name", e.target.value)} />
          <input style={inputStyle} type="number" value={d.laki} onChange={(e) => updateLocal(d.id, "laki", e.target.value)} placeholder="Laki-laki" />
          <input style={inputStyle} type="number" value={d.perempuan} onChange={(e) => updateLocal(d.id, "perempuan", e.target.value)} placeholder="Perempuan" />
          <GhostBtn onClick={() => save(d)} disabled={busyId === d.id}>Simpan</GhostBtn>
          <GhostBtn danger onClick={() => remove(d.id)} disabled={busyId === d.id}>Hapus</GhostBtn>
        </div>
      ))}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr auto", gap: 8, marginTop: 12, alignItems: "center" }}>
        <input style={inputStyle} placeholder="Nama dusun baru" value={newRow.name} onChange={(e) => setNewRow({ ...newRow, name: e.target.value })} />
        <input style={inputStyle} type="number" placeholder="Laki-laki" value={newRow.laki} onChange={(e) => setNewRow({ ...newRow, laki: e.target.value })} />
        <input style={inputStyle} type="number" placeholder="Perempuan" value={newRow.perempuan} onChange={(e) => setNewRow({ ...newRow, perempuan: e.target.value })} />
        <PrimaryBtn onClick={add}>+ Tambah</PrimaryBtn>
      </div>
    </AdminCard>
  );
}

// ---- APBDes ----
function ApbdesList({ title, items, resource, token, reload }) {
  const [rows, setRows] = useState(items);
  const [newRow, setNewRow] = useState({ name: "", value: 0 });
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => setRows(items), [items]);

  const updateLocal = (id, key, val) => setRows(rows.map((r) => (r.id === id ? { ...r, [key]: key === "name" ? val : Number(val) || 0 } : r)));
  const save = async (row) => {
    setBusyId(row.id); setError("");
    try { await apiRequest(`/apbdes/${resource}/${row.id}`, { method: "PUT", token, body: row }); await reload(); }
    catch (err) { setError(err.message); }
    setBusyId(null);
  };
  const remove = async (id) => {
    setBusyId(id); setError("");
    try { await apiRequest(`/apbdes/${resource}/${id}`, { method: "DELETE", token }); await reload(); }
    catch (err) { setError(err.message); }
    setBusyId(null);
  };
  const add = async () => {
    if (!newRow.name.trim()) return;
    setError("");
    try { await apiRequest(`/apbdes/${resource}`, { method: "POST", token, body: newRow }); setNewRow({ name: "", value: 0 }); await reload(); }
    catch (err) { setError(err.message); }
  };

  return (
    <AdminCard>
      <AdminRowHeader title={title} />
      {error && <ErrorText>{error}</ErrorText>}
      {rows.map((r) => (
        <div key={r.id} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr auto auto", gap: 8, marginBottom: 8 }}>
          <input style={inputStyle} value={r.name} onChange={(e) => updateLocal(r.id, "name", e.target.value)} />
          <input style={inputStyle} type="number" value={r.value} onChange={(e) => updateLocal(r.id, "value", e.target.value)} />
          <GhostBtn onClick={() => save(r)} disabled={busyId === r.id}>Simpan</GhostBtn>
          <GhostBtn danger onClick={() => remove(r.id)} disabled={busyId === r.id}>Hapus</GhostBtn>
        </div>
      ))}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr auto", gap: 8, marginTop: 12 }}>
        <input style={inputStyle} placeholder="Nama pos baru" value={newRow.name} onChange={(e) => setNewRow({ ...newRow, name: e.target.value })} />
        <input style={inputStyle} type="number" placeholder="Juta Rp" value={newRow.value} onChange={(e) => setNewRow({ ...newRow, value: e.target.value })} />
        <PrimaryBtn onClick={add}>+ Tambah</PrimaryBtn>
      </div>
    </AdminCard>
  );
}
function AdminPembiayaan({ pembiayaan, token, reload }) {
  const [form, setForm] = useState(pembiayaan || { penerimaan: 0, pengeluaran: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => setForm(pembiayaan || { penerimaan: 0, pengeluaran: 0 }), [pembiayaan]);
  const set = (k) => (e) => setForm({ ...form, [k]: Number(e.target.value) || 0 });

  const save = async () => {
    setSaving(true); setError("");
    try { await apiRequest("/apbdes/pembiayaan", { method: "PUT", token, body: form }); await reload(); }
    catch (err) { setError(err.message); }
    setSaving(false);
  };

  return (
    <AdminCard>
      <AdminRowHeader title="APBDes — Pembiayaan (juta Rp)" />
      {error && <ErrorText>{error}</ErrorText>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Penerimaan pembiayaan" type="number" value={form.penerimaan} onChange={set("penerimaan")} />
        <Field label="Pengeluaran pembiayaan" type="number" value={form.pengeluaran} onChange={set("pengeluaran")} />
      </div>
      <PrimaryBtn onClick={save} disabled={saving}>{saving ? "Menyimpan…" : "Simpan pembiayaan"}</PrimaryBtn>
    </AdminCard>
  );
}
function AdminApbdes({ pendapatan, belanja, pembiayaan, token, reload }) {
  return (
    <>
      <ApbdesList title="APBDes — Pendapatan (juta Rp)" items={pendapatan} resource="pendapatan" token={token} reload={reload} />
      <ApbdesList title="APBDes — Belanja (juta Rp)" items={belanja} resource="belanja" token={token} reload={reload} />
      <AdminPembiayaan pembiayaan={pembiayaan} token={token} reload={reload} />
    </>
  );
}

// ---- IDM ----
function AdminIdm({ idm, token, reload }) {
  const [form, setForm] = useState(idm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => setForm(idm), [idm]);
  const set = (k) => (e) => setForm({ ...form, [k]: k === "status" ? e.target.value : Number(e.target.value) || 0 });

  const save = async () => {
    setSaving(true); setError("");
    try { await apiRequest("/idm", { method: "PUT", token, body: form }); await reload(); }
    catch (err) { setError(err.message); }
    setSaving(false);
  };

  return (
    <AdminCard>
      <AdminRowHeader title="Indeks Desa Membangun" />
      {error && <ErrorText>{error}</ErrorText>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Skor IDM (0–1)" type="number" step="0.0001" value={form.score} onChange={set("score")} />
        <Field label="Status" value={form.status} onChange={set("status")} />
        <Field label="IKS · Sosial (0–1)" type="number" step="0.01" value={form.iks} onChange={set("iks")} />
        <Field label="IKE · Ekonomi (0–1)" type="number" step="0.01" value={form.ike} onChange={set("ike")} />
        <Field label="IKL · Lingkungan (0–1)" type="number" step="0.01" value={form.ikl} onChange={set("ikl")} />
      </div>
      <PrimaryBtn onClick={save} disabled={saving}>{saving ? "Menyimpan…" : "Simpan IDM"}</PrimaryBtn>
    </AdminCard>
  );
}

// ---- SDGs ----
function AdminSdgs({ sdgs, token, reload }) {
  const [rows, setRows] = useState(sdgs);
  const [newRow, setNewRow] = useState({ goal: "", pct: 0 });
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => setRows(sdgs), [sdgs]);

  const updateLocal = (id, key, val) => setRows(rows.map((s) => (s.id === id ? { ...s, [key]: key === "goal" ? val : Number(val) || 0 } : s)));
  const save = async (row) => {
    setBusyId(row.id); setError("");
    try { await apiRequest(`/sdgs/${row.id}`, { method: "PUT", token, body: row }); await reload(); }
    catch (err) { setError(err.message); }
    setBusyId(null);
  };
  const remove = async (id) => {
    setBusyId(id); setError("");
    try { await apiRequest(`/sdgs/${id}`, { method: "DELETE", token }); await reload(); }
    catch (err) { setError(err.message); }
    setBusyId(null);
  };
  const add = async () => {
    if (!newRow.goal.trim()) return;
    setError("");
    try { await apiRequest("/sdgs", { method: "POST", token, body: newRow }); setNewRow({ goal: "", pct: 0 }); await reload(); }
    catch (err) { setError(err.message); }
  };

  return (
    <AdminCard>
      <AdminRowHeader title="Capaian SDGs Desa" />
      {error && <ErrorText>{error}</ErrorText>}
      {rows.map((s) => (
        <div key={s.id} style={{ display: "grid", gridTemplateColumns: "2fr 0.8fr auto auto", gap: 8, marginBottom: 8 }}>
          <input style={inputStyle} value={s.goal} onChange={(e) => updateLocal(s.id, "goal", e.target.value)} />
          <input style={inputStyle} type="number" min="0" max="100" value={s.pct} onChange={(e) => updateLocal(s.id, "pct", e.target.value)} />
          <GhostBtn onClick={() => save(s)} disabled={busyId === s.id}>Simpan</GhostBtn>
          <GhostBtn danger onClick={() => remove(s.id)} disabled={busyId === s.id}>Hapus</GhostBtn>
        </div>
      ))}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 0.8fr auto", gap: 8, marginTop: 12 }}>
        <input style={inputStyle} placeholder="Tujuan SDGs baru" value={newRow.goal} onChange={(e) => setNewRow({ ...newRow, goal: e.target.value })} />
        <input style={inputStyle} type="number" min="0" max="100" placeholder="%" value={newRow.pct} onChange={(e) => setNewRow({ ...newRow, pct: e.target.value })} />
        <PrimaryBtn onClick={add}>+ Tambah</PrimaryBtn>
      </div>
    </AdminCard>
  );
}

// ---- Berita ----
function AdminBerita({ berita, token, reload }) {
  const [form, setForm] = useState({ tag: "", title: "", tanggal: "", excerpt: "", fotoUrl: "" });
  const [rows, setRows] = useState(berita);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => setRows(berita), [berita]);

  const updateLocal = (id, key, val) => setRows(rows.map((b) => (b.id === id ? { ...b, [key]: val } : b)));
  const save = async (row) => {
    setBusyId(row.id); setError("");
    try { await apiRequest(`/berita/${row.id}`, { method: "PUT", token, body: { ...row, fotoUrl: row.foto_url } }); await reload(); }
    catch (err) { setError(err.message); }
    setBusyId(null);
  };
  const remove = async (id) => {
    setBusyId(id); setError("");
    try { await apiRequest(`/berita/${id}`, { method: "DELETE", token }); await reload(); }
    catch (err) { setError(err.message); }
    setBusyId(null);
  };
  const add = async () => {
    if (!form.title.trim()) return;
    setError("");
    try { await apiRequest("/berita", { method: "POST", token, body: form }); setForm({ tag: "", title: "", tanggal: "", excerpt: "", fotoUrl: "" }); await reload(); }
    catch (err) { setError(err.message); }
  };

  return (
    <>
      <AdminCard>
        <AdminRowHeader title="Tambah berita" />
        {error && <ErrorText>{error}</ErrorText>}
        <ImageUploadField label="Foto berita" value={form.fotoUrl} onChange={(url) => setForm({ ...form, fotoUrl: url })} token={token} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Kategori" placeholder="Pengumuman" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
          <Field label="Tanggal" placeholder="31 Ags 2026" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} />
        </div>
        <Field label="Judul" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <div style={fieldWrap}>
          <label style={labelStyle}>Ringkasan</label>
          <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
        </div>
        <PrimaryBtn onClick={add}>Tambah berita</PrimaryBtn>
      </AdminCard>
      <AdminCard>
        <AdminRowHeader title={`Daftar berita (${rows.length})`} />
        {rows.map((b) => (
          <div key={b.id} style={{ borderTop: `0.5px solid ${theme.line}`, padding: "10px 0" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center", flexWrap: "wrap" }}>
              <ImageUploadField compact value={b.foto_url} onChange={(url) => updateLocal(b.id, "foto_url", url)} token={token} />
              <input style={{ ...inputStyle, fontWeight: 500, flex: "1 1 160px" }} value={b.title} onChange={(e) => updateLocal(b.id, "title", e.target.value)} />
              <GhostBtn onClick={() => save(b)} disabled={busyId === b.id}>Simpan</GhostBtn>
              <GhostBtn danger onClick={() => remove(b.id)} disabled={busyId === b.id}>Hapus</GhostBtn>
            </div>
          </div>
        ))}
      </AdminCard>
    </>
  );
}

// ---- Produk ----
function AdminProduk({ produk, token, reload }) {
  const [form, setForm] = useState({ name: "", harga: "", unit: "", umkm: "", fotoUrl: "", nomorWa: "" });
  const [rows, setRows] = useState(produk);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => setRows(produk), [produk]);

  const updateLocal = (id, key, val) => setRows(rows.map((p) => (p.id === id ? { ...p, [key]: val } : p)));
  const save = async (row) => {
    setBusyId(row.id); setError("");
    try { await apiRequest(`/produk/${row.id}`, { method: "PUT", token, body: { ...row, fotoUrl: row.foto_url, nomorWa: row.nomor_wa } }); await reload(); }
    catch (err) { setError(err.message); }
    setBusyId(null);
  };
  const remove = async (id) => {
    setBusyId(id); setError("");
    try { await apiRequest(`/produk/${id}`, { method: "DELETE", token }); await reload(); }
    catch (err) { setError(err.message); }
    setBusyId(null);
  };
  const add = async () => {
    if (!form.name.trim()) return;
    setError("");
    try { await apiRequest("/produk", { method: "POST", token, body: form }); setForm({ name: "", harga: "", unit: "", umkm: "", fotoUrl: "", nomorWa: "" }); await reload(); }
    catch (err) { setError(err.message); }
  };

  return (
    <>
      <AdminCard>
        <AdminRowHeader title="Tambah produk" />
        {error && <ErrorText>{error}</ErrorText>}
        <ImageUploadField label="Foto produk" value={form.fotoUrl} onChange={(url) => setForm({ ...form, fotoUrl: url })} token={token} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Nama produk" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Field label="Nama UMKM" value={form.umkm} onChange={(e) => setForm({ ...form, umkm: e.target.value })} />
          <Field label="Harga" placeholder="Rp 25.000" value={form.harga} onChange={(e) => setForm({ ...form, harga: e.target.value })} />
          <Field label="Satuan" placeholder="/kg" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          <Field label="Nomor WhatsApp pemilik" placeholder="08xxxxxxxxxx" value={form.nomorWa} onChange={(e) => setForm({ ...form, nomorWa: e.target.value })} />
        </div>
        <PrimaryBtn onClick={add}>Tambah produk</PrimaryBtn>
      </AdminCard>
      <AdminCard>
        <AdminRowHeader title={`Daftar produk (${rows.length})`} />
        {rows.map((p) => (
          <div key={p.id} style={{ borderTop: `0.5px solid ${theme.line}`, padding: "10px 0" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center", flexWrap: "wrap" }}>
              <ImageUploadField compact value={p.foto_url} onChange={(url) => updateLocal(p.id, "foto_url", url)} token={token} />
              <input style={{ ...inputStyle, fontWeight: 500, flex: "1 1 140px" }} value={p.name} onChange={(e) => updateLocal(p.id, "name", e.target.value)} />
              <input style={{ ...inputStyle, flex: "1 1 140px" }} placeholder="Nomor WhatsApp" value={p.nomor_wa || ""} onChange={(e) => updateLocal(p.id, "nomor_wa", e.target.value)} />
              <GhostBtn onClick={() => save(p)} disabled={busyId === p.id}>Simpan</GhostBtn>
              <GhostBtn danger onClick={() => remove(p.id)} disabled={busyId === p.id}>Hapus</GhostBtn>
            </div>
          </div>
        ))}
      </AdminCard>
    </>
  );
}

// ---- Potensi ----
function AdminPotensi({ potensi, token, reload }) {
  const [form, setForm] = useState({ judul: "", deskripsi: "", fotoUrl: "" });
  const [rows, setRows] = useState(potensi);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => setRows(potensi), [potensi]);

  const updateLocal = (id, key, val) => setRows(rows.map((p) => (p.id === id ? { ...p, [key]: val } : p)));
  const save = async (row) => {
    setBusyId(row.id); setError("");
    try { await apiRequest(`/potensi/${row.id}`, { method: "PUT", token, body: { judul: row.judul, deskripsi: row.deskripsi, fotoUrl: row.foto_url } }); await reload(); }
    catch (err) { setError(err.message); }
    setBusyId(null);
  };
  const remove = async (id) => {
    setBusyId(id); setError("");
    try { await apiRequest(`/potensi/${id}`, { method: "DELETE", token }); await reload(); }
    catch (err) { setError(err.message); }
    setBusyId(null);
  };
  const add = async () => {
    if (!form.judul.trim()) return;
    setError("");
    try { await apiRequest("/potensi", { method: "POST", token, body: form }); setForm({ judul: "", deskripsi: "", fotoUrl: "" }); await reload(); }
    catch (err) { setError(err.message); }
  };

  return (
    <>
      <AdminCard>
        <AdminRowHeader title="Tambah potensi desa" />
        {error && <ErrorText>{error}</ErrorText>}
        <Field label="Judul" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} />
        <ImageUploadField label="Foto (opsional)" value={form.fotoUrl} onChange={(url) => setForm({ ...form, fotoUrl: url })} token={token} />
        <div style={fieldWrap}>
          <label style={labelStyle}>Deskripsi</label>
          <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
        </div>
        <PrimaryBtn onClick={add}>Tambah potensi</PrimaryBtn>
      </AdminCard>
      <AdminCard>
        <AdminRowHeader title={`Daftar potensi (${rows.length})`} />
        {rows.map((p) => (
          <div key={p.id} style={{ borderTop: `0.5px solid ${theme.line}`, padding: "10px 0" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ ...inputStyle, fontWeight: 500 }} value={p.judul} onChange={(e) => updateLocal(p.id, "judul", e.target.value)} />
              <GhostBtn onClick={() => save(p)} disabled={busyId === p.id}>Simpan</GhostBtn>
              <GhostBtn danger onClick={() => remove(p.id)} disabled={busyId === p.id}>Hapus</GhostBtn>
            </div>
          </div>
        ))}
      </AdminCard>
    </>
  );
}

// ---- Wisata ----
function AdminWisata({ wisata, token, reload }) {
  const [form, setForm] = useState({ nama: "", deskripsi: "", fotoUrl: "", lokasi: "" });
  const [rows, setRows] = useState(wisata);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => setRows(wisata), [wisata]);

  const updateLocal = (id, key, val) => setRows(rows.map((w) => (w.id === id ? { ...w, [key]: val } : w)));
  const save = async (row) => {
    setBusyId(row.id); setError("");
    try { await apiRequest(`/wisata/${row.id}`, { method: "PUT", token, body: { nama: row.nama, deskripsi: row.deskripsi, fotoUrl: row.foto_url, lokasi: row.lokasi } }); await reload(); }
    catch (err) { setError(err.message); }
    setBusyId(null);
  };
  const remove = async (id) => {
    setBusyId(id); setError("");
    try { await apiRequest(`/wisata/${id}`, { method: "DELETE", token }); await reload(); }
    catch (err) { setError(err.message); }
    setBusyId(null);
  };
  const add = async () => {
    if (!form.nama.trim()) return;
    setError("");
    try { await apiRequest("/wisata", { method: "POST", token, body: form }); setForm({ nama: "", deskripsi: "", fotoUrl: "", lokasi: "" }); await reload(); }
    catch (err) { setError(err.message); }
  };

  return (
    <>
      <AdminCard>
        <AdminRowHeader title="Tambah titik wisata" />
        {error && <ErrorText>{error}</ErrorText>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Nama" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
          <Field label="Lokasi" placeholder="Dusun II" value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} />
        </div>
        <ImageUploadField label="Foto (opsional)" value={form.fotoUrl} onChange={(url) => setForm({ ...form, fotoUrl: url })} token={token} />
        <div style={fieldWrap}>
          <label style={labelStyle}>Deskripsi</label>
          <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
        </div>
        <PrimaryBtn onClick={add}>Tambah wisata</PrimaryBtn>
      </AdminCard>
      <AdminCard>
        <AdminRowHeader title={`Daftar wisata (${rows.length})`} />
        {rows.map((w) => (
          <div key={w.id} style={{ borderTop: `0.5px solid ${theme.line}`, padding: "10px 0" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ ...inputStyle, fontWeight: 500 }} value={w.nama} onChange={(e) => updateLocal(w.id, "nama", e.target.value)} />
              <GhostBtn onClick={() => save(w)} disabled={busyId === w.id}>Simpan</GhostBtn>
              <GhostBtn danger onClick={() => remove(w.id)} disabled={busyId === w.id}>Hapus</GhostBtn>
            </div>
          </div>
        ))}
      </AdminCard>
    </>
  );
}

// ---- Galeri ----
function AdminGaleri({ galeri, token, reload }) {
  const [form, setForm] = useState({ judul: "", fotoUrl: "", tanggal: "" });
  const [rows, setRows] = useState(galeri);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => setRows(galeri), [galeri]);

  const remove = async (id) => {
    setBusyId(id); setError("");
    try { await apiRequest(`/galeri/${id}`, { method: "DELETE", token }); await reload(); }
    catch (err) { setError(err.message); }
    setBusyId(null);
  };
  const add = async () => {
    if (!form.judul.trim() || !form.fotoUrl.trim()) { setError("Judul dan URL foto wajib diisi."); return; }
    setError("");
    try { await apiRequest("/galeri", { method: "POST", token, body: form }); setForm({ judul: "", fotoUrl: "", tanggal: "" }); await reload(); }
    catch (err) { setError(err.message); }
  };

  return (
    <>
      <AdminCard>
        <AdminRowHeader title="Tambah foto galeri" />
        {error && <ErrorText>{error}</ErrorText>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Judul" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} />
          <Field label="Tanggal" placeholder="31 Ags 2026" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} />
        </div>
        <ImageUploadField label="Foto" value={form.fotoUrl} onChange={(url) => setForm({ ...form, fotoUrl: url })} token={token} />
        <PrimaryBtn onClick={add}>Tambah foto</PrimaryBtn>
      </AdminCard>
      <AdminCard>
        <AdminRowHeader title={`Daftar foto (${rows.length})`} />
        {rows.map((g) => (
          <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, borderTop: `0.5px solid ${theme.line}`, padding: "10px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {g.foto_url && <img src={g.foto_url} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} />}
              <span style={{ fontSize: 13.5 }}>{g.judul} <span style={{ color: theme.textSoft }}>· {g.tanggal}</span></span>
            </div>
            <GhostBtn danger onClick={() => remove(g.id)} disabled={busyId === g.id}>Hapus</GhostBtn>
          </div>
        ))}
      </AdminCard>
    </>
  );
}

// ---------- App shell ----------
export default function App() {
  const [page, setPage] = useState("home");
  const [token, setToken] = useState(null);
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState("");

  const loadAll = async () => {
    setLoadError("");
    try {
      const [profil, dusun, apbdes, idm, sdgs, berita, produk, sambutan, potensi, wisata, galeri] = await Promise.all([
        apiRequest("/profil"), apiRequest("/dusun"), apiRequest("/apbdes"),
        apiRequest("/idm"), apiRequest("/sdgs"), apiRequest("/berita"), apiRequest("/produk"),
        apiRequest("/sambutan"), apiRequest("/potensi"), apiRequest("/wisata"), apiRequest("/galeri"),
      ]);
      setData({
        profil, dusun, apbdesPendapatan: apbdes.pendapatan, apbdesBelanja: apbdes.belanja,
        apbdesPembiayaan: apbdes.pembiayaan, idm, sdgs, berita, produk, sambutan, potensi, wisata, galeri,
      });
    } catch (err) {
      setLoadError(err.message || "Gagal memuat data dari server.");
    }
  };

  useEffect(() => { loadAll(); }, []);

  const nav = [
    { key: "home", label: "Beranda" },
    { key: "profil", label: "Profil Desa" },
    { key: "infografis", label: "Infografis" },
    { key: "berita", label: "Berita" },
    { key: "belanja", label: "Belanja" },
  ];

  if (loadError) {
    return (
      <div style={{ background: theme.bg, minHeight: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", padding: "2rem", textAlign: "center" }}>
        <p style={{ fontSize: 14.5, color: theme.danger, marginBottom: 14 }}>Tidak bisa memuat data dari {API_BASE}.<br />{loadError}</p>
        <PrimaryBtn onClick={loadAll}>Coba lagi</PrimaryBtn>
      </div>
    );
  }
  if (!data) {
    return (
      <div style={{ background: theme.bg, minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
        <p style={{ fontSize: 14, color: theme.textSoft }}>Memuat data desa…</p>
      </div>
    );
  }

  const publicPages = {
    home: <Home go={setPage} data={data} />,
    profil: <ProfilDesa profil={data.profil} />,
    infografis: <Infografis data={data} />,
    berita: <Berita berita={data.berita} />,
    belanja: <Belanja produk={data.produk} />,
  };

  return (
    <div style={{ background: theme.bg, fontFamily: "'Inter', sans-serif", color: theme.text, minHeight: 400 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.9rem 2rem", borderBottom: `0.5px solid ${theme.line}`, position: "sticky", top: 0, background: theme.bg, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {data.profil.logo_url ? (
            <img src={data.profil.logo_url} alt="Logo" style={{ width: 30, height: 30, borderRadius: 8, objectFit: "cover" }} />
          ) : (
            <div style={{ width: 30, height: 30, borderRadius: 8, background: theme.pine, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, fontFamily: "'Sora', sans-serif" }}>
              {(data.profil.nama || "?").trim().split(/\s+/).map((w) => w.charAt(0)).join("").slice(0, 2).toUpperCase()}
            </div>
          )}
          <span style={{ fontSize: 14.5, fontWeight: 500 }}>{data.profil.nama}</span>
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {nav.map((n) => (
            <button key={n.key} onClick={() => setPage(n.key)} style={{ fontSize: 13.5, padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", background: page === n.key ? theme.pine : "transparent", color: page === n.key ? "#fff" : theme.textSoft, fontWeight: page === n.key ? 500 : 400 }}>
              {n.label}
            </button>
          ))}
          <span style={{ width: 1, height: 18, background: theme.line, margin: "0 6px" }} />
          <button onClick={() => setPage("admin")} style={{ fontSize: 13.5, padding: "7px 14px", borderRadius: 8, cursor: "pointer", background: page === "admin" ? theme.gold : "transparent", color: page === "admin" ? "#fff" : theme.gold, border: `0.5px solid ${theme.gold}`, fontWeight: 500 }}>
            Admin
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 2rem" }}>
        {page === "admin"
          ? (token
              ? <AdminPanel data={data} token={token} reload={loadAll} onLogout={() => { setToken(null); setPage("home"); }} />
              : <AdminLogin onLogin={(t) => setToken(t)} />)
          : publicPages[page]}
      </div>

      <div style={{ borderTop: `0.5px solid ${theme.line}`, marginTop: 40, padding: "1.5rem 2rem", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 12.5, color: theme.textSoft }}>© 2026 Pemerintah {data.profil.nama} · {data.profil.kecamatan}</p>
      </div>
    </div>
  );
}