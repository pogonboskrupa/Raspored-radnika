const { useState, useEffect, useCallback, useMemo, useRef } = React;

// ─── TOAST NOTIFIKACIJE ─────────────────────────────────────────────────────
// Globalni sistem za prikazivanje grešaka korisniku
const _toastListeners = [];
let _toastId = 0;

function showToast(message, type = 'error', duration = 5000) {
  const id = ++_toastId;
  const toast = { id, message, type, duration };
  _toastListeners.forEach(fn => fn(toast));
  return id;
}

function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (toast) => {
      setToasts(prev => [...prev, toast]);
      if (toast.duration > 0) {
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toast.id)), toast.duration);
      }
    };
    _toastListeners.push(handler);
    return () => { const i = _toastListeners.indexOf(handler); if (i >= 0) _toastListeners.splice(i, 1); };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div style={{position:'fixed',bottom:20,right:20,zIndex:99999,display:'flex',flexDirection:'column',gap:8,maxWidth:360}}>
      {toasts.map(t => (
        <div key={t.id} style={{
          padding:'0.6rem 1rem',borderRadius:10,fontSize:'0.8rem',fontWeight:600,
          boxShadow:'0 4px 20px rgba(0,0,0,0.18)',animation:'fadeIn 0.2s ease',
          display:'flex',alignItems:'center',gap:8,
          background: t.type === 'error' ? '#fde8e8' : t.type === 'warn' ? '#fef3cd' : '#e8f5e9',
          color: t.type === 'error' ? '#c53030' : t.type === 'warn' ? '#856404' : '#2d5a27',
          border: `1px solid ${t.type === 'error' ? '#f5c6cb' : t.type === 'warn' ? '#ffeeba' : '#c3e6cb'}`
        }}>
          <span>{t.type === 'error' ? '⚠️' : t.type === 'warn' ? '⚡' : '✅'}</span>
          <span style={{flex:1}}>{t.message}</span>
          <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
            style={{background:'none',border:'none',cursor:'pointer',fontSize:'1rem',opacity:0.5,padding:0}}>×</button>
        </div>
      ))}
    </div>
  );
}

// ─── DEMO DATA ───────────────────────────────────────────────────────────────
// Kategorije radnika u šumariji
const WORKER_CATEGORIES = [
  { id: 'primac_panj',      label: 'Primači na šuma panju',        short: 'Primač',      icon: '🌳', color: '#2d5a27', pale: '#e8f0e6', border: '#9bc492' },
  { id: 'poslovoda_isk',    label: 'Poslovođa iskorištavanja šuma', short: 'Posl/Isk',    icon: '🪵', color: '#7a3b00', pale: '#fdf0e0', border: '#e8c17a' },
  { id: 'poslovoda_uzg',    label: 'Poslovođa uzgoja',             short: 'Posl/Uzg',    icon: '🌱', color: '#1a5a2d', pale: '#e6f5ea', border: '#7bc492' },
  { id: 'otpremac',         label: 'Otpremač',                     short: 'Otpremač',    icon: '🚛', color: '#6b3080', pale: '#f0e8f5', border: '#c4a0d8' },
  { id: 'radnik_primka',    label: 'Radnici u primci',             short: 'Radnik/P',    icon: '📋', color: '#b5620a', pale: '#fdf0e0', border: '#e8c17a' },
  { id: 'pomocni',          label: 'Pomoćni radnici',              short: 'Pomoćni',     icon: '🔧', color: '#1a3d5c', pale: '#e4edf5', border: '#9bbfd9' },
  { id: 'vlastita_rezija',  label: 'Vlastita režija',              short: 'Vlast.Režija', icon: '⚙️', color: '#5a3d00', pale: '#fdf5e8', border: '#d4b06a' },
  { id: 'vozac',            label: 'Vozači',                       short: 'Vozač',        icon: '🚗', color: '#2a6478', pale: '#e4f0f5', border: '#8bbdd4' },
  // legacy — kept for backwards compat
  { id: 'poslovoda',        label: 'Poslovođa',                    short: 'Poslovođa',   icon: '📎', color: '#5a4a00', pale: '#fdf8e0', border: '#d4c060' },
];

// Columns shown in the Spisak tab (ordered)
const SPISAK_COLUMNS = [
  'primac_panj', 'poslovoda_isk', 'poslovoda_uzg', 'otpremac', 'radnik_primka', 'pomocni', 'vlastita_rezija', 'vozac'
];

const getCatById = id => WORKER_CATEGORIES.find(c => c.id === id);

const INITIAL_WORKERS = [
  // PRIMAČI (kolona B)
  { id: 'w1',  name: 'Tulić Amir',            status: 'aktivan',   category: 'primac_panj',   phone: '', note: '' },
  { id: 'w2',  name: 'Sefić Almir',           status: 'aktivan',   category: 'primac_panj',   phone: '', note: '' },
  { id: 'w3',  name: 'Velagić Jasmin',        status: 'aktivan',   category: 'primac_panj',   phone: '', note: '' },
  { id: 'w4',  name: 'Čehić Nedžad',          status: 'aktivan',   category: 'primac_panj',   phone: '', note: '' },
  { id: 'w5',  name: 'Duraković Arslan',      status: 'aktivan',   category: 'primac_panj',   phone: '', note: '' },
  { id: 'w6',  name: 'Musić Adnan',           status: 'aktivan',   category: 'primac_panj',   phone: '', note: '' },
  { id: 'w7',  name: 'Salkić Adnan',          status: 'aktivan',   category: 'primac_panj',   phone: '', note: '' },
  { id: 'w8',  name: 'Salkić Jasmin',         status: 'aktivan',   category: 'primac_panj',   phone: '', note: '' },
  // OTPREMAČI (kolona C)
  { id: 'w9',  name: 'Arnautović Almir',      status: 'aktivan',   category: 'otpremac',      phone: '', note: '' },
  { id: 'w10', name: 'Čehajić Hasan',         status: 'aktivan',   category: 'otpremac',      phone: '', note: '' },
  { id: 'w11', name: 'Šabić Reuf',            status: 'aktivan',   category: 'otpremac',      phone: '', note: '' },
  { id: 'w12', name: 'Alidžanović Elvis',     status: 'aktivan',   category: 'otpremac',      phone: '', note: '' },
  { id: 'w13', name: 'Hadžipašić Ibrahim',    status: 'aktivan',   category: 'otpremac',      phone: '', note: '' },
  // POSLOVOĐE (kolona D)
  { id: 'w14', name: 'Porić Jasmin',          status: 'aktivan',   category: 'poslovoda_isk', phone: '', note: '' },
  { id: 'w15', name: 'Harbaš Mehmedalija',    status: 'aktivan',   category: 'poslovoda_isk', phone: '', note: '' },
  { id: 'w16', name: 'Hadžipašić Irfan',      status: 'aktivan',   category: 'poslovoda_isk', phone: '', note: '' },
  { id: 'w17', name: 'Eljazović Amir',        status: 'aktivan',   category: 'poslovoda_isk', phone: '', note: '' },
  { id: 'w18', name: 'Kovačević Nurija',      status: 'aktivan',   category: 'poslovoda_isk', phone: '', note: '' },
  { id: 'w19', name: 'Bećirević Omer',        status: 'aktivan',   category: 'poslovoda_isk', phone: '', note: '' },
  { id: 'w20', name: 'Arnautović Mustafa',    status: 'aktivan',   category: 'poslovoda_isk', phone: '', note: '' },
  // RADNICI U PRIMCI (kolona E - idu sa primačem)
  { id: 'w21', name: 'Đulić Jasmin',          status: 'aktivan',   category: 'radnik_primka', phone: '', note: '' },
  { id: 'w22', name: 'Mahmutović Mirza',      status: 'aktivan',   category: 'radnik_primka', phone: '', note: '' },
  { id: 'w23', name: 'Jezerkić Reonaldo',     status: 'aktivan',   category: 'radnik_primka', phone: '', note: '' },
  { id: 'w24', name: 'Hajrudinović Ajdin',    status: 'aktivan',   category: 'radnik_primka', phone: '', note: '' },
  { id: 'w25', name: 'Došen Goran',           status: 'aktivan',   category: 'radnik_primka', phone: '', note: '' },
  // POMOĆNI RADNICI
  { id: 'w26', name: 'Hadžić Jasmin',         status: 'aktivan',   category: 'pomocni',       phone: '', note: '' },
  { id: 'w27', name: 'Arnautović Samir',      status: 'aktivan',   category: 'pomocni',       phone: '', note: '' },
  { id: 'w28', name: 'Rekić Emir',            status: 'aktivan',   category: 'pomocni',       phone: '', note: '' },
  { id: 'w29', name: 'Rekić Ahmet Kubi',      status: 'aktivan',   category: 'pomocni',       phone: '', note: '' },
  { id: 'w30', name: 'Gerzić Sabit',          status: 'aktivan',   category: 'pomocni',       phone: '', note: '' },
];

const GOSPODARSKE_JEDINICE = [
  'RISOVAC KRUPA',
  'GRMEČ JASENICA',
  'VOJSKOVA',
  'BAŠTRA ĆORKOVAČA',
  'GOMILA',
];

const INITIAL_DEPARTMENTS = [];

const JOB_TYPES = ['Primka', 'Otprema', 'Teren', 'Kancelarija', 'Prerada', 'Pošumljavanje', 'Doznaka stabala', 'Sektor ekologije', 'Kiša', 'Farbanje sjekačkih linija', 'Ostalo'];

const today = () => new Date().toISOString().split('T')[0];
const yesterday = () => { const d = new Date(); d.setDate(d.getDate()-1); return d.toISOString().split('T')[0]; };
const uid = () => Math.random().toString(36).slice(2,10);

function makeInitialSchedules() {
  return [];
}

// ─── STORAGE ─────────────────────────────────────────────────────────────────
const DATA_VERSION = 'v5';

// Firebase ref helper
const fbRef = (key) => FIREBASE_ENABLED ? firebase.database().ref('sumarija/' + key) : null;

// useStorage: ako je Firebase dostupan, sync s Firebase; inače localStorage
function useStorage(key, init) {
  const [val, setVal] = useState(() => {
    try {
      if (key === 'sumarija_workers') {
        const savedVer = localStorage.getItem('sumarija_data_version');
        if (savedVer !== DATA_VERSION) {
          localStorage.setItem('sumarija_data_version', DATA_VERSION);
          localStorage.removeItem('sumarija_workers');
          return init;
        }
      }
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : init;
    } catch (e) {
      console.error('localStorage čitanje neuspjelo za ' + key, e);
      showToast('Greška pri čitanju lokalnih podataka (' + key.replace('sumarija_', '') + ')', 'warn');
      return init;
    }
  });

  const safeLocalWrite = useCallback((k, data) => {
    try {
      localStorage.setItem(k, JSON.stringify(data));
    } catch (e) {
      console.error('localStorage pisanje neuspjelo za ' + k, e);
      showToast('Podaci NISU spašeni lokalno — memorija puna ili nedostupna!', 'error');
    }
  }, []);

  // Firebase real-time listener
  useEffect(() => {
    if (!FIREBASE_ENABLED) return;
    const ref = fbRef(key);
    const handler = ref.on('value', snap => {
      const data = snap.val();
      if (data !== null && data !== undefined) {
        try {
          const parsed = typeof data === 'string' ? JSON.parse(data) : data;
          setVal(parsed);
          safeLocalWrite(key, parsed);
        } catch (e) {
          console.error('Firebase parse greška za ' + key, e);
          showToast('Greška pri obradi podataka sa servera (' + key.replace('sumarija_', '') + ')', 'error');
        }
      }
    }, (error) => {
      console.error('Firebase listener greška za ' + key, error);
      showToast('Izgubljena veza sa serverom — radite u offline modu', 'warn');
    });
    return () => ref.off('value', handler);
  }, [key]);

  // Write to Firebase + localStorage on change
  const setValAndSync = useCallback((updater) => {
    setVal(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      safeLocalWrite(key, next);
      if (FIREBASE_ENABLED) {
        fbRef(key).set(JSON.stringify(next)).catch(e => {
          console.error('Firebase pisanje neuspjelo za ' + key, e);
          showToast('Podaci NISU spašeni na server! Provjerite internet vezu.', 'error');
        });
      }
      return next;
    });
  }, [key, safeLocalWrite]);

  return [val, FIREBASE_ENABLED ? setValAndSync : (updater) => {
    setVal(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      safeLocalWrite(key, next);
      return next;
    });
  }];
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const jobBadgeClass = t => {
  if (t === 'Primka') return 'badge badge-primka';
  if (t === 'Doznaka stabala') return 'badge badge-priprema';
  if (t === 'Priprema proizvodnje') return 'badge badge-priprema'; // backward compat
  if (t === 'Pošumljavanje') return 'badge badge-posumljavanje';
  if (t === 'Prerada') return 'badge badge-prerada';
  if (t === 'Otprema') return 'badge badge-otprema';
  if (t === 'Sektor ekologije') return 'badge badge-ekologija';
  if (t === 'Kancelarija') return 'badge badge-kancelarija';
  if (t === 'Teren') return 'badge badge-teren';
  if (t === 'Kiša') return 'badge badge-kisa';
  if (t === 'Farbanje sjekačkih linija') return 'badge badge-farbanje';
  return 'badge badge-ostalo';
};

const fmtDate = d => {
  if (!d) return '';
  const [y,m,dd] = d.split('-');
  return `${dd}.${m}.${y}`;
};
const fmtTime = ts => {
  const d = new Date(ts);
  return d.toLocaleTimeString('bs-BA', { hour:'2-digit', minute:'2-digit' });
};

