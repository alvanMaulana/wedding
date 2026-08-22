# Setup Supabase (penyimpanan RSVP & Ucapan)

Frontend sekarang static murni — panggil Supabase langsung dari browser.
**Tidak perlu Node/Express lagi.** Folder `server/` boleh diabaikan/dihapus.

## 1. Bikin project
1. Daftar di https://supabase.com (gratis).
2. New Project → kasih nama, set password DB, pilih region terdekat (Singapore).
3. Tunggu ±2 menit sampai project siap.

## 2. Bikin tabel + policy
Buka **SQL Editor** → New query → paste ini → Run:

```sql
create table rsvp (
  id          bigint generated always as identity primary key,
  nama        text not null,
  kehadiran   text not null check (kehadiran in ('hadir','tidak_hadir')),
  jumlah_tamu int  not null default 1,
  created_at  timestamptz default now()
);

create table wishes (
  id         bigint generated always as identity primary key,
  nama       text not null,
  pesan      text not null,
  created_at timestamptz default now()
);

-- RLS: anon key publik, jadi akses dibatasi di sini
alter table rsvp   enable row level security;
alter table wishes enable row level security;

-- tamu boleh KIRIM rsvp, TIDAK boleh baca rsvp orang lain (privasi)
create policy "rsvp insert" on rsvp for insert to anon with check (true);

-- ucapan: boleh kirim + boleh baca (buat wall ucapan)
create policy "wishes insert" on wishes for insert to anon with check (true);
create policy "wishes read"   on wishes for select to anon using (true);
```

## 3. Ambil URL + anon key
**Project Settings → API**:
- `Project URL` → contoh `https://abcd.supabase.co`
- `anon public` key

Tempel ke [public/js/config.js](public/js/config.js):
```js
const SUPABASE_URL = 'https://abcd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGci...';
```

## 4. Lihat data masuk
Supabase Dashboard → **Table Editor** → tabel `rsvp` / `wishes`.
Ekspor CSV kalau perlu rekap tamu.

## 5. Deploy (gratis, static)
Taruh isi folder `public/` di salah satu:
- **Netlify** / **Vercel** / **Cloudflare Pages** — drag & drop folder atau connect GitHub.
- **GitHub Pages**.

Data tetap aman di Supabase walau host static tidur/redeploy.

## Catatan keamanan
- Anon key aman dipublikasikan — itu desainnya. RLS yang jaga.
- RSVP sengaja tanpa policy `select` → publik gak bisa intip daftar tamu.
- Kalau nanti mau wall ucapan bisa dihapus admin, tambah kolom + policy delete pakai service role (jangan taruh service key di frontend).
