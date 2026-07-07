// ─── RASPORED KAMIONA (dnevna otprema) ─────────────────────────────────────────
function fallbackCopyToClipboard(text, onDone, onFail) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    onDone();
  } catch (e) {
    onFail();
  }
  document.body.removeChild(ta);
}

function RasporedKamionaView({ truckRows, setTruckRows }) {
  const dispData = useDispozicijeData();
  const dispozicije = dispData.dispozicije || [];
  const otpreme = dispData.otpreme || [];

  const [selectedDate, setSelectedDate] = useState(nextWorkingDay());

  const dayRows = useMemo(() => truckRows.filter(r => r.date === selectedDate), [truckRows, selectedDate]);

  const kupci = useMemo(() =>
    [...new Set(dispozicije.map(d => d.kupac).filter(Boolean))].sort(),
    [dispozicije]);

  const odjeliList = useMemo(() => {
    const used = truckRows.map(r => r.odjel).filter(Boolean);
    return [...new Set([...GOSPODARSKE_JEDINICE, ...used])].sort();
  }, [truckRows]);

  // Najstarija dispozicija ODABRANOG kupca sa pozitivnim stanjem za odabrani sortiment
  const findDispForKupac = (kupac, sortiment) => {
    if (!kupac || !sortiment) return null;
    const candidates = dispozicije
      .filter(d => d.kupac === kupac)
      .map(d => ({ disp: d, bal: getDispBalance(d, otpreme)[sortiment] }))
      .filter(x => x.bal > 0)
      .sort((a, b) => (a.disp.datum || '').localeCompare(b.disp.datum || ''));
    return candidates[0] || null;
  };

  // Auto-prijedlog: najstarija dispozicija BILO KOJEG kupca sa stanjem >= 20m³ za sortiment
  const findAutoSuggestion = (sortiment) => {
    if (!sortiment) return null;
    const candidates = dispozicije
      .map(d => ({ disp: d, bal: getDispBalance(d, otpreme)[sortiment] }))
      .filter(x => x.bal >= 20)
      .sort((a, b) => (a.disp.datum || '').localeCompare(b.disp.datum || ''));
    return candidates[0] || null;
  };

  const addRow = () => {
    setTruckRows(prev => [...prev, { id: uid(), date: selectedDate, odjel: '', sortiment: '', kupac: '', createdAt: Date.now() }]);
  };
  const updateRow = (id, patch) => setTruckRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  const deleteRow = (id) => { if (confirm('Obrisati ovaj red?')) setTruckRows(prev => prev.filter(r => r.id !== id)); };

  const groupByOdjel = (rows) => {
    const grouped = {};
    rows.forEach(r => {
      const key = r.odjel || '—';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    });
    return grouped;
  };

  const handlePrint = () => {
    const byOdjel = groupByOdjel(dayRows);
    let html = `<html><head><meta charset="UTF-8"/><title>Raspored kamiona ${fmtDate(selectedDate)}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      @page{size:A4 landscape;margin:10mm}
      body{font-family:Arial,sans-serif;font-size:11pt;padding:8mm;color:#222}
      h1{font-size:16pt;margin-bottom:2mm;text-align:center}
      .subtitle{font-size:11pt;text-align:center;color:#555;margin-bottom:6mm}
      table{border-collapse:collapse;width:100%}
      th{background:#e8f0e6;border:1px solid #999;padding:1.5mm 3mm;text-align:left;font-size:9pt;font-weight:700}
      td{border:1px solid #bbb;padding:1.5mm 3mm;font-size:9.5pt;vertical-align:top}
      .warn{color:#8b2020;font-style:italic}
      .ok{color:#2d5a27;font-weight:700}
      .low{color:#8b2020;font-weight:700}
    </style></head><body>`;
    html += `<h1>RASPORED KAMIONA — ${fmtDate(selectedDate)}</h1>`;
    html += `<div class="subtitle">Šumarija Bosanska Krupa</div>`;
    html += `<table><thead><tr>
      <th style="width:16%">Odjel</th><th style="width:12%">Sortiment</th><th style="width:18%">Kupac</th>
      <th style="width:14%">Ugovor</th><th style="width:14%">Broj dispozicije</th><th style="width:13%">Stanje dispozicije</th><th style="width:13%">Datum dispozicije</th>
    </tr></thead><tbody>`;
    Object.entries(byOdjel).forEach(([odjel, rows]) => {
      rows.forEach((r, i) => {
        const found = findDispForKupac(r.kupac, r.sortiment);
        html += `<tr>`;
        if (i === 0) html += `<td rowspan="${rows.length}"><strong>${odjel}</strong></td>`;
        html += `<td>${SORTIMENT_LABELS[r.sortiment] || '—'}</td>`;
        html += `<td>${r.kupac || '—'}</td>`;
        html += `<td>${found ? (found.disp.ugovor || '—') : '—'}</td>`;
        html += `<td>${found ? (found.disp.broj || '—') : '—'}</td>`;
        html += found
          ? `<td class="${found.bal < 20 ? 'low' : 'ok'}">${found.bal.toFixed(2)} m³</td>`
          : `<td class="warn">⚠ Nema dispozicije sa stanjem!</td>`;
        html += `<td>${found ? fmtDate(found.disp.datum) : '—'}</td>`;
        html += `</tr>`;
      });
    });
    html += `</tbody></table></body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.onload = () => { win.print(); };
  };

  const handleCopyMessage = () => {
    const byOdjel = groupByOdjel(dayRows);
    let text = `🚚 RASPORED KAMIONA – ${fmtDate(selectedDate)}\n`;
    Object.entries(byOdjel).forEach(([odjel, rows]) => {
      text += `\n📍 ${odjel}\n`;
      rows.forEach((r, i) => {
        const found = findDispForKupac(r.kupac, r.sortiment);
        text += `${i + 1}. ${SORTIMENT_LABELS[r.sortiment] || '—'} – ${r.kupac || '—'}\n`;
        text += found
          ? `   Disp: ${found.disp.broj} od ${fmtDate(found.disp.datum)} · Ugovor: ${found.disp.ugovor || '—'} · Stanje: ${found.bal.toFixed(2)} m³\n`
          : `   ⚠ Nema dispozicije sa stanjem!\n`;
      });
    });

    const onDone = () => showToast('Kopirano u međuspremnik!', 'success');
    const onFail = () => showToast('Kopiranje nije uspjelo.', 'error');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onDone).catch(() => fallbackCopyToClipboard(text, onDone, onFail));
    } else {
      fallbackCopyToClipboard(text, onDone, onFail);
    }
  };

  return (
    <div>
      <div className="date-bar">
        <div>
          <div className="date-label">DATUM RASPOREDA</div>
          <input type="date" className="date-input" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm no-print" onClick={handleCopyMessage}>📋 Kopiraj za poruku</button>
          <button className="btn btn-secondary btn-sm no-print" onClick={handlePrint}>🖨️ Štampaj za poslovođe</button>
          <button className="btn btn-primary btn-sm no-print" onClick={addRow}>+ Dodaj kamion</button>
        </div>
      </div>

      {!dispData.ready && (
        <div className="alert alert-warning">⚡ Povezivanje sa sistemom dispozicija u toku — stanja i auto-prijedlozi će se pojaviti čim se učitaju.</div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="card-title">🚚 Raspored kamiona — {fmtDate(selectedDate)}</div>
          <span className="tag">{dayRows.length} kamiona</span>
        </div>
        <div className="card-body" style={{ padding: dayRows.length === 0 ? undefined : 0 }}>
          {dayRows.length === 0 ? (
            <div className="empty-state">
              <span className="icon">🚚</span>
              <p>Nema kamiona rasporeda za ovaj dan.</p>
              <button className="btn btn-primary btn-sm" onClick={addRow}>+ Dodaj kamion</button>
            </div>
          ) : (
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Odjel</th>
                  <th>Sortiment</th>
                  <th>Kupac (dogovoreni)</th>
                  <th>Dispozicija</th>
                  <th>Auto-prijedlog</th>
                  <th className="no-print">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {dayRows.map(r => {
                  const found = findDispForKupac(r.kupac, r.sortiment);
                  const suggestion = findAutoSuggestion(r.sortiment);
                  return (
                    <tr key={r.id}>
                      <td data-label="Odjel">
                        <input className="form-input" list="odjel-list-kamioni" value={r.odjel}
                          placeholder="npr. RISOVAC KRUPA 54"
                          onChange={e => updateRow(r.id, { odjel: e.target.value })} />
                      </td>
                      <td data-label="Sortiment">
                        <select className="form-select" value={r.sortiment} onChange={e => updateRow(r.id, { sortiment: e.target.value })}>
                          <option value="">— odaberi —</option>
                          {SORTIMENT_FIELDS.map(f => <option key={f} value={f}>{SORTIMENT_LABELS[f]}</option>)}
                        </select>
                      </td>
                      <td data-label="Kupac">
                        <select className="form-select" value={r.kupac} onChange={e => updateRow(r.id, { kupac: e.target.value })}>
                          <option value="">— odaberi kupca —</option>
                          {kupci.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                      </td>
                      <td data-label="Dispozicija">
                        {!r.kupac || !r.sortiment ? <span style={{ color: 'var(--text-light)' }}>—</span> :
                          found ? (
                            <div style={{ fontSize: '0.8rem' }}>
                              <div><strong>{found.disp.broj}</strong> · {found.disp.ugovor || '—'}</div>
                              <div style={{ fontWeight: 700, color: found.bal < 20 ? 'var(--red)' : 'var(--green)' }}>{found.bal.toFixed(2)} m³</div>
                              <div style={{ color: 'var(--text-muted)' }}>{fmtDate(found.disp.datum)}</div>
                            </div>
                          ) : <span style={{ color: 'var(--red)', fontSize: '0.78rem', fontWeight: 600 }}>⚠ Nema dispozicije sa stanjem!</span>
                        }
                      </td>
                      <td data-label="Auto-prijedlog">
                        {!r.sortiment ? <span style={{ color: 'var(--text-light)' }}>—</span> :
                          suggestion ? (
                            <div style={{ fontSize: '0.8rem' }}>
                              <div style={{ fontWeight: 600 }}>{suggestion.disp.kupac}</div>
                              <div>{suggestion.disp.broj} · <span style={{ color: 'var(--green)', fontWeight: 700 }}>{suggestion.bal.toFixed(2)} m³</span></div>
                              <div style={{ color: 'var(--text-muted)' }}>{fmtDate(suggestion.disp.datum)}</div>
                            </div>
                          ) : <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>Nema prijedloga</span>
                        }
                      </td>
                      <td data-label="Akcije" className="no-print">
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => deleteRow(r.id)}>🗑️</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <datalist id="odjel-list-kamioni">
        {odjeliList.map(o => <option key={o} value={o} />)}
      </datalist>
    </div>
  );
}
