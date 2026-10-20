import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import api from '../api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api.get('/notifications').then((r) => setNotes(r.data)).catch(() => {});
  }, []);

  const unread = notes.filter((n) => !n.read).length;

  const toggleNotes = async () => {
    setOpen(!open);
    if (!open && unread) {
      await api.put('/notifications/read-all');
      setNotes(notes.map((n) => ({ ...n, read: true })));
    }
  };

  const link = ({ isActive }) => 'nav-link' + (isActive ? ' active fw-bold' : '');

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <span className="navbar-brand fw-bold">StaffSync</span>
        <div className="navbar-nav me-auto flex-row flex-wrap gap-3">
          <NavLink className={link} to="/" end>Dashboard</NavLink>
          <NavLink className={link} to="/attendance">Attendance</NavLink>
          <NavLink className={link} to="/leaves">Leaves</NavLink>
          <NavLink className={link} to="/announcements">Announcements</NavLink>
          <NavLink className={link} to="/training">Training</NavLink>
          {user.role === 'hr' && <NavLink className={link} to="/employees">Employees</NavLink>}
          {user.role === 'manager' && <NavLink className={link} to="/team">My Team</NavLink>}
          <NavLink className={link} to="/profile">Profile</NavLink>
        </div>
        <div className="d-flex align-items-center gap-3 position-relative">
          <button className="btn btn-sm btn-light" onClick={toggleNotes}>
            Notifications {unread > 0 && <span className="badge bg-danger">{unread}</span>}
          </button>
          {open && (
            <div className="card position-absolute end-0 top-100 mt-2 shadow" style={{ width: 300, zIndex: 10 }}>
              <ul className="list-group list-group-flush">
                {notes.length === 0 && <li className="list-group-item text-muted">No notifications</li>}
                {notes.slice(0, 8).map((n) => (
                  <li key={n._id} className="list-group-item small">{n.message}</li>
                ))}
              </ul>
            </div>
          )}
          <span className="text-white small">{user.name} ({user.role})</span>
          <button
            className="btn btn-sm btn-outline-light"
            onClick={() => { logout(); navigate('/login'); }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
