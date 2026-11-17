import React, { useState } from 'react';
import styles from './LeadForm.module.css';

const SOURCES = ['website', 'referral', 'social media', 'email campaign', 'cold call', 'event', 'other'];
const STATUSES = ['new', 'contacted', 'converted', 'lost'];

export default function LeadForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    email: initial.email || '',
    phone: initial.phone || '',
    source: initial.source || 'website',
    status: initial.status || 'new',
  });
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) {
      e.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Enter a valid email';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (validate()) onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.field}>
        <label htmlFor="lf-name" className={styles.label}>
          Full Name <span aria-hidden="true">*</span>
        </label>
        <input
          id="lf-name"
          name="name"
          type="text"
          className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
          value={form.name}
          onChange={handleChange}
          autoComplete="name"
          aria-describedby={errors.name ? 'lf-name-err' : undefined}
          aria-required="true"
        />
        {errors.name && (
          <span id="lf-name-err" className={styles.error} role="alert">
            {errors.name}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="lf-email" className={styles.label}>
          Email <span aria-hidden="true">*</span>
        </label>
        <input
          id="lf-email"
          name="email"
          type="email"
          className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          aria-describedby={errors.email ? 'lf-email-err' : undefined}
          aria-required="true"
        />
        {errors.email && (
          <span id="lf-email-err" className={styles.error} role="alert">
            {errors.email}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="lf-phone" className={styles.label}>Phone</label>
        <input
          id="lf-phone"
          name="phone"
          type="tel"
          className={styles.input}
          value={form.phone}
          onChange={handleChange}
          autoComplete="tel"
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="lf-source" className={styles.label}>Source</label>
          <select
            id="lf-source"
            name="source"
            className={styles.select}
            value={form.source}
            onChange={handleChange}
          >
            {SOURCES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="lf-status" className={styles.label}>Status</label>
          <select
            id="lf-status"
            name="status"
            className={styles.select}
            value={form.status}
            onChange={handleChange}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Saving…' : 'Save Lead'}
        </button>
      </div>
    </form>
  );
}
