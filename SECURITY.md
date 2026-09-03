# 🔒 Política de Segurança - PetAdopt

## Proteção de Dados Sensíveis

Este documento descreve como o projeto protege dados sensíveis e credenciais.

### ✅ Arquivos Protegidos

Os seguintes arquivos **NUNCA** devem ser commitados no Git:

```
.env                 # Variáveis de ambiente (todos os ambientes)
.env.local          # Variáveis locais
.env.*.local        # Variáveis específicas por ambiente
.env.production     # Produção
.npmrc              # NPM tokens
.aws/              # AWS credentials
*.key              # SSH/API keys
*.pem              # Certificados privados
docker-compose.override.yml  # Overrides locais com secrets
```

### ✅ Configuração do .gitignore

O `.gitignore` está configurado para proteger:

```gitignore
# Environment
.env
.env.local
.env.*.local

# API Keys and Credentials
*.key
*.pem
**/secrets/
**/credentials/

# AWS credentials
.aws/credentials
.aws/config

# NPM tokens
.npmrc
```

### ✅ Como Inicializar o Projeto

1. **Clonar repositório:**
   ```bash
   git clone https://github.com/seu-usuario/petadopt.git
   cd petadopt
   ```

2. **Criar arquivos `.env.local`:**
   ```bash
   cp apps/api/.env.example apps/api/.env.local
   cp apps/web/.env.example apps/web/.env.local
   ```

3. **Preencher com credenciais reais:**
   ```bash
   # apps/api/.env.local
   SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_ANON_KEY=eyJ...
   CLOUDINARY_CLOUD_NAME=seu-cloud
   RESEND_API_KEY=re_...
   JWT_SECRET=sua-chave-secreta-minimo-32-caracteres
   ```

4. **Verificar que .env.local está ignorado:**
   ```bash
   git status
   # Não deve aparecer .env.local ou .env
   ```

## 🔐 Variáveis de Ambiente Críticas

### Backend - `apps/api/.env.local`

| Variável | Tipo | Crítico | Exemplo |
|---|---|---|---|
| `SUPABASE_URL` | URL | 🔴 Sim | `https://xyz.supabase.co` |
| `SUPABASE_ANON_KEY` | Token | 🔴 Sim | `eyJhbGciOiJIUzI1NiI...` |
| `SUPABASE_KEY` | Token | 🔴 Sim | `eyJhbGciOiJIUzI1NiI...` |
| `CLOUDINARY_CLOUD_NAME` | String | 🔴 Sim | `pjyakvxs` |
| `CLOUDINARY_API_KEY` | Key | 🔴 Sim | `123456789` |
| `CLOUDINARY_API_SECRET` | Secret | 🔴 Sim | `abc_xyz_...` |
| `RESEND_API_KEY` | Token | 🔴 Sim | `re_xxxx...` |
| `JWT_SECRET` | Secret | 🔴 Sim | `min-32-caracteres-seguro` |
| `DATABASE_URL` | URL | 🔴 Sim | `postgresql://user:pass@host` |

### Frontend - `apps/web/.env.local`

| Variável | Tipo | Crítico | Exemplo |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL | ⚠️ Semi | `http://localhost:3001` |
| `NEXTAUTH_URL` | URL | 🔴 Sim | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret | 🔴 Sim | `min-32-caracteres-seguro` |
| `GOOGLE_CLIENT_ID` | ID | ⚠️ Semi | `xxxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Secret | 🔴 Sim | `GOCSPX_xxx...` |

**Legenda:**
- 🔴 **Crítico** - Nunca expor ou commitar
- ⚠️ **Semi-crítico** - Pode ser público (prefixed com `NEXT_PUBLIC_`) mas proteger mesmo assim

## 🛡️ Boas Práticas de Segurança

### 1. Nunca Commitação .env
```bash
# ❌ ERRADO
git add .env.local
git commit -m "add env file"

# ✅ CORRETO
git add .gitignore
git add .env.example  # Apenas o template
git commit -m "docs: add env template"
```

### 2. Verificar Antes de Fazer Push
```bash
# Verificar arquivos que serão enviados
git diff --cached --name-only

# Se vir .env, remover:
git reset HEAD .env.local
git checkout -- .env.local
```

### 3. Limpar Histórico (Se Acidental)
```bash
# Se .env foi commitado acidentalmente:
git filter-branch --tree-filter 'rm -rf .env.local' HEAD

# Forçar rewrite
git push origin main --force-with-lease
```

### 4. Usar Environment Variables Localmente
```bash
# Não colocar em arquivos de código
# ✅ CORRETO - .env.local
API_KEY=seu-valor

# ❌ ERRADO - .js file
const API_KEY = "seu-valor"
```

### 5. Rotação de Secrets
Se uma credencial for exposta:
1. Revogar imediatamente na service (Supabase, Cloudinary, etc)
2. Gerar nova credencial
3. Atualizar `.env.local` localmente
4. Verificar commits anteriores em backup

## 🔍 Verificação de Segurança

### Verificar arquivos sensíveis no Git:
```bash
# Ver arquivos rastreados (deve estar vazio)
git ls-files | grep -E "\.env|secret|key|password"

# Ver histórico de .env
git log --all --full-history -- "*.env"

# Buscar strings suspeitas
git grep "SUPABASE_KEY\|API_SECRET" HEAD
```

### Ferramentas de Detecção:
```bash
# Usar git-secrets (recomendado)
npm install -g git-secrets
git secrets --install
git secrets --register-aws

# Usar pre-commit hooks
npm install --save-dev husky pre-commit
```

## 📋 Checklist de Segurança

- [ ] `.gitignore` contém `*.env*` e `*.local`
- [ ] `.env.local` está em `.gitignore`
- [ ] Nenhum `.env` no histórico do Git (`git log --all -- "*.env"`)
- [ ] `.env.example` existe com template seguro
- [ ] Credenciais reais APENAS em `.env.local` (nunca commitado)
- [ ] Pre-commit hooks para prevenir `.env` commit
- [ ] Senhas/tokens têm min 32 caracteres
- [ ] AWS/GCP credentials nunca commitadas
- [ ] NPM tokens nunca em .npmrc commitado
- [ ] SSH keys privadas em `.gitignore`

## 🆘 Segurança Comprometida?

Se você acidentalmente expôs uma credencial:

1. **Imediato:**
   - Revogar credencial na service original
   - Gerar nova credencial
   - Não fazer push antes de limpar

2. **Histórico:**
   ```bash
   # Se já foi commitado, remover do histórico
   git filter-branch --index-filter \
     'git rm --cached --ignore-unmatch .env.local' HEAD
   ```

3. **Notificar:**
   - Equipe de segurança
   - DevOps/admin
   - Repository owner

## 📚 Referências

- [GitHub - Removing Sensitive Data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [OWASP - Secrets Management](https://owasp.org/www-community/attacks/Secrets_in_Code)
- [git-secrets Tool](https://github.com/awslabs/git-secrets)
- [pre-commit Hooks](https://pre-commit.com/)

---

**Última atualização:** 2026-09-03
**Status:** ✅ Seguro - Nenhum dado sensível exposto
