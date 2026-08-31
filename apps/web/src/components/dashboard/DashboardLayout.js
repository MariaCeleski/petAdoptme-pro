import styles from './DashboardLayout.module.css';

/**
 * DashboardLayout Component
 * Wraps dashboard pages with navigation and layout structure
 */
export function DashboardLayout({ children }) {
  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
