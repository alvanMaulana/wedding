/* Supabase client — isi URL & anon key dari dashboard project kamu.
   Anon key memang publik (aman); keamanan dijaga oleh RLS di Supabase.
   Lihat SUPABASE.md untuk SQL tabel + policy. */
const SUPABASE_URL = 'https://tfpijnbiewvnrqumvxab.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_TaFhA25Bh1C90dB16pKJWw_MzxhGwEq';

window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
