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
const today = () => new Date().toISOString().split('T')[0];
const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};
const uid = () => Math.random().toString(36).slice(2, 10);
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
}];
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
  }, "\u0160umarija Bos.Krupa"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: '0.7rem',
      color: 'var(--text-muted)',
      marginTop: '0.2rem'
    }
  }, "raspored radnika")), /*#__PURE__*/React.createElement("div", {
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
      const rowWorkerCount = (row.allWorkers || []).length;
      const totalCap = vIds.reduce((s, vid) => {
        const v = vehicles?.find(v => v.id === vid);
        return s + (v?.brojMjesta || 0);
      }, 0);
      const bezMjesta = Math.max(0, rowWorkerCount - totalCap);
      let remaining = rowWorkerCount;
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
        const fill = Math.min(remaining, cap);
        remaining = Math.max(0, remaining - cap);
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
            color: fill >= cap ? '#b5620a' : '#2d5a27',
            background: fill >= cap ? '#fdf0e0' : '#e8f5e9',
            border: `1px solid ${fill >= cap ? '#e8c17a' : '#a5d6a7'}`,
            borderRadius: 3,
            padding: '0.1rem 0.3rem',
            display: 'inline-block'
          }
        }, "\uD83D\uDC65 ", fill, "/", cap));
      }), bezMjesta > 0 && /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '0.65rem',
          fontWeight: 700,
          color: '#c53030',
          background: '#fde8e8',
          border: '1px solid #f5b5b5',
          borderRadius: 3,
          padding: '0.15rem 0.3rem',
          marginTop: '2px'
        }
      }, "\u26A0\uFE0F ", bezMjesta, " radnika nema mjesta!"));
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
  }, "Pratioci prima\u010Da"), /*#__PURE__*/React.createElement("div", {
    className: "worker-selector"
  }, (() => {
    const selectedPrimac = form.primatWorker;
    const selected12 = [form.helper1Worker, form.helper2Worker].filter(Boolean);
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
    return allOptions.map(w => {
      const cat = getCatById(w.category);
      const isSelected = form.extraWorkers.includes(w.id);
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
      if (isSelected) return [null, null];
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
          if (type === 'Teren' || type === 'Kancelarija') {
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
    }];
    const ODSUTNI = ODSUTNOST_TYPES.map(t => ({
      type: t,
      label: `${ODSUTNOST_COLOR[t].icon} ${t}`,
      ...ODSUTNOST_COLOR[t]
    }));
    // Position picker: clamp to viewport
    const pickerW = 210;
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
        overflow: 'hidden',
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
function AppMain(_ref46) {
  let {
    onLogout,
    currentUser
  } = _ref46;
  const [workers, setWorkers] = useStorage('sumarija_workers', INITIAL_WORKERS);
  const [departments, setDepartments] = useStorage('sumarija_depts', INITIAL_DEPARTMENTS);
  const [schedules, setSchedules] = useStorage('sumarija_schedules', makeInitialSchedules());
  const [history, setHistory] = useStorage('sumarija_history', []);

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
  const SIHT_RAD_TYPES = ['Teren', 'Kancelarija'];
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
    Object.entries(godisnji || {}).forEach(_ref47 => {
      let [wId, entries] = _ref47;
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
    Object.entries(byDept).forEach(_ref48 => {
      let [deptId, jobs] = _ref48;
      const deptWorkerCount = new Set(Object.values(jobs).flat().flatMap(s => s.allWorkers || [])).size;
      html += `<div class="dept">`;
      html += `<div class="dept-name">🏕️ ${dName(deptId)} — ${deptWorkerCount} radnika</div>`;
      html += `<table><thead><tr><th style="width:18%">Vrsta posla</th><th>Radnici</th><th style="width:20%">Vozilo</th><th style="width:15%">Napomena</th></tr></thead><tbody>`;
      Object.entries(jobs).forEach(_ref49 => {
        let [jobType, rows] = _ref49;
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
  }, "\uD83C\uDF32"), /*#__PURE__*/React.createElement("span", null, "\u0160umarija Bos.Krupa"), FIREBASE_ENABLED ? /*#__PURE__*/React.createElement("span", {
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
  }, [['raspored', '📋 Raspored'], ['radnici', '👷 Radnici'], ['sihtarica', '📄 Šihtarica'], ['spisak', '📊 Spisak'], ['vozila', '🚗 Vozila'], ['odjeli', '🏕️ Odjeli'], ['pregled', '🔍 Pregled'], ['historija', '📜 Historija']].map(_ref50 => {
    let [k, l] = _ref50;
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
  }, "\uD83D\uDD12 Odjava")))), showInstallBanner && /*#__PURE__*/React.createElement("div", {
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
    className: "sidebar"
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
  })), activeTab === 'raspored' && /*#__PURE__*/React.createElement(RightPanel, {
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
  })), activeTab === 'raspored' && /*#__PURE__*/React.createElement("button", {
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

// ─── RENDER ───────────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(ErrorBoundary, null, /*#__PURE__*/React.createElement(App, null), /*#__PURE__*/React.createElement(ToastContainer, null)));
