import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../layout/DashboardLayout';
import client from '../api/client';
import { 
  Search, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin,
  Shield,
  ShieldCheck,
  MoreVertical,
  Filter,
  Activity,
  ShoppingBag,
  CreditCard
} from 'lucide-react';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    notification_settings: {}
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await client('/admin/users');
      setUsers(data);
    } catch (err) {
      setError('Failed to load customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      notification_settings: user.notification_settings || {
        orderUpdates: true,
        promotions: false,
        securityAlerts: true,
        newsletter: false
      }
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationToggle = (key) => {
    setEditForm(prev => ({
      ...prev,
      notification_settings: {
        ...prev.notification_settings,
        [key]: !prev.notification_settings[key]
      }
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updatedUser = await client(`/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        body: editForm
      });
      
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setSelectedUser(updatedUser);
      setIsEditing(false);
      toast.success('Customer profile updated successfully');
    } catch (err) {
      toast.error('Failed to update customer profile');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const notificationTypes = [
    { id: 'orderUpdates', label: 'Order Updates' },
    { id: 'promotions', label: 'Promotions' },
    { id: 'securityAlerts', label: 'Security Alerts' },
    { id: 'newsletter', label: 'Newsletter' },
  ];

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Customer Management</h2>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>View and manage all registered customers on LNE Mobile.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ 
            padding: '0.8rem 1.2rem', 
            backgroundColor: '#E8F8EE', 
            color: '#00A859', 
            borderRadius: '10px', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <User size={18} />
            Total: {users.length}
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{ 
        backgroundColor: '#fff', 
        padding: '1rem', 
        borderRadius: '12px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
        marginBottom: '2rem',
        display: 'flex',
        gap: '1rem'
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.8rem 1rem 0.8rem 3rem',
              borderRadius: '8px',
              border: '1px solid #eee',
              outline: 'none',
              fontSize: '0.9rem'
            }}
          />
        </div>
        <button style={{
          padding: '0.8rem 1.2rem',
          borderRadius: '8px',
          border: '1px solid #eee',
          backgroundColor: '#fff',
          color: '#666',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer'
        }}>
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* Users Table */}
      <div style={{ 
        backgroundColor: '#fff', 
        borderRadius: '12px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#888' }}>
            <div className="spinner" style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #f3f3f3', 
              borderTop: '4px solid #00A859', 
              borderRadius: '50%', 
              margin: '0 auto 1rem',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p>Loading customers...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#FF3B30' }}>
            <Activity size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>{error}</p>
            <button onClick={fetchUsers} style={{ marginTop: '1rem', padding: '0.6rem 1.2rem', backgroundColor: '#00A859', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Retry</button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#888' }}>
            <User size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
            <p>No customers found matching your search.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#fcfcfc', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Customer</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Contact Info</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Location</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Joined Date</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #f5f5f5', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '12px', 
                        backgroundColor: '#f0f0f0', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        color: '#666',
                        fontSize: '1.1rem'
                      }}>
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#333' }}>{user.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#00A859', fontWeight: '600' }}>ID: {user.id.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: '#444', marginBottom: '0.2rem' }}>
                      <Mail size={14} color="#888" /> {user.email}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#666' }}>
                      <Phone size={14} color="#888" /> {user.phone || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: '#444' }}>
                      <MapPin size={14} color="#888" /> {user.city ? `${user.city}, ` : ''}{user.state || 'Unknown'}, Nigeria
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#888' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={14} color="#888" />
                      {new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      padding: '0.3rem 0.8rem', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold',
                      backgroundColor: '#E8F8EE',
                      color: '#00A859',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <ShieldCheck size={12} />
                      ACTIVE
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleOpenModal(user)}
                      style={{ padding: '0.5rem', color: '#888', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                    >
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* User Detail Modal */}
      {isModalOpen && selectedUser && (
        <div style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{ 
            backgroundColor: '#fff', 
            padding: '2rem', 
            borderRadius: '20px', 
            width: '100%', 
            maxWidth: '600px', 
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{isEditing ? 'Edit Customer Profile' : 'Customer Profile'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '1.5rem' }}>×</button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '24px', 
                backgroundColor: '#f0f0f0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: '900',
                color: '#00A859',
                fontSize: '2rem',
                margin: '0 auto 1rem'
              }}>
                {selectedUser.name?.charAt(0)}
              </div>
              {isEditing ? (
                <input 
                  type="text" 
                  name="name" 
                  value={editForm.name} 
                  onChange={handleInputChange}
                  style={{ fontSize: '1.3rem', fontWeight: 'bold', width: '80%', textAlign: 'center', border: '1px solid #eee', borderRadius: '8px', padding: '0.3rem' }}
                />
              ) : (
                <h4 style={{ fontSize: '1.3rem', margin: '0 0 0.2rem 0' }}>{selectedUser.name}</h4>
              )}
              <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>{selectedUser.email}</p>
            </div>

            {!isEditing && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    <ShoppingBag size={14} /> Total Orders
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>0</div>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    <CreditCard size={14} /> BNPL Plans
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>0</div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingBottom: '0.8rem', borderBottom: '1px solid #eee' }}>
                <span style={{ color: '#888', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Phone Number</span>
                {isEditing ? (
                  <input type="text" name="phone" value={editForm.phone} onChange={handleInputChange} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #eee' }} />
                ) : (
                  <span style={{ fontWeight: '500' }}>{selectedUser.phone || 'N/A'}</span>
                )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingBottom: '0.8rem', borderBottom: '1px solid #eee' }}>
                <span style={{ color: '#888', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>City</span>
                {isEditing ? (
                  <input type="text" name="city" value={editForm.city} onChange={handleInputChange} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #eee' }} />
                ) : (
                  <span style={{ fontWeight: '500' }}>{selectedUser.city || 'N/A'}</span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingBottom: '0.8rem', borderBottom: '1px solid #eee' }}>
                <span style={{ color: '#888', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>State</span>
                {isEditing ? (
                  <select name="state" value={editForm.state} onChange={handleInputChange} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
                    <option value="">Select State</option>
                    <option value="Lagos">Lagos</option>
                    <option value="Abuja">Abuja</option>
                    <option value="Oyo">Oyo</option>
                    <option value="Kano">Kano</option>
                    <option value="Rivers">Rivers</option>
                  </select>
                ) : (
                  <span style={{ fontWeight: '500' }}>{selectedUser.state || 'N/A'}</span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingBottom: '0.8rem', borderBottom: '1px solid #eee' }}>
                <span style={{ color: '#888', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Home Address</span>
                {isEditing ? (
                  <textarea name="address" value={editForm.address} onChange={handleInputChange} rows={3} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #eee', resize: 'none' }} />
                ) : (
                  <span style={{ fontWeight: '500' }}>{selectedUser.address || 'No address provided'}</span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <span style={{ color: '#888', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Notification Preferences</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {notificationTypes.map(type => (
                    <div key={type.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <input 
                        type="checkbox" 
                        id={type.id} 
                        checked={editForm.notification_settings[type.id] || false}
                        disabled={!isEditing}
                        onChange={() => handleNotificationToggle(type.id)}
                        style={{ width: '18px', height: '18px', accentColor: '#00A859' }}
                      />
                      <label htmlFor={type.id} style={{ fontSize: '0.9rem', color: isEditing ? '#333' : '#888' }}>{type.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              {!isEditing && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                  <span style={{ color: '#888', fontSize: '0.9rem' }}>Member Since</span>
                  <span style={{ fontWeight: '500' }}>{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              {isEditing ? (
                <>
                  <button 
                    style={{ flex: 1, padding: '1rem', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '12px', fontWeight: 'bold', color: '#666', cursor: 'pointer' }} 
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button 
                    style={{ flex: 1, padding: '1rem', backgroundColor: '#00A859', border: 'none', borderRadius: '12px', fontWeight: 'bold', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    ) : 'Save Changes'}
                  </button>
                </>
              ) : (
                <>
                  <button style={{ flex: 1, padding: '1rem', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '12px', fontWeight: 'bold', color: '#666', cursor: 'pointer' }} onClick={() => setIsModalOpen(false)}>Close</button>
                  <button 
                    style={{ flex: 1, padding: '1rem', backgroundColor: '#00A859', border: 'none', borderRadius: '12px', fontWeight: 'bold', color: '#fff', cursor: 'pointer' }}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default UsersPage;
