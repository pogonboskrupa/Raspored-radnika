// ─── ENTRY MODAL ──────────────────────────────────────────────────────────────
function EntryModal({ data, isEdit, workers, departments, setDepartments, schedules, checkConflict, vehicles, onSave, onClose, wName }) {
  const [form, setForm] = useState({
    id: data.id || uid(),
    date: data.date || today(),
    deptId: data.deptId || departments[0]?.id || '',
    jobType: data.jobType || JOB_TYPES[0],
    primatWorker: data.primatWorker || '',
    helper1Worker: data.helper1Worker || '',
    helper2Worker: data.helper2Worker || '',
    extraWorkers: data.extraWorkers || [],
    allWorkers: data.allWorkers || [],
    note: data.note || '',
    vehicleId: data.vehicleId || '',
    vehicleIds: data.vehicleIds || (data.vehicleId ? [data.vehicleId] : []),
    overrides: data.overrides || [],
  });
  const [conflicts, setConflicts] = useState([]);
  const [forceOverride, setForceOverride] = useState(false);

  const [vehicleOverride, setVehicleOverride] = useState(!!data.vehicleId || (data.vehicleIds && data.vehicleIds.length > 0));
  const activeWorkers = workers.filter(w => w.status === 'aktivan');
  const isPrimka = form.jobType === 'Primka';
  const availableVehicles = (vehicles || []).filter(v => v.status === 'vozno');

  // Auto-detect default vehicle from driver in selected workers
  const driverInWorkers = form.allWorkers.map(wId => workers.find(w => w.id === wId)).find(w => w?.category === 'vozac');
  const defaultVehicle = driverInWorkers ? (vehicles || []).find(v => v.driverId === driverInWorkers.id && v.status === 'vozno') : null;
  const effectiveVehicleId = defaultVehicle && !vehicleOverride ? defaultVehicle.id : form.vehicleId;
  const selectedVehicle = (vehicles || []).find(v => v.id === effectiveVehicleId);
  const workerCount = form.allWorkers.length;
  const vehicleCapacity = selectedVehicle?.brojMjesta || 0;
  const isOverCapacity = selectedVehicle && workerCount > vehicleCapacity;

  // Radnici koji su već raspoređeni za isti datum u drugim unosima
  const alreadyScheduled = new Set(
    schedules
      .filter(s => s.date === form.date && (!isEdit || s.id !== form.id))
      .flatMap(s => s.allWorkers || [])
  );
  const availableWorkers = activeWorkers.filter(w => !alreadyScheduled.has(w.id));

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
    if (!form.deptId) return alert('Odaberite odjel!');
    if (form.allWorkers.length === 0) return alert('Odaberite barem jednog radnika!');
    const c = checkConflict(form, isEdit ? form.id : null);
    if (c.length > 0 && !forceOverride) {
      setConflicts(c);
      return;
    }
    const finalVehicleIds = form.vehicleIds.length > 0 ? form.vehicleIds : (effectiveVehicleId ? [effectiveVehicleId] : []);
    onSave({...form, vehicleId: finalVehicleIds[0] || '', vehicleIds: finalVehicleIds, overrides: forceOverride ? c : []});
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

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
            <div className="form-group">
              <label className="form-label">Datum</label>
              <input type="date" className="form-input" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Odjel / Radilište</label>
              {departments.length > 0 && (
                <select className="form-select" value={form.deptId} onChange={e=>setForm(f=>({...f,deptId:e.target.value}))} style={{marginBottom:'0.4rem'}}>
                  <option value="">— Odaberi postojeći —</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.gospodarskaJedinica} — Odjel {d.brojOdjela}</option>)}
                </select>
              )}
              <div style={{display:'flex',gap:'0.4rem',alignItems:'flex-end'}}>
                <div style={{flex:2}}>
                  <div style={{fontSize:'0.7rem',color:'var(--text-light)',marginBottom:'0.2rem'}}>Gospodarska jedinica</div>
                  <select className="form-select" id="newDeptGJ" style={{fontSize:'0.82rem'}}>
                    <option value="">— Odaberi —</option>
                    {GOSPODARSKE_JEDINICE.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
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
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Vrsta posla</label>
            <select className="form-select" value={form.jobType} onChange={e=>setForm(f=>({...f,jobType:e.target.value,allWorkers:[],primatWorker:'',helper1Worker:'',helper2Worker:'',extraWorkers:[]}))}>
              {JOB_TYPES.map(jt => <option key={jt}>{jt}</option>)}
            </select>
          </div>

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
              <div className="worker-selector">
                {availableWorkers.filter(w => !form.allWorkers.includes(w.id)).map(w => {
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
                {availableWorkers.filter(w => !form.allWorkers.includes(w.id)).length === 0 && (
                  <div style={{padding:'0.6rem 0.75rem',fontSize:'0.78rem',color:'var(--text-muted)',fontStyle:'italic'}}>Svi raspoloživi radnici su odabrani.</div>
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

          {/* ─── VOZILO SEKCIJA ─── */}
          <div className="form-group">
            <label className="form-label">🚗 Vozilo (prevoz radnika)</label>
            {defaultVehicle && !vehicleOverride ? (
              <div>
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.5rem 0.75rem',background:'#e8f5e9',border:'1px solid #a5d6a7',borderRadius:'var(--radius)'}}>
                  <span style={{fontSize:'0.85rem'}}>🟢</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:'0.85rem'}}>{defaultVehicle.registracija} — {defaultVehicle.tipVozila}</div>
                    <div style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>Default vozilo za {driverInWorkers.name} · {defaultVehicle.brojMjesta} mj.</div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setVehicleOverride(true); setForm(f=>({...f,vehicleId:defaultVehicle.id})); }}
                    style={{fontSize:'0.7rem',whiteSpace:'nowrap'}}>
                    🔄 Promijeni za danas
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {defaultVehicle && (
                  <div style={{marginBottom:'0.4rem',display:'flex',alignItems:'center',gap:'0.4rem'}}>
                    <span style={{fontSize:'0.7rem',color:'var(--text-muted)',fontStyle:'italic'}}>⚠️ Ručno odabrano vozilo (override za danas)</span>
                    <button onClick={() => { setVehicleOverride(false); setForm(f=>({...f,vehicleId:''})); }}
                      style={{background:'none',border:'none',cursor:'pointer',fontSize:'0.7rem',color:'#2a6478',textDecoration:'underline'}}>
                      Vrati default
                    </button>
                  </div>
                )}
                <select className="form-select" value={form.vehicleId} onChange={e=>setForm(f=>({...f,vehicleId:e.target.value}))}>
                  <option value="">— Bez vozila —</option>
                  {availableVehicles.map(v => {
                    const driver = workers.find(w => w.id === v.driverId);
                    const isDefault = defaultVehicle && v.id === defaultVehicle.id;
                    return <option key={v.id} value={v.id}>{v.registracija} — {v.tipVozila} ({v.brojMjesta} mj.){driver ? ` — ${driver.name}` : ''}{isDefault ? ' ⭐ default' : ''}</option>;
                  })}
                </select>
              </div>
            )}

            {/* KAPACITET / POPUNJENOST */}
            {selectedVehicle && (
              <div style={{marginTop:'0.5rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.3rem'}}>
                  <span style={{fontSize:'0.72rem',fontWeight:600,color: isOverCapacity ? 'var(--red)' : 'var(--green)'}}>
                    {isOverCapacity ? '⚠️' : '✅'} Popunjenost: {workerCount} / {vehicleCapacity} mjesta
                  </span>
                </div>
                <div style={{height:8,background:'#eee',borderRadius:4,overflow:'hidden'}}>
                  <div style={{
                    height:'100%',
                    width: `${Math.min(100, (workerCount / vehicleCapacity) * 100)}%`,
                    background: isOverCapacity ? '#e53e3e' : workerCount === vehicleCapacity ? '#ed8936' : '#38a169',
                    borderRadius:4,
                    transition:'width 0.3s',
                  }} />
                </div>
                {isOverCapacity && (
                  <div style={{marginTop:'0.3rem',padding:'0.3rem 0.5rem',background:'#fde8e8',border:'1px solid #f5b5b5',borderRadius:4,fontSize:'0.72rem',color:'#c53030',fontWeight:600}}>
                    ⚠️ UPOZORENJE: {workerCount - vehicleCapacity} radnik(a) više od kapaciteta vozila!
                  </div>
                )}
              </div>
            )}
          </div>

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

