// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem(AUTH_SESSION_KEY) === 'true');
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem(AUTH_USER_KEY) || '');

  if (!isAuthenticated) {
    return <LoginScreen onLogin={(name) => { setCurrentUser(name); setIsAuthenticated(true); }} />;
  }

  return <AppMain
    currentUser={currentUser}
    onLogout={() => {
      localStorage.removeItem(AUTH_SESSION_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      setIsAuthenticated(false);
      setCurrentUser('');
    }}
  />;
}

function AppMain({ onLogout, currentUser }) {
  const [workers, setWorkers] = useStorage('sumarija_workers', INITIAL_WORKERS);
  const [departments, setDepartments] = useStorage('sumarija_depts', INITIAL_DEPARTMENTS);
  const [schedules, setSchedules] = useStorage('sumarija_schedules', makeInitialSchedules());
  const [history, setHistory] = useStorage('sumarija_history', []);

  // PWA install prompt
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
    if (isStandalone) return;

    const handler = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const installedHandler = () => setShowInstallBanner(false);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPromptEvent) return;
    installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    if (outcome === 'accepted') setShowInstallBanner(false);
    setInstallPromptEvent(null);
  };

  const [activeTab, setActiveTab] = useState('raspored');
  const [selectedDate, setSelectedDate] = useState(today());
  const [sidebarFilter, setSidebarFilter] = useState(null);
  const [modal, setModal] = useState(null);
  const [historyModal, setHistoryModal] = useState(null);
  const [quickModal, setQuickModal] = useState(null); // { worker }
  const [filterTab, setFilterTab] = useState('dan');
  const [filterWorker, setFilterWorker] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterJob, setFilterJob] = useState('');
  // godisnji: { workerId: [ { date, type, note } ] }
  const [godisnji, setGodisnji] = useStorage('sumarija_godisnji', {});
  // goKvota: { workerId: { dana: number, datumOd: 'YYYY-MM-DD' } } — GO po ugovoru
  const [goKvota, setGoKvota] = useStorage('sumarija_go_kvota', {});
  // vehicles: [{ id, driverId, tipVozila, registracija, brojMjesta, status:'vozno'|'popravka' }]
  const [vehicles, setVehicles] = useStorage('sumarija_vehicles', []);
  // holidays: { 'YYYY-MM-DD': 'Naziv praznika' }
  const [holidays, setHolidays] = useStorage('sumarija_holidays', {});
  const [customJobTypes, setCustomJobTypes] = useStorage('sumarija_custom_jobs', []);
  const allJobTypes = [...JOB_TYPES.filter(jt => jt !== 'Ostalo'), ...customJobTypes.filter(jt => !JOB_TYPES.includes(jt)), 'Ostalo'];

  const addHistory = (action, scheduleId, oldData, newData) => {
    const user = localStorage.getItem(AUTH_USER_KEY) || '';
    setHistory(h => [{
      id: uid(), timestamp: Date.now(), action, scheduleId,
      date: newData?.date || oldData?.date, oldData, newData, user
    }, ...h].slice(0, 200));
  };

  // Day schedules
  const daySchedules = useMemo(() =>
    schedules.filter(s => s.date === selectedDate &&
      (!sidebarFilter || s.deptId === sidebarFilter)),
    [schedules, selectedDate, sidebarFilter]);

  // Dept summary for sidebar
  const deptCounts = useMemo(() => {
    const counts = {};
    schedules.filter(s => s.date === selectedDate).forEach(s => {
      counts[s.deptId] = (counts[s.deptId] || 0) + s.allWorkers.length;
    });
    return counts;
  }, [schedules, selectedDate]);

  // Stats
  const totalToday = useMemo(() =>
    new Set(daySchedules.flatMap(s => s.allWorkers)).size,
    [daySchedules]);

  const statsByJob = useMemo(() => {
    const m = {};
    daySchedules.forEach(s => {
      const jt = s.jobType === 'Priprema proizvodnje' ? 'Doznaka stabala' : s.jobType;
      if (!m[jt]) m[jt] = new Set();
      s.allWorkers.forEach(w => m[jt].add(w));
    });
    return m;
  }, [daySchedules]);

  const statsByDept = useMemo(() => {
    const m = {};
    daySchedules.forEach(s => {
      if (!m[s.deptId]) m[s.deptId] = new Set();
      s.allWorkers.forEach(w => m[s.deptId].add(w));
    });
    return m;
  }, [daySchedules]);

  // Conflict check
  const checkConflict = (newSched, excludeId = null) => {
    const conflicts = [];
    newSched.allWorkers.forEach(wId => {
      const existing = schedules.find(s =>
        s.date === newSched.date && s.id !== excludeId &&
        s.allWorkers.includes(wId)
      );
      if (existing) conflicts.push(wId);
    });
    return conflicts;
  };

  const wName = id => workers.find(w => w.id === id)?.name || id;
  const dName = id => { const d = departments.find(d => d.id === id); return d ? `${d.gospodarskaJedinica} — Odjel ${d.brojOdjela}` : id; };

  // Save schedule
  const saveSchedule = (data, isEdit) => {
    if (!isEdit && holidays[data.date]) {
      return alert(`Nije moguće rasporediti radnika na ${data.date} — praznik: "${holidays[data.date]}"`);
    }
    if (isEdit) {
      const old = schedules.find(s => s.id === data.id);
      setSchedules(prev => prev.map(s => s.id === data.id ? data : s));
      addHistory('edit', data.id, old, data);
    } else {
      // Provjeri da li postoji isti posao + odjel za isti datum — spoji radnike
      const existing = schedules.find(s =>
        s.date === data.date &&
        s.jobType === data.jobType &&
        s.deptId === data.deptId &&
        s.deptId // ne spajaj ako nema odjela
      );
      if (existing) {
        const old = { ...existing };
        const mergedWorkers = [...new Set([...(existing.allWorkers || []), ...(data.allWorkers || [])])];
        const mergedExtra = [...new Set([...(existing.extraWorkers || []), ...(data.extraWorkers || [])])];
        const updated = {
          ...existing,
          allWorkers: mergedWorkers,
          extraWorkers: mergedExtra,
          note: [existing.note, data.note].filter(Boolean).join('; ') || '',
          kisaMode: data.kisaMode || existing.kisaMode,
        };
        setSchedules(prev => prev.map(s => s.id === existing.id ? updated : s));
        addHistory('edit', existing.id, old, updated);
      } else {
        const newId = uid();
        const nd = { ...data, id: newId };
        setSchedules(prev => [...prev, nd]);
        addHistory('create', newId, null, nd);
      }
    }
  };

  const deleteSchedule = id => {
    const old = schedules.find(s => s.id === id);
    setSchedules(prev => prev.filter(s => s.id !== id));
    addHistory('delete', id, old, null);
  };

  const restoreVersion = (histItem) => {
    if (!histItem.oldData) return;
    const exists = schedules.find(s => s.id === histItem.scheduleId);
    if (exists) {
      setSchedules(prev => prev.map(s => s.id === histItem.scheduleId ? histItem.oldData : s));
    } else {
      setSchedules(prev => [...prev, histItem.oldData]);
    }
    addHistory('restore', histItem.scheduleId, exists, histItem.oldData);
    setHistoryModal(null);
  };

  // Called from SihtaricaView when a cell is manually set
  const SIHT_RAD_TYPES = ['Teren', 'Kancelarija'];
  const sihtSave = (workerId, date, type) => {
    if (type === null) {
      // Clear: remove worker from sihtEntry row; delete row if it becomes empty
      setSchedules(prev => prev.reduce((acc, s) => {
        if (!s.sihtEntry || s.date !== date || !(s.allWorkers || []).includes(workerId)) {
          acc.push(s); return acc;
        }
        const remaining = (s.allWorkers || []).filter(id => id !== workerId);
        if (remaining.length > 0) acc.push({ ...s, allWorkers: remaining });
        return acc;
      }, []));
      // Clear sihtEntry godisnji entries
      setGodisnji(prev => {
        const entries = (prev[workerId] || []).filter(e => !(e.sihtEntry && e.date === date));
        return { ...prev, [workerId]: entries };
      });
      return;
    }
    if (SIHT_RAD_TYPES.includes(type)) {
      // Don't create entry if worker already in a real (non-siht) schedule for this date
      const alreadyIn = schedules.some(s => s.date === date && !s.sihtEntry && (s.allWorkers || []).includes(workerId));
      if (!alreadyIn) {
        setSchedules(prev => {
          // Remove any previous sihtEntry for this worker+date (different job type)
          const withoutOld = prev.filter(s => !(s.sihtEntry && s.date === date && (s.allWorkers || []).includes(workerId)));
          // Find existing sihtEntry row for same date+jobType to merge into
          const existing = withoutOld.find(s => s.sihtEntry && s.date === date && s.jobType === type);
          if (existing) {
            return withoutOld.map(s => s.id === existing.id
              ? { ...s, allWorkers: [...new Set([...s.allWorkers, workerId])] }
              : s
            );
          }
          // No existing row — create new one
          const entry = { id: uid(), date, jobType: type, allWorkers: [workerId], deptId: '', extraWorkers: [], vehicleIds: [], note: '', kisaMode: 'go', overrides: [], sihtEntry: true };
          return [...withoutOld, entry];
        });
      }
    } else {
      // Odsutnost — add to godisnji if not already there
      const already = (godisnji[workerId] || []).some(e => e.date === date && !e.sihtEntry);
      if (!already) {
        const prev = godisnji[workerId] || [];
        const cleaned = prev.filter(e => !(e.sihtEntry && e.date === date));
        const entry = { id: uid(), date, type, note: '', sihtEntry: true };
        setGodisnji(g => ({ ...g, [workerId]: [...cleaned, entry] }));
      }
    }
  };

  const copyFromDate = (fromDate) => {
    if (holidays[selectedDate]) {
      return alert(`Nije moguće kopirati raspored na ${selectedDate} — praznik: "${holidays[selectedDate]}"`);
    }
    const source = schedules.filter(s => s.date === fromDate);
    const newOnes = source.map(s => ({ ...s, id: uid(), date: selectedDate }));
    setSchedules(prev => {
      const cleaned = prev.filter(s => s.date !== selectedDate);
      return [...cleaned, ...newOnes];
    });
    newOnes.forEach(s => addHistory('create', s.id, null, s));
  };

  const prevDay = () => {
    const d = new Date(selectedDate);
    do { d.setDate(d.getDate()-1); } while (d.getDay()===0); // skip Sunday
    setSelectedDate(d.toISOString().split('T')[0]);
  };
  const nextDay = () => {
    const d = new Date(selectedDate);
    do { d.setDate(d.getDate()+1); } while (d.getDay()===0); // skip Sunday
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Print
  const handlePrint = () => {
    const DANI = ['NEDJELJA','PONEDJELJAK','UTORAK','SRIJEDA','ČETVRTAK','PETAK','SUBOTA'];
    const danNaziv = DANI[new Date(selectedDate+'T00:00:00').getDay()];
    const datumFmt = fmtDate(selectedDate);
    const allToday = schedules.filter(s => s.date === selectedDate);

    // Group by dept, then by jobType
    const byDept = {};
    allToday.forEach(s => {
      if (!byDept[s.deptId]) byDept[s.deptId] = {};
      if (!byDept[s.deptId][s.jobType]) byDept[s.deptId][s.jobType] = [];
      byDept[s.deptId][s.jobType].push(s);
    });

    // Absent workers
    const assignedIds = new Set(allToday.flatMap(s => s.allWorkers || []));
    const ODSUTNOST_STYLE = {
      'Godišnji odmor': '🏖️ GO', 'Bolovanje': '🏥 B',
      'Slobodan dan': '☀️ SD', 'Neplaćeno': '📋 N',
    };
    const absentList = [];
    Object.entries(godisnji || {}).forEach(([wId, entries]) => {
      const entry = entries.find(e => e.date === selectedDate) ||
        entries.find(e => e.open && e.dateOd && e.dateOd <= selectedDate);
      if (!entry) return;
      const w = workers.find(x => x.id === wId);
      if (!w || assignedIds.has(w.id)) return;
      absentList.push({ name: w.name, type: entry.type });
    });

    let html = `<html><head><meta charset="UTF-8"/><title>Raspored ${datumFmt}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:Arial,sans-serif;font-size:11pt;padding:12mm;color:#222}
      h1{font-size:16pt;margin-bottom:2mm;text-align:center}
      .subtitle{font-size:11pt;text-align:center;color:#555;margin-bottom:6mm}
      .dept{margin-bottom:5mm;page-break-inside:avoid}
      .dept-name{background:#2d5a27;color:white;padding:2mm 4mm;font-weight:700;font-size:11pt;margin-bottom:0}
      table{border-collapse:collapse;width:100%;margin-bottom:1mm}
      th{background:#e8f0e6;border:1px solid #999;padding:1.5mm 3mm;text-align:left;font-size:9pt;font-weight:700}
      td{border:1px solid #bbb;padding:1.5mm 3mm;font-size:9.5pt;vertical-align:top}
      .workers{line-height:1.6}
      .worker{display:inline-block;background:#f0f0f0;border:1px solid #ccc;border-radius:3px;padding:0.5mm 2mm;margin:0.5mm;font-size:9pt}
      .absent-section{margin-top:6mm;page-break-inside:avoid}
      .absent-title{font-weight:700;font-size:11pt;border-bottom:1.5px solid #333;padding-bottom:1mm;margin-bottom:2mm}
      .absent-item{display:inline-block;background:#fde8e8;border:1px solid #daa;border-radius:3px;padding:0.5mm 2mm;margin:0.5mm;font-size:9pt}
      .vehicle-info{font-size:8.5pt;color:#555;margin-top:0.5mm}
      .summary{text-align:center;font-size:10pt;color:#444;margin-bottom:4mm}
    </style></head><body>`;
    html += `<h1>RASPORED RADNIKA — ${danNaziv}, ${datumFmt}</h1>`;
    html += `<div class="subtitle">Šumarija Bosanska Krupa</div>`;
    const totalWorkers = new Set(allToday.flatMap(s => s.allWorkers || [])).size;
    html += `<div class="summary">Ukupno raspoređeno: <strong>${totalWorkers}</strong> radnika · Odsutno: <strong>${absentList.length}</strong></div>`;

    Object.entries(byDept).forEach(([deptId, jobs]) => {
      const deptWorkerCount = new Set(Object.values(jobs).flat().flatMap(s => s.allWorkers || [])).size;
      html += `<div class="dept">`;
      html += `<div class="dept-name">🏕️ ${dName(deptId)} — ${deptWorkerCount} radnika</div>`;
      html += `<table><thead><tr><th style="width:18%">Vrsta posla</th><th>Radnici</th><th style="width:20%">Vozilo</th><th style="width:15%">Napomena</th></tr></thead><tbody>`;
      Object.entries(jobs).forEach(([jobType, rows]) => {
        rows.forEach(row => {
          const workerNames = (row.allWorkers || []).map(wId => wName(wId));
          const vIds = row.vehicleIds?.length ? row.vehicleIds : (row.vehicleId ? [row.vehicleId] : []);
          const vehicleInfo = vIds.map(vid => {
            const v = (vehicles || []).find(x => x.id === vid);
            if (!v) return '';
            const driver = workers.find(w => w.id === (row.otherDriverId || v.driverId));
            return `🚗 ${v.registracija} (${v.tipVozila}, ${v.brojMjesta} mj.)${driver ? ' — ' + driver.name : ''}`;
          }).filter(Boolean).join('<br>');
          html += `<tr>`;
          html += `<td><strong>${jobType}</strong></td>`;
          html += `<td class="workers">${workerNames.map(n => `<span class="worker">${n}</span>`).join(' ')}<div style="font-size:8pt;color:#666;margin-top:1mm">${workerNames.length} radnika</div></td>`;
          html += `<td class="vehicle-info">${vehicleInfo || '—'}</td>`;
          html += `<td>${row.note || '—'}</td>`;
          html += `</tr>`;
        });
      });
      html += `</tbody></table></div>`;
    });

    if (absentList.length > 0) {
      html += `<div class="absent-section">`;
      html += `<div class="absent-title">Odsutni radnici (${absentList.length})</div>`;
      html += `<div>`;
      absentList.forEach(a => {
        const label = ODSUTNOST_STYLE[a.type] || a.type;
        html += `<span class="absent-item">${a.name} — ${label}</span> `;
      });
      html += `</div></div>`;
    }

    html += `</body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.onload = () => { win.print(); };
  };

  // Quick assign from panel click
  const onWorkerClick = (worker) => setQuickModal({ worker });

  return (
    <div style={{width:'100%',maxWidth:'100vw',overflowX:'hidden'}}>
      {/* HEADER */}
      <header className="app-header">
        <div className="app-title">
          <span className="icon">🌲</span>
          <span>Šumarija Bos.Krupa</span>
          {FIREBASE_ENABLED
            ? <span style={{fontSize:'0.65rem',background:'rgba(255,255,255,0.15)',padding:'0.15rem 0.5rem',borderRadius:10,marginLeft:'0.25rem',fontFamily:'var(--mono)'}}>🔴 live sync</span>
            : <span style={{fontSize:'0.65rem',background:'rgba(255,255,255,0.1)',padding:'0.15rem 0.5rem',borderRadius:10,marginLeft:'0.25rem',fontFamily:'var(--mono)',opacity:0.6}}>💾 lokalno</span>
          }
        </div>
        <nav className="nav-tabs">
          {[['raspored','📋 Raspored'],['radnici','👷 Radnici'],['sihtarica','📄 Šihtarica'],['spisak','📊 Spisak'],['vozila','🚗 Vozila'],['odjeli','🏕️ Odjeli'],['pregled','🔍 Pregled'],['historija','📜 Historija']].map(([k,l]) =>
            <button key={k} className={`nav-tab ${activeTab===k?'active':''}`} onClick={() => setActiveTab(k)}>{l}</button>
          )}
          <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:'0.4rem'}}>
            {currentUser && (
              <span style={{fontSize:'0.7rem',fontWeight:700,color:'rgba(255,255,255,0.9)',
                background:'rgba(255,255,255,0.15)',padding:'0.15rem 0.55rem',borderRadius:8,
                fontFamily:'var(--mono)',letterSpacing:'0.05em'}}>
                👤 {currentUser}
              </span>
            )}
            <button className="nav-tab no-print" onClick={onLogout} title="Odjavi se"
              style={{opacity:0.7,fontSize:'0.75rem'}}>🔒 Odjava</button>
          </div>
        </nav>
      </header>

      {/* PWA INSTALL BANNER */}
      {showInstallBanner && (
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          background:'#2d5a27', color:'white',
          padding:'0.5rem 1rem', gap:'0.75rem', flexWrap:'wrap',
          fontSize:'0.85rem',
        }}>
          <span>📲 Instalirajte aplikaciju na uređaj za brži pristup</span>
          <div style={{display:'flex', gap:'0.5rem'}}>
            <button onClick={handleInstallClick} style={{
              background:'white', color:'#2d5a27', border:'none',
              borderRadius:6, padding:'0.3rem 0.9rem', fontWeight:700,
              cursor:'pointer', fontSize:'0.85rem',
            }}>Instaliraj</button>
            <button onClick={() => setShowInstallBanner(false)} style={{
              background:'transparent', color:'rgba(255,255,255,0.7)', border:'none',
              borderRadius:6, padding:'0.3rem 0.5rem', cursor:'pointer',
              fontSize:'1rem', lineHeight:1,
            }}>✕</button>
          </div>
        </div>
      )}

      <div className="app-layout">
        {/* SIDEBAR */}
        {activeTab === 'raspored' && (
          <aside className="sidebar">
            <div className="sidebar-section">
              <div className="sidebar-label">Raspored za dan</div>
              <button className={`sidebar-item ${!sidebarFilter?'active':''}`} onClick={() => setSidebarFilter(null)}>
                <span>Sve stavke</span>
                <span className="count">{new Set(schedules.filter(s => s.date === selectedDate).flatMap(s => s.allWorkers)).size}</span>
              </button>
              {(() => {
                const todayEntries = schedules.filter(s => s.date === selectedDate);
                const grouped = {};
                todayEntries.forEach(s => {
                  const key = `${s.deptId}__${s.jobType}`;
                  if (!grouped[key]) grouped[key] = { deptId: s.deptId, jobType: s.jobType, workers: new Set() };
                  s.allWorkers.forEach(w => grouped[key].workers.add(w));
                });
                return Object.values(grouped).map(g => (
                  <button key={`${g.deptId}__${g.jobType}`} className={`sidebar-item ${sidebarFilter===g.deptId?'active':''}`} onClick={() => setSidebarFilter(g.deptId)} style={{flexDirection:'column',alignItems:'flex-start',gap:'0.15rem'}}>
                    <div style={{display:'flex',width:'100%',alignItems:'center',gap:'0.4rem'}}>
                      <span className={jobBadgeClass(g.jobType)} style={{fontSize:'0.6rem'}}>{g.jobType}</span>
                      <span className="count" style={{marginLeft:'auto'}}>{g.workers.size}</span>
                    </div>
                    <span style={{fontSize:'0.7rem',color:'var(--text-muted)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',width:'100%'}}>{dName(g.deptId)}</span>
                  </button>
                ));
              })()}
              {schedules.filter(s => s.date === selectedDate).length === 0 && (
                <div style={{padding:'0.5rem 1rem',fontSize:'0.78rem',color:'var(--text-muted)',fontStyle:'italic'}}>Nema unosa za ovaj dan.</div>
              )}
            </div>
          </aside>
        )}

        {/* MAIN */}
        <main className="main-content">
          {activeTab === 'raspored' && (
            <ScheduleView
              selectedDate={selectedDate} setSelectedDate={setSelectedDate}
              daySchedules={daySchedules} schedules={schedules}
              workers={workers} departments={departments}
              vehicles={vehicles}
              wName={wName} dName={dName}
              totalToday={totalToday} statsByJob={statsByJob} statsByDept={statsByDept}
              sidebarFilter={sidebarFilter} setSidebarFilter={setSidebarFilter}
              prevDay={prevDay} nextDay={nextDay}
              onAdd={() => setModal({type:'entry', data:{date:selectedDate}})}
              onAddWithJob={(jobType) => setModal({type:'entry', data:{date:selectedDate, jobType}})}
              onEdit={s => setModal({type:'entry', data:s, isEdit:true})}
              onDelete={id => { if (confirm('Obrisati ovaj zapis?')) deleteSchedule(id); }}
              onHistory={s => setHistoryModal(s)}
              onAssignVehicle={(rowId, vehicleIds, otherDriverId) => {
                setSchedules(prev => prev.map(s => s.id === rowId ? {...s, vehicleIds, vehicleId: vehicleIds[0] || '', otherDriverId: otherDriverId !== undefined ? otherDriverId : (s.otherDriverId || '')} : s));
              }}
              copyFromDate={copyFromDate}
              handlePrint={handlePrint}
              yesterday={yesterday()}
              godisnji={godisnji}
              holidays={holidays}
              onWorkerClick={onWorkerClick}
              allJobTypes={allJobTypes}
              customJobTypes={customJobTypes}
              setCustomJobTypes={setCustomJobTypes}
            />
          )}
          {activeTab === 'radnici' && (
            <WorkersView workers={workers} setWorkers={setWorkers} schedules={schedules} />
          )}
          {activeTab === 'odjeli' && (
            <DepartmentsView departments={departments} setDepartments={setDepartments} schedules={schedules} dName={dName} />
          )}
          {activeTab === 'spisak' && (
            <SpisakView workers={workers} setWorkers={setWorkers} vehicles={vehicles} />
          )}
          {activeTab === 'vozila' && (
            <VozaciView vehicles={vehicles} setVehicles={setVehicles} workers={workers} />
          )}
          {activeTab === 'sihtarica' && (
            <SihtaricaView
              schedules={schedules} workers={workers} departments={departments}
              godisnji={godisnji} setGodisnji={setGodisnji}
              goKvota={goKvota} setGoKvota={setGoKvota}
              holidays={holidays} setHolidays={setHolidays}
              wName={wName} dName={dName}
              onSihtSave={sihtSave}
            />
          )}
          {activeTab === 'pregled' && (
            <PregledView schedules={schedules} workers={workers} departments={departments}
              wName={wName} dName={dName}
              filterWorker={filterWorker} setFilterWorker={setFilterWorker}
              filterDept={filterDept} setFilterDept={setFilterDept}
              filterJob={filterJob} setFilterJob={setFilterJob}
            />
          )}
          {activeTab === 'historija' && (
            <HistorijaView history={history} wName={wName} dName={dName} restoreVersion={restoreVersion} schedules={schedules} />
          )}
        </main>

        {/* RIGHT PANEL (schedule tab only) */}
        {activeTab === 'raspored' && (
          <RightPanel
            selectedDate={selectedDate}
            daySchedules={daySchedules}
            schedules={schedules}
            workers={workers}
            departments={departments}
            vehicles={vehicles}
            wName={wName}
            dName={dName}
            statsByJob={statsByJob}
            statsByDept={statsByDept}
            godisnji={godisnji}
            onAdd={() => setModal({type:'entry', data:{date:selectedDate}})}
            onAddWithJob={(jobType) => setModal({type:'entry', data:{date:selectedDate, jobType}})}
            copyFromDate={copyFromDate}
            yesterday={yesterday()}
            onWorkerClick={onWorkerClick}
        />
        )}
      </div>

      {/* MOBILE FAB */}
      {activeTab === 'raspored' && (
        <button className="mobile-fab" onClick={() => setModal({type:'entry', data:{date:selectedDate}})}>+</button>
      )}

      {/* MODALS */}
      {quickModal && (
        <QuickModal
          worker={quickModal.worker}
          workers={workers}
          departments={departments}
          setDepartments={setDepartments}
          selectedDate={selectedDate}
          schedules={schedules}
          checkConflict={checkConflict}
          vehicles={vehicles}
          allJobTypes={allJobTypes}
          onSave={(d) => { saveSchedule(d, false); setQuickModal(null); }}
          onClose={() => setQuickModal(null)}
          wName={wName}
          godisnji={godisnji}
          setGodisnji={setGodisnji}
        />
      )}
      {modal?.type === 'entry' && (
        <EntryModal
          data={modal.data}
          isEdit={modal.isEdit}
          workers={workers}
          departments={departments}
          setDepartments={setDepartments}
          schedules={schedules}
          checkConflict={checkConflict}
          vehicles={vehicles}
          allJobTypes={allJobTypes}
          onSave={(d) => { saveSchedule(d, modal.isEdit); setModal(null); }}
          onClose={() => setModal(null)}
          wName={wName}
          godisnji={godisnji}
          selectedDate={selectedDate}
        />
      )}

      {historyModal && (
        <HistoryDetailModal
          schedule={historyModal}
          history={history.filter(h => h.scheduleId === historyModal.id)}
          workers={workers}
          wName={wName}
          dName={dName}
          restoreVersion={restoreVersion}
          onClose={() => setHistoryModal(null)}
        />
      )}
    </div>
  );
}

