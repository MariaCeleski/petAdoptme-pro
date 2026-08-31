'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardHeader from '../DashboardHeader/DashboardHeader';
import DashboardSidebar from '../DashboardSidebar/DashboardSidebar';
import styles from './DashboardLayout.module.css';
import { clsx } from 'clsx';

/**
 * DashboardLayout - Main layout wrapper for dashboard pages
 * Includes header, sidebar, and responsive handling
 */
export default function DashboardLayout({ children, className }) {
  const { status, data: session } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle authentication and redirects
  useEffect(() => {
    setIsHydrated(true);
    
    // Redirect to signin if not authenticated (only on client side)
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading' || !isHydrated) {
    return (
      <div className={styles.layoutContainer}>
        <div className={styles.loadingPlaceholder}>
          <div className={styles.spinner} />
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null; // Will redirect on client side
  }

  return (
    <div className={clsx(styles.layoutContainer, className)}>
      {/* Header */}
      <DashboardHeader />

      <div className={styles.mainContent}>
        {/* Sidebar - hidden on mobile */}
        <aside className={clsx(styles.sidebarWrapper, { [styles.open]: sidebarOpen })}>
          <DashboardSidebar userType={session.user.type} />
        </aside>

        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div
            className={styles.sidebarOverlay}
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main content area */}
        <main className={styles.content}>
          <div className={styles.contentInner}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
