'use client';

import { useSession } from 'next-auth/react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Navigation from '@/components/common/Navigation';
import Sidebar from '@/components/common/Sidebar';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { useState, useEffect } from 'react';
import styles from './Layout.module.css';

export default function Layout({ 
  children, 
  title,
  breadcrumbs = [],
  showNavigation = true,
  showBreadcrumbs = false,
  className = '' 
}) {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Evitar problemas de hidratação
  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className={`${styles.layout} ${className}`}>
      {/* Header com Navigation integrado */}
      <Header 
        session={session} 
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />
      
      {/* Navigation responsivo - apenas desktop */}
      {showNavigation && (
        <Navigation 
          session={session}
          className={styles.navigation}
        />
      )}

      {/* Sidebar mobile - só renderizar após hidratar */}
      {isClient && (
        <Sidebar 
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          session={session}
        />
      )}

      {/* Main content area */}
      <main className={styles.main}>
        <div className={styles.contentWrapper}>
          {/* Breadcrumbs */}
          {showBreadcrumbs && breadcrumbs.length > 0 && (
            <div className={styles.breadcrumbsWrapper}>
              <div className="container">
                <Breadcrumbs items={breadcrumbs} />
              </div>
            </div>
          )}

          {/* Page title */}
          {title && (
            <div className={styles.titleWrapper}>
              <div className="container">
                <h1 className={styles.pageTitle}>{title}</h1>
              </div>
            </div>
          )}

          {/* Content */}
          <div className={styles.content}>
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Overlay para mobile quando sidebar está aberto - só renderizar após hidratar */}
      {isClient && isSidebarOpen && (
        <div 
          className={styles.overlay}
          onClick={closeSidebar}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              closeSidebar();
            }
          }}
          aria-label="Fechar menu lateral"
        />
      )}
    </div>
  );
}