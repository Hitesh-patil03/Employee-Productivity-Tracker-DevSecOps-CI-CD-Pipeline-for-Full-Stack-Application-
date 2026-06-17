import React, { useState, useEffect, useCallback } from 'react';
import { taskAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Topbar from '../components/shared/Topbar';
import TaskTimer from '../components/employee/TaskTimer';
import './MyTasks.css';

const FILTERS = ['all', 'pending', 'inprogress', 'done', 'overdue'];
const FILTER_LABELS = { all: 'All', pending: 'Pending', inprogress: 'In Progress', done: 'Done', overdue: 'Overdue' };

const MyTasks = () => {
  const { employee } = useAuth();
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await taskAPI.getAll();
      setTasks(data);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleUpdate = (updatedTask) => {
    setTasks((prev) => prev.map((t) => t._id === updatedTask._id ? updatedTask : t));
  };

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'all' ? tasks.length : tasks.filter((t) => t.status === f).length;
    return acc;
  }, {});

  return (
    <>
      <Topbar
        title="My Tasks"
        subtitle="TIMER · START / STOP · TRACK PROGRESS"
      />
      <div className="page-content">
        {/* Summary strip */}
        <div className="my-tasks-summary">
          <div className="mts-item">
            <div className="mts-val">{counts.all}</div>
            <div className="mts-lbl">Total</div>
          </div>
          <div className="mts-item">
            <div className="mts-val" style={{ color: 'var(--amber)' }}>{counts.inprogress}</div>
            <div className="mts-lbl">In Progress</div>
          </div>
          <div className="mts-item">
            <div className="mts-val" style={{ color: 'var(--green)' }}>{counts.done}</div>
            <div className="mts-lbl">Done</div>
          </div>
          <div className="mts-item">
            <div className="mts-val" style={{ color: 'var(--red)' }}>{counts.overdue}</div>
            <div className="mts-lbl">Overdue</div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="my-tasks-filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`tasks-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {FILTER_LABELS[f]}
              {counts[f] > 0 && <span className="filter-count">{counts[f]}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="empty-state"><span className="spinner spinner-lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">☰</div>
            <div className="empty-state-title">No tasks here</div>
            <div>{filter === 'all' ? 'Your admin has not assigned any tasks yet.' : `No ${FILTER_LABELS[filter].toLowerCase()} tasks.`}</div>
          </div>
        ) : (
          <div className="my-tasks-list">
            {filtered.map((task) => (
              <TaskTimer key={task._id} task={task} onUpdate={handleUpdate} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyTasks;
