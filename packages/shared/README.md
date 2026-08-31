# @petadopt/shared

Tipos e esquemas de validação compartilhados entre frontend e backend da PetAdopt.

## Estrutura

```
src/
├── types/           # Type definitions
│   ├── user.types.js
│   ├── pet.types.js
│   ├── adoption.types.js
│   ├── shelter.types.js
│   └── common.types.js
└── validation/      # Zod schemas
    ├── user.schemas.js
    ├── pet.schemas.js
    ├── adoption.schemas.js
    └── common.schemas.js
```

## Uso

### Types

```javascript
import { UserTypes, PetTypes, AdoptionTypes } from '@petadopt/shared/types';

const userType = UserTypes.ADOPTER;
const petSpecies = PetTypes.Species.DOG;
```

### Validation

```javascript
import { loginSchema, createPetSchema } from '@petadopt/shared/validation';

// Validate login
const result = loginSchema.safeParse(data);
if (!result.success) {
  console.error(result.error);
}

// Create pet
const petData = createPetSchema.parse(formData);
```

## Integração

- **Frontend**: Use tipos para type-checking de componentes
- **Backend**: Use schemas para validar requests
- **Ambos**: Use enums e constantes compartilhadas

## Building

```bash
pnpm build      # Compile TypeScript
pnpm type-check # Check types without emitting
pnpm clean      # Remove dist
```
