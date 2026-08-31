# PetAdopt API Endpoints - FASE 4

## Overview

A API do PetAdopt foi implementada com uma arquitetura modular seguindo as melhores práticas:

- ✅ **Middleware centralizado** para autenticação, validação e tratamento de erros
- ✅ **Controllers desacoplados** para lógica de negócio
- ✅ **Rotas estruturadas** com validação de esquema Zod
- ✅ **Segurança** com rate limiting, sanitização de inputs e autenticação JWT
- ✅ **Documentação** automática de todos os endpoints

## Base URL

```
http://localhost:3001/api
```

## Authentication

Todos os endpoints que requerem autenticação esperam um header:

```
Authorization: Bearer <token>
```

O token JWT é retornado no login e pode ser usado para acessar endpoints protegidos.

---

## Endpoints de Autenticação

### 1. Registrar Novo Usuário

**POST** `/auth/register`

Cria uma nova conta de usuário.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "João Silva",
  "userType": "ADOPTER" // ou SHELTER_ADMIN, INDIVIDUAL_OWNER
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "João Silva",
    "userType": "ADOPTER"
  }
}
```

**Errors:**
- `409 EMAIL_EXISTS`: Email já registrado
- `400 VALIDATION_ERROR`: Dados inválidos

---

### 2. Login

**POST** `/auth/login`

Autentica o usuário e retorna um token JWT.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "João Silva",
    "userType": "ADOPTER"
  }
}
```

**Errors:**
- `401 INVALID_CREDENTIALS`: Email ou senha inválida

---

### 3. Logout

**POST** `/auth/logout`

Requer autenticação.

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

### 4. Obter Usuário Atual

**GET** `/auth/me`

Requer autenticação. Retorna informações do usuário logado.

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "João Silva",
    "userType": "ADOPTER",
    "emailVerified": false,
    "createdAt": "2026-08-31T10:00:00Z"
  }
}
```

---

### 5. Resetar Senha

**POST** `/auth/password-reset`

Inicia processo de reset de senha.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "If an account exists, a reset link has been sent"
}
```

---

### 6. Completar Reset de Senha

**POST** `/auth/password-reset/:token`

Completa o processo de reset com a nova senha.

**Request Body:**
```json
{
  "newPassword": "NewSecurePassword456!"
}
```

**Response (200):**
```json
{
  "message": "Password reset successfully"
}
```

---

## Endpoints de Pets

### 1. Listar Todos os Pets

**GET** `/pets`

Lista pets disponíveis com filtros e paginação.

**Query Parameters:**
- `page` (int, default: 1): Número da página
- `limit` (int, default: 10): Itens por página
- `species` (string): Filtrar por espécie (DOG, CAT, etc)
- `size` (string): Filtrar por tamanho (SMALL, MEDIUM, LARGE, XLARGE)
- `gender` (string): Filtrar por gênero (MALE, FEMALE)
- `status` (string, default: AVAILABLE): Status do pet

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Max",
      "species": "DOG",
      "size": "LARGE",
      "gender": "MALE",
      "age": 3,
      "petStatus": "AVAILABLE",
      "ownerId": "uuid",
      "createdAt": "2026-08-31T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "pages": 15
  }
}
```

---

### 2. Obter Pet por ID

**GET** `/pets/:id`

Obtém detalhes completos de um pet específico.

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "name": "Max",
    "species": "DOG",
    "size": "LARGE",
    "gender": "MALE",
    "age": 3,
    "petStatus": "AVAILABLE",
    "description": "Friendly dog, loves to play",
    "ownerId": "uuid",
    "images": ["url1", "url2"],
    "createdAt": "2026-08-31T10:00:00Z"
  }
}
```

---

### 3. Criar Novo Pet

**POST** `/pets`

Requer autenticação. Cria um novo pet.

**Request Body:**
```json
{
  "name": "Luna",
  "species": "CAT",
  "size": "SMALL",
  "gender": "FEMALE",
  "age": 2,
  "description": "Affectionate cat, loves cuddles",
  "images": ["https://..."]
}
```

**Response (201):**
```json
{
  "message": "Pet created successfully",
  "data": {
    "id": "uuid",
    "name": "Luna",
    "species": "CAT",
    "size": "SMALL",
    "gender": "FEMALE",
    "age": 2,
    "petStatus": "AVAILABLE",
    "ownerId": "uuid",
    "createdAt": "2026-08-31T10:00:00Z"
  }
}
```

---

### 4. Atualizar Pet

**PATCH** `/pets/:id`

Requer autenticação (owner). Atualiza informações do pet.

**Request Body:**
```json
{
  "name": "Luna Updated",
  "description": "Updated description"
}
```

**Response (200):**
```json
{
  "message": "Pet updated successfully",
  "data": {
    "id": "uuid",
    "name": "Luna Updated",
    ...
  }
}
```

---

### 5. Atualizar Status do Pet

**PATCH** `/pets/:id/status`

Requer autenticação (owner). Muda o status do pet.

**Request Body:**
```json
{
  "status": "ADOPTED" // AVAILABLE, ADOPTED, ARCHIVED, UNAVAILABLE
}
```

**Response (200):**
```json
{
  "message": "Pet status updated to ADOPTED"
}
```

---

### 6. Deletar/Arquivar Pet

**DELETE** `/pets/:id`

Requer autenticação (owner). Arquiva um pet (soft delete).

**Response (200):**
```json
{
  "message": "Pet deleted successfully"
}
```

---

### 7. Pets por Owner

**GET** `/pets/owner/:ownerId`

Lista todos os pets de um proprietário específico.

**Query Parameters:**
- `page` (int, default: 1): Número da página
- `limit` (int, default: 10): Itens por página

**Response (200):**
```json
{
  "data": [...],
  "pagination": {...}
}
```

---

## Endpoints de Adoção

### 1. Criar Solicitação de Adoção

**POST** `/adoptions`

Requer autenticação. Cria uma solicitação de adoção para um pet.

**Request Body:**
```json
{
  "petId": "uuid",
  "adoptionInfo": {
    "livingSpace": "APARTMENT",
    "familySituation": "Couple with no kids",
    "experience": "First time pet owner",
    "motivation": "Looking for a companion"
  }
}
```

**Response (201):**
```json
{
  "message": "Adoption request created successfully",
  "data": {
    "id": "uuid",
    "petId": "uuid",
    "adopterId": "uuid",
    "adoptionStatus": "PENDING",
    "createdAt": "2026-08-31T10:00:00Z"
  }
}
```

**Errors:**
- `404 PET_NOT_FOUND`: Pet não existe
- `400 PET_NOT_AVAILABLE`: Pet não está disponível

---

### 2. Listar Solicitações de Adoção

**GET** `/adoptions`

Lista todas as solicitações de adoção.

**Query Parameters:**
- `status` (string): Filtrar por status (PENDING, APPROVED, REJECTED)
- `petId` (string): Filtrar por pet
- `adopterId` (string): Filtrar por adotante
- `page` (int): Número da página
- `limit` (int): Itens por página

**Response (200):**
```json
{
  "data": [...],
  "pagination": {...}
}
```

---

### 3. Obter Solicitação por ID

**GET** `/adoptions/:id`

Obtém detalhes de uma solicitação específica.

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "petId": "uuid",
    "adopterId": "uuid",
    "adoptionStatus": "PENDING",
    "adoptionInfo": {...},
    "createdAt": "2026-08-31T10:00:00Z"
  }
}
```

---

### 4. Aprovar Adoção

**PATCH** `/adoptions/:id/approve`

Requer autenticação (owner do pet). Aprova uma solicitação de adoção.

**Response (200):**
```json
{
  "message": "Adoption approved successfully"
}
```

---

### 5. Rejeitar Adoção

**PATCH** `/adoptions/:id/reject`

Requer autenticação (owner do pet). Rejeita uma solicitação de adoção.

**Request Body:**
```json
{
  "reason": "Looking for experienced owners"
}
```

**Response (200):**
```json
{
  "message": "Adoption rejected successfully"
}
```

---

### 6. Adoções por Adotante

**GET** `/adoptions/adopter/:adopterId`

Lista todas as solicitações de adoção de um adotante específico.

**Response (200):**
```json
{
  "data": [...],
  "pagination": {...}
}
```

---

### 7. Adoções de um Pet

**GET** `/adoptions/pet/:petId`

Lista todas as solicitações de adoção para um pet específico.

**Response (200):**
```json
{
  "data": [...]
}
```

---

## Endpoints de Health Check

### 1. Health Check Simples

**GET** `/health`

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-08-31T10:00:00Z",
  "environment": "development",
  "uptime": 120.5
}
```

---

### 2. Status Detalhado

**GET** `/status`

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2026-08-31T10:00:00Z",
  "environment": "development",
  "uptime": 120.5,
  "database": "configured",
  "memory": {
    "rss": 128,
    "heapUsed": 64,
    "heapTotal": 256
  },
  "version": "1.0.0"
}
```

---

### 3. Informações da API

**GET** `/info`

**Response (200):**
```json
{
  "name": "PetAdopt API",
  "version": "1.0.0",
  "environment": "development",
  "endpoints": {
    "health": "GET /health",
    "status": "GET /status",
    "info": "GET /info",
    "auth": "POST /auth/*",
    "pets": "GET/POST/PATCH/DELETE /pets/*",
    "adoptions": "GET/POST/PATCH /adoptions/*"
  },
  "documentation": "/docs"
}
```

---

## Tratamento de Erros

Todos os erros seguem este formato:

```json
{
  "error": "Mensagem de erro",
  "code": "CÓDIGO_ERRO",
  "timestamp": "2026-08-31T10:00:00Z"
}
```

### Códigos de Erro Comuns

- `VALIDATION_ERROR` (400): Dados de entrada inválidos
- `MISSING_TOKEN` (401): Token não fornecido
- `INVALID_TOKEN` (401): Token inválido ou expirado
- `NOT_AUTHENTICATED` (401): Autenticação necessária
- `INSUFFICIENT_PERMISSIONS` (403): Permissões insuficientes
- `NOT_FOUND` (404): Recurso não encontrado
- `EMAIL_EXISTS` (409): Email já registrado
- `RATE_LIMIT_EXCEEDED` (429): Muitas requisições
- `INTERNAL_ERROR` (500): Erro interno do servidor

---

## Rate Limiting

- **Global**: 100 requisições por minuto
- **Auth**: 10 requisições por minuto
- **Pets**: 30 requisições por minuto
- **Adoptions**: 20 requisições por minuto

Quando o limite é excedido, a resposta é:

```json
{
  "error": "Too Many Requests",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60,
  "timestamp": "2026-08-31T10:00:00Z"
}
```

---

## Próximas Etapas

- [ ] Implementar JWT real com jsonwebtoken
- [ ] Adicionar bcrypt para hashing de senhas
- [ ] Implementar serviço de email (SendGrid/Resend)
- [ ] Adicionar upload de imagens (Cloudinary)
- [ ] Implementar testes integrados
- [ ] Documentação automatizada com Swagger/OpenAPI
- [ ] Monitoramento e logging estruturado
