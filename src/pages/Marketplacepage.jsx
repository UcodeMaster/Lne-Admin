import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../layout/DashboardLayout';
import client from '../api/client';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Upload,
  ArrowUpRight,
  RefreshCw,
  Package,
  Tag,
  ShoppingBag,
  X,
  Loader2,
  Link,
} from 'lucide-react';

/* ─── Design Tokens ─────────────────────────────────────────── */
const C = {
  primary: '#00A859',
  primaryDark: '#007A3F',
  primaryLight: '#E8F8EE',
  error: '#EF4444',
  errorLight: '#FEF2F2',
  warning: '#F97316',
  warningLight: '#FFF7ED',
  info: '#0284C7',
  infoLight: '#F0F9FF',
  dark: '#0D1117',
  gray800: '#1F2937',
  gray700: '#374151',
  gray600: '#4B5563',
  gray500: '#6B7280',
  gray400: '#9CA3AF',
  gray300: '#D1D5DB',
  gray200: '#E5E7EB',
  gray100: '#F3F4F6',
  gray50: '#F9FAFB',
  white: '#FFFFFF',
  border: '#E8ECF0',
};

const spin = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
const fadeIn = `@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`;
const slideUp = `@keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }`;

/* ─── Helpers ────────────────────────────────────────────────── */
const fmtCurrency = (v) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(v ?? 0);

const imgSrc = (url) => (url ? `http://127.0.0.1:8000/storage/${url}` : null);

/* ─── Sub-components ─────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color = C.primary }) => (
  <div
    style={{
      background: C.white,
      borderRadius: 14,
      padding: '18px 22px',
      flex: 1,
      minWidth: 160,
      border: `1px solid ${C.border}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color, borderRadius: '14px 14px 0 0' }} />
    <div style={{ width: 40, height: 40, borderRadius: 11, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={19} color={color} />
    </div>
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.dark, letterSpacing: -0.4, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: C.gray500, fontWeight: 600, marginTop: 3 }}>{label}</div>
    </div>
  </div>
);

const FormField = ({ label, children, hint }) => (
  <div>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.gray600, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 7 }}>
      {label}
    </label>
    {children}
    {hint && <p style={{ margin: '5px 0 0', fontSize: 11.5, color: C.gray400 }}>{hint}</p>}
  </div>
);

const inputStyle = {
  width: '100%',
  padding: '10px 13px',
  borderRadius: 10,
  border: `1px solid ${C.gray200}`,
  fontSize: 13.5,
  color: C.dark,
  background: C.white,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const focusInput = (e) => {
  e.target.style.borderColor = C.primary;
  e.target.style.boxShadow = `0 0 0 3px ${C.primary}22`;
};
const blurInput = (e) => {
  e.target.style.borderColor = C.gray200;
  e.target.style.boxShadow = 'none';
};

/* ─── Modal ──────────────────────────────────────────────────── */
const ItemModal = ({ editingItem, categories, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: editingItem?.name ?? '',
    category_id: editingItem?.category_id ?? categories[0]?.id ?? '',
    price: editingItem?.price ?? '',
    description: editingItem?.description ?? '',
    stock_count: editingItem?.stock_count ?? '',
    is_active: editingItem?.is_active ?? true,
    slug: editingItem?.slug ?? '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(imgSrc(editingItem?.image_url));
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (k === 'is_active') data.append(k, v ? 1 : 0);
      else if (v !== '') data.append(k, v);
    });
    if (imageFile) data.append('image', imageFile);
    if (editingItem) data.append('_method', 'PATCH');
    try {
      await onSubmit(data);
    } finally {
      setSubmitting(false);
    }
  };

  const set = (key, val) => setFormData((p) => ({ ...p, [key]: val }));

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(13,17,23,0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: C.white,
          borderRadius: 20,
          width: '100%',
          maxWidth: 640,
          boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
          animation: 'slideUp 0.25s ease',
        }}
      >
        {/* Modal Header */}
        <div style={{ padding: '22px 28px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 }}>
              LNE Solar · Marketplace
            </div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.dark, letterSpacing: -0.3 }}>
              {editingItem ? 'Edit Accessory' : 'Add New Accessory'}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${C.gray200}`, background: C.gray50, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gray500 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Image + Name + Category row */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 20, alignItems: 'start' }}>
              {/* Image Upload */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.gray600, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 7 }}>
                  Image
                </label>
                <div
                  onClick={() => document.getElementById('imageUpload').click()}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    border: `2px dashed ${imagePreview ? C.primary : C.gray300}`,
                    borderRadius: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: imagePreview ? 'transparent' : C.gray50,
                    overflow: 'hidden',
                    transition: 'border-color 0.15s',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => { if (!imagePreview) e.currentTarget.style.borderColor = C.primary; }}
                  onMouseLeave={(e) => { if (!imagePreview) e.currentTarget.style.borderColor = C.gray300; }}
                >
                  {imagePreview ? (
                    <img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
                  ) : (
                    <>
                      <Upload size={20} color={C.gray400} />
                      <span style={{ fontSize: 10.5, color: C.gray400, marginTop: 6, textAlign: 'center', fontWeight: 600 }}>Click to upload</span>
                    </>
                  )}
                  <input id="imageUpload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                </div>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    style={{ width: '100%', background: 'none', border: 'none', color: C.error, fontSize: 11.5, marginTop: 6, cursor: 'pointer', fontWeight: 700 }}
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Name + Category */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <FormField label="Product Name">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => set('name', e.target.value)}
                    placeholder="e.g. Solar Panel 400W"
                    style={inputStyle}
                    onFocus={focusInput}
                    onBlur={blurInput}
                  />
                </FormField>
                <FormField label="Category">
                  <select
                    value={formData.category_id}
                    onChange={(e) => set('category_id', e.target.value)}
                    required
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    onFocus={focusInput}
                    onBlur={blurInput}
                  >
                    <option value="" disabled>Select category…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.parent ? `${c.parent.name} › ` : ''}{c.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
            </div>

            {/* Price + Stock */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormField label="Price (₦)">
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => set('price', e.target.value)}
                  placeholder="0"
                  style={inputStyle}
                  onFocus={focusInput}
                  onBlur={blurInput}
                />
              </FormField>
              <FormField label="Stock Count">
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock_count}
                  onChange={(e) => set('stock_count', e.target.value)}
                  placeholder="0"
                  style={inputStyle}
                  onFocus={focusInput}
                  onBlur={blurInput}
                />
              </FormField>
            </div>

            {/* Description */}
            <FormField label="Description">
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Brief product description…"
                style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                onFocus={focusInput}
                onBlur={blurInput}
              />
            </FormField>

            {/* Slug */}
            <FormField label="Storefront URL Slug" hint="Leave blank to auto-generate from product name.">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: `1px solid ${C.gray200}`,
                  borderRadius: 10,
                  background: C.white,
                  overflow: 'hidden',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocusCapture={(e) => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.primary}22`; }}
                onBlurCapture={(e) => { e.currentTarget.style.borderColor = C.gray200; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <span style={{ padding: '10px 12px', fontSize: 13, color: C.gray500, background: C.gray50, borderRight: `1px solid ${C.gray200}`, fontFamily: 'monospace', whiteSpace: 'nowrap', fontWeight: 600 }}>
                  /product/
                </span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => set('slug', e.target.value)}
                  placeholder="auto-generated"
                  style={{ flex: 1, padding: '10px 13px', border: 'none', outline: 'none', fontSize: 13, color: C.dark, fontFamily: 'monospace', background: 'transparent' }}
                />
              </div>
            </FormField>

            {/* Active toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '13px 16px',
                borderRadius: 12,
                background: formData.is_active ? C.primaryLight : C.gray50,
                border: `1px solid ${formData.is_active ? '#A7F3D0' : C.gray200}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onClick={() => set('is_active', !formData.is_active)}
            >
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: formData.is_active ? C.primaryDark : C.gray700 }}>
                  {formData.is_active ? 'Active & Visible' : 'Hidden from Storefront'}
                </div>
                <div style={{ fontSize: 12, color: formData.is_active ? C.primary : C.gray500, marginTop: 2 }}>
                  {formData.is_active ? 'Customers can see and purchase this item' : 'This item won\'t appear in the storefront'}
                </div>
              </div>
              <div
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  background: formData.is_active ? C.primary : C.gray300,
                  position: 'relative',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 3,
                    left: formData.is_active ? 22 : 3,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: C.white,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    transition: 'left 0.2s',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div
            style={{
              padding: '16px 28px',
              borderTop: `1px solid ${C.border}`,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
              background: C.gray50,
              borderRadius: '0 0 20px 20px',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                border: `1px solid ${C.gray200}`,
                background: C.white,
                fontSize: 13.5,
                fontWeight: 700,
                color: C.gray700,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 24px',
                borderRadius: 10,
                border: 'none',
                background: submitting ? C.gray300 : C.primary,
                color: C.white,
                fontSize: 13.5,
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                transition: 'background 0.15s',
              }}
            >
              {submitting && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
              {submitting ? 'Saving…' : editingItem ? 'Save Changes' : 'Add Accessory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Main Page ──────────────────────────────────────────────── */
const MarketplacePage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsData, categoriesData] = await Promise.all([
        client('/admin/marketplace'),
        client('/admin/marketplace/categories'),
      ]);
      setItems(Array.isArray(itemsData) ? itemsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch {
      toast.error('Failed to load marketplace data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data) => {
    const loadingToast = toast.loading(editingItem ? 'Updating accessory…' : 'Creating accessory…');
    try {
      const url = editingItem ? `/admin/marketplace/${editingItem.id}` : '/admin/marketplace';
      await client(url, { method: 'POST', body: data });
      toast.success(editingItem ? 'Updated successfully' : 'Created successfully', { id: loadingToast });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      const msg = err.errors ? Object.values(err.errors).flat()[0] : (err.message || 'Failed to save');
      toast.error(msg, { id: loadingToast });
      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return;
    setDeletingId(id);
    const t = toast.loading('Deleting…');
    try {
      await client(`/admin/marketplace/${id}`, { method: 'DELETE' });
      toast.success('Deleted successfully', { id: t });
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      toast.error('Failed to delete', { id: t });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = items.filter((i) => i.is_active).length;
  const lowStockCount = items.filter((i) => i.stock_count < 5).length;

  return (
    <DashboardLayout>
      <style>{spin}{fadeIn}{slideUp}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>

        {/* ── Page Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: C.primary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
              LNE Solar Admin
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: C.dark, margin: 0, letterSpacing: -0.5 }}>
              Marketplace
            </h1>
            <p style={{ margin: '5px 0 0', fontSize: 13.5, color: C.gray500 }}>
              Manage accessories and storefront listings
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => { setRefreshing(true); fetchData().finally(() => setRefreshing(false)); }}
              disabled={refreshing}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '10px 18px', borderRadius: 11,
                border: `1px solid ${C.gray200}`, background: C.white,
                fontSize: 13, fontWeight: 700, color: C.gray700,
                cursor: refreshing ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
            <button
              onClick={() => handleOpenModal()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '10px 20px', borderRadius: 11,
                border: 'none', background: C.primary,
                fontSize: 13, fontWeight: 700, color: C.white,
                cursor: 'pointer',
                boxShadow: `0 2px 8px ${C.primary}40`,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.primaryDark; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = C.primary; }}
            >
              <Plus size={15} /> Add Accessory
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
          <StatCard icon={ShoppingBag} label="Total Listings" value={items.length} color={C.primary} />
          <StatCard icon={CheckCircle} label="Active Items" value={activeCount} color="#10B981" />
          <StatCard icon={AlertCircle} label="Low Stock" value={lowStockCount} color={C.warning} />
          <StatCard icon={Tag} label="Categories" value={categories.length} color={C.info} />
        </div>

        {/* ── Search ── */}
        <div
          style={{
            background: C.white,
            borderRadius: 14,
            border: `1px solid ${C.border}`,
            padding: '14px 18px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <Search size={16} color={C.gray400} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or category…"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13.5, color: C.dark, background: 'transparent' }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.gray400, display: 'flex' }}
            >
              <X size={15} />
            </button>
          )}
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
              <Loader2 size={28} color={C.primary} style={{ animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto' }} />
              <p style={{ marginTop: 14, fontSize: 13.5, color: C.gray500, fontWeight: 600 }}>Loading accessories…</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.gray50, borderBottom: `1px solid ${C.border}` }}>
                  {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h, i) => (
                    <th
                      key={h}
                      style={{
                        padding: '12px 16px',
                        textAlign: i === 5 ? 'right' : 'left',
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
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 60, textAlign: 'center' }}>
                      <Package size={32} color={C.gray300} style={{ margin: '0 auto', display: 'block' }} />
                      <p style={{ marginTop: 12, fontSize: 14, color: C.gray500, fontWeight: 600 }}>
                        {items.length === 0 ? 'No accessories yet. Add your first listing.' : 'No results match your search.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, idx) => (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: `1px solid ${C.border}`,
                        background: idx % 2 === 0 ? C.white : '#FAFBFC',
                        transition: 'background 0.1s',
                        animation: 'fadeIn 0.2s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = C.primaryLight; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = idx % 2 === 0 ? C.white : '#FAFBFC'; }}
                    >
                      {/* Product */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                          <div
                            style={{
                              width: 54,
                              height: 54,
                              borderRadius: 12,
                              overflow: 'hidden',
                              border: `1px solid ${C.border}`,
                              flexShrink: 0,
                              background: C.gray50,
                            }}
                          >
                            {item.image_url ? (
                              <img src={imgSrc(item.image_url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ImageIcon size={22} color={C.gray300} />
                              </div>
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{item.name}</div>
                            {item.slug && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                                <Link size={11} color={C.primary} />
                                <span style={{ fontSize: 11.5, color: C.primary, fontFamily: 'monospace', fontWeight: 600 }}>
                                  /product/{item.slug}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '4px 11px', borderRadius: 20,
                            fontSize: 12, fontWeight: 700,
                            background: C.infoLight, color: C.info,
                            border: `1px solid #BAE6FD`,
                          }}
                        >
                          <Tag size={11} />
                          {item.category?.name ?? <em style={{ fontStyle: 'italic', color: C.gray400 }}>Uncategorized</em>}
                        </span>
                      </td>

                      {/* Price */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: 14.5, fontWeight: 800, color: C.dark }}>{fmtCurrency(item.price)}</span>
                      </td>

                      {/* Stock */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {item.stock_count < 5 && (
                            <span
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                padding: '3px 8px', borderRadius: 20,
                                fontSize: 11.5, fontWeight: 700,
                                background: C.warningLight, color: C.warning,
                                border: `1px solid #FED7AA`,
                              }}
                            >
                              <AlertCircle size={11} /> Low
                            </span>
                          )}
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: item.stock_count < 5 ? C.warning : C.gray700 }}>
                            {item.stock_count} {item.stock_count === 1 ? 'unit' : 'units'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        {item.is_active ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 11px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                            Active
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 11px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: C.gray100, color: C.gray500, border: `1px solid ${C.gray200}` }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.gray400 }} />
                            Hidden
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 7, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenModal(item)}
                            title="Edit"
                            style={{
                              width: 34, height: 34, borderRadius: 9,
                              border: `1px solid #BFDBFE`, background: '#EFF6FF',
                              color: C.info, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = C.info; e.currentTarget.style.color = C.white; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.color = C.info; }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            title="Delete"
                            style={{
                              width: 34, height: 34, borderRadius: 9,
                              border: `1px solid #FECACA`, background: C.errorLight,
                              color: C.error, cursor: deletingId === item.id ? 'not-allowed' : 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => { if (deletingId !== item.id) { e.currentTarget.style.background = C.error; e.currentTarget.style.color = C.white; } }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = C.errorLight; e.currentTarget.style.color = C.error; }}
                          >
                            {deletingId === item.id
                              ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                              : <Trash2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* Footer */}
          {!loading && filteredItems.length > 0 && (
            <div style={{ padding: '11px 18px', borderTop: `1px solid ${C.border}`, fontSize: 12.5, color: C.gray400, fontWeight: 600, background: C.gray50 }}>
              Showing {filteredItems.length} of {items.length} item{items.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {isModalOpen && (
        <ItemModal
          editingItem={editingItem}
          categories={categories}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </DashboardLayout>
  );
};

export default MarketplacePage;
