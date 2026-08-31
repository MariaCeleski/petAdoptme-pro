'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import styles from './Header.module.css';

export default function Header({ 
  session, 
  onToggleSidebar, 
  isSidebarOpen = false 
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleSidebarToggle = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    }
  };

  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.headerContent}>
          {/* Mobile Sidebar Button */}
          <button 
            className={styles.sidebarBtn}
            onClick={handleSidebarToggle}
            aria-label={isSidebarOpen ? "Fechar menu lateral" : "Abrir menu lateral"}
          >
            <span className={`${styles.hamburger} ${isSidebarOpen ? styles.open : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <span className={styles.logoEmoji}>🐾</span>
            <span className={styles.logoText}>PetAdopt</span>
          </Link>

          {/* Navigation Desktop */}
          <nav className={styles.nav}>
            <Link href="/pets" className={styles.navLink}>
              Adotar Pet
            </Link>
            {session?.user && (
              <Link href="/tutores/cadastrar" className={styles.navLink}>
                Cadastrar Pet
              </Link>
            )}
            <Link href="/sobre" className={styles.navLink}>
              Sobre Nós
            </Link>
            <Link href="/contato" className={styles.navLink}>
              Contato
            </Link>
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            {!session?.user ? (
              <>
                <Button 
                  variant="ghost" 
                  size="medium" 
                  className={styles.loginBtn}
                  onClick={() => router.push('/auth/signin')}
                >
                  Entrar
                </Button>
                <Button 
                  variant="primary" 
                  size="medium"
                  onClick={() => router.push('/auth/signup')}
                >
                  Cadastrar
                </Button>
              </>
            ) : (
              <div className={styles.userArea}>
                <Link href="/dashboard" className={styles.dashboardLink}>
                  📊 Dashboard
                </Link>
                
                <div className={styles.userMenu}>
                  <button 
                    className={styles.userButton}
                    onClick={toggleUserMenu}
                    aria-haspopup="true"
                    aria-expanded={isUserMenuOpen}
                  >
                    <Avatar 
                      src={session.user.image}
                      alt={session.user.name}
                      size="small"
                    />
                    <span className={styles.userName}>{session.user.name}</span>
                    <span className={`${styles.dropdownIcon} ${isUserMenuOpen ? styles.open : ''}`}>
                      ▼
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  <div className={`${styles.dropdownMenu} ${isUserMenuOpen ? styles.open : ''}`}>
                    <Link href="/dashboard/perfil" className={styles.dropdownItem}>
                      👤 Meu Perfil
                    </Link>
                    <Link href="/dashboard/pets" className={styles.dropdownItem}>
                      🐾 Meus Pets
                    </Link>
                    <Link href="/dashboard/adocoes" className={styles.dropdownItem}>
                      💕 Adoções
                    </Link>
                    <Link href="/dashboard/configuracoes" className={styles.dropdownItem}>
                      ⚙️ Configurações
                    </Link>
                    <hr className={styles.dropdownDivider} />
                    <button 
                      className={styles.signOutBtn}
                      onClick={handleSignOut}
                    >
                      🚪 Sair
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Legacy Mobile Menu Button (hidden - replaced by sidebar) */}
          <button 
            className={`${styles.mobileMenuBtn} ${styles.hidden}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span className={`${styles.hamburger} ${isMenuOpen ? styles.open : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>

        {/* Legacy Mobile Menu (hidden - replaced by sidebar) */}
        <div className={`${styles.mobileMenu} ${styles.hidden} ${isMenuOpen ? styles.open : ''}`}>
          <nav className={styles.mobileNav}>
            <Link href="/pets" className={styles.mobileNavLink}>
              🐕 Adotar Pet
            </Link>
            <Link href="/tutores/cadastrar" className={styles.mobileNavLink}>
              💝 Cadastrar Pet
            </Link>
            <Link href="/sobre" className={styles.mobileNavLink}>
              ℹ️ Sobre Nós
            </Link>
            <Link href="/contato" className={styles.mobileNavLink}>
              📞 Contato
            </Link>
            <div className={styles.mobileActions}>
              <Button variant="outline" fullWidth className="mb-sm">
                Entrar
              </Button>
              <Button variant="primary" fullWidth>
                Cadastrar
              </Button>
            </div>
          </nav>
        </div>
      </div>

      {/* Overlay para fechar dropdown */}
      {isUserMenuOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
}
