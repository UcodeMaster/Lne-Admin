import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../layout/DashboardLayout';
import client from '../api/client';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Zap,
  Battery,
  Shield,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Box,
  Layers
} from 'lucide-react';

const CATEGORIES = {
  basic: 'Basic Package',
  regular: 'Regular Package',
  exclusive: 'Exclusive Package',
};

const SolarPackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    voltage: '',
    category: 'basic',
    price: '',
    original_price: '',
    description: '',
    warranty: '',
    installation_time: '',
    is_popular: false,
    stock_count: 5,
    powers: [],
    components: []
  });

  const [newPower, setNewPower] = useState('');
  const [tempCompItems, setTempCompItems] = useState({});

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await client('/products'); // Use public endpoint since it includes components
      setPackages(data);
    } catch (err) {
      setError('Failed to load solar packages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleOpenModal = (pkg = null) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        name: pkg.name,
        capacity: pkg.capacity,
        voltage: pkg.voltage,
        category: pkg.category,
        price: pkg.price,
        original_price: pkg.original_price || '',
        description: pkg.description,
        warranty: pkg.warranty,
        installation_time: pkg.installation_time,
        is_popular: pkg.is_popular,
        stock_count: pkg.stock_count,
        powers: pkg.powers || [],
        components: pkg.components || []
      });
    } else {
      setEditingPackage(null);
      setFormData({
        name: '',
        capacity: '',
        voltage: '',
        category: 'basic',
        price: '',
        original_price: '',
        description: '',
        warranty: '2 Years',
        installation_time: '1-2 Days',
        is_popular: false,
        stock_count: 5,
        powers: [],
        components: [
          { type: 'Inverter', items: [] },
          { type: 'Battery', items: [] },
          { type: 'Solar Panels', items: [] }
        ]
      });
    }
    setNewPower('');
    setTempCompItems({});
    setIsModalOpen(true);
  };

  const handleAddPower = () => {
    if (newPower.trim()) {
      setFormData({
        ...formData,
        powers: [...formData.powers, newPower.trim()]
      });
      setNewPower('');
    }
  };

  const handleRemovePower = (index) => {
    const updatedPowers = [...formData.powers];
    updatedPowers.splice(index, 1);
    setFormData({ ...formData, powers: updatedPowers });
  };

  const handleAddComponent = () => {
    setFormData({
      ...formData,
      components: [...formData.components, { type: '', items: [] }]
    });
  };

  const handleRemoveComponent = (index) => {
    const updatedComponents = [...formData.components];
    updatedComponents.splice(index, 1);
    setFormData({ ...formData, components: updatedComponents });
  };

  const handleComponentTypeChange = (index, value) => {
    const updatedComponents = [...formData.components];
    updatedComponents[index].type = value;
    setFormData({ ...formData, components: updatedComponents });
  };

  const handleAddComponentItem = (compIndex) => {
    const itemText = tempCompItems[compIndex];
    if (itemText?.trim()) {
      const updatedComponents = [...formData.components];
      updatedComponents[compIndex].items = [...updatedComponents[compIndex].items, itemText.trim()];
      setFormData({ ...formData, components: updatedComponents });
      setTempCompItems({ ...tempCompItems, [compIndex]: '' });
    }
  };

  const handleRemoveComponentItem = (compIndex, itemIndex) => {
    const updatedComponents = [...formData.components];
    const updatedItems = [...updatedComponents[compIndex].items];
    updatedItems.splice(itemIndex, 1);
    updatedComponents[compIndex].items = updatedItems;
    setFormData({ ...formData, components: updatedComponents });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingPackage ? 'Updating package...' : 'Creating package...');
    
    // Prepare data (convert strings to numbers)
    const payload = {
      ...formData,
      price: Number(formData.price),
      original_price: formData.original_price ? Number(formData.original_price) : null,
      stock_count: Number(formData.stock_count),
    };

    try {
      if (editingPackage) {
        await client(`/admin/products/${editingPackage.id}`, {
          method: 'PATCH',
          body: payload
        });
        toast.success('Package updated successfully', { id: loadingToast });
      } else {
        await client('/admin/products', {
          body: payload
        });
        toast.success('Package created successfully', { id: loadingToast });
      }
      handleCloseModal();
      fetchPackages();
    } catch (err) {
      const errorMessage = err.errors 
        ? Object.values(err.errors).flat()[0] 
        : (err.message || 'Failed to save package');
      toast.error(errorMessage, { id: loadingToast });
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this solar package?')) {
      const loadingToast = toast.loading('Deleting package...');
      try {
        await client(`/admin/products/${id}`, { method: 'DELETE' });
        toast.success('Package deleted successfully', { id: loadingToast });
        fetchPackages();
      } catch (err) {
        toast.error('Failed to delete package', { id: loadingToast });
      }
    }
  };

  const filteredPackages = packages.filter(pkg => 
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.capacity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Solar Packages Management</h2>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>Manage main solar systems (Outright & BNPL options)</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            backgroundColor: '#00A859',
            color: '#fff',
            border: 'none',
            padding: '0.8rem 1.2rem',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          <Plus size={20} />
          Create New Package
        </button>
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
          <input 
            type="text" 
            placeholder="Search by name or capacity (e.g. 5KVA)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '0.8rem 1rem 0.8rem 3rem', 
              borderRadius: '8px', 
              border: '1px solid #ddd',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#FFEBEA', color: '#FF3B30', borderRadius: '8px', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading solar packages...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {Object.entries(CATEGORIES).map(([key, label]) => {
            const categoryPackages = filteredPackages.filter(pkg => pkg.category === key);
            if (categoryPackages.length === 0 && !searchTerm) return null;

            return (
              <div key={key}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem', 
                  marginBottom: '1.5rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '2px solid #eee'
                }}>
                  <h3 style={{ margin: 0, color: '#333', fontSize: '1.4rem' }}>{label}s</h3>
                  <span style={{ 
                    backgroundColor: '#eee', 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '12px', 
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    color: '#666'
                  }}>
                    {categoryPackages.length}
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                  {categoryPackages.map(pkg => (
                    <div key={pkg.id} style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #eee', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                      <div style={{ padding: '1.5rem', borderBottom: '1px solid #f5f5f5', backgroundColor: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: pkg.category === 'exclusive' ? '#5856D622' : '#00A85922', color: pkg.category === 'exclusive' ? '#5856D6' : '#00A859' }}>
                              {label}
                            </span>
                            {pkg.is_popular && <span style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#FF9500' }}><Star size={12} fill="#FF9500" /> Popular</span>}
                          </div>
                          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{pkg.name}</h3>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleOpenModal(pkg)} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer', color: '#007AFF' }}>
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(pkg.id)} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer', color: '#FF3B30' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div style={{ padding: '1.5rem', flex: 1 }}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                          <div style={{ flex: 1, padding: '0.8rem', backgroundColor: '#f9f9f9', borderRadius: '10px', textAlign: 'center' }}>
                            <Zap size={18} color="#00A859" style={{ marginBottom: '0.3rem' }} />
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>Capacity</div>
                            <div style={{ fontWeight: 'bold' }}>{pkg.capacity}</div>
                          </div>
                          <div style={{ flex: 1, padding: '0.8rem', backgroundColor: '#f9f9f9', borderRadius: '10px', textAlign: 'center' }}>
                            <Battery size={18} color="#007AFF" style={{ marginBottom: '0.3rem' }} />
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>Voltage</div>
                            <div style={{ fontWeight: 'bold' }}>{pkg.voltage}</div>
                          </div>
                          <div style={{ flex: 1, padding: '0.8rem', backgroundColor: '#f9f9f9', borderRadius: '10px', textAlign: 'center' }}>
                            <Shield size={18} color="#5856D6" style={{ marginBottom: '0.3rem' }} />
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>Warranty</div>
                            <div style={{ fontWeight: 'bold' }}>{pkg.warranty}</div>
                          </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Zap size={16} color="#FFB800" />
                          <span style={{ fontSize: '0.9rem', color: '#555' }}>Powers <strong>{pkg.powers?.length || 0}</strong> appliances</span>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#00A859' }}>{formatCurrency(pkg.price)}</div>
                          {pkg.original_price && <div style={{ fontSize: '0.9rem', color: '#888', textDecoration: 'line-through' }}>{formatCurrency(pkg.original_price)}</div>}
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#333', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Layers size={14} /> Components:
                          </h4>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {pkg.components?.map((comp, idx) => (
                              <div key={idx} style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', backgroundColor: '#eee', borderRadius: '4px', color: '#555' }}>
                                <strong>{comp.type}:</strong> {comp.items?.length || 0} items
                              </div>
                            ))}
                            {(!pkg.components || pkg.components.length === 0) && <span style={{ color: '#888', fontSize: '0.8rem' }}>No components listed</span>}
                          </div>
                        </div>
                      </div>

                      <div style={{ padding: '1rem 1.5rem', backgroundColor: '#fcfcfc', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {pkg.stock_count < 2 ? <AlertCircle size={14} color="#FF9500" /> : <CheckCircle size={14} color="#00A859" />}
                          <span style={{ fontSize: '0.85rem', color: pkg.stock_count < 2 ? '#FF9500' : '#666' }}>
                            {pkg.stock_count} Available
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#888' }}>
                          Setup: {pkg.installation_time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {categoryPackages.length === 0 && searchTerm && (
                  <p style={{ color: '#888', fontStyle: 'italic' }}>No packages found in this category.</p>
                )}
              </div>
            );
          })}

          {filteredPackages.length === 0 && searchTerm && (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px dashed #ddd' }}>
              <p style={{ color: '#666', fontSize: '1.1rem' }}>No solar packages match your search "{searchTerm}"</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, overflowY: 'auto', padding: '2rem 0' }}>
          <div style={{ backgroundColor: '#fff', padding: '2.5rem', borderRadius: '16px', width: '100%', maxWidth: '800px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{editingPackage ? 'Update Solar Package' : 'Create Solar Package'}</h3>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><XCircle size={24} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Package Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. 5KVA Hybrid Package"
                    style={{ width: '100%', padding: '0.9rem', borderRadius: '8px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Capacity</label>
                  <input 
                    type="text" 
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    placeholder="e.g. 5KVA"
                    style={{ width: '100%', padding: '0.9rem', borderRadius: '8px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Voltage</label>
                  <input 
                    type="text" 
                    required
                    value={formData.voltage}
                    onChange={(e) => setFormData({...formData, voltage: e.target.value})}
                    placeholder="e.g. 48V"
                    style={{ width: '100%', padding: '0.9rem', borderRadius: '8px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    style={{ width: '100%', padding: '0.9rem', borderRadius: '8px', border: '1px solid #ddd' }}
                  >
                    <option value="basic">Basic Package</option>
                    <option value="regular">Regular Package</option>
                    <option value="exclusive">Exclusive Package</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Warranty</label>
                  <input 
                    type="text" 
                    required
                    value={formData.warranty}
                    onChange={(e) => setFormData({...formData, warranty: e.target.value})}
                    style={{ width: '100%', padding: '0.9rem', borderRadius: '8px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Price (₦)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    style={{ width: '100%', padding: '0.9rem', borderRadius: '8px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Original Price (₦ - optional)</label>
                  <input 
                    type="number" 
                    value={formData.original_price}
                    onChange={(e) => setFormData({...formData, original_price: e.target.value})}
                    style={{ width: '100%', padding: '0.9rem', borderRadius: '8px', border: '1px solid #ddd' }}
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Description</label>
                <textarea 
                  required
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  style={{ width: '100%', padding: '0.9rem', borderRadius: '8px', border: '1px solid #ddd', resize: 'none' }}
                ></textarea>
              </div>

              {/* Appliances Section */}
              <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f9f9f9', borderRadius: '12px' }}>
                <label style={{ marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={18} color="#FFB800" /> What it can power (Appliances)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <input 
                    type="text" 
                    value={newPower}
                    onChange={(e) => setNewPower(e.target.value)}
                    placeholder="e.g. 4 Energy Bulbs"
                    style={{ flex: 1, padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd' }}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPower())}
                  />
                  <button 
                    type="button" 
                    onClick={handleAddPower}
                    style={{ padding: '0 1.2rem', backgroundColor: '#007AFF', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Add
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {formData.powers.map((power, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '20px', fontSize: '0.85rem' }}>
                      <span>{power}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemovePower(idx)}
                        style={{ background: 'none', border: 'none', color: '#FF3B30', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  ))}
                  {formData.powers.length === 0 && (
                    <span style={{ fontSize: '0.85rem', color: '#888' }}>No appliances added yet.</span>
                  )}
                </div>
              </div>

              {/* Components Section */}
              <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f0f7ff', borderRadius: '12px', border: '1px solid #e0eefb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Box size={18} color="#007AFF" /> Package Components
                  </label>
                  <button 
                    type="button" 
                    onClick={handleAddComponent}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', backgroundColor: '#fff', border: '1px solid #007AFF', color: '#007AFF', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    + Add Category
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {formData.components.map((comp, compIdx) => (
                    <div key={compIdx} style={{ backgroundColor: '#fff', padding: '1.2rem', borderRadius: '10px', border: '1px solid #d0e5f9' }}>
                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 'bold', color: '#666' }}>Component Type</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Inverter, Battery..."
                            value={comp.type}
                            onChange={(e) => handleComponentTypeChange(compIdx, e.target.value)}
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveComponent(compIdx)}
                          style={{ marginTop: '1.6rem', background: 'none', border: 'none', color: '#FF3B30', cursor: 'pointer' }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div style={{ paddingLeft: '1rem', borderLeft: '2px solid #f0f0f0' }}>
                        <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.75rem', fontWeight: 'bold', color: '#666' }}>Items in this component</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
                          <input 
                            type="text" 
                            placeholder="e.g. 1 x 5KVA Hybrid Inverter"
                            value={tempCompItems[compIdx] || ''}
                            onChange={(e) => setTempCompItems({ ...tempCompItems, [compIdx]: e.target.value })}
                            style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #eee', fontSize: '0.85rem' }}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddComponentItem(compIdx))}
                          />
                          <button 
                            type="button" 
                            onClick={() => handleAddComponentItem(compIdx)}
                            style={{ padding: '0 0.8rem', backgroundColor: '#00A859', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                          >
                            Add Item
                          </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {comp.items.map((item, itemIdx) => (
                            <div key={itemIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.6rem', backgroundColor: '#f9f9f9', border: '1px solid #eee', borderRadius: '4px', fontSize: '0.8rem' }}>
                              <span>{item}</span>
                              <button 
                                type="button" 
                                onClick={() => handleRemoveComponentItem(compIdx, itemIdx)}
                                style={{ background: 'none', border: 'none', color: '#FF3B30', cursor: 'pointer', padding: 0 }}
                              >
                                <XCircle size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Install Time</label>
                  <input 
                    type="text" 
                    required
                    value={formData.installation_time}
                    onChange={(e) => setFormData({...formData, installation_time: e.target.value})}
                    style={{ width: '100%', padding: '0.9rem', borderRadius: '8px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Inventory Count</label>
                  <input 
                    type="number" 
                    required
                    value={formData.stock_count}
                    onChange={(e) => setFormData({...formData, stock_count: e.target.value})}
                    style={{ width: '100%', padding: '0.9rem', borderRadius: '8px', border: '1px solid #ddd' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input 
                    type="checkbox" 
                    id="is_popular"
                    checked={formData.is_popular}
                    onChange={(e) => setFormData({...formData, is_popular: e.target.checked})}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <label htmlFor="is_popular" style={{ fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer' }}>Feature as Popular</label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  style={{ padding: '0.9rem 2rem', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '600' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '0.9rem 2.5rem', borderRadius: '8px', border: 'none', backgroundColor: '#00A859', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {editingPackage ? 'Save Changes' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SolarPackagesPage;
