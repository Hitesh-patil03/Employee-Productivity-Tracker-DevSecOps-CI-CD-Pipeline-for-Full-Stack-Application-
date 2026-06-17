import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Login.css';

const Login = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectRole = (r) => {
    setRole(r);
    setError('');
    setEmail('');
    setPassword('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!role) { setError('Please select a role first.'); return; }
    if (!email || !password) { setError('Email and password are required.'); return; }
    setLoading(true);
    setError('');
    try {
      await login(email, password, role);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.error || 'Invalid credentials. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-grid-bg" />
      <div className="login-wrap">
        <div className="login-brand">
          <div className="login-brand-mark">◈ Produx Platform</div>
          <h1 className="login-brand-name">Employee<br />Productivity</h1>
          <div className="login-brand-sub">TRACKER · v3.0 · REACT + NODE + MONGODB</div>
        </div>

        {/* Role selector */}
        <div className="login-roles">
          {['employee', 'admin'].map((r) => (
            <button
              key={r}
              className={`role-card role-${r} ${role === r ? 'selected' : ''}`}
              onClick={() => handleSelectRole(r)}
              type="button"
            >
              {role === r && <span className="role-check">✓</span>}
              <div className="role-icon">{r === 'admin' ? '⚙️' : '👤'}</div>
              <div className="role-name">{r === 'admin' ? 'Admin' : 'Employee'}</div>
              <div className="role-desc">
                {r === 'admin' ? 'Full access · manage all data' : 'Login with admin-issued credentials'}
              </div>
            </button>
          ))}
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          {role === 'employee' && (
            <div className="login-cred-hint">
              <span className="login-cred-icon">ℹ</span>
              Use the login credentials shared by your admin to sign in.
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button
            type="submit"
            className={`btn login-submit-btn ${!role ? '' : role === 'admin' ? 'btn-gold' : 'btn-primary'}`}
            disabled={loading || !role}
          >
            {loading
              ? <><span className="spinner" /> Signing in...</>
              : role
                ? `Login as ${role === 'admin' ? 'Admin' : 'Employee'}`
                : 'Select a role above'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
