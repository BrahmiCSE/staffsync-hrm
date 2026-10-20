import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import api from '../api';

// Left sidebar: navigation, notifications and the signed-in person
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

  const link = ({ isActive }) => 'side-link' + (isActive ? ' active' : '');
  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true" />
        StaffSync
      </div>

      <nav className="side-nav" aria-label="Main">
        <NavLink className={link} to="/" end>Dashboard</NavLink>
        <NavLink className={link} to="/attendance">Attendance</NavLink>
        <NavLink className={link} to="/leaves">Leaves</NavLink>
        <NavLink className={link} to="/training">Training</NavLink>
        <NavLink className={link} to="/announcements">Announcements</NavLink>
        {user.role === 'hr' && <NavLink className={link} to="/employees">People</NavLink>}
        {user.role === 'manager' && <NavLink className={link} to="/team">My team</NavLink>}
        <NavLink className={(s) => link(s) + ' gap'} to="/profile">Profile</NavLink>
      </nav>

      <div className="side-foot">
        {open && (
          <div className="notes-pop">
            {notes.length === 0 && <p className="empty">You're all caught up.</p>}
            {notes.slice(0, 8).map((n) => (
              <p key={n._id}>{n.message}</p>
            ))}
          </div>
        )}
        <button className="side-notes" onClick={toggleNotes}>
          Notifications {unread > 0 && <span className="count">{unread}</span>}
        </button>
        <div className="who">
          <span className="avatar" aria-hidden="true">{initials}</span>
          <div>
            <div className="who-name">{user.name}</div>
            <div className="who-role">{user.role}</div>
          </div>
        </div>
        <button className="side-logout" onClick={() => { logout(); navigate('/login'); }}>
          Log out
        </button>
      </div>
    </aside>
  );
}
