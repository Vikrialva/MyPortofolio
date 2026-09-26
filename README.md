# MyPortofolio

Website portfolio pribadi dengan **panel admin** — tidak perlu edit kode untuk menambah project atau mengubah teks.

- Frontend: HTML + Tailwind CSS (CDN) + Alpine.js, multi-bahasa (EN/ID)
- Backend: Node.js + Express 5 + SQLite (`node:sqlite`, tanpa native build)
- Admin: login, CRUD project, upload gambar, editor teks per bahasa

## Menjalankan

```bash
npm install
npm start
```

- Website: http://localhost:3000
- Admin: http://localhost:3000/admin

Kredensial admin awal: `admin` / `admin123`

> **Ganti password ini sebelum dipakai online.** Set `ADMIN_USER` dan `ADMIN_PASSWORD`
> sebelum server pertama kali jalan untuk membuat akun admin dengan kredensial pilihanmu:
> ```bash
> $env:ADMIN_USER = "usernamemu"
> $env:ADMIN_PASSWORD = "passwordmu"
> npm start
> ```
> Akun admin hanya dibuat otomatis saat tabel user masih kosong.

## Environment

| Variabel         | Default            | Keterangan                                  |
| ---------------- | ------------------ | ------------------------------------------- |
| `PORT`           | `3000`             | Port server                                  |
| `ADMIN_USER`     | `admin`            | Username admin (hanya saat tabel user kosong) |
| `ADMIN_PASSWORD` | `admin123`         | Password admin (hanya saat tabel user kosong) |
| `SESSION_SECRET` | `dev_secret`       | **Wajib diganti di production**              |
| `DB_FILE`        | `data/app.db`      | Lokasi file SQLite                            |
| `NODE_ENV`       | —                  | Set `production` agar cookie session `secure`  |

## Struktur

```
server/
  index.js     Express app, route API, session
  db.js        Skema SQLite + query
  auth.js      Hash password (scrypt) & session
  content.js   Default konten + seed project
  seed.js      npm run seed
admin/         Panel admin (login + dashboard)
public/        Website statis
data/          Database SQLite (tidak masuk git)
uploads/       Gambar hasil upload (tidak masuk git)
```

## API

Publik:

- `GET /api/content` — semua konten site + daftar project yang dipublikasikan

Admin (butuh session login):

- `POST /api/auth/login` · `POST /api/auth/logout` · `GET /api/auth/me`
- `GET|PUT /api/admin/content` — konten teks site (EN/ID)
- `GET|POST /api/admin/projects` · `PUT|DELETE /api/admin/projects/:id`
- `POST /api/admin/projects/reorder`
- `POST /api/admin/upload` — multipart field `images` (maks 10 file, 5 MB, gambar saja)

## Menambah project

1. Buka `/admin` → tab **Projects** → **Tambah Project**
2. Isi judul/deskripsi per bahasa, kategori, tag, link repo & demo
3. Upload **cover** dan **galeri** (bisa beberapa file, drag untuk ubah urutan)
4. Centang **Tampilkan di homepage** agar muncul di section "Selected work"
5. Klik **Simpan Project**

Project berstatus draft (`Published` mati) tidak muncul di website.

## Lisensi

Design & kode asli template: [Folio — ThemeWagon](https://themewagon.com/themes/folio-html/), MIT.
