import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '../layout/DashboardLayout';
import client from '../api/client';
import { 
  TrendingUp, 
  Clock, 
  ShoppingBag, 
  Users, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Loader2,
  BarChart3,
  Activity,
  Target,
  Zap,
  DollarSign,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Timer,
  Calendar,
  TrendingDown,
  Eye,
  CreditCard,
  Package,
  Banknote,
  Wallet
} from 'lucide-react';

/* ─── Design Tokens ─────────────────────────────────────────── */
const C = {
  primary: '#00A859',
  primaryDark: '#007A3F',
  primaryLight: '#E8F8EE',
  accent: '#FFB800',
  error: '#FF3B30',
  errorLight: '#FFF0EF',
  warning: '#FF9500',
  warningLight: '#FFF4E5',
  dark: '#0D1117',
  dark2: '#161B22',
  gray800: '#1F2937',
  gray700: '#374151',
  gray500: '#6B7280',
  gray400: '#9CA3AF',
  gray300: '#D1D5DB',
  gray200: '#E5E7EB',
  gray100: '#F3F4F6',
  gray50: '#F9FAFB',
  white: '#FFFFFF',
  bg: '#F0F4F8',
  surface: '#FFFFFF',
  border: '#E8ECF0',
};

/* ─── Formatters ─────────────────────────────────────────────── */
const fmtCurrency = (v) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(v ?? 0);

const fmtNumber = (v) =>
  new Intl.NumberFormat('en-NG').format(v ?? 0);

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

/* ─── Enhanced Stat Card Component ──────────────────────────── */
const StatCard = ({ title, value, icon: Icon, color, subtitle, trend, trendValue, loading }) => (
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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
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
          {Math.abs(trendValue || trend)}%
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

/* ─── Mini Bar Chart Component ──────────────────────────────── */
const MiniBarChart = ({ data, color = C.primary, height = 60 }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
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

/* ─── Circular Progress Component ───────────────────────────── */
const CircularProgress = ({ value, max, color = C.primary, size = 60, strokeWidth = 6, label }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (value / max) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`${color}20`}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <span style={{ fontSize: '10px', fontWeight: '700', color: '#666' }}>{label}</span>
    </div>
  );
};

/* ─── Activity Feed Item Component ──────────────────────────── */
const ActivityFeedItem = ({ type, message, time, amount }) => {
  const config = {
    order: { icon: ShoppingCart, color: C.primary, bg: C.primaryLight },
    payment: { icon: DollarSign, color: '#10B981', bg: '#ECFDF5' },
    bnpl: { icon: Clock, color: C.warning, bg: C.warningLight },
    alert: { icon: AlertTriangle, color: C.error, bg: C.errorLight }
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
        <div style={{ fontSize: '13px', color: C.dark, fontWeight: '600', marginBottom: '2px' }}>
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

const OverviewPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();

  const fetchStats = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await client('/admin/stats');

      setStats(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      toast.error('Failed to load dashboard data');
      setError('Failed to load dashboard statistics');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Real-time polling every 30 seconds
    const interval = setInterval(() => fetchStats(true), 30000);

    return () => clearInterval(interval);
  }, [fetchStats]);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: '0 0 40px', maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ margin: 0 }}>Dashboard Overview</h2>
            <p style={{ color: '#666', marginTop: '0.5rem' }}>Loading business analytics...</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
            <Loader2 size={32} color={C.primary} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      <div style={{ padding: '0 0 40px', maxWidth: 1400, margin: '0 auto' }}>
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
              LNE Solar Admin
            </div>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: C.dark, letterSpacing: '-0.5px' }}>
              Dashboard Overview
            </h2>
            <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '13.5px' }}>
              Real-time summary of LNE business activities
            </p>
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
              onClick={() => fetchStats(true)}
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

        {error && (
          <div style={{
            padding: '1rem',
            backgroundColor: C.errorLight,
            color: C.error,
            borderRadius: '12px',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: `1px solid ${C.error}30`
          }}>
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        {/* ── Primary Stats Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <StatCard
            title="Total Revenue"
            value={fmtCurrency(stats?.total_revenue || 0)}
            icon={DollarSign}
            color={C.primary}
            subtitle="All sources (Solar + Marketplace + BNPL)"
            trend={stats?.revenue_trend}
            trendValue={stats?.revenue_trend_percent}
            loading={refreshing}
          />
          <StatCard
            title="Solar Package Revenue"
            value={fmtCurrency(stats?.solar_package_revenue || 0)}
            icon={Package}
            color="#F59E0B"
            subtitle={`${stats?.solar_package_order_count || 0} solar orders`}
            loading={refreshing}
          />
          <StatCard
            title="Marketplace Revenue"
            value={fmtCurrency(stats?.marketplace_revenue || 0)}
            icon={ShoppingBag}
            color="#007AFF"
            subtitle={`${stats?.marketplace_order_count || 0} marketplace orders`}
            loading={refreshing}
          />
          <StatCard
            title="BNPL Deposits"
            value={fmtCurrency(stats?.bnpl_deposit_total || 0)}
            icon={CreditCard}
            color="#5856D6"
            subtitle={`${stats?.bnpl_approved_count || 0} approved plans`}
            loading={refreshing}
          />
          <StatCard
            title="Today's Revenue"
            value={fmtCurrency(stats?.today_revenue || 0)}
            icon={TrendingUp}
            color="#10B981"
            subtitle={`Solar: ${fmtCurrency(stats?.solar_package_today_revenue || 0)} | Market: ${fmtCurrency(stats?.marketplace_today_revenue || 0)} | BNPL: ${fmtCurrency(stats?.bnpl_deposit_today || 0)}`}
            loading={refreshing}
          />
          <StatCard
            title="Total Customers"
            value={stats?.total_customers || 0}
            icon={Users}
            color="#5856D6"
            subtitle="Registered users"
            trend={stats?.customers_trend}
            trendValue={stats?.customers_trend_percent}
            loading={refreshing}
          />
        </div>

        {/* ── Revenue Breakdown Section ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {/* Solar Package Revenue Breakdown */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: C.dark }}>
                  Solar Package Revenue
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: C.gray400 }}>Outright solar package purchases</p>
              </div>
              <div style={{ padding: '0.5rem', borderRadius: '10px', backgroundColor: '#FEF3C7', color: '#F59E0B' }}>
                <Package size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: C.dark, marginBottom: '1rem', letterSpacing: '-0.5px' }}>
              {fmtCurrency(stats?.solar_package_revenue || 0)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#FEF9E7', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={14} color="#F59E0B" />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: C.gray700 }}>Solar Orders</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#D97706' }}>{stats?.solar_package_order_count || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#FEF9E7', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={14} color="#F59E0B" />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: C.gray700 }}>Avg. per Order</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#D97706' }}>
                  {stats?.solar_package_order_count > 0 ? fmtCurrency(stats?.solar_package_revenue / stats?.solar_package_order_count) : fmtCurrency(0)}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: C.gray50, borderRadius: '10px', marginTop: '12px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: C.dark }}>{fmtCurrency(stats?.solar_package_today_revenue || 0)}</div>
                <div style={{ fontSize: '10px', color: C.gray400, fontWeight: '600' }}>Today</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: C.dark }}>{fmtCurrency(stats?.solar_package_week_revenue || 0)}</div>
                <div style={{ fontSize: '10px', color: C.gray400, fontWeight: '600' }}>This Week</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: C.dark }}>{stats?.solar_package_order_count || 0}</div>
                <div style={{ fontSize: '10px', color: C.gray400, fontWeight: '600' }}>Total Orders</div>
              </div>
            </div>
          </div>

          {/* Marketplace Revenue Breakdown */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: C.dark }}>
                  Marketplace Revenue
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: C.gray400 }}>Non-solar marketplace items</p>
              </div>
              <div style={{ padding: '0.5rem', borderRadius: '10px', backgroundColor: '#007AFF15', color: '#007AFF' }}>
                <ShoppingBag size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: C.dark, marginBottom: '1rem', letterSpacing: '-0.5px' }}>
              {fmtCurrency(stats?.marketplace_revenue || 0)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#EBF5FF', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={14} color="#007AFF" />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: C.gray700 }}>Card Payments</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#007AFF' }}>{fmtCurrency(stats?.card_revenue || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#F0F7FF', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Banknote size={14} color="#007AFF" />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: C.gray700 }}>Bank Transfer</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#007AFF' }}>{fmtCurrency(stats?.bank_transfer_revenue || 0)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: C.gray50, borderRadius: '10px', marginTop: '12px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: C.dark }}>{fmtCurrency(stats?.marketplace_today_revenue || 0)}</div>
                <div style={{ fontSize: '10px', color: C.gray400, fontWeight: '600' }}>Today</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: C.dark }}>{fmtCurrency(stats?.marketplace_week_revenue || 0)}</div>
                <div style={{ fontSize: '10px', color: C.gray400, fontWeight: '600' }}>This Week</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: C.dark }}>{stats?.marketplace_order_count || 0}</div>
                <div style={{ fontSize: '10px', color: C.gray400, fontWeight: '600' }}>Orders</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Performance Metrics Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {/* Revenue Distribution */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: C.dark }}>
                Revenue Distribution
              </h3>
              <Target size={18} color={C.primary} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '1rem 0' }}>
              <CircularProgress
                value={stats?.solar_package_revenue || 0}
                max={stats?.total_revenue || 1}
                color="#F59E0B"
                size={70}
                strokeWidth={7}
                label={stats?.total_revenue > 0 ? `${Math.round(((stats?.solar_package_revenue || 0) / (stats?.total_revenue || 1)) * 100)}%` : '0%'}
              />
              <CircularProgress
                value={stats?.marketplace_revenue || 0}
                max={stats?.total_revenue || 1}
                color="#007AFF"
                size={70}
                strokeWidth={7}
                label={stats?.total_revenue > 0 ? `${Math.round(((stats?.marketplace_revenue || 0) / (stats?.total_revenue || 1)) * 100)}%` : '0%'}
              />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: C.gray400, fontWeight: '600', marginBottom: '4px' }}>Revenue Split</div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: C.dark }}>Solar / Market / BNPL</div>
                <div style={{ fontSize: '11px', color: C.gray400, marginTop: '2px' }}>of total revenue</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#FEF9E7', borderRadius: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                <span style={{ fontSize: '12px', fontWeight: '600', color: C.gray700, flex: 1 }}>Solar Packages</span>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#D97706' }}>{fmtCurrency(stats?.solar_package_revenue || 0)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#EBF5FF', borderRadius: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#007AFF' }} />
                <span style={{ fontSize: '12px', fontWeight: '600', color: C.gray700, flex: 1 }}>Marketplace</span>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#007AFF' }}>{fmtCurrency(stats?.marketplace_revenue || 0)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#F3E8FF', borderRadius: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#7C3AED' }} />
                <span style={{ fontSize: '12px', fontWeight: '600', color: C.gray700, flex: 1 }}>BNPL Deposits</span>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#7C3AED' }}>{fmtCurrency(stats?.bnpl_deposit_total || 0)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: C.gray50, borderRadius: '10px', marginTop: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: C.dark }}>{fmtCurrency(stats?.avg_order_value || 0)}</div>
                <div style={{ fontSize: '10px', color: C.gray400, fontWeight: '600' }}>Avg. Order</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: C.dark }}>{fmtCurrency(stats?.avg_bnpl_value || 0)}</div>
                <div style={{ fontSize: '10px', color: C.gray400, fontWeight: '600' }}>Avg. BNPL</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: C.dark }}>{stats?.conversion_rate || 0}%</div>
                <div style={{ fontSize: '10px', color: C.gray400, fontWeight: '600' }}>Conversion</div>
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
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: C.dark }}>
                Order Distribution
              </h3>
              <BarChart3 size={18} color={C.primary} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Processing', value: stats?.processing_orders || 0, color: '#6366F1', max: stats?.total_orders || 1 },
                { label: 'Shipped', value: stats?.shipped_orders || 0, color: '#F97316', max: stats?.total_orders || 1 },
                { label: 'Installed', value: stats?.installed_orders || 0, color: '#10B981', max: stats?.total_orders || 1 },
                { label: 'Completed', value: stats?.completed_orders || 0, color: '#22C55E', max: stats?.total_orders || 1 }
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '80px', fontSize: '12px', color: C.gray500, fontWeight: '600' }}>
                    {item.label}
                  </div>
                  <div style={{ flex: 1, height: '8px', backgroundColor: `${item.color}20`, borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${(item.value / item.max) * 100}%`,
                      height: '100%',
                      backgroundColor: item.color,
                      borderRadius: '4px',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                  <div style={{ width: '40px', textAlign: 'right', fontSize: '13px', fontWeight: '700', color: C.dark }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Charts & Activity Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
          {/* Revenue Trend Chart */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: C.dark }}>
                  Weekly Revenue Trend
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: C.gray400 }}>
                  Last 7 days performance
                </p>
              </div>
              <Activity size={18} color={C.primary} />
            </div>
            <div style={{ padding: '1rem 0' }}>
              <MiniBarChart
                data={[
                  { label: 'Mon', value: stats?.weekly_revenue?.mon || 0, showLabel: true },
                  { label: 'Tue', value: stats?.weekly_revenue?.tue || 0, showLabel: true },
                  { label: 'Wed', value: stats?.weekly_revenue?.wed || 0, showLabel: true },
                  { label: 'Thu', value: stats?.weekly_revenue?.thu || 0, showLabel: true },
                  { label: 'Fri', value: stats?.weekly_revenue?.fri || 0, showLabel: true },
                  { label: 'Sat', value: stats?.weekly_revenue?.sat || 0, showLabel: true },
                  { label: 'Sun', value: stats?.weekly_revenue?.sun || 0, highlight: true, showLabel: true }
                ]}
                color={C.primary}
                height={120}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: C.gray50, borderRadius: '10px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: C.dark }}>
                  {fmtCurrency(stats?.weekly_total || 0)}
                </div>
                <div style={{ fontSize: '11px', color: C.gray400, fontWeight: '600' }}>This Week</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: stats?.week_over_week_change >= 0 ? C.primary : C.error }}>
                  {stats?.week_over_week_change >= 0 ? '+' : ''}{stats?.week_over_week_change || 0}%
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
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: C.dark }}>
                Recent Activity
              </h3>
              <Zap size={18} color={C.accent} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
              {stats?.recent_activity?.slice(0, 6).map((activity, idx) => (
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

        {/* ── Quick Actions & Alerts Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {/* Quick Actions */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.25rem', fontSize: '1rem', fontWeight: '700', color: C.dark }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => navigate('/bnpl')}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = C.primary;
                  e.currentTarget.style.color = C.white;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = C.primaryLight;
                  e.currentTarget.style.color = C.primaryDark;
                }}
              >
                <Clock size={16} />
                Review BNPL Applications
                {stats?.pending_bnpl > 0 && (
                  <span style={{ marginLeft: 'auto', background: C.error, color: C.white, padding: '2px 8px', borderRadius: '20px', fontSize: '11px' }}>
                    {stats.pending_bnpl}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate('/marketplace')}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#007AFF';
                  e.currentTarget.style.color = C.white;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#F0F7FF';
                  e.currentTarget.style.color = '#007AFF';
                }}
              >
                <ShoppingBag size={16} />
                Manage Marketplace
              </button>
              <button
                onClick={() => navigate('/orders')}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = C.warning;
                  e.currentTarget.style.color = C.white;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = C.warningLight;
                  e.currentTarget.style.color = '#B45309';
                }}
              >
                <Eye size={16} />
                Process Orders
                {stats?.active_orders > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#007AFF', color: C.white, padding: '2px 8px', borderRadius: '20px', fontSize: '11px' }}>
                    {stats.active_orders}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Today's Performance */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.25rem', fontSize: '1rem', fontWeight: '700', color: C.dark }}>
              Today's Performance
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '14px', backgroundColor: C.primaryLight, borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: C.primary }}>{fmtCurrency(stats?.today_revenue || 0)}</div>
                <div style={{ fontSize: '11px', color: C.primaryDark, fontWeight: '600' }}>Total Revenue</div>
              </div>
              <div style={{ padding: '14px', backgroundColor: '#EBF5FF', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#007AFF' }}>{fmtNumber(stats?.today_orders || 0)}</div>
                <div style={{ fontSize: '11px', color: '#0056B3', fontWeight: '600' }}>Orders</div>
              </div>
              <div style={{ padding: '14px', backgroundColor: '#F3E8FF', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#7C3AED' }}>{fmtNumber(stats?.today_customers || 0)}</div>
                <div style={{ fontSize: '11px', color: '#5B21B6', fontWeight: '600' }}>Customers</div>
              </div>
              <div style={{ padding: '14px', backgroundColor: '#FEF9E7', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#D97706' }}>{fmtCurrency(stats?.solar_package_today_revenue || 0)}</div>
                <div style={{ fontSize: '11px', color: '#92400E', fontWeight: '600' }}>Solar Packages</div>
              </div>
              <div style={{ padding: '14px', backgroundColor: '#E8F8EE', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#059669' }}>{fmtCurrency(stats?.marketplace_today_revenue || 0)}</div>
                <div style={{ fontSize: '11px', color: '#047857', fontWeight: '600' }}>Marketplace</div>
              </div>
              <div style={{ padding: '14px', backgroundColor: '#FFF0EF', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#DC2626' }}>{fmtCurrency(stats?.bnpl_deposit_today || 0)}</div>
                <div style={{ fontSize: '11px', color: '#991B1B', fontWeight: '600' }}>BNPL Deposits</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OverviewPage;
