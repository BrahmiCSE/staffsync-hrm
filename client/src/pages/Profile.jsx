import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext.jsx';

export default function Profile() {
  const { setUser } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [info, setInfo] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    api.get('/auth/me').then((r) => {
      setInfo(r.data);
      setForm({ name: r.data.name, phone: r.data.phone || '', address: r.data.address || '' });
    });
  }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/users/me', form);
      setInfo(res.data);
      setUser((u) => ({ ...u, name: res.data.name }));
      setMsg({ type: 'success', text: 'Profile updated' });
    } catch (err) {
      setMsg({ type: 'danger', text: errMsg(err) });
    }
  };

  if (!info) return <div>Loading...</div>;

  return (
    <div className="row g-4">
      <div className="col-md-5">
        <div className="card shadow-sm">
          <div className="card-header">Employment details</div>
          <ul className="list-group list-group-flush">
            <li className="list-group-item"><strong>Email:</strong> {info.email}</li>
            <li className="list-group-item"><strong>Role:</strong> {info.role}</li>
            <li className="list-group-item"><strong>Department:</strong> {info.department || '-'}</li>
            <li className="list-group-item"><strong>Position:</strong> {info.position || '-'}</li>
            <li className="list-group-item"><strong>Joined:</strong> {new Date(info.joinDate).toLocaleDateString()}</li>
            <li className="list-group-item"><strong>Leave balance:</strong> {info.leaveBalance} days</li>
            <li className="list-group-item"><strong>Performance rating:</strong> {info.performanceRating} / 5</li>
          </ul>
        </div>
      </div>
      <div className="col-md-7">
        <div className="card shadow-sm">
          <div className="card-header">Update personal information</div>
          <div className="card-body">
            {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
            <form onSubmit={save}>
              <label className="form-label">Name</label>
              <input className="form-control mb-3" name="name" value={form.name} onChange={change} required />
              <label className="form-label">Phone</label>
              <input className="form-control mb-3" name="phone" value={form.phone} onChange={change} />
              <label className="form-label">Address</label>
              <textarea className="form-control mb-3" name="address" rows="3" value={form.address} onChange={change} />
              <button className="btn btn-primary">Save changes</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
