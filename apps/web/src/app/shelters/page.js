import { Suspense } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button/Button';
import OptimizedImage from '@/components/ui/OptimizedImage/OptimizedImage';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton/LoadingSkeleton';
import styles from './page.module.css';

/**
 * Public Shelters List Page
 * Display all shelters with search and pagination
 * URL: /shelters
 * 
 * Validates Requirements: 11.5
 */

async function fetchShelters(page = 1, search = null) {
  try {
    const url = new URL(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/shelters`);
    url.searchParams.set('page', page);
    url.searchParams.set('limit', '12');
    if (search) {
      url.searchParams.set('search', search);
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch shelters');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching shelters:', error);
    return { data: [], pagination: { total: 0, pages: 0 } };
  }
}

function ShelterCardSkeleton() {
  return (
    <div className={styles.cardSkeleton}>
      <LoadingSkeleton height={200} />
      <div className={styles.cardContent}>
        <LoadingSkeleton height={24} width="80%" />
        <LoadingSkeleton height={16} width="60%" style={{ marginTop: '0.5rem' }} />
      </div>
    </div>
  );
}

function ShelterCard({ shelter }) {
  return (
    <Link href={`/shelters/${shelter.id}`} className={styles.cardLink}>
      <div className={styles.card}>
        <div className={styles.cardImage}>
          {shelter.logo ? (
            <OptimizedImage
              src={shelter.logo}
              alt={shelter.name}
              width={300}
              height={200}
              className={styles.image}
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span className={styles.placeholderIcon}>🏠</span>
            </div>
          )}
          {shelter.isVerified && (
            <div className={styles.verifiedBadge}>✓ Verificado</div>
          )}
        </div>
        
        <div className={styles.cardContent}>
          <h3 className={styles.cardTitle}>{shelter.name}</h3>
          
          <p className={styles.cardLocation}>
            📍 {shelter.city}, {shelter.state}
          </p>
          
          {shelter.description && (
            <p className={styles.cardDescription}>
              {shelter.description.substring(0, 100)}
              {shelter.description.length > 100 ? '...' : ''}
            </p>
          )}
          
          <div className={styles.cardStats}>
            <span className={styles.statItem}>
              {shelter.availablePetsCount} {shelter.availablePetsCount === 1 ? 'pet' : 'pets'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function SheltersPage({ searchParams }) {
  const params = await searchParams;
  const page = parseInt(params?.page || '1');
  const search = params?.search || null;
  
  const data = await fetchShelters(page, search);
  const { data: shelters, pagination } = data;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Abrigos e Organizações</h1>
          <p className={styles.subtitle}>
            Conheça os abrigos parceiros e seus pets disponíveis para adoção
          </p>
        </div>

        {/* Search bar */}
        <form className={styles.searchForm} method="get">
          <input
            type="text"
            name="search"
            placeholder="Buscar por nome, cidade..."
            defaultValue={search || ''}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            🔍
          </button>
        </form>

        {/* Results info */}
        {search && (
          <div className={styles.resultsInfo}>
            Resultados para: <strong>{search}</strong>
          </div>
        )}

        {/* Shelters grid */}
        {shelters && shelters.length > 0 ? (
          <>
            <div className={styles.grid}>
              {shelters.map(shelter => (
                <ShelterCard key={shelter.id} shelter={shelter} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className={styles.pagination}>
                {page > 1 && (
                  <Link href={`/shelters?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`}>
                    <Button variant="secondary">← Anterior</Button>
                  </Link>
                )}
                
                <div className={styles.pageInfo}>
                  Página {page} de {pagination.pages}
                </div>
                
                {page < pagination.pages && (
                  <Link href={`/shelters?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`}>
                    <Button variant="secondary">Próxima →</Button>
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>
              {search ? 'Nenhum abrigo encontrado' : 'Nenhum abrigo disponível'}
            </p>
            <p className={styles.emptyMessage}>
              {search 
                ? `Não encontramos abrigos com "${search}". Tente uma nova busca.`
                : 'Volte em breve para conhecer novos abrigos parceiros!'}
            </p>
            {search && (
              <Link href="/shelters">
                <Button>Limpar busca</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export const metadata = {
  title: 'Abrigos - PetAdopt',
  description: 'Conheça todos os abrigos e organizações parceiras da PetAdopt com pets disponíveis para adoção.',
};
