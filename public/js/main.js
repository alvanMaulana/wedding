/* ========= Config ========= */
const EVENT_DATE = new Date('2026-09-28T13:00:00+07:00'); // Akad, WIB
const GALLERY_PHOTOS = [
  'assets/photos/IMG_0823.webp',
  'assets/photos/IMG_0825.webp',
  'assets/photos/IMG_0857.webp',
  'assets/photos/IMG_0910.webp',
];
const GALLERY_COUNT = GALLERY_PHOTOS.length;

/* ========= Guest personalization (?to=Nama) ========= */
function getGuestName() {
  // ambil `to` dari `?...to=` sampai akhir string, biar `&`/spasi mentah di nama ga kepotong
  // (mis ?to=Anun%20&%20Puput -> "Anun & Puput"). ponytail: `to` diasumsikan param terakhir.
  const m = window.location.search.match(/[?&]to=(.*)$/);
  if (!m) return 'Tamu Undangan';
  // decode aman (param malformed spt "Budi%" ga bikin script mati) + buang tag
  let clean;
  try { clean = decodeURIComponent(m[1].replace(/\+/g, ' ')); }
  catch { clean = m[1].replace(/\+/g, ' '); }
  clean = clean.replace(/[<>]/g, '').trim();
  if (!clean) return 'Tamu Undangan';
  // huruf awal tiap kata jadi besar (mis "budi santoso" -> "Budi Santoso")
  return clean.replace(/(^|\s)(\S)/g, (_, sp, c) => sp + c.toUpperCase());
}
// dipakai juga buat prefill RSVP & Ucapan (rsvp.js, wishes.js)
window.guestName = getGuestName;
document.getElementById('cover-guest').textContent = getGuestName();

/* ========= Catat siapa buka undangan (?to=Nama) ========= */
// upsert onConflict nama + ignoreDuplicates = INSERT ... ON CONFLICT DO NOTHING.
// nama udah ada di DB -> di-skip. localStorage cegah hit ulang tiap reload browser sama.
async function logVisit(nama) {
  if (!window.sb || nama === 'Tamu Undangan') return;
  try { if (localStorage.getItem('visit_logged') === nama) return; } catch {}
  try {
    const { error } = await sb.from('visits').upsert({ nama: nama.slice(0, 100) }, { onConflict: 'nama', ignoreDuplicates: true });
    if (error) throw error;
    try { localStorage.setItem('visit_logged', nama); } catch {}
  } catch {}
}
logVisit(getGuestName());

/* ========= Countdown ========= */
function pad(n) { return String(n).padStart(2, '0'); }
function tickCountdown() {
  const diff = EVENT_DATE - new Date();
  const el = {
    d: document.getElementById('cd-days'),
    h: document.getElementById('cd-hours'),
    m: document.getElementById('cd-mins'),
    s: document.getElementById('cd-secs'),
  };
  if (diff <= 0) {
    el.d.textContent = el.h.textContent = el.m.textContent = el.s.textContent = '00';
    return;
  }
  const sec = Math.floor(diff / 1000);
  el.d.textContent = pad(Math.floor(sec / 86400));
  el.h.textContent = pad(Math.floor((sec % 86400) / 3600));
  el.m.textContent = pad(Math.floor((sec % 3600) / 60));
  el.s.textContent = pad(sec % 60);
}
tickCountdown();
setInterval(tickCountdown, 1000);

/* ========= Scroll reveal ========= */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); revealObserver.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* Dekor floral: fade-in + mengambang saat section masuk viewport (sekali) */
const floralObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('floral-in'); floralObserver.unobserve(e.target); }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.section--floral').forEach((el) => floralObserver.observe(el));

/* ========= Gallery ========= */
const galleryGrid = document.getElementById('gallery-grid');
for (let i = 0; i < GALLERY_COUNT; i++) {
  const item = document.createElement('div');
  item.className = 'gallery-item';
  item.dataset.index = i;
  const img = document.createElement('img');
  img.loading = 'lazy';           // native: cuma diload saat mendekati viewport
  img.decoding = 'async';
  img.src = GALLERY_PHOTOS[i];
  img.alt = '';
  item.appendChild(img);
  galleryGrid.appendChild(item);
}

/* Dots navigasi + auto-slide */
const galleryDots = document.getElementById('gallery-dots');
const dots = [];
for (let i = 0; i < GALLERY_COUNT; i++) {
  const dot = document.createElement('button');
  dot.type = 'button';
  dot.setAttribute('role', 'tab');
  dot.setAttribute('aria-label', `Foto ${i + 1}`);
  if (i === 0) dot.classList.add('active');
  dot.addEventListener('click', () => goTo(i));
  galleryDots.appendChild(dot);
  dots.push(dot);
}
function currentIndex() {
  return Math.round(galleryGrid.scrollLeft / galleryGrid.clientWidth) % GALLERY_COUNT;
}
function goTo(i) {
  galleryGrid.scrollTo({ left: i * galleryGrid.clientWidth, behavior: 'smooth' });
}
function syncDots() {
  const i = currentIndex();
  dots.forEach((d, n) => d.classList.toggle('active', n === i));
}
let dotTick = false;
galleryGrid.addEventListener('scroll', () => {
  if (dotTick) return;
  dotTick = true;
  requestAnimationFrame(() => { syncDots(); dotTick = false; });
}, { passive: true });

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion) {
  const start = () => setInterval(() => goTo((currentIndex() + 1) % GALLERY_COUNT), 3500);
  let timer = start();
  galleryGrid.addEventListener('pointerdown', () => clearInterval(timer));
  galleryGrid.addEventListener('pointerup', () => { clearInterval(timer); timer = start(); });
}

/* ========= Copy to clipboard ========= */
document.querySelectorAll('.btn-copy').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const val = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(val);
    } catch {
      const t = document.createElement('textarea');
      t.value = val; document.body.appendChild(t); t.select();
      document.execCommand('copy'); t.remove();
    }
    const old = btn.textContent;
    btn.textContent = '✓ Tersalin!';
    setTimeout(() => { btn.textContent = old; }, 1600);
  });
});

/* ========= Background music ========= */
const music = document.getElementById('bg-music');
const musicBtn = document.getElementById('music-toggle');
let musicOn = false;
function setMusic(on) {
  musicOn = on;
  if (on) { music.play().catch(() => {}); musicBtn.classList.add('playing'); }
  else { music.pause(); musicBtn.classList.remove('playing'); }
}
musicBtn.addEventListener('click', () => setMusic(!musicOn));

/* Auto-stop musik saat pindah tab / keluar browser; lanjut saat kembali kalau tadinya nyala */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) music.pause();
  else if (musicOn) music.play().catch(() => {});
});
window.addEventListener('pagehide', () => music.pause());

/* ========= Opening animation ========= */
const cover = document.getElementById('cover');
const content = document.getElementById('content');
const openBtn = document.getElementById('open-btn');

// Buka cover -> tampilkan konten, mendarat di section 2 (scene). TANPA auto-advance.
function revealContent() {
  cover.classList.add('hidden');
  document.body.classList.remove('locked');
  content.setAttribute('aria-hidden', 'false');
  content.classList.add('visible');
  window.scrollTo(0, 0);
}

// Idle wobble setelah intro: pohon & bunga bergerak lembut, bulan mengambang.
function playSceneIdle() {
  if (!window.gsap) return;
  gsap.to('.scene-tree',   { rotation: '+=1.5', y: '-=6', transformOrigin: 'bottom center',
    duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.3 });
  gsap.to('.scene-flower', { y: '-=8', duration: 2.0, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.2 });
  gsap.to('.scene-moon',   { y: '+=6', duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
}

// Koreografi masuk scene (section 2). Reveal only; lanjut ke section 3 lewat scroll.
function playSceneIntro() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.gsap || reduced) return; // aset tampil statis di posisi CSS

  gsap.timeline({ onComplete: playSceneIdle })
    // 1) zoom out background gunung
    .from('.scene-bg', { scale: 1.2, duration: 1.6, ease: 'power2.out' }, 0)
    // 2) bulan turun sambil berputar dari atas
    .from('.scene-moon', { y: '-60vh', rotation: -220, opacity: 0, duration: 1.6, ease: 'power2.out' }, 0.3)
    // 3) pohon masuk dari samping + drift 45° ke atas (x luar + y bawah -> naik-menyerong)
    .from('.tree-l1', { x: '-45vw', y: '22vh', opacity: 0, duration: 1.4, ease: 'power2.out' }, 0.3)
    .from('.tree-l2', { x: '-60vw', y: '26vh', opacity: 0, duration: 1.5, ease: 'power2.out' }, 0.45)
    .from('.tree-r1', { x: '45vw',  y: '22vh', opacity: 0, duration: 1.4, ease: 'power2.out' }, 0.35)
    // 4) bunga muncul dari bawah, stagger (variasi warna dari aset)
    .from('.scene-flower', { y: '35vh', opacity: 0, duration: 1.1, stagger: 0.15, ease: 'back.out(1.5)' }, 0.6)
    // 5) penjor masuk terakhir dari kiri & kanan
    .from('.penjor-left',  { x: '-60vw', opacity: 0, duration: 1.0, ease: 'power3.out' }, '>-0.15')
    .from('.penjor-right', { x: '60vw',  opacity: 0, duration: 1.0, ease: 'power3.out' }, '<');
}

// Section 2 video: putar after-hero.mp4, nama pengantin fade-in setelah 18 detik.
function playSceneVideo() {
  const video = document.querySelector('.scene-video');
  const names = document.querySelector('.scene-names');
  const cue = document.querySelector('#scene .scroll-cue');
  if (!video || !names) return;

  let shown = false;
  const showNames = () => {
    if (shown) return;
    shown = true;
    names.classList.add('show');
    if (cue) cue.classList.add('show'); // navigasi scroll muncul berbarengan
  };

  video.play().catch(() => {}); // muted autoplay diizinkan browser
  // Ikat ke waktu video biar akurat walau buffering; fallback wall-clock 11s.
  video.addEventListener('timeupdate', () => { if (video.currentTime >= 11) showNames(); });
  setTimeout(showNames, 11000);
}

function openInvitation() {
  openBtn.disabled = true;
  // mulai lagu dari 2:30, SEBELUM play (biar tak loncat). Metadata mungkin sudah
  // dimuat loader (settle), jadi jangan cuma gantung event: cek readyState dulu.
  const seekStart = () => { music.currentTime = 189.3; };
  if (music.readyState >= 1) seekStart();
  else music.addEventListener('loadedmetadata', seekStart, { once: true });
  setMusic(true);
  musicBtn.classList.add('show');
  revealContent();
  playSceneVideo();
}
openBtn.addEventListener('click', openInvitation);

/* ========= Loading screen ========= */
/* Sembunyikan loader saat aset inti siap: window load (gambar + CSS bg) + video + musik.
   ponytail: hard cap 12s biar aset yang macet tak menjebak user. */
(function () {
  const loader = document.getElementById('loader');
  if (!loader) return;
  let done = false;
  const hide = () => {
    if (done) return;
    done = true;
    loader.classList.add('hidden');
    document.body.classList.remove('preloading');
  };

  const settle = (el) => new Promise((res) => {
    if (!el) return res();
    el.preload = 'auto';
    el.addEventListener('canplaythrough', res, { once: true });
    el.addEventListener('error', res, { once: true });
    el.load();
  });

  const loaded = document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise((res) => window.addEventListener('load', res, { once: true }));

  Promise.all([
    loaded,
    settle(document.querySelector('.scene-video')),
    settle(document.getElementById('bg-music')),
  ]).then(hide);

  setTimeout(hide, 12000);
})();
