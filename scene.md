# Scene — Animasi Pembuka Undangan (Ais & Alqan / Indy & Alvan)

Dokumentasi flow animasi **setelah klik "Buka Undangan"**, tata letak ornamen,
daftar aset yang perlu di-generate, dan prompt gambar per ornamen.

Tema warna: **biru + pink pastel**, gaya **soft / semi-realisme + sentuhan
lukisan (painterly)**, background **low-contrast** (tidak tajam).

Referensi flow: `The-Wedding-of-Ais-Alqan.mp4` (animasi asli bertema tosca/emas —
di sini di-recolor ke biru+pink pastel).

---

## 1. Flow (urutan kejadian)

Flow ini **sudah ter-code** di `public/js/main.js` (`playSceneIntro` + `playSceneIdle`,
pakai GSAP) dan struktur di `public/index.html` `#scene`. Yang belum ada = file PNG ornamennya.

| # | Waktu (≈) | Kejadian | Elemen |
|---|-----------|----------|--------|
| 0 | — | Layar **Cover**: nama mempelai, "Kepada Yth", tombol **Buka Undangan** | `#cover` |
| 1 | 0.0s | Klik tombol → cover fade out, musik nyala, konten muncul, mendarat di `#scene` | `revealContent()` |
| 2 | 0.0–1.6s | **Background** gunung + air terjun **zoom-out** (scale 1.2 → 1.0) | `.scene-bg` |
| 3 | 0.3–1.9s | **Bulan** turun dari atas sambil berputar (-220°), fade-in | `.scene-moon` |
| 4 | 0.3–1.9s | **Pohon kiri & kanan** masuk dari samping, menyerong naik 45° | `.tree-l1/.tree-l2/.tree-r1` |
| 5 | 0.6–1.7s | **Bunga** tumbuh dari bawah, stagger + efek `back.out` (memantul) | `.scene-flower` |
| 6 | ~1.7–2.7s | **Bingkai samping (penjor/frame)** masuk terakhir dari kiri & kanan | `.penjor-left/.penjor-right` |
| 7 | selesai | **Idle loop**: pohon goyang lembut, bunga naik-turun, bulan mengambang | `playSceneIdle()` |
| 8 | — | User **scroll** turun → lanjut ke Hero (bukan auto-advance) | `.scroll-cue` |

> **Tambahan dari video** (belum di-code — opsional, lihat §4B): bingkai **arch
> art-nouveau** penuh mengelilingi scene + **liontin permata/pita** turun dari
> puncak arch di akhir.

---

## 2. Tata Letak Ornamen (layer & posisi)

Koordinat diambil dari `public/css/style.css` (baris 92–132). Layout mobile-first (potret).

```
 z-index  ┌──────────────────────────────────────┐
   6 (opsional) │        ╭─ ARCH FRAME ─╮   ◆ liontin   │  ← tambahan video
          │      ╭╯                 ╰╮            │
   2      │              ( BULAN )              │  top center, mt 6vh, w≈150px
          │                                      │
   3      │ 🌳 tree-l1        🌲 tree-r1         │  kiri -2%/btm 8vh · kanan -2%/btm 6vh
   3      │    🌳 tree-l2                         │  kiri 8%/btm 22vh (lebih kecil)
   1      │  ░░░ gunung + air terjun (BG) ░░░    │  inset 0, object-fit cover
   4      │ 🌸 fl-1     🌷 fl-2       🌸 fl-3    │  btm≈-1..-3vh, fl-2 tengah 44%
   5 │▌ penjor-left            penjor-right ▐│  bingkai vertikal kiri-kanan, btm 0
          └──────────────────────────────────────┘
```

**Urutan layer (belakang → depan):**

1. `scene-bg` (z1) — gunung berkabut + air terjun, full-bleed.
2. `scene-moon` (z2) — bulan, top-center.
3. `scene-tree` ×3 (z3) — pohon pembingkai kiri (2) + kanan (1), tumbuh dari bawah.
4. `scene-flower` ×3 (z4) — bunga di tepi bawah, `fl-2` paling besar di tengah.
5. `scene-penjor` ×2 (z5) — pilar/bingkai vertikal kiri & kanan (tinggi ~88vh).
6. *(opsional)* `scene-arch` (z6) + `scene-jewel` — bingkai lengkung + liontin.

**Posisi presisi (CSS):**

| Ornamen | Selector | Posisi | Ukuran |
|---------|----------|--------|--------|
| Bulan | `.scene-moon` | top-center, `margin-top:6vh` | `min(150px, 32vw)` |
| Pohon kiri depan | `.tree-l1` | `left:-2%; bottom:8vh` | `min(46vh,420px)` |
| Pohon kiri belakang | `.tree-l2` | `left:8%; bottom:22vh` | `min(34vh,300px)` |
| Pohon kanan | `.tree-r1` | `right:-2%; bottom:6vh` | `min(46vh,420px)` |
| Bunga kiri | `.fl-1` | `left:10%; bottom:-1vh` | `min(20vh,170px)` |
| Bunga tengah | `.fl-2` | `left:44%; bottom:-3vh` | `min(24vh,200px)` |
| Bunga kanan | `.fl-3` | `right:12%; bottom:-1vh` | `min(20vh,170px)` |
| Bingkai kiri | `.penjor-left` | `left:0; bottom:0` | `min(88vh,780px)` |
| Bingkai kanan | `.penjor-right` | `right:0; bottom:0` | `min(88vh,780px)` |

---

## 3. Daftar Ornamen yang Perlu Di-generate

Semua ditaruh di `public/assets/images/`. Nama file **wajib sama** dengan yang
sudah dirujuk di `index.html` (kalau tidak, `onerror` sembunyikan gambar).

| File | Ornamen | Format | Catatan penting |
|------|---------|--------|-----------------|
| `scene-bg.jpg` | Background gunung + air terjun | **JPG**, 720×1280 (9:16) | Full-bleed, **ADA** (tosca) → regen ke pastel |
| `moon.png` | Bulan | **PNG transparan** | Bulat, cukup 1 objek |
| `tree-1.png` | Pohon kiri-depan | **PNG transparan** | Rimbun, condong ke dalam |
| `tree-2.png` | Pohon kiri-belakang | **PNG transparan** | Lebih kecil/ramping |
| `tree-3.png` | Pohon kanan | **PNG transparan** | Mirror dari kiri |
| `flower-1.png` | Rumpun bunga (kiri) | **PNG transparan** | Baris bunga bawah |
| `flower-2.png` | Rumpun bunga (tengah, besar) | **PNG transparan** | Fokus utama bawah |
| `flower-3.png` | Rumpun bunga (kanan) | **PNG transparan** | Mirror kiri |
| `penjor-left.png` | Pilar/bingkai vertikal kiri | **PNG transparan** | Tinggi penuh, tepi kiri |
| `penjor-right.png` | Pilar/bingkai vertikal kanan | **PNG transparan** | Mirror kiri |
| *(ops)* `arch-frame.png` | Bingkai lengkung art-nouveau | **PNG transparan** | Kelilingi scene, tengah kosong |
| *(ops)* `jewel.png` | Liontin permata + pita | **PNG transparan** | Turun dari puncak arch |

> **Kritis:** semua ornamen = **PNG background transparan** (cutout), supaya
> bertumpuk di atas `scene-bg`. Hanya `scene-bg` yang JPG penuh.

---

## 4. Prompt Generate Gambar (per ornamen)

Gaya acuan: **`Gunungan.png` & `flower.png`** — cat air (watercolor) lembut +
detail **garis emas halus (fine gold line-art)**, pastel biru & pink, daun hijau
sage, aksen bunga putih, bersih & airy, bg putih/transparan. Bukan oil-painting
tebal, bukan foto realis.

**Prefix gaya (tempel di setiap prompt):**

> `soft delicate watercolor illustration with fine gold line-art detailing, pastel
> blue and blush pink palette, sage green foliage, small white flower accents, airy
> and elegant, gentle low-contrast soft washes, clean minimal composition, wedding
> stationery style`

**Negative (jika didukung):** `oil painting, thick brush strokes, heavy texture,
3D render, photorealistic, harsh shadows, dark, saturated, cartoon, text, watermark`

### A. Ornamen inti (wajib)

**`scene-bg.jpg`** — background
```
A soft dreamy watercolor landscape of misty mountains with a gentle waterfall and a
calm reflective lake, pale washed sky with faint stars, delicate fine gold line-art
accents on the hills, pastel blue and blush pink soft washes, sage green hints,
airy and low-contrast, wedding stationery style, vertical 9:16 composition, empty
soft center for text, full background (no transparency).
```

**`moon.png`** — bulan
```
A soft watercolor full moon, pale washed surface with a faint pink and blue halo,
delicate fine gold line-art ring around it, airy and low-contrast, wedding
stationery style, isolated on transparent background, PNG cutout.
```

**`tree-1.png` / `tree-3.png`** — pohon pembingkai (generate 1, flip untuk kanan)
```
A graceful ornamental tree with soft watercolor sage-green and pale blue foliage and
blush pink blossoms, delicate fine gold line-art on the branches, curving inward to
frame a scene, airy and elegant, pastel low-contrast soft washes, wedding stationery
style, isolated on transparent background, PNG cutout, full tree visible.
```

**`tree-2.png`** — pohon belakang (lebih ramping)
```
A slender airy ornamental tree with wispy pale blue and soft pink watercolor foliage,
delicate fine gold line-art twigs, light and translucent, pastel low-contrast washes,
wedding stationery style, isolated on transparent background, PNG cutout.
```

**`flower-1.png` / `flower-3.png`** — rumpun bunga tepi (flip untuk mirror)
```
A watercolor cluster of blush pink peonies and roses with pale blue blossoms, small
white jasmine, sage green leaves and fine gold line-art leaf details, arranged as a
low border bouquet, airy and delicate, pastel low-contrast washes, wedding stationery
style, isolated on transparent background, PNG cutout.
```

**`flower-2.png`** — rumpun bunga tengah (besar, fokus) — *acuan: `flower.png`*
```
A lush wide watercolor floral border of blush pink peonies and roses, pale blue
blossoms, white jasmine and sage green leaves with fine gold line-art leaf accents,
dense elegant centerpiece bouquet, airy and delicate, pastel low-contrast soft
washes, wedding stationery style, isolated on transparent background, PNG cutout.
```

**`penjor-left.png` / `penjor-right.png`** — pilar/bingkai vertikal (flip untuk mirror)
```
A tall slender vertical decorative border in delicate fine gold line-art filigree,
entwined with soft watercolor pastel blue and blush pink flowers, sage green vines
and trailing leaves, elegant and airy, pastel low-contrast washes, wedding stationery
style, isolated on transparent background, PNG cutout, full height vertical strip,
only the left/right edge decorated, center empty.
```

### B. Ornamen tambahan (opsional, dari video)

Butuh sedikit tambahan `<img>` di `#scene` + CSS (z-index 6) + step GSAP baru.

**`arch-frame.png`** — bingkai lengkung (acuan gaya `Gunungan.png`)
```
An ornate arched wedding frame in delicate fine gold line-art filigree with
symmetrical scrollwork, accented by soft watercolor pastel blue and blush pink
flowers and sage leaves in the top corners, airy and elegant, hollow empty center,
pastel low-contrast washes, wedding stationery style, isolated on transparent
background, PNG cutout, vertical 9:16.
```

**`jewel.png`** — liontin permata + pita
```
An elegant hanging brooch pendant with a pale blue and blush pink gemstone
centerpiece, pearls and delicate fine gold line-art filigree, a soft watercolor
satin ribbon bow above, airy and soft, pastel low-contrast, wedding stationery
style, isolated on transparent background, PNG cutout.
```

---

## 5. Catatan Integrasi

- Drop file PNG/JPG ke `public/assets/images/` dengan nama persis di §3 → flow
  langsung jalan (HTML+GSAP sudah ada).
- Bunga & pohon: generate versi kiri lalu **flip horizontal** untuk kanan (hemat).
- Untuk arch + jewel (§4B): tambah 2 `<img>` di `#scene`, set `z-index:6`, dan
  tambahkan langkah di `playSceneIntro()` (arch fade+scale, jewel turun dari atas).
- `prefers-reduced-motion`: animasi di-skip, aset tampil statis di posisi CSS —
  pastikan komposisi tetap bagus tanpa gerak.
