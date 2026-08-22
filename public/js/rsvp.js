/* RSVP form → POST /api/rsvp */
(function () {
  const form = document.getElementById('rsvp-form');
  const msg = document.getElementById('rsvp-msg');
  const submit = document.getElementById('rsvp-submit');
  const jumlahWrap = document.getElementById('jumlah-wrap');

  // Prefill nama dari ?to= (pakai helper bersama: &/spasi ga kepotong, title-case)
  const to = window.guestName ? window.guestName() : '';
  if (to && to !== 'Tamu Undangan') document.getElementById('rsvp-nama').value = to;

  // Sembunyikan jumlah tamu jika "tidak hadir"
  function syncJumlah() {
    const hadir = form.querySelector('input[name="kehadiran"]:checked').value === 'hadir';
    jumlahWrap.style.display = hadir ? '' : 'none';
  }
  form.querySelectorAll('input[name="kehadiran"]').forEach((r) => r.addEventListener('change', syncJumlah));
  syncJumlah();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.className = 'form-msg';
    msg.textContent = '';

    const nama = document.getElementById('rsvp-nama').value.trim();
    const kehadiran = form.querySelector('input[name="kehadiran"]:checked').value;
    const jumlah_tamu = document.getElementById('rsvp-jumlah').value;

    if (!nama) {
      msg.textContent = 'Nama wajib diisi.';
      msg.classList.add('err');
      return;
    }

    submit.disabled = true;
    submit.textContent = 'Mengirim…';
    try {
      const jumlah = kehadiran === 'hadir' ? Math.max(1, parseInt(jumlah_tamu, 10) || 1) : 0;
      const { error } = await sb.from('rsvp').insert({ nama: nama.slice(0, 100), kehadiran, jumlah_tamu: jumlah });
      if (error) throw error;
      msg.textContent = kehadiran === 'hadir'
        ? 'Terima kasih! Konfirmasi kehadiran Anda tersimpan. 🌸'
        : 'Terima kasih atas konfirmasinya. Kami tetap mendoakan yang terbaik. 🤍';
      msg.classList.add('ok');
      form.reset();
      syncJumlah();
    } catch (err) {
      msg.textContent = 'Maaf, terjadi kesalahan. Coba lagi ya.';
      msg.classList.add('err');
    } finally {
      submit.disabled = false;
      submit.textContent = 'Kirim Konfirmasi';
    }
  });
})();
