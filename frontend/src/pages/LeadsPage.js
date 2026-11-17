import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import LeadForm from '../components/LeadForm';
import styles from './LeadsPage.module.css';

const STATUSES = ['', 'new', 'contacted', 'converted', 'lost'];

function fetchLeads(params) {
  return api.get('/leads', { params }).then((r) => r.data);
}

export default function LeadsPage() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({ status: '', search: '', page: 1 });
  const [showAdd, setShowAdd] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['leads', filters],
    queryFn: () => fetchLeads({ ...filters, limit: 15 }),
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: (body) => api.post('/leads', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setShowAdd(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/leads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  function handleFilterChange(e) {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value, page: 1 }));
  }

  function handleDelete(lead) {
    if (window.confirm(`Delete lead "${lead.name}"? This cannot be undone.`)) {
      deleteMutation.mutate(lead.id);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.heading}>Leads</h1>
        <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
          + Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          type="search"
          name="search"
          className={styles.search}
          placeholder="Search by name or email…"
          value={filters.search}
          onChange={handleFilterChange}
          aria-label="Search leads"
        />
        <select
          name="status"
          className={styles.select}
          value={filters.status}
          onChange={handleFilterChange}
          aria-label="Filter by status"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses'}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        {isLoading ? (
          <div className={styles.loading}>Loading leads…</div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <Link to={`/leads/${lead.id}`} className={styles.nameLink}>
                        {lead.name}
                      </Link>
                    </td>
                    <td>{lead.email}</td>
                    <td>{lead.phone || '—'}</td>
                    <td className={styles.capitalize}>{lead.source}</td>
                    <td><StatusBadge status={lead.status} /></td>
                    <td>{new Date(lead.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className={styles.actions}>
                        <Link to={`/leads/${lead.id}`} className={styles.editBtn}>
                          Edit
                        </Link>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(lead)}
                          aria-label={`Delete ${lead.name}`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data?.data.length === 0 && (
                  <tr>
                    <td colSpan={7} className={styles.empty}>
                      No leads found. Try adjusting your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {data?.pages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  disabled={filters.page <= 1}
                  onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                >
                  ← Prev
                </button>
                <span className={styles.pageInfo}>
                  Page {data.page} of {data.pages}
                </span>
                <button
                  className={styles.pageBtn}
                  disabled={filters.page >= data.pages}
                  onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Lead Modal */}
      {showAdd && (
        <Modal title="Add New Lead" onClose={() => setShowAdd(false)}>
          <LeadForm
            onSubmit={(body) => createMutation.mutate(body)}
            onCancel={() => setShowAdd(false)}
            loading={createMutation.isPending}
          />
          {createMutation.isError && (
            <p className={styles.mutationError}>
              {createMutation.error?.response?.data?.error || 'Failed to create lead.'}
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}
