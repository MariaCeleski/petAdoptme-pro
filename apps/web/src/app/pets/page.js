import Link from 'next/link';
import { fetchPets, getPetStats } from "@/lib/pets";
import { PublicPetCatalog } from "./PublicPetCatalog";
import PageNavigation from "@/components/common/PageNavigation/PageNavigation";
import styles from './pets.module.css';

/**
 * Public Pet Catalog Page - Server Component
 * Requirements: 4.1-4.9 (Public catalog with filters)
 */

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const filters = {
    species: params?.species || "",
    size: params?.size || "",
    gender: params?.gender || "",
    location: params?.location || "",
    search: params?.search || params?.q || "",
    page: params?.page || "1",
    limit: params?.limit || "12",
  };

  // Build dynamic title based on filters
  let title = "Adote um Pet";
  const titleParts = [];

  if (filters.species === "DOG") titleParts.push("Cachorros");
  else if (filters.species === "CAT") titleParts.push("Gatos");

  if (filters.size === "SMALL") titleParts.push("Pequenos");
  else if (filters.size === "MEDIUM") titleParts.push("Médios");
  else if (filters.size === "LARGE") titleParts.push("Grandes");

  if (filters.location) titleParts.push(`em ${filters.location}`);
  if (filters.search) titleParts.push(`"${filters.search}"`);

  if (titleParts.length > 0) {
    title = `${titleParts.join(" ")} - Adote um Pet`;
  }

  // Build description
  let description = "Encontre seu companheiro perfeito! ";
  if (titleParts.length > 0) {
    description += `Veja ${titleParts.join(" ").toLowerCase()} disponíveis para adoção.`;
  } else {
    description += "Navegue por centenas de pets esperando por um novo lar.";
  }

  return {
    title,
    description,
    keywords: [
      "adoção de pets",
      "cachorros para adoção",
      "gatos para adoção",
      "animais para adoção",
      "pets disponíveis",
      "adotar cachorro",
      "adotar gato",
      ...(filters.location ? [filters.location] : []),
      ...(filters.search ? [filters.search] : []),
    ].join(", "),
    openGraph: {
      title,
      description,
      type: "website",
      images: ["/images/og-pets.jpg"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/og-pets.jpg"],
    },
  };
}

export default async function PetsPage({ searchParams = {} }) {
  // Parse search parameters into filters
  const params = await searchParams;
  const filters = {
    species: params?.species || "",
    size: params?.size || "",
    gender: params?.gender || "",
    location: params?.location || "",
    search: params?.search || params?.q || "",
    page: params?.page || "1",
    limit: params?.limit || "12",
  };

  // Fetch initial data on the server
  const [petsData, stats] = await Promise.all([
    fetchPets(filters),
    getPetStats(),
  ]);

  // Handle server-side errors gracefully
  if (petsData.error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Erro ao carregar pets</h1>
          <p className="text-gray-600 mb-6">
            Ocorreu um erro ao buscar os pets disponíveis. Tente novamente.
          </p>
          <Link
            href="/pets"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Tentar novamente
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <Link href="/" className={styles.homeButton}>
          <span className={styles.homeButtonArrow}>←</span>
          <span>Início</span>
        </Link>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Encontre seu 
              <span className={styles.highlight}> Companheiro</span> 
              <br />
              Perfeito 🐾
            </h1>
            
            <p className={styles.heroDescription}>
              {stats.totalAvailable > 0
                ? `${stats.totalAvailable} pet${stats.totalAvailable !== 1 ? "s" : ""} esperando por um novo lar. Qual será o seu?`
                : "Pets esperando por um novo lar. Qual será o seu?"}
            </p>

            {/* Quick Stats */}
            {(stats.bySpecies?.DOG || stats.bySpecies?.CAT) && (
              <div className={styles.statsContainer}>
                {stats.bySpecies.DOG && (
                  <div className={styles.statCard}>
                    <span className={styles.statIcon}>🐕</span>
                    <span className={styles.statNumber}>{stats.bySpecies.DOG}</span>
                    <span className={styles.statLabel}>Cachorros Disponíveis</span>
                  </div>
                )}
                {stats.bySpecies.CAT && (
                  <div className={styles.statCard}>
                    <span className={styles.statIcon}>🐱</span>
                    <span className={styles.statNumber}>{stats.bySpecies.CAT}</span>
                    <span className={styles.statLabel}>Gatos Disponíveis</span>
                  </div>
                )}
                {stats.totalAvailable && (
                  <div className={styles.statCard}>
                    <span className={styles.statIcon}>💚</span>
                    <span className={styles.statNumber}>{stats.totalAvailable}</span>
                    <span className={styles.statLabel}>Vidas para Mudar</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Catalog Content */}
      <main className={styles.mainContent}>
        <div className={styles.mainContainer}>
          <PublicPetCatalog
            initialPets={petsData.pets}
            initialPagination={petsData.pagination}
            initialFilters={filters}
            stats={stats}
          />
        </div>
      </main>

      {/* Page Navigation */}
      <PageNavigation 
        previousPage={{ label: 'Como Adotar', href: '/processo-adocao' }}
        nextPage={{ label: 'Cadastrar um Pet', href: '/tutores/cadastrar' }}
      />
    </div>
  );
}
