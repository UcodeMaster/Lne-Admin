import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../layout/DashboardLayout';
import client from '../api/client';
import {
  Search, RefreshCw, Loader2, AlertCircle, ShoppingCart,
  Eye, X, User, CreditCard, Calendar, Package,
  CheckCircle, XCircle, Clock, Truck, CheckSquare,
  Mail, Phone, Hash, TrendingUp,
} from 'lucide-react';

const C = {
  primary: '#00A859', primaryDark: '#007A3F', primaryLight: '#E8F8EE',
  error: '#FF3B30', errorLight: '#FFF0EF', warning: '#FF9500', warningLight: '#FFF4E5',
  dark: '#0D1117', gray700: '#374151', gray500: '#6B7280', gray400: '#9CA3AF',
  gray200: '#E5E7EB', gray100: '#F3F4F6', gray50: '#F9FAFB', white: '#FFFFFF', border: '#E8ECF0',
};

const fmtCurrency = (v) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(v ?? 0);
const fmtDate     = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const paymentStatusCfg = {
  pending: { bg:'#FFFBEB', color:'#B45309', border:'#FDE68A', dot:'#F59E0B', Icon: Clock,       label:'Pending' },
  paid:    { bg:'#ECFDF5', color:'#065F46', border:'#A7F3D0', dot:'#10B981', Icon: CheckCircle, label:'Paid'    },
  failed:  { bg:'#FEF2F2', color:'#991B1B', border:'#FECACA', dot:'#EF4444', Icon: XCircle,     label:'Failed'  },
};
const orderStatusCfg = {
  processing: { bg:'#EEF2FF', color:'#3730A3', border:'#C7D2FE', dot:'#6366F1', Icon: Clock,        label:'Processing' },
  shipped:    { bg:'#FFF7ED', color:'#9A3412', border:'#FED7AA', dot:'#F97316', Icon: Truck,         label:'Shipped'    },
  installed:  { bg:'#ECFDF5', color:'#065F46', border:'#A7F3D0', dot:'#10B981', Icon: CheckSquare,   label:'Installed'  },
  completed:  { bg:'#F0FDF4', color:'#14532D', border:'#86EFAC', dot:'#22C55E', Icon: CheckCircle,   label:'Completed'  },
};

const StatusBadge = ({ status, cfg }) => {
  const c = cfg[status] ?? cfg[Object.keys(cfg)[0]];
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 10px', borderRadius:20, fontSize:11.5, fontWeight:700, background:c.bg, color:c.color, border:`1px solid ${c.border}`, whiteSpace:'nowrap' }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:c.dot, flexShrink:0 }} />
      {c.label}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, color = C.primary }) => (
  <div style={{ background:C.white, borderRadius:16, padding:'22px 24px', flex:1, minWidth:160, boxShadow:'0 1px 3px rgba(0,0,0,0.06)', border:`1px solid ${C.border}`, display:'flex', flexDirection:'column', gap:14, position:'relative', overflow:'hidden' }}>
    <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:color, borderRadius:'16px 16px 0 0' }}/>
    <div style={{ width:42, height:42, borderRadius:12, background:color+'15', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Icon size={20} color={color}/>
    </div>
    <div>
      <div style={{ fontSize:26, fontWeight:800, color:C.dark, lineHeight:1, letterSpacing:-0.5 }}>{value}</div>
      <div style={{ fontSize:12.5, color:C.gray500, marginTop:4, fontWeight:600 }}>{label}</div>
      {sub && <div style={{ fontSize:11.5, color:C.gray400, marginTop:3 }}>{sub}</div>}
    </div>
  </div>
);

const StatusManager = ({ order, onUpdateStatus, processingId }) => {
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

  const isProcessing = processingId === order.id;

  return (
    <div style={{ padding:'16px', background:C.gray50, borderRadius:12, border:`1px solid ${C.gray200}` }}>
      <div style={{ fontSize:11, fontWeight:700, color:C.gray400, textTransform:'uppercase', letterSpacing:0.6, marginBottom:10 }}>Status Management</div>
      <div style={{ display:'flex', gap:10, marginBottom:12, flexWrap:'wrap', alignItems:'center' }}>
        <StatusBadge status={orderStatus} cfg={orderStatusCfg}/>
        <StatusBadge status={paymentStatus} cfg={paymentStatusCfg}/>
        {isProcessing && (
          <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:12, color:C.gray500 }}>
            <Loader2 size={13} style={{ animation:'spin 1s linear infinite' }}/> Saving...
          </span>
        )}
      </div>
      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:140 }}>
          <label style={{ fontSize:11, fontWeight:700, color:C.gray500, display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:0.5 }}>Order Status</label>
          <select
            value={orderStatus}
            onChange={(e) => handleOrderStatusChange(e.target.value)}
            disabled={isProcessing}
            style={{ width:'100%', padding:'9px 12px', borderRadius:10, border:`1px solid ${C.gray200}`, fontSize:13, fontWeight:600, color:C.dark, background:C.white, cursor: isProcessing ? 'not-allowed' : 'pointer', outline:'none' }}
          >
            {Object.entries(orderStatusCfg).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>
        <div style={{ flex:1, minWidth:140 }}>
          <label style={{ fontSize:11, fontWeight:700, color:C.gray500, display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:0.5 }}>Payment Status</label>
          <select
            value={paymentStatus}
            onChange={(e) => handlePaymentStatusChange(e.target.value)}
            disabled={isProcessing}
            style={{ width:'100%', padding:'9px 12px', borderRadius:10, border:`1px solid ${C.gray200}`, fontSize:13, fontWeight:600, color:C.dark, background:C.white, cursor: isProcessing ? 'not-allowed' : 'pointer', outline:'none' }}
          >
            {Object.entries(paymentStatusCfg).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

function BranchManagerOrdersPage() {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [searchTerm, setSearchTerm]   = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [panelOpen, setPanelOpen]     = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const data = await client('/branch-manager/orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load orders. Please retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const openPanel  = (order) => { setSelectedOrder(order); setPanelOpen(true); };
  const closePanel = () => { setPanelOpen(false); setTimeout(() => setSelectedOrder(null), 300); };

  const handleUpdateStatus = async (id, { order_status, payment_status }) => {
    try {
      setProcessingId(id);
      const updatedOrder = await client(`/branch-manager/orders/${id}/status`, {
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

  const filtered = orders.filter(order => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || order.user?.name?.toLowerCase().includes(q) || order.user?.email?.toLowerCase().includes(q) || order.id?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || order.order_status === statusFilter || order.payment_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = { all: orders.length, processing: 0, shipped: 0, installed: 0, completed: 0 };
  orders.forEach(o => { if (counts[o.order_status] !== undefined) counts[o.order_status]++; });
  const totalRevenue = orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + parseFloat(o.total_amount ?? 0), 0);

  return (
    <DashboardLayout>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(100%); opacity:0; } to { transform: translateX(0); opacity:1; } }
        .order-row:hover { background: #F9FAFB !important; }
      `}</style>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:800, color:C.dark, margin:0 }}>Orders & Sales</h2>
          <p style={{ color:C.gray500, marginTop:4, fontSize:13 }}>Orders from customers within your branch city/state.</p>
        </div>
        <button onClick={fetchOrders} disabled={loading} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 18px', background:C.white, border:`1px solid ${C.gray200}`, borderRadius:10, fontWeight:700, fontSize:13, color:C.gray700, cursor:'pointer' }}>
          <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}/> Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
        <StatCard icon={ShoppingCart}  label="Total Orders"    value={counts.all}       color={C.primary} />
        <StatCard icon={Clock}         label="Processing"      value={counts.processing} color="#6366F1"  />
        <StatCard icon={Truck}         label="Shipped"         value={counts.shipped}   color="#F97316"   />
        <StatCard icon={CheckCircle}   label="Completed"       value={counts.completed} color={C.primary} sub={`Revenue: ${fmtCurrency(totalRevenue)}`} />
      </div>

      {/* Search + Filter */}
      <div style={{ background:C.white, borderRadius:14, padding:'14px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:20, display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:220 }}>
          <Search size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:C.gray400 }}/>
          <input type="text" placeholder="Search by customer or order ID…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ width:'100%', padding:'9px 12px 9px 38px', borderRadius:10, border:`1px solid ${C.gray200}`, outline:'none', fontSize:13, color:C.dark, background:C.gray50 }}/>
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {['all','processing','shipped','installed','completed'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{ padding:'7px 14px', borderRadius:20, border:'none', fontSize:12, fontWeight:700, cursor:'pointer', background: statusFilter===s ? C.primary : C.gray100, color: statusFilter===s ? C.white : C.gray500, textTransform:'capitalize', transition:'all 0.15s' }}>
              {s === 'all' ? `All (${counts.all})` : `${s.charAt(0).toUpperCase()+s.slice(1)} (${counts[s] ?? 0})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background:C.white, borderRadius:16, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:'60px', textAlign:'center', color:C.gray400 }}>
            <Loader2 size={36} style={{ animation:'spin 1s linear infinite', margin:'0 auto 12px', display:'block', color:C.primary }}/>
            <p style={{ fontSize:13 }}>Loading orders…</p>
          </div>
        ) : error ? (
          <div style={{ padding:'60px', textAlign:'center', color:C.error }}>
            <AlertCircle size={40} style={{ margin:'0 auto 12px', display:'block', opacity:0.5 }}/>
            <p style={{ marginBottom:16 }}>{error}</p>
            <button onClick={fetchOrders} style={{ padding:'8px 20px', background:C.primary, color:C.white, border:'none', borderRadius:8, fontWeight:700, cursor:'pointer' }}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:'60px', textAlign:'center', color:C.gray400 }}>
            <ShoppingCart size={40} style={{ margin:'0 auto 12px', display:'block', opacity:0.2 }}/>
            <p style={{ fontSize:13 }}>No orders found for your branch location.</p>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'separate', borderSpacing:'0' }}>
              <thead>
                <tr style={{ background:C.gray50 }}>
                  {['Order ID','Customer','Product','Items','Total','Order Status','Payment','Date','Action'].map((h, i) => (
                    <th key={h} style={{ padding:'14px 16px', fontSize:12, color:C.gray500, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5, textAlign: i===8 ? 'center' : 'left', whiteSpace:'nowrap', borderBottom:`1px solid ${C.gray200}` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order.id} className="order-row" style={{ borderBottom:`1px solid ${C.gray100}`, background:C.white, transition:'background 0.15s' }}>
                    <td style={{ padding:'13px 16px', fontFamily:'monospace', fontSize:12, fontWeight:700, color:C.primary, whiteSpace:'nowrap' }}>#{order.id.substring(0,8).toUpperCase()}</td>
                    <td style={{ padding:'13px 16px', minWidth:160 }}>
                      <div style={{ fontWeight:700, color:C.dark, fontSize:13 }}>{order.user?.name ?? '—'}</div>
                      <div style={{ fontSize:11, color:C.gray400 }}>{order.user?.email}</div>
                    </td>
                    <td style={{ padding:'13px 16px', fontSize:13, color:C.gray700, maxWidth:180 }}>
                      {order.items?.length > 0 ? (
                        <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                          {order.items.slice(0, 2).map((item, i) => (
                            <span key={i} style={{ fontSize:12, fontWeight:600, color:C.dark, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                              {item.itemable?.name ?? item.product_name ?? item.name ?? `Item ${i + 1}`}
                            </span>
                          ))}
                          {order.items.length > 2 && <span style={{ fontSize:11, color:C.gray400 }}>+{order.items.length - 2} more</span>}
                        </div>
                      ) : '—'}
                    </td>
                    <td style={{ padding:'13px 16px', fontSize:13, color:C.gray700 }}>{order.items?.length ?? 0} item(s)</td>
                    <td style={{ padding:'13px 16px', fontSize:13, fontWeight:800, color:C.dark, whiteSpace:'nowrap' }}>{fmtCurrency(order.total_amount)}</td>
                    <td style={{ padding:'13px 16px', whiteSpace:'nowrap' }}><StatusBadge status={order.order_status} cfg={orderStatusCfg}/></td>
                    <td style={{ padding:'13px 16px', whiteSpace:'nowrap' }}><StatusBadge status={order.payment_status} cfg={paymentStatusCfg}/></td>
                    <td style={{ padding:'13px 16px', fontSize:12, color:C.gray500, whiteSpace:'nowrap' }}>{fmtDate(order.created_at)}</td>
                    <td style={{ padding:'13px 16px', textAlign:'center' }}>
                      <button onClick={() => openPanel(order)} style={{ padding:'6px 12px', borderRadius:8, border:`1px solid ${C.gray200}`, background:C.white, color:C.gray600, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:5, fontSize:12, fontWeight:600 }}>
                        <Eye size={14}/> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && filtered.length > 0 && (
          <div style={{ padding:'12px 20px', borderTop:`1px solid ${C.gray100}` }}>
            <span style={{ fontSize:12, color:C.gray400 }}>Showing <strong>{filtered.length}</strong> of <strong>{orders.length}</strong> orders</span>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {panelOpen && selectedOrder && (
        <>
          <div onClick={closePanel} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', zIndex:900, backdropFilter:'blur(2px)' }}/>
          <div style={{ position:'fixed', top:0, right:0, bottom:0, width:'min(600px, 95vw)', background:C.white, zIndex:901, overflowY:'auto', boxShadow:'-8px 0 40px rgba(0,0,0,0.12)', animation:'slideIn 0.25s ease' }}>
            <div style={{ padding:'20px 24px', borderBottom:`1px solid ${C.gray200}`, display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:C.white, zIndex:10 }}>
              <div>
                <div style={{ fontFamily:'monospace', fontSize:12, color:C.primary, fontWeight:700 }}>#{selectedOrder.id.substring(0,8).toUpperCase()}</div>
                <h3 style={{ fontSize:17, fontWeight:800, color:C.dark, margin:'2px 0 0' }}>Order Details</h3>
              </div>
              <button onClick={closePanel} style={{ width:36, height:36, borderRadius:'50%', border:`1px solid ${C.gray200}`, background:C.gray50, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:C.gray500 }}>
                <X size={18}/>
              </button>
            </div>
            <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:20 }}>
              {/* Status Management */}
              <StatusManager order={selectedOrder} onUpdateStatus={handleUpdateStatus} processingId={processingId} />
              {selectedOrder.user && (
                <div style={{ padding:'16px', background:C.gray50, borderRadius:12, border:`1px solid ${C.gray200}` }}>
                  <div style={{ fontSize:11, fontWeight:700, color:C.gray400, textTransform:'uppercase', letterSpacing:0.6, marginBottom:10 }}>Customer</div>
                  <div style={{ fontWeight:700, fontSize:14, color:C.dark }}>{selectedOrder.user.name}</div>
                  <div style={{ fontSize:12, color:C.gray500, marginTop:3 }}>{selectedOrder.user.email}</div>
                  <div style={{ fontSize:12, color:C.gray500 }}>{selectedOrder.user.phone}</div>
                </div>
              )}
              {selectedOrder.items?.length > 0 && (
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:C.gray400, textTransform:'uppercase', letterSpacing:0.6, marginBottom:10 }}>Items ({selectedOrder.items.length})</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', borderRadius:10, background:C.gray50, border:`1px solid ${C.gray200}` }}>
                        <div>
                          <div style={{ fontWeight:700, fontSize:13, color:C.dark }}>{item.itemable?.name ?? item.product_name ?? item.name ?? `Item ${i+1}`}</div>
                          <div style={{ fontSize:11.5, color:C.gray500 }}>Qty: {item.quantity} × {fmtCurrency(item.price)}</div>
                        </div>
                        <div style={{ fontWeight:800, color:C.dark }}>{fmtCurrency(parseFloat(item.price??0)*parseInt(item.quantity??0))}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display:'flex', justifyContent:'space-between', padding:'14px 16px', background:C.primaryLight, borderRadius:10 }}>
                <span style={{ fontWeight:800, fontSize:14, color:C.primaryDark }}>Total Amount</span>
                <span style={{ fontWeight:800, fontSize:16, color:C.primary }}>{fmtCurrency(selectedOrder.total_amount)}</span>
              </div>
              <div style={{ fontSize:12, color:C.gray500 }}>Placed: <strong>{fmtDateTime(selectedOrder.created_at)}</strong></div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default BranchManagerOrdersPage;
