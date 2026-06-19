import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../layout/DashboardLayout';
import client from '../api/client';
import {
  Settings,
  DollarSign,
  Shield,
  Banknote,
  Key,
  Save,
  Truck,
  MapPin,
  Plane,
  Building2,
  CreditCard,
  Bike,
  Store,
  Info,
  AlertTriangle,
  CheckCircle2,
  Image,
} from 'lucide-react';

/* ─── tiny helpers ─────────────────────────────────────────── */

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

const SectionCard = ({ icon: Icon, title, children }) => (
  <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#00a85910', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color="#00A859" />
      </div>
      <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1a1a1a' }}>{title}</h3>
    </div>
    {children}
  </div>
);

const Toggle = ({ checked, onChange, 'aria-label': ariaLabel }) => (
  <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer', flexShrink: 0 }} aria-label={ariaLabel}>
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
    <span style={{
      position: 'absolute', inset: 0, borderRadius: 99, transition: '0.2s',
      background: checked ? '#00A859' : '#cbd5e1',
    }} />
    <span style={{
      position: 'absolute', width: 18, height: 18, left: checked ? 23 : 3, top: 3,
      borderRadius: '50%', background: '#fff', transition: '0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    }} />
  </label>
);

const PaymentCard = ({ icon: Icon, iconBg, iconColor, title, description, isDefault, enabled, onToggle, children }) => (
  <div style={{
    border: enabled ? '1.5px solid #00A859' : '1px solid #f1f5f9',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: '0.75rem',
    transition: 'border-color 0.2s',
    background: '#fff',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={iconColor} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {title}
            {isDefault && (
              <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 99, background: '#00a85915', color: '#00A859', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <CheckCircle2 size={10} /> Default
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 2 }}>{description}</div>
        </div>
      </div>
      <Toggle checked={enabled} onChange={onToggle} aria-label={`Toggle ${title}`} />
    </div>
    {enabled && children && (
      <div style={{ borderTop: '1px solid #f1f5f9', padding: '1rem 1.25rem', background: '#fafcff' }}>
        {children}
      </div>
    )}
  </div>
);

const Banner = ({ type = 'info', icon: Icon, children }) => {
  const styles = {
    info: { bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af', icon: '#3b82f6' },
    warning: { bg: '#fffbeb', border: '#fde68a', color: '#92400e', icon: '#f59e0b' },
  };
  const s = styles[type];
  return (
    <div style={{ display: 'flex', gap: '0.625rem', padding: '0.75rem 1rem', borderRadius: 10, background: s.bg, border: `1px solid ${s.border}`, marginTop: '0.75rem' }}>
      <Icon size={16} color={s.icon} style={{ flexShrink: 0, marginTop: 1 }} />
      <p style={{ fontSize: '0.84rem', color: s.color, lineHeight: 1.55, margin: 0 }}>{children}</p>
    </div>
  );
};

const ShippingZoneRow = ({ icon: Icon, iconBg, iconColor, name, description, price, sub }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1rem 1.25rem', borderRadius: 12, border: '1px solid #f1f5f9', marginBottom: '0.75rem', background: '#fafafa',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={iconColor} />
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a' }}>{name}</div>
        <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 2 }}>{description}</div>
      </div>
    </div>
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: price === 'Free' ? '#00A859' : '#1a1a1a' }}>{price}</div>
      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>{sub}</div>
    </div>
  </div>
);

/* ─── tab button ──────────────────────────────────────────── */
const TABS = [
  { id: 0, label: 'Site settings', icon: Store },
  { id: 1, label: 'Payment settings', icon: CreditCard },
  { id: 2, label: 'Shipping settings', icon: Truck },
];

/* ═══════════════════════════════════════════════════════════ */
export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const [paymentSettings, setPaymentSettings] = useState({
    paystack: { enabled: false, api_key: '', public_key: '' },
    pay_on_delivery: { enabled: true },
    bank_transfer: { enabled: false, bank_name: '', account_name: '', account_number: '' },
  });

  const [siteSettings, setSiteSettings] = useState({
    site_logo_path: null,
    site_name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    phone_1: '',
    phone_2: '',
    email: '',
  });

  const [shippingSettings, setShippingSettings] = useState({
    within_lagos: 0,
    outside_lagos: 7000,
  });

  const atLeastOnePaymentEnabled = useMemo(() => (
    paymentSettings.paystack.enabled ||
    paymentSettings.pay_on_delivery.enabled ||
    paymentSettings.bank_transfer.enabled
  ), [paymentSettings]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await client('/admin/settings');
        const pm = data?.payment_method || {};

        setPaymentSettings({
          paystack: { enabled: !!pm?.paystack?.enabled, api_key: pm?.paystack?.api_key || '', public_key: pm?.paystack?.public_key || '' },
          pay_on_delivery: { enabled: pm?.pay_on_delivery?.enabled ?? true },
          bank_transfer: {
            enabled: !!pm?.bank_transfer?.enabled,
            bank_name: pm?.bank_transfer?.bank_name || '',
            account_name: pm?.bank_transfer?.account_name || '',
            account_number: pm?.bank_transfer?.account_number || '',
          },
        });

        if (data?.site_settings) setSiteSettings(s => ({ ...s, ...data.site_settings }));
        if (data?.shipping_settings) setShippingSettings(s => ({ ...s, ...data.shipping_settings }));
      } catch (err) {
        setError('Failed to load settings.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updatePayment = (key, patch) =>
    setPaymentSettings(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await client('/admin/settings', {
        method: 'PATCH',
        body: { payment_method: paymentSettings, site_settings: siteSettings, shipping_settings: shippingSettings },
      });
      toast.success('Settings saved successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings');
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div style={{ padding: '2rem' }}>
        <h2 style={{ margin: 0 }}>Settings</h2>
        <p style={{ marginTop: '0.75rem', color: '#94a3b8' }}>Loading settings…</p>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.25rem', fontWeight: 800 }}>
          <Settings size={20} color="#00A859" /> Settings
        </h2>
        <p style={{ marginTop: '0.4rem', color: '#94a3b8', fontSize: '0.9rem' }}>
          Manage your site identity, payment methods, and shipping rates.
        </p>
      </div>

      {error && (
        <Banner type="warning" icon={AlertTriangle}>{error}</Banner>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f8fafc', borderRadius: 14, padding: 4, marginBottom: '1.75rem', border: '1px solid #f1f5f9' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              flex: 1, padding: '0.6rem 0.75rem', borderRadius: 10,
              border: activeTab === id ? '1px solid #e2e8f0' : 'none',
              background: activeTab === id ? '#fff' : 'transparent',
              color: activeTab === id ? '#00A859' : '#64748b',
              fontWeight: activeTab === id ? 800 : 500,
              cursor: 'pointer', fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              boxShadow: activeTab === id ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Site Settings ── */}
      {activeTab === 0 && (
        <>
          <SectionCard icon={Image} title="Brand & identity">
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '1.25rem', alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Site logo</label>
                <label style={{
                  border: '1.5px dashed #e2e8f0', borderRadius: 10, padding: '1.25rem 0.75rem',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
                  cursor: 'pointer', background: '#fafafa', transition: 'border-color 0.15s',
                  fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center',
                }}>
                  <Image size={22} color="#cbd5e1" />
                  <span style={{ fontWeight: 600, color: '#64748b', fontSize: '0.82rem' }}>Upload logo</span>
                  <span>PNG, SVG, JPG</span>
                  <input type="file" accept="image/*" style={{ display: 'none' }} />
                </label>
              </div>
              <InputField label="Site name" value={siteSettings.site_name} onChange={e => setSiteSettings(p => ({ ...p, site_name: e.target.value }))} placeholder="e.g. LNE Mobile" />
            </div>
          </SectionCard>

          <SectionCard icon={MapPin} title="Contact & location">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <InputField label="Street address" value={siteSettings.address} onChange={e => setSiteSettings(p => ({ ...p, address: e.target.value }))} placeholder="12 Broad Street" />
              <InputField label="City" value={siteSettings.city} onChange={e => setSiteSettings(p => ({ ...p, city: e.target.value }))} placeholder="Lagos" />
              <InputField label="State" value={siteSettings.state} onChange={e => setSiteSettings(p => ({ ...p, state: e.target.value }))} placeholder="Lagos State" />
              <InputField label="Country" value={siteSettings.country} onChange={e => setSiteSettings(p => ({ ...p, country: e.target.value }))} placeholder="Nigeria" />
              <InputField label="Primary phone" type="tel" value={siteSettings.phone_1} onChange={e => setSiteSettings(p => ({ ...p, phone_1: e.target.value }))} placeholder="0803 000 0000" />
              <InputField label="Secondary phone" type="tel" value={siteSettings.phone_2} onChange={e => setSiteSettings(p => ({ ...p, phone_2: e.target.value }))} placeholder="0901 000 0000" />
              <div style={{ gridColumn: '1 / -1' }}>
                <InputField label="Email address" type="email" value={siteSettings.email} onChange={e => setSiteSettings(p => ({ ...p, email: e.target.value }))} placeholder="hello@yourbrand.com" />
              </div>
            </div>
          </SectionCard>
        </>
      )}

      {/* ── Payment Settings ── */}
      {activeTab === 1 && (
        <SectionCard icon={Shield} title="Payment methods">
          <PaymentCard
            icon={Bike} iconBg="#00a85910" iconColor="#00A859"
            title="Pay on delivery" description="Customers pay in cash when the order is delivered."
            isDefault enabled={paymentSettings.pay_on_delivery.enabled}
            onToggle={v => updatePayment('pay_on_delivery', { enabled: v })}
          />

          <PaymentCard
            icon={CreditCard} iconBg="#dbeafe" iconColor="#185FA5"
            title="Paystack" description="Accept card and instant bank payments online via Paystack."
            enabled={paymentSettings.paystack.enabled}
            onToggle={v => updatePayment('paystack', { enabled: v })}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <InputField label="Secret API key" type="password" value={paymentSettings.paystack.api_key} onChange={e => updatePayment('paystack', { api_key: e.target.value })} placeholder="sk_live_xxxxxxxxxx" />
              <InputField label="Public key" value={paymentSettings.paystack.public_key} onChange={e => updatePayment('paystack', { public_key: e.target.value })} placeholder="pk_live_xxxxxxxxxx" />
            </div>
            <Banner type="info" icon={Info}>Use test keys (sk_test_ / pk_test_) during development. Switch to live keys before going to production.</Banner>
          </PaymentCard>

          <PaymentCard
            icon={Building2} iconBg="#fef3c7" iconColor="#BA7517"
            title="Bank transfer" description="Display your bank details for customers who prefer manual transfers."
            enabled={paymentSettings.bank_transfer.enabled}
            onToggle={v => updatePayment('bank_transfer', { enabled: v })}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <InputField label="Bank name" value={paymentSettings.bank_transfer.bank_name} onChange={e => updatePayment('bank_transfer', { bank_name: e.target.value })} placeholder="e.g. GTBank" />
              <InputField label="Account number" value={paymentSettings.bank_transfer.account_number} onChange={e => updatePayment('bank_transfer', { account_number: e.target.value })} placeholder="0123456789" maxLength={10} />
              <div style={{ gridColumn: '1 / -1' }}>
                <InputField label="Account name" value={paymentSettings.bank_transfer.account_name} onChange={e => updatePayment('bank_transfer', { account_name: e.target.value })} placeholder="LNE Mobile Limited" />
              </div>
            </div>
          </PaymentCard>

          {!atLeastOnePaymentEnabled && (
            <Banner type="warning" icon={AlertTriangle}>
              No payment method is enabled. Customers will not be able to complete purchases in the app. Enable at least one option.
            </Banner>
          )}
        </SectionCard>
      )}

      {/* ── Shipping Settings ── */}
      {activeTab === 2 && (
        <>
          <SectionCard icon={Truck} title="Delivery zones & rates">
            <ShippingZoneRow
              icon={MapPin} iconBg="#00a85910" iconColor="#00A859"
              name="Within Lagos" description="All deliveries inside Lagos State"
              price="Free" sub="₦0.00"
            />
            <ShippingZoneRow
              icon={Plane} iconBg="#dbeafe" iconColor="#185FA5"
              name="Outside Lagos" description="Deliveries to other Nigerian states"
              price={`₦${shippingSettings.outside_lagos.toLocaleString()}`} sub="Flat rate per order"
            />
            <Banner type="info" icon={Info}>
              Rates are applied automatically at checkout based on the customer's delivery address. Customers in Lagos always get free shipping.
            </Banner>
          </SectionCard>

          <SectionCard icon={DollarSign} title="Adjust rates">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <InputField
                  label="Within Lagos (₦)"
                  type="number" min={0}
                  value={shippingSettings.within_lagos}
                  onChange={e => setShippingSettings(p => ({ ...p, within_lagos: Number(e.target.value) }))}
                  placeholder="0"
                />
                <p style={{ marginTop: '0.35rem', fontSize: '0.78rem', color: '#94a3b8' }}>Set to 0 for free shipping.</p>
              </div>
              <div>
                <InputField
                  label="Outside Lagos (₦)"
                  type="number" min={0}
                  value={shippingSettings.outside_lagos}
                  onChange={e => setShippingSettings(p => ({ ...p, outside_lagos: Number(e.target.value) }))}
                  placeholder="7000"
                />
                <p style={{ marginTop: '0.35rem', fontSize: '0.78rem', color: '#94a3b8' }}>Applied as a flat rate per order.</p>
              </div>
            </div>
          </SectionCard>
        </>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
        <button
          type="button"
          onClick={() => toast('Changes not yet saved', { icon: '📝' })}
          style={{ padding: '0.75rem 1.25rem', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', color: '#1a1a1a' }}
        >
          Discard changes
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '0.75rem 1.25rem', borderRadius: 10, border: 'none',
            background: saving ? '#94a3b8' : '#00A859', color: '#fff',
            fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}
        >
          <Save size={16} /> {saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </DashboardLayout>
  );
}
