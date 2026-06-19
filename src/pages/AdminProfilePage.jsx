import React, { useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Save,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  KeyRound,
} from 'lucide-react';

const inputStyle = {
  width: '100%',
  padding: '0.75rem 0.875rem',
  borderRadius: 10,
  border: '1px solid #e2e8f0',
  outline: 'none',
  fontSize: '0.9rem',
  background: '#fafafa',
  color: '#1a1a1a',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const InputField = ({ label, icon: Icon, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      {Icon && <Icon size={12} />} {label}
    </label>
    <input
      {...props}
      style={inputStyle}
      onFocus={e => Object.assign(e.target.style, { borderColor: '#00A859', boxShadow: '0 0 0 3px #00a85920', background: '#fff' })}
      onBlur={e => Object.assign(e.target.style, { borderColor: '#e2e8f0', boxShadow: 'none', background: '#fafafa' })}
    />
  </div>
);

const SectionCard = ({ icon: Icon, title, children }) => (
  <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#00a85910', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color="#00A859" />
      </div>
      <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1a1a1a' }}>{title}</h3>
    </div>
    {children}
  </div>
);

const PasswordInput = ({ label, value, onChange, placeholder, icon }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        {icon} {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{ ...inputStyle, paddingRight: '2.75rem' }}
          onFocus={e => Object.assign(e.target.style, { borderColor: '#00A859', boxShadow: '0 0 0 3px #00a85920', background: '#fff' })}
          onBlur={e => Object.assign(e.target.style, { borderColor: '#e2e8f0', boxShadow: 'none', background: '#fafafa' })}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          style={{
            position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#94a3b8',
            display: 'flex', alignItems: 'center',
          }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
};

export default function AdminProfilePage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const getPasswordStrength = (pwd) => {
    if (!pwd) return null;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { label: 'Weak', color: '#FF3B30', pct: 25 };
    if (score === 2) return { label: 'Fair', color: '#FF9500', pct: 50 };
    if (score === 3) return { label: 'Good', color: '#F59E0B', pct: 75 };
    return { label: 'Strong', color: '#34C759', pct: 100 };
  };

  const strength = getPasswordStrength(passwordForm.new_password);

  const handlePasswordChange = async () => {
    if (!passwordForm.current_password) {
      toast.error('Please enter your current password');
      return;
    }
    if (!passwordForm.new_password) {
      toast.error('Please enter a new password');
      return;
    }
    if (passwordForm.new_password.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setChangingPassword(true);
      await client('/admin/change-password', {
        method: 'POST',
        body: {
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
          new_password_confirmation: passwordForm.new_password_confirmation,
        },
      });
      toast.success('Password changed successfully');
      setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.25rem', fontWeight: 800 }}>
          <User size={20} color="#00A859" /> My Profile
        </h2>
        <p style={{ marginTop: '0.4rem', color: '#94a3b8', fontSize: '0.9rem' }}>
          View your account details and manage your password.
        </p>
      </div>

      {/* Profile Info */}
      <SectionCard icon={User} title="Account Information">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #00A859 0%, #007A3F 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '1.75rem', fontWeight: 800, flexShrink: 0,
            boxShadow: '0 4px 12px rgba(0, 168, 89, 0.3)',
          }}>
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1a1a1a' }}>{user?.name || 'Admin'}</h3>
            <p style={{ margin: '0.2rem 0 0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>{user?.email}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.25rem 0.75rem', borderRadius: 99,
                background: '#00a85915', color: '#00A859',
                fontSize: '0.75rem', fontWeight: 700,
              }}>
                <Shield size={11} /> Administrator
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              <Mail size={12} /> Email
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a1a1a' }}>{user?.email || 'N/A'}</div>
          </div>
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              <Phone size={12} /> Phone
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a1a1a' }}>{user?.phone || 'N/A'}</div>
          </div>
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              <Shield size={12} /> Role
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a1a1a', textTransform: 'capitalize' }}>{user?.role || 'admin'}</div>
          </div>
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              <Calendar size={12} /> Member Since
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a1a1a' }}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Change Password */}
      <SectionCard icon={KeyRound} title="Change Password">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 480 }}>
          <PasswordInput
            label="Current Password"
            icon={<Lock size={12} />}
            value={passwordForm.current_password}
            onChange={e => setPasswordForm(p => ({ ...p, current_password: e.target.value }))}
            placeholder="Enter your current password"
          />
          <PasswordInput
            label="New Password"
            icon={<KeyRound size={12} />}
            value={passwordForm.new_password}
            onChange={e => setPasswordForm(p => ({ ...p, new_password: e.target.value }))}
            placeholder="Enter new password"
          />

          {/* Password strength */}
          {strength && (
            <div style={{ marginTop: '-0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ flex: 1, height: 5, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${strength.pct}%`, height: '100%', background: strength.color, borderRadius: 4, transition: 'width 0.3s' }} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: strength.color, minWidth: 42 }}>{strength.label}</span>
              </div>
            </div>
          )}

          <PasswordInput
            label="Confirm New Password"
            icon={<KeyRound size={12} />}
            value={passwordForm.new_password_confirmation}
            onChange={e => setPasswordForm(p => ({ ...p, new_password_confirmation: e.target.value }))}
            placeholder="Confirm your new password"
          />

          {/* Password tips */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '1rem', marginTop: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
              <CheckCircle2 size={14} color="#00A859" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534' }}>Password Requirements</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {[
                'At least 8 characters long',
                'Include uppercase & lowercase letters',
                'At least one number',
                'A special character (!@#$%^&*)',
              ].map(tip => (
                <div key={tip} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={11} color="#00A859" />
                  <span style={{ fontSize: '0.8rem', color: '#166534' }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handlePasswordChange}
            disabled={changingPassword || !passwordForm.current_password || !passwordForm.new_password || !passwordForm.new_password_confirmation}
            style={{
              padding: '0.75rem 1.5rem', borderRadius: 10, border: 'none',
              background: changingPassword ? '#94a3b8' : '#00A859', color: '#fff',
              fontWeight: 700, fontSize: '0.9rem', cursor: changingPassword ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              alignSelf: 'flex-start', transition: 'background 0.2s',
            }}
          >
            <Lock size={16} /> {changingPassword ? 'Changing Password...' : 'Update Password'}
          </button>
        </div>
      </SectionCard>
    </DashboardLayout>
  );
}
