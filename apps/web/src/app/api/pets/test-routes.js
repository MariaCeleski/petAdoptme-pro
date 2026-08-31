/**
 * Test file for pets API routes
 * This is for development testing purposes
 */

// Test data for creating a pet
export const testPetData = {
  name: "Buddy",
  species: "DOG", 
  breed: "Golden Retriever",
  age: "2 anos",
  size: "LARGE",
  gender: "MALE",
  color: "Dourado",
  description: "Um cão muito carinhoso e brincalhão, ideal para famílias com crianças. Adora correr e brincar no quintal.",
  isNeutered: true,
  isVaccinated: true,
  healthStatus: "Excelente estado de saúde, todas as vacinas em dia",
  personality: ["brincalhão", "carinhoso", "obediente"],
  images: [],
  location: "São Paulo, SP"
};

// Test filters
export const testFilters = {
  species: "DOG",
  size: "LARGE", 
  gender: "MALE",
  search: "Golden",
  page: "1",
  limit: "10"
};

// Function to test GET /api/pets
export async function testGetPets() {
  try {
    const url = new URL('/api/pets', process.env.NEXTAUTH_URL || 'http://localhost:3000');
    
    // Add test filters
    Object.entries(testFilters).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString());
    const data = await response.json();
    
    console.log('GET /api/pets test result:', {
      status: response.status,
      ok: response.ok,
      pets: data.pets?.length || 0,
      pagination: data.pagination,
      filters: data.filters
    });
    
    return data;
  } catch (error) {
    console.error('GET /api/pets test error:', error);
    return null;
  }
}

// Function to test GET /api/pets/[id]
export async function testGetPetById(id) {
  try {
    const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/pets/${id}`;
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('GET /api/pets/[id] test result:', {
      status: response.status,
      ok: response.ok,
      petName: data.pet?.name,
      petStatus: data.pet?.status
    });
    
    return data;
  } catch (error) {
    console.error('GET /api/pets/[id] test error:', error);
    return null;
  }
}

// Note: POST, PATCH, DELETE require authentication and should be tested with proper session
export const authRequiredMessage = 'POST, PATCH, DELETE endpoints require authentication and should be tested with proper user session';