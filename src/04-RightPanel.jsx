// ─── RIGHT PANEL ──────────────────────────────────────────────────────────────
function RightPanel({ selectedDate, daySchedules, schedules, workers, departments, wName, dName,
  statsByJob, statsByDept, godisnji, onAdd, onAddWithJob, copyFromDate, yesterday, onWorkerClick }) {

  const [copyDate, setCopyDate] = useState('');
  const assignedWorkers = new Set(daySchedules.flatMap(s => s.allWorkers));
  const absentMap = {};
  Object.entries(godisnji || {}).forEach(([wId, entries]) => {
    const entry = entries.find(e => e.date === selectedDate);
    if (entry) absentMap[wId] = entry;
  });
  const activeWorkers = workers.filter(w => w.status === 'aktivan');
  const unassigned = activeWorkers.filter(w => !assignedWorkers.has(w.id) && !absentMap[w.id]);

  const ODSUTNOST_STYLE = {
    'Godišnji odmor': { short:'GO', icon:'🏖️', bg:'#e4edf5', color:'#1a3d5c', border:'#9bbfd9' },
    'Bolovanje':      { short:'B',  icon:'🏥', bg:'#fde8e8', color:'#8b2020', border:'#e0a0a0' },
    'Slobodan dan':   { short:'SD', icon:'☀️', bg:'#fdf0e0', color:'#b5620a', border:'#e8c17a' },
    'Neplaćeno':      { short:'N',  icon:'📋', bg:'#f0f0f0', color:'#555',    border:'#ccc' },
  };

  // Absent workers grouped by leave type (only Bolovanje, Godišnji odmor, Neplaćeno)
  const SHOWN_LEAVE_TYPES = ['Bolovanje', 'Godišnji odmor', 'Neplaćeno'];
  const absentByType = {};
  Object.entries(absentMap).forEach(([wId, entry]) => {
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
    workers: unassigned.filter(w => w.category === cat.id),
  })).filter(g => g.workers.length > 0);

  return (
    <aside className="right-panel">
      <div style={{marginBottom:'1rem'}}>
        <div style={{fontFamily:'var(--mono)',fontSize:'0.65rem',letterSpacing:'0.1em',color:'var(--text-light)',textTransform:'uppercase',marginBottom:'0.5rem'}}>Brzi unos</div>
        <button className="btn btn-primary" style={{width:'100%',marginBottom:'0.5rem'}} onClick={onAdd}>+ Novi unos</button>
        <button className="btn btn-secondary" style={{width:'100%',marginBottom:'0.5rem'}} onClick={() => copyFromDate(yesterday)}>
          📋 Kopiraj jučer
        </button>
        <div style={{display:'flex',gap:'0.5rem'}}>
          <input type="date" className="form-input" value={copyDate} onChange={e => setCopyDate(e.target.value)} style={{flex:1,fontSize:'0.78rem'}} />
          <button className="btn btn-secondary btn-sm" disabled={!copyDate} onClick={() => { copyFromDate(copyDate); setCopyDate(''); }}>Kopiraj</button>
        </div>
      </div>
      <div className="divider"/>

      {/* Quick job type buttons */}
      <div style={{marginBottom:'1rem'}}>
        <div style={{fontFamily:'var(--mono)',fontSize:'0.65rem',letterSpacing:'0.1em',color:'var(--text-light)',textTransform:'uppercase',marginBottom:'0.5rem'}}>Vrsta posla — klikni</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:'0.3rem'}}>
          {JOB_TYPES.map(jt => (
            <button key={jt} className={jobBadgeClass(jt)} onClick={() => onAddWithJob(jt)}
              style={{cursor:'pointer',fontSize:'0.65rem',padding:'0.25rem 0.5rem',borderRadius:4,border:'1px solid var(--border)',transition:'all 0.1s'}}>
              + {jt}
            </button>
          ))}
        </div>
      </div>
      <div className="divider"/>

      {/* By dept */}
      <div style={{marginBottom:'1rem'}}>
        <div style={{fontFamily:'var(--mono)',fontSize:'0.65rem',letterSpacing:'0.1em',color:'var(--text-light)',textTransform:'uppercase',marginBottom:'0.6rem'}}>Po odjelu</div>
        {Object.keys(statsByDept).length === 0 && <div style={{fontSize:'0.8rem',color:'var(--text-light)'}}>Nema podataka</div>}
        {Object.entries(statsByDept).map(([dId, ws]) => (
          <div key={dId} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.35rem 0',borderBottom:'1px solid var(--border)',fontSize:'0.82rem'}}>
            <span style={{color:'var(--text-muted)'}}>{dName(dId)}</span>
            <span style={{fontFamily:'var(--mono)',fontWeight:600,color:'var(--green)'}}>{ws.size}</span>
          </div>
        ))}
      </div>
      <div className="divider"/>

      {/* Unassigned — clickable */}
      <div>
        <div style={{fontFamily:'var(--mono)',fontSize:'0.65rem',letterSpacing:'0.1em',color:'var(--text-light)',textTransform:'uppercase',marginBottom:'0.6rem'}}>
          Neraspoređeni ({unassigned.length}) <span style={{opacity:0.6,fontWeight:400,fontSize:'0.55rem'}}>↙ klikni</span>
        </div>
        {unassigned.length === 0 ? (
          <div style={{fontSize:'0.8rem',color:'var(--green)',fontWeight:500}}>✓ Svi raspoređeni</div>
        ) : (
          unassignedByCat.map(({ cat, workers: ws }) => (
            <div key={cat.id} style={{marginBottom:'0.5rem'}}>
              <div style={{fontSize:'0.62rem',fontWeight:700,color:cat.color,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.2rem',display:'flex',alignItems:'center',gap:'0.25rem'}}>
                <span>{cat.icon}</span>{cat.short}
              </div>
              {ws.map(w => (
                <div key={w.id}
                  onClick={() => onWorkerClick(w)}
                  style={{
                    display:'flex',alignItems:'center',gap:'0.4rem',
                    padding:'0.3rem 0.5rem',marginBottom:'0.15rem',
                    fontSize:'0.8rem',fontWeight:500,
                    background: cat.pale,
                    border:`1px solid ${cat.border}`,
                    borderLeft:`3px solid ${cat.color}`,
                    borderRadius:4,
                    cursor:'pointer',
                    transition:'all 0.1s',
                    color: cat.color,
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background=cat.border}
                  onMouseLeave={e=>e.currentTarget.style.background=cat.pale}
                >
                  <span style={{fontSize:'0.85rem'}}>{cat.icon}</span>
                  <span style={{flex:1}}>{w.name}</span>
                  <span style={{fontSize:'0.6rem',opacity:0.6}}>→</span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Absent workers — separate section below */}
      {hasAbsent && (<>
        <div className="divider"/>
        <div>
          <div style={{fontFamily:'var(--mono)',fontSize:'0.65rem',letterSpacing:'0.1em',color:'var(--text-light)',textTransform:'uppercase',marginBottom:'0.6rem'}}>
            Odsutni ({Object.values(absentByType).reduce((s, arr) => s + arr.length, 0)})
          </div>
          {SHOWN_LEAVE_TYPES.filter(t => absentByType[t]).map(type => {
            const s = ODSUTNOST_STYLE[type];
            return (
              <div key={type} style={{marginBottom:'0.5rem'}}>
                <div style={{fontSize:'0.62rem',fontWeight:700,color:s.color,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.2rem',display:'flex',alignItems:'center',gap:'0.25rem'}}>
                  <span>{s.icon}</span>{type}
                </div>
                {absentByType[type].map(w => (
                  <div key={w.id} style={{
                    display:'flex',alignItems:'center',gap:'0.4rem',
                    padding:'0.3rem 0.5rem',marginBottom:'0.15rem',
                    fontSize:'0.8rem',fontWeight:500,
                    background:s.bg, border:`1px solid ${s.border}`,
                    borderLeft:`3px solid ${s.color}`,
                    borderRadius:4, color:s.color, opacity:0.7,
                  }}>
                    <span style={{fontSize:'0.85rem'}}>{s.icon}</span>
                    <span style={{flex:1}}>{w.name}</span>
                    <span style={{fontSize:'0.6rem',fontWeight:700,fontFamily:'var(--mono)'}}>{s.short}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </>)}
    </aside>
  );
}


