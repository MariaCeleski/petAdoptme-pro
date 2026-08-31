'use client';

import Link from 'next/link';
import styles from './PageNavigation.module.css';

export default function PageNavigation({ previousPage, nextPage }) {
  return (
    <nav className={styles.pageNavigation}>
      <div className={styles.navContainer}>
        {previousPage ? (
          <Link href={previousPage.href} className={styles.navButton}>
            <span className={styles.arrow}>←</span>
            <span className={styles.label}>{previousPage.label}</span>
          </Link>
        ) : (
          <div className={styles.navButtonEmpty}></div>
        )}

        {nextPage ? (
          <Link href={nextPage.href} className={styles.navButton}>
            <span className={styles.label}>{nextPage.label}</span>
            <span className={styles.arrow}>→</span>
          </Link>
        ) : (
          <div className={styles.navButtonEmpty}></div>
        )}
      </div>
    </nav>
  );
}
