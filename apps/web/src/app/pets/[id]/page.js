import { notFound } from 'next/navigation';
import { PetDetailsPage } from './PetDetailsPage';
import { fetchPetById } from '@/lib/pets';

/**
 * Pet Details Page - Server Component
 */

export async function generateMetadata({ params }) {
  try {
    const { id } = await params;
    console.log('🔍 Fetching pet metadata for ID:', id);
    
    const pet = await fetchPetById(id);
    console.log('📊 Pet data fetched:', pet ? `Found ${pet.name}` : 'Not found');
    
    if (!pet) {
      return {
        title: 'Pet não encontrado - PetAdopt',
        description: 'O pet que você está procurando não foi encontrado.'
      };
    }

    const title = `${pet.name} para Adoção`;
    const description = `Conheça ${pet.name}, ${pet.breed}.`;

    return {
      title,
      description,
      keywords: ['adoção de pets', pet.breed, pet.location].join(', '),
    };
  } catch (error) {
    console.error('❌ Metadata error:', error);
    return {
      title: 'Pet não encontrado - PetAdopt',
      description: 'O pet que você está procurando não foi encontrado.'
    };
  }
}

export default async function PetDetailPage({ params }) {
  try {
    const { id } = await params;
    console.log('📄 Page.js - Loading pet with ID:', id);
    
    // Fetch pet data on the server
    const pet = await fetchPetById(id);
    console.log('✅ Pet data loaded:', pet ? `${pet.name}` : 'No pet found');
    
    if (!pet) {
      console.log('⚠️ Pet not found, showing not-found page');
      notFound();
    }

    console.log('🎨 Rendering PetDetailsPage with pet:', pet.name);
    return <PetDetailsPage pet={pet} />;
    
  } catch (error) {
    console.error('❌ Error loading pet details:', error);
    notFound();
  }
}

// Generate static params for popular pets (optional optimization)
export async function generateStaticParams() {
  return [];
}
