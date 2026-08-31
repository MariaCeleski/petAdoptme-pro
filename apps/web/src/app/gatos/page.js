import Link from 'next/link';
import { fetchPets, getPetStats } from "@/lib/pets";
import { PublicPetCatalog } from "@/app/pets/PublicPetCatalog";
import PageNavigation from "@/components/common/PageNavigation/PageNavigation";
import styles from './gatos.module.css';

/**
 * Cats Catalog Page - Server Component
 * Specialized page showing only cats with professional styling
 */

export async function generateMetadata() {
  return {
    title: "Gatos para Adoção | PetAdopt",
    description: "Encontre o gato perfeito para sua família. Navegue por centenas de gatos disponíveis para adoção com filtros avançados.",
    keywords: [
      "gatos para adoção",
      "adotar gato",
      "gatos disponíveis",
      "raças de gatos",
      "gato para família",
      "felinos para adoção"
    ].join(", "),
    openGraph: {
      title: "Gatos para Adoção | PetAdopt",
      description: "Encontre o gato perfeito para sua família.",
      type: "website",
      images: ["/images/og-cats.jpg"],
    },
  };
}

export default async function CatsPage({ searchParams = {} }) {
  // Parse search parameters with CAT species pre-filtered
  const params = await searchParams;
  const filters = {
    species: "CAT",
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

  const catStats = stats.bySpecies?.CAT || 0;

  // Handle server-side errors gracefully
  if (petsData.error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Erro ao carregar gatos</h1>
          <p className="text-gray-600 mb-6">
            Ocorreu um erro ao buscar os gatos disponíveis. Tente novamente.
          </p>
          <Link
            href="/gatos"
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
            {/* Decorative element */}
            <div className={styles.decorativeEmoji}>🐱</div>

            <h1 className={styles.heroTitle}>
              Encontre o
              <span className={styles.highlight}> Gato</span>
              <br />
              Perfeito para Você
            </h1>

            <p className={styles.heroDescription}>
              {catStats > 0
                ? `${catStats} gato${catStats !== 1 ? "s" : ""} encantadores esperando por um novo lar. Encontre seu companheiro felino!`
                : "Gatos especiais esperando por um novo lar. Qual será o seu?"}
            </p>

            {/* Stats Bar */}
            {catStats > 0 && (
              <div className={styles.statsBar}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{catStats}</span>
                  <span className={styles.statLabel}>Disponíveis</span>
                </div>
                <div className={styles.statDivider}></div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>🎯</span>
                  <span className={styles.statLabel}>Filtros Avançados</span>
                </div>
                <div className={styles.statDivider}></div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>💚</span>
                  <span className={styles.statLabel}>Adoção Responsável</span>
                </div>
              </div>
            )}
          </div>

          {/* Cat silhouette decoration */}
          <div className={styles.decorativeBackground}></div>
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
        previousPage={{ label: 'Ver Todos', href: '/pets' }}
        nextPage={{ label: 'Cães para Adoção', href: '/caes' }}
      />
    </div>
  );
}
