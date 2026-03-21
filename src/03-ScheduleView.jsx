// ─── SCHEDULE VIEW ────────────────────────────────────────────────────────────
function ScheduleView({ selectedDate, setSelectedDate, daySchedules, schedules, workers, departments, vehicles,
  wName, dName, totalToday, statsByJob, statsByDept,
  sidebarFilter, setSidebarFilter, godisnji,
  prevDay, nextDay, onAdd, onAddWithJob, onEdit, onDelete, onHistory, onAssignVehicle, copyFromDate, handlePrint, yesterday, holidays, onWorkerClick, allJobTypes, customJobTypes, setCustomJobTypes }) {

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const currentHoliday = holidays?.[selectedDate] || null;
  const isSaturday = new Date(selectedDate+'T00:00:00').getDay() === 6;
  const hasSaturdayEntries = isSaturday && daySchedules.length > 0;
  const [saturdayWorkMode, setSaturdayWorkMode] = useState(false);
  useEffect(() => { setSaturdayWorkMode(false); }, [selectedDate]);
  const [newJobName, setNewJobName] = useState('');
  const [showAddJob, setShowAddJob] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileUnassignedOpen, setMobileUnassignedOpen] = useState(false);
  const [vehiclePopup, setVehiclePopup] = useState(null); // { rowId, vehicleIds, otherDriverId, rect }
  const OTHER_DRIVER_CATS = ['poslovoda_isk', 'poslovoda_uzg', 'primac_panj', 'otpremac'];
  const otherPotentialDrivers = useMemo(() => workers.filter(w => OTHER_DRIVER_CATS.includes(w.category) && w.status === 'aktivan'), [workers]);
  const vehiclePopupRef = useRef(null);

  // Close popup on outside click
  useEffect(() => {
    if (!vehiclePopup) return;
    const handler = (e) => {
      if (vehiclePopupRef.current && !vehiclePopupRef.current.contains(e.target)) setVehiclePopup(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [vehiclePopup]);

  // Helper: get vehicleIds array from schedule (backward compat with single vehicleId)
  const getVehicleIds = (row) => {
    if (row.vehicleIds && row.vehicleIds.length > 0) return row.vehicleIds;
    if (row.vehicleId) return [row.vehicleId];
    return [];
  };

  // Available vehicles: only 'vozno' status
  const availableVehicles = useMemo(() => (vehicles || []).filter(v => v.status === 'vozno'), [vehicles]);

  // Vozači (drivers) from workers
  const drivers = useMemo(() => workers.filter(w => w.category === 'vozac' && w.status === 'aktivan'), [workers]);

  // Vehicle usage across today's schedules: vehicleId -> total workers assigned
  const vehicleUsageMap = useMemo(() => {
    const m = {};
    daySchedules.forEach(s => {
      const vIds = s.vehicleIds?.length ? s.vehicleIds : (s.vehicleId ? [s.vehicleId] : []);
      vIds.forEach(vid => {
        if (!m[vid]) m[vid] = { total: 0, rows: [] };
        m[vid].total += (s.allWorkers || []).length;
        m[vid].rows.push(s.id);
      });
    });
    return m;
  }, [daySchedules]);

  const openVehiclePopup = (row, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setVehiclePopup(vehiclePopup?.rowId === row.id ? null : { rowId: row.id, vehicleIds: getVehicleIds(row), otherDriverId: row.otherDriverId || '', rect });
  };
  // Group by dept — exclude Otprema
  const byDept = useMemo(() => {
    const m = {};
    daySchedules.filter(s => s.jobType !== 'Otprema').forEach(s => {
      if (!m[s.deptId]) m[s.deptId] = [];
      m[s.deptId].push(s);
    });
    return m;
  }, [daySchedules]);

  // Otprema entries grouped by dept
  const otpremaRows = useMemo(() => daySchedules.filter(s => s.jobType === 'Otprema'), [daySchedules]);
  const otpremaByDept = useMemo(() => {
    const m = {};
    otpremaRows.forEach(s => {
      if (!m[s.deptId]) m[s.deptId] = [];
      m[s.deptId].push(s);
    });
    return m;
  }, [otpremaRows]);

  return (
    <div style={{maxWidth:'100%',overflowX:'hidden'}}>
      {/* DATE BAR */}
      <div className="date-bar">
        <div>
          <div className="date-label">DATUM</div>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginTop:'0.25rem'}}>
            <button className="date-nav-btn" onClick={prevDay}>‹</button>
            <input type="date" className="date-input" value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)} />
            <button className="date-nav-btn" onClick={nextDay}>›</button>
            {isToday && <span className="today-chip">DANAS</span>}
          </div>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:'0.5rem',flexWrap:'wrap',alignItems:'center'}}>
          {!currentHoliday && (!isSaturday || saturdayWorkMode || hasSaturdayEntries) && <>
            <button className="btn btn-secondary btn-sm no-print" onClick={() => copyFromDate(yesterday)}>
              📋 Kopiraj jučer
            </button>
            <button className="btn btn-secondary btn-sm no-print" onClick={handlePrint}>
              🖨️ Print
            </button>
            <button className="btn btn-primary btn-sm no-print" onClick={onAdd}>
              + Novi unos
            </button>
          </>}
        </div>
      </div>

      {/* HOLIDAY NOTICE */}
      {currentHoliday && (
        <div style={{textAlign:'center',padding:'3rem 1rem'}}>
          <div style={{fontSize:'3rem',marginBottom:'0.75rem'}}>🎉</div>
          <div style={{fontSize:'1.1rem',fontWeight:700,color:'#e65100',marginBottom:'0.5rem'}}>PRAZNIK</div>
          <div style={{fontSize:'1rem',fontWeight:600,color:'#bf360c',marginBottom:'0.5rem'}}>{currentHoliday}</div>
          <div style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>{selectedDate}</div>
          <div style={{color:'var(--text-muted)',fontSize:'0.82rem',marginTop:'0.75rem',fontStyle:'italic'}}>
            Na praznik nije moguće rasporediti radnike.
          </div>
        </div>
      )}

      {/* SATURDAY NOTICE */}
      {isSaturday && !saturdayWorkMode && !hasSaturdayEntries && (
        <div style={{textAlign:'center',padding:'3rem 1rem'}}>
          <div style={{fontSize:'3rem',marginBottom:'0.75rem'}}>📅</div>
          <div style={{fontSize:'1.1rem',fontWeight:700,color:'var(--text)',marginBottom:'0.5rem'}}>Subota, {selectedDate}</div>
          <div style={{color:'var(--text-muted)',marginBottom:'1.5rem',fontSize:'0.9rem'}}>Subota je neradni dan.</div>
          <button className="btn btn-primary no-print" onClick={()=>setSaturdayWorkMode(true)}
            style={{fontSize:'0.9rem',padding:'0.5rem 1.2rem'}}>
            🛠️ Dodaj kao radni dan
          </button>
        </div>
      )}

      {!currentHoliday && (!isSaturday || saturdayWorkMode || hasSaturdayEntries) && <>
      {/* STATS + VRSTA POSLA */}
      <div style={{marginBottom:'0.5rem'}}>
        <div style={{fontSize:'0.65rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--text-light)',marginBottom:'0.35rem'}}>
          Vrsta posla — klikni za unos
        </div>
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-value">{totalToday}</div>
            <div className="stat-label">Ukupno radnika</div>
          </div>
          {Object.entries(statsByJob).map(([jt, ws]) => (
            <div className="stat-card" key={jt} style={{cursor:'pointer'}} onClick={() => onAddWithJob(jt)} title={`+ Dodaj ${jt}`}>
              <div className="stat-value" style={{fontSize:'1.2rem'}}>{ws.size}</div>
              <div className="stat-label">{jt}</div>
            </div>
          ))}
          {allJobTypes.filter(jt => !statsByJob[jt]).map(jt => (
            <div className="stat-card" key={jt} style={{cursor:'pointer',opacity:0.5}} onClick={() => onAddWithJob(jt)} title={`+ Dodaj ${jt}`}>
              <div className="stat-value" style={{fontSize:'1.2rem'}}>0</div>
              <div className="stat-label">{jt}</div>
            </div>
          ))}
          {/* + Dodaj posao */}
          {!showAddJob ? (
            <div className="stat-card" style={{cursor:'pointer',opacity:0.4,border:'2px dashed var(--border)'}} onClick={() => setShowAddJob(true)} title="Dodaj novu vrstu posla">
              <div className="stat-value" style={{fontSize:'1.2rem'}}>+</div>
              <div className="stat-label">Novi posao</div>
            </div>
          ) : (
            <div className="stat-card" style={{padding:'0.3rem',minWidth:120}}>
              <input className="form-input" placeholder="Naziv posla..." value={newJobName}
                onChange={e => setNewJobName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newJobName.trim()) {
                    const name = newJobName.trim();
                    if (!allJobTypes.includes(name)) { setCustomJobTypes(prev => [...prev, name]); }
                    setNewJobName(''); setShowAddJob(false);
                  }
                  if (e.key === 'Escape') { setNewJobName(''); setShowAddJob(false); }
                }}
                autoFocus style={{fontSize:'0.72rem',padding:'0.25rem 0.4rem',marginBottom:'0.2rem'}} />
              <div style={{display:'flex',gap:'0.2rem'}}>
                <button className="btn btn-primary btn-sm" style={{fontSize:'0.6rem',padding:'0.15rem 0.3rem',flex:1}} onClick={() => {
                  const name = newJobName.trim();
                  if (name && !allJobTypes.includes(name)) { setCustomJobTypes(prev => [...prev, name]); }
                  setNewJobName(''); setShowAddJob(false);
                }}>Dodaj</button>
                <button className="btn btn-secondary btn-sm" style={{fontSize:'0.6rem',padding:'0.15rem 0.3rem'}} onClick={() => { setNewJobName(''); setShowAddJob(false); }}>✕</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION TITLE */}
      <div className="section-header">
        <div className="section-title">Raspored za {fmtDate(selectedDate)}</div>
        <span className="tag">{daySchedules.length} {daySchedules.length===1?'stavka':'stavki'}</span>
      </div>

      {daySchedules.length === 0 ? (
        <div className="empty-state">
          <span className="icon">📋</span>
          <p>Nema unesenog rasporeda za ovaj dan.</p>
          <button className="btn btn-primary" onClick={onAdd}>+ Dodaj prvi unos</button>
        </div>
      ) : (
        Object.entries(byDept).map(([deptId, rows]) => (
          <div className="card" key={deptId}>
            <div className="dept-header">
              <span>🏕️</span>
              <span className="dept-name">{dName(deptId)}</span>
              <span className="dept-count">{new Set(rows.flatMap(r => r.allWorkers)).size} radnika</span>
            </div>
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Vrsta posla</th>
                  <th>Radnici</th>
                  <th>Vozilo</th>
                  <th>Napomena</th>
                  <th className="no-print" style={{width:'90px'}}>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id}>
                    <td data-label="Posao"><span className={jobBadgeClass(row.jobType)}>{row.jobType}</span></td>
                    <td data-label="Radnici">
                      <div style={{display:'flex',flexWrap:'wrap',gap:'2px'}}>
                        {row.jobType === 'Primka' ? (
                          <>
                            {row.primatWorker && <span className="worker-pill primac"><span className="role-dot"/>P: {wName(row.primatWorker)}</span>}
                            {row.helper1Worker && <span className="worker-pill"><span className="role-dot"/>{wName(row.helper1Worker)}</span>}
                            {row.helper2Worker && <span className="worker-pill"><span className="role-dot"/>{wName(row.helper2Worker)}</span>}
                            {(row.extraWorkers||[]).map(w => <span key={w} className="worker-pill"><span className="role-dot"/>{wName(w)}</span>)}
                          </>
                        ) : (
                          row.allWorkers.map(w => <span key={w} className="worker-pill"><span className="role-dot"/>{wName(w)}</span>)
                        )}
                      </div>
                    </td>
                    <td data-label="Vozilo" style={{fontSize:'0.8rem'}}>
                      <div style={{cursor:'pointer'}} onClick={(e) => openVehiclePopup(row, e)} className="no-print">
                        {(() => {
                          const vIds = getVehicleIds(row);
                          if (vIds.length === 0) return <span style={{color:'var(--green)',fontWeight:600,fontSize:'0.75rem'}}>+ Dodijeli vozilo</span>;
                          const rowWorkerCount = (row.allWorkers || []).length;
                          const totalCap = vIds.reduce((s, vid) => {
                            const v = vehicles?.find(v => v.id === vid);
                            return s + (v?.brojMjesta || 0);
                          }, 0);
                          const bezMjesta = Math.max(0, rowWorkerCount - totalCap);
                          let remaining = rowWorkerCount;
                          return (
                            <div style={{display:'flex',flexDirection:'column',gap:'3px'}}>
                              {vIds.map(vid => {
                                const v = vehicles?.find(v => v.id === vid);
                                if (!v) return null;
                                const driver = workers.find(w => w.id === v.driverId);
                                const cap = v.brojMjesta || 0;
                                const fill = Math.min(remaining, cap);
                                remaining = Math.max(0, remaining - cap);
                                return (
                                  <div key={vid} style={{display:'flex',flexDirection:'column',gap:'1px',paddingBottom:'2px',borderBottom: vIds.length > 1 ? '1px dotted var(--border)' : 'none'}}>
                                    <span style={{fontWeight:600}}>🚗 {v.registracija}</span>
                                    <span style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>{v.tipVozila} · {v.brojMjesta} mj.</span>
                                    {row.otherDriverId ? (() => {
                                      const od = workers.find(w => w.id === row.otherDriverId);
                                      return od ? (
                                        <span style={{fontSize:'0.7rem',color:'#b5620a',fontWeight:600}}>🔄 {od.name} <span style={{fontWeight:400,fontSize:'0.62rem'}}>(danas)</span></span>
                                      ) : (driver && <span style={{fontSize:'0.7rem',color:'#2a6478'}}>🧑‍✈️ {driver.name}</span>);
                                    })() : (driver && <span style={{fontSize:'0.7rem',color:'#2a6478'}}>🧑‍✈️ {driver.name}</span>)}
                                    <span style={{fontSize:'0.65rem',fontWeight:700,marginTop:'1px',color: fill >= cap ? '#b5620a' : '#2d5a27',background: fill >= cap ? '#fdf0e0' : '#e8f5e9',border: `1px solid ${fill >= cap ? '#e8c17a' : '#a5d6a7'}`,borderRadius:3,padding:'0.1rem 0.3rem',display:'inline-block'}}>
                                      👥 {fill}/{cap}
                                    </span>
                                  </div>
                                );
                              })}
                              {bezMjesta > 0 && (
                                <div style={{fontSize:'0.65rem',fontWeight:700,color:'#c53030',background:'#fde8e8',border:'1px solid #f5b5b5',borderRadius:3,padding:'0.15rem 0.3rem',marginTop:'2px'}}>
                                  ⚠️ {bezMjesta} radnika nema mjesta!
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </td>
                    <td data-label="Napomena" style={{color:'var(--text-muted)',fontSize:'0.8rem'}}>{row.note || '—'}</td>
                    <td data-label="" className="no-print">
                      <div style={{display:'flex',gap:'0.25rem'}}>
                        <button className="btn btn-ghost btn-icon btn-sm" title="Historija" onClick={() => onHistory(row)}>📜</button>
                        <button className="btn btn-ghost btn-icon btn-sm" title="Uredi" onClick={() => onEdit(row)}>✏️</button>
                        <button className="btn btn-danger btn-icon btn-sm" title="Briši" onClick={() => onDelete(row.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}

      {/* ─── OTPREMA SEKCIJA ─── */}
      {otpremaRows.length > 0 && (
        <div className="card" style={{marginTop:'0.75rem',borderLeft:'4px solid #6b3080'}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.6rem 0.75rem',background:'#f0e8f5',borderBottom:'1px solid #c4a0d8'}}>
            <span style={{fontSize:'1.1rem'}}>🚛</span>
            <span style={{fontWeight:700,fontSize:'0.95rem',color:'#6b3080',flex:1}}>Otprema</span>
            <span style={{fontFamily:'var(--mono)',fontSize:'0.72rem',fontWeight:700,color:'white',background:'#6b3080',borderRadius:4,padding:'0.15rem 0.5rem'}}>
              {new Set(otpremaRows.flatMap(r => r.allWorkers)).size} radnika
            </span>
            <span style={{fontFamily:'var(--mono)',fontSize:'0.68rem',color:'#6b3080'}}>
              {Object.keys(otpremaByDept).length} {Object.keys(otpremaByDept).length === 1 ? 'odjel' : 'odjela'}
            </span>
          </div>
          <div style={{padding:'0.5rem 0.75rem'}}>
            {Object.entries(otpremaByDept).map(([deptId, rows]) => {
              const allW = [...new Set(rows.flatMap(r => r.allWorkers))];
              return (
                <div key={deptId} style={{marginBottom:'0.6rem',padding:'0.5rem 0.6rem',background:'var(--bg)',borderRadius:6,border:'1px solid var(--border)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.4rem',marginBottom:'0.35rem'}}>
                    <span style={{fontSize:'0.8rem'}}>🏕️</span>
                    <span style={{fontWeight:700,fontSize:'0.82rem',color:'var(--text)',flex:1}}>{dName(deptId)}</span>
                    <span style={{fontFamily:'var(--mono)',fontSize:'0.68rem',fontWeight:600,color:'#6b3080',background:'#f0e8f5',borderRadius:3,padding:'0.1rem 0.35rem',border:'1px solid #c4a0d8'}}>
                      {allW.length} rad.
                    </span>
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'0.25rem'}}>
                    {allW.map(wId => (
                      <span key={wId} className="worker-pill"><span className="role-dot"/>{wName(wId)}</span>
                    ))}
                  </div>
                  {/* Vozila za ove otpreme */}
                  {rows.map(row => {
                    const vIds = getVehicleIds(row);
                    return (
                      <div key={row.id} style={{marginTop:'0.3rem'}}>
                        <div className="no-print" style={{cursor:'pointer'}} onClick={(e) => openVehiclePopup(row, e)}>
                          {vIds.length === 0 ? (
                            <span style={{color:'var(--green)',fontWeight:600,fontSize:'0.75rem'}}>+ Dodijeli vozilo</span>
                          ) : (() => {
                            const rowWC = (row.allWorkers || []).length;
                            const totalC = vIds.reduce((s, vid) => { const v = vehicles?.find(x => x.id === vid); return s + (v?.brojMjesta || 0); }, 0);
                            const bezMj = Math.max(0, rowWC - totalC);
                            let rem = rowWC;
                            return (
                              <div style={{display:'flex',flexDirection:'column',gap:'0.2rem'}}>
                                <div style={{display:'flex',flexWrap:'wrap',gap:'0.3rem'}}>
                                  {vIds.map(vid => {
                                    const v = vehicles?.find(x => x.id === vid);
                                    if (!v) return null;
                                    const driver = workers.find(w => w.id === v.driverId);
                                    const cap = v.brojMjesta || 0;
                                    const fill = Math.min(rem, cap);
                                    rem = Math.max(0, rem - cap);
                                    return (
                                      <span key={vid} style={{display:'inline-flex',alignItems:'center',gap:'0.3rem',fontSize:'0.75rem',color:'var(--text-muted)'}}>
                                        <span>🚗</span>
                                        <span style={{fontWeight:600}}>{v.registracija}</span>
                                        <span>{v.tipVozila}</span>
                                        {row.otherDriverId ? (() => {
                                          const od = workers.find(w => w.id === row.otherDriverId);
                                          return od ? <span style={{color:'#b5620a',fontWeight:600}}>(🔄 {od.name})</span> : (driver && <span style={{color:'#2a6478'}}>({driver.name})</span>);
                                        })() : (driver && <span style={{color:'#2a6478'}}>({driver.name})</span>)}
                                        <span style={{fontWeight:700,fontSize:'0.65rem',color: fill >= cap ? '#b5620a' : '#2d5a27',background: fill >= cap ? '#fdf0e0' : '#e8f5e9',border: `1px solid ${fill >= cap ? '#e8c17a' : '#a5d6a7'}`,borderRadius:3,padding:'0.1rem 0.3rem'}}>
                                          👥 {fill}/{cap}
                                        </span>
                                      </span>
                                    );
                                  })}
                                </div>
                                {bezMj > 0 && (
                                  <span style={{fontSize:'0.65rem',fontWeight:700,color:'#c53030'}}>⚠️ {bezMj} radnika nema mjesta!</span>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}
                  {/* Napomena i akcije */}
                  {rows.map(row => (
                    <div key={row.id+'-act'} style={{display:'flex',alignItems:'center',gap:'0.4rem',marginTop:'0.25rem'}}>
                      {row.note && <span style={{fontSize:'0.72rem',color:'var(--text-muted)',fontStyle:'italic',flex:1}}>📝 {row.note}</span>}
                      <div className="no-print" style={{display:'flex',gap:'0.2rem',marginLeft:'auto'}}>
                        <button className="btn btn-ghost btn-icon btn-sm" title="Historija" onClick={() => onHistory(row)}>📜</button>
                        <button className="btn btn-ghost btn-icon btn-sm" title="Uredi" onClick={() => onEdit(row)}>✏️</button>
                        <button className="btn btn-danger btn-icon btn-sm" title="Briši" onClick={() => onDelete(row.id)}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MOBILE: Quick job type buttons (visible only on small screens via CSS) */}
      <div className="mobile-sidebar-panel" style={{marginTop:'0.75rem'}}>
        <div style={{padding:'0.6rem 0.75rem',background:'#fafaf8',borderBottom:'1px solid var(--border)'}}>
          <span style={{fontFamily:'var(--mono)',fontSize:'0.7rem',fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--text-muted)'}}>
            Vrsta posla — klikni za unos
          </span>
        </div>
        <div style={{padding:'0.5rem 0.75rem',display:'flex',flexWrap:'wrap',gap:'0.3rem'}}>
          {allJobTypes.map(jt => (
            <button key={jt} className={jobBadgeClass(jt)} onClick={() => onAddWithJob(jt)}
              style={{cursor:'pointer',fontSize:'0.68rem',padding:'0.3rem 0.5rem',borderRadius:4,border:'1px solid var(--border)'}}>
              + {jt}
            </button>
          ))}
        </div>
      </div>

      {/* MOBILE: Department filter (visible only on small screens via CSS) */}
      <div className="mobile-sidebar-panel" style={{marginTop:'0.75rem'}}>
        <div
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          style={{padding:'0.6rem 0.75rem',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',background:'#fafaf8',borderBottom: mobileFilterOpen ? '1px solid var(--border)' : 'none'}}
        >
          <span style={{fontFamily:'var(--mono)',fontSize:'0.7rem',fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--text-muted)'}}>
            🏕️ Filter po odjelu {sidebarFilter ? `(${departments.find(d=>d.id===sidebarFilter)?.brojOdjela || '?'})` : '(svi)'}
          </span>
          <span style={{fontSize:'0.7rem',color:'var(--text-light)'}}>{mobileFilterOpen ? '▲' : '▼'}</span>
        </div>
        {mobileFilterOpen && (
          <div style={{padding:'0.25rem 0'}}>
            <button className={`sidebar-item ${!sidebarFilter?'active':''}`} onClick={() => { setSidebarFilter(null); setMobileFilterOpen(false); }}>
              <span>Svi odjeli</span>
              <span className="count">{Object.values(statsByDept).reduce((a,s)=>a+s.size,0)}</span>
            </button>
            {departments.map(d => (
              <button key={d.id} className={`sidebar-item ${sidebarFilter===d.id?'active':''}`} onClick={() => { setSidebarFilter(d.id); setMobileFilterOpen(false); }}>
                <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{dName(d.id)}</span>
                <span className="count">{statsByDept[d.id]?.size || 0}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* MOBILE: Unassigned & absent workers (visible only on small screens via CSS) */}
      {(() => {
        const assignedWorkers = new Set(daySchedules.flatMap(s => s.allWorkers));
        const absentWorkerIds = new Set(
          Object.entries(godisnji || {}).filter(([wId, entries]) =>
            entries.some(e => e.date === selectedDate)
          ).map(([wId]) => wId)
        );
        const activeWorkers = workers.filter(w => w.status === 'aktivan');
        const unassigned = activeWorkers.filter(w => !assignedWorkers.has(w.id) && !absentWorkerIds.has(w.id));
        const absentList = [...absentWorkerIds].map(wId => {
          const w = workers.find(x => x.id === wId);
          const entry = ((godisnji || {})[wId] || []).find(e => e.date === selectedDate);
          return w && entry ? { worker: w, entry } : null;
        }).filter(Boolean);
        const ODSUTNOST_SHORT = {
          'Godišnji odmor': { short:'GO', icon:'🏖️', bg:'#e4edf5', color:'#1a3d5c', border:'#9bbfd9' },
          'Bolovanje':      { short:'B',  icon:'🏥', bg:'#fde8e8', color:'#8b2020', border:'#e0a0a0' },
          'Slobodan dan':   { short:'SD', icon:'☀️', bg:'#fdf0e0', color:'#b5620a', border:'#e8c17a' },
          'Neplaćeno':      { short:'N',  icon:'📋', bg:'#f0f0f0', color:'#555',    border:'#ccc' },
        };
        const unassignedByCat = WORKER_CATEGORIES.filter(c => c.id !== 'poslovoda').map(cat => ({
          cat, workers: unassigned.filter(w => w.category === cat.id),
        })).filter(g => g.workers.length > 0);

        return (
          <div className="mobile-sidebar-panel" style={{marginTop:'0.75rem'}}>
            <div
              onClick={() => setMobileUnassignedOpen(!mobileUnassignedOpen)}
              style={{padding:'0.6rem 0.75rem',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',background:'#fafaf8',borderBottom: mobileUnassignedOpen ? '1px solid var(--border)' : 'none'}}
            >
              <span style={{fontFamily:'var(--mono)',fontSize:'0.7rem',fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--text-muted)'}}>
                👷 Neraspoređeni ({unassigned.length}) {absentList.length > 0 && `· Odsutni (${absentList.length})`}
              </span>
              <span style={{fontSize:'0.7rem',color:'var(--text-light)'}}>{mobileUnassignedOpen ? '▲' : '▼'}</span>
            </div>
            {mobileUnassignedOpen && (
              <div style={{padding:'0.5rem 0.75rem'}}>
                {unassigned.length === 0 ? (
                  <div style={{fontSize:'0.8rem',color:'var(--green)',fontWeight:500,padding:'0.25rem 0'}}>✓ Svi raspoređeni</div>
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
                            padding:'0.35rem 0.5rem',marginBottom:'0.15rem',
                            fontSize:'0.8rem',fontWeight:500,
                            background:cat.pale, border:`1px solid ${cat.border}`,
                            borderLeft:`3px solid ${cat.color}`,
                            borderRadius:4, cursor:'pointer', color:cat.color,
                          }}
                        >
                          <span style={{fontSize:'0.85rem'}}>{cat.icon}</span>
                          <span style={{flex:1}}>{w.name}</span>
                          <span style={{fontSize:'0.6rem',opacity:0.6}}>→</span>
                        </div>
                      ))}
                    </div>
                  ))
                )}
                {absentList.length > 0 && (
                  <>
                    <div style={{height:1,background:'var(--border)',margin:'0.5rem 0'}}/>
                    <div style={{fontFamily:'var(--mono)',fontSize:'0.62rem',letterSpacing:'0.08em',color:'var(--text-light)',textTransform:'uppercase',marginBottom:'0.4rem'}}>
                      Odsutni ({absentList.length})
                    </div>
                    {absentList.map(({ worker: w, entry }) => {
                      const s = ODSUTNOST_SHORT[entry.type] || { short:'?', icon:'❓', bg:'#f0f0f0', color:'#555', border:'#ccc' };
                      return (
                        <div key={w.id} style={{
                          display:'flex',alignItems:'center',gap:'0.4rem',
                          padding:'0.35rem 0.5rem',marginBottom:'0.15rem',
                          fontSize:'0.8rem',fontWeight:500,
                          background:s.bg, border:`1px solid ${s.border}`,
                          borderLeft:`3px solid ${s.color}`,
                          borderRadius:4, color:s.color, opacity:0.85,
                        }}>
                          <span style={{fontSize:'0.85rem'}}>{s.icon}</span>
                          <span style={{flex:1}}>{w.name}</span>
                          <span style={{fontSize:'0.6rem',fontWeight:700,fontFamily:'var(--mono)'}}>{s.short}</span>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })()}
      </>}

      {/* ─── VEHICLE ASSIGNMENT PORTAL POPUP (multiple vehicles) ─── */}
      {vehiclePopup && ReactDOM.createPortal(
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',zIndex:9998}} onClick={()=>setVehiclePopup(null)}>
          <div ref={vehiclePopupRef} onClick={e=>e.stopPropagation()} style={{
            position:'fixed',
            top: Math.min(vehiclePopup.rect?.bottom || 200, window.innerHeight - 420),
            left: Math.min(Math.max(vehiclePopup.rect?.left || 100, 8), window.innerWidth - 350),
            zIndex:9999,background:'white',border:'1px solid var(--border)',borderRadius:10,
            boxShadow:'0 8px 32px rgba(0,0,0,0.18)',padding:'0.85rem',width:330,maxHeight:'75vh',overflowY:'auto',
          }}>
            <div style={{fontWeight:700,fontSize:'0.85rem',marginBottom:'0.6rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              🚗 Vozila za ovaj raspored
              <button onClick={()=>setVehiclePopup(null)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'1.1rem',color:'var(--text-muted)',lineHeight:1}}>✕</button>
            </div>

            {/* Currently assigned vehicles list */}
            {vehiclePopup.vehicleIds.length > 0 && (
              <div style={{marginBottom:'0.6rem'}}>
                <label style={{fontSize:'0.7rem',fontWeight:600,color:'var(--text-muted)',display:'block',marginBottom:'0.3rem',textTransform:'uppercase',letterSpacing:'0.05em'}}>Dodijeljena vozila ({vehiclePopup.vehicleIds.length})</label>
                {vehiclePopup.vehicleIds.map((vid, idx) => {
                  const v = availableVehicles.find(v => v.id === vid);
                  if (!v) return null;
                  const driver = workers.find(w => w.id === v.driverId);
                  const usage = vehicleUsageMap[v.id];
                  const totalInVehicle = usage?.total || 0;
                  const cap = v.brojMjesta || 0;
                  const over = totalInVehicle > cap;
                  return (
                    <div key={vid} style={{display:'flex',alignItems:'center',gap:'0.4rem',padding:'0.4rem 0.5rem',marginBottom:'0.25rem',background: over ? '#fde8e8' : '#f0f7f0',border:`1px solid ${over ? '#f5b5b5' : '#a5d6a7'}`,borderRadius:6}}>
                      <div style={{flex:1,fontSize:'0.78rem'}}>
                        <div style={{fontWeight:600}}>🚗 {v.registracija} — {v.tipVozila}</div>
                        <div style={{fontSize:'0.68rem',color:'var(--text-muted)'}}>
                          {driver ? `🧑‍✈️ ${driver.name} · ` : ''}{v.brojMjesta} mj.
                          <span style={{fontWeight:600,color: over ? '#c53030' : '#2d5a27',marginLeft:'0.3rem'}}>
                            ({totalInVehicle}/{cap}{over ? ` +${totalInVehicle-cap}` : ''})
                          </span>
                        </div>
                      </div>
                      <button onClick={() => setVehiclePopup(p => ({...p, vehicleIds: p.vehicleIds.filter(id => id !== vid)}))}
                        style={{background:'#c53030',color:'white',border:'none',borderRadius:4,cursor:'pointer',fontSize:'0.7rem',padding:'0.2rem 0.4rem',fontWeight:600}}>✕</button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add new vehicle section */}
            <div style={{borderTop: vehiclePopup.vehicleIds.length > 0 ? '1px solid var(--border)' : 'none', paddingTop: vehiclePopup.vehicleIds.length > 0 ? '0.5rem' : 0}}>
              <label style={{fontSize:'0.7rem',fontWeight:600,color:'var(--text-muted)',display:'block',marginBottom:'0.3rem',textTransform:'uppercase',letterSpacing:'0.05em'}}>Dodaj vozilo</label>
              {/* By driver */}
              <div style={{marginBottom:'0.4rem'}}>
                <label style={{fontSize:'0.68rem',color:'var(--text-muted)',display:'block',marginBottom:'0.15rem'}}>Po šoferu:</label>
                <select className="form-select" style={{width:'100%',fontSize:'0.82rem',padding:'0.35rem'}}
                  value=""
                  onChange={e => {
                    const dId = e.target.value;
                    if (!dId) return;
                    const defV = availableVehicles.find(v => v.driverId === dId);
                    if (defV && !vehiclePopup.vehicleIds.includes(defV.id)) {
                      setVehiclePopup(p => ({...p, vehicleIds: [...p.vehicleIds, defV.id]}));
                    }
                  }}>
                  <option value="">— Odaberi šofera —</option>
                  {drivers.map(d => {
                    const dv = availableVehicles.find(v => v.driverId === d.id);
                    const already = dv && vehiclePopup.vehicleIds.includes(dv.id);
                    return <option key={d.id} value={d.id} disabled={already || !dv}>{d.name}{dv ? ` (${dv.registracija})` : ' (bez vozila)'}{already ? ' ✓' : ''}</option>;
                  })}
                </select>
              </div>
              {/* By vehicle */}
              <div style={{marginBottom:'0.5rem'}}>
                <label style={{fontSize:'0.68rem',color:'var(--text-muted)',display:'block',marginBottom:'0.15rem'}}>Ili po vozilu:</label>
                <select className="form-select" style={{width:'100%',fontSize:'0.82rem',padding:'0.35rem'}}
                  value=""
                  onChange={e => {
                    const vId = e.target.value;
                    if (vId && !vehiclePopup.vehicleIds.includes(vId)) {
                      setVehiclePopup(p => ({...p, vehicleIds: [...p.vehicleIds, vId]}));
                    }
                  }}>
                  <option value="">— Odaberi vozilo —</option>
                  {availableVehicles.map(v => {
                    const dr = workers.find(w => w.id === v.driverId);
                    const usage = vehicleUsageMap[v.id];
                    const totalUsed = usage?.total || 0;
                    const cap = v.brojMjesta || 0;
                    const already = vehiclePopup.vehicleIds.includes(v.id);
                    return <option key={v.id} value={v.id} disabled={already}>{v.registracija} — {v.tipVozila} · {v.brojMjesta} mj.{dr ? ` (${dr.name})` : ''} ({totalUsed}/{cap}){already ? ' ✓' : ''}</option>;
                  })}
                </select>
              </div>
            </div>

            {/* Drugi šofer za danas */}
            {vehiclePopup.vehicleIds.length > 0 && (
              <div style={{borderTop:'1px solid var(--border)',paddingTop:'0.5rem',marginTop:'0.3rem'}}>
                <label style={{fontSize:'0.7rem',fontWeight:600,color:'#b5620a',display:'block',marginBottom:'0.3rem'}}>
                  🔄 Drugi šofer za danas
                </label>
                <select className="form-select" style={{width:'100%',fontSize:'0.82rem',padding:'0.35rem'}}
                  value={vehiclePopup.otherDriverId || ''}
                  onChange={e => setVehiclePopup(p => ({...p, otherDriverId: e.target.value}))}>
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
                {vehiclePopup.otherDriverId && (() => {
                  const od = workers.find(w => w.id === vehiclePopup.otherDriverId);
                  const oc = getCatById(od?.category);
                  return od ? (
                    <div style={{marginTop:'0.25rem',fontSize:'0.68rem',color:'#b5620a',fontWeight:600}}>
                      🚗 {od.name} ({oc?.label}) vozi danas
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            {/* Action buttons */}
            <div style={{display:'flex',gap:'0.4rem',marginTop:'0.3rem'}}>
              <button className="btn btn-primary btn-sm" style={{flex:1}} onClick={() => {
                onAssignVehicle(vehiclePopup.rowId, vehiclePopup.vehicleIds, vehiclePopup.otherDriverId || '');
                setVehiclePopup(null);
              }}>Spremi</button>
              {vehiclePopup.vehicleIds.length > 0 && <button className="btn btn-sm" style={{background:'#c53030',color:'white',border:'none'}} onClick={() => {
                onAssignVehicle(vehiclePopup.rowId, [], '');
                setVehiclePopup(null);
              }}>Ukloni sve</button>}
              <button className="btn btn-secondary btn-sm" onClick={()=>setVehiclePopup(null)}>Odustani</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

