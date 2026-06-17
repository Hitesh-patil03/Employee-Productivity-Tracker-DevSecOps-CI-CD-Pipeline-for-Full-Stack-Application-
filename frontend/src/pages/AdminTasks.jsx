import React, { useState, useEffect, useCallback } from 'react';
import { taskAPI, employeeAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { priColor, statusLabel, statusClass, fmtTime, fmtDate, initials, avatarColor } from '../utils/helpers';
import Topbar from '../components/shared/Topbar';
import './AdminTasks.css';

const CATS = ['Feature Dev', 'Bug Fix', 'Code Review', 'Documentation', 'Meeting', 'Research', 'Testing', 'Deployment'];
const EMPTY_FORM = { title: '', description: '', assignedTo: '', category: 'Feature Dev', priority: 'med', dueDate: '', allocatedHours: '' };

// ── TaskForm moved OUTSIDE AdminTasks to prevent re-mount on every keystroke ──
const TaskForm = ({ title, submitLabel, form, setForm, onSubmit, onClose, employees, preselectedEmp, saving, isEdit }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-box modal-box-lg" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <div className="modal-title">{title}</div>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
      <form onSubmit={onSubmit}>
        {preselectedEmp && (
          <div className="assign-to-banner">
            Assigning to: <strong style={{ color: 'var(--gold)' }}>{preselectedEmp.name}</strong>
            <span style={{ color: 'var(--muted2)', marginLeft: 6 }}>{preselectedEmp.department}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Task Title *</label>
          <input
            className="form-input"
            placeholder="e.g. Build user authentication module"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">Task Description</label>
          <textarea
            className="form-textarea"
            placeholder="Detailed instructions, requirements, resources or notes for the employee…"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={4}
          />
        </div>

        {!preselectedEmp && (
          <div className="form-group">
            <label className="form-label">Assign To *</label>
            <select
              className="form-select"
              value={form.assignedTo}
              onChange={(e) => setForm((prev) => ({ ...prev, assignedTo: e.target.value }))}
              required
            >
              <option value="">— Select Employee —</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>{emp.name} ({emp.department})</option>
              ))}
            </select>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            >
              {CATS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <div className="priority-pills">
              {['low', 'med', 'high'].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`pri-pill ${form.priority === p ? `pri-pill-${p}` : ''}`}
                  onClick={() => setForm((prev) => ({ ...prev, priority: p }))}
                >{p}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input
              className="form-input"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Time Limit (hours)</label>
            <input
              className="form-input"
              type="number"
              min="0"
              step="0.5"
              placeholder="e.g. 8"
              value={form.allocatedHours}
              onChange={(e) => setForm((prev) => ({ ...prev, allocatedHours: e.target.value }))}
            />
            <div className="form-hint">Employee timer will track against this limit</div>
          </div>
        </div>

        {isEdit && (
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
            >
              {['pending', 'inprogress', 'done', 'overdue'].map((s) => (
                <option key={s} value={s}>{statusLabel(s)}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button type="submit" className="btn btn-gold" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>
            {saving ? 'Saving…' : submitLabel}
          </button>
          <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
);

// ── Confirm Delete Modal ──
const ConfirmModal = ({ onConfirm, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-box modal-box-sm" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <div className="modal-title" style={{ color: 'var(--red)' }}>Delete Task</div>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted2)', marginBottom: 20, lineHeight: 1.6 }}>
        This task and all timer data will be permanently deleted. This cannot be undone.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          className="btn"
          style={{ flex: 1, justifyContent: 'center', background: 'var(--red)', color: '#fff', border: 'none' }}
          onClick={onConfirm}
        >Delete</button>
        <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
      </div>
    </div>
  </div>
);

// ── Main AdminTasks Component ──
const AdminTasks = () => {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAssign, setShowAssign] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [preselectedEmp, setPreselectedEmp] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [tRes, eRes] = await Promise.all([taskAPI.getAll(), employeeAPI.getAll()]);
      setTasks(tRes.data);
      setEmployees(eRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);
  const counts = { all: tasks.length, pending: 0, inprogress: 0, done: 0, overdue: 0 };
  tasks.forEach((t) => { if (counts[t.status] !== undefined) counts[t.status]++; });

  const openAssign = (emp = null) => {
    const due = new Date();
    due.setDate(due.getDate() + 7);
    setForm({ ...EMPTY_FORM, dueDate: due.toISOString().split('T')[0], assignedTo: emp?._id || '' });
    setPreselectedEmp(emp);
    setShowAssign(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.assignedTo) { toast.error('Title and employee are required.'); return; }
    setSaving(true);
    try {
      const { data } = await taskAPI.create({
        ...form,
        allocatedHours: parseFloat(form.allocatedHours) || 0,
        dueDate: form.dueDate || null,
      });
      setTasks((prev) => [data, ...prev]);
      setShowAssign(false);
      setPreselectedEmp(null);
      setForm(EMPTY_FORM);
      const emp = employees.find((e) => e._id === (data.assignedTo?._id || form.assignedTo));
      toast.success(`Task assigned to ${emp?.name || 'employee'} ✓`);
    } catch (err) {
      toast.error(err.error || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await taskAPI.update(editTask._id, {
        ...form,
        allocatedHours: parseFloat(form.allocatedHours) || 0,
        dueDate: form.dueDate || null,
      });
      setTasks((prev) => prev.map((t) => t._id === data._id ? data : t));
      setEditTask(null);
      setForm(EMPTY_FORM);
      toast.success('Task updated ✓');
    } catch (err) {
      toast.error(err.error || 'Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      assignedTo: task.assignedTo?._id || task.assignedTo,
      category: task.category,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      allocatedHours: task.allocatedHours || '',
    });
  };

  const handleDelete = async () => {
    try {
      await taskAPI.remove(confirmId);
      setTasks((prev) => prev.filter((t) => t._id !== confirmId));
      setConfirmId(null);
      toast.success('Task deleted');
    } catch (err) {
      toast.error(err.error || 'Failed to delete task');
    }
  };

  return (
    <>
      <Topbar
        title="All Tasks"
        subtitle="ASSIGN & MANAGE · FULL CRUD"
        actions={
          <button className="btn btn-gold" onClick={() => openAssign()}>+ Assign Task</button>
        }
      />
      <div className="page-content">
        {/* Filter tabs */}
        <div className="admin-tasks-filters">
          {Object.entries(counts).map(([f, count]) => (
            <button
              key={f}
              className={`tasks-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : statusLabel(f)}
              {count > 0 && <span className="filter-count">{count}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="empty-state"><span className="spinner spinner-lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">☰</div>
            <div className="empty-state-title">No tasks</div>
            <div>Use "+ Assign Task" to create the first task.</div>
          </div>
        ) : (
          <div className="admin-tasks-list">
            {filtered.map((task) => {
              const emp = task.assignedTo;
              const empIdx = employees.findIndex((e) => e._id === emp?._id);
              const ac = avatarColor(empIdx >= 0 ? empIdx : 0);
              const limitSec = (task.allocatedHours || 0) * 3600;
              const pct = limitSec > 0 ? Math.min(100, Math.round((task.elapsedSeconds / limitSec) * 100)) : 0;
              const progColor = pct > 90 ? '#f87171' : pct > 65 ? '#fbbf24' : '#34d399';

              return (
                <div key={task._id} className="admin-task-card">
                  <div className="atc-header">
                    <div className="atc-header-left">
                      <div className="atc-priority-dot" style={{ background: priColor(task.priority) }} />
                      <div>
                        <div className="atc-title">{task.title}</div>
                        {task.description && <div className="atc-desc">{task.description}</div>}
                      </div>
                    </div>
                    <span className={statusClass(task.status)}>{statusLabel(task.status)}</span>
                  </div>

                  <div className="atc-meta">
                    <div className="atc-meta-chip">📁 {task.category}</div>
                    <div className="atc-meta-chip" style={{ color: priColor(task.priority) }}>● {task.priority}</div>
                    <div className="atc-meta-chip">📅 {fmtDate(task.dueDate)}</div>
                    {task.allocatedHours > 0 && (
                      <div className="atc-meta-chip">⏱ {task.allocatedHours}h · {fmtTime(task.elapsedSeconds || 0)} logged</div>
                    )}
                    {emp && (
                      <div className="atc-assignee">
                        <div className="avatar avatar-sm" style={{ background: ac.bg, color: ac.fg }}>{initials(emp.name)}</div>
                        <span>{emp.name}</span>
                        <span style={{ color: 'var(--muted)' }}>· {emp.department}</span>
                      </div>
                    )}
                  </div>

                  {limitSec > 0 && (
                    <div className="atc-progress">
                      <div className="progress-bar" style={{ height: 4 }}>
                        <div className="progress-fill" style={{ width: `${pct}%`, background: progColor }} />
                      </div>
                      <div className="atc-progress-label">{pct}% of time used</div>
                    </div>
                  )}

                  <div className="atc-actions">
                    <button className="btn btn-sm btn-ghost" onClick={() => openAssign(emp)}>+ More Task</button>
                    <button className="btn btn-sm btn-ghost" onClick={() => openEdit(task)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => setConfirmId(task._id)}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assign Task Modal */}
      {showAssign && (
        <TaskForm
          title="Assign New Task"
          submitLabel="Assign Task"
          form={form}
          setForm={setForm}
          onSubmit={handleCreate}
          onClose={() => { setShowAssign(false); setPreselectedEmp(null); setForm(EMPTY_FORM); }}
          employees={employees}
          preselectedEmp={preselectedEmp}
          saving={saving}
          isEdit={false}
        />
      )}

      {/* Edit Task Modal */}
      {editTask && (
        <TaskForm
          title="Edit Task"
          submitLabel="Save Changes"
          form={form}
          setForm={setForm}
          onSubmit={handleEdit}
          onClose={() => { setEditTask(null); setForm(EMPTY_FORM); }}
          employees={employees}
          preselectedEmp={null}
          saving={saving}
          isEdit={true}
        />
      )}

      {/* Confirm Delete Modal */}
      {confirmId && (
        <ConfirmModal
          onConfirm={handleDelete}
          onClose={() => setConfirmId(null)}
        />
      )}
    </>
  );
};

export default AdminTasks;
