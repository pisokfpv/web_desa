# Website Desa - Backend

API Node.js/Express + MySQL/MariaDB untuk website desa (profil, infografis, berita, belanja, dan panel admin).

## Struktur folder

```
website-desa-backend/
  package.json
  .env.example
  sql/
    schema.sql      -> membuat semua tabel
    seed.sql         -> mengisi data awal (sama seperti mockup)
  src/
    server.js        -> entry point Express
    db.js             -> koneksi pool MySQL
    createAdmin.js    -> skrip buat akun admin pertama
    middleware/
      auth.js         -> verifikasi token JWT
    routes/
      auth.js, profil.js, penduduk.js, apbdes.js, idm.js, sdgs.js, berita.js, produk.js
```

## Jalan di lokal

1. `npm install`
2. Buat database: `mysql -u root -p < sql/schema.sql` lalu `mysql -u root -p < sql/seed.sql`
3. `cp .env.example .env` lalu isi `DB_USER`, `DB_PASSWORD`, `DB_NAME`, dan `JWT_SECRET` (string acak panjang)
4. Buat akun admin pertama: `node src/createAdmin.js admin passwordkuat123`
5. Jalankan: `npm run dev` (atau `npm start`) - API aktif di `http://localhost:4000`

## Endpoint API

Semua endpoint publik pakai `GET`. Endpoint admin (`POST`/`PUT`/`DELETE`) butuh header:
`Authorization: Bearer <token>` - token didapat dari `POST /api/auth/login`.

| Data | Publik | Admin |
|---|---|---|
| Login | - | `POST /api/auth/login` `{ username, password }` |
| Profil desa | `GET /api/profil` | `PUT /api/profil` |
| Penduduk per dusun | `GET /api/dusun` | `POST /api/dusun`, `PUT /api/dusun/:id`, `DELETE /api/dusun/:id` |
| APBDes | `GET /api/apbdes` (pendapatan + belanja) | `POST/PUT/DELETE /api/apbdes/pendapatan/:id`, sama untuk `/belanja` |
| IDM | `GET /api/idm` | `PUT /api/idm` |
| SDGs | `GET /api/sdgs` | `POST /api/sdgs`, `PUT /api/sdgs/:id`, `DELETE /api/sdgs/:id` |
| Berita | `GET /api/berita` | `POST /api/berita`, `PUT /api/berita/:id`, `DELETE /api/berita/:id` |
| Produk | `GET /api/produk` | `POST /api/produk`, `PUT /api/produk/:id`, `DELETE /api/produk/:id` |

## Hubungkan ke frontend mockup

Ganti `useState` data di `website-desa-mockup.jsx` dengan `fetch` ke endpoint di atas
(`useEffect` untuk `GET` saat halaman publik dimuat, dan panggilan `fetch` dengan token JWT
di setiap fungsi simpan pada panel admin). Simpan token dari `/api/auth/login` di `state`
React (tidak perlu localStorage karena artifact tidak mendukungnya).

## Deploy ke VM (Proxmox + PM2 + Cloudflare Tunnel)

1. Buat database dan user MySQL di DB VM yang sudah ada, atau host di VM baru.
2. Pindahkan folder ini ke VM (WinSCP), `npm install --production`, isi `.env` dengan host
   DB VM yang sesuai.
3. Jalankan dengan PM2: `pm2 start src/server.js --name website-desa-api`
4. Tambahkan subdomain baru (mis. `api-desa.<domain-anda>`) ke Cloudflare Tunnel yang
   mengarah ke port `4000` di VM ini, lalu set `CORS_ORIGIN` di `.env` ke domain frontend.