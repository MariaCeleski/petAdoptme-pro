# Roadmap - Próximas Fases do PetAdopt

## Status Atual

- ✅ FASE 1: Validação Local
- ✅ FASE 2: Backend Skeleton (Express Server)
- ✅ FASE 3: Shared Packages (Types & Validation)
- ✅ FASE 4: API Routes (Controllers, Middleware, Rotas)
- 🔜 FASE 5: Integração e Segurança
- 🔜 FASE 6: Frontend Integration
- 🔜 FASE 7: Testes Completos
- 🔜 FASE 8: Deploy

---

## FASE 5: Integração e Segurança ⏭️

### 5.1 Autenticação Real com JWT

**Objetivo:** Implementar autenticação JWT com segurança em produção

**Tasks:**
- [ ] Instalar `jsonwebtoken` e `bcryptjs`
- [ ] Implementar geração de JWT tokens
- [ ] Implementar verificação de JWT
- [ ] Adicionar refresh token mechanism
- [ ] Implementar logout com token blacklist (Redis)
- [ ] Testar fluxos de autenticação

**Arquivos para modificar:**
```
apps/api/src/
├── middleware/auth.js           ← Atualizar com JWT real
├── controllers/authController.js ← Adicionar bcrypt
└── services/
    └── tokenService.js          ← NOVO: Gerenciamento de tokens
```

**Estimativa:** 2-3 horas

---

### 5.2 Integração com Supabase

**Objetivo:** Conectar com banco de dados Supabase real

**Tasks:**
- [ ] Configurar credenciais Supabase em `.env.local`
- [ ] Executar script SQL do SUPABASE_SETUP.sql
- [ ] Testar conexão com banco
- [ ] Implementar migrations com Prisma (opcional)
- [ ] Criar seeds para dados de teste
- [ ] Testar CRUD operations com dados reais

**Arquivos para modificar:**
```
apps/api/src/services/supabaseClient.js ← Testar com dados reais
```

**Setup:**
1. Criar projeto em https://supabase.com
2. Copiar URL e chaves para `.env.local`
3. Executar SQL do `docs/SUPABASE_SETUP.sql` no SQL Editor

**Estimativa:** 1-2 horas

---

### 5.3 Hashing de Senhas com Bcrypt

**Objetivo:** Implementar segurança adequada de senhas

**Tasks:**
- [ ] Instalar `bcryptjs`
- [ ] Hash passwords ao registrar usuário
- [ ] Comparar passwords ao fazer login
- [ ] Testar com diferentes tipos de senha

**Arquivo para modificar:**
```
apps/api/src/controllers/authController.js
```

**Código de referência:**
```javascript
import bcrypt from 'bcryptjs';

// Hash
const hashedPassword = await bcrypt.hash(password, 10);

// Compare
const isValid = await bcrypt.compare(password, hashedPassword);
```

**Estimativa:** 30 minutos

---

### 5.4 Email Service

**Objetivo:** Enviar emails de verificação e notificações

**Tasks:**
- [ ] Escolher provider (Resend ou SendGrid)
- [ ] Criar serviço de email (`services/emailService.js`)
- [ ] Implementar templates de email
- [ ] Integrar com auth controller (verificação de email)
- [ ] Integrar com adoption controller (notificações)
- [ ] Testar envios

**Novo arquivo:**
```
apps/api/src/
├── services/emailService.js     ← NOVO
└── templates/
    ├── welcome.html             ← NOVO
    ├── verify-email.html        ← NOVO
    ├── adoption-approved.html   ← NOVO
    └── adoption-rejected.html   ← NOVO
```

**Estimativa:** 2-3 horas

---

### 5.5 Cloudinary para Upload de Imagens

**Objetivo:** Implementar upload e otimização de imagens

**Tasks:**
- [ ] Criar conta em Cloudinary
- [ ] Criar serviço (`services/cloudinaryService.js`)
- [ ] Implementar upload de imagens
- [ ] Implementar geração de thumbnails
- [ ] Testar com diferentes formatos
- [ ] Integrar com pet controller

**Novo arquivo:**
```
apps/api/src/
└── services/cloudinaryService.js ← NOVO
```

**Estimativa:** 2 horas

---

## FASE 6: Frontend Integration

### 6.1 Cliente API

Implementar cliente HTTP para consumir API

**Tasks:**
- [ ] Criar `packages/api-client/` com Axios
- [ ] Implementar endpoints específicos
- [ ] Type safety com TypeScript
- [ ] Tratamento de erros

---

### 6.2 Integração com Frontend

Conectar Next.js com API backend

**Tasks:**
- [ ] Integrar autenticação (JWT)
- [ ] Conectar listagem de pets
- [ ] Conectar formulário de adoção
- [ ] Sincronizar dados com backend

---

## FASE 7: Testes Completos

### 7.1 Testes Unitários

**Objetivo:** Cobertura de 80%+ dos controllers

**Stack:** Vitest + Supertest

---

### 7.2 Testes de Integração

**Objetivo:** Testar fluxos completos end-to-end

**Stack:** Playwright ou Cypress

---

### 7.3 Testes de Performance

**Objetivo:** Validar performance da API

**Stack:** k6 ou Artillery

---

## FASE 8: Deploy

### 8.1 Configuração de Produção

**Tasks:**
- [ ] Variáveis de ambiente seguras
- [ ] Database backups
- [ ] CDN para imagens
- [ ] Rate limiting em produção
- [ ] Logging e monitoring

---

### 8.2 Deploy de Staging

Fazer deploy em staging environment

**Opções:**
- Vercel para frontend
- Railway/Render para backend
- Heroku (alternativa)

---

### 8.3 Deploy de Produção

Deploy final com domínio

---

## Timeline Recomendada

```
Semana 1:
├─ FASE 5.1-5.3 (Auth + Supabase + Bcrypt)
└─ FASE 5.4 (Email)

Semana 2:
├─ FASE 5.5 (Cloudinary)
└─ FASE 6 (Frontend Integration)

Semana 3:
├─ FASE 7 (Testes)
└─ Bug fixes

Semana 4:
└─ FASE 8 (Deploy)
```

---

## Checklist de Implementação

### FASE 5 - Integração e Segurança

**Autenticação:**
- [ ] JWT tokens implementados
- [ ] Bcrypt hashing
- [ ] Refresh token logic
- [ ] Testes de auth

**Banco de Dados:**
- [ ] Supabase conectado
- [ ] Migrations executadas
- [ ] Seeds criados
- [ ] Queries testadas

**Email:**
- [ ] Serviço configurado
- [ ] Templates criados
- [ ] Verificação de email funciona
- [ ] Notificações funcionam

**Imagens:**
- [ ] Cloudinary integrado
- [ ] Upload funcionando
- [ ] Thumbnails sendo gerados
- [ ] URLs armazenadas no BD

---

## Dependências para Instalar (FASE 5)

```bash
# Segurança
npm install jsonwebtoken bcryptjs

# Email
npm install resend  # ou sendgrid

# Imagens
npm install cloudinary next-cloudinary

# Testes
npm install vitest supertest

# Utilities
npm install dotenv uuid
```

---

## Variáveis de Ambiente (FASE 5)

Adicionar ao `.env.local`:

```env
# JWT
JWT_SECRET=sua-chave-secreta-aqui
JWT_EXPIRY=24h
REFRESH_TOKEN_EXPIRY=7d

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@petadopt.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Supabase (já configurado)
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

---

## Resources e Links

### Autenticação
- [jsonwebtoken docs](https://github.com/auth0/node-jsonwebtoken)
- [bcryptjs docs](https://github.com/dcodeIO/bcrypt.js)

### Email
- [Resend docs](https://resend.com/docs)
- [SendGrid docs](https://docs.sendgrid.com)

### Imagens
- [Cloudinary docs](https://cloudinary.com/documentation)
- [next-cloudinary](https://next.cloudinary.dev)

### Testes
- [Vitest](https://vitest.dev)
- [Supertest](https://github.com/visionmedia/supertest)
- [Playwright](https://playwright.dev)

---

## Notas Importantes

### Performance
- Rate limiting está pronto para Upstash Redis
- Adicionar cache com Redis conforme necessário
- Otimizar queries no Supabase

### Segurança
- Nunca commitar `.env` com secrets
- Usar `.env.example` como template
- Renovar tokens JWT regularmente
- Monitorar tentativas de acesso não autorizado

### Escalabilidade
- Preparado para múltiplos workers
- Database connection pooling ativo
- Pronto para CDN de imagens

---

Desenvolvido com 🐾 para PetAdopt | Roadmap atualizado | Pronto para próximas fases
