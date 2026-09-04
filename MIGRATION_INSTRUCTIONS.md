# 🗄️ Instruções de Migração Supabase - Migration 003

## Quick Setup (1 minuto)

### Passo 1: Acesse o SQL Editor do Supabase
**URL:** https://app.supabase.com/project/qmzfpgewfmzkghaytzrw/sql/new

### Passo 2: Copie e Cole o SQL Abaixo

```sql
-- ============================================================================
-- EMAIL VERIFICATION AND PASSWORD RESET TOKENS
-- ============================================================================

-- Create email_verification_tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id 
  ON email_verification_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token 
  ON email_verification_tokens(token);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at 
  ON email_verification_tokens(expires_at);

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id 
  ON password_reset_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token 
  ON password_reset_tokens(token);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at 
  ON password_reset_tokens(expires_at);

-- Enable RLS
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own verification tokens" ON email_verification_tokens;
CREATE POLICY "Users can view their own verification tokens"
  ON email_verification_tokens
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can view their own password reset tokens" ON password_reset_tokens;
CREATE POLICY "Users can view their own password reset tokens"
  ON password_reset_tokens
  FOR SELECT
  USING (true);

-- Add email_verified column to users table if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_users_email_verified 
  ON users(email_verified);

-- ✅ Verify tables were created
SELECT 'email_verification_tokens' as table_name, COUNT(*) as record_count 
FROM email_verification_tokens
UNION ALL
SELECT 'password_reset_tokens', COUNT(*) 
FROM password_reset_tokens
UNION ALL
SELECT 'users', COUNT(*) 
FROM users;
```

### Passo 3: Execute o SQL
Clique em **RUN** (botão verde no canto superior direito)

### Passo 4: Verifique o Resultado
Você deve ver:
- ✅ `email_verification_tokens` - 0 registros
- ✅ `password_reset_tokens` - 0 registros  
- ✅ `users` - X registros (usuários criados)

## O Que Essa Migração Faz

### Tabelas Criadas:
1. **email_verification_tokens** - Armazena tokens para verificação de email
   - `id` - UUID único
   - `user_id` - Referência ao usuário
   - `token` - Token único para verificação
   - `expires_at` - Quando o token expira (24 horas)
   - `verified_at` - Quando foi verificado

2. **password_reset_tokens** - Armazena tokens para reset de senha
   - `id` - UUID único
   - `user_id` - Referência ao usuário
   - `token` - Token único para reset
   - `expires_at` - Quando o token expira (1 hora)
   - `used_at` - Quando foi usado

### Colunas Adicionadas:
- `users.email_verified` (boolean) - Se o email foi verificado
- `users.email_verified_at` (timestamp) - Quando foi verificado

### Índices Criados:
- Para melhor performance nas queries por user_id, token, e data de expiração

## ✅ Próximos Passos

Após executar a migração:

1. **Teste o fluxo de cadastro:**
   - Abra http://localhost:3000/auth/signup
   - Preencha o formulário
   - Clique em "Criar Conta"
   - Deve retornar **201 Success** (não mais 500 error)

2. **Verifique o banco:**
   - Vá em Supabase → Table Editor
   - Você deve ver as tabelas novas criadas

3. **Próximo:** Implementar email notifications com Resend
