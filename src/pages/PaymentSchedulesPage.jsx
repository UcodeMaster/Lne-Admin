import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../layout/DashboardLayout';
import client from '../api/client';
import {
  Search, RefreshCw, Loader2, AlertCircle, CreditCard,
  Eye, X, User, Calendar, Clock, CheckCircle, AlertTriangle,
  DollarSign, TrendingUp, Users, ArrowUpRight, ArrowDownRight,
  Mail, Phone, Package,
} from 'lucide-react';

const C = {
  primary: '#00A859', primaryDark: '#007A3F', primaryLight: '#E8F8EE',
  error: '#FF3B30', errorLight: '#FFF0EF', warning: '#FF9500', warningLight: '#FFF4E5',
  accent: '#FFB800', accentLight: '#FFF8E6',
  dark: '#0D1117', gray700: '#374151', gray500: '#6B7280', gray400: '#9CA3AF',
  gray300: '#D1D5DB', gray200: '#E5E7EB', gray100: '#F3F4F6', gray50: '#F9FAFB',
  white: '#FFFFFF', border: '#E8ECF0',
};

const fmtCurrency = (v) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(v ?? 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const statusCfg = {
  upcoming: { bg: '#EEF2FF', color: '#3730A3', border: '#C7D2FE', dot: '#6366F1', label: 'Upcoming' },
  paid:     { bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0', dot: '#10B981', label: 'Paid' },
  overdue:  { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA', dot: '#EF4444', label: 'Overdue' },
  skipped:  { bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB', dot: '#9CA3AF', label: 'Skipped' },
};

const StatusBadge = ({ status }) => {
  const c = statusCfg[status] || statusCfg.upcoming;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px',
      borderRadius: 20, fontSize: 11.5, fontWeight: 700, background: c.bg, color: c.color,
      border: `1px solid ${c.border}`, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, color = C.primary, trend }) => (
  <div style={{
    background: C.white, borderRadius: 16, padding: '22px 24px', flex: 1, minWidth: 180,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${C.border}`,
    display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color, borderRadius: '16px 16px 0 0' }} />
    <div style={{ width: 42, height: 42, borderRadius: 12, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={20} color={color} />
    </div>
    <div>
      <div style={{ fontSize: 26, fontWeight: 800, color: C.dark, lineHeight: 1, letterSpacing: -0.5 }}>{value}</div>
      <div style={{ fontSize: 12.5, color: C.gray500, marginTop: 4, fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: 11.5, color: C.gray400, marginTop: 3 }}>{sub}</div>}
    </div>
    {trend !== undefined && (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px',
        borderRadius: 20, fontSize: 11, fontWeight: 700, alignSelf: 'flex-start',
        color: trend >= 0 ? C.primary : C.error, background: trend >= 0 ? C.primaryLight : C.errorLight,
      }}>
        {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {Math.abs(trend)}%
      </div>
    )}
  </div>
);

export default function PaymentSchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [scheduleDetail, setScheduleDetail] = useState(null);
  const [activeTab, setActiveTab] = useState('schedules');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [schedulesRes, statsRes] = await Promise.all([
        client('/admin/payment-schedules?per_page=100'),
        client('/admin/payment-schedules/stats'),
      ]);
      setSchedules(schedulesRes.data || []);
      setStats(statsRes);
    } catch (err) {
      setError('Failed to load payment schedules.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openPanel = async (schedule) => {
    setSelectedSchedule(schedule);
    setPanelOpen(true);
    setDetailLoading(true);
    try {
      const detail = await client(`/admin/payment-schedules/${schedule.id}`);
      setScheduleDetail(detail);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const closePanel = () => {
    setPanelOpen(false);
    setTimeout(() => { setSelectedSchedule(null); setScheduleDetail(null); }, 300);
  };

  const filtered = schedules.filter(s => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q ||
      s.user?.name?.toLowerCase().includes(q) ||
      s.user?.email?.toLowerCase().includes(q) ||
      s.user?.phone?.includes(q) ||
      s.bnpl_application_id?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = { all: schedules.length, upcoming: 0, paid: 0, overdue: 0, skipped: 0 };
  schedules.forEach(s => { if (counts[s.status] !== undefined) counts[s.status]++; });

  return (
    <DashboardLayout>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .schedule-row:hover { background: #F9FAFB !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.dark, margin: 0 }}>Payment Schedules</h2>
          <p style={{ color: C.gray500, marginTop: 4, fontSize: 13 }}>Track customer installment plans and upcoming payments.</p>
        </div>
        <button onClick={fetchData} disabled={loading} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px',
          background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 10,
          fontWeight: 700, fontSize: 13, color: C.gray700, cursor: 'pointer',
        }}>
          <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <StatCard icon={Calendar} label="Total Installments" value={stats.total_schedules} color={C.primary} />
          <StatCard icon={Clock} label="Upcoming This Week" value={stats.upcoming_this_week} sub={fmtCurrency(stats.upcoming_this_week_amount)} color="#6366F1" />
          <StatCard icon={AlertTriangle} label="Overdue" value={stats.overdue_count} sub={fmtCurrency(stats.overdue_amount)} color={C.error} />
          <StatCard icon={CheckCircle} label="Paid" value={stats.paid_count} sub={`${stats.active_customers} active customers`} color={C.primary} />
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: C.gray100, borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {['schedules', 'customers'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '8px 18px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', background: activeTab === tab ? C.white : 'transparent',
            color: activeTab === tab ? C.dark : C.gray500,
            boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            textTransform: 'capitalize', transition: 'all 0.15s',
          }}>
            {tab === 'schedules' ? `All Schedules (${counts.all})` : 'Customers'}
          </button>
        ))}
      </div>

      {/* Search + Filter */}
      {activeTab === 'schedules' && (
        <div style={{
          background: C.white, borderRadius: 14, padding: '14px 20px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20,
          display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.gray400 }} />
            <input type="text" placeholder="Search by customer name, email, or phone..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)} style={{
                width: '100%', padding: '9px 12px 9px 38px', borderRadius: 10,
                border: `1px solid ${C.gray200}`, outline: 'none', fontSize: 13, color: C.dark, background: C.gray50,
              }} />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['all', 'upcoming', 'overdue', 'paid'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{
                padding: '7px 14px', borderRadius: 20, border: 'none', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', background: statusFilter === s ? C.primary : C.gray100,
                color: statusFilter === s ? C.white : C.gray500, textTransform: 'capitalize', transition: 'all 0.15s',
              }}>
                {s === 'all' ? `All (${counts.all})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${counts[s] ?? 0})`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      {activeTab === 'schedules' && (
        <div style={{ background: C.white, borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: C.gray400 }}>
              <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px', display: 'block', color: C.primary }} />
              <p style={{ fontSize: 13 }}>Loading payment schedules...</p>
            </div>
          ) : error ? (
            <div style={{ padding: '60px', textAlign: 'center', color: C.error }}>
              <AlertCircle size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.5 }} />
              <p style={{ marginBottom: 16 }}>{error}</p>
              <button onClick={fetchData} style={{ padding: '8px 20px', background: C.primary, color: C.white, border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: C.gray400 }}>
              <CreditCard size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
              <p style={{ fontSize: 13 }}>No payment schedules found.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                <thead>
                  <tr style={{ background: C.gray50 }}>
                    {['Customer', 'Product', 'Installment', 'Due Date', 'Amount', 'Status', 'Action'].map((h, i) => (
                      <th key={h} style={{
                        padding: '14px 16px', fontSize: 12, color: C.gray500, fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: 0.5,
                        textAlign: i === 6 ? 'center' : 'left', whiteSpace: 'nowrap',
                        borderBottom: `1px solid ${C.gray200}`,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(schedule => (
                    <tr key={schedule.id} className="schedule-row" style={{
                      borderBottom: `1px solid ${C.gray100}`, background: C.white, transition: 'background 0.15s',
                    }}>
                      <td style={{ padding: '13px 16px', minWidth: 160 }}>
                        <div style={{ fontWeight: 700, color: C.dark, fontSize: 13 }}>{schedule.user?.name ?? '—'}</div>
                        <div style={{ fontSize: 11, color: C.gray400 }}>{schedule.user?.email}</div>
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: C.gray700 }}>
                        {schedule.application?.product?.name ?? '—'}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: C.dark }}>
                        #{schedule.installment_number}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 12, color: C.gray500, whiteSpace: 'nowrap' }}>
                        {fmtDate(schedule.due_date)}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 800, color: C.dark, whiteSpace: 'nowrap' }}>
                        {fmtCurrency(schedule.amount)}
                      </td>
                      <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                        <StatusBadge status={schedule.status} />
                      </td>
                      <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                        <button onClick={() => openPanel(schedule)} style={{
                          padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.gray200}`,
                          background: C.white, color: C.gray700, cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600,
                        }}>
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.gray100}` }}>
              <span style={{ fontSize: 12, color: C.gray400 }}>Showing <strong>{filtered.length}</strong> of <strong>{schedules.length}</strong> installments</span>
            </div>
          )}
        </div>
      )}

      {/* Detail Panel */}
      {panelOpen && selectedSchedule && (
        <>
          <div onClick={closePanel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 900, backdropFilter: 'blur(2px)' }} />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(560px, 95vw)',
            background: C.white, zIndex: 901, overflowY: 'auto',
            boxShadow: '-8px 0 40px rgba(0,0,0,0.12)', animation: 'slideIn 0.25s ease',
          }}>
            {/* Panel Header */}
            <div style={{
              padding: '20px 24px', borderBottom: `1px solid ${C.gray200}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              position: 'sticky', top: 0, background: C.white, zIndex: 10,
            }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: C.primary, fontWeight: 700 }}>
                  #{selectedSchedule.bnpl_application_id?.substring(0, 8).toUpperCase()}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: C.dark, margin: '2px 0 0' }}>Installment Details</h3>
              </div>
              <button onClick={closePanel} style={{
                width: 36, height: 36, borderRadius: '50%', border: `1px solid ${C.gray200}`,
                background: C.gray50, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gray500,
              }}>
                <X size={18} />
              </button>
            </div>

            {detailLoading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: C.gray400 }}>
                <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px', display: 'block', color: C.primary }} />
              </div>
            ) : scheduleDetail ? (
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Current Installment */}
                <div style={{ padding: 16, background: C.gray50, borderRadius: 12, border: `1px solid ${C.gray200}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.gray400, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 }}>Current Installment</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: C.dark }}>#{selectedSchedule.installment_number}</div>
                      <div style={{ fontSize: 12, color: C.gray500 }}>of {scheduleDetail.summary?.total_installments} installments</div>
                    </div>
                    <StatusBadge status={selectedSchedule.status} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ padding: '10px 14px', background: C.white, borderRadius: 10 }}>
                      <div style={{ fontSize: 11, color: C.gray400, fontWeight: 600 }}>Amount Due</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>{fmtCurrency(selectedSchedule.amount)}</div>
                    </div>
                    <div style={{ padding: '10px 14px', background: C.white, borderRadius: 10 }}>
                      <div style={{ fontSize: 11, color: C.gray400, fontWeight: 600 }}>Due Date</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{fmtDate(selectedSchedule.due_date)}</div>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                {selectedSchedule.user && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.gray400, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 }}>Customer</div>
                    <div style={{ padding: '14px 16px', background: C.gray50, borderRadius: 12, border: `1px solid ${C.gray200}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <User size={14} color={C.gray400} />
                        <span style={{ fontWeight: 700, fontSize: 14, color: C.dark }}>{selectedSchedule.user.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Mail size={14} color={C.gray400} />
                        <span style={{ fontSize: 13, color: C.gray500 }}>{selectedSchedule.user.email}</span>
                      </div>
                      {selectedSchedule.user.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Phone size={14} color={C.gray400} />
                          <span style={{ fontSize: 13, color: C.gray500 }}>{selectedSchedule.user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Product */}
                {scheduleDetail.schedule?.application?.product && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.gray400, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 }}>Product</div>
                    <div style={{ padding: '14px 16px', background: C.gray50, borderRadius: 12, border: `1px solid ${C.gray200}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Package size={16} color={C.primary} />
                      <span style={{ fontWeight: 700, fontSize: 14, color: C.dark }}>{scheduleDetail.schedule.application.product.name}</span>
                    </div>
                  </div>
                )}

                {/* All Installments */}
                {scheduleDetail.all_installments && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.gray400, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 }}>Payment Schedule</div>
                    <div style={{ background: C.gray50, borderRadius: 12, border: `1px solid ${C.gray200}`, overflow: 'hidden' }}>
                      {scheduleDetail.all_installments.map((inst, idx) => {
                        const cfg = statusCfg[inst.status] || statusCfg.upcoming;
                        const isCurrent = inst.id === selectedSchedule.id;
                        return (
                          <div key={inst.id} style={{
                            padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            borderBottom: idx < scheduleDetail.all_installments.length - 1 ? `1px solid ${C.gray200}` : 'none',
                            background: isCurrent ? '#F0FDF4' : 'transparent',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 800,
                              }}>
                                {inst.status === 'paid' ? <CheckCircle size={14} /> : `#${inst.installment_number}`}
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>Installment #{inst.installment_number}</div>
                                <div style={{ fontSize: 11, color: C.gray400 }}>{fmtDate(inst.due_date)}</div>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{fmtCurrency(inst.amount)}</div>
                              <div style={{ fontSize: 10, color: cfg.color, fontWeight: 600 }}>{cfg.label}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
