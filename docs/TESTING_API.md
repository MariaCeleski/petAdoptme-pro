# Testando a API PetAdopt - FASE 4

## Pré-requisitos

- Node.js v20+
- pnpm v12+
- Insomnia ou Postman (opcional)
- curl (para testes rápidos)

---

## 1. Instalar Dependências

```bash
cd /Users/mariadelourdesceleski/Documents/petadopt-pro

# Instalar dependências do workspace
pnpm install

# Verificar instalação
pnpm --version
```

---

## 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` em `apps/api/`:

```bash
# apps/api/.env.local
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Supabase (opcional, pode deixar em branco para testes iniciais)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima
```

---

## 3. Iniciar o Servidor

```bash
# Opção 1: Iniciar apenas o API backend
cd /Users/mariadelourdesceleski/Documents/petadopt-pro
pnpm dev:api

# Opção 2: Iniciar tudo (frontend + backend)
pnpm dev

# Output esperado:
# 🚀 Starting PetAdopt API Server...
# ⚠️  SUPABASE_URL not set - running without database
#
# ╔════════════════════════════════════════╗
# ║  🐾 PetAdopt API Server Started        ║
# ╠════════════════════════════════════════╣
# ║  Port:        3001
# ║  Environment: development
# ║  Time:        2026-08-31T...
# ╚════════════════════════════════════════╝
#
# 📡 Server running at http://localhost:3001
# 🔍 Health: curl http://localhost:3001/api/health
```

---

## 4. Testes Rápidos com curl

### 4.1 Health Check

```bash
# Teste simples que o servidor está rodando
curl http://localhost:3001/api/health

# Resposta esperada:
# {
#   "status": "ok",
#   "timestamp": "2026-08-31T...",
#   "environment": "development",
#   "uptime": 5.123
# }
```

### 4.2 Status Detalhado

```bash
curl http://localhost:3001/api/status

# Resposta esperada:
# {
#   "status": "healthy",
#   "timestamp": "2026-08-31T...",
#   "environment": "development",
#   "database": "not-configured",
#   "memory": {...}
# }
```

### 4.3 Informações da API

```bash
curl http://localhost:3001/api/info

# Resposta esperada:
# {
#   "name": "PetAdopt API",
#   "version": "1.0.0",
#   "endpoints": {...}
# }
```

---

## 5. Testes de Autenticação

### 5.1 Registrar Usuário

```bash
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
#     "id": "mock-id",
#     "email": "joao@example.com",
#     "name": "João Silva",
#     "userType": "ADOPTER"
#   }
# }
```

### 5.2 Login

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
#   "token": "mock-token",
#   "user": {...}
# }

# Salve o token para os próximos testes:
# TOKEN="mock-token"
```

### 5.3 Obter Usuário Atual

```bash
# Substitua TOKEN pelo token retornado no login
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer mock-token"

# Resposta esperada (200):
# {
#   "user": {
#     "id": "mock-id",
#     "email": "joao@example.com",
#     "name": "João Silva",
#     "userType": "ADOPTER",
#     "emailVerified": false,
#     "createdAt": "2026-08-31T..."
#   }
# }
```

---

## 6. Testes de Pets

### 6.1 Listar Pets

```bash
# Sem autenticação (público)
curl http://localhost:3001/api/pets

# Resposta esperada (200):
# {
#   "data": [],
#   "pagination": {
#     "total": 0,
#     "page": 1,
#     "limit": 10,
#     "pages": 0
#   }
# }

# Com filtros
curl "http://localhost:3001/api/pets?species=DOG&size=LARGE&page=1&limit=5"
```

### 6.2 Criar Pet

```bash
# Requer autenticação
curl -X POST http://localhost:3001/api/pets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock-token" \
  -d '{
    "name": "Max",
    "species": "DOG",
    "size": "LARGE",
    "gender": "MALE",
    "age": 3,
    "description": "Friendly dog",
    "images": ["https://example.com/max.jpg"]
  }'

# Resposta esperada (201):
# {
#   "message": "Pet created successfully",
#   "data": {
#     "id": "mock-id",
#     "name": "Max",
#     "petStatus": "AVAILABLE",
#     ...
#   }
# }
```

### 6.3 Obter Pet por ID

```bash
curl http://localhost:3001/api/pets/mock-id

# Resposta esperada (200):
# {
#   "data": {
#     "id": "mock-id",
#     "name": "Max",
#     ...
#   }
# }
```

### 6.4 Atualizar Pet

```bash
curl -X PATCH http://localhost:3001/api/pets/mock-id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock-token" \
  -d '{
    "name": "Max Updated",
    "description": "Very friendly dog"
  }'

# Resposta esperada (200):
# {
#   "message": "Pet updated successfully",
#   "data": {...}
# }
```

### 6.5 Atualizar Status do Pet

```bash
curl -X PATCH http://localhost:3001/api/pets/mock-id/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock-token" \
  -d '{
    "status": "ADOPTED"
  }'

# Resposta esperada (200):
# {
#   "message": "Pet status updated to ADOPTED"
# }
```

---

## 7. Testes de Adoção

### 7.1 Criar Solicitação de Adoção

```bash
curl -X POST http://localhost:3001/api/adoptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock-token" \
  -d '{
    "petId": "mock-id",
    "adoptionInfo": {
      "livingSpace": "APARTMENT",
      "familySituation": "Couple with no kids",
      "experience": "First time pet owner",
      "motivation": "Looking for a companion"
    }
  }'

# Resposta esperada (201):
# {
#   "message": "Adoption request created successfully",
#   "data": {
#     "id": "adoption-id",
#     "petId": "mock-id",
#     "adoptionStatus": "PENDING",
#     ...
#   }
# }
```

### 7.2 Listar Solicitações de Adoção

```bash
curl "http://localhost:3001/api/adoptions?status=PENDING&page=1"

# Resposta esperada (200):
# {
#   "data": [...],
#   "pagination": {...}
# }
```

### 7.3 Aprovar Adoção

```bash
curl -X PATCH http://localhost:3001/api/adoptions/adoption-id/approve \
  -H "Authorization: Bearer mock-token"

# Resposta esperada (200):
# {
#   "message": "Adoption approved successfully"
# }
```

---

## 8. Usando Insomnia/Postman

Existe uma coleção pré-configurada em `docs/insomnia-collection.json` (TODO: criar)

Passos:
1. Abra Insomnia/Postman
2. Importe a coleção
3. Configure a base URL: `http://localhost:3001/api`
4. Execute os testes

---

## 9. Teste de Rate Limiting

```bash
# Fazer 15 requisições rapidamente (limite é 10/minuto)
for i in {1..15}; do
  curl http://localhost:3001/api/health
done

# A 11ª requisição retornará:
# HTTP 429 Too Many Requests
# {
#   "error": "Too Many Requests",
#   "code": "RATE_LIMIT_EXCEEDED",
#   "retryAfter": 60
# }
```

---

## 10. Teste de Validação

```bash
# Email inválido
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "Password123!",
    "name": "John",
    "userType": "ADOPTER"
  }'

# Resposta esperada (400):
# {
#   "error": "Validation Error",
#   "code": "VALIDATION_ERROR",
#   "details": [
#     {
#       "field": "email",
#       "message": "Invalid email"
#     }
#   ]
# }
```

---

## 11. Estrutura de Pastas do Projeto

```
apps/api/src/
├── index.js                 # Servidor Express (ponto de entrada)
├── middleware/
│   ├── errorHandler.js     # Tratamento de erros centralizado
│   ├── validation.js       # Validação e sanitização
│   └── auth.js             # Autenticação e autorização
├── controllers/
│   ├── authController.js   # Lógica de autenticação
│   ├── petController.js    # Lógica de pets
│   └── adoptionController.js # Lógica de adoções
├── routes/
│   ├── auth.js            # Rotas de autenticação
│   ├── pets.js            # Rotas de pets
│   └── adoptions.js       # Rotas de adoções
└── services/
    └── supabaseClient.js  # Cliente Supabase
```

---

## 12. Próximos Passos

- [ ] Integrar com Supabase real
- [ ] Implementar autenticação JWT real
- [ ] Adicionar testes automatizados
- [ ] Documentação com Swagger
- [ ] Implementar upload de imagens
- [ ] Implementar notificações por email
- [ ] Adicionar logging estruturado

---

## Troubleshooting

### Porta 3001 já está em uso

```bash
# Mude a porta no .env.local
PORT=3002

# Ou libere a porta
lsof -ti:3001 | xargs kill -9
```

### Erro de CORS

Verifique se `CORS_ORIGIN` no `.env.local` está correto:
```bash
CORS_ORIGIN=http://localhost:3000
```

### Erro de Supabase

Se não tiver Supabase configurado, os endpoints que usam banco de dados falharão. Para testes iniciais, use apenas health checks e validação.

---

Desenvolvido com 🐾 para PetAdopt
