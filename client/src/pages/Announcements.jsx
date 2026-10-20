import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext.jsx';

export default function Announcements() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', message: '' });
  const [error, setError] = useState('');

  const load = () => api.get('/announcements').then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const post = async (e) => {
    e.preventDefault();
    try {
      await api.post('/announcements', form);
      setForm({ title: '', message: '' });
      setError('');
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const remove = async (id) => {
    await api.delete(`/announcements/${id}`);
    load();
  };

  return (
    <div className="row g-4">
      {user.role === 'hr' && (
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header">Post an announcement</div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={post}>
                <input className="form-control mb-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                <textarea className="form-control mb-3" rows="4" placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
                <button className="btn btn-primary w-100">Post</button>
              </form>
            </div>
          </div>
        </div>
      )}
      <div className={user.role === 'hr' ? 'col-md-8' : 'col-12'}>
        {items.length === 0 && <div className="text-muted">No announcements yet.</div>}
        {items.map((a) => (
          <div className="card shadow-sm mb-3" key={a._id}>
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <h5>{a.title}</h5>
                {user.role === 'hr' && (
                  <button className="btn btn-sm btn-outline-danger" onClick={() => remove(a._id)}>Delete</button>
                )}
              </div>
              <p className="mb-1">{a.message}</p>
              <small className="text-muted">
                {a.postedBy?.name} - {new Date(a.createdAt).toLocaleString()}
              </small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
