import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext.jsx';

const empty = { title: '', description: '', startDate: '', endDate: '', participants: [] };
const fmt = (d) => (d ? new Date(d).toLocaleDateString() : '-');

export default function Training() {
  const { user } = useAuth();
  const canManage = user.role !== 'employee';
  const [items, setItems] = useState([]);
  const [people, setPeople] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  const load = () => api.get('/trainings').then((r) => setItems(r.data));
  useEffect(() => {
    load();
    if (canManage) api.get('/users/team').then((r) => setPeople(r.data));
  }, []);

  const toggle = (id) =>
    setForm((f) => ({
      ...f,
      participants: f.participants.includes(id) ? f.participants.filter((p) => p !== id) : [...f.participants, id],
    }));

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post('/trainings', form);
      setForm(empty);
      setError('');
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const remove = async (id) => {
    await api.delete(`/trainings/${id}`);
    load();
  };

  return (
    <div className="row g-4">
      {canManage && (
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header">Create training program</div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={create}>
                <input className="form-control mb-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                <textarea className="form-control mb-2" rows="3" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <input type="date" className="form-control mb-2" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                <input type="date" className="form-control mb-2" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                <div className="small text-muted mb-1">Participants</div>
                <div className="border rounded p-2 mb-3" style={{ maxHeight: 140, overflowY: 'auto' }}>
                  {people.length === 0 && <span className="text-muted small">No team members yet</span>}
                  {people.map((p) => (
                    <div className="form-check" key={p._id}>
                      <input className="form-check-input" type="checkbox" id={p._id} checked={form.participants.includes(p._id)} onChange={() => toggle(p._id)} />
                      <label className="form-check-label" htmlFor={p._id}>{p.name}</label>
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary w-100">Create</button>
              </form>
            </div>
          </div>
        </div>
      )}
      <div className={canManage ? 'col-md-8' : 'col-12'}>
        {items.length === 0 && <div className="text-muted">No training programs yet.</div>}
        {items.map((t) => (
          <div className="card shadow-sm mb-3" key={t._id}>
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <h5>{t.title}</h5>
                {canManage && <button className="btn btn-sm btn-outline-danger" onClick={() => remove(t._id)}>Delete</button>}
              </div>
              <p className="mb-1">{t.description}</p>
              <small className="text-muted d-block">{fmt(t.startDate)} - {fmt(t.endDate)} - by {t.createdBy?.name}</small>
              {canManage && (
                <small className="text-muted">Participants: {t.participants.map((p) => p.name).join(', ') || 'none'}</small>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
