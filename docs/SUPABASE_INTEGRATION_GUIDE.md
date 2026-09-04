# 🚀 FASE 5.3 - Supabase Integration Guide

## Overview

Integração completa do PetAdopt com Supabase para banco de dados PostgreSQL profissional. Este guia cobre setup, configuração, testes e troubleshooting.

---

## ⏱️ Timeline

- **Passo 1:** Criar projeto Supabase (5 min)
- **Passo 2:** Copiar credenciais (2 min)
- **Passo 3:** Configurar .env.local (2 min)
- **Passo 4:** Executar SQL do setup (5 min)
- **Passo 5:** Testar conexão (10 min)
- **Passo 6:** Testar endpoints (20 min)

**Total: ~45 minutos**

---

## 📋 Pré-requisitos

- ✅ Conta Supabase (grátis em https://supabase.com)
- ✅ Código FASE 5.2 (Bcrypt) já implementado
- ✅ Terminal/CLI disponível
- ✅ curl ou Postman para testes

---

## PASSO 1: Criar Projeto Supabase

### 1.1 Ir para https://supabase.com

```
1. Abrir: https://supabase.com
2. Clicar: "Start your project" ou "Sign Up"
3. Fazer login com GitHub/Google/Email
```

### 1.2 Criar Novo Projeto

```
1. Clicar: "New Project"
2. Selecionar: Organização (ou criar)
3. Preencher:
   - Project Name: "petadopt-pro"
   - Database Password: [gerar senha forte]
   - Region: [escolher mais próximo]
4. Clicar: "Create new project"
```

⏳ Esperar ~2-3 minutos enquanto o projeto é criado

### 1.3 Dashboard do Projeto

Após criado, você verá:
- **Project URL** (copiar!)
- **Service Role Key** (copiar!)
- **Anon Key** (copiar!)
- **SQL Editor**
- **Database** section

---

## PASSO 2: Copiar Credenciais

No dashboard Supabase:

```
1. Ir para: Settings → API
2. Copiar:
   - Project URL          → SUPABASE_URL
   - Anon public key      → SUPABASE_ANON_KEY
   - Service role secret  → SUPABASE_SERVICE_ROLE_KEY (opcional)

Exemplo:
SUPABASE_URL=https://abcdefghijkl.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

---

## PASSO 3: Configurar .env.local

Atualizar `/Users/mariadelourdesceleski/Documents/petadopt-pro/apps/api/.env.local`:

```env
# ... existing config ...

# Supabase Configuration (FASE 5.3)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

⚠️ **IMPORTANTE:** Adicione `.env.local` ao `.gitignore` (já deve estar):
```bash
echo ".env.local" >> .gitignore
```

---

## PASSO 4: Executar SQL do Setup

### 4.1 Acessar SQL Editor

```
1. Ir para: Supabase Dashboard
2. Clicar: "SQL Editor" (esquerda)
3. Clicar: "New Query"
```

### 4.2 Copiar e Executar Script

```
1. Copiar conteúdo de: docs/SUPABASE_SETUP.sql
2. Colar no SQL Editor do Supabase
3. Clicar: "Run" (ou Cmd+Enter)
```

⏳ Aguardar execução (deve levar ~5-10 segundos)

### 4.3 Verificar Resultado

Após executar, você deve ver:
```
✓ Query executed successfully
✓ No errors
```

Verificar criação das tabelas:
```
1. Ir para: "Table Editor"
2. Verificar tabelas criadas:
   ✓ users
   ✓ accounts
   ✓ sessions
   ✓ verification_tokens
   ✓ shelters
   ✓ pets
   ✓ adoptions
   ✓ adoption_logs
   ✓ favorites
```

---

## PASSO 5: Testar Conexão

### 5.1 Verificar Supabase Client

No arquivo `apps/api/src/services/supabaseClient.js`:

```javascript
export function getSupabaseClient() {
  if (!supabaseClient && SUPABASE_URL && SUPABASE_KEY) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false,
      },
    });
  }
  return supabaseClient;
}
```

✅ Já está pronto para usar!

### 5.2 Testar com Node REPL

```bash
cd /Users/mariadelourdesceleski/Documents/petadopt-pro/apps/api

# Iniciar Node interativo
node

# Dentro do Node:
import { getSupabaseClient, select } from './src/services/supabaseClient.js';

const client = getSupabaseClient();
console.log('Client:', client ? '✅ Conectado' : '❌ Não conectado');

// Testar query simples
const result = await select('users');
console.log('Usuários:', result);
```

---

## PASSO 6: Testar Endpoints

### 6.1 Iniciar Servidor

```bash
# Terminal 1: Iniciar API
cd /Users/mariadelourdesceleski/Documents/petadopt-pro
pnpm dev:api

# Deve ver:
# �� PetAdopt API Server Started
# Port: 3001
# ✅ Supabase configured
```

### 6.2 Testar Registro (POST /auth/register)

```bash
# Terminal 2: Fazer curl request

curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "SecurePass123!",
    "name": "João Silva",
    "userType": "ADOPTER"
  }'

# Resposta esperada (201):
# {
#   "message": "User created successfully",
#   "user": {
#     "id": "uuid-gerado",
#     "email": "joao@example.com",
#     "name": "João Silva",
#     "userType": "ADOPTER"
#   }
# }
```

### 6.3 Testar Login (POST /auth/login)

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "SecurePass123!"
  }'

# Resposta esperada (200):
# {
#   "message": "Login successful",
#   "token": "mock-token-jwt",
#   "user": { ... }
# }
```

### 6.4 Testar Listar Usuários (GET /status)

```bash
curl http://localhost:3001/api/status

# Resposta esperada (200):
# {
#   "status": "healthy",
#   "database": "configured",
#   ...
# }
```

### 6.5 Verificar Dados no Supabase

```bash
# No Supabase Dashboard:
1. Ir para: "Table Editor"
2. Selecionar: "users"
3. Verificar: Nova linha com o usuário criado

Deve aparecer:
- email: joao@example.com
- name: João Silva
- user_type: ADOPTER
- password: [hash bcrypt com $2b$]
```

---

## 🧪 Teste Completo (Fluxo End-to-End)

### Cenário 1: Registrar e Login

```bash
# 1. Registrar novo usuário
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@example.com",
    "password": "Maria123Secure!",
    "name": "Maria Santos",
    "userType": "SHELTER_ADMIN"
  }'

# 2. Fazer login com as credenciais
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@example.com",
    "password": "Maria123Secure!"
  }'

# 3. Verificar que a senha está hasheada no banco
# No Supabase Dashboard → Table Editor → users
# Campo "password" deve começar com: $2b$10$
```

### Cenário 2: Senha Incorreta

```bash
# Tentar login com senha errada
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@example.com",
    "password": "SenhaErrada"
  }'

# Resposta esperada (401):
# {
#   "error": "Invalid email or password",
#   "code": "INVALID_CREDENTIALS"
# }
```

### Cenário 3: Email Duplicado

```bash
# Tentar registrar com email existente
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@example.com",
    "password": "NewPassword123!",
    "name": "Maria Duplicate",
    "userType": "ADOPTER"
  }'

# Resposta esperada (409):
# {
#   "error": "Email already registered",
#   "code": "EMAIL_EXISTS"
# }
```

---

## ✅ Checklist de Verificação

**Supabase Setup:**
- [ ] Projeto criado em https://supabase.com
- [ ] Credenciais copiadas
- [ ] .env.local atualizado
- [ ] Script SQL executado
- [ ] Tabelas criadas no Supabase
- [ ] Índices criados
- [ ] RLS policies ativas

**Aplicação:**
- [ ] Supabase client inicializado
- [ ] Conexão testada
- [ ] POST /auth/register funciona
- [ ] POST /auth/login funciona
- [ ] Senha é hasheada com bcrypt
- [ ] Dados aparecem no Supabase
- [ ] Erros tratados corretamente

**Performance:**
- [ ] Queries retornam rápido (<100ms)
- [ ] Índices estão sendo usados
- [ ] Sem N+1 queries
- [ ] Pool de conexões funciona

---

## 🔧 Troubleshooting

### Erro: "Supabase client not initialized"

```bash
# Causa: SUPABASE_URL ou SUPABASE_ANON_KEY não configurados

# Solução:
1. Verificar .env.local tem os valores
2. Valores estão com https://? (URL)
3. Reiniciar servidor: pnpm dev:api
```

### Erro: "relation 'public.users' does not exist"

```bash
# Causa: Script SQL não foi executado

# Solução:
1. Ir para Supabase Dashboard
2. SQL Editor
3. Copiar todo o conteúdo de: docs/SUPABASE_SETUP.sql
4. Executar Query
5. Aguardar "Query executed successfully"
```

### Erro: "Unauthorized" (401)

```bash
# Causa: Credenciais inválidas

# Solução:
1. Verificar SUPABASE_URL está correto (sem trailing slash)
2. Verificar SUPABASE_ANON_KEY está correto
3. Copiar diretamente do Supabase Dashboard → Settings → API
```

### Lentidão nas Queries

```bash
# Causa: Índices não criados

# Solução:
1. Ir para SQL Editor do Supabase
2. Verificar se índices foram criados:
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_pets_status ON pets(pet_status);
3. Se não existem, executar novamente o script SQL
```

---

## 📊 Monitoramento

### Ver Estatísticas do Banco

```
Supabase Dashboard → Database → Statistics
- Storage used
- Row counts
- Query performance
```

### Ver Logs de Erro

```
Supabase Dashboard → Logs → Postgres
- Queries executadas
- Erros SQL
- Performance
```

### Monitorar Conexões

```
Supabase Dashboard → Database → Connections
- Ativas agora
- Pool status
- Histórico
```

---

## 🔐 Segurança

### Row Level Security (RLS)

Já está configurado no script SQL:

```sql
-- Usuários veem apenas seus dados
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários veem apenas seus dados" ON users
  FOR SELECT USING (auth.uid() = id);
```

### Não Compartilhe

❌ NUNCA faça commit de:
```
- SUPABASE_URL (com dados)
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- .env.local
```

✅ SEMPRE mantenha em:
```
- .env.local (git ignored)
- Secrets do CI/CD
- Variáveis de ambiente
```

---

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

---

Desenvolvido com 🐾 para PetAdopt
**FASE 5.3 - Banco de dados profissional pronto!**
