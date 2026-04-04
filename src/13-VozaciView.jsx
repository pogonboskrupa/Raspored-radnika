// ─── VOZAČI VIEW ────────────────────────────────────────────────────────────
function VozaciView({ vehicles, setVehicles, workers }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ driverId: '', tipVozila: '', registracija: '', brojMjesta: 5, status: 'vozno' });
  const [showOtherDrivers, setShowOtherDrivers] = useState(false);

  const OTHER_CATEGORIES = ['poslovoda_isk', 'poslovoda_uzg', 'primac_panj', 'otpremac'];
  const regularDrivers = workers.filter(w => w.category === 'vozac' && w.status === 'aktivan');
  const otherDrivers = workers.filter(w => OTHER_CATEGORIES.includes(w.category) && w.status === 'aktivan');

  const isOtherDriver = (driverId) => {
    if (!driverId) return false;
    const w = workers.find(w => w.id === driverId);
    return w && OTHER_CATEGORIES.includes(w.category);
  };

  const resetForm = () => {
    setForm({ driverId: '', tipVozila: '', registracija: '', brojMjesta: 5, status: 'vozno' });
    setAdding(false);
    setEditing(null);
    setShowOtherDrivers(false);
  };

  const startEdit = (v) => {
    setEditing(v.id);
    setForm({ driverId: v.driverId || '', tipVozila: v.tipVozila || '', registracija: v.registracija || '', brojMjesta: v.brojMjesta || 5, status: v.status || 'vozno' });
    setShowOtherDrivers(isOtherDriver(v.driverId));
  };

  const saveVehicle = () => {
    if (!form.registracija.trim()) return alert('Unesite registarske oznake!');
    if (!form.tipVozila.trim()) return alert('Unesite tip vozila!');
    if (editing) {
      setVehicles(vs => vs.map(v => v.id === editing ? { ...v, ...form } : v));
    } else {
      setVehicles(vs => [...vs, { id: uid(), ...form }]);
    }
    resetForm();
  };

  const deleteVehicle = (v) => {
    if (confirm(`Obrisati vozilo "${v.registracija}"?`))
      setVehicles(vs => vs.filter(x => x.id !== v.id));
  };

  const toggleStatus = (v) => {
    setVehicles(vs => vs.map(x =>
      x.id === v.id ? { ...x, status: x.status === 'vozno' ? 'popravka' : 'vozno' } : x
    ));
  };

  const driverName = (dId) => {
    const w = workers.find(w => w.id === dId);
    return w ? w.name : '—';
  };

  const vozna = vehicles.filter(v => v.status === 'vozno');
  const popravka = vehicles.filter(v => v.status === 'popravka');

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap'}}>
        <div className="section-title">🚗 Vozači i vozila</div>
        <span style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>
          {vozna.length} vozno · {popravka.length} na popravku · {vehicles.length} ukupno
        </span>
        <button className="btn btn-primary btn-sm" style={{marginLeft:'auto'}} onClick={() => { setAdding(true); setEditing(null); setForm({ driverId: '', tipVozila: '', registracija: '', brojMjesta: 5, status: 'vozno' }); }}>
          + Dodaj vozilo
        </button>
      </div>

      {regularDrivers.length === 0 && (
        <div className="alert alert-warning" style={{marginBottom:'1rem'}}>
          Nemate vozača u Spisku. Prvo dodajte vozače u kategoriju "Vozači" na tabu Spisak.
        </div>
      )}

      {/* ADD / EDIT FORM */}
      {(adding || editing) && (
        <div className="card" style={{marginBottom:'1rem',padding:'1rem'}}>
          <div style={{fontWeight:700,marginBottom:'0.75rem',fontSize:'0.9rem'}}>
            {editing ? '✏️ Uredi vozilo' : '+ Novo vozilo'}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))',gap:'0.75rem'}}>
            <div className="form-group">
              <label className="form-label">Vozač</label>
              {!showOtherDrivers ? (
                <>
                  <select className="form-select" value={form.driverId} onChange={e => {
                    if (e.target.value === '__other__') { setShowOtherDrivers(true); setForm(f => ({...f, driverId: ''})); }
                    else setForm(f => ({...f, driverId: e.target.value}));
                  }}>
                    <option value="">— Odaberi vozača —</option>
                    {regularDrivers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    {otherDrivers.length > 0 && <option value="__other__">Drugi vozač...</option>}
                  </select>
                </>
              ) : (
                <>
                  <select className="form-select" value={form.driverId} onChange={e => setForm(f => ({...f, driverId: e.target.value}))}>
                    <option value="">— Odaberi —</option>
                    {OTHER_CATEGORIES.map(catId => {
                      const cat = getCatById(catId);
                      const catWorkers = otherDrivers.filter(w => w.category === catId);
                      if (catWorkers.length === 0) return null;
                      return (
                        <optgroup key={catId} label={cat ? cat.label : catId}>
                          {catWorkers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </optgroup>
                      );
                    })}
                  </select>
                  <button type="button" onClick={() => { setShowOtherDrivers(false); setForm(f => ({...f, driverId: ''})); }}
                    style={{marginTop:4,background:'none',border:'none',color:'var(--blue, #2a6478)',cursor:'pointer',fontSize:'0.72rem',padding:0,textDecoration:'underline'}}>
                    ← Nazad na vozače
                  </button>
                </>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Tip vozila</label>
              <input className="form-input" value={form.tipVozila} onChange={e=>setForm(f=>({...f,tipVozila:e.target.value}))} placeholder="npr. Kombi, Autobus, Putničko..." />
            </div>
            <div className="form-group">
              <label className="form-label">Registarske oznake</label>
              <input className="form-input" value={form.registracija} onChange={e=>setForm(f=>({...f,registracija:e.target.value}))} placeholder="npr. A12-B-345" />
            </div>
            <div className="form-group">
              <label className="form-label">Broj sjedećih mjesta</label>
              <input className="form-input" type="number" min="1" max="60" value={form.brojMjesta} onChange={e=>setForm(f=>({...f,brojMjesta:e.target.value===''?'':parseInt(e.target.value)}))} onBlur={e=>{if(!e.target.value||isNaN(parseInt(e.target.value)))setForm(f=>({...f,brojMjesta:1}));}} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                <option value="vozno">U voznom stanju</option>
                <option value="popravka">Na popravku</option>
              </select>
            </div>
          </div>
          <div style={{display:'flex',gap:'0.5rem',marginTop:'0.75rem'}}>
            <button className="btn btn-primary btn-sm" onClick={saveVehicle}>
              {editing ? '💾 Spremi' : '+ Dodaj'}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={resetForm}>Odustani</button>
          </div>
        </div>
      )}

      {/* VEHICLE TABLE */}
      {vehicles.length === 0 ? (
        <div className="empty-state">
          <span className="icon">🚗</span>
          <p>Nema unesenih vozila.</p>
          <button className="btn btn-primary" onClick={() => setAdding(true)}>+ Dodaj prvo vozilo</button>
        </div>
      ) : (
        <div style={{overflowX:'auto'}}>
          <table style={{borderCollapse:'collapse',width:'100%'}}>
            <thead>
              <tr>
                <th style={{background:'#e4f0f5',border:'1px solid #8bbdd4',padding:'0.6rem 0.75rem',textAlign:'left',fontSize:'0.8rem',fontWeight:700}}>Vozač</th>
                <th style={{background:'#e4f0f5',border:'1px solid #8bbdd4',padding:'0.6rem 0.75rem',textAlign:'left',fontSize:'0.8rem',fontWeight:700}}>Tip vozila</th>
                <th style={{background:'#e4f0f5',border:'1px solid #8bbdd4',padding:'0.6rem 0.75rem',textAlign:'left',fontSize:'0.8rem',fontWeight:700}}>Registracija</th>
                <th style={{background:'#e4f0f5',border:'1px solid #8bbdd4',padding:'0.6rem 0.75rem',textAlign:'center',fontSize:'0.8rem',fontWeight:700}}>Mjesta</th>
                <th style={{background:'#e4f0f5',border:'1px solid #8bbdd4',padding:'0.6rem 0.75rem',textAlign:'center',fontSize:'0.8rem',fontWeight:700}}>Status</th>
                <th style={{background:'#e4f0f5',border:'1px solid #8bbdd4',padding:'0.6rem 0.75rem',textAlign:'center',fontSize:'0.8rem',fontWeight:700}} className="no-print">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => {
                const isPopravka = v.status === 'popravka';
                return (
                  <tr key={v.id} style={{opacity: isPopravka ? 0.6 : 1}}>
                    <td style={{border:'1px solid #ccc',padding:'0.5rem 0.75rem',fontSize:'0.82rem'}}>
                      {v.driverId ? (() => {
                        const w = workers.find(x => x.id === v.driverId);
                        const cat = w ? getCatById(w.category) : null;
                        const isOther = w && OTHER_CATEGORIES.includes(w.category);
                        return <span>{isOther && cat ? cat.icon + ' ' : '🚗 '}{driverName(v.driverId)}{isOther && cat ? <span style={{fontSize:'0.68rem',color:'var(--text-muted)',marginLeft:4}}>({cat.short})</span> : ''}</span>;
                      })() : <span style={{color:'var(--text-muted)'}}>—</span>}
                    </td>
                    <td style={{border:'1px solid #ccc',padding:'0.5rem 0.75rem',fontSize:'0.82rem',fontWeight:600}}>{v.tipVozila}</td>
                    <td style={{border:'1px solid #ccc',padding:'0.5rem 0.75rem',fontSize:'0.82rem',fontFamily:'var(--mono)',fontWeight:700,letterSpacing:'0.05em'}}>{v.registracija}</td>
                    <td style={{border:'1px solid #ccc',padding:'0.5rem 0.75rem',fontSize:'0.82rem',textAlign:'center'}}>{v.brojMjesta}</td>
                    <td style={{border:'1px solid #ccc',padding:'0.5rem 0.75rem',textAlign:'center'}}>
                      <span onClick={() => toggleStatus(v)} style={{
                        cursor:'pointer',
                        display:'inline-block',
                        padding:'0.2rem 0.5rem',
                        borderRadius:12,
                        fontSize:'0.72rem',
                        fontWeight:700,
                        background: isPopravka ? '#fde8e8' : '#e6f5ea',
                        color: isPopravka ? '#c53030' : '#2d5a27',
                        border: `1px solid ${isPopravka ? '#f5b5b5' : '#9bc492'}`,
                      }}>
                        {isPopravka ? '🔧 Na popravku' : '✅ Vozno'}
                      </span>
                    </td>
                    <td style={{border:'1px solid #ccc',padding:'0.5rem 0.75rem',textAlign:'center'}} className="no-print">
                      <div style={{display:'flex',gap:'0.25rem',justifyContent:'center'}}>
                        <button className="btn btn-ghost btn-icon btn-sm" title="Uredi" onClick={() => startEdit(v)}>✏️</button>
                        <button className="btn btn-danger btn-icon btn-sm" title="Briši" onClick={() => deleteVehicle(v)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

