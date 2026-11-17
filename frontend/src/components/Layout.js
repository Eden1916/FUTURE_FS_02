import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.css';

export default function Layout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${menuOpen ? styles.open : ''}`}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>📋</span>
          <span className={styles.brandName}>CRM</span>
        </div>
        <nav className={styles.nav} aria-label="Main navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
            onClick={() => setMenuOpen(false)}
          >
            <span aria-hidden="true">📊</span> Dashboard
          </NavLink>
          <NavLink
            to="/leads"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
            onClick={() => setMenuOpen(false)}
          >
            <span aria-hidden="true">👥</span> Leads
          </NavLink>
        </nav>
        <div className={styles.adminBar}>
          <span className={styles.adminName}>{admin?.name}</span>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.mobileHeader}>
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            ☰
          </button>
          <span className={styles.brandName}>CRM</span>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>

      {menuOpen && (
        <div
          className={styles.overlay}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
