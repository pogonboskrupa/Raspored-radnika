// ─── HISTORIJA VIEW ───────────────────────────────────────────────────────────
function HistorijaView({ history, wName, dName, restoreVersion, schedules }) {
  const grouped = useMemo(() => {
    const m = {};
    history.forEach(h => {
      const d = new Date(h.timestamp).toISOString().split('T')[0];
      if (!m[d]) m[d] = [];
      m[d].push(h);
    });
    return Object.entries(m).sort((a,b) => b[0].localeCompare(a[0]));
  }, [history]);

  return (
    <div>
      <div className="section-header">
        <div className="section-title">Historija izmjena</div>
        <span className="tag">{history.length} zapisa</span>
      </div>
      {history.length === 0 ? (
        <div className="empty-state"><span className="icon">📜</span><p>Historija je prazna.</p></div>
      ) : (
        grouped.map(([date, items]) => (
          <div key={date} style={{marginBottom:'1.25rem'}}>
            <div style={{fontFamily:'var(--mono)',fontSize:'0.72rem',fontWeight:600,color:'var(--text-muted)',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'0.5rem',paddingLeft:'0.25rem'}}>
              {fmtDate(date)}
            </div>
            {items.map(h => (
              <div className="history-item" key={h.id}>
                <div className="history-header">
                  <span className={`history-action ${h.action}`}>
                    {h.action==='create'?'✅ Kreiran':h.action==='edit'?'✏️ Izmjenjen':h.action==='delete'?'🗑️ Obrisan':'↩️ Vraćen'}
                  </span>
                  {h.user && (
                    <span style={{fontSize:'0.72rem',fontWeight:700,color:'white',
                      background:'var(--green)',borderRadius:5,padding:'0.1rem 0.45rem',
                      fontFamily:'var(--mono)',flexShrink:0}}>
                      👤 {h.user}
                    </span>
                  )}
                  <span style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>
                    Raspored: {fmtDate(h.date)} — {h.newData?.deptId || h.oldData?.deptId ? dName(h.newData?.deptId || h.oldData?.deptId) : ''}
                    {' '}<span className={jobBadgeClass(h.newData?.jobType||h.oldData?.jobType)} style={{fontSize:'0.65rem'}}>
                      {h.newData?.jobType||h.oldData?.jobType}
                    </span>
                  </span>
                  <span className="history-time">{fmtTime(h.timestamp)}</span>
                  {h.oldData && (
                    <button className="btn btn-secondary btn-sm" style={{marginLeft:'auto'}} onClick={() => {
                      if (confirm('Vratiti ovo stanje?')) restoreVersion(h);
                    }}>↩ Vrati</button>
                  )}
                </div>
                {h.oldData && h.newData && (
                  <div className="diff-row">
                    <div className="diff-old">{h.oldData.allWorkers?.map(wName).join(', ')}</div>
                    <div style={{color:'var(--text-muted)'}}>→</div>
                    <div className="diff-new">{h.newData.allWorkers?.map(wName).join(', ')}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}



