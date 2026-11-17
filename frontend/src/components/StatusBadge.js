import React from 'react';
import styles from './StatusBadge.module.css';

const MAP = {
  new:       { label: 'New',       cls: 'new' },
  contacted: { label: 'Contacted', cls: 'contacted' },
  converted: { label: 'Converted', cls: 'converted' },
  lost:      { label: 'Lost',      cls: 'lost' },
};

export default function StatusBadge({ status }) {
  const { label, cls } = MAP[status] || { label: status, cls: 'new' };
  return (
    <span className={`${styles.badge} ${styles[cls]}`}>{label}</span>
  );
}
