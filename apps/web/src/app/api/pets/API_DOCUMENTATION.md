# Pets API Documentation

## Overview

This API provides comprehensive CRUD operations for pet management in the PetAdopt platform. All endpoints support proper authentication, authorization, data validation, and error handling.

**Base URL**: `/api/pets`

## Authentication

Most endpoints require authentication using NextAuth.js session tokens. The following user types can perform different operations:

- `ADOPTER`: Can view pets but not create/modify them
- `INDIVIDUAL_OWNER`: Can create and manage their own pets
- `SHELTER_ADMIN`: Can create and manage pets associated with their shelter

## Endpoints

### 1. GET /api/pets

**Purpose**: List pets with filtering and pagination support

**Authentication**: Not required (public endpoint)

**Query Parameters**:
- `species` (optional): Filter by species (`DOG` | `CAT`)
- `size` (optional): Filter by size (`SMALL` | `MEDIUM` | `LARGE`)
- `gender` (optional): Filter by gender (`MALE` | `FEMALE`)
- `location` (optional): Filter by location (partial match, case-insensitive)
- `search` or `q` (optional): Text search in pet name and breed (case-insensitive)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 12, max: 50)

**Example Requests**:
```bash
# Get all available pets
GET /api/pets

# Filter by species and size
GET /api/pets?species=DOG&size=LARGE

# Search with pagination
GET /api/pets?search=Golden&page=2&limit=20

# Multiple filters
GET /api/pets?species=CAT&gender=FEMALE&location=São Paulo
```

**Response Format**:
```json
{
  "pets": [
    {
      "id": "c123456789012345678901234",
      "name": "Buddy",
      "species": "DOG",
      "breed": "Golden Retriever",
      "age": "2 anos",
      "size": "LARGE",
      "gender": "MALE",
      "color": "Dourado",
      "description": "Cão muito carinhoso...",
      "isNeutered": true,
      "isVaccinated": true,
      "healthStatus": "Excelente estado de saúde",
      "personality": ["brincalhão", "carinhoso"],
      "images": ["https://cloudinary.com/image1.jpg"],
      "status": "AVAILABLE",
      "location": "São Paulo, SP",
      "createdAt": "2024-01-01T12:00:00Z",
      "updatedAt": "2024-01-01T12:00:00Z",
      "owner": {
        "id": "owner123",
        "name": "João Silva",
        "type": "INDIVIDUAL_OWNER"
      },
      "shelter": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "filters": {
    "species": "DOG",
    "size": null,
    "gender": null,
    "location": null,
    "search": null
  }
}
```

**Requirements Validated**:
- 4.1: Only shows pets with status "AVAILABLE"
- 4.2: Species filter consistency
- 4.3: Size filter consistency
- 4.5: Gender filter consistency
- 4.6: Text search accuracy

### 2. POST /api/pets

**Purpose**: Create a new pet profile

**Authentication**: Required (`INDIVIDUAL_OWNER` | `SHELTER_ADMIN`)

**Request Body**:
```json
{
  "name": "Buddy",
  "species": "DOG",
  "breed": "Golden Retriever",
  "age": "2 anos",
  "size": "LARGE",
  "gender": "MALE",
  "color": "Dourado",
  "description": "Cão muito carinhoso e brincalhão, ideal para famílias com crianças.",
  "isNeutered": true,
  "isVaccinated": true,
  "healthStatus": "Excelente estado de saúde, todas as vacinas em dia",
  "personality": ["brincalhão", "carinhoso", "obediente"],
  "images": ["https://cloudinary.com/image1.jpg", "https://cloudinary.com/image2.jpg"],
  "location": "São Paulo, SP"
}
```

**Required Fields**:
- `name`: Pet name (1-50 characters)
- `species`: `DOG` | `CAT`
- `breed`: Breed name (1-50 characters)
- `age`: Age description (e.g., "2 anos", "6 meses", "filhote")
- `size`: `SMALL` | `MEDIUM` | `LARGE`
- `gender`: `MALE` | `FEMALE`
- `color`: Pet color (1-30 characters)
- `description`: Pet description (10-1000 characters)

**Optional Fields**:
- `isNeutered`: Boolean (default: false)
- `isVaccinated`: Boolean (default: false)
- `healthStatus`: Health information (max 500 characters)
- `personality`: Array of personality traits (max 10 items)
- `images`: Array of image URLs (max 10 images)
- `location`: Location information (max 100 characters)

**Response**: Same format as GET individual pet + success message

**Requirements Validated**:
- 2.1: Pet profile creation for authorized users
- 2.2: Mandatory field validation
- 2.4: Data validation before database save

### 3. GET /api/pets/[id]

**Purpose**: Get detailed information for a specific pet

**Authentication**: Not required (public endpoint)

**Path Parameters**:
- `id`: Pet ID (must be valid CUID format)

**Response Format**:
```json
{
  "pet": {
    "id": "c123456789012345678901234",
    "name": "Buddy",
    "species": "DOG",
    "breed": "Golden Retriever",
    "age": "2 anos",
    "size": "LARGE",
    "gender": "MALE",
    "color": "Dourado",
    "description": "Cão muito carinhoso...",
    "isNeutered": true,
    "isVaccinated": true,
    "healthStatus": "Excelente estado de saúde",
    "personality": ["brincalhão", "carinhoso"],
    "images": ["https://cloudinary.com/image1.jpg"],
    "status": "AVAILABLE",
    "location": "São Paulo, SP",
    "createdAt": "2024-01-01T12:00:00Z",
    "updatedAt": "2024-01-01T12:00:00Z",
    "owner": {
      "id": "owner123",
      "name": "João Silva",
      "email": "joao@email.com",
      "type": "INDIVIDUAL_OWNER"
    },
    "shelter": {
      "id": "shelter123",
      "name": "Abrigo Amor Animal",
      "address": "Rua das Flores, 123",
      "city": "São Paulo",
      "state": "SP",
      "phone": "(11) 99999-9999",
      "email": "contato@abrigo.com",
      "website": "https://abrigo.com",
      "description": "Abrigo dedicado ao resgate..."
    },
    "successStories": [
      {
        "id": "adoption123",
        "completedAt": "2024-01-01T12:00:00Z",
        "adopterName": "Maria Santos"
      }
    ]
  }
}
```

**Requirements Validated**:
- 5.1: Display detailed pet information
- 5.2: Show complete image gallery
- 5.3: Display all pet characteristics and health information
- 5.4: Show pet owner contact information

### 4. PATCH /api/pets/[id]

**Purpose**: Update pet information or status

**Authentication**: Required (must be pet owner)

**Path Parameters**:
- `id`: Pet ID (must be valid CUID format)

**Request Body Options**:

**Option 1 - Status Update Only**:
```json
{
  "status": "PENDING"
}
```

**Option 2 - Full Pet Data Update**:
```json
{
  "name": "Updated Name",
  "species": "DOG",
  "breed": "Updated Breed",
  "age": "3 anos",
  "size": "LARGE",
  "gender": "MALE",
  "color": "Updated Color",
  "description": "Updated description with at least 10 characters.",
  "isNeutered": true,
  "isVaccinated": true,
  "healthStatus": "Updated health status",
  "personality": ["updated", "traits"],
  "images": ["https://cloudinary.com/updated.jpg"],
  "location": "Updated location"
}
```

**Valid Status Values**:
- `AVAILABLE`: Pet is available for adoption
- `PENDING`: Pet has pending adoption requests
- `ADOPTED`: Pet has been adopted
- `UNAVAILABLE`: Pet is temporarily unavailable

**Response**: Same format as GET individual pet + success message

**Requirements Validated**:
- 2.5: Allow pet information editing by owner
- 2.6: Allow pet status changes by owner

### 5. DELETE /api/pets/[id]

**Purpose**: Archive pet (soft delete - does not permanently delete)

**Authentication**: Required (must be pet owner)

**Path Parameters**:
- `id`: Pet ID (must be valid CUID format)

**Business Rules**:
- Cannot delete pets with pending or approved adoptions
- Pet is archived by setting status to `UNAVAILABLE`
- All adoption history is preserved

**Response**:
```json
{
  "message": "Pet archived successfully",
  "pet": {
    "id": "c123456789012345678901234",
    "name": "Buddy",
    "status": "UNAVAILABLE",
    "updatedAt": "2024-01-01T12:00:00Z"
  }
}
```

**Requirements Validated**:
- 2.7: Archive records instead of permanent deletion

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE",
  "details": {}, // Optional additional error details
  "timestamp": "2024-01-01T12:00:00Z",
  "path": "/api/pets/endpoint"
}
```

**Common Error Codes**:
- `VALIDATION_ERROR` (400): Request data validation failed
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): User lacks permission for this operation
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Business rule conflict (e.g., deleting pet with pending adoptions)
- `INTERNAL_ERROR` (500): Server error

## Data Validation Rules

### Pet Data Validation
- **Name**: 1-50 characters, letters, spaces, hyphens, periods only
- **Species**: Must be "DOG" or "CAT"
- **Breed**: 1-50 characters, letters, spaces, hyphens, periods only
- **Age**: Flexible format accepting "2 anos", "6 meses", "filhote", etc.
- **Size**: Must be "SMALL", "MEDIUM", or "LARGE"
- **Gender**: Must be "MALE" or "FEMALE"
- **Color**: 1-30 characters, letters, spaces, hyphens only
- **Description**: 10-1000 characters, substantial content required
- **Health Status**: Optional, max 500 characters
- **Personality**: Array of strings, max 10 items, each 2+ characters
- **Images**: Array of valid URLs, max 10 items, HTTPS only
- **Location**: Optional, max 100 characters

### Filter Validation
- **Page**: Positive integer, max 1000
- **Limit**: Positive integer, max 50
- **Species**: Must be valid enum value if provided
- **Size**: Must be valid enum value if provided
- **Gender**: Must be valid enum value if provided
- **Search**: Max 100 characters if provided
- **Location**: Max 100 characters if provided

## Security Features

1. **Input Sanitization**: All inputs are sanitized against XSS and injection attacks
2. **Authentication**: Session-based authentication using NextAuth.js
3. **Authorization**: Role-based access control for different operations
4. **Rate Limiting**: Applied via Next.js middleware (configured separately)
5. **Data Validation**: Comprehensive validation using Zod schemas
6. **Error Handling**: Structured error responses without sensitive data exposure

## Usage Examples

### JavaScript/Fetch Examples

```javascript
// Get all pets with filters
const response = await fetch('/api/pets?species=DOG&size=LARGE&page=1');
const data = await response.json();

// Get specific pet
const petResponse = await fetch('/api/pets/c123456789012345678901234');
const petData = await petResponse.json();

// Create new pet (requires authentication)
const createResponse = await fetch('/api/pets', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Buddy',
    species: 'DOG',
    breed: 'Golden Retriever',
    age: '2 anos',
    size: 'LARGE',
    gender: 'MALE',
    color: 'Dourado',
    description: 'Cão muito carinhoso e brincalhão.'
  })
});

// Update pet status (requires authentication and ownership)
const updateResponse = await fetch('/api/pets/c123456789012345678901234', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'PENDING'
  })
});

// Archive pet (requires authentication and ownership)
const deleteResponse = await fetch('/api/pets/c123456789012345678901234', {
  method: 'DELETE'
});
```

### React Hook Examples

```javascript
// Custom hook for fetching pets
import { useState, useEffect } from 'react';

export function usePets(filters = {}) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    async function fetchPets() {
      try {
        setLoading(true);
        const params = new URLSearchParams(filters);
        const response = await fetch(`/api/pets?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch pets');
        }
        
        const data = await response.json();
        setPets(data.pets);
        setPagination(data.pagination);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPets();
  }, [JSON.stringify(filters)]);

  return { pets, loading, error, pagination };
}
```

## Testing

The API includes comprehensive test coverage:

- **Unit Tests**: `/src/app/api/pets/__tests__/pets.test.js`
- **Integration Tests**: Test with actual database connections
- **Property-Based Tests**: Validate business rules across input ranges
- **Manual Testing**: `/src/app/api/pets/test-routes.js`

Run tests with:
```bash
npm test -- --testPathPattern=pets
```

## Performance Considerations

1. **Database Indexing**: Indexes on `species`, `status`, `size`, `ownerId` for fast filtering
2. **Pagination**: Default limit of 12 items prevents large response sizes
3. **Selective Fields**: Only necessary fields included in responses
4. **Query Optimization**: Uses efficient Prisma queries with proper includes
5. **Image Optimization**: Images handled separately via Cloudinary integration

## Future Enhancements

1. **Caching**: Add Redis caching for frequently accessed pets
2. **Search**: Implement full-text search with Elasticsearch
3. **Geolocation**: Add distance-based filtering
4. **Favorites**: Allow users to favorite pets
5. **Recommendations**: AI-powered pet recommendations
6. **Bulk Operations**: Batch updates for shelter administrators