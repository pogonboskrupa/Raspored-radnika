// ─── MAPA ODJELA — React wrapper ────────────────────────────────────────────
// Kontejneri i modal ovdje SAMO drže DOM čvorove sa istim id-jevima koje
// 18-karta-odjela.jsx (neizmijenjen vanilla modul, preuzet iz pogonboskrupa/sumarija)
// očekuje i puni imperativno (getElementById + innerHTML/style). Zato JSX ovih čvorova
// namjerno nema dinamičkog React sadržaja/state-a — spriječava da React na sljedećem
// re-renderu "vrati" ono što je vanilla skripta upisala (Leaflet panes, modal HTML...).
function MapaOdjelaView({ active, schedules, departments, workers, vehicles }) {
  useEffect(() => {
    if (active && typeof window.initKartaOdjela === 'function') {
      window.initKartaOdjela(false);
    }
  }, [active]);

  // ── Raspored vozača (integracija sa glavnim Rasporedom radnika) ──
  // NIJE vezano za "Raspored kamiona" — ti kamioni su kupčevi i kreću sa svoje
  // lokacije, ne od Šumarije. Ovdje se gleda ko od VLASTITIH vozača je raspoređen
  // na koji odjel tog dana. VAŽNO: vozač NIJE član row.allWorkers (kao ostali
  // radnici) — vezan je za VOZILO dodijeljeno redu (row.vehicleIds/vehicleId →
  // vehicle.driverId), a row.otherDriverId je samo DNEVNI izuzetak kad tim
  // vozilom danas vozi neko drugi (isto kao što ScheduleView prikazuje 🧑‍✈️/🔄
  // ikonom u koloni "Vozilo"). Zato se ovdje mora ići preko vozila, ne allWorkers.
  // Rute/highlight ostaju imperativni (Leaflet, u 20-mapaVozacOverlay.jsx) — samo
  // rezultat (lista za prikaz) se drži u React state-u da se lijepo renderuje.
  const [vozilaDate, setVozilaDate] = useState(today());
  const [vozilaResult, setVozilaResult] = useState(null);
  const [vozilaLoading, setVozilaLoading] = useState(false);

  // Grupiši schedules za dati dan po odjelu — samo redovi koji stvarno imaju
  // vozača (preko dodijeljenog vozila → vehicle.driverId, ili otherDriverId ako
  // je neko drugi vozio tog dana; dodatno i category==='vozac' u allWorkers kao
  // odbrambeni fallback za slučaj da je negdje ipak direktno upisan).
  const buildVozacGroups = (dateStr) => {
    const dayRows = (schedules || []).filter(s => s.date === dateStr && s.deptId);
    const groups = new Map(); // deptId → { label, drivers:Set, jobTypes:Set }
    dayRows.forEach(s => {
      const dept = (departments || []).find(d => d.id === s.deptId);
      if (!dept) return;
      const driverIds = (s.allWorkers || []).filter(wid => {
        const w = (workers || []).find(x => x.id === wid);
        return w && w.category === 'vozac';
      });
      const vIds = (s.vehicleIds && s.vehicleIds.length > 0) ? s.vehicleIds : (s.vehicleId ? [s.vehicleId] : []);
      vIds.forEach(vid => {
        const v = (vehicles || []).find(x => x.id === vid);
        const driverId = s.otherDriverId || (v && v.driverId);
        if (driverId) driverIds.push(driverId);
      });
      if (!driverIds.length) return;
      if (!groups.has(s.deptId)) {
        groups.set(s.deptId, {
          key: s.deptId,
          label: `${dept.gospodarskaJedinica} ${dept.brojOdjela}`,
          drivers: new Set(),
          jobTypes: new Set(),
        });
      }
      const grp = groups.get(s.deptId);
      driverIds.forEach(id => { const w = (workers || []).find(x => x.id === id); grp.drivers.add(w ? w.name : id); });
      grp.jobTypes.add(s.jobType);
    });
    return [...groups.values()].map(g => ({ key: g.key, label: g.label, drivers: [...g.drivers], jobTypes: [...g.jobTypes] }));
  };

  const handlePrikaziRute = async () => {
    if (typeof window.showMapaVozacRute !== 'function') return;
    setVozilaLoading(true);
    setVozilaResult(null);
    try {
      const groups = buildVozacGroups(vozilaDate);
      const res = await window.showMapaVozacRute(groups);
      setVozilaResult(res);
    } catch (e) {
      setVozilaResult({ matched: [], unmatched: [], error: e.message });
    } finally {
      setVozilaLoading(false);
    }
  };
  const handleClearRute = () => {
    if (typeof window.clearMapaVozacRute === 'function') window.clearMapaVozacRute();
    setVozilaResult(null);
  };

  return (
    <div id="karta-odjela-content">
      <style>{`
        #karta-odjela-map { width:100%; height:calc(100vh - 210px); min-height:400px; background:#f1f5f9; }
        @media (max-width:1024px) { #karta-odjela-map { height:calc(100vh - 190px); min-height:320px; } }
        @media (max-width:640px)  { #karta-odjela-map { height:calc(100vh - 220px); min-height:260px; } }

        body.mapa-fokus .app-header { padding:4px 16px !important; min-height:0 !important; }
        body.mapa-fokus .app-header .app-title { display:none !important; }
        body.mapa-fokus .nav-tabs { display:none !important; }
        body.mapa-fokus #karta-odjela-map { height:calc(100vh - 60px) !important; }
        body.mapa-fokus #mapa-modal { top:6px !important; }
        @media (max-width:640px) {
          body.mapa-fokus #karta-odjela-map { height:calc(100vh - 70px) !important; }
        }
        #karta-fokus-btn.active { background:#1e40af !important; color:white !important; border-color:#1e40af !important; }
        @media (min-width:1024px) {
          #mapa-modal { justify-content:flex-start; align-items:stretch; }
          #mapa-modal-panel { width:400px; max-width:400px; min-height:unset; max-height:calc(100vh - 44px); border-radius:0 0 12px 0; }
        }
        @media (min-width:1440px) {
          #mapa-modal-panel { width:460px; max-width:460px; }
        }

        .karta-tooltip { background:white; border:1px solid #d1d5db; border-radius:5px; padding:2px 6px; font-weight:800; color:#1e293b; box-shadow:0 2px 6px rgba(0,0,0,.2); white-space:nowrap; transition:font-size .15s; }
        .karta-tooltip::before { display:none; }
        .karta-tooltip-slucajni { background:#7c3aed; border-color:#6d28d9; color:white; }
        .leaflet-marker-icon.karta-tooltip { background:white; border:1px solid #d1d5db; }
        .leaflet-marker-icon.karta-tooltip-slucajni { background:#7c3aed; border-color:#6d28d9; color:white; }
      `}</style>

      <div style={{ padding: '0.5rem 1rem 0' }}>
        {/* Filter traka */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 10, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px' }}>
          <button className="btn btn-primary btn-sm no-print"
            onClick={() => window.initKartaOdjela && window.initKartaOdjela(true)}>🔄 Osvježi</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>GJ:</label>
            <select id="karta-filter-gj" onChange={() => window.applyKartaFilter && window.applyKartaFilter()} style={{ fontSize: 12, padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: 6, background: 'white' }}>
              <option value="sve">Sve GJ</option>
              <option value="Risovac Krupa">Risovac Krupa</option>
              <option value="Grmeč Jasenica">Grmeč Jasenica</option>
              <option value="Vojskova">Vojskova</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Status:</label>
            <select id="karta-filter-status" onChange={() => window.applyKartaFilter && window.applyKartaFilter()} style={{ fontSize: 12, padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: 6, background: 'white' }}>
              <option value="sve">Svi statusi</option>
              <option value="plan-2027">Plan 2027</option>
              <option value="planirano">Planirano</option>
              <option value="u-sjeci">U sječi</option>
              <option value="posjeceno">Posječeno</option>
              <option value="bez-plana">Bez plana</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input id="karta-search" type="text" placeholder="Broj odjela..."
              onInput={() => window.searchKartaOdjel && window.searchKartaOdjel()}
              style={{ fontSize: 12, padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: 6, width: 110 }} />
            <button type="button" onClick={() => window.searchKartaOdjel && window.searchKartaOdjel()}
              style={{ fontSize: 12, padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: 6, background: 'white', cursor: 'pointer' }}>🔍</button>
            <button type="button" onClick={() => window.clearKartaSearch && window.clearKartaSearch()}
              style={{ fontSize: 12, padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: 6, background: 'white', cursor: 'pointer' }}>✕</button>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer', background: 'white', border: '1px solid #d1d5db', borderRadius: 6, padding: '4px 10px' }}>
            <input id="karta-otprema-toggle" type="checkbox" onChange={() => window.applyKartaFilter && window.applyKartaFilter()} style={{ cursor: 'pointer', margin: 0 }} />
            🚛 Prikaz otpreme
          </label>
          <span id="karta-otprema-info" style={{ fontSize: 11, color: '#b45309', fontWeight: 700, display: 'none' }}></span>
          <button id="karta-sat-btn" type="button" onClick={() => window.toggleMapaSat && window.toggleMapaSat()}
            style={{ fontSize: 12, padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: 6, background: 'white', cursor: 'pointer' }}>🛰️ Satelit</button>
          <button id="karta-odjel-ruta-btn" type="button" onClick={() => window.toggleOdjelRutaMode && window.toggleOdjelRutaMode()}
            style={{ fontSize: 12, padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: 6, background: 'white', cursor: 'pointer' }}>🔀 Ruta odjel→odjel</button>
          <button type="button" onClick={() => window.resetKartaView && window.resetKartaView()}
            style={{ fontSize: 12, padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: 6, background: 'white', cursor: 'pointer' }}>↺ Reset</button>
          <button id="karta-fokus-btn" type="button" title="Mapa u prvom planu" onClick={() => window.toggleMapaFokus && window.toggleMapaFokus()}
            style={{ fontSize: 12, padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: 6, background: 'white', cursor: 'pointer' }}>⛶ Fokus</button>
          {/* Legenda */}
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ display: 'inline-block', width: 12, height: 12, background: '#2563eb', borderRadius: 2 }} />Plan sječa 2027</span>
            <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ display: 'inline-block', width: 12, height: 12, background: '#eab308', borderRadius: 2 }} />Planirano</span>
            <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ display: 'inline-block', width: 12, height: 12, background: '#dc2626', borderRadius: 2 }} />U sječi</span>
            <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ display: 'inline-block', width: 12, height: 12, background: '#16a34a', borderRadius: 2 }} />Posječeno</span>
            <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ display: 'inline-block', width: 12, height: 12, background: '#7c3aed', borderRadius: 2 }} />Slučajni</span>
            <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ display: 'inline-block', width: 12, height: 12, background: '#0891b2', borderRadius: 2 }} />Nekategorisan</span>
          </div>
        </div>

        {/* Hint za ruta-mode */}
        <div id="mapa-ruta-hint" style={{ display: 'none', padding: '8px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 13, color: '#dc2626', fontWeight: 600, marginBottom: 8 }}></div>

        {/* Raspored vozača — integracija sa glavnim Rasporedom radnika (ne "Raspored kamiona") */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 10, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '10px 14px' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#9a3412' }}>🚗 Raspored vozača:</span>
          <input type="date" value={vozilaDate} onChange={e => setVozilaDate(e.target.value)}
            style={{ fontSize: 12, padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: 6 }} />
          <button type="button" onClick={handlePrikaziRute} disabled={vozilaLoading}
            style={{ fontSize: 12, padding: '4px 10px', border: '1px solid #ea580c', borderRadius: 6, background: vozilaLoading ? '#fed7aa' : '#ea580c', color: 'white', cursor: vozilaLoading ? 'default' : 'pointer', fontWeight: 600 }}>
            {vozilaLoading ? '⏳ Računam rute...' : '🛣️ Prikaži rute za dan'}
          </button>
          {vozilaResult && (
            <button type="button" onClick={handleClearRute}
              style={{ fontSize: 12, padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: 6, background: 'white', cursor: 'pointer' }}>✕ Očisti rute</button>
          )}
          <button type="button" title="Izračunate rute (Šumarija→odjel) se pamte lokalno da se ne pogađa OSRM server svaki put — ovo briše taj keš, npr. ako se promijeni putna mreža."
            onClick={() => { if (window.clearMapaRutaCache) window.clearMapaRutaCache(); }}
            style={{ fontSize: 12, padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: 6, background: 'white', cursor: 'pointer', color: '#6b7280', marginLeft: 'auto' }}>🗑️ Obriši keš ruta</button>
          {vozilaResult && !vozilaResult.error && vozilaResult.matched.length === 0 && vozilaResult.unmatched.length === 0 && (
            <span style={{ fontSize: 12, color: '#9a3412' }}>Nema zakazanih vozača za {vozilaDate.split('-').reverse().join('.')}.</span>
          )}
          {vozilaResult && vozilaResult.error && (
            <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>{vozilaResult.error}</span>
          )}
        </div>

        {vozilaResult && (vozilaResult.matched.length > 0 || vozilaResult.unmatched.length > 0) && (
          <div style={{ marginBottom: 10, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '10px 14px' }}>
            {vozilaResult.matched.length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>
                  {vozilaResult.matched.length} {vozilaResult.matched.length === 1 ? 'odjel' : 'odjela'} sa vozačem
                  {(() => {
                    const total = vozilaResult.matched.reduce((s, m) => s + (m.distKm || 0), 0);
                    return total > 0 ? ` — ukupno ${total.toFixed(1)} km (jednosmjerno, po odjelu)` : '';
                  })()}
                  {(() => {
                    const cachedCount = vozilaResult.matched.filter(m => m.cached).length;
                    return cachedCount > 0 ? ` · ${cachedCount} iz keša` : '';
                  })()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {vozilaResult.matched.map((m, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 12.5, flexWrap: 'wrap' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: m.color, flexShrink: 0, display: 'inline-block' }} />
                      <strong>{m.odjel}</strong>
                      <span style={{ color: '#6b7280' }}>
                        {m.drivers.join(', ')}{m.jobTypes && m.jobTypes.length ? ` (${m.jobTypes.join(', ')})` : ''}
                      </span>
                      {m.distKm != null
                        ? <span style={{ fontWeight: 700, color: '#9a3412', marginLeft: 'auto' }}>
                            {m.distKm.toFixed(1)} km · ~{m.durMin} min
                            {m.cached && <span style={{ fontWeight: 500, color: '#9ca3af', marginLeft: 4 }}>(keš)</span>}
                          </span>
                        : <span style={{ color: '#dc2626', marginLeft: 'auto' }}>Ruta nije uspjela{m.error ? ` (${m.error})` : ''}</span>}
                    </div>
                  ))}
                </div>
              </>
            )}
            {vozilaResult.unmatched.length > 0 && (
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: vozilaResult.matched.length > 0 ? 8 : 0 }}>
                ⚠️ Nije pronađeno na mapi (provjeriti odjel/GJ u Odjelima): {vozilaResult.unmatched.join(', ')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Leaflet mapa */}
      <div id="karta-odjela-map">
        <div id="karta-loading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280', fontSize: 14 }}>⏳ Učitavam kartu...</div>
      </div>
      {/* Ruta info */}
      <div id="mapa-ruta-info" style={{ display: 'none', margin: '8px 20px', padding: '10px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, fontSize: 13, color: '#1e40af' }}></div>

      {/* Detalji odjela — modal */}
      <div id="mapa-modal" style={{ display: 'none', position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,.5)', alignItems: 'flex-start', justifyContent: 'center', padding: 0 }}>
        <div id="mapa-modal-panel" style={{ background: 'white', borderRadius: '0 0 18px 18px', width: '100%', maxWidth: 640, minHeight: '40vh', maxHeight: 'calc(100vh - 44px)', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 40px rgba(0,0,0,.25)', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg,#14532d 0%,#166534 100%)', color: 'white', padding: '8px 14px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div id="mapa-modal-title" style={{ fontSize: 17, fontWeight: 800 }}></div>
              <div id="mapa-modal-gj" style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}></div>
              <div id="mapa-modal-meta" style={{ display: 'none', flexDirection: 'column', gap: 3, marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,.25)' }}></div>
            </div>
            <button type="button" onClick={() => window.closeMapaModal && window.closeMapaModal()}
              style={{ background: 'rgba(255,255,255,.2)', border: 'none', color: 'white', width: 28, height: 28, borderRadius: 7, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 8 }}>✕</button>
          </div>
          <div id="mapa-modal-body" style={{ padding: '12px 14px 16px', overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' }}></div>
          <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', padding: '8px 0', cursor: 'pointer' }} onClick={() => window.closeMapaModal && window.closeMapaModal()}>
            <div style={{ width: 40, height: 4, background: '#d1d5db', borderRadius: 2 }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
