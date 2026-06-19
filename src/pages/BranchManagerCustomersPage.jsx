import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../layout/DashboardLayout';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Search, User, Mail, Phone, Calendar, MapPin,
  Loader2, ShieldCheck, Eye, X, Activity, ShoppingBag,
  CreditCard, RefreshCw, Users
} from 'lucide-react';

const C = {
  primary: '#00A859',
  primaryDark: '#007A3F',
  primaryLight: '#E8F8EE',
  accent: '#FFB800',
  error: '#FF3B30',
  errorLight: '#FFEBEA',
  gray700: '#374151',
  gray500: '#6B7280',
  gray400: '#9CA3AF',
  gray200: '#E5E7EB',
  gray100: '#F3F4F6',
  gray50: '#F9FAFB',
  white: '#FFFFFF',
  dark: '#1A1A2E',
};

const BranchManagerCustomersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const branchCity = user?.branch_city || user?.city || 'your area';
  const branchState = user?.state || '';

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await client('/branch-manager/users');
      setUsers(data);
    } catch (err) {
      setError('Failed to load customers.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{
              fontSize: '11px',
              fontWeight: '700',
              color: C.primary,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '4px'
            }}>
              Branch Customers
            </div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: C.dark, letterSpacing: '-0.5px' }}>
              Customers in {branchCity}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <MapPin size={14} color={C.primary} />
              <span style={{ fontSize: '13px', color: C.gray500, fontWeight: '600' }}>
                {branchCity}{branchState ? `, ${branchState}` : ''} • {users.length} total customers
              </span>
            </div>
          </div>
          <button
            onClick={fetchUsers}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '11px',
              border: `1px solid ${C.gray200}`,
              background: C.white,
              fontSize: '13px',
              fontWeight: '700',
              color: C.gray700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{
            padding: '1.25rem',
            backgroundColor: C.white,
            borderRadius: '14px',
            border: `1px solid ${C.gray200}`,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: `${C.primary}12`,
              color: C.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: C.gray700 }}>{users.length}</div>
              <div style={{ fontSize: '0.75rem', color: C.gray500, fontWeight: '600' }}>Total Customers</div>
            </div>
          </div>
          <div style={{
            padding: '1.25rem',
            backgroundColor: C.white,
            borderRadius: '14px',
            border: `1px solid ${C.gray200}`,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: `${C.accent}12`,
              color: C.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MapPin size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: C.gray700 }}>{branchCity}</div>
              <div style={{ fontSize: '0.75rem', color: C.gray500, fontWeight: '600' }}>Branch Location</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{
          backgroundColor: C.white,
          padding: '1rem',
          borderRadius: '14px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
          border: `1px solid ${C.gray200}`,
          marginBottom: '1.5rem'
        }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: C.gray400 }} />
            <input
              type="text"
              placeholder="Search customers by name, email, phone, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1rem 0.85rem 3rem',
                borderRadius: '10px',
                border: `1px solid ${C.gray200}`,
                outline: 'none',
                fontSize: '0.9rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Customers Table */}
        <div style={{
          backgroundColor: C.white,
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          border: `1px solid ${C.gray200}`,
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: '5rem', textAlign: 'center', color: C.gray400 }}>
              <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem', display: 'block', color: C.primary }} />
              <p>Loading customers in {branchCity}...</p>
            </div>
          ) : error ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: C.error }}>
              <Activity size={40} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.5 }} />
              <p>{error}</p>
              <button onClick={fetchUsers} style={{
                marginTop: '1rem',
                padding: '0.6rem 1.5rem',
                backgroundColor: C.primary,
                color: C.white,
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer'
              }}>Retry</button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ padding: '5rem', textAlign: 'center', color: C.gray400 }}>
              <User size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.3 }} />
              <p style={{ fontWeight: '600' }}>No customers found{searchTerm ? ' matching your search' : ` in ${branchCity}`}.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: C.gray50, borderBottom: `1px solid ${C.gray200}` }}>
                    <th style={styles.th}>Customer</th>
                    <th style={styles.th}>Contact Info</th>
                    <th style={styles.th}>Location</th>
                    <th style={styles.th}>Joined</th>
                    <th style={styles.th}>Status</th>
                    <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} style={{ borderBottom: `1px solid ${C.gray100}`, transition: 'background 0.2s' }}>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            backgroundColor: `${C.primary}12`,
                            color: C.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '1rem'
                          }}>
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: C.gray700 }}>{u.name}</div>
                            <div style={{ fontSize: '0.75rem', color: C.gray400 }}>ID: {u.id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div style={{ fontSize: '0.85rem', color: C.gray700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={12} color={C.gray400} /> {u.email}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: C.gray500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={12} color={C.gray400} /> {u.phone || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: C.gray700 }}>
                          <MapPin size={12} color={C.gray400} />
                          {u.city ? `${u.city}, ` : ''}{u.state || 'Unknown'}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: C.gray500 }}>
                          <Calendar size={12} color={C.gray400} />
                          {new Date(u.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '700',
                          backgroundColor: C.primaryLight,
                          color: C.primary,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <ShieldCheck size={10} />
                          ACTIVE
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <button
                          onClick={() => handleViewUser(u)}
                          style={{
                            padding: '0.4rem 0.8rem',
                            background: C.primaryLight,
                            color: C.primary,
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.8rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="View Customer Details"
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* View User Modal */}
      {isModalOpen && selectedUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            backgroundColor: C.white,
            borderRadius: '20px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: `1px solid ${C.gray200}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: C.gray50
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: C.gray700, margin: 0 }}>
                Customer Profile
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.gray500 }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  backgroundColor: `${C.primary}12`,
                  color: C.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.5rem',
                  fontWeight: '800',
                  border: `2px solid ${C.primary}`
                }}>
                  {selectedUser.name?.charAt(0)}
                </div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: C.dark, margin: '0 0 0.25rem' }}>
                  {selectedUser.name}
                </h4>
                <p style={{ color: C.gray400, margin: 0, fontSize: '0.85rem' }}>{selectedUser.email}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { label: 'Phone', value: selectedUser.phone || 'N/A', icon: Phone },
                  { label: 'City', value: selectedUser.city || 'N/A', icon: MapPin },
                  { label: 'State', value: selectedUser.state || 'N/A', icon: MapPin },
                  { label: 'Address', value: selectedUser.address || 'No address provided', icon: MapPin },
                ].map((item) => (
                  <div key={item.label} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    backgroundColor: C.gray50,
                    borderRadius: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: C.gray500, fontSize: '0.8rem', fontWeight: '600' }}>
                      <item.icon size={14} />
                      {item.label}
                    </div>
                    <div style={{ fontWeight: '600', color: C.gray700, fontSize: '0.9rem' }}>{item.value}</div>
                  </div>
                ))}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  backgroundColor: C.gray50,
                  borderRadius: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: C.gray500, fontSize: '0.8rem', fontWeight: '600' }}>
                    <Calendar size={14} />
                    Member Since
                  </div>
                  <div style={{ fontWeight: '600', color: C.gray700, fontSize: '0.9rem' }}>
                    {new Date(selectedUser.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  width: '100%',
                  marginTop: '1.5rem',
                  padding: '0.85rem',
                  backgroundColor: C.gray100,
                  color: C.gray700,
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </DashboardLayout>
  );
};

const styles = {
  th: {
    padding: '12px 16px',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: C.gray500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: `2px solid ${C.gray200}`
  },
  td: {
    padding: '14px 16px',
    fontSize: '0.9rem',
    color: C.gray600,
    verticalAlign: 'middle'
  }
};

export default BranchManagerCustomersPage;
