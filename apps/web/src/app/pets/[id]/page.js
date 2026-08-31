import { notFound } from 'next/navigation';
import { PetDetailsPage } from './PetDetailsPage';
import { fetchPetById } from '@/lib/pets';

/**
 * Pet Details Page - Server Component
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

export async function generateMetadata({ params }) {
  try {
    const { id } = await params;
    const pet = await fetchPetById(id);
    
    if (!pet) {
      return {
        title: 'Pet não encontrado - PetAdopt',
        description: 'O pet que você está procurando não foi encontrado.'
      };
    }

    const title = `${pet.name} - ${pet.breed} ${pet.species === 'DOG' ? 'Cachorro' : 'Gato'} para Adoção`;
    const description = `Conheça ${pet.name}, ${pet.breed} ${pet.gender === 'MALE' ? 'macho' : 'fêmea'}, ${pet.age} anos, ${pet.size.toLowerCase()} porte. ${pet.description.slice(0, 150)}...`;

    return {
      title,
      description,
      keywords: [
        'adoção de pets',
        `${pet.species === 'DOG' ? 'cachorro' : 'gato'} para adoção`,
        pet.breed,
        pet.location,
        `${pet.size.toLowerCase()} porte`,
        pet.name
      ].join(', '),
      openGraph: {
        title,
        description,
        type: 'website',
        images: pet.images && pet.images.length > 0 ? [
          {
            url: pet.images[0],
            width: 800,
            height: 600,
            alt: `Foto de ${pet.name}`
          }
        ] : ['/images/og-pet-default.jpg']
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: pet.images && pet.images.length > 0 ? [pet.images[0]] : ['/images/og-pet-default.jpg']
      }
    };
  } catch (error) {
    return {
      title: 'Pet não encontrado - PetAdopt',
      description: 'O pet que você está procurando não foi encontrado.'
    };
  }
}

export default async function PetDetailPage({ params }) {
  try {
    const { id } = await params;
    
    // Fetch pet data on the server
    const pet = await fetchPetById(id);
    
    if (!pet) {
      notFound();
    }

    return <PetDetailsPage pet={pet} />;
    
  } catch (error) {
    console.error('Error loading pet details:', error);
    notFound();
  }
}

// Generate static params for popular pets (optional optimization)
export async function generateStaticParams() {
  // This could fetch popular pet IDs for static generation
  // For now, we'll skip this to keep it simple
  return [];
}