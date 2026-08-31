'use client';

import styles from './ShelterStats.module.css';

/**
 * ShelterStats Component
 * Displays shelter statistics
 * Requirements: 11.5 (display shelter statistics)
 */
export function ShelterStats({ stats }) {
  if (!stats) {
    return (
      <div className={styles.statsGrid}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className={styles.statCard + ' ' + styles.loading} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <div className={styles.statIcon} style={{ background: '#dbeafe' }}>
          <svg fill="#0284c7" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          </svg>
        </div>
        <div className={styles.statContent}>
          <p className={styles.statLabel}>Pets Cadastrados</p>
          <p className={styles.statValue}>
            {stats.petStats?.total || 0}
          </p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon} style={{ background: '#dcfce7' }}>
          <svg fill="#16a34a" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
        <div className={styles.statContent}>
          <p className={styles.statLabel}>Pets Disponíveis</p>
          <p className={styles.statValue}>
            {stats.petStats?.available || 0}
          </p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon} style={{ background: '#fce7f3' }}>
          <svg fill="#ec4899" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        <div className={styles.statContent}>
          <p className={styles.statLabel}>Pets Adotados</p>
          <p className={styles.statValue}>
            {stats.petStats?.adopted || 0}
          </p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon} style={{ background: '#fef08a' }}>
          <svg fill="#ca8a04" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
          </svg>
        </div>
        <div className={styles.statContent}>
          <p className={styles.statLabel}>Taxa de Adoção</p>
          <p className={styles.statValue}>
            {stats.petStats?.adoptionRate || 0}%
          </p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon} style={{ background: '#e0e7ff' }}>
          <svg fill="#6366f1" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
          </svg>
        </div>
        <div className={styles.statContent}>
          <p className={styles.statLabel}>Solicitações Pendentes</p>
          <p className={styles.statValue}>
            {stats.adoptionStats?.pendingRequests || 0}
          </p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon} style={{ background: '#fae8ff' }}>
          <svg fill="#9333ea" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-13h4v6h-4z" />
          </svg>
        </div>
        <div className={styles.statContent}>
          <p className={styles.statLabel}>Taxa de Sucesso</p>
          <p className={styles.statValue}>
            {stats.adoptionStats?.successRate || 0}%
          </p>
        </div>
      </div>
    </div>
  );
}
