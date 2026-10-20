import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import api from '../api';

const Stat = ({ label, value, to }) => (
  <div className="col-6 col-md-3">
    <Link to={to || '#'} className="text-decoration-none">
      <div className="card text-center shadow-sm h-100">
        <div className="card-body">
          <div className="display-6">{value ?? '-'}</div>
          <div className="text-muted">{label}</div>
        </div>
      </div>
    </Link>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [me, setMe] = useState(null);
  const [stats, setStats] = useState(null);
  const [team, setTeam] = useState([]);
  const [pending, setPending] = useState([]);
  const [news, setNews] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [today, setToday] = useState(null);

  useEffect(() => {
    api.get('/auth/me').then((r) => setMe(r.data));
    api.get('/announcements').then((r) => setNews(r.data.slice(0, 3)));
    if (user.role === 'hr') api.get('/users/stats').then((r) => setStats(r.data));
    if (user.role === 'manager') {
      api.get('/users/team').then((r) => setTeam(r.data));
      api.get('/leaves?status=pending').then((r) => setPending(r.data));
    }
    if (user.role === 'employee') {
      api.get('/leaves/my').then((r) => setMyLeaves(r.data));
      api.get('/attendance/my').then((r) => {
        const d = new Date().toISOString().slice(0, 10);
        setToday(r.data.find((a) => a.date === d) || null);
      });
    }
  }, [user.role]);

  return (
    <>
      <h3 className="mb-4">Welcome, {user.name}</h3>

      {user.role === 'hr' && stats && (
        <>
          <div className="row g-3 mb-4">
            <Stat label="Employees" value={stats.employees} to="/employees" />
            <Stat label="Managers" value={stats.managers} to="/employees" />
            <Stat label="Present today" value={stats.presentToday} to="/attendance" />
            <Stat label="Pending leaves" value={stats.pendingLeaves} to="/leaves" />
          </div>
          <div className="card shadow-sm mb-4">
            <div className="card-header">Headcount by department</div>
            <ul className="list-group list-group-flush">
              {stats.byDepartment.map((d) => (
                <li key={d._id || 'none'} className="list-group-item d-flex justify-content-between">
                  {d._id || 'Unassigned'} <span className="badge bg-primary">{d.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {user.role === 'manager' && (
        <div className="row g-3 mb-4">
          <Stat label="Team members" value={team.length} to="/team" />
          <Stat label="Pending leave requests" value={pending.length} to="/leaves" />
        </div>
      )}

      {user.role === 'employee' && (
        <div className="row g-3 mb-4">
          <Stat label="Leave balance (days)" value={me?.leaveBalance} to="/leaves" />
          <Stat label="Today" value={today ? today.status : 'Not marked'} to="/attendance" />
          <Stat label="Pending requests" value={myLeaves.filter((l) => l.status === 'pending').length} to="/leaves" />
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between">
          Latest announcements <Link to="/announcements">View all</Link>
        </div>
        <ul className="list-group list-group-flush">
          {news.length === 0 && <li className="list-group-item text-muted">Nothing posted yet</li>}
          {news.map((n) => (
            <li key={n._id} className="list-group-item">
              <strong>{n.title}</strong>
              <div className="small text-muted">{n.message}</div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
