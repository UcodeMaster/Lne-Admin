import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../layout/DashboardLayout';
import client from '../api/client';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Layers,
  ChevronRight,
  Folder
} from 'lucide-react';

const MarketplaceCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parent_id: '',
    description: '',
    icon: ''
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await client('/admin/marketplace/categories');
      setCategories(data);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        parent_id: category.parent_id || '',
        description: category.description || '',
        icon: category.icon || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        parent_id: '',
        description: '',
        icon: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingCategory ? 'Updating category...' : 'Creating category...');
    try {
      if (editingCategory) {
        await client(`/admin/marketplace/categories/${editingCategory.id}`, {
          method: 'PATCH',
          body: formData
        });
        toast.success('Category updated successfully', { id: loadingToast });
      } else {
        await client('/admin/marketplace/categories', {
          body: formData
        });
        toast.success('Category created successfully', { id: loadingToast });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      const msg = err.errors ? Object.values(err.errors).flat()[0] : (err.message || 'Error saving category');
      toast.error(msg, { id: loadingToast });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this category? Sub-categories and items will be affected.')) {
      const loadingToast = toast.loading('Deleting...');
      try {
        await client(`/admin/marketplace/categories/${id}`, { method: 'DELETE' });
        toast.success('Deleted successfully', { id: loadingToast });
        fetchCategories();
      } catch (err) {
        toast.error('Failed to delete', { id: loadingToast });
      }
    }
  };

  // Filter logic
  const filtered = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by hierarchy
  const parentCategories = categories.filter(c => !c.parent_id);

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Marketplace Categories</h2>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>Manage hierarchical groupings for accessories</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#00A859', color: '#fff', border: 'none', padding: '0.8rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          <Plus size={20} /> Add Category
        </button>
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
          <input 
            type="text" 
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '8px', border: '1px solid #ddd' }}
          />
        </div>
      </div>

      {loading ? <p>Loading...</p> : (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9f9f9', textAlign: 'left' }}>
              <tr>
                <th style={{ padding: '1rem' }}>Category Name</th>
                <th style={{ padding: '1rem' }}>Slug</th>
                <th style={{ padding: '1rem' }}>Parent</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(cat => (
                <tr key={cat.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {cat.parent_id ? <ChevronRight size={16} color="#888" /> : <Folder size={18} color="#00A859" />}
                      <span style={{ fontWeight: cat.parent_id ? 'normal' : 'bold' }}>{cat.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}><code>/{cat.slug}</code></td>
                  <td style={{ padding: '1rem' }}>{cat.parent?.name || <span style={{ color: '#ccc' }}>None (Root)</span>}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => handleOpenModal(cat)} style={{ background: 'none', border: 'none', color: '#007AFF', cursor: 'pointer', marginRight: '1rem' }}>
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} style={{ background: 'none', border: 'none', color: '#FF3B30', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '450px' }}>
            <h3>{editingCategory ? 'Edit Category' : 'New Category'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Parent Category (Optional)</label>
                <select 
                  value={formData.parent_id} 
                  onChange={(e) => setFormData({...formData, parent_id: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd' }}
                >
                  <option value="">None (Root Category)</option>
                  {parentCategories.filter(c => c.id !== editingCategory?.id).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Description</label>
                <textarea rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', background: '#00A859', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MarketplaceCategoriesPage;
