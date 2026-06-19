import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import {
  LayoutDashboard,
  AlertTriangle,
  Eye,
  Loader2
} from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired')) {
      setError('Your session has expired. Please login again.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const loadingToast = toast.loading('Logging in...');

    try {
      setLoading(true);
      const data = await client('/auth/login', {
        body: { email, password }
      });

      if (data.user.role !== 'admin' && data.user.role !== 'branch_manager') {
        toast.error('Access denied. Unauthorized role.', { id: loadingToast });
        setError('Access denied. Unauthorized role.');
        setLoading(false);
        return;
      }

      toast.success('Login successful', { id: loadingToast });
      login(data.user, data.access_token);

      if (data.user.role === 'branch_manager') {
        navigate('/branch-manager/dashboard');
      } else {
        const origin = location.state?.from?.pathname || '/';
        navigate(origin);
      }
    } catch (err) {
      toast.error(err.message || 'Invalid credentials', { id: loadingToast });
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #00A859 0%, #007A3F 100%)',
      padding: '2rem',
      position: 'relative'
    }}>
      <form onSubmit={handleSubmit} style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '420px',
        padding: '2.5rem',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            backgroundColor: '#E8F8EE',
            borderRadius: '50%',
            margin: '0 auto 1rem'
          }}>
            <LayoutDashboard size={24} color="#00A859" />
          </div>
          <h1 style={{
            color: '#00A859',
            fontSize: '1.8rem',
            fontWeight: '700',
            margin: '0 0 0.5rem 0',
            letterSpacing: '-0.5px'
          }}>LNE Portal</h1>
          <p style={{
            color: '#666',
            fontSize: '1rem',
            margin: 0,
            fontWeight: '400'
          }}>Secure Access to Business Portal</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#FFEBEE',
            borderLeft: '4px solid #FF3B30',
            padding: '1rem 1.25rem',
            borderRadius: '0px 8px 8px 0px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <AlertTriangle size={16} color="#FF3B30" />
            <span style={{
              color: '#C62828',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>{error}</span>
          </div>
        )}

        <div style={{ marginBottom: '1.75rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.75rem',
            color: '#333',
            fontWeight: '600',
            fontSize: '0.9rem'
          }}>Username or Email Address</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="e.g. BMXXXXXX or email"
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid #E0E0E0',
              outline: 'none',
              fontSize: '1rem',
              transition: 'all 0.2s ease',
              backgroundColor: '#FAFAFA'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#00A859';
              e.target.style.boxShadow = '0 0 0 3px rgba(0, 168, 89, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E0E0E0';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.75rem',
            color: '#333',
            fontWeight: '600',
            fontSize: '0.9rem'
          }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid #E0E0E0',
                outline: 'none',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                backgroundColor: '#FAFAFA',
                paddingRight: '3rem'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#00A859';
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 168, 89, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E0E0E0';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                // Toggle password visibility would go here if we had state for it
              }}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                padding: '0',
                color: '#9E9E9E',
                fontSize: '1rem',
                cursor: 'pointer',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Eye size={20} color="#9E9E9E" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '1.25rem',
            backgroundColor: '#00A859',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0, 168, 89, 0.25)'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = '#008F4A';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = '#00A859';
            }
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              <Loader2 size={20} color="#ffffff" style={{ animation: 'spin 1s linear infinite' }} />
              <span>Logging in...</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              <LayoutDashboard size={20} color="#ffffff" />
              <span>Login to Dashboard</span>
            </div>
          )}
        </button>

        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          color: '#666',
          fontSize: '0.875rem'
        }}>
          <p style={{ margin: '0 0 1rem 0' }}>
            Don't have an admin account? Contact system administrator.
          </p>
        </div>
      </form>

      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100px',
        height: '100px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)'
      }}></div>

      <div style={{
        position: 'absolute',
        bottom: '0',
        right: '0',
        width: '120px',
        height: '120px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        transform: 'translate(50%, 50%)'
      }}></div>
    </div>
  );
};

export default LoginPage;
