'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './DashboardSidebar.module.css';
import { clsx } from 'clsx';

/**
 * DashboardSidebar - Navigation sidebar for dashboard
 * Shows different sections based on user type
 */
export default function DashboardSidebar({ userType = 'ADOPTER', className }) {
  const pathname = usePathname();

  // Define navigation sections based on user type
  const getNavSections = () => {
    const adoptorSections = [
      {
        title: 'Minha Atividade',
        items: [
          { label: 'Visão Geral', href: '/dashboard', icon: '📊' },
          { label: 'Pets Favoritos', href: '/dashboard/favoritos', icon: '❤️' },
          { label: 'Solicitações', href: '/dashboard/solicitacoes', icon: '📋' },
          { label: 'Histórico', href: '/dashboard/historico', icon: '📚' },
        ]
      },
      {
        title: 'Configurações',
        items: [
          { label: 'Meu Perfil', href: '/dashboard/perfil', icon: '👤' },
          { label: 'Preferências', href: '/dashboard/preferencias', icon: '⚙️' },
        ]
      }
    ];

    const ownerSections = [
      {
        title: 'Gestão',
        items: [
          { label: 'Visão Geral', href: '/dashboard', icon: '📊' },
          { label: 'Meus Pets', href: '/dashboard/pets', icon: '🐾' },
          { label: 'Solicitações de Adoção', href: '/dashboard/adocoes', icon: '💕' },
          { label: 'Histórico de Adoções', href: '/dashboard/historico', icon: '📚' },
        ]
      },
      {
        title: 'Ações',
        items: [
          { label: 'Cadastrar Pet', href: '/tutores/cadastrar', icon: '➕' },
        ]
      },
      {
        title: 'Configurações',
        items: [
          { label: 'Meu Perfil', href: '/dashboard/perfil', icon: '👤' },
          { label: 'Preferências', href: '/dashboard/preferencias', icon: '⚙️' },
        ]
      }
    ];

    const shelterSections = [
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
    ];

    if (userType === 'SHELTER_ADMIN') {
      return shelterSections;
    } else if (userType === 'INDIVIDUAL_OWNER' || userType === 'INDIVIDUAL_OWNER_SHELTER') {
      return ownerSections;
    } else {
      return adoptorSections;
    }
  };

  const sections = getNavSections();

  const isActiveLink = (href) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className={clsx(styles.sidebar, className)}>
      <nav className={styles.navigation}>
        {sections.map((section) => (
          <div key={section.title} className={styles.section}>
            <h3 className={styles.sectionTitle}>{section.title}</h3>
            <ul className={styles.sectionList}>
              {section.items.map((item) => {
                const isActive = isActiveLink(item.href);
                return (
                  <li key={item.href} className={styles.listItem}>
                    <Link
                      href={item.href}
                      className={clsx(styles.navLink, { [styles.active]: isActive })}
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
    </aside>
  );
}
