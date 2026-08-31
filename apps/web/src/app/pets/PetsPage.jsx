'use client';

import { useEffect, useState } from 'react';
import { usePets } from '@/hooks/usePets';
import Link from 'next/link';
import styles from './pets.module.css';

export default function PetsPage() {
  const { pets, loading, error, fetchPets, searchPets } = usePets();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('');

  useEffect(() => {
    fetchPets({ status: 'AVAILABLE' });
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    searchPets(term);
  };

  const handleFilterChange = async (e) => {
    const species = e.target.value;
    setFilterSpecies(species);
    
    if (species) {
      await fetchPets({ species, status: 'AVAILABLE' });
    } else {
      await fetchPets({ status: 'AVAILABLE' });
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🐾 Encontre seu Companheiro Perfeito</h1>
      
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Buscar por nome ou raça..."
          value={searchTerm}
          onChange={handleSearch}
          className={styles.searchInput}
        />
        
        <select
          value={filterSpecies}
          onChange={handleFilterChange}
          className={styles.filterSelect}
        >
          <option value="">Todas as espécies</option>
          <option value="DOG">Cães</option>
          <option value="CAT">Gatos</option>
        </select>
      </div>

      {loading && <p className={styles.loading}>Carregando pets...</p>}
      
      {error && <p className={styles.error}>Erro: {error}</p>}
      
      {pets.length === 0 && !loading && (
        <p className={styles.empty}>Nenhum pet encontrado 😢</p>
      )}

      <div className={styles.grid}>
        {pets.map((pet) => (
          <Link key={pet.id} href={`/pets/${pet.id}`}>
            <div className={styles.card}>
              <img 
                src={pet.images?.[0] || 'https://via.placeholder.com/300x300'} 
                alt={pet.name}
                className={styles.image}
              />
              <div className={styles.content}>
                <h2 className={styles.name}>{pet.name}</h2>
                <p className={styles.breed}>{pet.breed}</p>
                <p className={styles.description}>{pet.description.substring(0, 80)}...</p>
                <div className={styles.meta}>
                  <span className={styles.species}>{pet.species === 'DOG' ? '🐕' : '🐱'}</span>
                  <span className={styles.location}>{pet.location}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
