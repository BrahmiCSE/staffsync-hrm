import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext.jsx';

const time = (d) => (d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-');

export default function Attendance() {
  const { user } = useAuth();
  const [mine, setMine] = useState([]);
  const [all, setAll] = useState([]);
  const [date, setDate] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  const loadMine = () => api.get('/attendance/my').then((r) => setMine(r.data));
  const loadAll = () =>
    api.get('/attendance', { params: date ? { date } : {} }).then((r) => setAll(r.data));

  useEffect(() => { loadMine(); }, []);
  useEffect(() => { if (user.role !== 'employee') loadAll(); }, [date, user.role]);

  const act = async (path) => {
    try {
      await api.post(`/attendance/${path}`);
      setMsg({ type: 'success', text: path === 'check-in' ? 'Attendance marked' : 'Checked out' });
      loadMine();
      if (user.role !== 'employee') loadAll();
    } catch (err) {
      setMsg({ type: 'danger', text: errMsg(err) });
    }
  };

  const badge = (s) => (
    <span className={`badge bg-${s === 'present' ? 'success' : s === 'late' ? 'warning' : 'secondary'}`}>{s}</span>
  );

  return (
    <>
      <div className="card shadow-sm mb-4">
        <div className="card-body d-flex flex-wrap gap-2 align-items-center">
          <h5 className="mb-0 me-auto">My attendance</h5>
          <button className="btn btn-success" onClick={() => act('check-in')}>Mark attendance</button>
          <button className="btn btn-outline-secondary" onClick={() => act('check-out')}>Check out</button>
        </div>
        {msg.text && <div className={`alert alert-${msg.type} m-3 mb-0`}>{msg.text}</div>}
        <table className="table mb-0 mt-3">
          <thead><tr><th>Date</th><th>Check in</th><th>Check out</th><th>Status</th></tr></thead>
          <tbody>
            {mine.length === 0 && <tr><td colSpan="4" className="text-muted">No records yet</td></tr>}
            {mine.map((a) => (
              <tr key={a._id}><td>{a.date}</td><td>{time(a.checkIn)}</td><td>{time(a.checkOut)}</td><td>{badge(a.status)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {user.role !== 'employee' && (
        <div className="card shadow-sm">
          <div className="card-header d-flex flex-wrap gap-2 align-items-center">
            <span className="me-auto">{user.role === 'hr' ? 'All employees' : 'My team'}</span>
            <input type="date" className="form-control form-control-sm w-auto" value={date} onChange={(e) => setDate(e.target.value)} />
            {date && <button className="btn btn-sm btn-link" onClick={() => setDate('')}>Clear</button>}
          </div>
          <table className="table mb-0">
            <thead><tr><th>Name</th><th>Department</th><th>Date</th><th>In</th><th>Out</th><th>Status</th></tr></thead>
            <tbody>
              {all.length === 0 && <tr><td colSpan="6" className="text-muted">No records</td></tr>}
              {all.map((a) => (
                <tr key={a._id}>
                  <td>{a.user?.name}</td><td>{a.user?.department || '-'}</td><td>{a.date}</td>
                  <td>{time(a.checkIn)}</td><td>{time(a.checkOut)}</td><td>{badge(a.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
