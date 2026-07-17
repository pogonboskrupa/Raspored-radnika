// ─── MAPA ODJELA — React wrapper ────────────────────────────────────────────
// Kontejneri i modal ovdje SAMO drže DOM čvorove sa istim id-jevima koje
// 18-karta-odjela.jsx (neizmijenjen vanilla modul, preuzet iz pogonboskrupa/sumarija)
// očekuje i puni imperativno (getElementById + innerHTML/style). Zato JSX ovih čvorova
// namjerno nema dinamičkog React sadržaja/state-a — spriječava da React na sljedećem
// re-renderu "vrati" ono što je vanilla skripta upisala (Leaflet panes, modal HTML...).
function MapaOdjelaView({ active }) {
  useEffect(() => {
    if (active && typeof window.initKartaOdjela === 'function') {
      window.initKartaOdjela(false);
    }
  }, [active]);

  return (
    <div id="karta-odjela-content">
      <style>{`
        #karta-odjela-map { width:100%; height:calc(100vh - 260px); min-height:400px; background:#f1f5f9; }
        @media (max-width:1024px) { #karta-odjela-map { height:calc(100vh - 240px); min-height:320px; } }
        @media (max-width:640px)  { #karta-odjela-map { height:calc(100vh - 270px); min-height:260px; } }

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

      <div style={{ padding: '1rem 1rem 0' }}>
        <div className="section-header" style={{ marginBottom: '0.75rem' }}>
          <div className="section-title">🗺️ Mapa odjela {PLAN_YEAR_LABEL}</div>
          <span className="tag">Prostorni prikaz odjela po statusu realizacije plana sječe</span>
          <button className="btn btn-primary btn-sm no-print" style={{ marginLeft: 'auto' }}
            onClick={() => window.initKartaOdjela && window.initKartaOdjela(true)}>🔄 Osvježi</button>
        </div>

        {/* Filter traka */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 10, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px' }}>
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

const PLAN_YEAR_LABEL = 2026;
