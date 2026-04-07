// ─── ŠIHTARICA VIEW ──────────────────────────────────────────────────────────
function SihtaricaView({ schedules, workers, departments, godisnji, setGodisnji, goKvota, setGoKvota, holidays, setHolidays, wName, dName }) {
  const now = new Date();
  const [selYear,  setSelYear]  = useState(now.getFullYear());
  const [selMonth, setSelMonth] = useState(now.getMonth()); // 0-indexed
  const [selWorker, setSelWorker] = useState('');
  const [goModal, setGoModal] = useState(null); // { workerId } or null
  const [goForm, setGoForm] = useState({ date:'', dateDo:'', type:'Godišnji odmor', note:'' });
  const [closingLeave, setClosingLeave] = useState(null); // { wId, entry } for closing open leave
  const [closeDateDo, setCloseDateDo] = useState('');
  const [sihtView, setSihtView] = useState('mjesecni'); // 'mjesecni' | 'radnik' | 'godisnji' | 'praznici'
  const [sihtManual, setSihtManual] = useStorage('sumarija_siht_manual', {});
  const [cellPicker, setCellPicker] = useState(null); // { workerId, date, x, y }
  const [holidayInput, setHolidayInput] = useState(false);
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState(new Date().toISOString().split('T')[0]);

  // Helper: normalize goKvota entry (backward compat with old number format)
  const getKvota = (wId) => {
    const raw = goKvota[wId];
    if (!raw) return { dana: 0, datumOd: '' };
    if (typeof raw === 'number') return { dana: raw, datumOd: `${selYear}-01-01` };
    return { dana: raw.dana || 0, datumOd: raw.datumOd || '' };
  };
  const setWorkerKvota = (wId, dana, datumOd) => {
    setGoKvota(prev => ({ ...prev, [wId]: { dana, datumOd } }));
  };

  // Sort workers by category order (WORKER_CATEGORIES), then by name
  const catOrder = WORKER_CATEGORIES.map(c => c.id);
  const sortedWorkers = useMemo(() =>
    [...workers].sort((a, b) => {
      const ai = catOrder.indexOf(a.category), bi = catOrder.indexOf(b.category);
      const ca = ai === -1 ? 999 : ai, cb = bi === -1 ? 999 : bi;
      return ca !== cb ? ca - cb : a.name.localeCompare(b.name);
    }), [workers]);

  const ODSUTNOST_TYPES = ['Godišnji odmor','Bolovanje','Slobodan dan','Neplaćeno','Službeni put','Neopravdan dan'];
  const ODSUTNOST_COLOR = {
    'Godišnji odmor': { bg:'#e4edf5', color:'#1a3d5c', border:'#9bbfd9', short:'GO', icon:'🌴' },
    'Bolovanje':      { bg:'#fde8e8', color:'#8b2020', border:'#e0a0a0', short:'B',  icon:'🏥' },
    'Slobodan dan':   { bg:'#fdf0e0', color:'#b5620a', border:'#e8c17a', short:'SD', icon:'☀️' },
    'Neplaćeno':      { bg:'#f0f0f0', color:'#555',    border:'#ccc',    short:'N',  icon:'🚫' },
    'Službeni put':   { bg:'#edf4fb', color:'#0a4b78', border:'#7ab8e0', short:'SP', icon:'✈️' },
    'Neopravdan dan': { bg:'#3d0000', color:'#fff',    border:'#8b0000', short:'ND', icon:'❌' },
  };

  // Helper: set/clear manual cell override
  const setManualCell = (workerId, date, type) => {
    setSihtManual(prev => {
      const wDates = { ...(prev[workerId] || {}) };
      if (type === null) { delete wDates[date]; }
      else { wDates[date] = type; }
      return { ...prev, [workerId]: wDates };
    });
    setCellPicker(null);
  };

  const daysInMonth = new Date(selYear, selMonth + 1, 0).getDate();
  const days = Array.from({length: daysInMonth}, (_,i) => i+1);
  const isoDate = d => `${selYear}-${String(selMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const dayOfWeek = d => new Date(selYear, selMonth, d).getDay(); // 0=Sun,6=Sat
  const isWeekend = d => { const dw = dayOfWeek(d); return dw===0||dw===6; };
  const MONTH_NAMES = ['Januar','Februar','Mart','April','Maj','Juni','Juli','August','Septembar','Oktobar','Novembar','Decembar'];

  // Build map: workerId -> date -> { type: 'rad'|'odsutnost'|'praznik' }
  const workerDayMap = useMemo(() => {
    const m = {};
    workers.forEach(w => { m[w.id] = {}; });
    // Radni dani iz rasporeda
    schedules.forEach(s => {
      s.allWorkers.forEach(wId => {
        if (!m[wId]) return;
        // Kiša — mapira se prema kisaMode
        if (s.jobType === 'Kiša') {
          const mode = s.kisaMode || 'go';
          if (mode === 'rad') {
            m[wId][s.date] = { type: 'rad', jobType: 'Kiša' };
          } else {
            const KISA_MAP = { go: 'Godišnji odmor', bolovanje: 'Bolovanje', neplaceno: 'Neplaćeno' };
            m[wId][s.date] = { type: 'odsutnost', oType: KISA_MAP[mode] || 'Godišnji odmor', note: 'Kiša', kisa: true };
          }
        } else {
          m[wId][s.date] = { type: 'rad', jobType: s.jobType };
        }
      });
    });
    // Odsutnost
    Object.entries(godisnji).forEach(([wId, entries]) => {
      if (!m[wId]) return;
      entries.forEach(e => {
        // Backward compat: stari Teren/Kancelarija unosi iz godisnji → radni dan
        const isRadniTip = e.type === 'Teren' || e.type === 'Kancelarija';
        if (e.open && e.dateOd) {
          days.forEach(d => {
            const date = isoDate(d);
            if (date >= e.dateOd && !isWeekend(d)) {
              m[wId][date] = isRadniTip
                ? { type: 'rad', jobType: e.type, note: e.note, open: true, dateOd: e.dateOd }
                : { type: 'odsutnost', oType: e.type, note: e.note, open: true, dateOd: e.dateOd };
            }
          });
        } else if (e.date) {
          m[wId][e.date] = isRadniTip
            ? { type: 'rad', jobType: e.type, note: e.note }
            : { type: 'odsutnost', oType: e.type, note: e.note };
        }
      });
    });
    // Praznici — override za sve radnike (ako nemaju raspored, upisi praznik)
    if (holidays) {
      Object.entries(holidays).forEach(([date, name]) => {
        workers.forEach(w => {
          if (m[w.id] && !m[w.id][date]) {
            m[w.id][date] = { type: 'praznik', holidayName: name };
          }
        });
      });
    }
    // sihtManual — najviši prioritet, override svega
    if (sihtManual) {
      Object.entries(sihtManual).forEach(([wId, dates]) => {
        if (!m[wId]) return;
        Object.entries(dates).forEach(([date, type]) => {
          if (!type) { delete m[wId][date]; return; }
          if (type === 'Teren' || type === 'Kancelarija') {
            m[wId][date] = { type: 'rad', jobType: type, manual: true };
          } else {
            m[wId][date] = { type: 'odsutnost', oType: type, manual: true };
          }
        });
      });
    }
    return m;
  }, [schedules, godisnji, workers, holidays, sihtManual]);

  // Stats per worker for selected month
  const workerStats = useMemo(() => {
    return workers.map(w => {
      let radnih = 0, odsutnih = 0, vikenda = 0, praznih = 0, praznika = 0;
      const odsutTypes = {};
      days.forEach(d => {
        const date = isoDate(d);
        const entry = workerDayMap[w.id]?.[date];
        if (isWeekend(d)) { vikenda++; return; }
        if (!entry) { praznih++; return; }
        if (entry.type === 'rad') radnih++;
        else if (entry.type === 'praznik') praznika++;
        else { odsutnih++; odsutTypes[entry.oType] = (odsutTypes[entry.oType]||0)+1; }
      });
      return { ...w, radnih, odsutnih, vikenda, praznih, praznika, odsutTypes };
    });
  }, [workerDayMap, days, selYear, selMonth]);

  // Add odsutnost (supports date range or open-ended)
  const saveGodisnji = () => {
    if (!goForm.date) return alert('Odaberi datum!');
    const wId = goModal.workerId;
    if (goForm.dateDo && goForm.dateDo < goForm.date) return alert('Datum "Do" mora biti nakon datuma "Od"!');
    if (!goForm.dateDo) {
      // Open-ended leave
      setGodisnji(g => {
        const prev = (g[wId] || []).filter(e => !(e.open && e.dateOd === goForm.date && e.type === goForm.type));
        return { ...g, [wId]: [...prev, { dateOd: goForm.date, type: goForm.type, note: goForm.note, open: true }] };
      });
      setGoModal(null);
      setGoForm({ date:'', dateDo:'', type:'Godišnji odmor', note:'' });
      return;
    }
    const startDate = new Date(goForm.date);
    const endDate = new Date(goForm.dateDo);
    const dates = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate()+1)) {
      const dw = d.getDay();
      if (dw !== 0 && dw !== 6) dates.push(d.toISOString().slice(0,10));
    }
    if (dates.length === 0) return alert('Nema radnih dana u odabranom periodu!');
    setGodisnji(g => {
      const prev = (g[wId] || []).filter(e => !dates.includes(e.date));
      const newEntries = dates.map(dt => ({ date: dt, type: goForm.type, note: goForm.note }));
      return { ...g, [wId]: [...prev, ...newEntries] };
    });
    setGoModal(null);
    setGoForm({ date:'', dateDo:'', type:'Godišnji odmor', note:'' });
  };

  // Close an open-ended leave by setting end date and expanding into individual date entries
  const closeOpenLeave = (wId, openEntry, dateDo) => {
    const startDate = new Date(openEntry.dateOd);
    const endDate = new Date(dateDo);
    if (endDate < startDate) return alert('Datum završetka mora biti nakon početka!');
    const dates = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate()+1)) {
      const dw = d.getDay();
      if (dw !== 0 && dw !== 6) dates.push(d.toISOString().slice(0,10));
    }
    setGodisnji(g => {
      const prev = (g[wId] || []).filter(e => !(e.open && e.dateOd === openEntry.dateOd && e.type === openEntry.type) && !dates.includes(e.date));
      const newEntries = dates.map(dt => ({ date: dt, type: openEntry.type, note: openEntry.note }));
      return { ...g, [wId]: [...prev, ...newEntries] };
    });
  };

  const deleteGodisnji = (wId, date) => {
    setGodisnji(g => ({ ...g, [wId]: (g[wId]||[]).filter(e => e.date !== date) }));
  };

  const deleteOpenLeave = (wId, openEntry) => {
    setGodisnji(g => ({ ...g, [wId]: (g[wId]||[]).filter(e => !(e.open && e.dateOd === openEntry.dateOd && e.type === openEntry.type)) }));
  };

  const displayWorkers = selWorker ? sortedWorkers.filter(w => w.id === selWorker) : sortedWorkers;

  // ── Yearly overview data ──
  const yearlyStats = useMemo(() => {
    if (sihtView !== 'godisnji') return [];
    return sortedWorkers.filter(w => w.status === 'aktivan').map(w => {
      const months = Array.from({length:12}, (_,mi) => {
        const dim = new Date(selYear, mi+1, 0).getDate();
        let radnih=0, odsutnih=0, vikenda=0, praznih=0, praznika=0;
        const odsutTypes = {};
        for (let d=1; d<=dim; d++) {
          const iso = `${selYear}-${String(mi+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          const dw = new Date(selYear, mi, d).getDay();
          if (dw===0||dw===6) { vikenda++; continue; }
          const entry = workerDayMap[w.id]?.[iso];
          if (!entry) { praznih++; continue; }
          if (entry.type==='rad') radnih++;
          else if (entry.type==='praznik') praznika++;
          else { odsutnih++; odsutTypes[entry.oType]=(odsutTypes[entry.oType]||0)+1; }
        }
        return { radnih, odsutnih, vikenda, praznih, praznika, odsutTypes };
      });
      const total = months.reduce((a,m)=>({
        radnih:a.radnih+m.radnih, odsutnih:a.odsutnih+m.odsutnih,
        vikenda:a.vikenda+m.vikenda, praznih:a.praznih+m.praznih, praznika:a.praznika+m.praznika
      }),{radnih:0,odsutnih:0,vikenda:0,praznih:0,praznika:0});
      // Count GO days used from datumOd onwards
      const kv = getKvota(w.id);
      const goUsed = (godisnji[w.id]||[]).filter(e => e.date && e.type === 'Godišnji odmor' && (!kv.datumOd || e.date >= kv.datumOd)).length;
      const goRemaining = kv.dana - goUsed;
      return { ...w, months, total, goUsed, kvota: kv.dana, kvotaDatumOd: kv.datumOd, goRemaining };
    });
  }, [sihtView, selYear, workerDayMap, workers, goKvota, godisnji]);

  // ── Per-worker monthly detail ──
  const singleWorkerData = useMemo(() => {
    if (sihtView !== 'radnik' || !selWorker) return null;
    const w = workers.find(x => x.id === selWorker);
    if (!w) return null;
    const months = Array.from({length:12}, (_,mi) => {
      const dim = new Date(selYear, mi+1, 0).getDate();
      const daysList = [];
      let radnih=0, odsutnih=0, vikenda=0, praznih=0, praznika=0;
      const odsutTypes = {};
      for (let d=1; d<=dim; d++) {
        const iso = `${selYear}-${String(mi+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const dw = new Date(selYear, mi, d).getDay();
        const entry = workerDayMap[w.id]?.[iso];
        const wknd = dw===0||dw===6;
        if (wknd) vikenda++;
        else if (!entry) praznih++;
        else if (entry.type==='rad') radnih++;
        else if (entry.type==='praznik') praznika++;
        else { odsutnih++; odsutTypes[entry.oType]=(odsutTypes[entry.oType]||0)+1; }
        daysList.push({ d, iso, dw, wknd, entry });
      }
      return { mi, days: daysList, radnih, odsutnih, vikenda, praznih, praznika, odsutTypes };
    });
    const total = months.reduce((a,m)=>({
      radnih:a.radnih+m.radnih, odsutnih:a.odsutnih+m.odsutnih,
      vikenda:a.vikenda+m.vikenda, praznih:a.praznih+m.praznih, praznika:a.praznika+m.praznika
    }),{radnih:0,odsutnih:0,vikenda:0,praznih:0,praznika:0});
    return { worker: w, months, total };
  }, [sihtView, selYear, selWorker, workerDayMap, workers]);

  return (
    <div>
      {/* HEADER */}
      <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'0.75rem',flexWrap:'wrap'}}>
        <div className="section-title">📄 Šihtarica</div>

        {/* View tabs */}
        <div style={{display:'flex',gap:0,borderRadius:6,overflow:'hidden',border:'1px solid var(--border)'}}>
          {[['mjesecni','Mjesečni'],['radnik','Po radniku'],['godisnji','Godišnji'],['gokvota','GO Kvota'],['praznici','Praznici']].map(([k,l])=>(
            <button key={k} onClick={()=>setSihtView(k)} style={{
              padding:'0.35rem 0.7rem',fontSize:'0.75rem',fontWeight:sihtView===k?700:400,
              border:'none',cursor:'pointer',
              background:sihtView===k?'var(--green)':'var(--bg)',
              color:sihtView===k?'white':'var(--text-muted)',
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* NAV ROW */}
      {sihtView !== 'praznici' && sihtView !== 'gokvota' && <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap'}}>
        {sihtView !== 'godisnji' ? (
          <div style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
            <button className="date-nav-btn" onClick={() => { if(selMonth===0){setSelMonth(11);setSelYear(y=>y-1);}else setSelMonth(m=>m-1); }}>◀</button>
            <span style={{fontFamily:'var(--mono)',fontWeight:700,fontSize:'0.9rem',minWidth:140,textAlign:'center'}}>
              {MONTH_NAMES[selMonth]} {selYear}
            </span>
            <button className="date-nav-btn" onClick={() => { if(selMonth===11){setSelMonth(0);setSelYear(y=>y+1);}else setSelMonth(m=>m+1); }}>▶</button>
          </div>
        ) : (
          <div style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
            <button className="date-nav-btn" onClick={() => setSelYear(y=>y-1)}>◀</button>
            <span style={{fontFamily:'var(--mono)',fontWeight:700,fontSize:'0.9rem',minWidth:60,textAlign:'center'}}>
              {selYear}
            </span>
            <button className="date-nav-btn" onClick={() => setSelYear(y=>y+1)}>▶</button>
          </div>
        )}

        {/* Worker filter */}
        <select className="form-select" value={selWorker} onChange={e=>setSelWorker(e.target.value)} style={{maxWidth:220}}>
          <option value="">{sihtView==='radnik' ? '— Odaberi radnika —' : 'Svi radnici'}</option>
          {sortedWorkers.filter(w=>w.status==='aktivan').map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
        </select>

        <button className="btn btn-secondary btn-sm" onClick={() => {
          const title = `Šihtarica — ${MONTH_NAMES[selMonth]} ${selYear}${selWorker ? ' — ' + workers.find(w=>w.id===selWorker)?.name : ''}`;
          const printWorkers = (selWorker ? sortedWorkers.filter(w=>w.id===selWorker) : sortedWorkers).filter(w=>w.status==='aktivan');
          const DAY_LABELS = 'NPUSČPS';

          let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
          <title>${title}</title>
          <style>
            *{margin:0;padding:0;box-sizing:border-box}
            body{font-family:Arial,sans-serif;font-size:9pt;padding:8mm;color:#222}
            h1{font-size:13pt;margin-bottom:1mm;text-align:center}
            .sub{font-size:9pt;text-align:center;color:#555;margin-bottom:5mm}
            table{border-collapse:collapse;width:100%;font-size:7.5pt}
            th,td{border:1px solid #ccc;padding:1.5mm 1mm;text-align:center}
            th{background:#f0ede6;font-size:6.5pt}
            .wname{text-align:left;padding-left:2mm;font-weight:700;min-width:90px;max-width:120px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
            .rad{background:#d4ecd4;color:#1a4d1a;font-weight:700}
            .go{background:#dae8f5;color:#1a3d5c;font-weight:700}
            .b{background:#fde8e8;color:#8b2020;font-weight:700}
            .sd{background:#fdf0e0;color:#b5620a;font-weight:700}
            .sp{background:#ddeeff;color:#0a4b78;font-weight:700}
            .nd{background:#6b0000;color:#fff;font-weight:700}
            .n{background:#eee;color:#555;font-weight:700}
            .praznik{background:#fff3e0;color:#e65100;font-weight:700}
            .vikend{background:#ece9e2;color:#bbb}
            .sum{background:#f0ede6;font-weight:700;font-size:7pt}
            @media print{body{padding:5mm}}
          </style></head><body>`;
          html += `<h1>${title}</h1><div class="sub">Šumarija Bosanska Krupa</div>`;
          html += `<table><thead><tr><th class="wname">Radnik</th>`;
          days.forEach(d => {
            const wknd = isWeekend(d);
            html += `<th style="${wknd?'color:#bbb':''}">${d}<br/><span style="font-size:5.5pt">${DAY_LABELS[dayOfWeek(d)]}</span></th>`;
          });
          html += `<th class="sum">R</th><th class="sum">GO</th><th class="sum">B</th><th class="sum">SD</th></tr></thead><tbody>`;

          printWorkers.forEach(w => {
            const stats = workerStats.find(s=>s.id===w.id)||{radnih:0,odsutTypes:{}};
            html += `<tr><td class="wname">${w.name}</td>`;
            days.forEach(d => {
              const date = isoDate(d);
              const entry = workerDayMap[w.id]?.[date];
              const wknd = isWeekend(d);
              if (wknd) { html += `<td class="vikend">—</td>`; return; }
              if (!entry) { html += `<td></td>`; return; }
              if (entry.type === 'rad') { html += `<td class="rad">8</td>`; return; }
              if (entry.type === 'praznik') { html += `<td class="praznik">P</td>`; return; }
              const SHORT_CLASS = {'Godišnji odmor':'go','Bolovanje':'b','Slobodan dan':'sd','Službeni put':'sp','Neopravdan dan':'nd','Neplaćeno':'n'};
              const cls = SHORT_CLASS[entry.oType] || 'n';
              const short = ODSUTNOST_COLOR[entry.oType]?.short || '?';
              html += `<td class="${cls}">${short}</td>`;
            });
            html += `<td class="sum">${stats.radnih||0}</td><td class="sum">${stats.odsutTypes?.['Godišnji odmor']||0}</td><td class="sum">${stats.odsutTypes?.['Bolovanje']||0}</td><td class="sum">${stats.odsutTypes?.['Slobodan dan']||0}</td></tr>`;
          });

          html += `</tbody></table></body></html>`;
          const w = window.open('','_blank');
          w.document.write(html);
          w.document.close();
          w.onload = () => w.print();
        }}>🖨️ Štampaj</button>
      </div>}

      {/* ═══════ PRAZNICI VIEW ═══════ */}
      {sihtView === 'praznici' && (
        <div>
          {/* Add holiday */}
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'1rem',flexWrap:'wrap'}}>
            <input type="date" className="form-input" value={holidayDate} onChange={e=>setHolidayDate(e.target.value)}
              style={{fontSize:'0.85rem',padding:'0.35rem 0.5rem'}} />
            {!holidayInput ? (
              <button className="btn btn-primary btn-sm" onClick={()=>{setHolidayInput(true);setHolidayName('');}}>
                + Dodaj praznik
              </button>
            ) : (
              <>
                <input autoFocus className="form-input" placeholder="Naziv praznika (npr. Bajram, Nova godina...)"
                  value={holidayName} onChange={e=>setHolidayName(e.target.value)}
                  onKeyDown={e=>{
                    if(e.key==='Enter'){
                      const name=holidayName.trim();
                      if(!name) return alert('Unesite naziv praznika!');
                      setHolidays(h=>({...h,[holidayDate]:name}));
                      setHolidayInput(false);setHolidayName('');
                    }
                    if(e.key==='Escape'){setHolidayInput(false);setHolidayName('');}
                  }}
                  style={{flex:1,fontSize:'0.85rem',padding:'0.35rem 0.5rem',minWidth:200}} />
                <button className="btn btn-primary btn-sm" onClick={()=>{
                  const name=holidayName.trim();
                  if(!name) return alert('Unesite naziv praznika!');
                  setHolidays(h=>({...h,[holidayDate]:name}));
                  setHolidayInput(false);setHolidayName('');
                }}>Spremi</button>
                <button className="btn btn-secondary btn-sm" onClick={()=>{setHolidayInput(false);setHolidayName('');}}>Odustani</button>
              </>
            )}
          </div>

          {/* Holiday list */}
          {Object.keys(holidays||{}).length === 0 ? (
            <div style={{textAlign:'center',padding:'2rem',color:'var(--text-muted)',fontSize:'0.9rem'}}>
              Nema upisanih praznika. Kliknite "+ Dodaj praznik" za unos.
            </div>
          ) : (
            <div className="card" style={{overflowX:'auto'}}>
              <table className="table" style={{width:'100%',fontSize:'0.85rem'}}>
                <thead>
                  <tr>
                    <th style={{padding:'0.5rem 0.75rem'}}>Datum</th>
                    <th style={{padding:'0.5rem 0.75rem'}}>Dan</th>
                    <th style={{padding:'0.5rem 0.75rem'}}>Naziv praznika</th>
                    <th style={{padding:'0.5rem 0.75rem',width:80}}></th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(holidays).sort(([a],[b])=>a.localeCompare(b)).map(([date,name])=>{
                    const d = new Date(date+'T00:00:00');
                    const dayNames = ['Nedjelja','Ponedjeljak','Utorak','Srijeda','Četvrtak','Petak','Subota'];
                    return (
                      <tr key={date}>
                        <td style={{padding:'0.5rem 0.75rem',fontFamily:'var(--mono)'}}>{date}</td>
                        <td style={{padding:'0.5rem 0.75rem'}}>{dayNames[d.getDay()]}</td>
                        <td style={{padding:'0.5rem 0.75rem',fontWeight:600}}>{name}</td>
                        <td style={{padding:'0.5rem 0.75rem',textAlign:'center'}}>
                          <button className="btn btn-sm" onClick={()=>{
                            if(confirm(`Ukloniti praznik "${name}" (${date})?`))
                              setHolidays(h=>{const n={...h};delete n[date];return n;});
                          }} style={{background:'#c53030',color:'white',border:'none',fontSize:'0.72rem'}}>
                            Ukloni
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══════ MJESEČNI VIEW ═══════ */}
      {sihtView === 'mjesecni' && (<>
      {/* LEGENDA */}
      <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',marginBottom:'1rem',alignItems:'center'}}>
        <span style={{fontSize:'0.72rem',color:'var(--text-muted)',fontWeight:700}}>Kategorije:</span>
        {WORKER_CATEGORIES.filter(c=>c.id!=='poslovoda').map(c=>(
          <span key={c.id} style={{display:'inline-flex',alignItems:'center',gap:'0.2rem',fontSize:'0.72rem',background:c.pale,color:c.color,border:`1px solid ${c.border}`,borderRadius:3,padding:'0.15rem 0.5rem',fontWeight:600}}>
            {c.icon} {c.short}
          </span>
        ))}
        <span style={{margin:'0 0.3rem',color:'var(--border)'}}>|</span>
        <span style={{fontSize:'0.72rem',color:'var(--text-muted)',fontWeight:700}}>Odsutnost:</span>
        {Object.entries(ODSUTNOST_COLOR).map(([k,v])=>(
          <span key={k} style={{display:'inline-flex',alignItems:'center',gap:'0.2rem'}}>
            <span style={{fontSize:'0.72rem',background:v.bg,color:v.color,border:`1px solid ${v.border}`,borderRadius:3,padding:'0.1rem 0.4rem',fontFamily:'var(--mono)',fontWeight:700}}>{v.short}</span>
            <span style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>{v.icon} {k}</span>
          </span>
        ))}
        <span style={{fontSize:'0.72rem',background:'#fff3e0',color:'#e65100',border:'1px solid #ffb74d',borderRadius:3,padding:'0.1rem 0.4rem',fontFamily:'var(--mono)',fontWeight:700}}>P</span>
        <span style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>Praznik</span>
        <span style={{fontSize:'0.72rem',background:'#f0ede6',color:'#9e9589',border:'1px solid #d4cfc4',borderRadius:3,padding:'0.1rem 0.4rem',fontFamily:'var(--mono)'}}>—</span>
        <span style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>Vikend</span>
      </div>

      {/* TABLE — desktop */}
      <div className="siht-desktop-table" style={{overflowX:'auto'}}>
        <table style={{borderCollapse:'collapse',fontSize:'0.75rem',minWidth:'max-content',width:'100%'}}>
          <thead>
            <tr>
              <th style={{background:'#f0ede6',padding:'0.5rem 0.75rem',textAlign:'left',border:'1px solid var(--border)',minWidth:160,position:'sticky',left:0,zIndex:2,fontFamily:'var(--mono)',fontSize:'0.65rem',letterSpacing:'0.08em'}}>RADNIK</th>
              {days.map(d => (
                <th key={d} style={{
                  background: isWeekend(d) ? '#ece9e2' : '#f0ede6',
                  padding:'0.3rem 0.2rem', textAlign:'center', border:'1px solid var(--border)',
                  minWidth:28, fontFamily:'var(--mono)', fontSize:'0.65rem',
                  color: isWeekend(d) ? 'var(--text-light)' : 'var(--text-muted)',
                }}>
                  <div>{d}</div>
                  <div style={{fontSize:'0.55rem',opacity:0.7}}>{'NPUSČPS'[dayOfWeek(d)]}</div>
                </th>
              ))}
              <th style={{background:'#f0ede6',padding:'0.3rem 0.5rem',border:'1px solid var(--border)',fontFamily:'var(--mono)',fontSize:'0.6rem',minWidth:36,textAlign:'center'}}>R</th>
              <th style={{background:'#fdf0e0',padding:'0.3rem 0.5rem',border:'1px solid var(--border)',fontFamily:'var(--mono)',fontSize:'0.6rem',minWidth:36,textAlign:'center'}}>GO</th>
              <th style={{background:'#fde8e8',padding:'0.3rem 0.5rem',border:'1px solid var(--border)',fontFamily:'var(--mono)',fontSize:'0.6rem',minWidth:36,textAlign:'center'}}>B</th>
            </tr>
          </thead>
          <tbody>
            {displayWorkers.map(w => {
              const stats = workerStats.find(s => s.id === w.id) || w;
              const cat = getCatById(w.category);
              const catColor = cat?.color || '#2d5a27';
              const catPale  = cat?.pale  || '#e8f0e6';
              const catBorder= cat?.border|| '#9bc492';
              return (
                <tr key={w.id} style={{opacity:w.status==='aktivan'?1:0.5}}>
                  <td style={{
                    padding:'0.35rem 0.6rem',
                    border:`2px solid ${catBorder}`,
                    borderLeft:`4px solid ${catColor}`,
                    fontWeight:600,
                    background: catPale,
                    position:'sticky',left:0,zIndex:1,
                    display:'flex',alignItems:'center',justifyContent:'space-between',gap:'0.3rem',
                  }}>
                    <div style={{display:'flex',alignItems:'center',gap:'0.3rem',minWidth:0,flex:1}}>
                      <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:catColor}}>{w.name}</span>
                    </div>
                    <button
                      onClick={() => { setGoModal({workerId:w.id}); setGoForm({date:isoDate(new Date().getDate()), dateDo:'', type:'Godišnji odmor', note:''}); }}
                      style={{background:catColor,color:'white',border:'none',borderRadius:4,padding:'0.15rem 0.35rem',fontSize:'0.65rem',cursor:'pointer',flexShrink:0,fontWeight:700}}
                      title="Dodaj odsutnost">+GO
                    </button>
                  </td>
                  {days.map(d => {
                    const date = isoDate(d);
                    const entry = workerDayMap[w.id]?.[date];
                    const wknd = isWeekend(d);
                    const hasManual = !!(sihtManual[w.id]?.[date]);
                    let cellBg = wknd ? '#f0ede6' : 'white';
                    let cellBorderColor = wknd ? '#ddd9d0' : '#ece9e2';
                    let cellText = wknd ? <span style={{color:'#ccc8c0',fontSize:'0.55rem'}}>—</span> : null;
                    let title = wknd ? '' : 'Klikni za postavljanje statusa';
                    if (entry?.type === 'rad') {
                      const isPoslovoda = w.category === 'poslovoda_isk' || w.category === 'poslovoda_uzg';
                      const cellLabel = isPoslovoda ? (entry.jobType === 'Kancelarija' ? '8' : 'U') : '8';
                      cellBg = catPale;
                      cellBorderColor = entry.manual ? catColor : catBorder;
                      cellText = <span style={{color:catColor,fontWeight:700,fontSize:'0.65rem',fontFamily:'var(--mono)'}}>{cellLabel}</span>;
                      title = (cat?.short||'Rad') + ' · ' + entry.jobType + (entry.manual ? ' (ručno)' : '');
                    } else if (entry?.type === 'praznik') {
                      cellBg = '#fff3e0';
                      cellBorderColor = '#ffb74d';
                      cellText = <span style={{color:'#e65100',fontWeight:700,fontSize:'0.6rem',fontFamily:'var(--mono)'}}>P</span>;
                      title = 'Praznik: ' + (entry.holidayName||'');
                    } else if (entry?.type === 'odsutnost') {
                      const oc = ODSUTNOST_COLOR[entry.oType] || ODSUTNOST_COLOR['Neplaćeno'];
                      cellBg = oc.bg;
                      cellBorderColor = entry.manual ? oc.color : oc.border;
                      const clickHandler = entry.manual
                        ? () => setManualCell(w.id, date, null)
                        : () => (entry.open ? deleteOpenLeave(w.id, {dateOd:entry.dateOd, type:entry.oType, note:entry.note}) : deleteGodisnji(w.id, date));
                      cellText = (
                        <span style={{color:oc.color,fontWeight:700,fontSize:'0.6rem',fontFamily:'var(--mono)',cursor:'pointer'}}
                          onClick={e=>{e.stopPropagation();clickHandler();}}
                          title={entry.manual ? 'Ručni unos · klikni za brisanje' : (entry.open ? 'Otvoreno od '+entry.dateOd+' · klikni za brisanje' : 'Klikni za brisanje: '+entry.oType)}>
                          {oc.short}
                        </span>
                      );
                      title = entry.oType + (entry.manual ? ' (ručno)' : entry.open ? ' (otvoreno od '+entry.dateOd+')' : '') + (entry.note ? ' — '+entry.note : '');
                    }
                    return (
                      <td key={d} title={title} style={{
                        padding:'0.25rem 0.15rem',
                        border:`1px solid ${cellBorderColor}`,
                        textAlign:'center',
                        background: cellBg,
                        cursor: wknd ? 'default' : 'pointer',
                        outline: hasManual ? `2px solid ${catColor}` : 'none',
                        outlineOffset: -2,
                      }} onClick={wknd ? undefined : (e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setCellPicker({ workerId: w.id, date, x: rect.left, y: rect.bottom });
                      }}>{cellText}</td>
                    );
                  })}
                  <td style={{textAlign:'center',border:`1px solid ${catBorder}`,background:catPale,fontFamily:'var(--mono)',fontWeight:700,color:catColor,padding:'0.25rem 0.4rem'}}>{stats.radnih||0}</td>
                  <td style={{textAlign:'center',border:'1px solid var(--border)',background:'#fdf0e0',fontFamily:'var(--mono)',fontWeight:700,color:'#b5620a',padding:'0.25rem 0.4rem'}}>{(stats.odsutTypes||{})['Godišnji odmor']||0}</td>
                  <td style={{textAlign:'center',border:'1px solid var(--border)',background:'#fde8e8',fontFamily:'var(--mono)',fontWeight:700,color:'#8b2020',padding:'0.25rem 0.4rem'}}>{(stats.odsutTypes||{})['Bolovanje']||0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARD VIEW for Šihtarica */}
      <div className="siht-mobile-cards">
        {displayWorkers.filter(w=>w.status==='aktivan').map(w => {
          const stats = workerStats.find(s => s.id === w.id) || w;
          const cat = getCatById(w.category);
          const catColor = cat?.color || '#2d5a27';
          const catPale  = cat?.pale  || '#e8f0e6';
          const catBorder= cat?.border|| '#9bc492';
          return (
            <div key={w.id} style={{background:'var(--surface)',border:`1px solid ${catBorder}`,borderLeft:`4px solid ${catColor}`,borderRadius:6,marginBottom:'0.4rem',overflow:'hidden'}}>
              {/* Worker name + stats */}
              <div style={{display:'flex',alignItems:'center',gap:'0.3rem',padding:'0.35rem 0.5rem',background:catPale}}>
                <span style={{fontWeight:700,fontSize:'0.8rem',color:catColor,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{w.name}</span>
                <span style={{fontFamily:'var(--mono)',fontSize:'0.65rem',fontWeight:700,color:'white',background:catColor,borderRadius:3,padding:'0.1rem 0.3rem'}}>{stats.radnih||0}R</span>
                {(stats.odsutTypes?.['Godišnji odmor']||0)>0 && <span style={{fontFamily:'var(--mono)',fontSize:'0.6rem',fontWeight:700,color:'white',background:'#1a3d5c',borderRadius:3,padding:'0.1rem 0.25rem'}}>{stats.odsutTypes['Godišnji odmor']}GO</span>}
                {(stats.odsutTypes?.['Bolovanje']||0)>0 && <span style={{fontFamily:'var(--mono)',fontSize:'0.6rem',fontWeight:700,color:'white',background:'#8b2020',borderRadius:3,padding:'0.1rem 0.25rem'}}>{stats.odsutTypes['Bolovanje']}B</span>}
                <button onClick={()=>{setGoModal({workerId:w.id});setGoForm({date:isoDate(new Date().getDate()), dateDo:'', type:'Godišnji odmor',note:''});}}
                  style={{background:catColor,color:'white',border:'none',borderRadius:4,padding:'0.15rem 0.35rem',fontSize:'0.6rem',cursor:'pointer',fontWeight:700}}>+GO</button>
              </div>
              {/* Day cells grid — vivid colored cells */}
              <div style={{padding:'0.25rem 0.35rem 0.3rem',display:'grid',gridTemplateColumns:`repeat(${daysInMonth}, 1fr)`,gap:'1.5px'}}>
                {days.map(d => {
                  const date = isoDate(d);
                  const entry = workerDayMap[w.id]?.[date];
                  const wknd = isWeekend(d);
                  let bg, color, fontW = 400, label = String(d);
                  if (entry?.type === 'rad') {
                    const isPoslovoda = w.category === 'poslovoda_isk' || w.category === 'poslovoda_uzg';
                    label = isPoslovoda ? (entry.jobType === 'Kancelarija' ? '8' : 'U') : '8';
                    bg = catColor; color = 'white'; fontW = 700;
                  } else if (entry?.type === 'praznik') {
                    bg = '#e65100'; color = 'white'; fontW = 700; label = 'P';
                  } else if (entry?.type === 'odsutnost') {
                    const oc = ODSUTNOST_COLOR[entry.oType]||ODSUTNOST_COLOR['Neplaćeno'];
                    bg = oc.color; color = 'white'; fontW = 700; label = oc.short;
                  } else if (wknd) {
                    bg = '#d5d0c8'; color = '#fff';
                  } else {
                    bg = '#e8e4dc'; color = '#a09888';
                  }
                  return (
                    <div key={d} title={`${d}. ${entry?.type==='rad'?(cat?.short||'Rad')+' · '+entry.jobType : entry?.type==='praznik'?'Praznik: '+(entry.holidayName||'') : entry?.oType || (wknd?'vikend':'Klikni za status')}`}
                      style={{
                        height:22, background:bg, borderRadius:2,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:'0.42rem', fontWeight:fontW, fontFamily:'var(--mono)', color,
                        cursor: wknd ? 'default' : 'pointer',
                        outline: sihtManual[w.id]?.[date] ? '1.5px solid '+catColor : 'none',
                        outlineOffset: -1,
                      }}
                      onClick={wknd ? undefined : (e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setCellPicker({ workerId: w.id, date, x: rect.left, y: rect.bottom });
                      }}>
                      {label}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* SUMMARY CARDS */}
      <div style={{marginTop:'1.5rem'}}>
        <div style={{fontFamily:'var(--mono)',fontSize:'0.65rem',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--text-light)',marginBottom:'0.75rem'}}>
          Pregled po radniku — {MONTH_NAMES[selMonth]} {selYear}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(min(200px,100%),1fr))',gap:'0.5rem'}}>
          {displayWorkers.filter(w=>w.status==='aktivan').map(w => {
            const stats = workerStats.find(s=>s.id===w.id)||{radnih:0,odsutnih:0,praznih:0};
            const goUpcoming = (godisnji[w.id]||[]).filter(e => e.date && e.date >= today()).sort((a,b)=>a.date.localeCompare(b.date));
            const openLeaves = (godisnji[w.id]||[]).filter(e => e.open);
            return (
              <div key={w.id} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:6,padding:'0.75rem',boxShadow:'var(--shadow)'}}>
                <div style={{fontWeight:700,fontSize:'0.82rem',marginBottom:'0.4rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{w.name}</div>
                <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',marginBottom:'0.3rem'}}>
                  <span style={{fontFamily:'var(--mono)',fontSize:'0.75rem',background:'#e8f0e6',color:'#2d5a27',border:'1px solid #9bc492',borderRadius:3,padding:'0.1rem 0.4rem'}}>{stats.radnih} rad</span>
                  {(() => {
                    const kv = getKvota(w.id);
                    if (!kv.dana) return null;
                    const goUsed = (godisnji[w.id]||[]).filter(e => e.date && e.type === 'Godišnji odmor' && (!kv.datumOd || e.date >= kv.datumOd)).length;
                    const rem = kv.dana - goUsed;
                    return <span style={{fontFamily:'var(--mono)',fontSize:'0.75rem',borderRadius:3,padding:'0.1rem 0.4rem',fontWeight:700,
                      background: rem < 0 ? '#fde8e8' : rem < 7 ? '#fff3e0' : '#e4edf5',
                      color: rem < 0 ? '#8b2020' : rem < 7 ? '#e65100' : '#1a3d5c',
                      border: `1px solid ${rem < 0 ? '#e0a0a0' : rem < 7 ? '#f0c060' : '#9bbfd9'}`,
                    }}>GO: {rem}/{kv.dana}</span>;
                  })()}
                  {Object.entries(stats.odsutTypes||{}).map(([k,v])=>{
                    const oc = ODSUTNOST_COLOR[k]||{bg:'#f0f0f0',color:'#555',border:'#ccc'};
                    return <span key={k} style={{fontFamily:'var(--mono)',fontSize:'0.75rem',background:oc.bg,color:oc.color,border:`1px solid ${oc.border}`,borderRadius:3,padding:'0.1rem 0.4rem'}}>{v} {k.split(' ')[0].toLowerCase()}</span>;
                  })}
                </div>
                {openLeaves.length > 0 && (
                  <div style={{marginTop:'0.3rem'}}>
                    {openLeaves.map(e=>{
                      const oc = ODSUTNOST_COLOR[e.type]||{bg:'#f0f0f0',color:'#555',border:'#ccc'};
                      return (
                        <div key={e.dateOd+e.type} style={{display:'flex',alignItems:'center',gap:'0.3rem',fontSize:'0.72rem',marginBottom:'0.15rem'}}>
                          <span style={{fontFamily:'var(--mono)',color:oc.color,background:oc.bg,border:`1px solid ${oc.border}`,borderRadius:3,padding:'0.05rem 0.3rem',fontSize:'0.65rem',fontWeight:700}}>{ODSUTNOST_COLOR[e.type]?.short}</span>
                          <span style={{fontFamily:'var(--mono)',color:'#b5620a',fontWeight:600}}>{fmtDate(e.dateOd)} → ?</span>
                          {e.note && <span style={{color:'var(--text-light)',fontStyle:'italic',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.note}</span>}
                          <button onClick={()=>deleteOpenLeave(w.id,e)} style={{marginLeft:'auto',background:'none',border:'none',color:'var(--text-light)',cursor:'pointer',fontSize:'0.7rem',padding:0}}>✕</button>
                        </div>
                      );
                    })}
                  </div>
                )}
                {goUpcoming.length > 0 && (
                  <div style={{marginTop:'0.3rem'}}>
                    {goUpcoming.slice(0,3).map(e=>{
                      const oc = ODSUTNOST_COLOR[e.type]||{bg:'#f0f0f0',color:'#555',border:'#ccc'};
                      return (
                        <div key={e.date} style={{display:'flex',alignItems:'center',gap:'0.3rem',fontSize:'0.72rem',marginBottom:'0.15rem'}}>
                          <span style={{fontFamily:'var(--mono)',color:oc.color,background:oc.bg,border:`1px solid ${oc.border}`,borderRadius:3,padding:'0.05rem 0.3rem',fontSize:'0.65rem',fontWeight:700}}>{ODSUTNOST_COLOR[e.type]?.short}</span>
                          <span style={{fontFamily:'var(--mono)',color:'var(--text-muted)'}}>{fmtDate(e.date)}</span>
                          {e.note && <span style={{color:'var(--text-light)',fontStyle:'italic',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.note}</span>}
                          <button onClick={()=>deleteGodisnji(w.id,e.date)} style={{marginLeft:'auto',background:'none',border:'none',color:'var(--text-light)',cursor:'pointer',fontSize:'0.7rem',padding:0}}>✕</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      </>)}

      {/* ═══════ PO RADNIKU VIEW ═══════ */}
      {sihtView === 'radnik' && (
        !selWorker ? (
          <div className="empty-state">
            <span className="icon">R</span>
            <p>Odaberi radnika iz padajućeg menija iznad.</p>
          </div>
        ) : !singleWorkerData ? (
          <div className="empty-state"><p>Radnik nije pronađen.</p></div>
        ) : (() => {
          const { worker: w, months: wMonths, total: wTotal } = singleWorkerData;
          const cat = getCatById(w.category);
          return (
            <div>
              {/* Worker header */}
              <div style={{display:'flex',alignItems:'center',gap:'0.6rem',marginBottom:'1rem',padding:'0.75rem 1rem',background:cat?.pale||'#f0f0f0',border:`2px solid ${cat?.border||'#ccc'}`,borderLeft:`5px solid ${cat?.color||'#999'}`,borderRadius:6}}>
                <span style={{fontSize:'1.4rem'}}>{cat?.short||'R'}</span>
                <div>
                  <div style={{fontWeight:700,fontSize:'1rem',color:cat?.color||'var(--text)'}}>{w.name}</div>
                  <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{cat?.label} · {selYear}</div>
                </div>
                <div style={{marginLeft:'auto',display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                  <span style={{fontFamily:'var(--mono)',fontSize:'0.82rem',background:'#e8f0e6',color:'#2d5a27',border:'1px solid #9bc492',borderRadius:4,padding:'0.2rem 0.6rem',fontWeight:700}}>{wTotal.radnih} radnih</span>
                  <span style={{fontFamily:'var(--mono)',fontSize:'0.82rem',background:'#fde8e8',color:'#8b2020',border:'1px solid #e0a0a0',borderRadius:4,padding:'0.2rem 0.6rem',fontWeight:700}}>{wTotal.odsutnih} ods.</span>
                  <span style={{fontFamily:'var(--mono)',fontSize:'0.82rem',background:'var(--bg)',color:'var(--text-muted)',border:'1px solid var(--border)',borderRadius:4,padding:'0.2rem 0.6rem'}}>{wTotal.praznih} praznih</span>
                </div>
              </div>

              {/* Monthly tables */}
              {wMonths.map(mo => {
                if (mo.radnih === 0 && mo.odsutnih === 0 && mo.praznih === 0) return null;
                return (
                  <div key={mo.mi} className="card" style={{marginBottom:'0.75rem'}}>
                    <div style={{background:'linear-gradient(135deg,var(--green),var(--green-light))',color:'white',padding:'0.5rem 0.75rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <span style={{fontWeight:700,fontSize:'0.85rem'}}>{MONTH_NAMES[mo.mi]} {selYear}</span>
                      <div style={{display:'flex',gap:'0.4rem'}}>
                        <span style={{fontFamily:'var(--mono)',fontSize:'0.72rem',background:'rgba(255,255,255,0.2)',padding:'0.15rem 0.4rem',borderRadius:10}}>{mo.radnih} R</span>
                        {mo.odsutnih > 0 && <span style={{fontFamily:'var(--mono)',fontSize:'0.72rem',background:'rgba(255,255,255,0.2)',padding:'0.15rem 0.4rem',borderRadius:10}}>{mo.odsutnih} ods</span>}
                      </div>
                    </div>
                    <div className="siht-radnik-desktop" style={{overflowX:'auto'}}>
                      <table style={{borderCollapse:'collapse',fontSize:'0.75rem',width:'100%'}}>
                        <thead>
                          <tr>
                            {mo.days.map(({d,dw,wknd}) => (
                              <th key={d} style={{
                                background:wknd?'#ece9e2':'#f0ede6',padding:'0.25rem 0.15rem',textAlign:'center',
                                border:'1px solid var(--border)',minWidth:26,fontFamily:'var(--mono)',fontSize:'0.62rem',
                                color:wknd?'var(--text-light)':'var(--text-muted)',
                              }}>
                                <div>{d}</div>
                                <div style={{fontSize:'0.5rem',opacity:0.7}}>{'NPUSČPS'[dw]}</div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            {mo.days.map(({d,iso,wknd,entry}) => {
                              let bg = wknd ? '#f0ede6' : 'white';
                              let content = wknd ? <span style={{color:'#ccc8c0',fontSize:'0.5rem'}}>—</span> : null;
                              let border = wknd ? '#ddd9d0' : '#ece9e2';
                              if (entry?.type==='rad') {
                                const isPoslovoda = singleWorkerData.category === 'poslovoda_isk' || singleWorkerData.category === 'poslovoda_uzg';
                                const cellLabel = isPoslovoda ? (entry.jobType === 'Kancelarija' ? '8' : 'U') : '8';
                                bg = cat?.pale||'#e8f0e6';
                                border = cat?.border||'#9bc492';
                                content = <span style={{color:cat?.color||'#2d5a27',fontWeight:700,fontSize:'0.6rem',fontFamily:'var(--mono)'}}>{cellLabel}</span>;
                              } else if (entry?.type==='praznik') {
                                bg = '#fff3e0'; border = '#ffb74d';
                                content = <span style={{color:'#e65100',fontWeight:700,fontSize:'0.58rem',fontFamily:'var(--mono)'}}>P</span>;
                              } else if (entry?.type==='odsutnost') {
                                const oc = ODSUTNOST_COLOR[entry.oType]||ODSUTNOST_COLOR['Neplaćeno'];
                                bg = oc.bg; border = oc.border;
                                content = <span style={{color:oc.color,fontWeight:700,fontSize:'0.58rem',fontFamily:'var(--mono)'}}>{oc.short}</span>;
                              }
                              return <td key={d} title={entry?.type==='rad'?entry.jobType:entry?.type==='praznik'?'Praznik: '+(entry.holidayName||''):entry?.oType||''} style={{padding:'0.2rem 0.1rem',border:`1px solid ${border}`,textAlign:'center',background:bg}}>{content}</td>;
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {/* MOBILE heatmap for radnik detail */}
                    <div className="siht-radnik-mobile" style={{padding:'0.25rem 0.4rem 0.3rem',display:'grid',gridTemplateColumns:`repeat(${mo.days.length}, 1fr)`,gap:'1.5px'}}>
                      {mo.days.map(({d,iso,wknd,entry}) => {
                        let bg, color, label = String(d), fontW = 400;
                        if (entry?.type==='rad') { const isPoslovoda = singleWorkerData.category === 'poslovoda_isk' || singleWorkerData.category === 'poslovoda_uzg'; label = isPoslovoda ? (entry.jobType === 'Kancelarija' ? '8' : 'U') : '8'; bg = cat?.color||'#2d5a27'; color = 'white'; fontW = 700; }
                        else if (entry?.type==='praznik') { bg = '#e65100'; color = 'white'; fontW = 700; label = 'P'; }
                        else if (entry?.type==='odsutnost') { const oc = ODSUTNOST_COLOR[entry.oType]||ODSUTNOST_COLOR['Neplaćeno']; bg = oc.color; color = 'white'; fontW = 700; label = oc.short; }
                        else if (wknd) { bg = '#d5d0c8'; color = '#fff'; }
                        else { bg = '#e8e4dc'; color = '#a09888'; }
                        return <div key={d} style={{height:22,background:bg,borderRadius:2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.42rem',fontWeight:fontW,fontFamily:'var(--mono)',color}}>{label}</div>;
                      })}
                    </div>
                    {/* Month detail */}
                    <div style={{padding:'0.4rem 0.75rem',display:'flex',gap:'0.4rem',flexWrap:'wrap',borderTop:'1px solid var(--border)',fontSize:'0.72rem'}}>
                      <span style={{fontFamily:'var(--mono)',background:'#e8f0e6',color:'#2d5a27',border:'1px solid #9bc492',borderRadius:3,padding:'0.1rem 0.4rem',fontWeight:700}}>{mo.radnih} rad</span>
                      {Object.entries(mo.odsutTypes||{}).map(([k,v])=>{
                        const oc=ODSUTNOST_COLOR[k]||{bg:'#f0f0f0',color:'#555',border:'#ccc',short:'?'};
                        return <span key={k} style={{fontFamily:'var(--mono)',background:oc.bg,color:oc.color,border:`1px solid ${oc.border}`,borderRadius:3,padding:'0.1rem 0.4rem',fontWeight:700}}>{v} {oc.short}</span>;
                      })}
                      {mo.praznih > 0 && <span style={{fontFamily:'var(--mono)',color:'var(--text-light)',padding:'0.1rem 0.4rem'}}>{mo.praznih} praznih</span>}
                      <span style={{fontFamily:'var(--mono)',color:'var(--text-light)',padding:'0.1rem 0.4rem'}}>{mo.vikenda} vik</span>
                    </div>
                  </div>
                );
              })}

              {/* Yearly total */}
              <div className="card" style={{background:'#fafaf8'}}>
                <div style={{padding:'0.75rem 1rem'}}>
                  <div style={{fontFamily:'var(--mono)',fontSize:'0.65rem',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--text-light)',marginBottom:'0.4rem'}}>UKUPNO ZA {selYear}</div>
                  <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                    <span style={{fontFamily:'var(--mono)',fontSize:'0.85rem',background:'#e8f0e6',color:'#2d5a27',border:'1px solid #9bc492',borderRadius:4,padding:'0.2rem 0.6rem',fontWeight:700}}>{wTotal.radnih} radnih dana</span>
                    <span style={{fontFamily:'var(--mono)',fontSize:'0.85rem',background:'#fde8e8',color:'#8b2020',border:'1px solid #e0a0a0',borderRadius:4,padding:'0.2rem 0.6rem',fontWeight:700}}>{wTotal.odsutnih} odsutnih</span>
                    <span style={{fontFamily:'var(--mono)',fontSize:'0.85rem',background:'var(--bg)',color:'var(--text-muted)',border:'1px solid var(--border)',borderRadius:4,padding:'0.2rem 0.6rem'}}>{wTotal.praznih} praznih</span>
                    <span style={{fontFamily:'var(--mono)',fontSize:'0.85rem',background:'var(--bg)',color:'var(--text-muted)',border:'1px solid var(--border)',borderRadius:4,padding:'0.2rem 0.6rem'}}>{wTotal.vikenda} vikend</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()
      )}

      {/* ═══════ GODIŠNJI VIEW ═══════ */}
      {sihtView === 'godisnji' && (
        <div>
          <div className="siht-godisnji-desktop" style={{overflowX:'auto'}}>
            <table style={{borderCollapse:'collapse',fontSize:'0.75rem',width:'100%',minWidth:'max-content'}}>
              <thead>
                <tr>
                  <th style={{background:'#f0ede6',padding:'0.5rem 0.75rem',textAlign:'left',border:'1px solid var(--border)',minWidth:160,position:'sticky',left:0,zIndex:2,fontFamily:'var(--mono)',fontSize:'0.65rem',letterSpacing:'0.08em'}}>RADNIK</th>
                  {MONTH_NAMES.map((mn,i) => (
                    <th key={i} style={{background:'#f0ede6',padding:'0.35rem 0.3rem',textAlign:'center',border:'1px solid var(--border)',fontFamily:'var(--mono)',fontSize:'0.62rem',minWidth:44,cursor:'pointer'}}
                      onClick={()=>{setSelMonth(i);setSihtView('mjesecni')}} title={`Otvori ${mn}`}>
                      {mn.substring(0,3).toUpperCase()}
                    </th>
                  ))}
                  <th style={{background:'var(--green)',color:'white',padding:'0.35rem 0.5rem',border:'1px solid var(--green)',fontFamily:'var(--mono)',fontSize:'0.65rem',textAlign:'center',minWidth:48}}>UKUP</th>
                  <th style={{background:'#e4edf5',color:'#1a3d5c',padding:'0.35rem 0.4rem',border:'1px solid #9bbfd9',fontFamily:'var(--mono)',fontSize:'0.6rem',textAlign:'center',minWidth:52}}>GO</th>
                </tr>
              </thead>
              <tbody>
                {yearlyStats.map(w => {
                  const cat = getCatById(w.category);
                  return (
                    <tr key={w.id}>
                      <td style={{
                        padding:'0.35rem 0.6rem',border:`2px solid ${cat?.border||'#ccc'}`,borderLeft:`4px solid ${cat?.color||'#999'}`,
                        fontWeight:600,background:cat?.pale||'#f0f0f0',position:'sticky',left:0,zIndex:1,
                      }}>
                        <div style={{display:'flex',alignItems:'center',gap:'0.3rem'}}>
                          <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:cat?.color||'var(--text)',cursor:'pointer'}}
                            onClick={()=>{setSelWorker(w.id);setSihtView('radnik')}} title="Otvori detalj">
                            {w.name}
                          </span>
                        </div>
                      </td>
                      {w.months.map((m,mi) => {
                        const hasData = m.radnih > 0 || m.odsutnih > 0;
                        const go = m.odsutTypes?.['Godišnji odmor']||0;
                        const bol = m.odsutTypes?.['Bolovanje']||0;
                        return (
                          <td key={mi} style={{padding:'0.2rem 0.15rem',border:'1px solid var(--border)',textAlign:'center',background:hasData?'white':'#fafaf8',cursor:'pointer'}}
                            onClick={()=>{setSelMonth(mi);setSihtView('mjesecni')}} title={`${MONTH_NAMES[mi]}: ${m.radnih}R ${m.odsutnih}O`}>
                            {hasData ? (
                              <div>
                                <div style={{fontFamily:'var(--mono)',fontWeight:700,fontSize:'0.72rem',color:'var(--green)'}}>{m.radnih}</div>
                                {(go>0||bol>0) && (
                                  <div style={{display:'flex',justifyContent:'center',gap:'0.1rem',marginTop:'0.05rem'}}>
                                    {go>0 && <span style={{fontSize:'0.5rem',fontFamily:'var(--mono)',color:'#1a3d5c',fontWeight:700}}>{go}GO</span>}
                                    {bol>0 && <span style={{fontSize:'0.5rem',fontFamily:'var(--mono)',color:'#8b2020',fontWeight:700}}>{bol}B</span>}
                                  </div>
                                )}
                              </div>
                            ) : <span style={{color:'#ddd',fontSize:'0.6rem'}}>—</span>}
                          </td>
                        );
                      })}
                      <td style={{textAlign:'center',border:'1px solid var(--green)',background:'#e8f0e6',fontFamily:'var(--mono)',fontWeight:700,color:'var(--green)',padding:'0.3rem 0.4rem',fontSize:'0.82rem'}}>
                        {w.total.radnih}
                        {w.total.odsutnih > 0 && <div style={{fontSize:'0.55rem',color:'#8b2020',fontWeight:600}}>{w.total.odsutnih} ods</div>}
                      </td>
                      {/* GO summary */}
                      <td style={{textAlign:'center',border:'1px solid #9bbfd9',fontFamily:'var(--mono)',fontWeight:700,fontSize:'0.72rem',padding:'0.2rem 0.3rem',
                        background: !w.kvota ? '#f8fbff' : w.goRemaining < 0 ? '#fde8e8' : w.goRemaining < 7 ? '#fff3e0' : '#e8f5e9',
                        color: !w.kvota ? '#ccc' : w.goRemaining < 0 ? '#8b2020' : w.goRemaining < 7 ? '#e65100' : '#2e7d32',
                        cursor:'pointer',
                      }} onClick={()=>setSihtView('gokvota')} title="Otvori GO Kvota">
                        {w.kvota ? <>{w.goRemaining}/{w.kvota}</> : '—'}
                        {w.kvota > 0 && w.goRemaining >= 0 && w.goRemaining < 7 && <div style={{fontSize:'0.42rem',fontWeight:600,color:'#e65100'}}>MALO!</div>}
                        {w.kvota > 0 && w.goRemaining < 0 && <div style={{fontSize:'0.42rem',fontWeight:600,color:'#8b2020'}}>PREKORAČENO</div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td style={{background:'var(--green)',color:'white',padding:'0.4rem 0.75rem',fontWeight:700,fontSize:'0.75rem',position:'sticky',left:0,zIndex:2,border:'1px solid var(--green)'}}>UKUPNO</td>
                  {Array.from({length:12},(_,mi) => {
                    const sum = yearlyStats.reduce((a,w) => a+w.months[mi].radnih, 0);
                    return <td key={mi} style={{textAlign:'center',border:'1px solid var(--border)',background:'#f0ede6',fontFamily:'var(--mono)',fontWeight:700,fontSize:'0.72rem',color:'var(--green)',padding:'0.3rem 0.2rem'}}>{sum||'—'}</td>;
                  })}
                  <td style={{textAlign:'center',border:'1px solid var(--green)',background:'var(--green)',color:'white',fontFamily:'var(--mono)',fontWeight:700,fontSize:'0.85rem',padding:'0.3rem 0.4rem'}}>
                    {yearlyStats.reduce((a,w)=>a+w.total.radnih,0)}
                  </td>
                  <td style={{textAlign:'center',border:'1px solid #9bbfd9',background:'#e4edf5',fontFamily:'var(--mono)',fontWeight:700,fontSize:'0.72rem',color:'#1a3d5c',padding:'0.3rem 0.2rem'}}>
                    {yearlyStats.some(w=>w.kvota>0) ? yearlyStats.reduce((a,w)=>a+w.goRemaining,0)+'/'+yearlyStats.reduce((a,w)=>a+w.kvota,0) : '—'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* MOBILE CARD LAYOUT for Godišnji */}
          <div className="siht-godisnji-mobile">
            {yearlyStats.map(w => {
              const cat = getCatById(w.category);
              return (
                <div key={w.id} style={{background:'var(--surface)',border:`1px solid ${cat?.border||'#ccc'}`,borderLeft:`4px solid ${cat?.color||'#999'}`,borderRadius:6,marginBottom:'0.4rem',overflow:'hidden'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.3rem',padding:'0.35rem 0.5rem',background:cat?.pale||'#f0f0f0'}}>
                    <span onClick={()=>{setSelWorker(w.id);setSihtView('radnik')}} style={{fontWeight:700,fontSize:'0.78rem',color:cat?.color||'var(--text)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',cursor:'pointer'}}>{w.name}</span>
                    <span style={{fontFamily:'var(--mono)',fontSize:'0.62rem',fontWeight:700,color:'white',background:'var(--green)',borderRadius:3,padding:'0.1rem 0.25rem'}}>{w.total.radnih}R</span>
                    {w.total.odsutnih>0 && <span style={{fontFamily:'var(--mono)',fontSize:'0.58rem',fontWeight:700,color:'white',background:'#8b2020',borderRadius:3,padding:'0.1rem 0.2rem'}}>{w.total.odsutnih}O</span>}
                    {w.kvota > 0 && (
                      <span style={{fontFamily:'var(--mono)',fontSize:'0.58rem',fontWeight:700,borderRadius:3,padding:'0.1rem 0.25rem',
                        background: w.goRemaining < 0 ? '#fde8e8' : w.goRemaining < 7 ? '#fff3e0' : '#e4edf5',
                        color: w.goRemaining < 0 ? '#8b2020' : w.goRemaining < 7 ? '#e65100' : '#1a3d5c',
                      }}>GO: {w.goRemaining}/{w.kvota}</span>
                    )}
                  </div>
                  <div style={{padding:'0.2rem 0.35rem 0.25rem',display:'grid',gridTemplateColumns:'repeat(12, 1fr)',gap:'2px'}}>
                    {w.months.map((m,mi) => {
                      const hasData = m.radnih>0 || m.odsutnih>0;
                      return (
                        <div key={mi} onClick={()=>{setSelMonth(mi);setSihtView('mjesecni')}}
                          style={{textAlign:'center',padding:'0.15rem 0',borderRadius:2,cursor:'pointer',
                            background:hasData ? (m.odsutnih>0?'#fde8e8':'#e8f0e6') : '#f0ede6',
                            border:`1px solid ${hasData?(m.odsutnih>0?'#e0a0a0':'#9bc492'):'transparent'}`,
                          }}>
                          <div style={{fontFamily:'var(--mono)',fontSize:'0.4rem',color:'var(--text-light)',lineHeight:1}}>{MONTH_NAMES[mi].substring(0,3)}</div>
                          {hasData ? (
                            <div style={{fontFamily:'var(--mono)',fontSize:'0.55rem',fontWeight:700,color:'var(--green)',lineHeight:1.2}}>{m.radnih}</div>
                          ) : (
                            <div style={{fontSize:'0.45rem',color:'#ccc',lineHeight:1.2}}>—</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ═══════ GO KVOTA VIEW ═══════ */}
      {sihtView === 'gokvota' && (
        <div>
          <div style={{marginBottom:'1rem'}}>
            <h3 style={{fontSize:'0.95rem',fontWeight:700,color:'var(--text)',marginBottom:'0.3rem'}}>Broj dana godišnjeg odmora po ugovoru</h3>
            <p style={{fontSize:'0.78rem',color:'var(--text-muted)',margin:0}}>Unesite broj dana GO i datum od kojeg se računa za svakog radnika.</p>
          </div>
          <div style={{display:'grid',gap:'0.4rem'}}>
            {sortedWorkers.filter(w => w.status === 'aktivan').map(w => {
              const kv = getKvota(w.id);
              const goUsed = (godisnji[w.id]||[]).filter(e => e.date && e.type === 'Godišnji odmor' && (!kv.datumOd || e.date >= kv.datumOd)).length;
              const rem = kv.dana - goUsed;
              const cat = getCatById(w.category);
              return (
                <div key={w.id} style={{display:'flex',alignItems:'center',gap:'0.6rem',padding:'0.5rem 0.75rem',
                  background:'var(--surface)',border:`1px solid ${cat?.border||'var(--border)'}`,borderLeft:`4px solid ${cat?.color||'#999'}`,
                  borderRadius:6,flexWrap:'wrap',
                }}>
                  {/* Ime radnika */}
                  <div style={{minWidth:160,flex:'1 1 160px',display:'flex',alignItems:'center',gap:'0.3rem'}}>
                    <span style={{fontWeight:700,fontSize:'0.82rem',color:cat?.color||'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{w.name}</span>
                  </div>

                  {/* Broj dana */}
                  <div style={{display:'flex',alignItems:'center',gap:'0.3rem'}}>
                    <label style={{fontSize:'0.72rem',color:'var(--text-muted)',whiteSpace:'nowrap'}}>Dana GO:</label>
                    <input type="number" min="0" max="60" value={kv.dana||''} placeholder="0"
                      onChange={e => setWorkerKvota(w.id, parseInt(e.target.value)||0, kv.datumOd||'')}
                      style={{width:50,textAlign:'center',border:'1px solid #c0d4e8',borderRadius:4,padding:'0.3rem',fontSize:'0.82rem',fontFamily:'var(--mono)',fontWeight:700,color:'#1a3d5c',background:'white'}} />
                  </div>

                  {/* Datum od */}
                  <div style={{display:'flex',alignItems:'center',gap:'0.3rem'}}>
                    <label style={{fontSize:'0.72rem',color:'var(--text-muted)',whiteSpace:'nowrap'}}>Od datuma:</label>
                    <input type="date" value={kv.datumOd||''}
                      onChange={e => setWorkerKvota(w.id, kv.dana||0, e.target.value)}
                      style={{border:'1px solid #c0d4e8',borderRadius:4,padding:'0.3rem 0.4rem',fontSize:'0.78rem',fontFamily:'var(--mono)',color:'#1a3d5c',background:'white'}} />
                  </div>

                  {/* Status badge */}
                  {kv.dana > 0 ? (
                    <div style={{display:'flex',alignItems:'center',gap:'0.3rem',marginLeft:'auto'}}>
                      <span style={{fontFamily:'var(--mono)',fontSize:'0.75rem',fontWeight:700,borderRadius:4,padding:'0.2rem 0.5rem',
                        background: rem < 0 ? '#fde8e8' : rem < 7 ? '#fff3e0' : '#e4edf5',
                        color: rem < 0 ? '#8b2020' : rem < 7 ? '#e65100' : '#1a3d5c',
                        border: `1px solid ${rem < 0 ? '#e0a0a0' : rem < 7 ? '#f0c060' : '#9bbfd9'}`,
                      }}>
                        {rem}/{kv.dana} preostalo
                      </span>
                      {goUsed > 0 && <span style={{fontSize:'0.68rem',color:'var(--text-muted)',fontFamily:'var(--mono)'}}>({goUsed} iskorišteno)</span>}
                      {rem >= 0 && rem < 7 && <span style={{fontSize:'0.7rem',color:'#e65100',fontWeight:600}}>Malo!</span>}
                      {rem < 0 && <span style={{fontSize:'0.7rem',color:'#8b2020',fontWeight:600}}>Prekoračeno!</span>}
                    </div>
                  ) : (
                    <span style={{fontSize:'0.72rem',color:'var(--text-light)',fontStyle:'italic',marginLeft:'auto'}}>Nije postavljeno</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CELL PICKER — odabir statusa dana */}
      {cellPicker && (() => {
        const pickerWorker = workers.find(w => w.id === cellPicker.workerId);
        const cat = getCatById(pickerWorker?.category);
        const catColor = cat?.color || '#2d5a27';
        const existing = workerDayMap[cellPicker.workerId]?.[cellPicker.date];
        const hasManual = !!(sihtManual[cellPicker.workerId]?.[cellPicker.date]);
        const RADNI = [
          { type: 'Teren',      label: '🌲 Teren',       bg: catColor,   color: 'white' },
          { type: 'Kancelarija',label: '🏢 Kancelarija', bg: '#4a7a8a',  color: 'white' },
        ];
        const ODSUTNI = ODSUTNOST_TYPES.map(t => ({
          type: t,
          label: `${ODSUTNOST_COLOR[t].icon} ${t}`,
          ...ODSUTNOST_COLOR[t],
        }));
        // Position picker: clamp to viewport
        const pickerW = 210;
        const pickerX = Math.min(cellPicker.x, window.innerWidth - pickerW - 8);
        const pickerY = cellPicker.y + 4;
        return (
          <div style={{position:'fixed',inset:0,zIndex:3000}} onClick={()=>setCellPicker(null)}>
            <div style={{
              position:'fixed', left: pickerX, top: pickerY,
              width: pickerW, background:'white', borderRadius:8,
              boxShadow:'0 4px 24px rgba(0,0,0,0.22)', border:'1px solid var(--border)',
              overflow:'hidden', zIndex:3001,
            }} onClick={e=>e.stopPropagation()}>
              {/* Header */}
              <div style={{background:catColor,color:'white',padding:'0.4rem 0.75rem',fontSize:'0.75rem',fontWeight:700,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span>{pickerWorker?.name} · {cellPicker.date.slice(8)}.{cellPicker.date.slice(5,7)}.</span>
                <button onClick={()=>setCellPicker(null)} style={{background:'none',border:'none',color:'white',cursor:'pointer',fontSize:'1rem',lineHeight:1,padding:0}}>✕</button>
              </div>
              {/* Radni dan */}
              <div style={{padding:'0.3rem 0.5rem 0.1rem',fontSize:'0.6rem',fontWeight:700,color:'var(--text-muted)',letterSpacing:'0.08em',textTransform:'uppercase'}}>Radni dan</div>
              {RADNI.map(opt => (
                <button key={opt.type} onClick={()=>setManualCell(cellPicker.workerId, cellPicker.date, opt.type)}
                  style={{
                    display:'block',width:'100%',textAlign:'left',padding:'0.35rem 0.75rem',
                    border:'none',cursor:'pointer',fontSize:'0.82rem',
                    background: existing?.type==='rad' && existing?.jobType===opt.type ? opt.bg : 'white',
                    color: existing?.type==='rad' && existing?.jobType===opt.type ? opt.color : 'var(--text)',
                    fontWeight: existing?.type==='rad' && existing?.jobType===opt.type ? 700 : 400,
                  }}>
                  {opt.label}
                </button>
              ))}
              {/* Odsutnost */}
              <div style={{padding:'0.3rem 0.5rem 0.1rem',fontSize:'0.6rem',fontWeight:700,color:'var(--text-muted)',letterSpacing:'0.08em',textTransform:'uppercase',borderTop:'1px solid var(--border)',marginTop:'0.15rem'}}>Odsutnost</div>
              {ODSUTNI.map(opt => (
                <button key={opt.type} onClick={()=>setManualCell(cellPicker.workerId, cellPicker.date, opt.type)}
                  style={{
                    display:'block',width:'100%',textAlign:'left',padding:'0.35rem 0.75rem',
                    border:'none',cursor:'pointer',fontSize:'0.82rem',
                    background: existing?.type==='odsutnost' && existing?.oType===opt.type ? opt.bg : 'white',
                    color: existing?.type==='odsutnost' && existing?.oType===opt.type ? opt.color : 'var(--text)',
                    fontWeight: existing?.type==='odsutnost' && existing?.oType===opt.type ? 700 : 400,
                  }}>
                  {opt.label}
                </button>
              ))}
              {/* Briši */}
              {(hasManual || existing) && (
                <>
                  <div style={{borderTop:'1px solid var(--border)',margin:'0.1rem 0'}} />
                  <button onClick={()=>setManualCell(cellPicker.workerId, cellPicker.date, null)}
                    style={{display:'block',width:'100%',textAlign:'left',padding:'0.35rem 0.75rem',border:'none',cursor:'pointer',fontSize:'0.82rem',color:'var(--red)',background:'white'}}>
                    🗑️ Ukloni ručni unos
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* MODAL — dodaj odsutnost */}
      {goModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setGoModal(null)}>
          <div className="modal" style={{maxWidth:400}}>
            <div className="modal-header">
              <span>GO</span>
              <div className="modal-title">
                Dodaj odsutnost — {workers.find(w=>w.id===goModal.workerId)?.name}
              </div>
              <button className="btn btn-ghost btn-icon" onClick={()=>setGoModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {(() => {
                const wId = goModal.workerId;
                const kv = getKvota(wId);
                const goUsed = (godisnji[wId]||[]).filter(e => e.date && e.type === 'Godišnji odmor' && (!kv.datumOd || e.date >= kv.datumOd)).length;
                const goRemaining = kv.dana - goUsed;
                return kv.dana > 0 ? (
                  <div style={{marginBottom:'0.6rem',padding:'0.4rem 0.6rem',borderRadius:6,
                    background: goRemaining < 0 ? '#fde8e8' : goRemaining < 7 ? '#fff3e0' : '#e4edf5',
                    border: `1px solid ${goRemaining < 0 ? '#e0a0a0' : goRemaining < 7 ? '#f0c060' : '#9bbfd9'}`,
                  }}>
                    <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                      <span style={{fontSize:'0.8rem',fontWeight:700,fontFamily:'var(--mono)',color:'#1a3d5c'}}>GO</span>
                      <span style={{fontFamily:'var(--mono)',fontSize:'0.78rem',fontWeight:700,color: goRemaining < 0 ? '#8b2020' : goRemaining < 7 ? '#e65100' : '#1a3d5c'}}>
                        GO: {goRemaining}/{kv.dana} preostalo
                      </span>
                      {goRemaining < 7 && goRemaining >= 0 && <span style={{fontSize:'0.7rem',color:'#e65100',fontWeight:600,marginLeft:'auto'}}>Malo preostalo!</span>}
                      {goRemaining < 0 && <span style={{fontSize:'0.7rem',color:'#8b2020',fontWeight:600,marginLeft:'auto'}}>Prekoračeno!</span>}
                    </div>
                    {kv.datumOd && <div style={{fontSize:'0.65rem',color:'var(--text-muted)',marginTop:'0.15rem',fontFamily:'var(--mono)'}}>Računa se od: {fmtDate(kv.datumOd)}</div>}
                  </div>
                ) : (
                  <div style={{display:'flex',alignItems:'center',gap:'0.4rem',marginBottom:'0.6rem',padding:'0.3rem 0.6rem',borderRadius:6,background:'#f8f8f6',border:'1px solid var(--border)'}}>
                    <span style={{fontSize:'0.72rem',color:'var(--text-light)'}}>GO kvota nije postavljena —</span>
                    <button onClick={()=>{const v=prompt('Unesite broj dana GO po ugovoru:');if(v)setWorkerKvota(wId,parseInt(v)||0,new Date().toISOString().slice(0,10));}}
                      style={{fontSize:'0.7rem',color:'#1a3d5c',background:'#e4edf5',border:'1px solid #9bbfd9',borderRadius:4,padding:'0.15rem 0.4rem',cursor:'pointer',fontWeight:600}}>Postavi</button>
                  </div>
                );
              })()}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem'}}>
                <div className="form-group">
                  <label className="form-label">Od *</label>
                  <input type="date" className="form-input" value={goForm.date} onChange={e=>setGoForm(f=>({...f,date:e.target.value, dateDo: f.dateDo && f.dateDo < e.target.value ? e.target.value : f.dateDo}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Do <span style={{color:'var(--text-light)',fontWeight:400}}>(opciono)</span></label>
                  <input type="date" className="form-input" value={goForm.dateDo} min={goForm.date||undefined} onChange={e=>setGoForm(f=>({...f,dateDo:e.target.value}))} />
                </div>
              </div>
              {goForm.date && !goForm.dateDo && (
                <div style={{fontSize:'0.75rem',color:'#b5620a',marginTop:'-0.3rem',marginBottom:'0.3rem',fontStyle:'italic'}}>Bez krajnjeg datuma — odsutnost ostaje otvorena dok se ne zaključi</div>
              )}
              {goForm.date && goForm.dateDo && goForm.dateDo >= goForm.date && (() => {
                const s = new Date(goForm.date), e = new Date(goForm.dateDo);
                let count = 0;
                for (let d = new Date(s); d <= e; d.setDate(d.getDate()+1)) { const dw=d.getDay(); if(dw!==0&&dw!==6) count++; }
                return <div style={{fontSize:'0.75rem',color:'var(--text-muted)',marginTop:'-0.3rem',marginBottom:'0.3rem'}}>{count} radni{count===1?'':count<5?'a':'h'} dan{count===1?'':count<5?'a':'a'} u periodu</div>;
              })()}
              <div className="form-group">
                <label className="form-label">Vrsta odsutnosti</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.4rem'}}>
                  {ODSUTNOST_TYPES.map(t => {
                    const oc = ODSUTNOST_COLOR[t];
                    return (
                      <button key={t} type="button"
                        onClick={()=>setGoForm(f=>({...f,type:t}))}
                        style={{
                          padding:'0.5rem 0.6rem',border:`2px solid ${goForm.type===t?oc.color:oc.border}`,
                          borderRadius:6,background:goForm.type===t?oc.bg:'var(--bg)',
                          color:goForm.type===t?oc.color:'var(--text-muted)',
                          fontWeight:goForm.type===t?700:400,fontSize:'0.8rem',cursor:'pointer',
                          display:'flex',alignItems:'center',gap:'0.4rem',
                        }}>
                        <span style={{fontFamily:'var(--mono)',fontWeight:700,fontSize:'0.7rem',background:oc.bg,color:oc.color,border:`1px solid ${oc.border}`,borderRadius:3,padding:'0.05rem 0.3rem'}}>{oc.short}</span>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Napomena</label>
                <input className="form-input" placeholder="npr. najava za prekosutra..." value={goForm.note} onChange={e=>setGoForm(f=>({...f,note:e.target.value}))} />
              </div>
              {/* Open-ended leaves for this worker */}
              {(godisnji[goModal.workerId]||[]).filter(e=>e.open).length > 0 && (
                <div style={{background:'#fef3e0',border:'1px solid #f0c060',borderRadius:6,padding:'0.6rem 0.75rem',marginBottom:'0.5rem'}}>
                  <div style={{fontFamily:'var(--mono)',fontSize:'0.62rem',letterSpacing:'0.08em',textTransform:'uppercase',color:'#b5620a',marginBottom:'0.4rem'}}>Otvorene odsutnosti</div>
                  {(godisnji[goModal.workerId]||[]).filter(e=>e.open).map(e=>{
                    const oc = ODSUTNOST_COLOR[e.type]||{bg:'#f0f0f0',color:'#555',border:'#ccc',short:'?'};
                    const isClosing = closingLeave && closingLeave.entry.dateOd === e.dateOd && closingLeave.entry.type === e.type;
                    return (
                      <div key={e.dateOd+e.type} style={{marginBottom:'0.3rem'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'0.4rem',fontSize:'0.78rem'}}>
                          <span style={{fontFamily:'var(--mono)',color:oc.color,background:oc.bg,border:`1px solid ${oc.border}`,borderRadius:3,padding:'0.05rem 0.3rem',fontSize:'0.65rem',fontWeight:700}}>{oc.short}</span>
                          <span style={{fontFamily:'var(--mono)',fontWeight:600}}>{fmtDate(e.dateOd)}</span>
                          <span style={{color:'#b5620a',fontWeight:600}}>→ ?</span>
                          <span style={{color:'var(--text-muted)'}}>{e.type}</span>
                          {e.note && <span style={{color:'var(--text-light)',fontStyle:'italic'}}>{e.note}</span>}
                          <button onClick={()=>{setClosingLeave({wId:goModal.workerId,entry:e});setCloseDateDo('');}} style={{marginLeft:'auto',background:'#fff',border:'1px solid #f0c060',color:'#b5620a',cursor:'pointer',fontSize:'0.65rem',borderRadius:4,padding:'0.15rem 0.4rem',fontWeight:600}}>Zaključi</button>
                          <button onClick={()=>deleteOpenLeave(goModal.workerId,e)} style={{background:'none',border:'none',color:'var(--red)',cursor:'pointer',fontSize:'0.8rem'}}>✕</button>
                        </div>
                        {isClosing && (
                          <div style={{display:'flex',alignItems:'center',gap:'0.4rem',marginTop:'0.3rem',padding:'0.3rem 0.5rem',background:'#fff',borderRadius:4,border:'1px solid #f0c060'}}>
                            <label style={{fontSize:'0.72rem',color:'var(--text-muted)',whiteSpace:'nowrap'}}>Do:</label>
                            <input type="date" className="form-input" value={closeDateDo} min={e.dateOd}
                              onChange={ev=>setCloseDateDo(ev.target.value)}
                              style={{fontSize:'0.75rem',padding:'0.2rem 0.4rem',flex:1}} />
                            <button disabled={!closeDateDo} onClick={()=>{closeOpenLeave(goModal.workerId,e,closeDateDo);setClosingLeave(null);}}
                              style={{background:'#2e7d32',color:'#fff',border:'none',borderRadius:4,padding:'0.2rem 0.5rem',fontSize:'0.7rem',fontWeight:600,cursor:closeDateDo?'pointer':'default',opacity:closeDateDo?1:0.5}}>OK</button>
                            <button onClick={()=>setClosingLeave(null)} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:'0.75rem'}}>✕</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Upcoming for this worker (regular date entries) */}
              {(godisnji[goModal.workerId]||[]).filter(e=>e.date && e.date>=today()).length > 0 && (
                <div style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:6,padding:'0.6rem 0.75rem'}}>
                  <div style={{fontFamily:'var(--mono)',fontSize:'0.62rem',letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--text-light)',marginBottom:'0.4rem'}}>Planirane odsutnosti</div>
                  {(godisnji[goModal.workerId]||[]).filter(e=>e.date && e.date>=today()).sort((a,b)=>a.date.localeCompare(b.date)).map(e=>{
                    const oc = ODSUTNOST_COLOR[e.type]||{bg:'#f0f0f0',color:'#555',border:'#ccc',short:'?'};
                    return (
                      <div key={e.date} style={{display:'flex',alignItems:'center',gap:'0.4rem',fontSize:'0.78rem',marginBottom:'0.2rem'}}>
                        <span style={{fontFamily:'var(--mono)',color:oc.color,background:oc.bg,border:`1px solid ${oc.border}`,borderRadius:3,padding:'0.05rem 0.3rem',fontSize:'0.65rem',fontWeight:700}}>{oc.short}</span>
                        <span style={{fontFamily:'var(--mono)',fontWeight:600}}>{fmtDate(e.date)}</span>
                        <span style={{color:'var(--text-muted)'}}>{e.type}</span>
                        {e.note && <span style={{color:'var(--text-light)',fontStyle:'italic'}}>{e.note}</span>}
                        <button onClick={()=>deleteGodisnji(goModal.workerId,e.date)} style={{marginLeft:'auto',background:'none',border:'none',color:'var(--red)',cursor:'pointer',fontSize:'0.8rem'}}>✕</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={()=>setGoModal(null)}>Odustani</button>
              <button className="btn btn-primary" onClick={saveGodisnji}>Sačuvaj</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
