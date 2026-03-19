// ─── SPISAK VIEW ──────────────────────────────────────────────────────────────
function SpisakView({ workers, setWorkers, vehicles }) {
  // editing: { workerId, field } | null
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState('');
  // adding: catId | null
  const [adding, setAdding] = useState(null);
  const [addName, setAddName] = useState('');

  const workersByCat = catId => workers.filter(w => w.category === catId);

  const startEdit = (w, field) => {
    setEditing({ workerId: w.id, field });
    setEditVal(w[field] || '');
  };

  const commitEdit = () => {
    if (!editing) return;
    setWorkers(ws => ws.map(w =>
      w.id === editing.workerId ? { ...w, [editing.field]: editVal } : w
    ));
    setEditing(null);
    setEditVal('');
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') { setEditing(null); setEditVal(''); }
  };

  const deleteWorker = (w) => {
    if (confirm(`Obrisati radnika "${w.name}"?`))
      setWorkers(ws => ws.filter(x => x.id !== w.id));
  };

  const toggleStatus = (w) => {
    setWorkers(ws => ws.map(x =>
      x.id === w.id ? { ...x, status: x.status === 'aktivan' ? 'neaktivan' : 'aktivan' } : x
    ));
  };

  const addWorker = (catId) => {
    const name = addName.trim();
    if (!name) return;
    const newW = { id: uid(), name, category: catId, status: 'aktivan', phone: '', note: '' };
    setWorkers(ws => [...ws, newW]);
    setAddName('');
    setAdding(null);
  };

  const moveWorker = (wId, newCat) => {
    setWorkers(ws => ws.map(w => w.id === wId ? { ...w, category: newCat } : w));
  };

  const CAT_COLS = SPISAK_COLUMNS.map(cid => WORKER_CATEGORIES.find(c => c.id === cid)).filter(Boolean);
  // max rows needed
  const maxRows = Math.max(0, ...CAT_COLS.map(c => workersByCat(c.id).length));

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap'}}>
        <div className="section-title">📊 Spisak radnika po kategorijama</div>
        <span style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>{workers.filter(w=>w.status==='aktivan').length} aktivnih / {workers.length} ukupno</span>
      </div>

      <div className="spisak-desktop" style={{overflowX:'auto',maxWidth:'100%'}}>
        <table style={{borderCollapse:'collapse',width:'100%',minWidth:'max-content'}}>
          <thead>
            <tr>
              {CAT_COLS.map(cat => (
                <th key={cat.id} style={{
                  background: cat.pale,
                  border: `2px solid ${cat.border}`,
                  padding: '0.6rem 0.75rem',
                  minWidth: 190,
                  verticalAlign: 'bottom',
                }}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.4rem',justifyContent:'space-between'}}>
                    <div>
                      <span style={{fontSize:'1.1rem'}}>{cat.icon}</span>
                      <div style={{fontWeight:700,fontSize:'0.8rem',color:cat.color,marginTop:'0.2rem',lineHeight:1.2}}>{cat.label}</div>
                      <div style={{fontFamily:'var(--mono)',fontSize:'0.65rem',color:cat.color,opacity:0.7,marginTop:'0.15rem'}}>
                        {workersByCat(cat.id).filter(w=>w.status==='aktivan').length} aktivnih
                      </div>
                    </div>
                    <button
                      onClick={() => { setAdding(cat.id); setAddName(''); }}
                      style={{background:cat.color,color:'white',border:'none',borderRadius:4,width:24,height:24,fontSize:'1rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontWeight:700}}
                      title="Dodaj radnika">+
                    </button>
                  </div>
                  {/* Add row */}
                  {adding === cat.id && (
                    <div style={{marginTop:'0.4rem',display:'flex',gap:'0.3rem'}}>
                      <input
                        autoFocus
                        className="form-input"
                        placeholder="Ime i prezime..."
                        value={addName}
                        onChange={e=>setAddName(e.target.value)}
                        onKeyDown={e=>{ if(e.key==='Enter') addWorker(cat.id); if(e.key==='Escape'){setAdding(null);setAddName('');} }}
                        style={{fontSize:'0.78rem',padding:'0.3rem 0.5rem',flex:1}}
                      />
                      <button onClick={()=>addWorker(cat.id)} style={{background:cat.color,color:'white',border:'none',borderRadius:4,padding:'0.3rem 0.5rem',cursor:'pointer',fontSize:'0.75rem',fontWeight:700}}>✓</button>
                      <button onClick={()=>{setAdding(null);setAddName('');}} style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:4,padding:'0.3rem 0.5rem',cursor:'pointer',fontSize:'0.75rem',color:'var(--text-muted)'}}>✕</button>
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({length: maxRows + 0}, (_,i) => (
              <tr key={i}>
                {CAT_COLS.map(cat => {
                  const ws = workersByCat(cat.id);
                  const w = ws[i];
                  if (!w) return <td key={cat.id} style={{border:`1px solid ${cat.border}`,background:cat.pale,opacity:0.3,minHeight:36}}></td>;
                  const isInactive = w.status !== 'aktivan';
                  const isEditingName = editing?.workerId === w.id && editing?.field === 'name';
                  const isEditingPhone = editing?.workerId === w.id && editing?.field === 'phone';

                  return (
                    <td key={cat.id} style={{
                      border:`1px solid ${cat.border}`,
                      padding:'0.3rem 0.5rem',
                      verticalAlign:'top',
                      background: isInactive ? '#fafafa' : 'white',
                      opacity: isInactive ? 0.55 : 1,
                    }}>
                      <div style={{display:'flex',alignItems:'center',gap:'0.25rem'}}>
                        {/* Row number */}
                        <span style={{fontFamily:'var(--mono)',fontSize:'0.6rem',color:'var(--text-light)',minWidth:14,textAlign:'right',flexShrink:0}}>{i+1}</span>

                        {/* Name — click to edit */}
                        <div style={{flex:1,minWidth:0}}>
                          {isEditingName ? (
                            <input
                              autoFocus
                              className="form-input"
                              value={editVal}
                              onChange={e=>setEditVal(e.target.value)}
                              onBlur={commitEdit}
                              onKeyDown={handleKeyDown}
                              style={{fontSize:'0.82rem',padding:'0.2rem 0.4rem',width:'100%'}}
                            />
                          ) : (
                            <span
                              onClick={() => startEdit(w, 'name')}
                              title="Klikni za editovanje"
                              style={{
                                fontSize:'0.85rem', fontWeight:600, cursor:'text',
                                display:'block',
                                textDecoration: isInactive ? 'line-through' : 'none',
                                color: isInactive ? 'var(--text-light)' : 'var(--text)',
                              }}>{w.name}</span>
                          )}
                          {/* Phone — smaller, editable */}
                          {isEditingPhone ? (
                            <input
                              autoFocus
                              className="form-input"
                              value={editVal}
                              onChange={e=>setEditVal(e.target.value)}
                              onBlur={commitEdit}
                              onKeyDown={handleKeyDown}
                              placeholder="Telefon..."
                              style={{fontSize:'0.7rem',padding:'0.15rem 0.3rem',width:'100%',marginTop:'0.15rem'}}
                            />
                          ) : (
                            <span
                              onClick={() => startEdit(w, 'phone')}
                              title="Klikni za editovanje telefona"
                              style={{fontSize:'0.7rem',color:'var(--text-muted)',cursor:'text',display:'block',marginTop:'0.1rem'}}>
                              {w.phone || <span style={{opacity:0.35,fontStyle:'italic'}}>+ telefon</span>}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div style={{display:'flex',flexDirection:'column',gap:'0.15rem',flexShrink:0}}>
                          {/* Toggle active */}
                          <button onClick={() => toggleStatus(w)}
                            title={isInactive ? 'Aktiviraj' : 'Deaktiviraj'}
                            style={{background:'none',border:'none',cursor:'pointer',fontSize:'0.75rem',padding:'0.1rem',lineHeight:1}}>
                            {isInactive ? '⛔' : '✅'}
                          </button>
                          {/* Move to another cat */}
                          <select
                            value={w.category}
                            onChange={e=>moveWorker(w.id, e.target.value)}
                            title="Premjesti u drugu kategoriju"
                            style={{fontSize:'0.6rem',border:'1px solid var(--border)',borderRadius:3,padding:'0.1rem',background:'var(--bg)',color:'var(--text-muted)',cursor:'pointer',maxWidth:70}}>
                            {WORKER_CATEGORIES.filter(c=>c.id!=='poslovoda').map(c=>(
                              <option key={c.id} value={c.id}>{c.short}</option>
                            ))}
                          </select>
                          {/* Delete */}
                          <button onClick={() => deleteWorker(w)}
                            title="Obriši"
                            style={{background:'none',border:'none',cursor:'pointer',fontSize:'0.7rem',padding:'0.1rem',color:'var(--red)',lineHeight:1}}>🗑</button>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Empty add row at bottom */}
            <tr>
              {CAT_COLS.map(cat => (
                <td key={cat.id} style={{border:`1px solid ${cat.border}`,background:cat.pale,padding:'0.3rem 0.5rem',opacity:0.6}}>
                  {adding !== cat.id && (
                    <button
                      onClick={() => { setAdding(cat.id); setAddName(''); }}
                      style={{background:'none',border:`1px dashed ${cat.border}`,borderRadius:4,color:cat.color,width:'100%',padding:'0.3rem',fontSize:'0.75rem',cursor:'pointer',textAlign:'left'}}>
                      + dodaj radnika
                    </button>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* MOBILE CARD LAYOUT for Spisak */}
      <div className="spisak-mobile">
        {CAT_COLS.map(cat => {
          const ws = workersByCat(cat.id);
          const active = ws.filter(w=>w.status==='aktivan').length;
          return (
            <div key={cat.id} style={{background:'var(--surface)',border:`1px solid ${cat.border}`,borderLeft:`4px solid ${cat.color}`,borderRadius:6,marginBottom:'0.5rem',overflow:'hidden'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.4rem',padding:'0.4rem 0.5rem',background:cat.pale}}>
                <span style={{fontSize:'0.9rem'}}>{cat.icon}</span>
                <span style={{fontWeight:700,fontSize:'0.8rem',color:cat.color,flex:1}}>{cat.label}</span>
                <span style={{fontFamily:'var(--mono)',fontSize:'0.65rem',fontWeight:700,color:'white',background:cat.color,borderRadius:3,padding:'0.1rem 0.3rem'}}>{active}</span>
                <button onClick={()=>{setAdding(cat.id);setAddName('');}}
                  style={{background:cat.color,color:'white',border:'none',borderRadius:4,width:22,height:22,fontSize:'0.85rem',cursor:'pointer',fontWeight:700}}>+</button>
              </div>
              {adding === cat.id && (
                <div style={{padding:'0.3rem 0.5rem',display:'flex',gap:'0.3rem',background:'#fafaf8',borderBottom:`1px solid ${cat.border}`}}>
                  <input autoFocus className="form-input" placeholder="Ime i prezime..."
                    value={addName} onChange={e=>setAddName(e.target.value)}
                    onKeyDown={e=>{if(e.key==='Enter')addWorker(cat.id);if(e.key==='Escape'){setAdding(null);setAddName('');}}}
                    style={{fontSize:'0.78rem',padding:'0.25rem 0.4rem',flex:1}} />
                  <button onClick={()=>addWorker(cat.id)} style={{background:cat.color,color:'white',border:'none',borderRadius:4,padding:'0.2rem 0.5rem',fontSize:'0.75rem',fontWeight:700}}>+</button>
                </div>
              )}
              <div>
                {ws.map((w,i) => {
                  const isInactive = w.status !== 'aktivan';
                  const isEditName = editing?.workerId===w.id && editing?.field==='name';
                  const isEditPhone = editing?.workerId===w.id && editing?.field==='phone';
                  return (
                    <div key={w.id} style={{padding:'0.3rem 0.5rem',borderBottom:`1px solid ${cat.border}`,opacity:isInactive?0.5:1,display:'flex',alignItems:'center',gap:'0.3rem'}}>
                      <span style={{fontFamily:'var(--mono)',fontSize:'0.6rem',color:'var(--text-light)',minWidth:16,textAlign:'right'}}>{i+1}</span>
                      <div style={{flex:1,minWidth:0}}>
                        {isEditName ? (
                          <input autoFocus className="form-input" value={editVal} onChange={e=>setEditVal(e.target.value)}
                            onBlur={commitEdit} onKeyDown={handleKeyDown} style={{fontSize:'0.8rem',padding:'0.15rem 0.3rem',width:'100%'}} />
                        ) : (
                          <span onClick={()=>startEdit(w,'name')} style={{fontSize:'0.82rem',fontWeight:600,cursor:'text',display:'block',textDecoration:isInactive?'line-through':'none'}}>{w.name}</span>
                        )}
                        {isEditPhone ? (
                          <input autoFocus className="form-input" value={editVal} onChange={e=>setEditVal(e.target.value)}
                            onBlur={commitEdit} onKeyDown={handleKeyDown} placeholder="Telefon..." style={{fontSize:'0.68rem',padding:'0.1rem 0.3rem',width:'100%',marginTop:'0.1rem'}} />
                        ) : (
                          <span onClick={()=>startEdit(w,'phone')} style={{fontSize:'0.68rem',color:'var(--text-muted)',cursor:'text',display:'block'}}>
                            {w.phone || <span style={{opacity:0.35,fontStyle:'italic'}}>+ telefon</span>}
                          </span>
                        )}
                      </div>
                      <button onClick={()=>toggleStatus(w)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'0.7rem',padding:'0.1rem'}}>{isInactive?'⛔':'✅'}</button>
                      <select value={w.category} onChange={e=>moveWorker(w.id,e.target.value)}
                        style={{fontSize:'0.55rem',border:'1px solid var(--border)',borderRadius:3,padding:'0.1rem',background:'var(--bg)',color:'var(--text-muted)',maxWidth:65}}>
                        {WORKER_CATEGORIES.filter(c=>c.id!=='poslovoda').map(c=>(<option key={c.id} value={c.id}>{c.short}</option>))}
                      </select>
                      <button onClick={()=>deleteWorker(w)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'0.65rem',color:'var(--red)',padding:'0.1rem'}}>🗑</button>
                    </div>
                  );
                })}
                {ws.length===0 && <div style={{padding:'0.5rem',fontSize:'0.75rem',color:'var(--text-light)',fontStyle:'italic',textAlign:'center'}}>Nema radnika</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── VOZAČI SEKCIJA ─────────────────────────────────────────────── */}
      {(() => {
        const vozacCat = WORKER_CATEGORIES.find(c => c.id === 'vozac');
        const allDrivers = workers.filter(w => w.category === 'vozac');
        const activeDrivers = allDrivers.filter(w => w.status === 'aktivan');
        const inactiveDrivers = allDrivers.filter(w => w.status !== 'aktivan');
        return (
          <div style={{marginTop:'1.5rem'}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.75rem',flexWrap:'wrap'}}>
              <span style={{fontSize:'1.2rem'}}>🚗</span>
              <div className="section-title" style={{margin:0}}>Vozači</div>
              <span style={{fontFamily:'var(--mono)',fontSize:'0.72rem',color:'var(--text-muted)'}}>
                {activeDrivers.length} aktivnih / {allDrivers.length} ukupno
              </span>
            </div>
            {allDrivers.length === 0 ? (
              <div style={{padding:'1.5rem',textAlign:'center',color:'var(--text-light)',fontSize:'0.85rem',background:'var(--surface)',borderRadius:8,border:'1px solid var(--border)'}}>
                Nema vozača. Dodajte vozače u kolonu "Vozači" iznad.
              </div>
            ) : (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',gap:'0.6rem'}}>
                {activeDrivers.concat(inactiveDrivers).map(w => {
                  const driverVehicles = (vehicles || []).filter(v => v.driverId === w.id);
                  const isInactive = w.status !== 'aktivan';
                  return (
                    <div key={w.id} style={{
                      background: isInactive ? '#fafafa' : 'var(--surface)',
                      border: `1px solid ${vozacCat.border}`,
                      borderLeft: `4px solid ${isInactive ? '#ccc' : vozacCat.color}`,
                      borderRadius: 8,
                      padding: '0.6rem 0.75rem',
                      opacity: isInactive ? 0.6 : 1,
                    }}>
                      <div style={{display:'flex',alignItems:'center',gap:'0.4rem',marginBottom:'0.3rem'}}>
                        <span style={{fontSize:'1rem'}}>{isInactive ? '⛔' : '🚗'}</span>
                        <span style={{fontWeight:700,fontSize:'0.9rem',flex:1,textDecoration:isInactive?'line-through':'none'}}>{w.name}</span>
                        {isInactive && <span style={{fontSize:'0.65rem',color:'var(--red)',fontWeight:600}}>Neaktivan</span>}
                      </div>
                      {w.phone && (
                        <div style={{fontSize:'0.72rem',color:'var(--text-muted)',marginBottom:'0.3rem'}}>
                          📞 {w.phone}
                        </div>
                      )}
                      {driverVehicles.length > 0 ? (
                        <div style={{marginTop:'0.2rem'}}>
                          {driverVehicles.map(v => (
                            <div key={v.id} style={{
                              display:'flex',alignItems:'center',gap:'0.4rem',
                              fontSize:'0.75rem',padding:'0.2rem 0.4rem',marginTop:'0.2rem',
                              background: v.status === 'vozno' ? '#e8f5e9' : '#fff3e0',
                              borderRadius: 4,
                              border: `1px solid ${v.status === 'vozno' ? '#a5d6a7' : '#ffcc80'}`,
                            }}>
                              <span>{v.status === 'vozno' ? '🟢' : '🟠'}</span>
                              <span style={{fontWeight:600}}>{v.registracija}</span>
                              <span style={{color:'var(--text-muted)'}}>· {v.tipVozila} · {v.brojMjesta} mj.</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{fontSize:'0.7rem',color:'var(--text-light)',fontStyle:'italic',marginTop:'0.2rem'}}>
                          Nema dodijeljenog vozila
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      <div style={{marginTop:'0.75rem',fontSize:'0.72rem',color:'var(--text-muted)'}}>
        💡 Klikni na ime ili telefon za direktno editovanje · Klikni ✅/⛔ za aktivaciju · Koristite dropdown za premještanje u drugu kategoriju
      </div>
    </div>
  );
}

