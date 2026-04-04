// ─── DEPARTMENTS VIEW ─────────────────────────────────────────────────────────
function DepartmentsView({ departments, setDepartments, schedules, dName }) {
  const [modal, setModal] = useState(null);

  const DeptModal = ({ dept, onClose }) => {
    const [form, setForm] = useState(dept || { id: uid(), gospodarskaJedinica: '', brojOdjela: '', note: '' });
    const save = () => {
      if (!form.gospodarskaJedinica) return alert('Odaberite gospodarsku jedinicu!');
      if (!form.brojOdjela.trim()) return alert('Unesite broj odjela!');
      if (dept) setDepartments(ds => ds.map(d => d.id === form.id ? form : d));
      else setDepartments(ds => [...ds, form]);
      onClose();
    };
    return (
      <div className="modal-overlay" onClick={e => e.target===e.currentTarget&&onClose()}>
        <div className="modal">
          <div className="modal-header">
            <span>🏕️</span>
            <div className="modal-title">{dept ? 'Uredi odjel' : 'Novi odjel'}</div>
            <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Gospodarska jedinica *</label>
              <select className="form-select" value={form.gospodarskaJedinica} onChange={e=>setForm(f=>({...f,gospodarskaJedinica:e.target.value}))}>
                <option value="">— Odaberi —</option>
                {GOSPODARSKE_JEDINICE.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Broj odjela *</label>
              <input className="form-input" placeholder="npr. 54 ili 5/2" value={form.brojOdjela} onChange={e=>setForm(f=>({...f,brojOdjela:e.target.value}))} />
            </div>
            <div className="form-group"><label className="form-label">Napomena</label>
              <textarea className="form-input" rows={2} value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} style={{resize:'vertical'}} /></div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Odustani</button>
            <button className="btn btn-primary" onClick={save}>Spremi</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-title">Odjeli i radilišta</div>
        <button className="btn btn-primary btn-sm" onClick={() => setModal({})}>+ Novi odjel</button>
      </div>
      <div className="card">
        <table className="schedule-table">
          <thead><tr><th>Gospodarska jedinica</th><th>Broj odjela</th><th>Napomena</th><th>Rasporeda</th><th>Akcije</th></tr></thead>
          <tbody>
            {departments.map(d => {
              const cnt = schedules.filter(s => s.deptId === d.id).length;
              return (
                <tr key={d.id}>
                  <td style={{fontWeight:600}}>{d.gospodarskaJedinica}</td>
                  <td style={{fontFamily:'var(--mono)',fontWeight:600}}>{d.brojOdjela}</td>
                  <td style={{color:'var(--text-muted)',fontSize:'0.8rem'}}>{d.note || '—'}</td>
                  <td><span className="tag">{cnt}</span></td>
                  <td>
                    <div style={{display:'flex',gap:'0.25rem'}}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(d)}>✏️</button>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={() => {
                        if (cnt > 0) return alert('Ne možete obrisati odjel koji ima unose u rasporedu!');
                        if (confirm(`Obrisati ${d.name}?`)) setDepartments(ds => ds.filter(x => x.id !== d.id));
                      }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {modal !== null && <DeptModal dept={Object.keys(modal).length ? modal : null} onClose={() => setModal(null)} />}
    </div>
  );
}

