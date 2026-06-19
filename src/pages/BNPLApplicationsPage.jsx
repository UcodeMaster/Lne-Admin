import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../layout/DashboardLayout';
import client from '../api/client';
import {
  Search, CheckCircle, XCircle, Clock, User, Package, CreditCard,
  Eye, Download, Filter, Calendar, ShieldCheck, AlertCircle,
  FileText, ChevronDown, Loader2, RefreshCw, TrendingUp,
  ArrowUpRight, MoreVertical, X, CheckSquare, AlertTriangle,
  BarChart3, ClipboardList, Trash2,
} from 'lucide-react';

// ─── Design tokens aligned with app palette ───────────────────────────────────
const C = {
  primary:      '#00A859',
  primaryDark:  '#007A3F',
  primaryLight: '#E8F8EE',
  accent:       '#FFB800',
  error:        '#FF3B30',
  errorLight:   '#FFEBEA',
  warning:      '#FF9500',
  warningLight: '#FFF4E5',
  dark:         '#1A1A2E',
  gray700:      '#374151',
  gray500:      '#6B7280',
  gray400:      '#9CA3AF',
  gray200:      '#E5E7EB',
  gray100:      '#F3F4F6',
  gray50:       '#F9FAFB',
  white:        '#FFFFFF',
  bg:           '#F0F2F5',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtCurrency = (v) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(v ?? 0);
const fmtDate     = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const planLabel   = (t) => ({ bnpl_50: '50% Deposit', bnpl_30_bank: '30% Bank Loan' }[t] ?? t ?? '—');

const statusCfg = {
  pending:  { bg: C.warningLight, color: C.warning,  border: '#FFCC80', Icon: Clock,       label: 'Pending'  },
  approved: { bg: C.primaryLight, color: C.primary,  border: '#A5D6A7', Icon: CheckCircle, label: 'Approved' },
  rejected: { bg: C.errorLight,   color: C.error,    border: '#FFCDD2', Icon: XCircle,     label: 'Rejected' },
};

const paymentStatusCfg = {
  unpaid:   { bg: C.errorLight,   color: C.error,    border: '#FFCDD2', label: 'Unpaid'   },
  partial:  { bg: C.warningLight, color: C.warning,  border: '#FFCC80', label: 'Partial'  },
  paid:     { bg: C.primaryLight, color: C.primary,  border: '#A5D6A7', label: 'Paid'     },
};

const stepCfg = {
  submitted: { label: 'Submitted',         step: 1 },
  review:    { label: 'Initial Review',    step: 2 },
  credit:    { label: 'Credit Assessment', step: 3 },
  decision:  { label: 'Final Decision',    step: 4 },
};

const REQUIRED_DOCS = { id_document: 'ID Document', utility_bill: 'Utility Bill', bank_statement: 'Bank Statement' };

function kycStatus(app) {
  if (app.kyc_status) return app.kyc_status;
  const uploaded = app?.survey_data?.uploaded_documents ?? {};
  const missing = Object.keys(REQUIRED_DOCS).filter(k => !uploaded[k]);
  return { is_complete: missing.length === 0, missing: Object.fromEntries(missing.map(k => [k, REQUIRED_DOCS[k]])) };
}

function normalizeDocuments(app) {
  const docs = app?.survey_data?.uploaded_documents ?? app?.survey_data?.documents;
  if (!docs || typeof docs !== 'object') return [];
  return Object.entries(docs).map(([key, url]) => ({
    key,
    label: REQUIRED_DOCS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    url: typeof url === 'string' ? url : url?.url ?? '',
    fileName: (() => { try { return decodeURIComponent(new URL(url).pathname.split('/').pop()); } catch { return url; } })(),
  })).filter(d => d.url);
}

// ─── Sub-components ───────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const cfg = statusCfg[status] ?? statusCfg.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      whiteSpace: 'nowrap',
    }}>
      <cfg.Icon size={12} /> {cfg.label}
    </span>
  );
};

const PaymentBadge = ({ status }) => {
  const cfg = paymentStatusCfg[status] ?? paymentStatusCfg.unpaid;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
};

const KycBadge = ({ app }) => {
  const kyc = kycStatus(app);
  if (kyc.is_complete) return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 8px', borderRadius:20, fontSize:11, fontWeight:700, background:C.primaryLight, color:C.primary }}>
      <ShieldCheck size={11}/> Complete
    </span>
  );
  const count = Object.keys(kyc.missing ?? {}).length;
  return (
    <span title={`Missing: ${Object.values(kyc.missing ?? {}).join(', ')}`} style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 8px', borderRadius:20, fontSize:11, fontWeight:700, background:C.warningLight, color:C.warning, cursor:'help' }}>
      <AlertTriangle size={11}/> {count} Missing
    </span>
  );
};

const StepPill = ({ step }) => {
  const cfg = stepCfg[step] ?? stepCfg.submitted;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, color:C.gray500, fontWeight:600 }}>
      <span style={{ width:16, height:16, borderRadius:'50%', background:C.gray200, color:C.gray700, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800 }}>{cfg.step}</span>
      {cfg.label}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, color = C.primary }) => (
  <div style={{ background:C.white, borderRadius:16, padding:'20px 24px', flex:1, minWidth:180, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', display:'flex', gap:16, alignItems:'center' }}>
    <div style={{ width:48, height:48, borderRadius:14, background: color + '15', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <Icon size={22} color={color}/>
    </div>
    <div>
      <div style={{ fontSize:24, fontWeight:800, color:C.dark, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:12, color:C.gray500, marginTop:4, fontWeight:600 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:C.gray400, marginTop:2 }}>{sub}</div>}
    </div>
  </div>
);

const Field = ({ label, value }) => (
  <div>
    <div style={{ fontSize:10, color:C.gray400, fontWeight:700, textTransform:'uppercase', letterSpacing:0.6, marginBottom:3 }}>{label}</div>
    <div style={{ fontSize:13.5, color: value ? C.gray700 : C.gray400, fontWeight: value ? 500 : 400 }}>{value || 'N/A'}</div>
  </div>
);

const SectionTitle = ({ children }) => (
  <div style={{ fontSize:11, fontWeight:800, color:C.gray500, textTransform:'uppercase', letterSpacing:0.8, padding:'12px 0 8px', borderBottom:`1px solid ${C.gray200}`, marginBottom:12 }}>
    {children}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const BNPLApplicationsPage = () => {
  const [applications, setApplications]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [searchTerm, setSearchTerm]       = useState('');
  const [statusFilter, setStatusFilter]   = useState('all');
  const [selectedApp, setSelectedApp]     = useState(null);
  const [panelOpen, setPanelOpen]         = useState(false);
  const [rejectModal, setRejectModal]     = useState(false);
  const [rejReason, setRejReason]         = useState('');
  const [fileRejInputs, setFileRejInputs] = useState({});
  const [processingId, setProcessingId]   = useState(null);
  const [actionMenu, setActionMenu]       = useState(null);
  const [paymentModal, setPaymentModal]   = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('unpaid');

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const data = await client('/admin/bnpl/applications');
      setApplications(data);
    } catch (err) {
      setError('Failed to load applications. Please retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);
  useEffect(() => {
    if (!actionMenu) return;
    const close = () => setActionMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [actionMenu]);

  const openPanel  = (app) => { setSelectedApp(app); setPanelOpen(true); };
  const closePanel = () => { setPanelOpen(false); setTimeout(() => setSelectedApp(null), 300); };

  const handleStatus = async (id, status, reason = null, fileRejections = null) => {
    try {
      setProcessingId(id);
      await client(`/admin/bnpl/applications/${id}/status`, {
        method: 'PATCH',
        body: { status, rejection_reason: reason, file_rejections: fileRejections },
      });
      toast.success(`Application ${status} successfully`);
      fetchApplications();
      setRejectModal(false); setRejReason(''); setFileRejInputs({});
      if (selectedApp?.id === id) setSelectedApp(prev => prev ? { ...prev, status, rejection_reason: reason, file_rejections: fileRejections } : null);
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleStep = async (id, step) => {
    try {
      setProcessingId(id);
      await client(`/admin/bnpl/applications/${id}/status`, { method: 'PATCH', body: { current_step: step } });
      toast.success(`Step updated to: ${stepCfg[step]?.label ?? step}`);
      fetchApplications();
      if (selectedApp?.id === id) setSelectedApp(prev => prev ? { ...prev, current_step: step } : null);
    } catch (err) {
      toast.error(err.message || 'Failed to update step');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application? This cannot be undone.')) return;
    try {
      setProcessingId(id);
      await client(`/admin/bnpl/applications/${id}`, { method: 'DELETE' });
      toast.success('Application deleted');
      fetchApplications();
      if (selectedApp?.id === id) closePanel();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setProcessingId(null);
    }
  };

  const handlePaymentUpdate = async (id) => {
    try {
      setProcessingId(id);
      await client(`/admin/bnpl/applications/${id}/status`, {
        method: 'PATCH',
        body: { 
          actual_payment_amount: parseFloat(paymentAmount) || 0,
          payment_status: paymentStatus 
        },
      });
      toast.success('Payment status updated successfully');
      fetchApplications();
      setPaymentModal(false);
      setPaymentAmount('');
      setPaymentStatus('unpaid');
      if (selectedApp?.id === id) {
        setSelectedApp(prev => prev ? { 
          ...prev, 
          actual_payment_amount: parseFloat(paymentAmount) || 0,
          payment_status: paymentStatus 
        } : null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update payment status');
    } finally {
      setProcessingId(null);
    }
  };

  const openPaymentModal = (app) => {
    setSelectedApp(app);
    setPaymentAmount(app.actual_payment_amount?.toString() || '');
    setPaymentStatus(app.payment_status || 'unpaid');
    setPaymentModal(true);
  };

  const filtered = applications.filter(app => {
    const q = searchTerm.toLowerCase();
    const customerName = app.user?.name || app.survey_data?.customer_name || '';
    const customerEmail = app.user?.email || app.survey_data?.customer_email || '';
    const matchSearch = !q || customerName.toLowerCase().includes(q) || customerEmail.toLowerCase().includes(q) || app.product?.name?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = { all: applications.length, pending: 0, approved: 0, rejected: 0 };
  applications.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });

  const totalDeposits = applications.filter(a => a.status === 'approved').reduce((s, a) => s + parseFloat(a.deposit_amount ?? 0), 0);
  const kycPending    = applications.filter(a => a.status === 'pending' && !kycStatus(a).is_complete).length;

  return (
    <DashboardLayout>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .bnpl-row:hover { background: #F9FAFB !important; }
        .bnpl-row:hover .row-actions { opacity: 1 !important; }
        .row-actions { opacity: 0; transition: opacity 0.15s; }
        .action-btn:hover { background: var(--hover-bg, #F3F4F6) !important; }
        .tab-pill:hover { background: #E5E7EB !important; }
        .tab-pill.active { background: #00A859 !important; color: #fff !important; }
        .doc-card:hover { border-color: #00A859 !important; background: #F0FBF5 !important; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }
      `}</style>

      {/* ── Page header ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:800, color:C.dark, margin:0 }}>BNPL Applications</h2>
          <p style={{ color:C.gray500, marginTop:4, fontSize:13 }}>Review, manage and track credit applications for solar packages.</p>
        </div>
        <button onClick={fetchApplications} disabled={loading} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 18px', background:C.white, border:`1px solid ${C.gray200}`, borderRadius:10, fontWeight:700, fontSize:13, color:C.gray700, cursor:'pointer' }}>
          <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}/> Refresh
        </button>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
        <StatCard icon={ClipboardList} label="Total Applications" value={counts.all}      color={C.primary} />
        <StatCard icon={Clock}         label="Pending Review"      value={counts.pending}  color={C.warning} />
        <StatCard icon={CheckCircle}   label="Approved"            value={counts.approved} color={C.primary} sub={`Deposits: ${fmtCurrency(totalDeposits)}`} />
        <StatCard icon={XCircle}       label="Rejected"            value={counts.rejected} color={C.error}   />
        <StatCard icon={AlertTriangle} label="KYC Incomplete"      value={kycPending}      color={C.accent}  sub="Pending with missing docs" />
      </div>

      {/* ── Filters ── */}
      <div style={{ background:C.white, borderRadius:14, padding:'14px 20px', boxShadow:`0 1px 4px rgba(0,0,0,0.06)`, marginBottom:20, display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:220 }}>
          <Search size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:C.gray400 }}/>
          <input
            type="text" placeholder="Search by customer, email or package…"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ width:'100%', padding:'9px 12px 9px 38px', borderRadius:10, border:`1px solid ${C.gray200}`, outline:'none', fontSize:13, color:C.dark, background:C.gray50 }}
          />
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {['all','pending','approved','rejected'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`tab-pill${statusFilter===s?' active':''}`}
              style={{ padding:'7px 14px', borderRadius:20, border:'none', fontSize:12, fontWeight:700, cursor:'pointer', background: statusFilter===s ? C.primary : C.gray100, color: statusFilter===s ? C.white : C.gray500, textTransform:'capitalize', transition:'all 0.15s' }}>
              {s === 'all' ? `All (${counts.all})` : `${s.charAt(0).toUpperCase()+s.slice(1)} (${counts[s]})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table card ── */}
      <div style={{ background:C.white, borderRadius:16, boxShadow:`0 1px 4px rgba(0,0,0,0.06)`, overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:'60px', textAlign:'center', color:C.gray400 }}>
            <Loader2 size={36} style={{ animation:'spin 1s linear infinite', margin:'0 auto 12px', display:'block', color:C.primary }}/>
            <p style={{ fontSize:13 }}>Loading applications…</p>
          </div>
        ) : error ? (
          <div style={{ padding:'60px', textAlign:'center', color:C.error }}>
            <AlertCircle size={40} style={{ margin:'0 auto 12px', display:'block', opacity:0.5 }}/>
            <p style={{ marginBottom:16 }}>{error}</p>
            <button onClick={fetchApplications} style={{ padding:'8px 20px', background:C.primary, color:C.white, border:'none', borderRadius:8, fontWeight:700, cursor:'pointer' }}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:'60px', textAlign:'center', color:C.gray400 }}>
            <BarChart3 size={40} style={{ margin:'0 auto 12px', display:'block', opacity:0.2 }}/>
            <p style={{ fontSize:13 }}>No applications match your filters.</p>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'separate', borderSpacing:'0' }}>
              <thead>
                <tr style={{ background:C.gray50 }}>
                  {['ID','Customer','Registration Source','Package','Plan / Deposit','Initial Payment','Status','KYC','Applied','Actions'].map((h, i) => (
                    <th key={h} style={{
                      padding:'14px 16px', fontSize:12, color:C.gray500, fontWeight:600,
                      textTransform:'uppercase', letterSpacing:0.5,
                      textAlign: i === 9 ? 'center' : 'left',
                      whiteSpace:'nowrap', borderBottom:`1px solid ${C.gray200}`,
                      minWidth: i === 9 ? 100 : undefined,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(app => {
                  const processing = processingId === app.id;
                  return (
                    <tr key={app.id} className="bnpl-row" style={{ borderBottom:`1px solid ${C.gray100}`, cursor:'default', background:C.white, transition:'background 0.15s' }}>
                      {/* ID */}
                      <td style={{ padding:'13px 16px', fontFamily:'monospace', fontSize:12, fontWeight:700, color:C.primary, whiteSpace:'nowrap' }}>
                        #{app.id.substring(0,8).toUpperCase()}
                      </td>
                      {/* Customer */}
                      <td style={{ padding:'13px 16px', minWidth:180 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:34, height:34, borderRadius:'50%', background:`${C.primary}20`, color:C.primary, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:14, flexShrink:0 }}>
                            {(app.user?.name?.charAt(0) || app.survey_data?.customer_name?.charAt(0) || 'U').toUpperCase()}
                          </div>
                          <div style={{ minWidth:0 }}>
                            <div style={{ fontWeight:700, color:C.dark, fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:140 }}>{app.user?.name || app.survey_data?.customer_name || '—'}</div>
                            <div style={{ fontSize:11, color:C.gray400, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:140 }}>{app.user?.email || app.survey_data?.customer_email || '—'}</div>
                          </div>
                        </div>
                      </td>
                      {/* Registration Source */}
                      <td style={{ padding:'13px 16px', fontSize:12, color:C.gray700, textTransform:'capitalize' }}>
                        {
                          app.registration_source
                            ? app.registration_source.charAt(0).toUpperCase() +
                              app.registration_source.slice(1)
                            : '—'
                        }
                      </td>
                      {/* Package */}
                      <td style={{ padding:'13px 16px', fontSize:13, color:C.gray700, maxWidth:160 }}>
                        <div style={{ fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{app.product?.name ?? '—'}</div>
                        <div style={{ fontSize:11, color:C.gray400 }}>{app.product?.capacity}</div>
                      </td>
                      {/* Plan */}
                      <td style={{ padding:'13px 16px', whiteSpace:'nowrap' }}>
                        <div style={{ fontSize:12, color:C.gray700, fontWeight:600 }}>{planLabel(app.plan_type)}</div>
                        <div style={{ fontSize:13, color:C.primary, fontWeight:800 }}>{fmtCurrency(app.deposit_amount)}</div>
                      </td>
                      {/* Initial Payment */}
                      <td style={{ padding:'13px 16px', whiteSpace:'nowrap' }}>
                        <div style={{ fontSize:13, color:C.gray700, fontWeight:600 }}>{fmtCurrency(app.actual_payment_amount)}</div>
                        <div style={{ marginTop:4 }}><PaymentBadge status={app.payment_status || 'unpaid'}/></div>
                      </td>
                      {/* Status */}
                      <td style={{ padding:'13px 16px', whiteSpace:'nowrap' }}>
                        <Badge status={app.status}/>
                        <div style={{ marginTop:5 }}><StepPill step={app.current_step ?? 'submitted'}/></div>
                      </td>
                      {/* KYC */}
                      <td style={{ padding:'13px 16px' }}>
                        <KycBadge app={app}/>
                      </td>
                      {/* Date */}
                      <td style={{ padding:'13px 16px', fontSize:12, color:C.gray500, whiteSpace:'nowrap' }}>
                        {fmtDate(app.created_at)}
                      </td>
                      {/* Actions */}
                      <td style={{ padding:'13px 16px', textAlign:'center', whiteSpace:'nowrap' }}>
                        <div className="row-actions" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
                          <button onClick={() => openPanel(app)} title="View Details" className="action-btn"
                            style={{ padding:'6px 10px', borderRadius:8, border:`1px solid ${C.gray200}`, background:C.white, color:C.gray600, cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontSize:12, fontWeight:600 }}>
                            <Eye size={14}/> View
                          </button>
                          {app.status === 'pending' && (
                            <button onClick={() => handleStatus(app.id,'approved')} title="Approve" disabled={processing} className="action-btn"
                              style={{ padding:'6px 8px', borderRadius:8, border:`1px solid ${C.primaryLight}`, background:C.primaryLight, color:C.primary, cursor:'pointer', display:'flex', alignItems:'center' }}>
                              {processing ? <Loader2 size={14} style={{ animation:'spin 1s linear infinite' }}/> : <CheckCircle size={14}/>}
                            </button>
                          )}
                          {app.status === 'pending' && (
                            <button onClick={() => { setSelectedApp(app); setRejectModal(true); }} title="Reject" className="action-btn"
                              style={{ padding:'6px 8px', borderRadius:8, border:`1px solid ${C.errorLight}`, background:C.errorLight, color:C.error, cursor:'pointer', display:'flex', alignItems:'center' }}>
                              <XCircle size={14}/>
                            </button>
                          )}
                          <button onClick={() => openPaymentModal(app)} title="Update Payment" className="action-btn"
                            style={{ padding:'6px 8px', borderRadius:8, border:`1px solid ${C.primaryLight}`, background:C.primaryLight, color:C.primary, cursor:'pointer', display:'flex', alignItems:'center' }}>
                            <CreditCard size={14}/>
                          </button>
                          <button onClick={() => { if (window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) handleDelete(app.id); }}
                            title="Delete" className="action-btn"
                            style={{ padding:'6px 8px', borderRadius:8, border:`1px solid ${C.errorLight}`, background:C.errorLight, color:C.error, cursor:'pointer', display:'flex', alignItems:'center' }}>
                            <Trash2 size={14}/>
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

        {/* ── Table footer ── */}
        {!loading && !error && filtered.length > 0 && (
          <div style={{ padding:'12px 20px', borderTop:`1px solid ${C.gray100}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:12, color:C.gray400 }}>Showing <strong>{filtered.length}</strong> of <strong>{applications.length}</strong> applications</span>
          </div>
        )}
      </div> {/* ← FIX: closes the outer table card div (background:C.white, borderRadius:16) */}

      {/* ══════════════════════════════════════════════════════════════════════
          DETAIL SIDE PANEL
      ══════════════════════════════════════════════════════════════════════ */}
      {panelOpen && selectedApp && (
        <>
          {/* Backdrop */}
          <div onClick={closePanel} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', zIndex:900, backdropFilter:'blur(2px)' }}/>
          {/* Panel */}
          <div style={{
            position:'fixed', top:0, right:0, bottom:0, width:'min(680px, 95vw)',
            background:C.white, zIndex:901, overflowY:'auto',
            boxShadow:'-8px 0 40px rgba(0,0,0,0.12)',
            animation:'slideIn 0.25s ease',
            display:'flex', flexDirection:'column',
          }}>
            {/* Panel header */}
            <div style={{ padding:'20px 24px', borderBottom:`1px solid ${C.gray200}`, display:'flex', justifyContent:'space-between', alignItems:'center', background:C.white, position:'sticky', top:0, zIndex:10 }}>
              <div>
                <div style={{ fontFamily:'monospace', fontSize:12, color:C.primary, fontWeight:700 }}>#{selectedApp.id.substring(0,8).toUpperCase()}</div>
                <h3 style={{ fontSize:17, fontWeight:800, color:C.dark, margin:'2px 0 0' }}>Application Details</h3>
              </div>
              <button onClick={closePanel} style={{ width:36, height:36, borderRadius:'50%', border:`1px solid ${C.gray200}`, background:C.gray50, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:C.gray500 }}>
                <X size={18}/>
              </button>
            </div>

            {/* Panel body */}
            <div style={{ flex:1, padding:'24px', display:'flex', flexDirection:'column', gap:24 }}>

              {/* Status + Actions row */}
              <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
                <Badge status={selectedApp.status}/>
                <KycBadge app={selectedApp}/>
                <StepPill step={selectedApp.current_step ?? 'submitted'}/>
                <div style={{ flex:1 }}/>
                {selectedApp.status === 'pending' && (
                  <>
                    <button onClick={() => handleStatus(selectedApp.id,'approved')} disabled={processingId===selectedApp.id}
                      style={{ padding:'8px 18px', borderRadius:10, border:'none', background:C.primary, color:C.white, fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                      <CheckCircle size={15}/> Approve
                    </button>
                    <button onClick={() => setRejectModal(true)}
                      style={{ padding:'8px 18px', borderRadius:10, border:'none', background:C.error, color:C.white, fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                      <XCircle size={15}/> Reject
                    </button>
                  </>
                )}
                {selectedApp.status === 'rejected' && (
                  <button onClick={() => handleStatus(selectedApp.id,'approved')} disabled={processingId===selectedApp.id}
                    style={{ padding:'8px 18px', borderRadius:10, border:'none', background:C.primary, color:C.white, fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                    <CheckCircle size={15}/> Re-Approve
                  </button>
                )}
                <button onClick={() => handleDelete(selectedApp.id)} disabled={processingId===selectedApp.id}
                  style={{ padding:'8px 12px', borderRadius:10, border:`1px solid ${C.gray200}`, background:C.white, color:C.error, cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:700 }}>
                  <Trash2 size={15}/>
                </button>
              </div>

              {/* Rejection reason banner */}
              {selectedApp.status === 'rejected' && selectedApp.rejection_reason && (
                <div style={{ padding:'14px 16px', background:C.errorLight, borderRadius:12, border:`1px solid #FFCDD2`, display:'flex', gap:12 }}>
                  <AlertCircle size={18} color={C.error} style={{ flexShrink:0, marginTop:1 }}/>
                  <div>
                    <div style={{ fontSize:11, fontWeight:800, color:C.error, textTransform:'uppercase', marginBottom:4 }}>Rejection Reason</div>
                    <p style={{ fontSize:13, color:C.gray700, lineHeight:1.6, margin:0 }}>"{selectedApp.rejection_reason}"</p>
                  </div>
                </div>
              )}
              {/* Per-file rejection reasons */}
              {selectedApp.status === 'rejected' && selectedApp.file_rejections && Object.keys(selectedApp.file_rejections).length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.error, textTransform: 'uppercase', marginBottom: 4 }}>
                    Per-File Rejection Reasons
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Object.entries(selectedApp.file_rejections).map(([fileKey, reason]) => (
                      <div key={fileKey} style={{ padding: '10px 12px', background: C.errorLight, borderRadius: 8, border: `1px solid #FFCDD2` }}>
                        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                          {REQUIRED_DOCS[fileKey] || fileKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </div>
                        <p style={{ fontSize: 12, color: C.gray700, lineHeight: 1.4, margin: 0 }}>"{reason}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info cards grid */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {[
                  { Icon: User,       label:'Customer',  children: <>
                    <div style={{ fontSize:14, fontWeight:700, color:C.dark }}>{selectedApp.user?.name || selectedApp.survey_data?.customer_name || '—'}</div>
                    <div style={{ fontSize:12, color:C.gray400 }}>{selectedApp.user?.email || selectedApp.survey_data?.customer_email || '—'}</div>
                    <div style={{ fontSize:12, color:C.gray500 }}>{selectedApp.user?.phone || selectedApp.survey_data?.customer_phone || '—'}</div>
                  </> },
                  { Icon: Package,    label:'Package',   children: <>
                    <div style={{ fontSize:14, fontWeight:700, color:C.dark }}>{selectedApp.product?.name ?? '—'}</div>
                    <div style={{ fontSize:12, color:C.gray400 }}>{selectedApp.product?.capacity} · {selectedApp.product?.voltage}</div>
                  </> },
                  { Icon: CreditCard, label:'Plan Type', children: <>
                    <div style={{ fontSize:14, fontWeight:700, color:C.dark }}>{planLabel(selectedApp.plan_type)}</div>
                    <div style={{ fontSize:13, color:C.primary, fontWeight:800 }}>{fmtCurrency(selectedApp.deposit_amount)}</div>
                  </> },
                  { Icon: CreditCard, label:'Payment Status', children: <>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                      <PaymentBadge status={selectedApp.payment_status || 'unpaid'}/>
                    </div>
                    <div style={{ fontSize:14, fontWeight:700, color:C.dark }}>{fmtCurrency(selectedApp.actual_payment_amount)}</div>
                    <button onClick={() => openPaymentModal(selectedApp)}
                      style={{ marginTop:8, padding:'6px 12px', borderRadius:8, border:`1px solid ${C.primary}`, background:C.primaryLight, color:C.primary, fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                      <CreditCard size={12}/> Update Payment
                    </button>
                  </> },
                  { Icon: Calendar,   label:'Timeline',  children: <>
                    <div style={{ fontSize:12, color:C.gray700 }}>Applied: <strong>{fmtDateTime(selectedApp.created_at)}</strong></div>
                    {selectedApp.reviewed_at && <div style={{ fontSize:12, color:C.gray700, marginTop:3 }}>Reviewed: <strong>{fmtDateTime(selectedApp.reviewed_at)}</strong></div>}
                  </> },
                ].map(({ Icon, label, children }) => (
                  <div key={label} style={{ padding:'14px 16px', background:C.gray50, borderRadius:12, border:`1px solid ${C.gray200}` }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, color:C.gray400, fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:0.6, marginBottom:8 }}>
                      <Icon size={12}/> {label}
                    </div>
                    {children}
                  </div>
                ))}
              </div>

              {/* Progress step control */}
              {selectedApp.status === 'pending' && (
                <div style={{ padding:'16px', background:C.primaryLight, borderRadius:12, border:`1px solid ${C.primary}30` }}>
                  <div style={{ fontWeight:800, fontSize:13, color:C.primaryDark, marginBottom:6, display:'flex', alignItems:'center', gap:6 }}>
                    <TrendingUp size={15} color={C.primary}/> Update Application Progress
                  </div>
                  <p style={{ fontSize:12, color:C.gray500, marginBottom:12 }}>Changes reflect instantly on the customer's mobile app.</p>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {Object.entries(stepCfg).filter(([k]) => k !== 'decision').map(([key, cfg]) => {
                      const active = (selectedApp.current_step ?? 'submitted') === key;
                      return (
                        <button key={key} onClick={() => handleStep(selectedApp.id, key)} disabled={processingId===selectedApp.id}
                          style={{ padding:'8px 14px', borderRadius:20, border: active ? 'none' : `1px solid ${C.gray200}`, background: active ? C.primary : C.white, color: active ? C.white : C.gray700, fontWeight:700, fontSize:12, cursor:'pointer', transition:'all 0.15s' }}>
                          {cfg.step}. {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* KYC Document Status */}
              <div>
                <SectionTitle>KYC Document Status</SectionTitle>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10 }}>
                  {Object.entries(REQUIRED_DOCS).map(([key, label]) => {
                    const uploaded = selectedApp?.survey_data?.uploaded_documents?.[key];
                    return (
                      <div key={key} style={{ padding:'12px', borderRadius:10, border:`1.5px solid ${uploaded ? '#A5D6A7' : '#FFCDD2'}`, background: uploaded ? C.primaryLight : C.errorLight, display:'flex', flexDirection:'column', gap:6, alignItems:'center', textAlign:'center' }}>
                        {uploaded ? <ShieldCheck size={20} color={C.primary}/> : <AlertTriangle size={20} color={C.error}/>}
                        <div style={{ fontSize:11, fontWeight:700, color: uploaded ? C.primaryDark : C.error }}>{label}</div>
                        <div style={{ fontSize:10, color: uploaded ? C.primary : C.error }}>{uploaded ? 'Uploaded' : 'Missing'}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Uploaded Documents */}
              {(() => {
                const docs = normalizeDocuments(selectedApp);
                if (!docs.length) return null;
                return (
                  <div>
                    <SectionTitle>Uploaded Documents ({docs.length})</SectionTitle>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      {docs.map((doc, i) => (
                        <div key={i} className="doc-card" style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', borderRadius:12, border:`1px solid ${C.gray200}`, background:C.white, transition:'all 0.15s' }}>
                          <div style={{ width:38, height:38, borderRadius:10, background:C.primaryLight, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <FileText size={18} color={C.primary}/>
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontWeight:700, fontSize:13, color:C.dark }}>{doc.label}</div>
                            <div style={{ fontSize:11, color:C.gray400, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{doc.fileName}</div>
                          </div>
                          <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                            <a href={doc.url} target="_blank" rel="noreferrer"
                              style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8, border:`1px solid ${C.gray200}`, color:C.gray700, textDecoration:'none', fontSize:12, fontWeight:600, background:C.white }}>
                              <Eye size={13}/> Preview
                            </a>
                            <a href={doc.url} download
                              style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8, border:`1px solid ${C.primary}`, color:C.primary, textDecoration:'none', fontSize:12, fontWeight:600, background:C.primaryLight }}>
                              <Download size={13}/> Save
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Survey Data */}
              {selectedApp.survey_data && (
                <>
                  {selectedApp.survey_data.personal && (
                    <div>
                      <SectionTitle>Personal Information</SectionTitle>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 20px' }}>
                        <Field label="Surname"         value={selectedApp.survey_data.personal?.surname}/>
                        <Field label="First Name"      value={selectedApp.survey_data.personal?.firstName}/>
                        <Field label="Middle Name"     value={selectedApp.survey_data.personal?.middleName}/>
                        <Field label="Phone"           value={selectedApp.survey_data.personal?.phoneNumber}/>
                        <Field label="Alt Phone"       value={selectedApp.survey_data.personal?.phoneNumber2}/>
                        <Field label="Email"           value={selectedApp.survey_data.personal?.email}/>
                        <Field label="Nationality"     value={selectedApp.survey_data.personal?.nationality}/>
                        <Field label="State of Origin" value={selectedApp.survey_data.personal?.stateOfOrigin}/>
                        <Field label="Occupation"      value={selectedApp.survey_data.personal?.occupation}/>
                        <Field label="Nature of Work"  value={selectedApp.survey_data.personal?.natureOfWork}/>
                        <div style={{ gridColumn:'span 2' }}><Field label="Residential Address" value={selectedApp.survey_data.personal?.residentialAddress}/></div>
                        <div style={{ gridColumn:'span 2' }}><Field label="Office Address"       value={selectedApp.survey_data.personal?.officeAddress}/></div>
                      </div>
                    </div>
                  )}
                  {selectedApp.survey_data.nok && (
                    <div>
                      <SectionTitle>Next of Kin</SectionTitle>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 20px' }}>
                        <Field label="Surname"      value={selectedApp.survey_data.nok?.surname}/>
                        <Field label="First Name"   value={selectedApp.survey_data.nok?.firstName}/>
                        <Field label="Relationship" value={selectedApp.survey_data.nok?.relationship}/>
                        <Field label="Phone"        value={selectedApp.survey_data.nok?.phoneNumber}/>
                        <Field label="Email"        value={selectedApp.survey_data.nok?.email}/>
                        <Field label="Occupation"   value={selectedApp.survey_data.nok?.occupation}/>
                        <div style={{ gridColumn:'span 2' }}><Field label="Address" value={selectedApp.survey_data.nok?.residentialAddress}/></div>
                      </div>
                    </div>
                  )}
                  {selectedApp.survey_data.banking && (
                    <div>
                      <SectionTitle>Banking Details</SectionTitle>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 20px' }}>
                        <Field label="Bank Name"    value={selectedApp.survey_data.banking?.bankName || selectedApp.survey_data.banking?.currentBankName}/>
                        <Field label="Account Name" value={selectedApp.survey_data.banking?.accountName || selectedApp.survey_data.banking?.currentAccountName}/>
                        <Field label="Account No."  value={selectedApp.survey_data.banking?.accountNumber || selectedApp.survey_data.banking?.currentAccountNumber}/>
                        <Field label="Account Type" value={selectedApp.survey_data.banking?.accountType}/>
                        <Field label="BVN"          value={selectedApp.survey_data.banking?.bvn}/>
                        <Field label="NIN"          value={selectedApp.survey_data.banking?.nin}/>
                        <Field label="Voters Card"  value={selectedApp.survey_data.banking?.votersCardVin}/>
                      </div>
                    </div>
                  )}
                  {selectedApp.survey_data.funding && (
                    <div>
                      <SectionTitle>Source of Funds</SectionTitle>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 20px' }}>
                        <div style={{ gridColumn:'span 2' }}>
                          <Field label="Sources" value={Array.isArray(selectedApp.survey_data.funding?.sources) ? selectedApp.survey_data.funding.sources.join(', ') : selectedApp.survey_data.funding?.sources}/>
                        </div>
                        <Field label="Monthly Income" value={selectedApp.survey_data.funding?.monthlyIncomeAmount}/>
                        <Field label="Yearly Income"  value={selectedApp.survey_data.funding?.yearlyIncomeAmount}/>
                      </div>
                    </div>
                  )}
                  {selectedApp.survey_data.additional && (
                    <div>
                      <SectionTitle>Additional Information</SectionTitle>
                      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                        <Field label="Expected Source of Income"          value={selectedApp.survey_data.additional?.expectedSourceOfIncome}/>
                        <Field label="Address Changed in Last 12 Months"  value={selectedApp.survey_data.additional?.changedAddressLast12Months}/>
                        {selectedApp.survey_data.additional?.previousAddress && <Field label="Previous Address" value={selectedApp.survey_data.additional?.previousAddress}/>}
                        <Field label="How Did You Hear About LNE?"        value={selectedApp.survey_data.additional?.heardAboutLne}/>
                      </div>
                    </div>
                  )}
                  {selectedApp.survey_data.declaration && (
                    <div>
                      <SectionTitle>Declaration</SectionTitle>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 20px' }}>
                        <Field label="Declared By" value={selectedApp.survey_data.declaration?.name}/>
                        <Field label="Agreed"      value={selectedApp.survey_data.declaration?.agreed ? '✅ Yes' : '❌ No'}/>
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>{/* /panel body */}
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          REJECT MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {rejectModal && selectedApp && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:C.white, borderRadius:20, width:'100%', maxWidth:480, boxShadow:'0 20px 60px rgba(0,0,0,0.2)', overflow:'hidden' }}>
            <div style={{ padding:'20px 24px', borderBottom:`1px solid ${C.gray200}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontWeight:800, fontSize:16, color:C.dark }}>Reject Application</div>
                <div style={{ fontSize:12, color:C.gray500, marginTop:2 }}>Customer: <strong>{selectedApp.user?.name || selectedApp.survey_data?.customer_name || '—'}</strong></div>
              </div>
              <button onClick={() => { setRejectModal(false); setRejReason(''); setFileRejInputs({}); }}
                style={{ width:32, height:32, borderRadius:'50%', border:`1px solid ${C.gray200}`, background:C.gray50, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:C.gray500 }}>
                <X size={16}/>
              </button>
            </div>

            <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:C.gray700, display:'block', marginBottom:6 }}>Rejection Reason <span style={{ color:C.error }}>*</span></label>
                <textarea value={rejReason} onChange={e => setRejReason(e.target.value)}
                  placeholder="Describe the reason for rejection…"
                  style={{ width:'100%', minHeight:90, padding:'10px 14px', borderRadius:10, border:`1.5px solid ${C.gray200}`, outline:'none', fontSize:13, resize:'vertical', boxSizing:'border-box', fontFamily:'inherit' }}/>
              </div>

              <div>
                <label style={{ fontSize:12, fontWeight:700, color:C.gray700, display:'block', marginBottom:8 }}>Per-Document Rejection Reason <span style={{ fontSize:11, color:C.gray400 }}>(optional)</span></label>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {Object.entries(REQUIRED_DOCS).map(([key, label]) => (
                    <div key={key} style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <div style={{ width:100, fontSize:11, color:C.gray500, fontWeight:600, flexShrink:0 }}>{label}</div>
                      <input placeholder={`Reason for ${label}`} value={fileRejInputs[key] || ''}
                        onChange={e => setFileRejInputs({ ...fileRejInputs, [key]: e.target.value })}
                        style={{ flex:1, padding:'7px 10px', borderRadius:8, border:`1px solid ${C.gray200}`, outline:'none', fontSize:12 }}/>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => { setRejectModal(false); setRejReason(''); setFileRejInputs({}); }}
                  style={{ flex:1, padding:'11px', border:`1px solid ${C.gray200}`, background:C.white, borderRadius:12, fontWeight:700, fontSize:13, color:C.gray700, cursor:'pointer' }}>
                  Cancel
                </button>
                <button onClick={() => handleStatus(selectedApp.id, 'rejected', rejReason, fileRejInputs)}
                  disabled={!rejReason.trim() || processingId === selectedApp.id}
                  style={{ flex:1, padding:'11px', border:'none', background: rejReason.trim() ? C.error : C.gray200, color: rejReason.trim() ? C.white : C.gray400, borderRadius:12, fontWeight:700, fontSize:13, cursor: rejReason.trim() ? 'pointer' : 'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  {processingId === selectedApp.id
                    ? <><Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/> Processing…</>
                    : <><XCircle size={15}/> Confirm Rejection</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ══════════════════════════════════════════════════════════════════════
          PAYMENT STATUS MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {paymentModal && selectedApp && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:C.white, borderRadius:20, width:'100%', maxWidth:480, boxShadow:'0 20px 60px rgba(0,0,0,0.2)', overflow:'hidden' }}>
            <div style={{ padding:'20px 24px', borderBottom:`1px solid ${C.gray200}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontWeight:800, fontSize:16, color:C.dark }}>Update Payment Status</div>
                <div style={{ fontSize:12, color:C.gray500, marginTop:2 }}>Customer: <strong>{selectedApp.user?.name || selectedApp.survey_data?.customer_name || '—'}</strong></div>
              </div>
              <button onClick={() => { setPaymentModal(false); setPaymentAmount(''); setPaymentStatus('unpaid'); }}
                style={{ width:32, height:32, borderRadius:'50%', border:`1px solid ${C.gray200}`, background:C.gray50, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:C.gray500 }}>
                <X size={16}/>
              </button>
            </div>

            <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:C.gray700, display:'block', marginBottom:6 }}>Payment Amount (₦)</label>
                <input 
                  type="number" 
                  value={paymentAmount} 
                  onChange={e => setPaymentAmount(e.target.value)}
                  placeholder="Enter payment amount"
                  min="0"
                  style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:`1.5px solid ${C.gray200}`, outline:'none', fontSize:13, boxSizing:'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize:12, fontWeight:700, color:C.gray700, display:'block', marginBottom:6 }}>Payment Status</label>
                <div style={{ display:'flex', gap:8 }}>
                  {['unpaid', 'partial', 'paid'].map(status => (
                    <button
                      key={status}
                      onClick={() => setPaymentStatus(status)}
                      style={{ 
                        flex:1, padding:'10px', borderRadius:10, 
                        border: paymentStatus === status ? 'none' : `1px solid ${C.gray200}`, 
                        background: paymentStatus === status ? (status === 'paid' ? C.primary : status === 'partial' ? C.warning : C.error) : C.white, 
                        color: paymentStatus === status ? C.white : C.gray700, 
                        fontWeight:700, fontSize:12, cursor:'pointer', textTransform:'capitalize' 
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => { setPaymentModal(false); setPaymentAmount(''); setPaymentStatus('unpaid'); }}
                  style={{ flex:1, padding:'11px', border:`1px solid ${C.gray200}`, background:C.white, borderRadius:12, fontWeight:700, fontSize:13, color:C.gray700, cursor:'pointer' }}>
                  Cancel
                </button>
                <button onClick={() => handlePaymentUpdate(selectedApp.id)}
                  disabled={!paymentAmount || processingId === selectedApp.id}
                  style={{ flex:1, padding:'11px', border:'none', background: paymentAmount ? C.primary : C.gray200, color: paymentAmount ? C.white : C.gray400, borderRadius:12, fontWeight:700, fontSize:13, cursor: paymentAmount ? 'pointer' : 'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  {processingId === selectedApp.id
                    ? <><Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/> Processing…</>
                    : <><CheckCircle size={15}/> Update Payment</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default BNPLApplicationsPage;
