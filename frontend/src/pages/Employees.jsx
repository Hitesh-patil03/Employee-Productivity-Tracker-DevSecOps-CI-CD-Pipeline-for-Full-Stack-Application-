import React, { useState, useEffect, useCallback } from 'react';
import { employeeAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { initials, avatarColor, scoreColor, scoreLabel } from '../utils/helpers';
import Topbar from '../components/shared/Topbar';
import CredentialCard from '../components/admin/CredentialCard';
import './Employees.css';

const DEPTS = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR'];

const EMPTY_FORM = { name: '', email: '', department: 'Engineering', role: '', productivityScore: 75, hoursPerMonth: 160 };

const Employees = () => {
  const toast = useToast();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const [credEmp, setCredEmp] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [newCredentials, setNewCredentials] = useState(null); // shown right after create

  const fetchEmployees = useCallback(async () => {
    try {
      const { data } = await employeeAPI.getAll();
      setEmployees(data);
    } catch (err) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    const matchQ = e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q) || e.loginEmail?.toLowerCase().includes(q);
    const matchD = !deptFilter || e.department === deptFilter;
    return matchQ && matchD;
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.role) { toast.error('Name, email and role are required.'); return; }
    setSaving(true);
    try {
      const { data } = await employeeAPI.create(form);
      setEmployees((prev) => [data.employee, ...prev]);
      setNewCredentials({ ...data.credentials, name: data.employee.name });
      setShowAdd(false);
      setForm(EMPTY_FORM);
      toast.success(`${data.employee.name} added! Credentials ready to share.`);
    } catch (err) {
      toast.error(err.error || 'Failed to create employee');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await employeeAPI.update(editEmp._id, form);
      setEmployees((prev) => prev.map((emp) => emp._id === data._id ? data : emp));
      setEditEmp(null);
      toast.success('Employee updated');
    } catch (err) {
      toast.error(err.error || 'Failed to update employee');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    try {
      await employeeAPI.remove(confirmId);
      setEmployees((prev) => prev.filter((e) => e._id !== confirmId));
      setConfirmId(null);
      toast.success('Employee removed');
    } catch (err) {
      toast.error(err.error || 'Failed to remove employee');
    }
  };

  const openEdit = (emp) => { setEditEmp(emp); setForm({ name: emp.name, email: emp.loginEmail, department: emp.department, role: emp.role, productivityScore: emp.productivityScore, hoursPerMonth: emp.hoursPerMonth }); };

  return (
    <>
      <Topbar
        title="Employee Directory"
        subtitle="MONGODB COLLECTION · FULL CRUD · CREDENTIAL MANAGEMENT"
        actions={
          <button className="btn btn-gold" onClick={() => { setForm(EMPTY_FORM); setShowAdd(true); }}>
            + Add Employee
          </button>
        }
      />
      <div className="page-content">
        {/* Filters */}
        <div className="emp-toolbar">
          <input className="form-input" placeholder="Search by name, role, email…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, maxWidth: 340 }} />
          <select className="form-select" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} style={{ width: 160 }}>
            <option value="">All Departments</option>
            {DEPTS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <div className="emp-count mono muted">{filtered.length} employee{filtered.length !== 1 ? 's' : ''}</div>
        </div>

        {loading ? (
          <div className="empty-state"><span className="spinner spinner-lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">◎</div>
            <div className="empty-state-title">No employees found</div>
            <div>Try adjusting your search or add a new employee.</div>
          </div>
        ) : (
          <div className="emp-grid">
            {filtered.map((emp, i) => {
              const ac = avatarColor(i);
              return (
                <div key={emp._id} className="emp-card">
                  <div className="emp-card-top">
                    <div className="avatar avatar-md" style={{ background: ac.bg, color: ac.fg }}>
                      {initials(emp.name)}
                    </div>
                    <div className="emp-card-info">
                      <div className="emp-card-name">{emp.name}</div>
                      <div className="emp-card-sub">{emp.department} · {emp.role}</div>
                      <div className="emp-card-email mono">{emp.loginEmail}</div>
                    </div>
                  </div>

                  <div className="emp-card-stats">
                    <div className="emp-stat">
                      <div className="emp-stat-val" style={{ color: scoreColor(emp.productivityScore) }}>{emp.productivityScore}%</div>
                      <div className="emp-stat-lbl">Score</div>
                    </div>
                    <div className="emp-stat">
                      <div className="emp-stat-val">{emp.hoursPerMonth}h</div>
                      <div className="emp-stat-lbl">Hours</div>
                    </div>
                    <div className="emp-stat">
                      <div className="emp-stat-val" style={{ color: emp.credentialsShared ? '#34d399' : 'var(--amber)' }}>
                        {emp.credentialsShared ? '✓' : '—'}
                      </div>
                      <div className="emp-stat-lbl">Shared</div>
                    </div>
                  </div>

                  <div className="emp-card-actions">
                    <button className="btn btn-sm btn-ghost" onClick={() => setCredEmp(emp)}>🔑 Credentials</button>
                    <button className="btn btn-sm btn-ghost" onClick={() => openEdit(emp)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => setConfirmId(emp._id)}>Remove</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Credentials Banner (shown right after creating an employee) */}
      {newCredentials && (
        <div className="modal-overlay" onClick={() => setNewCredentials(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">✅ Employee Created — Share Credentials</div>
              <button className="modal-close" onClick={() => setNewCredentials(null)}>×</button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted2)', marginBottom: 18, lineHeight: 1.6 }}>
              <strong>{newCredentials.name}</strong> has been added. Share these login credentials with them securely.
            </p>
            <div className="new-cred-box">
              <div className="new-cred-row"><span>Login URL</span><code>{window.location.origin}/login</code></div>
              <div className="new-cred-row"><span>Role</span><code>Employee</code></div>
              <div className="new-cred-row"><span>Email</span><code>{newCredentials.email}</code></div>
              <div className="new-cred-row"><span>Password</span><code style={{ color: 'var(--gold)' }}>{newCredentials.password}</code></div>
            </div>
            <p className="new-cred-warning">⚠ This password is only shown once here. You can retrieve it later via the 🔑 Credentials button.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={async () => {
                const text = `Produx Login\nURL: ${window.location.origin}/login\nRole: Employee\nEmail: ${newCredentials.email}\nPassword: ${newCredentials.password}`;
                await navigator.clipboard.writeText(text).catch(() => {});
                toast.success('Credentials copied!');
              }}>⎘ Copy All</button>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setNewCredentials(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add New Employee</div>
              <button className="modal-close" onClick={() => setShowAdd(false)}>×</button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" placeholder="e.g. Sarah Chen" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Email (used for login)</label><input className="form-input" type="email" placeholder="sarah.chen@company.io" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Department</label><select className="form-select" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>{DEPTS.map((d) => <option key={d}>{d}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Role / Title</label><input className="form-input" placeholder="e.g. Senior Developer" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Productivity Score</label><input className="form-input" type="number" min="0" max="100" value={form.productivityScore} onChange={(e) => setForm({ ...form, productivityScore: +e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Hours / Month</label><input className="form-input" type="number" min="1" value={form.hoursPerMonth} onChange={(e) => setForm({ ...form, hoursPerMonth: +e.target.value })} /></div>
              </div>
              <div className="form-hint" style={{ marginBottom: 14 }}>🔐 A secure password will be auto-generated and shown to you after creation.</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-gold" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>{saving ? 'Creating...' : 'Create Employee'}</button>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editEmp && (
        <div className="modal-overlay" onClick={() => setEditEmp(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Edit Employee</div>
              <button className="modal-close" onClick={() => setEditEmp(null)}>×</button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Department</label><select className="form-select" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>{DEPTS.map((d) => <option key={d}>{d}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Role / Title</label><input className="form-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Productivity Score</label><input className="form-input" type="number" min="0" max="100" value={form.productivityScore} onChange={(e) => setForm({ ...form, productivityScore: +e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Hours / Month</label><input className="form-input" type="number" min="1" value={form.hoursPerMonth} onChange={(e) => setForm({ ...form, hoursPerMonth: +e.target.value })} /></div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setEditEmp(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Remove */}
      {confirmId && (
        <div className="modal-overlay" onClick={() => setConfirmId(null)}>
          <div className="modal-box modal-box-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title" style={{ color: 'var(--red)' }}>Remove Employee</div>
              <button className="modal-close" onClick={() => setConfirmId(null)}>×</button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted2)', marginBottom: 20, lineHeight: 1.6 }}>
              This employee will be deactivated and their account disabled. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center', background: 'var(--red)', color: '#fff' }} onClick={handleRemove}>Remove</button>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setConfirmId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Credential Card Modal */}
      {credEmp && (
        <CredentialCard
          employee={credEmp}
          onClose={() => setCredEmp(null)}
          onPasswordReset={fetchEmployees}
        />
      )}
    </>
  );
};

export default Employees;
