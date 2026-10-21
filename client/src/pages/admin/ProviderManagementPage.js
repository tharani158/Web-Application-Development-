import React, { useEffect, useState } from 'react';
import { fetchProviders, createProvider, updateProvider, deleteProvider } from '../../services/providerService';
import Spinner from '../../components/Spinner';
import { toast } from 'react-toastify';

function ProviderManagementPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    providerName: '',
    specialization: '',
    email: '',
    phone: '',
    description: '',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const response = await fetchProviders();
        setProviders(response.data);
      } catch (error) {
        toast.error('Unable to load providers');
      } finally {
        setLoading(false);
      }
    };

    loadProviders();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setFormData({ providerName: '', specialization: '', email: '', phone: '', description: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        await updateProvider(editingId, formData);
        toast.success('Provider updated successfully');
      } else {
        await createProvider(formData);
        toast.success('Provider created successfully');
      }
      const response = await fetchProviders();
      setProviders(response.data);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save provider');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (provider) => {
    setEditingId(provider._id);
    setFormData({
      providerName: provider.providerName || '',
      specialization: provider.specialization || '',
      email: provider.email || '',
      phone: provider.phone || '',
      description: provider.description || '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this provider?')) return;
    try {
      await deleteProvider(id);
      setProviders((current) => current.filter((provider) => provider._id !== id));
      toast.success('Provider removed');
    } catch (error) {
      toast.error('Unable to delete provider');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="container py-5">
      <h2>Provider Management</h2>
      <div className="row g-4 mt-4">
        <div className="col-lg-5">
          <div className="card shadow-sm p-4">
            <h5>{editingId ? 'Edit Provider' : 'Add Provider'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input type="text" name="providerName" className="form-control" value={formData.providerName} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Specialization</label>
                <input type="text" name="specialization" className="form-control" value={formData.specialization} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Phone</label>
                <input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-control" rows="3" value={formData.description} onChange={handleChange} />
              </div>
              <button className="btn btn-primary w-100" type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update Provider' : 'Add Provider'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-outline-secondary w-100 mt-2" onClick={resetForm}>
                  Cancel editing
                </button>
              )}
            </form>
          </div>
        </div>
        <div className="col-lg-7">
          <div className="card shadow-sm p-4">
            <h5>Provider List</h5>
            {providers.length === 0 ? (
              <p className="text-muted">No providers found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Specialization</th>
                      <th>Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providers.map((provider) => (
                      <tr key={provider._id}>
                        <td>{provider.providerName}</td>
                        <td>{provider.specialization}</td>
                        <td>{provider.email}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(provider)}>
                            Edit
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(provider._id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProviderManagementPage;
