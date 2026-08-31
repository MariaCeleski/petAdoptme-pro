# 🔒 Bcrypt Security Implementation

## Overview

Implementação profissional de hashing seguro de senhas usando `bcryptjs` para proteção de dados de usuários.

---

## Porque Bcrypt?

✅ **Adaptativo:** Rounds podem aumentar conforme computadores ficam mais rápidos
✅ **Força bruta resistente:** Incorpora salt automaticamente
✅ **Padrão da indústria:** Usado por gigantes como Twitter, LinkedIn, Dropbox
✅ **Seguro:** Algoritmo Blowfish implementado com melhores práticas

---

## Configuração

### 1. Instalação

```bash
pnpm add bcryptjs --filter=@petadopt/api
```

### 2. Variáveis de Ambiente

```env
# apps/api/.env.local
BCRYPT_ROUNDS=10  # Número de salt rounds (recomendado: 10-12)
```

### 3. Rounds Recomendados

```
BCRYPT_ROUNDS=8   → ~40ms (rápido, para testes)
BCRYPT_ROUNDS=10  → ~100ms (padrão, recomendado)
BCRYPT_ROUNDS=12  → ~250ms (seguro, para produção)
BCRYPT_ROUNDS=14  → ~600ms (muito seguro, máxima segurança)
```

---

## Implementação em authController.js

### Hashing de Senha (Registro)

```javascript
import bcrypt from 'bcryptjs';

async function register(req, res) {
  const { email, password, name } = req.body;

  // Hash password com 10 rounds
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Salvar no banco com senha hasheada
  await insert('users', {
    email,
    password: hashedPassword,  // ✅ Apenas o hash é armazenado
    name,
  });
}
```

**Output exemplo:**
```
Password: "MySecurePass123!"
Hash: "$2b$10$nOUIs5kJ7naTuTFkBy1He.EjZWMUDlaFuOQawXRlRXsQw.w6YUJQe"
```

### Verificação de Senha (Login)

```javascript
async function login(req, res) {
  const { email, password } = req.body;

  const user = await select('users', { email });

  // Comparar password com hash usando bcryptjs
  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    throw new ApiError('Email ou senha inválida', 401);
  }

  // ✅ Login bem-sucedido
  const token = generateToken({ userId: user.id });
  return { token, user };
}
```

---

## Características de Segurança

### 1️⃣ Salt Automático

```javascript
// Cada hash tem um salt único
const hash1 = await bcrypt.hash("password", 10);
const hash2 = await bcrypt.hash("password", 10);

// hash1 ≠ hash2 (mesmo que a senha seja igual)
// Isso impede rainbow table attacks
```

### 2️⃣ Adaptativo

```javascript
// Aumentar rounds conforme processadores evoluem
// 2010: 8 rounds era seguro
// 2024: 10-12 rounds é recomendado
// 2030: pode precisar de 14+ rounds

// Bcrypt permite verificar qualquer versão
await bcrypt.compare(password, oldHash10Rounds);  // ✅ Funciona
await bcrypt.compare(password, newHash14Rounds);  // ✅ Também funciona
```

### 3️⃣ Resistente a Ataques

```
✅ Rainbow Tables   : Cada hash tem salt único
✅ Força Bruta      : ~100ms por tentativa (10 rounds)
✅ GPU Cracking     : Bcrypt não é GPU-friendly
✅ Timing Attacks   : Implementação segura
```

---

## Casos de Uso Implementados

### ✅ 1. Registro de Novo Usuário

```
POST /api/auth/register
├─ Validar email/senha com Zod
├─ Hash password com bcrypt (10 rounds)
├─ Salvar user no banco
└─ Retornar user sem password
```

### ✅ 2. Login

```
POST /api/auth/login
├─ Validar credenciais
├─ Comparar password com hash usando bcrypt
├─ Se correto: gerar JWT
└─ Se incorreto: erro 401
```

### ✅ 3. Alterar Senha (Novo)

```
PATCH /api/auth/change-password
├─ Verificar password antiga com bcrypt
├─ Hash password nova
├─ Atualizar no banco
└─ Requer autenticação JWT
```

### ✅ 4. Reset de Senha

```
POST /api/auth/password-reset/:token
├─ Validar token de reset
├─ Hash password nova
├─ Atualizar sem logar novamente
└─ Token expira em 1 hora
```

---

## Benchmark de Performance

```
BCRYPT_ROUNDS=8:   ~40ms  por hash
BCRYPT_ROUNDS=10:  ~100ms por hash
BCRYPT_ROUNDS=12:  ~250ms por hash
BCRYPT_ROUNDS=14:  ~600ms por hash
```

**Recomendação:** 
- Desenvolvimento: 8 rounds (~40ms)
- Produção: 10-12 rounds (~100-250ms)

---

## Testes de Segurança

### Teste 1: Hashes Diferentes

```javascript
const password = "MySecurePass123!";
const hash1 = await bcrypt.hash(password, 10);
const hash2 = await bcrypt.hash(password, 10);

console.log(hash1 === hash2);  // false (nunca iguais!)
```

### Teste 2: Comparação Correta

```javascript
const password = "MySecurePass123!";
const hash = await bcrypt.hash(password, 10);

const isCorrect = await bcrypt.compare(password, hash);
console.log(isCorrect);  // true

const isWrong = await bcrypt.compare("WrongPassword", hash);
console.log(isWrong);  // false
```

### Teste 3: Compatibilidade de Versões

```javascript
// Bcrypt é compatível com versões antigas
const oldHash = "$2a$10$R9h7cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW";
const password = "password123";

const isValid = await bcrypt.compare(password, oldHash);
console.log(isValid);  // true (compatível!)
```

---

## Boas Práticas

### ✅ FAÇA

```javascript
// ✅ Hash antes de salvar
const hashedPassword = await bcrypt.hash(password, 10);
await insert('users', { email, password: hashedPassword });

// ✅ Sempre compare usando bcrypt.compare
const isValid = await bcrypt.compare(password, user.password);

// ✅ Use async/await
await bcrypt.hash(password, 10);

// ✅ Aumentar rounds em produção
const rounds = process.env.NODE_ENV === 'production' ? 12 : 10;
```

### ❌ NÃO FAÇA

```javascript
// ❌ NUNCA armazene senhas em plain text
await insert('users', { email, password });

// ❌ NUNCA use SHA256 ou MD5
crypto.createHash('sha256').update(password).digest();

// ❌ NUNCA compare strings
if (password === user.password) { }

// ❌ NUNCA use rounds baixos em produção
await bcrypt.hash(password, 4);  // Inseguro!
```

---

## Migração de Senhas Antigas

Se tiver senhas antigas armazenadas, fazer migração:

```javascript
// Migração one-time em background
async function migrateOldPasswords() {
  const users = await select('users');
  
  for (const user of users) {
    if (user.password && !user.password.startsWith('$2')) {
      // Senha antiga (não é bcrypt)
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await update('users', { password: hashedPassword }, { id: user.id });
    }
  }
}
```

---

## Troubleshooting

### Problema: "Bcrypt is not available"

```bash
# Solução
pnpm add bcryptjs
npm install bcryptjs  # Alternativa
```

### Problema: Hash muito lento

```javascript
// Usar menos rounds em testes
const rounds = process.env.NODE_ENV === 'test' ? 4 : 10;
```

### Problema: Senha não funciona

```javascript
// Verificar se está armazenando hash (não plain text)
console.log(user.password.startsWith('$2'));  // Deve ser true
```

---

## Recursos

- [bcryptjs Official](https://github.com/dcodeIO/bcrypt.js)
- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Bcrypt vs Argon2](https://www.npmjs.com/package/bcryptjs#security-considerations)

---

Desenvolvido com �� para PetAdopt
**Segurança em primeiro lugar!**
