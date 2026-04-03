import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { recordsAPI } from '../services/api';
import { formatCurrency, formatDate, CATEGORIES, truncate } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineXMark,
  HiOutlineBanknotes,
} from 'react-icons/hi2';
import './RecordsPage.css';

const emptyForm = { amount: '', type: 'income', category: '', date: '', description: '' };

const RecordsPage = () => {
  const { hasRole } = useAuth();
  const canCreate = hasRole('analyst', 'admin');
  const canEdit = hasRole('analyst', 'admin');
  const canDelete = hasRole('admin');

  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ type: '', category: '', startDate: '', endDate: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await recordsAPI.getAll(params);
      setRecords(res.data.data.records || []);
      setPagination(res.data.data.pagination || null);
    } catch (err) {
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Search with debounce
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ type: '', category: '', startDate: '', endDate: '' });
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const hasActiveFilters = filters.type || filters.category || filters.startDate || filters.endDate || search;

  // ─── Modal Handlers ──────────────────────
  const openCreateModal = () => {
    setEditingRecord(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setForm({
      amount: record.amount,
      type: record.type,
      category: record.category,
      date: record.date ? record.date.split('T')[0] : '',
      description: record.description || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRecord(null);
    setForm(emptyForm);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.type || !form.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
      };

      if (editingRecord) {
        await recordsAPI.update(editingRecord._id, payload);
        toast.success('Record updated successfully');
      } else {
        await recordsAPI.create(payload);
        toast.success('Record created successfully');
      }
      closeModal();
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete Handlers ──────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await recordsAPI.delete(deleteTarget._id);
      toast.success('Record deleted successfully');
      setDeleteTarget(null);
      fetchRecords();
    } catch (err) {
      toast.error('Failed to delete record');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="records-page">
      {/* Header */}
      <div className="page-header animate-fade-in-up">
        <div>
          <h1 className="page-title">Financial Records</h1>
          <p className="page-subtitle">Manage and track your income & expenses</p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={openCreateModal} id="add-record-btn">
            <HiOutlinePlus size={18} />
            Add Record
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="records-toolbar card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="records-search-row">
          <div className="records-search-wrapper">
            <HiOutlineMagnifyingGlass size={18} className="records-search-icon" />
            <input
              type="text"
              className="form-input records-search-input"
              placeholder="Search by category or description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              id="records-search"
            />
          </div>
          <button
            className={`btn btn-ghost ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <HiOutlineFunnel size={16} />
            Filters
          </button>
          {hasActiveFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
              <HiOutlineXMark size={14} />
              Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="records-filters animate-fade-in">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select name="type" className="form-select" value={filters.type} onChange={handleFilterChange}>
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select name="category" className="form-select" value={filters.category} onChange={handleFilterChange}>
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">From Date</label>
              <input type="date" name="startDate" className="form-input" value={filters.startDate} onChange={handleFilterChange} />
            </div>
            <div className="form-group">
              <label className="form-label">To Date</label>
              <input type="date" name="endDate" className="form-input" value={filters.endDate} onChange={handleFilterChange} />
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card records-table-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        {loading ? (
          <LoadingSpinner text="Loading records..." />
        ) : records.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="data-table" id="records-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Description</th>
                    {(canEdit || canDelete) && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record._id}>
                      <td>{formatDate(record.date)}</td>
                      <td style={{ fontWeight: 600 }}>{record.category}</td>
                      <td>
                        <span className={`badge badge-${record.type}`}>{record.type}</span>
                      </td>
                      <td style={{ fontWeight: 700, color: record.type === 'income' ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                        {record.type === 'income' ? '+' : '-'}{formatCurrency(record.amount)}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', maxWidth: '250px' }}>
                        {truncate(record.description, 60) || '—'}
                      </td>
                      {(canEdit || canDelete) && (
                        <td>
                          <div className="table-actions">
                            {canEdit && (
                              <button
                                className="btn btn-icon btn-ghost btn-sm"
                                onClick={() => openEditModal(record)}
                                title="Edit"
                              >
                                <HiOutlinePencilSquare size={16} />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                className="btn btn-icon btn-ghost btn-sm"
                                onClick={() => setDeleteTarget(record)}
                                title="Delete"
                                style={{ color: 'var(--accent-danger)' }}
                              >
                                <HiOutlineTrash size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
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
            <HiOutlineBanknotes size={48} />
            <p>No records found</p>
            {canCreate && (
              <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
                <HiOutlinePlus size={16} /> Add your first record
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingRecord ? 'Edit Record' : 'Create Record'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingRecord ? 'Update' : 'Create'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="record-form">
          <div className="form-group">
            <label className="form-label">Amount *</label>
            <input
              type="number"
              name="amount"
              className="form-input"
              placeholder="0.00"
              value={form.amount}
              onChange={handleFormChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="record-form-row">
            <div className="form-group">
              <label className="form-label">Type *</label>
              <select name="type" className="form-select" value={form.type} onChange={handleFormChange} required>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select name="category" className="form-select" value={form.category} onChange={handleFormChange} required>
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              name="date"
              className="form-input"
              value={form.date}
              onChange={handleFormChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-input"
              placeholder="Optional description..."
              value={form.description}
              onChange={handleFormChange}
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Record"
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
          Are you sure you want to delete this record?
          {deleteTarget && (
            <span style={{ display: 'block', marginTop: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
              {deleteTarget.category} — {formatCurrency(deleteTarget.amount)}
            </span>
          )}
        </p>
      </Modal>
    </div>
  );
};

export default RecordsPage;
