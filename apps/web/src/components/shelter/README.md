# Shelter Management Components

This directory contains components and utilities for shelter profile management in the PetAdopt platform.

## Components

### ShelterForm
A comprehensive form component for creating and editing shelter profiles.

**Features:**
- Validation of all required fields (name, address, city, state, zipCode, phone, email)
- Optional fields (website, description)
- Logo upload and preview
- Multiple photo gallery with drag-and-drop support (up to 10 images)
- Image validation (format and size)
- Real-time error feedback
- Responsive design for mobile and desktop

**Props:**
```javascript
{
  shelter?: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    email: string;
    website?: string;
    description?: string;
    logo?: string;
    images?: string[];
  };
  onSuccess?: (result: ShelterData) => void;
}
```

**Usage:**
```javascript
import { ShelterForm } from '@/components/shelter';

export default function ShelterPage() {
  return (
    <ShelterForm 
      onSuccess={(shelter) => console.log('Shelter saved:', shelter)}
    />
  );
}
```

### ShelterInfo
A display component showing shelter information on pet detail pages.

**Features:**
- Logo and basic information display
- Contact details (phone, email, website)
- Adoption statistics (pets total, adopted, adoption rate)
- Photo gallery preview
- Verified badge
- Link to full shelter profile

**Props:**
```javascript
{
  shelter: {
    id: string;
    name: string;
    city: string;
    state: string;
    logo?: string;
    images?: string[];
    phone: string;
    email: string;
    website?: string;
    description?: string;
    isVerified: boolean;
  };
  adoptionStats?: {
    totalPets: number;
    adoptedCount: number;
    adoptionRate: number;
  };
}
```

**Usage:**
```javascript
import { ShelterInfo } from '@/components/shelter';

export default function PetDetail({ pet }) {
  return (
    <ShelterInfo 
      shelter={pet.shelter}
      adoptionStats={{
        totalPets: 50,
        adoptedCount: 35,
        adoptionRate: 70
      }}
    />
  );
}
```

## API Routes

### POST /api/shelters
Create a new shelter profile.

**Requirements:**
- Authentication required
- User must be SHELTER_ADMIN type
- Only one shelter per admin

**Body:**
```json
{
  "name": "Abrigo ABC",
  "address": "Rua Principal 123",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01310-100",
  "phone": "(11) 3333-3333",
  "email": "contact@abrigo.com",
  "website": "https://abrigo.com",
  "description": "Abrigo dedicado a animais",
  "logo": "https://example.com/logo.jpg",
  "images": ["https://example.com/photo1.jpg"]
}
```

### GET /api/shelters
List all shelters with filters and pagination.

**Query Parameters:**
- `search`: Filter by name, city, or description
- `adminId`: Filter by admin user ID (for dashboard)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12, max: 50)

**Response:**
```json
{
  "data": [
    {
      "id": "shelter-1",
      "name": "Abrigo ABC",
      "city": "São Paulo",
      "state": "SP",
      "logo": "https://example.com/logo.jpg",
      "images": [],
      "phone": "(11) 3333-3333",
      "email": "contact@abrigo.com",
      "isVerified": false,
      "availablePetsCount": 5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 25,
    "pages": 3
  }
}
```

### GET /api/shelters/[id]
Get detailed information about a specific shelter.

**Response:**
```json
{
  "id": "shelter-1",
  "name": "Abrigo ABC",
  "address": "Rua Principal 123",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01310-100",
  "phone": "(11) 3333-3333",
  "email": "contact@abrigo.com",
  "website": "https://abrigo.com",
  "description": "Abrigo dedicado a animais",
  "logo": "https://example.com/logo.jpg",
  "images": [],
  "isVerified": false,
  "admin": {
    "id": "user-1",
    "name": "João Silva"
  },
  "availablePetsCount": 5,
  "adoptionStats": {
    "totalPets": 50,
    "adoptedCount": 35,
    "availableCount": 5,
    "adoptionRate": 70
  }
}
```

### PATCH /api/shelters/[id]
Update shelter information.

**Requirements:**
- Authentication required
- Must be the shelter admin

**Body:**
Same as POST with partial fields allowed.

### GET /api/shelters/[id]/stats
Get adoption statistics for a shelter.

**Response:**
```json
{
  "shelterId": "shelter-1",
  "petStats": {
    "total": 50,
    "available": 5,
    "pending": 2,
    "adopted": 43,
    "adoptionRate": 86
  },
  "adoptionStats": {
    "totalRequests": 45,
    "pending": 2,
    "approved": 1,
    "completed": 43,
    "rejected": 0,
    "successRate": 96,
    "averageAdoptionDays": 14
  }
}
```

## Pages

### /dashboard/shelter
Dashboard for shelter management.

**Features:**
- View shelter profile
- Edit shelter information
- View adoption statistics
- Links to pet management and adoption requests

### /shelters
Public list of all shelters.

**Features:**
- Browse all shelters
- Search by name or city
- Pagination
- View available pets per shelter

### /shelters/[id]
Detailed public profile of a specific shelter.

**Features:**
- Shelter logo and photos
- Contact information
- Adoption statistics
- List of available pets
- Success stories

## Requirements Validation

This module implements the following requirements:

- **11.1**: Shelter profile creation
- **11.2**: Mandatory field validation (name, address, contact info)
- **11.4**: Logo and photo uploads
- **11.5**: Shelter information displayed on pet detail pages
- **11.6**: Adoption statistics tracking
- **11.7**: Multi-user support (infrastructure for future staff management)

## File Structure

```
/shelter
├── ShelterForm/
│   ├── ShelterForm.js       # Main form component
│   └── ShelterForm.module.css
├── ShelterInfo/
│   ├── ShelterInfo.js       # Display component
│   └── ShelterInfo.module.css
├── README.md                # This file
└── index.js                 # Component exports
```

## Related API Routes

- `/api/shelters/` - Shelter management
- `/api/shelters/[id]/stats` - Adoption statistics
- `/api/pets` - Pet filtering by shelter

## Related Pages

- `/dashboard/shelter` - Shelter management dashboard
- `/shelters` - Public shelters list
- `/shelters/[id]` - Public shelter profile
- `/pets/[id]` - Pet detail (includes ShelterInfo)

## Error Handling

All components and API routes include comprehensive error handling:

- Input validation with clear error messages
- Network error recovery
- File upload validation (format, size)
- Authorization checks
- Database constraint handling

## Accessibility

Components follow accessibility best practices:

- Semantic HTML
- ARIA labels on interactive elements
- Keyboard navigation support
- Touch-friendly buttons and controls
- Responsive design for all screen sizes

## Performance Considerations

- Images are optimized with Next.js Image component
- Shelter data is cached with ISR (Incremental Static Regeneration)
- API responses are paginated
- Database queries are optimized with proper indexes

## Testing

Unit tests included:
- Data validation tests
- Authorization tests
- Image handling tests
- Statistics calculation tests

See `/src/app/api/shelters/__tests__/shelters.test.js` for test examples.

## Future Enhancements

- [ ] Staff member management (multiple users per shelter)
- [ ] Role-based permissions (admin, staff, viewer)
- [ ] Shelter verification workflow
- [ ] Analytics dashboard
- [ ] Export adoption statistics
- [ ] Bulk pet upload
- [ ] Social media integration
- [ ] Ratings and reviews
