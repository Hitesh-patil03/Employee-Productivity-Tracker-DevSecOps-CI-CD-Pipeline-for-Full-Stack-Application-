import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import Sidebar from './components/shared/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import AdminTasks from './pages/AdminTasks';
import MyTasks from './pages/MyTasks';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';

import './styles/globals.css';

// ── Layout wrapper for authenticated pages ──
const AppLayout = () => {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Outlet />
      </div>
    </div>
  );
};

// ── Require auth ──
const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><span className="spinner spinner-lg" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// ── Require admin ──
const RequireAdmin = ({ children }) => {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

// ── Require employee ──
const RequireEmployee = ({ children }) => {
  const { isEmployee } = useAuth();
  if (!isEmployee) return <Navigate to="/dashboard" replace />;
  return children;
};

// ── Redirect already-authed users away from login ──
const GuestOnly = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />

          {/* Protected */}
          <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />

            {/* Admin only */}
            <Route path="/employees" element={<RequireAdmin><Employees /></RequireAdmin>} />
            <Route path="/tasks" element={<RequireAdmin><AdminTasks /></RequireAdmin>} />

            {/* Employee only */}
            <Route path="/my-tasks" element={<RequireEmployee><MyTasks /></RequireEmployee>} />
            <Route path="/profile" element={<RequireEmployee><Profile /></RequireEmployee>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
