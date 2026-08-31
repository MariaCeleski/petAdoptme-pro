# E2E Tests - PetAdopt Platform

## Configuração Completa do Playwright E2E

Este diretório contém toda a configuração de testes E2E para a PetAdopt Platform.

## Estrutura

```
e2e/
├── fixtures/                # Fixtures reutilizáveis
│   ├── auth.fixture.js      # Autenticação
│   ├── pet.fixture.js       # Gerenciamento de pets
│   ├── adoption.fixture.js  # Workflow de adoção
│   └── index.js             # Consolidação
├── helpers/                 # Funções auxiliares
│   ├── test-data.js        # Geração de dados
│   └── a11y.js             # Acessibilidade
├── specs/                   # Suites de testes
│   ├── authentication.spec.js
│   ├── pet-management.spec.js
│   ├── adoption-workflow.spec.js
│   ├── dashboard.spec.js
│   └── responsiveness.spec.js
└── README.md               # Este arquivo
```

## Features Testadas

### ✅ Autenticação (authentication.spec.js)
- Registro de novo usuário
- Login com credenciais válidas/inválidas
- Validação de força de senha
- Logout
- Persistência de sessão
- Redirecionamento automático
- **Requirement Coverage**: 1.1-1.7

### ✅ Gerenciamento de Pets (pet-management.spec.js)
- Criar pet com campos obrigatórios
- Validação de campos obrigatórios
- Editar informações do pet
- Mudar status do pet
- Campos opcionais
- Visibilidade no catálogo
- **Requirement Coverage**: 2.1-2.7

### ✅ Fluxo de Adoção (adoption-workflow.spec.js)
- Manifestar interesse em pet
- Preenchimento de formulário de adoção
- Revisão e aprovação
- Rejeição com motivo
- **Requirement Coverage**: 6.1-6.8

### ✅ Dashboard (dashboard.spec.js)
- Dashboard do adotante
- Dashboard do proprietário
- Edição de perfil
- Estatísticas e atividade
- **Requirement Coverage**: 7.1-7.4

### ✅ Responsividade (responsiveness.spec.js)
- Múltiplos viewports (mobile, tablet, desktop)
- Navegação touch-friendly
- Sem scroll horizontal
- Layout otimizado
- Interações mobile
- **Requirement Coverage**: 9.1, 9.2, 9.5

## Executar Testes

### Todos os testes
```bash
npm run test:e2e
```

### UI interativa
```bash
npm run test:e2e:ui
```

### Debug
```bash
npm run test:e2e:debug
```

### Navegadores específicos
```bash
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit
npm run test:e2e:mobile
```

### Ver relatório
```bash
npm run test:e2e:report
```

## Fixtures Disponíveis

### authFixture
- `authHelper` - Funções de auth (login, register, logout)
- `authenticatedPage` - Página com usuário autenticado
- `petOwnerPage` - Página com pet owner
- `adopterPage` - Página com adopter
- `shelterAdminPage` - Página com shelter admin

### petFixture
- `petHelper` - Funções de pets (criar, editar, deletar, filtrar)
- `testPetCreated` - Pet de teste pré-criado

### adoptionFixture
- `adoptionHelper` - Funções de adoção (manifestar interesse, preencher, aprovar, etc)

## Dados de Teste

Geração automática de dados realistas:
- `generateTestUser(userType)` - Usuário com email único
- `generateTestPet()` - Pet com dados aleatórios
- `generateAdopterInfo()` - Informações de adotante
- `generateShelterInfo()` - Informações de abrigo

## Exemplo de Teste

```javascript
import { test, expect } from '@playwright/test';
import { generateTestUser } from '../helpers/test-data.js';

test('deve fazer login com sucesso', async ({ page }) => {
  const user = generateTestUser('ADOPTER');
  
  await page.goto('http://localhost:3000/auth/login');
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL(/\/dashboard/);
});
```

## Coverage

**Total de Testes**: 40+ testes
**Navegadores**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari, iPad
**Viewports**: 5+ diferentes tamanhos
**Requirements Cobertos**: 1.1-1.7, 2.1-2.7, 6.1-6.8, 7.1-7.4, 9.1-9.5

## Configuração

Ver `playwright.config.js` para:
- Timeout (30s padrão)
- Reporters (HTML, JSON, JUnit)
- Projetos (browsers e viewports)
- Web server (npm run dev)
- Base URL (http://localhost:3000)

## Troubleshooting

### Testes falhando
1. Verificar se servidor está rodando: `npm run dev`
2. Verificar BASE_URL
3. Usar modo debug: `npm run test:e2e:debug`

### Elementos não encontrados
1. Usar seletores `[data-testid="..."]`
2. Verificar seletor no navegador
3. Usar modo UI: `npm run test:e2e:ui`

### Testes lentos
1. Aumentar timeout se necessário
2. Verificar network/servidor
3. Usar `waitForLoadState('networkidle')`

## Próximos Passos

- [ ] Adicionar testes de performance
- [ ] Adicionar visual regression tests
- [ ] Expandir cobertura de edge cases
- [ ] Integrar com CI/CD (GitHub Actions)
- [ ] Adicionar testes de acessibilidade automatizados

## Ver Também

- [E2E_TESTING_GUIDE.md](../E2E_TESTING_GUIDE.md) - Guia completo
- [playwright.config.js](../playwright.config.js) - Configuração
- [Playwright Documentation](https://playwright.dev)
