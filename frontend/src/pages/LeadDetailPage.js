import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import LeadForm from '../components/LeadForm';
import styles from './LeadDetailPage.module.css';

function fetchLead(id) {
  return api.get(`/leads/${id}`).then((r) => r.data);
}

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showEdit, setShowEdit] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [noteError, setNoteError] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => fetchLead(id),
  });

  const updateMutation = useMutation({
    mutationFn: (body) => api.patch(`/leads/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setShowEdit(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/leads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      navigate('/leads');
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: (body) => api.post(`/leads/${id}/notes`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      setNoteText('');
      setFollowUpDate('');
      setNoteError('');
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId) => api.delete(`/notes/${noteId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lead', id] }),
  });

  function handleStatusChange(e) {
    updateMutation.mutate({ status: e.target.value });
  }

  function handleNoteSubmit(e) {
    e.preventDefault();
    if (!noteText.trim()) {
      setNoteError('Note cannot be empty');
      return;
    }
    addNoteMutation.mutate({ content: noteText.trim(), follow_up_date: followUpDate || undefined });
  }

  function handleDelete() {
    if (window.confirm('Delete this lead permanently?')) {
      deleteMutation.mutate();
    }
  }

  if (isLoading) return <div className={styles.loading}>Loading lead…</div>;
  if (error) return <div className={styles.error}>Lead not found.</div>;

  const { lead, notes } = data;

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/leads">Leads</Link>
        <span aria-hidden="true"> / </span>
        <span>{lead.name}</span>
      </nav>

      <div className={styles.grid}>
        {/* Lead card */}
        <section className={styles.card} aria-labelledby="lead-info-heading">
          <div className={styles.cardHeader}>
            <h1 id="lead-info-heading" className={styles.leadName}>{lead.name}</h1>
            <div className={styles.cardActions}>
              <button className={styles.editBtn} onClick={() => setShowEdit(true)}>
                Edit
              </button>
              <button className={styles.deleteBtn} onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>

          <dl className={styles.infoList}>
            <div className={styles.infoRow}>
              <dt>Email</dt>
              <dd><a href={`mailto:${lead.email}`}>{lead.email}</a></dd>
            </div>
            {lead.phone && (
              <div className={styles.infoRow}>
                <dt>Phone</dt>
                <dd><a href={`tel:${lead.phone}`}>{lead.phone}</a></dd>
              </div>
            )}
            <div className={styles.infoRow}>
              <dt>Source</dt>
              <dd className={styles.capitalize}>{lead.source}</dd>
            </div>
            <div className={styles.infoRow}>
              <dt>Created</dt>
              <dd>{new Date(lead.created_at).toLocaleString()}</dd>
            </div>
            {lead.assigned_to_name && (
              <div className={styles.infoRow}>
                <dt>Assigned to</dt>
                <dd>{lead.assigned_to_name}</dd>
              </div>
            )}
          </dl>

          {/* Status changer */}
          <div className={styles.statusSection}>
            <label htmlFor="status-select" className={styles.statusLabel}>
              Status
            </label>
            <div className={styles.statusRow}>
              <StatusBadge status={lead.status} />
              <select
                id="status-select"
                className={styles.statusSelect}
                value={lead.status}
                onChange={handleStatusChange}
                disabled={updateMutation.isPending}
                aria-label="Change lead status"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          </div>
        </section>

        {/* Notes */}
        <section className={styles.notesSection} aria-labelledby="notes-heading">
          <h2 id="notes-heading" className={styles.notesHeading}>
            Notes & Follow-ups
          </h2>

          {/* Add note form */}
          <form onSubmit={handleNoteSubmit} className={styles.noteForm}>
            <textarea
              className={styles.textarea}
              placeholder="Add a note or follow-up…"
              value={noteText}
              onChange={(e) => { setNoteText(e.target.value); setNoteError(''); }}
              rows={3}
              aria-label="Note content"
            />
            {noteError && <span className={styles.noteError} role="alert">{noteError}</span>}
            <div className={styles.noteFormRow}>
              <div className={styles.followUpWrap}>
                <label htmlFor="follow-up-date" className={styles.followUpLabel}>
                  Follow-up date (optional)
                </label>
                <input
                  id="follow-up-date"
                  type="date"
                  className={styles.dateInput}
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className={styles.addNoteBtn}
                disabled={addNoteMutation.isPending}
              >
                {addNoteMutation.isPending ? 'Saving…' : 'Add Note'}
              </button>
            </div>
          </form>

          {/* Notes list */}
          <div className={styles.notesList}>
            {notes.length === 0 && (
              <p className={styles.noNotes}>No notes yet. Add one above.</p>
            )}
            {notes.map((note) => (
              <div key={note.id} className={styles.noteCard}>
                <div className={styles.noteHeader}>
                  <span className={styles.noteAuthor}>{note.author || 'Admin'}</span>
                  <span className={styles.noteDate}>
                    {new Date(note.created_at).toLocaleString()}
                  </span>
                  <button
                    className={styles.noteDelete}
                    onClick={() => deleteNoteMutation.mutate(note.id)}
                    aria-label="Delete note"
                  >
                    ✕
                  </button>
                </div>
                <p className={styles.noteContent}>{note.content}</p>
                {note.follow_up_date && (
                  <div className={styles.followUpTag}>
                    📅 Follow-up: {new Date(note.follow_up_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <Modal title="Edit Lead" onClose={() => setShowEdit(false)}>
          <LeadForm
            initial={lead}
            onSubmit={(body) => updateMutation.mutate(body)}
            onCancel={() => setShowEdit(false)}
            loading={updateMutation.isPending}
          />
          {updateMutation.isError && (
            <p className={styles.mutationError}>
              {updateMutation.error?.response?.data?.error || 'Update failed.'}
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}
