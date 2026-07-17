// ─── MAPA ODJELA — API SLOJ ─────────────────────────────────────────────────
// Tab "Mapa odjela" (18-karta-odjela.jsx / 19-MapaOdjelaView.jsx) je prenesen iz
// pogonboskrupa/sumarija i spaja se na ISTI Google Apps Script backend (primke/otpreme
// za status sječe/otpreme po odjelu, Šumarija Bosanska Krupa) — LIVE podaci, ne statična
// kopija. Taj backend traži username/password na svakom pozivu (Apps Script verifyUser),
// a Raspored-radnika ima potpuno drugačiji login (lokalni PIN po korisniku). Dogovoreno
// rješenje: dedicated nalog, ugrađen ovdje, koji svi korisnici ovog appa dijele isključivo
// za čitanje podataka za mapu — ne predstavlja login trenutno prijavljenog korisnika appa.
const MAPA_API_URL  = 'https://script.google.com/macros/s/AKfycbz__4umdSqKd0o81TnDgdtHufd0FcaT-1E2oLq9pcHqfWPjVgIA9WZDz6-O4ta_fiUR/exec';
const MAPA_API_USER = 'NedimCehic';
const MAPA_API_PASS = '2501';

function buildApiUrl(path, additionalParams) {
  const params = new URLSearchParams();
  params.append('path', path);
  params.append('username', MAPA_API_USER);
  params.append('password', MAPA_API_PASS);
  if (additionalParams) {
    for (const [key, value] of Object.entries(additionalParams)) {
      if (value !== null && value !== undefined) params.append(key, value);
    }
  }
  return `${MAPA_API_URL}?${params.toString()}`;
}
window.buildApiUrl = buildApiUrl;

// Raspored-radnika nema poseban cache sloj (za razliku od sumarija appa) — obični
// fetch+JSON, uz upis posljednjeg uspješnog odgovora u localStorage pod cacheKey.
// karta-odjela.js sam čita taj localStorage zapis kao fallback ako ovaj fetch baci
// grešku (offline/timeout), pa ga ovdje samo popunjavamo u istom obliku ({data, ts}).
async function fetchWithCache(url, cacheKey, forceRefresh, timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout || 60000);
  try {
    const resp = await fetch(url, { signal: controller.signal });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();
    try { localStorage.setItem(cacheKey, JSON.stringify({ data, ts: Date.now() })); } catch (e) {}
    return data;
  } finally {
    clearTimeout(timer);
  }
}
window.fetchWithCache = fetchWithCache;
