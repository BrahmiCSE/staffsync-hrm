import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';

export default function Team() {
  const [team, setTeam] = useState([]);
  const [msg, setMsg] = useState('');

  const load = () => api.get('/users/team').then((r) => setTeam(r.data));
  useEffect(() => { load(); }, []);

  const rate = async (id, rating) => {
    try {
      await api.put(`/users/${id}/rating`, { rating });
      setMsg('');
      load();
    } catch (err) {
      setMsg(errMsg(err));
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header">My team and performance</div>
      {msg && <div className="alert alert-danger m-3 mb-0">{msg}</div>}
      <table className="table mb-0">
        <thead><tr><th>Name</th><th>Position</th><th>Department</th><th>Leave balance</th><th>Performance (0-5)</th></tr></thead>
        <tbody>
          {team.length === 0 && (
            <tr><td colSpan="5" className="text-muted">No one is assigned to you yet. Ask HR to set you as their manager.</td></tr>
          )}
          {team.map((m) => (
            <tr key={m._id}>
              <td>{m.name}</td>
              <td>{m.position || '-'}</td>
              <td>{m.department || '-'}</td>
              <td>{m.leaveBalance}</td>
              <td style={{ width: 140 }}>
                <select className="form-select form-select-sm" value={m.performanceRating} onChange={(e) => rate(m._id, e.target.value)}>
                  {[0, 1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
