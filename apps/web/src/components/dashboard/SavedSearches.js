'use client';

import Link from 'next/link';
import styles from './SavedSearches.module.css';

/**
 * SavedSearches Component
 * Displays saved search preferences and favorite pets
 * Requirements: 7.1 (display favorite pets), 10.6 (save search preferences)
 */
export function SavedSearches() {
  // Mock data - in production this would come from API or user preferences
  const savedSearches = [
    {
      id: 1,
      name: 'Gatos Pequenos',
      query: 'species=CAT&size=SMALL',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'Cães Amigáveis',
      query: 'species=DOG&personality=friendly',
      createdAt: '2024-01-10'
    }
  ];

  const recentPets = [
    {
      id: 1,
      name: 'Miau',
      species: 'CAT',
      breed: 'Persa',
      image: null
    },
    {
      id: 2,
      name: 'Rex',
      species: 'DOG',
      breed: 'Labrador',
      image: null
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Pesquisas Salvas</h3>
        
        {savedSearches.length === 0 ? (
          <div className={styles.emptyState}>
            <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className={styles.emptyText}>Nenhuma pesquisa salva</p>
            <Link href="/pets" className={styles.emptyLink}>
              Criar pesquisa
            </Link>
          </div>
        ) : (
          <div className={styles.searchesList}>
            {savedSearches.map((search) => (
              <Link
                key={search.id}
                href={`/pets?${search.query}`}
                className={styles.searchItem}
              >
                <div className={styles.searchName}>{search.name}</div>
                <svg className={styles.arrow} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Pets Visualizados Recentemente</h3>
        
        {recentPets.length === 0 ? (
          <div className={styles.emptyState}>
            <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <p className={styles.emptyText}>Nenhum pet visualizado ainda</p>
          </div>
        ) : (
          <div className={styles.petsList}>
            {recentPets.map((pet) => (
              <Link
                key={pet.id}
                href={`/pets/${pet.id}`}
                className={styles.petItem}
              >
                <div className={styles.petImage}>
                  {pet.image ? (
                    <img src={pet.image} alt={pet.name} />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className={styles.petInfo}>
                  <p className={styles.petName}>{pet.name}</p>
                  <p className={styles.petBreed}>{pet.breed}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
