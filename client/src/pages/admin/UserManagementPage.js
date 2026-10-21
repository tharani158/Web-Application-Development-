import React, { useCallback, useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import Spinner from '../../components/Spinner';
import { toast } from 'react-toastify';

function UserManagementPage() {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [roles, setRoles] = useState({});
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    try {
      const [userResponse, providerResponse] = await Promise.all([api.get('/users'), api.get('/providers')]);
      setUsers(userResponse.data);
      setProviders(providerResponse.data);
      setRoles(Object.fromEntries(userResponse.data.map((item) => [item._id, item.role])));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load users');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const saveRole = async (target) => {
    try {
      await api.put(`/users/${target._id}`, { role: roles[target._id] });
      setUsers((items) => items.map((item) => item._id === target._id ? { ...item, role: roles[target._id] } : item));
      toast.success('User role updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update user role');
      setRoles((items) => ({ ...items, [target._id]: target.role }));
    }
  };

  const deleteUser = async (target) => {
    if (target._id === currentUser?.id) return;
    if (!window.confirm(`Delete the account for ${target.fullName}?`)) return;
    try {
      await api.delete(`/users/${target._id}`);
      setUsers((items) => items.filter((item) => item._id !== target._id));
      toast.success('User deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete user');
    }
  };

  if (loading) return <Spinner />;

  return <main className="container py-5">
    <div className="page-heading"><div className="section-kicker mb-2">Administration</div><h1>User management</h1><p>Manage account access. Provider access is available when a provider profile uses the same email address.</p></div>
    <section className="card p-3 p-lg-4">
      {users.length === 0 ? <p className="mb-0">No user accounts found.</p> : <div className="table-responsive"><table className="table table-hover align-middle mb-0">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
        <tbody>{users.map((item) => {
          const isSelf = item._id === currentUser?.id;
          const hasProvider = providers.some((provider) => provider.email.toLowerCase() === item.email.toLowerCase());
          return <tr key={item._id}>
            <td>{item.fullName}</td><td>{item.email}</td>
            <td><select className="form-select form-select-sm" value={roles[item._id] || item.role} disabled={isSelf} onChange={(event) => setRoles((state) => ({ ...state, [item._id]: event.target.value }))} aria-label={`Role for ${item.fullName}`}>
              <option value="customer">Customer</option>{hasProvider && <option value="provider">Provider</option>}<option value="admin">Admin</option>
            </select></td>
            <td><div className="d-flex gap-2"><button className="btn btn-sm btn-outline-primary" disabled={isSelf || roles[item._id] === item.role} onClick={() => saveRole(item)}>Save role</button><button className="btn btn-sm btn-outline-danger" disabled={isSelf} onClick={() => deleteUser(item)}>Delete</button></div></td>
          </tr>;
        })}</tbody>
      </table></div>}
    </section>
  </main>;
}

export default UserManagementPage;
