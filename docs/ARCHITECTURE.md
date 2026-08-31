# Architecture

## Monorepo Structure

**Frontend**: Next.js 16 + React 19 + CSS Modules
**Backend**: Node.js + Express + Prisma ORM  
**Database**: PostgreSQL via Supabase
**Auth**: NextAuth.js + Google OAuth
**Storage**: Cloudinary for images
**Email**: SendGrid for notifications
**Build**: Turbo + pnpm workspaces

## Directory Layout

```
apps/
├── web/              # Frontend Next.js
│   ├── src/app/     # App Router (layout, pages)
│   ├── src/components/
│   ├── src/lib/
│   └── src/hooks/
│
└── api/              # Backend Express
    ├── src/routes/  # API endpoints
    ├── src/controllers/
    ├── src/services/
    └── prisma/      # Database schema
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Backend | Express, Node.js, Prisma |
| Database | PostgreSQL (Supabase) |
| Auth | NextAuth.js, JWT |
| Storage | Cloudinary |
| Email | SendGrid/Resend |
| Build | Turbo, pnpm |
| Testing | Jest, fast-check |

## Data Models

**User**: Authentication + profile info
**Pet**: Animal profile with details
**Adoption**: Request workflow (PENDING → APPROVED/REJECTED → COMPLETED)
**Shelter**: Organization profile
**Account/Session**: NextAuth tables

## API Design

RESTful endpoints:
- `GET /api/pets` - List all available pets
- `GET /api/pets/:id` - Pet details
- `POST /api/pets` - Create pet (authenticated)
- `POST /api/adoptions` - Submit adoption request
- `PATCH /api/adoptions/:id` - Update adoption status

## Performance

- Server Components for faster initial load
- Image optimization with Cloudinary
- Database indexing on frequently queried fields
- Turbo parallel builds and caching

## Security

- HTTPS required
- Input validation (Zod schemas)
- Rate limiting on API
- CSRF protection
- SQL injection prevention (Prisma)
- Password hashing (bcrypt)
- JWT session management
