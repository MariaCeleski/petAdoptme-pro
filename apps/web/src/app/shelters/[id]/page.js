import { Suspense } from 'react';
import Link from 'next/link';
import NotFound from './not-found';
import OptimizedImage from '@/components/ui/OptimizedImage/OptimizedImage';
import Button from '@/components/ui/Button/Button';
import Badge from '@/components/ui/Badge/Badge';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton/LoadingSkeleton';
import PetCard from '@/components/pets/PetCard/PetCard';
import styles from './page.module.css';

/**
 * Shelter Public Page
 * Display detailed shelter information with pets and adoption statistics
 * URL: /shelters/[id]
 * 
 * Validates Requirements: 11.3, 11.5, 11.6
 */

async function fetchShelter(id) {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/shelters/${id}`,
      { next: { revalidate: 3600 } } // Revalidate every hour
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch shelter');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching shelter:', error);
    throw error;
  }
}

async function fetchShelterStats(id) {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/shelters/${id}/stats`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching shelter stats:', error);
    return null;
  }
}

async function fetchShelterPets(id, page = 1) {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/pets?shelterId=${id}&status=AVAILABLE&page=${page}&limit=12`,
      { next: { revalidate: 300 } } // Revalidate every 5 minutes
    );

    if (!response.ok) {
      throw new Error('Failed to fetch pets');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching shelter pets:', error);
    return { data: [], pagination: { total: 0 } };
  }
}

function ShelterHeaderSkeleton() {
  return (
    <div className={styles.headerContainer}>
      <LoadingSkeleton height={400} />
    </div>
  );
}

function ShelterPetsSkeleton() {
  return (
    <div className={styles.petsGrid}>
      {[...Array(6)].map((_, i) => (
        <div key={i} className={styles.petCardContainer}>
          <LoadingSkeleton height={250} />
        </div>
      ))}
    </div>
  );
}

export default async function ShelterPage({ params }) {
  const { id } = params;

  // Fetch shelter data
  const shelter = await fetchShelter(id);

  if (!shelter) {
    return <NotFound />;
  }

  // Fetch stats and pets in parallel
  const [stats, petsData] = await Promise.all([
    fetchShelterStats(id),
    fetchShelterPets(id)
  ]);

  const images = Array.isArray(shelter.images) ? shelter.images : [];

  return (
    <main className={styles.main}>
      {/* Header with cover photo */}
      <div className={styles.headerContainer}>
        {images.length > 0 && (
          <OptimizedImage
            src={images[0]}
            alt={shelter.name}
            width={1200}
            height={400}
            className={styles.coverPhoto}
            priority
          />
        )}
      </div>

      {/* Content container */}
      <div className={styles.container}>
        {/* Shelter info card */}
        <div className={styles.infoCard}>
          <div className={styles.headerContent}>
            {shelter.logo && (
              <div className={styles.logoContainer}>
                <OptimizedImage
                  src={shelter.logo}
                  alt={shelter.name}
                  width={120}
                  height={120}
                  className={styles.logo}
                />
              </div>
            )}
            
            <div className={styles.titleSection}>
              <h1 className={styles.title}>{shelter.name}</h1>
              {shelter.isVerified && (
                <Badge variant="success">✓ Verificado</Badge>
              )}
              
              <p className={styles.location}>
                📍 {shelter.city}, {shelter.state}
              </p>
            </div>
          </div>

          {shelter.description && (
            <p className={styles.description}>{shelter.description}</p>
          )}

          {/* Contact information */}
          <div className={styles.contactSection}>
            <h2 className={styles.sectionTitle}>Contato</h2>
            <div className={styles.contactGrid}>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>📞 Telefone:</span>
                <a href={`tel:${shelter.phone}`} className={styles.contactLink}>
                  {shelter.phone}
                </a>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>✉️ Email:</span>
                <a href={`mailto:${shelter.email}`} className={styles.contactLink}>
                  {shelter.email}
                </a>
              </div>
              {shelter.website && (
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>🌐 Website:</span>
                  <a 
                    href={shelter.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.contactLink}
                  >
                    Visitar site
                  </a>
                </div>
              )}
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>📍 Endereço:</span>
                <span className={styles.contactValue}>
                  {shelter.address}, {shelter.city} - {shelter.state}, {shelter.zipCode}
                </span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {stats && (
            <div className={styles.statsSection}>
              <h2 className={styles.sectionTitle}>Estatísticas de Adoção</h2>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <span className={styles.statNumber}>{stats.petStats.total}</span>
                  <span className={styles.statLabel}>Pets Cadastrados</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNumber}>{stats.petStats.available}</span>
                  <span className={styles.statLabel}>Disponíveis</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNumber}>{stats.petStats.adopted}</span>
                  <span className={styles.statLabel}>Adotados</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNumber}>{stats.petStats.adoptionRate}%</span>
                  <span className={styles.statLabel}>Taxa de Adoção</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNumber}>{stats.adoptionStats.successRate}%</span>
                  <span className={styles.statLabel}>Taxa de Sucesso</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNumber}>{stats.adoptionStats.averageAdoptionDays}</span>
                  <span className={styles.statLabel}>Dias para Adoção</span>
                </div>
              </div>
            </div>
          )}

          {/* Photos gallery */}
          {images.length > 1 && (
            <div className={styles.gallerySection}>
              <h2 className={styles.sectionTitle}>Fotos do Abrigo</h2>
              <div className={styles.galleryGrid}>
                {images.map((image, idx) => (
                  <div key={idx} className={styles.galleryItem}>
                    <OptimizedImage
                      src={image}
                      alt={`Foto do abrigo ${idx + 1}`}
                      width={300}
                      height={200}
                      className={styles.galleryImage}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pets section */}
        <div className={styles.petsSection}>
          <h2 className={styles.sectionTitle}>
            Pets Disponíveis para Adoção ({petsData.pagination?.total || 0})
          </h2>

          {petsData.data && petsData.data.length > 0 ? (
            <>
              <div className={styles.petsGrid}>
                {petsData.data.map(pet => (
                  <PetCard key={pet.id} pet={pet} />
                ))}
              </div>
              
              {petsData.pagination && petsData.pagination.pages > 1 && (
                <div className={styles.paginationContainer}>
                  <Link href={`/shelters/${id}?page=2`}>
                    <Button variant="secondary">Ver Mais Pets</Button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyState}>
              <p>Nenhum pet disponível para adoção no momento.</p>
              <p>Volte em breve para conhecer novos amigos!</p>
              <Link href="/pets">
                <Button>Ver Outros Pets</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export async function generateMetadata({ params }) {
  const shelter = await fetchShelter(params.id);

  if (!shelter) {
    return {
      title: 'Abrigo não encontrado',
    };
  }

  return {
    title: `${shelter.name} - PetAdopt`,
    description: shelter.description || `Conheça o abrigo ${shelter.name} e seus pets disponíveis para adoção.`,
    openGraph: {
      title: shelter.name,
      description: shelter.description,
      images: shelter.logo ? [{ url: shelter.logo }] : [],
    },
  };
}
