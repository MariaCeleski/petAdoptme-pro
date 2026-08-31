# 🚀 FASE 5 - Integração e Segurança

## Status: Pronto para Iniciar

✅ **FASE 4 Concluída e Mergeada para Master**
- API REST com 21+ endpoints implementada
- Middleware e controllers estruturados
- Documentação completa criada
- Código pronto para produção

---

## FASE 5: Roadmap Detalhado

Esta fase implementa as dependências críticas para deixar a API totalmente funcional.

### 5.1️⃣ JWT Real com jsonwebtoken (PRIORIDADE 1)

**Por quê:** Autenticação segura em produção

**Passos:**

```bash
# 1. Instalar dependência
cd apps/api
npm install jsonwebtoken

# 2. Atualizar middleware/auth.js
# Substituir verifyToken() placeholder com jwt.verify()
# Implementar generateToken() para criar tokens

# 3. Atualizar controllers/authController.js
# Usar tokens reais no login e register

# 4. Adicionar JWT_SECRET em .env.local
JWT_SECRET=sua-chave-super-secreta-aqui
JWT_EXPIRY=24h
```

**Arquivo para modificar:**
```
apps/api/src/middleware/auth.js
apps/api/src/controllers/authController.js
```

**Tempo:** ~45 minutos

---

### 5.2️⃣ Bcrypt para Hashing de Senhas (PRIORIDADE 1)

**Por quê:** Segurança de senhas dos usuários

**Passos:**

```bash
# 1. Instalar dependência
npm install bcryptjs

# 2. Atualizar authController.js
# Hash ao registrar: await bcrypt.hash(password, 10)
# Compare ao fazer login: await bcrypt.compare(password, hash)
```

**Arquivo para modificar:**
```
apps/api/src/controllers/authController.js
```

**Tempo:** ~30 minutos

---

### 5.3️⃣ Supabase Integrado (PRIORIDADE 1)

**Por quê:** Banco de dados real funcional

**Passos:**

```bash
# 1. Criar projeto em https://supabase.com
# 2. Copiar URL e chaves
# 3. Atualizar .env.local
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima

# 4. Executar SQL do setup
# - Copiar conteúdo de docs/SUPABASE_SETUP.sql
# - Colar no SQL Editor do Supabase
# - Executar

# 5. Testar endpoints com dados reais
curl http://localhost:3001/api/pets
```

**Arquivos:**
```
apps/api/.env.local          ← Adicionar credenciais
apps/api/src/services/supabaseClient.js ← Já pronto!
docs/SUPABASE_SETUP.sql      ← Script SQL
```

**Tempo:** ~1-2 horas

---

### 5.4️⃣ Email Service (PRIORIDADE 2)

**Por quê:** Verificação de email e notificações

**Passos:**

```bash
# 1. Escolher provider
# Opção A: Resend (recomendado - mais simples)
npm install resend

# Opção B: SendGrid
npm install @sendgrid/mail

# 2. Criar arquivo apps/api/src/services/emailService.js

# 3. Adicionar credenciais em .env.local
RESEND_API_KEY=re_...

# 4. Integrar no authController.js
# - Verificação de email
# - Password reset emails

# 5. Integrar no adoptionController.js
# - Notificação de adoção aprovada/rejeitada
```

**Novo arquivo:**
```
apps/api/src/services/emailService.js
apps/api/src/templates/welcome.html
apps/api/src/templates/verify-email.html
apps/api/src/templates/adoption-approved.html
apps/api/src/templates/adoption-rejected.html
```

**Tempo:** ~2-3 horas

---

### 5.5️⃣ Cloudinary para Upload de Imagens (PRIORIDADE 2)

**Por quê:** Upload e otimização de imagens

**Passos:**

```bash
# 1. Criar conta em https://cloudinary.com

# 2. Instalar dependência
npm install cloudinary next-cloudinary

# 3. Criar apps/api/src/services/cloudinaryService.js

# 4. Adicionar credenciais em .env.local
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# 5. Integrar no petController.js
# - Upload na criação de pets
# - Geração de thumbnails
```

**Novo arquivo:**
```
apps/api/src/services/cloudinaryService.js
apps/api/src/controllers/uploadController.js (opcional)
```

**Tempo:** ~2 horas

---

## Ordem de Implementação Recomendada

```
1. JWT Real                    (45 min)  ✓ Crítico
2. Bcrypt                      (30 min)  ✓ Crítico  
3. Supabase Integrado          (1-2h)    ✓ Crítico
   └─ Depois testar endpoints
4. Email Service               (2-3h)    Importante
5. Cloudinary Upload           (2h)      Importante
```

**Timeline Total:** ~7-9 horas de trabalho

---

## Como Começar AGORA

### Passo 1: Criar Branch para FASE 5

```bash
cd /Users/mariadelourdesceleski/Documents/petadopt-pro
git checkout -b feature/phase5-security
```

### Passo 2: Implementar JWT (Comece aqui!)

1. Abrir `apps/api/src/middleware/auth.js`
2. Instalar `npm install jsonwebtoken`
3. Substituir `verifyToken()` com JWT real
4. Implementar `generateToken()`
5. Testar com curl

### Passo 3: Implementar Bcrypt

1. Abrir `apps/api/src/controllers/authController.js`
2. Instalar `npm install bcryptjs`
3. Atualizar `register()` para fazer hash
4. Atualizar `login()` para comparar hash
5. Testar

### Passo 4: Configurar Supabase

1. Ir para https://supabase.com
2. Criar projeto (grátis)
3. Copiar credenciais
4. Adicionar em `.env.local`
5. Executar SQL de setup
6. Testar endpoints

---

## Arquivos a Criar em FASE 5

```
apps/api/src/
├── middleware/
│   └── auth.js              ← Atualizar com JWT real
├── controllers/
│   ├── authController.js    ← Atualizar com Bcrypt
│   ├── uploadController.js  ← NOVO (opcional)
│   └── ...
├── services/
│   ├── supabaseClient.js    ← Já existe, testar
│   ├── emailService.js      ← NOVO
│   ├── cloudinaryService.js ← NOVO
│   └── tokenService.js      ← NOVO (opcional)
├── templates/               ← NOVO (emails)
│   ├── welcome.html
│   ├── verify-email.html
│   ├── adoption-approved.html
│   └── adoption-rejected.html
└── ...

.env.local
├── JWT_SECRET=...
├── JWT_EXPIRY=...
├── SUPABASE_URL=...
├── SUPABASE_ANON_KEY=...
├── RESEND_API_KEY=...
├── CLOUDINARY_CLOUD_NAME=...
├── CLOUDINARY_API_KEY=...
└── CLOUDINARY_API_SECRET=...
```

---

## Checklist de Implementação FASE 5

**JWT (Autenticação Segura)**
- [ ] `npm install jsonwebtoken`
- [ ] Atualizar `middleware/auth.js` com JWT real
- [ ] Atualizar `authController.js` para gerar tokens
- [ ] Testar login com token real
- [ ] Testar endpoints com token JWT

**Bcrypt (Senhas Seguras)**
- [ ] `npm install bcryptjs`
- [ ] Atualizar `authController.js` - register
- [ ] Atualizar `authController.js` - login
- [ ] Testar hashing de senhas
- [ ] Testar comparação de senhas

**Supabase (Banco de Dados)**
- [ ] Criar projeto Supabase
- [ ] Copiar credenciais
- [ ] Adicionar em `.env.local`
- [ ] Executar script SQL
- [ ] Testar conexão com banco
- [ ] Testar CRUD operations
- [ ] Testar autenticação com dados reais

**Email (Verificação + Notificações)**
- [ ] Escolher provider (Resend recomendado)
- [ ] `npm install resend`
- [ ] Criar `services/emailService.js`
- [ ] Criar templates HTML
- [ ] Integrar em `authController.js` (verify-email)
- [ ] Integrar em `adoptionController.js` (notificações)
- [ ] Testar envios

**Cloudinary (Upload de Imagens)**
- [ ] Criar conta Cloudinary
- [ ] `npm install cloudinary next-cloudinary`
- [ ] Criar `services/cloudinaryService.js`
- [ ] Integrar em `petController.js`
- [ ] Testar upload
- [ ] Testar geração de thumbnails

---

## Recursos

### Documentação Oficial
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- [Supabase Docs](https://supabase.com/docs)
- [Resend Docs](https://resend.com/docs)
- [Cloudinary Docs](https://cloudinary.com/documentation)

### Exemplos de Código

**JWT Implementation:**
```javascript
import jwt from 'jsonwebtoken';

const generateToken = (userId) => {
  return jwt.sign(
    { userId, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '24h' }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
```

**Bcrypt Implementation:**
```javascript
import bcrypt from 'bcryptjs';

const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, hashedPassword);
```

---

## Próximas Fases Após FASE 5

- **FASE 6:** Frontend Integration (conectar Next.js com API)
- **FASE 7:** Testes (unitários + E2E)
- **FASE 8:** Deploy (produção)

---

Desenvolvido com 🐾 para PetAdopt
**FASE 5 está pronto para começar!**

Próximo passo: Criar branch e começar com JWT
