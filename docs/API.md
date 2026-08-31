# API Documentation

## Base URL
`http://localhost:3001/api` (development)

## Authentication
All protected endpoints require `Authorization: Bearer <token>` header from NextAuth session.

## Endpoints

### Pets

**GET /pets**
List all available pets with optional filters.

Query params:
- `species` (DOG|CAT)
- `size` (SMALL|MEDIUM|LARGE)
- `gender` (MALE|FEMALE)
- `location` (string)
- `q` (search text)

Response:
\`\`\`json
[
  {
    "id": "pet123",
    "name": "Buddy",
    "species": "DOG",
    "breed": "Labrador",
    "age": "2 years",
    "size": "LARGE",
    "gender": "MALE",
    "status": "AVAILABLE",
    "images": ["url1", "url2"],
    "owner": { "name": "Shelter ABC" }
  }
]
\`\`\`

**GET /pets/:id**
Get detailed pet information.

**POST /pets** (Authenticated)
Create new pet profile.

Body:
\`\`\`json
{
  "name": "Buddy",
  "species": "DOG",
  "breed": "Labrador",
  "age": "2 years",
  "size": "LARGE",
  "gender": "MALE",
  "description": "Friendly and energetic"
}
\`\`\`

### Adoptions

**POST /adoptions** (Authenticated)
Submit adoption request.

Body:
\`\`\`json
{
  "petId": "pet123",
  "adopterInfo": {
    "personalInfo": { "fullName": "John", "phone": "..." },
    "livingSituation": { "housingType": "house", "hasYard": true },
    "motivation": { "whyAdopt": "..." }
  }
}
\`\`\`

**PATCH /adoptions/:id** (Authenticated)
Update adoption status (Pet owner only).

Body:
\`\`\`json
{
  "status": "APPROVED|REJECTED|COMPLETED",
  "rejectionReason": "optional"
}
\`\`\`

### Auth

**POST /auth/register**
Register new user.

**POST /auth/login**
Login user (handled by NextAuth).

**GET /auth/session** (Authenticated)
Get current user session.

## Error Responses

\`\`\`json
{
  "error": "Human readable message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T12:00:00Z",
  "path": "/api/endpoint"
}
\`\`\`

Status codes:
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `500` - Server error
