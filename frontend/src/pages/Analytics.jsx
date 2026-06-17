import React, { useEffect, useState } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js';
import { analyticsAPI } from '../utils/api';
import { DEPT_COLORS, DEPTS } from '../utils/helpers';
import Topbar from '../components/shared/Topbar';
import './Analytics.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

const OPTS = (legend = false) => ({
  responsive: true, maintainAspectRatio: true,
  plugins: {
    legend: { display: legend, position: 'top', labels: { color: '#64748b', font: { size: 10 }, boxWidth: 9, padding: 10 } },
    tooltip: { backgroundColor: '#0d1117', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: 'rgba(148,163,184,0.15)', borderWidth: 1 },
  },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b', font: { size: 10 } } },
    y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b', font: { size: 10 } } },
  },
});

const Analytics = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getDepartments().then(({ data }) => setDepartments(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];

  return (
    <>
      <Topbar title="Analytics & Reports" subtitle="MULTI-DIMENSIONAL · CHART.JS · MONGODB" />
      <div className="page-content">
        <div className="analytics-grid-2">
          <div className="card">
            <div className="card-title">Productivity by Department</div>
            <div className="card-sub section-label">MONTHLY COMPARISON</div>
            <Bar
              data={{ labels: DEPTS, datasets: [{ label: 'This Month', data: DEPTS.map(() => rnd(64, 93)), backgroundColor: '#4f9cf988', borderRadius: 4 }, { label: 'Last Month', data: DEPTS.map(() => rnd(60, 89)), backgroundColor: '#a78bfa88', borderRadius: 4 }] }}
              options={OPTS(true)} height={180}
            />
          </div>
          <div className="card">
            <div className="card-title">Task Completion Rate</div>
            <div className="card-sub section-label">WEEKLY BREAKDOWN</div>
            <Bar
              data={{ labels: weeks, datasets: [{ label: 'Done', data: [40,52,48,61,55,70,64,72], backgroundColor: '#34d39999', borderRadius: 4, stack: 's' }, { label: 'Pending', data: [12,10,15,9,13,8,11,7], backgroundColor: '#fbbf2499', borderRadius: 4, stack: 's' }, { label: 'Overdue', data: [5,3,7,4,6,3,4,2], backgroundColor: '#f8717199', borderRadius: 4, stack: 's' }] }}
              options={OPTS(true)} height={180}
            />
          </div>
        </div>

        <div className="card analytics-full">
          <div className="card-title">Team Performance Over 6 Months</div>
          <div className="card-sub section-label">MULTI-TEAM TREND</div>
          <Line
            data={{ labels: months, datasets: DEPTS.map((d, i) => ({ label: d, data: months.map(() => rnd(60, 95)), borderColor: DEPT_COLORS[i], backgroundColor: 'transparent', tension: 0.4, pointRadius: 3, borderWidth: 2 })) }}
            options={OPTS(true)} height={110}
          />
        </div>

        <div className="analytics-grid-2">
          <div className="card">
            <div className="card-title">Attendance Rate</div>
            <div className="card-sub section-label">BY DEPARTMENT · THIS QUARTER</div>
            <Bar
              data={{ labels: DEPTS, datasets: [{ data: DEPTS.map(() => rnd(84, 99)), backgroundColor: DEPT_COLORS, borderRadius: 4 }] }}
              options={OPTS()} height={180}
            />
          </div>
          <div className="card">
            <div className="card-title">Department Distribution</div>
            <div className="card-sub section-label">HEADCOUNT BY TEAM</div>
            <div className="analytics-doughnut-wrap">
              <Doughnut
                data={{ labels: DEPTS, datasets: [{ data: departments.map((d) => d.count || rnd(2, 8)), backgroundColor: DEPT_COLORS, borderWidth: 0, hoverOffset: 6 }] }}
                options={{ responsive: true, maintainAspectRatio: true, cutout: '62%', plugins: { legend: { display: true, position: 'bottom', labels: { color: '#64748b', font: { size: 10 }, boxWidth: 9, padding: 8 } }, tooltip: { backgroundColor: '#0d1117', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: 'rgba(148,163,184,0.15)', borderWidth: 1 } } }}
                height={180}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Analytics;
