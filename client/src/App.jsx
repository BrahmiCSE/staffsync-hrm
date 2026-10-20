import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
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
  return (
    <>
      {user && <Navbar />}
      <div className="container py-4">
        <Suspense fallback={<div>Loading...</div>}>
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
      </div>
    </>
  );
}
