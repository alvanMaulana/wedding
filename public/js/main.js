/* ========= Config ========= */
const EVENT_DATE = new Date('2026-09-28T13:00:00+07:00'); // Akad, WIB
const GALLERY_PHOTOS = [
  'assets/photos/IMG_0823.webp',
  'assets/photos/IMG_0825.webp',
  'assets/photos/IMG_0840.webp',
  'assets/photos/IMG_0844.webp',
  'assets/photos/IMG_0845.webp',
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

/* ========= Gallery + lightbox ========= */
const galleryGrid = document.getElementById('gallery-grid');
for (let i = 0; i < GALLERY_COUNT; i++) {
  const item = document.createElement('div');
  item.className = 'gallery-item';
  item.style.backgroundImage = `url('${GALLERY_PHOTOS[i]}')`;
  item.dataset.index = i;
  galleryGrid.appendChild(item);
}

const lb = document.getElementById('lightbox');
const lbStage = document.getElementById('lb-stage');
let lbIndex = 0;
function renderLb() {
  lbStage.style.backgroundImage = `url('${GALLERY_PHOTOS[lbIndex]}')`;
}
function openLb(i) {
  lbIndex = i;
  renderLb();
  lb.hidden = false;
  requestAnimationFrame(() => lb.classList.add('open'));
}
function closeLb() {
  lb.classList.remove('open');
  setTimeout(() => { lb.hidden = true; }, 300);
}
function stepLb(dir) { lbIndex = (lbIndex + dir + GALLERY_COUNT) % GALLERY_COUNT; renderLb(); }

galleryGrid.addEventListener('click', (e) => {
  const item = e.target.closest('.gallery-item');
  if (item) openLb(Number(item.dataset.index));
});
document.getElementById('lb-close').addEventListener('click', closeLb);
document.getElementById('lb-prev').addEventListener('click', () => stepLb(-1));
document.getElementById('lb-next').addEventListener('click', () => stepLb(1));
lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
document.addEventListener('keydown', (e) => {
  if (lb.hidden) return;
  if (e.key === 'Escape') closeLb();
  if (e.key === 'ArrowLeft') stepLb(-1);
  if (e.key === 'ArrowRight') stepLb(1);
});

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
  // mulai lagu dari detik 3 (sekali, pas metadata siap; pause/play berikutnya tak reset)
  music.addEventListener('loadedmetadata', () => { music.currentTime = 3.5; }, { once: true });
  setMusic(true);
  musicBtn.classList.add('show');
  revealContent();
  playSceneVideo();
}
openBtn.addEventListener('click', openInvitation);
