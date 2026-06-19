import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '../layout/DashboardLayout';
import client from '../api/client';
import {
  ShoppingCart, CreditCard, TrendingUp, Users, Package,
  CheckCircle, Clock, XCircle, Loader2, Eye, Filter,
  Calendar, User, Mail, DollarSign, BarChart3, Activity,
  Target, Zap, ArrowUpRight, ArrowDownRight, RefreshCw,
  MapPin, TrendingDown, AlertTriangle, ShoppingBag, Sun, Wallet
} from 'lucide-react';

/* ─── Design Tokens ─────────────────────────────────────────── */
const C = {
  primary: '#00A859',
  primaryDark: '#007A3F',
  primaryLight: '#E8F8EE',
  accent: '#FFB800',
  warning: '#FF9500',
  warningLight: '#FFF4E5',
  error: '#FF3B30',
  errorLight: '#FFEBEA',
  dark: '#0D1117',
  gray800: '#1F2937',
  gray700: '#374151',
  gray500: '#6B7280',
  gray400: '#9CA3AF',
  gray300: '#D1D5DB',
  gray200: '#E5E7EB',
  gray100: '#F3F4F6',
  gray50: '#F9FAFB',
  white: '#FFFFFF',
  border: '#E8ECF0',
};

/* ─── Formatters ─────────────────────────────────────────────── */
const fmtCurrency = (v) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(v ?? 0);
const fmtNumber = (v) => new Intl.NumberFormat('en-NG').format(v ?? 0);
const fmtTimeAgo = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

/* ─── Enhanced Stat Card ────────────────────────────────────── */
const StatCard = ({ title, value, icon: Icon, color, subtitle, trend, loading }) => (
  <div style={{
    padding: '1.5rem',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    border: '1px solid rgba(0,0,0,0.03)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    position: 'relative',
    overflow: 'hidden',
    minWidth: '200px'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.1)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
  }}>
    <div style={{
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      height: '4px',
      backgroundColor: color
    }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <h4 style={{ color: '#666', margin: 0, fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h4>
        <div style={{
          padding: '0.5rem',
          borderRadius: '10px',
          backgroundColor: `${color}15`,
          color: color
        }}>
          <Icon size={20} />
        </div>
      </div>
      {trend !== undefined && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '700',
          color: trend >= 0 ? C.primary : C.error,
          background: trend >= 0 ? C.primaryLight : C.errorLight,
        }}>
          {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div style={{
      fontSize: '2rem',
      fontWeight: '800',
      color: '#222',
      lineHeight: '1.2',
      letterSpacing: '-0.5px'
    }}>
      {loading ? <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} /> : value}
    </div>
    <div style={{
      fontSize: '0.8rem',
      color: '#999',
      fontWeight: '500',
      marginTop: '0.5rem'
    }}>
      {subtitle}
    </div>
  </div>
);

/* ─── Mini Bar Chart ────────────────────────────────────────── */
const MiniBarChart = ({ data, color = C.primary, height = 60 }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: `${height}px` }}>
      {data.map((item, idx) => (
        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div
            style={{
              width: '100%',
              height: `${(item.value / maxValue) * height}px`,
              backgroundColor: item.highlight ? color : `${color}40`,
              borderRadius: '3px 3px 0 0',
              transition: 'height 0.3s ease',
              minHeight: '4px'
            }}
            title={`${item.label}: ${fmtNumber(item.value)}`}
          />
          {item.showLabel && (
            <span style={{ fontSize: '9px', color: '#999', fontWeight: '600' }}>{item.label}</span>
          )}
        </div>
      ))}
    </div>
  );
};

/* ─── Circular Progress ─────────────────────────────────────── */
const CircularProgress = ({ value, max, color = C.primary, size = 60, strokeWidth = 6, label }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (value / max) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={`${color}20`} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={circumference - progress}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <span style={{ fontSize: '10px', fontWeight: '700', color: '#666' }}>{label}</span>
    </div>
  );
};

/* ─── Activity Feed Item ────────────────────────────────────── */
const ActivityFeedItem = ({ type, message, time, amount }) => {
  const config = {
    order: { icon: ShoppingCart, color: C.primary, bg: C.primaryLight },
    payment: { icon: DollarSign, color: '#10B981', bg: '#ECFDF5' },
    bnpl: { icon: Clock, color: C.warning, bg: C.warningLight },
  };
  const c = config[type] || config.order;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      borderRadius: '10px',
      backgroundColor: '#FAFBFC',
      border: `1px solid ${C.border}`,
      transition: 'background 0.15s ease'
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = C.gray50}
    onMouseLeave={(e) => e.currentTarget.style.background = '#FAFBFC'}>
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        backgroundColor: c.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <c.icon size={16} color={c.color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', color: C.dark, fontWeight: '600', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {message}
        </div>
        <div style={{ fontSize: '11px', color: C.gray400, fontWeight: '500' }}>
          {fmtTimeAgo(time)}
        </div>
      </div>
      {amount && (
        <div style={{ fontSize: '13px', fontWeight: '700', color: C.dark, whiteSpace: 'nowrap' }}>
          {fmtCurrency(amount)}
        </div>
      )}
    </div>
  );
};

const BranchManagerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const data = await client('/branch-manager/dashboard');
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (err) {
      toast.error('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => fetchDashboardData(true), 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: C.primary }} />
          <p style={{ marginTop: '1rem', color: C.gray500, fontWeight: '600' }}>Loading branch analytics...</p>
        </div>
      </DashboardLayout>
    );
  }

  const metrics = dashboardData?.metrics || {};
  const branch = dashboardData?.branch || {};
  const orders = dashboardData?.orders || [];
  const allBnplApplications = dashboardData?.bnpl_applications || [];
  const bnplApplications = allBnplApplications.filter(app => app.status !== 'draft');
  const drafts = allBnplApplications.filter(app => app.status === 'draft');

  return (
    <DashboardLayout>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* ── Page Header ── */}
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
              Branch Dashboard
            </div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: C.dark, letterSpacing: '-0.5px' }}>
              Welcome, {branch.manager || 'Manager'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <MapPin size={14} color={C.primary} />
              <span style={{ fontSize: '13px', color: C.gray500, fontWeight: '600' }}>
                {branch.city}, {branch.state}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {lastUpdated && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: C.gray400 }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: C.primary,
                  animation: 'pulse 2s infinite'
                }} />
                Live • Updated {fmtTimeAgo(lastUpdated)}
              </div>
            )}
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
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
                cursor: refreshing ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Revenue Breakdown Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <StatCard
            title="Total Revenue"
            value={fmtCurrency(metrics.total_revenue)}
            icon={DollarSign}
            color={C.primary}
            subtitle="All sources (paid orders)"
            trend={metrics.revenue_trend}
            loading={refreshing}
          />
          <StatCard
            title="Solar Packages"
            value={fmtCurrency(metrics.solar_revenue)}
            icon={Sun}
            color="#D97706"
            subtitle={`${metrics.solar_order_count || 0} orders • ${fmtCurrency(metrics.solar_today_revenue || 0)} today`}
            loading={refreshing}
          />
          <StatCard
            title="Marketplace"
            value={fmtCurrency(metrics.marketplace_revenue)}
            icon={ShoppingBag}
            color="#007AFF"
            subtitle={`${metrics.marketplace_order_count || 0} orders • ${fmtCurrency(metrics.marketplace_today_revenue || 0)} today`}
            loading={refreshing}
          />
          <StatCard
            title="BNPL Revenue"
            value={fmtCurrency(metrics.bnpl_revenue)}
            icon={CreditCard}
            color="#5856D6"
            subtitle={`${metrics.bnpl_approved_count || 0} approved • ${fmtCurrency(metrics.bnpl_deposit_today || 0)} today`}
            loading={refreshing}
          />
        </div>

        {/* ── Secondary Stats Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <StatCard
            title="Today's Revenue"
            value={fmtCurrency(metrics.today_revenue)}
            icon={TrendingUp}
            color="#10B981"
            subtitle={`Solar: ${fmtCurrency(metrics.solar_today_revenue || 0)} • Market: ${fmtCurrency(metrics.marketplace_today_revenue || 0)}`}
            loading={refreshing}
          />
          <StatCard
            title="Total Orders"
            value={metrics.total_orders}
            icon={ShoppingBag}
            color="#007AFF"
            subtitle={`${metrics.today_orders} today`}
            loading={refreshing}
          />
          <StatCard
            title="BNPL Applications"
            value={bnplApplications.length}
            icon={CreditCard}
            color="#5856D6"
            subtitle={`${metrics.pending_bnpl} pending review`}
            loading={refreshing}
          />
          <StatCard
            title="Customers Served"
            value={metrics.this_week_customers || 0}
            icon={Users}
            color={C.accent}
            subtitle="This week"
            loading={refreshing}
          />
        </div>

        {/* ── Performance Metrics Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {/* Conversion & Averages */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: C.dark }}>Performance Metrics</h3>
              <Target size={18} color={C.primary} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '1rem 0' }}>
              <CircularProgress
                value={metrics.paid_orders || 0}
                max={metrics.total_orders || 1}
                color={C.primary}
                size={70}
                strokeWidth={7}
                label={`${metrics.total_orders > 0 ? Math.round((metrics.paid_orders / metrics.total_orders) * 100) : 0}%`}
              />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: C.gray400, fontWeight: '600', marginBottom: '4px' }}>Payment Rate</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: C.dark }}>{metrics.paid_orders || 0} / {metrics.total_orders || 0}</div>
                <div style={{ fontSize: '11px', color: C.gray400, marginTop: '2px' }}>Paid / Total Orders</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: C.gray50, borderRadius: '10px', marginTop: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: C.dark }}>{fmtCurrency(metrics.avg_order_value)}</div>
                <div style={{ fontSize: '10px', color: C.gray400, fontWeight: '600' }}>Avg. Order</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: C.dark }}>{fmtCurrency(metrics.avg_bnpl_value)}</div>
                <div style={{ fontSize: '10px', color: C.gray400, fontWeight: '600' }}>Avg. BNPL</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: C.dark }}>{metrics.this_week_revenue ? fmtCurrency(metrics.this_week_revenue) : '₦0'}</div>
                <div style={{ fontSize: '10px', color: C.gray400, fontWeight: '600' }}>This Week</div>
              </div>
            </div>
          </div>

          {/* Order Status Distribution */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: C.dark }}>Revenue Distribution</h3>
              <BarChart3 size={18} color={C.primary} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '1rem 0' }}>
              <CircularProgress
                value={metrics.solar_revenue || 0}
                max={metrics.total_revenue || 1}
                color="#D97706"
                size={65}
                strokeWidth={6}
                label={metrics.total_revenue > 0 ? `${Math.round(((metrics.solar_revenue || 0) / (metrics.total_revenue || 1)) * 100)}%` : '0%'}
              />
              <CircularProgress
                value={metrics.marketplace_revenue || 0}
                max={metrics.total_revenue || 1}
                color="#007AFF"
                size={65}
                strokeWidth={6}
                label={metrics.total_revenue > 0 ? `${Math.round(((metrics.marketplace_revenue || 0) / (metrics.total_revenue || 1)) * 100)}%` : '0%'}
              />
              <CircularProgress
                value={metrics.bnpl_revenue || 0}
                max={metrics.total_revenue || 1}
                color="#5856D6"
                size={65}
                strokeWidth={6}
                label={metrics.total_revenue > 0 ? `${Math.round(((metrics.bnpl_revenue || 0) / (metrics.total_revenue || 1)) * 100)}%` : '0%'}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '0.5rem' }}>
              {[
                { label: 'Solar Packages', value: metrics.solar_revenue || 0, color: '#D97706', bg: '#FEF3C7' },
                { label: 'Marketplace', value: metrics.marketplace_revenue || 0, color: '#007AFF', bg: '#DBEAFE' },
                { label: 'BNPL', value: metrics.bnpl_revenue || 0, color: '#5856D6', bg: '#EDE9FE' }
              ].map((item) => (
                <div key={item.label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  backgroundColor: item.bg,
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }} />
                    <span style={{ fontWeight: '600', color: item.color, fontSize: '12px' }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: item.color }}>{fmtCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* BNPL Status */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: C.dark }}>BNPL Overview</h3>
              <CreditCard size={18} color="#5856D6" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Approved', value: metrics.approved_bnpl || 0, color: C.primary, bg: C.primaryLight },
                { label: 'Pending', value: metrics.pending_bnpl || 0, color: C.warning, bg: C.warningLight },
                { label: 'Rejected', value: metrics.rejected_bnpl || 0, color: C.error, bg: C.errorLight }
              ].map((item) => (
                <div key={item.label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: item.bg,
                  borderRadius: '10px'
                }}>
                  <span style={{ fontWeight: '600', color: item.color, fontSize: '13px' }}>{item.label}</span>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
            {drafts.length > 0 && (
              <div style={{ marginTop: '12px', padding: '10px', backgroundColor: C.gray50, borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: C.gray500, fontWeight: '600' }}>{drafts.length} draft(s) saved</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Charts & Activity Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
          {/* Weekly Revenue Trend */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: C.dark }}>Weekly Revenue Trend</h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: C.gray400 }}>Last 7 days in {branch.city}</p>
              </div>
              <Activity size={18} color={C.primary} />
            </div>
            <div style={{ padding: '1rem 0' }}>
              <MiniBarChart
                data={[
                  { label: 'Mon', value: metrics.weekly_revenue?.mon?.total || 0, showLabel: true },
                  { label: 'Tue', value: metrics.weekly_revenue?.tue?.total || 0, showLabel: true },
                  { label: 'Wed', value: metrics.weekly_revenue?.wed?.total || 0, showLabel: true },
                  { label: 'Thu', value: metrics.weekly_revenue?.thu?.total || 0, showLabel: true },
                  { label: 'Fri', value: metrics.weekly_revenue?.fri?.total || 0, showLabel: true },
                  { label: 'Sat', value: metrics.weekly_revenue?.sat?.total || 0, showLabel: true },
                  { label: 'Sun', value: metrics.weekly_revenue?.sun?.total || 0, highlight: true, showLabel: true }
                ]}
                color={C.primary}
                height={120}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: '#FEF3C7', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#92400E' }}>{fmtCurrency(metrics.solar_week_revenue || 0)}</div>
                <div style={{ fontSize: '10px', color: '#B45309', fontWeight: '600' }}>Solar</div>
              </div>
              <div style={{ padding: '8px', backgroundColor: '#DBEAFE', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#1E40AF' }}>{fmtCurrency(metrics.marketplace_week_revenue || 0)}</div>
                <div style={{ fontSize: '10px', color: '#2563EB', fontWeight: '600' }}>Marketplace</div>
              </div>
              <div style={{ padding: '8px', backgroundColor: '#EDE9FE', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#5B21B6' }}>{fmtCurrency(metrics.bnpl_week_revenue || 0)}</div>
                <div style={{ fontSize: '10px', color: '#7C3AED', fontWeight: '600' }}>BNPL</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: C.gray50, borderRadius: '10px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: C.dark }}>{fmtCurrency(metrics.this_week_revenue)}</div>
                <div style={{ fontSize: '11px', color: C.gray400, fontWeight: '600' }}>This Week</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: metrics.revenue_trend >= 0 ? C.primary : C.error }}>
                  {metrics.revenue_trend >= 0 ? '+' : ''}{metrics.revenue_trend || 0}%
                </div>
                <div style={{ fontSize: '11px', color: C.gray400, fontWeight: '600' }}>vs Last Week</div>
              </div>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: C.dark }}>Recent Activity</h3>
              <Zap size={18} color={C.accent} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
              {metrics.recent_activity?.slice(0, 6).map((activity, idx) => (
                <ActivityFeedItem
                  key={idx}
                  type={activity.type}
                  message={activity.message}
                  time={activity.time}
                  amount={activity.amount}
                />
              )) || (
                <div style={{ padding: '20px', textAlign: 'center', color: C.gray400, fontSize: '13px' }}>
                  No recent activity
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.25rem', fontSize: '1rem', fontWeight: '700', color: C.dark }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => navigate('/branch-manager/eligibility-survey')}
                style={{
                  padding: '14px 16px',
                  backgroundColor: C.primaryLight,
                  color: C.primaryDark,
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = C.primary; e.currentTarget.style.color = C.white; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = C.primaryLight; e.currentTarget.style.color = C.primaryDark; }}
              >
                <Users size={16} />
                New Walk-in Customer
              </button>
              <button
                onClick={() => navigate('/branch-manager/bnpl')}
                style={{
                  padding: '14px 16px',
                  backgroundColor: '#F0F7FF',
                  color: '#007AFF',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#007AFF'; e.currentTarget.style.color = C.white; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F0F7FF'; e.currentTarget.style.color = '#007AFF'; }}
              >
                <CreditCard size={16} />
                View BNPL Applications
                {metrics.pending_bnpl > 0 && (
                  <span style={{ marginLeft: 'auto', background: C.error, color: C.white, padding: '2px 8px', borderRadius: '20px', fontSize: '11px' }}>
                    {metrics.pending_bnpl}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate('/branch-manager/orders')}
                style={{
                  padding: '14px 16px',
                  backgroundColor: C.warningLight,
                  color: '#B45309',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = C.warning; e.currentTarget.style.color = C.white; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = C.warningLight; e.currentTarget.style.color = '#B45309'; }}
              >
                <ShoppingCart size={16} />
                View Orders
                {metrics.today_orders > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#007AFF', color: C.white, padding: '2px 8px', borderRadius: '20px', fontSize: '11px' }}>
                    {metrics.today_orders} today
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Today's Summary */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.25rem', fontSize: '1rem', fontWeight: '700', color: C.dark }}>Today's Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '14px', backgroundColor: C.primaryLight, borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: C.primary }}>{metrics.today_orders || 0}</div>
                <div style={{ fontSize: '11px', color: C.primaryDark, fontWeight: '600' }}>New Orders</div>
              </div>
              <div style={{ padding: '14px', backgroundColor: '#ECFDF5', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#10B981' }}>{fmtCurrency(metrics.today_revenue)}</div>
                <div style={{ fontSize: '11px', color: '#065F46', fontWeight: '600' }}>Total Revenue</div>
              </div>
              <div style={{ padding: '14px', backgroundColor: '#FEF3C7', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#92400E' }}>{fmtCurrency(metrics.solar_today_revenue || 0)}</div>
                <div style={{ fontSize: '11px', color: '#B45309', fontWeight: '600' }}>Solar Today</div>
              </div>
              <div style={{ padding: '14px', backgroundColor: '#DBEAFE', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#1E40AF' }}>{fmtCurrency(metrics.marketplace_today_revenue || 0)}</div>
                <div style={{ fontSize: '11px', color: '#2563EB', fontWeight: '600' }}>Market Today</div>
              </div>
              <div style={{ padding: '14px', backgroundColor: C.warningLight, borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: C.warning }}>{metrics.today_bnpl || 0}</div>
                <div style={{ fontSize: '11px', color: '#B45309', fontWeight: '600' }}>BNPL Applied</div>
              </div>
              <div style={{ padding: '14px', backgroundColor: '#EEF2FF', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#6366F1' }}>{metrics.completed_orders || 0}</div>
                <div style={{ fontSize: '11px', color: '#3730A3', fontWeight: '600' }}>Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab Navigation ── */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: `1px solid ${C.gray200}`
        }}>
          {['overview', 'orders', 'bnpl'].map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              style={{
                padding: '1rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontWeight: selectedTab === tab ? '600' : '500',
                color: selectedTab === tab ? C.primary : C.gray500,
                borderBottom: selectedTab === tab ? `2px solid ${C.primary}` : 'none',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'overview' ? 'Overview' : tab === 'orders' ? `Orders (${orders.length})` : `BNPL (${bnplApplications.length})`}
            </button>
          ))}
        </div>

        {/* ── Orders Tab ── */}
        {selectedTab === 'orders' && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.03)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${C.border}` }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: C.dark }}>All Orders in {branch.city}</h3>
            </div>
            {orders.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: C.gray400 }}>
                <ShoppingCart size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ fontSize: '14px', fontWeight: '600' }}>No orders yet in your branch area</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: C.gray50, borderBottom: `1px solid ${C.border}` }}>
                      {['Order ID', 'Customer', 'Amount', 'Payment', 'Status', 'Date'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: C.gray500, textTransform: 'uppercase', letterSpacing: '0.7px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 10).map((order, idx) => (
                      <tr key={order.id} style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: idx % 2 === 0 ? C.white : '#FAFBFC' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: '800', color: C.primary, background: C.primaryLight, padding: '3px 8px', borderRadius: '6px' }}>
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: '600', color: C.dark }}>{order.user?.name || '—'}</td>
                        <td style={{ padding: '12px 16px', fontWeight: '700', color: C.dark }}>{fmtCurrency(order.total_amount)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '700',
                            backgroundColor: order.payment_status === 'paid' ? C.primaryLight : C.warningLight,
                            color: order.payment_status === 'paid' ? C.primary : C.warning
                          }}>{order.payment_status}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '700',
                            backgroundColor: order.order_status === 'completed' ? C.primaryLight : '#EEF2FF',
                            color: order.order_status === 'completed' ? C.primary : '#6366F1'
                          }}>{order.order_status}</span>
                        </td>
                        <td style={{ padding: '12px 16px', color: C.gray500, fontSize: '12px' }}>{fmtTimeAgo(order.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── BNPL Tab ── */}
        {selectedTab === 'bnpl' && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.03)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${C.border}` }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: C.dark }}>BNPL Applications in {branch.city}</h3>
            </div>
            {bnplApplications.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: C.gray400 }}>
                <CreditCard size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ fontSize: '14px', fontWeight: '600' }}>No BNPL applications yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {bnplApplications.map(app => (
                  <div key={app.id} style={{
                    padding: '1rem 1.5rem',
                    borderBottom: `1px solid ${C.border}`,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
                    gap: '1rem',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '10px', color: C.gray400, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Application</div>
                      <div style={{ fontWeight: '700', color: C.dark, fontFamily: 'monospace', fontSize: '12px' }}>#{app.id.slice(0, 8).toUpperCase()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: C.gray400, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Customer</div>
                      <div style={{ fontWeight: '600', color: C.dark, fontSize: '13px' }}>{app.user?.name || app.survey_data?.customer_name || 'Walk-in'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: C.gray400, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Plan</div>
                      <div style={{ fontWeight: '600', color: C.dark, fontSize: '13px' }}>
                        {app.plan_type === 'bnpl_50' ? '50% Deposit' : app.plan_type === 'bnpl_30_bank' ? '30% Bank Loan' : app.plan_type || '—'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: C.gray400, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Amount</div>
                      <div style={{ fontWeight: '700', color: C.dark, fontSize: '13px' }}>{fmtCurrency(app.deposit_amount)}</div>
                    </div>
                    <span style={{
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '700',
                      backgroundColor: app.status === 'approved' ? C.primaryLight : app.status === 'rejected' ? C.errorLight : C.warningLight,
                      color: app.status === 'approved' ? C.primary : app.status === 'rejected' ? C.error : C.warning,
                      textTransform: 'capitalize'
                    }}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {drafts.length > 0 && (
              <div style={{ padding: '1.25rem 1.5rem', borderTop: `2px solid ${C.warningLight}` }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: '700', color: C.dark }}>Draft Applications ({drafts.length})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {drafts.map(app => (
                    <div key={app.id} style={{
                      padding: '12px 16px',
                      backgroundColor: '#FFFCF5',
                      borderRadius: '10px',
                      border: `1px solid ${C.warningLight}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: '600', color: C.dark, fontSize: '13px' }}>Draft Application</div>
                        <div style={{ fontSize: '11px', color: C.gray400, marginTop: '2px' }}>Started {fmtTimeAgo(app.created_at)}</div>
                      </div>
                      <button
                        onClick={() => navigate('/branch-manager/eligibility-survey', { state: { draftData: app } })}
                        style={{
                          padding: '6px 14px',
                          backgroundColor: C.white,
                          border: `1px solid ${C.primary}`,
                          color: C.primary,
                          borderRadius: '8px',
                          fontWeight: '700',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Resume
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BranchManagerDashboard;
