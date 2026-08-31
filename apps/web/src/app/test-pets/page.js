/**
 * Test page for Pet Management Components
 * This page demonstrates all implemented pet components
 */

'use client';

import { useState } from 'react';
import { PetCard, PetForm, PetDetails, PetList } from '@/components/pets';
import { Button, Card } from '@/components/ui';

// Mock data for testing
const mockPet = {
  id: '1',
  name: 'Buddy',
  species: 'DOG',
  breed: 'Labrador',
  age: '2 anos',
  size: 'LARGE',
  gender: 'MALE',
  color: 'Dourado',
  description: 'Buddy é um cão muito carinhoso e brincalhão. Adora crianças e outros pets. Está procurando uma família que tenha tempo para brincadeiras e caminhadas.',
  isNeutered: true,
  isVaccinated: true,
  healthStatus: 'Saudável, com todas as vacinas em dia',
  personality: ['Brincalhão', 'Carinhoso', 'Energético', 'Sociável'],
  images: [
    'https://images.unsplash.com/photo-1552053831-71594a27632d?w=500',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500'
  ],
  status: 'APPROVED',
  location: 'São Paulo, SP',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  owner: {
    id: '1',
    name: 'João Silva',
    email: 'joao@example.com',
    avatar: null
  },
  shelter: null
};

const mockPets = Array.from({ length: 8 }, (_, i) => ({
  ...mockPet,
  id: `${i + 1}`,
  name: `Pet ${i + 1}`,
  breed: ['Labrador', 'Golden', 'Poodle', 'Vira-lata', 'Beagle'][i % 5],
  age: [`${i + 1} anos`, 'Filhote', 'Adulto', 'Idoso'][i % 4],
  size: ['SMALL', 'MEDIUM', 'LARGE'][i % 3],
  images: [
    `https://images.unsplash.com/photo-155205383${i}-71594a27632d?w=500`
  ]
}));

export default function TestPetsPage() {
  const [activeTab, setActiveTab] = useState('list');
  const [showForm, setShowForm] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  const handleInterestClick = (pet) => {
    alert(`Interesse manifestado no pet: ${pet.name}`);
  };

  const handleFavoriteToggle = (pet, isFavorite) => {
    console.log(`${pet.name} ${isFavorite ? 'adicionado aos' : 'removido dos'} favoritos`);
  };

  const handlePetSubmit = async (petData) => {
    console.log('Pet data submitted:', petData);
    alert('Pet cadastrado com sucesso! (mock)');
    setShowForm(false);
  };

  const tabs = [
    { key: 'list', label: 'Pet List' },
    { key: 'card', label: 'Pet Card' },
    { key: 'details', label: 'Pet Details' },
    { key: 'form', label: 'Pet Form' }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: '#2C3E50' }}>
        Pet Management Components Test
      </h1>

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        borderBottom: '1px solid #ECF0F1',
        paddingBottom: '1rem'
      }}>
        {tabs.map(tab => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? 'primary' : 'outline'}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Pet List Demo */}
      {activeTab === 'list' && (
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h2>Pet List Component</h2>
            <Button onClick={() => setShowForm(true)}>
              Adicionar Pet
            </Button>
          </div>
          
          <PetList
            initialPets={mockPets}
            initialPagination={{
              page: 1,
              limit: 12,
              total: mockPets.length,
              totalPages: 1,
              hasNextPage: false,
              hasPrevPage: false
            }}
            onInterestClick={handleInterestClick}
            onFavoriteToggle={handleFavoriteToggle}
            favoritePetIds={['1', '3']}
            enableInfiniteScroll={false}
          />
        </div>
      )}

      {/* Pet Card Demo */}
      {activeTab === 'card' && (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Pet Card Components</h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <PetCard
              pet={mockPet}
              onInterestClick={handleInterestClick}
              onFavoriteToggle={handleFavoriteToggle}
              isFavorite={false}
            />
            
            <PetCard
              pet={{...mockPet, status: 'PENDING', id: '2'}}
              onInterestClick={handleInterestClick}
              onFavoriteToggle={handleFavoriteToggle}
              isFavorite={true}
            />
            
            <PetCard
              pet={{...mockPet, status: 'ADOPTED', id: '3'}}
              onInterestClick={handleInterestClick}
              onFavoriteToggle={handleFavoriteToggle}
              isFavorite={false}
            />
          </div>

          <h3>Variant Examples</h3>
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            flexWrap: 'wrap',
            marginTop: '1rem'
          }}>
            <PetCard.Featured
              pet={mockPet}
              onInterestClick={handleInterestClick}
              onFavoriteToggle={handleFavoriteToggle}
            />
            
            <PetCard.Compact
              pet={mockPet}
              onInterestClick={handleInterestClick}
              onFavoriteToggle={handleFavoriteToggle}
            />
          </div>
        </div>
      )}

      {/* Pet Details Demo */}
      {activeTab === 'details' && (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Pet Details Component</h2>
          <PetDetails
            pet={mockPet}
            onInterestClick={handleInterestClick}
            onFavoriteToggle={handleFavoriteToggle}
            isFavorite={false}
            showOwnerContact={false}
            successStories={[
              {
                petName: 'Max',
                petImage: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300',
                adoptedAt: '2023-12-01T10:00:00Z'
              },
              {
                petName: 'Luna',
                petImage: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300',
                adoptedAt: '2023-11-15T10:00:00Z'
              }
            ]}
            relatedPets={mockPets.slice(0, 3)}
          />
        </div>
      )}

      {/* Pet Form Demo */}
      {activeTab === 'form' && (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Pet Form Component</h2>
          <Card>
            <Card.Body>
              <PetForm
                onSubmit={handlePetSubmit}
                onCancel={() => console.log('Form cancelled')}
                mode="create"
              />
            </Card.Body>
          </Card>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: '1rem' }}>Adicionar Novo Pet</h3>
            <PetForm
              onSubmit={handlePetSubmit}
              onCancel={() => setShowForm(false)}
              mode="create"
            />
          </div>
        </div>
      )}

      {/* Component Info */}
      <Card style={{ marginTop: '2rem' }}>
        <Card.Header>
          <Card.Title>Componentes Implementados</Card.Title>
        </Card.Header>
        <Card.Body>
          <ul>
            <li><strong>PetCard:</strong> Card responsivo com imagem otimizada, informações básicas e ações</li>
            <li><strong>PetForm:</strong> Formulário completo com upload de imagens, validação Zod e UX otimizada</li>
            <li><strong>PetDetails:</strong> Página de detalhes com galeria, informações completas e relacionados</li>
            <li><strong>PetList:</strong> Lista com infinite scroll, filtros e estados de loading/error</li>
          </ul>
          
          <h4>Features Implementadas:</h4>
          <ul>
            <li>✅ Upload de múltiplas imagens com preview</li>
            <li>✅ Validação client-side com schemas Zod</li>
            <li>✅ Sistema de favoritos</li>
            <li>✅ Infinite scroll e paginação</li>
            <li>✅ Componentes responsivos</li>
            <li>✅ Estados de loading, error e empty</li>
            <li>✅ Acessibilidade com ARIA labels</li>
            <li>✅ Integração com API existente</li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
}