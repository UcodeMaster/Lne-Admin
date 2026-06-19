import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../layout/DashboardLayout';
import client from '../api/client';
import {
  User, Mail, Phone, MapPin, Shield, Key, Eye, Trash2, Edit2,
  Loader2, CheckCircle, RefreshCw, X, ArrowLeft, ArrowRight,
  UserPlus, Lock, ShieldAlert, Check, HelpCircle, CheckSquare, Info
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

const BRANCH_OFFICES = [
  { city: 'Abuja', state: 'FCT' },
  { city: 'Abia', state: 'Abia' },
  { city: 'Calabar', state: 'Cross River' },
  { city: 'Enugu', state: 'Enugu' },
  { city: 'Lagos', state: 'Lagos' },
  { city: 'Port Harcourt', state: 'Rivers' },
  { city: 'Uyo', state: 'Akwa Ibom' }
];

const AVAILABLE_PERMISSIONS = [
  { key: 'eligibility_survey', label: 'Eligibility Survey form', desc: 'Allows access to create and view walk-in surveys.' },
  { key: 'marketplace', label: 'Marketplace', desc: 'Allows management and viewing of marketplace listings.' },
  { key: 'marketplace_categories', label: 'Marketplace Categories', desc: 'Allows management of product categorization.' },
  { key: 'customers_local', label: 'Customers (Only customers in his state/city)', desc: 'Restricts customer view to managers local branch office.' }
];

const BranchManagersPage = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal & Step Wizard State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [successDetails, setSuccessDetails] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    branch_office: 'Abuja', // Default
    permissions: ['eligibility_survey', 'customers_local'] // Default
  });

  const fetchManagers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await client('/admin/branch-managers');
      setManagers(data);
    } catch (err) {
      setError('Failed to load branch managers.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePermissionToggle = (permissionKey) => {
    setFormData(prev => {
      const current = [...prev.permissions];
      const index = current.indexOf(permissionKey);
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(permissionKey);
      }
      return { ...prev, permissions: current };
    });
  };

  const validateStep = (step) => {
    if (step === 1) {
      const { name, email, address, phone, branch_office } = formData;
      if (!name.trim() || !email.trim() || !address.trim() || !phone.trim() || !branch_office) {
        toast.error('All personal information fields are required.');
        return false;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        toast.error('Please enter a valid email address.');
        return false;
      }
    } else if (step === 2) {
      if (formData.permissions.length === 0) {
        toast.error('Please assign at least one role/permission.');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(2)) return;

    // Map selected branch office city to its state
    const selectedOffice = BRANCH_OFFICES.find(o => o.city === formData.branch_office);
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: selectedOffice ? selectedOffice.city : formData.branch_office,
      state: selectedOffice ? selectedOffice.state : 'FCT',
      permissions: formData.permissions
    };

    try {
      setSubmitting(true);
      
      if (isEditMode && editingManager) {
        // Update existing branch manager
        const response = await client(`/admin/branch-managers/${editingManager.id}`, {
          method: 'PATCH',
          body: payload
        });
        toast.success('Branch Manager updated successfully!');
        setSuccessDetails({ ...response, type: 'update' });
      } else {
        // Create new branch manager
        const response = await client('/admin/branch-managers', {
          method: 'POST',
          body: payload
        });
        toast.success('Branch Manager created successfully!');
        setSuccessDetails(response.branch_manager);
      }
      
      fetchManagers();
    } catch (err) {
      toast.error(err.message || `Failed to ${isEditMode ? 'update' : 'create'} branch manager.`);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete branch manager ${name}? This action cannot be undone.`)) return;

    try {
      await client(`/admin/branch-managers/${id}`, {
        method: 'DELETE'
      });
      toast.success('Branch manager deleted successfully.');
      fetchManagers();
    } catch (err) {
      toast.error(err.message || 'Failed to delete branch manager.');
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingManager(null);
    setFormData({
      name: '',
      email: '',
      address: '',
      phone: '',
      branch_office: 'Abuja',
      permissions: ['eligibility_survey', 'customers_local']
    });
    setCurrentStep(1);
    setSuccessDetails(null);
    setIsModalOpen(true);
  };

  const openEditModal = (manager) => {
    setIsEditMode(true);
    setEditingManager(manager);
    const managerPermissions = manager.notification_settings?.permissions || [];
    setFormData({
      name: manager.name || '',
      email: manager.email || '',
      address: manager.address || '',
      phone: manager.phone || '',
      branch_office: manager.branch_city || manager.city || 'Abuja',
      permissions: managerPermissions.length > 0 ? managerPermissions : ['eligibility_survey', 'customers_local']
    });
    setCurrentStep(1);
    setSuccessDetails(null);
    setIsModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingManager(null);
    setSuccessDetails(null);
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
        
        {/* Header section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: C.gray700, margin: 0, letterSpacing: '-0.5px' }}>
              Branch Managers
            </h1>
            <p style={{ color: C.gray500, marginTop: '0.4rem', fontSize: '0.95rem' }}>
              Create, manage, and configure access permissions for regional branch managers.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={fetchManagers}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.2rem',
                background: C.white,
                border: `1px solid ${C.gray200}`,
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '0.85rem',
                color: C.gray700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              Refresh List
            </button>

            <button
              onClick={openCreateModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.4rem',
                background: C.primary,
                border: 'none',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '0.85rem',
                color: C.white,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 168, 89, 0.15)',
                transition: 'all 0.2s'
              }}
            >
              <UserPlus size={16} />
              New Branch Manager
            </button>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: `${C.primary}12`, color: C.primary }}>
              <User size={22} />
            </div>
            <div>
              <div style={styles.statValue}>{managers.length}</div>
              <div style={styles.statLabel}>Total Branch Managers</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: `${C.accent}12`, color: C.accent }}>
              <MapPin size={22} />
            </div>
            <div>
              <div style={styles.statValue}>
                {new Set(managers.map(m => m.branch_city || m.city)).size}
              </div>
              <div style={styles.statLabel}>Active Branch Locations</div>
            </div>
          </div>
        </div>

        {/* List of Branch Managers */}
        <div style={{
          background: C.white,
          border: `1px solid ${C.gray200}`,
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: '5rem', textAlign: 'center', color: C.gray400 }}>
              <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem', display: 'block', color: C.primary }} />
              <p>Loading branch managers list...</p>
            </div>
          ) : error ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: C.error }}>
              <ShieldAlert size={40} style={{ margin: '0 auto 1rem', display: 'block' }} />
              <p>{error}</p>
            </div>
          ) : managers.length === 0 ? (
            <div style={{ padding: '5rem', textAlign: 'center', color: C.gray400 }}>
              <User size={40} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.3 }} />
              <p style={{ fontWeight: '600' }}>No branch managers registered yet.</p>
              <button
                onClick={openCreateModal}
                style={{
                  marginTop: '1rem',
                  padding: '0.6rem 1.5rem',
                  background: C.primaryLight,
                  color: C.primaryDark,
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Create First Manager
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: C.gray50, borderBottom: `1px solid ${C.gray200}` }}>
                    <th style={styles.th}>Full Name</th>
                    <th style={styles.th}>Username</th>
                    <th style={styles.th}>Contact Info</th>
                    <th style={styles.th}>Office / State</th>
                    <th style={styles.th}>Assigned Permissions</th>
                    <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {managers.map((m) => {
                    const managerPermissions = m.notification_settings?.permissions || [];
                    return (
                      <tr key={m.id} style={{ borderBottom: `1px solid ${C.gray100}`, transition: 'background 0.2s' }}>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              backgroundColor: `${C.primary}12`,
                              color: C.primary,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '700',
                              fontSize: '0.9rem'
                            }}>
                              {m.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: '700', color: C.gray700 }}>{m.name}</div>
                              <div style={{ fontSize: '0.75rem', color: C.gray400 }}>ID: {m.id.substring(0, 8)}</div>
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={{ fontFamily: 'monospace', fontWeight: '700', background: C.gray100, padding: '2px 6px', borderRadius: '4px', color: C.gray700 }}>
                            {m.username || '—'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div style={{ fontSize: '0.85rem', color: C.gray600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Mail size={12} /> {m.email}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: C.gray600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={12} /> {m.phone || '—'}
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontWeight: '600', color: C.gray700 }}>{m.branch_city || m.city || '—'}</div>
                          <div style={{ fontSize: '0.75rem', color: C.gray400 }}>{m.state || '—'} State</div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {managerPermissions.length === 0 ? (
                              <span style={{ fontSize: '0.75rem', color: C.gray400 }}>No roles assigned</span>
                            ) : (
                              managerPermissions.map((key) => {
                                const found = AVAILABLE_PERMISSIONS.find(p => p.key === key);
                                return (
                                  <span key={key} style={{
                                    fontSize: '0.7rem',
                                    fontWeight: '700',
                                    color: C.primaryDark,
                                    background: C.primaryLight,
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {found ? found.label.split(' (')[0] : key}
                                  </span>
                                );
                              })
                            )}
                          </div>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => openEditModal(m)}
                              style={{
                                padding: '0.4rem 0.6rem',
                                background: C.primaryLight,
                                color: C.primary,
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.8rem',
                                transition: 'all 0.2s'
                              }}
                              title="Edit Branch Manager"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(m.id, m.name)}
                              style={{
                                padding: '0.4rem 0.6rem',
                                background: C.errorLight,
                                color: C.error,
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.8rem',
                                transition: 'all 0.2s'
                              }}
                              title="Delete Branch Manager"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL STEP WIZARD FOR CREATION */}
        {isModalOpen && (
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
              maxWidth: '580px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              
              {/* Modal Header */}
              <div style={{
                padding: '1.25rem 1.5rem',
                borderBottom: `1px solid ${C.gray200}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: C.gray50
              }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: C.gray700, margin: 0 }}>
                    {isEditMode ? 'Edit Branch Manager' : 'Create Branch Manager'}
                  </h3>
                  <p style={{ color: C.gray400, margin: 0, fontSize: '0.8rem' }}>
                    {successDetails ? 'Finished' : `Step ${currentStep} of ${isEditMode ? '2' : '3'}`}
                  </p>
                </div>
                {!submitting && (
                  <button onClick={closeCreateModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.gray500 }}>
                    <X size={20} />
                  </button>
                )}
              </div>

              {/* Wizard Content */}
              <div style={{ padding: '1.75rem 2rem', flex: 1, overflowY: 'auto', maxHeight: '70vh' }}>
                
                {successDetails ? (
                  /* SUCCESS AND CREDENTIALS SCREEN */
                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem 0' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: C.primaryLight,
                      color: C.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      border: `2px solid ${C.primary}`
                    }}>
                      <Check size={32} strokeWidth={3} />
                    </div>

                    <div>
                      <h4 style={{ fontSize: '1.3rem', fontWeight: '800', color: C.primaryDark, margin: '0 0 0.5rem' }}>
                        {successDetails.type === 'update' ? 'Manager Account Updated!' : 'Manager Account Registered!'}
                      </h4>
                      <p style={{ fontSize: '0.9rem', color: C.gray500, margin: 0 }}>
                        {successDetails.type === 'update' 
                          ? <>The branch manager <strong>{formData.name}</strong> has been updated successfully.</>
                          : <>The credentials have been sent to <strong>{successDetails.email}</strong>.</>
                        }
                      </p>
                    </div>

                    {successDetails.type !== 'update' && (
                      <div style={{
                        backgroundColor: C.gray50,
                        border: `1px solid ${C.gray200}`,
                        borderRadius: '12px',
                        padding: '1.25rem',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        marginTop: '0.5rem'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: C.gray400, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Generated Username</div>
                          <div style={{ fontSize: '1.1rem', fontFamily: 'monospace', fontWeight: '800', color: C.gray700 }}>
                            {successDetails.username}
                          </div>
                        </div>

                        <div style={{ borderTop: `1px solid ${C.gray200}`, paddingTop: '0.75rem' }}>
                          <div style={{ fontSize: '0.75rem', color: C.gray400, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Temporary Password</div>
                          <div style={{ fontSize: '1.1rem', fontFamily: 'monospace', fontWeight: '800', color: C.primary }}>
                            {successDetails.password}
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={closeCreateModal}
                      style={{
                        padding: '0.75rem 2rem',
                        backgroundColor: C.primary,
                        color: C.white,
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        marginTop: '0.5rem'
                      }}
                    >
                      Done & Close
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* STEP 1: Personal Info */}
                    {currentStep === 1 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.2s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: C.primary, fontWeight: '700', fontSize: '0.95rem' }}>
                          <User size={18} />
                          <span>Personal Information</span>
                        </div>

                        <div>
                          <label style={styles.label}>Full Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. John Doe"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            style={styles.input}
                          />
                        </div>

                        <div>
                          <label style={styles.label}>Email Address *</label>
                          <input
                            type="email"
                            required
                            placeholder="e.g. manager@lne.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            style={styles.input}
                          />
                        </div>

                        <div>
                          <label style={styles.label}>Phone Number *</label>
                          <input
                            type="tel"
                            required
                            placeholder="e.g. +234 803 123 4567"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            style={styles.input}
                          />
                        </div>

                        <div>
                          <label style={styles.label}>Branch Office Location *</label>
                          <select
                            value={formData.branch_office}
                            onChange={(e) => handleInputChange('branch_office', e.target.value)}
                            style={styles.select}
                          >
                            {BRANCH_OFFICES.map(office => (
                              <option key={office.city} value={office.city}>
                                {office.city} ({office.state} State)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={styles.label}>Residential/Office Address *</label>
                          <textarea
                            required
                            rows={2}
                            placeholder="State office address details..."
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            style={styles.textarea}
                          />
                        </div>
                      </div>
                    )}

                    {/* STEP 2: Permissions */}
                    {currentStep === 2 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.2s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: C.primary, fontWeight: '700', fontSize: '0.95rem' }}>
                          <Shield size={18} />
                          <span>Role & Access Permissions</span>
                        </div>

                        <p style={{ color: C.gray500, fontSize: '0.85rem', margin: 0 }}>
                          Select the modules and access level this branch manager is allowed to operate.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {AVAILABLE_PERMISSIONS.map(p => {
                            const isChecked = formData.permissions.includes(p.key);
                            return (
                              <label
                                key={p.key}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '0.75rem',
                                  padding: '1rem',
                                  border: `1.5px solid ${isChecked ? C.primary : C.gray200}`,
                                  borderRadius: '10px',
                                  cursor: 'pointer',
                                  backgroundColor: isChecked ? C.primaryLight : C.white,
                                  transition: 'all 0.2s'
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handlePermissionToggle(p.key)}
                                  style={{
                                    width: '18px',
                                    height: '18px',
                                    marginTop: '2px',
                                    accentColor: C.primary,
                                    cursor: 'pointer'
                                  }}
                                />
                                <div>
                                  <div style={{ fontSize: '0.9rem', fontWeight: '700', color: C.gray700 }}>
                                    {p.label}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: C.gray500, marginTop: '2px' }}>
                                    {p.desc}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          backgroundColor: C.errorLight,
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          border: `1px solid ${C.error}30`,
                          color: C.error,
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}>
                          <Lock size={14} />
                          <span>Notice: Managers cannot change their generated Username or Password.</span>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Auto Credentials generation confirmation (Only in create mode) */}
                    {!isEditMode && currentStep === 3 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.2s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: C.primary, fontWeight: '700', fontSize: '0.95rem' }}>
                          <Key size={18} />
                          <span>Login Credentials Summary</span>
                        </div>

                        <p style={{ color: C.gray500, fontSize: '0.85rem', margin: 0, lineHeight: '1.5' }}>
                          For security compliance, the credentials are automatically generated by the server.
                        </p>

                        <div style={{
                          backgroundColor: C.gray50,
                          border: `1px solid ${C.gray200}`,
                          borderRadius: '12px',
                          padding: '1.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.75rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', color: C.gray500, fontWeight: '600' }}>Username Format</span>
                            <span style={{ fontFamily: 'monospace', fontWeight: '700', color: C.gray700 }}>BM + 6 characters</span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${C.gray200}`, paddingTop: '0.75rem' }}>
                            <span style={{ fontSize: '0.85rem', color: C.gray500, fontWeight: '600' }}>Password Strength</span>
                            <span style={{ fontFamily: 'monospace', fontWeight: '700', color: C.gray700 }}>6 varchar password</span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${C.gray200}`, paddingTop: '0.75rem' }}>
                            <span style={{ fontSize: '0.85rem', color: C.gray500, fontWeight: '600' }}>Delivery Method</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: C.primaryDark }}>Send directly to Email</span>
                          </div>
                        </div>

                        <div style={{
                          backgroundColor: C.primaryLight,
                          border: `1.5px solid ${C.primary}`,
                          borderRadius: '12px',
                          padding: '1rem',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem'
                        }}>
                          <CheckSquare size={20} color={C.primary} style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: C.primaryDark }}>Email Sender Active</div>
                            <p style={{ fontSize: '0.75rem', color: C.gray600, margin: '2px 0 0' }}>
                              On creation, login credentials will be emailed to <strong>{formData.email}</strong>.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Stepper Navigation Buttons */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: `1px solid ${C.gray200}`,
                      paddingTop: '1.25rem',
                      marginTop: '0.5rem'
                    }}>
                      {currentStep > 1 ? (
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          style={styles.backButton}
                        >
                          <ArrowLeft size={16} /> Back
                        </button>
                      ) : (
                        <div />
                      )}

                      {currentStep < (isEditMode ? 2 : 3) ? (
                        <button
                          type="button"
                          onClick={handleNextStep}
                          style={styles.nextButton}
                        >
                          Continue <ArrowRight size={16} />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={submitting}
                          style={{
                            ...styles.submitButton,
                            opacity: submitting ? 0.65 : 1,
                            cursor: submitting ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {submitting ? (
                            <>
                              <Loader2 size={16} className="animate-spin" /> {isEditMode ? 'Updating...' : 'Creating...'}
                            </>
                          ) : (
                            <>
                              <CheckCircle size={16} /> {isEditMode ? 'Update Branch Manager' : 'Submit & Send Credentials'}
                            </>
                          )}
                        </button>
                      )}
                    </div>

                  </form>
                )}

              </div>
            </div>

          </div>
        )}

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
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
  },
  statCard: {
    background: C.white,
    borderRadius: '14px',
    padding: '1.25rem 1.5rem',
    border: `1px solid ${C.gray200}`,
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
  },
  statIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  statValue: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: C.gray700,
    lineHeight: '1.2'
  },
  statLabel: {
    fontSize: '0.75rem',
    color: C.gray500,
    fontWeight: '600',
    marginTop: '2px'
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: C.gray700,
    marginBottom: '0.4rem'
  },
  input: {
    width: '100%',
    padding: '0.7rem 0.85rem',
    border: `1px solid ${C.gray200}`,
    borderRadius: '8px',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    color: C.gray700,
    backgroundColor: C.white
  },
  select: {
    width: '100%',
    padding: '0.7rem 0.85rem',
    border: `1px solid ${C.gray200}`,
    borderRadius: '8px',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    color: C.gray700,
    backgroundColor: C.white,
    cursor: 'pointer'
  },
  textarea: {
    width: '100%',
    padding: '0.7rem 0.85rem',
    border: `1px solid ${C.gray200}`,
    borderRadius: '8px',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    color: C.gray700,
    resize: 'vertical'
  },
  backButton: {
    padding: '0.65rem 1.25rem',
    backgroundColor: C.gray100,
    color: C.gray700,
    border: `1px solid ${C.gray200}`,
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'all 0.2s'
  },
  nextButton: {
    padding: '0.65rem 1.5rem',
    backgroundColor: C.primary,
    color: C.white,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(0,168,89,0.15)'
  },
  submitButton: {
    padding: '0.65rem 1.75rem',
    backgroundColor: C.primary,
    color: C.white,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(0,168,89,0.25)'
  }
};

export default BranchManagersPage;
