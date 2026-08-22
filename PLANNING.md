# Planning: Website Undangan Pernikahan Digital

## 1. Ringkasan Project
Website undangan pernikahan digital dengan link personal per tamu (contoh: `?to=Nama`), fitur countdown, RSVP, ucapan/doa, amplop digital, profil mempelai, lokasi, dan galeri foto.

Referensi: https://the.invisimple.id/ais-alqan/?to=Indy

## 2. Tech Stack
- **Frontend:** HTML, CSS, Vanilla JavaScript (statis, tanpa framework)
- **Backend:** Node.js + Express (ringan, hanya untuk API RSVP & Ucapan)
- **Database:** SQLite (via `better-sqlite3`)
- **Hosting:** bebas (VPS / Railway / Render / Vercel-serverless jika nanti di-adjust)

> Catatan: Frontend tetap 100% HTML/CSS/JS statis. Backend hanya menyediakan endpoint API kecil untuk baca/tulis data RSVP & ucapan ke SQLite, dipanggil via `fetch()` dari JS.

## 3. Struktur Folder
```
wedding-invitation/
├── server/
│   ├── server.js              # Express app
│   ├── db.js                  # Setup & koneksi SQLite
│   ├── wedding.db              # File database (auto-generated)
│   └── routes/
│       ├── rsvp.js            # POST/GET RSVP
│       └── wishes.js          # POST/GET ucapan
├── public/
│   ├── index.html
│   ├── admin.html              # Halaman lihat data RSVP & ucapan (opsional, password sederhana)
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── main.js             # Personalisasi nama, countdown, audio toggle
│   │   ├── rsvp.js             # Handle submit form RSVP
│   │   └── wishes.js           # Handle submit & render ucapan
│   └── assets/
│       ├── images/              # Foto prewedding, galeri, dekorasi
│       └── audio/               # Musik latar
├── package.json
└── README.md
```

## 4. Skema Database (SQLite)

### Tabel `rsvp`
| Kolom       | Tipe      | Keterangan                        |
|-------------|-----------|------------------------------------|
| id          | INTEGER PK AUTOINCREMENT |                      |
| nama        | TEXT      | Nama tamu                          |
| kehadiran   | TEXT      | 'hadir' / 'tidak_hadir'            |
| jumlah_tamu | INTEGER   | Jumlah orang yang hadir            |
| created_at  | DATETIME  | default CURRENT_TIMESTAMP          |

### Tabel `wishes`
| Kolom       | Tipe      | Keterangan                        |
|-------------|-----------|------------------------------------|
| id          | INTEGER PK AUTOINCREMENT |                      |
| nama        | TEXT      | Nama pengirim ucapan               |
| pesan       | TEXT      | Isi ucapan/doa                     |
| created_at  | DATETIME  | default CURRENT_TIMESTAMP          |

## 5. Fitur Versi 1 (Sesuai konfirmasi)

### a. Profil Dasar
- Nama mempelai pria & wanita + foto
- Info orang tua masing-masing
- Ayat/quote pembuka
- Tanggal & lokasi acara (akad + resepsi, bisa beda tanggal)
- Link Google Maps
- Galeri foto — grid, klik untuk lightbox/preview lebih besar (carousel prev/next)

### b. Personalisasi Tamu
- Baca query parameter `?to=NamaTamu` dari URL via JavaScript
- Tampilkan nama tamu di bagian "Kepada Yth."
- Fallback: jika parameter kosong, tampilkan "Tamu Undangan"

### c. Countdown
- Hitung mundur hari/jam/menit/detik ke tanggal acara (real-time, update tiap detik via `setInterval`)

### d. RSVP (Konfirmasi Kehadiran)
- Form: Nama, Status Hadir/Tidak Hadir, Jumlah Tamu
- Submit → POST ke `/api/rsvp` → simpan ke SQLite
- Tampilkan pesan sukses setelah submit

### e. Ucapan & Doa (Wishes)
- Form: Nama, Pesan
- Submit → POST ke `/api/wishes` → simpan ke SQLite
- List ucapan → GET `/api/wishes` → tampilkan daftar ucapan terbaru (misal 10-20 terakhir, dengan tombol "load more" opsional)

### f. Amplop Digital
- Info rekening bank (nama bank, no rekening, atas nama) + tombol "Salin" (copy to clipboard via JS)
- Info alamat kado fisik (opsional) + tombol "Salin"
- Tombol konfirmasi transfer → link `wa.me` dengan pesan template

## 6. API Endpoints (Backend)

| Method | Endpoint         | Fungsi                          |
|--------|-------------------|----------------------------------|
| POST   | `/api/rsvp`       | Simpan data RSVP baru            |
| GET    | `/api/rsvp`       | (admin) List semua RSVP          |
| POST   | `/api/wishes`     | Simpan ucapan baru                |
| GET    | `/api/wishes`     | List ucapan (untuk publik & admin)|

## 7. Halaman Admin (Opsional tapi direkomendasikan)
- `admin.html` sederhana dengan proteksi password (bisa hardcode di `.env` untuk versi awal, upgrade ke auth proper nanti)
- Menampilkan tabel RSVP (nama, status, jumlah tamu, waktu submit)
- Menampilkan tabel ucapan
- Total ringkasan: jumlah "Hadir", "Tidak Hadir", total tamu

## 8. Urutan Pengerjaan (untuk Claude Code)

1. **Setup project**
   - Init `package.json`, install `express`, `better-sqlite3`, `cors`, `dotenv`
   - Buat struktur folder sesuai bagian 3

2. **Setup database**
   - Buat `server/db.js`: koneksi SQLite + buat tabel `rsvp` dan `wishes` jika belum ada (migration sederhana saat server start)

3. **Backend API**
   - Buat route RSVP (`POST`/`GET`)
   - Buat route Wishes (`POST`/`GET`)
   - Setup `server.js`: serve folder `public/` sebagai static, mount API routes di `/api`

4. **Frontend - Struktur HTML**
   - Buat `index.html` dengan section: Hero, Kedua Mempelai, Save The Date + Countdown, Lokasi Acara, Love Story (opsional), Galeri, Amplop Digital, Form RSVP, Ucapan, Footer

5. **Frontend - Styling**
   - Buat `style.css`: desain elegant/minimalis, responsive (mobile-first, karena mayoritas dibuka dari WA di HP), font Google Fonts (misal serif untuk judul + sans-serif untuk body)

6. **Frontend - JS Logic**
   - `main.js`: parse `?to=` dari URL, render nama tamu, jalankan countdown, toggle musik latar
   - `rsvp.js`: handle submit form RSVP via `fetch POST`
   - `wishes.js`: fetch & render list ucapan, handle submit form ucapan

7. **Halaman Admin**
   - Buat `admin.html` + proteksi sederhana + fetch data dari `/api/rsvp` dan `/api/wishes`

8. **Testing**
   - Test buka `index.html?to=Budi` → cek personalisasi muncul
   - Test submit RSVP → cek masuk ke `wedding.db`
   - Test submit ucapan → cek muncul di list
   - Test responsive di ukuran layar HP

9. **Polish**
   - Tambah animasi scroll (fade-in) sederhana pakai `IntersectionObserver`
   - Tambah loading state saat submit form
   - Tambah validasi form dasar (nama tidak boleh kosong, dsb)

## 9. Design System

### a. Palet Warna
| Elemen | Warna | Kode |
|---|---|---|
| Background utama | Cream soft | `#FAF3E9` |
| Aksen 1 | Biru muda pastel | `#9CC6DC` |
| Aksen 2 | Pink pastel | `#E8B4BE` |
| Teks utama | Coklat gelap lembut | `#5C4B3A` |
| Teks sekunder | Abu kecoklatan | `#8A7A6A` |
| Aksen highlight (tombol/link) | Gold muted | `#C9A876` |

### b. Ornamen
- **Tema:** Kombinasi motif Jawa (kawung/sulur) + floral modern minimalis, diwarnai ulang ke palet pastel biru & pink di atas
- **Referensi gaya:** Ornamen custom dengan garis lebih detail & rapat (bukan flat simple line-art) — mengacu ke referensi visual yang diberikan user, menunggu file gambar untuk analisa presisi
- **Status aset:** Draft awal sudah dibuat (kawung motif, corner floral, pattern tile, sulur border), akan disempurnakan ulang setelah referensi gambar user tersedia
- **Format:** SVG (scalable, ringan, gampang di-recolor via `currentColor`/CSS variable)
- **Penempatan:**
  - Divider antar section
  - Border/frame foto
  - Background pattern (samar/watermark, opacity rendah)
  - Elemen mengambang di opening screen (lihat bagian animasi)

### c. Animasi — Opening Screen ("Buka Undangan")
**Trigger:** User klik tombol "Buka Undangan"

**Efek:**
1. Beberapa ornamen (ukuran & posisi berbeda-beda) melayang masuk dari luar frame (kiri/kanan/atas/bawah) menuju posisi akhir di background
2. Tiap ornamen punya rotasi ringan saat masuk (dari ~15-20° ke posisi natural/0°), memberi kesan natural bukan kaku
3. Efek depth/parallax 2D (tanpa 3D engine):
   - Layer "depan" (ornamen lebih besar) → durasi animasi lebih cepat, easing lebih snappy
   - Layer "belakang" (ornamen lebih kecil/opacity lebih rendah) → durasi lebih lambat, easing lebih halus
   - Kombinasi ini menciptakan kesan kedalaman meski tetap flat 2D
4. Setelah animasi ornamen selesai, transisi fade/slide ke halaman utama undangan

**Teknologi:** GSAP (via CDN) untuk timeline & stagger antar ornamen — lebih presisi & mudah di-maintain dibanding CSS `@keyframes` murni untuk animasi bertahap seperti ini. Bukan Three.js/3D engine — tetap ringan.

**Implementasi teknis (garis besar):**
- Load GSAP core dari CDN (`gsap.min.js`)
- Setiap ornamen adalah elemen `<img>`/`<svg>` dengan posisi awal di luar viewport (`transform: translate + rotate`) via CSS/JS
- `gsap.timeline()` dengan `.to()` per ornamen, `stagger` untuk delay berurutan, `ease: "power2.out"` (depan) vs `ease: "power1.out"` (belakang, lebih halus)
- Trigger animasi dipanggil di event listener tombol "Buka Undangan"

### d. Level Animasi Section Lain (di luar opening screen)
- Fade-in + slide-up saat scroll per section (`IntersectionObserver`, tanpa GSAP ScrollTrigger dulu — cukup ringan)
- Countdown timer dengan transisi angka halus
- Micro-interaction tombol (scale kecil saat hover/tap)
- Popup modal (jika ada galeri foto) dengan fade + scale

## 10. Data Konten Undangan (untuk diisi)

> Isi langsung field di bawah ini (ketik jawaban setelah tanda `:`), atau kirim jawabannya lewat chat dan saya bantu isikan ke sini.

### a. Data Mempelai

**Mempelai Wanita**
- Nama lengkap: Indy Vidha Fuadi
- Nama panggilan: Indy
- Anak ke- (dari berapa bersaudara): (belum ada info jumlah saudara)
- Nama Ayah: Alm. Bapak Ranto
- Nama Ibu: Ibu Nyatipuk
- Instagram: @insrxwd *(catatan: diganti sesuai instruksi user dari @indy.pramesti)*

**Mempelai Pria**
- Nama lengkap: Alvan Maulana
- Nama panggilan: Alvan
- Anak ke- (dari berapa bersaudara): (belum ada info jumlah saudara)
- Nama Ayah: Bapak Syaeful
- Nama Ibu: Ibu Meyke Dewi
- Instagram: @alvan.maulana

### b. Tanggal & Acara

**Akad Nikah**
- Tanggal & hari: Senin, 28 September 2026
- Jam: 08.00 — 10.00 WIB
- Lokasi sama dengan resepsi?: Ya

**Resepsi**
- Tanggal & hari: Senin, 28 September 2026
- Jam mulai - selesai: 11.00 — 14.00 WIB

### c. Lokasi

**Lokasi Akad**
- Sama dengan lokasi resepsi (lihat di bawah)

**Lokasi Resepsi**
- Nama tempat: Waroeng Tani — Pan Java Mulyoagung
- Alamat lengkap: Jl. TPST, Jetak Lor, Mulyoagung, Kec. Dau, Kabupaten Malang, Jawa Timur 65151
- Link Google Maps: https://www.google.com/maps/search/?api=1&query=Waroeng+Tani+Pan+Java+Mulyoagung+Dau+Malang

### d. Amplop Digital / Wedding Gift

**Rekening 1**
- Nama bank: BCA
- Nomor rekening: 8161231878
- Atas nama: ALVAN MAULANA

**Rekening 2** (opsional)
- Nama bank: 
- Nomor rekening: 
- Atas nama: 

**Kado Fisik**
- Nama penerima: 
- Alamat pengiriman: 
- No. WhatsApp konfirmasi (transfer & kado): (belum ada)

### e. Love Story

- Tampilkan section ini?: Ya
- Fase 1 — "Pertama Bertemu" (2019): Di sebuah taman botani, dua langkah tak sengaja bertemu. Sebuah percakapan singkat tentang bunga menjadi awal dari segalanya.
- Fase 2 — "Tumbuh Bersama" (2021): Dari senja ke senja, kami belajar arti kesabaran, tawa, dan rumah. Setiap hari menjadi bab baru yang kami tulis berdua.
- Fase 3 — "Sebuah Janji" (2025): Di bawah cahaya senja, sebuah pertanyaan diucapkan pelan. Jawabannya adalah air mata bahagia dan satu kata: iya.
- Fase 4 (Hari-H): belum ada, bisa ditambahkan (mengikuti tanggal 28 September 2026)

### f. Lain-lain
- Ayat/quote pembuka: QS. Ar-Rum : 21 — "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang."
- Musik latar: file ambience (perlu dipilih ulang/disediakan sendiri, judul spesifik belum ada)
- Kalimat penutup: "Merupakan suatu kebahagiaan dan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu." + salam penutup Islami standar

### g. Fitur Tambahan (hasil konfirmasi)
Dari web referensi, hanya **Gallery lightbox** yang ditambahkan ke scope v1 (foto bisa diklik untuk preview lebih besar/carousel). Dress Code, Live Streaming, dan QRIS **tidak dipakai**.

## 11. Hal yang Masih Perlu Kamu Konfirmasi (isi sebelum mulai coding)

- [x] Warna tema / mood desain → Pastel cream + biru & pink pastel (sudah fix, lihat section 9)
- [ ] Data mempelai, tanggal, lokasi, rekening, dsb → isi di section 10
- [ ] Upload file referensi ornamen (misal `Orn-12.png`) agar aset SVG final bisa dibuat presisi meniru gaya tersebut
- [ ] Foto-foto yang mau dipakai (hero, galeri, dll) — atau pakai placeholder dulu
- [ ] Apakah butuh proteksi password di `admin.html`, atau cukup dijaga via URL rahasia saja

## 12. Catatan Teknis Tambahan
- SQLite cocok untuk skala undangan pernikahan (ratusan-ribuan RSVP), tidak perlu database server terpisah
- File `wedding.db` sebaiknya di-backup berkala kalau dipakai untuk acara penting
- Karena banyak diakses via link WhatsApp, pastikan Open Graph meta tags (`og:title`, `og:image`, `og:description`) diisi supaya preview link WA bagus
- GSAP di-load via CDN (`https://cdnjs.cloudflare.com/ajax/libs/gsap/...`), tidak perlu instalasi npm karena frontend tetap statis (vanilla JS)
- Untuk section 4 (skema database), tabel `rsvp` dan `wishes` sudah cukup untuk fitur v1; opening screen animation tidak butuh data dari database, murni presentational
