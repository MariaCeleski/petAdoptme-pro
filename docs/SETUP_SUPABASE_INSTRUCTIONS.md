# 🚀 Instruções para Setup do Supabase - FASE 5.3

**Status**: Configuração em progresso  
**Data**: 31 de Agosto de 2026

---

## ✅ Passo 1: Configuração de Ambiente (CONCLUÍDO)

O arquivo `.env.local` foi atualizado com as chaves do Supabase:

```env
SUPABASE_URL=https://qmzfpgewfmzkghaytzrw.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔄 Passo 2: Executar SQL Setup (PRÓXIMO)

### 2.1 Abra o Painel do Supabase

1. Acesse: https://app.supabase.com
2. Clique no projeto **petadopt-pro**
3. Vá para **SQL Editor** (menu esquerdo)

### 2.2 Copie o Script SQL

Abra o arquivo:
```
/Users/mariadelourdesceleski/Documents/petadopt-pro/docs/SUPABASE_SETUP.sql
```

**Conteúdo:**
- 8 tabelas principais
- Enums para tipos de dados
- 15 índices otimizados
- RLS (Row Level Security) policies
- 3 funções PostgreSQL
- 6 triggers automáticos
- 3 views úteis
- Dados de exemplo

### 2.3 Cole no SQL Editor

1. Clique em **"New Query"**
2. Cole **TODO O CONTEÚDO** do `SUPABASE_SETUP.sql`
3. Clique em **"Run"**

### 2.4 Aguarde a Execução

Você verá mensagens de sucesso:

```
✓ CREATE ENUM (pet_status)
✓ CREATE TABLE users
✓ CREATE TABLE pets
✓ CREATE TABLE adoptions
✓ CREATE TABLE adoption_applications
✓ ... (mais operações)
```

---

## 📊 Passo 3: Verificar Tabelas Criadas

Após executar o SQL:

1. Vá para **Table Editor** (menu esquerdo)
2. Você deve ver estas tabelas:
   - ✅ `users`
   - ✅ `pets`
   - ✅ `adoptions`
   - ✅ `adoption_applications`
   - ✅ `verification_tokens` (NEW - FASE 5.4)
   - ✅ `password_reset_tokens` (NEW - FASE 5.4)
   - E outras...

---

## 🧪 Passo 4: Testar a Conexão

### Via Terminal

```bash
cd /Users/mariadelourdesceleski/Documents/petadopt-pro

# Iniciar o servidor
pnpm dev:api
```

**Você deve ver:**
```
✅ Server running on http://localhost:3001
✅ Supabase connected successfully
```

### Via cURL

Teste um endpoint:

```bash
curl http://localhost:3001/api/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "message": "Server is running",
  "timestamp": "2026-08-31T10:00:00Z"
}
```

---

## 🔑 Passo 5: Configurar CLI do Supabase (Opcional)

Para usar o Supabase CLI localmente:

```bash
# 1. Instalar Supabase CLI
npm install -g supabase

# 2. Fazer login
supabase login

# 3. Linkar ao projeto
supabase link --project-ref qmzfpgewfmzkghaytzrw

# 4. Puxar schema do Supabase remoto
supabase db pull
```

---

## 📝 Passo 6: Adicionar Tabelas de Email (FASE 5.4)

Se ainda não foram criadas automaticamente, execute este SQL:

```sql
-- Tabela de tokens de verificação de email
CREATE TABLE verification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_verification_tokens_user_id ON verification_tokens(user_id);
CREATE INDEX idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX idx_verification_tokens_expires_at ON verification_tokens(expires_at);

-- Tabela de tokens de reset de senha
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
```

---

## 🎯 Passo 7: Testar Endpoints

Depois que tudo estiver configurado:

### Teste 1: Verificar Pets

```bash
curl http://localhost:3001/api/pets
```

### Teste 2: Criar Usuário (Registro)

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Senha123!",
    "name": "Test User",
    "userType": "ADOPTER"
  }'
```

### Teste 3: Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Senha123!"
  }'
```

---

## ⚠️ Troubleshooting

### Problema: "Connection refused"

**Solução:**
- Verifique se `SUPABASE_URL` está correto
- Verifique se `SUPABASE_ANON_KEY` está válida
- Reinicie o servidor: `pnpm dev:api`

---

### Problema: "Table does not exist"

**Solução:**
- Verifique se o SQL foi executado completamente
- Vá para **Table Editor** e confirme as tabelas
- Se faltarem, execute o SQL novamente

---

### Problema: "Rows returned 0"

**Solução:**
- Isso é normal se não há dados ainda
- Insira dados de teste via API
- Ou copie dados do `SUPABASE_SETUP.sql` (tem exemplos)

---

## 📚 Referências

- **Docs Supabase**: https://supabase.com/docs
- **SQL Setup Completo**: `/Users/mariadelourdesceleski/Documents/petadopt-pro/docs/SUPABASE_SETUP.sql`
- **Email Service Guide**: `/Users/mariadelourdesceleski/Documents/petadopt-pro/docs/EMAIL_SERVICE_GUIDE.md`

---

## ✅ Checklist Final

- [ ] `.env.local` configurado com SUPABASE_URL e SUPABASE_ANON_KEY
- [ ] SQL Setup executado no Supabase
- [ ] Tabelas visíveis no Table Editor
- [ ] Servidor iniciado: `pnpm dev:api`
- [ ] Endpoints testados com sucesso
- [ ] Email Service configurado (FASE 5.4)

---

**FASE 5.3: Setup Supabase** - Em Progresso ⏳

Próximo: Testar endpoints e integração com banco de dados.

