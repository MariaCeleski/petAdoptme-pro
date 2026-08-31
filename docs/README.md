# PetAdopt Platform - Professional Monorepo

Bem-vindo ao PetAdopt, uma plataforma moderna para conectar animais de estimação abandonados com famílias que desejam adotar.

## 🚀 Quick Start

### Pré-requisitos
- **Node.js** 18+ | **pnpm** 8+ | **PostgreSQL** 14+

### Instalação

\`\`\`bash
git clone https://github.com/MariaCeleski/petAdoptme-pro.git
cd petAdoptme-pro
pnpm install
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env.local
pnpm db:migrate
pnpm dev
\`\`\`

## 📋 Estrutura

Frontend: `apps/web/` | Backend: `apps/api/` | Database: `apps/api/prisma/` | Shared: `packages/`

## 🛠️ Comandos

- `pnpm dev` - Start all
- `pnpm build` - Build all
- `pnpm test` - Test all
- `pnpm lint` - Lint all

Veja [ARCHITECTURE.md](./ARCHITECTURE.md), [API.md](./API.md), [DEPLOYMENT.md](./DEPLOYMENT.md), [CONTRIBUTING.md](./CONTRIBUTING.md)
