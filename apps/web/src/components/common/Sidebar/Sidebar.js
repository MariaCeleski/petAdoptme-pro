'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { useHydration } from '@/hooks/useHydration';
import styles from './Sidebar.module.css';

const sidebarSections = {
  public: [
    {
      title: 'Navegação',
      items: [
        { label: 'Início', href: '/', icon: '🏠' },
        { label: 'Adotar Pet', href: '/pets', icon: '🐾' },
        { label: 'Sobre Nós', href: '/sobre', icon: 'ℹ️' },
        { label: 'Contato', href: '/contato', icon: '📞' },
      ]
    }
  ],
  authenticated: [
    {
      title: 'Principal',
      items: [
        { label: 'Início', href: '/', icon: '🏠' },
        { label: 'Explorar Pets', href: '/pets', icon: '🔍' },
        { label: 'Dashboard', href: '/dashboard', icon: '📊' },
      ]
    },
    {
      title: 'Meus Pets',
      items: [
        { label: 'Meus Pets', href: '/dashboard/pets', icon: '💝' },
        { label: 'Cadastrar Pet', href: '/tutores/cadastrar', icon: '➕' },
        { label: 'Favoritos', href: '/dashboard/favoritos', icon: '❤️' },
      ]
    },
    {
      title: 'Adoções',
      items: [
        { label: 'Minhas Solicitações', href: '/dashboard/adocoes', icon: '📋' },
        { label: 'Histórico', href: '/dashboard/historico', icon: '📚' },
      ]
    }
  ],
  shelter: [
    {
      title: 'Dashboard',
      items: [
        { label: 'Visão Geral', href: '/dashboard', icon: '🏢' },
        { label: 'Estatísticas', href: '/dashboard/estatisticas', icon: '📈' },
      ]
    },
    {
      title: 'Gestão',
      items: [
        { label: 'Nossos Pets', href: '/dashboard/pets', icon: '🐾' },
        { label: 'Adoções', href: '/dashboard/adocoes', icon: '💕' },
        { label: 'Perfil do Abrigo', href: '/dashboard/abrigo', icon: '🏠' },
      ]
    },
    {
      title: 'Ferramentas',
      items: [
        { label: 'Cadastrar Pet', href: '/tutores/cadastrar', icon: '➕' },
        { label: 'Relatórios', href: '/dashboard/relatorios', icon: '📊' },
        { label: 'Configurações', href: '/dashboard/configuracoes', icon: '⚙️' },
      ]
    }
  ]
};

export default function Sidebar({ isOpen, onClose, session }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);
  const sidebarRef = useRef(null);
  const startXRef = useRef(null);
  const isDraggingRef = useRef(false);
  const isHydrated = useHydration();

  // Determinar seções baseadas no tipo de usuário
  const getSections = () => {
    if (!session?.user) return sidebarSections.public;
    
    if (session.user.type === 'SHELTER_ADMIN') {
      return sidebarSections.shelter;
    }
    
    return sidebarSections.authenticated;
  };

  const sections = getSections();

  // Fechar sidebar quando a rota mudar
  useEffect(() => {
    if (isOpen && isHydrated) {
      onClose();
    }
  }, [pathname, isHydrated]); // Adicionar isHydrated para evitar execução no servidor

  // Tratar teclas de atalho
  useEffect(() => {
    if (!isHydrated) return; // Só executar no cliente
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isHydrated]);

  // Touch/Swipe handlers para melhor experiência móvel
  useEffect(() => {
    if (!isOpen || !sidebarRef.current || !isHydrated) return; // Só executar no cliente

    const sidebar = sidebarRef.current;

    const handleTouchStart = (e) => {
      startXRef.current = e.touches[0].clientX;
      isDraggingRef.current = true;
    };

    const handleTouchMove = (e) => {
      if (!isDraggingRef.current || startXRef.current === null) return;

      const currentX = e.touches[0].clientX;
      const diffX = startXRef.current - currentX;
      
      // Se o usuário está arrastando para a esquerda e passou de uma certa distância
      if (diffX > 50) {
        handleClose();
      }
    };

    const handleTouchEnd = () => {
      startXRef.current = null;
      isDraggingRef.current = false;
    };

    sidebar.addEventListener('touchstart', handleTouchStart, { passive: true });
    sidebar.addEventListener('touchmove', handleTouchMove, { passive: true });
    sidebar.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      sidebar.removeEventListener('touchstart', handleTouchStart);
      sidebar.removeEventListener('touchmove', handleTouchMove);
      sidebar.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, isHydrated]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 250); // Tempo da animação
  };

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const isActiveLink = (href) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`${styles.overlay} ${isOpen ? styles.open : ''}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className={`${styles.sidebar} ${isOpen ? styles.open : ''} ${isClosing ? styles.closing : ''}`}
        role="navigation"
        aria-label="Menu lateral de navegação"
      >
        {/* Header do Sidebar */}
        <div className={styles.header}>
          <Link href="/" className={styles.logo} onClick={handleClose}>
            <span className={styles.logoEmoji}>🐾</span>
            <span className={styles.logoText}>PetAdopt</span>
          </Link>
          
          <button 
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Fechar menu"
          >
            ✕
          </button>
        </div>

        {/* User Info */}
        {session?.user && (
          <div className={styles.userInfo}>
            <Avatar 
              src={session.user.image}
              alt={session.user.name}
              size="medium"
            />
            <div className={styles.userDetails}>
              <p className={styles.userName}>{session.user.name}</p>
              <p className={styles.userEmail}>{session.user.email}</p>
              {session.user.type && (
                <span className={styles.userType}>
                  {session.user.type === 'SHELTER_ADMIN' ? '🏢 Abrigo' : 
                   session.user.type === 'ADOPTER' ? '💝 Adotante' : 
                   '👤 Tutor Individual'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className={styles.navigation}>
          {sections.map((section, sectionIndex) => (
            <div key={section.title} className={styles.section}>
              <h3 className={styles.sectionTitle}>{section.title}</h3>
              <ul className={styles.sectionList}>
                {section.items.map((item) => {
                  const isActive = isActiveLink(item.href);
                  
                  return (
                    <li key={item.href} className={styles.listItem}>
                      <Link 
                        href={item.href}
                        className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                        onClick={handleClose}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <span className={styles.linkIcon}>{item.icon}</span>
                        <span className={styles.linkText}>{item.label}</span>
                        {isActive && (
                          <span className={styles.activeIndicator} aria-hidden="true" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Actions */}
        <div className={styles.actions}>
          {!session?.user ? (
            <div className={styles.authActions}>
              <Button 
                variant="outline" 
                fullWidth 
                size="medium"
                onClick={() => {
                  handleClose();
                  router.push('/auth/signin');
                }}
              >
                Entrar
              </Button>
              <Button 
                variant="primary" 
                fullWidth 
                size="medium"
                onClick={() => {
                  handleClose();
                  router.push('/auth/signup');
                }}
              >
                Cadastrar
              </Button>
            </div>
          ) : (
            <div className={styles.userActions}>
              <Link 
                href="/dashboard/perfil"
                className={styles.actionLink}
                onClick={handleClose}
              >
                <span>⚙️</span>
                Perfil
              </Link>
              <Link 
                href="/dashboard/configuracoes"
                className={styles.actionLink}
                onClick={handleClose}
              >
                <span>🔧</span>
                Configurações
              </Link>
              <button 
                className={styles.signOutButton}
                onClick={handleSignOut}
              >
                <span>🚪</span>
                Sair
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            PetAdopt {new Date().getFullYear()}
          </p>
          <div className={styles.socialLinks}>
            <a href="#" className={styles.socialLink} aria-label="Facebook">📘</a>
            <a href="#" className={styles.socialLink} aria-label="Instagram">📷</a>
            <a href="#" className={styles.socialLink} aria-label="Twitter">🐦</a>
          </div>
        </div>
      </aside>
    </>
  );
}