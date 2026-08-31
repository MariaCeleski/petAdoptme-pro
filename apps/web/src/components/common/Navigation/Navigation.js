'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './Navigation.module.css';

const navigationItems = {
  public: [
    {
      label: 'Início',
      href: '/',
      icon: '🏠'
    },
    {
      label: 'Adotar Pet',
      href: '/pets',
      icon: '🐾'
    },
    {
      label: 'Sobre Nós',
      href: '/sobre',
      icon: 'ℹ️'
    },
    {
      label: 'Contato',
      href: '/contato',
      icon: '📞'
    }
  ],
  authenticated: [
    {
      label: 'Início',
      href: '/',
      icon: '🏠'
    },
    {
      label: 'Explorar Pets',
      href: '/pets',
      icon: '🔍'
    },
    {
      label: 'Meus Pets',
      href: '/dashboard/pets',
      icon: '💝',
      authRequired: true
    },
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: '📊',
      authRequired: true
    },
    {
      label: 'Cadastrar Pet',
      href: '/tutores/cadastrar',
      icon: '➕',
      authRequired: true
    }
  ],
  shelter: [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: '🏢'
    },
    {
      label: 'Nossos Pets',
      href: '/dashboard/pets',
      icon: '🐾'
    },
    {
      label: 'Adoções',
      href: '/dashboard/adocoes',
      icon: '💕'
    },
    {
      label: 'Perfil do Abrigo',
      href: '/dashboard/abrigo',
      icon: '🏠'
    },
    {
      label: 'Estatísticas',
      href: '/dashboard/estatisticas',
      icon: '📈'
    }
  ]
};

export default function Navigation({ session, className = '' }) {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Evitar hidratação inconsistente - só renderizar após montagem no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Determinar qual conjunto de itens usar
  const getNavigationItems = () => {
    if (!session?.user) return navigationItems.public;
    
    if (session.user.type === 'SHELTER_ADMIN') {
      return navigationItems.shelter;
    }
    
    return navigationItems.authenticated;
  };

  const items = getNavigationItems();

  // Controlar estado de scroll para sticky navigation
  useEffect(() => {
    if (!isClient) return;
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    // Definir estado inicial
    setIsScrolled(window.scrollY > 100);
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isClient]);

  // Destacar seção ativa baseada na URL
  useEffect(() => {
    if (!isClient) return;
    
    const currentSection = pathname.split('/')[1] || 'home';
    setActiveSection(currentSection);
  }, [pathname, isClient]);

  const isActiveLink = (href) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // Renderização segura para evitar hidratação inconsistente
  if (!isClient) {
    return (
      <nav 
        className={`${styles.navigation} ${className}`}
        role="navigation"
        aria-label="Navegação principal"
      >
        <div className="container">
          <div className={styles.navigationContent}>
            <ul className={styles.navigationList} role="list">
              {/* Renderizar apenas itens básicos no servidor */}
              {navigationItems.public.map((item) => (
                <li key={item.href} className={styles.navigationItem}>
                  <Link 
                    href={item.href}
                    className={styles.navigationLink}
                  >
                    <span className={styles.linkIcon} aria-hidden="true">
                      {item.icon}
                    </span>
                    <span className={styles.linkText}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav 
      className={`${styles.navigation} ${isScrolled ? styles.scrolled : ''} ${className}`}
      role="navigation"
      aria-label="Navegação principal"
    >
      <div className="container">
        <div className={styles.navigationContent}>
          <ul className={styles.navigationList} role="list">
            {items.map((item) => {
              // Verificar se o item requer autenticação
              if (item.authRequired && !session?.user) {
                return null;
              }

              const isActive = isActiveLink(item.href);

              return (
                <li key={item.href} className={styles.navigationItem}>
                  <Link 
                    href={item.href}
                    className={`${styles.navigationLink} ${isActive ? styles.active : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className={styles.linkIcon} aria-hidden="true">
                      {item.icon}
                    </span>
                    <span className={styles.linkText}>
                      {item.label}
                    </span>
                    {isActive && (
                      <span className={styles.activeIndicator} aria-hidden="true" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Indicador de progresso de adoção (para usuários logados) */}
          {session?.user && pathname.includes('/dashboard') && (
            <div className={styles.progressIndicator}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: '60%' }} // Exemplo - seria dinâmico
                  aria-hidden="true"
                />
              </div>
              <span className={styles.progressText}>
                Perfil 60% completo
              </span>
            </div>
          )}

          {/* Quick actions para usuários autenticados */}
          {session?.user && (
            <div className={styles.quickActions}>
              <Link 
                href="/pets"
                className={styles.quickAction}
                title="Buscar pets"
              >
                🔍
              </Link>
              <Link 
                href="/dashboard/favoritos"
                className={styles.quickAction}
                title="Meus favoritos"
              >
                ❤️
              </Link>
              <Link 
                href="/dashboard/mensagens"
                className={styles.quickAction}
                title="Mensagens"
              >
                💬
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}