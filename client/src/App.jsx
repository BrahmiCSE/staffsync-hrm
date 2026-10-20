import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Navbar from './components/Navbar.jsx';

// Lazy loading: each page is downloaded only when it is opened
const Login = lazy(() => import('./pages/Login.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Attendance = lazy(() => import('./pages/Attendance.jsx'));
const Leaves = lazy(() => import('./pages/Leaves.jsx'));
const Announcements = lazy(() => import('./pages/Announcements.jsx'));
const Training = lazy(() => import('./pages/Training.jsx'));
const Employees = lazy(() => import('./pages/Employees.jsx'));
const Team = lazy(() => import('./pages/Team.jsx'));

// Page title and one plain sentence about what the page is for
const pageInfo = (path, role) => {
  const staff = role !== 'employee';
  const pages = {
    '/attendance': [
      'Attendance',
      staff ? 'Mark your own day and review attendance for your people.' : 'Mark your day and review your history.',
    ],
    '/leaves': [
      'Leaves',
      staff ? 'Apply for leave and review requests from your people.' : 'Apply for time off and follow your requests.',
    ],
    '/announcements': ['Announcements', 'News and notices from HR.'],
    '/training': [
      'Training',
      staff ? 'Create programs and choose who takes part.' : 'Programs you have been added to.',
    ],
    '/employees': ['People', 'Add, edit and organise everyone in the company.'],
    '/team': ['My team', 'See who reports to you and rate their performance.'],
    '/profile': ['Profile', 'Your details and contact information.'],
  };
  return pages[path];
};

// Protected route: must be logged in, and (optionally) have one of the given roles
function Protected({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const info = user ? pageInfo(pathname, user.role) : null;

  const routes = (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/" element={<Protected><Dashboard /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="/attendance" element={<Protected><Attendance /></Protected>} />
        <Route path="/leaves" element={<Protected><Leaves /></Protected>} />
        <Route path="/announcements" element={<Protected><Announcements /></Protected>} />
        <Route path="/training" element={<Protected><Training /></Protected>} />
        <Route path="/employees" element={<Protected roles={['hr']}><Employees /></Protected>} />
        <Route path="/team" element={<Protected roles={['manager']}><Team /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );

  // Signed out: the sign-in page fills the whole screen
  if (!user) return routes;

  return (
    <div className="shell">
      <Navbar />
      <main className="main">
        <div className="main-inner">
          {info && (
            <header className="page-head">
              <h1>{info[0]}</h1>
              <p>{info[1]}</p>
            </header>
          )}
          {routes}
        </div>
      </main>
    </div>
  );
}
