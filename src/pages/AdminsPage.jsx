import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import {
  Search,
  UserPlus,
  Edit2,
  Shield,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Trash2,
  X,
  Eye,
  EyeOff,
  AlertTriangle,
  Users,
  Activity,
  Loader2,
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

const InputField = ({ label, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </label>
    <input
      {...props}
      style={inputStyle}
      onFocus={e => Object.assign(e.target.style, { borderColor: '#00A859', boxShadow: '0 0 0 3px #00a85920', background: '#fff' })}
      onBlur={e => Object.assign(e.target.style, { borderColor: '#e2e8f0', boxShadow: 'none', background: '#fafafa' })}
    />
  </div>
);

const PasswordInput = ({ label, ...props }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          {...props}
          type={show ? 'text' : 'password'}
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

const AdminsPage = () => {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    is_active: true,
  });

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await client('/admin/admins');
      setAdmins(data);
    } catch (err) {
      setError('Failed to load admins');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (createForm.password !== createForm.password_confirmation) {
      toast.error('Passwords do not match');
      return;
    }
    if (createForm.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setIsCreating(true);
      await client('/admin/admins', {
        method: 'POST',
        body: createForm,
      });
      toast.success('Admin created successfully');
      setShowCreateModal(false);
      setCreateForm({ name: '', email: '', phone: '', password: '', password_confirmation: '' });
      fetchAdmins();
    } catch (err) {
      toast.error(err.message || 'Failed to create admin');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;

    try {
      setIsDeleting(true);
      await client(`/admin/admins/${selectedAdmin.id}`, { method: 'DELETE' });
      toast.success('Admin deleted successfully');
      setShowDeleteModal(false);
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (err) {
      toast.error(err.message || 'Failed to delete admin');
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setEditForm({
      name: admin.name || '',
      email: admin.email || '',
      phone: admin.phone || '',
      is_active: admin.is_active !== false,
    });
    setShowEditModal(true);
  };

  const handleUpdateAdmin = async () => {
    if (!editForm.name || !editForm.email) {
      toast.error('Name and email are required');
      return;
    }

    try {
      setIsUpdating(true);
      await client(`/admin/admins/${selectedAdmin.id}`, {
        method: 'PUT',
        body: editForm,
      });
      toast.success('Admin updated successfully');
      setShowEditModal(false);
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (err) {
      toast.error(err.message || 'Failed to update admin');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.25rem', fontWeight: 800 }}>
            <Shield size={20} color="#00A859" /> Admin Management
          </h2>
          <p style={{ color: '#94a3b8', marginTop: '0.4rem', fontSize: '0.9rem' }}>
            Create and manage administrator accounts.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '0.75rem 1.25rem', borderRadius: 10, border: 'none',
            background: '#00A859', color: '#fff', fontWeight: 700,
            fontSize: '0.875rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            boxShadow: '0 2px 8px rgba(0, 168, 89, 0.25)',
          }}
        >
          <UserPlus size={16} /> Add Admin
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1, padding: '1rem 1.25rem', background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#00a85910', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={18} color="#00A859" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Total Admins</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1a1a1a' }}>{admins.length}</div>
          </div>
        </div>
        <div style={{ flex: 1, padding: '1rem 1.25rem', background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={18} color="#185FA5" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Active Admins</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1a1a1a' }}>{admins.filter(a => a.is_active !== false).length}</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ background: '#fff', padding: '1rem', borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
          <input
            type="text"
            placeholder="Search admins by name, email or phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: 8, border: '1px solid #eee', outline: 'none', fontSize: '0.9rem' }}
          />
        </div>
      </div>

      {/* Admins Table */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#888' }}>
            <Loader2 size={32} style={{ margin: '0 auto 1rem', animation: 'spin 1s linear infinite', color: '#00A859' }} />
            <p>Loading admins...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#FF3B30' }}>
            <Activity size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>{error}</p>
            <button onClick={fetchAdmins} style={{ marginTop: '1rem', padding: '0.6rem 1.2rem', backgroundColor: '#00A859', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Retry</button>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#888' }}>
            <Shield size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
            <p>{searchTerm ? 'No admins found matching your search.' : 'No admins yet. Create your first admin account.'}</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#fcfcfc', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Admin</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Contact</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Role</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Joined</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map(admin => (
                <tr key={admin.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: 'linear-gradient(135deg, #00A859 0%, #007A3F 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 'bold', fontSize: '0.9rem',
                      }}>
                        {admin.name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1a1a1a' }}>{admin.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#00A859', fontWeight: 600 }}>ID: {admin.id?.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: '#444', marginBottom: '0.2rem' }}>
                      <Mail size={14} color="#888" /> {admin.email}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#666' }}>
                      <Phone size={14} color="#888" /> {admin.phone || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{
                      padding: '0.3rem 0.8rem', borderRadius: 20,
                      fontSize: '0.75rem', fontWeight: 700,
                      background: '#00a85915', color: '#00A859',
                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    }}>
                      <Shield size={11} /> {admin.role || 'admin'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#888' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={14} color="#888" />
                      {admin.created_at ? new Date(admin.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{
                      padding: '0.3rem 0.8rem', borderRadius: 20,
                      fontSize: '0.75rem', fontWeight: 700,
                      backgroundColor: admin.is_active !== false ? '#E8F8EE' : '#FFEBEE',
                      color: admin.is_active !== false ? '#00A859' : '#FF3B30',
                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    }}>
                      {admin.is_active !== false ? <><ShieldCheck size={11} /> ACTIVE</> : <><Activity size={11} /> INACTIVE</>}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    {admin.id !== currentUser?.id && (
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => openEditModal(admin)}
                          style={{ padding: '0.5rem', color: '#00A859', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                          title="Edit admin"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => { setSelectedAdmin(admin); setShowDeleteModal(true); }}
                          style={{ padding: '0.5rem', color: '#FF3B30', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                          title="Delete admin"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem',
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: 20, width: '100%', maxWidth: 480,
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 1.5rem 0' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={18} color="#00A859" /> Create New Admin
              </h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <InputField
                label="Full Name *"
                type="text"
                value={createForm.name}
                onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. John Doe"
              />
              <InputField
                label="Email Address *"
                type="email"
                value={createForm.email}
                onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))}
                placeholder="e.g. admin@lne.com"
              />
              <InputField
                label="Phone Number"
                type="tel"
                value={createForm.phone}
                onChange={e => setCreateForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="e.g. 0803 000 0000"
              />
              <PasswordInput
                label="Password *"
                value={createForm.password}
                onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Minimum 8 characters"
              />
              <PasswordInput
                label="Confirm Password *"
                value={createForm.password_confirmation}
                onChange={e => setCreateForm(p => ({ ...p, password_confirmation: e.target.value }))}
                placeholder="Re-enter password"
              />

              {createForm.password && createForm.password !== createForm.password_confirmation && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.8rem', background: '#FFEBEE', borderRadius: 8, border: '1px solid #FFCDD2' }}>
                  <AlertTriangle size={14} color="#FF3B30" />
                  <span style={{ fontSize: '0.82rem', color: '#C62828' }}>Passwords do not match</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', gap: '0.75rem', padding: '0 1.5rem 1.5rem' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: 10,
                  border: '1px solid #e2e8f0', background: '#fff',
                  fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', color: '#64748b',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAdmin}
                disabled={isCreating || !createForm.name || !createForm.email || !createForm.password}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: 10, border: 'none',
                  background: isCreating ? '#94a3b8' : '#00A859', color: '#fff',
                  fontWeight: 700, cursor: isCreating ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
              >
                {isCreating ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Creating...</> : <><UserPlus size={16} /> Create Admin</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAdmin && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem',
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: 20, padding: '2rem',
            width: '100%', maxWidth: 400, textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#FFEBEE', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <Trash2 size={28} color="#FF3B30" />
            </div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', fontWeight: 700 }}>Delete Admin</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>{selectedAdmin.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => { setShowDeleteModal(false); setSelectedAdmin(null); }}
                disabled={isDeleting}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: 10,
                  border: '1px solid #e2e8f0', background: '#fff',
                  fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', color: '#64748b',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAdmin}
                disabled={isDeleting}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: 10, border: 'none',
                  background: isDeleting ? '#94a3b8' : '#FF3B30', color: '#fff',
                  fontWeight: 700, cursor: isDeleting ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
              >
                {isDeleting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Deleting...</> : 'Delete Admin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem',
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: 20, width: '100%', maxWidth: 480,
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 1.5rem 0' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={18} color="#00A859" /> Edit Admin
              </h3>
              <button onClick={() => { setShowEditModal(false); setSelectedAdmin(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <InputField
                label="Full Name *"
                type="text"
                value={editForm.name}
                onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. John Doe"
              />
              <InputField
                label="Email Address *"
                type="email"
                value={editForm.email}
                onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                placeholder="e.g. admin@lne.com"
              />
              <InputField
                label="Phone Number"
                type="tel"
                value={editForm.phone}
                onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="e.g. 0803 000 0000"
              />

              {/* Active Status Toggle */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Account Status
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setEditForm(p => ({ ...p, is_active: true }))}
                    style={{
                      flex: 1, padding: '0.75rem', borderRadius: 10, border: `2px solid ${editForm.is_active ? '#00A859' : '#e2e8f0'}`,
                      background: editForm.is_active ? '#E8F8EE' : '#fff',
                      color: editForm.is_active ? '#00A859' : '#64748b',
                      fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    }}
                  >
                    <ShieldCheck size={16} /> Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm(p => ({ ...p, is_active: false }))}
                    style={{
                      flex: 1, padding: '0.75rem', borderRadius: 10, border: `2px solid ${!editForm.is_active ? '#FF3B30' : '#e2e8f0'}`,
                      background: !editForm.is_active ? '#FFEBEE' : '#fff',
                      color: !editForm.is_active ? '#FF3B30' : '#64748b',
                      fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    }}
                  >
                    <Activity size={16} /> Inactive
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', gap: '0.75rem', padding: '0 1.5rem 1.5rem' }}>
              <button
                onClick={() => { setShowEditModal(false); setSelectedAdmin(null); }}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: 10,
                  border: '1px solid #e2e8f0', background: '#fff',
                  fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', color: '#64748b',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateAdmin}
                disabled={isUpdating || !editForm.name || !editForm.email}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: 10, border: 'none',
                  background: isUpdating ? '#94a3b8' : '#00A859', color: '#fff',
                  fontWeight: 700, cursor: isUpdating ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
              >
                {isUpdating ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Updating...</> : <><Edit2 size={16} /> Update Admin</>}
              </button>
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

export default AdminsPage;
