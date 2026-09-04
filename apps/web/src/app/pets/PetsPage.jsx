'use client';

import { useEffect, useState } from 'react';
import { usePets } from '@/hooks/usePets';
import Link from 'next/link';
import styles from './pets.module.css';

// Icons (emoji fallback)
const SPECIES_ICONS = {
  DOG: '🐕',
  CAT: '🐱',
};

const SIZE_ICONS = {
  SMALL: '📏',
  MEDIUM: '📊',
  LARGE: '📈',
  XLARGE: '🏔️',
};

export default function PetsPage() {
  const { pets, loading, error, fetchPets } = usePets();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('');
  const [filterSize, setFilterSize] = useState('');
  const [displayPets, setDisplayPets] = useState([]);

  // Initial load - fetch all available pets
  useEffect(() => {
    console.log('🐾 PetsPage: Fetching available pets...');
    fetchPets({ status: 'AVAILABLE' })
      .then((result) => {
        console.log('✅ Pets fetched:', result);
      })
      .catch((err) => {
        console.error('❌ Error fetching pets:', err);
      });
  }, []);

  // Apply filters when pets or filter values change
  useEffect(() => {
    console.log('🔄 PetsPage: Applying filters. Pets count:', pets.length);
    console.log('Pets data:', pets);
    
    let filtered = [...pets];

    if (filterSize) {
      filtered = filtered.filter(p => p.size === filterSize);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.breed && p.breed.toLowerCase().includes(term))
      );
    }

    console.log('📊 Filtered pets count:', filtered.length);
    setDisplayPets(filtered);
  }, [pets, filterSize, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSpeciesFilter = async (e) => {
    const species = e.target.value;
    setFilterSpecies(species);

    if (species) {
      fetchPets({ species, status: 'AVAILABLE' });
    } else {
      fetchPets({ status: 'AVAILABLE' });
    }
  };

  const handleSizeFilter = (e) => {
    setFilterSize(e.target.value);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterSpecies('');
    setFilterSize('');
    fetchPets({ status: 'AVAILABLE' });
  };

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>🐾 Encontre seu Companheiro Perfeito</h1>
          <p className={styles.subtitle}>
            Cada pet merece um lar cheio de amor. Explore nossos companheiros esperando por você.
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className={styles.filtersSection}>
        <div className={styles.filtersContainer}>
          <div className={styles.filterGroup}>
            <label htmlFor="search-input" className={styles.filterLabel}>Buscar</label>
            <input
              id="search-input"
              type="text"
              placeholder="Nome ou raça..."
              value={searchTerm}
              onChange={handleSearch}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="species-filter" className={styles.filterLabel}>Espécie</label>
            <select
              id="species-filter"
              value={filterSpecies}
              onChange={handleSpeciesFilter}
              className={styles.filterSelect}
            >
              <option value="">Todas</option>
              <option value="DOG">🐕 Cães</option>
              <option value="CAT">🐱 Gatos</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="size-filter" className={styles.filterLabel}>Tamanho</label>
            <select
              id="size-filter"
              value={filterSize}
              onChange={handleSizeFilter}
              className={styles.filterSelect}
            >
              <option value="">Todos</option>
              <option value="SMALL">Pequeno</option>
              <option value="MEDIUM">Médio</option>
              <option value="LARGE">Grande</option>
              <option value="XLARGE">Extra Grande</option>
            </select>
          </div>
        </div>

        {/* Results Counter */}
        {!loading && (
          <div className={styles.resultsInfo}>
            Mostrando <strong>{displayPets.length}</strong> {displayPets.length === 1 ? 'pet' : 'pets'}
            {filterSize && ` de tamanho ${filterSize.toLowerCase()}`}
            {searchTerm && ` correspondendo a "${searchTerm}"`}
          </div>
        )}
      </section>

      {/* Loading State */}
      {loading && (
        <section className={styles.stateContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Carregando nossos companheiros...</p>
        </section>
      )}

      {/* Error State */}
      {error && !loading && (
        <section className={styles.stateContainer}>
          <p className={styles.errorMessage}>❌ {error}</p>
        </section>
      )}

      {/* Empty State */}
      {!loading && !error && displayPets.length === 0 && (
        <section className={styles.stateContainer}>
          <p className={styles.emptyMessage}>
            😢 Nenhum pet encontrado com esses filtros.
          </p>
          <button
            className={styles.resetButton}
            onClick={handleResetFilters}
          >
            Limpar filtros
          </button>
        </section>
      )}

      {/* Pets Grid */}
      {!loading && !error && displayPets.length > 0 && (
        <section className={styles.grid}>
          {displayPets.map((pet) => (
            <Link key={pet.id} href={`/pets/${pet.id}`}>
              <div className={styles.petCard}>
                {/* Image Container */}
                <div className={styles.imageContainer}>
                  <div className={styles.imagePlaceholder}>
                    {pet.photos && pet.photos.length > 0 ? (
                      <img
                        src={pet.photos[0].url}
                        alt={pet.name}
                        className={styles.petImage}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x300?text=Sem+foto';
                        }}
                      />
                    ) : (
                      <div className={styles.noImagePlaceholder}>
                        <span className={styles.noImageIcon}>
                          {SPECIES_ICONS[pet.species] || '🐾'}
                        </span>
                        <p>Sem foto</p>
                      </div>
                    )}
                  </div>
                  {/* Status Badge */}
                  <div className={styles.statusBadge}>
                    <span className={styles.badgeText}>✨ Disponível</span>
                  </div>
                  {/* Species Icon */}
                  <div className={styles.speciesIcon}>
                    {SPECIES_ICONS[pet.species] || '🐾'}
                  </div>
                </div>

                {/* Content */}
                <div className={styles.cardContent}>
                  {/* Pet Name */}
                  <h2 className={styles.petName}>{pet.name}</h2>

                  {/* Breed and Size */}
                  <div className={styles.petMeta}>
                    <span className={styles.breed}>{pet.breed}</span>
                    <span className={styles.metaSeparator}>•</span>
                    <span className={styles.size}>{SIZE_ICONS[pet.size]} {pet.size.charAt(0) + pet.size.slice(1).toLowerCase()}</span>
                  </div>

                  {/* Description */}
                  <p className={styles.description}>
                    {pet.description && pet.description.substring(0, 85)}
                    {pet.description && pet.description.length > 85 ? '...' : ''}
                  </p>

                  {/* Quick Info Badges */}
                  <div className={styles.quickInfoBadges}>
                    <div className={styles.badge}>
                      <span className={styles.badgeIcon}>📅</span>
                      <span className={styles.badgeText}>
                        {pet.age} {pet.age === 1 || pet.age === '1' ? 'ano' : 'anos'}
                      </span>
                    </div>

                    <div className={styles.badge}>
                      <span className={styles.badgeIcon}>
                        {pet.gender === 'MALE' ? '🐕‍🦺' : '👑'}
                      </span>
                      <span className={styles.badgeText}>
                        {pet.gender === 'MALE' ? 'Macho' : 'Fêmea'}
                      </span>
                    </div>

                    <div className={styles.badge}>
                      <span className={styles.badgeIcon}>
                        {pet.is_vaccinated ? '💉' : '❌'}
                      </span>
                      <span className={styles.badgeText}>
                        {pet.is_vaccinated ? 'Vacinado' : 'Não vacinado'}
                      </span>
                    </div>

                    <div className={styles.badge}>
                      <span className={styles.badgeIcon}>
                        {pet.is_neutered ? '✂️' : '❌'}
                      </span>
                      <span className={styles.badgeText}>
                        {pet.is_neutered ? 'Castrado' : 'Não castrado'}
                      </span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className={styles.ctaSection}>
                    <button className={styles.detailsButton}>
                      Ver Detalhes →
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
