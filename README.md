# 🐾 PetAdopt - Plataforma de Adoção de Pets

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-16.x-black.svg)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.x-61DAFB.svg)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-2FB67D.svg)](https://supabase.com)
[![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-orange.svg)](#status)

Plataforma digital inovadora que conecta tutores responsáveis com pets esperando por um novo lar. Desenvolvida com foco em experiência do usuário, segurança de dados e bem-estar animal.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Execução](#execução)
- [Reiniciar Servidores](#reiniciar-servidores)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Endpoints](#api-endpoints)
- [Banco de Dados](#banco-de-dados)
- [Testes](#testes)
- [Deploy](#deploy)
- [Troubleshooting](#troubleshooting)
- [Contribuindo](#contribuindo)
- [Suporte](#suporte)

## 🎯 Visão Geral

PetAdopt é uma solução completa para:

- **👨‍👩‍👧‍👦 Adotantes**: Descobrir e adotar pets com segurança
- **👤 Tutores**: Cadastrar pets para adoção com análise de compatibilidade
- **🏠 Abrigos**: Gerenciar múltiplos pets e solicitações de adoção
- **🛡️ Administradores**: Aprovar/rejeitar cadastros com feedback detalhado

## ✨ Funcionalidades

### Fase 1 - MVP (✅ Completo)
- ✅ Autenticação segura com NextAuth.js + JWT
- ✅ Catálogo de pets com filtros avançados
- ✅ Cadastro de pets com até 5 fotos via Cloudinary
- ✅ Dashboard de admin para aprovação/rejeição
- ✅ Design responsivo (mobile, tablet, desktop)
- ✅ E2E testing com Playwright (88+ testes)

### Fase 2 - Adoção (⏳ Em Desenvolvimento)
- ✅ Formulário de adoção com análise de compatibilidade
- ✅ Notificações por email via Resend
- ✅ Gerenciamento de perfil de usuários
- ⏳ Sistema de abrigos com múltiplos tutores
- ⏳ Email verification tokens
- ⏳ Histórico de adoções bem-sucedidas

## 🏗️ Arquitetura

```
PetAdopt (monorepo com pnpm workspaces)
│
├── 📁 apps/
│   ├── api/                          # Backend - Express.js
│   │   ├── src/
│   │   │   ├── controllers/          # Lógica de negócio
│   │   │   ├── routes/               # Definição de rotas API
│   │   │   ├── middleware/           # Auth, validation, error handling
│   │   │   ├── services/             # Cloudinary, Email, Auth, Supabase
│   │   │   └── index.js              # Entry point
│   │   ├── .env.local                # Variáveis de ambiente
│   │   └── package.json
│   │
│   └── web/                          # Frontend - Next.js + React
│       ├── src/
│       │   ├── app/                  # Pages (App Router)
│       │   │   ├── page.js           # Home
│       │   │   ├── pets/             # Catálogo
│       │   │   ├── auth/             # Autenticação
│       │   │   ├── tutores/          # Cadastro de pets
│       │   │   ├── admin/            # Dashboard admin
│       │   │   └── dashboard/        # Dashboard usuário
│       │   ├── components/           # Componentes React
│       │   ├── lib/                  # Utilities
│       │   └── styles/               # CSS global
│       ├── e2e/                      # Testes Playwright
│       ├── .env.local                # Variáveis de ambiente
│       └── package.json
│
├── 📁 packages/
│   └── shared/                       # Schemas Zod compartilhados
│       ├── src/validation/
│       └── package.json
│
├── 📁 docs/
│   ├── migrations/                   # SQL migrations Supabase
│   ├── SUPABASE_SETUP.sql
│   └── README.md
│
├── 📁 scripts/                       # Build & deploy scripts
├── README.md                         # Este arquivo
├── MIGRATION_INSTRUCTIONS.md         # Setup Supabase
├── package.json                      # Root workspace
├── pnpm-workspace.yaml               # Workspace config
└── turbo.json                        # Build cache
```

## 🛠️ Tecnologias

### Frontend
- **Next.js 16.x** - React framework com App Router
- **React 19.x** - UI library
- **NextAuth.js** - Autenticação
- **Zod** - Validação de schemas TypeScript
- **CSS Modules** - Styling com escopo local
- **Playwright** - E2E testing

### Backend
- **Node.js 20.x** - JavaScript runtime
- **Express.js** - Web framework
- **Prisma** - ORM para database
- **bcryptjs** - Password hashing seguro
- **Resend** - Email service
- **Cloudinary** - Image storage & optimization
- **Supabase** - Database (PostgreSQL) + Auth

### DevOps & Infraestrutura
- **Supabase** - Database PostgreSQL + Real-time
- **Cloudinary** - CDN de imagens
- **Resend** - Serviço de email
- **Vercel** - Deploy Frontend
- **Railway/Heroku** - Deploy Backend
- **GitHub Actions** - CI/CD (planejado)

## 📦 Pré-requisitos

Antes de começar, verifique se você tem instalado:

- **Node.js** 20.x ou superior
  ```bash
  node --version  # v20.x ou superior
  ```

- **pnpm** 8.x ou superior
  ```bash
  npm install -g pnpm
  pnpm --version  # 8.x ou superior
  ```

- **Git**
  ```bash
  git --version
  ```

### Contas Online Necessárias

- [Supabase](https://supabase.com) - Database
- [Cloudinary](https://cloudinary.com) - Storage de imagens
- [Resend](https://resend.com) - Email service (opcional para desenvolvimento)

## 🚀 Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/petadopt.git
cd petadopt
```

### 2. Instalar dependências

```bash
pnpm install
```

Isso instalará:
- Dependências do backend (`apps/api`)
- Dependências do frontend (`apps/web`)
- Dependências compartilhadas (`packages/shared`)

### 3. Configurar variáveis de ambiente

Veja a seção [Configuração](#configuração) abaixo.

## ⚙️ Configuração

### Backend - `apps/api/.env.local`

Crie o arquivo `.env.local` na pasta `apps/api`:

```env
# ============================================================
# Server Configuration
# ============================================================
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# ============================================================
# JWT Configuration
# ============================================================
JWT_SECRET=sua-chave-secreta-muito-longa-e-segura-minimo-32-caracteres
JWT_EXPIRY=24h

# ============================================================
# Supabase Database
# ============================================================
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Direct PostgreSQL Connection (opcional)
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres

# ============================================================
# Cloudinary - Upload de Imagens
# ============================================================
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=sua-api-secret

# ============================================================
# Resend - Email Notifications
# ============================================================
RESEND_API_KEY=re_sua-chave-api-real-ou-teste
RESEND_FROM_EMAIL=noreply@seudominio.com
FRONTEND_URL=http://localhost:3000

# ============================================================
# Logging
# ============================================================
LOG_LEVEL=info
```

### Frontend - `apps/web/.env.local`

Crie o arquivo `.env.local` na pasta `apps/web`:

```env
# ============================================================
# API Configuration
# ============================================================
NEXT_PUBLIC_API_URL=http://localhost:3001

# ============================================================
# NextAuth Configuration
# ============================================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=sua-chave-secreta-segura-minimo-32-caracteres

# ============================================================
# Google OAuth (opcional)
# ============================================================
GOOGLE_CLIENT_ID=seu-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-google-client-secret
```

### Como Obter as Credenciais

#### 📍 Supabase
1. Acesse https://supabase.com
2. Crie um novo projeto (ou use existente)
3. Vá em **Settings > API**
4. Copie:
   - **SUPABASE_URL** (Project URL)
   - **SUPABASE_ANON_KEY** (anon public key)
   - **SUPABASE_KEY** (service_role secret)

#### 🖼️ Cloudinary
1. Acesse https://cloudinary.com
2. Faça login/registre-se
3. Vá em **Dashboard**
4. Copie:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

#### 📧 Resend
1. Acesse https://resend.com
2. Crie uma API key em **Tokens**
3. Configure um domínio verificado
4. Copie a **API Key**

## 🎮 Execução

### Desenvolvimento - Terminal Único

Execute ambos os servidores com um comando:

```bash
pnpm dev
```

Isso inicia:
- 🟢 Backend em http://localhost:3001
- 🟢 Frontend em http://localhost:3000

### Desenvolvimento - Terminais Separados

**Terminal 1 - Backend:**

```bash
cd apps/api
pnpm dev
```

Aguarde ver:
```
🚀 PetAdopt API Server Started
Port: 3001
Environment: development
```

**Terminal 2 - Frontend:**

```bash
cd apps/web
pnpm dev
```

Aguarde ver:
```
✓ ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Build para Produção

```bash
# Build ambos os apps
pnpm build

# Build específico
pnpm build --filter=apps/api
pnpm build --filter=apps/web
```

### Start em Produção

```bash
# Backend
cd apps/api && pnpm start

# Frontend
cd apps/web && pnpm start
```

## 🔄 Reiniciar Servidores

### ⚡ Reiniciar Backend

Se o backend travou ou você alterou variáveis de ambiente:

```bash
# Parar o processo (Ctrl+C no terminal)
# Depois:

cd apps/api
rm -rf node_modules/.cache
pnpm dev
```

Ou em um comando:

```bash
cd apps/api && rm -rf node_modules/.cache && pnpm dev
```

### ⚡ Reiniciar Frontend

Se a página não atualiza ou há erro de cache:

```bash
# Parar o processo (Ctrl+C no terminal)
# Depois:

cd apps/web
rm -rf .next
rm -rf node_modules/.cache
pnpm dev
```

Ou em um comando:

```bash
cd apps/web && rm -rf .next node_modules/.cache && pnpm dev
```

### 🔧 Limpeza Completa (Se Nada Funcionar)

```bash
# Parar ambos os servidores (Ctrl+C)

# Limpar cache e dependências
rm -rf .next
rm -rf apps/api/node_modules/.cache
rm -rf apps/web/node_modules/.cache

# Limpar cache do navegador (F12 > Storage > Clear All)

# Reiniciar ambos
pnpm dev
```

### 📱 Limpar Cache do Navegador

Se a página antiga continua aparecendo:

- **Windows/Linux:** `Ctrl + Shift + Delete`
- **Mac:** `Cmd + Shift + Delete`

Selecione:
- [x] Cookies e outros dados de sites
- [x] Imagens e arquivos em cache
- [x] Histórico de navegação

Clique em **"Limpar dados"**

### 🔍 Verificar se os Servidores Estão Rodando

```bash
# Backend
curl http://localhost:3001/api/health

# Frontend (no navegador)
http://localhost:3000

# Frontend (via curl)
curl http://localhost:3000
```

## 📁 Estrutura do Projeto

### Frontend - `apps/web/src/app`

```
app/
├── layout.js                       # Layout base
├── page.js                         # Home (/)
├── globals.css                     # Estilos globais
│
├── auth/
│   ├── signin/
│   │   ├── page.js                # Login
│   │   └── signin.module.css
│   └── signup/
│       ├── page.js                # Registro
│       └── signup.module.css
│
├── pets/
│   ├── page.js                    # Catálogo (/pets)
│   ├── PetsPage.jsx
│   ├── pets.module.css
│   └── [id]/
│       ├── page.js                # Detalhes (/pets/[id])
│       ├── PetDetailsPage.js      # Novo design profissional
│       ├── PetDetailsPage.module.css
│       └── not-found.js
│
├── tutores/
│   ├── cadastrar/
│   │   ├── page.js                # Cadastro de pet
│   │   └── cadastrar.module.css
│   └── [id]/
│       └── pendente/
│           ├── page.js            # Status de aprovação
│           └── pendente.module.css
│
├── admin/
│   └── pets/
│       └── pendentes/
│           ├── PendingPetsPage.js
│           └── pendentes.module.css
│
└── dashboard/
    └── page.js                    # Dashboard do usuário
```

### Backend - `apps/api/src`

```
src/
├── index.js                        # Entry point
│
├── controllers/
│   ├── authController.js           # POST /api/auth/*
│   ├── petController.js            # GET/POST/PATCH/DELETE /api/pets
│   ├── adoptionController.js       # POST /api/adoptions
│   └── adminPetController.js       # PATCH /api/admin/pets/:id
│
├── routes/
│   ├── auth.js                     # Rotas de autenticação
│   ├── pets.js                     # Rotas de pets
│   ├── adoptions.js                # Rotas de adoção
│   ├── upload.js                   # Upload de imagens
│   └── admin/
│       └── pets.js                 # Rotas de admin
│
├── middleware/
│   ├── auth.js                     # Verificação de JWT
│   ├── errorHandler.js             # Tratamento de erros
│   └── validation.js               # Sanitização e validação
│
├── services/
│   ├── supabaseClient.js           # Conexão com Supabase
│   ├── authService.js              # Hash e verificação de senha
│   ├── cloudinary.service.js       # Upload de imagens
│   └── email.service.js            # Envio de emails
│
└── __tests__/
    ├── auth.test.js
    ├── pets.test.js
    └── admin.test.js
```

## 📡 API Endpoints

### Autenticação
```
POST   /api/auth/register           # Registrar novo usuário
POST   /api/auth/login              # Fazer login
POST   /api/auth/logout             # Logout
POST   /api/auth/refresh            # Renovar token JWT
GET    /api/auth/me                 # Dados do usuário autenticado
```

### Pets
```
GET    /api/pets                    # Listar pets com filtros
GET    /api/pets/:id                # Detalhes de um pet
POST   /api/pets                    # Criar novo pet (requer auth)
PATCH  /api/pets/:id                # Editar pet (requer auth)
DELETE /api/pets/:id                # Deletar pet (requer auth)
```

### Adoções
```
POST   /api/adoptions               # Manifestar interesse (requer auth)
GET    /api/adoptions               # Listar solicitações (requer auth)
PATCH  /api/adoptions/:id           # Aprovar/rejeitar (requer admin)
```

### Admin
```
GET    /api/admin/pets/pending      # Pets pendentes de aprovação
PATCH  /api/admin/pets/:id/approve  # Aprovar pet
PATCH  /api/admin/pets/:id/reject   # Rejeitar pet com motivo
```

### Utilitários
```
POST   /api/upload                  # Upload de imagem
GET    /api/health                  # Health check
GET    /api/status                  # Status do servidor
```

## 🗄️ Banco de Dados

### Tabelas Principais

**users** (Autenticação)
```sql
id | email | password | name | type | created_at | updated_at
```

**pets** (Catálogo)
```sql
id | name | breed | species | age | size | gender | color |
description | personality | photos | is_vaccinated | is_neutered |
health_status | owner_id | approval_status | created_at | updated_at
```

**adoptions** (Solicitações)
```sql
id | pet_id | adopter_id | status | message | created_at | updated_at
```

**email_verification_tokens** (Confirmação de email)
```sql
id | user_id | token | expires_at | verified_at | created_at
```

**password_reset_tokens** (Recuperação de senha)
```sql
id | user_id | token | expires_at | used_at | created_at
```

### Executar Migrations

```bash
# Acessar SQL Editor do Supabase:
# https://app.supabase.com/project/seu-projeto/sql/new

# Copie e execute:
# docs/migrations/001_initial_schema.sql
# docs/migrations/002_phase2_enhancements.sql
# docs/migrations/003_email_verification_tokens.sql
```

Ou veja as instruções em: [MIGRATION_INSTRUCTIONS.md](MIGRATION_INSTRUCTIONS.md)

## 🧪 Testes

### E2E com Playwright

```bash
# Executar todos os testes
cd apps/web
pnpm test:e2e

# Com UI interativa
pnpm test:e2e:ui

# Modo debug (step-by-step)
pnpm test:e2e:debug

# Teste específico
pnpm test:e2e -- auth.spec.js
```

### Testes Disponíveis (88+ testes)

- ✅ Autenticação (signin, signup, logout)
- ✅ Catálogo de pets (filtros, busca, paginação)
- ✅ Cadastro de pets (21 campos, upload de fotos)
- ✅ Detalhes do pet (galeria, compatibilidade)
- ✅ Admin dashboard (aprovação/rejeição)
- ✅ Responsividade (mobile 480px, tablet 768px, desktop)

### Backend Tests (opcional)

```bash
cd apps/api
pnpm test
```

## 🚢 Deploy

### Frontend - Vercel

1. **Conectar repositório:**
   - Acesse vercel.com
   - Clique "New Project"
   - Selecione repositório GitHub
   - Vercel detectará Next.js automaticamente

2. **Variáveis de ambiente:**
   ```
   NEXT_PUBLIC_API_URL=https://seu-api.vercel.app
   NEXTAUTH_URL=https://seu-dominio.vercel.app
   NEXTAUTH_SECRET=sua-chave-secreta
   ```

3. **Deploy:**
   ```bash
   git push origin main  # Vercel deploy automático
   ```

### Backend - Railway ou Heroku

#### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link projeto
cd apps/api
railway link

# Deploy
railway up
```

#### Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku apps:create petadopt-api

# Deploy
git push heroku main
```

## 🐛 Troubleshooting

### ❌ "Supabase client not initialized"

**Causa:** Variáveis de ambiente não configuradas

**Solução:**
```bash
# Verificar .env.local em apps/api/
cat apps/api/.env.local

# Deve conter:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - SUPABASE_KEY
```

### ❌ "Pet não encontrado" (página 404)

**Causa:** Cache do Next.js desatualizado

**Solução:**
```bash
cd apps/web
rm -rf .next
pnpm dev
```

### ❌ "Module not found: Can't resolve 'bcryptjs'" (Frontend)

**Causa:** bcryptjs instalado no frontend (só deve estar no backend)

**Solução:**
```bash
cd apps/web
pnpm remove bcryptjs
pnpm install
```

### ❌ Email não é enviado

**Causa:** RESEND_API_KEY é de teste (re_test_...)

**Solução:**
1. Acesse resend.com
2. Crie API key real
3. Configure domínio verificado
4. Atualize `.env.local`

### ❌ Fotos do Cloudinary não carregam

**Causa:** Credenciais incorretas

**Solução:**
```bash
# Verificar em apps/api/.env.local:
# - CLOUDINARY_CLOUD_NAME (ex: pjyakvxs)
# - CLOUDINARY_API_KEY
# - CLOUDINARY_API_SECRET

# Testar conexão:
curl "https://api.cloudinary.com/v1_1/seu-cloud-name/image/list"
```

### ❌ Porta 3000 ou 3001 já está em uso

**Causa:** Outro processo usando a porta

**Solução (Mac/Linux):**
```bash
# Encontrar processo
lsof -i :3000  # Frontend
lsof -i :3001  # Backend

# Matar processo
kill -9 <PID>

# Depois reiniciar
pnpm dev
```

**Solução (Windows):**
```cmd
# Encontrar processo
netstat -ano | findstr :3000

# Matar processo
taskkill /PID <PID> /F

# Depois reiniciar
pnpm dev
```

## 🤝 Contribuindo

### Workflow

1. **Fork** o projeto
2. **Branch:** `git checkout -b feature/AmazingFeature`
3. **Commit:** `git commit -m 'feat: add amazing feature'`
4. **Push:** `git push origin feature/AmazingFeature`
5. **Pull Request** para `main`

### Padrões de Código

- **Commits semânticos:** `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`
- **Components:** PascalCase (`PetCard.js`)
- **Utilities:** camelCase (`getPetStats.js`)
- **CSS:** CSS Modules (`Button.module.css`)
- **ESLint + Prettier:** Configurados automaticamente

### Checklist antes de PR

- [ ] Código segue os padrões do projeto
- [ ] Testes passam (`pnpm test:e2e`)
- [ ] Não há console.log desnecessários
- [ ] Variáveis de ambiente documentadas
- [ ] README atualizado se necessário

## 📊 Status do Projeto

| Funcionalidade | Status | Versão |
|---|---|---|
| Autenticação | ✅ Completo | 1.0.0 |
| Catálogo de Pets | ✅ Completo | 1.0.0 |
| Cadastro de Pets | ✅ Completo | 1.0.0 |
| Detalhes do Pet | ✅ Completo | 2.0.0 |
| Dashboard Admin | ✅ Completo | 1.0.0 |
| Upload de Fotos | ✅ Completo | 1.0.0 |
| Email Notifications | ✅ Completo | 2.0.0 |
| Testes E2E | ✅ Completo | 1.0.0 |
| Sistema de Adoção | ⏳ Desenvolvendo | 2.1.0 |
| Abrigos Multi-Tutor | ⏳ Planejado | 2.2.0 |

## 📚 Documentação Adicional

- [Instruções de Migração Supabase](MIGRATION_INSTRUCTIONS.md)
- [Setup do Banco de Dados](docs/SUPABASE_SETUP.sql)
- [Migrations Phase 2](docs/migrations/002_phase2_enhancements.sql)
- [Email Tokens Migration](docs/migrations/003_email_verification_tokens.sql)

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Autores

- **Maria de Lourdes Celeski** - Arquiteta e Desenvolvedora Full Stack

## 💬 Suporte

- 📧 **Email:** contato@petadopt.com
- 🐛 **Issues:** [GitHub Issues](https://github.com/seu-usuario/petadopt/issues)
- 📖 **Wiki:** [Project Wiki](#)
- 💭 **Discussões:** [GitHub Discussions](#)

## 🙏 Agradecimentos

- **Supabase** - Infraestrutura de banco de dados confiável
- **Cloudinary** - Armazenamento e otimização de imagens
- **Resend** - Serviço de email simples e poderoso
- **Vercel** - Deployment do frontend
- **Comunidade open-source** - Ferramentas incríveis

---

**Desenvolvido com ❤️ para ajudar pets a encontrar seus lares.**

Última atualização: `git log -1 --pretty=format:"%ad" -- README.md`
