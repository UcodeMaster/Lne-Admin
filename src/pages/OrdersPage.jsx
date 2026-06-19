import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../layout/DashboardLayout';
import client from '../api/client';
import {
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  ShoppingCart,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
  User,
  CreditCard,
  Calendar,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  CheckSquare,
  Mail,
  Phone,
  Hash,
  TrendingUp,
  Filter,
  ArrowUpRight,
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

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

/* ─── Status Configs ─────────────────────────────────────────── */
const paymentStatusCfg = {
  pending: {
    bg: '#FFFBEB',
    color: '#B45309',
    border: '#FDE68A',
    dot: '#F59E0B',
    Icon: Clock,
    label: 'Pending',
  },
  paid: {
    bg: '#ECFDF5',
    color: '#065F46',
    border: '#A7F3D0',
    dot: '#10B981',
    Icon: CheckCircle,
    label: 'Paid',
  },
  failed: {
    bg: '#FEF2F2',
    color: '#991B1B',
    border: '#FECACA',
    dot: '#EF4444',
    Icon: XCircle,
    label: 'Failed',
  },
};

const orderStatusCfg = {
  processing: {
    bg: '#EEF2FF',
    color: '#3730A3',
    border: '#C7D2FE',
    dot: '#6366F1',
    Icon: Clock,
    label: 'Processing',
  },
  shipped: {
    bg: '#FFF7ED',
    color: '#9A3412',
    border: '#FED7AA',
    dot: '#F97316',
    Icon: Truck,
    label: 'Shipped',
  },
  installed: {
    bg: '#ECFDF5',
    color: '#065F46',
    border: '#A7F3D0',
    dot: '#10B981',
    Icon: CheckSquare,
    label: 'Installed',
  },
  completed: {
    bg: '#F0FDF4',
    color: '#14532D',
    border: '#86EFAC',
    dot: '#22C55E',
    Icon: CheckCircle,
    label: 'Completed',
  },
};

/* ─── Shared Components ──────────────────────────────────────── */
const StatusBadge = ({ status, cfg }) => {
  const c = cfg[status] ?? cfg[Object.keys(cfg)[0]];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 20,
        fontSize: 11.5,
        fontWeight: 700,
        letterSpacing: 0.2,
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: c.dot,
          flexShrink: 0,
        }}
      />
      {c.label}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, color = C.primary, trend }) => (
  <div
    style={{
      background: C.white,
      borderRadius: 16,
      padding: '22px 24px',
      flex: 1,
      minWidth: 180,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      border: `1px solid ${C.border}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* subtle top accent line */}
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: color,
        borderRadius: '16px 16px 0 0',
      }}
    />
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: color + '15',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={20} color={color} />
      </div>
      {trend !== undefined && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            fontSize: 11,
            fontWeight: 700,
            color: trend >= 0 ? C.primary : C.error,
            background: trend >= 0 ? C.primaryLight : C.errorLight,
            padding: '3px 8px',
            borderRadius: 20,
          }}
        >
          <ArrowUpRight size={11} />
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div>
      <div style={{ fontSize: 26, fontWeight: 800, color: C.dark, lineHeight: 1, letterSpacing: -0.5 }}>
        {value}
      </div>
      <div style={{ fontSize: 12.5, color: C.gray500, marginTop: 4, fontWeight: 600 }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: 11.5, color: C.gray400, marginTop: 3, fontWeight: 500 }}>
          {sub}
        </div>
      )}
    </div>
  </div>
);

const SectionTitle = ({ children }) => (
  <div
    style={{
      fontSize: 10.5,
      fontWeight: 800,
      color: C.gray400,
      textTransform: 'uppercase',
      letterSpacing: 1,
      paddingBottom: 10,
      borderBottom: `1px solid ${C.gray200}`,
      marginBottom: 14,
    }}
  >
    {children}
  </div>
);

const InfoRow = ({ icon: Icon, label, value }) =>
  value ? (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '10px 0',
        borderBottom: `1px solid ${C.gray100}`,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: C.gray50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: `1px solid ${C.gray200}`,
        }}
      >
        <Icon size={14} color={C.gray500} />
      </div>
      <div>
        <div style={{ fontSize: 11, color: C.gray400, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </div>
        <div style={{ fontSize: 13.5, color: C.dark, fontWeight: 600, marginTop: 1 }}>
          {value}
        </div>
      </div>
    </div>
  ) : null;

/* ─── Order Detail Panel ─────────────────────────────────────── */
const OrderDetailPanel = ({ order, onClose, onUpdateStatus, processingId }) => {
  const [orderStatus, setOrderStatus] = useState(order.order_status);
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status);

  const handleOrderStatusChange = async (newStatus) => {
    try {
      setOrderStatus(newStatus);
      await onUpdateStatus(order.id, { order_status: newStatus, payment_status: paymentStatus });
    } catch {
      setOrderStatus(order.order_status);
    }
  };

  const handlePaymentStatusChange = async (newStatus) => {
    try {
      setPaymentStatus(newStatus);
      await onUpdateStatus(order.id, { order_status: orderStatus, payment_status: newStatus });
    } catch {
      setPaymentStatus(order.payment_status);
    }
  };

  const totalFromItems =
    order.items?.reduce((s, i) => s + parseFloat(i.price ?? 0) * parseInt(i.quantity ?? 0), 0) ?? 0;

  const isProcessing = processingId === order.id;

  return (
    <>
      {/* Panel Header */}
      <div
        style={{
          padding: '20px 28px',
          borderBottom: `1px solid ${C.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: C.white,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.primary,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Hash size={11} />
            {order.id.substring(0, 8).toUpperCase()}
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: C.dark, margin: '3px 0 0', letterSpacing: -0.3 }}>
            Order Details
          </h3>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: `1px solid ${C.gray200}`,
            background: C.gray50,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: C.gray500,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = C.gray100;
            e.currentTarget.style.borderColor = C.gray300;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = C.gray50;
            e.currentTarget.style.borderColor = C.gray200;
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Panel Body */}
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Status + Controls */}
        <div
          style={{
            background: C.gray50,
            borderRadius: 14,
            border: `1px solid ${C.border}`,
            padding: 18,
          }}
        >
          <SectionTitle>Status Management</SectionTitle>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
            <StatusBadge status={orderStatus} cfg={orderStatusCfg} />
            <StatusBadge status={paymentStatus} cfg={paymentStatusCfg} />
            {isProcessing && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.gray500 }}>
                <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Saving…
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.gray500, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Order Status
              </label>
              <select
                value={orderStatus}
                onChange={(e) => handleOrderStatusChange(e.target.value)}
                disabled={isProcessing}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: `1px solid ${C.gray200}`,
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.dark,
                  background: C.white,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  outline: 'none',
                }}
              >
                {Object.entries(orderStatusCfg).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.gray500, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => handlePaymentStatusChange(e.target.value)}
                disabled={isProcessing}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: `1px solid ${C.gray200}`,
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.dark,
                  background: C.white,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  outline: 'none',
                }}
              >
                {Object.entries(paymentStatusCfg).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        {order.user && (
          <div>
            <SectionTitle>Customer Information</SectionTitle>
            <InfoRow icon={User} label="Full Name" value={order.user.name} />
            <InfoRow icon={Mail} label="Email" value={order.user.email} />
            <InfoRow icon={Phone} label="Phone" value={order.user.phone} />
          </div>
        )}

        {/* Order Items */}
        {order.items?.length > 0 && (
          <div>
            <SectionTitle>Items Ordered</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: C.gray50,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: C.primaryLight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Package size={15} color={C.primary} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>
                        {item.itemable?.name ?? item.product_name ?? item.name ?? `Item ${idx + 1}`}
                      </div>
                      <div style={{ fontSize: 11.5, color: C.gray500 }}>
                        Qty: {item.quantity} × {fmtCurrency(item.price)}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: C.dark }}>
                    {fmtCurrency(parseFloat(item.price ?? 0) * parseInt(item.quantity ?? 0))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div>
          <SectionTitle>Order Summary</SectionTitle>
          <div
            style={{
              borderRadius: 12,
              border: `1px solid ${C.border}`,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '13px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13,
                color: C.gray700,
                background: C.white,
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <span>Subtotal</span>
              <span style={{ fontWeight: 600 }}>{fmtCurrency(totalFromItems)}</span>
            </div>
            <div
              style={{
                padding: '14px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                background: C.primaryLight,
              }}
            >
              <span style={{ fontWeight: 800, fontSize: 14, color: C.primaryDark }}>Total Amount</span>
              <span style={{ fontWeight: 800, fontSize: 16, color: C.primary }}>{fmtCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Dates */}
        {(order.created_at || order.updated_at) && (
          <div>
            <SectionTitle>Timestamps</SectionTitle>
            <InfoRow icon={Calendar} label="Order Placed" value={fmtDateTime(order.created_at)} />
            <InfoRow icon={Calendar} label="Last Updated" value={fmtDateTime(order.updated_at)} />
          </div>
        )}
      </div>
    </>
  );
};

/* ─── Expanded Row Content ───────────────────────────────────── */
const ExpandedRow = ({ order }) => (
  <tr>
    <td
      colSpan={7}
      style={{ padding: 0, background: 'transparent', border: 'none' }}
    >
      <div
        style={{
          margin: '0 0 4px 0',
          background: '#FAFBFC',
          borderLeft: `3px solid ${C.primary}`,
          padding: '14px 20px',
          display: 'flex',
          gap: 32,
          flexWrap: 'wrap',
        }}
      >
        {/* Customer mini-info */}
        {order.user && (
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: C.gray400, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
              Customer
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{order.user.name}</div>
            {order.user.email && (
              <div style={{ fontSize: 12, color: C.gray500, marginTop: 2 }}>{order.user.email}</div>
            )}
            {order.user.phone && (
              <div style={{ fontSize: 12, color: C.gray500 }}>{order.user.phone}</div>
            )}
          </div>
        )}

        {/* Items mini list */}
        {order.items?.length > 0 && (
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: C.gray400, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
              Items ({order.items.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {order.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: C.gray700 }}>
                  <span>{item.itemable?.name ?? item.product_name ?? item.name ?? `Item ${i + 1}`} × {item.quantity}</span>
                  <span style={{ fontWeight: 700, color: C.dark }}>
                    {fmtCurrency(parseFloat(item.price ?? 0) * parseInt(item.quantity ?? 0))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dates */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: C.gray400, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
            Timeline
          </div>
          {order.created_at && (
            <div style={{ fontSize: 12, color: C.gray700 }}>
              <span style={{ fontWeight: 600 }}>Placed: </span>{fmtDateTime(order.created_at)}
            </div>
          )}
          {order.updated_at && (
            <div style={{ fontSize: 12, color: C.gray700, marginTop: 2 }}>
              <span style={{ fontWeight: 600 }}>Updated: </span>{fmtDateTime(order.updated_at)}
            </div>
          )}
        </div>
      </div>
    </td>
  </tr>
);

/* ─── Main Page ──────────────────────────────────────────────── */
function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await client('/admin/orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load orders. Please retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleUpdateStatus = async (id, { order_status, payment_status }) => {
    try {
      setProcessingId(id);
      const updatedOrder = await client(`/admin/orders/${id}/status`, {
        method: 'PATCH',
        body: { order_status, payment_status },
      });
      toast.success('Order status updated');
      setOrders((prev) => prev.map((o) => (o.id === id ? updatedOrder : o)));
      if (selectedOrder?.id === id) setSelectedOrder(updatedOrder);
      return updatedOrder;
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
      throw err;
    } finally {
      setProcessingId(null);
    }
  };

  const toggleRow = (id) =>
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));

  const openPanel = (order) => { setSelectedOrder(order); setPanelOpen(true); };
  const closePanel = () => {
    setPanelOpen(false);
    setTimeout(() => setSelectedOrder(null), 300);
  };

  /* Derived data */
  const filtered = orders.filter((order) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !q ||
      order.user?.name?.toLowerCase().includes(q) ||
      order.user?.email?.toLowerCase().includes(q) ||
      order.id?.toLowerCase().includes(q);
    const matchOrderStatus = orderStatusFilter === 'all' || order.order_status === orderStatusFilter;
    const matchPaymentStatus = paymentStatusFilter === 'all' || order.payment_status === paymentStatusFilter;
    return matchSearch && matchOrderStatus && matchPaymentStatus;
  });

  const counts = { all: orders.length, processing: 0, shipped: 0, installed: 0, completed: 0, pending: 0, paid: 0, failed: 0 };
  orders.forEach((o) => {
    if (counts[o.order_status] !== undefined) counts[o.order_status]++;
    if (counts[o.payment_status] !== undefined) counts[o.payment_status]++;
  });

  const totalRevenue = orders
    .filter((o) => o.payment_status === 'paid')
    .reduce((s, o) => s + parseFloat(o.total_amount ?? 0), 0);

  const filterTabStyle = (active) => ({
    padding: '7px 14px',
    borderRadius: 8,
    fontSize: 12.5,
    fontWeight: 700,
    cursor: 'pointer',
    border: active ? `1px solid ${C.primary}` : `1px solid ${C.gray200}`,
    background: active ? C.primaryLight : C.white,
    color: active ? C.primaryDark : C.gray500,
    transition: 'all 0.15s',
  });

  /* Inject keyframe for spinner */
  const spinKeyframe = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;

  return (
    <DashboardLayout>
      <style>{spinKeyframe}</style>

      <div style={{ padding: '0 0 40px', maxWidth: 1200, margin: '0 auto' }}>

        {/* ── Page Header ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 28,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: C.primary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
              LNE Solar Admin
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: C.dark, margin: 0, letterSpacing: -0.5 }}>
              Orders & Sales
            </h1>
            <p style={{ margin: '5px 0 0', fontSize: 13.5, color: C.gray500 }}>
              Manage and track all customer orders
            </p>
          </div>
          <button
            onClick={fetchOrders}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '10px 18px',
              borderRadius: 11,
              border: `1px solid ${C.gray200}`,
              background: C.white,
              fontSize: 13,
              fontWeight: 700,
              color: C.gray700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <RefreshCw
              size={14}
              style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}
            />
            Refresh
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
          <StatCard icon={ShoppingCart} label="Total Orders" value={counts.all} color={C.primary} />
          <StatCard
            icon={CheckCircle}
            label="Paid Orders"
            value={counts.paid}
            sub={`Revenue: ${fmtCurrency(totalRevenue)}`}
            color="#10B981"
          />
          <StatCard icon={Clock} label="Pending Payment" value={counts.pending} color={C.warning} />
          <StatCard icon={Truck} label="Shipped" value={counts.shipped} color="#F97316" />
        </div>

        {/* ── Filters & Search ── */}
        <div
          style={{
            background: C.white,
            borderRadius: 14,
            border: `1px solid ${C.border}`,
            padding: '16px 20px',
            marginBottom: 16,
            display: 'flex',
            gap: 14,
            flexWrap: 'wrap',
            alignItems: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          {/* Search */}
          <div
            style={{
              flex: 1,
              minWidth: 220,
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              background: C.gray50,
              border: `1px solid ${C.gray200}`,
              borderRadius: 10,
              padding: '9px 14px',
            }}
          >
            <Search size={15} color={C.gray400} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email or order ID…"
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: 13,
                color: C.dark,
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.gray400, display: 'flex' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Order status tabs */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.gray400, textTransform: 'uppercase', letterSpacing: 0.5, marginRight: 2 }}>
              Order:
            </span>
            {['all', ...Object.keys(orderStatusCfg)].map((s) => (
              <button
                key={s}
                onClick={() => setOrderStatusFilter(s)}
                style={filterTabStyle(orderStatusFilter === s)}
              >
                {s === 'all' ? `All (${counts.all})` : `${orderStatusCfg[s].label} (${counts[s]})`}
              </button>
            ))}
          </div>

          {/* Payment status tabs */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.gray400, textTransform: 'uppercase', letterSpacing: 0.5, marginRight: 2 }}>
              Payment:
            </span>
            {['all', ...Object.keys(paymentStatusCfg)].map((s) => (
              <button
                key={s}
                onClick={() => setPaymentStatusFilter(s)}
                style={filterTabStyle(paymentStatusFilter === s)}
              >
                {s === 'all' ? 'All' : paymentStatusCfg[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div
          style={{
            background: C.white,
            borderRadius: 16,
            border: `1px solid ${C.border}`,
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <Loader2 size={28} color={C.primary} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
              <p style={{ marginTop: 14, fontSize: 13.5, color: C.gray500, fontWeight: 600 }}>Loading orders…</p>
            </div>
          ) : error ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <AlertCircle size={28} color={C.error} style={{ margin: '0 auto' }} />
              <p style={{ marginTop: 12, fontSize: 14, color: C.gray700, fontWeight: 600 }}>{error}</p>
              <button
                onClick={fetchOrders}
                style={{
                  marginTop: 14,
                  padding: '9px 20px',
                  borderRadius: 10,
                  border: 'none',
                  background: C.primary,
                  color: C.white,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <ShoppingCart size={32} color={C.gray300} style={{ margin: '0 auto' }} />
              <p style={{ marginTop: 12, fontSize: 14, color: C.gray500, fontWeight: 600 }}>
                {orders.length === 0 ? 'No orders yet.' : 'No orders match your filters.'}
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.gray50, borderBottom: `1px solid ${C.border}` }}>
                  {['Order ID', 'Customer', 'Product', 'Date', 'Total', 'Payment', 'Order Status', 'Actions'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: 11,
                        fontWeight: 800,
                        color: C.gray500,
                        textTransform: 'uppercase',
                        letterSpacing: 0.7,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, idx) => (
                  <React.Fragment key={order.id}>
                    <tr
                      style={{
                        borderBottom: expandedRows[order.id] ? 'none' : `1px solid ${C.border}`,
                        background: expandedRows[order.id] ? '#F7FFFE' : idx % 2 === 0 ? C.white : '#FAFBFC',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={(e) => { if (!expandedRows[order.id]) e.currentTarget.style.background = C.gray50; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = expandedRows[order.id] ? '#F7FFFE' : idx % 2 === 0 ? C.white : '#FAFBFC'; }}
                    >
                      {/* Order ID */}
                      <td style={{ padding: '13px 16px' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: 12,
                            fontWeight: 800,
                            color: C.primary,
                            background: C.primaryLight,
                            padding: '3px 8px',
                            borderRadius: 6,
                            letterSpacing: 0.3,
                          }}
                        >
                          #{order.id.substring(0, 8).toUpperCase()}
                        </span>
                      </td>

                      {/* Customer */}
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: `hsl(${Math.abs(order.id.charCodeAt(0) * 7) % 360}, 60%, 90%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 13,
                              fontWeight: 800,
                              color: `hsl(${Math.abs(order.id.charCodeAt(0) * 7) % 360}, 50%, 35%)`,
                              flexShrink: 0,
                            }}
                          >
                            {(order.user?.name ?? '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.dark }}>{order.user?.name ?? '—'}</div>
                            {order.user?.email && (
                              <div style={{ fontSize: 11.5, color: C.gray400 }}>{order.user.email}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Product */}
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {order.items?.length > 0 ? (
                            order.items.map((item, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 22, height: 22, borderRadius: 5, background: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <Package size={11} color={C.primary} />
                                </div>
                                <span style={{ fontSize: 12.5, fontWeight: 600, color: C.dark }}>
                                  {item.itemable?.name ?? item.product_name ?? item.name ?? 'Item'}
                                </span>
                                {(item.quantity ?? 0) > 1 && (
                                  <span style={{ fontSize: 11, color: C.gray400, fontWeight: 600 }}>×{item.quantity}</span>
                                )}
                              </div>
                            ))
                          ) : (
                            <span style={{ fontSize: 12.5, color: C.gray400 }}>—</span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ fontSize: 13, color: C.gray700, whiteSpace: 'nowrap' }}>
                          {fmtDate(order.created_at)}
                        </div>
                      </td>

                      {/* Total */}
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>
                          {fmtCurrency(order.total_amount)}
                        </div>
                      </td>

                      {/* Payment Status */}
                      <td style={{ padding: '13px 16px' }}>
                        <StatusBadge status={order.payment_status} cfg={paymentStatusCfg} />
                      </td>

                      {/* Order Status */}
                      <td style={{ padding: '13px 16px' }}>
                        <StatusBadge status={order.order_status} cfg={orderStatusCfg} />
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <button
                            onClick={() => openPanel(order)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '7px 13px',
                              borderRadius: 8,
                              border: `1px solid ${C.primary}`,
                              background: C.primaryLight,
                              color: C.primaryDark,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = C.primary; e.currentTarget.style.color = C.white; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = C.primaryLight; e.currentTarget.style.color = C.primaryDark; }}
                          >
                            <Eye size={13} /> View
                          </button>

                          <button
                            onClick={() => toggleRow(order.id)}
                            title={expandedRows[order.id] ? 'Collapse' : 'Expand'}
                            style={{
                              width: 32,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 8,
                              border: `1px solid ${C.gray200}`,
                              background: expandedRows[order.id] ? C.gray100 : C.white,
                              color: C.gray500,
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                          >
                            {expandedRows[order.id]
                              ? <ChevronUp size={14} />
                              : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expandedRows[order.id] && <ExpandedRow order={order} />}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}

          {/* Footer row count */}
          {!loading && !error && filtered.length > 0 && (
            <div
              style={{
                padding: '12px 20px',
                borderTop: `1px solid ${C.border}`,
                fontSize: 12.5,
                color: C.gray400,
                fontWeight: 600,
                background: C.gray50,
              }}
            >
              Showing {filtered.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* ── Side Panel ── */}
      {panelOpen && selectedOrder && (
        <>
          <div
            onClick={closePanel}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(13,17,23,0.45)',
              zIndex: 900,
              backdropFilter: 'blur(3px)',
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(680px, 95vw)',
              background: C.white,
              zIndex: 901,
              overflowY: 'auto',
              boxShadow: '-4px 0 40px rgba(0,0,0,0.14)',
              animation: 'slideIn 0.25s ease',
            }}
          >
            <style>{`@keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
            <OrderDetailPanel
              order={selectedOrder}
              onClose={closePanel}
              onUpdateStatus={handleUpdateStatus}
              processingId={processingId}
            />
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default OrdersPage;
