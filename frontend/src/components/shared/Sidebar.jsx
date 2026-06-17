import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { initials, avatarColor } from '../../utils/helpers';
import './Sidebar.css';

const ADMIN_NAV = [
  { path: '/dashboard', label: 'Dashboard', icon: '▦' },
  { path: '/employees', label: 'Employees', icon: '◎' },
  { path: '/tasks', label: 'All Tasks', icon: '☰' },
  { path: '/analytics', label: 'Analytics', icon: '◈' },
];

const EMPLOYEE_NAV = [
  { path: '/dashboard', label: 'Dashboard', icon: '▦' },
  { path: '/my-tasks', label: 'My Tasks', icon: '☰' },
  { path: '/profile', label: 'My Profile', icon: '◎' },
  { path: '/analytics', label: 'Analytics', icon: '◈' },
];

const Sidebar = ({ taskBadge = 0 }) => {
  const { user, employee, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = isAdmin ? ADMIN_NAV : EMPLOYEE_NAV;
  const ac = avatarColor(0);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">◈ Produx</div>
        <div className="sidebar-logo-name">Analytics<br />Platform</div>
        <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-employee'}`} style={{ marginTop: 8 }}>
          {isAdmin ? '⚙ Admin' : '◎ Employee'}
        </span>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">Workspace</div>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          const showBadge = item.label === 'My Tasks' && taskBadge > 0;
          return (
            <button
              key={item.path}
              className={`sidebar-item ${active ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="sidebar-item-icon">{item.icon}</span>
              <span>{item.label}</span>
              {showBadge && <span className="sidebar-badge">{taskBadge}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div
            className="avatar avatar-sm"
            style={{ background: isAdmin ? 'rgba(245,158,11,0.2)' : ac.bg, color: isAdmin ? '#f59e0b' : ac.fg, width: 32, height: 32 }}
          >
            {initials(user?.name)}
          </div>
          <div>
            <div className="sidebar-uname">{user?.name}</div>
            <div className="sidebar-urole">{isAdmin ? 'Super Admin' : (employee?.role || 'Employee')}</div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout}>← Logout</button>
      </div>
    </aside>
  );
};

export default Sidebar;
