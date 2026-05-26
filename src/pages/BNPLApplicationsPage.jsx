import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../layout/DashboardLayout';
import client from '../api/client';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Package, 
  CreditCard,
  Eye,
  Download,
  Filter,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Briefcase,
  Users,
  FileText
} from 'lucide-react';

const BNPLApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [fileRejInputs, setFileRejInputs] = useState({});
  const [processingId, setProcessingId] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await client('/admin/bnpl/applications');
      setApplications(data);
    } catch (err) {
      setError('Failed to load BNPL applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (id, status, reason = null, fileRejections = null) => {
    try {
      setProcessingId(id);
      await client(`/admin/bnpl/applications/${id}/status`, {
        method: 'PATCH',
        body: { status, rejection_reason: reason, file_rejections: fileRejections }
      });
      
      toast.success(`Application ${status} successfully`);
      fetchApplications();
      setIsRejectModalOpen(false);
      setSelectedApp(null);
      setRejectionReason('');
    } catch (err) {
      toast.error(err.message || 'Failed to update application status');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.product?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#E8F8EE'; // Light Green
      case 'rejected': return '#FFEBEA'; // Light Red
      default: return '#FFF4E5'; // Light Orange
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'approved': return '#00A859';
      case 'rejected': return '#FF3B30';
      default: return '#FF9500';
    }
  };

  const formatPlanType = (type) => {
    switch (type) {
      case 'bnpl_50': return '50% Deposit Plan';
      case 'bnpl_30_bank': return '30% Bank Financed';
      default: return type;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const normalizeUploadedDocuments = (application) => {
    const documents = application?.survey_data?.uploaded_documents ?? application?.survey_data?.documents;
    if (!documents) {
      return [];
    }

    // Support both old array/object shapes
    const entries = Array.isArray(documents) ? documents : Object.entries(documents).map(([k,v]) => ({ key: k, value: v }));

    const getDocument = (value, key, index) => {
      if (!value) return null;
      if (typeof value === 'string') {
        return {
          label: key ? String(key).replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : `Document ${index + 1}`,
          url: value,
        };
      }
      if (typeof value === 'object' && value !== null) {
        return {
          label: value.name || value.label || (key ? String(key).replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : `Document ${index + 1}`),
          url: value.url || value.fileUrl || value.document_url || value.source || '',
          type: value.type || value.fileType || value.document_type || '',
        };
      }
      return null;
    };

    if (Array.isArray(documents)) {
      return documents
        .map((value, index) => getDocument(value, null, index))
        .filter((item) => item && item.url);
    }

    return Object.entries(documents)
      .map(([key, value], index) => getDocument(value, key, index))
      .filter((item) => item && item.url);
  };

  const getUploadedDocuments = (application) => {
    const docs = normalizeUploadedDocuments(application);
    return docs.map((doc) => ({
      label: doc.label || 'Document',
      url: doc.url,
      type: doc.type || '',
      fileName: (() => {
        try {
          const parsed = new URL(doc.url);
          return decodeURIComponent(parsed.pathname.split('/').pop() || doc.label || 'Document');
        } catch {
          return doc.label || doc.url;
        }
      })(),
    }));
  };

  const uploadedDocuments = selectedApp ? getUploadedDocuments(selectedApp) : [];

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.8rem' }}>BNPL Applications</h2>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>Review and manage credit applications for solar packages.</p>
        </div>
      </div>

      {/* Filters & Search */}
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
            placeholder="Search by customer or package..."
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} color="#888" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.8rem 1rem',
              borderRadius: '8px',
              border: '1px solid #eee',
              outline: 'none',
              backgroundColor: '#fff',
              fontSize: '0.9rem',
              minWidth: '150px'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div style={{ 
        backgroundColor: '#fff', 
        borderRadius: '12px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#888' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #f3f3f3', 
              borderTop: '4px solid #00A859', 
              borderRadius: '50%', 
              margin: '0 auto 1rem',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p>Loading applications...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#FF3B30' }}>
            <XCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>{error}</p>
            <button 
              onClick={fetchApplications}
              style={{ 
                marginTop: '1rem', 
                padding: '0.6rem 1.2rem', 
                backgroundColor: '#00A859', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer' 
              }}
            >
              Retry
            </button>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#888' }}>
            <Clock size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
            <p>No applications found matching your criteria.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#fcfcfc', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Customer</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Package</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Plan & Deposit</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Date</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => (
                <tr key={app.id} style={{ borderBottom: '1px solid #f5f5f5', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '50%', 
                        backgroundColor: '#f0f0f0', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        color: '#666'
                      }}>
                        {app.user?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#333' }}>{app.user?.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{app.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: '500', color: '#444' }}>
                    {app.product?.name}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontSize: '0.9rem', color: '#333' }}>{formatPlanType(app.plan_type)}</div>
                    <div style={{ fontSize: '0.8rem', color: '#00A859', fontWeight: 'bold' }}>{formatCurrency(app.deposit_amount)}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      padding: '0.3rem 0.8rem', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold',
                      backgroundColor: getStatusColor(app.status),
                      color: getStatusTextColor(app.status),
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}>
                      {app.status === 'pending' ? <Clock size={12} /> : app.status === 'approved' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {app.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#888' }}>
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      {app.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'approved')}
                            disabled={processingId === app.id}
                            style={{ padding: '0.5rem', color: '#00A859', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                            title="Approve"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setIsRejectModalOpen(true);
                            }}
                            style={{ padding: '0.5rem', color: '#FF3B30', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      {app.status === 'approved' && (
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setIsRejectModalOpen(true);
                          }}
                          disabled={processingId === app.id}
                          style={{ padding: '0.5rem', color: '#FF3B30', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                          title="Change to Rejected"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                      {app.status === 'rejected' && (
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'approved')}
                          disabled={processingId === app.id}
                          style={{ padding: '0.5rem', color: '#00A859', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                          title="Change to Approved"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          setSelectedApp(app);
                          setIsDetailsModalOpen(true);
                        }}
                        style={{ padding: '0.5rem', color: '#888', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Rejection Modal */}
      {isRejectModalOpen && (
        <div style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000 
        }}>
          <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.4rem' }}>
              {selectedApp?.status === 'approved' ? 'Change to Rejected' : 'Reject Application'}
            </h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              {selectedApp?.status === 'approved' 
                ? `Change ${selectedApp?.user?.name}'s application status from approved to rejected. Please provide a reason.`
                : `Please provide a reason for rejecting ${selectedApp?.user?.name}'s application.`
              }
            </p>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '700', marginBottom: '0.5rem' }}>Rejection Reason (general)</label>
              <textarea
                placeholder="Enter general rejection reason (optional)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '10px',
                  border: '1px solid #eee',
                  outline: 'none',
                  minHeight: '80px',
                  marginBottom: '1rem',
                  fontSize: '0.95rem'
                }}
              ></textarea>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '700', marginBottom: '0.5rem' }}>Per-file rejection reasons (optional)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input placeholder="ID document reason" value={fileRejInputs.id_document || ''} onChange={(e) => setFileRejInputs({...fileRejInputs, id_document: e.target.value})} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #eee' }} />
                  <input placeholder="Utility bill reason" value={fileRejInputs.utility_bill || ''} onChange={(e) => setFileRejInputs({...fileRejInputs, utility_bill: e.target.value})} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #eee' }} />
                  <input placeholder="Residence permit reason" value={fileRejInputs.residence_permit || ''} onChange={(e) => setFileRejInputs({...fileRejInputs, residence_permit: e.target.value})} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #eee' }} />
                  <input placeholder="Bank statement reason" value={fileRejInputs.bank_statement || ''} onChange={(e) => setFileRejInputs({...fileRejInputs, bank_statement: e.target.value})} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #eee' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => {
                    setIsRejectModalOpen(false);
                    setSelectedApp(null);
                    setRejectionReason('');
                    setFileRejInputs({});
                  }}
                  style={{ flex: 1, padding: '0.8rem', border: '1px solid #eee', backgroundColor: '#fff', borderRadius: '10px', fontWeight: 'bold', color: '#666', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedApp.id, 'rejected', rejectionReason, fileRejInputs)}
                  disabled={processingId === selectedApp?.id}
                  style={{ 
                    flex: 1, 
                    padding: '0.8rem', 
                    backgroundColor: '#FF3B30', 
                    color: '#fff', 
                  border: 'none', 
                  borderRadius: '10px', 
                  fontWeight: 'bold', 
                  cursor: (rejectionReason.trim() && processingId !== selectedApp?.id) ? 'pointer' : 'not-allowed',
                  opacity: (rejectionReason.trim() && processingId !== selectedApp?.id) ? 1 : 0.6
                }}
              >
                {processingId === selectedApp?.id ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && selectedApp && (
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
            maxWidth: '700px', 
            maxHeight: '90vh', 
            overflowY: 'auto',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>Application Details</h3>
              <button onClick={() => setIsDetailsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                <XCircle size={28} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Status Banner */}
              <div style={{ 
                padding: '1.2rem', 
                borderRadius: '12px', 
                backgroundColor: getStatusColor(selectedApp.status), 
                color: getStatusTextColor(selectedApp.status),
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                {selectedApp.status === 'pending' ? <Clock size={24} /> : selectedApp.status === 'approved' ? <CheckCircle size={24} /> : <XCircle size={24} />}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold', opacity: 0.8, textTransform: 'uppercase' }}>Status</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{selectedApp.status.charAt(0).toUpperCase() + selectedApp.status.slice(1)}</div>
                </div>
              </div>

              {/* Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    <User size={14} /> Customer
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{selectedApp.user?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>{selectedApp.user?.email}</div>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    <Package size={14} /> Package
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{selectedApp.product?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>{selectedApp.product?.capacity} / {selectedApp.product?.voltage}</div>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    <CreditCard size={14} /> Plan Type
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{formatPlanType(selectedApp.plan_type)}</div>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    <ShieldCheck size={14} /> Deposit
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#00A859' }}>{formatCurrency(selectedApp.deposit_amount)}</div>
                </div>
              </div>

              {/* Survey Data Section */}
              {selectedApp.survey_data && (
                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={20} color="#00A859" /> Survey Information
                  </h4>
                  
                  {/* Personal Information */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#666', marginBottom: '0.8rem', borderBottom: '1px solid #eee', paddingBottom: '0.4rem' }}>Personal Information</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <DataField label="Surname" value={selectedApp.survey_data.personal?.surname} />
                      <DataField label="First Name" value={selectedApp.survey_data.personal?.firstName} />
                      <DataField label="Middle Name" value={selectedApp.survey_data.personal?.middleName} />
                      <DataField label="Phone Number" value={selectedApp.survey_data.personal?.phoneNumber} />
                      <DataField label="Phone Number 2" value={selectedApp.survey_data.personal?.phoneNumber2} />
                      <DataField label="Email" value={selectedApp.survey_data.personal?.email} />
                      <DataField label="Nationality" value={selectedApp.survey_data.personal?.nationality} />
                      <DataField label="State of Origin" value={selectedApp.survey_data.personal?.stateOfOrigin} />
                      <DataField label="Office Address" value={selectedApp.survey_data.personal?.officeAddress} />
                      <DataField label="Occupation" value={selectedApp.survey_data.personal?.occupation} />
                      <DataField label="Nature of Work" value={selectedApp.survey_data.personal?.natureOfWork} />
                      <div style={{ gridColumn: 'span 2' }}>
                        <DataField label="Residential Address" value={selectedApp.survey_data.personal?.residentialAddress} />
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <DataField label="Address 2" value={selectedApp.survey_data.personal?.address2} />
                      </div>
                    </div>
                  </div>

                  {/* Next of Kin Details */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#666', marginBottom: '0.8rem', borderBottom: '1px solid #eee', paddingBottom: '0.4rem' }}>Next of Kin (NOK) Details</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <DataField label="Surname" value={selectedApp.survey_data.nok?.surname} />
                      <DataField label="First Name" value={selectedApp.survey_data.nok?.firstName} />
                      <DataField label="Middle Name" value={selectedApp.survey_data.nok?.middleName} />
                      <DataField label="Phone Number" value={selectedApp.survey_data.nok?.phoneNumber} />
                      <DataField label="Phone Number 2" value={selectedApp.survey_data.nok?.phoneNumber2} />
                      <DataField label="Email" value={selectedApp.survey_data.nok?.email} />
                      <DataField label="Nationality" value={selectedApp.survey_data.nok?.nationality} />
                      <DataField label="State of Origin" value={selectedApp.survey_data.nok?.stateOfOrigin} />
                      <DataField label="Office Address" value={selectedApp.survey_data.nok?.officeAddress} />
                      <DataField label="Occupation" value={selectedApp.survey_data.nok?.occupation} />
                      <DataField label="Relationship" value={selectedApp.survey_data.nok?.relationship} />
                      <div style={{ gridColumn: 'span 2' }}>
                        <DataField label="Residential Address" value={selectedApp.survey_data.nok?.residentialAddress} />
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <DataField label="Address 2" value={selectedApp.survey_data.nok?.address2} />
                      </div>
                    </div>
                  </div>

                  {/* Banking Details */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#666', marginBottom: '0.8rem', borderBottom: '1px solid #eee', paddingBottom: '0.4rem' }}>Banking Details</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <DataField label="Account Type" value={selectedApp.survey_data.banking?.accountType || (selectedApp.survey_data.banking?.currentAccountNumber ? 'Current Account' : selectedApp.survey_data.banking?.businessAccountNumber ? 'Business Account' : selectedApp.survey_data.banking?.savingAccountNumber ? 'Saving Account' : '')} />
                      <DataField label="Account Name" value={selectedApp.survey_data.banking?.accountName || selectedApp.survey_data.banking?.currentAccountName || selectedApp.survey_data.banking?.businessAccountName || selectedApp.survey_data.banking?.savingAccountName} />
                      <DataField label="Bank Name" value={selectedApp.survey_data.banking?.bankName || selectedApp.survey_data.banking?.currentBankName || selectedApp.survey_data.banking?.businessBankName || selectedApp.survey_data.banking?.savingBankName} />
                      <DataField label="Account No." value={selectedApp.survey_data.banking?.accountNumber || selectedApp.survey_data.banking?.currentAccountNumber || selectedApp.survey_data.banking?.businessAccountNumber || selectedApp.survey_data.banking?.savingAccountNumber} />
                      <DataField label="BVN" value={selectedApp.survey_data.banking?.bvn} />
                      <DataField label="NIN" value={selectedApp.survey_data.banking?.nin} />
                      <DataField label="Voters Card VIN" value={selectedApp.survey_data.banking?.votersCardVin} />
                      {selectedApp.survey_data.banking?.drivingLicenseNumber && (
                        <>
                          <DataField label="Driving License No." value={selectedApp.survey_data.banking?.drivingLicenseNumber} />
                          <DataField label="Driving License Expiry" value={selectedApp.survey_data.banking?.drivingLicenseExpiry} />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#666', marginBottom: '0.8rem', borderBottom: '1px solid #eee', paddingBottom: '0.4rem' }}>Additional Information</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                      <DataField label="Expected Source of Income or Fund" value={selectedApp.survey_data.additional?.expectedSourceOfIncome} />
                      <DataField label="Address Change in Last 12 Months" value={selectedApp.survey_data.additional?.changedAddressLast12Months} />
                      <DataField label="Previous Address" value={selectedApp.survey_data.additional?.previousAddress} />
                      <DataField label="How did you hear about LNE Mobile Int’l?" value={selectedApp.survey_data.additional?.heardAboutLne} />
                      <DataField label="Referral Source" value={selectedApp.survey_data.additional?.referralSource} />
                    </div>
                  </div>

                  {/* Expected Source of Funds */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#666', marginBottom: '0.8rem', borderBottom: '1px solid #eee', paddingBottom: '0.4rem' }}>Expected Source of Funds</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <DataField label="Sources" value={Array.isArray(selectedApp.survey_data.funding?.sources) ? selectedApp.survey_data.funding.sources.join(', ') : selectedApp.survey_data.funding?.sources} />
                      <DataField label="Monthly Income" value={selectedApp.survey_data.funding?.monthlyIncomeAmount} />
                      <DataField label="Yearly Income" value={selectedApp.survey_data.funding?.yearlyIncomeAmount} />
                    </div>
                  </div>

                  {/* Declaration */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#666', marginBottom: '0.8rem', borderBottom: '1px solid #eee', paddingBottom: '0.4rem' }}>Declaration</h5>
                    <DataField label="Declaration Name" value={selectedApp.survey_data.declaration?.name} />
                    <DataField label="Declaration Agreed" value={selectedApp.survey_data.declaration?.agreed ? 'Yes' : 'No'} />
                  </div>

                  {Array.isArray(selectedApp.kyc_documents) && selectedApp.kyc_documents.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h5 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#666', marginBottom: '0.8rem', borderBottom: '1px solid #eee', paddingBottom: '0.4rem' }}>KYC Document Requirements</h5>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#444', lineHeight: '1.8' }}>
                        {selectedApp.kyc_documents.slice(1).map((item, index) => (
                          <li key={index} style={{ marginBottom: '0.6rem' }}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {uploadedDocuments.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h5 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#666', marginBottom: '0.8rem', borderBottom: '1px solid #eee', paddingBottom: '0.4rem' }}>Uploaded Documents</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        {uploadedDocuments.map((doc, index) => (
                          <div key={index} style={{ padding: '1rem', borderRadius: '12px', border: '1px solid #eee', backgroundColor: '#fff' }}>
                            <DataField label={doc.label} value={doc.fileName || 'Uploaded document'} />
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'grid', gap: '1rem' }}>
                        {uploadedDocuments.map((doc, index) => (
                          <div
                            key={index}
                            style={{
                              padding: '1rem',
                              borderRadius: '12px',
                              border: '1px solid #eee',
                              backgroundColor: '#fff',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.75rem'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 'bold', color: '#333', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{doc.label}</div>
                                <div style={{ fontSize: '0.8rem', color: '#666', wordBreak: 'break-all' }}>{doc.fileName}</div>
                                {doc.type ? (
                                  <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>{doc.type}</div>
                                ) : null}
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    padding: '0.55rem 0.85rem',
                                    borderRadius: '10px',
                                    border: '1px solid #ddd',
                                    backgroundColor: '#fff',
                                    color: '#333',
                                    textDecoration: 'none',
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  <Eye size={14} /> Preview
                                </a>
                                <a
                                  href={doc.url}
                                  download
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    padding: '0.55rem 0.85rem',
                                    borderRadius: '10px',
                                    border: '1px solid #00A859',
                                    backgroundColor: '#00A859',
                                    color: '#fff',
                                    textDecoration: 'none',
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  <Download size={14} /> Download
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Timestamps */}
              <div style={{ padding: '1.2rem 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: '#888', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={16} /> Applied On</span>
                  <span style={{ fontWeight: '500' }}>{new Date(selectedApp.created_at).toLocaleString()}</span>
                </div>
                {selectedApp.reviewed_at && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: '#888', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldCheck size={16} /> Reviewed On</span>
                    <span style={{ fontWeight: '500' }}>{new Date(selectedApp.reviewed_at).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Rejection Reason */}
              {selectedApp.status === 'rejected' && selectedApp.rejection_reason && (
                <div style={{ padding: '1.2rem', backgroundColor: '#FFEBEA', border: '1px solid #FF3B3020', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FF3B30', fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    <AlertCircle size={16} /> Rejection Reason
                  </div>
                  <p style={{ color: '#333', fontStyle: 'italic', lineHeight: '1.5' }}>"{selectedApp.rejection_reason}"</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                {selectedApp.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(selectedApp.id, 'approved')}
                      disabled={processingId === selectedApp.id}
                      style={{ 
                        flex: 1, 
                        backgroundColor: '#00A859', 
                        color: '#fff', 
                        padding: '1rem', 
                        borderRadius: '12px', 
                        border: 'none', 
                        fontWeight: 'bold', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <CheckCircle size={20} /> Approve
                    </button>
                    <button
                      onClick={() => {
                        setIsDetailsModalOpen(false);
                        setIsRejectModalOpen(true);
                      }}
                      style={{ 
                        flex: 1, 
                        backgroundColor: '#FF3B30', 
                        color: '#fff', 
                        padding: '1rem', 
                        borderRadius: '12px', 
                        border: 'none', 
                        fontWeight: 'bold', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <XCircle size={20} /> Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  style={{ 
                    flex: selectedApp.status === 'pending' ? 'none' : 1,
                    width: selectedApp.status === 'pending' ? 'auto' : '100%',
                    padding: '1rem 1.5rem', 
                    border: '1px solid #eee', 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    fontWeight: 'bold', 
                    color: '#666', 
                    cursor: 'pointer' 
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

const DataField = ({ label, value }) => (
  <div>
    <div style={{ fontSize: '0.7rem', color: '#888', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{label}</div>
    <div style={{ fontSize: '0.9rem', color: '#333', fontWeight: '500' }}>{value || 'N/A'}</div>
  </div>
);

export default BNPLApplicationsPage;
