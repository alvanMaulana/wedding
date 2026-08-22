/* Wishes → GET/POST /api/wishes */
(function () {
  const form = document.getElementById('wishes-form');
  const msg = document.getElementById('wish-msg');
  const submit = document.getElementById('wish-submit');
  const list = document.getElementById('wishes-list');
  const moreBtn = document.getElementById('wishes-more');

  const PAGE = 10;
  let shown = PAGE;
  let all = [];

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function timeAgo(iso) {
    const then = new Date(iso);
    const s = Math.floor((Date.now() - then) / 1000);
    if (s < 60) return 'baru saja';
    if (s < 3600) return `${Math.floor(s / 60)} menit lalu`;
    if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
    return `${Math.floor(s / 86400)} hari lalu`;
  }

  function render() {
    if (!all.length) {
      list.innerHTML = '<p class="wishes-empty">Belum ada ucapan. Jadilah yang pertama memberi doa. 🤍</p>';
      moreBtn.hidden = true;
      return;
    }
    list.innerHTML = all.slice(0, shown).map((w) => `
      <div class="wish">
        <div class="wish-head">
          <span class="wish-name">${esc(w.nama)}</span>
          <span class="wish-time">${timeAgo(w.created_at)}</span>
        </div>
        <p class="wish-msg">${esc(w.pesan)}</p>
      </div>
    `).join('');
    moreBtn.hidden = shown >= all.length;
  }

  async function load() {
    try {
      const { data, error } = await sb
        .from('wishes')
        .select('nama, pesan, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      all = data || [];
      render();
    } catch {
      list.innerHTML = '<p class="wishes-empty">Gagal memuat ucapan.</p>';
    }
  }

  moreBtn.addEventListener('click', () => { shown += PAGE; render(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.className = 'form-msg';
    msg.textContent = '';

    const nama = document.getElementById('wish-nama').value.trim();
    const pesan = document.getElementById('wish-pesan').value.trim();
    if (!nama || !pesan) {
      msg.textContent = 'Nama & pesan wajib diisi.';
      msg.classList.add('err');
      return;
    }

    submit.disabled = true;
    submit.textContent = 'Mengirim…';
    try {
      const { data: row, error } = await sb
        .from('wishes')
        .insert({ nama: nama.slice(0, 100), pesan: pesan.slice(0, 1000) })
        .select('nama, pesan, created_at')
        .single();
      if (error) throw error;
      all.unshift(row);
      shown++;
      render();
      msg.textContent = 'Terima kasih atas ucapan & doanya! 🌸';
      msg.classList.add('ok');
      form.reset();
    } catch {
      msg.textContent = 'Maaf, gagal mengirim. Coba lagi ya.';
      msg.classList.add('err');
    } finally {
      submit.disabled = false;
      submit.textContent = 'Kirim Ucapan';
    }
  });

  // Prefill nama dari ?to= (pakai helper bersama: &/spasi ga kepotong, title-case)
  const to = window.guestName ? window.guestName() : '';
  if (to && to !== 'Tamu Undangan') document.getElementById('wish-nama').value = to;

  load();
})();
