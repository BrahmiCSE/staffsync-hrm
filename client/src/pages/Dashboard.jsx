import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import api from '../api';

// One cell of the number strip at the top of the dashboard
const StripItem = ({ label, value, to }) => (
  <Link to={to} className="strip-item">
    <span className="strip-value">{value ?? '-'}</span>
    <span className="strip-label">{label}</span>
  </Link>
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
    api.get('/announcements').then((r) => setNews(r.data.slice(0, 4)));
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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user.name.split(' ')[0];
  const dateText = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  const shortDate = (d) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

  const maxDept = stats ? Math.max(1, ...stats.byDepartment.map((d) => d.count)) : 1;

  return (
    <>
      <header className="hello">
        <p className="hello-date">{dateText}</p>
        <h1>{greeting}, {firstName}</h1>
      </header>

      <section className="strip" aria-label="Summary">
        {user.role === 'hr' && stats && (
          <>
            <StripItem label="Employees" value={stats.employees} to="/employees" />
            <StripItem label="Managers" value={stats.managers} to="/employees" />
            <StripItem label="Present today" value={stats.presentToday} to="/attendance" />
            <StripItem label="Leave requests waiting" value={stats.pendingLeaves} to="/leaves" />
          </>
        )}
        {user.role === 'manager' && (
          <>
            <StripItem label="People in your team" value={team.length} to="/team" />
            <StripItem label="Leave requests waiting" value={pending.length} to="/leaves" />
          </>
        )}
        {user.role === 'employee' && (
          <>
            <StripItem label="Leave days left" value={me?.leaveBalance} to="/leaves" />
            <StripItem label="Attendance today" value={today ? today.status : 'Not marked'} to="/attendance" />
            <StripItem
              label="Requests waiting"
              value={myLeaves.filter((l) => l.status === 'pending').length}
              to="/leaves"
            />
          </>
        )}
      </section>

      <div className="dash-grid">
        {user.role === 'hr' && stats && (
          <section className="panel">
            <div className="panel-head">
              <h2>People by department</h2>
              <Link to="/employees">Open people</Link>
            </div>
            <div className="panel-body">
              {stats.byDepartment.length === 0 && <span className="text-muted">No people added yet.</span>}
              {stats.byDepartment.map((d) => (
                <div className="bar-row" key={d._id || 'none'}>
                  <span className="bar-name">{d._id || 'No department'}</span>
                  <span className="bar-track">
                    <span className="bar-fill d-block" style={{ width: `${(d.count / maxDept) * 100}%` }} />
                  </span>
                  <span className="bar-count">{d.count}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {user.role === 'manager' && (
          <section className="panel">
            <div className="panel-head">
              <h2>Waiting for your decision</h2>
              <Link to="/leaves">Review requests</Link>
            </div>
            {pending.length === 0 && <p className="panel-empty">No leave requests are waiting.</p>}
            {pending.slice(0, 5).map((l) => (
              <div className="row-line" key={l._id}>
                <span>{l.user?.name}</span>
                <span>{l.days} {l.days === 1 ? 'day' : 'days'}, {l.type}</span>
              </div>
            ))}
          </section>
        )}

        <section className="panel">
          <div className="panel-head">
            <h2>Notice board</h2>
            <Link to="/announcements">See all</Link>
          </div>
          {news.length === 0 && <p className="panel-empty">Nothing has been posted yet.</p>}
          {news.map((n) => (
            <article className="notice" key={n._id}>
              <time dateTime={n.createdAt}>{shortDate(n.createdAt)}</time>
              <div>
                <strong>{n.title}</strong>
                <p>{n.message}</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </>
  );
}
