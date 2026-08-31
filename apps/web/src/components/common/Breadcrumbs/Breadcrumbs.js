'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Breadcrumbs.module.css';

const routeLabels = {
  '': 'Início',
  'pets': 'Pets',
  'dashboard': 'Dashboard',
  'perfil': 'Perfil',
  'configuracoes': 'Configurações',
  'adocoes': 'Adoções',
  'favoritos': 'Favoritos',
  'estatisticas': 'Estatísticas',
  'abrigo': 'Abrigo',
  'novo': 'Novo',
  'editar': 'Editar',
  'sobre': 'Sobre Nós',
  'contato': 'Contato',
  'auth': 'Autenticação',
  'signin': 'Entrar',
  'signup': 'Cadastrar',
  'historico': 'Histórico',
  'relatorios': 'Relatórios'
};

export default function Breadcrumbs({ 
  items = [], 
  separator = '→',
  showHome = true,
  className = '' 
}) {
  const pathname = usePathname();

  // Se items não for fornecido, gerar automaticamente baseado na URL
  const getBreadcrumbs = () => {
    if (items.length > 0) {
      return items;
    }

    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    if (showHome) {
      breadcrumbs.push({
        label: 'Início',
        href: '/',
        icon: '🏠'
      });
    }

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      
      // Decodificar segment para URLs com caracteres especiais
      const decodedSegment = decodeURIComponent(segment);
      
      // Obter label baseado no segment ou usar o segment decodificado
      const label = routeLabels[segment] || 
                   routeLabels[decodedSegment] || 
                   decodedSegment.charAt(0).toUpperCase() + decodedSegment.slice(1);

      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath, // Não criar link para o item atual
        icon: getIconForSegment(segment)
      });
    });

    return breadcrumbs;
  };

  const getIconForSegment = (segment) => {
    const iconMap = {
      'pets': '🐾',
      'dashboard': '📊',
      'perfil': '👤',
      'configuracoes': '⚙️',
      'adocoes': '💕',
      'favoritos': '❤️',
      'estatisticas': '📈',
      'abrigo': '🏢',
      'sobre': 'ℹ️',
      'contato': '📞',
      'auth': '🔐',
      'signin': '🚪',
      'signup': '📝',
      'novo': '➕',
      'editar': '✏️',
      'historico': '📚',
      'relatorios': '📋'
    };
    
    return iconMap[segment] || null;
  };

  const breadcrumbs = getBreadcrumbs();

  // Não renderizar se houver apenas um item (página inicial)
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav 
      className={`${styles.breadcrumbs} ${className}`}
      role="navigation"
      aria-label="Breadcrumb"
    >
      <ol className={styles.list} role="list">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isFirst = index === 0;

          return (
            <li 
              key={item.href || item.label}
              className={`${styles.item} ${isLast ? styles.current : ''}`}
              role="listitem"
            >
              {/* Separador (exceto para o primeiro item) */}
              {!isFirst && (
                <span 
                  className={styles.separator}
                  aria-hidden="true"
                >
                  {separator}
                </span>
              )}

              {/* Link ou texto */}
              {item.href && !isLast ? (
                <Link 
                  href={item.href}
                  className={`${styles.link} ${isFirst ? styles.homeLink : ''}`}
                >
                  {item.icon && (
                    <span className={styles.icon} aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  <span className={styles.text}>{item.label}</span>
                </Link>
              ) : (
                <span 
                  className={`${styles.text} ${isLast ? styles.currentText : ''}`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.icon && (
                    <span className={styles.icon} aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbs.map((item, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": item.label,
              ...(item.href && { "item": item.href })
            }))
          })
        }}
      />
    </nav>
  );
}