import React from 'react';
import './Topbar.css';

const Topbar = ({ title, subtitle, actions }) => (
  <header className="topbar">
    <div>
      <div className="topbar-title">{title}</div>
      {subtitle && <div className="topbar-sub">{subtitle}</div>}
    </div>
    {actions && <div className="topbar-actions">{actions}</div>}
  </header>
);

export default Topbar;
