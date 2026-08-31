'use client';

import { useState, useEffect } from 'react';
import { PetCard, PetDetails, PetForm, PetList } from '@/components/pets';
import { Card, Button, OptimizedImage } from '@/components/ui';
import styles from './page.module.css';

// Mock pet data for testing
const mockPet = {
  id: 'test-pet-1',
  name: 'Buddy',
  species: 'DOG',
  breed: 'Labrador Retriever',
  age: '2 anos',
  size: 'LARGE',
  gender: 'MALE',
  color: 'Dourado',
  description: 'Buddy é um cão muito carinhoso e brincalhão. Adora crianças e se dá bem com outros animais. Está procurando por uma família que possa dar muito amor e atenção.',
  isNeutered: true,
  isVaccinated: true,
  healthStatus: 'Saudável, todas as vacinas em dia',
  personality: ['Brincalhão', 'Carinhoso', 'Energético', 'Sociável'],
  images: [
    'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=600&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&h=600&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&h=600&fit=crop&crop=faces'
  ],
  status: 'APPROVED',
  location: 'São Paulo, SP',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  owner: {
    id: 'owner-1',
    name: 'Maria Silva',
    type: 'INDIVIDUAL_OWNER'
  }
};

const mockPets = Array.from({ length: 12 }, (_, i) => ({
  ...mockPet,
  id: `test-pet-${i + 1}`,
  name: `Pet ${i + 1}`,
  breed: ['Labrador', 'Golden Retriever', 'Beagle', 'Poodle'][i % 4],
  size: ['SMALL', 'MEDIUM', 'LARGE'][i % 3],
  gender: i % 2 === 0 ? 'MALE' : 'FEMALE'
}));

export default function TestPetManagementPage() {
  const [activeTab, setActiveTab] = useState('cards');
  const [showForm, setShowForm] = useState(false);

  const handlePetSubmit = async (petData) => {
    console.log('Pet form submitted:', petData);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowForm(false);
  };

  const handleInterestClick = (pet) => {
    console.log('Interest clicked for:', pet.name);
  };

  const handleFavoriteToggle = (pet, isFavorite) => {
    console.log(`${isFavorite ? 'Added' : 'Removed'} ${pet.name} to favorites`);
  };

  return (
    <div className={styles.testPage}>
      <header className={styles.header}>
        <h1>Pet Management Components Test</h1>
        <p>Testing the enhanced pet management components with optimization features</p>
      </header>

      <nav className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'cards' ? styles.active : ''}`}
          onClick={() => setActiveTab('cards')}
        >
          Pet Cards
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'list' ? styles.active : ''}`}
          onClick={() => setActiveTab('list')}
        >
          Pet List
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'details' ? styles.active : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Pet Details
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'form' ? styles.active : ''}`}
          onClick={() => setActiveTab('form')}
        >
          Pet Form
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'optimized-image' ? styles.active : ''}`}
          onClick={() => setActiveTab('optimized-image')}
        >
          Optimized Images
        </button>
      </nav>

      <main className={styles.content}>
        {activeTab === 'cards' && (
          <section>
            <h2>PetCard Variants</h2>
            <div className={styles.cardsGrid}>
              <div>
                <h3>Default Card</h3>
                <PetCard
                  pet={mockPet}
                  onInterestClick={handleInterestClick}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              </div>
              
              <div>
                <h3>Featured Card</h3>
                <PetCard.Featured
                  pet={mockPet}
                  onInterestClick={handleInterestClick}
                  onFavoriteToggle={handleFavoriteToggle}
                  isFavorite={true}
                />
              </div>
              
              <div>
                <h3>Compact Card</h3>
                <PetCard.Compact
                  pet={mockPet}
                  onInterestClick={handleInterestClick}
                />
              </div>
            </div>
          </section>
        )}

        {activeTab === 'list' && (
          <section>
            <h2>PetList with Infinite Scroll</h2>
            <PetList
              initialPets={mockPets.slice(0, 6)}
              initialPagination={{
                page: 1,
                totalPages: 2,
                total: 12,
                hasNextPage: true
              }}
              onInterestClick={handleInterestClick}
              onFavoriteToggle={handleFavoriteToggle}
              favoritePetIds={['test-pet-1', 'test-pet-3']}
              enableInfiniteScroll={false} // Disable for testing
            />
          </section>
        )}

        {activeTab === 'details' && (
          <section>
            <h2>PetDetails with Enhanced Gallery</h2>
            <PetDetails
              pet={mockPet}
              onInterestClick={handleInterestClick}
              onFavoriteToggle={handleFavoriteToggle}
              isFavorite={false}
            />
          </section>
        )}

        {activeTab === 'form' && (
          <section>
            <h2>PetForm with Image Upload</h2>
            {!showForm ? (
              <Button onClick={() => setShowForm(true)}>
                Show Pet Form
              </Button>
            ) : (
              <PetForm
                onSubmit={handlePetSubmit}
                onCancel={() => setShowForm(false)}
                mode="create"
              />
            )}
          </section>
        )}

        {activeTab === 'optimized-image' && (
          <section>
            <h2>OptimizedImage Component</h2>
            <div className={styles.imageTestGrid}>
              <div>
                <h3>Default Optimized Image</h3>
                <OptimizedImage
                  src={mockPet.images[0]}
                  alt="Test image"
                  width={400}
                  height={300}
                />
              </div>
              
              <div>
                <h3>Card Variant</h3>
                <OptimizedImage.Card
                  src={mockPet.images[1]}
                  alt="Test card image"
                  width={300}
                  height={225}
                />
              </div>
              
              <div>
                <h3>Thumbnail Variant</h3>
                <OptimizedImage.Thumbnail
                  src={mockPet.images[2]}
                  alt="Test thumbnail"
                  width={100}
                  height={100}
                />
              </div>
              
              <div>
                <h3>Error Handling (Bad URL)</h3>
                <OptimizedImage
                  src="https://invalid-url.jpg"
                  alt="Test error handling"
                  width={300}
                  height={225}
                  fallbackSrc={mockPet.images[0]}
                />
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}