// ─── ENTRY MODAL ──────────────────────────────────────────────────────────────
function EntryModal({ data, isEdit, workers, departments, setDepartments, schedules, checkConflict, vehicles, allJobTypes, onSave, onClose, wName, godisnji, selectedDate }) {
  const initJobType = data.jobType || (allJobTypes || JOB_TYPES)[0];
  const DEPT_REQUIRED_JOBS_INIT = [];  const [form, setForm] = useState({
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
    overrides: data.overrides || [],
  });
  const [conflicts, setConflicts] = useState([]);
  const [forceOverride, setForceOverride] = useState(false);
  const [workerSearch, setWorkerSearch] = useState('');

  const [showOtherDriver, setShowOtherDriver] = useState(!!data.otherDriverId);
  const OTHER_DRIVER_CATS = ['poslovoda_isk', 'poslovoda_uzg', 'primac_panj', 'otpremac'];
  const otherPotentialDrivers = workers.filter(w => OTHER_DRIVER_CATS.includes(w.category) && w.status === 'aktivan');
  const catIds = WORKER_CATEGORIES.map(c => c.id);
  const activeWorkers = workers.filter(w => w.status === 'aktivan')
    .sort((a, b) => {
      const ai = catIds.indexOf(a.category), bi = catIds.indexOf(b.category);
      const ca = ai === -1 ? 999 : ai, cb = bi === -1 ? 999 : bi;
      return ca !== cb ? ca - cb : a.name.localeCompare(b.name);
    });
  // Sort departments: most recently used in schedules first, then most recently added
  const sortedDepts = useMemo(() => {
    const lastUsed = {};
    (schedules || []).forEach(s => { if (s.deptId) lastUsed[s.deptId] = Math.max(lastUsed[s.deptId] || 0, new Date(s.date).getTime()); });
    return [...departments].sort((a, b) => {
      const au = lastUsed[a.id] || 0, bu = lastUsed[b.id] || 0;
      if (au !== bu) return bu - au;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }, [departments, schedules]);
  const isOtprema = form.jobType === 'Otprema';
  const isPrimka = form.jobType === 'Primka';
  const isKisa = form.jobType === 'Kiša';
  const isTerenOrKanc = form.jobType === 'Teren' || form.jobType === 'Kancelarija';
  const isDeptShown    = true;
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
  const alreadyScheduled = new Set(
    schedules
      .filter(s => s.date === form.date && (!isEdit || s.id !== form.id))
      .flatMap(s => s.allWorkers || [])
  );
  const checkDate = form.date || selectedDate;
  const absentWorkerIds = new Set(
    Object.entries(godisnji || {}).filter(([wId, entries]) =>
      entries.some(e => e.date === checkDate || (e.open && e.dateOd && e.dateOd <= checkDate))
    ).map(([wId]) => wId)
  );
  const availableWorkers = activeWorkers.filter(w => !alreadyScheduled.has(w.id) && !absentWorkerIds.has(w.id));

  useEffect(() => {
    if (isPrimka) {
      const ws = [form.primatWorker, ...(form.extraWorkers||[])].filter(Boolean);
      setForm(f => ({...f, allWorkers: ws}));
    }
  }, [form.primatWorker, form.extraWorkers, form.jobType]);

  const toggleWorker = (wId) => {
    setForm(f => {
      const ws = f.allWorkers.includes(wId) ? f.allWorkers.filter(w=>w!==wId) : [...f.allWorkers, wId];
      return {...f, allWorkers: ws};
    });
  };

  const toggleExtra = (wId) => {
    setForm(f => {
      const ws = f.extraWorkers.includes(wId) ? f.extraWorkers.filter(w=>w!==wId) : [...f.extraWorkers, wId];
      return {...f, extraWorkers: ws};
    });
  };

  const handleSubmit = () => {
    if (form.allWorkers.length === 0) return alert('Odaberite barem jednog radnika!');
    const c = checkConflict(form, isEdit ? form.id : null);
    if (c.length > 0 && !forceOverride) {
      setConflicts(c);
      return;
    }
    const finalAllWorkers = form.otherDriverId && !form.allWorkers.includes(form.otherDriverId)
      ? [...form.allWorkers, form.otherDriverId] : form.allWorkers;
    onSave({...form, allWorkers: finalAllWorkers, vehicleId: form.vehicleIds[0] || '', vehicleIds: form.vehicleIds, otherDriverId: form.otherDriverId || '', overrides: forceOverride ? c : []});
  };

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span style={{fontSize:'1.2rem'}}>{isEdit ? '✏️' : '+'}</span>
          <div className="modal-title">{isEdit ? 'Uredi unos' : 'Novi raspored'}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{maxHeight:'70vh',overflowY:'auto'}}>
          {conflicts.length > 0 && !forceOverride && (
            <div className="alert alert-warning" style={{marginBottom:'1rem'}}>
              ⚠️ Konflikt! Radnici su već raspoređeni za ovaj datum: <strong>{conflicts.map(wName).join(', ')}</strong>
              <div style={{marginTop:'0.5rem'}}>
                <button className="btn btn-secondary btn-sm" onClick={() => setForceOverride(true)}>
                  Ipak sačuvaj (override)
                </button>
              </div>
            </div>
          )}

          <div style={{display:'grid',gridTemplateColumns: isDeptShown ? '1fr 1fr' : '1fr',gap:'0.75rem'}}>
            <div className="form-group">
              <label className="form-label">Datum</label>
              <input type="date" className="form-input" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} />
            </div>
            {isDeptShown && <div className="form-group">
              <label className="form-label">
                Odjel / Radilište <span style={{color:'var(--text-light)',fontSize:'0.72rem',fontWeight:400}}>(opciono)</span>
              </label>
              {departments.length > 0 && (
                <select className="form-select" value={form.deptId} onChange={e=>setForm(f=>({...f,deptId:e.target.value}))} style={{marginBottom:'0.4rem'}}>
                  <option value="">— Odaberi postojeći —</option>
                  {sortedDepts.map(d => <option key={d.id} value={d.id}>{d.gospodarskaJedinica} — Odjel {d.brojOdjela}</option>)}
                </select>
              )}
              <div style={{display:'flex',gap:'0.4rem',alignItems:'flex-end'}}>
                <div style={{flex:2}}>
                  <div style={{fontSize:'0.7rem',color:'var(--text-light)',marginBottom:'0.2rem'}}>Gospodarska jedinica</div>
                  <input className="form-input" id="newDeptGJ" list="gj-list-entry"
                    placeholder="Odaberi ili upiši..." style={{fontSize:'0.82rem'}} />
                  <datalist id="gj-list-entry">
                    {GOSPODARSKE_JEDINICE.map(g => <option key={g} value={g} />)}
                  </datalist>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'0.7rem',color:'var(--text-light)',marginBottom:'0.2rem'}}>Br. odjela</div>
                  <input className="form-input" id="newDeptBroj" placeholder="npr. 54" style={{fontSize:'0.82rem'}} />
                </div>
                <button className="btn btn-secondary btn-sm" style={{whiteSpace:'nowrap',flexShrink:0}}
                  onClick={() => {
                    const gj = document.getElementById('newDeptGJ').value;
                    const br = document.getElementById('newDeptBroj').value.trim();
                    if (!gj) return alert('Odaberi gospodarsku jedinicu!');
                    if (!br) return alert('Unesi broj odjela!');
                    const exists = departments.find(d => d.gospodarskaJedinica===gj && d.brojOdjela===br);
                    if (exists) { setForm(f=>({...f,deptId:exists.id})); return; }
                    const nd = { id: uid(), gospodarskaJedinica: gj, brojOdjela: br, note: '' };
                    setDepartments(ds => [...ds, nd]);
                    setForm(f=>({...f,deptId:nd.id}));
                    document.getElementById('newDeptGJ').value='';
                    document.getElementById('newDeptBroj').value='';
                  }}>
                  + Dodaj odjel
                </button>
              </div>
              {form.deptId && departments.find(d=>d.id===form.deptId) && (
                <div style={{marginTop:'0.3rem',fontSize:'0.75rem',color:'var(--green)',fontWeight:600}}>
                  ✓ {departments.find(d=>d.id===form.deptId).gospodarskaJedinica} — Odjel {departments.find(d=>d.id===form.deptId).brojOdjela}
                </div>
              )}
            </div>}
          </div>

          <div className="form-group">
            <label className="form-label">Vrsta posla</label>
            <select className="form-select" value={form.jobType} onChange={e=>{
              const newJob = e.target.value;
              setForm(f=>({...f,jobType:newJob,allWorkers:[],primatWorker:'',helper1Worker:'',helper2Worker:'',extraWorkers:[],
                deptId: f.deptId
              }));
            }}>
              {(allJobTypes || JOB_TYPES).map(jt => <option key={jt}>{jt}</option>)}
            </select>
          </div>

          {/* ─── KIŠA — dodaj sve terenske radnike ─── */}
          {isKisa && (
            <div style={{background:'#e4edf5',border:'1px solid #9bbfd9',borderRadius:'var(--radius)',padding:'0.6rem 0.75rem',marginBottom:'0.75rem'}}>
              <div style={{fontSize:'0.8rem',fontWeight:700,color:'#1a3d5c',marginBottom:'0.5rem'}}>🌧️ Kiša — terenski radnici</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'0.3rem',marginBottom:'0.5rem'}}>
                {TERENSKI_CATS.map(catId => {
                  const cat = getCatById(catId);
                  const catWorkers = availableWorkers.filter(w => w.category === catId && !form.allWorkers.includes(w.id));
                  const catSelected = form.allWorkers.filter(wId => { const w = workers.find(x=>x.id===wId); return w?.category === catId; });
                  return (
                    <button key={catId} className="btn btn-sm" onClick={() => {
                      const toAdd = catWorkers.map(w => w.id);
                      setForm(f => ({...f, allWorkers: [...new Set([...f.allWorkers, ...toAdd])]}));
                    }}
                    style={{fontSize:'0.7rem',padding:'0.25rem 0.5rem',background:catSelected.length > 0 ? cat?.color : cat?.pale,color:catSelected.length > 0 ? 'white' : cat?.color,border:`1px solid ${cat?.border}`,borderRadius:4,cursor: catWorkers.length===0 ? 'default' : 'pointer',opacity: catWorkers.length===0 ? 0.5 : 1}}>
                      {cat?.icon} + {cat?.short} ({catWorkers.length})
                    </button>
                  );
                })}
              </div>
              <div style={{display:'flex',gap:'0.4rem'}}>
                <button className="btn btn-primary btn-sm" style={{fontSize:'0.72rem'}} onClick={() => {
                  const allTerenski = availableWorkers.filter(w => TERENSKI_CATS.includes(w.category)).map(w => w.id);
                  setForm(f => ({...f, allWorkers: [...new Set([...f.allWorkers, ...allTerenski])]}));
                }}>
                  🌧️ Dodaj SVE terenske radnike
                </button>
                {form.allWorkers.length > 0 && (
                  <button className="btn btn-danger btn-sm" style={{fontSize:'0.72rem'}} onClick={() => {
                    const terenskiIds = new Set(workers.filter(w => TERENSKI_CATS.includes(w.category)).map(w => w.id));
                    setForm(f => ({...f, allWorkers: f.allWorkers.filter(id => !terenskiIds.has(id))}));
                  }}>
                    ✕ Ukloni sve terenske
                  </button>
                )}
              </div>
              <div style={{marginTop:'0.6rem',borderTop:'1px solid #9bbfd9',paddingTop:'0.5rem'}}>
                <div style={{fontSize:'0.7rem',fontWeight:700,color:'#1a3d5c',marginBottom:'0.3rem'}}>📋 U šihtarici vodi kao:</div>
                <div style={{display:'flex',gap:'0.3rem',flexWrap:'wrap'}}>
                  {[
                    {value:'go', label:'Godišnji odmor (GO)', bg:'#e4edf5', color:'#1a3d5c', border:'#9bbfd9'},
                    {value:'rad', label:'Radni dan', bg:'#e8f0e6', color:'#2d5a27', border:'#9bc492'},
                    {value:'bolovanje', label:'Bolovanje', bg:'#fde8e8', color:'#8b2020', border:'#e0a0a0'},
                    {value:'neplaceno', label:'Neplaćeno', bg:'#f0f0f0', color:'#555', border:'#ccc'},
                  ].map(opt => (
                    <button key={opt.value} className="btn btn-sm" onClick={() => setForm(f=>({...f, kisaMode: opt.value}))}
                      style={{fontSize:'0.7rem',padding:'0.25rem 0.5rem',background: form.kisaMode===opt.value ? opt.color : opt.bg, color: form.kisaMode===opt.value ? 'white' : opt.color, border:`2px solid ${form.kisaMode===opt.value ? opt.color : opt.border}`, borderRadius:4,fontWeight: form.kisaMode===opt.value ? 700 : 400,cursor:'pointer'}}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isPrimka ? (
            <div className="primka-section">
              <div className="primka-title">⚖️ Primka — posebna raspodjela</div>
              <div className="form-group">
                <label className="form-label">Primač na šuma panju</label>
                <select className="form-select" value={form.primatWorker} onChange={e=>setForm(f=>({...f,primatWorker:e.target.value}))}>
                  <option value="">— Odaberi primača —</option>
                  {availableWorkers.filter(w => w.category==='primac_panj').map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Pratioci primača</label>
                <div className="worker-selector">
                  {(() => {
                    const selectedPrimac = form.primatWorker;
                    const selected12 = [form.helper1Worker, form.helper2Worker].filter(Boolean);
                    const radniciPrimka = availableWorkers.filter(w => w.category==='radnik_primka' && w.id!==selectedPrimac);
                    const pomocni = availableWorkers.filter(w => w.category==='pomocni' && w.id!==selectedPrimac);
                    const ostaliPrimaci = availableWorkers.filter(w => w.category==='primac_panj' && w.id!==selectedPrimac);
                    const allOptions = [
                      ...radniciPrimka.map(w=>({...w,_group:'Radnici u primci'})),
                      ...pomocni.map(w=>({...w,_group:'Pomoćni radnici'})),
                      ...ostaliPrimaci.map(w=>({...w,_group:'Primači (opciono)'})),
                    ];
                    let lastGroup = null;
                    return allOptions.map(w => {
                      const cat = getCatById(w.category);
                      const isSelected = form.extraWorkers.includes(w.id);
                      const groupHeader = w._group !== lastGroup ? (lastGroup = w._group, (
                        <div key={'grp-'+w._group} style={{padding:'0.3rem 0.7rem',fontSize:'0.65rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--text-light)',background:'var(--bg)',borderBottom:'1px solid var(--border)'}}>
                          {w._group}
                        </div>
                      )) : null;
                      if (isSelected) return [null, null];
                      return [groupHeader, (
                        <div key={w.id} className="worker-option" onClick={() => toggleExtra(w.id)}>
                          <span style={{fontSize:'0.9rem'}}>{cat?.icon||'👤'}</span>
                          {w.name}
                          <span style={{marginLeft:'auto',fontSize:'0.65rem',color:cat?.color,background:cat?.pale,border:`1px solid ${cat?.border}`,padding:'0.1rem 0.3rem',borderRadius:3,fontFamily:'var(--mono)'}}>{cat?.short}</span>
                        </div>
                      )];
                    });
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Radnici</label>
              <input className="form-input" placeholder="🔍 Pretraži radnika..." value={workerSearch}
                onChange={e => setWorkerSearch(e.target.value)}
                style={{marginBottom:'0.4rem',fontSize:'0.82rem',padding:'0.35rem 0.6rem'}} />
              <div className="worker-selector">
                {availableWorkers.filter(w => !form.allWorkers.includes(w.id) && (!isOtprema || w.category === 'otpremac') && (!workerSearch || w.name.toLowerCase().includes(workerSearch.toLowerCase()))).sort((a, b) => {
                  if (isTerenOrKanc) {
                    const aP = a.category === 'poslovoda_isk' || a.category === 'poslovoda_uzg' ? 0 : 1;
                    const bP = b.category === 'poslovoda_isk' || b.category === 'poslovoda_uzg' ? 0 : 1;
                    if (aP !== bP) return aP - bP;
                  }
                  const catIds = WORKER_CATEGORIES.map(c => c.id);
                  const ai = catIds.indexOf(a.category), bi = catIds.indexOf(b.category);
                  const ca = ai === -1 ? 999 : ai, cb = bi === -1 ? 999 : bi;
                  return ca !== cb ? ca - cb : a.name.localeCompare(b.name);
                }).map(w => {
                  const cat = getCatById(w.category);
                  return (
                    <div key={w.id} className="worker-option"
                      onClick={() => toggleWorker(w.id)}>
                      <span style={{fontSize:'0.9rem'}}>{cat?.icon||'👤'}</span>
                      {w.name}
                      {w.category && <span style={{marginLeft:'auto',fontSize:'0.65rem',color: cat?.color, background: cat?.pale, border:`1px solid ${cat?.border}`, padding:'0.1rem 0.3rem', borderRadius:3, fontFamily:'var(--mono)'}}>{cat?.short}</span>}
                    </div>
                  );
                })}
                {availableWorkers.filter(w => !form.allWorkers.includes(w.id) && (!isOtprema || w.category === 'otpremac') && (!workerSearch || w.name.toLowerCase().includes(workerSearch.toLowerCase()))).length === 0 && (
                  <div style={{padding:'0.6rem 0.75rem',fontSize:'0.78rem',color:'var(--text-muted)',fontStyle:'italic'}}>{workerSearch ? `Nema radnika za "${workerSearch}"` : 'Svi raspoloživi radnici su odabrani.'}</div>
                )}
              </div>
            </div>
          )}

          {/* ODABRANI RADNICI — s brisanjem */}
          {form.allWorkers.length > 0 && (
            <div style={{background:'var(--green-pale)',border:'1px solid #9bc492',borderRadius:'var(--radius)',padding:'0.6rem 0.75rem',marginBottom:'0.75rem'}}>
              <div style={{fontSize:'0.7rem',fontWeight:700,color:'var(--green)',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.4rem'}}>
                Odabrani radnici ({form.allWorkers.length})
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'0.3rem'}}>
                {form.allWorkers.map(wId => {
                  const w = workers.find(x => x.id === wId);
                  const isPrimac = isPrimka && wId === form.primatWorker;
                  const cat = getCatById(w?.category);
                  return (
                    <span key={wId} style={{
                      display:'inline-flex',alignItems:'center',gap:'0.3rem',
                      background: isPrimac ? 'var(--amber-pale)' : 'white',
                      border: `1px solid ${isPrimac ? '#e8c17a' : 'var(--border)'}`,
                      borderRadius:20, padding:'0.2rem 0.4rem 0.2rem 0.6rem',
                      fontSize:'0.78rem', fontWeight: isPrimac ? 700 : 400,
                      color: isPrimac ? 'var(--amber)' : 'var(--text)',
                    }}>
                      {isPrimac && '👑 '}{w?.name}
                      {!isPrimac && (
                        <button onClick={() => {
                          if (isPrimka) {
                            setForm(f => ({...f, extraWorkers: f.extraWorkers.filter(id => id !== wId)}));
                          } else {
                            setForm(f => ({...f, allWorkers: f.allWorkers.filter(id => id !== wId)}));
                          }
                        }} style={{
                          background:'none',border:'none',cursor:'pointer',
                          color:'var(--text-muted)',fontSize:'0.75rem',lineHeight:1,
                          padding:'0 0.1rem',display:'flex',alignItems:'center',
                        }} title="Ukloni">✕</button>
                      )}
                      {isPrimac && (
                        <button onClick={() => setForm(f=>({...f,primatWorker:'',allWorkers:f.allWorkers.filter(id=>id!==wId),extraWorkers:f.extraWorkers.filter(id=>id!==wId)}))}
                          style={{background:'none',border:'none',cursor:'pointer',color:'var(--amber)',fontSize:'0.75rem',lineHeight:1,padding:'0 0.1rem',display:'flex',alignItems:'center'}}
                          title="Ukloni primača">✕</button>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── VOZILA SEKCIJA (više vozila) ─── */}
          {true && (
          <div className="form-group">
            <label className="form-label">🚗 Vozila (prevoz radnika)</label>

            {/* Auto-detected default vehicle hint */}
            {defaultVehicle && !form.vehicleIds.includes(defaultVehicle.id) && (
              <div style={{display:'flex',alignItems:'center',gap:'0.4rem',padding:'0.4rem 0.6rem',background:'#e8f5e9',border:'1px solid #a5d6a7',borderRadius:6,marginBottom:'0.4rem',fontSize:'0.78rem'}}>
                <span>🟢</span>
                <span style={{flex:1}}>Default: <strong>{defaultVehicle.registracija}</strong> ({driverInWorkers?.name})</span>
                <button className="btn btn-secondary btn-sm" style={{fontSize:'0.68rem'}}
                  onClick={() => setForm(f=>({...f, vehicleIds: [...f.vehicleIds, defaultVehicle.id]}))}>
                  + Dodaj
                </button>
              </div>
            )}

            {/* Odabrana vozila */}
            {form.vehicleIds.length > 0 && (
              <div style={{display:'flex',flexDirection:'column',gap:'0.3rem',marginBottom:'0.4rem'}}>
                {form.vehicleIds.map(vid => {
                  const v = availableVehicles.find(x => x.id === vid);
                  if (!v) return null;
                  const drv = v.driverId ? workers.find(w => w.id === v.driverId) : null;
                  return (
                    <div key={vid} style={{display:'flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.5rem',background:'#f0f7f0',border:'1px solid #a5d6a7',borderRadius:6,fontSize:'0.78rem'}}>
                      <div style={{flex:1}}>
                        <span style={{fontWeight:600}}>🚗 {v.registracija}</span>
                        <span style={{color:'var(--text-muted)',marginLeft:'0.3rem'}}>{v.tipVozila} · {v.brojMjesta} mj.</span>
                        {drv && <span style={{color:'#2a6478',marginLeft:'0.3rem'}}>({drv.name})</span>}
                      </div>
                      <button onClick={() => setForm(f=>({...f, vehicleIds: f.vehicleIds.filter(id => id !== vid)}))}
                        style={{background:'#c53030',color:'white',border:'none',borderRadius:4,cursor:'pointer',fontSize:'0.65rem',padding:'0.15rem 0.35rem',fontWeight:600}}>✕</button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Dodaj vozilo dropdown */}
            <select className="form-select" value="" onChange={e => {
              if (e.target.value && !form.vehicleIds.includes(e.target.value)) {
                setForm(f=>({...f, vehicleIds: [...f.vehicleIds, e.target.value]}));
              }
            }}>
              <option value="">— Dodaj vozilo —</option>
              {availableVehicles.filter(v => !form.vehicleIds.includes(v.id)).map(v => {
                const driver = workers.find(w => w.id === v.driverId);
                return <option key={v.id} value={v.id}>{v.registracija} — {v.tipVozila} ({v.brojMjesta} mj.){driver ? ` — ${driver.name}` : ''}</option>;
              })}
            </select>

            {/* POPUNJENOST PO VOZILIMA */}
            {form.vehicleIds.length > 0 && (() => {
              let remaining = workerCount;
              const perVehicle = form.vehicleIds.map(vid => {
                const v = availableVehicles.find(x => x.id === vid);
                const cap = v?.brojMjesta || 0;
                const fill = Math.min(remaining, cap);
                remaining = Math.max(0, remaining - cap);
                return { vid, cap, fill, v };
              });
              return (
                <div style={{marginTop:'0.5rem'}}>
                  {perVehicle.map(pv => (
                    <div key={pv.vid} style={{display:'flex',alignItems:'center',gap:'0.4rem',marginBottom:'0.25rem',fontSize:'0.72rem'}}>
                      <span style={{color:'var(--text-muted)',minWidth:100}}>{pv.v?.registracija || '?'}</span>
                      <div style={{flex:1,height:8,background:'#eee',borderRadius:4,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${pv.cap>0?Math.min(100,(pv.fill/pv.cap)*100):0}%`,background:pv.fill>=pv.cap?(pv.fill>pv.cap?'#e53e3e':'#ed8936'):'#38a169',borderRadius:4,transition:'width 0.3s'}} />
                      </div>
                      <span style={{fontWeight:600,color:pv.fill>=pv.cap?(pv.fill>pv.cap?'#c53030':'#b5620a'):'var(--green)',minWidth:45,textAlign:'right'}}>{pv.fill}/{pv.cap}</span>
                    </div>
                  ))}
                  <div style={{fontSize:'0.72rem',fontWeight:600,color: isOverCapacity ? '#c53030' : 'var(--green)',marginTop:'0.15rem'}}>
                    {isOverCapacity ? '⚠️' : '✅'} Ukupno: {workerCount} radnika / {totalVehicleCapacity} mjesta ({form.vehicleIds.length} voz.)
                    {remaining > 0 && <span style={{color:'#c53030'}}> — {remaining} bez mjesta!</span>}
                  </div>
                </div>
              );
            })()}

            {/* DRUGI ŠOFER ZA DANAS */}
            {form.vehicleIds.length > 0 && (
              <div style={{marginTop:'0.5rem'}}>
                {!showOtherDriver ? (
                  <button type="button" onClick={() => setShowOtherDriver(true)}
                    style={{background:'none',border:'none',color:'#2a6478',cursor:'pointer',fontSize:'0.72rem',padding:0,textDecoration:'underline'}}>
                    + Drugi šofer za danas (poslovođa, primač, otpremač)...
                  </button>
                ) : (
                  <div style={{background:'#fff8e1',border:'1px solid #ffe082',borderRadius:'var(--radius)',padding:'0.5rem 0.6rem',marginTop:'0.3rem'}}>
                    <div style={{fontSize:'0.7rem',color:'#b5620a',marginBottom:'0.3rem',fontWeight:600}}>
                      🔄 Drugi šofer — samo za ovaj dan
                    </div>
                    <select className="form-select" value={form.otherDriverId} onChange={e => setForm(f=>({...f,otherDriverId:e.target.value}))}>
                      <option value="">— Stalni šofer —</option>
                      {OTHER_DRIVER_CATS.map(catId => {
                        const catInfo = getCatById(catId);
                        const catW = otherPotentialDrivers.filter(w => w.category === catId);
                        if (catW.length === 0) return null;
                        return (
                          <optgroup key={catId} label={catInfo ? catInfo.label : catId}>
                            {catW.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                          </optgroup>
                        );
                      })}
                    </select>
                    {form.otherDriverId && (() => {
                      const dw = workers.find(w => w.id === form.otherDriverId);
                      const dc = getCatById(dw?.category);
                      return dw ? (
                        <div style={{marginTop:'0.3rem',fontSize:'0.72rem',color:'#b5620a',fontWeight:600}}>
                          🚗 {dw.name} ({dc?.label}) vozi danas umjesto stalnog šofera
                        </div>
                      ) : null;
                    })()}
                    <button type="button" onClick={() => { setShowOtherDriver(false); setForm(f=>({...f,otherDriverId:''})); }}
                      style={{marginTop:4,background:'none',border:'none',color:'#2a6478',cursor:'pointer',fontSize:'0.72rem',padding:0,textDecoration:'underline'}}>
                      ← Ukloni drugog šofera
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          )}

          <div className="form-group">
            <label className="form-label">Napomena</label>
            <textarea className="form-input" rows={2} value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="Opcionalna napomena..." style={{resize:'vertical'}} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Odustani</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {isEdit ? '💾 Spremi izmjenu' : '+ Dodaj unos'}
          </button>
        </div>
      </div>
    </div>
  );
}

