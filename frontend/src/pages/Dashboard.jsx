import React, { useState, useEffect } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend, Filler } from 'chart.js';
import { analyticsAPI, taskAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { scoreColor, scoreLabel, DEPT_COLORS, DEPTS, fmtTime } from '../utils/helpers';
import Topbar from '../components/shared/Topbar';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend, Filler);

const CHART_DEFAULTS = {
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: '#0d1117', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: 'rgba(148,163,184,0.15)', borderWidth: 1 },
  },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b', font: { size: 10 } } },
    y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b', font: { size: 10 } } },
  },
  responsive: true,
  maintainAspectRatio: true,
};

const KPICard = ({ label, value, change, changeUp, color }) => (
  <div className="kpi-card" style={{ '--kpi-color': color }}>
    <div className="kpi-accent" />
    <div className="kpi-label">{label}</div>
    <div className="kpi-value">{value}</div>
    {change && <div className={`kpi-change ${changeUp ? 'up' : 'dn'}`}>{change}</div>}
  </div>
);

const Dashboard = () => {
  const { isAdmin, employee, user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [topPerformers, setTopPerformers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (isAdmin) {
          const [s, t, d] = await Promise.all([analyticsAPI.getSummary(), analyticsAPI.getTopPerformers(), analyticsAPI.getDepartments()]);
          setSummary(s.data); setTopPerformers(t.data); setDepartments(d.data);
        } else {
          const [s, tasks] = await Promise.all([analyticsAPI.getSummary(), taskAPI.getAll()]);
          setSummary(s.data); setMyTasks(tasks.data);
        }
      } catch (_) {}
      finally { setLoading(false); }
    };
    load();
  }, [isAdmin]);

  const trendLabels = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 13 + i); return d.getDate() + ''; });
  const trendData = trendLabels.map(() => Math.floor(60 + Math.random() * 35));

  const taskStatusCounts = isAdmin
    ? [summary?.tasksByStatus?.pending || 0, summary?.tasksByStatus?.inprogress || 0, summary?.tasksByStatus?.done || 0, summary?.tasksByStatus?.overdue || 0]
    : [myTasks.filter(t => t.status === 'pending').length, myTasks.filter(t => t.status === 'inprogress').length, myTasks.filter(t => t.status === 'done').length, myTasks.filter(t => t.status === 'overdue').length];

  if (loading) return (
    <>
      <Topbar title="Dashboard" subtitle="LOADING…" />
      <div className="page-content"><div className="empty-state"><span className="spinner spinner-lg" /></div></div>
    </>
  );

  return (
    <>
      <Topbar
        title={isAdmin ? 'Dashboard Overview' : `Welcome back, ${user?.name?.split(' ')[0]}`}
        subtitle="REAL-TIME · MONGODB · NODE.JS API"
      />
      <div className="page-content">
        {/* KPI Grid */}
        <div className="kpi-grid">
          {isAdmin ? (
            <>
              <KPICard label="Total Employees" value={summary?.totalEmployees || 0} change={`↑ active`} changeUp color="var(--accent)" />
              <KPICard label="Avg Productivity" value={`${summary?.avgProductivity || 0}%`} change="↑ 4.2% vs last month" changeUp color="var(--green)" />
              <KPICard label="Total Tasks" value={summary?.totalTasks || 0} change={`${summary?.completedTasks || 0} completed`} changeUp color="var(--amber)" />
              <KPICard label="Overdue Tasks" value={summary?.overdueTasks || 0} change="needs attention" changeUp={false} color="var(--red)" />
            </>
          ) : (
            <>
              <KPICard label="My Score" value={`${employee?.productivityScore || 0}%`} change={scoreLabel(employee?.productivityScore || 0)} changeUp={(employee?.productivityScore || 0) >= 80} color="var(--accent)" />
              <KPICard label="Total Tasks" value={myTasks.length} change={`${myTasks.filter(t => t.status === 'done').length} done`} changeUp color="var(--green)" />
              <KPICard label="In Progress" value={myTasks.filter(t => t.status === 'inprogress').length} change="active now" changeUp color="var(--amber)" />
              <KPICard label="Overdue" value={myTasks.filter(t => t.status === 'overdue').length} change="needs action" changeUp={false} color="var(--red)" />
            </>
          )}
        </div>

        <div className="dash-charts-row">
          <div className="card">
            <div className="card-title">Productivity Trend</div>
            <div className="card-sub section-label">DAILY AVERAGE · 14 DAYS</div>
            <Line
              data={{ labels: trendLabels, datasets: [{ data: trendData, borderColor: '#4f9cf9', backgroundColor: 'rgba(79,156,249,0.07)', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 }] }}
              options={CHART_DEFAULTS}
              height={130}
            />
          </div>
          <div className="card">
            <div className="card-title">Task Distribution</div>
            <div className="card-sub section-label">BY STATUS</div>
            <Doughnut
              data={{ labels: ['Pending', 'In Progress', 'Done', 'Overdue'], datasets: [{ data: taskStatusCounts, backgroundColor: ['#94a3b8', '#fbbf24', '#34d399', '#f87171'], borderWidth: 0, hoverOffset: 6 }] }}
              options={{ responsive: true, maintainAspectRatio: true, cutout: '65%', plugins: { legend: { display: true, position: 'bottom', labels: { color: '#64748b', font: { size: 10 }, boxWidth: 9, padding: 8 } }, tooltip: CHART_DEFAULTS.plugins.tooltip } }}
              height={130}
            />
          </div>
        </div>

        {isAdmin && (
          <div className="dash-bottom-row">
            <div className="card">
              <div className="card-title">Top Performers</div>
              <div className="section-label" style={{ marginBottom: 10 }}>RANKED BY SCORE</div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>#</th><th>Name</th><th>Dept</th><th>Score</th></tr></thead>
                  <tbody>
                    {topPerformers.slice(0, 7).map((emp, i) => (
                      <tr key={emp._id}>
                        <td className="mono muted">{i + 1}</td>
                        <td style={{ fontWeight: 500 }}>{emp.name}</td>
                        <td className="muted" style={{ fontSize: 11 }}>{emp.department}</td>
                        <td>
                          <div className="progress-wrap">
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: `${emp.productivityScore}%`, background: scoreColor(emp.productivityScore) }} />
                            </div>
                            <span className="mono" style={{ fontSize: 11 }}>{emp.productivityScore}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-title">Department Breakdown</div>
              <div className="section-label" style={{ marginBottom: 12 }}>AVG PRODUCTIVITY</div>
              <div className="dept-bars">
                {departments.map((d, i) => (
                  <div key={d._id} className="dept-bar-item">
                    <div className="dept-bar-header">
                      <span className="dept-bar-name">{d._id}</span>
                      <span className="dept-bar-score mono">{Math.round(d.avgScore)}%</span>
                    </div>
                    <div className="progress-bar" style={{ height: 5 }}>
                      <div className="progress-fill" style={{ width: `${Math.round(d.avgScore)}%`, background: DEPT_COLORS[i % 5] }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!isAdmin && myTasks.length > 0 && (
          <div className="card">
            <div className="card-title">My Recent Tasks</div>
            <div className="section-label" style={{ marginBottom: 10 }}>LATEST ASSIGNED</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Task</th><th>Category</th><th>Time Logged</th><th>Status</th></tr></thead>
                <tbody>
                  {myTasks.slice(0, 5).map((t) => (
                    <tr key={t._id}>
                      <td style={{ fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</td>
                      <td className="muted" style={{ fontSize: 11 }}>{t.category}</td>
                      <td className="mono" style={{ fontSize: 11 }}>{fmtTime(t.elapsedSeconds || 0)}</td>
                      <td><span className={`badge badge-${t.status}`}>{t.status === 'inprogress' ? 'In Progress' : t.status.charAt(0).toUpperCase() + t.status.slice(1)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
