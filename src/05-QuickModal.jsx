// ─── QUICK ASSIGN MODAL ───────────────────────────────────────────────────────
function QuickModal({ worker, workers, departments, setDepartments, selectedDate, schedules, checkConflict, vehicles, allJobTypes, onSave, onClose, wName, godisnji, setGodisnji }) {
  const cat = getCatById(worker.category);
  const isPrimac = worker.category === 'primac_panj';

  // Two modes: 'rad' or 'odsutnost'
  const [mode, setMode] = useState('rad');

  const ODSUTNOST_TYPES = ['Godišnji odmor','Bolovanje','Slobodan dan','Neplaćeno'];
  const ODSUTNOST_COLOR = {
    'Godišnji odmor': { bg:'#e4edf5', color:'#1a3d5c', border:'#9bbfd9', short:'GO', icon:'🌴' },
    'Bolovanje':      { bg:'#fde8e8', color:'#8b2020', border:'#e0a0a0', short:'B',  icon:'🏥' },
    'Slobodan dan':   { bg:'#fdf0e0', color:'#b5620a', border:'#e8c17a', short:'SD', icon:'☀️' },
    'Neplaćeno':      { bg:'#f0f0f0', color:'#555',    border:'#ccc',    short:'N',  icon:'📋' },
  };

  const QUICK_STATUSES = [
    { id: 'kancelarija', label: 'Kancelarija', icon: '🏢', bg:'#e8eaf6', color:'#3949ab', border:'#9fa8da' },
    { id: 'teren',       label: 'Teren',       icon: '🌿', bg:'#e8f5e9', color:'#2e7d32', border:'#81c784' },
  ];

  const DEPT_SHOW_JOBS     = ['Primka', 'Otprema', 'Doznaka stabala', 'Pošumljavanje', 'Teren', 'Prerada', 'Farbanje sjekačkih linija'];
  const DEPT_REQUIRED_JOBS = ['Primka', 'Otprema', 'Doznaka stabala', 'Pošumljavanje', 'Prerada', 'Farbanje sjekačkih linija'];

  // Determine jobType default based on category
  const defaultJob = () => {
    if (worker.category === 'primac_panj') return 'Primka';
    if (worker.category === 'otpremac')    return 'Otprema';
    if (worker.category === 'poslovoda_isk' || worker.category === 'poslovoda_uzg') return 'Doznaka stabala';
    if (worker.category === 'vlastita_rezija') return 'Ostalo';
    return 'Ostalo';
  };

  const [deptId, setDeptId]         = useState(departments[0]?.id || '');
  const [newGJ, setNewGJ]           = useState('');
  const [newBroj, setNewBroj]       = useState('');
  const [jobType, setJobType]       = useState(defaultJob());
  const [quickStatus, setQuickStatus] = useState(null); // 'kancelarija' | 'teren' | null
  const [odsutnostType, setOdsType] = useState('Godišnji odmor');
  const [odsDateOd, setOdsDateOd]   = useState(selectedDate);
  const [odsDateDo, setOdsDateDo]   = useState('');
  const [note, setNote]             = useState('');
  const [extraWorkers, setExtra]    = useState([]);
  const [vehicleIds, setVehicleIds] = useState([]);
  const [showOtherDriver, setShowOtherDriver] = useState(false);
  const [otherDriverId, setOtherDriverId] = useState('');
  const [forceOverride, setForce]   = useState(false);
  const [conflicts, setConflicts]   = useState([]);
  const [workerSearch, setWorkerSearch] = useState('');

  const OTHER_DRIVER_CATS = ['poslovoda_isk', 'poslovoda_uzg', 'primac_panj', 'otpremac'];
  const availableVehicles = (vehicles || []).filter(v => v.status === 'vozno');
  const regularVozaci = workers.filter(w => w.category === 'vozac' && w.status === 'aktivan');
  const otherPotentialDrivers = workers.filter(w => OTHER_DRIVER_CATS.includes(w.category) && w.status === 'aktivan');

  const activeWorkers = workers.filter(w => w.status === 'aktivan');
  const absentWorkerIds = new Set(
    Object.entries(godisnji || {}).filter(([wId, entries]) =>
      entries.some(e => e.date === selectedDate || (e.open && e.dateOd && e.dateOd <= selectedDate))
    ).map(([wId]) => wId)
  );

  const companions = activeWorkers.filter(w =>
    w.id !== worker.id && !absentWorkerIds.has(w.id) &&
    (w.category === 'radnik_primka' || w.category === 'pomocni' || w.category === 'primac_panj')
  );
  const companionGroups = [
    { label: 'Radnici u primci', workers: companions.filter(w => w.category === 'radnik_primka') },
    { label: 'Pomoćni radnici',  workers: companions.filter(w => w.category === 'pomocni') },
    { label: 'Primači (opciono)',workers: companions.filter(w => w.category === 'primac_panj') },
  ].filter(g => g.workers.length > 0);

  const toggleExtra = (wId) => setExtra(prev =>
    prev.includes(wId) ? prev.filter(x => x !== wId) : [...prev, wId]
  );

  const allWorkers = isPrimac
    ? [worker.id, ...extraWorkers].filter(Boolean)
    : [worker.id];

  const addDept = () => {
    if (!newGJ) return alert('Odaberi gospodarsku jedinicu!');
    if (!newBroj.trim()) return alert('Unesi broj odjela!');
    const exists = departments.find(d => d.gospodarskaJedinica === newGJ && d.brojOdjela === newBroj.trim());
    if (exists) { setDeptId(exists.id); return; }
    const nd = { id: uid(), gospodarskaJedinica: newGJ, brojOdjela: newBroj.trim(), note: '' };
    setDepartments(ds => [...ds, nd]);
    setDeptId(nd.id);
    setNewGJ(''); setNewBroj('');
  };

  const handleSaveOdsutnost = () => {
    if (!odsDateOd) return alert('Odaberi datum!');
    if (odsDateDo && odsDateDo < odsDateOd) return alert('Datum "Do" mora biti nakon datuma "Od"!');
    if (!odsDateDo) {
      // Open-ended leave — no end date known yet
      setGodisnji(g => {
        const prev = (g[worker.id] || []).filter(e => !(e.open && e.dateOd === odsDateOd && e.type === odsutnostType));
        return { ...g, [worker.id]: [...prev, { dateOd: odsDateOd, type: odsutnostType, note, open: true }] };
      });
      onClose();
      return;
    }
    const startDate = new Date(odsDateOd);
    const endDate = new Date(odsDateDo);
    const dates = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate()+1)) {
      const dw = d.getDay();
      if (dw !== 0 && dw !== 6) dates.push(d.toISOString().slice(0,10));
    }
    if (dates.length === 0) return alert('Nema radnih dana u odabranom periodu!');
    setGodisnji(g => {
      const prev = (g[worker.id] || []).filter(e => !dates.includes(e.date));
      const newEntries = dates.map(dt => ({ date: dt, type: odsutnostType, note }));
      return { ...g, [worker.id]: [...prev, ...newEntries] };
    });
    onClose();
  };

  const handleSaveKancelarijaOrTeren = () => {
    const entry = {
      id: uid(), date: selectedDate,
      deptId: deptId || 'kancelarija_teren',
      jobType: quickStatus === 'kancelarija' ? 'Kancelarija' : 'Teren',
      primatWorker: null, helper1Worker: null, helper2Worker: null,
      extraWorkers: [], allWorkers: [worker.id], note, overrides: [],
    };
    onSave(entry);
  };

  const handleSaveRad = () => {
    const isDeptRequired = DEPT_REQUIRED_JOBS.includes(jobType); // teren nije obavezan
    if (isDeptRequired && !deptId) return alert('Odaberi odjel!');
    const finalAllWorkers = otherDriverId && !allWorkers.includes(otherDriverId)
      ? [...allWorkers, otherDriverId] : allWorkers;
    const entry = {
      id: uid(), date: selectedDate, deptId,
      jobType: quickStatus === 'kancelarija' ? 'Kancelarija' : quickStatus === 'teren' ? 'Teren' : jobType,
      primatWorker: isPrimac ? worker.id : null,
      helper1Worker: null, helper2Worker: null,
      extraWorkers: isPrimac ? extraWorkers : [],
      allWorkers: finalAllWorkers, note, overrides: [],
      vehicleId: vehicleIds[0] || '',
      vehicleIds: vehicleIds,
      otherDriverId: otherDriverId || '',
    };
    const c = checkConflict(entry, null);
    if (c.length > 0 && !forceOverride) { setConflicts(c); return; }
    onSave({...entry, overrides: forceOverride ? c : []});
  };

  const oc = ODSUTNOST_COLOR[odsutnostType];

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal" style={{maxWidth: isPrimac && mode==='rad' ? 520 : 400}}>
        {/* Header */}
        <div className="modal-header" style={{background: cat?.pale, borderBottom: `2px solid ${cat?.border}`}}>
          <span style={{fontSize:'1.5rem'}}>{cat?.icon}</span>
          <div style={{flex:1}}>
            <div className="modal-title" style={{color: cat?.color}}>{worker.name}</div>
            <div style={{fontSize:'0.72rem',color:cat?.color,opacity:0.8,fontWeight:600}}>{cat?.label}</div>
          </div>
          <div style={{fontFamily:'var(--mono)',fontSize:'0.75rem',color:'var(--text-muted)',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:4,padding:'0.2rem 0.5rem'}}>{selectedDate}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        {/* Mode selector */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',borderBottom:'1px solid var(--border)'}}>
          <button onClick={()=>setMode('rad')} style={{
            padding:'0.6rem',border:'none',cursor:'pointer',fontWeight:600,fontSize:'0.82rem',
            background: mode==='rad' ? 'var(--green-pale)' : 'var(--bg)',
            color: mode==='rad' ? 'var(--green)' : 'var(--text-muted)',
            borderBottom: mode==='rad' ? '2px solid var(--green)' : '2px solid transparent',
          }}>💼 Rasporedi na posao</button>
          <button onClick={()=>setMode('odsutnost')} style={{
            padding:'0.6rem',border:'none',cursor:'pointer',fontWeight:600,fontSize:'0.82rem',
            background: mode==='odsutnost' ? '#fde8e8' : 'var(--bg)',
            color: mode==='odsutnost' ? '#8b2020' : 'var(--text-muted)',
            borderBottom: mode==='odsutnost' ? '2px solid #8b2020' : '2px solid transparent',
          }}>🏖️ Odsutnost</button>
        </div>

        <div className="modal-body" style={{maxHeight:'68vh',overflowY:'auto'}}>
          {/* ── ODSUTNOST MODE ── */}
          {mode === 'odsutnost' && (
            <div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.5rem',marginBottom:'0.75rem'}}>
                {ODSUTNOST_TYPES.map(t => {
                  const o = ODSUTNOST_COLOR[t];
                  return (
                    <button key={t} type="button" onClick={()=>setOdsType(t)} style={{
                      padding:'0.65rem 0.5rem',border:`2px solid ${odsutnostType===t ? o.color : o.border}`,
                      borderRadius:8,background:odsutnostType===t ? o.bg : 'var(--bg)',
                      color:odsutnostType===t ? o.color : 'var(--text-muted)',
                      fontWeight:odsutnostType===t ? 700 : 400,
                      fontSize:'0.82rem',cursor:'pointer',
                      display:'flex',flexDirection:'column',alignItems:'center',gap:'0.2rem',
                    }}>
                      <span style={{fontSize:'1.3rem'}}>{o.icon}</span>
                      <span>{t}</span>
                    </button>
                  );
                })}
              </div>

              {/* Period (Od - Do) */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem',marginBottom:'0.5rem'}}>
                <div className="form-group" style={{marginBottom:0}}>
                  <label className="form-label">Od *</label>
                  <input type="date" className="form-input" value={odsDateOd}
                    onChange={e => { setOdsDateOd(e.target.value); if (odsDateDo && odsDateDo < e.target.value) setOdsDateDo(e.target.value); }} />
                </div>
                <div className="form-group" style={{marginBottom:0}}>
                  <label className="form-label">Do <span style={{color:'var(--text-light)',fontWeight:400}}>(opciono)</span></label>
                  <input type="date" className="form-input" value={odsDateDo} min={odsDateOd || undefined}
                    onChange={e => setOdsDateDo(e.target.value)} />
                </div>
              </div>
              {odsDateOd && !odsDateDo && (
                <div style={{fontSize:'0.75rem',color:'#b5620a',marginBottom:'0.4rem',fontStyle:'italic'}}>Bez krajnjeg datuma — odsutnost ostaje otvorena dok se ne zaključi</div>
              )}
              {odsDateOd && odsDateDo && odsDateDo >= odsDateOd && (() => {
                const s = new Date(odsDateOd), e = new Date(odsDateDo);
                let count = 0;
                for (let d = new Date(s); d <= e; d.setDate(d.getDate()+1)) { const dw=d.getDay(); if(dw!==0&&dw!==6) count++; }
                return <div style={{fontSize:'0.75rem',color:'var(--text-muted)',marginBottom:'0.4rem'}}>📅 {count} radni{count===1?'':count<5?'a':'h'} dan{count===1?'':count<5?'a':'a'} u periodu</div>;
              })()}

              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label">Napomena</label>
                <input className="form-input" placeholder="Opcionalno..." value={note} onChange={e=>setNote(e.target.value)} />
              </div>
            </div>
          )}

          {/* ── RAD MODE ── */}
          {mode === 'rad' && (
            <div>
              {conflicts.length > 0 && !forceOverride && (
                <div className="alert alert-warning" style={{marginBottom:'0.75rem'}}>
                  ⚠️ Konflikt: <strong>{conflicts.map(wName).join(', ')}</strong> već raspoređeni.
                  <div style={{marginTop:'0.4rem'}}>
                    <button className="btn btn-secondary btn-sm" onClick={()=>setForce(true)}>Ipak sačuvaj</button>
                  </div>
                </div>
              )}

              {/* Kancelarija / Teren brze opcije */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.4rem',marginBottom:'0.75rem'}}>
                {QUICK_STATUSES.map(qs => (
                  <button key={qs.id} type="button" onClick={()=>setQuickStatus(quickStatus===qs.id ? null : qs.id)} style={{
                    padding:'0.5rem',border:`2px solid ${quickStatus===qs.id ? qs.color : qs.border}`,
                    borderRadius:8,background:quickStatus===qs.id ? qs.bg : 'var(--bg)',
                    color:quickStatus===qs.id ? qs.color : 'var(--text-muted)',
                    fontWeight:quickStatus===qs.id ? 700 : 400,
                    fontSize:'0.82rem',cursor:'pointer',
                    display:'flex',alignItems:'center',justifyContent:'center',gap:'0.4rem',
                  }}>
                    <span style={{fontSize:'1.1rem'}}>{qs.icon}</span>{qs.label}
                  </button>
                ))}
              </div>

              {/* Vrsta posla — hide if kancelarija/teren selected */}
              {!quickStatus && (
                <div className="form-group">
                  <label className="form-label">Vrsta posla</label>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'0.3rem'}}>
                    {(allJobTypes || JOB_TYPES).map(jt => (
                      <button key={jt} type="button"
                        onClick={() => setJobType(jt)}
                        className={jobBadgeClass(jt)}
                        style={{
                          cursor:'pointer',
                          border: jobType===jt ? '2px solid #333' : '2px solid transparent',
                          opacity: jobType===jt ? 1 : 0.55,
                          fontSize:'0.75rem', padding:'0.25rem 0.6rem',
                        }}>{jt}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Odjel — hide for kancelarija */}
              {(quickStatus === 'teren' || (!quickStatus && DEPT_SHOW_JOBS.includes(jobType))) && (
                <div className="form-group">
                  <label className="form-label" style={DEPT_REQUIRED_JOBS.includes(jobType) ? {color:'#b5620a',fontWeight:700} : {}}>
                    Odjel / Radilište
                    {!DEPT_REQUIRED_JOBS.includes(jobType) && quickStatus !== 'teren' && <span style={{color:'var(--text-light)',fontSize:'0.72rem',fontWeight:400}}> (opciono)</span>}
                  </label>
                  {departments.length > 0 && (
                    <select className="form-select" value={deptId} onChange={e=>setDeptId(e.target.value)} style={{marginBottom:'0.4rem'}}>
                      <option value="">— Odaberi postojeći —</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.gospodarskaJedinica} — Odjel {d.brojOdjela}</option>)}
                    </select>
                  )}
                  <div style={{display:'flex',gap:'0.4rem',alignItems:'flex-end'}}>
                    <div style={{flex:2}}>
                      <div style={{fontSize:'0.7rem',color:'var(--text-light)',marginBottom:'0.2rem'}}>Gospodarska jedinica</div>
                      <input className="form-input" list="gj-list-quick"
                        placeholder="Odaberi ili upiši..." value={newGJ}
                        onChange={e=>setNewGJ(e.target.value)} style={{fontSize:'0.82rem'}} />
                      <datalist id="gj-list-quick">
                        {GOSPODARSKE_JEDINICE.map(g => <option key={g} value={g} />)}
                      </datalist>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'0.7rem',color:'var(--text-light)',marginBottom:'0.2rem'}}>Br. odjela</div>
                      <input className="form-input" placeholder="npr. 54" value={newBroj} onChange={e=>setNewBroj(e.target.value)} style={{fontSize:'0.82rem'}} onKeyDown={e=>e.key==='Enter'&&addDept()} />
                    </div>
                    <button className="btn btn-secondary btn-sm" style={{whiteSpace:'nowrap',flexShrink:0}} onClick={addDept}>+ Dodaj</button>
                  </div>
                  {deptId && departments.find(d=>d.id===deptId) && (
                    <div style={{marginTop:'0.3rem',fontSize:'0.75rem',color:'var(--green)',fontWeight:600}}>
                      ✓ {departments.find(d=>d.id===deptId).gospodarskaJedinica} — Odjel {departments.find(d=>d.id===deptId).brojOdjela}
                    </div>
                  )}
                </div>
              )}

              {/* Companions for primac */}
              {isPrimac && !quickStatus && (
                <div className="form-group">
                  <label className="form-label">Pratioci (opciono)</label>
                  <input className="form-input" placeholder="🔍 Pretraži radnika..." value={workerSearch}
                    onChange={e => setWorkerSearch(e.target.value)}
                    style={{marginBottom:'0.4rem',fontSize:'0.82rem',padding:'0.35rem 0.6rem'}} />
                  <div className="worker-selector">
                    {companionGroups.map(g => {
                      const filtered = g.workers.filter(w => !extraWorkers.includes(w.id) && (!workerSearch || w.name.toLowerCase().includes(workerSearch.toLowerCase())));
                      if (filtered.length === 0) return null;
                      return (
                        <div key={g.label}>
                          <div style={{padding:'0.25rem 0.7rem',fontSize:'0.62rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--text-light)',background:'var(--bg)',borderBottom:'1px solid var(--border)'}}>
                            {g.label}
                          </div>
                          {filtered.map(w => {
                            const wcat = getCatById(w.category);
                            return (
                              <div key={w.id} className="worker-option" onClick={() => toggleExtra(w.id)}>
                                <span style={{fontSize:'0.85rem'}}>{wcat?.icon}</span>
                                {w.name}
                                <span style={{marginLeft:'auto',fontSize:'0.65rem',color:wcat?.color,background:wcat?.pale,border:`1px solid ${wcat?.border}`,padding:'0.1rem 0.3rem',borderRadius:3,fontFamily:'var(--mono)'}}>{wcat?.short}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                  {extraWorkers.length > 0 && (
                    <div style={{display:'flex',flexWrap:'wrap',gap:'0.3rem',marginTop:'0.4rem'}}>
                      {extraWorkers.map(wId => {
                        const w = workers.find(x=>x.id===wId);
                        return (
                          <span key={wId} style={{display:'inline-flex',alignItems:'center',gap:'0.3rem',background:'white',border:'1px solid var(--border)',borderRadius:20,padding:'0.2rem 0.4rem 0.2rem 0.6rem',fontSize:'0.78rem'}}>
                            {w?.name}
                            <button onClick={()=>toggleExtra(wId)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',fontSize:'0.75rem',padding:'0 0.1rem'}}>✕</button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── VOZILA SEKCIJA (više vozila) ── */}
              {availableVehicles.length > 0 && !quickStatus && (
                <div className="form-group">
                  <label className="form-label">🚗 Vozila (prevoz ekipe)</label>

                  {/* Odabrana vozila */}
                  {vehicleIds.length > 0 && (
                    <div style={{display:'flex',flexDirection:'column',gap:'0.3rem',marginBottom:'0.4rem'}}>
                      {vehicleIds.map(vid => {
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
                            <button onClick={() => setVehicleIds(prev => prev.filter(id => id !== vid))}
                              style={{background:'#c53030',color:'white',border:'none',borderRadius:4,cursor:'pointer',fontSize:'0.65rem',padding:'0.15rem 0.35rem',fontWeight:600}}>✕</button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Dodaj vozilo dropdown */}
                  <select className="form-select" value="" onChange={e => {
                    if (e.target.value && !vehicleIds.includes(e.target.value)) {
                      setVehicleIds(prev => [...prev, e.target.value]);
                    }
                  }} style={{marginBottom:'0.3rem'}}>
                    <option value="">— Dodaj vozilo —</option>
                    {availableVehicles.filter(v => !vehicleIds.includes(v.id)).map(v => {
                      const drv = v.driverId ? workers.find(w => w.id === v.driverId) : null;
                      return <option key={v.id} value={v.id}>{v.registracija} — {v.tipVozila} ({v.brojMjesta} mj.){drv ? ` — ${drv.name}` : ''}</option>;
                    })}
                  </select>

                  {/* Popunjenost po vozilima */}
                  {vehicleIds.length > 0 && (() => {
                    const totalWorkers = allWorkers.length + (otherDriverId ? 1 : 0);
                    let remaining = totalWorkers;
                    const perVehicle = vehicleIds.map(vid => {
                      const v = availableVehicles.find(x => x.id === vid);
                      const cap = v?.brojMjesta || 0;
                      const fill = Math.min(remaining, cap);
                      remaining = Math.max(0, remaining - cap);
                      return { vid, cap, fill, v };
                    });
                    const totalCap = perVehicle.reduce((s, p) => s + p.cap, 0);
                    const isOver = totalWorkers > totalCap;
                    return (
                      <div style={{marginTop:'0.3rem'}}>
                        {perVehicle.map((pv, idx) => (
                          <div key={pv.vid} style={{display:'flex',alignItems:'center',gap:'0.4rem',marginBottom:'0.2rem',fontSize:'0.72rem'}}>
                            <span style={{color:'var(--text-muted)',minWidth:90}}>{pv.v?.registracija || '?'}</span>
                            <div style={{flex:1,height:7,background:'#eee',borderRadius:4,overflow:'hidden'}}>
                              <div style={{height:'100%',width:`${pv.cap>0?Math.min(100,(pv.fill/pv.cap)*100):0}%`,background:pv.fill>=pv.cap?'#ed8936':'#38a169',borderRadius:4,transition:'width 0.3s'}} />
                            </div>
                            <span style={{fontWeight:600,color:pv.fill>=pv.cap?(pv.fill>pv.cap?'#c53030':'#b5620a'):'var(--green)',minWidth:40,textAlign:'right'}}>{pv.fill}/{pv.cap}</span>
                          </div>
                        ))}
                        <div style={{fontSize:'0.72rem',fontWeight:600,color: isOver ? '#c53030' : 'var(--green)',marginTop:'0.15rem'}}>
                          {isOver ? '⚠️' : '✅'} Ukupno: {totalWorkers} radnika / {totalCap} mjesta ({vehicleIds.length} voz.)
                          {remaining > 0 && <span style={{color:'#c53030'}}> — {remaining} bez mjesta!</span>}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Drugi vozač opcija */}
                  {vehicleIds.length > 0 && (
                    !showOtherDriver ? (
                      <button type="button" onClick={() => setShowOtherDriver(true)}
                        style={{marginTop:4,background:'none',border:'none',color:'var(--blue, #2a6478)',cursor:'pointer',fontSize:'0.72rem',padding:0,textDecoration:'underline'}}>
                        + Drugi vozač za danas (poslovođa, primač, otpremač)...
                      </button>
                    ) : (
                      <div style={{marginTop:'0.4rem',background:'#fff8e1',border:'1px solid #ffe082',borderRadius:'var(--radius)',padding:'0.4rem 0.5rem'}}>
                        <div style={{fontSize:'0.7rem',color:'#b5620a',marginBottom:'0.2rem',fontWeight:600}}>🔄 Drugi šofer — samo za danas</div>
                        <select className="form-select" value={otherDriverId} onChange={e => setOtherDriverId(e.target.value)}>
                          <option value="">— Stalni šofer —</option>
                          {OTHER_DRIVER_CATS.map(catId => {
                            const catI = getCatById(catId);
                            const catW = otherPotentialDrivers.filter(w => w.category === catId);
                            if (catW.length === 0) return null;
                            return (
                              <optgroup key={catId} label={catI ? catI.label : catId}>
                                {catW.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                              </optgroup>
                            );
                          })}
                        </select>
                        <button type="button" onClick={() => { setShowOtherDriver(false); setOtherDriverId(''); }}
                          style={{marginTop:4,background:'none',border:'none',color:'#2a6478',cursor:'pointer',fontSize:'0.72rem',padding:0,textDecoration:'underline'}}>
                          ← Ukloni drugog vozača
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}

              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label">Napomena</label>
                <input className="form-input" placeholder="Opcionalno..." value={note} onChange={e=>setNote(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Odustani</button>
          {mode === 'odsutnost' ? (
            <button className="btn btn-primary" style={{background: oc?.color, borderColor: oc?.color}} onClick={handleSaveOdsutnost}>
              {oc?.icon} Sačuvaj {odsutnostType}
            </button>
          ) : quickStatus === 'kancelarija' ? (
            <button className="btn btn-primary" style={{background:'#3949ab',borderColor:'#3949ab'}} onClick={handleSaveKancelarijaOrTeren}>
              🏢 Kancelarija
            </button>
          ) : quickStatus === 'teren' ? (
            <button className="btn btn-primary" style={{background:'#2e7d32',borderColor:'#2e7d32'}} onClick={handleSaveRad}>
              🌿 Teren
            </button>
          ) : (
            <button className="btn btn-primary" style={{background:cat?.color,borderColor:cat?.color}} onClick={handleSaveRad}>
              ✓ Rasporedi {worker.name.split(' ')[0]}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

