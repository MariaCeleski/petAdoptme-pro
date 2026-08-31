# Backend API - PetAdopt

## Estrutura Organizada

```
src/app/api/
├── services/              # Lógica de negócio centralizada
│   ├── petService.js      # Serviço de pets (CRUD, filtros, busca)
│   ├── adoptionService.js # Serviço de adoções
│   ├── userService.js     # Serviço de usuários
│   └── ...
├── middleware/            # Middlewares compartilhados
│   ├── auth.js            # Autenticação e autorização
│   └── ...
├── helpers/               # Funções auxiliares
│   ├── response.js        # Respostas padronizadas
│   ├── validation.js      # Validação de dados
│   └── ...
├── adoptions/             # Routes de adoções
│   ├── route.js
│   ├── [id]/
│   │   ├── route.js
│   │   ├── approve/route.js
│   │   └── reject/route.js
├── pets/                  # Routes de pets
│   ├── route.js
│   ├── [id]/route.js
│   ├── owner/route.js
│   └── search/route.js
├── auth/                  # Routes de autenticação
│   ├── [...nextauth]/route.js
│   ├── register/route.js
│   └── ...
└── ... (outras rotas)
```

## Como Usar

### Criar nova rota usando serviços

Antes (lógica misturada):
```javascript
// src/app/api/pets/route.js
export async function GET(request) {
  // ... 200+ linhas de lógica misturada
}
```

Depois (lógica separada):
```javascript
// src/app/api/pets/route.js
import { petService } from '@/app/api/services/petService';
import { apiResponse } from '@/app/api/helpers/response';
import { requireAuth } from '@/app/api/middleware/auth';

export async function GET(request) {
  try {
    const filters = Object.fromEntries(request.nextUrl.searchParams);
    const { pets, pagination } = await petService.listPets(filters);
    
    return apiResponse.success({ pets, pagination });
  } catch (error) {
    return apiResponse.serverError('Failed to list pets', error);
  }
}
```

### Usar middleware de autenticação

```javascript
import { requireAuth, requireRole } from '@/app/api/middleware/auth';
import { apiResponse } from '@/app/api/helpers/response';

export async function POST(request) {
  // Garantir que usuário está autenticado
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  // Usar userId do usuário autenticado
  const { userId } = auth;

  // ... resto da lógica
}
```

### Respostas padronizadas

```javascript
import { apiResponse } from '@/app/api/helpers/response';

// Sucesso
return apiResponse.success({ pet }, 200, 'Pet created');

// Criado
return apiResponse.created({ pet }, 'Pet registered');

// Erro de validação
return apiResponse.validationError('Invalid data', details);

// Não autenticado
return apiResponse.unauthorized();

// Sem permissão
return apiResponse.forbidden();

// Não encontrado
return apiResponse.notFound();

// Erro do servidor
return apiResponse.serverError('Error message', error);
```

## Benefícios

✅ **Reutilização de código** - Lógica compartilhada em services  
✅ **Fácil manutenção** - Mudanças centralizadas  
✅ **Respostas consistentes** - API helpers padronizam responses  
✅ **Segurança** - Middleware centralizado de autenticação  
✅ **Testes** - Services são fáceis de testar isoladamente  
✅ **Documentação** - Código bem organizado é autodocumentado  

## Próximas adições

- [ ] `userService.js` - Gerenciamento de usuários
- [ ] `shelterService.js` - Gerenciamento de abrigos
- [ ] `emailService.js` - Envio de emails
- [ ] `notificationService.js` - Sistema de notificações
- [ ] `uploadService.js` - Upload de imagens
