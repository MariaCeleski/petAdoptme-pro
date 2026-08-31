# Deployment Guide

## Development Environment

\`\`\`bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env.local
pnpm db:migrate
pnpm dev
\`\`\`

## Staging Environment

Deploy to Vercel Preview (automatic on PR):

\`\`\`bash
git push origin feature/branch
# Open PR on GitHub → Vercel auto-deploys
\`\`\`

## Production Environment

### Frontend (Vercel)

1. Connect GitHub repository to Vercel
2. Set production environment variables
3. Deploy:

\`\`\`bash
git push origin main
# Vercel auto-deploys on main push
\`\`\`

### Backend (Vercel or Railway)

Option A - Vercel:
1. Create serverless API in Vercel
2. Configure environment variables
3. Deploy via Git push

Option B - Railway/Render:
1. Create Node.js application
2. Connect GitHub repository  
3. Set environment variables
4. Auto-deploys on main push

### Database (Supabase)

1. Create PostgreSQL database on Supabase
2. Run migrations:

\`\`\`bash
pnpm db:migrate --prod
\`\`\`

3. Seed production data:

\`\`\`bash
pnpm db:seed --prod
\`\`\`

### Environment Variables

**Frontend** (.env.production):
\`\`\`
NEXTAUTH_URL=https://petadopt.com
NEXT_PUBLIC_API_URL=https://api.petadopt.com
\`\`\`

**Backend** (.env.production):
\`\`\`
DATABASE_URL=postgresql://prod-connection-string
NODE_ENV=production
\`\`\`

## Monitoring

- Frontend: Vercel Analytics
- Backend: Application logging (Cloud Logging)
- Database: Supabase monitoring
- Errors: Sentry integration

## Rollback

\`\`\`bash
git revert <commit-hash>
git push origin main
\`\`\`

## Performance Optimization

- Enable CDN caching on Vercel
- Compress images before upload
- Use database connection pooling
- Implement API rate limiting
