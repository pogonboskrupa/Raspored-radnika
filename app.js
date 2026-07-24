"use strict";

const {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef
} = React;

// ─── TOAST NOTIFIKACIJE ─────────────────────────────────────────────────────
// Globalni sistem za prikazivanje grešaka korisniku
const _toastListeners = [];
let _toastId = 0;
function showToast(message) {
  let type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'error';
  let duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 5000;
  const id = ++_toastId;
  const toast = {
    id,
    message,
    type,
    duration
  };
  _toastListeners.forEach(fn => fn(toast));
  return id;
}
function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const handler = toast => {
      setToasts(prev => [...prev, toast]);
      if (toast.duration > 0) {
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toast.id)), toast.duration);
      }
    };
    _toastListeners.push(handler);
    return () => {
      const i = _toastListeners.indexOf(handler);
      if (i >= 0) _toastListeners.splice(i, 1);
    };
  }, []);
  if (toasts.length === 0) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      maxWidth: 360
    }
  }, toasts.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    style: {
      padding: '0.6rem 1rem',
      borderRadius: 10,
      fontSize: '0.8rem',
      fontWeight: 600,
      boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
      animation: 'fadeIn 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: t.type === 'error' ? '#fde8e8' : t.type === 'warn' ? '#fef3cd' : '#e8f5e9',
      color: t.type === 'error' ? '#c53030' : t.type === 'warn' ? '#856404' : '#2d5a27',
      border: `1px solid ${t.type === 'error' ? '#f5c6cb' : t.type === 'warn' ? '#ffeeba' : '#c3e6cb'}`
    }
  }, /*#__PURE__*/React.createElement("span", null, t.type === 'error' ? '⚠️' : t.type === 'warn' ? '⚡' : '✅'), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, t.message), /*#__PURE__*/React.createElement("button", {
    onClick: () => setToasts(prev => prev.filter(x => x.id !== t.id)),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      opacity: 0.5,
      padding: 0
    }
  }, "\xD7"))));
}

// ─── DEMO DATA ───────────────────────────────────────────────────────────────
// Kategorije radnika u šumariji
const WORKER_CATEGORIES = [{
  id: 'primac_panj',
  label: 'Primači na šuma panju',
  short: 'Primač',
  icon: '🌳',
  color: '#2d5a27',
  pale: '#e8f0e6',
  border: '#9bc492'
}, {
  id: 'poslovoda_isk',
  label: 'Poslovođa iskorištavanja šuma',
  short: 'Posl/Isk',
  icon: '🪵',
  color: '#7a3b00',
  pale: '#fdf0e0',
  border: '#e8c17a'
}, {
  id: 'poslovoda_uzg',
  label: 'Poslovođa uzgoja',
  short: 'Posl/Uzg',
  icon: '🌱',
  color: '#1a5a2d',
  pale: '#e6f5ea',
  border: '#7bc492'
}, {
  id: 'otpremac',
  label: 'Otpremač',
  short: 'Otpremač',
  icon: '🚛',
  color: '#6b3080',
  pale: '#f0e8f5',
  border: '#c4a0d8'
}, {
  id: 'radnik_primka',
  label: 'Radnici u primci',
  short: 'Radnik/P',
  icon: '📋',
  color: '#b5620a',
  pale: '#fdf0e0',
  border: '#e8c17a'
}, {
  id: 'pomocni',
  label: 'Pomoćni radnici',
  short: 'Pomoćni',
  icon: '🔧',
  color: '#1a3d5c',
  pale: '#e4edf5',
  border: '#9bbfd9'
}, {
  id: 'vlastita_rezija',
  label: 'Vlastita režija',
  short: 'Vlast.Režija',
  icon: '⚙️',
  color: '#5a3d00',
  pale: '#fdf5e8',
  border: '#d4b06a'
}, {
  id: 'vozac',
  label: 'Vozači',
  short: 'Vozač',
  icon: '🚗',
  color: '#2a6478',
  pale: '#e4f0f5',
  border: '#8bbdd4'
},
// legacy — kept for backwards compat
{
  id: 'poslovoda',
  label: 'Poslovođa',
  short: 'Poslovođa',
  icon: '📎',
  color: '#5a4a00',
  pale: '#fdf8e0',
  border: '#d4c060'
}];

// Columns shown in the Spisak tab (ordered)
const SPISAK_COLUMNS = ['primac_panj', 'poslovoda_isk', 'poslovoda_uzg', 'otpremac', 'radnik_primka', 'pomocni', 'vlastita_rezija', 'vozac'];
const getCatById = id => WORKER_CATEGORIES.find(c => c.id === id);
const INITIAL_WORKERS = [
// PRIMAČI (kolona B)
{
  id: 'w1',
  name: 'Tulić Amir',
  status: 'aktivan',
  category: 'primac_panj',
  phone: '',
  note: ''
}, {
  id: 'w2',
  name: 'Sefić Almir',
  status: 'aktivan',
  category: 'primac_panj',
  phone: '',
  note: ''
}, {
  id: 'w3',
  name: 'Velagić Jasmin',
  status: 'aktivan',
  category: 'primac_panj',
  phone: '',
  note: ''
}, {
  id: 'w4',
  name: 'Čehić Nedžad',
  status: 'aktivan',
  category: 'primac_panj',
  phone: '',
  note: ''
}, {
  id: 'w5',
  name: 'Duraković Arslan',
  status: 'aktivan',
  category: 'primac_panj',
  phone: '',
  note: ''
}, {
  id: 'w6',
  name: 'Musić Adnan',
  status: 'aktivan',
  category: 'primac_panj',
  phone: '',
  note: ''
}, {
  id: 'w7',
  name: 'Salkić Adnan',
  status: 'aktivan',
  category: 'primac_panj',
  phone: '',
  note: ''
}, {
  id: 'w8',
  name: 'Salkić Jasmin',
  status: 'aktivan',
  category: 'primac_panj',
  phone: '',
  note: ''
},
// OTPREMAČI (kolona C)
{
  id: 'w9',
  name: 'Arnautović Almir',
  status: 'aktivan',
  category: 'otpremac',
  phone: '',
  note: ''
}, {
  id: 'w10',
  name: 'Čehajić Hasan',
  status: 'aktivan',
  category: 'otpremac',
  phone: '',
  note: ''
}, {
  id: 'w11',
  name: 'Šabić Reuf',
  status: 'aktivan',
  category: 'otpremac',
  phone: '',
  note: ''
}, {
  id: 'w12',
  name: 'Alidžanović Elvis',
  status: 'aktivan',
  category: 'otpremac',
  phone: '',
  note: ''
}, {
  id: 'w13',
  name: 'Hadžipašić Ibrahim',
  status: 'aktivan',
  category: 'otpremac',
  phone: '',
  note: ''
},
// POSLOVOĐE (kolona D)
{
  id: 'w14',
  name: 'Porić Jasmin',
  status: 'aktivan',
  category: 'poslovoda_isk',
  phone: '',
  note: ''
}, {
  id: 'w15',
  name: 'Harbaš Mehmedalija',
  status: 'aktivan',
  category: 'poslovoda_isk',
  phone: '',
  note: ''
}, {
  id: 'w16',
  name: 'Hadžipašić Irfan',
  status: 'aktivan',
  category: 'poslovoda_isk',
  phone: '',
  note: ''
}, {
  id: 'w17',
  name: 'Eljazović Amir',
  status: 'aktivan',
  category: 'poslovoda_isk',
  phone: '',
  note: ''
}, {
  id: 'w18',
  name: 'Kovačević Nurija',
  status: 'aktivan',
  category: 'poslovoda_isk',
  phone: '',
  note: ''
}, {
  id: 'w19',
  name: 'Bećirević Omer',
  status: 'aktivan',
  category: 'poslovoda_isk',
  phone: '',
  note: ''
}, {
  id: 'w20',
  name: 'Arnautović Mustafa',
  status: 'aktivan',
  category: 'poslovoda_isk',
  phone: '',
  note: ''
},
// RADNICI U PRIMCI (kolona E - idu sa primačem)
{
  id: 'w21',
  name: 'Đulić Jasmin',
  status: 'aktivan',
  category: 'radnik_primka',
  phone: '',
  note: ''
}, {
  id: 'w22',
  name: 'Mahmutović Mirza',
  status: 'aktivan',
  category: 'radnik_primka',
  phone: '',
  note: ''
}, {
  id: 'w23',
  name: 'Jezerkić Reonaldo',
  status: 'aktivan',
  category: 'radnik_primka',
  phone: '',
  note: ''
}, {
  id: 'w24',
  name: 'Hajrudinović Ajdin',
  status: 'aktivan',
  category: 'radnik_primka',
  phone: '',
  note: ''
}, {
  id: 'w25',
  name: 'Došen Goran',
  status: 'aktivan',
  category: 'radnik_primka',
  phone: '',
  note: ''
},
// POMOĆNI RADNICI
{
  id: 'w26',
  name: 'Hadžić Jasmin',
  status: 'aktivan',
  category: 'pomocni',
  phone: '',
  note: ''
}, {
  id: 'w27',
  name: 'Arnautović Samir',
  status: 'aktivan',
  category: 'pomocni',
  phone: '',
  note: ''
}, {
  id: 'w28',
  name: 'Rekić Emir',
  status: 'aktivan',
  category: 'pomocni',
  phone: '',
  note: ''
}, {
  id: 'w29',
  name: 'Rekić Ahmet Kubi',
  status: 'aktivan',
  category: 'pomocni',
  phone: '',
  note: ''
}, {
  id: 'w30',
  name: 'Gerzić Sabit',
  status: 'aktivan',
  category: 'pomocni',
  phone: '',
  note: ''
}];
const GOSPODARSKE_JEDINICE = ['RISOVAC KRUPA', 'GRMEČ JASENICA', 'VOJSKOVA', 'BAŠTRA ĆORKOVAČA', 'GOMILA'];
const INITIAL_DEPARTMENTS = [];
const JOB_TYPES = ['Primka', 'Otprema', 'Teren', 'Kancelarija', 'Prerada', 'Pošumljavanje', 'Doznaka stabala', 'Sektor ekologije', 'Kiša', 'Farbanje sjekačkih linija', 'Ostalo'];
const APP_VERSION = '1.1.0';

// Koliko dana čuvamo redove rasporeda kamiona prije automatskog čišćenja
const TRUCK_RETENTION_DAYS = 90;

// ─── SORTIMENTI (dijeli šifre polja sa DISPOZICIJE aplikacijom — dispozicije-krupa) ──
const SORTIMENT_FIELDS = ['tc', 'rud', 'cd', 'cc', 'tl', 'fl', 'oc', 'od'];
const SORTIMENT_LABELS = {
  tc: 'Trupci Č',
  rud: 'Rudno/RD',
  cd: 'Cel.Duga',
  cc: 'Cel.Cij.',
  tl: 'Trupci L',
  fl: 'F/L',
  oc: 'Ogr.Cij.',
  od: 'Ogr.Dugi'
};

// YYYY-MM-DD iz LOKALNIH komponenti datuma — toISOString() vraća UTC i zna
// pomjeriti datum unazad za jedan dan istočno od Greenwicha (npr. Bosna,
// UTC+1/+2), naročito u ranim jutarnjim satima po lokalnom vremenu.
const ymdLocal = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const today = () => ymdLocal(new Date());
const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return ymdLocal(d);
};
const nextWorkingDay = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (d.getDay() === 0) d.setDate(d.getDate() + 1);
  return ymdLocal(d);
};
const uid = () => Math.random().toString(36).slice(2, 10);

// ─── DISPOZICIJE (read-only sync sa dispozicije-krupa Firestore projektom) ────────
// Balans identičan getBalance() iz DISPOZICIJE aplikacije: original - suma otprema po disp_id.
function getDispBalance(disp, otpreme) {
  const spent = {};
  SORTIMENT_FIELDS.forEach(f => spent[f] = 0);
  otpreme.filter(o => o.disp_id === disp.id).forEach(o => {
    SORTIMENT_FIELDS.forEach(f => spent[f] += o[f] || 0);
  });
  const bal = {};
  SORTIMENT_FIELDS.forEach(f => bal[f] = (disp[f] || 0) - spent[f]);
  return bal;
}

// Hook koji čita live podatke koje puni window.__dispData (vidi index.html, modularni Firestore listener)
function useDispozicijeData() {
  const [data, setData] = useState(() => window.__dispData ? {
    ...window.__dispData
  } : {
    dispozicije: [],
    otpreme: [],
    ready: false
  });
  useEffect(() => {
    window.__dispListeners = window.__dispListeners || [];
    const handler = d => setData({
      ...d
    });
    window.__dispListeners.push(handler);
    if (window.__dispData) handler(window.__dispData);
    return () => {
      window.__dispListeners = window.__dispListeners.filter(h => h !== handler);
    };
  }, []);
  return data;
}
function makeInitialSchedules() {
  return [];
}

// ─── STORAGE ─────────────────────────────────────────────────────────────────
const DATA_VERSION = 'v5';

// Firebase ref helper
const fbRef = key => FIREBASE_ENABLED ? firebase.database().ref('sumarija/' + key) : null;

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
    }, error => {
      console.error('Firebase listener greška za ' + key, error);
      showToast('Izgubljena veza sa serverom — radite u offline modu', 'warn');
    });
    return () => ref.off('value', handler);
  }, [key]);

  // Write to Firebase + localStorage on change
  const setValAndSync = useCallback(updater => {
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
  return [val, FIREBASE_ENABLED ? setValAndSync : updater => {
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
  const [y, m, dd] = d.split('-');
  return `${dd}.${m}.${y}`;
};
const fmtTime = ts => {
  const d = new Date(ts);
  return d.toLocaleTimeString('bs-BA', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// ─── ERROR BOUNDARY ─────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({
      errorInfo
    });
    console.error('ErrorBoundary uhvatio grešku:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #fde8e8 0%, #fff5f5 100%)',
          padding: '1rem'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          background: 'white',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          padding: '2rem',
          maxWidth: 480,
          width: '100%',
          textAlign: 'center'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '3rem',
          marginBottom: '0.5rem'
        }
      }, "\u26A0\uFE0F"), /*#__PURE__*/React.createElement("h2", {
        style: {
          margin: '0 0 0.5rem',
          color: '#c53030',
          fontSize: '1.1rem',
          fontFamily: 'var(--mono)'
        }
      }, "Do\u0161lo je do gre\u0161ke"), /*#__PURE__*/React.createElement("p", {
        style: {
          color: '#666',
          fontSize: '0.85rem',
          margin: '0 0 1rem',
          lineHeight: 1.5
        }
      }, "Aplikacija je nai\u0161la na neo\u010Dekivanu gre\u0161ku. Va\u0161i podaci su sigurni."), /*#__PURE__*/React.createElement("details", {
        style: {
          textAlign: 'left',
          marginBottom: '1rem',
          background: '#f8f8f8',
          borderRadius: 8,
          padding: '0.5rem 0.75rem',
          fontSize: '0.72rem'
        }
      }, /*#__PURE__*/React.createElement("summary", {
        style: {
          cursor: 'pointer',
          fontWeight: 600,
          color: '#888',
          marginBottom: '0.25rem'
        }
      }, "Tehni\u010Dki detalji"), /*#__PURE__*/React.createElement("pre", {
        style: {
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          color: '#c53030',
          margin: '0.25rem 0',
          maxHeight: 200,
          overflow: 'auto'
        }
      }, this.state.error && this.state.error.toString(), this.state.errorInfo && this.state.errorInfo.componentStack)), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 8,
          justifyContent: 'center'
        }
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => this.setState({
          hasError: false,
          error: null,
          errorInfo: null
        }),
        style: {
          padding: '0.6rem 1.2rem',
          background: 'var(--green, #2d5a27)',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          fontSize: '0.85rem',
          fontWeight: 700,
          cursor: 'pointer'
        }
      }, "Poku\u0161aj ponovo"), /*#__PURE__*/React.createElement("button", {
        onClick: () => window.location.reload(),
        style: {
          padding: '0.6rem 1.2rem',
          background: '#e2e8f0',
          color: '#4a5568',
          border: 'none',
          borderRadius: 8,
          fontSize: '0.85rem',
          fontWeight: 700,
          cursor: 'pointer'
        }
      }, "Osvje\u017Ei stranicu"))));
    }
    return this.props.children;
  }
}
// ─── LOGIN / AUTH ────────────────────────────────────────────────────────────
const AUTH_SESSION_KEY = 'sumarija_session';
const AUTH_USER_KEY = 'sumarija_user';
function hashPin(pin) {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return 'h_' + Math.abs(hash).toString(36);
}

// Korisnici — PIN-ovi su hashirani
// role 'poslovodja' = read-only pristup cijeloj aplikaciji, osim podtaba "Stanje na dan"
// (unutar Raspored kamiona) gdje poslovođa prijavljuje broj kamiona po odjelu/sortimentu.
const USERS = [{
  name: 'AMRA',
  hash: hashPin('5555'),
  icon: '👩'
}, {
  name: 'NEDIM',
  hash: hashPin('7777'),
  icon: '👨'
}, {
  name: 'IZET',
  hash: hashPin('4444'),
  icon: '👨'
}, {
  name: 'IRFAN',
  hash: hashPin('1454'),
  icon: '👨',
  role: 'poslovodja'
}, {
  name: 'JASMIN',
  hash: hashPin('0307'),
  icon: '👨',
  role: 'poslovodja'
}, {
  name: 'MEHMEDALIJA',
  hash: hashPin('2212'),
  icon: '👨',
  role: 'poslovodja'
}];
const getUserRole = name => USERS.find(u => u.name === name)?.role || 'admin';
function LoginScreen(_ref) {
  let {
    onLogin
  } = _ref;
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const handleLogin = () => {
    setError('');
    if (!pin) {
      setError('Unesite PIN');
      return;
    }
    const h = hashPin(pin);
    const user = USERS.find(u => u.hash === h);
    if (user) {
      localStorage.setItem(AUTH_SESSION_KEY, 'true');
      localStorage.setItem(AUTH_USER_KEY, user.name);
      onLogin(user.name);
    } else {
      setError('Pogrešan PIN!');
      setPin('');
    }
  };
  const handleKeyDown = e => {
    if (e.key === 'Enter') handleLogin();
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 50%, #e8f0e6 100%)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'white',
      borderRadius: 16,
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      padding: '2rem',
      width: '100%',
      maxWidth: 360,
      margin: '1rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: '1.75rem'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "1774102184971~2.png",
    alt: "Raspored Radnika",
    style: {
      width: 96,
      height: 96,
      borderRadius: 18,
      marginBottom: '0.5rem',
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--mono)',
      fontWeight: 800,
      fontSize: '1.1rem',
      color: 'var(--green)',
      letterSpacing: '-0.03em'
    }
  }, "Raspored Pogon Bos.Krupa")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      gap: '0.6rem',
      marginBottom: '1.25rem'
    }
  }, USERS.map(u => /*#__PURE__*/React.createElement("div", {
    key: u.name,
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.2rem',
      background: '#f5f2ec',
      borderRadius: 8,
      padding: '0.4rem 0.7rem',
      minWidth: 64
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '1.4rem'
    }
  }, u.icon), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.68rem',
      fontWeight: 700,
      color: 'var(--text-muted)',
      fontFamily: 'var(--mono)'
    }
  }, u.name)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '0.75rem'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '0.72rem',
      fontWeight: 600,
      color: 'var(--text-muted)',
      display: 'block',
      marginBottom: '0.3rem'
    }
  }, "Unesite va\u0161 PIN"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: showPin ? 'text' : 'password',
    value: pin,
    onChange: e => {
      setPin(e.target.value);
      setError('');
    },
    onKeyDown: handleKeyDown,
    autoFocus: true,
    placeholder: "\u2022\u2022\u2022\u2022",
    maxLength: 8,
    style: {
      width: '100%',
      padding: '0.65rem 2.5rem 0.65rem 0.75rem',
      border: error ? '2px solid #c53030' : '2px solid var(--border)',
      borderRadius: 8,
      fontSize: '1.2rem',
      letterSpacing: '0.25em',
      outline: 'none',
      boxSizing: 'border-box',
      textAlign: 'center'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowPin(s => !s),
    style: {
      position: 'absolute',
      right: 8,
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      color: 'var(--text-muted)'
    }
  }, showPin ? '🙈' : '👁️'))), error && /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#c53030',
      fontSize: '0.78rem',
      fontWeight: 600,
      marginBottom: '0.5rem',
      padding: '0.4rem 0.6rem',
      background: '#fde8e8',
      borderRadius: 6,
      textAlign: 'center'
    }
  }, error), /*#__PURE__*/React.createElement("button", {
    onClick: handleLogin,
    style: {
      width: '100%',
      padding: '0.7rem',
      background: 'var(--green)',
      color: 'white',
      border: 'none',
      borderRadius: 8,
      fontSize: '0.95rem',
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "Prijavi se")));
}
// ─── SCHEDULE VIEW ────────────────────────────────────────────────────────────
function ScheduleView(_ref2) {
  let {
    selectedDate,
    setSelectedDate,
    daySchedules,
    schedules,
    workers,
    departments,
    vehicles,
    wName,
    dName,
    totalToday,
    statsByJob,
    statsByDept,
    sidebarFilter,
    setSidebarFilter,
    godisnji,
    prevDay,
    nextDay,
    onAdd,
    onAddWithJob,
    onEdit,
    onDelete,
    onHistory,
    onAssignVehicle,
    copyFromDate,
    handlePrint,
    yesterday,
    holidays,
    onWorkerClick,
    allJobTypes,
    customJobTypes,
    setCustomJobTypes
  } = _ref2;
  const VEHICLE_JOBS = ['Primka', 'Otprema', 'Pošumljavanje', 'Teren', 'Prerada', 'Farbanje sjekačkih linija'];
  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const currentHoliday = holidays?.[selectedDate] || null;
  const isSaturday = new Date(selectedDate + 'T00:00:00').getDay() === 6;
  const hasSaturdayEntries = isSaturday && daySchedules.length > 0;
  const [saturdayWorkMode, setSaturdayWorkMode] = useState(false);
  useEffect(() => {
    setSaturdayWorkMode(false);
  }, [selectedDate]);
  const [newJobName, setNewJobName] = useState('');
  const [showAddJob, setShowAddJob] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [weekMode, setWeekMode] = useState(false);

  // Sedmični prikaz — izračunaj Mon-Sat od selectedDate
  const weekDays = useMemo(() => {
    const d = new Date(selectedDate + 'T00:00:00');
    const dow = d.getDay(); // 0=Sun
    const mondayOffset = dow === 0 ? -6 : 1 - dow;
    const monday = new Date(d);
    monday.setDate(d.getDate() + mondayOffset);
    return Array.from({
      length: 6
    }, (_, i) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      return day.toISOString().split('T')[0];
    }).filter(dt => new Date(dt + 'T00:00:00').getDay() !== 0); // skip Sunday
  }, [selectedDate]);
  const DAY_NAMES_SHORT = ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'];
  const DAY_NAMES_FULL = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];
  const [mobileUnassignedOpen, setMobileUnassignedOpen] = useState(false);
  const [vehiclePopup, setVehiclePopup] = useState(null); // { rowId, vehicleIds, otherDriverId, rect }
  const OTHER_DRIVER_CATS = ['poslovoda_isk', 'poslovoda_uzg', 'primac_panj', 'otpremac'];
  const otherPotentialDrivers = useMemo(() => workers.filter(w => OTHER_DRIVER_CATS.includes(w.category) && w.status === 'aktivan'), [workers]);
  const vehiclePopupRef = useRef(null);

  // Close popup on outside click
  useEffect(() => {
    if (!vehiclePopup) return;
    const handler = e => {
      if (vehiclePopupRef.current && !vehiclePopupRef.current.contains(e.target)) setVehiclePopup(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [vehiclePopup]);

  // Helper: get vehicleIds array from schedule (backward compat with single vehicleId)
  const getVehicleIds = row => {
    if (row.vehicleIds && row.vehicleIds.length > 0) return row.vehicleIds;
    if (row.vehicleId) return [row.vehicleId];
    return [];
  };

  // Available vehicles: only 'vozno' status
  const availableVehicles = useMemo(() => (vehicles || []).filter(v => v.status === 'vozno'), [vehicles]);

  // Vozači (drivers) from workers — uključi i poslovođe koji imaju vozilo
  const drivers = useMemo(() => {
    const regularDrivers = workers.filter(w => w.category === 'vozac' && w.status === 'aktivan');
    const otherDriverIds = new Set((vehicles || []).filter(v => v.status === 'vozno' && v.driverId).map(v => v.driverId));
    const otherDrivers = workers.filter(w => OTHER_DRIVER_CATS.includes(w.category) && w.status === 'aktivan' && otherDriverIds.has(w.id));
    return [...regularDrivers, ...otherDrivers];
  }, [workers, vehicles]);

  // Vehicle usage across today's schedules: vehicleId -> total workers assigned
  const vehicleUsageMap = useMemo(() => {
    const m = {};
    daySchedules.forEach(s => {
      const vIds = s.vehicleIds?.length ? s.vehicleIds : s.vehicleId ? [s.vehicleId] : [];
      vIds.forEach(vid => {
        if (!m[vid]) m[vid] = {
          total: 0,
          rows: []
        };
        m[vid].total += (s.allWorkers || []).length;
        m[vid].rows.push(s.id);
      });
    });
    return m;
  }, [daySchedules]);
  const openVehiclePopup = (row, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setVehiclePopup(vehiclePopup?.rowId === row.id ? null : {
      rowId: row.id,
      vehicleIds: getVehicleIds(row),
      otherDriverId: row.otherDriverId || '',
      rect
    });
  };
  // For entries with no dept (Teren, Ostalo, etc.), use jobType as group key
  const deptKey = s => s.deptId || s.jobType || 'Ostalo';
  // Group by dept — exclude Otprema
  const byDept = useMemo(() => {
    const m = {};
    daySchedules.filter(s => s.jobType !== 'Otprema').forEach(s => {
      const key = deptKey(s);
      if (!m[key]) m[key] = [];
      m[key].push(s);
    });
    return m;
  }, [daySchedules]);

  // Otprema entries grouped by dept
  const otpremaRows = useMemo(() => daySchedules.filter(s => s.jobType === 'Otprema'), [daySchedules]);
  const otpremaByDept = useMemo(() => {
    const m = {};
    otpremaRows.forEach(s => {
      if (!m[s.deptId]) m[s.deptId] = [];
      m[s.deptId].push(s);
    });
    return m;
  }, [otpremaRows]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '100%',
      overflowX: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "date-bar"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "date-label"
  }, "DATUM"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginTop: '0.25rem'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "date-nav-btn",
    onClick: prevDay
  }, "\u2039"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "date-input",
    value: selectedDate,
    onChange: e => setSelectedDate(e.target.value)
  }), /*#__PURE__*/React.createElement("button", {
    className: "date-nav-btn",
    onClick: nextDay
  }, "\u203A"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: '0.85rem',
      color: 'var(--green)',
      letterSpacing: '0.03em'
    }
  }, ['NEDJELJA', 'PONEDJELJAK', 'UTORAK', 'SRIJEDA', 'ČETVRTAK', 'PETAK', 'SUBOTA'][new Date(selectedDate + 'T00:00:00').getDay()]), isToday && /*#__PURE__*/React.createElement("span", {
    className: "today-chip"
  }, "DANAS"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm no-print",
    onClick: () => setWeekMode(m => !m),
    style: {
      background: weekMode ? 'var(--green)' : 'var(--bg)',
      color: weekMode ? 'white' : 'var(--text-muted)',
      border: `1px solid ${weekMode ? 'var(--green)' : 'var(--border)'}`,
      fontWeight: weekMode ? 700 : 400
    }
  }, "\uD83D\uDCC5 Sedmi\u010Dno"), !currentHoliday && (!isSaturday || saturdayWorkMode || hasSaturdayEntries) && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm no-print",
    onClick: () => copyFromDate(yesterday)
  }, "\uD83D\uDCCB Kopiraj ju\u010Der"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm no-print",
    onClick: handlePrint
  }, "\uD83D\uDDA8\uFE0F Print"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm no-print",
    onClick: onAdd
  }, "+ Novi unos")))), weekMode && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '1rem',
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: `repeat(${weekDays.length}, minmax(160px, 1fr))`,
      gap: '0.4rem',
      minWidth: weekDays.length * 160
    }
  }, weekDays.map(dt => {
    const isSelected = dt === selectedDate;
    const isHoliday = !!holidays?.[dt];
    const isSat = new Date(dt + 'T00:00:00').getDay() === 6;
    const dtSchedules = schedules.filter(s => s.date === dt && (!sidebarFilter || s.deptId === sidebarFilter));
    const totalW = new Set(dtSchedules.flatMap(s => s.allWorkers)).size;
    const dow = new Date(dt + 'T00:00:00').getDay();
    const dayLabel = DAY_NAMES_FULL[dow];
    const dayNum = dt.slice(8);
    return /*#__PURE__*/React.createElement("div", {
      key: dt,
      onClick: () => {
        setSelectedDate(dt);
        setWeekMode(false);
      },
      style: {
        border: isSelected ? '2px solid var(--green)' : '1px solid var(--border)',
        borderRadius: 8,
        background: isHoliday ? '#fff3e0' : isSat ? '#f5f2ec' : 'var(--surface)',
        cursor: 'pointer',
        overflow: 'hidden',
        boxShadow: isSelected ? '0 0 0 3px rgba(45,90,39,0.15)' : 'var(--shadow)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0.35rem 0.6rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: isSelected ? 'var(--green)' : isHoliday ? '#e65100' : isSat ? '#d5d0c8' : 'var(--bg)',
        color: isSelected || isHoliday ? 'white' : 'var(--text)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        fontSize: '0.78rem'
      }
    }, dayLabel.slice(0, 3).toUpperCase(), " ", dayNum, "."), isHoliday ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.6rem',
        fontWeight: 700
      }
    }, "\uD83C\uDF89 PRAZNIK") : /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        fontWeight: 700,
        fontSize: '0.78rem',
        background: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--green-pale)',
        color: isSelected ? 'white' : 'var(--green)',
        borderRadius: 4,
        padding: '0.05rem 0.35rem'
      }
    }, totalW)), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0.3rem 0.4rem',
        minHeight: 60
      }
    }, isHoliday ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.72rem',
        color: '#e65100',
        fontStyle: 'italic',
        padding: '0.2rem'
      }
    }, holidays[dt]) : dtSchedules.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.7rem',
        color: 'var(--text-light)',
        fontStyle: 'italic',
        padding: '0.2rem'
      }
    }, "Nema unosa") : dtSchedules.slice(0, 5).map(s => /*#__PURE__*/React.createElement("div", {
      key: s.id,
      style: {
        fontSize: '0.68rem',
        marginBottom: '0.2rem',
        padding: '0.15rem 0.3rem',
        borderRadius: 4,
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        display: 'flex',
        gap: '0.3rem',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: jobBadgeClass(s.jobType),
      style: {
        fontSize: '0.55rem',
        padding: '0.05rem 0.25rem'
      }
    }, s.jobType), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-muted)',
        fontFamily: 'var(--mono)',
        fontSize: '0.65rem'
      }
    }, s.allWorkers.length, "r"))), dtSchedules.length > 5 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.65rem',
        color: 'var(--text-light)',
        padding: '0.15rem 0.3rem'
      }
    }, "+", dtSchedules.length - 5, " vi\u0161e\u2026")));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.72rem',
      color: 'var(--text-muted)',
      marginTop: '0.4rem',
      fontStyle: 'italic'
    }
  }, "Klikni na dan za detaljan prikaz")), currentHoliday && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '3rem 1rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '3rem',
      marginBottom: '0.75rem'
    }
  }, "\uD83C\uDF89"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '1.1rem',
      fontWeight: 700,
      color: '#e65100',
      marginBottom: '0.5rem'
    }
  }, "PRAZNIK"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#bf360c',
      marginBottom: '0.5rem'
    }
  }, currentHoliday), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-muted)',
      fontSize: '0.85rem'
    }
  }, selectedDate), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-muted)',
      fontSize: '0.82rem',
      marginTop: '0.75rem',
      fontStyle: 'italic'
    }
  }, "Na praznik nije mogu\u0107e rasporediti radnike.")), isSaturday && !saturdayWorkMode && !hasSaturdayEntries && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '3rem 1rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '3rem',
      marginBottom: '0.75rem'
    }
  }, "\uD83D\uDCC5"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '1.1rem',
      fontWeight: 700,
      color: 'var(--text)',
      marginBottom: '0.5rem'
    }
  }, "Subota, ", selectedDate), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-muted)',
      marginBottom: '1.5rem',
      fontSize: '0.9rem'
    }
  }, "Subota je neradni dan."), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary no-print",
    onClick: () => setSaturdayWorkMode(true),
    style: {
      fontSize: '0.9rem',
      padding: '0.5rem 1.2rem'
    }
  }, "\uD83D\uDEE0\uFE0F Dodaj kao radni dan")), !currentHoliday && (!isSaturday || saturdayWorkMode || hasSaturdayEntries) && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '0.5rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.65rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--text-light)',
      marginBottom: '0.35rem'
    }
  }, "Vrsta posla \u2014 klikni za unos"), /*#__PURE__*/React.createElement("div", {
    className: "stats-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-value"
  }, totalToday), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, "Ukupno radnika")), Object.entries(statsByJob).map(_ref3 => {
    let [jt, ws] = _ref3;
    return /*#__PURE__*/React.createElement("div", {
      className: "stat-card",
      key: jt,
      style: {
        cursor: 'pointer'
      },
      onClick: () => onAddWithJob(jt),
      title: `+ Dodaj ${jt}`
    }, /*#__PURE__*/React.createElement("div", {
      className: "stat-value",
      style: {
        fontSize: '1.2rem'
      }
    }, ws.size), /*#__PURE__*/React.createElement("div", {
      className: "stat-label"
    }, jt));
  }), allJobTypes.filter(jt => !statsByJob[jt]).map(jt => /*#__PURE__*/React.createElement("div", {
    className: "stat-card",
    key: jt,
    style: {
      cursor: 'pointer',
      opacity: 0.5
    },
    onClick: () => onAddWithJob(jt),
    title: `+ Dodaj ${jt}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-value",
    style: {
      fontSize: '1.2rem'
    }
  }, "0"), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, jt))), !showAddJob ? /*#__PURE__*/React.createElement("div", {
    className: "stat-card",
    style: {
      cursor: 'pointer',
      opacity: 0.4,
      border: '2px dashed var(--border)'
    },
    onClick: () => setShowAddJob(true),
    title: "Dodaj novu vrstu posla"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-value",
    style: {
      fontSize: '1.2rem'
    }
  }, "+"), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, "Novi posao")) : /*#__PURE__*/React.createElement("div", {
    className: "stat-card",
    style: {
      padding: '0.3rem',
      minWidth: 120
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-input",
    placeholder: "Naziv posla...",
    value: newJobName,
    onChange: e => setNewJobName(e.target.value),
    onKeyDown: e => {
      if (e.key === 'Enter' && newJobName.trim()) {
        const name = newJobName.trim();
        if (!allJobTypes.includes(name)) {
          setCustomJobTypes(prev => [...prev, name]);
        }
        setNewJobName('');
        setShowAddJob(false);
      }
      if (e.key === 'Escape') {
        setNewJobName('');
        setShowAddJob(false);
      }
    },
    autoFocus: true,
    style: {
      fontSize: '0.72rem',
      padding: '0.25rem 0.4rem',
      marginBottom: '0.2rem'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '0.2rem'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    style: {
      fontSize: '0.6rem',
      padding: '0.15rem 0.3rem',
      flex: 1
    },
    onClick: () => {
      const name = newJobName.trim();
      if (name && !allJobTypes.includes(name)) {
        setCustomJobTypes(prev => [...prev, name]);
      }
      setNewJobName('');
      setShowAddJob(false);
    }
  }, "Dodaj"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm",
    style: {
      fontSize: '0.6rem',
      padding: '0.15rem 0.3rem'
    },
    onClick: () => {
      setNewJobName('');
      setShowAddJob(false);
    }
  }, "\u2715"))))), /*#__PURE__*/React.createElement("div", {
    className: "section-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, "Raspored za ", fmtDate(selectedDate)), /*#__PURE__*/React.createElement("span", {
    className: "tag"
  }, daySchedules.length, " ", daySchedules.length === 1 ? 'stavka' : 'stavki')), daySchedules.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, /*#__PURE__*/React.createElement("span", {
    className: "icon"
  }, "\uD83D\uDCCB"), /*#__PURE__*/React.createElement("p", null, "Nema unesenog rasporeda za ovaj dan."), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: onAdd
  }, "+ Dodaj prvi unos")) : Object.entries(byDept).map(_ref4 => {
    let [deptId, rows] = _ref4;
    const isVirtualDept = !departments.find(d => d.id === deptId);
    const headerLabel = isVirtualDept ? deptId.toUpperCase() : dName(deptId);
    return /*#__PURE__*/React.createElement("div", {
      className: "card",
      key: deptId
    }, /*#__PURE__*/React.createElement("div", {
      className: "dept-header"
    }, /*#__PURE__*/React.createElement("span", null, isVirtualDept ? '📋' : '🏕️'), /*#__PURE__*/React.createElement("span", {
      className: "dept-name"
    }, headerLabel), /*#__PURE__*/React.createElement("span", {
      className: "dept-count"
    }, new Set(rows.flatMap(r => r.allWorkers)).size, " radnika")), /*#__PURE__*/React.createElement("table", {
      className: "schedule-table"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Vrsta posla"), /*#__PURE__*/React.createElement("th", null, "Radnici"), /*#__PURE__*/React.createElement("th", null, "Vozilo"), /*#__PURE__*/React.createElement("th", null, "Napomena"), /*#__PURE__*/React.createElement("th", {
      className: "no-print",
      style: {
        width: '90px'
      }
    }, "Akcije"))), /*#__PURE__*/React.createElement("tbody", null, rows.map(row => /*#__PURE__*/React.createElement("tr", {
      key: row.id
    }, /*#__PURE__*/React.createElement("td", {
      "data-label": "Posao"
    }, /*#__PURE__*/React.createElement("span", {
      className: jobBadgeClass(row.jobType)
    }, row.jobType)), /*#__PURE__*/React.createElement("td", {
      "data-label": "Radnici"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2px'
      }
    }, row.jobType === 'Primka' ? /*#__PURE__*/React.createElement(React.Fragment, null, row.primatWorker && /*#__PURE__*/React.createElement("span", {
      className: "worker-pill primac"
    }, /*#__PURE__*/React.createElement("span", {
      className: "role-dot"
    }), "P: ", wName(row.primatWorker)), row.helper1Worker && /*#__PURE__*/React.createElement("span", {
      className: "worker-pill"
    }, /*#__PURE__*/React.createElement("span", {
      className: "role-dot"
    }), wName(row.helper1Worker)), row.helper2Worker && /*#__PURE__*/React.createElement("span", {
      className: "worker-pill"
    }, /*#__PURE__*/React.createElement("span", {
      className: "role-dot"
    }), wName(row.helper2Worker)), (row.extraWorkers || []).map(w => /*#__PURE__*/React.createElement("span", {
      key: w,
      className: "worker-pill"
    }, /*#__PURE__*/React.createElement("span", {
      className: "role-dot"
    }), wName(w)))) : row.allWorkers.map(w => /*#__PURE__*/React.createElement("span", {
      key: w,
      className: "worker-pill"
    }, /*#__PURE__*/React.createElement("span", {
      className: "role-dot"
    }), wName(w))))), /*#__PURE__*/React.createElement("td", {
      "data-label": "Vozilo",
      style: {
        fontSize: '0.8rem'
      }
    }, VEHICLE_JOBS.includes(row.jobType) ? /*#__PURE__*/React.createElement("div", {
      style: {
        cursor: 'pointer'
      },
      onClick: e => openVehiclePopup(row, e),
      className: "no-print"
    }, (() => {
      const vIds = getVehicleIds(row);
      if (vIds.length === 0) return /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--green)',
          fontWeight: 600,
          fontSize: '0.75rem'
        }
      }, "+ Dodijeli vozilo");
      // Popunjenost vozila se računa preko CIJELOG dana (vehicleUsageMap), ne samo
      // ovog reda — isto vozilo se često koristi za više primki/otprema istog dana
      // (ista ekipa, više odjela), pa popunjenost mora sabrati sve te redove.
      return /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '3px'
        }
      }, vIds.map(vid => {
        const v = vehicles?.find(v => v.id === vid);
        if (!v) return null;
        const driver = workers.find(w => w.id === v.driverId);
        const cap = v.brojMjesta || 0;
        const usage = vehicleUsageMap[vid];
        const totalInVehicle = usage?.total || 0;
        const over = totalInVehicle > cap;
        return /*#__PURE__*/React.createElement("div", {
          key: vid,
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1px',
            paddingBottom: '2px',
            borderBottom: vIds.length > 1 ? '1px dotted var(--border)' : 'none'
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            fontWeight: 600
          }
        }, "\uD83D\uDE97 ", v.registracija), /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: '0.7rem',
            color: 'var(--text-muted)'
          }
        }, v.tipVozila, " \xB7 ", v.brojMjesta, " mj."), row.otherDriverId ? (() => {
          const od = workers.find(w => w.id === row.otherDriverId);
          return od ? /*#__PURE__*/React.createElement("span", {
            style: {
              fontSize: '0.7rem',
              color: '#b5620a',
              fontWeight: 600
            }
          }, "\uD83D\uDD04 ", od.name, " ", /*#__PURE__*/React.createElement("span", {
            style: {
              fontWeight: 400,
              fontSize: '0.62rem'
            }
          }, "(danas)")) : driver && /*#__PURE__*/React.createElement("span", {
            style: {
              fontSize: '0.7rem',
              color: '#2a6478'
            }
          }, "\uD83E\uDDD1\u200D\u2708\uFE0F ", driver.name);
        })() : driver && /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: '0.7rem',
            color: '#2a6478'
          }
        }, "\uD83E\uDDD1\u200D\u2708\uFE0F ", driver.name), /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: '0.65rem',
            fontWeight: 700,
            marginTop: '1px',
            color: over ? '#c53030' : '#2d5a27',
            background: over ? '#fde8e8' : '#e8f5e9',
            border: `1px solid ${over ? '#f5b5b5' : '#a5d6a7'}`,
            borderRadius: 3,
            padding: '0.1rem 0.3rem',
            display: 'inline-block'
          }
        }, "\uD83D\uDC65 ", totalInVehicle, "/", cap, over ? ` +${totalInVehicle - cap}` : ''));
      }));
    })()) : /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-light)',
        fontSize: '0.75rem'
      }
    }, "\u2014")), /*#__PURE__*/React.createElement("td", {
      "data-label": "Napomena",
      style: {
        color: 'var(--text-muted)',
        fontSize: '0.8rem'
      }
    }, row.note || '—'), /*#__PURE__*/React.createElement("td", {
      "data-label": "",
      className: "no-print"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: '0.25rem'
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-icon btn-sm",
      title: "Historija",
      onClick: () => onHistory(row)
    }, "\uD83D\uDCDC"), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-icon btn-sm",
      title: "Uredi",
      onClick: () => onEdit(row)
    }, "\u270F\uFE0F"), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-danger btn-icon btn-sm",
      title: "Bri\u0161i",
      onClick: () => onDelete(row.id)
    }, "\uD83D\uDDD1\uFE0F"))))))));
  }), otpremaRows.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      marginTop: '0.75rem',
      borderLeft: '4px solid #6b3080'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.6rem 0.75rem',
      background: '#f0e8f5',
      borderBottom: '1px solid #c4a0d8'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '1.1rem'
    }
  }, "\uD83D\uDE9B"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: '0.95rem',
      color: '#6b3080',
      flex: 1
    }
  }, "Otprema"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: '0.72rem',
      fontWeight: 700,
      color: 'white',
      background: '#6b3080',
      borderRadius: 4,
      padding: '0.15rem 0.5rem'
    }
  }, new Set(otpremaRows.flatMap(r => r.allWorkers)).size, " radnika"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: '0.68rem',
      color: '#6b3080'
    }
  }, Object.keys(otpremaByDept).length, " ", Object.keys(otpremaByDept).length === 1 ? 'odjel' : 'odjela')), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0.5rem 0.75rem'
    }
  }, Object.entries(otpremaByDept).map(_ref5 => {
    let [deptId, rows] = _ref5;
    const allW = [...new Set(rows.flatMap(r => r.allWorkers))];
    return /*#__PURE__*/React.createElement("div", {
      key: deptId,
      style: {
        marginBottom: '0.6rem',
        padding: '0.5rem 0.6rem',
        background: 'var(--bg)',
        borderRadius: 6,
        border: '1px solid var(--border)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        marginBottom: '0.35rem'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.8rem'
      }
    }, "\uD83C\uDFD5\uFE0F"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        fontSize: '0.82rem',
        color: 'var(--text)',
        flex: 1
      }
    }, dName(deptId)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '0.68rem',
        fontWeight: 600,
        color: '#6b3080',
        background: '#f0e8f5',
        borderRadius: 3,
        padding: '0.1rem 0.35rem',
        border: '1px solid #c4a0d8'
      }
    }, allW.length, " rad.")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.25rem'
      }
    }, allW.map(wId => /*#__PURE__*/React.createElement("span", {
      key: wId,
      className: "worker-pill"
    }, /*#__PURE__*/React.createElement("span", {
      className: "role-dot"
    }), wName(wId)))), rows.map(row => {
      const vIds = getVehicleIds(row);
      return /*#__PURE__*/React.createElement("div", {
        key: row.id,
        style: {
          marginTop: '0.3rem'
        }
      }, /*#__PURE__*/React.createElement("div", {
        className: "no-print",
        style: {
          cursor: 'pointer'
        },
        onClick: e => openVehiclePopup(row, e)
      }, vIds.length === 0 ? /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--green)',
          fontWeight: 600,
          fontSize: '0.75rem'
        }
      }, "+ Dodijeli vozilo") : (() => {
        const rowWC = (row.allWorkers || []).length;
        const totalC = vIds.reduce((s, vid) => {
          const v = vehicles?.find(x => x.id === vid);
          return s + (v?.brojMjesta || 0);
        }, 0);
        const bezMj = Math.max(0, rowWC - totalC);
        let rem = rowWC;
        return /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.2rem'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.3rem'
          }
        }, vIds.map(vid => {
          const v = vehicles?.find(x => x.id === vid);
          if (!v) return null;
          const driver = workers.find(w => w.id === v.driverId);
          const cap = v.brojMjesta || 0;
          const fill = Math.min(rem, cap);
          rem = Math.max(0, rem - cap);
          return /*#__PURE__*/React.createElement("span", {
            key: vid,
            style: {
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)'
            }
          }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDE97"), /*#__PURE__*/React.createElement("span", {
            style: {
              fontWeight: 600
            }
          }, v.registracija), /*#__PURE__*/React.createElement("span", null, v.tipVozila), row.otherDriverId ? (() => {
            const od = workers.find(w => w.id === row.otherDriverId);
            return od ? /*#__PURE__*/React.createElement("span", {
              style: {
                color: '#b5620a',
                fontWeight: 600
              }
            }, "(\uD83D\uDD04 ", od.name, ")") : driver && /*#__PURE__*/React.createElement("span", {
              style: {
                color: '#2a6478'
              }
            }, "(", driver.name, ")");
          })() : driver && /*#__PURE__*/React.createElement("span", {
            style: {
              color: '#2a6478'
            }
          }, "(", driver.name, ")"), /*#__PURE__*/React.createElement("span", {
            style: {
              fontWeight: 700,
              fontSize: '0.65rem',
              color: fill >= cap ? '#b5620a' : '#2d5a27',
              background: fill >= cap ? '#fdf0e0' : '#e8f5e9',
              border: `1px solid ${fill >= cap ? '#e8c17a' : '#a5d6a7'}`,
              borderRadius: 3,
              padding: '0.1rem 0.3rem'
            }
          }, "\uD83D\uDC65 ", fill, "/", cap));
        })), bezMj > 0 && /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: '0.65rem',
            fontWeight: 700,
            color: '#c53030'
          }
        }, "\u26A0\uFE0F ", bezMj, " radnika nema mjesta!"));
      })()));
    }), rows.map(row => /*#__PURE__*/React.createElement("div", {
      key: row.id + '-act',
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        marginTop: '0.25rem'
      }
    }, row.note && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
        fontStyle: 'italic',
        flex: 1
      }
    }, "\uD83D\uDCDD ", row.note), /*#__PURE__*/React.createElement("div", {
      className: "no-print",
      style: {
        display: 'flex',
        gap: '0.2rem',
        marginLeft: 'auto'
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-icon btn-sm",
      title: "Historija",
      onClick: () => onHistory(row)
    }, "\uD83D\uDCDC"), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-icon btn-sm",
      title: "Uredi",
      onClick: () => onEdit(row)
    }, "\u270F\uFE0F"), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-danger btn-icon btn-sm",
      title: "Bri\u0161i",
      onClick: () => onDelete(row.id)
    }, "\uD83D\uDDD1\uFE0F")))));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "mobile-sidebar-panel",
    style: {
      marginTop: '0.75rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0.6rem 0.75rem',
      background: '#fafaf8',
      borderBottom: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: '0.7rem',
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, "Vrsta posla \u2014 klikni za unos")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0.5rem 0.75rem',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.3rem'
    }
  }, allJobTypes.map(jt => /*#__PURE__*/React.createElement("button", {
    key: jt,
    className: jobBadgeClass(jt),
    onClick: () => onAddWithJob(jt),
    style: {
      cursor: 'pointer',
      fontSize: '0.68rem',
      padding: '0.3rem 0.5rem',
      borderRadius: 4,
      border: '1px solid var(--border)'
    }
  }, "+ ", jt)))), /*#__PURE__*/React.createElement("div", {
    className: "mobile-sidebar-panel",
    style: {
      marginTop: '0.75rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => setMobileFilterOpen(!mobileFilterOpen),
    style: {
      padding: '0.6rem 0.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      background: '#fafaf8',
      borderBottom: mobileFilterOpen ? '1px solid var(--border)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: '0.7rem',
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, "\uD83C\uDFD5\uFE0F Filter po odjelu ", sidebarFilter ? `(${departments.find(d => d.id === sidebarFilter)?.brojOdjela || '?'})` : '(svi)'), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.7rem',
      color: 'var(--text-light)'
    }
  }, mobileFilterOpen ? '▲' : '▼')), mobileFilterOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0.25rem 0'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: `sidebar-item ${!sidebarFilter ? 'active' : ''}`,
    onClick: () => {
      setSidebarFilter(null);
      setMobileFilterOpen(false);
    }
  }, /*#__PURE__*/React.createElement("span", null, "Svi odjeli"), /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, Object.values(statsByDept).reduce((a, s) => a + s.size, 0))), departments.map(d => /*#__PURE__*/React.createElement("button", {
    key: d.id,
    className: `sidebar-item ${sidebarFilter === d.id ? 'active' : ''}`,
    onClick: () => {
      setSidebarFilter(d.id);
      setMobileFilterOpen(false);
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, dName(d.id)), /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, statsByDept[d.id]?.size || 0))))), (() => {
    const assignedWorkers = new Set([...daySchedules.flatMap(s => s.allWorkers || []), ...daySchedules.flatMap(s => {
      const vIds = s.vehicleIds?.length ? s.vehicleIds : s.vehicleId ? [s.vehicleId] : [];
      const driverIds = vIds.map(vid => (vehicles || []).find(v => v.id === vid)?.driverId).filter(Boolean);
      if (s.otherDriverId) return [s.otherDriverId];
      return driverIds;
    })]);
    const absentMap = {};
    Object.entries(godisnji || {}).forEach(_ref6 => {
      let [wId, entries] = _ref6;
      const entry = entries.find(e => e.date === selectedDate) || entries.find(e => e.open && e.dateOd && e.dateOd <= selectedDate);
      if (entry) absentMap[wId] = entry;
    });
    const activeWorkers = workers.filter(w => w.status === 'aktivan');
    const unassigned = activeWorkers.filter(w => !assignedWorkers.has(w.id) && !absentMap[w.id]);
    const ODSUTNOST_STYLE = {
      'Godišnji odmor': {
        short: 'GO',
        icon: '🏖️',
        bg: '#e4edf5',
        color: '#1a3d5c',
        border: '#9bbfd9'
      },
      'Bolovanje': {
        short: 'B',
        icon: '🏥',
        bg: '#fde8e8',
        color: '#8b2020',
        border: '#e0a0a0'
      },
      'Slobodan dan': {
        short: 'SD',
        icon: '☀️',
        bg: '#fdf0e0',
        color: '#b5620a',
        border: '#e8c17a'
      },
      'Neplaćeno': {
        short: 'N',
        icon: '📋',
        bg: '#f0f0f0',
        color: '#555',
        border: '#ccc'
      }
    };
    const SHOWN_LEAVE_TYPES = ['Bolovanje', 'Godišnji odmor', 'Neplaćeno'];
    const absentByType = {};
    Object.entries(absentMap).forEach(_ref7 => {
      let [wId, entry] = _ref7;
      if (!SHOWN_LEAVE_TYPES.includes(entry.type)) return;
      const w = workers.find(x => x.id === wId);
      if (!w || assignedWorkers.has(w.id)) return;
      if (!absentByType[entry.type]) absentByType[entry.type] = [];
      absentByType[entry.type].push(w);
    });
    const hasAbsent = Object.keys(absentByType).length > 0;
    const absentCount = Object.values(absentByType).reduce((s, arr) => s + arr.length, 0);
    const unassignedByCat = WORKER_CATEGORIES.filter(c => c.id !== 'poslovoda').map(cat => ({
      cat,
      workers: unassigned.filter(w => w.category === cat.id)
    })).filter(g => g.workers.length > 0);
    return /*#__PURE__*/React.createElement("div", {
      className: "mobile-sidebar-panel",
      style: {
        marginTop: '0.75rem'
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: () => setMobileUnassignedOpen(!mobileUnassignedOpen),
      style: {
        padding: '0.6rem 0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        background: '#fafaf8',
        borderBottom: mobileUnassignedOpen ? '1px solid var(--border)' : 'none'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '0.7rem',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)'
      }
    }, "\uD83D\uDC77 Neraspore\u0111eni (", unassigned.length, ") ", hasAbsent && `· Odsutni (${absentCount})`), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.7rem',
        color: 'var(--text-light)'
      }
    }, mobileUnassignedOpen ? '▲' : '▼')), mobileUnassignedOpen && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0.5rem 0.75rem'
      }
    }, unassigned.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.8rem',
        color: 'var(--green)',
        fontWeight: 500,
        padding: '0.25rem 0'
      }
    }, "\u2713 Svi raspore\u0111eni") : unassignedByCat.map(_ref8 => {
      let {
        cat,
        workers: ws
      } = _ref8;
      return /*#__PURE__*/React.createElement("div", {
        key: cat.id,
        style: {
          marginBottom: '0.5rem'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '0.62rem',
          fontWeight: 700,
          color: cat.color,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '0.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }
      }, /*#__PURE__*/React.createElement("span", null, cat.icon), cat.short), ws.map(w => /*#__PURE__*/React.createElement("div", {
        key: w.id,
        onClick: () => onWorkerClick(w),
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.35rem 0.5rem',
          marginBottom: '0.15rem',
          fontSize: '0.8rem',
          fontWeight: 500,
          background: cat.pale,
          border: `1px solid ${cat.border}`,
          borderLeft: `3px solid ${cat.color}`,
          borderRadius: 4,
          cursor: 'pointer',
          color: cat.color
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: '0.85rem'
        }
      }, cat.icon), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1
        }
      }, w.name), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: '0.6rem',
          opacity: 0.6
        }
      }, "\u2192"))));
    }), hasAbsent && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 1,
        background: 'var(--border)',
        margin: '0.5rem 0'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '0.62rem',
        letterSpacing: '0.08em',
        color: 'var(--text-light)',
        textTransform: 'uppercase',
        marginBottom: '0.4rem'
      }
    }, "Odsutni (", absentCount, ")"), SHOWN_LEAVE_TYPES.filter(t => absentByType[t]).map(type => {
      const s = ODSUTNOST_STYLE[type];
      return /*#__PURE__*/React.createElement("div", {
        key: type,
        style: {
          marginBottom: '0.5rem'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '0.62rem',
          fontWeight: 700,
          color: s.color,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '0.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }
      }, /*#__PURE__*/React.createElement("span", null, s.icon), type), absentByType[type].map(w => /*#__PURE__*/React.createElement("div", {
        key: w.id,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.35rem 0.5rem',
          marginBottom: '0.15rem',
          fontSize: '0.8rem',
          fontWeight: 500,
          background: s.bg,
          border: `1px solid ${s.border}`,
          borderLeft: `3px solid ${s.color}`,
          borderRadius: 4,
          color: s.color,
          opacity: 0.7
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: '0.85rem'
        }
      }, s.icon), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1
        }
      }, w.name), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: '0.6rem',
          fontWeight: 700,
          fontFamily: 'var(--mono)'
        }
      }, s.short))));
    }))));
  })()), vehiclePopup && ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9998
    },
    onClick: () => setVehiclePopup(null)
  }, /*#__PURE__*/React.createElement("div", {
    ref: vehiclePopupRef,
    onClick: e => e.stopPropagation(),
    style: {
      position: 'fixed',
      top: Math.min(vehiclePopup.rect?.bottom || 200, window.innerHeight - 420),
      left: Math.min(Math.max(vehiclePopup.rect?.left || 100, 8), window.innerWidth - 350),
      zIndex: 9999,
      background: 'white',
      border: '1px solid var(--border)',
      borderRadius: 10,
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      padding: '0.85rem',
      width: 330,
      maxHeight: '75vh',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: '0.85rem',
      marginBottom: '0.6rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, "\uD83D\uDE97 Vozila za ovaj raspored", /*#__PURE__*/React.createElement("button", {
    onClick: () => setVehiclePopup(null),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.1rem',
      color: 'var(--text-muted)',
      lineHeight: 1
    }
  }, "\u2715")), vehiclePopup.vehicleIds.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '0.6rem'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '0.7rem',
      fontWeight: 600,
      color: 'var(--text-muted)',
      display: 'block',
      marginBottom: '0.3rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }
  }, "Dodijeljena vozila (", vehiclePopup.vehicleIds.length, ")"), vehiclePopup.vehicleIds.map((vid, idx) => {
    const v = availableVehicles.find(v => v.id === vid);
    if (!v) return null;
    const driver = workers.find(w => w.id === v.driverId);
    const usage = vehicleUsageMap[v.id];
    const totalInVehicle = usage?.total || 0;
    const cap = v.brojMjesta || 0;
    const over = totalInVehicle > cap;
    return /*#__PURE__*/React.createElement("div", {
      key: vid,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.4rem 0.5rem',
        marginBottom: '0.25rem',
        background: over ? '#fde8e8' : '#f0f7f0',
        border: `1px solid ${over ? '#f5b5b5' : '#a5d6a7'}`,
        borderRadius: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        fontSize: '0.78rem'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600
      }
    }, "\uD83D\uDE97 ", v.registracija, " \u2014 ", v.tipVozila), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.68rem',
        color: 'var(--text-muted)'
      }
    }, driver ? `🧑‍✈️ ${driver.name} · ` : '', v.brojMjesta, " mj.", /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        color: over ? '#c53030' : '#2d5a27',
        marginLeft: '0.3rem'
      }
    }, "(", totalInVehicle, "/", cap, over ? ` +${totalInVehicle - cap}` : '', ")"))), /*#__PURE__*/React.createElement("button", {
      onClick: () => setVehiclePopup(p => ({
        ...p,
        vehicleIds: p.vehicleIds.filter(id => id !== vid)
      })),
      style: {
        background: '#c53030',
        color: 'white',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
        fontSize: '0.7rem',
        padding: '0.2rem 0.4rem',
        fontWeight: 600
      }
    }, "\u2715"));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: vehiclePopup.vehicleIds.length > 0 ? '1px solid var(--border)' : 'none',
      paddingTop: vehiclePopup.vehicleIds.length > 0 ? '0.5rem' : 0
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '0.7rem',
      fontWeight: 600,
      color: 'var(--text-muted)',
      display: 'block',
      marginBottom: '0.3rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }
  }, "Dodaj vozilo"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '0.4rem'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '0.68rem',
      color: 'var(--text-muted)',
      display: 'block',
      marginBottom: '0.15rem'
    }
  }, "Po \u0161oferu:"), /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    style: {
      width: '100%',
      fontSize: '0.82rem',
      padding: '0.35rem'
    },
    value: "",
    onChange: e => {
      const dId = e.target.value;
      if (!dId) return;
      const defV = availableVehicles.find(v => v.driverId === dId);
      if (defV && !vehiclePopup.vehicleIds.includes(defV.id)) {
        setVehiclePopup(p => ({
          ...p,
          vehicleIds: [...p.vehicleIds, defV.id]
        }));
      }
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u2014 Odaberi \u0161ofera \u2014"), drivers.map(d => {
    const dv = availableVehicles.find(v => v.driverId === d.id);
    const already = dv && vehiclePopup.vehicleIds.includes(dv.id);
    const cat = OTHER_DRIVER_CATS.includes(d.category) ? getCatById(d.category) : null;
    return /*#__PURE__*/React.createElement("option", {
      key: d.id,
      value: d.id,
      disabled: already || !dv
    }, d.name, cat ? ` [${cat.short}]` : '', dv ? ` (${dv.registracija})` : ' (bez vozila)', already ? ' ✓' : '');
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '0.5rem'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '0.68rem',
      color: 'var(--text-muted)',
      display: 'block',
      marginBottom: '0.15rem'
    }
  }, "Ili po vozilu:"), /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    style: {
      width: '100%',
      fontSize: '0.82rem',
      padding: '0.35rem'
    },
    value: "",
    onChange: e => {
      const vId = e.target.value;
      if (vId && !vehiclePopup.vehicleIds.includes(vId)) {
        setVehiclePopup(p => ({
          ...p,
          vehicleIds: [...p.vehicleIds, vId]
        }));
      }
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u2014 Odaberi vozilo \u2014"), availableVehicles.map(v => {
    const dr = workers.find(w => w.id === v.driverId);
    const usage = vehicleUsageMap[v.id];
    const totalUsed = usage?.total || 0;
    const cap = v.brojMjesta || 0;
    const already = vehiclePopup.vehicleIds.includes(v.id);
    return /*#__PURE__*/React.createElement("option", {
      key: v.id,
      value: v.id,
      disabled: already
    }, v.registracija, " \u2014 ", v.tipVozila, " \xB7 ", v.brojMjesta, " mj.", dr ? ` (${dr.name})` : '', " (", totalUsed, "/", cap, ")", already ? ' ✓' : '');
  })))), vehiclePopup.vehicleIds.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--border)',
      paddingTop: '0.5rem',
      marginTop: '0.3rem'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '0.7rem',
      fontWeight: 600,
      color: '#b5620a',
      display: 'block',
      marginBottom: '0.3rem'
    }
  }, "\uD83D\uDD04 Drugi \u0161ofer za danas"), /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    style: {
      width: '100%',
      fontSize: '0.82rem',
      padding: '0.35rem'
    },
    value: vehiclePopup.otherDriverId || '',
    onChange: e => setVehiclePopup(p => ({
      ...p,
      otherDriverId: e.target.value
    }))
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u2014 Stalni \u0161ofer \u2014"), OTHER_DRIVER_CATS.map(catId => {
    const catInfo = getCatById(catId);
    const catW = otherPotentialDrivers.filter(w => w.category === catId);
    if (catW.length === 0) return null;
    return /*#__PURE__*/React.createElement("optgroup", {
      key: catId,
      label: catInfo ? catInfo.label : catId
    }, catW.map(w => /*#__PURE__*/React.createElement("option", {
      key: w.id,
      value: w.id
    }, w.name)));
  })), vehiclePopup.otherDriverId && (() => {
    const od = workers.find(w => w.id === vehiclePopup.otherDriverId);
    const oc = getCatById(od?.category);
    return od ? /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: '0.25rem',
        fontSize: '0.68rem',
        color: '#b5620a',
        fontWeight: 600
      }
    }, "\uD83D\uDE97 ", od.name, " (", oc?.label, ") vozi danas") : null;
  })()), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '0.4rem',
      marginTop: '0.3rem'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    style: {
      flex: 1
    },
    onClick: () => {
      onAssignVehicle(vehiclePopup.rowId, vehiclePopup.vehicleIds, vehiclePopup.otherDriverId || '');
      setVehiclePopup(null);
    }
  }, "Spremi"), vehiclePopup.vehicleIds.length > 0 && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      background: '#c53030',
      color: 'white',
      border: 'none'
    },
    onClick: () => {
      onAssignVehicle(vehiclePopup.rowId, [], '');
      setVehiclePopup(null);
    }
  }, "Ukloni sve"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm",
    onClick: () => setVehiclePopup(null)
  }, "Odustani")))), document.body));
}

// ─── RIGHT PANEL ──────────────────────────────────────────────────────────────
function RightPanel(_ref9) {
  let {
    selectedDate,
    daySchedules,
    schedules,
    workers,
    departments,
    vehicles,
    wName,
    dName,
    statsByJob,
    statsByDept,
    godisnji,
    onAdd,
    onAddWithJob,
    copyFromDate,
    yesterday,
    onWorkerClick
  } = _ref9;
  const [copyDate, setCopyDate] = useState('');
  const assignedWorkers = new Set([...daySchedules.flatMap(s => s.allWorkers || []), ...daySchedules.flatMap(s => {
    const vIds = s.vehicleIds?.length ? s.vehicleIds : s.vehicleId ? [s.vehicleId] : [];
    const driverIds = vIds.map(vid => (vehicles || []).find(v => v.id === vid)?.driverId).filter(Boolean);
    if (s.otherDriverId) return [s.otherDriverId];
    return driverIds;
  })]);
  const absentMap = {};
  Object.entries(godisnji || {}).forEach(_ref0 => {
    let [wId, entries] = _ref0;
    const entry = entries.find(e => e.date === selectedDate) || entries.find(e => e.open && e.dateOd && e.dateOd <= selectedDate);
    if (entry) absentMap[wId] = entry;
  });
  const activeWorkers = workers.filter(w => w.status === 'aktivan');
  const unassigned = activeWorkers.filter(w => !assignedWorkers.has(w.id) && !absentMap[w.id]);
  const ODSUTNOST_STYLE = {
    'Godišnji odmor': {
      short: 'GO',
      icon: '🏖️',
      bg: '#e4edf5',
      color: '#1a3d5c',
      border: '#9bbfd9'
    },
    'Bolovanje': {
      short: 'B',
      icon: '🏥',
      bg: '#fde8e8',
      color: '#8b2020',
      border: '#e0a0a0'
    },
    'Slobodan dan': {
      short: 'SD',
      icon: '☀️',
      bg: '#fdf0e0',
      color: '#b5620a',
      border: '#e8c17a'
    },
    'Neplaćeno': {
      short: 'N',
      icon: '📋',
      bg: '#f0f0f0',
      color: '#555',
      border: '#ccc'
    }
  };

  // Absent workers grouped by leave type (only Bolovanje, Godišnji odmor, Neplaćeno)
  const SHOWN_LEAVE_TYPES = ['Bolovanje', 'Godišnji odmor', 'Neplaćeno'];
  const absentByType = {};
  Object.entries(absentMap).forEach(_ref1 => {
    let [wId, entry] = _ref1;
    if (!SHOWN_LEAVE_TYPES.includes(entry.type)) return;
    const w = workers.find(x => x.id === wId);
    if (!w || assignedWorkers.has(w.id)) return;
    if (!absentByType[entry.type]) absentByType[entry.type] = [];
    absentByType[entry.type].push(w);
  });
  const hasAbsent = Object.keys(absentByType).length > 0;

  // Group unassigned by category
  const unassignedByCat = WORKER_CATEGORIES.filter(c => c.id !== 'poslovoda').map(cat => ({
    cat,
    workers: unassigned.filter(w => w.category === cat.id)
  })).filter(g => g.workers.length > 0);
  return /*#__PURE__*/React.createElement("aside", {
    className: "right-panel"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '1rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: '0.65rem',
      letterSpacing: '0.1em',
      color: 'var(--text-light)',
      textTransform: 'uppercase',
      marginBottom: '0.5rem'
    }
  }, "Brzi unos"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    style: {
      width: '100%',
      marginBottom: '0.5rem'
    },
    onClick: onAdd
  }, "+ Novi unos"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary",
    style: {
      width: '100%',
      marginBottom: '0.5rem'
    },
    onClick: () => copyFromDate(yesterday)
  }, "\uD83D\uDCCB Kopiraj ju\u010Der"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '0.5rem'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "form-input",
    value: copyDate,
    onChange: e => setCopyDate(e.target.value),
    style: {
      flex: 1,
      fontSize: '0.78rem'
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm",
    disabled: !copyDate,
    onClick: () => {
      copyFromDate(copyDate);
      setCopyDate('');
    }
  }, "Kopiraj"))), /*#__PURE__*/React.createElement("div", {
    className: "divider"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '1rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: '0.65rem',
      letterSpacing: '0.1em',
      color: 'var(--text-light)',
      textTransform: 'uppercase',
      marginBottom: '0.5rem'
    }
  }, "Vrsta posla \u2014 klikni"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.3rem'
    }
  }, JOB_TYPES.map(jt => /*#__PURE__*/React.createElement("button", {
    key: jt,
    className: jobBadgeClass(jt),
    onClick: () => onAddWithJob(jt),
    style: {
      cursor: 'pointer',
      fontSize: '0.65rem',
      padding: '0.25rem 0.5rem',
      borderRadius: 4,
      border: '1px solid var(--border)',
      transition: 'all 0.1s'
    }
  }, "+ ", jt)))), /*#__PURE__*/React.createElement("div", {
    className: "divider"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '1rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: '0.65rem',
      letterSpacing: '0.1em',
      color: 'var(--text-light)',
      textTransform: 'uppercase',
      marginBottom: '0.6rem'
    }
  }, "Po odjelu"), Object.keys(statsByDept).length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.8rem',
      color: 'var(--text-light)'
    }
  }, "Nema podataka"), Object.entries(statsByDept).map(_ref10 => {
    let [dId, ws] = _ref10;
    return /*#__PURE__*/React.createElement("div", {
      key: dId,
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.35rem 0',
        borderBottom: '1px solid var(--border)',
        fontSize: '0.82rem'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-muted)'
      }
    }, dName(dId)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        fontWeight: 600,
        color: 'var(--green)'
      }
    }, ws.size));
  })), /*#__PURE__*/React.createElement("div", {
    className: "divider"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: '0.65rem',
      letterSpacing: '0.1em',
      color: 'var(--text-light)',
      textTransform: 'uppercase',
      marginBottom: '0.6rem'
    }
  }, "Neraspore\u0111eni (", unassigned.length, ") ", /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: 0.6,
      fontWeight: 400,
      fontSize: '0.55rem'
    }
  }, "\u2199 klikni")), unassigned.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.8rem',
      color: 'var(--green)',
      fontWeight: 500
    }
  }, "\u2713 Svi raspore\u0111eni") : unassignedByCat.map(_ref11 => {
    let {
      cat,
      workers: ws
    } = _ref11;
    return /*#__PURE__*/React.createElement("div", {
      key: cat.id,
      style: {
        marginBottom: '0.5rem'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.62rem',
        fontWeight: 700,
        color: cat.color,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        marginBottom: '0.2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem'
      }
    }, /*#__PURE__*/React.createElement("span", null, cat.icon), cat.short), ws.map(w => /*#__PURE__*/React.createElement("div", {
      key: w.id,
      onClick: () => onWorkerClick(w),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.3rem 0.5rem',
        marginBottom: '0.15rem',
        fontSize: '0.8rem',
        fontWeight: 500,
        background: cat.pale,
        border: `1px solid ${cat.border}`,
        borderLeft: `3px solid ${cat.color}`,
        borderRadius: 4,
        cursor: 'pointer',
        transition: 'all 0.1s',
        color: cat.color
      },
      onMouseEnter: e => e.currentTarget.style.background = cat.border,
      onMouseLeave: e => e.currentTarget.style.background = cat.pale
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.85rem'
      }
    }, cat.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, w.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.6rem',
        opacity: 0.6
      }
    }, "\u2192"))));
  })), hasAbsent && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "divider"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: '0.65rem',
      letterSpacing: '0.1em',
      color: 'var(--text-light)',
      textTransform: 'uppercase',
      marginBottom: '0.6rem'
    }
  }, "Odsutni (", Object.values(absentByType).reduce((s, arr) => s + arr.length, 0), ")"), SHOWN_LEAVE_TYPES.filter(t => absentByType[t]).map(type => {
    const s = ODSUTNOST_STYLE[type];
    return /*#__PURE__*/React.createElement("div", {
      key: type,
      style: {
        marginBottom: '0.5rem'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.62rem',
        fontWeight: 700,
        color: s.color,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        marginBottom: '0.2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem'
      }
    }, /*#__PURE__*/React.createElement("span", null, s.icon), type), absentByType[type].map(w => /*#__PURE__*/React.createElement("div", {
      key: w.id,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.3rem 0.5rem',
        marginBottom: '0.15rem',
        fontSize: '0.8rem',
        fontWeight: 500,
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderLeft: `3px solid ${s.color}`,
        borderRadius: 4,
        color: s.color,
        opacity: 0.7
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.85rem'
      }
    }, s.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, w.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.6rem',
        fontWeight: 700,
        fontFamily: 'var(--mono)'
      }
    }, s.short))));
  }))));
}

// ─── QUICK ASSIGN MODAL ───────────────────────────────────────────────────────
function QuickModal(_ref12) {
  let {
    worker,
    workers,
    departments,
    setDepartments,
    selectedDate,
    schedules,
    checkConflict,
    vehicles,
    allJobTypes,
    onSave,
    onClose,
    wName,
    godisnji,
    setGodisnji
  } = _ref12;
  const cat = getCatById(worker.category);
  const isPrimac = worker.category === 'primac_panj';

  // Two modes: 'rad' or 'odsutnost'
  const [mode, setMode] = useState('rad');
  const ODSUTNOST_TYPES = ['Godišnji odmor', 'Bolovanje', 'Slobodan dan', 'Neplaćeno'];
  const ODSUTNOST_COLOR = {
    'Godišnji odmor': {
      bg: '#e4edf5',
      color: '#1a3d5c',
      border: '#9bbfd9',
      short: 'GO',
      icon: '🌴'
    },
    'Bolovanje': {
      bg: '#fde8e8',
      color: '#8b2020',
      border: '#e0a0a0',
      short: 'B',
      icon: '🏥'
    },
    'Slobodan dan': {
      bg: '#fdf0e0',
      color: '#b5620a',
      border: '#e8c17a',
      short: 'SD',
      icon: '☀️'
    },
    'Neplaćeno': {
      bg: '#f0f0f0',
      color: '#555',
      border: '#ccc',
      short: 'N',
      icon: '📋'
    }
  };
  const QUICK_STATUSES = [{
    id: 'kancelarija',
    label: 'Kancelarija',
    icon: '🏢',
    bg: '#e8eaf6',
    color: '#3949ab',
    border: '#9fa8da'
  }, {
    id: 'teren',
    label: 'Teren',
    icon: '🌿',
    bg: '#e8f5e9',
    color: '#2e7d32',
    border: '#81c784'
  }];
  const DEPT_SHOW_JOBS = allJobTypes || JOB_TYPES; // show for all job types
  const DEPT_REQUIRED_JOBS = []; // none required

  // Determine jobType default based on category
  const defaultJob = () => {
    if (worker.category === 'primac_panj') return 'Primka';
    if (worker.category === 'otpremac') return 'Otprema';
    if (worker.category === 'poslovoda_isk' || worker.category === 'poslovoda_uzg') return 'Doznaka stabala';
    if (worker.category === 'vlastita_rezija') return 'Ostalo';
    return 'Ostalo';
  };
  const sortedDepts = useMemo(() => {
    const lastUsed = {};
    (schedules || []).forEach(s => {
      if (s.deptId) lastUsed[s.deptId] = Math.max(lastUsed[s.deptId] || 0, new Date(s.date).getTime());
    });
    return [...departments].sort((a, b) => {
      const au = lastUsed[a.id] || 0,
        bu = lastUsed[b.id] || 0;
      if (au !== bu) return bu - au;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }, [departments, schedules]);
  const [deptId, setDeptId] = useState('');
  const [newGJ, setNewGJ] = useState('');
  const [newBroj, setNewBroj] = useState('');
  const [jobType, setJobType] = useState(defaultJob());
  const [quickStatus, setQuickStatus] = useState(null); // 'kancelarija' | 'teren' | null
  const [odsutnostType, setOdsType] = useState('Godišnji odmor');
  const [odsDateOd, setOdsDateOd] = useState(selectedDate);
  const [odsDateDo, setOdsDateDo] = useState('');
  const [note, setNote] = useState('');
  const [extraWorkers, setExtra] = useState([]);
  const [vehicleIds, setVehicleIds] = useState([]);
  const [showOtherDriver, setShowOtherDriver] = useState(false);
  const [otherDriverId, setOtherDriverId] = useState('');
  const [forceOverride, setForce] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [workerSearch, setWorkerSearch] = useState('');
  const OTHER_DRIVER_CATS = ['poslovoda_isk', 'poslovoda_uzg', 'primac_panj', 'otpremac'];
  const availableVehicles = (vehicles || []).filter(v => v.status === 'vozno');
  const regularVozaci = workers.filter(w => w.category === 'vozac' && w.status === 'aktivan');
  const otherPotentialDrivers = workers.filter(w => OTHER_DRIVER_CATS.includes(w.category) && w.status === 'aktivan');
  const activeWorkers = workers.filter(w => w.status === 'aktivan').sort((a, b) => {
    const catIds = WORKER_CATEGORIES.map(c => c.id);
    const ai = catIds.indexOf(a.category),
      bi = catIds.indexOf(b.category);
    const ca = ai === -1 ? 999 : ai,
      cb = bi === -1 ? 999 : bi;
    return ca !== cb ? ca - cb : a.name.localeCompare(b.name);
  });
  const absentWorkerIds = new Set(Object.entries(godisnji || {}).filter(_ref13 => {
    let [wId, entries] = _ref13;
    return entries.some(e => e.date === selectedDate || e.open && e.dateOd && e.dateOd <= selectedDate);
  }).map(_ref14 => {
    let [wId] = _ref14;
    return wId;
  }));
  const companions = activeWorkers.filter(w => w.id !== worker.id && !absentWorkerIds.has(w.id) && (w.category === 'radnik_primka' || w.category === 'pomocni' || w.category === 'primac_panj'));
  const companionGroups = [{
    label: 'Radnici u primci',
    workers: companions.filter(w => w.category === 'radnik_primka')
  }, {
    label: 'Pomoćni radnici',
    workers: companions.filter(w => w.category === 'pomocni')
  }, {
    label: 'Primači (opciono)',
    workers: companions.filter(w => w.category === 'primac_panj')
  }].filter(g => g.workers.length > 0);
  const toggleExtra = wId => setExtra(prev => prev.includes(wId) ? prev.filter(x => x !== wId) : [...prev, wId]);
  const allWorkers = isPrimac ? [worker.id, ...extraWorkers].filter(Boolean) : [worker.id];
  const addDept = () => {
    if (!newGJ) return alert('Odaberi gospodarsku jedinicu!');
    if (!newBroj.trim()) return alert('Unesi broj odjela!');
    const exists = departments.find(d => d.gospodarskaJedinica === newGJ && d.brojOdjela === newBroj.trim());
    if (exists) {
      setDeptId(exists.id);
      return;
    }
    const nd = {
      id: uid(),
      gospodarskaJedinica: newGJ,
      brojOdjela: newBroj.trim(),
      note: ''
    };
    setDepartments(ds => [...ds, nd]);
    setDeptId(nd.id);
    setNewGJ('');
    setNewBroj('');
  };
  const handleSaveOdsutnost = () => {
    if (!odsDateOd) return alert('Odaberi datum!');
    if (odsDateDo && odsDateDo < odsDateOd) return alert('Datum "Do" mora biti nakon datuma "Od"!');
    if (!odsDateDo) {
      // Open-ended leave — no end date known yet
      setGodisnji(g => {
        const prev = (g[worker.id] || []).filter(e => !(e.open && e.dateOd === odsDateOd && e.type === odsutnostType));
        return {
          ...g,
          [worker.id]: [...prev, {
            dateOd: odsDateOd,
            type: odsutnostType,
            note,
            open: true
          }]
        };
      });
      onClose();
      return;
    }
    const startDate = new Date(odsDateOd);
    const endDate = new Date(odsDateDo);
    const dates = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dw = d.getDay();
      if (dw !== 0 && dw !== 6) dates.push(d.toISOString().slice(0, 10));
    }
    if (dates.length === 0) return alert('Nema radnih dana u odabranom periodu!');
    setGodisnji(g => {
      const prev = (g[worker.id] || []).filter(e => !dates.includes(e.date));
      const newEntries = dates.map(dt => ({
        date: dt,
        type: odsutnostType,
        note
      }));
      return {
        ...g,
        [worker.id]: [...prev, ...newEntries]
      };
    });
    onClose();
  };
  const handleSaveKancelarijaOrTeren = () => {
    const entry = {
      id: uid(),
      date: selectedDate,
      deptId: deptId || 'kancelarija_teren',
      jobType: quickStatus === 'kancelarija' ? 'Kancelarija' : 'Teren',
      primatWorker: null,
      helper1Worker: null,
      helper2Worker: null,
      extraWorkers: [],
      allWorkers: [worker.id],
      note,
      overrides: []
    };
    onSave(entry);
  };
  const handleSaveRad = () => {
    const isDeptRequired = false;
    const finalAllWorkers = otherDriverId && !allWorkers.includes(otherDriverId) ? [...allWorkers, otherDriverId] : allWorkers;
    const entry = {
      id: uid(),
      date: selectedDate,
      deptId,
      jobType: quickStatus === 'kancelarija' ? 'Kancelarija' : quickStatus === 'teren' ? 'Teren' : jobType,
      primatWorker: isPrimac ? worker.id : null,
      helper1Worker: null,
      helper2Worker: null,
      extraWorkers: isPrimac ? extraWorkers : [],
      allWorkers: finalAllWorkers,
      note,
      overrides: [],
      vehicleId: vehicleIds[0] || '',
      vehicleIds: vehicleIds,
      otherDriverId: otherDriverId || ''
    };
    const c = checkConflict(entry, null);
    if (c.length > 0 && !forceOverride) {
      setConflicts(c);
      return;
    }
    onSave({
      ...entry,
      overrides: forceOverride ? c : []
    });
  };
  const oc = ODSUTNOST_COLOR[odsutnostType];
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: e => e.target === e.currentTarget && onClose()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    style: {
      maxWidth: isPrimac && mode === 'rad' ? 520 : 400
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header",
    style: {
      background: cat?.pale,
      borderBottom: `2px solid ${cat?.border}`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '1.5rem'
    }
  }, cat?.icon), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-title",
    style: {
      color: cat?.color
    }
  }, worker.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.72rem',
      color: cat?.color,
      opacity: 0.8,
      fontWeight: 600
    }
  }, cat?.label)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: '0.75rem',
      color: 'var(--text-muted)',
      background: 'var(--bg)',
      border: '1px solid var(--border)',
      borderRadius: 4,
      padding: '0.2rem 0.5rem'
    }
  }, selectedDate), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-icon",
    onClick: onClose
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      borderBottom: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setMode('rad'),
    style: {
      padding: '0.6rem',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '0.82rem',
      background: mode === 'rad' ? 'var(--green-pale)' : 'var(--bg)',
      color: mode === 'rad' ? 'var(--green)' : 'var(--text-muted)',
      borderBottom: mode === 'rad' ? '2px solid var(--green)' : '2px solid transparent'
    }
  }, "\uD83D\uDCBC Rasporedi na posao"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setMode('odsutnost'),
    style: {
      padding: '0.6rem',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '0.82rem',
      background: mode === 'odsutnost' ? '#fde8e8' : 'var(--bg)',
      color: mode === 'odsutnost' ? '#8b2020' : 'var(--text-muted)',
      borderBottom: mode === 'odsutnost' ? '2px solid #8b2020' : '2px solid transparent'
    }
  }, "\uD83C\uDFD6\uFE0F Odsutnost")), /*#__PURE__*/React.createElement("div", {
    className: "modal-body",
    style: {
      maxHeight: '68vh',
      overflowY: 'auto'
    }
  }, mode === 'odsutnost' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '0.5rem',
      marginBottom: '0.75rem'
    }
  }, ODSUTNOST_TYPES.map(t => {
    const o = ODSUTNOST_COLOR[t];
    return /*#__PURE__*/React.createElement("button", {
      key: t,
      type: "button",
      onClick: () => setOdsType(t),
      style: {
        padding: '0.65rem 0.5rem',
        border: `2px solid ${odsutnostType === t ? o.color : o.border}`,
        borderRadius: 8,
        background: odsutnostType === t ? o.bg : 'var(--bg)',
        color: odsutnostType === t ? o.color : 'var(--text-muted)',
        fontWeight: odsutnostType === t ? 700 : 400,
        fontSize: '0.82rem',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.2rem'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '1.3rem'
      }
    }, o.icon), /*#__PURE__*/React.createElement("span", null, t));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.5rem',
      marginBottom: '0.5rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      marginBottom: 0
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Od *"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "form-input",
    value: odsDateOd,
    onChange: e => {
      setOdsDateOd(e.target.value);
      if (odsDateDo && odsDateDo < e.target.value) setOdsDateDo(e.target.value);
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      marginBottom: 0
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Do ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-light)',
      fontWeight: 400
    }
  }, "(opciono)")), /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "form-input",
    value: odsDateDo,
    min: odsDateOd || undefined,
    onChange: e => setOdsDateDo(e.target.value)
  }))), odsDateOd && !odsDateDo && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.75rem',
      color: '#b5620a',
      marginBottom: '0.4rem',
      fontStyle: 'italic'
    }
  }, "Bez krajnjeg datuma \u2014 odsutnost ostaje otvorena dok se ne zaklju\u010Di"), odsDateOd && odsDateDo && odsDateDo >= odsDateOd && (() => {
    const s = new Date(odsDateOd),
      e = new Date(odsDateDo);
    let count = 0;
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      const dw = d.getDay();
      if (dw !== 0 && dw !== 6) count++;
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        marginBottom: '0.4rem'
      }
    }, "\uD83D\uDCC5 ", count, " radni", count === 1 ? '' : count < 5 ? 'a' : 'h', " dan", count === 1 ? '' : count < 5 ? 'a' : 'a', " u periodu");
  })(), /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      marginBottom: 0
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Napomena"), /*#__PURE__*/React.createElement("input", {
    className: "form-input",
    placeholder: "Opcionalno...",
    value: note,
    onChange: e => setNote(e.target.value)
  }))), mode === 'rad' && /*#__PURE__*/React.createElement("div", null, conflicts.length > 0 && !forceOverride && /*#__PURE__*/React.createElement("div", {
    className: "alert alert-warning",
    style: {
      marginBottom: '0.75rem'
    }
  }, "\u26A0\uFE0F Konflikt: ", /*#__PURE__*/React.createElement("strong", null, conflicts.map(wName).join(', ')), " ve\u0107 raspore\u0111eni.", /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '0.4rem'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm",
    onClick: () => setForce(true)
  }, "Ipak sa\u010Duvaj"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.4rem',
      marginBottom: '0.75rem'
    }
  }, QUICK_STATUSES.map(qs => /*#__PURE__*/React.createElement("button", {
    key: qs.id,
    type: "button",
    onClick: () => {
      const next = quickStatus === qs.id ? null : qs.id;
      setQuickStatus(next);
      if (next === 'teren') setDeptId('');
    },
    style: {
      padding: '0.5rem',
      border: `2px solid ${quickStatus === qs.id ? qs.color : qs.border}`,
      borderRadius: 8,
      background: quickStatus === qs.id ? qs.bg : 'var(--bg)',
      color: quickStatus === qs.id ? qs.color : 'var(--text-muted)',
      fontWeight: quickStatus === qs.id ? 700 : 400,
      fontSize: '0.82rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.4rem'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '1.1rem'
    }
  }, qs.icon), qs.label))), !quickStatus && /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Vrsta posla"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.3rem'
    }
  }, (allJobTypes || JOB_TYPES).map(jt => /*#__PURE__*/React.createElement("button", {
    key: jt,
    type: "button",
    onClick: () => setJobType(jt),
    className: jobBadgeClass(jt),
    style: {
      cursor: 'pointer',
      border: jobType === jt ? '2px solid #333' : '2px solid transparent',
      opacity: jobType === jt ? 1 : 0.55,
      fontSize: '0.75rem',
      padding: '0.25rem 0.6rem'
    }
  }, jt)))), quickStatus !== 'kancelarija' && /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Odjel / Radili\u0161te ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-light)',
      fontSize: '0.72rem',
      fontWeight: 400
    }
  }, "(opciono)")), departments.length > 0 && /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: deptId,
    onChange: e => setDeptId(e.target.value),
    style: {
      marginBottom: '0.4rem'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u2014 Odaberi postoje\u0107i \u2014"), sortedDepts.map(d => /*#__PURE__*/React.createElement("option", {
    key: d.id,
    value: d.id
  }, d.gospodarskaJedinica, " \u2014 Odjel ", d.brojOdjela))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '0.4rem',
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.7rem',
      color: 'var(--text-light)',
      marginBottom: '0.2rem'
    }
  }, "Gospodarska jedinica"), /*#__PURE__*/React.createElement("input", {
    className: "form-input",
    list: "gj-list-quick",
    placeholder: "Odaberi ili upi\u0161i...",
    value: newGJ,
    onChange: e => setNewGJ(e.target.value),
    style: {
      fontSize: '0.82rem'
    }
  }), /*#__PURE__*/React.createElement("datalist", {
    id: "gj-list-quick"
  }, GOSPODARSKE_JEDINICE.map(g => /*#__PURE__*/React.createElement("option", {
    key: g,
    value: g
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.7rem',
      color: 'var(--text-light)',
      marginBottom: '0.2rem'
    }
  }, "Br. odjela"), /*#__PURE__*/React.createElement("input", {
    className: "form-input",
    placeholder: "npr. 54",
    value: newBroj,
    onChange: e => setNewBroj(e.target.value),
    style: {
      fontSize: '0.82rem'
    },
    onKeyDown: e => e.key === 'Enter' && addDept()
  })), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm",
    style: {
      whiteSpace: 'nowrap',
      flexShrink: 0
    },
    onClick: addDept
  }, "+ Dodaj")), deptId && departments.find(d => d.id === deptId) && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '0.3rem',
      fontSize: '0.75rem',
      color: 'var(--green)',
      fontWeight: 600
    }
  }, "\u2713 ", departments.find(d => d.id === deptId).gospodarskaJedinica, " \u2014 Odjel ", departments.find(d => d.id === deptId).brojOdjela)), isPrimac && !quickStatus && /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Pratioci (opciono)"), /*#__PURE__*/React.createElement("input", {
    className: "form-input",
    placeholder: "\uD83D\uDD0D Pretra\u017Ei radnika...",
    value: workerSearch,
    onChange: e => setWorkerSearch(e.target.value),
    style: {
      marginBottom: '0.4rem',
      fontSize: '0.82rem',
      padding: '0.35rem 0.6rem'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "worker-selector"
  }, companionGroups.map(g => {
    const filtered = g.workers.filter(w => !extraWorkers.includes(w.id) && (!workerSearch || w.name.toLowerCase().includes(workerSearch.toLowerCase())));
    if (filtered.length === 0) return null;
    return /*#__PURE__*/React.createElement("div", {
      key: g.label
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0.25rem 0.7rem',
        fontSize: '0.62rem',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--text-light)',
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)'
      }
    }, g.label), filtered.map(w => {
      const wcat = getCatById(w.category);
      return /*#__PURE__*/React.createElement("div", {
        key: w.id,
        className: "worker-option",
        onClick: () => toggleExtra(w.id)
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: '0.85rem'
        }
      }, wcat?.icon), w.name, /*#__PURE__*/React.createElement("span", {
        style: {
          marginLeft: 'auto',
          fontSize: '0.65rem',
          color: wcat?.color,
          background: wcat?.pale,
          border: `1px solid ${wcat?.border}`,
          padding: '0.1rem 0.3rem',
          borderRadius: 3,
          fontFamily: 'var(--mono)'
        }
      }, wcat?.short));
    }));
  })), extraWorkers.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.3rem',
      marginTop: '0.4rem'
    }
  }, extraWorkers.map(wId => {
    const w = workers.find(x => x.id === wId);
    return /*#__PURE__*/React.createElement("span", {
      key: wId,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: '0.2rem 0.4rem 0.2rem 0.6rem',
        fontSize: '0.78rem'
      }
    }, w?.name, /*#__PURE__*/React.createElement("button", {
      onClick: () => toggleExtra(wId),
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text-muted)',
        fontSize: '0.75rem',
        padding: '0 0.1rem'
      }
    }, "\u2715"));
  }))), availableVehicles.length > 0 && !quickStatus && /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "\uD83D\uDE97 Vozila (prevoz ekipe)"), vehicleIds.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.3rem',
      marginBottom: '0.4rem'
    }
  }, vehicleIds.map(vid => {
    const v = availableVehicles.find(x => x.id === vid);
    if (!v) return null;
    const drv = v.driverId ? workers.find(w => w.id === v.driverId) : null;
    return /*#__PURE__*/React.createElement("div", {
      key: vid,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.35rem 0.5rem',
        background: '#f0f7f0',
        border: '1px solid #a5d6a7',
        borderRadius: 6,
        fontSize: '0.78rem'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600
      }
    }, "\uD83D\uDE97 ", v.registracija), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-muted)',
        marginLeft: '0.3rem'
      }
    }, v.tipVozila, " \xB7 ", v.brojMjesta, " mj."), drv && /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#2a6478',
        marginLeft: '0.3rem'
      }
    }, "(", drv.name, ")")), /*#__PURE__*/React.createElement("button", {
      onClick: () => setVehicleIds(prev => prev.filter(id => id !== vid)),
      style: {
        background: '#c53030',
        color: 'white',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
        fontSize: '0.65rem',
        padding: '0.15rem 0.35rem',
        fontWeight: 600
      }
    }, "\u2715"));
  })), /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: "",
    onChange: e => {
      if (e.target.value && !vehicleIds.includes(e.target.value)) {
        setVehicleIds(prev => [...prev, e.target.value]);
      }
    },
    style: {
      marginBottom: '0.3rem'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u2014 Dodaj vozilo \u2014"), availableVehicles.filter(v => !vehicleIds.includes(v.id)).map(v => {
    const drv = v.driverId ? workers.find(w => w.id === v.driverId) : null;
    return /*#__PURE__*/React.createElement("option", {
      key: v.id,
      value: v.id
    }, v.registracija, " \u2014 ", v.tipVozila, " (", v.brojMjesta, " mj.)", drv ? ` — ${drv.name}` : '');
  })), vehicleIds.length > 0 && (() => {
    const totalWorkers = allWorkers.length + (otherDriverId ? 1 : 0);
    let remaining = totalWorkers;
    const perVehicle = vehicleIds.map(vid => {
      const v = availableVehicles.find(x => x.id === vid);
      const cap = v?.brojMjesta || 0;
      const fill = Math.min(remaining, cap);
      remaining = Math.max(0, remaining - cap);
      return {
        vid,
        cap,
        fill,
        v
      };
    });
    const totalCap = perVehicle.reduce((s, p) => s + p.cap, 0);
    const isOver = totalWorkers > totalCap;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: '0.3rem'
      }
    }, perVehicle.map((pv, idx) => /*#__PURE__*/React.createElement("div", {
      key: pv.vid,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        marginBottom: '0.2rem',
        fontSize: '0.72rem'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-muted)',
        minWidth: 90
      }
    }, pv.v?.registracija || '?'), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 7,
        background: '#eee',
        borderRadius: 4,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        width: `${pv.cap > 0 ? Math.min(100, pv.fill / pv.cap * 100) : 0}%`,
        background: pv.fill >= pv.cap ? '#ed8936' : '#38a169',
        borderRadius: 4,
        transition: 'width 0.3s'
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        color: pv.fill >= pv.cap ? pv.fill > pv.cap ? '#c53030' : '#b5620a' : 'var(--green)',
        minWidth: 40,
        textAlign: 'right'
      }
    }, pv.fill, "/", pv.cap))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.72rem',
        fontWeight: 600,
        color: isOver ? '#c53030' : 'var(--green)',
        marginTop: '0.15rem'
      }
    }, isOver ? '⚠️' : '✅', " Ukupno: ", totalWorkers, " radnika / ", totalCap, " mjesta (", vehicleIds.length, " voz.)", remaining > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#c53030'
      }
    }, " \u2014 ", remaining, " bez mjesta!")));
  })(), vehicleIds.length > 0 && (!showOtherDriver ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setShowOtherDriver(true),
    style: {
      marginTop: 4,
      background: 'none',
      border: 'none',
      color: 'var(--blue, #2a6478)',
      cursor: 'pointer',
      fontSize: '0.72rem',
      padding: 0,
      textDecoration: 'underline'
    }
  }, "+ Drugi voza\u010D za danas (poslovo\u0111a, prima\u010D, otprema\u010D)...") : /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '0.4rem',
      background: '#fff8e1',
      border: '1px solid #ffe082',
      borderRadius: 'var(--radius)',
      padding: '0.4rem 0.5rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.7rem',
      color: '#b5620a',
      marginBottom: '0.2rem',
      fontWeight: 600
    }
  }, "\uD83D\uDD04 Drugi \u0161ofer \u2014 samo za danas"), /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: otherDriverId,
    onChange: e => setOtherDriverId(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u2014 Stalni \u0161ofer \u2014"), OTHER_DRIVER_CATS.map(catId => {
    const catI = getCatById(catId);
    const catW = otherPotentialDrivers.filter(w => w.category === catId);
    if (catW.length === 0) return null;
    return /*#__PURE__*/React.createElement("optgroup", {
      key: catId,
      label: catI ? catI.label : catId
    }, catW.map(w => /*#__PURE__*/React.createElement("option", {
      key: w.id,
      value: w.id
    }, w.name)));
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      setShowOtherDriver(false);
      setOtherDriverId('');
    },
    style: {
      marginTop: 4,
      background: 'none',
      border: 'none',
      color: '#2a6478',
      cursor: 'pointer',
      fontSize: '0.72rem',
      padding: 0,
      textDecoration: 'underline'
    }
  }, "\u2190 Ukloni drugog voza\u010Da")))), /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      marginBottom: 0
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Napomena"), /*#__PURE__*/React.createElement("input", {
    className: "form-input",
    placeholder: "Opcionalno...",
    value: note,
    onChange: e => setNote(e.target.value)
  })))), /*#__PURE__*/React.createElement("div", {
    className: "modal-footer"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary",
    onClick: onClose
  }, "Odustani"), mode === 'odsutnost' ? /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    style: {
      background: oc?.color,
      borderColor: oc?.color
    },
    onClick: handleSaveOdsutnost
  }, oc?.icon, " Sa\u010Duvaj ", odsutnostType) : quickStatus === 'kancelarija' ? /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    style: {
      background: '#3949ab',
      borderColor: '#3949ab'
    },
    onClick: handleSaveKancelarijaOrTeren
  }, "\uD83C\uDFE2 Kancelarija") : quickStatus === 'teren' ? /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    style: {
      background: '#2e7d32',
      borderColor: '#2e7d32'
    },
    onClick: handleSaveRad
  }, "\uD83C\uDF3F Teren") : /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    style: {
      background: cat?.color,
      borderColor: cat?.color
    },
    onClick: handleSaveRad
  }, "\u2713 Rasporedi ", worker.name.split(' ')[0]))));
}

// ─── ENTRY MODAL ──────────────────────────────────────────────────────────────
function EntryModal(_ref15) {
  let {
    data,
    isEdit,
    workers,
    departments,
    setDepartments,
    schedules,
    checkConflict,
    vehicles,
    allJobTypes,
    onSave,
    onClose,
    wName,
    godisnji,
    selectedDate
  } = _ref15;
  const initJobType = data.jobType || (allJobTypes || JOB_TYPES)[0];
  const DEPT_REQUIRED_JOBS_INIT = [];
  const [form, setForm] = useState({
    id: data.id || uid(),
    date: data.date || today(),
    deptId: data.deptId || '',
    jobType: initJobType,
    primatWorker: data.primatWorker || '',
    helper1Worker: data.helper1Worker || '',
    helper2Worker: data.helper2Worker || '',
    extraWorkers: data.extraWorkers || [],
    allWorkers: data.allWorkers || [],
    note: data.note || '',
    vehicleId: data.vehicleId || '',
    vehicleIds: data.vehicleIds || (data.vehicleId ? [data.vehicleId] : []),
    otherDriverId: data.otherDriverId || '',
    kisaMode: data.kisaMode || 'go',
    overrides: data.overrides || []
  });
  const [conflicts, setConflicts] = useState([]);
  const [forceOverride, setForceOverride] = useState(false);
  const [workerSearch, setWorkerSearch] = useState('');
  const [helperSearch, setHelperSearch] = useState('');
  const [autoCrewNote, setAutoCrewNote] = useState('');
  const [showOtherDriver, setShowOtherDriver] = useState(!!data.otherDriverId);
  const OTHER_DRIVER_CATS = ['poslovoda_isk', 'poslovoda_uzg', 'primac_panj', 'otpremac'];
  const otherPotentialDrivers = workers.filter(w => OTHER_DRIVER_CATS.includes(w.category) && w.status === 'aktivan');
  const catIds = WORKER_CATEGORIES.map(c => c.id);
  const activeWorkers = workers.filter(w => w.status === 'aktivan').sort((a, b) => {
    const ai = catIds.indexOf(a.category),
      bi = catIds.indexOf(b.category);
    const ca = ai === -1 ? 999 : ai,
      cb = bi === -1 ? 999 : bi;
    return ca !== cb ? ca - cb : a.name.localeCompare(b.name);
  });
  // Sort departments: most recently used in schedules first, then most recently added
  const sortedDepts = useMemo(() => {
    const lastUsed = {};
    (schedules || []).forEach(s => {
      if (s.deptId) lastUsed[s.deptId] = Math.max(lastUsed[s.deptId] || 0, new Date(s.date).getTime());
    });
    return [...departments].sort((a, b) => {
      const au = lastUsed[a.id] || 0,
        bu = lastUsed[b.id] || 0;
      if (au !== bu) return bu - au;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }, [departments, schedules]);
  const isOtprema = form.jobType === 'Otprema';
  const isPrimka = form.jobType === 'Primka';
  const isKisa = form.jobType === 'Kiša';
  const isTerenOrKanc = form.jobType === 'Teren' || form.jobType === 'Kancelarija';
  const isDeptShown = true;
  const isDeptRequired = false;
  const TERENSKI_CATS = ['primac_panj', 'otpremac', 'pomocni', 'radnik_primka', 'vlastita_rezija', 'vozac'];
  const availableVehicles = (vehicles || []).filter(v => v.status === 'vozno');
  const ENTRY_DRIVER_CATS = ['vozac', 'poslovoda_isk', 'poslovoda_uzg', 'primac_panj', 'otpremac'];
  // Auto-detect default vehicle from driver in selected workers
  const driverInWorkers = form.allWorkers.map(wId => workers.find(w => w.id === wId)).find(w => w && ENTRY_DRIVER_CATS.includes(w.category));
  const defaultVehicle = driverInWorkers ? (vehicles || []).find(v => v.driverId === driverInWorkers.id && v.status === 'vozno') : null;

  // Multi-vehicle capacity
  const workerCount = form.allWorkers.length;
  const totalVehicleCapacity = form.vehicleIds.reduce((sum, vid) => {
    const v = availableVehicles.find(x => x.id === vid);
    return sum + (v?.brojMjesta || 0);
  }, 0);
  const isOverCapacity = form.vehicleIds.length > 0 && workerCount > totalVehicleCapacity;

  // Radnici koji su već raspoređeni za isti datum u drugim unosima
  const alreadyScheduled = new Set(schedules.filter(s => s.date === form.date && (!isEdit || s.id !== form.id)).flatMap(s => s.allWorkers || []));
  const checkDate = form.date || selectedDate;
  const absentWorkerIds = new Set(Object.entries(godisnji || {}).filter(_ref16 => {
    let [wId, entries] = _ref16;
    return entries.some(e => e.date === checkDate || e.open && e.dateOd && e.dateOd <= checkDate);
  }).map(_ref17 => {
    let [wId] = _ref17;
    return wId;
  }));
  const availableWorkers = activeWorkers.filter(w => !alreadyScheduled.has(w.id) && !absentWorkerIds.has(w.id));
  useEffect(() => {
    if (isPrimka) {
      const ws = [form.primatWorker, ...(form.extraWorkers || [])].filter(Boolean);
      setForm(f => ({
        ...f,
        allWorkers: ws
      }));
    }
  }, [form.primatWorker, form.extraWorkers, form.jobType]);

  // Uobičajena ekipa: kad se odabere primač, predloži pratioce iz njegove
  // NAJSKORIJE prošle primke (većinom ide ista ekipa) — samo ako korisnik već
  // nije ručno birao pratioce, da se ne prepiše ono što je namjerno drugačije.
  const prevPrimatRef = useRef(form.primatWorker);
  useEffect(() => {
    if (!isPrimka) return;
    if (form.primatWorker === prevPrimatRef.current) return;
    prevPrimatRef.current = form.primatWorker;
    setAutoCrewNote('');
    if (!form.primatWorker || form.extraWorkers.length > 0) return;
    const past = (schedules || []).filter(s => s.jobType === 'Primka' && s.primatWorker === form.primatWorker && (!isEdit || s.id !== form.id)).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    if (past.length === 0) return;
    const lastCrew = (past[0].extraWorkers || []).filter(wId => availableWorkers.some(w => w.id === wId));
    if (lastCrew.length === 0) return;
    setForm(f => ({
      ...f,
      extraWorkers: [...new Set([...f.extraWorkers, ...lastCrew])]
    }));
    setAutoCrewNote(`📋 Dodana uobičajena ekipa (kao ${fmtDate(past[0].date)}) — ukloni pojedinačno ispod ako treba drugačije.`);
  }, [form.primatWorker]);
  const toggleWorker = wId => {
    setForm(f => {
      const ws = f.allWorkers.includes(wId) ? f.allWorkers.filter(w => w !== wId) : [...f.allWorkers, wId];
      return {
        ...f,
        allWorkers: ws
      };
    });
  };
  const toggleExtra = wId => {
    setForm(f => {
      const ws = f.extraWorkers.includes(wId) ? f.extraWorkers.filter(w => w !== wId) : [...f.extraWorkers, wId];
      return {
        ...f,
        extraWorkers: ws
      };
    });
  };
  const handleSubmit = () => {
    if (form.allWorkers.length === 0) return alert('Odaberite barem jednog radnika!');
    const c = checkConflict(form, isEdit ? form.id : null);
    if (c.length > 0 && !forceOverride) {
      setConflicts(c);
      return;
    }
    const finalAllWorkers = form.otherDriverId && !form.allWorkers.includes(form.otherDriverId) ? [...form.allWorkers, form.otherDriverId] : form.allWorkers;
    onSave({
      ...form,
      allWorkers: finalAllWorkers,
      vehicleId: form.vehicleIds[0] || '',
      vehicleIds: form.vehicleIds,
      otherDriverId: form.otherDriverId || '',
      overrides: forceOverride ? c : []
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: e => e.target === e.currentTarget && onClose()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '1.2rem'
    }
  }, isEdit ? '✏️' : '+'), /*#__PURE__*/React.createElement("div", {
    className: "modal-title"
  }, isEdit ? 'Uredi unos' : 'Novi raspored'), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-icon",
    onClick: onClose
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "modal-body",
    style: {
      maxHeight: '70vh',
      overflowY: 'auto'
    }
  }, conflicts.length > 0 && !forceOverride && /*#__PURE__*/React.createElement("div", {
    className: "alert alert-warning",
    style: {
      marginBottom: '1rem'
    }
  }, "\u26A0\uFE0F Konflikt! Radnici su ve\u0107 raspore\u0111eni za ovaj datum: ", /*#__PURE__*/React.createElement("strong", null, conflicts.map(wName).join(', ')), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '0.5rem'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm",
    onClick: () => setForceOverride(true)
  }, "Ipak sa\u010Duvaj (override)"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: isDeptShown ? '1fr 1fr' : '1fr',
      gap: '0.75rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Datum"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "form-input",
    value: form.date,
    onChange: e => setForm(f => ({
      ...f,
      date: e.target.value
    }))
  })), isDeptShown && /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Odjel / Radili\u0161te ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-light)',
      fontSize: '0.72rem',
      fontWeight: 400
    }
  }, "(opciono)")), departments.length > 0 && /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: form.deptId,
    onChange: e => setForm(f => ({
      ...f,
      deptId: e.target.value
    })),
    style: {
      marginBottom: '0.4rem'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u2014 Odaberi postoje\u0107i \u2014"), sortedDepts.map(d => /*#__PURE__*/React.createElement("option", {
    key: d.id,
    value: d.id
  }, d.gospodarskaJedinica, " \u2014 Odjel ", d.brojOdjela))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '0.4rem',
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.7rem',
      color: 'var(--text-light)',
      marginBottom: '0.2rem'
    }
  }, "Gospodarska jedinica"), /*#__PURE__*/React.createElement("input", {
    className: "form-input",
    id: "newDeptGJ",
    list: "gj-list-entry",
    placeholder: "Odaberi ili upi\u0161i...",
    style: {
      fontSize: '0.82rem'
    }
  }), /*#__PURE__*/React.createElement("datalist", {
    id: "gj-list-entry"
  }, GOSPODARSKE_JEDINICE.map(g => /*#__PURE__*/React.createElement("option", {
    key: g,
    value: g
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.7rem',
      color: 'var(--text-light)',
      marginBottom: '0.2rem'
    }
  }, "Br. odjela"), /*#__PURE__*/React.createElement("input", {
    className: "form-input",
    id: "newDeptBroj",
    placeholder: "npr. 54",
    style: {
      fontSize: '0.82rem'
    }
  })), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm",
    style: {
      whiteSpace: 'nowrap',
      flexShrink: 0
    },
    onClick: () => {
      const gj = document.getElementById('newDeptGJ').value;
      const br = document.getElementById('newDeptBroj').value.trim();
      if (!gj) return alert('Odaberi gospodarsku jedinicu!');
      if (!br) return alert('Unesi broj odjela!');
      const exists = departments.find(d => d.gospodarskaJedinica === gj && d.brojOdjela === br);
      if (exists) {
        setForm(f => ({
          ...f,
          deptId: exists.id
        }));
        return;
      }
      const nd = {
        id: uid(),
        gospodarskaJedinica: gj,
        brojOdjela: br,
        note: ''
      };
      setDepartments(ds => [...ds, nd]);
      setForm(f => ({
        ...f,
        deptId: nd.id
      }));
      document.getElementById('newDeptGJ').value = '';
      document.getElementById('newDeptBroj').value = '';
    }
  }, "+ Dodaj odjel")), form.deptId && departments.find(d => d.id === form.deptId) && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '0.3rem',
      fontSize: '0.75rem',
      color: 'var(--green)',
      fontWeight: 600
    }
  }, "\u2713 ", departments.find(d => d.id === form.deptId).gospodarskaJedinica, " \u2014 Odjel ", departments.find(d => d.id === form.deptId).brojOdjela))), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Vrsta posla"), /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: form.jobType,
    onChange: e => {
      const newJob = e.target.value;
      setForm(f => ({
        ...f,
        jobType: newJob,
        allWorkers: [],
        primatWorker: '',
        helper1Worker: '',
        helper2Worker: '',
        extraWorkers: [],
        deptId: f.deptId
      }));
    }
  }, (allJobTypes || JOB_TYPES).map(jt => /*#__PURE__*/React.createElement("option", {
    key: jt
  }, jt)))), isKisa && /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#e4edf5',
      border: '1px solid #9bbfd9',
      borderRadius: 'var(--radius)',
      padding: '0.6rem 0.75rem',
      marginBottom: '0.75rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.8rem',
      fontWeight: 700,
      color: '#1a3d5c',
      marginBottom: '0.5rem'
    }
  }, "\uD83C\uDF27\uFE0F Ki\u0161a \u2014 terenski radnici"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.3rem',
      marginBottom: '0.5rem'
    }
  }, TERENSKI_CATS.map(catId => {
    const cat = getCatById(catId);
    const catWorkers = availableWorkers.filter(w => w.category === catId && !form.allWorkers.includes(w.id));
    const catSelected = form.allWorkers.filter(wId => {
      const w = workers.find(x => x.id === wId);
      return w?.category === catId;
    });
    return /*#__PURE__*/React.createElement("button", {
      key: catId,
      className: "btn btn-sm",
      onClick: () => {
        const toAdd = catWorkers.map(w => w.id);
        setForm(f => ({
          ...f,
          allWorkers: [...new Set([...f.allWorkers, ...toAdd])]
        }));
      },
      style: {
        fontSize: '0.7rem',
        padding: '0.25rem 0.5rem',
        background: catSelected.length > 0 ? cat?.color : cat?.pale,
        color: catSelected.length > 0 ? 'white' : cat?.color,
        border: `1px solid ${cat?.border}`,
        borderRadius: 4,
        cursor: catWorkers.length === 0 ? 'default' : 'pointer',
        opacity: catWorkers.length === 0 ? 0.5 : 1
      }
    }, cat?.icon, " + ", cat?.short, " (", catWorkers.length, ")");
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '0.4rem'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    style: {
      fontSize: '0.72rem'
    },
    onClick: () => {
      const allTerenski = availableWorkers.filter(w => TERENSKI_CATS.includes(w.category)).map(w => w.id);
      setForm(f => ({
        ...f,
        allWorkers: [...new Set([...f.allWorkers, ...allTerenski])]
      }));
    }
  }, "\uD83C\uDF27\uFE0F Dodaj SVE terenske radnike"), form.allWorkers.length > 0 && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-danger btn-sm",
    style: {
      fontSize: '0.72rem'
    },
    onClick: () => {
      const terenskiIds = new Set(workers.filter(w => TERENSKI_CATS.includes(w.category)).map(w => w.id));
      setForm(f => ({
        ...f,
        allWorkers: f.allWorkers.filter(id => !terenskiIds.has(id))
      }));
    }
  }, "\u2715 Ukloni sve terenske")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '0.6rem',
      borderTop: '1px solid #9bbfd9',
      paddingTop: '0.5rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.7rem',
      fontWeight: 700,
      color: '#1a3d5c',
      marginBottom: '0.3rem'
    }
  }, "\uD83D\uDCCB U \u0161ihtarici vodi kao:"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '0.3rem',
      flexWrap: 'wrap'
    }
  }, [{
    value: 'go',
    label: 'Godišnji odmor (GO)',
    bg: '#e4edf5',
    color: '#1a3d5c',
    border: '#9bbfd9'
  }, {
    value: 'rad',
    label: 'Radni dan',
    bg: '#e8f0e6',
    color: '#2d5a27',
    border: '#9bc492'
  }, {
    value: 'bolovanje',
    label: 'Bolovanje',
    bg: '#fde8e8',
    color: '#8b2020',
    border: '#e0a0a0'
  }, {
    value: 'neplaceno',
    label: 'Neplaćeno',
    bg: '#f0f0f0',
    color: '#555',
    border: '#ccc'
  }].map(opt => /*#__PURE__*/React.createElement("button", {
    key: opt.value,
    className: "btn btn-sm",
    onClick: () => setForm(f => ({
      ...f,
      kisaMode: opt.value
    })),
    style: {
      fontSize: '0.7rem',
      padding: '0.25rem 0.5rem',
      background: form.kisaMode === opt.value ? opt.color : opt.bg,
      color: form.kisaMode === opt.value ? 'white' : opt.color,
      border: `2px solid ${form.kisaMode === opt.value ? opt.color : opt.border}`,
      borderRadius: 4,
      fontWeight: form.kisaMode === opt.value ? 700 : 400,
      cursor: 'pointer'
    }
  }, opt.label))))), isPrimka ? /*#__PURE__*/React.createElement("div", {
    className: "primka-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "primka-title"
  }, "\u2696\uFE0F Primka \u2014 posebna raspodjela"), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Prima\u010D na \u0161uma panju"), /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: form.primatWorker,
    onChange: e => setForm(f => ({
      ...f,
      primatWorker: e.target.value
    }))
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u2014 Odaberi prima\u010Da \u2014"), availableWorkers.filter(w => w.category === 'primac_panj').map(w => /*#__PURE__*/React.createElement("option", {
    key: w.id,
    value: w.id
  }, w.name)))), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Pratioci prima\u010Da"), autoCrewNote && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.72rem',
      color: 'var(--green)',
      fontWeight: 600,
      marginBottom: '0.35rem'
    }
  }, autoCrewNote), /*#__PURE__*/React.createElement("input", {
    className: "form-input",
    placeholder: "\uD83D\uDD0D Pretra\u017Ei pratioce...",
    value: helperSearch,
    onChange: e => setHelperSearch(e.target.value),
    style: {
      marginBottom: '0.4rem',
      fontSize: '0.82rem',
      padding: '0.35rem 0.6rem'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "worker-selector"
  }, (() => {
    const selectedPrimac = form.primatWorker;
    const q = helperSearch.trim().toLowerCase();
    const radniciPrimka = availableWorkers.filter(w => w.category === 'radnik_primka' && w.id !== selectedPrimac);
    const pomocni = availableWorkers.filter(w => w.category === 'pomocni' && w.id !== selectedPrimac);
    const ostaliPrimaci = availableWorkers.filter(w => w.category === 'primac_panj' && w.id !== selectedPrimac);
    const allOptions = [...radniciPrimka.map(w => ({
      ...w,
      _group: 'Radnici u primci'
    })), ...pomocni.map(w => ({
      ...w,
      _group: 'Pomoćni radnici'
    })), ...ostaliPrimaci.map(w => ({
      ...w,
      _group: 'Primači (opciono)'
    }))];
    let lastGroup = null;
    let anyShown = false;
    const rows = allOptions.map(w => {
      const cat = getCatById(w.category);
      const isSelected = form.extraWorkers.includes(w.id);
      const matchesSearch = !q || w.name.toLowerCase().includes(q);
      const groupHeader = w._group !== lastGroup ? (lastGroup = w._group, /*#__PURE__*/React.createElement("div", {
        key: 'grp-' + w._group,
        style: {
          padding: '0.3rem 0.7rem',
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-light)',
          background: 'var(--bg)',
          borderBottom: '1px solid var(--border)'
        }
      }, w._group)) : null;
      if (isSelected || !matchesSearch) return [null, null];
      anyShown = true;
      return [groupHeader, /*#__PURE__*/React.createElement("div", {
        key: w.id,
        className: "worker-option",
        onClick: () => toggleExtra(w.id)
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: '0.9rem'
        }
      }, cat?.icon || '👤'), w.name, /*#__PURE__*/React.createElement("span", {
        style: {
          marginLeft: 'auto',
          fontSize: '0.65rem',
          color: cat?.color,
          background: cat?.pale,
          border: `1px solid ${cat?.border}`,
          padding: '0.1rem 0.3rem',
          borderRadius: 3,
          fontFamily: 'var(--mono)'
        }
      }, cat?.short))];
    });
    if (!anyShown) {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          padding: '0.6rem 0.75rem',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          fontStyle: 'italic'
        }
      }, q ? `Nema pratioca za "${helperSearch}"` : 'Svi raspoloživi pratioci su odabrani.');
    }
    return rows;
  })()))) : /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Radnici"), /*#__PURE__*/React.createElement("input", {
    className: "form-input",
    placeholder: "\uD83D\uDD0D Pretra\u017Ei radnika...",
    value: workerSearch,
    onChange: e => setWorkerSearch(e.target.value),
    style: {
      marginBottom: '0.4rem',
      fontSize: '0.82rem',
      padding: '0.35rem 0.6rem'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "worker-selector"
  }, availableWorkers.filter(w => !form.allWorkers.includes(w.id) && (!isOtprema || w.category === 'otpremac') && (!workerSearch || w.name.toLowerCase().includes(workerSearch.toLowerCase()))).sort((a, b) => {
    if (isTerenOrKanc) {
      const aP = a.category === 'poslovoda_isk' || a.category === 'poslovoda_uzg' ? 0 : 1;
      const bP = b.category === 'poslovoda_isk' || b.category === 'poslovoda_uzg' ? 0 : 1;
      if (aP !== bP) return aP - bP;
    }
    const catIds = WORKER_CATEGORIES.map(c => c.id);
    const ai = catIds.indexOf(a.category),
      bi = catIds.indexOf(b.category);
    const ca = ai === -1 ? 999 : ai,
      cb = bi === -1 ? 999 : bi;
    return ca !== cb ? ca - cb : a.name.localeCompare(b.name);
  }).map(w => {
    const cat = getCatById(w.category);
    return /*#__PURE__*/React.createElement("div", {
      key: w.id,
      className: "worker-option",
      onClick: () => toggleWorker(w.id)
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.9rem'
      }
    }, cat?.icon || '👤'), w.name, w.category && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 'auto',
        fontSize: '0.65rem',
        color: cat?.color,
        background: cat?.pale,
        border: `1px solid ${cat?.border}`,
        padding: '0.1rem 0.3rem',
        borderRadius: 3,
        fontFamily: 'var(--mono)'
      }
    }, cat?.short));
  }), availableWorkers.filter(w => !form.allWorkers.includes(w.id) && (!isOtprema || w.category === 'otpremac') && (!workerSearch || w.name.toLowerCase().includes(workerSearch.toLowerCase()))).length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0.6rem 0.75rem',
      fontSize: '0.78rem',
      color: 'var(--text-muted)',
      fontStyle: 'italic'
    }
  }, workerSearch ? `Nema radnika za "${workerSearch}"` : 'Svi raspoloživi radnici su odabrani.'))), form.allWorkers.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--green-pale)',
      border: '1px solid #9bc492',
      borderRadius: 'var(--radius)',
      padding: '0.6rem 0.75rem',
      marginBottom: '0.75rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.7rem',
      fontWeight: 700,
      color: 'var(--green)',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      marginBottom: '0.4rem'
    }
  }, "Odabrani radnici (", form.allWorkers.length, ")"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.3rem'
    }
  }, form.allWorkers.map(wId => {
    const w = workers.find(x => x.id === wId);
    const isPrimac = isPrimka && wId === form.primatWorker;
    const cat = getCatById(w?.category);
    return /*#__PURE__*/React.createElement("span", {
      key: wId,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        background: isPrimac ? 'var(--amber-pale)' : 'white',
        border: `1px solid ${isPrimac ? '#e8c17a' : 'var(--border)'}`,
        borderRadius: 20,
        padding: '0.2rem 0.4rem 0.2rem 0.6rem',
        fontSize: '0.78rem',
        fontWeight: isPrimac ? 700 : 400,
        color: isPrimac ? 'var(--amber)' : 'var(--text)'
      }
    }, isPrimac && '👑 ', w?.name, !isPrimac && /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        if (isPrimka) {
          setForm(f => ({
            ...f,
            extraWorkers: f.extraWorkers.filter(id => id !== wId)
          }));
        } else {
          setForm(f => ({
            ...f,
            allWorkers: f.allWorkers.filter(id => id !== wId)
          }));
        }
      },
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text-muted)',
        fontSize: '0.75rem',
        lineHeight: 1,
        padding: '0 0.1rem',
        display: 'flex',
        alignItems: 'center'
      },
      title: "Ukloni"
    }, "\u2715"), isPrimac && /*#__PURE__*/React.createElement("button", {
      onClick: () => setForm(f => ({
        ...f,
        primatWorker: '',
        allWorkers: f.allWorkers.filter(id => id !== wId),
        extraWorkers: f.extraWorkers.filter(id => id !== wId)
      })),
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--amber)',
        fontSize: '0.75rem',
        lineHeight: 1,
        padding: '0 0.1rem',
        display: 'flex',
        alignItems: 'center'
      },
      title: "Ukloni prima\u010Da"
    }, "\u2715"));
  }))), true && /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "\uD83D\uDE97 Vozila (prevoz radnika)"), defaultVehicle && !form.vehicleIds.includes(defaultVehicle.id) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem',
      padding: '0.4rem 0.6rem',
      background: '#e8f5e9',
      border: '1px solid #a5d6a7',
      borderRadius: 6,
      marginBottom: '0.4rem',
      fontSize: '0.78rem'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDFE2"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, "Default: ", /*#__PURE__*/React.createElement("strong", null, defaultVehicle.registracija), " (", driverInWorkers?.name, ")"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm",
    style: {
      fontSize: '0.68rem'
    },
    onClick: () => setForm(f => ({
      ...f,
      vehicleIds: [...f.vehicleIds, defaultVehicle.id]
    }))
  }, "+ Dodaj")), form.vehicleIds.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.3rem',
      marginBottom: '0.4rem'
    }
  }, form.vehicleIds.map(vid => {
    const v = availableVehicles.find(x => x.id === vid);
    if (!v) return null;
    const drv = v.driverId ? workers.find(w => w.id === v.driverId) : null;
    return /*#__PURE__*/React.createElement("div", {
      key: vid,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.35rem 0.5rem',
        background: '#f0f7f0',
        border: '1px solid #a5d6a7',
        borderRadius: 6,
        fontSize: '0.78rem'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600
      }
    }, "\uD83D\uDE97 ", v.registracija), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-muted)',
        marginLeft: '0.3rem'
      }
    }, v.tipVozila, " \xB7 ", v.brojMjesta, " mj."), drv && /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#2a6478',
        marginLeft: '0.3rem'
      }
    }, "(", drv.name, ")")), /*#__PURE__*/React.createElement("button", {
      onClick: () => setForm(f => ({
        ...f,
        vehicleIds: f.vehicleIds.filter(id => id !== vid)
      })),
      style: {
        background: '#c53030',
        color: 'white',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
        fontSize: '0.65rem',
        padding: '0.15rem 0.35rem',
        fontWeight: 600
      }
    }, "\u2715"));
  })), /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: "",
    onChange: e => {
      if (e.target.value && !form.vehicleIds.includes(e.target.value)) {
        setForm(f => ({
          ...f,
          vehicleIds: [...f.vehicleIds, e.target.value]
        }));
      }
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u2014 Dodaj vozilo \u2014"), availableVehicles.filter(v => !form.vehicleIds.includes(v.id)).map(v => {
    const driver = workers.find(w => w.id === v.driverId);
    return /*#__PURE__*/React.createElement("option", {
      key: v.id,
      value: v.id
    }, v.registracija, " \u2014 ", v.tipVozila, " (", v.brojMjesta, " mj.)", driver ? ` — ${driver.name}` : '');
  })), form.vehicleIds.length > 0 && (() => {
    let remaining = workerCount;
    const perVehicle = form.vehicleIds.map(vid => {
      const v = availableVehicles.find(x => x.id === vid);
      const cap = v?.brojMjesta || 0;
      const fill = Math.min(remaining, cap);
      remaining = Math.max(0, remaining - cap);
      return {
        vid,
        cap,
        fill,
        v
      };
    });
    return /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: '0.5rem'
      }
    }, perVehicle.map(pv => /*#__PURE__*/React.createElement("div", {
      key: pv.vid,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        marginBottom: '0.25rem',
        fontSize: '0.72rem'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-muted)',
        minWidth: 100
      }
    }, pv.v?.registracija || '?'), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 8,
        background: '#eee',
        borderRadius: 4,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        width: `${pv.cap > 0 ? Math.min(100, pv.fill / pv.cap * 100) : 0}%`,
        background: pv.fill >= pv.cap ? pv.fill > pv.cap ? '#e53e3e' : '#ed8936' : '#38a169',
        borderRadius: 4,
        transition: 'width 0.3s'
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        color: pv.fill >= pv.cap ? pv.fill > pv.cap ? '#c53030' : '#b5620a' : 'var(--green)',
        minWidth: 45,
        textAlign: 'right'
      }
    }, pv.fill, "/", pv.cap))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.72rem',
        fontWeight: 600,
        color: isOverCapacity ? '#c53030' : 'var(--green)',
        marginTop: '0.15rem'
      }
    }, isOverCapacity ? '⚠️' : '✅', " Ukupno: ", workerCount, " radnika / ", totalVehicleCapacity, " mjesta (", form.vehicleIds.length, " voz.)", remaining > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#c53030'
      }
    }, " \u2014 ", remaining, " bez mjesta!")));
  })(), form.vehicleIds.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '0.5rem'
    }
  }, !showOtherDriver ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setShowOtherDriver(true),
    style: {
      background: 'none',
      border: 'none',
      color: '#2a6478',
      cursor: 'pointer',
      fontSize: '0.72rem',
      padding: 0,
      textDecoration: 'underline'
    }
  }, "+ Drugi \u0161ofer za danas (poslovo\u0111a, prima\u010D, otprema\u010D)...") : /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff8e1',
      border: '1px solid #ffe082',
      borderRadius: 'var(--radius)',
      padding: '0.5rem 0.6rem',
      marginTop: '0.3rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.7rem',
      color: '#b5620a',
      marginBottom: '0.3rem',
      fontWeight: 600
    }
  }, "\uD83D\uDD04 Drugi \u0161ofer \u2014 samo za ovaj dan"), /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: form.otherDriverId,
    onChange: e => setForm(f => ({
      ...f,
      otherDriverId: e.target.value
    }))
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u2014 Stalni \u0161ofer \u2014"), OTHER_DRIVER_CATS.map(catId => {
    const catInfo = getCatById(catId);
    const catW = otherPotentialDrivers.filter(w => w.category === catId);
    if (catW.length === 0) return null;
    return /*#__PURE__*/React.createElement("optgroup", {
      key: catId,
      label: catInfo ? catInfo.label : catId
    }, catW.map(w => /*#__PURE__*/React.createElement("option", {
      key: w.id,
      value: w.id
    }, w.name)));
  })), form.otherDriverId && (() => {
    const dw = workers.find(w => w.id === form.otherDriverId);
    const dc = getCatById(dw?.category);
    return dw ? /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: '0.3rem',
        fontSize: '0.72rem',
        color: '#b5620a',
        fontWeight: 600
      }
    }, "\uD83D\uDE97 ", dw.name, " (", dc?.label, ") vozi danas umjesto stalnog \u0161ofera") : null;
  })(), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      setShowOtherDriver(false);
      setForm(f => ({
        ...f,
        otherDriverId: ''
      }));
    },
    style: {
      marginTop: 4,
      background: 'none',
      border: 'none',
      color: '#2a6478',
      cursor: 'pointer',
      fontSize: '0.72rem',
      padding: 0,
      textDecoration: 'underline'
    }
  }, "\u2190 Ukloni drugog \u0161ofera")))), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Napomena"), /*#__PURE__*/React.createElement("textarea", {
    className: "form-input",
    rows: 2,
    value: form.note,
    onChange: e => setForm(f => ({
      ...f,
      note: e.target.value
    })),
    placeholder: "Opcionalna napomena...",
    style: {
      resize: 'vertical'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal-footer"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary",
    onClick: onClose
  }, "Odustani"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: handleSubmit
  }, isEdit ? '💾 Spremi izmjenu' : '+ Dodaj unos'))));
}

// ─── HISTORY DETAIL MODAL ─────────────────────────────────────────────────────
function HistoryDetailModal(_ref18) {
  let {
    schedule,
    history,
    workers,
    wName,
    dName,
    restoreVersion,
    onClose
  } = _ref18;
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: e => e.target === e.currentTarget && onClose()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCDC"), /*#__PURE__*/React.createElement("div", {
    className: "modal-title"
  }, "Historija izmjena"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-icon",
    onClick: onClose
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "modal-body",
    style: {
      maxHeight: '60vh',
      overflowY: 'auto'
    }
  }, history.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-muted)',
      fontSize: '0.85rem',
      textAlign: 'center',
      padding: '2rem'
    }
  }, "Nema historije za ovaj zapis.") : history.map(h => /*#__PURE__*/React.createElement("div", {
    className: "history-item",
    key: h.id
  }, /*#__PURE__*/React.createElement("div", {
    className: "history-header"
  }, /*#__PURE__*/React.createElement("span", {
    className: `history-action ${h.action}`
  }, h.action === 'create' ? '✅ Kreiran' : h.action === 'edit' ? '✏️ Izmjenjen' : h.action === 'delete' ? '🗑️ Obrisan' : '↩️ Vraćen'), /*#__PURE__*/React.createElement("span", {
    className: "history-time"
  }, fmtTime(h.timestamp)), h.oldData && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm",
    style: {
      marginLeft: 'auto'
    },
    onClick: () => restoreVersion(h)
  }, "\u21A9 Vrati")), h.oldData && h.newData && /*#__PURE__*/React.createElement("div", {
    className: "diff-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "diff-old"
  }, h.oldData.allWorkers?.map(wName).join(', ')), /*#__PURE__*/React.createElement("div", null, "\u2192"), /*#__PURE__*/React.createElement("div", {
    className: "diff-new"
  }, h.newData.allWorkers?.map(wName).join(', ')))))), /*#__PURE__*/React.createElement("div", {
    className: "modal-footer"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary",
    onClick: onClose
  }, "Zatvori"))));
}

// ─── WORKER CATEGORY BADGE ────────────────────────────────────────────────────
function CatBadge(_ref19) {
  let {
    catId,
    size = 'normal'
  } = _ref19;
  const cat = getCatById(catId);
  if (!cat) return null;
  const small = size === 'small';
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: small ? '0.2rem' : '0.3rem',
      background: cat.pale,
      color: cat.color,
      border: `1px solid ${cat.border}`,
      borderRadius: 4,
      padding: small ? '0.1rem 0.4rem' : '0.25rem 0.6rem',
      fontSize: small ? '0.65rem' : '0.72rem',
      fontWeight: 600,
      fontFamily: 'var(--mono)',
      whiteSpace: 'nowrap'
    }
  }, cat.icon, " ", small ? cat.short : cat.label);
}

// ─── WORKERS VIEW ─────────────────────────────────────────────────────────────
function WorkersView(_ref20) {
  let {
    workers,
    setWorkers,
    schedules
  } = _ref20;
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('sve'); // 'sve' | catId
  const [statusFilter, setStatus] = useState('sve'); // 'sve'|'aktivan'|'neaktivan'
  const [viewMode, setViewMode] = useState('kartice'); // 'kartice' | 'tabela'
  const [detailWorker, setDetail] = useState(null);

  // ── filter ──
  const filtered = useMemo(() => workers.filter(w => {
    const matchSearch = w.name.toLowerCase().includes(search.toLowerCase()) || (w.phone || '').includes(search) || (w.note || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCat === 'sve' || w.category === activeCat;
    const matchStatus = statusFilter === 'sve' || w.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  }), [workers, search, activeCat, statusFilter]);

  // ── stats per category ──
  const catCounts = useMemo(() => {
    const m = {
      sve: workers.length
    };
    WORKER_CATEGORIES.forEach(c => {
      m[c.id] = workers.filter(w => w.category === c.id).length;
    });
    return m;
  }, [workers]);

  // ── schedules count per worker ──
  const workerSchedCount = useMemo(() => {
    const m = {};
    schedules.forEach(s => s.allWorkers.forEach(wId => {
      m[wId] = (m[wId] || 0) + 1;
    }));
    return m;
  }, [schedules]);

  // ── last seen ──
  const workerLastSeen = useMemo(() => {
    const m = {};
    schedules.forEach(s => s.allWorkers.forEach(wId => {
      if (!m[wId] || s.date > m[wId]) m[wId] = s.date;
    }));
    return m;
  }, [schedules]);
  const handleDelete = w => {
    if (confirm(`Obrisati radnika "${w.name}"?\n\nOvo ne briše historiju rasporeda.`)) setWorkers(ws => ws.filter(x => x.id !== w.id));
  };

  // ── WORKER MODAL ──
  const WorkerModal = _ref21 => {
    let {
      worker,
      onClose
    } = _ref21;
    const blank = {
      id: uid(),
      name: '',
      status: 'aktivan',
      category: WORKER_CATEGORIES[0].id,
      phone: '',
      note: ''
    };
    const [form, setForm] = useState(worker ? {
      ...worker
    } : blank);
    const [errors, setErrors] = useState({});
    const validate = () => {
      const e = {};
      if (!form.name.trim()) e.name = 'Ime je obavezno';
      if (!form.category) e.category = 'Kategorija je obavezna';
      setErrors(e);
      return Object.keys(e).length === 0;
    };
    const save = () => {
      if (!validate()) return;
      if (worker) setWorkers(ws => ws.map(w => w.id === form.id ? form : w));else setWorkers(ws => [...ws, form]);
      onClose();
    };
    const selCat = getCatById(form.category);
    return /*#__PURE__*/React.createElement("div", {
      className: "modal-overlay",
      onClick: e => e.target === e.currentTarget && onClose()
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal",
      style: {
        maxWidth: 560
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal-header",
      style: {
        background: selCat ? selCat.pale : undefined,
        borderBottom: `2px solid ${selCat?.border || 'var(--border)'}`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '1.4rem'
      }
    }, selCat?.icon || '👷'), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "modal-title"
    }, worker ? 'Uredi radnika' : 'Novi radnik'), selCat && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.72rem',
        color: selCat.color,
        fontWeight: 600
      }
    }, selCat.label)), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-icon",
      style: {
        marginLeft: 'auto'
      },
      onClick: onClose
    }, "\u2715")), /*#__PURE__*/React.createElement("div", {
      className: "modal-body",
      style: {
        maxHeight: '72vh',
        overflowY: 'auto'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '1.1rem'
      }
    }, /*#__PURE__*/React.createElement("label", {
      className: "form-label"
    }, "Kategorija radnika *"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.5rem'
      }
    }, WORKER_CATEGORIES.map(cat => /*#__PURE__*/React.createElement("button", {
      key: cat.id,
      type: "button",
      onClick: () => setForm(f => ({
        ...f,
        category: cat.id
      })),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.6rem 0.8rem',
        border: `2px solid ${form.category === cat.id ? cat.color : 'var(--border)'}`,
        borderRadius: 6,
        background: form.category === cat.id ? cat.pale : 'var(--bg)',
        color: form.category === cat.id ? cat.color : 'var(--text-muted)',
        fontWeight: form.category === cat.id ? 700 : 400,
        fontSize: '0.82rem',
        cursor: 'pointer',
        transition: 'all 0.12s',
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '1.1rem'
      }
    }, cat.icon), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: '0.78rem'
      }
    }, cat.short), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.65rem',
        opacity: 0.7,
        marginTop: 1
      }
    }, cat.label)), form.category === cat.id && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 'auto',
        fontSize: '0.9rem'
      }
    }, "\u2713")))), errors.category && /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--red)',
        fontSize: '0.75rem',
        marginTop: '0.3rem'
      }
    }, "\u26A0 ", errors.category)), /*#__PURE__*/React.createElement("div", {
      className: "divider"
    }), /*#__PURE__*/React.createElement("div", {
      className: "form-group"
    }, /*#__PURE__*/React.createElement("label", {
      className: "form-label"
    }, "Ime i prezime *"), /*#__PURE__*/React.createElement("input", {
      className: "form-input",
      value: form.name,
      onChange: e => setForm(f => ({
        ...f,
        name: e.target.value
      })),
      placeholder: "npr. Amer Hod\u017Ei\u0107",
      style: errors.name ? {
        borderColor: 'var(--red)'
      } : {}
    }), errors.name && /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--red)',
        fontSize: '0.75rem',
        marginTop: '0.3rem'
      }
    }, "\u26A0 ", errors.name)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.75rem'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "form-group"
    }, /*#__PURE__*/React.createElement("label", {
      className: "form-label"
    }, "Status"), /*#__PURE__*/React.createElement("select", {
      className: "form-select",
      value: form.status,
      onChange: e => setForm(f => ({
        ...f,
        status: e.target.value
      }))
    }, /*#__PURE__*/React.createElement("option", {
      value: "aktivan"
    }, "\u2705 Aktivan"), /*#__PURE__*/React.createElement("option", {
      value: "neaktivan"
    }, "\u26D4 Neaktivan"))), /*#__PURE__*/React.createElement("div", {
      className: "form-group"
    }, /*#__PURE__*/React.createElement("label", {
      className: "form-label"
    }, "Telefon"), /*#__PURE__*/React.createElement("input", {
      className: "form-input",
      value: form.phone || '',
      onChange: e => setForm(f => ({
        ...f,
        phone: e.target.value
      })),
      placeholder: "061-xxx-xxx"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "form-group"
    }, /*#__PURE__*/React.createElement("label", {
      className: "form-label"
    }, "Napomena"), /*#__PURE__*/React.createElement("textarea", {
      className: "form-input",
      rows: 2,
      value: form.note || '',
      onChange: e => setForm(f => ({
        ...f,
        note: e.target.value
      })),
      placeholder: "Bolovanje, posebne napomene, kvalifikacije...",
      style: {
        resize: 'vertical'
      }
    }))), /*#__PURE__*/React.createElement("div", {
      className: "modal-footer"
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-secondary",
      onClick: onClose
    }, "Odustani"), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-primary",
      onClick: save
    }, worker ? '💾 Spremi izmjenu' : '+ Dodaj radnika'))));
  };

  // ── DETAIL MODAL ──
  const DetailModal = _ref22 => {
    let {
      worker,
      onClose
    } = _ref22;
    const cat = getCatById(worker.category);
    const sc = workerSchedCount[worker.id] || 0;
    const ls = workerLastSeen[worker.id];
    const recentSched = schedules.filter(s => s.allWorkers.includes(worker.id)).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    return /*#__PURE__*/React.createElement("div", {
      className: "modal-overlay",
      onClick: e => e.target === e.currentTarget && onClose()
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal",
      style: {
        maxWidth: 480
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal-header",
      style: {
        background: cat?.pale,
        borderBottom: `2px solid ${cat?.border}`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '2rem'
      }
    }, cat?.icon), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: '1rem'
      }
    }, worker.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.75rem',
        color: cat?.color,
        fontWeight: 600
      }
    }, cat?.label)), /*#__PURE__*/React.createElement("span", {
      style: {
        padding: '0.2rem 0.6rem',
        borderRadius: 12,
        fontSize: '0.72rem',
        fontWeight: 700,
        background: worker.status === 'aktivan' ? '#d4edda' : '#f8d7da',
        color: worker.status === 'aktivan' ? '#155724' : '#721c24'
      }
    }, worker.status === 'aktivan' ? '✅ Aktivan' : '⛔ Neaktivan'), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-icon",
      onClick: onClose
    }, "\u2715")), /*#__PURE__*/React.createElement("div", {
      className: "modal-body"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.75rem',
        marginBottom: '1rem'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: '0.75rem'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '1.4rem',
        fontWeight: 700,
        color: 'var(--green)'
      }
    }, sc), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.72rem',
        color: 'var(--text-muted)'
      }
    }, "Ukupno rasporeda")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: '0.75rem'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '0.9rem',
        fontWeight: 700,
        color: 'var(--green)'
      }
    }, ls ? fmtDate(ls) : '—'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.72rem',
        color: 'var(--text-muted)'
      }
    }, "Posljednji raspored"))), worker.phone && /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '0.75rem',
        fontSize: '0.85rem'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-muted)'
      }
    }, "\uD83D\uDCDE "), worker.phone), worker.note && /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--amber-pale)',
        border: '1px solid #e8c17a',
        borderRadius: 6,
        padding: '0.6rem 0.75rem',
        fontSize: '0.82rem',
        marginBottom: '1rem'
      }
    }, "\uD83D\uDCDD ", worker.note), recentSched.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '0.65rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--text-light)',
        marginBottom: '0.4rem'
      }
    }, "NEDAVNI RASPOREDI"), recentSched.map(s => /*#__PURE__*/React.createElement("div", {
      key: s.id,
      style: {
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        padding: '0.3rem 0',
        borderBottom: '1px solid var(--border)',
        fontSize: '0.8rem'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        color: 'var(--text-muted)',
        fontSize: '0.75rem'
      }
    }, fmtDate(s.date)), /*#__PURE__*/React.createElement("span", {
      className: jobBadgeClass(s.jobType),
      style: {
        fontSize: '0.65rem'
      }
    }, s.jobType), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-muted)',
        fontSize: '0.75rem',
        marginLeft: 'auto'
      }
    }))))), /*#__PURE__*/React.createElement("div", {
      className: "modal-footer"
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-secondary",
      onClick: onClose
    }, "Zatvori"), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-primary",
      onClick: () => {
        onClose();
        setTimeout(() => setModal(worker), 50);
      }
    }, "\u270F\uFE0F Uredi"))));
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '100%',
      overflowX: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1rem',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, "Evidencija radnika"), /*#__PURE__*/React.createElement("span", {
    className: "tag",
    style: {
      marginRight: 'auto'
    }
  }, workers.filter(w => w.status === 'aktivan').length, " aktivnih / ", workers.length, " ukupno"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '0.5rem'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: `btn btn-sm ${viewMode === 'kartice' ? 'btn-primary' : 'btn-secondary'}`,
    onClick: () => setViewMode('kartice')
  }, "\u229E Kartice"), /*#__PURE__*/React.createElement("button", {
    className: `btn btn-sm ${viewMode === 'tabela' ? 'btn-primary' : 'btn-secondary'}`,
    onClick: () => setViewMode('tabela')
  }, "\u2261 Tabela")), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: () => setModal({})
  }, "+ Novi radnik")), /*#__PURE__*/React.createElement("div", {
    className: "category-grid"
  }, WORKER_CATEGORIES.map(cat => {
    const cnt = catCounts[cat.id] || 0;
    const active = activeCat === cat.id;
    return /*#__PURE__*/React.createElement("button", {
      key: cat.id,
      onClick: () => setActiveCat(active ? 'sve' : cat.id),
      className: "category-card",
      style: {
        border: `2px solid ${active ? cat.color : 'var(--border)'}`,
        background: active ? cat.pale : 'var(--surface)',
        boxShadow: active ? `0 0 0 1px ${cat.border}` : 'var(--shadow)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "category-card-icon"
    }, cat.icon), /*#__PURE__*/React.createElement("span", {
      className: "category-card-count",
      style: {
        color: cat.color
      }
    }, cnt)), /*#__PURE__*/React.createElement("div", {
      className: "category-card-label",
      style: {
        color: active ? cat.color : 'var(--text-muted)'
      }
    }, cat.label));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1rem',
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-input",
    placeholder: "\uD83D\uDD0D Pretra\u017Ei ime, telefon...",
    value: search,
    onChange: e => setSearch(e.target.value),
    style: {
      flex: '1 1 150px',
      minWidth: 0,
      maxWidth: 300
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '0.3rem'
    }
  }, ['sve', 'aktivan', 'neaktivan'].map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    className: `filter-chip ${statusFilter === s ? 'active' : ''}`,
    onClick: () => setStatus(s)
  }, s === 'sve' ? 'Svi' : s === 'aktivan' ? '✅ Aktivni' : '⛔ Neaktivni'))), (activeCat !== 'sve' || statusFilter !== 'sve' || search) && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => {
      setActiveCat('sve');
      setStatus('sve');
      setSearch('');
    }
  }, "\u2715 Resetuj"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontSize: '0.78rem',
      color: 'var(--text-muted)'
    }
  }, filtered.length, " radnika")), viewMode === 'kartice' && /*#__PURE__*/React.createElement("div", {
    className: "worker-cards-grid"
  }, filtered.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "empty-state",
    style: {
      gridColumn: '1/-1'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "icon"
  }, "\uD83D\uDC77"), /*#__PURE__*/React.createElement("p", null, "Nema radnika za odabrane filtere.")), filtered.map(w => {
    const cat = getCatById(w.category);
    const sc = workerSchedCount[w.id] || 0;
    const ls = workerLastSeen[w.id];
    return /*#__PURE__*/React.createElement("div", {
      key: w.id,
      className: "worker-card",
      style: {
        background: 'var(--surface)',
        border: `1px solid ${w.status === 'aktivan' ? 'var(--border)' : '#f0c0c0'}`,
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: 'var(--shadow)',
        opacity: w.status === 'aktivan' ? 1 : 0.72,
        transition: 'box-shadow 0.12s'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "worker-card-stripe",
      style: {
        height: 4,
        background: `linear-gradient(90deg,${cat?.color || '#999'},${cat?.border || '#ccc'})`
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "worker-card-body",
      style: {
        padding: '0.9rem'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "worker-card-top",
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.5rem',
        marginBottom: '0.6rem'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "worker-card-avatar",
      style: {
        width: 38,
        height: 38,
        borderRadius: 8,
        background: cat?.pale || '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.3rem',
        flexShrink: 0,
        border: `1px solid ${cat?.border || '#ccc'}`
      }
    }, cat?.icon || '👤'), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "worker-card-name",
      style: {
        fontWeight: 700,
        fontSize: '0.88rem',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, w.name), /*#__PURE__*/React.createElement(CatBadge, {
      catId: w.category,
      size: "small"
    })), /*#__PURE__*/React.createElement("span", {
      className: "worker-card-status",
      style: {
        fontSize: '0.65rem',
        fontWeight: 700,
        padding: '0.15rem 0.4rem',
        borderRadius: 10,
        background: w.status === 'aktivan' ? '#d4edda' : '#f8d7da',
        color: w.status === 'aktivan' ? '#155724' : '#721c24',
        flexShrink: 0
      }
    }, w.status === 'aktivan' ? 'AKT' : 'NEA')), /*#__PURE__*/React.createElement("div", {
      className: "worker-card-stats",
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.4rem',
        marginBottom: '0.6rem'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--bg)',
        borderRadius: 4,
        padding: '0.3rem 0.5rem',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '1rem',
        fontWeight: 700,
        color: 'var(--green)'
      }
    }, sc), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.62rem',
        color: 'var(--text-light)'
      }
    }, "rasporeda")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--bg)',
        borderRadius: 4,
        padding: '0.3rem 0.5rem',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '0.72rem',
        fontWeight: 600,
        color: 'var(--green)'
      }
    }, ls ? fmtDate(ls) : '—'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.62rem',
        color: 'var(--text-light)'
      }
    }, "posljednji"))), w.phone && /*#__PURE__*/React.createElement("div", {
      className: "worker-card-phone",
      style: {
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        marginBottom: '0.3rem'
      }
    }, "\uD83D\uDCDE ", w.phone), w.note && /*#__PURE__*/React.createElement("div", {
      className: "worker-card-note",
      style: {
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
        fontStyle: 'italic',
        marginBottom: '0.4rem',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, w.note), /*#__PURE__*/React.createElement("div", {
      className: "worker-card-actions",
      style: {
        display: 'flex',
        gap: '0.3rem',
        marginTop: '0.5rem',
        borderTop: '1px solid var(--border)',
        paddingTop: '0.5rem',
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-sm",
      style: {
        flex: 1
      },
      onClick: () => setDetail(w)
    }, "\uD83D\uDC41 Detalji"), w.category === 'primac_panj' && /*#__PURE__*/React.createElement("button", {
      className: "btn btn-sm worker-card-transfer",
      title: "Prebaci u pomo\u0107nog radnika",
      style: {
        flex: '1 0 100%',
        background: '#e4edf5',
        color: '#1a3d5c',
        border: '1px solid #9bbfd9',
        fontSize: '0.72rem'
      },
      onClick: () => {
        if (confirm(`Prebaciti "${w.name}" u Pomoćnog radnika?`)) setWorkers(ws => ws.map(x => x.id === w.id ? {
          ...x,
          category: 'pomocni'
        } : x));
      }
    }, "\uD83D\uDD04 Prebaci u pomo\u0107nog"), w.category === 'pomocni' && /*#__PURE__*/React.createElement("button", {
      className: "btn btn-sm worker-card-transfer",
      title: "Vrati u prima\u010Da",
      style: {
        flex: '1 0 100%',
        background: '#e8f0e6',
        color: '#2d5a27',
        border: '1px solid #9bc492',
        fontSize: '0.72rem'
      },
      onClick: () => {
        if (confirm(`Vratiti "${w.name}" u Primača na šuma panju?`)) setWorkers(ws => ws.map(x => x.id === w.id ? {
          ...x,
          category: 'primac_panj'
        } : x));
      }
    }, "\uD83D\uDD04 Vrati u prima\u010Da"), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-icon btn-sm",
      title: "Uredi",
      onClick: () => setModal(w)
    }, "\u270F\uFE0F"), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-danger btn-icon btn-sm",
      title: "Bri\u0161i",
      onClick: () => handleDelete(w)
    }, "\uD83D\uDDD1\uFE0F"))));
  })), viewMode === 'tabela' && /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, filtered.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, /*#__PURE__*/React.createElement("span", {
    className: "icon"
  }, "\uD83D\uDC77"), /*#__PURE__*/React.createElement("p", null, "Nema radnika za odabrane filtere.")) : /*#__PURE__*/React.createElement("table", {
    className: "schedule-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Ime i prezime"), /*#__PURE__*/React.createElement("th", null, "Kategorija"), /*#__PURE__*/React.createElement("th", null, "Status"), /*#__PURE__*/React.createElement("th", null, "Telefon"), /*#__PURE__*/React.createElement("th", null, "Rasporeda"), /*#__PURE__*/React.createElement("th", null, "Posljednji"), /*#__PURE__*/React.createElement("th", null, "Napomena"), /*#__PURE__*/React.createElement("th", null, "Akcije"))), /*#__PURE__*/React.createElement("tbody", null, filtered.map(w => /*#__PURE__*/React.createElement("tr", {
    key: w.id,
    style: {
      opacity: w.status === 'aktivan' ? 1 : 0.65
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      fontWeight: 600
    }
  }, w.name), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(CatBadge, {
    catId: w.category,
    size: "small"
  })), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      padding: '0.15rem 0.5rem',
      borderRadius: 10,
      fontSize: '0.72rem',
      fontWeight: 700,
      background: w.status === 'aktivan' ? '#d4edda' : '#f8d7da',
      color: w.status === 'aktivan' ? '#155724' : '#721c24'
    }
  }, w.status === 'aktivan' ? '✅ Aktivan' : '⛔ Neaktivan')), /*#__PURE__*/React.createElement("td", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: '0.78rem',
      color: 'var(--text-muted)'
    }
  }, w.phone || '—'), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "tag"
  }, workerSchedCount[w.id] || 0)), /*#__PURE__*/React.createElement("td", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: '0.75rem',
      color: 'var(--text-muted)'
    }
  }, workerLastSeen[w.id] ? fmtDate(workerLastSeen[w.id]) : '—'), /*#__PURE__*/React.createElement("td", {
    style: {
      fontSize: '0.78rem',
      color: 'var(--text-muted)',
      maxWidth: 140,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, w.note || '—'), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '0.2rem',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-icon btn-sm",
    onClick: () => setDetail(w)
  }, "\uD83D\uDC41"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-icon btn-sm",
    onClick: () => setModal(w)
  }, "\u270F\uFE0F"), w.category === 'primac_panj' && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    title: "Prebaci u pomo\u0107nog",
    style: {
      background: '#e4edf5',
      color: '#1a3d5c',
      border: '1px solid #9bbfd9',
      fontSize: '0.7rem',
      padding: '0.2rem 0.4rem'
    },
    onClick: () => {
      if (confirm(`Prebaciti "${w.name}" u Pomoćnog?`)) setWorkers(ws => ws.map(x => x.id === w.id ? {
        ...x,
        category: 'pomocni'
      } : x));
    }
  }, "\uD83D\uDD04"), w.category === 'pomocni' && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    title: "Vrati u prima\u010Da",
    style: {
      background: '#e8f0e6',
      color: '#2d5a27',
      border: '1px solid #9bc492',
      fontSize: '0.7rem',
      padding: '0.2rem 0.4rem'
    },
    onClick: () => {
      if (confirm(`Vratiti "${w.name}" u Primača?`)) setWorkers(ws => ws.map(x => x.id === w.id ? {
        ...x,
        category: 'primac_panj'
      } : x));
    }
  }, "\uD83D\uDD04"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-danger btn-icon btn-sm",
    onClick: () => handleDelete(w)
  }, "\uD83D\uDDD1\uFE0F")))))))), modal !== null && /*#__PURE__*/React.createElement(WorkerModal, {
    worker: Object.keys(modal).length ? modal : null,
    onClose: () => setModal(null)
  }), detailWorker && /*#__PURE__*/React.createElement(DetailModal, {
    worker: detailWorker,
    onClose: () => setDetail(null)
  }));
}

// ─── DEPARTMENTS VIEW ─────────────────────────────────────────────────────────
function DepartmentsView(_ref23) {
  let {
    departments,
    setDepartments,
    schedules,
    dName
  } = _ref23;
  const [modal, setModal] = useState(null);
  const DeptModal = _ref24 => {
    let {
      dept,
      onClose
    } = _ref24;
    const [form, setForm] = useState(dept || {
      id: uid(),
      gospodarskaJedinica: '',
      brojOdjela: '',
      note: ''
    });
    const save = () => {
      if (!form.gospodarskaJedinica) return alert('Odaberite gospodarsku jedinicu!');
      if (!form.brojOdjela.trim()) return alert('Unesite broj odjela!');
      if (dept) setDepartments(ds => ds.map(d => d.id === form.id ? form : d));else setDepartments(ds => [{
        ...form,
        createdAt: Date.now()
      }, ...ds]);
      onClose();
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "modal-overlay",
      onClick: e => e.target === e.currentTarget && onClose()
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal"
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal-header"
    }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDFD5\uFE0F"), /*#__PURE__*/React.createElement("div", {
      className: "modal-title"
    }, dept ? 'Uredi odjel' : 'Novi odjel'), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-icon",
      onClick: onClose
    }, "\u2715")), /*#__PURE__*/React.createElement("div", {
      className: "modal-body"
    }, /*#__PURE__*/React.createElement("div", {
      className: "form-group"
    }, /*#__PURE__*/React.createElement("label", {
      className: "form-label"
    }, "Gospodarska jedinica *"), /*#__PURE__*/React.createElement("input", {
      className: "form-input",
      list: "gj-list-dept",
      placeholder: "Odaberi ili upi\u0161i novu...",
      value: form.gospodarskaJedinica,
      onChange: e => setForm(f => ({
        ...f,
        gospodarskaJedinica: e.target.value
      }))
    }), /*#__PURE__*/React.createElement("datalist", {
      id: "gj-list-dept"
    }, GOSPODARSKE_JEDINICE.map(g => /*#__PURE__*/React.createElement("option", {
      key: g,
      value: g
    })))), /*#__PURE__*/React.createElement("div", {
      className: "form-group"
    }, /*#__PURE__*/React.createElement("label", {
      className: "form-label"
    }, "Broj odjela *"), /*#__PURE__*/React.createElement("input", {
      className: "form-input",
      placeholder: "npr. 54 ili 5/2",
      value: form.brojOdjela,
      onChange: e => setForm(f => ({
        ...f,
        brojOdjela: e.target.value
      }))
    })), /*#__PURE__*/React.createElement("div", {
      className: "form-group"
    }, /*#__PURE__*/React.createElement("label", {
      className: "form-label"
    }, "Napomena"), /*#__PURE__*/React.createElement("textarea", {
      className: "form-input",
      rows: 2,
      value: form.note,
      onChange: e => setForm(f => ({
        ...f,
        note: e.target.value
      })),
      style: {
        resize: 'vertical'
      }
    }))), /*#__PURE__*/React.createElement("div", {
      className: "modal-footer"
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-secondary",
      onClick: onClose
    }, "Odustani"), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-primary",
      onClick: save
    }, "Spremi"))));
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "section-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, "Odjeli i radili\u0161ta"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: () => setModal({})
  }, "+ Novi odjel")), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("table", {
    className: "schedule-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Gospodarska jedinica"), /*#__PURE__*/React.createElement("th", null, "Broj odjela"), /*#__PURE__*/React.createElement("th", null, "Napomena"), /*#__PURE__*/React.createElement("th", null, "Rasporeda"), /*#__PURE__*/React.createElement("th", null, "Akcije"))), /*#__PURE__*/React.createElement("tbody", null, [...departments].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).map(d => {
    const cnt = schedules.filter(s => s.deptId === d.id).length;
    return /*#__PURE__*/React.createElement("tr", {
      key: d.id
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        fontWeight: 600
      }
    }, d.gospodarskaJedinica), /*#__PURE__*/React.createElement("td", {
      style: {
        fontFamily: 'var(--mono)',
        fontWeight: 600
      }
    }, d.brojOdjela), /*#__PURE__*/React.createElement("td", {
      style: {
        color: 'var(--text-muted)',
        fontSize: '0.8rem'
      }
    }, d.note || '—'), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
      className: "tag"
    }, cnt)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: '0.25rem'
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-icon btn-sm",
      onClick: () => setModal(d)
    }, "\u270F\uFE0F"), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-danger btn-icon btn-sm",
      onClick: () => {
        if (cnt > 0) return alert('Ne možete obrisati odjel koji ima unose u rasporedu!');
        if (confirm(`Obrisati ${d.name}?`)) setDepartments(ds => ds.filter(x => x.id !== d.id));
      }
    }, "\uD83D\uDDD1\uFE0F"))));
  })))), modal !== null && /*#__PURE__*/React.createElement(DeptModal, {
    dept: Object.keys(modal).length ? modal : null,
    onClose: () => setModal(null)
  }));
}

// ─── PREGLED VIEW ─────────────────────────────────────────────────────────────
function PregledView(_ref25) {
  let {
    schedules,
    workers,
    departments,
    wName,
    dName,
    filterWorker,
    setFilterWorker,
    filterDept,
    setFilterDept,
    filterJob,
    setFilterJob
  } = _ref25;
  const [tab, setTab] = useState('radnik');
  const filtered = useMemo(() => schedules.filter(s => (!filterWorker || s.allWorkers.includes(filterWorker)) && (!filterDept || s.deptId === filterDept) && (!filterJob || s.jobType === filterJob)).sort((a, b) => b.date.localeCompare(a.date)), [schedules, filterWorker, filterDept, filterJob]);

  // Worker stats
  const workerStats = useMemo(() => {
    if (!filterWorker) return null;
    const byJob = {};
    filtered.forEach(s => {
      byJob[s.jobType] = (byJob[s.jobType] || 0) + 1;
    });
    return byJob;
  }, [filtered, filterWorker]);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "section-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, "Pregled i filtriranje")), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      marginBottom: '1rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "card-body"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(min(200px,100%),1fr))',
      gap: '0.75rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      margin: 0
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Radnik"), /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: filterWorker,
    onChange: e => setFilterWorker(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Svi radnici"), workers.map(w => /*#__PURE__*/React.createElement("option", {
    key: w.id,
    value: w.id
  }, w.name)))), /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      margin: 0
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Odjel"), /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: filterDept,
    onChange: e => setFilterDept(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Svi odjeli"), departments.map(d => /*#__PURE__*/React.createElement("option", {
    key: d.id,
    value: d.id
  }, d.name)))), /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      margin: 0
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Vrsta posla"), /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: filterJob,
    onChange: e => setFilterJob(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Sve vrste"), JOB_TYPES.map(jt => /*#__PURE__*/React.createElement("option", {
    key: jt
  }, jt)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm",
    onClick: () => {
      setFilterWorker('');
      setFilterDept('');
      setFilterJob('');
    }
  }, "\u2715 Resetuj"))))), filterWorker && workerStats && /*#__PURE__*/React.createElement("div", {
    className: "stats-row",
    style: {
      marginBottom: '1rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-value"
  }, filtered.length), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, "Ukupno smjena")), Object.entries(workerStats).map(_ref26 => {
    let [jt, cnt] = _ref26;
    return /*#__PURE__*/React.createElement("div", {
      className: "stat-card",
      key: jt
    }, /*#__PURE__*/React.createElement("div", {
      className: "stat-value",
      style: {
        fontSize: '1.2rem'
      }
    }, cnt), /*#__PURE__*/React.createElement("div", {
      className: "stat-label"
    }, jt));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.8rem',
      color: 'var(--text-muted)',
      marginBottom: '0.5rem'
    }
  }, filtered.length, " zapisa"), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, filtered.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, /*#__PURE__*/React.createElement("span", {
    className: "icon"
  }, "\uD83D\uDD0D"), /*#__PURE__*/React.createElement("p", null, "Nema rezultata za odabrane filtere.")) : /*#__PURE__*/React.createElement("table", {
    className: "schedule-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Datum"), /*#__PURE__*/React.createElement("th", null, "Odjel"), /*#__PURE__*/React.createElement("th", null, "Vrsta posla"), /*#__PURE__*/React.createElement("th", null, "Radnici"), /*#__PURE__*/React.createElement("th", null, "Napomena"))), /*#__PURE__*/React.createElement("tbody", null, filtered.map(s => /*#__PURE__*/React.createElement("tr", {
    key: s.id
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: '0.8rem',
      whiteSpace: 'nowrap'
    }
  }, fmtDate(s.date)), /*#__PURE__*/React.createElement("td", {
    style: {
      fontSize: '0.83rem',
      fontWeight: 500
    }
  }, dName(s.deptId)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: jobBadgeClass(s.jobType)
  }, s.jobType)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '2px'
    }
  }, s.allWorkers.map(wId => /*#__PURE__*/React.createElement("span", {
    key: wId,
    className: `worker-pill ${s.jobType === 'Primka' && wId === s.primatWorker ? 'primac' : ''}`
  }, wName(wId))))), /*#__PURE__*/React.createElement("td", {
    style: {
      color: 'var(--text-muted)',
      fontSize: '0.8rem'
    }
  }, s.note || '—')))))));
}

// ─── HISTORIJA VIEW ───────────────────────────────────────────────────────────
function HistorijaView(_ref27) {
  let {
    history,
    wName,
    dName,
    restoreVersion,
    schedules
  } = _ref27;
  const grouped = useMemo(() => {
    const m = {};
    history.forEach(h => {
      const d = new Date(h.timestamp).toISOString().split('T')[0];
      if (!m[d]) m[d] = [];
      m[d].push(h);
    });
    return Object.entries(m).sort((a, b) => b[0].localeCompare(a[0]));
  }, [history]);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "section-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, "Historija izmjena"), /*#__PURE__*/React.createElement("span", {
    className: "tag"
  }, history.length, " zapisa")), history.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, /*#__PURE__*/React.createElement("span", {
    className: "icon"
  }, "\uD83D\uDCDC"), /*#__PURE__*/React.createElement("p", null, "Historija je prazna.")) : grouped.map(_ref28 => {
    let [date, items] = _ref28;
    return /*#__PURE__*/React.createElement("div", {
      key: date,
      style: {
        marginBottom: '1.25rem'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '0.72rem',
        fontWeight: 600,
        color: 'var(--text-muted)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: '0.5rem',
        paddingLeft: '0.25rem'
      }
    }, fmtDate(date)), items.map(h => /*#__PURE__*/React.createElement("div", {
      className: "history-item",
      key: h.id
    }, /*#__PURE__*/React.createElement("div", {
      className: "history-header"
    }, /*#__PURE__*/React.createElement("span", {
      className: `history-action ${h.action}`
    }, h.action === 'create' ? '✅ Kreiran' : h.action === 'edit' ? '✏️ Izmjenjen' : h.action === 'delete' ? '🗑️ Obrisan' : '↩️ Vraćen'), h.user && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.72rem',
        fontWeight: 700,
        color: 'white',
        background: 'var(--green)',
        borderRadius: 5,
        padding: '0.1rem 0.45rem',
        fontFamily: 'var(--mono)',
        flexShrink: 0
      }
    }, "\uD83D\uDC64 ", h.user), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.78rem',
        color: 'var(--text-muted)'
      }
    }, "Raspored: ", fmtDate(h.date), " \u2014 ", h.newData?.deptId || h.oldData?.deptId ? dName(h.newData?.deptId || h.oldData?.deptId) : '', ' ', /*#__PURE__*/React.createElement("span", {
      className: jobBadgeClass(h.newData?.jobType || h.oldData?.jobType),
      style: {
        fontSize: '0.65rem'
      }
    }, h.newData?.jobType || h.oldData?.jobType)), /*#__PURE__*/React.createElement("span", {
      className: "history-time"
    }, fmtTime(h.timestamp)), h.oldData && /*#__PURE__*/React.createElement("button", {
      className: "btn btn-secondary btn-sm",
      style: {
        marginLeft: 'auto'
      },
      onClick: () => {
        if (confirm('Vratiti ovo stanje?')) restoreVersion(h);
      }
    }, "\u21A9 Vrati")), h.oldData && h.newData && /*#__PURE__*/React.createElement("div", {
      className: "diff-row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "diff-old"
    }, h.oldData.allWorkers?.map(wName).join(', ')), /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--text-muted)'
      }
    }, "\u2192"), /*#__PURE__*/React.createElement("div", {
      className: "diff-new"
    }, h.newData.allWorkers?.map(wName).join(', '))))));
  }));
}

// ─── SPISAK VIEW ──────────────────────────────────────────────────────────────
function SpisakView(_ref29) {
  let {
    workers,
    setWorkers,
    vehicles
  } = _ref29;
  // editing: { workerId, field } | null
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState('');
  // adding: catId | null
  const [adding, setAdding] = useState(null);
  const [addName, setAddName] = useState('');
  const workersByCat = catId => workers.filter(w => w.category === catId);
  const startEdit = (w, field) => {
    setEditing({
      workerId: w.id,
      field
    });
    setEditVal(w[field] || '');
  };
  const commitEdit = () => {
    if (!editing) return;
    setWorkers(ws => ws.map(w => w.id === editing.workerId ? {
      ...w,
      [editing.field]: editVal
    } : w));
    setEditing(null);
    setEditVal('');
  };
  const handleKeyDown = e => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') {
      setEditing(null);
      setEditVal('');
    }
  };
  const deleteWorker = w => {
    if (confirm(`Obrisati radnika "${w.name}"?`)) setWorkers(ws => ws.filter(x => x.id !== w.id));
  };
  const toggleStatus = w => {
    setWorkers(ws => ws.map(x => x.id === w.id ? {
      ...x,
      status: x.status === 'aktivan' ? 'neaktivan' : 'aktivan'
    } : x));
  };
  const addWorker = catId => {
    const name = addName.trim();
    if (!name) return;
    const newW = {
      id: uid(),
      name,
      category: catId,
      status: 'aktivan',
      phone: '',
      note: ''
    };
    setWorkers(ws => [...ws, newW]);
    setAddName('');
    setAdding(null);
  };
  const moveWorker = (wId, newCat) => {
    setWorkers(ws => ws.map(w => w.id === wId ? {
      ...w,
      category: newCat
    } : w));
  };
  const CAT_COLS = SPISAK_COLUMNS.map(cid => WORKER_CATEGORIES.find(c => c.id === cid)).filter(Boolean);
  // max rows needed
  const maxRows = Math.max(0, ...CAT_COLS.map(c => workersByCat(c.id).length));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1rem',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, "\uD83D\uDCCA Spisak radnika po kategorijama"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.78rem',
      color: 'var(--text-muted)'
    }
  }, workers.filter(w => w.status === 'aktivan').length, " aktivnih / ", workers.length, " ukupno")), /*#__PURE__*/React.createElement("div", {
    className: "spisak-desktop",
    style: {
      overflowX: 'auto',
      maxWidth: '100%'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      borderCollapse: 'collapse',
      width: '100%',
      minWidth: 'max-content'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, CAT_COLS.map(cat => /*#__PURE__*/React.createElement("th", {
    key: cat.id,
    style: {
      background: cat.pale,
      border: `2px solid ${cat.border}`,
      padding: '0.6rem 0.75rem',
      minWidth: 190,
      verticalAlign: 'bottom'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '1.1rem'
    }
  }, cat.icon), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: '0.8rem',
      color: cat.color,
      marginTop: '0.2rem',
      lineHeight: 1.2
    }
  }, cat.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: '0.65rem',
      color: cat.color,
      opacity: 0.7,
      marginTop: '0.15rem'
    }
  }, workersByCat(cat.id).filter(w => w.status === 'aktivan').length, " aktivnih")), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setAdding(cat.id);
      setAddName('');
    },
    style: {
      background: cat.color,
      color: 'white',
      border: 'none',
      borderRadius: 4,
      width: 24,
      height: 24,
      fontSize: '1rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      fontWeight: 700
    },
    title: "Dodaj radnika"
  }, "+")), adding === cat.id && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '0.4rem',
      display: 'flex',
      gap: '0.3rem'
    }
  }, /*#__PURE__*/React.createElement("input", {
    autoFocus: true,
    className: "form-input",
    placeholder: "Ime i prezime...",
    value: addName,
    onChange: e => setAddName(e.target.value),
    onKeyDown: e => {
      if (e.key === 'Enter') addWorker(cat.id);
      if (e.key === 'Escape') {
        setAdding(null);
        setAddName('');
      }
    },
    style: {
      fontSize: '0.78rem',
      padding: '0.3rem 0.5rem',
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => addWorker(cat.id),
    style: {
      background: cat.color,
      color: 'white',
      border: 'none',
      borderRadius: 4,
      padding: '0.3rem 0.5rem',
      cursor: 'pointer',
      fontSize: '0.75rem',
      fontWeight: 700
    }
  }, "\u2713"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setAdding(null);
      setAddName('');
    },
    style: {
      background: 'var(--bg)',
      border: '1px solid var(--border)',
      borderRadius: 4,
      padding: '0.3rem 0.5rem',
      cursor: 'pointer',
      fontSize: '0.75rem',
      color: 'var(--text-muted)'
    }
  }, "\u2715")))))), /*#__PURE__*/React.createElement("tbody", null, Array.from({
    length: maxRows + 0
  }, (_, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, CAT_COLS.map(cat => {
    const ws = workersByCat(cat.id);
    const w = ws[i];
    if (!w) return /*#__PURE__*/React.createElement("td", {
      key: cat.id,
      style: {
        border: `1px solid ${cat.border}`,
        background: cat.pale,
        opacity: 0.3,
        minHeight: 36
      }
    });
    const isInactive = w.status !== 'aktivan';
    const isEditingName = editing?.workerId === w.id && editing?.field === 'name';
    const isEditingPhone = editing?.workerId === w.id && editing?.field === 'phone';
    return /*#__PURE__*/React.createElement("td", {
      key: cat.id,
      style: {
        border: `1px solid ${cat.border}`,
        padding: '0.3rem 0.5rem',
        verticalAlign: 'top',
        background: isInactive ? '#fafafa' : 'white',
        opacity: isInactive ? 0.55 : 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '0.6rem',
        color: 'var(--text-light)',
        minWidth: 14,
        textAlign: 'right',
        flexShrink: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, isEditingName ? /*#__PURE__*/React.createElement("input", {
      autoFocus: true,
      className: "form-input",
      value: editVal,
      onChange: e => setEditVal(e.target.value),
      onBlur: commitEdit,
      onKeyDown: handleKeyDown,
      style: {
        fontSize: '0.82rem',
        padding: '0.2rem 0.4rem',
        width: '100%'
      }
    }) : /*#__PURE__*/React.createElement("span", {
      onClick: () => startEdit(w, 'name'),
      title: "Klikni za editovanje",
      style: {
        fontSize: '0.85rem',
        fontWeight: 600,
        cursor: 'text',
        display: 'block',
        textDecoration: isInactive ? 'line-through' : 'none',
        color: isInactive ? 'var(--text-light)' : 'var(--text)'
      }
    }, w.name), isEditingPhone ? /*#__PURE__*/React.createElement("input", {
      autoFocus: true,
      className: "form-input",
      value: editVal,
      onChange: e => setEditVal(e.target.value),
      onBlur: commitEdit,
      onKeyDown: handleKeyDown,
      placeholder: "Telefon...",
      style: {
        fontSize: '0.7rem',
        padding: '0.15rem 0.3rem',
        width: '100%',
        marginTop: '0.15rem'
      }
    }) : /*#__PURE__*/React.createElement("span", {
      onClick: () => startEdit(w, 'phone'),
      title: "Klikni za editovanje telefona",
      style: {
        fontSize: '0.7rem',
        color: 'var(--text-muted)',
        cursor: 'text',
        display: 'block',
        marginTop: '0.1rem'
      }
    }, w.phone || /*#__PURE__*/React.createElement("span", {
      style: {
        opacity: 0.35,
        fontStyle: 'italic'
      }
    }, "+ telefon"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.15rem',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => toggleStatus(w),
      title: isInactive ? 'Aktiviraj' : 'Deaktiviraj',
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.75rem',
        padding: '0.1rem',
        lineHeight: 1
      }
    }, isInactive ? '⛔' : '✅'), /*#__PURE__*/React.createElement("select", {
      value: w.category,
      onChange: e => moveWorker(w.id, e.target.value),
      title: "Premjesti u drugu kategoriju",
      style: {
        fontSize: '0.6rem',
        border: '1px solid var(--border)',
        borderRadius: 3,
        padding: '0.1rem',
        background: 'var(--bg)',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        maxWidth: 70
      }
    }, WORKER_CATEGORIES.filter(c => c.id !== 'poslovoda').map(c => /*#__PURE__*/React.createElement("option", {
      key: c.id,
      value: c.id
    }, c.short))), /*#__PURE__*/React.createElement("button", {
      onClick: () => deleteWorker(w),
      title: "Obri\u0161i",
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.7rem',
        padding: '0.1rem',
        color: 'var(--red)',
        lineHeight: 1
      }
    }, "\uD83D\uDDD1"))));
  }))), /*#__PURE__*/React.createElement("tr", null, CAT_COLS.map(cat => /*#__PURE__*/React.createElement("td", {
    key: cat.id,
    style: {
      border: `1px solid ${cat.border}`,
      background: cat.pale,
      padding: '0.3rem 0.5rem',
      opacity: 0.6
    }
  }, adding !== cat.id && /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setAdding(cat.id);
      setAddName('');
    },
    style: {
      background: 'none',
      border: `1px dashed ${cat.border}`,
      borderRadius: 4,
      color: cat.color,
      width: '100%',
      padding: '0.3rem',
      fontSize: '0.75rem',
      cursor: 'pointer',
      textAlign: 'left'
    }
  }, "+ dodaj radnika"))))))), /*#__PURE__*/React.createElement("div", {
    className: "spisak-mobile"
  }, CAT_COLS.map(cat => {
    const ws = workersByCat(cat.id);
    const active = ws.filter(w => w.status === 'aktivan').length;
    return /*#__PURE__*/React.createElement("div", {
      key: cat.id,
      style: {
        background: 'var(--surface)',
        border: `1px solid ${cat.border}`,
        borderLeft: `4px solid ${cat.color}`,
        borderRadius: 6,
        marginBottom: '0.5rem',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.4rem 0.5rem',
        background: cat.pale
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.9rem'
      }
    }, cat.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        fontSize: '0.8rem',
        color: cat.color,
        flex: 1
      }
    }, cat.label), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '0.65rem',
        fontWeight: 700,
        color: 'white',
        background: cat.color,
        borderRadius: 3,
        padding: '0.1rem 0.3rem'
      }
    }, active), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setAdding(cat.id);
        setAddName('');
      },
      style: {
        background: cat.color,
        color: 'white',
        border: 'none',
        borderRadius: 4,
        width: 22,
        height: 22,
        fontSize: '0.85rem',
        cursor: 'pointer',
        fontWeight: 700
      }
    }, "+")), adding === cat.id && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0.3rem 0.5rem',
        display: 'flex',
        gap: '0.3rem',
        background: '#fafaf8',
        borderBottom: `1px solid ${cat.border}`
      }
    }, /*#__PURE__*/React.createElement("input", {
      autoFocus: true,
      className: "form-input",
      placeholder: "Ime i prezime...",
      value: addName,
      onChange: e => setAddName(e.target.value),
      onKeyDown: e => {
        if (e.key === 'Enter') addWorker(cat.id);
        if (e.key === 'Escape') {
          setAdding(null);
          setAddName('');
        }
      },
      style: {
        fontSize: '0.78rem',
        padding: '0.25rem 0.4rem',
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: () => addWorker(cat.id),
      style: {
        background: cat.color,
        color: 'white',
        border: 'none',
        borderRadius: 4,
        padding: '0.2rem 0.5rem',
        fontSize: '0.75rem',
        fontWeight: 700
      }
    }, "+")), /*#__PURE__*/React.createElement("div", null, ws.map((w, i) => {
      const isInactive = w.status !== 'aktivan';
      const isEditName = editing?.workerId === w.id && editing?.field === 'name';
      const isEditPhone = editing?.workerId === w.id && editing?.field === 'phone';
      return /*#__PURE__*/React.createElement("div", {
        key: w.id,
        style: {
          padding: '0.3rem 0.5rem',
          borderBottom: `1px solid ${cat.border}`,
          opacity: isInactive ? 0.5 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--mono)',
          fontSize: '0.6rem',
          color: 'var(--text-light)',
          minWidth: 16,
          textAlign: 'right'
        }
      }, i + 1), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, isEditName ? /*#__PURE__*/React.createElement("input", {
        autoFocus: true,
        className: "form-input",
        value: editVal,
        onChange: e => setEditVal(e.target.value),
        onBlur: commitEdit,
        onKeyDown: handleKeyDown,
        style: {
          fontSize: '0.8rem',
          padding: '0.15rem 0.3rem',
          width: '100%'
        }
      }) : /*#__PURE__*/React.createElement("span", {
        onClick: () => startEdit(w, 'name'),
        style: {
          fontSize: '0.82rem',
          fontWeight: 600,
          cursor: 'text',
          display: 'block',
          textDecoration: isInactive ? 'line-through' : 'none'
        }
      }, w.name), isEditPhone ? /*#__PURE__*/React.createElement("input", {
        autoFocus: true,
        className: "form-input",
        value: editVal,
        onChange: e => setEditVal(e.target.value),
        onBlur: commitEdit,
        onKeyDown: handleKeyDown,
        placeholder: "Telefon...",
        style: {
          fontSize: '0.68rem',
          padding: '0.1rem 0.3rem',
          width: '100%',
          marginTop: '0.1rem'
        }
      }) : /*#__PURE__*/React.createElement("span", {
        onClick: () => startEdit(w, 'phone'),
        style: {
          fontSize: '0.68rem',
          color: 'var(--text-muted)',
          cursor: 'text',
          display: 'block'
        }
      }, w.phone || /*#__PURE__*/React.createElement("span", {
        style: {
          opacity: 0.35,
          fontStyle: 'italic'
        }
      }, "+ telefon"))), /*#__PURE__*/React.createElement("button", {
        onClick: () => toggleStatus(w),
        style: {
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.7rem',
          padding: '0.1rem'
        }
      }, isInactive ? '⛔' : '✅'), /*#__PURE__*/React.createElement("select", {
        value: w.category,
        onChange: e => moveWorker(w.id, e.target.value),
        style: {
          fontSize: '0.55rem',
          border: '1px solid var(--border)',
          borderRadius: 3,
          padding: '0.1rem',
          background: 'var(--bg)',
          color: 'var(--text-muted)',
          maxWidth: 65
        }
      }, WORKER_CATEGORIES.filter(c => c.id !== 'poslovoda').map(c => /*#__PURE__*/React.createElement("option", {
        key: c.id,
        value: c.id
      }, c.short))), /*#__PURE__*/React.createElement("button", {
        onClick: () => deleteWorker(w),
        style: {
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.65rem',
          color: 'var(--red)',
          padding: '0.1rem'
        }
      }, "\uD83D\uDDD1"));
    }), ws.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0.5rem',
        fontSize: '0.75rem',
        color: 'var(--text-light)',
        fontStyle: 'italic',
        textAlign: 'center'
      }
    }, "Nema radnika")));
  })), (() => {
    const vozacCat = WORKER_CATEGORIES.find(c => c.id === 'vozac');
    const allDrivers = workers.filter(w => w.category === 'vozac');
    const activeDrivers = allDrivers.filter(w => w.status === 'aktivan');
    const inactiveDrivers = allDrivers.filter(w => w.status !== 'aktivan');
    return /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: '1.5rem'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.75rem',
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '1.2rem'
      }
    }, "\uD83D\uDE97"), /*#__PURE__*/React.createElement("div", {
      className: "section-title",
      style: {
        margin: 0
      }
    }, "Voza\u010Di"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '0.72rem',
        color: 'var(--text-muted)'
      }
    }, activeDrivers.length, " aktivnih / ", allDrivers.length, " ukupno")), allDrivers.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '1.5rem',
        textAlign: 'center',
        color: 'var(--text-light)',
        fontSize: '0.85rem',
        background: 'var(--surface)',
        borderRadius: 8,
        border: '1px solid var(--border)'
      }
    }, "Nema voza\u010Da. Dodajte voza\u010De u kolonu \"Voza\u010Di\" iznad.") : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '0.6rem'
      }
    }, activeDrivers.concat(inactiveDrivers).map(w => {
      const driverVehicles = (vehicles || []).filter(v => v.driverId === w.id);
      const isInactive = w.status !== 'aktivan';
      return /*#__PURE__*/React.createElement("div", {
        key: w.id,
        style: {
          background: isInactive ? '#fafafa' : 'var(--surface)',
          border: `1px solid ${vozacCat.border}`,
          borderLeft: `4px solid ${isInactive ? '#ccc' : vozacCat.color}`,
          borderRadius: 8,
          padding: '0.6rem 0.75rem',
          opacity: isInactive ? 0.6 : 1
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          marginBottom: '0.3rem'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: '1rem'
        }
      }, isInactive ? '⛔' : '🚗'), /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 700,
          fontSize: '0.9rem',
          flex: 1,
          textDecoration: isInactive ? 'line-through' : 'none'
        }
      }, w.name), isInactive && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: '0.65rem',
          color: 'var(--red)',
          fontWeight: 600
        }
      }, "Neaktivan")), w.phone && /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          marginBottom: '0.3rem'
        }
      }, "\uD83D\uDCDE ", w.phone), driverVehicles.length > 0 ? /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: '0.2rem'
        }
      }, driverVehicles.map(v => /*#__PURE__*/React.createElement("div", {
        key: v.id,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.75rem',
          padding: '0.2rem 0.4rem',
          marginTop: '0.2rem',
          background: v.status === 'vozno' ? '#e8f5e9' : '#fff3e0',
          borderRadius: 4,
          border: `1px solid ${v.status === 'vozno' ? '#a5d6a7' : '#ffcc80'}`
        }
      }, /*#__PURE__*/React.createElement("span", null, v.status === 'vozno' ? '🟢' : '🟠'), /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 600
        }
      }, v.registracija), /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--text-muted)'
        }
      }, "\xB7 ", v.tipVozila, " \xB7 ", v.brojMjesta, " mj.")))) : /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '0.7rem',
          color: 'var(--text-light)',
          fontStyle: 'italic',
          marginTop: '0.2rem'
        }
      }, "Nema dodijeljenog vozila"));
    })));
  })(), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '0.75rem',
      fontSize: '0.72rem',
      color: 'var(--text-muted)'
    }
  }, "\uD83D\uDCA1 Klikni na ime ili telefon za direktno editovanje \xB7 Klikni \u2705/\u26D4 za aktivaciju \xB7 Koristite dropdown za premje\u0161tanje u drugu kategoriju"));
}

// ─── VOZAČI VIEW ────────────────────────────────────────────────────────────
function VozaciView(_ref30) {
  let {
    vehicles,
    setVehicles,
    workers
  } = _ref30;
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    driverId: '',
    tipVozila: '',
    registracija: '',
    brojMjesta: 5,
    status: 'vozno'
  });
  const [showOtherDrivers, setShowOtherDrivers] = useState(false);
  const OTHER_CATEGORIES = ['poslovoda_isk', 'poslovoda_uzg', 'primac_panj', 'otpremac'];
  const regularDrivers = workers.filter(w => w.category === 'vozac' && w.status === 'aktivan');
  const otherDrivers = workers.filter(w => OTHER_CATEGORIES.includes(w.category) && w.status === 'aktivan');
  const isOtherDriver = driverId => {
    if (!driverId) return false;
    const w = workers.find(w => w.id === driverId);
    return w && OTHER_CATEGORIES.includes(w.category);
  };
  const resetForm = () => {
    setForm({
      driverId: '',
      tipVozila: '',
      registracija: '',
      brojMjesta: 5,
      status: 'vozno'
    });
    setAdding(false);
    setEditing(null);
    setShowOtherDrivers(false);
  };
  const startEdit = v => {
    setEditing(v.id);
    setForm({
      driverId: v.driverId || '',
      tipVozila: v.tipVozila || '',
      registracija: v.registracija || '',
      brojMjesta: v.brojMjesta || 5,
      status: v.status || 'vozno'
    });
    setShowOtherDrivers(isOtherDriver(v.driverId));
  };
  const saveVehicle = () => {
    if (!form.registracija.trim()) return alert('Unesite registarske oznake!');
    if (!form.tipVozila.trim()) return alert('Unesite tip vozila!');
    if (editing) {
      setVehicles(vs => vs.map(v => v.id === editing ? {
        ...v,
        ...form
      } : v));
    } else {
      setVehicles(vs => [...vs, {
        id: uid(),
        ...form
      }]);
    }
    resetForm();
  };
  const deleteVehicle = v => {
    if (confirm(`Obrisati vozilo "${v.registracija}"?`)) setVehicles(vs => vs.filter(x => x.id !== v.id));
  };
  const toggleStatus = v => {
    setVehicles(vs => vs.map(x => x.id === v.id ? {
      ...x,
      status: x.status === 'vozno' ? 'popravka' : 'vozno'
    } : x));
  };
  const driverName = dId => {
    const w = workers.find(w => w.id === dId);
    return w ? w.name : '—';
  };
  const vozna = vehicles.filter(v => v.status === 'vozno');
  const popravka = vehicles.filter(v => v.status === 'popravka');
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1rem',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, "\uD83D\uDE97 Voza\u010Di i vozila"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.78rem',
      color: 'var(--text-muted)'
    }
  }, vozna.length, " vozno \xB7 ", popravka.length, " na popravku \xB7 ", vehicles.length, " ukupno"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    style: {
      marginLeft: 'auto'
    },
    onClick: () => {
      setAdding(true);
      setEditing(null);
      setForm({
        driverId: '',
        tipVozila: '',
        registracija: '',
        brojMjesta: 5,
        status: 'vozno'
      });
    }
  }, "+ Dodaj vozilo")), regularDrivers.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "alert alert-warning",
    style: {
      marginBottom: '1rem'
    }
  }, "Nemate voza\u010Da u Spisku. Prvo dodajte voza\u010De u kategoriju \"Voza\u010Di\" na tabu Spisak."), (adding || editing) && /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      marginBottom: '1rem',
      padding: '1rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      marginBottom: '0.75rem',
      fontSize: '0.9rem'
    }
  }, editing ? '✏️ Uredi vozilo' : '+ Novo vozilo'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '0.75rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Voza\u010D"), !showOtherDrivers ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: form.driverId,
    onChange: e => {
      if (e.target.value === '__other__') {
        setShowOtherDrivers(true);
        setForm(f => ({
          ...f,
          driverId: ''
        }));
      } else setForm(f => ({
        ...f,
        driverId: e.target.value
      }));
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u2014 Odaberi voza\u010Da \u2014"), regularDrivers.map(w => /*#__PURE__*/React.createElement("option", {
    key: w.id,
    value: w.id
  }, w.name)), otherDrivers.length > 0 && /*#__PURE__*/React.createElement("option", {
    value: "__other__"
  }, "Drugi voza\u010D..."))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: form.driverId,
    onChange: e => setForm(f => ({
      ...f,
      driverId: e.target.value
    }))
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u2014 Odaberi \u2014"), OTHER_CATEGORIES.map(catId => {
    const cat = getCatById(catId);
    const catWorkers = otherDrivers.filter(w => w.category === catId);
    if (catWorkers.length === 0) return null;
    return /*#__PURE__*/React.createElement("optgroup", {
      key: catId,
      label: cat ? cat.label : catId
    }, catWorkers.map(w => /*#__PURE__*/React.createElement("option", {
      key: w.id,
      value: w.id
    }, w.name)));
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      setShowOtherDrivers(false);
      setForm(f => ({
        ...f,
        driverId: ''
      }));
    },
    style: {
      marginTop: 4,
      background: 'none',
      border: 'none',
      color: 'var(--blue, #2a6478)',
      cursor: 'pointer',
      fontSize: '0.72rem',
      padding: 0,
      textDecoration: 'underline'
    }
  }, "\u2190 Nazad na voza\u010De"))), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Tip vozila"), /*#__PURE__*/React.createElement("input", {
    className: "form-input",
    value: form.tipVozila,
    onChange: e => setForm(f => ({
      ...f,
      tipVozila: e.target.value
    })),
    placeholder: "npr. Kombi, Autobus, Putni\u010Dko..."
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Registarske oznake"), /*#__PURE__*/React.createElement("input", {
    className: "form-input",
    value: form.registracija,
    onChange: e => setForm(f => ({
      ...f,
      registracija: e.target.value
    })),
    placeholder: "npr. A12-B-345"
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Broj sjede\u0107ih mjesta"), /*#__PURE__*/React.createElement("input", {
    className: "form-input",
    type: "number",
    min: "1",
    max: "60",
    value: form.brojMjesta,
    onChange: e => setForm(f => ({
      ...f,
      brojMjesta: e.target.value === '' ? '' : parseInt(e.target.value)
    })),
    onBlur: e => {
      if (!e.target.value || isNaN(parseInt(e.target.value))) setForm(f => ({
        ...f,
        brojMjesta: 1
      }));
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Status"), /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: form.status,
    onChange: e => setForm(f => ({
      ...f,
      status: e.target.value
    }))
  }, /*#__PURE__*/React.createElement("option", {
    value: "vozno"
  }, "U voznom stanju"), /*#__PURE__*/React.createElement("option", {
    value: "popravka"
  }, "Na popravku")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '0.75rem'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: saveVehicle
  }, editing ? '💾 Spremi' : '+ Dodaj'), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm",
    onClick: resetForm
  }, "Odustani"))), vehicles.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, /*#__PURE__*/React.createElement("span", {
    className: "icon"
  }, "\uD83D\uDE97"), /*#__PURE__*/React.createElement("p", null, "Nema unesenih vozila."), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: () => setAdding(true)
  }, "+ Dodaj prvo vozilo")) : /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      borderCollapse: 'collapse',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      background: '#e4f0f5',
      border: '1px solid #8bbdd4',
      padding: '0.6rem 0.75rem',
      textAlign: 'left',
      fontSize: '0.8rem',
      fontWeight: 700
    }
  }, "Voza\u010D"), /*#__PURE__*/React.createElement("th", {
    style: {
      background: '#e4f0f5',
      border: '1px solid #8bbdd4',
      padding: '0.6rem 0.75rem',
      textAlign: 'left',
      fontSize: '0.8rem',
      fontWeight: 700
    }
  }, "Tip vozila"), /*#__PURE__*/React.createElement("th", {
    style: {
      background: '#e4f0f5',
      border: '1px solid #8bbdd4',
      padding: '0.6rem 0.75rem',
      textAlign: 'left',
      fontSize: '0.8rem',
      fontWeight: 700
    }
  }, "Registracija"), /*#__PURE__*/React.createElement("th", {
    style: {
      background: '#e4f0f5',
      border: '1px solid #8bbdd4',
      padding: '0.6rem 0.75rem',
      textAlign: 'center',
      fontSize: '0.8rem',
      fontWeight: 700
    }
  }, "Mjesta"), /*#__PURE__*/React.createElement("th", {
    style: {
      background: '#e4f0f5',
      border: '1px solid #8bbdd4',
      padding: '0.6rem 0.75rem',
      textAlign: 'center',
      fontSize: '0.8rem',
      fontWeight: 700
    }
  }, "Status"), /*#__PURE__*/React.createElement("th", {
    style: {
      background: '#e4f0f5',
      border: '1px solid #8bbdd4',
      padding: '0.6rem 0.75rem',
      textAlign: 'center',
      fontSize: '0.8rem',
      fontWeight: 700
    },
    className: "no-print"
  }, "Akcije"))), /*#__PURE__*/React.createElement("tbody", null, vehicles.map(v => {
    const isPopravka = v.status === 'popravka';
    return /*#__PURE__*/React.createElement("tr", {
      key: v.id,
      style: {
        opacity: isPopravka ? 0.6 : 1
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        border: '1px solid #ccc',
        padding: '0.5rem 0.75rem',
        fontSize: '0.82rem'
      }
    }, v.driverId ? (() => {
      const w = workers.find(x => x.id === v.driverId);
      const cat = w ? getCatById(w.category) : null;
      const isOther = w && OTHER_CATEGORIES.includes(w.category);
      return /*#__PURE__*/React.createElement("span", null, isOther && cat ? cat.icon + ' ' : '🚗 ', driverName(v.driverId), isOther && cat ? /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: '0.68rem',
          color: 'var(--text-muted)',
          marginLeft: 4
        }
      }, "(", cat.short, ")") : '');
    })() : /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-muted)'
      }
    }, "\u2014")), /*#__PURE__*/React.createElement("td", {
      style: {
        border: '1px solid #ccc',
        padding: '0.5rem 0.75rem',
        fontSize: '0.82rem',
        fontWeight: 600
      }
    }, v.tipVozila), /*#__PURE__*/React.createElement("td", {
      style: {
        border: '1px solid #ccc',
        padding: '0.5rem 0.75rem',
        fontSize: '0.82rem',
        fontFamily: 'var(--mono)',
        fontWeight: 700,
        letterSpacing: '0.05em'
      }
    }, v.registracija), /*#__PURE__*/React.createElement("td", {
      style: {
        border: '1px solid #ccc',
        padding: '0.5rem 0.75rem',
        fontSize: '0.82rem',
        textAlign: 'center'
      }
    }, v.brojMjesta), /*#__PURE__*/React.createElement("td", {
      style: {
        border: '1px solid #ccc',
        padding: '0.5rem 0.75rem',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      onClick: () => toggleStatus(v),
      style: {
        cursor: 'pointer',
        display: 'inline-block',
        padding: '0.2rem 0.5rem',
        borderRadius: 12,
        fontSize: '0.72rem',
        fontWeight: 700,
        background: isPopravka ? '#fde8e8' : '#e6f5ea',
        color: isPopravka ? '#c53030' : '#2d5a27',
        border: `1px solid ${isPopravka ? '#f5b5b5' : '#9bc492'}`
      }
    }, isPopravka ? '🔧 Na popravku' : '✅ Vozno')), /*#__PURE__*/React.createElement("td", {
      style: {
        border: '1px solid #ccc',
        padding: '0.5rem 0.75rem',
        textAlign: 'center'
      },
      className: "no-print"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: '0.25rem',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-icon btn-sm",
      title: "Uredi",
      onClick: () => startEdit(v)
    }, "\u270F\uFE0F"), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-danger btn-icon btn-sm",
      title: "Bri\u0161i",
      onClick: () => deleteVehicle(v)
    }, "\uD83D\uDDD1\uFE0F"))));
  })))));
}

// ─── ŠIHTARICA VIEW ──────────────────────────────────────────────────────────
function SihtaricaView(_ref31) {
  let {
    schedules,
    workers,
    departments,
    godisnji,
    setGodisnji,
    goKvota,
    setGoKvota,
    holidays,
    setHolidays,
    wName,
    dName,
    onSihtSave
  } = _ref31;
  const now = new Date();
  const [selYear, setSelYear] = useState(now.getFullYear());
  const [selMonth, setSelMonth] = useState(now.getMonth()); // 0-indexed
  const [selWorker, setSelWorker] = useState('');
  const [goModal, setGoModal] = useState(null); // { workerId } or null
  const [goForm, setGoForm] = useState({
    date: '',
    dateDo: '',
    type: 'Godišnji odmor',
    note: ''
  });
  const [closingLeave, setClosingLeave] = useState(null); // { wId, entry } for closing open leave
  const [closeDateDo, setCloseDateDo] = useState('');
  const [sihtView, setSihtView] = useState('mjesecni'); // 'mjesecni' | 'radnik' | 'godisnji' | 'praznici'
  const [sihtManual, setSihtManual] = useStorage('sumarija_siht_manual', {});
  const [cellPicker, setCellPicker] = useState(null); // { workerId, date, x, y }
  const [holidayInput, setHolidayInput] = useState(false);
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState(new Date().toISOString().split('T')[0]);

  // Helper: normalize goKvota entry (backward compat with old number format)
  const getKvota = wId => {
    const raw = goKvota[wId];
    if (!raw) return {
      dana: 0,
      datumOd: ''
    };
    if (typeof raw === 'number') return {
      dana: raw,
      datumOd: `${selYear}-01-01`
    };
    return {
      dana: raw.dana || 0,
      datumOd: raw.datumOd || ''
    };
  };
  const setWorkerKvota = (wId, dana, datumOd) => {
    setGoKvota(prev => ({
      ...prev,
      [wId]: {
        dana,
        datumOd
      }
    }));
  };

  // Sort workers by category order (WORKER_CATEGORIES), then by name
  const catOrder = WORKER_CATEGORIES.map(c => c.id);
  const sortedWorkers = useMemo(() => [...workers].sort((a, b) => {
    const ai = catOrder.indexOf(a.category),
      bi = catOrder.indexOf(b.category);
    const ca = ai === -1 ? 999 : ai,
      cb = bi === -1 ? 999 : bi;
    return ca !== cb ? ca - cb : a.name.localeCompare(b.name);
  }), [workers]);
  const ODSUTNOST_TYPES = ['Godišnji odmor', 'Bolovanje', 'Slobodan dan', 'Neplaćeno', 'Službeni put', 'Neopravdan dan'];
  const ODSUTNOST_COLOR = {
    'Godišnji odmor': {
      bg: '#e4edf5',
      color: '#1a3d5c',
      border: '#9bbfd9',
      short: 'GO',
      icon: '🌴'
    },
    'Bolovanje': {
      bg: '#fde8e8',
      color: '#8b2020',
      border: '#e0a0a0',
      short: 'B',
      icon: '🏥'
    },
    'Slobodan dan': {
      bg: '#fdf0e0',
      color: '#b5620a',
      border: '#e8c17a',
      short: 'SD',
      icon: '☀️'
    },
    'Neplaćeno': {
      bg: '#f0f0f0',
      color: '#555',
      border: '#ccc',
      short: 'N',
      icon: '🚫'
    },
    'Službeni put': {
      bg: '#edf4fb',
      color: '#0a4b78',
      border: '#7ab8e0',
      short: 'SP',
      icon: '✈️'
    },
    'Neopravdan dan': {
      bg: '#3d0000',
      color: '#fff',
      border: '#8b0000',
      short: 'ND',
      icon: '❌'
    }
  };

  // Helper: set/clear manual cell override
  const setManualCell = (workerId, date, type) => {
    setSihtManual(prev => {
      const wDates = {
        ...(prev[workerId] || {})
      };
      if (type === null) {
        delete wDates[date];
      } else {
        wDates[date] = type;
      }
      return {
        ...prev,
        [workerId]: wDates
      };
    });
    if (onSihtSave) onSihtSave(workerId, date, type);
    setCellPicker(null);
  };
  const daysInMonth = new Date(selYear, selMonth + 1, 0).getDate();
  const days = Array.from({
    length: daysInMonth
  }, (_, i) => i + 1);
  const isoDate = d => `${selYear}-${String(selMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const dayOfWeek = d => new Date(selYear, selMonth, d).getDay(); // 0=Sun,6=Sat
  const isWeekend = d => {
    const dw = dayOfWeek(d);
    return dw === 0 || dw === 6;
  };
  const MONTH_NAMES = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni', 'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'];

  // Build map: workerId -> date -> { type: 'rad'|'odsutnost'|'praznik' }
  const workerDayMap = useMemo(() => {
    const m = {};
    workers.forEach(w => {
      m[w.id] = {};
    });
    // Radni dani iz rasporeda
    schedules.forEach(s => {
      s.allWorkers.forEach(wId => {
        if (!m[wId]) return;
        // Kiša — mapira se prema kisaMode
        if (s.jobType === 'Kiša') {
          const mode = s.kisaMode || 'go';
          if (mode === 'rad') {
            m[wId][s.date] = {
              type: 'rad',
              jobType: 'Kiša'
            };
          } else {
            const KISA_MAP = {
              go: 'Godišnji odmor',
              bolovanje: 'Bolovanje',
              neplaceno: 'Neplaćeno'
            };
            m[wId][s.date] = {
              type: 'odsutnost',
              oType: KISA_MAP[mode] || 'Godišnji odmor',
              note: 'Kiša',
              kisa: true
            };
          }
        } else {
          m[wId][s.date] = {
            type: 'rad',
            jobType: s.jobType
          };
        }
      });
    });
    // Odsutnost
    Object.entries(godisnji).forEach(_ref32 => {
      let [wId, entries] = _ref32;
      if (!m[wId]) return;
      entries.forEach(e => {
        // Backward compat: stari Teren/Kancelarija unosi iz godisnji → radni dan
        const isRadniTip = e.type === 'Teren' || e.type === 'Kancelarija';
        if (e.open && e.dateOd) {
          // Open-ended: fills from dateOd to end of current month
          days.forEach(d => {
            const date = isoDate(d);
            if (date >= e.dateOd && !isWeekend(d)) {
              m[wId][date] = isRadniTip ? {
                type: 'rad',
                jobType: e.type,
                note: e.note,
                open: true,
                dateOd: e.dateOd
              } : {
                type: 'odsutnost',
                oType: e.type,
                note: e.note,
                open: true,
                dateOd: e.dateOd
              };
            }
          });
        } else if (!e.open && e.dateOd && e.dateDo) {
          // Closed range (zaključeno): fills only from dateOd to dateDo
          days.forEach(d => {
            const date = isoDate(d);
            if (date >= e.dateOd && date <= e.dateDo && !isWeekend(d)) {
              m[wId][date] = isRadniTip ? {
                type: 'rad',
                jobType: e.type,
                note: e.note,
                dateOd: e.dateOd,
                dateDo: e.dateDo
              } : {
                type: 'odsutnost',
                oType: e.type,
                note: e.note,
                dateOd: e.dateOd,
                dateDo: e.dateDo
              };
            }
          });
        } else if (e.date) {
          m[wId][e.date] = isRadniTip ? {
            type: 'rad',
            jobType: e.type,
            note: e.note
          } : {
            type: 'odsutnost',
            oType: e.type,
            note: e.note
          };
        }
      });
    });
    // Praznici — override za sve radnike (ako nemaju raspored, upisi praznik)
    if (holidays) {
      Object.entries(holidays).forEach(_ref33 => {
        let [date, name] = _ref33;
        workers.forEach(w => {
          if (m[w.id] && !m[w.id][date]) {
            m[w.id][date] = {
              type: 'praznik',
              holidayName: name
            };
          }
        });
      });
    }
    // sihtManual — najviši prioritet, override svega
    if (sihtManual) {
      Object.entries(sihtManual).forEach(_ref34 => {
        let [wId, dates] = _ref34;
        if (!m[wId]) return;
        Object.entries(dates).forEach(_ref35 => {
          let [date, type] = _ref35;
          if (!type) {
            delete m[wId][date];
            return;
          }
          if (JOB_TYPES.includes(type)) {
            m[wId][date] = {
              type: 'rad',
              jobType: type,
              manual: true
            };
          } else {
            m[wId][date] = {
              type: 'odsutnost',
              oType: type,
              manual: true
            };
          }
        });
      });
    }
    return m;
  }, [schedules, godisnji, workers, holidays, sihtManual, selYear, selMonth]);

  // Stats per worker for selected month
  const workerStats = useMemo(() => {
    return workers.map(w => {
      let radnih = 0,
        odsutnih = 0,
        vikenda = 0,
        praznih = 0,
        praznika = 0;
      const odsutTypes = {};
      days.forEach(d => {
        const date = isoDate(d);
        const entry = workerDayMap[w.id]?.[date];
        if (isWeekend(d)) {
          vikenda++;
          return;
        }
        if (!entry) {
          praznih++;
          return;
        }
        if (entry.type === 'rad') radnih++;else if (entry.type === 'praznik') praznika++;else {
          odsutnih++;
          odsutTypes[entry.oType] = (odsutTypes[entry.oType] || 0) + 1;
        }
      });
      return {
        ...w,
        radnih,
        odsutnih,
        vikenda,
        praznih,
        praznika,
        odsutTypes
      };
    });
  }, [workerDayMap, days, selYear, selMonth]);

  // Add odsutnost (supports date range or open-ended)
  const saveGodisnji = () => {
    if (!goForm.date) return alert('Odaberi datum!');
    const wId = goModal.workerId;
    if (goForm.dateDo && goForm.dateDo < goForm.date) return alert('Datum "Do" mora biti nakon datuma "Od"!');
    if (!goForm.dateDo) {
      // Open-ended leave
      setGodisnji(g => {
        const prev = (g[wId] || []).filter(e => !(e.open && e.dateOd === goForm.date && e.type === goForm.type));
        return {
          ...g,
          [wId]: [...prev, {
            dateOd: goForm.date,
            type: goForm.type,
            note: goForm.note,
            open: true
          }]
        };
      });
      setGoModal(null);
      setGoForm({
        date: '',
        dateDo: '',
        type: 'Godišnji odmor',
        note: ''
      });
      return;
    }
    const startDate = new Date(goForm.date);
    const endDate = new Date(goForm.dateDo);
    const dates = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dw = d.getDay();
      if (dw !== 0 && dw !== 6) dates.push(d.toISOString().slice(0, 10));
    }
    if (dates.length === 0) return alert('Nema radnih dana u odabranom periodu!');
    setGodisnji(g => {
      const prev = (g[wId] || []).filter(e => !dates.includes(e.date));
      const newEntries = dates.map(dt => ({
        date: dt,
        type: goForm.type,
        note: goForm.note
      }));
      return {
        ...g,
        [wId]: [...prev, ...newEntries]
      };
    });
    setGoModal(null);
    setGoForm({
      date: '',
      dateDo: '',
      type: 'Godišnji odmor',
      note: ''
    });
  };

  // Close an open-ended leave: set dateDo directly on the entry (no conversion needed)
  const closeOpenLeave = (wId, openEntry, dateDo) => {
    if (dateDo < openEntry.dateOd) return alert('Datum završetka mora biti nakon početka!');
    setGodisnji(g => {
      const entries = g[wId] || [];
      const updated = entries.map(e => {
        const isTarget = e.open && e.dateOd === openEntry.dateOd && e.type === openEntry.type;
        return isTarget ? {
          ...e,
          open: false,
          dateDo
        } : e;
      });
      return {
        ...g,
        [wId]: updated
      };
    });
  };
  const deleteGodisnji = (wId, date) => {
    setGodisnji(g => ({
      ...g,
      [wId]: (g[wId] || []).filter(e => e.date !== date)
    }));
  };
  const deleteOpenLeave = (wId, openEntry) => {
    setGodisnji(g => ({
      ...g,
      [wId]: (g[wId] || []).filter(e => !(e.open && e.dateOd === openEntry.dateOd && e.type === openEntry.type))
    }));
  };
  const displayWorkers = selWorker ? sortedWorkers.filter(w => w.id === selWorker) : sortedWorkers;

  // ── Yearly overview data ──
  const yearlyStats = useMemo(() => {
    if (sihtView !== 'godisnji') return [];
    return sortedWorkers.filter(w => w.status === 'aktivan').map(w => {
      const months = Array.from({
        length: 12
      }, (_, mi) => {
        const dim = new Date(selYear, mi + 1, 0).getDate();
        let radnih = 0,
          odsutnih = 0,
          vikenda = 0,
          praznih = 0,
          praznika = 0;
        const odsutTypes = {};
        for (let d = 1; d <= dim; d++) {
          const iso = `${selYear}-${String(mi + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const dw = new Date(selYear, mi, d).getDay();
          if (dw === 0 || dw === 6) {
            vikenda++;
            continue;
          }
          const entry = workerDayMap[w.id]?.[iso];
          if (!entry) {
            praznih++;
            continue;
          }
          if (entry.type === 'rad') radnih++;else if (entry.type === 'praznik') praznika++;else {
            odsutnih++;
            odsutTypes[entry.oType] = (odsutTypes[entry.oType] || 0) + 1;
          }
        }
        return {
          radnih,
          odsutnih,
          vikenda,
          praznih,
          praznika,
          odsutTypes
        };
      });
      const total = months.reduce((a, m) => ({
        radnih: a.radnih + m.radnih,
        odsutnih: a.odsutnih + m.odsutnih,
        vikenda: a.vikenda + m.vikenda,
        praznih: a.praznih + m.praznih,
        praznika: a.praznika + m.praznika
      }), {
        radnih: 0,
        odsutnih: 0,
        vikenda: 0,
        praznih: 0,
        praznika: 0
      });
      // Count GO days used from datumOd onwards
      const kv = getKvota(w.id);
      const goUsed = (godisnji[w.id] || []).filter(e => e.date && e.type === 'Godišnji odmor' && (!kv.datumOd || e.date >= kv.datumOd)).length;
      const goRemaining = kv.dana - goUsed;
      return {
        ...w,
        months,
        total,
        goUsed,
        kvota: kv.dana,
        kvotaDatumOd: kv.datumOd,
        goRemaining
      };
    });
  }, [sihtView, selYear, workerDayMap, workers, goKvota, godisnji]);

  // ── Per-worker monthly detail ──
  const singleWorkerData = useMemo(() => {
    if (sihtView !== 'radnik' || !selWorker) return null;
    const w = workers.find(x => x.id === selWorker);
    if (!w) return null;
    const months = Array.from({
      length: 12
    }, (_, mi) => {
      const dim = new Date(selYear, mi + 1, 0).getDate();
      const daysList = [];
      let radnih = 0,
        odsutnih = 0,
        vikenda = 0,
        praznih = 0,
        praznika = 0;
      const odsutTypes = {};
      for (let d = 1; d <= dim; d++) {
        const iso = `${selYear}-${String(mi + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dw = new Date(selYear, mi, d).getDay();
        const entry = workerDayMap[w.id]?.[iso];
        const wknd = dw === 0 || dw === 6;
        if (wknd) vikenda++;else if (!entry) praznih++;else if (entry.type === 'rad') radnih++;else if (entry.type === 'praznik') praznika++;else {
          odsutnih++;
          odsutTypes[entry.oType] = (odsutTypes[entry.oType] || 0) + 1;
        }
        daysList.push({
          d,
          iso,
          dw,
          wknd,
          entry
        });
      }
      return {
        mi,
        days: daysList,
        radnih,
        odsutnih,
        vikenda,
        praznih,
        praznika,
        odsutTypes
      };
    });
    const total = months.reduce((a, m) => ({
      radnih: a.radnih + m.radnih,
      odsutnih: a.odsutnih + m.odsutnih,
      vikenda: a.vikenda + m.vikenda,
      praznih: a.praznih + m.praznih,
      praznika: a.praznika + m.praznika
    }), {
      radnih: 0,
      odsutnih: 0,
      vikenda: 0,
      praznih: 0,
      praznika: 0
    });
    return {
      worker: w,
      months,
      total
    };
  }, [sihtView, selYear, selWorker, workerDayMap, workers]);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '0.75rem',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, "\uD83D\uDCC4 \u0160ihtarica"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 0,
      borderRadius: 6,
      overflow: 'hidden',
      border: '1px solid var(--border)'
    }
  }, [['mjesecni', 'Mjesečni'], ['radnik', 'Po radniku'], ['godisnji', 'Godišnji'], ['gokvota', 'GO Kvota'], ['praznici', 'Praznici']].map(_ref36 => {
    let [k, l] = _ref36;
    return /*#__PURE__*/React.createElement("button", {
      key: k,
      onClick: () => setSihtView(k),
      style: {
        padding: '0.35rem 0.7rem',
        fontSize: '0.75rem',
        fontWeight: sihtView === k ? 700 : 400,
        border: 'none',
        cursor: 'pointer',
        background: sihtView === k ? 'var(--green)' : 'var(--bg)',
        color: sihtView === k ? 'white' : 'var(--text-muted)'
      }
    }, l);
  }))), sihtView !== 'praznici' && sihtView !== 'gokvota' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1rem',
      flexWrap: 'wrap'
    }
  }, sihtView !== 'godisnji' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "date-nav-btn",
    onClick: () => {
      if (selMonth === 0) {
        setSelMonth(11);
        setSelYear(y => y - 1);
      } else setSelMonth(m => m - 1);
    }
  }, "\u25C0"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--mono)',
      fontWeight: 700,
      fontSize: '0.9rem',
      minWidth: 140,
      textAlign: 'center'
    }
  }, MONTH_NAMES[selMonth], " ", selYear), /*#__PURE__*/React.createElement("button", {
    className: "date-nav-btn",
    onClick: () => {
      if (selMonth === 11) {
        setSelMonth(0);
        setSelYear(y => y + 1);
      } else setSelMonth(m => m + 1);
    }
  }, "\u25B6")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "date-nav-btn",
    onClick: () => setSelYear(y => y - 1)
  }, "\u25C0"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--mono)',
      fontWeight: 700,
      fontSize: '0.9rem',
      minWidth: 60,
      textAlign: 'center'
    }
  }, selYear), /*#__PURE__*/React.createElement("button", {
    className: "date-nav-btn",
    onClick: () => setSelYear(y => y + 1)
  }, "\u25B6")), /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: selWorker,
    onChange: e => setSelWorker(e.target.value),
    style: {
      maxWidth: 220
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, sihtView === 'radnik' ? '— Odaberi radnika —' : 'Svi radnici'), sortedWorkers.filter(w => w.status === 'aktivan').map(w => /*#__PURE__*/React.createElement("option", {
    key: w.id,
    value: w.id
  }, w.name))), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm",
    onClick: () => {
      const title = `Šihtarica — ${MONTH_NAMES[selMonth]} ${selYear}${selWorker ? ' — ' + workers.find(w => w.id === selWorker)?.name : ''}`;
      const printWorkers = (selWorker ? sortedWorkers.filter(w => w.id === selWorker) : sortedWorkers).filter(w => w.status === 'aktivan');
      const DAY_LABELS = 'NPUSČPS';
      let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
          <title>${title}</title>
          <style>
            *{margin:0;padding:0;box-sizing:border-box}
            body{font-family:Arial,sans-serif;font-size:9pt;padding:8mm;color:#222}
            h1{font-size:13pt;margin-bottom:1mm;text-align:center}
            .sub{font-size:9pt;text-align:center;color:#555;margin-bottom:5mm}
            table{border-collapse:collapse;width:100%;font-size:7.5pt}
            th,td{border:1px solid #ccc;padding:1.5mm 1mm;text-align:center}
            th{background:#f0ede6;font-size:6.5pt}
            .wname{text-align:left;padding-left:2mm;font-weight:700;min-width:90px;max-width:120px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
            .rad{background:#d4ecd4;color:#1a4d1a;font-weight:700}
            .go{background:#dae8f5;color:#1a3d5c;font-weight:700}
            .b{background:#fde8e8;color:#8b2020;font-weight:700}
            .sd{background:#fdf0e0;color:#b5620a;font-weight:700}
            .sp{background:#ddeeff;color:#0a4b78;font-weight:700}
            .nd{background:#6b0000;color:#fff;font-weight:700}
            .n{background:#eee;color:#555;font-weight:700}
            .praznik{background:#fff3e0;color:#e65100;font-weight:700}
            .vikend{background:#ece9e2;color:#bbb}
            .sum{background:#f0ede6;font-weight:700;font-size:7pt}
            @media print{body{padding:5mm}}
          </style></head><body>`;
      html += `<h1>${title}</h1><div class="sub">Šumarija Bosanska Krupa</div>`;
      html += `<table><thead><tr><th class="wname">Radnik</th>`;
      days.forEach(d => {
        const wknd = isWeekend(d);
        html += `<th style="${wknd ? 'color:#bbb' : ''}">${d}<br/><span style="font-size:5.5pt">${DAY_LABELS[dayOfWeek(d)]}</span></th>`;
      });
      html += `<th class="sum">R</th><th class="sum">GO</th><th class="sum">B</th><th class="sum">SD</th></tr></thead><tbody>`;
      printWorkers.forEach(w => {
        const stats = workerStats.find(s => s.id === w.id) || {
          radnih: 0,
          odsutTypes: {}
        };
        html += `<tr><td class="wname">${w.name}</td>`;
        days.forEach(d => {
          const date = isoDate(d);
          const entry = workerDayMap[w.id]?.[date];
          const wknd = isWeekend(d);
          if (wknd) {
            html += `<td class="vikend">—</td>`;
            return;
          }
          if (!entry) {
            html += `<td></td>`;
            return;
          }
          if (entry.type === 'rad') {
            html += `<td class="rad">8</td>`;
            return;
          }
          if (entry.type === 'praznik') {
            html += `<td class="praznik">P</td>`;
            return;
          }
          const SHORT_CLASS = {
            'Godišnji odmor': 'go',
            'Bolovanje': 'b',
            'Slobodan dan': 'sd',
            'Službeni put': 'sp',
            'Neopravdan dan': 'nd',
            'Neplaćeno': 'n'
          };
          const cls = SHORT_CLASS[entry.oType] || 'n';
          const short = ODSUTNOST_COLOR[entry.oType]?.short || '?';
          html += `<td class="${cls}">${short}</td>`;
        });
        html += `<td class="sum">${stats.radnih || 0}</td><td class="sum">${stats.odsutTypes?.['Godišnji odmor'] || 0}</td><td class="sum">${stats.odsutTypes?.['Bolovanje'] || 0}</td><td class="sum">${stats.odsutTypes?.['Slobodan dan'] || 0}</td></tr>`;
      });
      html += `</tbody></table></body></html>`;
      const w = window.open('', '_blank');
      w.document.write(html);
      w.document.close();
      w.onload = () => w.print();
    }
  }, "\uD83D\uDDA8\uFE0F \u0160tampaj")), sihtView === 'praznici' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '1rem',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "form-input",
    value: holidayDate,
    onChange: e => setHolidayDate(e.target.value),
    style: {
      fontSize: '0.85rem',
      padding: '0.35rem 0.5rem'
    }
  }), !holidayInput ? /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: () => {
      setHolidayInput(true);
      setHolidayName('');
    }
  }, "+ Dodaj praznik") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("input", {
    autoFocus: true,
    className: "form-input",
    placeholder: "Naziv praznika (npr. Bajram, Nova godina...)",
    value: holidayName,
    onChange: e => setHolidayName(e.target.value),
    onKeyDown: e => {
      if (e.key === 'Enter') {
        const name = holidayName.trim();
        if (!name) return alert('Unesite naziv praznika!');
        setHolidays(h => ({
          ...h,
          [holidayDate]: name
        }));
        setHolidayInput(false);
        setHolidayName('');
      }
      if (e.key === 'Escape') {
        setHolidayInput(false);
        setHolidayName('');
      }
    },
    style: {
      flex: 1,
      fontSize: '0.85rem',
      padding: '0.35rem 0.5rem',
      minWidth: 200
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: () => {
      const name = holidayName.trim();
      if (!name) return alert('Unesite naziv praznika!');
      setHolidays(h => ({
        ...h,
        [holidayDate]: name
      }));
      setHolidayInput(false);
      setHolidayName('');
    }
  }, "Spremi"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm",
    onClick: () => {
      setHolidayInput(false);
      setHolidayName('');
    }
  }, "Odustani"))), Object.keys(holidays || {}).length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '2rem',
      color: 'var(--text-muted)',
      fontSize: '0.9rem'
    }
  }, "Nema upisanih praznika. Kliknite \"+ Dodaj praznik\" za unos.") : /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "table",
    style: {
      width: '100%',
      fontSize: '0.85rem'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '0.5rem 0.75rem'
    }
  }, "Datum"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '0.5rem 0.75rem'
    }
  }, "Dan"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '0.5rem 0.75rem'
    }
  }, "Naziv praznika"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '0.5rem 0.75rem',
      width: 80
    }
  }))), /*#__PURE__*/React.createElement("tbody", null, Object.entries(holidays).sort((_ref37, _ref38) => {
    let [a] = _ref37;
    let [b] = _ref38;
    return a.localeCompare(b);
  }).map(_ref39 => {
    let [date, name] = _ref39;
    const d = new Date(date + 'T00:00:00');
    const dayNames = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];
    return /*#__PURE__*/React.createElement("tr", {
      key: date
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '0.5rem 0.75rem',
        fontFamily: 'var(--mono)'
      }
    }, date), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '0.5rem 0.75rem'
      }
    }, dayNames[d.getDay()]), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '0.5rem 0.75rem',
        fontWeight: 600
      }
    }, name), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '0.5rem 0.75rem',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-sm",
      onClick: () => {
        if (confirm(`Ukloniti praznik "${name}" (${date})?`)) setHolidays(h => {
          const n = {
            ...h
          };
          delete n[date];
          return n;
        });
      },
      style: {
        background: '#c53030',
        color: 'white',
        border: 'none',
        fontSize: '0.72rem'
      }
    }, "Ukloni")));
  }))))), sihtView === 'mjesecni' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
      marginBottom: '1rem',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.72rem',
      color: 'var(--text-muted)',
      fontWeight: 700
    }
  }, "Kategorije:"), WORKER_CATEGORIES.filter(c => c.id !== 'poslovoda').map(c => /*#__PURE__*/React.createElement("span", {
    key: c.id,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.2rem',
      fontSize: '0.72rem',
      background: c.pale,
      color: c.color,
      border: `1px solid ${c.border}`,
      borderRadius: 3,
      padding: '0.15rem 0.5rem',
      fontWeight: 600
    }
  }, c.icon, " ", c.short)), /*#__PURE__*/React.createElement("span", {
    style: {
      margin: '0 0.3rem',
      color: 'var(--border)'
    }
  }, "|"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.72rem',
      color: 'var(--text-muted)',
      fontWeight: 700
    }
  }, "Odsutnost:"), Object.entries(ODSUTNOST_COLOR).map(_ref40 => {
    let [k, v] = _ref40;
    return /*#__PURE__*/React.createElement("span", {
      key: k,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.2rem'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.72rem',
        background: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        borderRadius: 3,
        padding: '0.1rem 0.4rem',
        fontFamily: 'var(--mono)',
        fontWeight: 700
      }
    }, v.short), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.72rem',
        color: 'var(--text-muted)'
      }
    }, v.icon, " ", k));
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.72rem',
      background: '#fff3e0',
      color: '#e65100',
      border: '1px solid #ffb74d',
      borderRadius: 3,
      padding: '0.1rem 0.4rem',
      fontFamily: 'var(--mono)',
      fontWeight: 700
    }
  }, "P"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.72rem',
      color: 'var(--text-muted)'
    }
  }, "Praznik"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.72rem',
      background: '#f0ede6',
      color: '#9e9589',
      border: '1px solid #d4cfc4',
      borderRadius: 3,
      padding: '0.1rem 0.4rem',
      fontFamily: 'var(--mono)'
    }
  }, "\u2014"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.72rem',
      color: 'var(--text-muted)'
    }
  }, "Vikend")), /*#__PURE__*/React.createElement("div", {
    className: "siht-desktop-table",
    style: {
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      borderCollapse: 'collapse',
      fontSize: '0.75rem',
      minWidth: 'max-content',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      background: '#f0ede6',
      padding: '0.5rem 0.75rem',
      textAlign: 'left',
      border: '1px solid var(--border)',
      minWidth: 160,
      position: 'sticky',
      left: 0,
      zIndex: 2,
      fontFamily: 'var(--mono)',
      fontSize: '0.65rem',
      letterSpacing: '0.08em'
    }
  }, "RADNIK"), days.map(d => /*#__PURE__*/React.createElement("th", {
    key: d,
    style: {
      background: isWeekend(d) ? '#ece9e2' : '#f0ede6',
      padding: '0.3rem 0.2rem',
      textAlign: 'center',
      border: '1px solid var(--border)',
      minWidth: 28,
      fontFamily: 'var(--mono)',
      fontSize: '0.65rem',
      color: isWeekend(d) ? 'var(--text-light)' : 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("div", null, d), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.55rem',
      opacity: 0.7
    }
  }, 'NPUSČPS'[dayOfWeek(d)]))), /*#__PURE__*/React.createElement("th", {
    style: {
      background: '#f0ede6',
      padding: '0.3rem 0.5rem',
      border: '1px solid var(--border)',
      fontFamily: 'var(--mono)',
      fontSize: '0.6rem',
      minWidth: 36,
      textAlign: 'center'
    }
  }, "R"), /*#__PURE__*/React.createElement("th", {
    style: {
      background: '#fdf0e0',
      padding: '0.3rem 0.5rem',
      border: '1px solid var(--border)',
      fontFamily: 'var(--mono)',
      fontSize: '0.6rem',
      minWidth: 36,
      textAlign: 'center'
    }
  }, "GO"), /*#__PURE__*/React.createElement("th", {
    style: {
      background: '#fde8e8',
      padding: '0.3rem 0.5rem',
      border: '1px solid var(--border)',
      fontFamily: 'var(--mono)',
      fontSize: '0.6rem',
      minWidth: 36,
      textAlign: 'center'
    }
  }, "B"))), /*#__PURE__*/React.createElement("tbody", null, displayWorkers.map(w => {
    const stats = workerStats.find(s => s.id === w.id) || w;
    const cat = getCatById(w.category);
    const catColor = cat?.color || '#2d5a27';
    const catPale = cat?.pale || '#e8f0e6';
    const catBorder = cat?.border || '#9bc492';
    return /*#__PURE__*/React.createElement("tr", {
      key: w.id,
      style: {
        opacity: w.status === 'aktivan' ? 1 : 0.5
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '0.35rem 0.6rem',
        border: `2px solid ${catBorder}`,
        borderLeft: `4px solid ${catColor}`,
        fontWeight: 600,
        background: catPale,
        position: 'sticky',
        left: 0,
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.3rem'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
        minWidth: 0,
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: catColor
      }
    }, w.name)), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setGoModal({
          workerId: w.id
        });
        setGoForm({
          date: isoDate(new Date().getDate()),
          dateDo: '',
          type: 'Godišnji odmor',
          note: ''
        });
      },
      style: {
        background: catColor,
        color: 'white',
        border: 'none',
        borderRadius: 4,
        padding: '0.15rem 0.35rem',
        fontSize: '0.65rem',
        cursor: 'pointer',
        flexShrink: 0,
        fontWeight: 700
      },
      title: "Dodaj odsutnost"
    }, "+GO")), days.map(d => {
      const date = isoDate(d);
      const entry = workerDayMap[w.id]?.[date];
      const wknd = isWeekend(d);
      const hasManual = !!sihtManual[w.id]?.[date];
      let cellBg = wknd ? '#f0ede6' : 'white';
      let cellBorderColor = wknd ? '#ddd9d0' : '#ece9e2';
      let cellText = wknd ? /*#__PURE__*/React.createElement("span", {
        style: {
          color: '#ccc8c0',
          fontSize: '0.55rem'
        }
      }, "\u2014") : null;
      let title = wknd ? '' : 'Klikni za postavljanje statusa';
      if (entry?.type === 'rad') {
        const isPoslovoda = w.category === 'poslovoda_isk' || w.category === 'poslovoda_uzg';
        const cellLabel = isPoslovoda ? entry.jobType === 'Kancelarija' ? '8' : 'U' : '8';
        cellBg = catPale;
        cellBorderColor = entry.manual ? catColor : catBorder;
        cellText = /*#__PURE__*/React.createElement("span", {
          style: {
            color: catColor,
            fontWeight: 700,
            fontSize: '0.65rem',
            fontFamily: 'var(--mono)'
          }
        }, cellLabel);
        title = (cat?.short || 'Rad') + ' · ' + entry.jobType + (entry.manual ? ' (ručno)' : '');
      } else if (entry?.type === 'praznik') {
        cellBg = '#fff3e0';
        cellBorderColor = '#ffb74d';
        cellText = /*#__PURE__*/React.createElement("span", {
          style: {
            color: '#e65100',
            fontWeight: 700,
            fontSize: '0.6rem',
            fontFamily: 'var(--mono)'
          }
        }, "P");
        title = 'Praznik: ' + (entry.holidayName || '');
      } else if (entry?.type === 'odsutnost') {
        const oc = ODSUTNOST_COLOR[entry.oType] || ODSUTNOST_COLOR['Neplaćeno'];
        cellBg = oc.bg;
        cellBorderColor = entry.manual ? oc.color : oc.border;
        const clickHandler = entry.manual ? () => setManualCell(w.id, date, null) : entry.open ? () => deleteOpenLeave(w.id, {
          dateOd: entry.dateOd,
          type: entry.oType,
          note: entry.note
        }) : entry.dateDo ? () => setGodisnji(g => ({
          ...g,
          [w.id]: (g[w.id] || []).filter(e => !(e.dateOd === entry.dateOd && e.dateDo === entry.dateDo && e.type === entry.oType))
        })) : () => deleteGodisnji(w.id, date);
        cellText = /*#__PURE__*/React.createElement("span", {
          style: {
            color: oc.color,
            fontWeight: 700,
            fontSize: '0.6rem',
            fontFamily: 'var(--mono)',
            cursor: 'pointer'
          },
          onClick: e => {
            e.stopPropagation();
            clickHandler();
          },
          title: entry.manual ? 'Ručni unos · klikni za brisanje' : entry.open ? 'Otvoreno od ' + entry.dateOd + ' · klikni za brisanje' : entry.dateDo ? entry.dateOd + ' – ' + entry.dateDo + ' · klikni za brisanje' : 'Klikni za brisanje: ' + entry.oType
        }, oc.short);
        title = entry.oType + (entry.manual ? ' (ručno)' : entry.open ? ' (otvoreno od ' + entry.dateOd + ')' : entry.dateDo ? ' (' + entry.dateOd + ' – ' + entry.dateDo + ')' : '') + (entry.note ? ' — ' + entry.note : '');
      }
      return /*#__PURE__*/React.createElement("td", {
        key: d,
        title: title,
        style: {
          padding: '0.25rem 0.15rem',
          border: `1px solid ${cellBorderColor}`,
          textAlign: 'center',
          background: cellBg,
          cursor: wknd ? 'default' : 'pointer',
          outline: hasManual ? `2px solid ${catColor}` : 'none',
          outlineOffset: -2
        },
        onClick: wknd ? undefined : e => {
          const rect = e.currentTarget.getBoundingClientRect();
          setCellPicker({
            workerId: w.id,
            date,
            x: rect.left,
            y: rect.bottom
          });
        }
      }, cellText);
    }), /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: 'center',
        border: `1px solid ${catBorder}`,
        background: catPale,
        fontFamily: 'var(--mono)',
        fontWeight: 700,
        color: catColor,
        padding: '0.25rem 0.4rem'
      }
    }, stats.radnih || 0), /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: 'center',
        border: '1px solid var(--border)',
        background: '#fdf0e0',
        fontFamily: 'var(--mono)',
        fontWeight: 700,
        color: '#b5620a',
        padding: '0.25rem 0.4rem'
      }
    }, (stats.odsutTypes || {})['Godišnji odmor'] || 0), /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: 'center',
        border: '1px solid var(--border)',
        background: '#fde8e8',
        fontFamily: 'var(--mono)',
        fontWeight: 700,
        color: '#8b2020',
        padding: '0.25rem 0.4rem'
      }
    }, (stats.odsutTypes || {})['Bolovanje'] || 0));
  })))), /*#__PURE__*/React.createElement("div", {
    className: "siht-mobile-cards"
  }, displayWorkers.filter(w => w.status === 'aktivan').map(w => {
    const stats = workerStats.find(s => s.id === w.id) || w;
    const cat = getCatById(w.category);
    const catColor = cat?.color || '#2d5a27';
    const catPale = cat?.pale || '#e8f0e6';
    const catBorder = cat?.border || '#9bc492';
    return /*#__PURE__*/React.createElement("div", {
      key: w.id,
      style: {
        background: 'var(--surface)',
        border: `1px solid ${catBorder}`,
        borderLeft: `4px solid ${catColor}`,
        borderRadius: 6,
        marginBottom: '0.4rem',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.35rem 0.5rem',
        background: catPale
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        fontSize: '0.8rem',
        color: catColor,
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, w.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '0.65rem',
        fontWeight: 700,
        color: 'white',
        background: catColor,
        borderRadius: 3,
        padding: '0.1rem 0.3rem'
      }
    }, stats.radnih || 0, "R"), (stats.odsutTypes?.['Godišnji odmor'] || 0) > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '0.6rem',
        fontWeight: 700,
        color: 'white',
        background: '#1a3d5c',
        borderRadius: 3,
        padding: '0.1rem 0.25rem'
      }
    }, stats.odsutTypes['Godišnji odmor'], "GO"), (stats.odsutTypes?.['Bolovanje'] || 0) > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '0.6rem',
        fontWeight: 700,
        color: 'white',
        background: '#8b2020',
        borderRadius: 3,
        padding: '0.1rem 0.25rem'
      }
    }, stats.odsutTypes['Bolovanje'], "B"), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setGoModal({
          workerId: w.id
        });
        setGoForm({
          date: isoDate(new Date().getDate()),
          dateDo: '',
          type: 'Godišnji odmor',
          note: ''
        });
      },
      style: {
        background: catColor,
        color: 'white',
        border: 'none',
        borderRadius: 4,
        padding: '0.15rem 0.35rem',
        fontSize: '0.6rem',
        cursor: 'pointer',
        fontWeight: 700
      }
    }, "+GO")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0.25rem 0.35rem 0.3rem',
        display: 'grid',
        gridTemplateColumns: `repeat(${daysInMonth}, 1fr)`,
        gap: '1.5px'
      }
    }, days.map(d => {
      const date = isoDate(d);
      const entry = workerDayMap[w.id]?.[date];
      const wknd = isWeekend(d);
      let bg,
        color,
        fontW = 400,
        label = String(d);
      if (entry?.type === 'rad') {
        const isPoslovoda = w.category === 'poslovoda_isk' || w.category === 'poslovoda_uzg';
        label = isPoslovoda ? entry.jobType === 'Kancelarija' ? '8' : 'U' : '8';
        bg = catColor;
        color = 'white';
        fontW = 700;
      } else if (entry?.type === 'praznik') {
        bg = '#e65100';
        color = 'white';
        fontW = 700;
        label = 'P';
      } else if (entry?.type === 'odsutnost') {
        const oc = ODSUTNOST_COLOR[entry.oType] || ODSUTNOST_COLOR['Neplaćeno'];
        bg = oc.color;
        color = 'white';
        fontW = 700;
        label = oc.short;
      } else if (wknd) {
        bg = '#d5d0c8';
        color = '#fff';
      } else {
        bg = '#e8e4dc';
        color = '#a09888';
      }
      return /*#__PURE__*/React.createElement("div", {
        key: d,
        title: `${d}. ${entry?.type === 'rad' ? (cat?.short || 'Rad') + ' · ' + entry.jobType : entry?.type === 'praznik' ? 'Praznik: ' + (entry.holidayName || '') : entry?.oType || (wknd ? 'vikend' : 'Klikni za status')}`,
        style: {
          height: 22,
          background: bg,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.42rem',
          fontWeight: fontW,
          fontFamily: 'var(--mono)',
          color,
          cursor: wknd ? 'default' : 'pointer',
          outline: sihtManual[w.id]?.[date] ? '1.5px solid ' + catColor : 'none',
          outlineOffset: -1
        },
        onClick: wknd ? undefined : e => {
          const rect = e.currentTarget.getBoundingClientRect();
          setCellPicker({
            workerId: w.id,
            date,
            x: rect.left,
            y: rect.bottom
          });
        }
      }, label);
    })));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '1.5rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: '0.65rem',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--text-light)',
      marginBottom: '0.75rem'
    }
  }, "Pregled po radniku \u2014 ", MONTH_NAMES[selMonth], " ", selYear), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(min(200px,100%),1fr))',
      gap: '0.5rem'
    }
  }, displayWorkers.filter(w => w.status === 'aktivan').map(w => {
    const stats = workerStats.find(s => s.id === w.id) || {
      radnih: 0,
      odsutnih: 0,
      praznih: 0
    };
    const goUpcoming = (godisnji[w.id] || []).filter(e => e.date && e.date >= today()).sort((a, b) => a.date.localeCompare(b.date));
    const openLeaves = (godisnji[w.id] || []).filter(e => e.open);
    return /*#__PURE__*/React.createElement("div", {
      key: w.id,
      style: {
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: '0.75rem',
        boxShadow: 'var(--shadow)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: '0.82rem',
        marginBottom: '0.4rem',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, w.name), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: '0.4rem',
        flexWrap: 'wrap',
        marginBottom: '0.3rem'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '0.75rem',
        background: '#e8f0e6',
        color: '#2d5a27',
        border: '1px solid #9bc492',
        borderRadius: 3,
        padding: '0.1rem 0.4rem'
      }
    }, stats.radnih, " rad"), (() => {
      const kv = getKvota(w.id);
      if (!kv.dana) return null;
      const goUsed = (godisnji[w.id] || []).filter(e => e.date && e.type === 'Godišnji odmor' && (!kv.datumOd || e.date >= kv.datumOd)).length;
      const rem = kv.dana - goUsed;
      return /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--mono)',
          fontSize: '0.75rem',
          borderRadius: 3,
          padding: '0.1rem 0.4rem',
          fontWeight: 700,
          background: rem < 0 ? '#fde8e8' : rem < 7 ? '#fff3e0' : '#e4edf5',
          color: rem < 0 ? '#8b2020' : rem < 7 ? '#e65100' : '#1a3d5c',
          border: `1px solid ${rem < 0 ? '#e0a0a0' : rem < 7 ? '#f0c060' : '#9bbfd9'}`
        }
      }, "GO: ", rem, "/", kv.dana);
    })(), Object.entries(stats.odsutTypes || {}).map(_ref41 => {
      let [k, v] = _ref41;
      const oc = ODSUTNOST_COLOR[k] || {
        bg: '#f0f0f0',
        color: '#555',
        border: '#ccc'
      };
      return /*#__PURE__*/React.createElement("span", {
        key: k,
        style: {
          fontFamily: 'var(--mono)',
          fontSize: '0.75rem',
          background: oc.bg,
          color: oc.color,
          border: `1px solid ${oc.border}`,
          borderRadius: 3,
          padding: '0.1rem 0.4rem'
        }
      }, v, " ", k.split(' ')[0].toLowerCase());
    })), openLeaves.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: '0.3rem'
      }
    }, openLeaves.map(e => {
      const oc = ODSUTNOST_COLOR[e.type] || {
        bg: '#f0f0f0',
        color: '#555',
        border: '#ccc'
      };
      return /*#__PURE__*/React.createElement("div", {
        key: e.dateOd + e.type,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          fontSize: '0.72rem',
          marginBottom: '0.15rem'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--mono)',
          color: oc.color,
          background: oc.bg,
          border: `1px solid ${oc.border}`,
          borderRadius: 3,
          padding: '0.05rem 0.3rem',
          fontSize: '0.65rem',
          fontWeight: 700
        }
      }, ODSUTNOST_COLOR[e.type]?.short), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--mono)',
          color: '#b5620a',
          fontWeight: 600
        }
      }, fmtDate(e.dateOd), " \u2192 ?"), e.note && /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--text-light)',
          fontStyle: 'italic',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }
      }, e.note), /*#__PURE__*/React.createElement("button", {
        onClick: () => deleteOpenLeave(w.id, e),
        style: {
          marginLeft: 'auto',
          background: 'none',
          border: 'none',
          color: 'var(--text-light)',
          cursor: 'pointer',
          fontSize: '0.7rem',
          padding: 0
        }
      }, "\u2715"));
    })), goUpcoming.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: '0.3rem'
      }
    }, goUpcoming.slice(0, 3).map(e => {
      const oc = ODSUTNOST_COLOR[e.type] || {
        bg: '#f0f0f0',
        color: '#555',
        border: '#ccc'
      };
      return /*#__PURE__*/React.createElement("div", {
        key: e.date,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          fontSize: '0.72rem',
          marginBottom: '0.15rem'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--mono)',
          color: oc.color,
          background: oc.bg,
          border: `1px solid ${oc.border}`,
          borderRadius: 3,
          padding: '0.05rem 0.3rem',
          fontSize: '0.65rem',
          fontWeight: 700
        }
      }, ODSUTNOST_COLOR[e.type]?.short), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--mono)',
          color: 'var(--text-muted)'
        }
      }, fmtDate(e.date)), e.note && /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--text-light)',
          fontStyle: 'italic',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }
      }, e.note), /*#__PURE__*/React.createElement("button", {
        onClick: () => deleteGodisnji(w.id, e.date),
        style: {
          marginLeft: 'auto',
          background: 'none',
          border: 'none',
          color: 'var(--text-light)',
          cursor: 'pointer',
          fontSize: '0.7rem',
          padding: 0
        }
      }, "\u2715"));
    })));
  })))), sihtView === 'radnik' && (!selWorker ? /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, /*#__PURE__*/React.createElement("span", {
    className: "icon"
  }, "R"), /*#__PURE__*/React.createElement("p", null, "Odaberi radnika iz padaju\u0107eg menija iznad.")) : !singleWorkerData ? /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, /*#__PURE__*/React.createElement("p", null, "Radnik nije prona\u0111en.")) : (() => {
    const {
      worker: w,
      months: wMonths,
      total: wTotal
    } = singleWorkerData;
    const cat = getCatById(w.category);
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        marginBottom: '1rem',
        padding: '0.75rem 1rem',
        background: cat?.pale || '#f0f0f0',
        border: `2px solid ${cat?.border || '#ccc'}`,
        borderLeft: `5px solid ${cat?.color || '#999'}`,
        borderRadius: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '1.4rem'
      }
    }, cat?.short || 'R'), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: '1rem',
        color: cat?.color || 'var(--text)'
      }
    }, w.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.75rem',
        color: 'var(--text-muted)'
      }
    }, cat?.label, " \xB7 ", selYear)), /*#__PURE__*/React.createElement("div", {
      style: {
        marginLeft: 'auto',
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '0.82rem',
        background: '#e8f0e6',
        color: '#2d5a27',
        border: '1px solid #9bc492',
        borderRadius: 4,
        padding: '0.2rem 0.6rem',
        fontWeight: 700
      }
    }, wTotal.radnih, " radnih"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '0.82rem',
        background: '#fde8e8',
        color: '#8b2020',
        border: '1px solid #e0a0a0',
        borderRadius: 4,
        padding: '0.2rem 0.6rem',
        fontWeight: 700
      }
    }, wTotal.odsutnih, " ods."), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '0.82rem',
        background: 'var(--bg)',
        color: 'var(--text-muted)',
        border: '1px solid var(--border)',
        borderRadius: 4,
        padding: '0.2rem 0.6rem'
      }
    }, wTotal.praznih, " praznih"))), wMonths.map(mo => {
      if (mo.radnih === 0 && mo.odsutnih === 0 && mo.praznih === 0) return null;
      return /*#__PURE__*/React.createElement("div", {
        key: mo.mi,
        className: "card",
        style: {
          marginBottom: '0.75rem'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          background: 'linear-gradient(135deg,var(--green),var(--green-light))',
          color: 'white',
          padding: '0.5rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 700,
          fontSize: '0.85rem'
        }
      }, MONTH_NAMES[mo.mi], " ", selYear), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: '0.4rem'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--mono)',
          fontSize: '0.72rem',
          background: 'rgba(255,255,255,0.2)',
          padding: '0.15rem 0.4rem',
          borderRadius: 10
        }
      }, mo.radnih, " R"), mo.odsutnih > 0 && /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--mono)',
          fontSize: '0.72rem',
          background: 'rgba(255,255,255,0.2)',
          padding: '0.15rem 0.4rem',
          borderRadius: 10
        }
      }, mo.odsutnih, " ods"))), /*#__PURE__*/React.createElement("div", {
        className: "siht-radnik-desktop",
        style: {
          overflowX: 'auto'
        }
      }, /*#__PURE__*/React.createElement("table", {
        style: {
          borderCollapse: 'collapse',
          fontSize: '0.75rem',
          width: '100%'
        }
      }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, mo.days.map(_ref42 => {
        let {
          d,
          dw,
          wknd
        } = _ref42;
        return /*#__PURE__*/React.createElement("th", {
          key: d,
          style: {
            background: wknd ? '#ece9e2' : '#f0ede6',
            padding: '0.25rem 0.15rem',
            textAlign: 'center',
            border: '1px solid var(--border)',
            minWidth: 26,
            fontFamily: 'var(--mono)',
            fontSize: '0.62rem',
            color: wknd ? 'var(--text-light)' : 'var(--text-muted)'
          }
        }, /*#__PURE__*/React.createElement("div", null, d), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '0.5rem',
            opacity: 0.7
          }
        }, 'NPUSČPS'[dw]));
      }))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, mo.days.map(_ref43 => {
        let {
          d,
          iso,
          wknd,
          entry
        } = _ref43;
        let bg = wknd ? '#f0ede6' : 'white';
        let content = wknd ? /*#__PURE__*/React.createElement("span", {
          style: {
            color: '#ccc8c0',
            fontSize: '0.5rem'
          }
        }, "\u2014") : null;
        let border = wknd ? '#ddd9d0' : '#ece9e2';
        if (entry?.type === 'rad') {
          const isPoslovoda = singleWorkerData.category === 'poslovoda_isk' || singleWorkerData.category === 'poslovoda_uzg';
          const cellLabel = isPoslovoda ? entry.jobType === 'Kancelarija' ? '8' : 'U' : '8';
          bg = cat?.pale || '#e8f0e6';
          border = cat?.border || '#9bc492';
          content = /*#__PURE__*/React.createElement("span", {
            style: {
              color: cat?.color || '#2d5a27',
              fontWeight: 700,
              fontSize: '0.6rem',
              fontFamily: 'var(--mono)'
            }
          }, cellLabel);
        } else if (entry?.type === 'praznik') {
          bg = '#fff3e0';
          border = '#ffb74d';
          content = /*#__PURE__*/React.createElement("span", {
            style: {
              color: '#e65100',
              fontWeight: 700,
              fontSize: '0.58rem',
              fontFamily: 'var(--mono)'
            }
          }, "P");
        } else if (entry?.type === 'odsutnost') {
          const oc = ODSUTNOST_COLOR[entry.oType] || ODSUTNOST_COLOR['Neplaćeno'];
          bg = oc.bg;
          border = oc.border;
          content = /*#__PURE__*/React.createElement("span", {
            style: {
              color: oc.color,
              fontWeight: 700,
              fontSize: '0.58rem',
              fontFamily: 'var(--mono)'
            }
          }, oc.short);
        }
        return /*#__PURE__*/React.createElement("td", {
          key: d,
          title: entry?.type === 'rad' ? entry.jobType : entry?.type === 'praznik' ? 'Praznik: ' + (entry.holidayName || '') : entry?.oType || '',
          style: {
            padding: '0.2rem 0.1rem',
            border: `1px solid ${border}`,
            textAlign: 'center',
            background: bg
          }
        }, content);
      }))))), /*#__PURE__*/React.createElement("div", {
        className: "siht-radnik-mobile",
        style: {
          padding: '0.25rem 0.4rem 0.3rem',
          display: 'grid',
          gridTemplateColumns: `repeat(${mo.days.length}, 1fr)`,
          gap: '1.5px'
        }
      }, mo.days.map(_ref44 => {
        let {
          d,
          iso,
          wknd,
          entry
        } = _ref44;
        let bg,
          color,
          label = String(d),
          fontW = 400;
        if (entry?.type === 'rad') {
          const isPoslovoda = singleWorkerData.category === 'poslovoda_isk' || singleWorkerData.category === 'poslovoda_uzg';
          label = isPoslovoda ? entry.jobType === 'Kancelarija' ? '8' : 'U' : '8';
          bg = cat?.color || '#2d5a27';
          color = 'white';
          fontW = 700;
        } else if (entry?.type === 'praznik') {
          bg = '#e65100';
          color = 'white';
          fontW = 700;
          label = 'P';
        } else if (entry?.type === 'odsutnost') {
          const oc = ODSUTNOST_COLOR[entry.oType] || ODSUTNOST_COLOR['Neplaćeno'];
          bg = oc.color;
          color = 'white';
          fontW = 700;
          label = oc.short;
        } else if (wknd) {
          bg = '#d5d0c8';
          color = '#fff';
        } else {
          bg = '#e8e4dc';
          color = '#a09888';
        }
        return /*#__PURE__*/React.createElement("div", {
          key: d,
          style: {
            height: 22,
            background: bg,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.42rem',
            fontWeight: fontW,
            fontFamily: 'var(--mono)',
            color
          }
        }, label);
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          padding: '0.4rem 0.75rem',
          display: 'flex',
          gap: '0.4rem',
          flexWrap: 'wrap',
          borderTop: '1px solid var(--border)',
          fontSize: '0.72rem'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--mono)',
          background: '#e8f0e6',
          color: '#2d5a27',
          border: '1px solid #9bc492',
          borderRadius: 3,
          padding: '0.1rem 0.4rem',
          fontWeight: 700
        }
      }, mo.radnih, " rad"), Object.entries(mo.odsutTypes || {}).map(_ref45 => {
        let [k, v] = _ref45;
        const oc = ODSUTNOST_COLOR[k] || {
          bg: '#f0f0f0',
          color: '#555',
          border: '#ccc',
          short: '?'
        };
        return /*#__PURE__*/React.createElement("span", {
          key: k,
          style: {
            fontFamily: 'var(--mono)',
            background: oc.bg,
            color: oc.color,
            border: `1px solid ${oc.border}`,
            borderRadius: 3,
            padding: '0.1rem 0.4rem',
            fontWeight: 700
          }
        }, v, " ", oc.short);
      }), mo.praznih > 0 && /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--mono)',
          color: 'var(--text-light)',
          padding: '0.1rem 0.4rem'
        }
      }, mo.praznih, " praznih"), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--mono)',
          color: 'var(--text-light)',
          padding: '0.1rem 0.4rem'
        }
      }, mo.vikenda, " vik")));
    }), /*#__PURE__*/React.createElement("div", {
      className: "card",
      style: {
        background: '#fafaf8'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0.75rem 1rem'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '0.65rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--text-light)',
        marginBottom: '0.4rem'
      }
    }, "UKUPNO ZA ", selYear), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '0.85rem',
        background: '#e8f0e6',
        color: '#2d5a27',
        border: '1px solid #9bc492',
        borderRadius: 4,
        padding: '0.2rem 0.6rem',
        fontWeight: 700
      }
    }, wTotal.radnih, " radnih dana"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '0.85rem',
        background: '#fde8e8',
        color: '#8b2020',
        border: '1px solid #e0a0a0',
        borderRadius: 4,
        padding: '0.2rem 0.6rem',
        fontWeight: 700
      }
    }, wTotal.odsutnih, " odsutnih"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '0.85rem',
        background: 'var(--bg)',
        color: 'var(--text-muted)',
        border: '1px solid var(--border)',
        borderRadius: 4,
        padding: '0.2rem 0.6rem'
      }
    }, wTotal.praznih, " praznih"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '0.85rem',
        background: 'var(--bg)',
        color: 'var(--text-muted)',
        border: '1px solid var(--border)',
        borderRadius: 4,
        padding: '0.2rem 0.6rem'
      }
    }, wTotal.vikenda, " vikend")))));
  })()), sihtView === 'godisnji' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "siht-godisnji-desktop",
    style: {
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      borderCollapse: 'collapse',
      fontSize: '0.75rem',
      width: '100%',
      minWidth: 'max-content'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      background: '#f0ede6',
      padding: '0.5rem 0.75rem',
      textAlign: 'left',
      border: '1px solid var(--border)',
      minWidth: 160,
      position: 'sticky',
      left: 0,
      zIndex: 2,
      fontFamily: 'var(--mono)',
      fontSize: '0.65rem',
      letterSpacing: '0.08em'
    }
  }, "RADNIK"), MONTH_NAMES.map((mn, i) => /*#__PURE__*/React.createElement("th", {
    key: i,
    style: {
      background: '#f0ede6',
      padding: '0.35rem 0.3rem',
      textAlign: 'center',
      border: '1px solid var(--border)',
      fontFamily: 'var(--mono)',
      fontSize: '0.62rem',
      minWidth: 44,
      cursor: 'pointer'
    },
    onClick: () => {
      setSelMonth(i);
      setSihtView('mjesecni');
    },
    title: `Otvori ${mn}`
  }, mn.substring(0, 3).toUpperCase())), /*#__PURE__*/React.createElement("th", {
    style: {
      background: 'var(--green)',
      color: 'white',
      padding: '0.35rem 0.5rem',
      border: '1px solid var(--green)',
      fontFamily: 'var(--mono)',
      fontSize: '0.65rem',
      textAlign: 'center',
      minWidth: 48
    }
  }, "UKUP"), /*#__PURE__*/React.createElement("th", {
    style: {
      background: '#e4edf5',
      color: '#1a3d5c',
      padding: '0.35rem 0.4rem',
      border: '1px solid #9bbfd9',
      fontFamily: 'var(--mono)',
      fontSize: '0.6rem',
      textAlign: 'center',
      minWidth: 52
    }
  }, "GO"))), /*#__PURE__*/React.createElement("tbody", null, yearlyStats.map(w => {
    const cat = getCatById(w.category);
    return /*#__PURE__*/React.createElement("tr", {
      key: w.id
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '0.35rem 0.6rem',
        border: `2px solid ${cat?.border || '#ccc'}`,
        borderLeft: `4px solid ${cat?.color || '#999'}`,
        fontWeight: 600,
        background: cat?.pale || '#f0f0f0',
        position: 'sticky',
        left: 0,
        zIndex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: cat?.color || 'var(--text)',
        cursor: 'pointer'
      },
      onClick: () => {
        setSelWorker(w.id);
        setSihtView('radnik');
      },
      title: "Otvori detalj"
    }, w.name))), w.months.map((m, mi) => {
      const hasData = m.radnih > 0 || m.odsutnih > 0;
      const go = m.odsutTypes?.['Godišnji odmor'] || 0;
      const bol = m.odsutTypes?.['Bolovanje'] || 0;
      return /*#__PURE__*/React.createElement("td", {
        key: mi,
        style: {
          padding: '0.2rem 0.15rem',
          border: '1px solid var(--border)',
          textAlign: 'center',
          background: hasData ? 'white' : '#fafaf8',
          cursor: 'pointer'
        },
        onClick: () => {
          setSelMonth(mi);
          setSihtView('mjesecni');
        },
        title: `${MONTH_NAMES[mi]}: ${m.radnih}R ${m.odsutnih}O`
      }, hasData ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--mono)',
          fontWeight: 700,
          fontSize: '0.72rem',
          color: 'var(--green)'
        }
      }, m.radnih), (go > 0 || bol > 0) && /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          justifyContent: 'center',
          gap: '0.1rem',
          marginTop: '0.05rem'
        }
      }, go > 0 && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: '0.5rem',
          fontFamily: 'var(--mono)',
          color: '#1a3d5c',
          fontWeight: 700
        }
      }, go, "GO"), bol > 0 && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: '0.5rem',
          fontFamily: 'var(--mono)',
          color: '#8b2020',
          fontWeight: 700
        }
      }, bol, "B"))) : /*#__PURE__*/React.createElement("span", {
        style: {
          color: '#ddd',
          fontSize: '0.6rem'
        }
      }, "\u2014"));
    }), /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: 'center',
        border: '1px solid var(--green)',
        background: '#e8f0e6',
        fontFamily: 'var(--mono)',
        fontWeight: 700,
        color: 'var(--green)',
        padding: '0.3rem 0.4rem',
        fontSize: '0.82rem'
      }
    }, w.total.radnih, w.total.odsutnih > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.55rem',
        color: '#8b2020',
        fontWeight: 600
      }
    }, w.total.odsutnih, " ods")), /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: 'center',
        border: '1px solid #9bbfd9',
        fontFamily: 'var(--mono)',
        fontWeight: 700,
        fontSize: '0.72rem',
        padding: '0.2rem 0.3rem',
        background: !w.kvota ? '#f8fbff' : w.goRemaining < 0 ? '#fde8e8' : w.goRemaining < 7 ? '#fff3e0' : '#e8f5e9',
        color: !w.kvota ? '#ccc' : w.goRemaining < 0 ? '#8b2020' : w.goRemaining < 7 ? '#e65100' : '#2e7d32',
        cursor: 'pointer'
      },
      onClick: () => setSihtView('gokvota'),
      title: "Otvori GO Kvota"
    }, w.kvota ? /*#__PURE__*/React.createElement(React.Fragment, null, w.goRemaining, "/", w.kvota) : '—', w.kvota > 0 && w.goRemaining >= 0 && w.goRemaining < 7 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.42rem',
        fontWeight: 600,
        color: '#e65100'
      }
    }, "MALO!"), w.kvota > 0 && w.goRemaining < 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.42rem',
        fontWeight: 600,
        color: '#8b2020'
      }
    }, "PREKORA\u010CENO")));
  })), /*#__PURE__*/React.createElement("tfoot", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: {
      background: 'var(--green)',
      color: 'white',
      padding: '0.4rem 0.75rem',
      fontWeight: 700,
      fontSize: '0.75rem',
      position: 'sticky',
      left: 0,
      zIndex: 2,
      border: '1px solid var(--green)'
    }
  }, "UKUPNO"), Array.from({
    length: 12
  }, (_, mi) => {
    const sum = yearlyStats.reduce((a, w) => a + w.months[mi].radnih, 0);
    return /*#__PURE__*/React.createElement("td", {
      key: mi,
      style: {
        textAlign: 'center',
        border: '1px solid var(--border)',
        background: '#f0ede6',
        fontFamily: 'var(--mono)',
        fontWeight: 700,
        fontSize: '0.72rem',
        color: 'var(--green)',
        padding: '0.3rem 0.2rem'
      }
    }, sum || '—');
  }), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: 'center',
      border: '1px solid var(--green)',
      background: 'var(--green)',
      color: 'white',
      fontFamily: 'var(--mono)',
      fontWeight: 700,
      fontSize: '0.85rem',
      padding: '0.3rem 0.4rem'
    }
  }, yearlyStats.reduce((a, w) => a + w.total.radnih, 0)), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: 'center',
      border: '1px solid #9bbfd9',
      background: '#e4edf5',
      fontFamily: 'var(--mono)',
      fontWeight: 700,
      fontSize: '0.72rem',
      color: '#1a3d5c',
      padding: '0.3rem 0.2rem'
    }
  }, yearlyStats.some(w => w.kvota > 0) ? yearlyStats.reduce((a, w) => a + w.goRemaining, 0) + '/' + yearlyStats.reduce((a, w) => a + w.kvota, 0) : '—'))))), /*#__PURE__*/React.createElement("div", {
    className: "siht-godisnji-mobile"
  }, yearlyStats.map(w => {
    const cat = getCatById(w.category);
    return /*#__PURE__*/React.createElement("div", {
      key: w.id,
      style: {
        background: 'var(--surface)',
        border: `1px solid ${cat?.border || '#ccc'}`,
        borderLeft: `4px solid ${cat?.color || '#999'}`,
        borderRadius: 6,
        marginBottom: '0.4rem',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.35rem 0.5rem',
        background: cat?.pale || '#f0f0f0'
      }
    }, /*#__PURE__*/React.createElement("span", {
      onClick: () => {
        setSelWorker(w.id);
        setSihtView('radnik');
      },
      style: {
        fontWeight: 700,
        fontSize: '0.78rem',
        color: cat?.color || 'var(--text)',
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        cursor: 'pointer'
      }
    }, w.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '0.62rem',
        fontWeight: 700,
        color: 'white',
        background: 'var(--green)',
        borderRadius: 3,
        padding: '0.1rem 0.25rem'
      }
    }, w.total.radnih, "R"), w.total.odsutnih > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '0.58rem',
        fontWeight: 700,
        color: 'white',
        background: '#8b2020',
        borderRadius: 3,
        padding: '0.1rem 0.2rem'
      }
    }, w.total.odsutnih, "O"), w.kvota > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '0.58rem',
        fontWeight: 700,
        borderRadius: 3,
        padding: '0.1rem 0.25rem',
        background: w.goRemaining < 0 ? '#fde8e8' : w.goRemaining < 7 ? '#fff3e0' : '#e4edf5',
        color: w.goRemaining < 0 ? '#8b2020' : w.goRemaining < 7 ? '#e65100' : '#1a3d5c'
      }
    }, "GO: ", w.goRemaining, "/", w.kvota)), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0.2rem 0.35rem 0.25rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '2px'
      }
    }, w.months.map((m, mi) => {
      const hasData = m.radnih > 0 || m.odsutnih > 0;
      return /*#__PURE__*/React.createElement("div", {
        key: mi,
        onClick: () => {
          setSelMonth(mi);
          setSihtView('mjesecni');
        },
        style: {
          textAlign: 'center',
          padding: '0.15rem 0',
          borderRadius: 2,
          cursor: 'pointer',
          background: hasData ? m.odsutnih > 0 ? '#fde8e8' : '#e8f0e6' : '#f0ede6',
          border: `1px solid ${hasData ? m.odsutnih > 0 ? '#e0a0a0' : '#9bc492' : 'transparent'}`
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--mono)',
          fontSize: '0.4rem',
          color: 'var(--text-light)',
          lineHeight: 1
        }
      }, MONTH_NAMES[mi].substring(0, 3)), hasData ? /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--mono)',
          fontSize: '0.55rem',
          fontWeight: 700,
          color: 'var(--green)',
          lineHeight: 1.2
        }
      }, m.radnih) : /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '0.45rem',
          color: '#ccc',
          lineHeight: 1.2
        }
      }, "\u2014"));
    })));
  }))), sihtView === 'gokvota' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '1rem'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '0.95rem',
      fontWeight: 700,
      color: 'var(--text)',
      marginBottom: '0.3rem'
    }
  }, "Broj dana godi\u0161njeg odmora po ugovoru"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '0.78rem',
      color: 'var(--text-muted)',
      margin: 0
    }
  }, "Unesite broj dana GO i datum od kojeg se ra\u010Duna za svakog radnika.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '0.4rem'
    }
  }, sortedWorkers.filter(w => w.status === 'aktivan').map(w => {
    const kv = getKvota(w.id);
    const goUsed = (godisnji[w.id] || []).filter(e => e.date && e.type === 'Godišnji odmor' && (!kv.datumOd || e.date >= kv.datumOd)).length;
    const rem = kv.dana - goUsed;
    const cat = getCatById(w.category);
    return /*#__PURE__*/React.createElement("div", {
      key: w.id,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.5rem 0.75rem',
        background: 'var(--surface)',
        border: `1px solid ${cat?.border || 'var(--border)'}`,
        borderLeft: `4px solid ${cat?.color || '#999'}`,
        borderRadius: 6,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 160,
        flex: '1 1 160px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        fontSize: '0.82rem',
        color: cat?.color || 'var(--text)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, w.name)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem'
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
        whiteSpace: 'nowrap'
      }
    }, "Dana GO:"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "0",
      max: "60",
      value: kv.dana || '',
      placeholder: "0",
      onChange: e => setWorkerKvota(w.id, parseInt(e.target.value) || 0, kv.datumOd || ''),
      style: {
        width: 50,
        textAlign: 'center',
        border: '1px solid #c0d4e8',
        borderRadius: 4,
        padding: '0.3rem',
        fontSize: '0.82rem',
        fontFamily: 'var(--mono)',
        fontWeight: 700,
        color: '#1a3d5c',
        background: 'white'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem'
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
        whiteSpace: 'nowrap'
      }
    }, "Od datuma:"), /*#__PURE__*/React.createElement("input", {
      type: "date",
      value: kv.datumOd || '',
      onChange: e => setWorkerKvota(w.id, kv.dana || 0, e.target.value),
      style: {
        border: '1px solid #c0d4e8',
        borderRadius: 4,
        padding: '0.3rem 0.4rem',
        fontSize: '0.78rem',
        fontFamily: 'var(--mono)',
        color: '#1a3d5c',
        background: 'white'
      }
    })), kv.dana > 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
        marginLeft: 'auto'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '0.75rem',
        fontWeight: 700,
        borderRadius: 4,
        padding: '0.2rem 0.5rem',
        background: rem < 0 ? '#fde8e8' : rem < 7 ? '#fff3e0' : '#e4edf5',
        color: rem < 0 ? '#8b2020' : rem < 7 ? '#e65100' : '#1a3d5c',
        border: `1px solid ${rem < 0 ? '#e0a0a0' : rem < 7 ? '#f0c060' : '#9bbfd9'}`
      }
    }, rem, "/", kv.dana, " preostalo"), goUsed > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.68rem',
        color: 'var(--text-muted)',
        fontFamily: 'var(--mono)'
      }
    }, "(", goUsed, " iskori\u0161teno)"), rem >= 0 && rem < 7 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.7rem',
        color: '#e65100',
        fontWeight: 600
      }
    }, "Malo!"), rem < 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.7rem',
        color: '#8b2020',
        fontWeight: 600
      }
    }, "Prekora\u010Deno!")) : /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.72rem',
        color: 'var(--text-light)',
        fontStyle: 'italic',
        marginLeft: 'auto'
      }
    }, "Nije postavljeno"));
  }))), cellPicker && (() => {
    const pickerWorker = workers.find(w => w.id === cellPicker.workerId);
    const cat = getCatById(pickerWorker?.category);
    const catColor = cat?.color || '#2d5a27';
    const existing = workerDayMap[cellPicker.workerId]?.[cellPicker.date];
    const hasManual = !!sihtManual[cellPicker.workerId]?.[cellPicker.date];
    const RADNI = [{
      type: 'Teren',
      label: '🌲 Teren',
      bg: catColor,
      color: 'white'
    }, {
      type: 'Kancelarija',
      label: '🏢 Kancelarija',
      bg: '#4a7a8a',
      color: 'white'
    }, {
      type: 'Primka',
      label: '📋 Primka',
      bg: '#b5620a',
      color: 'white'
    }, {
      type: 'Otprema',
      label: '🚛 Otprema',
      bg: '#6b3080',
      color: 'white'
    }, {
      type: 'Prerada',
      label: '🪚 Prerada',
      bg: '#5a3d00',
      color: 'white'
    }, {
      type: 'Pošumljavanje',
      label: '🌱 Pošumljavanje',
      bg: '#1a5a2d',
      color: 'white'
    }, {
      type: 'Doznaka stabala',
      label: '🪵 Doznaka stabala',
      bg: '#7a3b00',
      color: 'white'
    }, {
      type: 'Kiša',
      label: '🌧️ Kiša',
      bg: '#607d8b',
      color: 'white'
    }, {
      type: 'Farbanje sjekačkih linija',
      label: '🎨 Farbanje sj.linija',
      bg: '#8b6914',
      color: 'white'
    }, {
      type: 'Sektor ekologije',
      label: '♻️ Sektor ekologije',
      bg: '#2e7d32',
      color: 'white'
    }, {
      type: 'Ostalo',
      label: '📎 Ostalo',
      bg: '#757575',
      color: 'white'
    }];
    const ODSUTNI = ODSUTNOST_TYPES.map(t => ({
      type: t,
      label: `${ODSUTNOST_COLOR[t].icon} ${t}`,
      ...ODSUTNOST_COLOR[t]
    }));
    // Position picker: clamp to viewport
    const pickerW = 240;
    const pickerX = Math.min(cellPicker.x, window.innerWidth - pickerW - 8);
    const pickerY = cellPicker.y + 4;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'fixed',
        inset: 0,
        zIndex: 3000
      },
      onClick: () => setCellPicker(null)
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'fixed',
        left: pickerX,
        top: pickerY,
        width: pickerW,
        background: 'white',
        borderRadius: 8,
        boxShadow: '0 4px 24px rgba(0,0,0,0.22)',
        border: '1px solid var(--border)',
        maxHeight: 'calc(100vh - 40px)',
        overflowY: 'auto',
        zIndex: 3001
      },
      onClick: e => e.stopPropagation()
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: catColor,
        color: 'white',
        padding: '0.4rem 0.75rem',
        fontSize: '0.75rem',
        fontWeight: 700,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", null, pickerWorker?.name, " \xB7 ", cellPicker.date.slice(8), ".", cellPicker.date.slice(5, 7), "."), /*#__PURE__*/React.createElement("button", {
      onClick: () => setCellPicker(null),
      style: {
        background: 'none',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        fontSize: '1rem',
        lineHeight: 1,
        padding: 0
      }
    }, "\u2715")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0.3rem 0.5rem 0.1rem',
        fontSize: '0.6rem',
        fontWeight: 700,
        color: 'var(--text-muted)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase'
      }
    }, "Radni dan"), RADNI.map(opt => /*#__PURE__*/React.createElement("button", {
      key: opt.type,
      onClick: () => setManualCell(cellPicker.workerId, cellPicker.date, opt.type),
      style: {
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '0.35rem 0.75rem',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.82rem',
        background: existing?.type === 'rad' && existing?.jobType === opt.type ? opt.bg : 'white',
        color: existing?.type === 'rad' && existing?.jobType === opt.type ? opt.color : 'var(--text)',
        fontWeight: existing?.type === 'rad' && existing?.jobType === opt.type ? 700 : 400
      }
    }, opt.label)), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0.3rem 0.5rem 0.1rem',
        fontSize: '0.6rem',
        fontWeight: 700,
        color: 'var(--text-muted)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        borderTop: '1px solid var(--border)',
        marginTop: '0.15rem'
      }
    }, "Odsutnost"), ODSUTNI.map(opt => /*#__PURE__*/React.createElement("button", {
      key: opt.type,
      onClick: () => setManualCell(cellPicker.workerId, cellPicker.date, opt.type),
      style: {
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '0.35rem 0.75rem',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.82rem',
        background: existing?.type === 'odsutnost' && existing?.oType === opt.type ? opt.bg : 'white',
        color: existing?.type === 'odsutnost' && existing?.oType === opt.type ? opt.color : 'var(--text)',
        fontWeight: existing?.type === 'odsutnost' && existing?.oType === opt.type ? 700 : 400
      }
    }, opt.label)), (hasManual || existing) && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: '1px solid var(--border)',
        margin: '0.1rem 0'
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: () => setManualCell(cellPicker.workerId, cellPicker.date, null),
      style: {
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '0.35rem 0.75rem',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.82rem',
        color: 'var(--red)',
        background: 'white'
      }
    }, "\uD83D\uDDD1\uFE0F Ukloni ru\u010Dni unos"))));
  })(), goModal && /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: e => e.target === e.currentTarget && setGoModal(null)
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    style: {
      maxWidth: 400
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header"
  }, /*#__PURE__*/React.createElement("span", null, "GO"), /*#__PURE__*/React.createElement("div", {
    className: "modal-title"
  }, "Dodaj odsutnost \u2014 ", workers.find(w => w.id === goModal.workerId)?.name), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-icon",
    onClick: () => setGoModal(null)
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "modal-body"
  }, (() => {
    const wId = goModal.workerId;
    const kv = getKvota(wId);
    const goUsed = (godisnji[wId] || []).filter(e => e.date && e.type === 'Godišnji odmor' && (!kv.datumOd || e.date >= kv.datumOd)).length;
    const goRemaining = kv.dana - goUsed;
    return kv.dana > 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '0.6rem',
        padding: '0.4rem 0.6rem',
        borderRadius: 6,
        background: goRemaining < 0 ? '#fde8e8' : goRemaining < 7 ? '#fff3e0' : '#e4edf5',
        border: `1px solid ${goRemaining < 0 ? '#e0a0a0' : goRemaining < 7 ? '#f0c060' : '#9bbfd9'}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.8rem',
        fontWeight: 700,
        fontFamily: 'var(--mono)',
        color: '#1a3d5c'
      }
    }, "GO"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '0.78rem',
        fontWeight: 700,
        color: goRemaining < 0 ? '#8b2020' : goRemaining < 7 ? '#e65100' : '#1a3d5c'
      }
    }, "GO: ", goRemaining, "/", kv.dana, " preostalo"), goRemaining < 7 && goRemaining >= 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.7rem',
        color: '#e65100',
        fontWeight: 600,
        marginLeft: 'auto'
      }
    }, "Malo preostalo!"), goRemaining < 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.7rem',
        color: '#8b2020',
        fontWeight: 600,
        marginLeft: 'auto'
      }
    }, "Prekora\u010Deno!")), kv.datumOd && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.65rem',
        color: 'var(--text-muted)',
        marginTop: '0.15rem',
        fontFamily: 'var(--mono)'
      }
    }, "Ra\u010Duna se od: ", fmtDate(kv.datumOd))) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        marginBottom: '0.6rem',
        padding: '0.3rem 0.6rem',
        borderRadius: 6,
        background: '#f8f8f6',
        border: '1px solid var(--border)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.72rem',
        color: 'var(--text-light)'
      }
    }, "GO kvota nije postavljena \u2014"), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        const v = prompt('Unesite broj dana GO po ugovoru:');
        if (v) setWorkerKvota(wId, parseInt(v) || 0, new Date().toISOString().slice(0, 10));
      },
      style: {
        fontSize: '0.7rem',
        color: '#1a3d5c',
        background: '#e4edf5',
        border: '1px solid #9bbfd9',
        borderRadius: 4,
        padding: '0.15rem 0.4rem',
        cursor: 'pointer',
        fontWeight: 600
      }
    }, "Postavi"));
  })(), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.5rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Od *"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "form-input",
    value: goForm.date,
    onChange: e => setGoForm(f => ({
      ...f,
      date: e.target.value,
      dateDo: f.dateDo && f.dateDo < e.target.value ? e.target.value : f.dateDo
    }))
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Do ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-light)',
      fontWeight: 400
    }
  }, "(opciono)")), /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "form-input",
    value: goForm.dateDo,
    min: goForm.date || undefined,
    onChange: e => setGoForm(f => ({
      ...f,
      dateDo: e.target.value
    }))
  }))), goForm.date && !goForm.dateDo && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.75rem',
      color: '#b5620a',
      marginTop: '-0.3rem',
      marginBottom: '0.3rem',
      fontStyle: 'italic'
    }
  }, "Bez krajnjeg datuma \u2014 odsutnost ostaje otvorena dok se ne zaklju\u010Di"), goForm.date && goForm.dateDo && goForm.dateDo >= goForm.date && (() => {
    const s = new Date(goForm.date),
      e = new Date(goForm.dateDo);
    let count = 0;
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      const dw = d.getDay();
      if (dw !== 0 && dw !== 6) count++;
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        marginTop: '-0.3rem',
        marginBottom: '0.3rem'
      }
    }, count, " radni", count === 1 ? '' : count < 5 ? 'a' : 'h', " dan", count === 1 ? '' : count < 5 ? 'a' : 'a', " u periodu");
  })(), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Vrsta odsutnosti"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.4rem'
    }
  }, ODSUTNOST_TYPES.map(t => {
    const oc = ODSUTNOST_COLOR[t];
    return /*#__PURE__*/React.createElement("button", {
      key: t,
      type: "button",
      onClick: () => setGoForm(f => ({
        ...f,
        type: t
      })),
      style: {
        padding: '0.5rem 0.6rem',
        border: `2px solid ${goForm.type === t ? oc.color : oc.border}`,
        borderRadius: 6,
        background: goForm.type === t ? oc.bg : 'var(--bg)',
        color: goForm.type === t ? oc.color : 'var(--text-muted)',
        fontWeight: goForm.type === t ? 700 : 400,
        fontSize: '0.8rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        fontWeight: 700,
        fontSize: '0.7rem',
        background: oc.bg,
        color: oc.color,
        border: `1px solid ${oc.border}`,
        borderRadius: 3,
        padding: '0.05rem 0.3rem'
      }
    }, oc.short), t);
  }))), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Napomena"), /*#__PURE__*/React.createElement("input", {
    className: "form-input",
    placeholder: "npr. najava za prekosutra...",
    value: goForm.note,
    onChange: e => setGoForm(f => ({
      ...f,
      note: e.target.value
    }))
  })), (godisnji[goModal.workerId] || []).filter(e => e.open).length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fef3e0',
      border: '1px solid #f0c060',
      borderRadius: 6,
      padding: '0.6rem 0.75rem',
      marginBottom: '0.5rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: '0.62rem',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: '#b5620a',
      marginBottom: '0.4rem'
    }
  }, "Otvorene odsutnosti"), (godisnji[goModal.workerId] || []).filter(e => e.open).map(e => {
    const oc = ODSUTNOST_COLOR[e.type] || {
      bg: '#f0f0f0',
      color: '#555',
      border: '#ccc',
      short: '?'
    };
    const isClosing = closingLeave && closingLeave.entry.dateOd === e.dateOd && closingLeave.entry.type === e.type;
    return /*#__PURE__*/React.createElement("div", {
      key: e.dateOd + e.type,
      style: {
        marginBottom: '0.3rem'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.78rem'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        color: oc.color,
        background: oc.bg,
        border: `1px solid ${oc.border}`,
        borderRadius: 3,
        padding: '0.05rem 0.3rem',
        fontSize: '0.65rem',
        fontWeight: 700
      }
    }, oc.short), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        fontWeight: 600
      }
    }, fmtDate(e.dateOd)), /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#b5620a',
        fontWeight: 600
      }
    }, "\u2192 ?"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-muted)'
      }
    }, e.type), e.note && /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-light)',
        fontStyle: 'italic'
      }
    }, e.note), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setClosingLeave({
          wId: goModal.workerId,
          entry: e
        });
        setCloseDateDo('');
      },
      style: {
        marginLeft: 'auto',
        background: '#fff',
        border: '1px solid #f0c060',
        color: '#b5620a',
        cursor: 'pointer',
        fontSize: '0.65rem',
        borderRadius: 4,
        padding: '0.15rem 0.4rem',
        fontWeight: 600
      }
    }, "Zaklju\u010Di"), /*#__PURE__*/React.createElement("button", {
      onClick: () => deleteOpenLeave(goModal.workerId, e),
      style: {
        background: 'none',
        border: 'none',
        color: 'var(--red)',
        cursor: 'pointer',
        fontSize: '0.8rem'
      }
    }, "\u2715")), isClosing && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        marginTop: '0.3rem',
        padding: '0.3rem 0.5rem',
        background: '#fff',
        borderRadius: 4,
        border: '1px solid #f0c060'
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
        whiteSpace: 'nowrap'
      }
    }, "Do:"), /*#__PURE__*/React.createElement("input", {
      type: "date",
      className: "form-input",
      value: closeDateDo,
      min: e.dateOd,
      onChange: ev => setCloseDateDo(ev.target.value),
      style: {
        fontSize: '0.75rem',
        padding: '0.2rem 0.4rem',
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("button", {
      disabled: !closeDateDo,
      onClick: () => {
        closeOpenLeave(goModal.workerId, e, closeDateDo);
        setClosingLeave(null);
      },
      style: {
        background: '#2e7d32',
        color: '#fff',
        border: 'none',
        borderRadius: 4,
        padding: '0.2rem 0.5rem',
        fontSize: '0.7rem',
        fontWeight: 600,
        cursor: closeDateDo ? 'pointer' : 'default',
        opacity: closeDateDo ? 1 : 0.5
      }
    }, "OK"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setClosingLeave(null),
      style: {
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        fontSize: '0.75rem'
      }
    }, "\u2715")));
  })), (godisnji[goModal.workerId] || []).filter(e => e.date && e.date >= today()).length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--bg)',
      border: '1px solid var(--border)',
      borderRadius: 6,
      padding: '0.6rem 0.75rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: '0.62rem',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--text-light)',
      marginBottom: '0.4rem'
    }
  }, "Planirane odsutnosti"), (godisnji[goModal.workerId] || []).filter(e => e.date && e.date >= today()).sort((a, b) => a.date.localeCompare(b.date)).map(e => {
    const oc = ODSUTNOST_COLOR[e.type] || {
      bg: '#f0f0f0',
      color: '#555',
      border: '#ccc',
      short: '?'
    };
    return /*#__PURE__*/React.createElement("div", {
      key: e.date,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.78rem',
        marginBottom: '0.2rem'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        color: oc.color,
        background: oc.bg,
        border: `1px solid ${oc.border}`,
        borderRadius: 3,
        padding: '0.05rem 0.3rem',
        fontSize: '0.65rem',
        fontWeight: 700
      }
    }, oc.short), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--mono)',
        fontWeight: 600
      }
    }, fmtDate(e.date)), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-muted)'
      }
    }, e.type), e.note && /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-light)',
        fontStyle: 'italic'
      }
    }, e.note), /*#__PURE__*/React.createElement("button", {
      onClick: () => deleteGodisnji(goModal.workerId, e.date),
      style: {
        marginLeft: 'auto',
        background: 'none',
        border: 'none',
        color: 'var(--red)',
        cursor: 'pointer',
        fontSize: '0.8rem'
      }
    }, "\u2715"));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal-footer"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary",
    onClick: () => setGoModal(null)
  }, "Odustani"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: saveGodisnji
  }, "Sa\u010Duvaj")))));
}
// ─── RASPORED KAMIONA (dnevna otprema) ─────────────────────────────────────────
function fallbackCopyToClipboard(text, onDone, onFail) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    onDone();
  } catch (e) {
    onFail();
  }
  document.body.removeChild(ta);
}

// Odjel se piše lokalno dok korisnik kuca; u globalni raspored (koji odmah
// premješta red u novu grupu po odjelu) upisuje se tek na blur/Enter — inače
// bi svaki taster premjestio red u drugu tabelu i input bi izgubio fokus.
function OdjelInput(_ref46) {
  let {
    value,
    onCommit
  } = _ref46;
  const [local, setLocal] = useState(value);
  useEffect(() => {
    setLocal(value);
  }, [value]);
  return /*#__PURE__*/React.createElement("input", {
    className: "form-input",
    list: "odjel-list-kamioni",
    value: local,
    placeholder: "npr. RISOVAC KRUPA 54",
    onChange: e => setLocal(e.target.value),
    onBlur: () => {
      if (local !== value) onCommit(local);
    },
    onKeyDown: e => {
      if (e.key === 'Enter') e.target.blur();
    }
  });
}

// Ključ za mapu otpremača po odjelu — [datum, odjelKey] kao JSON string (stabilan, bez kolizija na separatoru)
const otpremaciKey = (date, odjelKey) => JSON.stringify([date, odjelKey]);

// Normalizovano poređenje imena kupca — ručni unos ("asim komerc ") mora naći
// dispoziciju kupca "ASIM KOMERC" iz DISPOZICIJE sistema.
const normKupac = s => (s || '').trim().toUpperCase();

// Escape za slobodan tekst (odjel, kupac) koji se ubacuje u print HTML
const escHtml = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Prijedlog kupca za red: rangirana lista + dropdown svih kupaca, ili ručni unos
// za kupca koji još ne postoji u DISPOZICIJE sistemu (dispozicija stiže naknadno).
function PrijedlogCell(_ref47) {
  let {
    row,
    suggestions,
    suggestions2,
    kupci,
    onSetKupac
  } = _ref47;
  const [manualMode, setManualMode] = useState(false);
  const [manualText, setManualText] = useState('');
  if (!row.sortiment) return /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-light)'
    }
  }, "\u2014");
  if (row.kupac) {
    return /*#__PURE__*/React.createElement("select", {
      className: "form-select",
      value: row.kupac,
      onChange: e => onSetKupac(e.target.value),
      style: {
        fontWeight: 700,
        color: 'var(--green)',
        borderColor: 'var(--green)'
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "\u2014 ukloni odabir \u2014"), !kupci.some(k => normKupac(k) === normKupac(row.kupac)) && /*#__PURE__*/React.createElement("option", {
      value: row.kupac
    }, row.kupac, " (bez dispozicije)"), kupci.map(k => /*#__PURE__*/React.createElement("option", {
      key: k,
      value: k
    }, k)));
  }
  if (manualMode) {
    const commit = () => {
      if (!manualText.trim()) return;
      // Velika slova — imena kupaca u DISPOZICIJE sistemu su velikim slovima,
      // pa naknadno uplaćena dispozicija odmah matchira ovaj unos.
      onSetKupac(manualText.trim().toUpperCase());
      setManualMode(false);
      setManualText('');
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: '0.3rem'
      }
    }, /*#__PURE__*/React.createElement("input", {
      className: "form-input",
      autoFocus: true,
      value: manualText,
      placeholder: "Ime kupca...",
      onChange: e => setManualText(e.target.value),
      onKeyDown: e => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') {
          setManualMode(false);
          setManualText('');
        }
      }
    }), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-primary btn-sm no-print",
      onClick: commit
    }, "\u2713"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-ghost btn-sm no-print",
      onClick: () => {
        setManualMode(false);
        setManualText('');
      }
    }, "\u2715"));
  }
  return /*#__PURE__*/React.createElement("div", null, suggestions.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '0.35rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.66rem',
      fontWeight: 700,
      color: 'var(--text-light)',
      letterSpacing: '0.03em',
      marginBottom: '0.1rem'
    }
  }, "PRIJEDLOG \xB7 najstarija dispozicija"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.15rem',
      maxHeight: 170,
      overflowY: 'auto'
    }
  }, suggestions.map((s, idx) => /*#__PURE__*/React.createElement("button", {
    key: s.disp.id || s.disp.kupac,
    type: "button",
    onClick: () => onSetKupac(s.disp.kupac),
    className: "btn btn-ghost btn-sm no-print",
    title: "Klikni da odabere\u0161 ovog kupca",
    style: {
      justifyContent: 'flex-start',
      textAlign: 'left',
      padding: '0.15rem 0.4rem',
      fontWeight: 500,
      background: 'transparent',
      color: 'var(--text)',
      fontSize: '0.74rem',
      lineHeight: 1.35,
      whiteSpace: 'normal',
      height: 'auto'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--mono)',
      color: 'var(--text-light)',
      marginRight: 4
    }
  }, idx + 1, "."), /*#__PURE__*/React.createElement("strong", null, s.disp.kupac), " \u2014 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: balanceColor(s.bal),
      fontWeight: 700
    }
  }, s.bal.toFixed(2), " m\xB3"), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, "(", fmtDate(s.disp.datum), ")"))))), suggestions2 && suggestions2.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '0.35rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.66rem',
      fontWeight: 700,
      color: 'var(--text-light)',
      letterSpacing: '0.03em',
      marginBottom: '0.1rem'
    }
  }, "PRIJEDLOG 2 \xB7 najdu\u017Ee nije bio na otpremi"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.15rem',
      maxHeight: 170,
      overflowY: 'auto'
    }
  }, suggestions2.map((s, idx) => /*#__PURE__*/React.createElement("button", {
    key: 'p2-' + (s.disp.id || s.disp.kupac),
    type: "button",
    onClick: () => onSetKupac(s.disp.kupac),
    className: "btn btn-ghost btn-sm no-print",
    title: "Klikni da odabere\u0161 ovog kupca",
    style: {
      justifyContent: 'flex-start',
      textAlign: 'left',
      padding: '0.15rem 0.4rem',
      fontWeight: 500,
      background: 'transparent',
      color: 'var(--text)',
      fontSize: '0.74rem',
      lineHeight: 1.35,
      whiteSpace: 'normal',
      height: 'auto'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--mono)',
      color: 'var(--text-light)',
      marginRight: 4
    }
  }, idx + 1, "."), /*#__PURE__*/React.createElement("strong", null, s.disp.kupac), " \u2014 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: balanceColor(s.bal),
      fontWeight: 700
    }
  }, s.bal.toFixed(2), " m\xB3"), ' ', /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, "(", s.lastOtprema ? `zadnja otprema ${fmtDate(s.lastOtprema)}` : 'nikad na otpremi', ")"))))), /*#__PURE__*/React.createElement("select", {
    className: "form-select no-print",
    value: "",
    onChange: e => {
      if (e.target.value) onSetKupac(e.target.value);
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, suggestions.length > 0 ? '— ili odaberi bilo kojeg kupca —' : '— odaberi kupca —'), kupci.map(k => /*#__PURE__*/React.createElement("option", {
    key: k,
    value: k
  }, k))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-ghost btn-sm no-print",
    style: {
      marginTop: '0.25rem',
      fontSize: '0.7rem',
      padding: '0.15rem 0.4rem',
      color: 'var(--text-muted)'
    },
    onClick: () => setManualMode(true)
  }, "\u270F\uFE0F Dodaj bez dispozicije (novi kupac)"));
}

// Boja preostalog stanja dispozicije: jarko crveno <25m³, zeleno >100m³, žuto (amber) između
const BALANCE_LOW_RED = '#ff0000';
function balanceColor(bal) {
  if (bal < 25) return BALANCE_LOW_RED;
  if (bal > 100) return 'var(--green)';
  return 'var(--amber)';
}
const balanceCssClass = bal => bal < 25 ? 'low' : bal > 100 ? 'ok' : 'mid';
// Iste boje kao balanceColor(), ali kao konkretni hex — canvas ne razumije var(--x).
const balanceColorHex = bal => bal < 25 ? '#ff0000' : bal > 100 ? '#2d5a27' : '#b5620a';

// Fiksna boja po sortimentu (isti sortiment = ista boja svugdje) — koristi se u slici
// rasporeda da se sortimenti razlikuju na prvi pogled.
const SORTIMENT_COLORS = {
  tc: {
    bg: '#dcefdd',
    text: '#1b5e20'
  },
  rud: {
    bg: '#e6ddd6',
    text: '#4e342e'
  },
  cd: {
    bg: '#dbe9fb',
    text: '#0d47a1'
  },
  cc: {
    bg: '#d6eef5',
    text: '#01579b'
  },
  tl: {
    bg: '#ffe7c2',
    text: '#e65100'
  },
  fl: {
    bg: '#fbdad0',
    text: '#bf360c'
  },
  oc: {
    bg: '#ecdcf3',
    text: '#4a148c'
  },
  od: {
    bg: '#fbd6e3',
    text: '#880e4f'
  }
};

// Skrati tekst sa "…" ako ne staje u dati max. razmak (canvas ne prelama tekst sam).
function fitText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + '…').width > maxWidth) t = t.slice(0, -1);
  return t + '…';
}
function canvasRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Nacrta cijeli raspored dana kao obojenu, preglednu tabelu na canvasu — za slanje
// poslovođama kao SLIKU (umjesto teksta) na Viber/WhatsApp, gdje se boje i lakše čitaju.
function buildScheduleCanvas(_ref48) {
  let {
    selectedDate,
    groups,
    findDispForKupac,
    dispUsageMap
  } = _ref48;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const padX = 20,
    padY = 20;
  const tableW = 660;
  const width = tableW + padX * 2;
  const rowH = 46,
    groupHeaderH = 34,
    tableHeadH = 26,
    titleH = 42,
    groupGap = 14,
    footerH = 26;
  let contentH = titleH;
  groups.forEach(g => {
    contentH += groupHeaderH + tableHeadH + g.rows.length * rowH + groupGap;
  });
  contentH += footerH;
  const height = contentH + padY * 2;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#f5f2ec';
  ctx.fillRect(0, 0, width, height);
  let y = padY;
  ctx.fillStyle = '#2d5a27';
  ctx.font = '700 19px Arial, sans-serif';
  ctx.fillText(`🚚 Raspored kamiona — ${fmtDate(selectedDate)}`, padX, y);
  y += titleH;
  const colX = {
    sortiment: padX,
    kupac: padX + 110,
    disp: padX + 110 + 210,
    stanje: padX + 110 + 210 + 180
  };
  const colW = {
    sortiment: 110,
    kupac: 210,
    disp: 180,
    stanje: tableW - (110 + 210 + 180)
  };
  groups.forEach(g => {
    ctx.fillStyle = '#2d5a27';
    canvasRoundRect(ctx, padX, y, tableW, groupHeaderH, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 13px Arial, sans-serif';
    const groupLabel = `📍 ${g.label}` + (g.otpremaci.length ? `   👷 ${g.otpremaci.join(', ')}` : '');
    ctx.fillText(fitText(ctx, groupLabel, tableW - 20), padX + 10, y + 10);
    y += groupHeaderH;
    ctx.fillStyle = '#e8e4da';
    ctx.fillRect(padX, y, tableW, tableHeadH);
    ctx.fillStyle = '#6b6459';
    ctx.font = '700 10px Arial, sans-serif';
    ctx.fillText('SORTIMENT', colX.sortiment + 8, y + 8);
    ctx.fillText('KUPAC', colX.kupac + 8, y + 8);
    ctx.fillText('DISPOZICIJA', colX.disp + 8, y + 8);
    ctx.fillText('STANJE', colX.stanje + 8, y + 8);
    y += tableHeadH;
    g.rows.forEach((r, i) => {
      const found = findDispForKupac(r.kupac, r.sortiment);
      ctx.fillStyle = i % 2 ? '#fbfaf7' : '#ffffff';
      ctx.fillRect(padX, y, tableW, rowH);
      if (r.sortiment) {
        const sc = SORTIMENT_COLORS[r.sortiment] || {
          bg: '#eee',
          text: '#333'
        };
        ctx.fillStyle = sc.bg;
        canvasRoundRect(ctx, colX.sortiment + 6, y + 8, colW.sortiment - 16, rowH - 16, 10);
        ctx.fill();
        ctx.fillStyle = sc.text;
        ctx.font = '700 11px Arial, sans-serif';
        ctx.fillText(fitText(ctx, SORTIMENT_LABELS[r.sortiment] || '', colW.sortiment - 28), colX.sortiment + 14, y + rowH / 2 - 6);
      }
      ctx.fillStyle = r.kupac ? '#1a1714' : '#9e9589';
      ctx.font = r.kupac ? '700 13px Arial, sans-serif' : 'italic 12px Arial, sans-serif';
      ctx.fillText(fitText(ctx, r.kupac || 'nije dodijeljen', colW.kupac - 16), colX.kupac + 8, y + rowH / 2 - 7);
      ctx.font = '400 11px Arial, sans-serif';
      if (found) {
        ctx.fillStyle = '#1a1714';
        ctx.fillText(fitText(ctx, found.disp.broj || '—', colW.disp - 16), colX.disp + 8, y + 7);
        ctx.fillStyle = '#6b6459';
        ctx.fillText(fitText(ctx, `${found.disp.ugovor || '—'} · ${fmtDate(found.disp.datum)}`, colW.disp - 16), colX.disp + 8, y + 23);
      } else if (r.kupac) {
        ctx.fillStyle = '#b5620a';
        ctx.font = 'italic 11px Arial, sans-serif';
        ctx.fillText('u obradi', colX.disp + 8, y + 15);
      } else {
        ctx.fillStyle = '#9e9589';
        ctx.fillText('—', colX.disp + 8, y + 15);
      }
      if (found) {
        ctx.fillStyle = balanceColorHex(found.bal);
        ctx.font = '700 14px Arial, sans-serif';
        ctx.fillText(`${found.bal.toFixed(2)} m³`, colX.stanje + 8, y + 7);
        if (dispUsageMap[found.disp.id] > 1) {
          ctx.fillStyle = '#b5620a';
          ctx.font = '600 9px Arial, sans-serif';
          ctx.fillText(fitText(ctx, `⚠ dijeli ${dispUsageMap[found.disp.id]}×`, colW.stanje - 16), colX.stanje + 8, y + 25);
        }
      } else {
        ctx.fillStyle = '#9e9589';
        ctx.font = '400 12px Arial, sans-serif';
        ctx.fillText('—', colX.stanje + 8, y + 15);
      }
      y += rowH;
    });
    y += groupGap;
  });
  ctx.fillStyle = '#9e9589';
  ctx.font = '400 10px Arial, sans-serif';
  ctx.fillText('Raspored Pogon Bos.Krupa', padX, y);
  return canvas;
}

// ─── PREGLED ZADNJIH 10 RADNIH DANA (admin) ───────────────────────────────────
const DAY_ABBR = ['NED', 'PON', 'UTO', 'SRI', 'ČET', 'PET', 'SUB'];

// Zadnjih n radnih dana (bez subote/nedjelje) zaključno sa endStr — najnoviji prvi
function lastWorkingDays(n, endStr) {
  const days = [];
  const d = new Date(endStr + 'T00:00:00');
  while (days.length < n) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) days.push(ymdLocal(d));
    d.setDate(d.getDate() - 1);
  }
  return days;
}
const recTotalM3 = o => SORTIMENT_FIELDS.reduce((s, f) => s + (o[f] || 0), 0);

// Paleta boja za razlikovanje kupaca — dodjeljuje se po redoslijedu pojavljivanja
// (unutar tabele/sortimenta), NE globalno po imenu kupca, tako da dva kupca koja se
// vide jedan pored drugog (npr. u istom sortimentu) uvijek dobiju najudaljenije,
// najkontrastnije boje iz palete.
const KUPAC_COLORS = [{
  bg: '#e4edf5',
  text: '#1a3d5c'
},
// plava
{
  bg: '#fdf0e0',
  text: '#b5620a'
},
// amber
{
  bg: '#f0e8f5',
  text: '#6b3080'
},
// ljubičasta
{
  bg: '#e6f5ea',
  text: '#1a5a2d'
},
// tamnozelena
{
  bg: '#e8eaf6',
  text: '#3949ab'
},
// indigo
{
  bg: '#e0ecf5',
  text: '#1565c0'
},
// nebo plava
{
  bg: '#fff3e0',
  text: '#c05e00'
},
// narandžasta
{
  bg: '#fce4ec',
  text: '#ad1457'
},
// roze
{
  bg: '#e0f2f1',
  text: '#00695c'
},
// tirkiz
{
  bg: '#f3e5f5',
  text: '#7b1fa2'
},
// violet
{
  bg: '#efebe9',
  text: '#5d4037'
},
// smeđa
{
  bg: '#e8f5e9',
  text: '#33691e'
} // maslinasta
];
function Zadnjih10DanaPanel(_ref49) {
  let {
    otpreme,
    ready
  } = _ref49;
  const anchor = today();
  const days = useMemo(() => lastWorkingDays(10, anchor), [anchor]); // najnoviji prvi
  const daysSet = useMemo(() => new Set(days), [days]);
  const rows = useMemo(() => (otpreme || []).filter(o => o.datum && daysSet.has(o.datum)), [otpreme, daysSet]);
  const stats = useMemo(() => {
    const kupci = new Set();
    let m3 = 0;
    rows.forEach(o => {
      if (o.kupac) kupci.add(o.kupac);
      m3 += recTotalM3(o);
    });
    return {
      otprema: rows.length,
      m3,
      kupci: kupci.size
    };
  }, [rows]);
  const perDay = useMemo(() => [...days].reverse().map(dt => {
    const dRows = rows.filter(o => o.datum === dt);
    return {
      date: dt,
      count: dRows.length,
      m3: dRows.reduce((s, o) => s + recTotalM3(o), 0)
    };
  }), [days, rows]); // hronološki (najstariji lijevo)

  // Sortimenti koji se uopšte pojavljuju u posljednjih 10 radnih dana — prazne
  // kolone (sortiment bez ijedne otpreme) se ne prikazuju u tabeli po kupcima.
  const activeSortiments = useMemo(() => SORTIMENT_FIELDS.filter(f => rows.some(o => (o[f] || 0) > 0)), [rows]);
  const perKupac = useMemo(() => {
    const map = {};
    rows.forEach(o => {
      const k = o.kupac || '—';
      if (!map[k]) map[k] = {
        kupac: k,
        count: 0,
        m3: 0
      };
      map[k].count++;
      map[k].m3 += recTotalM3(o);
    });
    return Object.values(map).sort((a, b) => b.count - a.count || b.m3 - a.m3);
  }, [rows]);

  // Zadnjih 10 radnih dana (bez današnjeg — otprema tog dana još nije završena) —
  // "ko je bio na otpremi a ko nije" prikaz. Najsvježiji dan je krajnje lijevo.
  const recentDaysChrono = useMemo(() => days.filter(d => d !== anchor), [days, anchor]); // najnoviji lijevo
  const recentPeriodLabel = recentDaysChrono.length ? `${fmtDate(recentDaysChrono[recentDaysChrono.length - 1])} – ${fmtDate(recentDaysChrono[0])}` : '';
  const attendance = useMemo(() => {
    const recentSet = new Set(recentDaysChrono);
    const map = {};
    rows.forEach(o => {
      if (!recentSet.has(o.datum)) return;
      const k = o.kupac || '—';
      if (!map[k]) map[k] = {};
      if (!map[k][o.datum]) map[k][o.datum] = {
        count: 0,
        m3: 0,
        bySortiment: {}
      };
      map[k][o.datum].count++;
      map[k][o.datum].m3 += recTotalM3(o);
      SORTIMENT_FIELDS.forEach(f => {
        const v = o[f] || 0;
        if (v > 0) map[k][o.datum].bySortiment[f] = (map[k][o.datum].bySortiment[f] || 0) + v;
      });
    });
    return map;
  }, [rows, recentDaysChrono]);
  const attendanceKupci = useMemo(() => [...perKupac].sort((a, b) => {
    const aRecent = recentDaysChrono.some(dt => attendance[a.kupac]?.[dt]);
    const bRecent = recentDaysChrono.some(dt => attendance[b.kupac]?.[dt]);
    if (aRecent !== bRecent) return aRecent ? -1 : 1;
    return b.count - a.count;
  }), [perKupac, attendance, recentDaysChrono]);

  // Po sortimentu → po danu (najsvježiji prvi) → spisak kupaca koji su tog dana otpremili taj sortiment.
  const bySortimentDay = useMemo(() => {
    const result = {};
    activeSortiments.forEach(f => {
      const byDate = {};
      rows.forEach(o => {
        if (!recentDaysChrono.includes(o.datum)) return;
        const v = o[f] || 0;
        if (v <= 0) return;
        if (!byDate[o.datum]) byDate[o.datum] = [];
        byDate[o.datum].push({
          kupac: o.kupac || '—',
          m3: v
        });
      });
      result[f] = recentDaysChrono.filter(dt => byDate[dt]).map(dt => ({
        date: dt,
        kupci: byDate[dt].sort((a, b) => b.m3 - a.m3)
      }));
    });
    return result;
  }, [rows, recentDaysChrono, activeSortiments]);
  const periodLabel = `${fmtDate(days[days.length - 1])} – ${fmtDate(days[0])}`;
  const handlePrintPregled = () => {
    let html = `<html><head><meta charset="UTF-8"/><title>Otprema zadnjih 10 dana</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      @page{size:A4 landscape;margin:10mm}
      body{font-family:Arial,sans-serif;font-size:10.5pt;padding:8mm;color:#222}
      h1{font-size:15pt;margin-bottom:1mm;text-align:center}
      h2{font-size:11pt;margin:5mm 0 1.5mm}
      .subtitle{font-size:10pt;text-align:center;color:#555;margin-bottom:5mm}
      table{border-collapse:collapse;width:100%;margin-bottom:2mm}
      th{background:#e8f0e6;border:1px solid #999;padding:1.2mm 2.5mm;text-align:left;font-size:8.5pt;font-weight:700}
      td{border:1px solid #bbb;padding:1.2mm 2.5mm;font-size:9pt}
      td.num,th.num{text-align:right}
      tr.total td{font-weight:700;background:#f3f1ea}
    </style></head><body>`;
    html += `<h1>OTPREMA — ZADNJIH 10 RADNIH DANA</h1>`;
    html += `<div class="subtitle">Šumarija Bosanska Krupa · ${periodLabel} · Ukupno ${stats.otprema} otprema · ${stats.m3.toFixed(2)} m³</div>`;
    html += `<h2>Ko je bio na otpremi — ${recentPeriodLabel}</h2><table><thead><tr><th>Kupac</th>${recentDaysChrono.map(dt => {
      const dow = new Date(dt + 'T00:00:00').getDay();
      return `<th class="num">${DAY_ABBR[dow]}<br>${dt.slice(5).split('-').reverse().join('.')}</th>`;
    }).join('')}</tr></thead><tbody>`;
    attendanceKupci.forEach(k => {
      html += `<tr><td>${escHtml(k.kupac)}</td>${recentDaysChrono.map(dt => {
        const cell = attendance[k.kupac]?.[dt];
        return `<td class="num">${cell ? '✓ ' + cell.m3.toFixed(0) + 'm³' : '—'}</td>`;
      }).join('')}</tr>`;
    });
    html += `</tbody></table>`;
    html += `<h2>Razrada po sortimentu — ${recentPeriodLabel}</h2>`;
    activeSortiments.forEach(f => {
      html += `<h2 style="font-size:10pt;margin-top:3mm">${SORTIMENT_LABELS[f]}</h2>`;
      if (bySortimentDay[f].length === 0) {
        html += `<div style="font-size:9pt;color:#888;margin-bottom:2mm">Nema otprema u ovom periodu.</div>`;
      } else {
        html += `<table><thead><tr><th style="width:18%">Datum</th><th>Kupci</th></tr></thead><tbody>`;
        bySortimentDay[f].forEach(d => {
          html += `<tr><td>${fmtDate(d.date)}</td><td>${d.kupci.map(k => `${escHtml(k.kupac)} (${k.m3.toFixed(1)}m³)`).join(', ')}</td></tr>`;
        });
        html += `</tbody></table>`;
      }
    });
    html += `</body></html>`;
    const win = window.open('', '_blank');
    if (!win) {
      showToast('Preglednik je blokirao prozor za štampu — dozvolite pop-up prozore.', 'error');
      return;
    }
    win.document.write(html);
    win.document.close();
    win.onload = () => {
      win.print();
    };
  };
  const tdBase = {
    padding: '0.45rem 0.7rem',
    borderBottom: '1px solid #ece9e2',
    fontSize: '0.83rem'
  };
  const headTh = {
    padding: '0.5rem 0.7rem',
    background: '#f0ede6',
    fontFamily: 'var(--mono)',
    fontSize: '0.62rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    borderBottom: '1px solid var(--border)',
    fontWeight: 600,
    whiteSpace: 'nowrap'
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "section-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, "\uD83D\uDCCA Otprema \u2014 zadnjih 10 radnih dana"), /*#__PURE__*/React.createElement("span", {
    className: "tag"
  }, periodLabel), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm no-print",
    style: {
      marginLeft: 'auto'
    },
    onClick: handlePrintPregled
  }, "\uD83D\uDDA8\uFE0F \u0160tampaj")), !ready ? /*#__PURE__*/React.createElement("div", {
    className: "alert alert-warning"
  }, "\u26A1 Povezivanje sa sistemom dispozicija u toku \u2014 podaci o otpremama \u0107e se pojaviti \u010Dim se u\u010Ditaju.") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "stats-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-value"
  }, stats.otprema), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, "Otprema (kamiona)")), /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-value"
  }, stats.m3.toFixed(0)), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, "Ukupno m\xB3")), /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-value"
  }, stats.kupci), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, "Kupaca"))), rows.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, /*#__PURE__*/React.createElement("span", {
    className: "icon"
  }, "\uD83D\uDCED"), /*#__PURE__*/React.createElement("p", null, "Nema evidentiranih otprema u zadnjih 10 radnih dana."))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card-title"
  }, "\uD83D\uDCC5 Otprema po danima")), /*#__PURE__*/React.createElement("div", {
    className: "card-body",
    style: {
      display: 'flex',
      gap: '0.5rem',
      overflowX: 'auto',
      paddingBottom: '0.75rem'
    }
  }, perDay.map(d => {
    const dow = new Date(d.date + 'T00:00:00').getDay();
    return /*#__PURE__*/React.createElement("div", {
      key: d.date,
      style: {
        flex: '1 0 90px',
        minWidth: 90,
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '0.5rem 0.6rem',
        textAlign: 'center',
        background: d.count ? 'var(--surface)' : 'var(--bg)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '0.6rem',
        letterSpacing: '0.06em',
        color: 'var(--text-light)'
      }
    }, DAY_ABBR[dow]), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.72rem',
        fontWeight: 600,
        color: 'var(--text-muted)',
        marginBottom: '0.3rem'
      }
    }, d.date.slice(5).split('-').reverse().join('.')), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: '1.1rem',
        fontWeight: 700,
        color: d.count ? 'var(--green)' : 'var(--text-light)'
      }
    }, d.m3 > 0 ? d.m3.toFixed(0) : '—'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.62rem',
        color: 'var(--text-light)'
      }
    }, "m\xB3 \xB7 ", d.count, " otp."));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card-title"
  }, "\uD83D\uDC65 Ko je bio na otpremi"), /*#__PURE__*/React.createElement("span", {
    className: "tag"
  }, recentPeriodLabel)), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: 480
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      ...headTh,
      textAlign: 'left',
      position: 'sticky',
      left: 0,
      background: '#f0ede6',
      zIndex: 1
    }
  }, "Kupac"), recentDaysChrono.map(dt => {
    const dow = new Date(dt + 'T00:00:00').getDay();
    return /*#__PURE__*/React.createElement("th", {
      key: dt,
      style: {
        ...headTh,
        textAlign: 'center',
        minWidth: 52
      }
    }, DAY_ABBR[dow], /*#__PURE__*/React.createElement("br", null), dt.slice(5).split('-').reverse().join('.'));
  }))), /*#__PURE__*/React.createElement("tbody", null, attendanceKupci.map((k, i) => {
    const kc = KUPAC_COLORS[i % KUPAC_COLORS.length];
    return /*#__PURE__*/React.createElement("tr", {
      key: k.kupac,
      style: {
        background: i % 2 ? '#fafaf6' : 'transparent'
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        ...tdBase,
        fontWeight: 600,
        position: 'sticky',
        left: 0,
        background: i % 2 ? '#fafaf6' : 'var(--surface)',
        zIndex: 1,
        whiteSpace: 'nowrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: kc.text,
        flexShrink: 0
      }
    }), k.kupac)), recentDaysChrono.map(dt => {
      const cell = attendance[k.kupac]?.[dt];
      return /*#__PURE__*/React.createElement("td", {
        key: dt,
        style: {
          ...tdBase,
          textAlign: 'center',
          padding: '0.3rem',
          background: cell ? 'var(--green-pale)' : undefined
        }
      }, cell ? /*#__PURE__*/React.createElement("div", {
        style: {
          lineHeight: 1.15
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          color: 'var(--green)',
          fontWeight: 700,
          fontSize: '0.9rem'
        }
      }, "\u2713"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '0.66rem',
          color: 'var(--green)',
          fontFamily: 'var(--mono)'
        }
      }, cell.m3.toFixed(0), "m\xB3")) : /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--border-dark)'
        }
      }, "\xB7"));
    }));
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0.4rem 0.75rem',
      fontSize: '0.7rem',
      color: 'var(--text-light)',
      borderTop: '1px solid var(--border)'
    }
  }, "\u2713 = bio na otpremi tog dana (m\xB3 = ukupno). Koji sortiment \u2014 vidi razradu ispod.")), /*#__PURE__*/React.createElement("div", {
    className: "section-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, "\uD83C\uDF32 Razrada po sortimentu"), /*#__PURE__*/React.createElement("span", {
    className: "tag"
  }, recentPeriodLabel)), activeSortiments.map(f => {
    const totalM3 = bySortimentDay[f].reduce((s, d) => s + d.kupci.reduce((ss, k) => ss + k.m3, 0), 0);
    const totalOtp = bySortimentDay[f].reduce((s, d) => s + d.kupci.length, 0);
    // Boje se dodjeljuju po redoslijedu pojavljivanja unutar OVOG sortimenta
    // (ne globalno po kupcu) — tako susjedni kupci u istoj kartici uvijek
    // dobiju maksimalno različite boje iz palete, bez obzira šta se desi
    // u drugim sortimentima.
    const sortimentKupacColors = {};
    let colorIdx = 0;
    bySortimentDay[f].forEach(d => d.kupci.forEach(k => {
      if (!(k.kupac in sortimentKupacColors)) {
        sortimentKupacColors[k.kupac] = KUPAC_COLORS[colorIdx % KUPAC_COLORS.length];
        colorIdx++;
      }
    }));
    return /*#__PURE__*/React.createElement("div", {
      className: "card",
      key: f
    }, /*#__PURE__*/React.createElement("div", {
      className: "card-header",
      style: {
        background: 'var(--green-pale)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "card-title",
      style: {
        color: 'var(--green)'
      }
    }, SORTIMENT_LABELS[f]), /*#__PURE__*/React.createElement("span", {
      className: "tag",
      style: {
        background: 'var(--surface)'
      }
    }, totalOtp, " otp. \xB7 ", totalM3.toFixed(0), " m\xB3")), /*#__PURE__*/React.createElement("div", {
      className: "card-body",
      style: {
        padding: 0
      }
    }, bySortimentDay[f].length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--text-light)',
        fontSize: '0.85rem',
        fontStyle: 'italic',
        padding: '0.75rem 1rem'
      }
    }, "Nema otprema u ovom periodu.") : bySortimentDay[f].map((d, di) => {
      const dow = new Date(d.date + 'T00:00:00').getDay();
      return /*#__PURE__*/React.createElement("div", {
        key: d.date,
        style: {
          display: 'grid',
          gridTemplateColumns: '96px 1fr',
          gap: '0.6rem',
          alignItems: 'center',
          padding: '0.55rem 1rem',
          borderTop: di ? '1px solid #ece9e2' : undefined
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--mono)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          fontWeight: 600,
          lineHeight: 1.2
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--text-light)',
          fontSize: '0.62rem',
          letterSpacing: '0.04em'
        }
      }, DAY_ABBR[dow]), /*#__PURE__*/React.createElement("br", null), d.date.slice(5).split('-').reverse().join('.')), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.35rem'
        }
      }, d.kupci.map((k, i) => {
        const c = sortimentKupacColors[k.kupac];
        return /*#__PURE__*/React.createElement("span", {
          key: i,
          style: {
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: '0.35rem',
            background: c.bg,
            border: `1px solid ${c.text}66`,
            borderRadius: 20,
            padding: '0.15rem 0.65rem',
            fontSize: '0.8rem'
          }
        }, /*#__PURE__*/React.createElement("strong", {
          style: {
            color: c.text
          }
        }, k.kupac), /*#__PURE__*/React.createElement("span", {
          style: {
            color: c.text,
            fontWeight: 700,
            fontFamily: 'var(--mono)',
            fontSize: '0.75rem',
            opacity: 0.85
          }
        }, k.m3.toFixed(0), "m\xB3"));
      })));
    })));
  }))));
}

// Zbirni broj kamiona po sortimentu za dati skup redova (za brzi pregled obima posla)
function sortimentSummary(rows) {
  const counts = {};
  rows.forEach(r => {
    if (r.sortiment) counts[r.sortiment] = (counts[r.sortiment] || 0) + 1;
  });
  return SORTIMENT_FIELDS.filter(f => counts[f] > 0).map(f => ({
    code: f,
    label: SORTIMENT_LABELS[f],
    count: counts[f]
  }));
}
function SortimentSummaryLine(_ref50) {
  let {
    rows
  } = _ref50;
  if (rows.length === 0) return null;
  const summary = sortimentSummary(rows);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.8rem',
      color: 'var(--text-muted)',
      marginBottom: '0.9rem'
    }
  }, "\uD83E\uDDFE Ukupno ", rows.length, " ", rows.length === 1 ? 'kamion' : 'kamiona', " \u2014 ", summary.map(s => `${s.count} ${s.label}`).join(', '));
}

// ─── STANJE NA DAN — poslovođa prijavi broj kamiona po sortimentu za odjel;
// svaki prijavljeni kamion odmah postaje (nedodijeljen) red u Raspored kamiona ────
function StanjeNaDanPanel(_ref51) {
  let {
    selectedDate,
    dayRows,
    onSubmit,
    onDeleteRow
  } = _ref51;
  const [odjel, setOdjel] = useState('');
  const [counts, setCounts] = useState({});
  const parseCount = v => Math.max(0, parseInt(v, 10) || 0);
  const totalCount = SORTIMENT_FIELDS.reduce((s, f) => s + parseCount(counts[f]), 0);
  const submit = () => {
    if (!odjel.trim()) {
      showToast('Unesite odjel!', 'error');
      return;
    }
    if (totalCount === 0) {
      showToast('Unesite broj kamiona za bar jedan sortiment!', 'error');
      return;
    }
    const trimmed = odjel.trim();
    const existing = dayRows.filter(r => (r.odjel || '').trim() === trimmed).length;
    if (existing > 0) {
      const ok = confirm(`Već postoji ${existing} ${existing === 1 ? 'kamion' : 'kamiona'} prijavljeno za "${trimmed}" danas. Dodati još ${totalCount}?`);
      if (!ok) return;
    }
    const parsedCounts = Object.fromEntries(SORTIMENT_FIELDS.map(f => [f, parseCount(counts[f])]));
    const n = onSubmit(trimmed, parsedCounts);
    showToast(`Prijavljeno ${n} ${n === 1 ? 'kamion' : 'kamiona'} za ${trimmed}!`, 'success');
    setOdjel('');
    setCounts({});
  };
  const grouped = useMemo(() => {
    const order = [];
    const map = {};
    dayRows.forEach(r => {
      const key = (r.odjel || '').trim() || '__BEZ_ODJELA__';
      if (!map[key]) {
        map[key] = [];
        order.push(key);
      }
      map[key].push(r);
    });
    return order.map(key => ({
      key,
      label: key === '__BEZ_ODJELA__' ? 'Bez odjela' : key,
      rows: map[key]
    }));
  }, [dayRows]);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card-title"
  }, "\uD83D\uDCDD Prijavi stanje za ", fmtDate(selectedDate))), /*#__PURE__*/React.createElement("div", {
    className: "card-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Odjel *"), /*#__PURE__*/React.createElement("input", {
    className: "form-input",
    list: "odjel-list-kamioni",
    value: odjel,
    placeholder: "npr. RISOVAC KRUPA 54",
    onChange: e => setOdjel(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
      gap: '0.6rem',
      marginBottom: '0.9rem'
    }
  }, SORTIMENT_FIELDS.map(f => /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    key: f,
    style: {
      marginBottom: 0
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, SORTIMENT_LABELS[f]), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "0",
    className: "form-input",
    value: counts[f] || '',
    placeholder: "0",
    onChange: e => setCounts(c => ({
      ...c,
      [f]: e.target.value
    }))
  })))), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: submit
  }, "\uD83D\uDCBE Prijavi stanje (", totalCount, " ", totalCount === 1 ? 'kamion' : 'kamiona', ")"))), /*#__PURE__*/React.createElement("div", {
    className: "section-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, "Prijavljeno za ", fmtDate(selectedDate)), /*#__PURE__*/React.createElement("span", {
    className: "tag"
  }, dayRows.length, " kamiona")), /*#__PURE__*/React.createElement(SortimentSummaryLine, {
    rows: dayRows
  }), grouped.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, /*#__PURE__*/React.createElement("span", {
    className: "icon"
  }, "\uD83D\uDCDD"), /*#__PURE__*/React.createElement("p", null, "Jo\u0161 ni\u0161ta nije prijavljeno za ovaj dan."))) : grouped.map(g => /*#__PURE__*/React.createElement("div", {
    className: "card",
    key: g.key
  }, /*#__PURE__*/React.createElement("div", {
    className: "dept-header"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDFD5\uFE0F"), /*#__PURE__*/React.createElement("span", {
    className: "dept-name"
  }, g.label), /*#__PURE__*/React.createElement("span", {
    className: "dept-count"
  }, g.rows.length, " ", g.rows.length === 1 ? 'kamion' : 'kamiona')), /*#__PURE__*/React.createElement("table", {
    className: "schedule-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Sortiment"), /*#__PURE__*/React.createElement("th", null, "Kupac"), /*#__PURE__*/React.createElement("th", {
    className: "no-print"
  }, "Akcije"))), /*#__PURE__*/React.createElement("tbody", null, g.rows.map(r => /*#__PURE__*/React.createElement("tr", {
    key: r.id
  }, /*#__PURE__*/React.createElement("td", {
    "data-label": "Sortiment"
  }, SORTIMENT_LABELS[r.sortiment] || '—'), /*#__PURE__*/React.createElement("td", {
    "data-label": "Kupac"
  }, r.kupac || /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-light)',
      fontStyle: 'italic'
    }
  }, "nedodijeljen")), /*#__PURE__*/React.createElement("td", {
    "data-label": "Akcije",
    className: "no-print"
  }, !r.kupac && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-danger btn-icon btn-sm",
    onClick: () => onDeleteRow(r.id)
  }, "\uD83D\uDDD1\uFE0F")))))))));
}
function RasporedKamionaView(_ref52) {
  let {
    truckRows,
    setTruckRows,
    workers,
    truckGroupOtpremaci,
    setTruckGroupOtpremaci,
    isPoslovodja,
    currentUser
  } = _ref52;
  const dispData = useDispozicijeData();
  const dispozicije = dispData.dispozicije || [];
  const otpreme = dispData.otpreme || [];
  const otpremaciList = useMemo(() => (workers || []).filter(w => w.category === 'otpremac' && w.status === 'aktivan').sort((a, b) => a.name.localeCompare(b.name)), [workers]);
  const wName = id => (workers || []).find(w => w.id === id)?.name || id;
  const [selectedDate, setSelectedDate] = useState(nextWorkingDay());
  const [subTab, setSubTab] = useState(isPoslovodja ? 'stanje' : 'raspored');

  // Ako PWA ostane otvorena preko noći, "sljedeći radni dan" izračunat pri
  // otvaranju zastari. Pri povratku u aplikaciju (fokus/vidljivost) osvježi
  // datum na novi "sljedeći radni dan" — ali samo ako ga korisnik u međuvremenu
  // nije ručno promijenio (eksplicitan flag, ne poređenje vrijednosti — updater
  // funkcije u setState moraju biti čiste, bez sporednih efekata poput mutacije refa).
  const userChangedDateRef = useRef(false);
  useEffect(() => {
    const refreshDate = () => {
      if (userChangedDateRef.current) return;
      setSelectedDate(nextWorkingDay());
    };
    document.addEventListener('visibilitychange', refreshDate);
    window.addEventListener('focus', refreshDate);
    return () => {
      document.removeEventListener('visibilitychange', refreshDate);
      window.removeEventListener('focus', refreshDate);
    };
  }, []);
  const dayRows = useMemo(() => truckRows.filter(r => r.date === selectedDate), [truckRows, selectedDate]);
  const unassignedCount = useMemo(() => dayRows.filter(r => !r.kupac).length, [dayRows]);
  const kupci = useMemo(() => [...new Set(dispozicije.map(d => d.kupac).filter(Boolean))].sort(), [dispozicije]);

  // Pamti sve prethodno unesene odjele (bilo kojeg dana) za autocomplete
  const odjeliList = useMemo(() => [...new Set(truckRows.map(r => r.odjel).filter(Boolean))].sort(), [truckRows]);

  // Najstarija dispozicija ODABRANOG kupca sa pozitivnim stanjem za odabrani sortiment
  const findDispForKupac = (kupac, sortiment) => {
    if (!kupac || !sortiment) return null;
    const nk = normKupac(kupac);
    const candidates = dispozicije.filter(d => normKupac(d.kupac) === nk).map(d => ({
      disp: d,
      bal: getDispBalance(d, otpreme)[sortiment]
    })).filter(x => x.bal > 0).sort((a, b) => (a.disp.datum || '').localeCompare(b.disp.datum || ''));
    return candidates[0] || null;
  };

  // Auto-prijedlog: do 10 kupaca (jedan po kupcu, najstarija dispozicija) sa stanjem >= 20m³, poredano po starosti
  const findSuggestions = sortiment => {
    if (!sortiment) return [];
    const candidates = dispozicije.map(d => ({
      disp: d,
      bal: getDispBalance(d, otpreme)[sortiment]
    })).filter(x => x.bal >= 20).sort((a, b) => (a.disp.datum || '').localeCompare(b.disp.datum || ''));
    const seen = new Set();
    const result = [];
    for (const c of candidates) {
      if (seen.has(c.disp.kupac)) continue;
      seen.add(c.disp.kupac);
      result.push(c);
      if (result.length >= 10) break;
    }
    return result;
  };

  // Auto-prijedlog 2: isti kandidati (stanje >= 20m³ za odabrani sortiment), ali poredani po
  // tome koliko dugo kupac STVARNO nije bio na otpremi (bilo koji sortiment) — kupci koji
  // nikad nisu evidentirani na otpremi imaju najveći prioritet, zatim najstarija zadnja otprema.
  // Ovo je drugačiji signal od prve liste (koja gleda samo starost dispozicije): kupac može
  // imati staru dispoziciju, a ipak biti nedavno na otpremi (druga dispozicija/kamion), i obrnuto.
  const findSuggestions2 = sortiment => {
    if (!sortiment) return [];
    const lastOtpremaByKupac = {};
    (otpreme || []).forEach(o => {
      if (!o.kupac || !o.datum) return;
      const nk = normKupac(o.kupac);
      if (!lastOtpremaByKupac[nk] || o.datum > lastOtpremaByKupac[nk]) lastOtpremaByKupac[nk] = o.datum;
    });
    const candidates = dispozicije.map(d => ({
      disp: d,
      bal: getDispBalance(d, otpreme)[sortiment]
    })).filter(x => x.bal >= 20).sort((a, b) => (a.disp.datum || '').localeCompare(b.disp.datum || ''));
    const seen = new Set();
    const result = [];
    for (const c of candidates) {
      if (seen.has(c.disp.kupac)) continue;
      seen.add(c.disp.kupac);
      result.push({
        ...c,
        lastOtprema: lastOtpremaByKupac[normKupac(c.disp.kupac)] || null
      });
    }
    result.sort((a, b) => {
      if (!a.lastOtprema && !b.lastOtprema) return 0;
      if (!a.lastOtprema) return -1;
      if (!b.lastOtprema) return 1;
      return a.lastOtprema.localeCompare(b.lastOtprema);
    });
    return result.slice(0, 10);
  };

  // Vizuelno grupiši redove trenutnog dana po odjelu (isti obrazac kao ScheduleView)
  const groupedDayRows = useMemo(() => {
    const order = [];
    const map = {};
    dayRows.forEach(r => {
      const key = (r.odjel || '').trim() || '__BEZ_ODJELA__';
      if (!map[key]) {
        map[key] = [];
        order.push(key);
      }
      map[key].push(r);
    });
    return order.map(key => ({
      key,
      label: key === '__BEZ_ODJELA__' ? 'Bez odjela' : key,
      rows: map[key]
    }));
  }, [dayRows]);

  // Koliko puta je ista KONKRETNA dispozicija već iskorištena za druge kamione istog dana —
  // stanje u DISPOZICIJE sistemu pada tek kad se otprema stvarno evidentira tamo, pa dva
  // kamiona istog dana mogu "vidjeti" isti (još neumanjeni) balans iste dispozicije.
  const dispUsageMap = useMemo(() => {
    const usage = {};
    dayRows.forEach(r => {
      const f = findDispForKupac(r.kupac, r.sortiment);
      if (f) usage[f.disp.id] = (usage[f.disp.id] || 0) + 1;
    });
    return usage;
  }, [dayRows, dispozicije, otpreme]);
  const addOtpremac = (odjelKey, workerId) => {
    const key = otpremaciKey(selectedDate, odjelKey);
    setTruckGroupOtpremaci(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), workerId]
    }));
  };
  const removeOtpremac = (odjelKey, workerId) => {
    const key = otpremaciKey(selectedDate, odjelKey);
    setTruckGroupOtpremaci(prev => ({
      ...prev,
      [key]: (prev[key] || []).filter(id => id !== workerId)
    }));
  };
  const addRow = () => {
    setTruckRows(prev => [...prev, {
      id: uid(),
      date: selectedDate,
      odjel: '',
      sortiment: '',
      kupac: '',
      createdAt: Date.now()
    }]);
  };
  const updateRow = (id, patch) => setTruckRows(prev => prev.map(r => r.id === id ? {
    ...r,
    ...patch
  } : r));
  const deleteRow = id => {
    if (confirm('Obrisati ovaj red?')) setTruckRows(prev => prev.filter(r => r.id !== id));
  };

  // Promjena odjela na redu: ako je to bio zadnji red stare grupe (npr. ispravka
  // tipfelera), dodijeljeni otpremači prate red u novu grupu umjesto da nestanu.
  const commitOdjel = (row, newVal) => {
    const oldKey = (row.odjel || '').trim() || '__BEZ_ODJELA__';
    const newKey = (newVal || '').trim() || '__BEZ_ODJELA__';
    updateRow(row.id, {
      odjel: newVal
    });
    if (oldKey === newKey) return;
    const othersInOldGroup = dayRows.some(r => r.id !== row.id && ((r.odjel || '').trim() || '__BEZ_ODJELA__') === oldKey);
    if (othersInOldGroup) return;
    const oldStorageKey = otpremaciKey(selectedDate, oldKey);
    const newStorageKey = otpremaciKey(selectedDate, newKey);
    setTruckGroupOtpremaci(prev => {
      const moving = prev[oldStorageKey] || [];
      if (moving.length === 0) return prev;
      const next = {
        ...prev,
        [newStorageKey]: [...new Set([...(prev[newStorageKey] || []), ...moving])]
      };
      delete next[oldStorageKey];
      return next;
    });
  };

  // Stanje na dan: poslovođa prijavi broj kamiona po sortimentu za odjel —
  // za svaki kamion se odmah kreira nedodijeljen red u Raspored kamiona.
  const addBulkRows = (odjel, counts) => {
    const newRows = [];
    SORTIMENT_FIELDS.forEach(f => {
      const n = counts[f] || 0;
      for (let i = 0; i < n; i++) {
        newRows.push({
          id: uid(),
          date: selectedDate,
          odjel,
          sortiment: f,
          kupac: '',
          createdAt: Date.now(),
          reportedBy: currentUser || ''
        });
      }
    });
    if (newRows.length > 0) setTruckRows(prev => [...prev, ...newRows]);
    return newRows.length;
  };

  // Isti obrazac grupisanja kao groupedDayRows — koristi se za print/kopiraj/podijeli
  const groupByOdjel = rows => {
    const order = [];
    const map = {};
    rows.forEach(r => {
      const key = (r.odjel || '').trim() || '__BEZ_ODJELA__';
      if (!map[key]) {
        map[key] = [];
        order.push(key);
      }
      map[key].push(r);
    });
    return order.map(key => ({
      key,
      label: key === '__BEZ_ODJELA__' ? 'Bez odjela' : key,
      rows: map[key],
      otpremaci: (truckGroupOtpremaci[otpremaciKey(selectedDate, key)] || []).map(wName)
    }));
  };
  const handlePrint = () => {
    let html = `<html><head><meta charset="UTF-8"/><title>Raspored kamiona ${fmtDate(selectedDate)}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      @page{size:A4 landscape;margin:10mm}
      body{font-family:Arial,sans-serif;font-size:11pt;padding:8mm;color:#222}
      h1{font-size:16pt;margin-bottom:2mm;text-align:center}
      .subtitle{font-size:11pt;text-align:center;color:#555;margin-bottom:6mm}
      table{border-collapse:collapse;width:100%}
      th{background:#e8f0e6;border:1px solid #999;padding:1.5mm 3mm;text-align:left;font-size:9pt;font-weight:700}
      td{border:1px solid #bbb;padding:1.5mm 3mm;font-size:9.5pt;vertical-align:top}
      .warn{color:#8b2020;font-style:italic}
      .pending{color:#999;font-style:italic}
      .ok{color:#2d5a27;font-weight:700}
      .mid{color:#b5620a;font-weight:700}
      .low{color:#ff0000;font-weight:700}
    </style></head><body>`;
    html += `<h1>RASPORED KAMIONA — ${fmtDate(selectedDate)}</h1>`;
    html += `<div class="subtitle">Šumarija Bosanska Krupa</div>`;
    html += `<table><thead><tr>
      <th style="width:15%">Odjel</th><th style="width:14%">Otpremač</th><th style="width:11%">Sortiment</th><th style="width:16%">Kupac</th>
      <th style="width:13%">Ugovor</th><th style="width:13%">Broj dispozicije</th><th style="width:9%">Stanje</th><th style="width:9%">Datum disp.</th>
    </tr></thead><tbody>`;
    groupByOdjel(dayRows).forEach(g => {
      g.rows.forEach((r, i) => {
        const found = findDispForKupac(r.kupac, r.sortiment);
        html += `<tr>`;
        if (i === 0) {
          html += `<td rowspan="${g.rows.length}"><strong>${escHtml(g.label)}</strong></td>`;
          html += `<td rowspan="${g.rows.length}">${g.otpremaci.length ? g.otpremaci.map(escHtml).join('<br>') : '—'}</td>`;
        }
        html += `<td>${SORTIMENT_LABELS[r.sortiment] || '—'}</td>`;
        html += `<td>${escHtml(r.kupac) || '—'}</td>`;
        html += `<td>${found ? escHtml(found.disp.ugovor) || '—' : '—'}</td>`;
        html += `<td>${found ? escHtml(found.disp.broj) || '—' : '—'}</td>`;
        html += found ? `<td class="${balanceCssClass(found.bal)}">${found.bal.toFixed(2)} m³${dispUsageMap[found.disp.id] > 1 ? ` <span class="mid">(dijeli ${dispUsageMap[found.disp.id]}×)</span>` : ''}</td>` : r.kupac ? `<td class="pending">u obradi</td>` : `<td>—</td>`;
        html += `<td>${found ? fmtDate(found.disp.datum) : '—'}</td>`;
        html += `</tr>`;
      });
    });
    html += `</tbody></table></body></html>`;
    const win = window.open('', '_blank');
    if (!win) {
      showToast('Preglednik je blokirao prozor za štampu — dozvolite pop-up prozore za ovu stranicu.', 'error');
      return;
    }
    win.document.write(html);
    win.document.close();
    win.onload = () => {
      win.print();
    };
  };
  const buildMessageText = () => {
    let text = `🚚 RASPORED KAMIONA – ${fmtDate(selectedDate)}\n`;
    groupByOdjel(dayRows).forEach(g => {
      text += `\n📍 ${g.label}\n`;
      if (g.otpremaci.length) text += `👷 Otpremač: ${g.otpremaci.join(', ')}\n`;
      g.rows.forEach((r, i) => {
        const found = findDispForKupac(r.kupac, r.sortiment);
        text += `${i + 1}. ${SORTIMENT_LABELS[r.sortiment] || '—'} – ${r.kupac || '—'}\n`;
        if (found) {
          const shared = dispUsageMap[found.disp.id] > 1 ? ` ⚠ dijeli ${dispUsageMap[found.disp.id]}×` : '';
          text += `   Disp: ${found.disp.broj} od ${fmtDate(found.disp.datum)} · Ugovor: ${found.disp.ugovor || '—'} · Stanje: ${found.bal.toFixed(2)} m³${shared}\n`;
        } else if (r.kupac) {
          text += `   Disp: — (u obradi)\n`;
        }
      });
    });
    return text;
  };
  const handleCopyMessage = () => {
    const text = buildMessageText();
    const onDone = () => showToast('Kopirano u međuspremnik!', 'success');
    const onFail = () => showToast('Kopiranje nije uspjelo.', 'error');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onDone).catch(() => fallbackCopyToClipboard(text, onDone, onFail));
    } else {
      fallbackCopyToClipboard(text, onDone, onFail);
    }
  };

  // Podijeli direktno na Messenger/Viber/WhatsApp — na mobitelu Web Share API otvara
  // sistemski meni sa svim instaliranim aplikacijama; na desktopu (bez podrške) šalje na WhatsApp Web.
  const handleShare = () => {
    const text = buildMessageText();
    if (navigator.share) {
      navigator.share({
        text
      }).catch(() => {});
    } else {
      const win = window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      if (!win) showToast('Preglednik je blokirao prozor — dozvolite pop-up prozore ili koristite "Kopiraj za poruku".', 'error');
    }
  };

  // Umjesto teksta — generiši obojenu, preglednu SLIKU rasporeda i podijeli je kao
  // fajl (Web Share API); ako uređaj/preglednik ne podržava dijeljenje fajlova,
  // slika se preuzme na uređaj pa je poslovođa ručno prikači u poruku.
  const handleShareImage = () => {
    const groups = groupByOdjel(dayRows);
    if (groups.length === 0) {
      showToast('Nema kamiona za ovaj dan.', 'error');
      return;
    }
    const canvas = buildScheduleCanvas({
      selectedDate,
      groups,
      findDispForKupac,
      dispUsageMap
    });
    canvas.toBlob(async blob => {
      if (!blob) {
        showToast('Greška pri generisanju slike.', 'error');
        return;
      }
      const file = new File([blob], `raspored-kamiona-${selectedDate}.png`, {
        type: 'image/png'
      });
      if (navigator.canShare && navigator.canShare({
        files: [file]
      })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Raspored kamiona',
            text: `Raspored kamiona — ${fmtDate(selectedDate)}`
          });
        } catch (e) {/* korisnik otkazao dijeljenje */}
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Slika je preuzeta na uređaj — pošaljite je ručno.', 'success');
      }
    }, 'image/png');
  };
  return /*#__PURE__*/React.createElement("div", null, subTab !== 'pregled10' && /*#__PURE__*/React.createElement("div", {
    className: "date-bar"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "date-label"
  }, "DATUM RASPOREDA"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "date-input",
    value: selectedDate,
    onChange: e => {
      userChangedDateRef.current = true;
      setSelectedDate(e.target.value);
    }
  })), subTab === 'raspored' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm no-print",
    onClick: handleCopyMessage
  }, "\uD83D\uDCCB Kopiraj za poruku"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm no-print",
    onClick: handleShare
  }, "\uD83D\uDCE4 Po\u0161alji (Viber/WhatsApp/Messenger)"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm no-print",
    onClick: handleShareImage
  }, "\uD83D\uDDBC\uFE0F Po\u0161alji sliku poslovo\u0111ama"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm no-print",
    onClick: handlePrint
  }, "\uD83D\uDDA8\uFE0F \u0160tampaj za poslovo\u0111e"), !isPoslovodja && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm no-print",
    onClick: addRow
  }, "+ Dodaj kamion"))), /*#__PURE__*/React.createElement("div", {
    className: "tabs no-print"
  }, /*#__PURE__*/React.createElement("button", {
    className: `tab ${subTab === 'raspored' ? 'active' : ''}`,
    onClick: () => setSubTab('raspored')
  }, "\uD83D\uDE9A Raspored kamiona", unassignedCount > 0 && /*#__PURE__*/React.createElement("span", {
    className: "tag",
    style: {
      marginLeft: 6,
      background: 'var(--amber-pale)',
      color: 'var(--amber)'
    }
  }, unassignedCount)), /*#__PURE__*/React.createElement("button", {
    className: `tab ${subTab === 'stanje' ? 'active' : ''}`,
    onClick: () => setSubTab('stanje')
  }, "\uD83D\uDCDD Stanje na dan"), !isPoslovodja && /*#__PURE__*/React.createElement("button", {
    className: `tab ${subTab === 'pregled10' ? 'active' : ''}`,
    onClick: () => setSubTab('pregled10')
  }, "\uD83D\uDCCA Zadnjih 10 dana")), !dispData.ready && subTab !== 'pregled10' && /*#__PURE__*/React.createElement("div", {
    className: "alert alert-warning"
  }, "\u26A1 Povezivanje sa sistemom dispozicija u toku \u2014 stanja i auto-prijedlozi \u0107e se pojaviti \u010Dim se u\u010Ditaju."), subTab === 'pregled10' && !isPoslovodja && /*#__PURE__*/React.createElement(Zadnjih10DanaPanel, {
    otpreme: otpreme,
    ready: dispData.ready
  }), subTab === 'stanje' && /*#__PURE__*/React.createElement(StanjeNaDanPanel, {
    selectedDate: selectedDate,
    dayRows: dayRows,
    onSubmit: addBulkRows,
    onDeleteRow: deleteRow
  }), subTab === 'raspored' && /*#__PURE__*/React.createElement("div", {
    ref: el => {
      if (!el) return;
      if (isPoslovodja) el.setAttribute('inert', '');else el.removeAttribute('inert');
    },
    style: isPoslovodja ? {
      pointerEvents: 'none',
      opacity: 0.6
    } : undefined
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, "\uD83D\uDE9A Raspored kamiona \u2014 ", fmtDate(selectedDate)), /*#__PURE__*/React.createElement("span", {
    className: "tag"
  }, dayRows.length, " kamiona"), unassignedCount > 0 && /*#__PURE__*/React.createElement("span", {
    className: "tag",
    style: {
      background: 'var(--amber-pale)',
      color: 'var(--amber)'
    }
  }, unassignedCount, " nedodijeljeno")), /*#__PURE__*/React.createElement(SortimentSummaryLine, {
    rows: dayRows
  }), dayRows.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, /*#__PURE__*/React.createElement("span", {
    className: "icon"
  }, "\uD83D\uDE9A"), /*#__PURE__*/React.createElement("p", null, "Nema kamiona rasporeda za ovaj dan."), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: addRow
  }, "+ Dodaj kamion"))) : groupedDayRows.map(g => {
    const metaKey = otpremaciKey(selectedDate, g.key);
    const assignedIds = truckGroupOtpremaci[metaKey] || [];
    const availableOtpremaci = otpremaciList.filter(w => !assignedIds.includes(w.id));
    const reporters = [...new Set(g.rows.map(r => r.reportedBy).filter(Boolean))];
    return /*#__PURE__*/React.createElement("div", {
      className: "card",
      key: g.key
    }, /*#__PURE__*/React.createElement("div", {
      className: "dept-header",
      style: {
        flexWrap: 'wrap',
        rowGap: '0.4rem'
      }
    }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDFD5\uFE0F"), /*#__PURE__*/React.createElement("span", {
      className: "dept-name"
    }, g.label), /*#__PURE__*/React.createElement("span", {
      className: "dept-count"
    }, g.rows.length, " ", g.rows.length === 1 ? 'kamion' : 'kamiona'), reporters.length > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.68rem',
        color: 'rgba(255,255,255,0.8)',
        fontFamily: 'var(--mono)'
      }
    }, "\uD83D\uDCDD Prijavio: ", reporters.join(', ')), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
        flexWrap: 'wrap',
        marginLeft: '0.4rem'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.65rem',
        color: 'rgba(255,255,255,0.75)',
        fontFamily: 'var(--mono)',
        letterSpacing: '0.05em'
      }
    }, "OTPREMA\u010C:"), assignedIds.map(wId => /*#__PURE__*/React.createElement("span", {
      key: wId,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: 'rgba(255,255,255,0.22)',
        color: 'white',
        padding: '0.15rem 0.55rem',
        borderRadius: 12,
        fontSize: '0.72rem',
        fontWeight: 600
      }
    }, wName(wId), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "no-print",
      onClick: () => removeOtpremac(g.key, wId),
      style: {
        background: 'none',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        padding: 0,
        fontSize: '0.9rem',
        lineHeight: 1,
        opacity: 0.8
      }
    }, "\xD7"))), assignedIds.length === 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.72rem',
        color: 'rgba(255,255,255,0.6)',
        fontStyle: 'italic'
      }
    }, "nije dodijeljen"), availableOtpremaci.length > 0 && /*#__PURE__*/React.createElement("select", {
      className: "no-print",
      value: "",
      onChange: e => {
        if (e.target.value) addOtpremac(g.key, e.target.value);
      },
      style: {
        fontSize: '0.72rem',
        padding: '0.15rem 0.4rem',
        borderRadius: 6,
        border: '1px solid rgba(255,255,255,0.4)',
        background: 'rgba(255,255,255,0.12)',
        color: 'white'
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: "",
      style: {
        color: '#222'
      }
    }, "+ Dodaj otprema\u010Da"), availableOtpremaci.map(w => /*#__PURE__*/React.createElement("option", {
      key: w.id,
      value: w.id,
      style: {
        color: '#222'
      }
    }, w.name))))), /*#__PURE__*/React.createElement("table", {
      className: "schedule-table"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Odjel"), /*#__PURE__*/React.createElement("th", null, "Sortiment"), /*#__PURE__*/React.createElement("th", null, "Prijedlog"), /*#__PURE__*/React.createElement("th", null, "Dispozicija"), /*#__PURE__*/React.createElement("th", {
      className: "no-print"
    }, "Akcije"))), /*#__PURE__*/React.createElement("tbody", null, g.rows.map(r => {
      const found = findDispForKupac(r.kupac, r.sortiment);
      const suggestions = findSuggestions(r.sortiment);
      const suggestions2 = findSuggestions2(r.sortiment);
      return /*#__PURE__*/React.createElement("tr", {
        key: r.id
      }, /*#__PURE__*/React.createElement("td", {
        "data-label": "Odjel"
      }, /*#__PURE__*/React.createElement(OdjelInput, {
        value: r.odjel,
        onCommit: val => commitOdjel(r, val)
      })), /*#__PURE__*/React.createElement("td", {
        "data-label": "Sortiment"
      }, /*#__PURE__*/React.createElement("select", {
        className: "form-select",
        value: r.sortiment,
        onChange: e => updateRow(r.id, {
          sortiment: e.target.value
        })
      }, /*#__PURE__*/React.createElement("option", {
        value: ""
      }, "\u2014 odaberi \u2014"), SORTIMENT_FIELDS.map(f => /*#__PURE__*/React.createElement("option", {
        key: f,
        value: f
      }, SORTIMENT_LABELS[f])))), /*#__PURE__*/React.createElement("td", {
        "data-label": "Prijedlog"
      }, /*#__PURE__*/React.createElement(PrijedlogCell, {
        row: r,
        suggestions: suggestions,
        suggestions2: suggestions2,
        kupci: kupci,
        onSetKupac: k => updateRow(r.id, {
          kupac: k
        })
      })), /*#__PURE__*/React.createElement("td", {
        "data-label": "Dispozicija"
      }, !r.kupac || !r.sortiment ? /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--text-light)'
        }
      }, "\u2014") : found ? /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '0.8rem'
        }
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, found.disp.broj), " \xB7 ", found.disp.ugovor || '—'), /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 700,
          color: balanceColor(found.bal)
        }
      }, found.bal.toFixed(2), " m\xB3"), /*#__PURE__*/React.createElement("div", {
        style: {
          color: 'var(--text-muted)'
        }
      }, fmtDate(found.disp.datum)), dispUsageMap[found.disp.id] > 1 && /*#__PURE__*/React.createElement("div", {
        style: {
          color: 'var(--amber)',
          fontWeight: 600,
          marginTop: '0.15rem'
        }
      }, "\u26A0 Dijeli sa jo\u0161 ", dispUsageMap[found.disp.id] - 1, " ", dispUsageMap[found.disp.id] - 1 === 1 ? 'kamionom' : 'kamiona', " danas")) : /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--text-light)',
          fontSize: '0.78rem',
          fontStyle: 'italic'
        }
      }, "\u2014 dispozicija u obradi \u2014")), /*#__PURE__*/React.createElement("td", {
        "data-label": "Akcije",
        className: "no-print"
      }, /*#__PURE__*/React.createElement("button", {
        className: "btn btn-danger btn-icon btn-sm",
        onClick: () => deleteRow(r.id)
      }, "\uD83D\uDDD1\uFE0F")));
    }))));
  })), /*#__PURE__*/React.createElement("datalist", {
    id: "odjel-list-kamioni"
  }, odjeliList.map(o => /*#__PURE__*/React.createElement("option", {
    key: o,
    value: o
  }))));
}
// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem(AUTH_SESSION_KEY) === 'true');
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem(AUTH_USER_KEY) || '');
  if (!isAuthenticated) {
    return /*#__PURE__*/React.createElement(LoginScreen, {
      onLogin: name => {
        setCurrentUser(name);
        setIsAuthenticated(true);
      }
    });
  }
  return /*#__PURE__*/React.createElement(AppMain, {
    currentUser: currentUser,
    onLogout: () => {
      localStorage.removeItem(AUTH_SESSION_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      setIsAuthenticated(false);
      setCurrentUser('');
    }
  });
}
function AppMain(_ref53) {
  let {
    onLogout,
    currentUser
  } = _ref53;
  const [workers, setWorkers] = useStorage('sumarija_workers', INITIAL_WORKERS);
  const [departments, setDepartments] = useStorage('sumarija_depts', INITIAL_DEPARTMENTS);
  const [schedules, setSchedules] = useStorage('sumarija_schedules', makeInitialSchedules());
  const [history, setHistory] = useStorage('sumarija_history', []);
  const [truckRows, setTruckRows] = useStorage('sumarija_truck_raspored', []);
  // truckGroupOtpremaci: { "[date,odjelKey]": [workerId, ...] } — otpremači dodijeljeni odjelu za dan
  const [truckGroupOtpremaci, setTruckGroupOtpremaci] = useStorage('sumarija_truck_grupa_otpremaci', {});

  // Automatsko čišćenje starih zapisa rasporeda kamiona (> 90 dana) — pokreće se
  // jednom po sesiji, tek kad Firebase/localStorage dostavi stvarne podatke (da
  // se slučajno ne obriše nešto prije nego što stigne sync sa servera).
  const truckCleanupDone = useRef(false);
  useEffect(() => {
    if (truckCleanupDone.current) return;
    if (truckRows.length === 0 && Object.keys(truckGroupOtpremaci).length === 0) return;
    truckCleanupDone.current = true;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - TRUCK_RETENTION_DAYS);
    const cutoffStr = ymdLocal(cutoff);
    if (truckRows.some(r => r.date < cutoffStr)) {
      setTruckRows(prev => prev.filter(r => r.date >= cutoffStr));
    }
    const staleMeta = Object.keys(truckGroupOtpremaci).some(key => {
      try {
        const [date] = JSON.parse(key);
        return date < cutoffStr;
      } catch (e) {
        return false;
      }
    });
    if (staleMeta) {
      setTruckGroupOtpremaci(prev => {
        const next = {};
        Object.entries(prev).forEach(_ref54 => {
          let [key, val] = _ref54;
          try {
            const [date] = JSON.parse(key);
            if (date >= cutoffStr) next[key] = val;
          } catch (e) {
            next[key] = val;
          }
        });
        return next;
      });
    }
  }, [truckRows, truckGroupOtpremaci]);

  // PWA install prompt
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) return;
    const handler = e => {
      e.preventDefault();
      setInstallPromptEvent(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    const installedHandler = () => setShowInstallBanner(false);
    window.addEventListener('appinstalled', installedHandler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);
  const handleInstallClick = async () => {
    if (!installPromptEvent) return;
    installPromptEvent.prompt();
    const {
      outcome
    } = await installPromptEvent.userChoice;
    if (outcome === 'accepted') setShowInstallBanner(false);
    setInstallPromptEvent(null);
  };
  const [activeTab, setActiveTab] = useState('raspored');
  // Mapa odjela je teška (Leaflet + 4MB geojson) — mount-uje se tek pri prvoj posjeti
  // tom tabu, a nakon toga ostaje mount-ovana (samo se sakriva/prikazuje preko CSS-a)
  // da se Leaflet instanca ne uništi/ponovo inicijalizira pri svakom prebacivanju taba.
  const [mapaLoaded, setMapaLoaded] = useState(false);
  useEffect(() => {
    if (activeTab === 'mapa') setMapaLoaded(true);
  }, [activeTab]);
  const [selectedDate, setSelectedDate] = useState(today());
  const [sidebarFilter, setSidebarFilter] = useState(null);
  const [modal, setModal] = useState(null);
  const [historyModal, setHistoryModal] = useState(null);
  const [quickModal, setQuickModal] = useState(null); // { worker }
  const [filterTab, setFilterTab] = useState('dan');
  const [filterWorker, setFilterWorker] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterJob, setFilterJob] = useState('');
  // godisnji: { workerId: [ { date, type, note } ] }
  const [godisnji, setGodisnji] = useStorage('sumarija_godisnji', {});
  // goKvota: { workerId: { dana: number, datumOd: 'YYYY-MM-DD' } } — GO po ugovoru
  const [goKvota, setGoKvota] = useStorage('sumarija_go_kvota', {});
  // vehicles: [{ id, driverId, tipVozila, registracija, brojMjesta, status:'vozno'|'popravka' }]
  const [vehicles, setVehicles] = useStorage('sumarija_vehicles', []);
  // holidays: { 'YYYY-MM-DD': 'Naziv praznika' }
  const [holidays, setHolidays] = useStorage('sumarija_holidays', {});
  const [customJobTypes, setCustomJobTypes] = useStorage('sumarija_custom_jobs', []);
  const allJobTypes = [...JOB_TYPES.filter(jt => jt !== 'Ostalo'), ...customJobTypes.filter(jt => !JOB_TYPES.includes(jt)), 'Ostalo'];
  const addHistory = (action, scheduleId, oldData, newData) => {
    const user = localStorage.getItem(AUTH_USER_KEY) || '';
    setHistory(h => [{
      id: uid(),
      timestamp: Date.now(),
      action,
      scheduleId,
      date: newData?.date || oldData?.date,
      oldData,
      newData,
      user
    }, ...h].slice(0, 200));
  };

  // Day schedules
  const daySchedules = useMemo(() => schedules.filter(s => s.date === selectedDate && (!sidebarFilter || s.deptId === sidebarFilter)), [schedules, selectedDate, sidebarFilter]);

  // Dept summary for sidebar
  const deptCounts = useMemo(() => {
    const counts = {};
    schedules.filter(s => s.date === selectedDate).forEach(s => {
      counts[s.deptId] = (counts[s.deptId] || 0) + s.allWorkers.length;
    });
    return counts;
  }, [schedules, selectedDate]);

  // Stats
  const totalToday = useMemo(() => new Set(daySchedules.flatMap(s => s.allWorkers)).size, [daySchedules]);
  const statsByJob = useMemo(() => {
    const m = {};
    daySchedules.forEach(s => {
      const jt = s.jobType === 'Priprema proizvodnje' ? 'Doznaka stabala' : s.jobType;
      if (!m[jt]) m[jt] = new Set();
      s.allWorkers.forEach(w => m[jt].add(w));
    });
    return m;
  }, [daySchedules]);
  const statsByDept = useMemo(() => {
    const m = {};
    daySchedules.forEach(s => {
      if (!m[s.deptId]) m[s.deptId] = new Set();
      s.allWorkers.forEach(w => m[s.deptId].add(w));
    });
    return m;
  }, [daySchedules]);

  // Conflict check
  const checkConflict = function (newSched) {
    let excludeId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    const conflicts = [];
    newSched.allWorkers.forEach(wId => {
      const existing = schedules.find(s => s.date === newSched.date && s.id !== excludeId && s.allWorkers.includes(wId));
      if (existing) conflicts.push(wId);
    });
    return conflicts;
  };
  const wName = id => workers.find(w => w.id === id)?.name || id;
  const dName = id => {
    const d = departments.find(d => d.id === id);
    return d ? `${d.gospodarskaJedinica} — Odjel ${d.brojOdjela}` : id;
  };

  // Save schedule
  const saveSchedule = (data, isEdit) => {
    if (!isEdit && holidays[data.date]) {
      return alert(`Nije moguće rasporediti radnika na ${data.date} — praznik: "${holidays[data.date]}"`);
    }
    if (isEdit) {
      const old = schedules.find(s => s.id === data.id);
      setSchedules(prev => prev.map(s => s.id === data.id ? data : s));
      addHistory('edit', data.id, old, data);
    } else {
      // Provjeri da li postoji isti posao + odjel za isti datum — spoji radnike
      const existing = schedules.find(s => s.date === data.date && s.jobType === data.jobType && s.deptId === data.deptId && s.deptId // ne spajaj ako nema odjela
      );
      if (existing) {
        const old = {
          ...existing
        };
        const mergedWorkers = [...new Set([...(existing.allWorkers || []), ...(data.allWorkers || [])])];
        const mergedExtra = [...new Set([...(existing.extraWorkers || []), ...(data.extraWorkers || [])])];
        const updated = {
          ...existing,
          allWorkers: mergedWorkers,
          extraWorkers: mergedExtra,
          note: [existing.note, data.note].filter(Boolean).join('; ') || '',
          kisaMode: data.kisaMode || existing.kisaMode
        };
        setSchedules(prev => prev.map(s => s.id === existing.id ? updated : s));
        addHistory('edit', existing.id, old, updated);
      } else {
        const newId = uid();
        const nd = {
          ...data,
          id: newId
        };
        setSchedules(prev => [...prev, nd]);
        addHistory('create', newId, null, nd);
      }
    }
  };
  const deleteSchedule = id => {
    const old = schedules.find(s => s.id === id);
    setSchedules(prev => prev.filter(s => s.id !== id));
    addHistory('delete', id, old, null);
  };
  const restoreVersion = histItem => {
    if (!histItem.oldData) return;
    const exists = schedules.find(s => s.id === histItem.scheduleId);
    if (exists) {
      setSchedules(prev => prev.map(s => s.id === histItem.scheduleId ? histItem.oldData : s));
    } else {
      setSchedules(prev => [...prev, histItem.oldData]);
    }
    addHistory('restore', histItem.scheduleId, exists, histItem.oldData);
    setHistoryModal(null);
  };

  // Called from SihtaricaView when a cell is manually set
  const SIHT_RAD_TYPES = JOB_TYPES;
  const sihtSave = (workerId, date, type) => {
    if (type === null) {
      // Clear: remove worker from sihtEntry row; delete row if it becomes empty
      setSchedules(prev => prev.reduce((acc, s) => {
        if (!s.sihtEntry || s.date !== date || !(s.allWorkers || []).includes(workerId)) {
          acc.push(s);
          return acc;
        }
        const remaining = (s.allWorkers || []).filter(id => id !== workerId);
        if (remaining.length > 0) acc.push({
          ...s,
          allWorkers: remaining
        });
        return acc;
      }, []));
      // Clear sihtEntry godisnji entries
      setGodisnji(prev => {
        const entries = (prev[workerId] || []).filter(e => !(e.sihtEntry && e.date === date));
        return {
          ...prev,
          [workerId]: entries
        };
      });
      return;
    }
    if (SIHT_RAD_TYPES.includes(type)) {
      // Don't create entry if worker already in a real (non-siht) schedule for this date
      const alreadyIn = schedules.some(s => s.date === date && !s.sihtEntry && (s.allWorkers || []).includes(workerId));
      if (!alreadyIn) {
        setSchedules(prev => {
          // Remove any previous sihtEntry for this worker+date (different job type)
          const withoutOld = prev.filter(s => !(s.sihtEntry && s.date === date && (s.allWorkers || []).includes(workerId)));
          // Find existing sihtEntry row for same date+jobType to merge into
          const existing = withoutOld.find(s => s.sihtEntry && s.date === date && s.jobType === type);
          if (existing) {
            return withoutOld.map(s => s.id === existing.id ? {
              ...s,
              allWorkers: [...new Set([...s.allWorkers, workerId])]
            } : s);
          }
          // No existing row — create new one
          const entry = {
            id: uid(),
            date,
            jobType: type,
            allWorkers: [workerId],
            deptId: '',
            extraWorkers: [],
            vehicleIds: [],
            note: '',
            kisaMode: 'go',
            overrides: [],
            sihtEntry: true
          };
          return [...withoutOld, entry];
        });
      }
    } else {
      // Odsutnost — add to godisnji if not already there
      const already = (godisnji[workerId] || []).some(e => e.date === date && !e.sihtEntry);
      if (!already) {
        const prev = godisnji[workerId] || [];
        const cleaned = prev.filter(e => !(e.sihtEntry && e.date === date));
        const entry = {
          id: uid(),
          date,
          type,
          note: '',
          sihtEntry: true
        };
        setGodisnji(g => ({
          ...g,
          [workerId]: [...cleaned, entry]
        }));
      }
    }
  };
  const copyFromDate = fromDate => {
    if (holidays[selectedDate]) {
      return alert(`Nije moguće kopirati raspored na ${selectedDate} — praznik: "${holidays[selectedDate]}"`);
    }
    const source = schedules.filter(s => s.date === fromDate);
    const newOnes = source.map(s => ({
      ...s,
      id: uid(),
      date: selectedDate
    }));
    setSchedules(prev => {
      const cleaned = prev.filter(s => s.date !== selectedDate);
      return [...cleaned, ...newOnes];
    });
    newOnes.forEach(s => addHistory('create', s.id, null, s));
  };
  const prevDay = () => {
    const d = new Date(selectedDate);
    do {
      d.setDate(d.getDate() - 1);
    } while (d.getDay() === 0); // skip Sunday
    setSelectedDate(d.toISOString().split('T')[0]);
  };
  const nextDay = () => {
    const d = new Date(selectedDate);
    do {
      d.setDate(d.getDate() + 1);
    } while (d.getDay() === 0); // skip Sunday
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Print
  const handlePrint = () => {
    const DANI = ['NEDJELJA', 'PONEDJELJAK', 'UTORAK', 'SRIJEDA', 'ČETVRTAK', 'PETAK', 'SUBOTA'];
    const danNaziv = DANI[new Date(selectedDate + 'T00:00:00').getDay()];
    const datumFmt = fmtDate(selectedDate);
    const allToday = schedules.filter(s => s.date === selectedDate);

    // Group by dept, then by jobType
    const byDept = {};
    allToday.forEach(s => {
      if (!byDept[s.deptId]) byDept[s.deptId] = {};
      if (!byDept[s.deptId][s.jobType]) byDept[s.deptId][s.jobType] = [];
      byDept[s.deptId][s.jobType].push(s);
    });

    // Absent workers
    const assignedIds = new Set(allToday.flatMap(s => s.allWorkers || []));
    const ODSUTNOST_STYLE = {
      'Godišnji odmor': '🏖️ GO',
      'Bolovanje': '🏥 B',
      'Slobodan dan': '☀️ SD',
      'Neplaćeno': '📋 N'
    };
    const absentList = [];
    Object.entries(godisnji || {}).forEach(_ref55 => {
      let [wId, entries] = _ref55;
      const entry = entries.find(e => e.date === selectedDate) || entries.find(e => e.open && e.dateOd && e.dateOd <= selectedDate);
      if (!entry) return;
      const w = workers.find(x => x.id === wId);
      if (!w || assignedIds.has(w.id)) return;
      absentList.push({
        name: w.name,
        type: entry.type
      });
    });
    let html = `<html><head><meta charset="UTF-8"/><title>Raspored ${datumFmt}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:Arial,sans-serif;font-size:11pt;padding:12mm;color:#222}
      h1{font-size:16pt;margin-bottom:2mm;text-align:center}
      .subtitle{font-size:11pt;text-align:center;color:#555;margin-bottom:6mm}
      .dept{margin-bottom:5mm;page-break-inside:avoid}
      .dept-name{background:#2d5a27;color:white;padding:2mm 4mm;font-weight:700;font-size:11pt;margin-bottom:0}
      table{border-collapse:collapse;width:100%;margin-bottom:1mm}
      th{background:#e8f0e6;border:1px solid #999;padding:1.5mm 3mm;text-align:left;font-size:9pt;font-weight:700}
      td{border:1px solid #bbb;padding:1.5mm 3mm;font-size:9.5pt;vertical-align:top}
      .workers{line-height:1.6}
      .worker{display:inline-block;background:#f0f0f0;border:1px solid #ccc;border-radius:3px;padding:0.5mm 2mm;margin:0.5mm;font-size:9pt}
      .absent-section{margin-top:6mm;page-break-inside:avoid}
      .absent-title{font-weight:700;font-size:11pt;border-bottom:1.5px solid #333;padding-bottom:1mm;margin-bottom:2mm}
      .absent-item{display:inline-block;background:#fde8e8;border:1px solid #daa;border-radius:3px;padding:0.5mm 2mm;margin:0.5mm;font-size:9pt}
      .vehicle-info{font-size:8.5pt;color:#555;margin-top:0.5mm}
      .summary{text-align:center;font-size:10pt;color:#444;margin-bottom:4mm}
    </style></head><body>`;
    html += `<h1>RASPORED RADNIKA — ${danNaziv}, ${datumFmt}</h1>`;
    html += `<div class="subtitle">Šumarija Bosanska Krupa</div>`;
    const totalWorkers = new Set(allToday.flatMap(s => s.allWorkers || [])).size;
    html += `<div class="summary">Ukupno raspoređeno: <strong>${totalWorkers}</strong> radnika · Odsutno: <strong>${absentList.length}</strong></div>`;
    Object.entries(byDept).forEach(_ref56 => {
      let [deptId, jobs] = _ref56;
      const deptWorkerCount = new Set(Object.values(jobs).flat().flatMap(s => s.allWorkers || [])).size;
      html += `<div class="dept">`;
      html += `<div class="dept-name">🏕️ ${dName(deptId)} — ${deptWorkerCount} radnika</div>`;
      html += `<table><thead><tr><th style="width:18%">Vrsta posla</th><th>Radnici</th><th style="width:20%">Vozilo</th><th style="width:15%">Napomena</th></tr></thead><tbody>`;
      Object.entries(jobs).forEach(_ref57 => {
        let [jobType, rows] = _ref57;
        rows.forEach(row => {
          const workerNames = (row.allWorkers || []).map(wId => wName(wId));
          const vIds = row.vehicleIds?.length ? row.vehicleIds : row.vehicleId ? [row.vehicleId] : [];
          const vehicleInfo = vIds.map(vid => {
            const v = (vehicles || []).find(x => x.id === vid);
            if (!v) return '';
            const driver = workers.find(w => w.id === (row.otherDriverId || v.driverId));
            return `🚗 ${v.registracija} (${v.tipVozila}, ${v.brojMjesta} mj.)${driver ? ' — ' + driver.name : ''}`;
          }).filter(Boolean).join('<br>');
          html += `<tr>`;
          html += `<td><strong>${jobType}</strong></td>`;
          html += `<td class="workers">${workerNames.map(n => `<span class="worker">${n}</span>`).join(' ')}<div style="font-size:8pt;color:#666;margin-top:1mm">${workerNames.length} radnika</div></td>`;
          html += `<td class="vehicle-info">${vehicleInfo || '—'}</td>`;
          html += `<td>${row.note || '—'}</td>`;
          html += `</tr>`;
        });
      });
      html += `</tbody></table></div>`;
    });
    if (absentList.length > 0) {
      html += `<div class="absent-section">`;
      html += `<div class="absent-title">Odsutni radnici (${absentList.length})</div>`;
      html += `<div>`;
      absentList.forEach(a => {
        const label = ODSUTNOST_STYLE[a.type] || a.type;
        html += `<span class="absent-item">${a.name} — ${label}</span> `;
      });
      html += `</div></div>`;
    }
    html += `</body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.onload = () => {
      win.print();
    };
  };

  // Quick assign from panel click
  const onWorkerClick = worker => setQuickModal({
    worker
  });

  // Poslovođe imaju read-only pristup cijeloj aplikaciji, osim podtaba
  // "Stanje na dan" unutar Raspored kamiona (to štiti RasporedKamionaView interno).
  const isPoslovodja = getUserRole(currentUser) === 'poslovodja';
  const readOnlyStyle = {
    pointerEvents: 'none',
    opacity: 0.6
  };
  // inert blokira i fokus/tastaturu (pointerEvents:none blokira samo miš);
  // React 18 ne poznaje inert prop pa se postavlja direktno na DOM element
  const readOnlyRef = el => {
    if (!el) return;
    if (isPoslovodja) el.setAttribute('inert', '');else el.removeAttribute('inert');
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("header", {
    className: "app-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "app-title"
  }, /*#__PURE__*/React.createElement("span", {
    className: "icon"
  }, "\uD83C\uDF32"), /*#__PURE__*/React.createElement("span", null, "Raspored Pogon Bos.Krupa"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.6rem',
      color: 'rgba(255,255,255,0.55)',
      fontFamily: 'var(--mono)',
      marginLeft: '0.1rem'
    }
  }, "v", APP_VERSION), FIREBASE_ENABLED ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.65rem',
      background: 'rgba(255,255,255,0.15)',
      padding: '0.15rem 0.5rem',
      borderRadius: 10,
      marginLeft: '0.25rem',
      fontFamily: 'var(--mono)'
    }
  }, "\uD83D\uDD34 live sync") : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.65rem',
      background: 'rgba(255,255,255,0.1)',
      padding: '0.15rem 0.5rem',
      borderRadius: 10,
      marginLeft: '0.25rem',
      fontFamily: 'var(--mono)',
      opacity: 0.6
    }
  }, "\uD83D\uDCBE lokalno")), /*#__PURE__*/React.createElement("nav", {
    className: "nav-tabs"
  }, [['raspored', '📋 Raspored'], ['kamioni', '🚚 Raspored kamiona'], ['mapa', '🗺️ Mapa odjela'], ['spisak', '📊 Spisak'], ['vozila', '🚗 Vozila'], ['radnici', '👷 Radnici'], ['sihtarica', '📄 Šihtarica'], ['odjeli', '🏕️ Odjeli'], ['pregled', '🔍 Pregled'], ['historija', '📜 Historija']].filter(_ref58 => {
    let [k] = _ref58;
    return !(isPoslovodja && (k === 'radnici' || k === 'odjeli'));
  }).map(_ref59 => {
    let [k, l] = _ref59;
    return /*#__PURE__*/React.createElement("button", {
      key: k,
      className: `nav-tab ${activeTab === k ? 'active' : ''}`,
      onClick: () => setActiveTab(k)
    }, l);
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem'
    }
  }, currentUser && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.7rem',
      fontWeight: 700,
      color: 'rgba(255,255,255,0.9)',
      background: 'rgba(255,255,255,0.15)',
      padding: '0.15rem 0.55rem',
      borderRadius: 8,
      fontFamily: 'var(--mono)',
      letterSpacing: '0.05em'
    }
  }, "\uD83D\uDC64 ", currentUser), /*#__PURE__*/React.createElement("button", {
    className: "nav-tab no-print",
    onClick: onLogout,
    title: "Odjavi se",
    style: {
      opacity: 0.7,
      fontSize: '0.75rem'
    }
  }, "\uD83D\uDD12 Odjava")))), isPoslovodja && /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fdf0e0',
      color: '#7a3b00',
      padding: '0.5rem 1rem',
      fontSize: '0.8rem',
      fontWeight: 600,
      textAlign: 'center'
    }
  }, "\uD83D\uDC41\uFE0F Prijavljeni ste kao poslovo\u0111a \u2014 pregled je samo za \u010Ditanje. Stanje kamiona prijavljujete u Raspored kamiona \u2192 podtab \"Stanje na dan\"."), showInstallBanner && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: '#2d5a27',
      color: 'white',
      padding: '0.5rem 1rem',
      gap: '0.75rem',
      flexWrap: 'wrap',
      fontSize: '0.85rem'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCF2 Instalirajte aplikaciju na ure\u0111aj za br\u017Ei pristup"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '0.5rem'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleInstallClick,
    style: {
      background: 'white',
      color: '#2d5a27',
      border: 'none',
      borderRadius: 6,
      padding: '0.3rem 0.9rem',
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: '0.85rem'
    }
  }, "Instaliraj"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowInstallBanner(false),
    style: {
      background: 'transparent',
      color: 'rgba(255,255,255,0.7)',
      border: 'none',
      borderRadius: 6,
      padding: '0.3rem 0.5rem',
      cursor: 'pointer',
      fontSize: '1rem',
      lineHeight: 1
    }
  }, "\u2715"))), /*#__PURE__*/React.createElement("div", {
    className: "app-layout"
  }, activeTab === 'raspored' && /*#__PURE__*/React.createElement("aside", {
    className: "sidebar",
    ref: readOnlyRef,
    style: isPoslovodja ? readOnlyStyle : undefined
  }, /*#__PURE__*/React.createElement("div", {
    className: "sidebar-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sidebar-label"
  }, "Raspored za dan"), /*#__PURE__*/React.createElement("button", {
    className: `sidebar-item ${!sidebarFilter ? 'active' : ''}`,
    onClick: () => setSidebarFilter(null)
  }, /*#__PURE__*/React.createElement("span", null, "Sve stavke"), /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, new Set(schedules.filter(s => s.date === selectedDate).flatMap(s => s.allWorkers)).size)), (() => {
    const todayEntries = schedules.filter(s => s.date === selectedDate);
    const grouped = {};
    todayEntries.forEach(s => {
      const key = `${s.deptId}__${s.jobType}`;
      if (!grouped[key]) grouped[key] = {
        deptId: s.deptId,
        jobType: s.jobType,
        workers: new Set()
      };
      s.allWorkers.forEach(w => grouped[key].workers.add(w));
    });
    return Object.values(grouped).map(g => /*#__PURE__*/React.createElement("button", {
      key: `${g.deptId}__${g.jobType}`,
      className: `sidebar-item ${sidebarFilter === g.deptId ? 'active' : ''}`,
      onClick: () => setSidebarFilter(g.deptId),
      style: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '0.15rem'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        gap: '0.4rem'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: jobBadgeClass(g.jobType),
      style: {
        fontSize: '0.6rem'
      }
    }, g.jobType), /*#__PURE__*/React.createElement("span", {
      className: "count",
      style: {
        marginLeft: 'auto'
      }
    }, g.workers.size)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.7rem',
        color: 'var(--text-muted)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        width: '100%'
      }
    }, dName(g.deptId))));
  })(), schedules.filter(s => s.date === selectedDate).length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0.5rem 1rem',
      fontSize: '0.78rem',
      color: 'var(--text-muted)',
      fontStyle: 'italic'
    }
  }, "Nema unosa za ovaj dan."))), /*#__PURE__*/React.createElement("main", {
    className: "main-content"
  }, /*#__PURE__*/React.createElement("div", {
    ref: el => {
      if (!el) return;
      if (isPoslovodja && activeTab !== 'kamioni') el.setAttribute('inert', '');else el.removeAttribute('inert');
    },
    style: isPoslovodja && activeTab !== 'kamioni' ? readOnlyStyle : undefined
  }, activeTab === 'raspored' && /*#__PURE__*/React.createElement(ScheduleView, {
    selectedDate: selectedDate,
    setSelectedDate: setSelectedDate,
    daySchedules: daySchedules,
    schedules: schedules,
    workers: workers,
    departments: departments,
    vehicles: vehicles,
    wName: wName,
    dName: dName,
    totalToday: totalToday,
    statsByJob: statsByJob,
    statsByDept: statsByDept,
    sidebarFilter: sidebarFilter,
    setSidebarFilter: setSidebarFilter,
    prevDay: prevDay,
    nextDay: nextDay,
    onAdd: () => setModal({
      type: 'entry',
      data: {
        date: selectedDate
      }
    }),
    onAddWithJob: jobType => setModal({
      type: 'entry',
      data: {
        date: selectedDate,
        jobType
      }
    }),
    onEdit: s => setModal({
      type: 'entry',
      data: s,
      isEdit: true
    }),
    onDelete: id => {
      if (confirm('Obrisati ovaj zapis?')) deleteSchedule(id);
    },
    onHistory: s => setHistoryModal(s),
    onAssignVehicle: (rowId, vehicleIds, otherDriverId) => {
      setSchedules(prev => prev.map(s => s.id === rowId ? {
        ...s,
        vehicleIds,
        vehicleId: vehicleIds[0] || '',
        otherDriverId: otherDriverId !== undefined ? otherDriverId : s.otherDriverId || ''
      } : s));
    },
    copyFromDate: copyFromDate,
    handlePrint: handlePrint,
    yesterday: yesterday(),
    godisnji: godisnji,
    holidays: holidays,
    onWorkerClick: onWorkerClick,
    allJobTypes: allJobTypes,
    customJobTypes: customJobTypes,
    setCustomJobTypes: setCustomJobTypes
  }), activeTab === 'radnici' && /*#__PURE__*/React.createElement(WorkersView, {
    workers: workers,
    setWorkers: setWorkers,
    schedules: schedules
  }), activeTab === 'odjeli' && /*#__PURE__*/React.createElement(DepartmentsView, {
    departments: departments,
    setDepartments: setDepartments,
    schedules: schedules,
    dName: dName
  }), activeTab === 'spisak' && /*#__PURE__*/React.createElement(SpisakView, {
    workers: workers,
    setWorkers: setWorkers,
    vehicles: vehicles
  }), activeTab === 'vozila' && /*#__PURE__*/React.createElement(VozaciView, {
    vehicles: vehicles,
    setVehicles: setVehicles,
    workers: workers
  }), activeTab === 'sihtarica' && /*#__PURE__*/React.createElement(SihtaricaView, {
    schedules: schedules,
    workers: workers,
    departments: departments,
    godisnji: godisnji,
    setGodisnji: setGodisnji,
    goKvota: goKvota,
    setGoKvota: setGoKvota,
    holidays: holidays,
    setHolidays: setHolidays,
    wName: wName,
    dName: dName,
    onSihtSave: sihtSave
  }), activeTab === 'pregled' && /*#__PURE__*/React.createElement(PregledView, {
    schedules: schedules,
    workers: workers,
    departments: departments,
    wName: wName,
    dName: dName,
    filterWorker: filterWorker,
    setFilterWorker: setFilterWorker,
    filterDept: filterDept,
    setFilterDept: setFilterDept,
    filterJob: filterJob,
    setFilterJob: setFilterJob
  }), activeTab === 'historija' && /*#__PURE__*/React.createElement(HistorijaView, {
    history: history,
    wName: wName,
    dName: dName,
    restoreVersion: restoreVersion,
    schedules: schedules
  })), activeTab === 'kamioni' && /*#__PURE__*/React.createElement(RasporedKamionaView, {
    truckRows: truckRows,
    setTruckRows: setTruckRows,
    workers: workers,
    truckGroupOtpremaci: truckGroupOtpremaci,
    setTruckGroupOtpremaci: setTruckGroupOtpremaci,
    isPoslovodja: isPoslovodja,
    currentUser: currentUser
  }), mapaLoaded && /*#__PURE__*/React.createElement("div", {
    style: {
      display: activeTab === 'mapa' ? 'block' : 'none'
    }
  }, /*#__PURE__*/React.createElement(MapaOdjelaView, {
    active: activeTab === 'mapa',
    schedules: schedules,
    departments: departments,
    workers: workers,
    vehicles: vehicles
  }))), activeTab === 'raspored' && /*#__PURE__*/React.createElement("div", {
    ref: readOnlyRef,
    style: isPoslovodja ? readOnlyStyle : undefined
  }, /*#__PURE__*/React.createElement(RightPanel, {
    selectedDate: selectedDate,
    daySchedules: daySchedules,
    schedules: schedules,
    workers: workers,
    departments: departments,
    vehicles: vehicles,
    wName: wName,
    dName: dName,
    statsByJob: statsByJob,
    statsByDept: statsByDept,
    godisnji: godisnji,
    onAdd: () => setModal({
      type: 'entry',
      data: {
        date: selectedDate
      }
    }),
    onAddWithJob: jobType => setModal({
      type: 'entry',
      data: {
        date: selectedDate,
        jobType
      }
    }),
    copyFromDate: copyFromDate,
    yesterday: yesterday(),
    onWorkerClick: onWorkerClick
  }))), activeTab === 'raspored' && !isPoslovodja && /*#__PURE__*/React.createElement("button", {
    className: "mobile-fab",
    onClick: () => setModal({
      type: 'entry',
      data: {
        date: selectedDate
      }
    })
  }, "+"), quickModal && /*#__PURE__*/React.createElement(QuickModal, {
    worker: quickModal.worker,
    workers: workers,
    departments: departments,
    setDepartments: setDepartments,
    selectedDate: selectedDate,
    schedules: schedules,
    checkConflict: checkConflict,
    vehicles: vehicles,
    allJobTypes: allJobTypes,
    onSave: d => {
      saveSchedule(d, false);
      setQuickModal(null);
    },
    onClose: () => setQuickModal(null),
    wName: wName,
    godisnji: godisnji,
    setGodisnji: setGodisnji
  }), modal?.type === 'entry' && /*#__PURE__*/React.createElement(EntryModal, {
    data: modal.data,
    isEdit: modal.isEdit,
    workers: workers,
    departments: departments,
    setDepartments: setDepartments,
    schedules: schedules,
    checkConflict: checkConflict,
    vehicles: vehicles,
    allJobTypes: allJobTypes,
    onSave: d => {
      saveSchedule(d, modal.isEdit);
      setModal(null);
    },
    onClose: () => setModal(null),
    wName: wName,
    godisnji: godisnji,
    selectedDate: selectedDate
  }), historyModal && /*#__PURE__*/React.createElement(HistoryDetailModal, {
    schedule: historyModal,
    history: history.filter(h => h.scheduleId === historyModal.id),
    workers: workers,
    wName: wName,
    dName: dName,
    restoreVersion: restoreVersion,
    onClose: () => setHistoryModal(null)
  }));
}

// ─── MAPA ODJELA — API SLOJ ─────────────────────────────────────────────────
// Tab "Mapa odjela" (18-karta-odjela.jsx / 19-MapaOdjelaView.jsx) je prenesen iz
// pogonboskrupa/sumarija i spaja se na ISTI Google Apps Script backend (primke/otpreme
// za status sječe/otpreme po odjelu, Šumarija Bosanska Krupa) — LIVE podaci, ne statična
// kopija. Taj backend traži username/password na svakom pozivu (Apps Script verifyUser),
// a Raspored-radnika ima potpuno drugačiji login (lokalni PIN po korisniku). Dogovoreno
// rješenje: dedicated nalog, ugrađen ovdje, koji svi korisnici ovog appa dijele isključivo
// za čitanje podataka za mapu — ne predstavlja login trenutno prijavljenog korisnika appa.
const MAPA_API_URL = 'https://script.google.com/macros/s/AKfycbz__4umdSqKd0o81TnDgdtHufd0FcaT-1E2oLq9pcHqfWPjVgIA9WZDz6-O4ta_fiUR/exec';
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
    const resp = await fetch(url, {
      signal: controller.signal
    });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        data,
        ts: Date.now()
      }));
    } catch (e) {}
    return data;
  } finally {
    clearTimeout(timer);
  }
}
window.fetchWithCache = fetchWithCache;
// ========================================
// js/karta-odjela.js — Mapa odjela 2026
// Preneseno iz pogonboskrupa/sumarija (branch main, js/karta-odjela.js) — samodovoljan
// vanilla JS modul, namjerno NEIZMIJENJEN (osim GEOJSON_URL niže) da se ne pokvari
// key-matching logika (_normKey/_labelKey/_baseKey — nedavno ispravljeni bugovi za
// "Prikaz otpreme" i /N pod-odsjek koliziju). Oslanja se na window.buildApiUrl /
// window.fetchWithCache (17-mapaOdjelaApi.jsx) i globalni Leaflet (L) sa CDN-a.
// ========================================
(function () {
  'use strict';

  const GEOJSON_VERSION = '20260603a';
  const GEOJSON_URL = 'https://raw.githubusercontent.com/pogonboskrupa/sumarija/main/data/odjeli.geojson';
  // ISTI ključevi kao kanonski preload primke/otpreme fetch — dijeli cache umjesto
  // da duplicira cijeli payload pod treći zaseban ključ (cache_otpreme_karta)
  const CACHE_SJECA = 'cache_primke_sjeca';
  const CACHE_OTPR = 'cache_otpreme_tab';

  // Lokacija Šumarije Bosanska Krupa — Trg Alije Izetbegovića 1
  const SUMARIJA_LATLNG = [44.883425, 16.154427];
  const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';
  // OSRM (javni demo server) računa vrijeme vožnje po opštem "car" profilu i za
  // makadamske/šumske puteve (dio ovih ruta) pretpostavlja prespore brzine — u praksi
  // (npr. do odjela 71) stvarno vrijeme je oko 55% OSRM procjene. Empirijski faktor,
  // korigovan na osnovu poznavanja terena — ne mijenja distancu (ta je geometrijski
  // tačna preko stvarne putne mreže), samo prikazano trajanje vožnje.
  const ROUTE_DURATION_FACTOR = 0.55;
  let _map = null;
  let _osmLayer = null;
  let _satLayer = null;
  let _isSat = false;
  let _layer = null;
  let _geojson = null;
  let _statusMap = new Map();
  let _slucajniSet = new Set(); // normKeys s "SLUCAJNI" u nazivu
  let _prelazniSetGlobal = new Set(); // normKeys bez plana, bez "SLUCAJNI" — prelazni
  let _allFeatures = [];
  let _mapBounds = null;
  let _routeLine = null;
  let _routeLine2 = null; // ruta odjel→odjel
  let _sumarijaMark = null;
  let _currentLatlng = null;
  let _currentOdjelLabel = null;
  let _stanjeMap = null; // normKey → { projekat:[], sortimentiNazivi:[] }
  let _odjelRutaMode = false; // da li je aktivan režim rute između odjela
  let _odjelRutaFrom = null; // { latlng, label }
  let _odjelRutaFromMark = null;

  // ---- BOJE ----
  function _getColor(status) {
    switch (status) {
      case 'posjeceno':
        return '#16a34a';
      case 'u-sjeci':
        return '#dc2626';
      case 'planirano':
        return '#eab308';
      case 'plan-2027':
        return '#2563eb';
      // plava — plan za narednu godinu
      case 'slucajni':
        return '#7c3aed';
      case 'prelazni':
        return '#0891b2';
      default:
        return '#6366f1';
    }
  }
  function _getStyle(status) {
    const c = _getColor(status);
    const noPlan = status === 'bez-plana';
    return {
      fillColor: c,
      fillOpacity: noPlan ? 0.20 : 0.55,
      color: '#1a1a1a',
      weight: noPlan ? 1.5 : 4,
      opacity: noPlan ? 1 : 0.85,
      dashArray: noPlan ? '4 4' : null
    };
  }
  function _getHoverStyle(status) {
    const c = _getColor(status);
    const noPlan = status === 'bez-plana';
    return {
      fillColor: c,
      fillOpacity: noPlan ? 0.30 : 0.8,
      color: '#000',
      weight: noPlan ? 2 : 5,
      opacity: 1
    };
  }
  // Stil u "Prikaz otpreme" režimu — zadržava boju statusa (zeleno posječeno,
  // crveno u sječi, itd.) ali dodaje bold narandžasti obrub da odjeli s otpremom
  // jasno iskaču, uključujući "bez-plana" odjele koji su inače blijedi/isprekidani.
  function _getOtpremaStyle(status) {
    const c = _getColor(status);
    return {
      fillColor: c,
      fillOpacity: 0.6,
      color: '#b45309',
      weight: 4,
      opacity: 1,
      dashArray: null
    };
  }

  // ---- NORMALIZACIJA ----
  function _normKey(s) {
    return String(s || '').trim().toUpperCase().replace(/Č/g, 'C').replace(/Ć/g, 'C').replace(/Š/g, 'S').replace(/Ž/g, 'Z').replace(/Đ/g, 'DJ').replace(/P\s*$/, '') // strip trailing P before stripping /N
    .replace(/\/\d+\s*$/, '') // then strip /N suffix
    .trim();
  }

  // Ključ za prikaz labela — ne strippe /N sufiks, čuva 64/1 vs 64/2
  function _labelKey(s) {
    return String(s || '').trim().toUpperCase().replace(/Č/g, 'C').replace(/Ć/g, 'C').replace(/Š/g, 'S').replace(/Ž/g, 'Z').replace(/Đ/g, 'DJ').replace(/P\s*$/, '').trim();
  }
  function _fmt(n) {
    if (n == null || isNaN(n)) return '—';
    const v = Math.round(n);
    return v === 0 ? '—' : v.toLocaleString('de-DE') + ' m³';
  }
  const PLAN_YEAR = 2026;
  const MJESECI_NAZIVI = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni', 'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'];
  let _otpremaMode = false; // "Prikaz otpreme" checkbox — prikaži samo odjele s otpremom u tekućem mjesecu

  function _getYear(p) {
    const parts = (p.datum || '').split('.');
    return parts.length >= 3 ? parseInt(parts[2]) : null;
  }
  function _getMonth(p) {
    const parts = (p.datum || '').split('.');
    return parts.length >= 2 ? parseInt(parts[1]) : null; // 1-12
  }

  // ---- STATUS MAP + SLUČAJNI ----
  // Stripa SLUCAJNI sufiks u svim formatima: "104 SLUCAJNI", "104 SLUCAJNI UZICI", "104 (SLUCAJNI 2025)"
  const _baseKey = k => k.replace(/[\s(]+SLUCAJNI.*/, '').replace(/[\s(]+SLUCAJAN.*/, '').trim();
  function _buildStatusMap(primke, otpreme) {
    const planEntries = _planEntries();
    const planKeys = new Set(planEntries.map(e => _normKey(e.gj + ' ' + e.odjel)));
    const map = new Map();
    _slucajniSet = new Set();
    const primkeTekuce = (primke || []).filter(p => _getYear(p) === PLAN_YEAR);
    const primkeOstale = (primke || []).filter(p => _getYear(p) !== PLAN_YEAR);
    const otpremeTekuce = (otpreme || []).filter(p => _getYear(p) === PLAN_YEAR);
    const otremeOstale = (otpreme || []).filter(p => _getYear(p) !== PLAN_YEAR);
    _slucajniSet = new Set(); // ima "SLUCAJNI" u nazivu odjela
    let _prelazniSet = new Set(); // nije u planu 2026, ali nema "SLUCAJNI" — prelazni iz prethodne godine

    primkeTekuce.forEach(p => {
      const k = _normKey(p.odjel);
      const bk = _baseKey(k); // stripa SLUCAJNI sufiks da matchuje GeoJSON polygon key
      if (!planKeys.has(k)) {
        if (k.includes('SLUCAJNI') || k.includes('SLUCAJAN')) {
          _slucajniSet.add(bk); // čuvamo baseKey, ne puni normKey
        } else {
          _prelazniSet.add(bk); // isto za prelazne
        }
      }
    });
    _prelazniSetGlobal = _prelazniSet;
    planEntries.forEach(entry => {
      const key = _normKey(entry.gj + ' ' + entry.odjel); // matches normKey(p.odjel)
      const sjeca = _emptySort();
      const otpr = _emptySort();
      const sjecaOst = _emptySort();
      const otprOst = _emptySort();
      primkeTekuce.filter(p => _normKey(p.odjel) === key).forEach(p => _addSort(sjeca, p.sortiment, p.kolicina));
      otpremeTekuce.filter(p => _normKey(p.odjel) === key).forEach(p => _addSort(otpr, p.sortiment, p.kolicina));
      primkeOstale.filter(p => _normKey(p.odjel) === key).forEach(p => _addSort(sjecaOst, p.sortiment, p.kolicina));
      otremeOstale.filter(p => _normKey(p.odjel) === key).forEach(p => _addSort(otprOst, p.sortiment, p.kolicina));

      // Radilište, izvođač, poslovođa — iz tekućih primki za ovaj odjel
      const odjelPrimke = primkeTekuce.filter(p => _normKey(p.odjel) === key);
      const uniq = (arr, fn) => [...new Set(arr.map(fn).filter(Boolean))].join(', ') || '—';
      const radiliste = uniq(odjelPrimke, p => p.radiliste);
      const izvodjac = uniq(odjelPrimke, p => p.izvodjac);
      const poslovodja = uniq(odjelPrimke, p => p.poslovodja);
      sjeca.ukupno = _sumSort(sjeca);
      otpr.ukupno = _sumSort(otpr);
      sjecaOst.ukupno = _sumSort(sjecaOst);
      otprOst.ukupno = _sumSort(otprOst);
      const pct = entry.neto > 0 ? sjeca.ukupno / entry.neto * 100 : 0;
      const status = pct >= 95 ? 'posjeceno' : pct > 5 ? 'u-sjeci' : 'planirano';
      const entryData = {
        gj: entry.gj,
        odjel: entry.odjel,
        status,
        pct,
        sjeca,
        otpr,
        sjecaOst,
        otprOst,
        neto: entry.neto,
        bruto: entry.bruto,
        radiliste,
        izvodjac,
        poslovodja
      };
      map.set(key, entryData);
      // Alias bez /N stripa — sprječava 64/1 da matchuje plan od 64/2P
      const strictKey = _labelKey(entry.gj + ' ' + entry.odjel);
      if (strictKey !== key) map.set(strictKey, entryData);
    });

    // Plan 2027 — odjeli planirani za narednu godinu, još nisu u planu 2026
    // Guard za "već u planu 2026" se gradi ISKLJUČIVO iz planEntries (2026), a ne iz
    // map-e koju ova ista petlja puni — inače susjedni /N odjeli (npr. 5/1 i 5/2) imaju
    // identičan normKey ("GRMEC JASENICA 5" bez /N sufiksa), pa bi upis 5/1 pogrešno
    // "zauzeo" normKey i naveo guard da tiho preskoči 5/2 kao da je već obrađen.
    const plan2026NormKeys = new Set(planEntries.map(e => _normKey(e.gj + ' ' + e.odjel)));
    const plan2026LabelKeys = new Set(planEntries.map(e => _labelKey(e.gj + ' ' + e.odjel)));
    _plan2027Entries().forEach(entry => {
      const normK = _normKey(entry.gj + ' ' + entry.odjel);
      const labelK = _labelKey(entry.gj + ' ' + entry.odjel);
      if (plan2026NormKeys.has(normK) || plan2026LabelKeys.has(labelK)) return; // već u planu 2026
      const d = {
        gj: entry.gj,
        odjel: entry.odjel,
        status: 'plan-2027',
        pct: 0,
        sjeca: _emptySort(),
        otpr: _emptySort(),
        sjecaOst: _emptySort(),
        otprOst: _emptySort(),
        neto: 0,
        bruto: 0,
        radiliste: '—',
        izvodjac: '—',
        poslovodja: '—'
      };
      // labelK je specifičan za OVAJ /N odjel — uvijek ga upiši (to je ključ po kojem
      // se GeoJSON poligon pronalazi pri renderu). normK je dijeljeni fallback pa ga
      // upisuje samo prvi /N odjel koji ga zatraži, da ne prepiše sestrinski unos.
      if (!map.has(labelK)) map.set(labelK, d);
      if (normK !== labelK && !map.has(normK)) map.set(normK, d);
    });

    // Extra map za non-plan odjele (slučajni + prelazni)
    const extraMap = new Map();
    const nonPlanPrimke = [...primkeTekuce, ...primkeOstale].filter(p => !planKeys.has(_normKey(p.odjel)));
    const nonPlanOtpr = [...otpremeTekuce, ...otremeOstale].filter(p => !planKeys.has(_normKey(p.odjel)));
    const nonPlanKeys = new Set([...nonPlanPrimke.map(p => _baseKey(_normKey(p.odjel))), ...nonPlanOtpr.map(p => _baseKey(_normKey(p.odjel)))]);
    nonPlanKeys.forEach(bk => {
      const sj = _emptySort();
      const ot = _emptySort();
      const sjO = _emptySort();
      const otO = _emptySort();
      // Match primke čiji base key odgovara (pokriva i "104 SLUCAJNI" i "104")
      const matchP = p => _baseKey(_normKey(p.odjel)) === bk;
      primkeTekuce.filter(matchP).forEach(p => _addSort(sj, p.sortiment, p.kolicina));
      otpremeTekuce.filter(matchP).forEach(p => _addSort(ot, p.sortiment, p.kolicina));
      primkeOstale.filter(matchP).forEach(p => _addSort(sjO, p.sortiment, p.kolicina));
      otremeOstale.filter(matchP).forEach(p => _addSort(otO, p.sortiment, p.kolicina));
      sj.ukupno = _sumSort(sj);
      ot.ukupno = _sumSort(ot);
      sjO.ukupno = _sumSort(sjO);
      otO.ukupno = _sumSort(otO);
      const srcPrimke = primkeTekuce.filter(matchP);
      const uniq = (arr, fn) => [...new Set(arr.map(fn).filter(Boolean))].join(', ') || '—';
      extraMap.set(bk, {
        sjeca: sj,
        otpr: ot,
        sjecaOst: sjO,
        otprOst: otO,
        radiliste: uniq(srcPrimke, p => p.radiliste),
        izvodjac: uniq(srcPrimke, p => p.izvodjac),
        poslovodja: uniq(srcPrimke, p => p.poslovodja)
      });
    });
    map._extra = extraMap;

    // ---- OTPREMA TEKUĆEG MJESECA ----
    // Za "Prikaz otpreme" checkbox: skup odjela koji su imali otpremu u tekućem
    // kalendarskom mjesecu/godini, sa ukupnom količinom (m³).
    //
    // BUGFIX: _normKey BRIŠE /N sufiks (64/1 i 64/2 → isti ključ "64"). Kad se
    // taj spljošteni ključ koristio za SVE zapise, otprema evidentirana za
    // POJEDINAČAN pododsjek (npr. "Risovac Krupa 59/1") je lažno "prelijevala"
    // highlight i na susjedni pododsjek (59/2) koji te otpreme uopšte nije imao
    // — na mapi se to vidjelo kao highlight "pored" pravog odjela / naizgled
    // nasumični odsjeci. Rješenje: DVA nivoa preciznosti —
    //  1. precise: labelKey (ČUVA /N) — kad zapis već navodi tačan pododsjek
    //  2. fallback: normKey (briše /N) — SAMO za zapise koji nemaju /N u nazivu
    //     (agregatni/roditeljski unos bez preciznog pododsjeka) — primjenjuje
    //     se širom svih pododsjeka jer se iz podatka ne može znati tačno koji.
    const now = new Date();
    const curMonth = now.getMonth() + 1; // 1-12
    const curYear = now.getFullYear();
    const otpremaPreciseMap = new Map(); // baseKey(labelKey) → m³ (čuva /N)
    const otpremaFallbackMap = new Map(); // baseKey(normKey)  → m³ (bez /N)
    (otpreme || []).forEach(p => {
      if (_getYear(p) === curYear && _getMonth(p) === curMonth) {
        const raw = String(p.odjel || '');
        const amt = parseFloat(p.kolicina) || 0;
        if (/\/\d+/.test(raw)) {
          const pk = _baseKey(_labelKey(raw));
          otpremaPreciseMap.set(pk, (otpremaPreciseMap.get(pk) || 0) + amt);
        } else {
          const fk = _baseKey(_normKey(raw));
          otpremaFallbackMap.set(fk, (otpremaFallbackMap.get(fk) || 0) + amt);
        }
      }
    });
    map._otpremaPrecise = otpremaPreciseMap;
    map._otpremaFallback = otpremaFallbackMap;
    map._otpremaMjesecNaziv = MJESECI_NAZIVI[curMonth - 1] + ' ' + curYear;
    return map;
  }
  function _emptySort() {
    return {
      cTrupci: 0,
      celDuga: 0,
      celCijepana: 0,
      skart: 0,
      lTrupci: 0,
      ogrDugi: 0,
      ogrCijepani: 0,
      gule: 0,
      ukupno: 0
    };
  }
  function _sumSort(s) {
    return s.cTrupci + s.celDuga + s.celCijepana + s.skart + s.lTrupci + s.ogrDugi + s.ogrCijepani + s.gule;
  }
  function _addSort(obj, sortiment, kolicina) {
    const k = parseFloat(kolicina) || 0;
    switch (sortiment) {
      case 'TRUPCI Č':
        obj.cTrupci += k;
        break;
      case 'CEL.DUGA':
        obj.celDuga += k;
        break;
      case 'CEL.CIJEPANA':
        obj.celCijepana += k;
        break;
      case 'ŠKART':
        obj.skart += k;
        break;
      case 'TRUPCI L':
        obj.lTrupci += k;
        break;
      case 'OGR.DUGI':
        obj.ogrDugi += k;
        break;
      case 'OGR.CIJEPANI':
        obj.ogrCijepani += k;
        break;
      case 'GULE':
        obj.gule += k;
        break;
    }
  }

  // ---- CENTROID ----
  function _centroid(layer) {
    try {
      const b = layer.getBounds();
      return b.getCenter();
    } catch (e) {
      return null;
    }
  }

  // ---- OSRM RUTA ----
  async function _drawRoute(destLatLng) {
    if (_routeLine) {
      _map.removeLayer(_routeLine);
      _routeLine = null;
    }
    const [lat1, lng1] = SUMARIJA_LATLNG;
    const url = `${OSRM_URL}/${lng1},${lat1};${destLatLng.lng},${destLatLng.lat}?overview=full&geometries=geojson`;
    try {
      // Timeout — javni OSRM demo server zna visiti; bez ovoga UI čeka zauvijek
      const resp = await fetch(url, {
        signal: AbortSignal.timeout(15000)
      });
      if (!resp.ok) throw new Error('Server rute nedostupan (HTTP ' + resp.status + ')');
      const data = await resp.json();
      if (data.code !== 'Ok' || !data.routes.length) throw new Error('Nema rute');
      const route = data.routes[0];
      const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
      const distKm = (route.distance / 1000).toFixed(1);
      const durMin = Math.round(route.duration / 60 * ROUTE_DURATION_FACTOR);
      _routeLine = L.polyline(coords, {
        color: '#2563eb',
        weight: 4,
        opacity: 0.85,
        dashArray: '8 4'
      }).bindTooltip(`${distKm} km · ~${durMin} min`, {
        permanent: true,
        direction: 'center',
        className: 'karta-tooltip'
      }).addTo(_map);
      const infoDiv = document.getElementById('mapa-ruta-info');
      if (infoDiv) {
        infoDiv.innerHTML = `🛣️ <b>${distKm} km</b> &nbsp;·&nbsp; ⏱️ ~<b>${durMin} min</b> &nbsp;
          <button onclick="clearMapaRuta()" style="margin-left:8px;font-size:11px;padding:2px 8px;border:1px solid #d1d5db;border-radius:4px;cursor:pointer;background:white;">✕ Ukloni</button>`;
        infoDiv.style.display = 'inline-flex';
      }

      // Zoom na rutu + šumariju
      _map.fitBounds(_routeLine.getBounds(), {
        padding: [30, 30]
      });
    } catch (e) {
      alert('Greška pri učitavanju rute: ' + e.message);
    }
  }
  window.clearMapaRuta = function () {
    if (_routeLine) {
      _map.removeLayer(_routeLine);
      _routeLine = null;
    }
    const infoDiv = document.getElementById('mapa-ruta-info');
    if (infoDiv) infoDiv.style.display = 'none';
  };
  window.routeToOdjel = function () {
    closeMapaModal();
    if (_currentLatlng) _drawRoute(_currentLatlng);
  };
  window.routeOdjelToOdjel = function () {
    if (!_currentLatlng) return;
    closeMapaModal();
    // Postavi polazište na trenutni odjel i čekaj klik na odredište
    if (_routeLine2) {
      _map.removeLayer(_routeLine2);
      _routeLine2 = null;
    }
    const infoDiv = document.getElementById('mapa-ruta-info');
    if (infoDiv) infoDiv.style.display = 'none';
    _odjelRutaMode = true;
    _odjelRutaFrom = {
      latlng: _currentLatlng,
      label: _currentOdjelLabel
    };
    _odjelRutaFromMark = L.circleMarker(_currentLatlng, {
      radius: 10,
      color: '#dc2626',
      fillColor: '#fca5a5',
      fillOpacity: 0.9,
      weight: 3
    }).bindTooltip(`Polazište: Odjel ${_currentOdjelLabel}`, {
      permanent: true,
      direction: 'top',
      offset: [0, -8]
    }).addTo(_map);
    const btn = document.getElementById('karta-odjel-ruta-btn');
    if (btn) {
      btn.style.background = '#2563eb';
      btn.style.color = 'white';
    }
    const hint = document.getElementById('mapa-ruta-hint');
    if (hint) {
      hint.textContent = `🎯 Polazište: Odjel ${_currentOdjelLabel} — kliknite na odredišni odjel`;
      hint.style.display = 'block';
    }
  };

  // ---- RUTA IZMEĐU DVA ODJELA ----
  async function _drawOdjelRuta(from, to, fromLabel, toLabel) {
    if (_routeLine2) {
      _map.removeLayer(_routeLine2);
      _routeLine2 = null;
    }
    const url = `${OSRM_URL}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    try {
      // Timeout — javni OSRM demo server zna visiti; bez ovoga UI čeka zauvijek
      const resp = await fetch(url, {
        signal: AbortSignal.timeout(15000)
      });
      if (!resp.ok) throw new Error('Server rute nedostupan (HTTP ' + resp.status + ')');
      const data = await resp.json();
      if (data.code !== 'Ok' || !data.routes.length) throw new Error('Nema rute');
      const route = data.routes[0];
      const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
      const distKm = (route.distance / 1000).toFixed(1);
      const durMin = Math.round(route.duration / 60 * ROUTE_DURATION_FACTOR);
      _routeLine2 = L.polyline(coords, {
        color: '#dc2626',
        weight: 4,
        opacity: 0.85,
        dashArray: '8 4'
      }).bindTooltip(`${distKm} km · ~${durMin} min`, {
        permanent: true,
        direction: 'center',
        className: 'karta-tooltip'
      }).addTo(_map);
      const infoDiv = document.getElementById('mapa-ruta-info');
      if (infoDiv) {
        infoDiv.innerHTML = `🔀 <b>Odjel ${fromLabel} → Odjel ${toLabel}</b>: <b>${distKm} km</b> · ⏱️ ~<b>${durMin} min</b>
          <button onclick="clearOdjelRuta()" style="margin-left:8px;font-size:11px;padding:2px 8px;border:1px solid #d1d5db;border-radius:4px;cursor:pointer;background:white;">✕ Ukloni</button>`;
        infoDiv.style.display = 'inline-flex';
      }
      _map.fitBounds(_routeLine2.getBounds(), {
        padding: [30, 30]
      });
    } catch (e) {
      alert('Greška pri učitavanju rute: ' + e.message);
    }
  }
  function _clearOdjelRutaState() {
    _odjelRutaMode = false;
    _odjelRutaFrom = null;
    if (_odjelRutaFromMark) {
      _map.removeLayer(_odjelRutaFromMark);
      _odjelRutaFromMark = null;
    }
    const btn = document.getElementById('karta-odjel-ruta-btn');
    if (btn) {
      btn.style.background = 'white';
      btn.style.color = '#374151';
    }
    const hint = document.getElementById('mapa-ruta-hint');
    if (hint) hint.style.display = 'none';
  }
  window.clearOdjelRuta = function () {
    if (_routeLine2) {
      _map.removeLayer(_routeLine2);
      _routeLine2 = null;
    }
    const infoDiv = document.getElementById('mapa-ruta-info');
    if (infoDiv) infoDiv.style.display = 'none';
    _clearOdjelRutaState();
  };
  window.toggleOdjelRutaMode = function () {
    if (_odjelRutaMode) {
      _clearOdjelRutaState();
      return;
    }
    // Ukloni stare rute
    if (_routeLine) {
      _map.removeLayer(_routeLine);
      _routeLine = null;
    }
    if (_routeLine2) {
      _map.removeLayer(_routeLine2);
      _routeLine2 = null;
    }
    const infoDiv = document.getElementById('mapa-ruta-info');
    if (infoDiv) infoDiv.style.display = 'none';
    _odjelRutaMode = true;
    _odjelRutaFrom = null;
    const btn = document.getElementById('karta-odjel-ruta-btn');
    if (btn) {
      btn.style.background = '#2563eb';
      btn.style.color = 'white';
    }
    const hint = document.getElementById('mapa-ruta-hint');
    if (hint) {
      hint.textContent = '📍 Kliknite na prvi odjel (polazište)';
      hint.style.display = 'block';
    }
  };

  // ---- STANJE ODJELA (projekat) ----
  function _getStanjeMap() {
    if (_stanjeMap) return _stanjeMap;
    try {
      // Čitaj iz cache_stanje_zaliha (projekat/sječa/zaliha po sortimentima)
      let raw = localStorage.getItem('cache_stanje_zaliha');
      // Ako nema, probaj poslovođa varijantu (cache_stanje_zaliha_Ime_Prezime)
      if (!raw) {
        const key = Object.keys(localStorage).find(k => k.startsWith('cache_stanje_zaliha_'));
        if (key) raw = localStorage.getItem(key);
      }
      if (!raw) return null;
      const wrapper = JSON.parse(raw);
      const payload = wrapper && wrapper.data;
      if (!payload) return null;

      // stanje-zaliha vraća { odjeli: [...], sortimentiHeader: [...] }
      // stanje-odjela vraća { data: [...], sortimentiNazivi: [...] }
      const odjeli = payload.odjeli || payload.data || [];
      const sortN = payload.sortimentiHeader || payload.sortimentiNazivi || [];
      if (!Array.isArray(odjeli) || !odjeli.length) return null;
      _stanjeMap = new Map();
      odjeli.forEach(od => {
        const naziv = od.odjelNaziv || od.odjel || '';
        if (!naziv) return;
        const k = _normKey(naziv);
        _stanjeMap.set(k, {
          projekat: od.redovi && od.redovi.projekat || [],
          sjeca: od.redovi && od.redovi.sjeca || [],
          otprema: od.redovi && od.redovi.otprema || [],
          sumaLager: od.redovi && od.redovi.sumaLager || [],
          sortimentiNazivi: sortN
        });
      });
    } catch (_) {}
    return _stanjeMap || null;
  }

  // ---- DETALJI MODAL ----
  function _openDetaljiModal(props, info, latlng, extra) {
    _currentLatlng = latlng;
    // Uvijek koristi GeoJSON props.odjel za prikaz — ne info.odjel koji može biti od drugog poligona
    _currentOdjelLabel = String(props.odjel || props.name || info && info.odjel || '?');
    const odjel = _currentOdjelLabel;
    const gj = props.gj || '—';
    const odsjek = props.odsjek || '—';
    const gjBg = {
      'Risovac Krupa': 'rgba(147,197,253,.25)',
      'Grmeč Jasenica': 'rgba(134,239,172,.25)',
      'Vojskova': 'rgba(252,211,77,.25)'
    }[gj] || 'rgba(255,255,255,.15)';
    document.getElementById('mapa-modal-title').textContent = 'Odjel ' + odjel;
    const gjEl = document.getElementById('mapa-modal-gj');
    gjEl.textContent = gj;
    gjEl.style.cssText = `color:white;font-weight:600;background:${gjBg};display:inline-block;padding:2px 8px;border-radius:4px;border:1px solid rgba(255,255,255,.4);`;
    const metaDiv = document.getElementById('mapa-modal-meta');
    if (metaDiv) {
      const src = info || extra;
      const metaItem = (icon, label, val) => val && val !== '—' ? `<div style="display:flex;align-items:center;gap:4px;font-size:11px;opacity:.9;"><span>${icon}</span><span><b>${label}:</b> ${val}</span></div>` : '';
      metaDiv.innerHTML = src ? metaItem('📍', 'Radilište', src.radiliste) + metaItem('👷', 'Izvođač', src.izvodjac) + metaItem('👤', 'Poslovođa', src.poslovodja) : '';
      metaDiv.style.display = metaDiv.innerHTML ? 'flex' : 'none';
    }
    const statusLabel = {
      posjeceno: 'Posječeno',
      'u-sjeci': 'U sječi',
      planirano: 'Planirano',
      slucajni: 'Slučajni užitak',
      prelazni: 'Nekategorisan odjel',
      'plan-2027': 'Plan sječa 2027'
    };
    const statusColor = {
      posjeceno: '#166534',
      'u-sjeci': '#dc2626',
      planirano: '#6b7280',
      slucajni: '#7c3aed',
      prelazni: '#0e7490',
      'plan-2027': '#1e40af'
    };
    const statusBg = {
      posjeceno: '#dcfce7',
      'u-sjeci': '#fee2e2',
      planirano: '#f3f4f6',
      slucajni: '#f5f3ff',
      prelazni: '#ecfeff',
      'plan-2027': '#dbeafe'
    };
    const routeBtn = `
      <div style="display:flex;gap:8px;margin-top:12px;">
        <button onclick="routeToOdjel()" style="flex:1;display:flex;align-items:center;gap:6px;background:#2563eb;color:white;border:none;padding:8px 10px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;justify-content:center;">🏢 Ruta od Šumarije</button>
        <button onclick="routeOdjelToOdjel()" style="flex:1;display:flex;align-items:center;gap:6px;background:#dc2626;color:white;border:none;padding:8px 10px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;justify-content:center;">🔀 Ruta do odjela…</button>
      </div>`;
    const normKey2 = _labelKey((props.gj || '') + ' ' + (props.odjel || props.name || ''));
    const isSlucajni = !info && _slucajniSet.has(normKey2);
    const isPrelazni = !info && !isSlucajni && _prelazniSetGlobal.has(normKey2);
    let body;
    if (!info) {
      const label = isSlucajni ? 'Slučajni užitak' : isPrelazni ? 'Nekategorisan odjel' : 'Bez plana';
      const bg = isSlucajni ? '#f5f3ff' : isPrelazni ? '#ecfeff' : '#f3f4f6';
      const col = isSlucajni ? '#7c3aed' : isPrelazni ? '#0e7490' : '#6b7280';
      const note = isSlucajni ? `${gj} — sječa evidentirana kao slučajni užitak` : isPrelazni ? `${gj} — nije u planu 2026, vjerovatno prelazni odjel iz prethodne godine` : `${gj} — nema podataka za ovaj odjel`;
      let extraTable = '';
      if (extra) {
        const sj = extra.sjeca || _emptySort();
        const ot = extra.otpr || _emptySort();
        const sjO = extra.sjecaOst || _emptySort();
        const otO = extra.otprOst || _emptySort();
        const prevYear = PLAN_YEAR - 1;
        const hasTek = sj.ukupno > 0 || ot.ukupno > 0;
        const hasOst = sjO.ukupno > 0 || otO.ukupno > 0;
        if (hasTek || hasOst) {
          const cell = (v, color, bold) => `<td style="padding:7px 10px;font-size:13px;text-align:right;border-bottom:1px solid #f1f5f9;color:${color};${bold ? 'font-weight:700;' : ''}">${_fmt(v)}</td>`;
          const row = (lbl, sv, ov, svO, ovO, bold) => {
            const bS = bold ? 'font-weight:700;font-size:13px;' : 'font-size:13px;';
            return `<tr${bold ? ' style="background:#f8fafc;"' : ''}>
              <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;${bS}">${lbl}</td>
              ${cell(sv, '#15803d', bold)}
              ${cell(ov, '#92400e', bold)}
              ${cell(svO, '#6b7280', bold)}
              ${cell(ovO, '#9ca3af', bold)}
            </tr>`;
          };
          const sjCijC = sj.celDuga + sj.celCijepana + sj.skart;
          const sjCijL = sj.ogrDugi + sj.ogrCijepani + sj.gule;
          const otCijC = ot.celDuga + ot.celCijepana + ot.skart;
          const otCijL = ot.ogrDugi + ot.ogrCijepani + ot.gule;
          const sjOCijC = sjO.celDuga + sjO.celCijepana + sjO.skart;
          const sjOCijL = sjO.ogrDugi + sjO.ogrCijepani + sjO.gule;
          const otOCijC = otO.celDuga + otO.celCijepana + otO.skart;
          const otOCijL = otO.ogrDugi + otO.ogrCijepani + otO.gule;
          extraTable = `
            <div style="margin-top:16px;background:#f8fafc;border-radius:12px;overflow:hidden;">
              <div style="padding:10px 14px 4px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;">Evidencija sječe</div>
              <div style="overflow-x:auto;">
              <table style="width:100%;border-collapse:collapse;">
                <thead>
                  <tr style="background:#e2e8f0;">
                    <th style="padding:7px 10px;font-size:12px;text-align:left;color:#475569;font-weight:600;">Sortiment</th>
                    <th style="padding:7px 10px;font-size:12px;text-align:right;color:#15803d;font-weight:600;">Sječa<br><span style="font-size:10px;">${PLAN_YEAR}</span></th>
                    <th style="padding:7px 10px;font-size:12px;text-align:right;color:#92400e;font-weight:600;">Otpr.<br><span style="font-size:10px;">${PLAN_YEAR}</span></th>
                    <th style="padding:7px 10px;font-size:12px;text-align:right;color:#6b7280;font-weight:600;">Sječa<br><span style="font-size:10px;">${prevYear}</span></th>
                    <th style="padding:7px 10px;font-size:12px;text-align:right;color:#9ca3af;font-weight:600;">Otpr.<br><span style="font-size:10px;">${prevYear}</span></th>
                  </tr>
                </thead>
                <tbody>
                  ${row('TRUPCI Č', sj.cTrupci, ot.cTrupci, sjO.cTrupci, otO.cTrupci, false)}
                  ${row('CIJEPANO Č', sjCijC, otCijC, sjOCijC, otOCijC, false)}
                  ${row('TRUPCI L', sj.lTrupci, ot.lTrupci, sjO.lTrupci, otO.lTrupci, false)}
                  ${row('CIJEPANO L', sjCijL, otCijL, sjOCijL, otOCijL, false)}
                  ${row('UKUPNO', sj.ukupno, ot.ukupno, sjO.ukupno, otO.ukupno, true)}
                </tbody>
              </table>
              </div>
            </div>`;
        }
      }
      body = `
        <div style="text-align:center;padding:20px 0 0;">
          <span style="background:${bg};color:${col};padding:4px 12px;border-radius:99px;font-size:12px;font-weight:700;">${label}</span>
          <div style="font-size:13px;color:#6b7280;margin-top:8px;">${note}</div>
        </div>
        ${extraTable}
        ${routeBtn}`;
    } else if (info.status === 'plan-2027') {
      body = `
        <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:12px;flex-wrap:wrap;">
          <div style="flex:1;min-width:110px;">
            <div style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:.5px;">Gospodarska jedinica</div>
            <div style="font-weight:700;font-size:13px;">${gj}</div>
          </div>
          <div style="flex:0;min-width:50px;">
            <div style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:.5px;">Odsjek</div>
            <div style="font-weight:600;font-size:13px;">${odsjek}</div>
          </div>
          <span style="background:#dbeafe;color:#1e40af;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;align-self:flex-start;">Plan sječa 2027</span>
        </div>
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:12px 14px;margin-bottom:12px;text-align:center;">
          <div style="font-size:28px;margin-bottom:4px;">📅</div>
          <div style="font-size:13px;font-weight:700;color:#1e40af;">Planiran za sječu u 2027. godini</div>
          <div style="font-size:12px;color:#9ca3af;margin-top:4px;">Odjel nije u planu sječe za ${PLAN_YEAR}. godinu.</div>
        </div>
        ${routeBtn}`;
    } else {
      const s = info.status;
      const pct = (info.pct || 0).toFixed(1);
      const barW = Math.min(100, Math.round(info.pct || 0));
      const barCol = (info.pct || 0) > 100 ? '#dc2626' : _getColor(s);
      const sj = info.sjeca;
      const ot = info.otpr;
      const hasOtpr = ot && ot.ukupno > 0;
      const zaliha = sj.ukupno - (hasOtpr ? ot.ukupno : 0);
      const e = _planEntries().find(x => _normKey(x.gj + ' ' + x.odjel) === _normKey(info.gj + ' ' + info.odjel)) || {};

      // Grupisani sortimenti
      const sjCijC = sj.celDuga + sj.celCijepana + sj.skart;
      const sjCijL = sj.ogrDugi + sj.ogrCijepani + sj.gule;
      const otCijC = ot.celDuga + ot.celCijepana + ot.skart;
      const otCijL = ot.ogrDugi + ot.ogrCijepani + ot.gule;

      // Sječa i otprema iz netekuće godine
      const so = info.sjecaOst || _emptySort();
      const oo = info.otprOst || _emptySort();
      const hasOst = so.ukupno > 0 || oo.ukupno > 0;
      const td = (v, col, bold) => `<td style="padding:7px 10px;font-size:13px;text-align:right;border-bottom:1px solid #f1f5f9;color:${col};${bold ? 'font-weight:700;' : ''}">${_fmt(v)}</td>`;
      const tdL = v => `<td style="padding:7px 10px;font-size:13px;border-bottom:1px solid #f1f5f9;color:#374151;">${v}</td>`;
      const grpRow = (label, sv, ov, pv) => {
        const z = sv - (ov || 0);
        const zC = z < 0 ? '#dc2626' : z === 0 ? '#6b7280' : '#059669';
        return `<tr>${tdL(label)}${td(sv, '#15803d', true)}${hasOtpr ? td(ov, '#92400e', false) + td(z, zC, true) : ''}${td(pv, '#9ca3af', false)}</tr>`;
      };
      const subRow = (label, sv, ov) => {
        return `<tr style="background:#fafafa;">${tdL('<span style="font-size:12px;color:#9ca3af;padding-left:10px;">↳ ' + label + '</span>')}${td(sv, '#6b7280', false)}${hasOtpr ? td(ov, '#9ca3af', false) + '<td style="border-bottom:1px solid #f1f5f9;"></td>' : ''}<td style="border-bottom:1px solid #f1f5f9;"></td></tr>`;
      };

      // Projekat + realizacija iz stanje-odjela cache
      const _sm = _getStanjeMap();
      const _stanjeKey = _normKey((info.gj || '') + ' ' + info.odjel);
      const _stanjeOd = _sm && _sm.get(_stanjeKey);
      let projekatSection = '';
      if (_stanjeOd && _stanjeOd.projekat && _stanjeOd.projekat.length) {
        const sortN = _stanjeOd.sortimentiNazivi;
        const proj = _stanjeOd.projekat;
        const sj = _stanjeOd.sjeca || [];
        const lager = _stanjeOd.sumaLager || [];
        const fmtP = v => v === 0 || v == null ? '—' : Number(v).toFixed(2);
        const getV = (arr, name) => {
          const i = sortN.findIndex(s => s === name);
          return i >= 0 ? arr[i] ?? null : null;
        };
        const pC = getV(proj, 'ČETINARI'),
          pL = getV(proj, 'LIŠĆARI'),
          pSveu = getV(proj, 'SVEUKUPNO');
        const sC = getV(sj, 'ČETINARI'),
          sL = getV(sj, 'LIŠĆARI'),
          sSveu = getV(sj, 'SVEUKUPNO');
        const zC = getV(lager, 'ČETINARI'),
          zL = getV(lager, 'LIŠĆARI'),
          zSveu = getV(lager, 'SVEUKUPNO');
        const pctC = pC && pC > 0 && sC != null ? Math.min(999, sC / pC * 100).toFixed(1) : null;
        const pctL = pL && pL > 0 && sL != null ? Math.min(999, sL / pL * 100).toFixed(1) : null;
        const pctSveu = pSveu && pSveu > 0 && sSveu != null ? Math.min(999, sSveu / pSveu * 100).toFixed(1) : null;
        const col3 = (label, pV, sV, zV, pct, accentC, accentL) => {
          const zCol = zV != null && zV < 0 ? '#dc2626' : '#059669';
          return `
          <div style="background:white;border-radius:8px;padding:8px 10px;flex:1;min-width:90px;border:1px solid #fde68a;">
            <div style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.3px;margin-bottom:4px;">${label}</div>
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px;">
              <span style="font-size:10px;color:#9ca3af;">Proj.</span>
              <span style="font-size:13px;font-weight:700;color:${accentC};">${fmtP(pV)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px;">
              <span style="font-size:10px;color:#9ca3af;">Sječa</span>
              <span style="font-size:13px;font-weight:700;color:#15803d;">${fmtP(sV)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:baseline;">
              <span style="font-size:10px;color:#9ca3af;">Zaliha</span>
              <span style="font-size:13px;font-weight:700;color:${zCol};">${fmtP(zV)}</span>
            </div>
            ${pct != null ? `<div style="margin-top:5px;height:4px;background:#f3f4f6;border-radius:2px;overflow:hidden;">
              <div style="height:100%;width:${Math.min(100, parseFloat(pct))}%;background:${parseFloat(pct) >= 100 ? '#dc2626' : '#15803d'};border-radius:2px;"></div>
            </div>
            <div style="text-align:right;font-size:10px;font-weight:700;color:${parseFloat(pct) >= 100 ? '#dc2626' : '#6b7280'};margin-top:1px;">${pct}%</div>` : ''}
          </div>`;
        };
        projekatSection = `
          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:12px 16px;margin-bottom:14px;">
            <div style="font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;">📋 Realizacija projekta (stanje zaliha)</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${pC != null ? col3('Četinari', pC, sC, zC, pctC, '#1e40af', '') : ''}
              ${pL != null ? col3('Lišćari', pL, sL, zL, pctL, '#92400e', '') : ''}
              ${pSveu != null ? col3('Ukupno', pSveu, sSveu, zSveu, pctSveu, '#5b21b6', '') : ''}
            </div>
          </div>`;
      }

      // Kompaktna sekcija godišnjeg plana (ide na dno)
      const godisnjiPlanSection = `
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:8px 12px;margin-bottom:10px;">
          <div style="font-size:10px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">📋 Godišnji plan ${PLAN_YEAR}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <div style="background:white;border-radius:6px;padding:4px 8px;text-align:center;flex:1;min-width:60px;border:1px solid #bbf7d0;">
              <div style="font-size:10px;color:#9ca3af;">Bruto</div>
              <div style="font-weight:700;font-size:12px;color:#374151;">${_fmt(e.bruto || 0)}</div>
            </div>
            <div style="background:white;border-radius:6px;padding:4px 8px;text-align:center;flex:1;min-width:60px;border:1px solid #bbf7d0;">
              <div style="font-size:10px;color:#9ca3af;">Neto</div>
              <div style="font-weight:700;font-size:12px;color:#166534;">${_fmt(e.neto || 0)}</div>
            </div>
            ${(e.cTrupci || 0) > 0 ? `<div style="background:white;border-radius:6px;padding:4px 8px;text-align:center;flex:1;min-width:60px;border:1px solid #bbf7d0;"><div style="font-size:10px;color:#9ca3af;">Trp.Č</div><div style="font-weight:700;font-size:12px;color:#1e40af;">${_fmt(e.cTrupci)}</div></div>` : ''}
            ${(e.cijepanoC || 0) > 0 ? `<div style="background:white;border-radius:6px;padding:4px 8px;text-align:center;flex:1;min-width:60px;border:1px solid #bbf7d0;"><div style="font-size:10px;color:#9ca3af;">Cij.Č</div><div style="font-weight:700;font-size:12px;color:#1e40af;">${_fmt(e.cijepanoC)}</div></div>` : ''}
            ${(e.lTrupci || 0) > 0 ? `<div style="background:white;border-radius:6px;padding:4px 8px;text-align:center;flex:1;min-width:60px;border:1px solid #bbf7d0;"><div style="font-size:10px;color:#9ca3af;">Trp.L</div><div style="font-weight:700;font-size:12px;color:#92400e;">${_fmt(e.lTrupci)}</div></div>` : ''}
            ${(e.cijepanoL || 0) > 0 ? `<div style="background:white;border-radius:6px;padding:4px 8px;text-align:center;flex:1;min-width:60px;border:1px solid #bbf7d0;"><div style="font-size:10px;color:#9ca3af;">Cij.L</div><div style="font-weight:700;font-size:12px;color:#92400e;">${_fmt(e.cijepanoL)}</div></div>` : ''}
          </div>
        </div>`;
      body = `
        <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:10px;flex-wrap:wrap;">
          <div style="flex:1;min-width:110px;">
            <div style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:.5px;">Gospodarska jedinica</div>
            <div style="font-weight:700;font-size:13px;">${gj}</div>
          </div>
          <div style="flex:0;min-width:50px;">
            <div style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:.5px;">Odsjek</div>
            <div style="font-weight:600;font-size:13px;">${odsjek}</div>
          </div>
          <span style="background:${statusBg[s]};color:${statusColor[s]};padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;align-self:flex-start;">${statusLabel[s] || s}</span>
        </div>

        ${projekatSection}

        <div style="background:#f8fafc;border-radius:10px;padding:10px 12px;margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span style="font-size:12px;font-weight:600;color:#374151;">Realizacija plana ${PLAN_YEAR}</span>
            <span style="font-size:16px;font-weight:800;color:${statusColor[s]};">${pct}%</span>
          </div>
          <div style="height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden;margin-bottom:8px;">
            <div style="height:100%;width:${barW}%;background:${barCol};border-radius:3px;"></div>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <div style="background:white;border-radius:7px;padding:4px 8px;text-align:center;flex:1;min-width:60px;">
              <div style="font-size:10px;color:#9ca3af;">Sječa ${PLAN_YEAR}</div>
              <div style="font-weight:800;font-size:13px;color:#15803d;">${_fmt(sj.ukupno)}</div>
            </div>
            ${hasOtpr ? `
            <div style="background:white;border-radius:7px;padding:4px 8px;text-align:center;flex:1;min-width:60px;">
              <div style="font-size:10px;color:#9ca3af;">Otprema</div>
              <div style="font-weight:800;font-size:13px;color:#b45309;">${_fmt(ot.ukupno)}</div>
            </div>
            <div style="background:white;border-radius:7px;padding:4px 8px;text-align:center;flex:1;min-width:60px;">
              <div style="font-size:10px;color:#9ca3af;">Zaliha</div>
              <div style="font-weight:800;font-size:13px;color:${zaliha < 0 ? '#dc2626' : '#1d4ed8'};">${_fmt(zaliha)}</div>
            </div>` : ''}
            <div style="background:white;border-radius:7px;padding:4px 8px;text-align:center;flex:1;min-width:60px;">
              <div style="font-size:10px;color:#9ca3af;">Plan neto</div>
              <div style="font-weight:800;font-size:13px;color:#6b7280;">${_fmt(info.neto)}</div>
            </div>
          </div>
        </div>

        <div style="font-size:11px;font-weight:700;color:#374151;margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px;">Sortimenti — ${PLAN_YEAR}</div>
        <div style="border-radius:10px;overflow:hidden;border:1px solid #f1f5f9;margin-bottom:10px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="background:#e2e8f0;">
            <th style="padding:5px 8px;font-size:11px;text-align:left;color:#475569;font-weight:600;">Sortiment</th>
            <th style="padding:5px 8px;font-size:11px;text-align:right;color:#15803d;font-weight:600;">Sječa</th>
            ${hasOtpr ? '<th style="padding:5px 8px;font-size:11px;text-align:right;color:#b45309;font-weight:600;">Otpr.</th><th style="padding:5px 8px;font-size:11px;text-align:right;color:#1d4ed8;font-weight:600;">Zal.</th>' : ''}
            <th style="padding:5px 8px;font-size:11px;text-align:right;color:#9ca3af;font-weight:600;">Plan</th>
          </tr></thead>
          <tbody>
            ${grpRow('TRUPCI Č', sj.cTrupci, ot.cTrupci, e.cTrupci || 0)}
            ${grpRow('CIJEPANO Č', sjCijC, otCijC, e.cijepanoC || 0)}
            ${subRow('Cel.duga', sj.celDuga, ot.celDuga)}
            ${subRow('Cel.cijepana', sj.celCijepana, ot.celCijepana)}
            ${subRow('Škart', sj.skart, ot.skart)}
            ${grpRow('TRUPCI L', sj.lTrupci, ot.lTrupci, e.lTrupci || 0)}
            ${grpRow('CIJEPANO L', sjCijL, otCijL, e.cijepanoL || 0)}
            ${subRow('Ogr.dugi', sj.ogrDugi, ot.ogrDugi)}
            ${subRow('Ogr.cijepani', sj.ogrCijepani, ot.ogrCijepani)}
            ${subRow('Gule', sj.gule, ot.gule)}
            <tr style="background:#e2e8f0;font-weight:800;border-top:2px solid #cbd5e1;">
              <td style="padding:6px 8px;font-size:12px;">UKUPNO</td>
              <td style="padding:6px 8px;font-size:12px;text-align:right;color:#15803d;">${_fmt(sj.ukupno)}</td>
              ${hasOtpr ? `<td style="padding:6px 8px;font-size:12px;text-align:right;color:#b45309;">${_fmt(ot.ukupno)}</td>
              <td style="padding:6px 8px;font-size:12px;text-align:right;color:${zaliha < 0 ? '#dc2626' : '#1d4ed8'};">${_fmt(zaliha)}</td>` : ''}
              <td style="padding:6px 8px;font-size:11px;text-align:right;color:#9ca3af;">${_fmt(info.neto)}</td>
            </tr>
          </tbody>
        </table>
        </div>

        ${hasOst ? (() => {
        const prevYear = PLAN_YEAR - 1;
        const soCijC = so.celDuga + so.celCijepana + so.skart;
        const soCijL = so.ogrDugi + so.ogrCijepani + so.gule;
        const ooCijC = oo.celDuga + oo.celCijepana + oo.skart;
        const ooCijL = oo.ogrDugi + oo.ogrCijepani + oo.gule;
        const rowO = (lbl, sv, ov, bold) => {
          const bS = bold ? 'font-weight:700;font-size:13px;' : 'font-size:13px;';
          return `<tr${bold ? ' style="background:#f8fafc;"' : ''}>
              <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;${bS}">${lbl}</td>
              <td style="padding:7px 10px;font-size:13px;text-align:right;border-bottom:1px solid #f1f5f9;color:#15803d;${bold ? 'font-weight:700;' : ''}">${_fmt(sv)}</td>
              <td style="padding:7px 10px;font-size:13px;text-align:right;border-bottom:1px solid #f1f5f9;color:#92400e;${bold ? 'font-weight:700;' : ''}">${_fmt(ov)}</td>
            </tr>`;
        };
        return `<div style="margin-bottom:12px;border-radius:12px;overflow:hidden;border:1px solid #fde68a;">
            <div style="background:#fffbeb;padding:8px 14px 4px;font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.5px;">⚠️ Sječa ${prevYear} (prethodna godina)</div>
            <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;">
              <thead><tr style="background:#fef9c3;">
                <th style="padding:6px 10px;font-size:12px;text-align:left;color:#78350f;font-weight:600;">Sortiment</th>
                <th style="padding:6px 10px;font-size:12px;text-align:right;color:#15803d;font-weight:600;">Sječa</th>
                <th style="padding:6px 10px;font-size:12px;text-align:right;color:#92400e;font-weight:600;">Otprema</th>
              </tr></thead>
              <tbody>
                ${rowO('TRUPCI Č', so.cTrupci, oo.cTrupci, false)}
                ${rowO('CIJEPANO Č', soCijC, ooCijC, false)}
                ${rowO('TRUPCI L', so.lTrupci, oo.lTrupci, false)}
                ${rowO('CIJEPANO L', soCijL, ooCijL, false)}
                ${rowO('UKUPNO', so.ukupno, oo.ukupno, true)}
              </tbody>
            </table>
            </div>
          </div>`;
      })() : ''}
        ${godisnjiPlanSection}
        ${routeBtn}`;
    }
    document.getElementById('mapa-modal-body').innerHTML = body;
    document.getElementById('mapa-modal').style.display = 'flex';
  }
  window.closeMapaModal = function () {
    document.getElementById('mapa-modal').style.display = 'none';
  };

  // ---- FOKUS MODE ----
  window.toggleMapaFokus = function () {
    document.body.classList.toggle('mapa-fokus');
    const active = document.body.classList.contains('mapa-fokus');
    const btn = document.getElementById('karta-fokus-btn');
    if (btn) {
      btn.textContent = active ? '✕ Fokus' : '⛶ Fokus';
      btn.classList.toggle('active', active);
    }
    if (_map) setTimeout(() => _map.invalidateSize(), 50);
  };

  // ---- SATELITSKI SLOJ ----
  window.toggleMapaSat = function () {
    _isSat = !_isSat;
    if (_isSat) {
      if (_osmLayer) _map.removeLayer(_osmLayer);
      if (!_satLayer) {
        _satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '© Esri',
          maxZoom: 19
        });
      }
      _satLayer.addTo(_map);
    } else {
      if (_satLayer) _map.removeLayer(_satLayer);
      if (_osmLayer) _osmLayer.addTo(_map);
    }
    const btn = document.getElementById('karta-sat-btn');
    if (btn) btn.textContent = _isSat ? '🗺️ OSM' : '🛰️ Satelit';
  };

  // ---- PRETRAGA ----
  window.searchKartaOdjel = function () {
    const term = (document.getElementById('karta-search') || {}).value || '';
    const q = term.trim().toUpperCase();
    if (!q) {
      _allFeatures.forEach(l => {
        if (!_map.hasLayer(l)) l.addTo(_map);
      });
      return;
    }
    let found = null;
    _allFeatures.forEach(lyr => {
      const p = lyr._kartaProps || {};
      const o = String(p.odjel || p.name || '').trim().toUpperCase();
      const g = String(p.gj || '').trim().toUpperCase();
      if (o === q || o.startsWith(q) || g.includes(q)) {
        if (!_map.hasLayer(lyr)) lyr.addTo(_map);
        if (!found) found = lyr;
      } else {
        if (_map.hasLayer(lyr)) _map.removeLayer(lyr);
      }
    });
    if (found) {
      const b = found.getBounds ? found.getBounds() : null;
      if (b && b.isValid()) _map.fitBounds(b, {
        padding: [60, 60],
        maxZoom: 14
      });
      found.setStyle(_getHoverStyle(found._kartaStatus));
      setTimeout(() => {
        if (_layer) _layer.resetStyle(found);
      }, 2000);
    }
  };
  window.clearKartaSearch = function () {
    const inp = document.getElementById('karta-search');
    if (inp) inp.value = '';
    applyKartaFilter();
  };

  // ---- FILTER ----
  window.applyKartaFilter = function () {
    const gjF = (document.getElementById('karta-filter-gj') || {}).value || 'sve';
    const stF = (document.getElementById('karta-filter-status') || {}).value || 'sve';
    const q = ((document.getElementById('karta-search') || {}).value || '').trim().toUpperCase();
    _otpremaMode = (document.getElementById('karta-otprema-toggle') || {}).checked || false;
    let otpremaBroj = 0;
    _allFeatures.forEach(lyr => {
      const p = lyr._kartaProps || {};
      const o = String(p.odjel || p.name || '').trim().toUpperCase();
      const gjM = gjF === 'sve' || lyr._kartaGj === gjF;
      const stM = stF === 'sve' || lyr._kartaStatus === stF;
      const qM = !q || o.startsWith(q) || String(p.gj || '').toUpperCase().includes(q);
      // U režimu otpreme prikaži SAMO odjele s otpremom u tekućem mjesecu
      // (uključujući bez-plana/slučajne/prelazne) — ostali se sakriju.
      const otM = !_otpremaMode || lyr._kartaOtpremaMjesec > 0;
      if (gjM && stM && qM && otM) {
        if (!_map.hasLayer(lyr)) lyr.addTo(_map);
        if (_otpremaMode) {
          lyr.setStyle(_getOtpremaStyle(lyr._kartaStatus));
          otpremaBroj++;
        } else if (_layer) {
          _layer.resetStyle(lyr);
        }
      } else {
        if (_map.hasLayer(lyr)) _map.removeLayer(lyr);
      }
    });

    // Info traka pored checkboxa — koliko odjela ima otpremu i za koji mjesec
    const info = document.getElementById('karta-otprema-info');
    if (info) {
      if (_otpremaMode) {
        const naziv = _statusMap && _statusMap._otpremaMjesecNaziv || 'tekući mjesec';
        info.textContent = `${otpremaBroj} odjela s otpremom — ${naziv}`;
        info.style.display = 'inline';
      } else {
        info.style.display = 'none';
      }
    }
  };
  window.resetKartaView = function () {
    const s = document.getElementById('karta-search');
    if (s) s.value = '';
    document.getElementById('karta-filter-gj').value = 'sve';
    document.getElementById('karta-filter-status').value = 'sve';
    const ot = document.getElementById('karta-otprema-toggle');
    if (ot) ot.checked = false;
    applyKartaFilter();
    if (_mapBounds && _mapBounds.isValid()) _map.fitBounds(_mapBounds, {
      padding: [20, 20]
    });
  };
  let _labelMarkers = []; // permanentni labeli po odjelu

  // ---- ZOOM-RESPONSIVE LABELI ----
  let _labelStyleEl = null;
  function _updateLabelSizes() {
    const z = _map ? _map.getZoom() : 12;
    // font-size po zoom nivou; ispod 11 sakrij labele
    const size = z >= 16 ? 15 : z >= 15 ? 13 : z >= 14 ? 11 : z >= 13 ? 9 : z >= 12 ? 7 : z >= 11 ? 5 : 0;
    const vis = size > 0 ? 'visible' : 'hidden';
    if (!_labelStyleEl) {
      _labelStyleEl = document.createElement('style');
      _labelStyleEl.id = 'karta-label-zoom-style';
      document.head.appendChild(_labelStyleEl);
    }
    _labelStyleEl.textContent = `.karta-tooltip { font-size:${size}px !important; visibility:${vis}; padding:${size > 0 ? '2px 6px' : '0'} !important; }`;
  }

  // ---- RENDEROVANJE ----
  function _renderLayer(geojson, statusMap) {
    if (_layer) {
      _map.removeLayer(_layer);
      _layer = null;
    }
    _labelMarkers.forEach(m => _map.removeLayer(m));
    _labelMarkers = [];
    _allFeatures = [];
    if (!geojson || !geojson.features || !geojson.features.length) {
      const ld = document.getElementById('karta-loading');
      if (ld) {
        ld.style.display = 'flex';
        ld.textContent = '📭 Nema podataka o poligonima.';
      }
      return;
    }
    const ld = document.getElementById('karta-loading');
    if (ld) ld.style.display = 'none';
    _layer = L.geoJSON(geojson, {
      style: feature => {
        const p = feature.properties || {};
        const key = _labelKey((p.gj || '') + ' ' + (p.odjel || p.name || ''));
        const info = statusMap.get(key);
        const isSluc = !info && _slucajniSet.has(key);
        const isPrelazni = !info && !isSluc && _prelazniSetGlobal.has(key);
        return _getStyle(info ? info.status : isSluc ? 'slucajni' : isPrelazni ? 'prelazni' : 'bez-plana');
      },
      onEachFeature: (feature, lyr) => {
        const props = feature.properties || {};
        const odjel = String(props.odjel || props.name || '').trim();
        const gj = String(props.gj || '').trim();
        const key = _labelKey(gj + ' ' + odjel); // bez /N stripa — 64/1 ≠ 64/2
        const info = statusMap.get(key);
        const isSluc = !info && _slucajniSet.has(key);
        const isPrelazni = !info && !isSluc && _prelazniSetGlobal.has(key);
        const status = info ? info.status : isSluc ? 'slucajni' : isPrelazni ? 'prelazni' : 'bez-plana';
        lyr._kartaStatus = status;
        lyr._kartaGj = gj;
        lyr._kartaInfo = info;
        lyr._kartaProps = props;
        lyr._kartaExtra = !info ? statusMap._extra && statusMap._extra.get(key) || null : null;
        // Otprema tekućeg mjeseca za ovaj odjel (m³) — za "Prikaz otpreme" filter.
        // Precizan match (čuva /N) + fallback (bez /N, samo za agregatne unose
        // bez preciznog pododsjeka) — vidi komentar u _buildStatusMap.
        const otPreciseKey = _baseKey(_labelKey(gj + ' ' + odjel));
        const otFallbackKey = _baseKey(_normKey(gj + ' ' + odjel));
        const otPrecise = statusMap._otpremaPrecise ? statusMap._otpremaPrecise.get(otPreciseKey) || 0 : 0;
        const otFallback = statusMap._otpremaFallback ? statusMap._otpremaFallback.get(otFallbackKey) || 0 : 0;
        lyr._kartaOtpremaMjesec = otPrecise + otFallback;
        _allFeatures.push(lyr);

        // Hover tooltip za odjele bez permanentnog labela
        if (status === 'bez-plana' || status === 'prelazni') {
          lyr.bindTooltip(odjel || '?', {
            permanent: false,
            direction: 'center',
            className: 'karta-tooltip'
          });
        }
        lyr.on('mouseover', function () {
          this.setStyle(_getHoverStyle(this._kartaStatus));
        });
        lyr.on('mouseout', function () {
          // U režimu otpreme zadrži otprema-highlight umjesto default stila
          if (_otpremaMode && this._kartaOtpremaMjesec > 0) this.setStyle(_getOtpremaStyle(this._kartaStatus));else if (_layer) _layer.resetStyle(this);
        });
        lyr.on('click', function (e) {
          const center = _centroid(this) || e.latlng;
          const label = String(this._kartaProps.odjel || this._kartaProps.name || '?');
          if (_odjelRutaMode) {
            if (!_odjelRutaFrom) {
              // Odabir polazišta
              _odjelRutaFrom = {
                latlng: center,
                label
              };
              _odjelRutaFromMark = L.circleMarker(center, {
                radius: 10,
                color: '#dc2626',
                fillColor: '#fca5a5',
                fillOpacity: 0.9,
                weight: 3
              }).bindTooltip(`Polazište: Odjel ${label}`, {
                permanent: true,
                direction: 'top',
                offset: [0, -8]
              }).addTo(_map);
              const hint = document.getElementById('mapa-ruta-hint');
              if (hint) hint.textContent = `🎯 Polazište: Odjel ${label} — kliknite na odredišni odjel`;
            } else {
              // Odabir odredišta — crtaj rutu
              const from = _odjelRutaFrom;
              _clearOdjelRutaState();
              _drawOdjelRuta(from.latlng, center, from.label, label);
            }
            return;
          }
          _openDetaljiModal(this._kartaProps, this._kartaInfo, center, this._kartaExtra);
        });
      }
    });
    _layer.addTo(_map);

    // ---- JEDAN LABEL PO ODJELU ----
    // Grupisati poligone po odjelu, naći zajednički centar, dodati jedan label
    const odjelGroups = new Map(); // _labelKey(gj+odjel) → { lyrs, odjel, isSluc }
    _allFeatures.forEach(lyr => {
      const p = lyr._kartaProps || {};
      const odjel = String(p.odjel || p.name || '').trim();
      const gj = String(p.gj || '').trim();
      const key = _labelKey(gj + ' ' + odjel); // preservira /N razlike
      const status = lyr._kartaStatus;
      const showLabel = status !== 'bez-plana' && status !== 'prelazni';
      if (!showLabel) return;
      if (!odjelGroups.has(key)) {
        odjelGroups.set(key, {
          lyrs: [],
          odjel,
          isSluc: status === 'slucajni'
        });
      }
      const grp = odjelGroups.get(key);
      grp.lyrs.push(lyr);
    });
    odjelGroups.forEach(grp => {
      // Centar najvećeg odsjeka u grupi (najveći bounding box po površini)
      let bestLyr = null,
        bestArea = -1;
      grp.lyrs.forEach(lyr => {
        try {
          const b = lyr.getBounds();
          const area = (b.getNorth() - b.getSouth()) * (b.getEast() - b.getWest());
          if (area > bestArea) {
            bestArea = area;
            bestLyr = lyr;
          }
        } catch (_) {}
      });
      if (!bestLyr) return;
      let center;
      try {
        center = bestLyr.getBounds().getCenter();
      } catch (_) {
        return;
      }
      const cls = grp.isSluc ? 'karta-tooltip karta-tooltip-slucajni' : 'karta-tooltip';
      const tip = L.tooltip({
        permanent: true,
        direction: 'center',
        className: cls,
        interactive: false,
        opacity: 1
      }).setContent(grp.odjel).setLatLng(center).addTo(_map);
      _labelMarkers.push(tip);
    });

    // Sačuvaj bounds za Reset dugme, ali ne fituj automatski
    try {
      _mapBounds = _layer.getBounds();
    } catch (e) {}

    // Marker šumarije
    if (!_sumarijaMark) {
      _sumarijaMark = L.marker(SUMARIJA_LATLNG, {
        icon: L.divIcon({
          html: '<div style="background:#166534;color:white;font-size:11px;font-weight:700;padding:4px 8px;border-radius:6px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.3);transform:translateX(-50%);">🏢 Šumarija Bosanska Krupa</div>',
          className: '',
          iconAnchor: [0, 0]
        })
      }).addTo(_map);
      _sumarijaMark.bindTooltip('Šumarija Bosanska Krupa — Trg Alije Izetbegovića 1');
    }
  }

  // ---- UČITAVANJE ----
  async function _loadArr(endpoint, cacheKey, dataKey, force) {
    try {
      const url = typeof buildApiUrl === 'function' ? buildApiUrl(endpoint) : null;
      if (!url) return [];
      const data = await fetchWithCache(url, cacheKey, force || false, 150000);
      return data && data[dataKey] ? data[dataKey] : [];
    } catch (e) {
      console.warn('[Mapa]', endpoint, 'failed:', e.message);
      try {
        // Veliki ključevi (primke/otpreme) žive u IndexedDB, ne localStorage
        if ((cacheKey === 'cache_primke_sjeca' || cacheKey === 'cache_otpreme_tab') && window.IDBHelper) {
          const entry = await window.IDBHelper.getMeta('blob_' + cacheKey);
          if (entry && entry.data) return entry.data[dataKey] || [];
        } else {
          const raw = typeof _resolveCacheRaw === 'function' ? _resolveCacheRaw(cacheKey) : localStorage.getItem(cacheKey);
          if (raw) {
            const obj = JSON.parse(raw);
            return obj && obj.data && obj.data[dataKey] || [];
          }
        }
      } catch (_) {}
      return [];
    }
  }
  async function _loadGeojson() {
    if (_geojson) return _geojson;
    const ld = document.getElementById('karta-loading');

    // VAŽNO: GeoJSON (7.5MB!) se VIŠE NE ČUVA u localStorage — mobilni browseri
    // imaju kvotu od svega 5-10MB, pa je sam GeoJSON gutao gotovo cijelu kvotu.
    // Posljedica: preload podataka za tabove (cache_*) je pucao na QuotaExceeded
    // i tabovi su offline bili prazni. Offline poligone sada služi ISKLJUČIVO
    // Service Worker keš (fetch handler za .geojson je cache-first).
    const VER_KEY = 'geojson_version';
    const GEO_KEY = 'geojson_data';
    // Jednokratno čišćenje legacy zapisa — odmah oslobodi ~7.5MB za podatke tabova
    try {
      localStorage.removeItem(GEO_KEY);
      localStorage.removeItem(VER_KEY);
    } catch (_) {}
    try {
      if (ld) {
        ld.style.display = 'flex';
        ld.textContent = '⏳ Učitavam poligone (može potrajati)...';
      }
      // Bez cache:'reload' — pusti SW cache-first handler da posluži keširanu
      // kopiju (i offline i online); SW u pozadini sam osvježava svoju kopiju
      const r = await fetch(GEOJSON_URL);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const text = await r.text();
      if (ld) ld.textContent = '⏳ Parsiram ' + Math.round(text.length / 1024) + ' KB...';
      _geojson = JSON.parse(text);
      return _geojson;
    } catch (e) {
      console.error('[Mapa] GeoJSON fetch failed:', e);
      if (ld) {
        ld.style.display = 'flex';
        ld.textContent = '❌ Greška pri učitavanju poligona: ' + e.message;
      }
      return {
        type: 'FeatureCollection',
        features: []
      };
    }
  }

  // ---- INICIJALIZACIJA ----
  window.initKartaOdjela = async function (force) {
    const mapDiv = document.getElementById('karta-odjela-map');
    if (!mapDiv) return;
    const content = document.getElementById('karta-odjela-content');
    if (content) content.classList.remove('hidden');
    if (!_map) {
      const ld = document.getElementById('karta-loading');
      if (ld) ld.style.display = 'none';

      // Backdrop click zatvara modal
      const modal = document.getElementById('mapa-modal');
      if (modal) modal.addEventListener('click', function (e) {
        if (e.target === modal) closeMapaModal();
      });
      _map = L.map('karta-odjela-map', {
        center: SUMARIJA_LATLNG,
        zoom: 12,
        zoomControl: true
      });
      _osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18
      });
      _osmLayer.addTo(_map);

      // Zoom-responsive labeli
      _map.on('zoomend', _updateLabelSizes);
      _updateLabelSizes();
    } else if (!force) {
      _map.invalidateSize();
      return;
    }
    setTimeout(() => {
      if (_map) _map.invalidateSize();
    }, 100);
    const ld = document.getElementById('karta-loading');
    if (ld) {
      ld.style.display = 'flex';
      ld.textContent = navigator.onLine ? '⏳ Učitavam podatke...' : '📦 Učitavam keširano stanje...';
    }
    const [geojson, primke, otpreme] = await Promise.all([_loadGeojson(), _loadArr('primke', CACHE_SJECA, 'primke', force), _loadArr('otpreme', CACHE_OTPR, 'otpreme', force)]);
    _statusMap = _buildStatusMap(primke, otpreme);
    _renderLayer(geojson, _statusMap);
    if (typeof markTabRendered === 'function') markTabRendered('karta-odjela');
    setTimeout(() => {
      if (_map) _map.invalidateSize();
    }, 200);
  };

  // ---- PLAN ENTRIES ----
  // cTrupci=TRUPCI Č, cijepanoC=CEL.DUGA+CEL.CIJEPANA+ŠKART, lTrupci=TRUPCI L, cijepanoL=OGR.DUGI+OGR.CIJEPANI+GULE
  function _planEntries() {
    return [{
      gj: 'Risovac Krupa',
      odjel: '13',
      bruto: 3244,
      neto: 2768,
      cTrupci: 3,
      cijepanoC: 2,
      lTrupci: 875,
      cijepanoL: 1888
    }, {
      gj: 'Risovac Krupa',
      odjel: '35',
      bruto: 5417,
      neto: 4648,
      cTrupci: 122,
      cijepanoC: 44,
      lTrupci: 1813,
      cijepanoL: 2670
    }, {
      gj: 'Risovac Krupa',
      odjel: '50',
      bruto: 5161,
      neto: 4329,
      cTrupci: 1824,
      cijepanoC: 227,
      lTrupci: 971,
      cijepanoL: 1307
    }, {
      gj: 'Risovac Krupa',
      odjel: '54P',
      bruto: 1511,
      neto: 1276,
      cTrupci: 639,
      cijepanoC: 109,
      lTrupci: 208,
      cijepanoL: 320
    }, {
      gj: 'Risovac Krupa',
      odjel: '55',
      bruto: 5195,
      neto: 4258,
      cTrupci: 2193,
      cijepanoC: 328,
      lTrupci: 789,
      cijepanoL: 948
    }, {
      gj: 'Risovac Krupa',
      odjel: '56',
      bruto: 3877,
      neto: 3206,
      cTrupci: 1779,
      cijepanoC: 263,
      lTrupci: 439,
      cijepanoL: 725
    }, {
      gj: 'Risovac Krupa',
      odjel: '59/1',
      bruto: 3724,
      neto: 3087,
      cTrupci: 1545,
      cijepanoC: 208,
      lTrupci: 658,
      cijepanoL: 676
    }, {
      gj: 'Risovac Krupa',
      odjel: '63',
      bruto: 4033,
      neto: 3339,
      cTrupci: 1309,
      cijepanoC: 236,
      lTrupci: 796,
      cijepanoL: 998
    }, {
      gj: 'Risovac Krupa',
      odjel: '66',
      bruto: 2645,
      neto: 2307,
      cTrupci: 0,
      cijepanoC: 52,
      lTrupci: 949,
      cijepanoL: 1307
    }, {
      gj: 'Risovac Krupa',
      odjel: '68/2',
      bruto: 2605,
      neto: 2287,
      cTrupci: 35,
      cijepanoC: 6,
      lTrupci: 1012,
      cijepanoL: 1234
    }, {
      gj: 'Risovac Krupa',
      odjel: '71P',
      bruto: 1957,
      neto: 1655,
      cTrupci: 664,
      cijepanoC: 114,
      lTrupci: 401,
      cijepanoL: 476
    }, {
      gj: 'Risovac Krupa',
      odjel: '97',
      bruto: 4889,
      neto: 4058,
      cTrupci: 1253,
      cijepanoC: 236,
      lTrupci: 901,
      cijepanoL: 1668
    }, {
      gj: 'Risovac Krupa',
      odjel: '113P',
      bruto: 5177,
      neto: 4300,
      cTrupci: 225,
      cijepanoC: 74,
      lTrupci: 1278,
      cijepanoL: 2723
    }, {
      gj: 'Grmeč Jasenica',
      odjel: '4/1',
      bruto: 2490,
      neto: 2117,
      cTrupci: 0,
      cijepanoC: 0,
      lTrupci: 303,
      cijepanoL: 1814
    }, {
      gj: 'Grmeč Jasenica',
      odjel: '11P',
      bruto: 208,
      neto: 179,
      cTrupci: 0,
      cijepanoC: 0,
      lTrupci: 73,
      cijepanoL: 106
    }, {
      gj: 'Grmeč Jasenica',
      odjel: '43P',
      bruto: 1099,
      neto: 740,
      cTrupci: 40,
      cijepanoC: 100,
      lTrupci: 160,
      cijepanoL: 440
    }, {
      gj: 'Grmeč Jasenica',
      odjel: '60',
      bruto: 3551,
      neto: 3061,
      cTrupci: 295,
      cijepanoC: 65,
      lTrupci: 1050,
      cijepanoL: 1651
    }, {
      gj: 'Grmeč Jasenica',
      odjel: '61',
      bruto: 4774,
      neto: 4105,
      cTrupci: 454,
      cijepanoC: 102,
      lTrupci: 1393,
      cijepanoL: 2156
    }, {
      gj: 'Grmeč Jasenica',
      odjel: '64/2P',
      bruto: 996,
      neto: 608,
      cTrupci: 13,
      cijepanoC: 23,
      lTrupci: 211,
      cijepanoL: 361
    }, {
      gj: 'Grmeč Jasenica',
      odjel: '66',
      bruto: 5339,
      neto: 4493,
      cTrupci: 0,
      cijepanoC: 0,
      lTrupci: 1025,
      cijepanoL: 3468
    }, {
      gj: 'Grmeč Jasenica',
      odjel: '67',
      bruto: 4853,
      neto: 4199,
      cTrupci: 0,
      cijepanoC: 0,
      lTrupci: 1530,
      cijepanoL: 2669
    }, {
      gj: 'Grmeč Jasenica',
      odjel: '69P',
      bruto: 1309,
      neto: 1204,
      cTrupci: 82,
      cijepanoC: 32,
      lTrupci: 390,
      cijepanoL: 700
    }, {
      gj: 'Grmeč Jasenica',
      odjel: '85P',
      bruto: 678,
      neto: 418,
      cTrupci: 0,
      cijepanoC: 73,
      lTrupci: 25,
      cijepanoL: 320
    }, {
      gj: 'Grmeč Jasenica',
      odjel: '88P',
      bruto: 1805,
      neto: 1200,
      cTrupci: 0,
      cijepanoC: 0,
      lTrupci: 20,
      cijepanoL: 1180
    }, {
      gj: 'Vojskova',
      odjel: '15',
      bruto: 450,
      neto: 383,
      cTrupci: 0,
      cijepanoC: 0,
      lTrupci: 0,
      cijepanoL: 383
    }, {
      gj: 'Vojskova',
      odjel: '21P',
      bruto: 787,
      neto: 624,
      cTrupci: 0,
      cijepanoC: 0,
      lTrupci: 202,
      cijepanoL: 422
    }, {
      gj: 'Vojskova',
      odjel: '25',
      bruto: 750,
      neto: 637,
      cTrupci: 0,
      cijepanoC: 0,
      lTrupci: 0,
      cijepanoL: 637
    }];
  }

  // ---- PLAN 2027 ----
  function _plan2027Entries() {
    return [{
      gj: 'Grmeč Jasenica',
      odjel: '5/1'
    }, {
      gj: 'Grmeč Jasenica',
      odjel: '5/2'
    }, {
      gj: 'Grmeč Jasenica',
      odjel: '68'
    }, {
      gj: 'Grmeč Jasenica',
      odjel: '8'
    }, {
      gj: 'Grmeč Jasenica',
      odjel: '80'
    }, {
      gj: 'Grmeč Jasenica',
      odjel: '81'
    }, {
      gj: 'Risovac Krupa',
      odjel: '112'
    }, {
      gj: 'Risovac Krupa',
      odjel: '120'
    }, {
      gj: 'Risovac Krupa',
      odjel: '14'
    }, {
      gj: 'Risovac Krupa',
      odjel: '34'
    }, {
      gj: 'Risovac Krupa',
      odjel: '4'
    }, {
      gj: 'Risovac Krupa',
      odjel: '44/1P'
    }, {
      gj: 'Risovac Krupa',
      odjel: '5'
    }, {
      gj: 'Risovac Krupa',
      odjel: '6'
    }, {
      gj: 'Risovac Krupa',
      odjel: '60'
    }, {
      gj: 'Risovac Krupa',
      odjel: '7'
    }, {
      gj: 'Risovac Krupa',
      odjel: '78'
    }, {
      gj: 'Risovac Krupa',
      odjel: '81'
    }, {
      gj: 'Vojskova',
      odjel: '15'
    }, {
      gj: 'Vojskova',
      odjel: '22'
    }, {
      gj: 'Vojskova',
      odjel: '23/2'
    }, {
      gj: 'Vojskova',
      odjel: '25'
    }];
  }

  // ---- EXPORT (dodano za integraciju sa "Raspored vozila", 20-mapaVozilaOverlay.jsx) ----
  // Čisto ADITIVNO — ne mijenja nijednu postojeću funkciju/ponašanje iznad. Izlaže samo
  // reference potrebne da se raspored kamiona (Raspored-radnika truckRows) poveže sa istim
  // geojson poligonima/key-matching logikom koju karta već koristi za primke/otpreme.
  window.__mapaOdjelaInternal = {
    normKey: _normKey,
    labelKey: _labelKey,
    baseKey: _baseKey,
    getMap: () => _map,
    getLayerGroup: () => _layer,
    getAllFeatures: () => _allFeatures,
    getCentroid: lyr => _centroid(lyr),
    SUMARIJA_LATLNG: SUMARIJA_LATLNG,
    OSRM_URL: OSRM_URL
  };
})();
// ─── MAPA ODJELA — React wrapper ────────────────────────────────────────────
// Kontejneri i modal ovdje SAMO drže DOM čvorove sa istim id-jevima koje
// 18-karta-odjela.jsx (neizmijenjen vanilla modul, preuzet iz pogonboskrupa/sumarija)
// očekuje i puni imperativno (getElementById + innerHTML/style). Zato JSX ovih čvorova
// namjerno nema dinamičkog React sadržaja/state-a — spriječava da React na sljedećem
// re-renderu "vrati" ono što je vanilla skripta upisala (Leaflet panes, modal HTML...).
function MapaOdjelaView(_ref60) {
  let {
    active,
    schedules,
    departments,
    workers,
    vehicles
  } = _ref60;
  useEffect(() => {
    if (active && typeof window.initKartaOdjela === 'function') {
      window.initKartaOdjela(false);
    }
  }, [active]);

  // ── Raspored vozača (integracija sa glavnim Rasporedom radnika) ──
  // NIJE vezano za "Raspored kamiona" — ti kamioni su kupčevi i kreću sa svoje
  // lokacije, ne od Šumarije. Ovdje se gleda ko od VLASTITIH vozača je raspoređen
  // na koji odjel tog dana. VAŽNO: vozač NIJE član row.allWorkers (kao ostali
  // radnici) — vezan je za VOZILO dodijeljeno redu (row.vehicleIds/vehicleId →
  // vehicle.driverId), a row.otherDriverId je samo DNEVNI izuzetak kad tim
  // vozilom danas vozi neko drugi (isto kao što ScheduleView prikazuje 🧑‍✈️/🔄
  // ikonom u koloni "Vozilo"). Zato se ovdje mora ići preko vozila, ne allWorkers.
  // Rute/highlight ostaju imperativni (Leaflet, u 20-mapaVozacOverlay.jsx) — samo
  // rezultat (lista za prikaz) se drži u React state-u da se lijepo renderuje.
  const [vozilaDate, setVozilaDate] = useState(today());
  const [vozilaResult, setVozilaResult] = useState(null);
  const [vozilaLoading, setVozilaLoading] = useState(false);

  // Grupiši schedules za dati dan po odjelu — samo redovi koji stvarno imaju
  // vozača (preko dodijeljenog vozila → vehicle.driverId, ili otherDriverId ako
  // je neko drugi vozio tog dana; dodatno i category==='vozac' u allWorkers kao
  // odbrambeni fallback za slučaj da je negdje ipak direktno upisan).
  const buildVozacGroups = dateStr => {
    const dayRows = (schedules || []).filter(s => s.date === dateStr && s.deptId);
    const groups = new Map(); // deptId → { label, drivers:Set, jobTypes:Set }
    dayRows.forEach(s => {
      const dept = (departments || []).find(d => d.id === s.deptId);
      if (!dept) return;
      const driverIds = (s.allWorkers || []).filter(wid => {
        const w = (workers || []).find(x => x.id === wid);
        return w && w.category === 'vozac';
      });
      const vIds = s.vehicleIds && s.vehicleIds.length > 0 ? s.vehicleIds : s.vehicleId ? [s.vehicleId] : [];
      vIds.forEach(vid => {
        const v = (vehicles || []).find(x => x.id === vid);
        const driverId = s.otherDriverId || v && v.driverId;
        if (driverId) driverIds.push(driverId);
      });
      if (!driverIds.length) return;
      if (!groups.has(s.deptId)) {
        groups.set(s.deptId, {
          key: s.deptId,
          label: `${dept.gospodarskaJedinica} ${dept.brojOdjela}`,
          drivers: new Set(),
          jobTypes: new Set()
        });
      }
      const grp = groups.get(s.deptId);
      driverIds.forEach(id => {
        const w = (workers || []).find(x => x.id === id);
        grp.drivers.add(w ? w.name : id);
      });
      grp.jobTypes.add(s.jobType);
    });
    return [...groups.values()].map(g => ({
      key: g.key,
      label: g.label,
      drivers: [...g.drivers],
      jobTypes: [...g.jobTypes]
    }));
  };
  const handlePrikaziRute = async () => {
    if (typeof window.showMapaVozacRute !== 'function') return;
    setVozilaLoading(true);
    setVozilaResult(null);
    try {
      const groups = buildVozacGroups(vozilaDate);
      const res = await window.showMapaVozacRute(groups);
      setVozilaResult(res);
    } catch (e) {
      setVozilaResult({
        matched: [],
        unmatched: [],
        error: e.message
      });
    } finally {
      setVozilaLoading(false);
    }
  };
  const handleClearRute = () => {
    if (typeof window.clearMapaVozacRute === 'function') window.clearMapaVozacRute();
    setVozilaResult(null);
  };
  return /*#__PURE__*/React.createElement("div", {
    id: "karta-odjela-content"
  }, /*#__PURE__*/React.createElement("style", null, `
        #karta-odjela-map { width:100%; height:calc(100vh - 260px); min-height:400px; background:#f1f5f9; }
        @media (max-width:1024px) { #karta-odjela-map { height:calc(100vh - 240px); min-height:320px; } }
        @media (max-width:640px)  { #karta-odjela-map { height:calc(100vh - 270px); min-height:260px; } }

        body.mapa-fokus .app-header { padding:4px 16px !important; min-height:0 !important; }
        body.mapa-fokus .app-header .app-title { display:none !important; }
        body.mapa-fokus .nav-tabs { display:none !important; }
        body.mapa-fokus #karta-odjela-map { height:calc(100vh - 60px) !important; }
        body.mapa-fokus #mapa-modal { top:6px !important; }
        @media (max-width:640px) {
          body.mapa-fokus #karta-odjela-map { height:calc(100vh - 70px) !important; }
        }
        #karta-fokus-btn.active { background:#1e40af !important; color:white !important; border-color:#1e40af !important; }
        @media (min-width:1024px) {
          #mapa-modal { justify-content:flex-start; align-items:stretch; }
          #mapa-modal-panel { width:400px; max-width:400px; min-height:unset; max-height:calc(100vh - 44px); border-radius:0 0 12px 0; }
        }
        @media (min-width:1440px) {
          #mapa-modal-panel { width:460px; max-width:460px; }
        }

        .karta-tooltip { background:white; border:1px solid #d1d5db; border-radius:5px; padding:2px 6px; font-weight:800; color:#1e293b; box-shadow:0 2px 6px rgba(0,0,0,.2); white-space:nowrap; transition:font-size .15s; }
        .karta-tooltip::before { display:none; }
        .karta-tooltip-slucajni { background:#7c3aed; border-color:#6d28d9; color:white; }
        .leaflet-marker-icon.karta-tooltip { background:white; border:1px solid #d1d5db; }
        .leaflet-marker-icon.karta-tooltip-slucajni { background:#7c3aed; border-color:#6d28d9; color:white; }
      `), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '1rem 1rem 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-header",
    style: {
      marginBottom: '0.75rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, "\uD83D\uDDFA\uFE0F Mapa odjela ", PLAN_YEAR_LABEL), /*#__PURE__*/React.createElement("span", {
    className: "tag"
  }, "Prostorni prikaz odjela po statusu realizacije plana sje\u010De"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm no-print",
    style: {
      marginLeft: 'auto'
    },
    onClick: () => window.initKartaOdjela && window.initKartaOdjela(true)
  }, "\uD83D\uDD04 Osvje\u017Ei")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      alignItems: 'center',
      marginBottom: 10,
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: 10,
      padding: '10px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: '#374151'
    }
  }, "GJ:"), /*#__PURE__*/React.createElement("select", {
    id: "karta-filter-gj",
    onChange: () => window.applyKartaFilter && window.applyKartaFilter(),
    style: {
      fontSize: 12,
      padding: '4px 8px',
      border: '1px solid #d1d5db',
      borderRadius: 6,
      background: 'white'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "sve"
  }, "Sve GJ"), /*#__PURE__*/React.createElement("option", {
    value: "Risovac Krupa"
  }, "Risovac Krupa"), /*#__PURE__*/React.createElement("option", {
    value: "Grme\u010D Jasenica"
  }, "Grme\u010D Jasenica"), /*#__PURE__*/React.createElement("option", {
    value: "Vojskova"
  }, "Vojskova"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: '#374151'
    }
  }, "Status:"), /*#__PURE__*/React.createElement("select", {
    id: "karta-filter-status",
    onChange: () => window.applyKartaFilter && window.applyKartaFilter(),
    style: {
      fontSize: 12,
      padding: '4px 8px',
      border: '1px solid #d1d5db',
      borderRadius: 6,
      background: 'white'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "sve"
  }, "Svi statusi"), /*#__PURE__*/React.createElement("option", {
    value: "plan-2027"
  }, "Plan 2027"), /*#__PURE__*/React.createElement("option", {
    value: "planirano"
  }, "Planirano"), /*#__PURE__*/React.createElement("option", {
    value: "u-sjeci"
  }, "U sje\u010Di"), /*#__PURE__*/React.createElement("option", {
    value: "posjeceno"
  }, "Posje\u010Deno"), /*#__PURE__*/React.createElement("option", {
    value: "bez-plana"
  }, "Bez plana"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("input", {
    id: "karta-search",
    type: "text",
    placeholder: "Broj odjela...",
    onInput: () => window.searchKartaOdjel && window.searchKartaOdjel(),
    style: {
      fontSize: 12,
      padding: '4px 8px',
      border: '1px solid #d1d5db',
      borderRadius: 6,
      width: 110
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => window.searchKartaOdjel && window.searchKartaOdjel(),
    style: {
      fontSize: 12,
      padding: '4px 8px',
      border: '1px solid #d1d5db',
      borderRadius: 6,
      background: 'white',
      cursor: 'pointer'
    }
  }, "\uD83D\uDD0D"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => window.clearKartaSearch && window.clearKartaSearch(),
    style: {
      fontSize: 12,
      padding: '4px 8px',
      border: '1px solid #d1d5db',
      borderRadius: 6,
      background: 'white',
      cursor: 'pointer'
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 12,
      fontWeight: 600,
      color: '#374151',
      cursor: 'pointer',
      background: 'white',
      border: '1px solid #d1d5db',
      borderRadius: 6,
      padding: '4px 10px'
    }
  }, /*#__PURE__*/React.createElement("input", {
    id: "karta-otprema-toggle",
    type: "checkbox",
    onChange: () => window.applyKartaFilter && window.applyKartaFilter(),
    style: {
      cursor: 'pointer',
      margin: 0
    }
  }), "\uD83D\uDE9B Prikaz otpreme"), /*#__PURE__*/React.createElement("span", {
    id: "karta-otprema-info",
    style: {
      fontSize: 11,
      color: '#b45309',
      fontWeight: 700,
      display: 'none'
    }
  }), /*#__PURE__*/React.createElement("button", {
    id: "karta-sat-btn",
    type: "button",
    onClick: () => window.toggleMapaSat && window.toggleMapaSat(),
    style: {
      fontSize: 12,
      padding: '4px 10px',
      border: '1px solid #d1d5db',
      borderRadius: 6,
      background: 'white',
      cursor: 'pointer'
    }
  }, "\uD83D\uDEF0\uFE0F Satelit"), /*#__PURE__*/React.createElement("button", {
    id: "karta-odjel-ruta-btn",
    type: "button",
    onClick: () => window.toggleOdjelRutaMode && window.toggleOdjelRutaMode(),
    style: {
      fontSize: 12,
      padding: '4px 10px',
      border: '1px solid #d1d5db',
      borderRadius: 6,
      background: 'white',
      cursor: 'pointer'
    }
  }, "\uD83D\uDD00 Ruta odjel\u2192odjel"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => window.resetKartaView && window.resetKartaView(),
    style: {
      fontSize: 12,
      padding: '4px 10px',
      border: '1px solid #d1d5db',
      borderRadius: 6,
      background: 'white',
      cursor: 'pointer'
    }
  }, "\u21BA Reset"), /*#__PURE__*/React.createElement("button", {
    id: "karta-fokus-btn",
    type: "button",
    title: "Mapa u prvom planu",
    onClick: () => window.toggleMapaFokus && window.toggleMapaFokus(),
    style: {
      fontSize: 12,
      padding: '4px 10px',
      border: '1px solid #d1d5db',
      borderRadius: 6,
      background: 'white',
      cursor: 'pointer'
    }
  }, "\u26F6 Fokus"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginLeft: 'auto',
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      display: 'flex',
      alignItems: 'center',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      width: 12,
      height: 12,
      background: '#2563eb',
      borderRadius: 2
    }
  }), "Plan sje\u010Da 2027"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      display: 'flex',
      alignItems: 'center',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      width: 12,
      height: 12,
      background: '#eab308',
      borderRadius: 2
    }
  }), "Planirano"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      display: 'flex',
      alignItems: 'center',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      width: 12,
      height: 12,
      background: '#dc2626',
      borderRadius: 2
    }
  }), "U sje\u010Di"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      display: 'flex',
      alignItems: 'center',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      width: 12,
      height: 12,
      background: '#16a34a',
      borderRadius: 2
    }
  }), "Posje\u010Deno"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      display: 'flex',
      alignItems: 'center',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      width: 12,
      height: 12,
      background: '#7c3aed',
      borderRadius: 2
    }
  }), "Slu\u010Dajni"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      display: 'flex',
      alignItems: 'center',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      width: 12,
      height: 12,
      background: '#0891b2',
      borderRadius: 2
    }
  }), "Nekategorisan"))), /*#__PURE__*/React.createElement("div", {
    id: "mapa-ruta-hint",
    style: {
      display: 'none',
      padding: '8px 14px',
      background: '#fef2f2',
      border: '1px solid #fca5a5',
      borderRadius: 8,
      fontSize: 13,
      color: '#dc2626',
      fontWeight: 600,
      marginBottom: 8
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      alignItems: 'center',
      marginBottom: 10,
      background: '#fff7ed',
      border: '1px solid #fed7aa',
      borderRadius: 10,
      padding: '10px 14px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: '#9a3412'
    }
  }, "\uD83D\uDE97 Raspored voza\u010Da:"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: vozilaDate,
    onChange: e => setVozilaDate(e.target.value),
    style: {
      fontSize: 12,
      padding: '4px 8px',
      border: '1px solid #d1d5db',
      borderRadius: 6
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handlePrikaziRute,
    disabled: vozilaLoading,
    style: {
      fontSize: 12,
      padding: '4px 10px',
      border: '1px solid #ea580c',
      borderRadius: 6,
      background: vozilaLoading ? '#fed7aa' : '#ea580c',
      color: 'white',
      cursor: vozilaLoading ? 'default' : 'pointer',
      fontWeight: 600
    }
  }, vozilaLoading ? '⏳ Računam rute...' : '🛣️ Prikaži rute za dan'), vozilaResult && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleClearRute,
    style: {
      fontSize: 12,
      padding: '4px 10px',
      border: '1px solid #d1d5db',
      borderRadius: 6,
      background: 'white',
      cursor: 'pointer'
    }
  }, "\u2715 O\u010Disti rute"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    title: "Izra\u010Dunate rute (\u0160umarija\u2192odjel) se pamte lokalno da se ne poga\u0111a OSRM server svaki put \u2014 ovo bri\u0161e taj ke\u0161, npr. ako se promijeni putna mre\u017Ea.",
    onClick: () => {
      if (window.clearMapaRutaCache) window.clearMapaRutaCache();
    },
    style: {
      fontSize: 12,
      padding: '4px 10px',
      border: '1px solid #d1d5db',
      borderRadius: 6,
      background: 'white',
      cursor: 'pointer',
      color: '#6b7280',
      marginLeft: 'auto'
    }
  }, "\uD83D\uDDD1\uFE0F Obri\u0161i ke\u0161 ruta"), vozilaResult && !vozilaResult.error && vozilaResult.matched.length === 0 && vozilaResult.unmatched.length === 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: '#9a3412'
    }
  }, "Nema zakazanih voza\u010Da za ", vozilaDate.split('-').reverse().join('.'), "."), vozilaResult && vozilaResult.error && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: '#dc2626',
      fontWeight: 600
    }
  }, vozilaResult.error)), vozilaResult && (vozilaResult.matched.length > 0 || vozilaResult.unmatched.length > 0) && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10,
      background: '#fff7ed',
      border: '1px solid #fed7aa',
      borderRadius: 10,
      padding: '10px 14px'
    }
  }, vozilaResult.matched.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: '#9a3412',
      textTransform: 'uppercase',
      letterSpacing: '.5px',
      marginBottom: 6
    }
  }, vozilaResult.matched.length, " ", vozilaResult.matched.length === 1 ? 'odjel' : 'odjela', " sa voza\u010Dem", (() => {
    const total = vozilaResult.matched.reduce((s, m) => s + (m.distKm || 0), 0);
    return total > 0 ? ` — ukupno ${total.toFixed(1)} km (jednosmjerno, po odjelu)` : '';
  })(), (() => {
    const cachedCount = vozilaResult.matched.filter(m => m.cached).length;
    return cachedCount > 0 ? ` · ${cachedCount} iz keša` : '';
  })()), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, vozilaResult.matched.map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 8,
      fontSize: 12.5,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: m.color,
      flexShrink: 0,
      display: 'inline-block'
    }
  }), /*#__PURE__*/React.createElement("strong", null, m.odjel), /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#6b7280'
    }
  }, m.drivers.join(', '), m.jobTypes && m.jobTypes.length ? ` (${m.jobTypes.join(', ')})` : ''), m.distKm != null ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: '#9a3412',
      marginLeft: 'auto'
    }
  }, m.distKm.toFixed(1), " km \xB7 ~", m.durMin, " min", m.cached && /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500,
      color: '#9ca3af',
      marginLeft: 4
    }
  }, "(ke\u0161)")) : /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#dc2626',
      marginLeft: 'auto'
    }
  }, "Ruta nije uspjela", m.error ? ` (${m.error})` : ''))))), vozilaResult.unmatched.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: '#9ca3af',
      marginTop: vozilaResult.matched.length > 0 ? 8 : 0
    }
  }, "\u26A0\uFE0F Nije prona\u0111eno na mapi (provjeriti odjel/GJ u Odjelima): ", vozilaResult.unmatched.join(', ')))), /*#__PURE__*/React.createElement("div", {
    id: "karta-odjela-map"
  }, /*#__PURE__*/React.createElement("div", {
    id: "karta-loading",
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: '#6b7280',
      fontSize: 14
    }
  }, "\u23F3 U\u010Ditavam kartu...")), /*#__PURE__*/React.createElement("div", {
    id: "mapa-ruta-info",
    style: {
      display: 'none',
      margin: '8px 20px',
      padding: '10px 16px',
      background: '#eff6ff',
      border: '1px solid #bfdbfe',
      borderRadius: 8,
      fontSize: 13,
      color: '#1e40af'
    }
  }), /*#__PURE__*/React.createElement("div", {
    id: "mapa-modal",
    style: {
      display: 'none',
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0,0,0,.5)',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    id: "mapa-modal-panel",
    style: {
      background: 'white',
      borderRadius: '0 0 18px 18px',
      width: '100%',
      maxWidth: 640,
      minHeight: '40vh',
      maxHeight: 'calc(100vh - 44px)',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 8px 40px rgba(0,0,0,.25)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg,#14532d 0%,#166534 100%)',
      color: 'white',
      padding: '8px 14px 10px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    id: "mapa-modal-title",
    style: {
      fontSize: 17,
      fontWeight: 800
    }
  }), /*#__PURE__*/React.createElement("div", {
    id: "mapa-modal-gj",
    style: {
      fontSize: 12,
      opacity: 0.85,
      marginTop: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    id: "mapa-modal-meta",
    style: {
      display: 'none',
      flexDirection: 'column',
      gap: 3,
      marginTop: 6,
      paddingTop: 6,
      borderTop: '1px solid rgba(255,255,255,.25)'
    }
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => window.closeMapaModal && window.closeMapaModal(),
    style: {
      background: 'rgba(255,255,255,.2)',
      border: 'none',
      color: 'white',
      width: 28,
      height: 28,
      borderRadius: 7,
      cursor: 'pointer',
      fontSize: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      marginLeft: 8
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    id: "mapa-modal-body",
    style: {
      padding: '12px 14px 16px',
      overflowY: 'auto',
      flex: 1,
      WebkitOverflowScrolling: 'touch'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flexShrink: 0,
      display: 'flex',
      justifyContent: 'center',
      padding: '8px 0',
      cursor: 'pointer'
    },
    onClick: () => window.closeMapaModal && window.closeMapaModal()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 4,
      background: '#d1d5db',
      borderRadius: 2
    }
  })))));
}
const PLAN_YEAR_LABEL = 2026;
// ─── MAPA ODJELA — RASPORED VOZAČA (integracija sa glavnim Rasporedom radnika) ─
// Novo, samostalno od 18-karta-odjela.jsx (koji ostaje neizmijenjen) — čita
// window.__mapaOdjelaInternal (aditivni export iz karta-odjela.jsx) da poveže
// vozače (workers sa category:'vozac', zakazane na odjel u glavnom Rasporedu) sa
// istim geojson poligonima/key-matching logikom koju karta već koristi za
// primke/otpreme. Za svaki odjel koji ima zakazanog vozača tog dana: nacrta OSRM
// rutu Šumarija→odjel (udaljenost + vrijeme) i istakne poligon odjela na mapi.
//
// NAMJERNO nije vezano za "Raspored kamiona" — ti kamioni su kupčevi, kreću sa
// svoje lokacije, ne od Šumarije, pa im ruta Šumarija→odjel nije relevantna.
// Ovdje su u pitanju VLASTITI vozači firme (radnici kategorije 'vozac' ili
// row.otherDriverId) koji stvarno kreću iz Šumarije.
(function () {
  'use strict';

  const ROUTE_COLORS = ['#ea580c', '#0891b2', '#7c3aed', '#be123c', '#059669', '#ca8a04', '#4338ca', '#c2410c'];
  const HIGHLIGHT_COLOR = '#ea580c';

  // OSRM (javni demo server) računa vrijeme vožnje po opštem "car" profilu i za
  // makadamske/šumske puteve (dio ovih ruta) pretpostavlja prespore brzine — u praksi
  // stvarno vrijeme je oko 55% OSRM procjene. Empirijski faktor, ne mijenja distancu
  // (ta je geometrijski tačna preko stvarne putne mreže), samo prikazano trajanje.
  const ROUTE_DURATION_FACTOR = 0.55;

  // Udaljenost Šumarija→odjel se praktično ne mijenja (putna mreža je stabilna) — keširaj
  // izračunatu OSRM rutu po odjelu u localStorage da se ne pogađa javni OSRM demo server
  // (spor, rate-limituje) svaki put iznova. Ključ je labelKey(gj+odjel) poligona sa kojim je
  // odjel matchovan (stabilan identitet), ne slobodni tekst koji korisnik unese.
  // v2 (ne v1): stari keš je čuvao NEKORIGOVANO trajanje (prije ROUTE_DURATION_FACTOR) —
  // bump verzije ključa da se stare, prespore procjene ne serviraju zauvijek iz keša.
  const ROUTE_CACHE_KEY = 'mapa_ruta_cache_v2';
  function _loadRouteCache() {
    try {
      return JSON.parse(localStorage.getItem(ROUTE_CACHE_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }
  function _saveRouteCache(cache) {
    try {
      localStorage.setItem(ROUTE_CACHE_KEY, JSON.stringify(cache));
    } catch (e) {}
  }
  window.clearMapaRutaCache = function () {
    try {
      localStorage.removeItem(ROUTE_CACHE_KEY);
    } catch (e) {}
  };
  let _routeLayerGroup = null;
  let _highlightedLayers = [];
  function _clearHighlights() {
    const internal = window.__mapaOdjelaInternal;
    const layerGroup = internal && internal.getLayerGroup();
    _highlightedLayers.forEach(lyr => {
      if (layerGroup) layerGroup.resetStyle(lyr);
    });
    _highlightedLayers = [];
  }
  window.clearMapaVozacRute = function () {
    const internal = window.__mapaOdjelaInternal;
    const map = internal && internal.getMap();
    if (_routeLayerGroup && map) map.removeLayer(_routeLayerGroup);
    _routeLayerGroup = null;
    _clearHighlights();
  };

  // Svi geojson poligoni (mogu biti više dijelova za isti odjel) koji odgovaraju
  // datom "GJ ODJEL" labelu — ISTA normalizacija (labelKey precizno → normKey
  // fallback) kao karta-odjela.js koristi za primke/otpreme.
  function _findFeaturesForOdjel(rawLabel, features, internal) {
    const label = internal.labelKey(rawLabel);
    let matches = features.filter(lyr => {
      const p = lyr._kartaProps || {};
      return internal.labelKey((p.gj || '') + ' ' + (p.odjel || p.name || '')) === label;
    });
    if (matches.length) return matches;
    const norm = internal.normKey(rawLabel);
    return features.filter(lyr => {
      const p = lyr._kartaProps || {};
      return internal.normKey((p.gj || '') + ' ' + (p.odjel || p.name || '')) === norm;
    });
  }
  function _combinedCentroid(layers) {
    try {
      const bounds = L.latLngBounds([]);
      layers.forEach(l => bounds.extend(l.getBounds()));
      return bounds.isValid() ? bounds.getCenter() : null;
    } catch (e) {
      return null;
    }
  }
  async function _fetchRoute(fromLatLng, toLatLng, internal) {
    const url = `${internal.OSRM_URL}/${fromLatLng[1]},${fromLatLng[0]};${toLatLng.lng},${toLatLng.lat}?overview=full&geometries=geojson`;
    const resp = await fetch(url, {
      signal: AbortSignal.timeout(15000)
    });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();
    if (data.code !== 'Ok' || !data.routes.length) throw new Error('Nema rute');
    const route = data.routes[0];
    return {
      coords: route.geometry.coordinates.map(c => [c[1], c[0]]),
      distKm: route.distance / 1000,
      durMin: Math.round(route.duration / 60 * ROUTE_DURATION_FACTOR)
    };
  }
  const _sleep = ms => new Promise(r => setTimeout(r, ms));

  // groups: [{ key, label, drivers:[imena], jobTypes:[...] }] — pripremljeno u
  // React sloju (19-MapaOdjelaView.jsx) iz schedules+departments+workers, jer taj
  // sloj zna poslovnu logiku (ko je vozač, koji red ima dodijeljen odjel). Ovaj
  // fajl je namjerno "glup" — samo matchuje label→poligon, crta rutu, highlightuje.
  // Vraća { matched:[{odjel,drivers,jobTypes,distKm,durMin,color,cached,error?}],
  // unmatched:[label,...] } za React prikaz liste.
  window.showMapaVozacRute = async function (groups) {
    const internal = window.__mapaOdjelaInternal;
    if (!internal) return {
      matched: [],
      unmatched: [],
      error: 'Karta nije inicijalizovana.'
    };
    const map = internal.getMap();
    const features = internal.getAllFeatures();
    if (!map || !features || !features.length) return {
      matched: [],
      unmatched: [],
      error: 'Poligoni odjela još nisu učitani — sačekajte da se karta učita.'
    };
    window.clearMapaVozacRute();
    if (!groups || !groups.length) return {
      matched: [],
      unmatched: []
    };
    _routeLayerGroup = L.layerGroup().addTo(map);
    const matched = [];
    const unmatched = [];
    let colorIdx = 0;
    const boundsAcc = [];
    const routeCache = _loadRouteCache();
    for (const g of groups) {
      const lyrs = _findFeaturesForOdjel(g.label, features, internal);
      const centroid = lyrs.length ? _combinedCentroid(lyrs) : null;
      if (!lyrs.length || !centroid) {
        unmatched.push(g.label);
        continue;
      }
      const color = ROUTE_COLORS[colorIdx % ROUTE_COLORS.length];
      colorIdx++;
      lyrs.forEach(lyr => {
        lyr.setStyle({
          color: HIGHLIGHT_COLOR,
          weight: 5,
          opacity: 1,
          dashArray: null
        });
        _highlightedLayers.push(lyr);
      });
      const p0 = lyrs[0]._kartaProps || {};
      const cacheKey = internal.labelKey((p0.gj || '') + ' ' + (p0.odjel || p0.name || g.label));
      let route = routeCache[cacheKey];
      const fromCache = !!route;
      try {
        if (!route) {
          route = await _fetchRoute(internal.SUMARIJA_LATLNG, centroid, internal);
          routeCache[cacheKey] = route;
          _saveRouteCache(routeCache);
        }
        L.polyline(route.coords, {
          color,
          weight: 4,
          opacity: 0.85,
          dashArray: '8 4'
        }).bindTooltip(`${g.label}: ${route.distKm.toFixed(1)} km · ~${route.durMin} min${fromCache ? ' · keš' : ''}`, {
          permanent: false,
          direction: 'center',
          className: 'karta-tooltip'
        }).addTo(_routeLayerGroup);
        route.coords.forEach(c => boundsAcc.push(c));
        matched.push({
          odjel: g.label,
          drivers: g.drivers,
          jobTypes: g.jobTypes,
          distKm: route.distKm,
          durMin: route.durMin,
          color,
          cached: fromCache
        });
      } catch (e) {
        matched.push({
          odjel: g.label,
          drivers: g.drivers,
          jobTypes: g.jobTypes,
          distKm: null,
          durMin: null,
          color,
          error: e.message
        });
      }
      // Blaga pauza između poziva — javni OSRM demo server zna throttle-ovati brze uzastopne pozive.
      // Preskoči je za keš-pogotke (nema mrežnog poziva, nema šta throttle-ovati).
      if (!fromCache) await _sleep(300);
    }
    if (boundsAcc.length) {
      try {
        map.fitBounds(boundsAcc, {
          padding: [40, 40]
        });
      } catch (e) {}
    }
    return {
      matched,
      unmatched
    };
  };
})();

// ─── RENDER ───────────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(ErrorBoundary, null, /*#__PURE__*/React.createElement(App, null), /*#__PURE__*/React.createElement(ToastContainer, null)));
