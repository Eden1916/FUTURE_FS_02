import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import styles from './DashboardPage.module.css';

function fetchStats() {
  return api.get('/stats').then((r) => r.data);
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
  });

  if (isLoading) return <div className={styles.loading}>Loading dashboard…</div>;
  if (error) return <div className={styles.error}>Failed to load stats.</div>;

  const statusColors = {
    new: '#3b82f6',
    contacted: '#f59e0b',
    converted: '#22c55e',
    lost: '#ef4444',
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Dashboard</h1>

      {/* Summary cards */}
      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardValue}>{data.total}</div>
          <div className={styles.cardLabel}>Total Leads</div>
        </div>
        {data.byStatus.map((s) => (
          <div
            key={s.status}
            className={styles.card}
            style={{ borderTop: `4px solid ${statusColors[s.status] || '#6b7280'}` }}
          >
            <div className={styles.cardValue}>{s.count}</div>
            <div className={styles.cardLabel} style={{ textTransform: 'capitalize' }}>
              {s.status}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        {/* Recent Leads */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Leads</h2>
            <Link to="/leads" className={styles.viewAll}>View all →</Link>
          </div>
          <div className={styles.table}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <Link to={`/leads/${lead.id}`} className={styles.leadLink}>
                        {lead.name}
                      </Link>
                    </td>
                    <td className={styles.email}>{lead.email}</td>
                    <td><StatusBadge status={lead.status} /></td>
                  </tr>
                ))}
                {data.recentLeads.length === 0 && (
                  <tr>
                    <td colSpan={3} className={styles.empty}>No leads yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Top Sources */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Lead Sources</h2>
          </div>
          <div className={styles.sourceList}>
            {data.bySource.map((s) => {
              const pct = data.total > 0 ? Math.round((s.count / data.total) * 100) : 0;
              return (
                <div key={s.source} className={styles.sourceRow}>
                  <span className={styles.sourceName}>{s.source}</span>
                  <div className={styles.bar}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${pct}%` }}
                      aria-label={`${pct}%`}
                    />
                  </div>
                  <span className={styles.sourceCount}>{s.count}</span>
                </div>
              );
            })}
            {data.bySource.length === 0 && (
              <p className={styles.empty}>No data yet</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
