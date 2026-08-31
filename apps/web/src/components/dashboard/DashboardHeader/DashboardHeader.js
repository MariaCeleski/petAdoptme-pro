'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import styles from './DashboardHeader.module.css';
import { clsx } from 'clsx';
import { useState } from 'react';

/**
 * DashboardHeader - Header component for dashboard
 * Shows user info, notifications, and quick actions
 */
export default function DashboardHeader({ className }) {
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  const userTypeLabel = {
    'ADOPTER': 'Adotante',
    'INDIVIDUAL_OWNER': 'Tutor Individual',
    'SHELTER_ADMIN': 'Abrigo',
  };

  return (
    <header className={clsx(styles.header, className)}>
      <div className={styles.container}>
        {/* Logo/Title */}
        <Link href="/dashboard" className={styles.brand}>
          <span className={styles.brandEmoji}>📊</span>
          <span className={styles.brandText}>Dashboard</span>
        </Link>

        {/* Right section */}
        <div className={styles.rightSection}>
          {/* Quick Actions */}
          <div className={styles.quickActions}>
            <Link href="/pets" className={styles.actionButton} title="Explorar pets">
              🔍
            </Link>
            <Link href="/contato" className={styles.actionButton} title="Suporte">
              💬
            </Link>
          </div>

          {/* User Menu */}
          {session?.user && (
            <div className={styles.userMenu}>
              <button
                className={styles.userButton}
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-expanded={showUserMenu}
                aria-haspopup="true"
              >
                <Avatar
                  src={session.user.image}
                  alt={session.user.name}
                  size="small"
                />
                <div className={styles.userInfo}>
                  <p className={styles.userName}>{session.user.name}</p>
                  <p className={styles.userType}>
                    {userTypeLabel[session.user.type] || session.user.type}
                  </p>
                </div>
                <span className={clsx(styles.chevron, { [styles.open]: showUserMenu })}>
                  ▼
                </span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className={styles.dropdown}>
                  <Link href="/dashboard/perfil" className={styles.dropdownItem}>
                    👤 Meu Perfil
                  </Link>
                  <Link href="/dashboard/preferencias" className={styles.dropdownItem}>
                    ⚙️ Preferências
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className={clsx(styles.dropdownItem, styles.signOut)}
                  >
                    🚪 Sair
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
