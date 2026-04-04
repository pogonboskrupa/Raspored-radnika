// ─── HISTORY DETAIL MODAL ─────────────────────────────────────────────────────
function HistoryDetailModal({ schedule, history, workers, wName, dName, restoreVersion, onClose }) {
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span>📜</span>
          <div className="modal-title">Historija izmjena</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{maxHeight:'60vh',overflowY:'auto'}}>
          {history.length === 0 ? (
            <div style={{color:'var(--text-muted)',fontSize:'0.85rem',textAlign:'center',padding:'2rem'}}>Nema historije za ovaj zapis.</div>
          ) : (
            history.map(h => (
              <div className="history-item" key={h.id}>
                <div className="history-header">
                  <span className={`history-action ${h.action}`}>
                    {h.action==='create'?'✅ Kreiran':h.action==='edit'?'✏️ Izmjenjen':h.action==='delete'?'🗑️ Obrisan':'↩️ Vraćen'}
                  </span>
                  <span className="history-time">{fmtTime(h.timestamp)}</span>
                  {h.oldData && (
                    <button className="btn btn-secondary btn-sm" style={{marginLeft:'auto'}} onClick={() => restoreVersion(h)}>
                      ↩ Vrati
                    </button>
                  )}
                </div>
                {h.oldData && h.newData && (
                  <div className="diff-row">
                    <div className="diff-old">
                      {h.oldData.allWorkers?.map(wName).join(', ')}
                    </div>
                    <div>→</div>
                    <div className="diff-new">
                      {h.newData.allWorkers?.map(wName).join(', ')}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Zatvori</button>
        </div>
      </div>
    </div>
  );
}

// ─── WORKER CATEGORY BADGE ────────────────────────────────────────────────────
function CatBadge({ catId, size = 'normal' }) {
  const cat = getCatById(catId);
  if (!cat) return null;
  const small = size === 'small';
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap: small ? '0.2rem' : '0.3rem',
      background: cat.pale, color: cat.color, border: `1px solid ${cat.border}`,
      borderRadius: 4, padding: small ? '0.1rem 0.4rem' : '0.25rem 0.6rem',
      fontSize: small ? '0.65rem' : '0.72rem', fontWeight: 600,
      fontFamily: 'var(--mono)', whiteSpace: 'nowrap',
    }}>
      {cat.icon} {small ? cat.short : cat.label}
    </span>
  );
}

