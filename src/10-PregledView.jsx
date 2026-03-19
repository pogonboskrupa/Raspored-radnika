// ─── PREGLED VIEW ─────────────────────────────────────────────────────────────
function PregledView({ schedules, workers, departments, wName, dName, filterWorker, setFilterWorker, filterDept, setFilterDept, filterJob, setFilterJob }) {
  const [tab, setTab] = useState('radnik');

  const filtered = useMemo(() => schedules.filter(s =>
    (!filterWorker || s.allWorkers.includes(filterWorker)) &&
    (!filterDept || s.deptId === filterDept) &&
    (!filterJob || s.jobType === filterJob)
  ).sort((a,b) => b.date.localeCompare(a.date)), [schedules, filterWorker, filterDept, filterJob]);

  // Worker stats
  const workerStats = useMemo(() => {
    if (!filterWorker) return null;
    const byJob = {};
    filtered.forEach(s => { byJob[s.jobType] = (byJob[s.jobType]||0)+1; });
    return byJob;
  }, [filtered, filterWorker]);

  return (
    <div>
      <div className="section-header"><div className="section-title">Pregled i filtriranje</div></div>

      <div className="card" style={{marginBottom:'1rem'}}>
        <div className="card-body">
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(min(200px,100%),1fr))',gap:'0.75rem'}}>
            <div className="form-group" style={{margin:0}}>
              <label className="form-label">Radnik</label>
              <select className="form-select" value={filterWorker} onChange={e=>setFilterWorker(e.target.value)}>
                <option value="">Svi radnici</option>
                {workers.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{margin:0}}>
              <label className="form-label">Odjel</label>
              <select className="form-select" value={filterDept} onChange={e=>setFilterDept(e.target.value)}>
                <option value="">Svi odjeli</option>
                {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{margin:0}}>
              <label className="form-label">Vrsta posla</label>
              <select className="form-select" value={filterJob} onChange={e=>setFilterJob(e.target.value)}>
                <option value="">Sve vrste</option>
                {JOB_TYPES.map(jt=><option key={jt}>{jt}</option>)}
              </select>
            </div>
            <div style={{display:'flex',alignItems:'flex-end'}}>
              <button className="btn btn-secondary btn-sm" onClick={() => { setFilterWorker(''); setFilterDept(''); setFilterJob(''); }}>
                ✕ Resetuj
              </button>
            </div>
          </div>
        </div>
      </div>

      {filterWorker && workerStats && (
        <div className="stats-row" style={{marginBottom:'1rem'}}>
          <div className="stat-card"><div className="stat-value">{filtered.length}</div><div className="stat-label">Ukupno smjena</div></div>
          {Object.entries(workerStats).map(([jt,cnt]) => (
            <div className="stat-card" key={jt}><div className="stat-value" style={{fontSize:'1.2rem'}}>{cnt}</div><div className="stat-label">{jt}</div></div>
          ))}
        </div>
      )}

      <div style={{fontSize:'0.8rem',color:'var(--text-muted)',marginBottom:'0.5rem'}}>{filtered.length} zapisa</div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state"><span className="icon">🔍</span><p>Nema rezultata za odabrane filtere.</p></div>
        ) : (
          <table className="schedule-table">
            <thead><tr><th>Datum</th><th>Odjel</th><th>Vrsta posla</th><th>Radnici</th><th>Napomena</th></tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td style={{fontFamily:'var(--mono)',fontSize:'0.8rem',whiteSpace:'nowrap'}}>{fmtDate(s.date)}</td>
                  <td style={{fontSize:'0.83rem',fontWeight:500}}>{dName(s.deptId)}</td>
                  <td><span className={jobBadgeClass(s.jobType)}>{s.jobType}</span></td>
                  <td>
                    <div style={{display:'flex',flexWrap:'wrap',gap:'2px'}}>
                      {s.allWorkers.map(wId => (
                        <span key={wId} className={`worker-pill ${s.jobType==='Primka'&&wId===s.primatWorker?'primac':''}`}>
                          {wName(wId)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{color:'var(--text-muted)',fontSize:'0.8rem'}}>{s.note||'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

