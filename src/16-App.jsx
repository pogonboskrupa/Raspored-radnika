// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem(AUTH_SESSION_KEY) === 'true');

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return <AppMain onLogout={() => { sessionStorage.removeItem(AUTH_SESSION_KEY); setIsAuthenticated(false); }} />;
}

function AppMain({ onLogout }) {
  const [workers, setWorkers] = useStorage('sumarija_workers', INITIAL_WORKERS);
  const [departments, setDepartments] = useStorage('sumarija_depts', INITIAL_DEPARTMENTS);
  const [schedules, setSchedules] = useStorage('sumarija_schedules', makeInitialSchedules());
  const [history, setHistory] = useStorage('sumarija_history', []);

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
  const allJobTypes = [...JOB_TYPES.filter(jt => jt !== 'Ostalo'), ...customJobTypes, 'Ostalo'];

  const addHistory = (action, scheduleId, oldData, newData) => {
    setHistory(h => [{
      id: uid(), timestamp: Date.now(), action, scheduleId,
      date: newData?.date || oldData?.date, oldData, newData
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
      const newId = uid();
      const nd = { ...data, id: newId };
      setSchedules(prev => [...prev, nd]);
      addHistory('create', newId, null, nd);
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
  const handlePrint = () => window.print();

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
          {[['raspored','📋 Raspored'],['radnici','👷 Radnici'],['spisak','📊 Spisak'],['vozila','🚗 Vozila'],['odjeli','🏕️ Odjeli'],['sihtarica','📄 Šihtarica'],['pregled','🔍 Pregled'],['historija','📜 Historija']].map(([k,l]) =>
            <button key={k} className={`nav-tab ${activeTab===k?'active':''}`} onClick={() => setActiveTab(k)}>{l}</button>
          )}
          <button className="nav-tab no-print" onClick={onLogout} title="Odjavi se"
            style={{marginLeft:'auto',opacity:0.7,fontSize:'0.75rem'}}>🔒 Odjava</button>
        </nav>
      </header>

      <div className="app-layout">
        {/* SIDEBAR */}
        {activeTab === 'raspored' && (
          <aside className="sidebar">
            <div className="sidebar-section">
              <div className="sidebar-label">Odjeli</div>
              <button className={`sidebar-item ${!sidebarFilter?'active':''}`} onClick={() => setSidebarFilter(null)}>
                <span>Svi odjeli</span>
                <span className="count">{Object.values(statsByDept).reduce((a,s)=>a+s.size,0)}</span>
              </button>
              {departments.map(d => (
                <button key={d.id} className={`sidebar-item ${sidebarFilter===d.id?'active':''}`} onClick={() => setSidebarFilter(d.id)}>
                  <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.name}</span>
                  <span className="count">{statsByDept[d.id]?.size || 0}</span>
                </button>
              ))}
            </div>
            <div className="sidebar-section">
              <div className="sidebar-label">Vrste posla <span style={{opacity:0.5,fontSize:'0.5rem',fontWeight:400}}>klikni za brzi unos</span></div>
              {allJobTypes.map(jt => (
                <button key={jt} className="sidebar-item" onClick={() => setModal({type:'entry', data:{date:selectedDate, jobType:jt}})}>
                  <span className={jobBadgeClass(jt)} style={{fontSize:'0.65rem'}}>{jt}</span>
                  <span className="count">{statsByJob[jt]?.size || 0}</span>
                </button>
              ))}
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

