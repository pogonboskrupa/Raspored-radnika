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

// Odjel se piše lokalno dok korisnik kuca; u globalni raspored (koji odmah
// premješta red u novu grupu po odjelu) upisuje se tek na blur/Enter — inače
// bi svaki taster premjestio red u drugu tabelu i input bi izgubio fokus.
function OdjelInput({ value, onCommit }) {
  const [local, setLocal] = useState(value);
  useEffect(() => { setLocal(value); }, [value]);
  return (
    <input className="form-input" list="odjel-list-kamioni" value={local}
      placeholder="npr. RISOVAC KRUPA 54"
      onChange={e => setLocal(e.target.value)}
      onBlur={() => { if (local !== value) onCommit(local); }}
      onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }} />
  );
}

// Ključ za mapu otpremača po odjelu — [datum, odjelKey] kao JSON string (stabilan, bez kolizija na separatoru)
const otpremaciKey = (date, odjelKey) => JSON.stringify([date, odjelKey]);

// Normalizovano poređenje imena kupca — ručni unos ("asim komerc ") mora naći
// dispoziciju kupca "ASIM KOMERC" iz DISPOZICIJE sistema.
const normKupac = s => (s || '').trim().toUpperCase();

// Escape za slobodan tekst (odjel, kupac) koji se ubacuje u print HTML
const escHtml = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Prijedlog kupca za red: rangirana lista + dropdown svih kupaca, ili ručni unos
// za kupca koji još ne postoji u DISPOZICIJE sistemu (dispozicija stiže naknadno).
function PrijedlogCell({ row, suggestions, kupci, onSetKupac }) {
  const [manualMode, setManualMode] = useState(false);
  const [manualText, setManualText] = useState('');

  if (!row.sortiment) return <span style={{ color: 'var(--text-light)' }}>—</span>;

  if (row.kupac) {
    return (
      <select className="form-select" value={row.kupac} onChange={e => onSetKupac(e.target.value)}
        style={{ fontWeight: 700, color: 'var(--green)', borderColor: 'var(--green)' }}>
        <option value="">— ukloni odabir —</option>
        {!kupci.some(k => normKupac(k) === normKupac(row.kupac)) && <option value={row.kupac}>{row.kupac} (bez dispozicije)</option>}
        {kupci.map(k => <option key={k} value={k}>{k}</option>)}
      </select>
    );
  }

  if (manualMode) {
    const commit = () => {
      if (!manualText.trim()) return;
      // Velika slova — imena kupaca u DISPOZICIJE sistemu su velikim slovima,
      // pa naknadno uplaćena dispozicija odmah matchira ovaj unos.
      onSetKupac(manualText.trim().toUpperCase());
      setManualMode(false);
      setManualText('');
    };
    return (
      <div style={{ display: 'flex', gap: '0.3rem' }}>
        <input className="form-input" autoFocus value={manualText} placeholder="Ime kupca..."
          onChange={e => setManualText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setManualMode(false); setManualText(''); } }} />
        <button type="button" className="btn btn-primary btn-sm no-print" onClick={commit}>✓</button>
        <button type="button" className="btn btn-ghost btn-sm no-print" onClick={() => { setManualMode(false); setManualText(''); }}>✕</button>
      </div>
    );
  }

  return (
    <div>
      {suggestions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', maxHeight: 170, overflowY: 'auto', marginBottom: '0.35rem' }}>
          {suggestions.map((s, idx) => (
            <button key={s.disp.id || s.disp.kupac} type="button"
              onClick={() => onSetKupac(s.disp.kupac)}
              className="btn btn-ghost btn-sm no-print"
              title="Klikni da odabereš ovog kupca"
              style={{
                justifyContent: 'flex-start', textAlign: 'left', padding: '0.15rem 0.4rem',
                fontWeight: 500, background: 'transparent', color: 'var(--text)',
                fontSize: '0.74rem', lineHeight: 1.35, whiteSpace: 'normal', height: 'auto',
              }}>
              <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-light)', marginRight: 4 }}>{idx + 1}.</span>
              <strong>{s.disp.kupac}</strong> — <span style={{ color: balanceColor(s.bal), fontWeight: 700 }}>{s.bal.toFixed(2)} m³</span> <span style={{ color: 'var(--text-muted)' }}>({fmtDate(s.disp.datum)})</span>
            </button>
          ))}
        </div>
      )}
      <select className="form-select no-print" value=""
        onChange={e => { if (e.target.value) onSetKupac(e.target.value); }}>
        <option value="">{suggestions.length > 0 ? '— ili odaberi bilo kojeg kupca —' : '— odaberi kupca —'}</option>
        {kupci.map(k => <option key={k} value={k}>{k}</option>)}
      </select>
      <button type="button" className="btn btn-ghost btn-sm no-print"
        style={{ marginTop: '0.25rem', fontSize: '0.7rem', padding: '0.15rem 0.4rem', color: 'var(--text-muted)' }}
        onClick={() => setManualMode(true)}>
        ✏️ Dodaj bez dispozicije (novi kupac)
      </button>
    </div>
  );
}

// Boja preostalog stanja dispozicije: jarko crveno <25m³, zeleno >100m³, žuto (amber) između
const BALANCE_LOW_RED = '#ff0000';
function balanceColor(bal) {
  if (bal < 25) return BALANCE_LOW_RED;
  if (bal > 100) return 'var(--green)';
  return 'var(--amber)';
}
const balanceCssClass = bal => (bal < 25 ? 'low' : bal > 100 ? 'ok' : 'mid');

// Zbirni broj kamiona po sortimentu za dati skup redova (za brzi pregled obima posla)
function sortimentSummary(rows) {
  const counts = {};
  rows.forEach(r => { if (r.sortiment) counts[r.sortiment] = (counts[r.sortiment] || 0) + 1; });
  return SORTIMENT_FIELDS.filter(f => counts[f] > 0).map(f => ({ code: f, label: SORTIMENT_LABELS[f], count: counts[f] }));
}

function SortimentSummaryLine({ rows }) {
  if (rows.length === 0) return null;
  const summary = sortimentSummary(rows);
  return (
    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.9rem' }}>
      🧾 Ukupno {rows.length} {rows.length === 1 ? 'kamion' : 'kamiona'} — {summary.map(s => `${s.count} ${s.label}`).join(', ')}
    </div>
  );
}

// ─── STANJE NA DAN — poslovođa prijavi broj kamiona po sortimentu za odjel;
// svaki prijavljeni kamion odmah postaje (nedodijeljen) red u Raspored kamiona ────
function StanjeNaDanPanel({ selectedDate, dayRows, onSubmit, onDeleteRow }) {
  const [odjel, setOdjel] = useState('');
  const [counts, setCounts] = useState({});

  const parseCount = v => Math.max(0, parseInt(v, 10) || 0);
  const totalCount = SORTIMENT_FIELDS.reduce((s, f) => s + parseCount(counts[f]), 0);

  const submit = () => {
    if (!odjel.trim()) { showToast('Unesite odjel!', 'error'); return; }
    if (totalCount === 0) { showToast('Unesite broj kamiona za bar jedan sortiment!', 'error'); return; }
    const trimmed = odjel.trim();
    const existing = dayRows.filter(r => (r.odjel || '').trim() === trimmed).length;
    if (existing > 0) {
      const ok = confirm(`Već postoji ${existing} ${existing === 1 ? 'kamion' : 'kamiona'} prijavljeno za "${trimmed}" danas. Dodati još ${totalCount}?`);
      if (!ok) return;
    }
    const parsedCounts = Object.fromEntries(SORTIMENT_FIELDS.map(f => [f, parseCount(counts[f])]));
    const n = onSubmit(trimmed, parsedCounts);
    showToast(`Prijavljeno ${n} ${n === 1 ? 'kamion' : 'kamiona'} za ${trimmed}!`, 'success');
    setOdjel('');
    setCounts({});
  };

  const grouped = useMemo(() => {
    const order = [];
    const map = {};
    dayRows.forEach(r => {
      const key = (r.odjel || '').trim() || '__BEZ_ODJELA__';
      if (!map[key]) { map[key] = []; order.push(key); }
      map[key].push(r);
    });
    return order.map(key => ({ key, label: key === '__BEZ_ODJELA__' ? 'Bez odjela' : key, rows: map[key] }));
  }, [dayRows]);

  return (
    <div>
      <div className="card">
        <div className="card-header"><div className="card-title">📝 Prijavi stanje za {fmtDate(selectedDate)}</div></div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Odjel *</label>
            <input className="form-input" list="odjel-list-kamioni" value={odjel}
              placeholder="npr. RISOVAC KRUPA 54"
              onChange={e => setOdjel(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.6rem', marginBottom: '0.9rem' }}>
            {SORTIMENT_FIELDS.map(f => (
              <div className="form-group" key={f} style={{ marginBottom: 0 }}>
                <label className="form-label">{SORTIMENT_LABELS[f]}</label>
                <input type="number" min="0" className="form-input" value={counts[f] || ''}
                  placeholder="0"
                  onChange={e => setCounts(c => ({ ...c, [f]: e.target.value }))} />
              </div>
            ))}
          </div>
          <button className="btn btn-primary" onClick={submit}>💾 Prijavi stanje ({totalCount} {totalCount === 1 ? 'kamion' : 'kamiona'})</button>
        </div>
      </div>

      <div className="section-header">
        <div className="section-title">Prijavljeno za {fmtDate(selectedDate)}</div>
        <span className="tag">{dayRows.length} kamiona</span>
      </div>
      <SortimentSummaryLine rows={dayRows} />

      {grouped.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <span className="icon">📝</span>
            <p>Još ništa nije prijavljeno za ovaj dan.</p>
          </div>
        </div>
      ) : (
        grouped.map(g => (
          <div className="card" key={g.key}>
            <div className="dept-header">
              <span>🏕️</span>
              <span className="dept-name">{g.label}</span>
              <span className="dept-count">{g.rows.length} {g.rows.length === 1 ? 'kamion' : 'kamiona'}</span>
            </div>
            <table className="schedule-table">
              <thead><tr><th>Sortiment</th><th>Kupac</th><th className="no-print">Akcije</th></tr></thead>
              <tbody>
                {g.rows.map(r => (
                  <tr key={r.id}>
                    <td data-label="Sortiment">{SORTIMENT_LABELS[r.sortiment] || '—'}</td>
                    <td data-label="Kupac">
                      {r.kupac || <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>nedodijeljen</span>}
                    </td>
                    <td data-label="Akcije" className="no-print">
                      {!r.kupac && (
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => onDeleteRow(r.id)}>🗑️</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}

function RasporedKamionaView({ truckRows, setTruckRows, workers, truckGroupOtpremaci, setTruckGroupOtpremaci, isPoslovodja, currentUser }) {
  const dispData = useDispozicijeData();
  const dispozicije = dispData.dispozicije || [];
  const otpreme = dispData.otpreme || [];

  const otpremaciList = useMemo(() =>
    (workers || [])
      .filter(w => w.category === 'otpremac' && w.status === 'aktivan')
      .sort((a, b) => a.name.localeCompare(b.name)),
    [workers]);
  const wName = id => (workers || []).find(w => w.id === id)?.name || id;

  const [selectedDate, setSelectedDate] = useState(nextWorkingDay());
  const [subTab, setSubTab] = useState(isPoslovodja ? 'stanje' : 'raspored');

  // Ako PWA ostane otvorena preko noći, "sljedeći radni dan" izračunat pri
  // otvaranju zastari. Pri povratku u aplikaciju (fokus/vidljivost) osvježi
  // datum na novi "sljedeći radni dan" — ali samo ako ga korisnik u međuvremenu
  // nije ručno promijenio (eksplicitan flag, ne poređenje vrijednosti — updater
  // funkcije u setState moraju biti čiste, bez sporednih efekata poput mutacije refa).
  const userChangedDateRef = useRef(false);
  useEffect(() => {
    const refreshDate = () => {
      if (userChangedDateRef.current) return;
      setSelectedDate(nextWorkingDay());
    };
    document.addEventListener('visibilitychange', refreshDate);
    window.addEventListener('focus', refreshDate);
    return () => {
      document.removeEventListener('visibilitychange', refreshDate);
      window.removeEventListener('focus', refreshDate);
    };
  }, []);

  const dayRows = useMemo(() => truckRows.filter(r => r.date === selectedDate), [truckRows, selectedDate]);
  const unassignedCount = useMemo(() => dayRows.filter(r => !r.kupac).length, [dayRows]);

  const kupci = useMemo(() =>
    [...new Set(dispozicije.map(d => d.kupac).filter(Boolean))].sort(),
    [dispozicije]);

  // Pamti sve prethodno unesene odjele (bilo kojeg dana) za autocomplete
  const odjeliList = useMemo(() =>
    [...new Set(truckRows.map(r => r.odjel).filter(Boolean))].sort(),
    [truckRows]);

  // Najstarija dispozicija ODABRANOG kupca sa pozitivnim stanjem za odabrani sortiment
  const findDispForKupac = (kupac, sortiment) => {
    if (!kupac || !sortiment) return null;
    const nk = normKupac(kupac);
    const candidates = dispozicije
      .filter(d => normKupac(d.kupac) === nk)
      .map(d => ({ disp: d, bal: getDispBalance(d, otpreme)[sortiment] }))
      .filter(x => x.bal > 0)
      .sort((a, b) => (a.disp.datum || '').localeCompare(b.disp.datum || ''));
    return candidates[0] || null;
  };

  // Auto-prijedlog: do 10 kupaca (jedan po kupcu, najstarija dispozicija) sa stanjem >= 20m³, poredano po starosti
  const findSuggestions = (sortiment) => {
    if (!sortiment) return [];
    const candidates = dispozicije
      .map(d => ({ disp: d, bal: getDispBalance(d, otpreme)[sortiment] }))
      .filter(x => x.bal >= 20)
      .sort((a, b) => (a.disp.datum || '').localeCompare(b.disp.datum || ''));
    const seen = new Set();
    const result = [];
    for (const c of candidates) {
      if (seen.has(c.disp.kupac)) continue;
      seen.add(c.disp.kupac);
      result.push(c);
      if (result.length >= 10) break;
    }
    return result;
  };

  // Vizuelno grupiši redove trenutnog dana po odjelu (isti obrazac kao ScheduleView)
  const groupedDayRows = useMemo(() => {
    const order = [];
    const map = {};
    dayRows.forEach(r => {
      const key = (r.odjel || '').trim() || '__BEZ_ODJELA__';
      if (!map[key]) { map[key] = []; order.push(key); }
      map[key].push(r);
    });
    return order.map(key => ({ key, label: key === '__BEZ_ODJELA__' ? 'Bez odjela' : key, rows: map[key] }));
  }, [dayRows]);

  // Koliko puta je ista KONKRETNA dispozicija već iskorištena za druge kamione istog dana —
  // stanje u DISPOZICIJE sistemu pada tek kad se otprema stvarno evidentira tamo, pa dva
  // kamiona istog dana mogu "vidjeti" isti (još neumanjeni) balans iste dispozicije.
  const dispUsageMap = useMemo(() => {
    const usage = {};
    dayRows.forEach(r => {
      const f = findDispForKupac(r.kupac, r.sortiment);
      if (f) usage[f.disp.id] = (usage[f.disp.id] || 0) + 1;
    });
    return usage;
  }, [dayRows, dispozicije, otpreme]);

  const addOtpremac = (odjelKey, workerId) => {
    const key = otpremaciKey(selectedDate, odjelKey);
    setTruckGroupOtpremaci(prev => ({ ...prev, [key]: [...(prev[key] || []), workerId] }));
  };
  const removeOtpremac = (odjelKey, workerId) => {
    const key = otpremaciKey(selectedDate, odjelKey);
    setTruckGroupOtpremaci(prev => ({ ...prev, [key]: (prev[key] || []).filter(id => id !== workerId) }));
  };

  const addRow = () => {
    setTruckRows(prev => [...prev, { id: uid(), date: selectedDate, odjel: '', sortiment: '', kupac: '', createdAt: Date.now() }]);
  };
  const updateRow = (id, patch) => setTruckRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  const deleteRow = (id) => { if (confirm('Obrisati ovaj red?')) setTruckRows(prev => prev.filter(r => r.id !== id)); };

  // Promjena odjela na redu: ako je to bio zadnji red stare grupe (npr. ispravka
  // tipfelera), dodijeljeni otpremači prate red u novu grupu umjesto da nestanu.
  const commitOdjel = (row, newVal) => {
    const oldKey = (row.odjel || '').trim() || '__BEZ_ODJELA__';
    const newKey = (newVal || '').trim() || '__BEZ_ODJELA__';
    updateRow(row.id, { odjel: newVal });
    if (oldKey === newKey) return;
    const othersInOldGroup = dayRows.some(r => r.id !== row.id && ((r.odjel || '').trim() || '__BEZ_ODJELA__') === oldKey);
    if (othersInOldGroup) return;
    const oldStorageKey = otpremaciKey(selectedDate, oldKey);
    const newStorageKey = otpremaciKey(selectedDate, newKey);
    setTruckGroupOtpremaci(prev => {
      const moving = prev[oldStorageKey] || [];
      if (moving.length === 0) return prev;
      const next = { ...prev, [newStorageKey]: [...new Set([...(prev[newStorageKey] || []), ...moving])] };
      delete next[oldStorageKey];
      return next;
    });
  };

  // Stanje na dan: poslovođa prijavi broj kamiona po sortimentu za odjel —
  // za svaki kamion se odmah kreira nedodijeljen red u Raspored kamiona.
  const addBulkRows = (odjel, counts) => {
    const newRows = [];
    SORTIMENT_FIELDS.forEach(f => {
      const n = counts[f] || 0;
      for (let i = 0; i < n; i++) {
        newRows.push({ id: uid(), date: selectedDate, odjel, sortiment: f, kupac: '', createdAt: Date.now(), reportedBy: currentUser || '' });
      }
    });
    if (newRows.length > 0) setTruckRows(prev => [...prev, ...newRows]);
    return newRows.length;
  };

  // Isti obrazac grupisanja kao groupedDayRows — koristi se za print/kopiraj/podijeli
  const groupByOdjel = (rows) => {
    const order = [];
    const map = {};
    rows.forEach(r => {
      const key = (r.odjel || '').trim() || '__BEZ_ODJELA__';
      if (!map[key]) { map[key] = []; order.push(key); }
      map[key].push(r);
    });
    return order.map(key => ({
      key,
      label: key === '__BEZ_ODJELA__' ? 'Bez odjela' : key,
      rows: map[key],
      otpremaci: (truckGroupOtpremaci[otpremaciKey(selectedDate, key)] || []).map(wName),
    }));
  };

  const handlePrint = () => {
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
      .pending{color:#999;font-style:italic}
      .ok{color:#2d5a27;font-weight:700}
      .mid{color:#b5620a;font-weight:700}
      .low{color:#ff0000;font-weight:700}
    </style></head><body>`;
    html += `<h1>RASPORED KAMIONA — ${fmtDate(selectedDate)}</h1>`;
    html += `<div class="subtitle">Šumarija Bosanska Krupa</div>`;
    html += `<table><thead><tr>
      <th style="width:15%">Odjel</th><th style="width:14%">Otpremač</th><th style="width:11%">Sortiment</th><th style="width:16%">Kupac</th>
      <th style="width:13%">Ugovor</th><th style="width:13%">Broj dispozicije</th><th style="width:9%">Stanje</th><th style="width:9%">Datum disp.</th>
    </tr></thead><tbody>`;
    groupByOdjel(dayRows).forEach(g => {
      g.rows.forEach((r, i) => {
        const found = findDispForKupac(r.kupac, r.sortiment);
        html += `<tr>`;
        if (i === 0) {
          html += `<td rowspan="${g.rows.length}"><strong>${escHtml(g.label)}</strong></td>`;
          html += `<td rowspan="${g.rows.length}">${g.otpremaci.length ? g.otpremaci.map(escHtml).join('<br>') : '—'}</td>`;
        }
        html += `<td>${SORTIMENT_LABELS[r.sortiment] || '—'}</td>`;
        html += `<td>${escHtml(r.kupac) || '—'}</td>`;
        html += `<td>${found ? (escHtml(found.disp.ugovor) || '—') : '—'}</td>`;
        html += `<td>${found ? (escHtml(found.disp.broj) || '—') : '—'}</td>`;
        html += found
          ? `<td class="${balanceCssClass(found.bal)}">${found.bal.toFixed(2)} m³${dispUsageMap[found.disp.id] > 1 ? ` <span class="mid">(dijeli ${dispUsageMap[found.disp.id]}×)</span>` : ''}</td>`
          : r.kupac ? `<td class="pending">u obradi</td>` : `<td>—</td>`;
        html += `<td>${found ? fmtDate(found.disp.datum) : '—'}</td>`;
        html += `</tr>`;
      });
    });
    html += `</tbody></table></body></html>`;
    const win = window.open('', '_blank');
    if (!win) { showToast('Preglednik je blokirao prozor za štampu — dozvolite pop-up prozore za ovu stranicu.', 'error'); return; }
    win.document.write(html);
    win.document.close();
    win.onload = () => { win.print(); };
  };

  const buildMessageText = () => {
    let text = `🚚 RASPORED KAMIONA – ${fmtDate(selectedDate)}\n`;
    groupByOdjel(dayRows).forEach(g => {
      text += `\n📍 ${g.label}\n`;
      if (g.otpremaci.length) text += `👷 Otpremač: ${g.otpremaci.join(', ')}\n`;
      g.rows.forEach((r, i) => {
        const found = findDispForKupac(r.kupac, r.sortiment);
        text += `${i + 1}. ${SORTIMENT_LABELS[r.sortiment] || '—'} – ${r.kupac || '—'}\n`;
        if (found) {
          const shared = dispUsageMap[found.disp.id] > 1 ? ` ⚠ dijeli ${dispUsageMap[found.disp.id]}×` : '';
          text += `   Disp: ${found.disp.broj} od ${fmtDate(found.disp.datum)} · Ugovor: ${found.disp.ugovor || '—'} · Stanje: ${found.bal.toFixed(2)} m³${shared}\n`;
        } else if (r.kupac) {
          text += `   Disp: — (u obradi)\n`;
        }
      });
    });
    return text;
  };

  const handleCopyMessage = () => {
    const text = buildMessageText();
    const onDone = () => showToast('Kopirano u međuspremnik!', 'success');
    const onFail = () => showToast('Kopiranje nije uspjelo.', 'error');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onDone).catch(() => fallbackCopyToClipboard(text, onDone, onFail));
    } else {
      fallbackCopyToClipboard(text, onDone, onFail);
    }
  };

  // Podijeli direktno na Messenger/Viber/WhatsApp — na mobitelu Web Share API otvara
  // sistemski meni sa svim instaliranim aplikacijama; na desktopu (bez podrške) šalje na WhatsApp Web.
  const handleShare = () => {
    const text = buildMessageText();
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      const win = window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      if (!win) showToast('Preglednik je blokirao prozor — dozvolite pop-up prozore ili koristite "Kopiraj za poruku".', 'error');
    }
  };

  return (
    <div>
      <div className="date-bar">
        <div>
          <div className="date-label">DATUM RASPOREDA</div>
          <input type="date" className="date-input" value={selectedDate}
            onChange={e => { userChangedDateRef.current = true; setSelectedDate(e.target.value); }} />
        </div>
        {subTab === 'raspored' && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm no-print" onClick={handleCopyMessage}>📋 Kopiraj za poruku</button>
            <button className="btn btn-secondary btn-sm no-print" onClick={handleShare}>📤 Pošalji (Viber/WhatsApp/Messenger)</button>
            <button className="btn btn-secondary btn-sm no-print" onClick={handlePrint}>🖨️ Štampaj za poslovođe</button>
            {!isPoslovodja && (
              <button className="btn btn-primary btn-sm no-print" onClick={addRow}>+ Dodaj kamion</button>
            )}
          </div>
        )}
      </div>

      <div className="tabs no-print">
        <button className={`tab ${subTab === 'raspored' ? 'active' : ''}`} onClick={() => setSubTab('raspored')}>
          🚚 Raspored kamiona
          {unassignedCount > 0 && <span className="tag" style={{ marginLeft: 6, background: 'var(--amber-pale)', color: 'var(--amber)' }}>{unassignedCount}</span>}
        </button>
        <button className={`tab ${subTab === 'stanje' ? 'active' : ''}`} onClick={() => setSubTab('stanje')}>📝 Stanje na dan</button>
      </div>

      {!dispData.ready && (
        <div className="alert alert-warning">⚡ Povezivanje sa sistemom dispozicija u toku — stanja i auto-prijedlozi će se pojaviti čim se učitaju.</div>
      )}

      {subTab === 'stanje' && (
        <StanjeNaDanPanel selectedDate={selectedDate} dayRows={dayRows} onSubmit={addBulkRows} onDeleteRow={deleteRow} />
      )}

      {subTab === 'raspored' && (
      <div
        ref={el => { if (!el) return; if (isPoslovodja) el.setAttribute('inert', ''); else el.removeAttribute('inert'); }}
        style={isPoslovodja ? { pointerEvents: 'none', opacity: 0.6 } : undefined}>
      <div className="section-header">
        <div className="section-title">🚚 Raspored kamiona — {fmtDate(selectedDate)}</div>
        <span className="tag">{dayRows.length} kamiona</span>
        {unassignedCount > 0 && (
          <span className="tag" style={{ background: 'var(--amber-pale)', color: 'var(--amber)' }}>{unassignedCount} nedodijeljeno</span>
        )}
      </div>
      <SortimentSummaryLine rows={dayRows} />

      {dayRows.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <span className="icon">🚚</span>
            <p>Nema kamiona rasporeda za ovaj dan.</p>
            <button className="btn btn-primary btn-sm" onClick={addRow}>+ Dodaj kamion</button>
          </div>
        </div>
      ) : (
        groupedDayRows.map(g => {
          const metaKey = otpremaciKey(selectedDate, g.key);
          const assignedIds = truckGroupOtpremaci[metaKey] || [];
          const availableOtpremaci = otpremaciList.filter(w => !assignedIds.includes(w.id));
          const reporters = [...new Set(g.rows.map(r => r.reportedBy).filter(Boolean))];
          return (
          <div className="card" key={g.key}>
            <div className="dept-header" style={{ flexWrap: 'wrap', rowGap: '0.4rem' }}>
              <span>🏕️</span>
              <span className="dept-name">{g.label}</span>
              <span className="dept-count">{g.rows.length} {g.rows.length === 1 ? 'kamion' : 'kamiona'}</span>
              {reporters.length > 0 && (
                <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--mono)' }}>
                  📝 Prijavio: {reporters.join(', ')}
                </span>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap', marginLeft: '0.4rem' }}>
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--mono)', letterSpacing: '0.05em' }}>OTPREMAČ:</span>
                {assignedIds.map(wId => (
                  <span key={wId} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.22)',
                    color: 'white', padding: '0.15rem 0.55rem', borderRadius: 12, fontSize: '0.72rem', fontWeight: 600,
                  }}>
                    {wName(wId)}
                    <button type="button" className="no-print" onClick={() => removeOtpremac(g.key, wId)}
                      style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, fontSize: '0.9rem', lineHeight: 1, opacity: 0.8 }}>×</button>
                  </span>
                ))}
                {assignedIds.length === 0 && (
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>nije dodijeljen</span>
                )}
                {availableOtpremaci.length > 0 && (
                  <select className="no-print" value="" onChange={e => { if (e.target.value) addOtpremac(g.key, e.target.value); }}
                    style={{ fontSize: '0.72rem', padding: '0.15rem 0.4rem', borderRadius: 6, border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>
                    <option value="" style={{ color: '#222' }}>+ Dodaj otpremača</option>
                    {availableOtpremaci.map(w => <option key={w.id} value={w.id} style={{ color: '#222' }}>{w.name}</option>)}
                  </select>
                )}
              </div>
            </div>
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Odjel</th>
                  <th>Sortiment</th>
                  <th>Prijedlog</th>
                  <th>Dispozicija</th>
                  <th className="no-print">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {g.rows.map(r => {
                  const found = findDispForKupac(r.kupac, r.sortiment);
                  const suggestions = findSuggestions(r.sortiment);
                  return (
                    <tr key={r.id}>
                      <td data-label="Odjel">
                        <OdjelInput value={r.odjel} onCommit={val => commitOdjel(r, val)} />
                      </td>
                      <td data-label="Sortiment">
                        <select className="form-select" value={r.sortiment} onChange={e => updateRow(r.id, { sortiment: e.target.value })}>
                          <option value="">— odaberi —</option>
                          {SORTIMENT_FIELDS.map(f => <option key={f} value={f}>{SORTIMENT_LABELS[f]}</option>)}
                        </select>
                      </td>
                      <td data-label="Prijedlog">
                        <PrijedlogCell row={r} suggestions={suggestions} kupci={kupci}
                          onSetKupac={k => updateRow(r.id, { kupac: k })} />
                      </td>
                      <td data-label="Dispozicija">
                        {!r.kupac || !r.sortiment ? <span style={{ color: 'var(--text-light)' }}>—</span> :
                          found ? (
                            <div style={{ fontSize: '0.8rem' }}>
                              <div><strong>{found.disp.broj}</strong> · {found.disp.ugovor || '—'}</div>
                              <div style={{ fontWeight: 700, color: balanceColor(found.bal) }}>{found.bal.toFixed(2)} m³</div>
                              <div style={{ color: 'var(--text-muted)' }}>{fmtDate(found.disp.datum)}</div>
                              {dispUsageMap[found.disp.id] > 1 && (
                                <div style={{ color: 'var(--amber)', fontWeight: 600, marginTop: '0.15rem' }}>
                                  ⚠ Dijeli sa još {dispUsageMap[found.disp.id] - 1} {dispUsageMap[found.disp.id] - 1 === 1 ? 'kamionom' : 'kamiona'} danas
                                </div>
                              )}
                            </div>
                          ) : <span style={{ color: 'var(--text-light)', fontSize: '0.78rem', fontStyle: 'italic' }}>— dispozicija u obradi —</span>
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
          </div>
          );
        })
      )}
      </div>
      )}
      <datalist id="odjel-list-kamioni">
        {odjeliList.map(o => <option key={o} value={o} />)}
      </datalist>
    </div>
  );
}
