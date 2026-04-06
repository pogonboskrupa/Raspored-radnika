// ─── LOGIN / AUTH ────────────────────────────────────────────────────────────
const AUTH_SESSION_KEY = 'sumarija_session';
const AUTH_USER_KEY    = 'sumarija_user';

function hashPin(pin) {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'h_' + Math.abs(hash).toString(36);
}

// Korisnici — PIN-ovi su hashirani
const USERS = [
  { name: 'AMRA',  hash: hashPin('5555'), icon: '👩' },
  { name: 'NEDIM', hash: hashPin('7777'), icon: '👨' },
  { name: 'IZET',  hash: hashPin('4444'), icon: '👨' },
];

function LoginScreen({ onLogin }) {
  const [pin, setPin]       = useState('');
  const [error, setError]   = useState('');
  const [showPin, setShowPin] = useState(false);

  const handleLogin = () => {
    setError('');
    if (!pin) { setError('Unesite PIN'); return; }
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',background:'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 50%, #e8f0e6 100%)'}}>
      <div style={{background:'white',borderRadius:16,boxShadow:'0 8px 32px rgba(0,0,0,0.12)',padding:'2rem',width:'100%',maxWidth:360,margin:'1rem'}}>

        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:'1.75rem'}}>
          <img src="1774102184971~2.png" alt="Raspored Radnika" style={{width:96,height:96,borderRadius:18,marginBottom:'0.5rem',boxShadow:'0 4px 16px rgba(0,0,0,0.15)'}} />
          <div style={{fontFamily:'var(--mono)',fontWeight:800,fontSize:'1.1rem',color:'var(--green)',letterSpacing:'-0.03em'}}>
            Šumarija Bos.Krupa
          </div>
          <div style={{fontFamily:'var(--mono)',fontSize:'0.7rem',color:'var(--text-muted)',marginTop:'0.2rem'}}>
            raspored radnika
          </div>
        </div>

        {/* Korisnici — vizualni hint ko može ući */}
        <div style={{display:'flex',justifyContent:'center',gap:'0.6rem',marginBottom:'1.25rem'}}>
          {USERS.map(u => (
            <div key={u.name} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'0.2rem',
              background:'#f5f2ec',borderRadius:8,padding:'0.4rem 0.7rem',minWidth:64}}>
              <span style={{fontSize:'1.4rem'}}>{u.icon}</span>
              <span style={{fontSize:'0.68rem',fontWeight:700,color:'var(--text-muted)',fontFamily:'var(--mono)'}}>{u.name}</span>
            </div>
          ))}
        </div>

        {/* PIN unos */}
        <div style={{marginBottom:'0.75rem'}}>
          <label style={{fontSize:'0.72rem',fontWeight:600,color:'var(--text-muted)',display:'block',marginBottom:'0.3rem'}}>
            Unesite vaš PIN
          </label>
          <div style={{position:'relative'}}>
            <input
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={e => { setPin(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              autoFocus
              placeholder="••••"
              maxLength={8}
              style={{
                width:'100%', padding:'0.65rem 2.5rem 0.65rem 0.75rem',
                border: error ? '2px solid #c53030' : '2px solid var(--border)',
                borderRadius:8, fontSize:'1.2rem', letterSpacing:'0.25em',
                outline:'none', boxSizing:'border-box', textAlign:'center',
              }}
            />
            <button onClick={() => setShowPin(s => !s)} style={{
              position:'absolute', right:8, top:'50%', transform:'translateY(-50%)',
              background:'none', border:'none', cursor:'pointer', fontSize:'1rem', color:'var(--text-muted)',
            }}>
              {showPin ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{color:'#c53030',fontSize:'0.78rem',fontWeight:600,marginBottom:'0.5rem',
            padding:'0.4rem 0.6rem',background:'#fde8e8',borderRadius:6,textAlign:'center'}}>
            {error}
          </div>
        )}

        <button onClick={handleLogin} style={{
          width:'100%', padding:'0.7rem', background:'var(--green)', color:'white',
          border:'none', borderRadius:8, fontSize:'0.95rem', fontWeight:700, cursor:'pointer',
        }}>
          Prijavi se
        </button>
      </div>
    </div>
  );
}
