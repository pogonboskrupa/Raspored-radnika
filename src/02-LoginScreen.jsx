// ─── LOGIN / AUTH ────────────────────────────────────────────────────────────
const AUTH_KEY = 'sumarija_auth';
const AUTH_SESSION_KEY = 'sumarija_session';

function hashPin(pin) {
  // Simple hash for PIN (not crypto-grade, but sufficient for basic access control)
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'h_' + Math.abs(hash).toString(36);
}

function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'setup' | 'change'
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);

  // Check if PIN exists
  const [existingHash, setExistingHash] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Try Firebase first, then localStorage
    if (FIREBASE_ENABLED) {
      const ref = firebase.database().ref('sumarija/' + AUTH_KEY);
      ref.once('value').then(snap => {
        const val = snap.val();
        if (val) {
          setExistingHash(typeof val === 'string' ? val : null);
          setMode('login');
        } else {
          setMode('setup');
        }
        setLoaded(true);
      }).catch(() => {
        // Fallback to localStorage
        const local = localStorage.getItem(AUTH_KEY);
        if (local) { setExistingHash(local); setMode('login'); }
        else setMode('setup');
        setLoaded(true);
      });
    } else {
      const local = localStorage.getItem(AUTH_KEY);
      if (local) { setExistingHash(local); setMode('login'); }
      else setMode('setup');
      setLoaded(true);
    }
  }, []);

  const saveHash = (hash) => {
    localStorage.setItem(AUTH_KEY, hash);
    if (FIREBASE_ENABLED) {
      firebase.database().ref('sumarija/' + AUTH_KEY).set(hash).catch(() => {});
    }
  };

  const handleSetup = () => {
    setError('');
    if (pin.length < 4) { setError('PIN mora imati barem 4 znaka'); return; }
    if (pin !== confirmPin) { setError('PIN-ovi se ne poklapaju'); return; }
    const hash = hashPin(pin);
    saveHash(hash);
    sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
    onLogin();
  };

  const handleLogin = () => {
    setError('');
    if (!pin) { setError('Unesite PIN'); return; }
    const hash = hashPin(pin);
    if (hash === existingHash) {
      sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
      onLogin();
    } else {
      setError('Pogrešan PIN!');
      setPin('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (mode === 'setup') handleSetup();
      else handleLogin();
    }
  };

  if (!loaded) {
    return (
      <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',background:'var(--bg)'}}>
        <div style={{fontSize:'1.2rem',color:'var(--text-muted)'}}>Učitavanje...</div>
      </div>
    );
  }

  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',background:'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 50%, #e8f0e6 100%)'}}>
      <div style={{background:'white',borderRadius:16,boxShadow:'0 8px 32px rgba(0,0,0,0.12)',padding:'2rem',width:'100%',maxWidth:380,margin:'1rem'}}>
        {/* Logo/Header */}
        <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
          <div style={{fontSize:'2.5rem',marginBottom:'0.3rem'}}>🌲</div>
          <div style={{fontFamily:'var(--mono)',fontWeight:800,fontSize:'1.1rem',color:'var(--green)',letterSpacing:'-0.03em'}}>
            Šumarija Bos.Krupa
          </div>
          <div style={{fontFamily:'var(--mono)',fontSize:'0.7rem',color:'var(--text-muted)',marginTop:'0.25rem'}}>
            raspored radnika
          </div>
        </div>

        {mode === 'setup' ? (
          <>
            <div style={{textAlign:'center',marginBottom:'1rem'}}>
              <div style={{fontSize:'0.85rem',fontWeight:600,color:'var(--text)'}}>Postavi pristupni PIN</div>
              <div style={{fontSize:'0.72rem',color:'var(--text-muted)',marginTop:'0.2rem'}}>
                Ovo je prvi put. Odaberite PIN za zaštitu aplikacije.
              </div>
            </div>
            <div style={{marginBottom:'0.75rem'}}>
              <label style={{fontSize:'0.72rem',fontWeight:600,color:'var(--text-muted)',display:'block',marginBottom:'0.25rem'}}>Novi PIN (min. 4 znaka)</label>
              <div style={{position:'relative'}}>
                <input type={showPin ? 'text' : 'password'} value={pin} onChange={e => setPin(e.target.value)}
                  onKeyDown={handleKeyDown} autoFocus placeholder="Unesite PIN..."
                  style={{width:'100%',padding:'0.6rem 2.5rem 0.6rem 0.75rem',border:'2px solid var(--border)',borderRadius:8,fontSize:'1rem',letterSpacing:'0.15em',outline:'none',boxSizing:'border-box'}} />
                <button onClick={() => setShowPin(!showPin)} style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:'1rem',color:'var(--text-muted)'}}>
                  {showPin ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div style={{marginBottom:'0.75rem'}}>
              <label style={{fontSize:'0.72rem',fontWeight:600,color:'var(--text-muted)',display:'block',marginBottom:'0.25rem'}}>Potvrdite PIN</label>
              <input type={showPin ? 'text' : 'password'} value={confirmPin} onChange={e => setConfirmPin(e.target.value)}
                onKeyDown={handleKeyDown} placeholder="Ponovite PIN..."
                style={{width:'100%',padding:'0.6rem 0.75rem',border:'2px solid var(--border)',borderRadius:8,fontSize:'1rem',letterSpacing:'0.15em',outline:'none',boxSizing:'border-box'}} />
            </div>
            {error && <div style={{color:'#c53030',fontSize:'0.78rem',fontWeight:600,marginBottom:'0.5rem',padding:'0.4rem 0.6rem',background:'#fde8e8',borderRadius:6}}>{error}</div>}
            <button onClick={handleSetup}
              style={{width:'100%',padding:'0.65rem',background:'var(--green)',color:'white',border:'none',borderRadius:8,fontSize:'0.9rem',fontWeight:700,cursor:'pointer',marginTop:'0.25rem'}}>
              Postavi PIN i uđi
            </button>
          </>
        ) : (
          <>
            <div style={{textAlign:'center',marginBottom:'1rem'}}>
              <div style={{fontSize:'0.85rem',fontWeight:600,color:'var(--text)'}}>Prijava</div>
            </div>
            <div style={{marginBottom:'0.75rem'}}>
              <label style={{fontSize:'0.72rem',fontWeight:600,color:'var(--text-muted)',display:'block',marginBottom:'0.25rem'}}>PIN</label>
              <div style={{position:'relative'}}>
                <input type={showPin ? 'text' : 'password'} value={pin} onChange={e => setPin(e.target.value)}
                  onKeyDown={handleKeyDown} autoFocus placeholder="Unesite PIN..."
                  style={{width:'100%',padding:'0.6rem 2.5rem 0.6rem 0.75rem',border:'2px solid var(--border)',borderRadius:8,fontSize:'1rem',letterSpacing:'0.15em',outline:'none',boxSizing:'border-box'}} />
                <button onClick={() => setShowPin(!showPin)} style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:'1rem',color:'var(--text-muted)'}}>
                  {showPin ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            {error && <div style={{color:'#c53030',fontSize:'0.78rem',fontWeight:600,marginBottom:'0.5rem',padding:'0.4rem 0.6rem',background:'#fde8e8',borderRadius:6}}>{error}</div>}
            <button onClick={handleLogin}
              style={{width:'100%',padding:'0.65rem',background:'var(--green)',color:'white',border:'none',borderRadius:8,fontSize:'0.9rem',fontWeight:700,cursor:'pointer',marginTop:'0.25rem'}}>
              Prijavi se
            </button>
          </>
        )}
      </div>
    </div>
  );
}
