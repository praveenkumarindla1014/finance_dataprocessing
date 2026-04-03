import React, { useState, useEffect, useCallback } from 'react';
import { usersAPI, authAPI } from '../services/api';
import { formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiOutlineUsers,
} from 'react-icons/hi2';
import './UsersPage.css';

const emptyForm = { name: '', email: '', password: '', role: 'viewer' };

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const res = await usersAPI.getAll(params);
      setUsers(res.data.data.users || []);
      setPagination(res.data.data.pagination || null);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ─── Modal Handlers ──────────────────
  const openCreateModal = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    setForm(emptyForm);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (editingUser) {
      // Update user (role/status/name)
      setSaving(true);
      try {
        const payload = {};
        if (form.name !== editingUser.name) payload.name = form.name;
        if (form.role !== editingUser.role) payload.role = form.role;
        if (form.status !== editingUser.status) payload.status = form.status;

        await usersAPI.update(editingUser._id, payload);
        toast.success('User updated successfully');
        closeModal();
        fetchUsers();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to update user');
      } finally {
        setSaving(false);
      }
    } else {
      // Create user via register endpoint
      if (!form.name || !form.email || !form.password) {
        toast.error('Please fill in all required fields');
        return;
      }
      setSaving(true);
      try {
        await authAPI.register({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        });
        toast.success('User created successfully');
        closeModal();
        fetchUsers();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to create user');
      } finally {
        setSaving(false);
      }
    }
  };

  // ─── Delete Handler ──────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await usersAPI.delete(deleteTarget._id);
      toast.success('User deleted successfully');
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  // ─── Toggle Status ──────────────────
  const toggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await usersAPI.update(user._id, { status: newStatus });
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="users-page">
      {/* Header */}
      <div className="page-header animate-fade-in-up">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Create, update, and manage user accounts</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal} id="add-user-btn">
          <HiOutlinePlus size={18} />
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="card users-toolbar animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="records-search-wrapper">
          <HiOutlineMagnifyingGlass size={18} className="records-search-icon" />
          <input
            type="text"
            className="form-input records-search-input"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            id="users-search"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card users-table-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        {loading ? (
          <LoadingSpinner text="Loading users..." />
        ) : users.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="data-table" id="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="user-name-cell">
                          <div className="user-avatar-sm">
                            {u.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <span style={{ fontWeight: 600 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td>
                        <span className={`badge badge-${u.role}`}>{u.role}</span>
                      </td>
                      <td>
                        <button
                          className={`status-toggle badge badge-${u.status}`}
                          onClick={() => toggleStatus(u)}
                          title={`Click to ${u.status === 'active' ? 'deactivate' : 'activate'}`}
                        >
                          {u.status}
                        </button>
                      </td>
                      <td style={{ color: 'var(--text-tertiary)' }}>{formatDate(u.createdAt)}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn btn-icon btn-ghost btn-sm"
                            onClick={() => openEditModal(u)}
                            title="Edit"
                          >
                            <HiOutlinePencilSquare size={16} />
                          </button>
                          <button
                            className="btn btn-icon btn-ghost btn-sm"
                            onClick={() => setDeleteTarget(u)}
                            title="Delete"
                            style={{ color: 'var(--accent-danger)' }}
                          >
                            <HiOutlineTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '0 20px' }}>
              <Pagination pagination={pagination} onPageChange={setPage} />
            </div>
          </>
        ) : (
          <div className="empty-state">
            <HiOutlineUsers size={48} />
            <p>No users found</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingUser ? 'Edit User' : 'Create User'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingUser ? 'Update' : 'Create'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="record-form">
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="Full name"
              value={form.name}
              onChange={handleFormChange}
              required
            />
          </div>

          {!editingUser && (
            <>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="user@example.com"
                  value={form.email}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleFormChange}
                  minLength={6}
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Role</label>
            <select name="role" className="form-select" value={form.role} onChange={handleFormChange}>
              <option value="viewer">Viewer</option>
              <option value="analyst">Analyst</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {editingUser && (
            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" className="form-select" value={form.status} onChange={handleFormChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete User"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Are you sure you want to permanently delete this user? This action cannot be undone.
          {deleteTarget && (
            <span style={{ display: 'block', marginTop: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
              {deleteTarget.name} ({deleteTarget.email})
            </span>
          )}
        </p>
      </Modal>
    </div>
  );
};

export default UsersPage;
