# Undangan Pernikahan Digital — Indy & Alvan

Website undangan pernikahan statis (HTML/CSS/JS) + backend Express kecil untuk RSVP & Ucapan, disimpan ke SQLite.

## Cara Menjalankan

```bash
npm install
npm start
```

Buka http://localhost:3000

Link personal per tamu: `http://localhost:3000/?to=Budi` → nama tamu otomatis muncul di "Kepada Yth."

Mode dev (auto-reload): `npm run dev`

## Catatan Teknis

- **Database:** memakai modul bawaan Node.js `node:sqlite` (Node 22.5+). Tidak perlu `better-sqlite3` / compiler C++. File DB dibuat otomatis di `server/wedding.db`.
- **GSAP** di-load via CDN untuk animasi opening screen. Jika offline, animasi di-skip otomatis, konten tetap tampil.
- **Musik latar:** taruh `ambience.mp3` di `public/assets/audio/`. Tanpa file, tombol musik tetap aman (tidak error).
- **Foto:** section hero, mempelai, dan galeri memakai placeholder gradien. Ganti dengan foto asli nanti (lihat "Ganti Konten").

## Halaman Admin

`http://localhost:3000/admin.html` — kata sandi default: `indyalvan2026`

Ubah di [public/admin.html](public/admin.html) (variabel `PASSWORD`). Menampilkan ringkasan RSVP, daftar tamu, dan ucapan.

> Catatan: gerbang password ini sisi-klien (versi awal). Endpoint `GET /api/rsvp` & `/api/wishes` masih publik. Untuk data sensitif, tambahkan auth di server.

## API

| Method | Endpoint       | Fungsi                     |
|--------|----------------|----------------------------|
| POST   | `/api/rsvp`    | Simpan RSVP                |
| GET    | `/api/rsvp`    | List RSVP + ringkasan      |
| POST   | `/api/wishes`  | Simpan ucapan              |
| GET    | `/api/wishes`  | List ucapan (`?limit=`)    |

## Ganti Konten

- **Foto asli:** ganti blok `.photo-ph` / gallery placeholder di [index.html](public/index.html) & array `gradients` di [js/main.js](public/js/main.js) dengan `<img>` sungguhan.
- **Tanggal acara / countdown:** `EVENT_DATE` di [js/main.js](public/js/main.js).
- **Data mempelai, lokasi, rekening:** langsung edit teks di [index.html](public/index.html).
- **Ornamen:** file SVG di `public/assets/images/` (recolor via atribut warna).

## Struktur

```
server/    Express + node:sqlite (db.js, server.js, routes/)
public/    Frontend statis (index.html, admin.html, css, js, assets)
```
