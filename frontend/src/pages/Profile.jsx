import React, { useEffect, useState } from 'react';
import { taskAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { scoreColor, scoreLabel, fmtTime, initials, avatarColor } from '../utils/helpers';
import Topbar from '../components/shared/Topbar';
import './Profile.css';

const Profile = () => {
  const { user, employee } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    taskAPI.getAll().then(({ data }) => setTasks(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const done = tasks.filter((t) => t.status === 'done').length;
  const inProgress = tasks.filter((t) => t.status === 'inprogress').length;
  const overdue = tasks.filter((t) => t.status === 'overdue').length;
  const totalElapsed = tasks.reduce((s, t) => s + (t.elapsedSeconds || 0), 0);
  const score = employee?.productivityScore || 0;
  const ac = avatarColor(0);

  return (
    <>
      <Topbar title="My Profile" subtitle="PERSONAL METRICS · MONGODB" />
      <div className="page-content">
        <div className="profile-wrap">
          {/* Header */}
          <div className="card profile-header-card">
            <div className="avatar avatar-lg" style={{ background: ac.bg, color: ac.fg, width: 64, height: 64 }}>
              {initials(user?.name)}
            </div>
            <div>
              <div className="profile-name">{user?.name}</div>
              <div className="profile-sub">{employee?.role} · {employee?.department}</div>
              <div className="profile-email mono" style={{ color: 'var(--accent)', marginTop: 4 }}>{user?.email}</div>
            </div>
            <div className="profile-score-ring" style={{ '--ring-color': scoreColor(score) }}>
              <div className="profile-score-val" style={{ color: scoreColor(score) }}>{score}%</div>
              <div className="profile-score-lbl">Score</div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="profile-stats-grid">
            <div className="card profile-stat-card">
              <div className="psc-val">{tasks.length}</div>
              <div className="psc-lbl">Total Tasks</div>
            </div>
            <div className="card profile-stat-card">
              <div className="psc-val" style={{ color: 'var(--green)' }}>{done}</div>
              <div className="psc-lbl">Completed</div>
            </div>
            <div className="card profile-stat-card">
              <div className="psc-val" style={{ color: 'var(--amber)' }}>{inProgress}</div>
              <div className="psc-lbl">In Progress</div>
            </div>
            <div className="card profile-stat-card">
              <div className="psc-val" style={{ color: 'var(--red)' }}>{overdue}</div>
              <div className="psc-lbl">Overdue</div>
            </div>
            <div className="card profile-stat-card">
              <div className="psc-val mono" style={{ fontSize: 16 }}>{fmtTime(totalElapsed)}</div>
              <div className="psc-lbl">Total Tracked</div>
            </div>
            <div className="card profile-stat-card">
              <div className="psc-val">{employee?.hoursPerMonth || 0}h</div>
              <div className="psc-lbl">Monthly Target</div>
            </div>
          </div>

          {/* Info cards */}
          <div className="profile-info-grid">
            <div className="card">
              <div className="section-label" style={{ marginBottom: 12 }}>Profile Info</div>
              {[
                ['Full Name', user?.name],
                ['Email', user?.email],
                ['Department', employee?.department],
                ['Role', employee?.role],
                ['Access Level', 'Employee'],
                ['Join Date', employee?.joinDate ? new Date(employee.joinDate).toLocaleDateString('en-GB') : '—'],
              ].map(([label, val]) => (
                <div key={label} className="profile-row">
                  <span>{label}</span>
                  <span className="mono">{val || '—'}</span>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="section-label" style={{ marginBottom: 12 }}>Performance</div>
              {[
                ['Productivity Score', <span style={{ color: scoreColor(score) }}>{score}%</span>],
                ['Performance Level', <span style={{ color: scoreColor(score) }}>{scoreLabel(score)}</span>],
                ['Tasks Completed', done],
                ['Time Tracked', <span className="mono">{fmtTime(totalElapsed)}</span>],
                ['Overdue Tasks', <span style={{ color: 'var(--red)' }}>{overdue}</span>],
                ['Monthly Hours', `${employee?.hoursPerMonth || 0}h`],
              ].map(([label, val]) => (
                <div key={label} className="profile-row">
                  <span>{label}</span>
                  <span>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
