// ─── WORKERS VIEW ─────────────────────────────────────────────────────────────
function WorkersView({ workers, setWorkers, schedules }) {
  const [modal, setModal]           = useState(null);
  const [search, setSearch]         = useState('');
  const [activeCat, setActiveCat]   = useState('sve');   // 'sve' | catId
  const [statusFilter, setStatus]   = useState('sve');   // 'sve'|'aktivan'|'neaktivan'
  const [viewMode, setViewMode]     = useState('kartice'); // 'kartice' | 'tabela'
  const [detailWorker, setDetail]   = useState(null);

  // ── filter ──
  const filtered = useMemo(() => workers.filter(w => {
    const matchSearch = w.name.toLowerCase().includes(search.toLowerCase()) ||
      (w.phone||'').includes(search) || (w.note||'').toLowerCase().includes(search.toLowerCase());
    const matchCat    = activeCat === 'sve' || w.category === activeCat;
    const matchStatus = statusFilter === 'sve' || w.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  }), [workers, search, activeCat, statusFilter]);

  // ── stats per category ──
  const catCounts = useMemo(() => {
    const m = { sve: workers.length };
    WORKER_CATEGORIES.forEach(c => { m[c.id] = workers.filter(w => w.category === c.id).length; });
    return m;
  }, [workers]);

  // ── schedules count per worker ──
  const workerSchedCount = useMemo(() => {
    const m = {};
    schedules.forEach(s => s.allWorkers.forEach(wId => { m[wId] = (m[wId]||0)+1; }));
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

  const handleDelete = (w) => {
    if (confirm(`Obrisati radnika "${w.name}"?\n\nOvo ne briše historiju rasporeda.`))
      setWorkers(ws => ws.filter(x => x.id !== w.id));
  };

  // ── WORKER MODAL ──
  const WorkerModal = ({ worker, onClose }) => {
    const blank = { id: uid(), name: '', status: 'aktivan', category: WORKER_CATEGORIES[0].id, phone: '', note: '' };
    const [form, setForm] = useState(worker ? {...worker} : blank);
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
      if (worker) setWorkers(ws => ws.map(w => w.id === form.id ? form : w));
      else setWorkers(ws => [...ws, form]);
      onClose();
    };

    const selCat = getCatById(form.category);

    return (
      <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
        <div className="modal" style={{maxWidth:560}}>
          <div className="modal-header" style={{background: selCat ? selCat.pale : undefined, borderBottom:`2px solid ${selCat?.border||'var(--border)'}`}}>
            <span style={{fontSize:'1.4rem'}}>{selCat?.icon || '👷'}</span>
            <div>
              <div className="modal-title">{worker ? 'Uredi radnika' : 'Novi radnik'}</div>
              {selCat && <div style={{fontSize:'0.72rem',color:selCat.color,fontWeight:600}}>{selCat.label}</div>}
            </div>
            <button className="btn btn-ghost btn-icon" style={{marginLeft:'auto'}} onClick={onClose}>✕</button>
          </div>

          <div className="modal-body" style={{maxHeight:'72vh',overflowY:'auto'}}>

            {/* KATEGORIJA – prominentno na vrhu */}
            <div style={{marginBottom:'1.1rem'}}>
              <label className="form-label">Kategorija radnika *</label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem'}}>
                {WORKER_CATEGORIES.map(cat => (
                  <button key={cat.id}
                    type="button"
                    onClick={() => setForm(f=>({...f,category:cat.id}))}
                    style={{
                      display:'flex', alignItems:'center', gap:'0.5rem',
                      padding:'0.6rem 0.8rem',
                      border: `2px solid ${form.category===cat.id ? cat.color : 'var(--border)'}`,
                      borderRadius: 6,
                      background: form.category===cat.id ? cat.pale : 'var(--bg)',
                      color: form.category===cat.id ? cat.color : 'var(--text-muted)',
                      fontWeight: form.category===cat.id ? 700 : 400,
                      fontSize: '0.82rem', cursor:'pointer', transition:'all 0.12s',
                      textAlign:'left',
                    }}>
                    <span style={{fontSize:'1.1rem'}}>{cat.icon}</span>
                    <div>
                      <div style={{fontWeight:600,fontSize:'0.78rem'}}>{cat.short}</div>
                      <div style={{fontSize:'0.65rem',opacity:0.7,marginTop:1}}>{cat.label}</div>
                    </div>
                    {form.category===cat.id && <span style={{marginLeft:'auto',fontSize:'0.9rem'}}>✓</span>}
                  </button>
                ))}
              </div>
              {errors.category && <div style={{color:'var(--red)',fontSize:'0.75rem',marginTop:'0.3rem'}}>⚠ {errors.category}</div>}
            </div>

            <div className="divider"/>

            {/* IME */}
            <div className="form-group">
              <label className="form-label">Ime i prezime *</label>
              <input className="form-input" value={form.name}
                onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                placeholder="npr. Amer Hodžić"
                style={errors.name ? {borderColor:'var(--red)'} : {}} />
              {errors.name && <div style={{color:'var(--red)',fontSize:'0.75rem',marginTop:'0.3rem'}}>⚠ {errors.name}</div>}
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status}
                  onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                  <option value="aktivan">✅ Aktivan</option>
                  <option value="neaktivan">⛔ Neaktivan</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Telefon</label>
                <input className="form-input" value={form.phone||''}
                  onChange={e=>setForm(f=>({...f,phone:e.target.value}))}
                  placeholder="061-xxx-xxx" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Napomena</label>
              <textarea className="form-input" rows={2} value={form.note||''}
                onChange={e=>setForm(f=>({...f,note:e.target.value}))}
                placeholder="Bolovanje, posebne napomene, kvalifikacije..."
                style={{resize:'vertical'}} />
            </div>

          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Odustani</button>
            <button className="btn btn-primary" onClick={save}>
              {worker ? '💾 Spremi izmjenu' : '+ Dodaj radnika'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── DETAIL MODAL ──
  const DetailModal = ({ worker, onClose }) => {
    const cat = getCatById(worker.category);
    const sc = workerSchedCount[worker.id] || 0;
    const ls = workerLastSeen[worker.id];
    const recentSched = schedules
      .filter(s => s.allWorkers.includes(worker.id))
      .sort((a,b) => b.date.localeCompare(a.date))
      .slice(0, 5);

    return (
      <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
        <div className="modal" style={{maxWidth:480}}>
          <div className="modal-header" style={{background: cat?.pale, borderBottom:`2px solid ${cat?.border}`}}>
            <span style={{fontSize:'2rem'}}>{cat?.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:'1rem'}}>{worker.name}</div>
              <div style={{fontSize:'0.75rem',color:cat?.color,fontWeight:600}}>{cat?.label}</div>
            </div>
            <span style={{
              padding:'0.2rem 0.6rem', borderRadius:12, fontSize:'0.72rem',fontWeight:700,
              background: worker.status==='aktivan' ? '#d4edda' : '#f8d7da',
              color: worker.status==='aktivan' ? '#155724' : '#721c24',
            }}>{worker.status==='aktivan' ? '✅ Aktivan' : '⛔ Neaktivan'}</span>
            <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'1rem'}}>
              <div style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:6,padding:'0.75rem'}}>
                <div style={{fontFamily:'var(--mono)',fontSize:'1.4rem',fontWeight:700,color:'var(--green)'}}>{sc}</div>
                <div style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>Ukupno rasporeda</div>
              </div>
              <div style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:6,padding:'0.75rem'}}>
                <div style={{fontFamily:'var(--mono)',fontSize:'0.9rem',fontWeight:700,color:'var(--green)'}}>{ls ? fmtDate(ls) : '—'}</div>
                <div style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>Posljednji raspored</div>
              </div>
            </div>
            {worker.phone && (
              <div style={{marginBottom:'0.75rem',fontSize:'0.85rem'}}>
                <span style={{color:'var(--text-muted)'}}>📞 </span>{worker.phone}
              </div>
            )}
            {worker.note && (
              <div style={{background:'var(--amber-pale)',border:'1px solid #e8c17a',borderRadius:6,padding:'0.6rem 0.75rem',fontSize:'0.82rem',marginBottom:'1rem'}}>
                📝 {worker.note}
              </div>
            )}
            {recentSched.length > 0 && (
              <div>
                <div style={{fontFamily:'var(--mono)',fontSize:'0.65rem',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--text-light)',marginBottom:'0.4rem'}}>NEDAVNI RASPOREDI</div>
                {recentSched.map(s => (
                  <div key={s.id} style={{display:'flex',gap:'0.5rem',alignItems:'center',padding:'0.3rem 0',borderBottom:'1px solid var(--border)',fontSize:'0.8rem'}}>
                    <span style={{fontFamily:'var(--mono)',color:'var(--text-muted)',fontSize:'0.75rem'}}>{fmtDate(s.date)}</span>
                    <span className={jobBadgeClass(s.jobType)} style={{fontSize:'0.65rem'}}>{s.jobType}</span>
                    <span style={{color:'var(--text-muted)',fontSize:'0.75rem',marginLeft:'auto'}}>
                      {/* dept name handled by parent — just show deptId here */}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Zatvori</button>
            <button className="btn btn-primary" onClick={() => { onClose(); setTimeout(()=>setModal(worker),50); }}>✏️ Uredi</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{maxWidth:'100%',overflowX:'hidden'}}>
      {/* HEADER ROW */}
      <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap'}}>
        <div className="section-title">Evidencija radnika</div>
        <span className="tag" style={{marginRight:'auto'}}>{workers.filter(w=>w.status==='aktivan').length} aktivnih / {workers.length} ukupno</span>
        <div style={{display:'flex',gap:'0.5rem'}}>
          <button className={`btn btn-sm ${viewMode==='kartice'?'btn-primary':'btn-secondary'}`} onClick={()=>setViewMode('kartice')}>⊞ Kartice</button>
          <button className={`btn btn-sm ${viewMode==='tabela'?'btn-primary':'btn-secondary'}`}  onClick={()=>setViewMode('tabela')}>≡ Tabela</button>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setModal({})}>+ Novi radnik</button>
      </div>

      {/* CATEGORY SUMMARY CARDS */}
      <div className="category-grid">
        {WORKER_CATEGORIES.map(cat => {
          const cnt     = catCounts[cat.id] || 0;
          const active  = activeCat === cat.id;
          return (
            <button key={cat.id}
              onClick={() => setActiveCat(active ? 'sve' : cat.id)}
              className="category-card"
              style={{
                border:`2px solid ${active ? cat.color : 'var(--border)'}`,
                background: active ? cat.pale : 'var(--surface)',
                boxShadow: active ? `0 0 0 1px ${cat.border}` : 'var(--shadow)',
              }}>
              <div style={{display:'flex',alignItems:'center',gap:'0.3rem'}}>
                <span className="category-card-icon">{cat.icon}</span>
                <span className="category-card-count" style={{color:cat.color}}>{cnt}</span>
              </div>
              <div className="category-card-label" style={{color: active ? cat.color : 'var(--text-muted)'}}>{cat.label}</div>
            </button>
          );
        })}
      </div>

      {/* FILTER BAR */}
      <div style={{display:'flex',gap:'0.5rem',marginBottom:'1rem',flexWrap:'wrap',alignItems:'center'}}>
        <input className="form-input" placeholder="🔍 Pretraži ime, telefon..."
          value={search} onChange={e=>setSearch(e.target.value)}
          style={{flex:'1 1 150px',minWidth:0,maxWidth:300}} />
        <div style={{display:'flex',gap:'0.3rem'}}>
          {['sve','aktivan','neaktivan'].map(s => (
            <button key={s} className={`filter-chip ${statusFilter===s?'active':''}`}
              onClick={() => setStatus(s)}>
              {s==='sve'?'Svi':s==='aktivan'?'✅ Aktivni':'⛔ Neaktivni'}
            </button>
          ))}
        </div>
        {(activeCat!=='sve'||statusFilter!=='sve'||search) && (
          <button className="btn btn-ghost btn-sm" onClick={()=>{setActiveCat('sve');setStatus('sve');setSearch('');}}>✕ Resetuj</button>
        )}
        <span style={{marginLeft:'auto',fontSize:'0.78rem',color:'var(--text-muted)'}}>{filtered.length} radnika</span>
      </div>

      {/* VIEW: KARTICE */}
      {viewMode === 'kartice' && (
        <div className="worker-cards-grid">
          {filtered.length === 0 && (
            <div className="empty-state" style={{gridColumn:'1/-1'}}>
              <span className="icon">👷</span><p>Nema radnika za odabrane filtere.</p>
            </div>
          )}
          {filtered.map(w => {
            const cat = getCatById(w.category);
            const sc  = workerSchedCount[w.id] || 0;
            const ls  = workerLastSeen[w.id];
            return (
              <div key={w.id} className="worker-card" style={{
                background:'var(--surface)', border:`1px solid ${w.status==='aktivan'?'var(--border)':'#f0c0c0'}`,
                borderRadius:8, overflow:'hidden', boxShadow:'var(--shadow)',
                opacity: w.status==='aktivan' ? 1 : 0.72,
                transition:'box-shadow 0.12s',
              }}>
                {/* category stripe */}
                <div className="worker-card-stripe" style={{
                  height:4, background:`linear-gradient(90deg,${cat?.color||'#999'},${cat?.border||'#ccc'})`,
                }}/>
                <div className="worker-card-body" style={{padding:'0.9rem'}}>
                  {/* top row */}
                  <div className="worker-card-top" style={{display:'flex',alignItems:'flex-start',gap:'0.5rem',marginBottom:'0.6rem'}}>
                    <div className="worker-card-avatar" style={{
                      width:38,height:38,borderRadius:8,
                      background: cat?.pale||'#f0f0f0',
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:'1.3rem',flexShrink:0,
                      border:`1px solid ${cat?.border||'#ccc'}`,
                    }}>{cat?.icon||'👤'}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div className="worker-card-name" style={{fontWeight:700,fontSize:'0.88rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{w.name}</div>
                      <CatBadge catId={w.category} size="small" />
                    </div>
                    <span className="worker-card-status" style={{
                      fontSize:'0.65rem',fontWeight:700,padding:'0.15rem 0.4rem',borderRadius:10,
                      background: w.status==='aktivan'?'#d4edda':'#f8d7da',
                      color: w.status==='aktivan'?'#155724':'#721c24',
                      flexShrink:0,
                    }}>{w.status==='aktivan'?'AKT':'NEA'}</span>
                  </div>

                  {/* info */}
                  <div className="worker-card-stats" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.4rem',marginBottom:'0.6rem'}}>
                    <div style={{background:'var(--bg)',borderRadius:4,padding:'0.3rem 0.5rem',textAlign:'center'}}>
                      <div style={{fontFamily:'var(--mono)',fontSize:'1rem',fontWeight:700,color:'var(--green)'}}>{sc}</div>
                      <div style={{fontSize:'0.62rem',color:'var(--text-light)'}}>rasporeda</div>
                    </div>
                    <div style={{background:'var(--bg)',borderRadius:4,padding:'0.3rem 0.5rem',textAlign:'center'}}>
                      <div style={{fontFamily:'var(--mono)',fontSize:'0.72rem',fontWeight:600,color:'var(--green)'}}>{ls?fmtDate(ls):'—'}</div>
                      <div style={{fontSize:'0.62rem',color:'var(--text-light)'}}>posljednji</div>
                    </div>
                  </div>

                  {w.phone && <div className="worker-card-phone" style={{fontSize:'0.75rem',color:'var(--text-muted)',marginBottom:'0.3rem'}}>📞 {w.phone}</div>}
                  {w.note  && <div className="worker-card-note" style={{fontSize:'0.72rem',color:'var(--text-muted)',fontStyle:'italic',marginBottom:'0.4rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{w.note}</div>}

                  {/* actions */}
                  <div className="worker-card-actions" style={{display:'flex',gap:'0.3rem',marginTop:'0.5rem',borderTop:'1px solid var(--border)',paddingTop:'0.5rem',flexWrap:'wrap'}}>
                    <button className="btn btn-ghost btn-sm" style={{flex:1}} onClick={() => setDetail(w)}>👁 Detalji</button>
                    {w.category === 'primac_panj' && (
                      <button className="btn btn-sm worker-card-transfer" title="Prebaci u pomoćnog radnika"
                        style={{flex:'1 0 100%',background:'#e4edf5',color:'#1a3d5c',border:'1px solid #9bbfd9',fontSize:'0.72rem'}}
                        onClick={() => { if(confirm(`Prebaciti "${w.name}" u Pomoćnog radnika?`)) setWorkers(ws => ws.map(x => x.id===w.id ? {...x, category:'pomocni'} : x)); }}>
                        🔄 Prebaci u pomoćnog
                      </button>
                    )}
                    {w.category === 'pomocni' && (
                      <button className="btn btn-sm worker-card-transfer" title="Vrati u primača"
                        style={{flex:'1 0 100%',background:'#e8f0e6',color:'#2d5a27',border:'1px solid #9bc492',fontSize:'0.72rem'}}
                        onClick={() => { if(confirm(`Vratiti "${w.name}" u Primača na šuma panju?`)) setWorkers(ws => ws.map(x => x.id===w.id ? {...x, category:'primac_panj'} : x)); }}>
                        🔄 Vrati u primača
                      </button>
                    )}
                    <button className="btn btn-ghost btn-icon btn-sm" title="Uredi" onClick={() => setModal(w)}>✏️</button>
                    <button className="btn btn-danger btn-icon btn-sm" title="Briši" onClick={() => handleDelete(w)}>🗑️</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: TABELA */}
      {viewMode === 'tabela' && (
        <div className="card">
          {filtered.length === 0 ? (
            <div className="empty-state"><span className="icon">👷</span><p>Nema radnika za odabrane filtere.</p></div>
          ) : (
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Ime i prezime</th>
                  <th>Kategorija</th>
                  <th>Status</th>
                  <th>Telefon</th>
                  <th>Rasporeda</th>
                  <th>Posljednji</th>
                  <th>Napomena</th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(w => (
                  <tr key={w.id} style={{opacity:w.status==='aktivan'?1:0.65}}>
                    <td style={{fontWeight:600}}>{w.name}</td>
                    <td><CatBadge catId={w.category} size="small"/></td>
                    <td>
                      <span style={{
                        display:'inline-block',padding:'0.15rem 0.5rem',borderRadius:10,fontSize:'0.72rem',fontWeight:700,
                        background: w.status==='aktivan'?'#d4edda':'#f8d7da',
                        color: w.status==='aktivan'?'#155724':'#721c24',
                      }}>{w.status==='aktivan'?'✅ Aktivan':'⛔ Neaktivan'}</span>
                    </td>
                    <td style={{fontFamily:'var(--mono)',fontSize:'0.78rem',color:'var(--text-muted)'}}>{w.phone||'—'}</td>
                    <td style={{textAlign:'center'}}>
                      <span className="tag">{workerSchedCount[w.id]||0}</span>
                    </td>
                    <td style={{fontFamily:'var(--mono)',fontSize:'0.75rem',color:'var(--text-muted)'}}>
                      {workerLastSeen[w.id] ? fmtDate(workerLastSeen[w.id]) : '—'}
                    </td>
                    <td style={{fontSize:'0.78rem',color:'var(--text-muted)',maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{w.note||'—'}</td>
                    <td>
                      <div style={{display:'flex',gap:'0.2rem',flexWrap:'wrap'}}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDetail(w)}>👁</button>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(w)}>✏️</button>
                        {w.category === 'primac_panj' && (
                          <button className="btn btn-sm" title="Prebaci u pomoćnog"
                            style={{background:'#e4edf5',color:'#1a3d5c',border:'1px solid #9bbfd9',fontSize:'0.7rem',padding:'0.2rem 0.4rem'}}
                            onClick={() => { if(confirm(`Prebaciti "${w.name}" u Pomoćnog?`)) setWorkers(ws => ws.map(x => x.id===w.id ? {...x, category:'pomocni'} : x)); }}>
                            🔄
                          </button>
                        )}
                        {w.category === 'pomocni' && (
                          <button className="btn btn-sm" title="Vrati u primača"
                            style={{background:'#e8f0e6',color:'#2d5a27',border:'1px solid #9bc492',fontSize:'0.7rem',padding:'0.2rem 0.4rem'}}
                            onClick={() => { if(confirm(`Vratiti "${w.name}" u Primača?`)) setWorkers(ws => ws.map(x => x.id===w.id ? {...x, category:'primac_panj'} : x)); }}>
                            🔄
                          </button>
                        )}
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(w)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* MODALS */}
      {modal    !== null && <WorkerModal worker={Object.keys(modal).length ? modal : null} onClose={() => setModal(null)} />}
      {detailWorker      && <DetailModal worker={detailWorker} onClose={() => setDetail(null)} />}
    </div>
  );
}

