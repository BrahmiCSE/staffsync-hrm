import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext.jsx';

const fmt = (d) => new Date(d).toLocaleDateString();
const statusColor = { pending: 'warning', approved: 'success', rejected: 'danger' };

export default function Leaves() {
  const { user } = useAuth();
  const [mine, setMine] = useState([]);
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ type: 'casual', startDate: '', endDate: '', reason: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const canReview = user.role !== 'employee';

  const load = () => {
    api.get('/leaves/my').then((r) => setMine(r.data));
    if (canReview) api.get('/leaves').then((r) => setRequests(r.data));
  };
  useEffect(load, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const apply = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leaves', form);
      setForm({ type: 'casual', startDate: '', endDate: '', reason: '' });
      setMsg({ type: 'success', text: 'Leave request submitted' });
      load();
    } catch (err) {
      setMsg({ type: 'danger', text: errMsg(err) });
    }
  };

  const review = async (id, status) => {
    try {
      await api.put(`/leaves/${id}/review`, { status });
      load();
    } catch (err) {
      setMsg({ type: 'danger', text: errMsg(err) });
    }
  };

  return (
    <>
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header">Apply for leave</div>
            <div className="card-body">
              {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
              <form onSubmit={apply}>
                <select className="form-select mb-2" name="type" value={form.type} onChange={change}>
                  <option value="casual">Casual</option>
                  <option value="sick">Sick</option>
                  <option value="annual">Annual</option>
                  <option value="unpaid">Unpaid</option>
                </select>
                <label className="form-label small mb-0">From</label>
                <input type="date" className="form-control mb-2" name="startDate" value={form.startDate} onChange={change} required />
                <label className="form-label small mb-0">To</label>
                <input type="date" className="form-control mb-2" name="endDate" value={form.endDate} onChange={change} required />
                <textarea className="form-control mb-3" name="reason" rows="2" placeholder="Reason" value={form.reason} onChange={change} />
                <button className="btn btn-primary w-100">Submit</button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header">My leave status</div>
            <table className="table mb-0">
              <thead><tr><th>Type</th><th>Dates</th><th>Days</th><th>Status</th></tr></thead>
              <tbody>
                {mine.length === 0 && <tr><td colSpan="4" className="text-muted">No requests yet</td></tr>}
                {mine.map((l) => (
                  <tr key={l._id}>
                    <td className="text-capitalize">{l.type}</td>
                    <td>{fmt(l.startDate)} - {fmt(l.endDate)}</td>
                    <td>{l.days}</td>
                    <td><span className={`badge bg-${statusColor[l.status]}`}>{l.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {canReview && (
        <div className="card shadow-sm">
          <div className="card-header">{user.role === 'hr' ? 'All leave requests' : 'Team leave requests'}</div>
          <table className="table mb-0">
            <thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Days</th><th>Reason</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {requests.length === 0 && <tr><td colSpan="7" className="text-muted">No requests</td></tr>}
              {requests.map((l) => (
                <tr key={l._id}>
                  <td>{l.user?.name}</td>
                  <td className="text-capitalize">{l.type}</td>
                  <td>{fmt(l.startDate)} - {fmt(l.endDate)}</td>
                  <td>{l.days}</td>
                  <td>{l.reason || '-'}</td>
                  <td><span className={`badge bg-${statusColor[l.status]}`}>{l.status}</span></td>
                  <td className="text-nowrap">
                    {l.status === 'pending' && (
                      <>
                        <button className="btn btn-sm btn-success me-1" onClick={() => review(l._id, 'approved')}>Approve</button>
                        <button className="btn btn-sm btn-danger" onClick={() => review(l._id, 'rejected')}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
