import React, { useState } from 'react';
import { employeeAPI } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { copyToClipboard } from '../../utils/helpers';
import './CredentialCard.css';

/**
 * CredentialCard — shown to admin when they want to share login credentials
 * with an employee. Fetches plain credentials and lets admin copy or display them.
 */
const CredentialCard = ({ employee, onClose, onPasswordReset }) => {
  const toast = useToast();
  const [creds, setCreds] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [copied, setCopied] = useState('');

  const fetchCreds = async () => {
    setLoading(true);
    try {
      const { data } = await employeeAPI.getCredentials(employee._id);
      setCreds(data);
    } catch (err) {
      toast.error(err.error || 'Failed to fetch credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text, field) => {
    const ok = await copyToClipboard(text);
    if (ok) { setCopied(field); setTimeout(() => setCopied(''), 2000); toast.success(`${field} copied!`); }
    else toast.error('Copy failed');
  };

  const handleCopyAll = async () => {
    const text = `Produx Login Credentials\n\nRole: Employee\nEmail: ${creds.email}\nPassword: ${creds.password}\nLogin URL: ${window.location.origin}/login`;
    const ok = await copyToClipboard(text);
    if (ok) toast.success('All credentials copied!');
  };

  const handleReset = async () => {
    if (!window.confirm(`Reset password for ${employee.name}? They will need new credentials to log in.`)) return;
    setResetting(true);
    try {
      const { data } = await employeeAPI.resetPassword(employee._id);
      setCreds(data);
      setShowPass(true);
      toast.success('Password reset successfully');
      onPasswordReset && onPasswordReset();
    } catch (err) {
      toast.error(err.error || 'Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">🔑 Login Credentials</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="cred-employee-info">
          <div className="cred-emp-name">{employee.name}</div>
          <div className="cred-emp-meta">{employee.department} · {employee.role}</div>
          {employee.credentialsShared && (
            <div className="cred-shared-badge">✓ Credentials previously shared</div>
          )}
        </div>

        {!creds ? (
          <div className="cred-reveal-section">
            <p className="cred-reveal-desc">
              Click below to reveal this employee's login credentials. Share them securely so they can log in to Produx.
            </p>
            <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }} onClick={fetchCreds} disabled={loading}>
              {loading ? <><span className="spinner" />Loading...</> : '🔓 Reveal Credentials'}
            </button>
          </div>
        ) : (
          <div className="cred-display">
            <div className="cred-field">
              <div className="cred-field-label">Login URL</div>
              <div className="cred-field-value-row">
                <div className="cred-field-value">{window.location.origin}/login</div>
                <button className="cred-copy-btn" onClick={() => handleCopy(`${window.location.origin}/login`, 'URL')}>
                  {copied === 'URL' ? '✓' : '⎘'}
                </button>
              </div>
            </div>
            <div className="cred-field">
              <div className="cred-field-label">Role</div>
              <div className="cred-field-value-row">
                <div className="cred-field-value">Employee</div>
              </div>
            </div>
            <div className="cred-field">
              <div className="cred-field-label">Email</div>
              <div className="cred-field-value-row">
                <div className="cred-field-value">{creds.email}</div>
                <button className="cred-copy-btn" onClick={() => handleCopy(creds.email, 'Email')}>
                  {copied === 'Email' ? '✓' : '⎘'}
                </button>
              </div>
            </div>
            <div className="cred-field">
              <div className="cred-field-label">Password</div>
              <div className="cred-field-value-row">
                <div className="cred-field-value cred-password">
                  {showPass ? creds.password : '••••••••••'}
                </div>
                <button className="cred-copy-btn" onClick={() => setShowPass((v) => !v)}>
                  {showPass ? '🙈' : '👁'}
                </button>
                <button className="cred-copy-btn" onClick={() => handleCopy(creds.password, 'Password')}>
                  {copied === 'Password' ? '✓' : '⎘'}
                </button>
              </div>
            </div>

            <div className="cred-actions">
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleCopyAll}>
                ⎘ Copy All
              </button>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={handleReset} disabled={resetting}>
                {resetting ? 'Resetting...' : '↺ Reset Password'}
              </button>
            </div>

            <div className="cred-warning">
              ⚠ Share these credentials securely. Do not send passwords over public channels.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CredentialCard;
