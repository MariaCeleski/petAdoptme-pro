# Design Document: Pet Registration Form Feature

## Overview

The Pet Registration Form is a multi-section, server-backed React component that enables pet owners to register pets for adoption on the PetAdopt platform. The design emphasizes data integrity through dual-layer validation (frontend for UX, backend for security), responsive mobile-first layout, and clear error communication. The form collects 21 fields across 5 sections with intelligent state management and field mapping between frontend and backend systems.

**Key Design Principles:**
- Progressive disclosure: Show relevant fields based on context
- Fail fast: Validate early with real-time feedback
- Clear affordance: Indicate required fields, character counts, and error states
- Responsive first: Mobile support is primary; desktop is enhanced
- Data integrity: Backend validation is authoritative; frontend is convenience

---

## Architecture

### Component Hierarchy

```
<PetRegistrationForm>
  ├── <FormHeader>
  ├── <ProgressIndicator>
  ├── <Section1_BasicInfo>
  │   ├── <TextInput name="nomePet" />
  │   ├── <SelectInput name="especie" />
  │   ├── <TextInput name="raca" />
  │   ├── <NumberInput name="idade" />
  │   ├── <SelectInput name="genero" />
  │   ├── <SelectInput name="tamanho" />
  │   └── <TextAreaInput name="corAparencia" />
  ├── <Section2_Health>
  │   ├── <SelectInput name="vacinado" />
  │   ├── <SelectInput name="castrado" />
  │   ├── <SelectInput name="microchip" />
  │   ├── <TextAreaInput name="historicoMedico" />
  │   └── <TextAreaInput name="alergias" />
  ├── <Section3_Behavior>
  │   ├── <SelectInput name="temperamento" />
  │   ├── <SelectInput name="criancas" />
  │   ├── <SelectInput name="outrosAnimais" />
  │   └── <TextAreaInput name="descricaoGeral" />
  ├── <Section4_Photos>
  │   ├── <FileUploadInput name="fotos" />
  │   └── <PhotoPreview />
  ├── <Section5_Additional>
  │   ├── <SelectInput name="motivoAdocao" />
  │   ├── <TextInput name="nomeContatoTutor" />
  │   ├── <PhoneInput name="telefoneTutor" />
  │   ├── <EmailInput name="emailTutor" />
  │   └── <SelectInput name="aceitaCidade" />
  ├── <FormNavigation>
  │   ├── <PreviousButton />
  │   ├── <NextButton />
  │   └── <SubmitButton />
  └── <ErrorSummary>
```

### State Management

**Form State Structure (React Context + Hooks):**

```javascript
{
  // Current UI state
  currentSection: number, // 0-4 (or "all" for desktop)
  isSubmitting: boolean,
  
  // Field values (frontend format)
  formData: {
    nomePet: string,
    especie: 'cachorro' | 'gato' | 'coelho' | 'outro',
    raca: string,
    idade: string | number,
    genero: 'macho' | 'femea',
    tamanho: 'pequeno' | 'medio' | 'grande' | 'extra-grande',
    corAparencia: string,
    vacinado: 'sim' | 'nao' | null,
    castrado: 'sim' | 'nao' | null,
    microchip: 'sim' | 'nao' | null,
    historicoMedico: string,
    alergias: string,
    temperamento: 'docil' | 'brincalhao' | 'timido' | 'agressivo' | 'calmo',
    criancas: 'sim' | 'nao' | 'supervisionada',
    outrosAnimais: 'sim' | 'nao' | 'depende',
    descricaoGeral: string,
    fotos: File[],
    motivoAdocao: 'mudanca' | 'incompatibilidade' | 'outras' | 'resgate',
    nomeContatoTutor: string,
    telefoneTutor: string,
    emailTutor: string,
    aceitaCidade: 'sim' | 'nao'
  },
  
  // Validation state
  errors: {
    [fieldName]: string // error message or empty
  },
  touched: {
    [fieldName]: boolean // has user interacted with field
  },
  
  // File preview state
  photoPreviews: Array<{
    file: File,
    preview: string (blob URL),
    name: string,
    size: string
  }>
}
```

### Data Flow

```
User Input (UI)
    ↓
[Frontend Validation Layer]
  - Real-time validation on blur
  - Character count updates
  - Error message display
  - State update
    ↓
[User Reviews/Corrects]
    ↓
[Submit Click]
    ↓
[Form Validation - All Fields]
  - Check required fields
  - Check field constraints
  - Check file requirements
    ↓
[If Invalid] → Display error summary and highlight fields
[If Valid] → Submit
    ↓
[POST /api/pets + Bearer Token]
    ↓
[Backend Validation Layer]
  - Zod schema validation
  - Type casting and transformation
  - Business logic validation
    ↓
[If Invalid] → Return 400 + error details
[If Valid] → Store in database, return 201 + Pet Record
    ↓
[Frontend Success Handler]
  - Display success message
  - Clear form state
  - Navigate to confirmation
```

---

## Components and Interfaces

### FormProvider Context

Provides form state and dispatch to all child components.

```typescript
interface FormContextType {
  formData: FormData;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  photoPreviews: PhotoPreview[];
  currentSection: number;
  isSubmitting: boolean;
  
  // Actions
  setFieldValue: (fieldName: string, value: any) => void;
  setFieldError: (fieldName: string, error: string) => void;
  setFieldTouched: (fieldName: string, touched: boolean) => void;
  addPhotoPreview: (file: File, preview: string) => void;
  removePhotoPreview: (index: number) => void;
  goToSection: (section: number) => void;
  resetForm: () => void;
}
```

### Input Components

Each input component handles:
- Value binding
- Change handling with validation
- Blur handling (sets touched)
- Error display
- Character count (for textarea)

**TextInput Example:**
```typescript
interface TextInputProps {
  name: string;
  label: string;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  placeholder?: string;
}

// Emits: onChange(name, value), onBlur(name)
```

**SelectInput:**
```typescript
interface SelectInputProps {
  name: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  defaultValue?: string;
}
```

**FileUploadInput:**
```typescript
interface FileUploadProps {
  name: string;
  maxFiles: number;
  maxFileSize: number; // bytes
  acceptedMimes: string[];
}

// Validates and stores files in photoPreviews
```

### Validation Schema (Frontend - Zod)

```typescript
const petRegistrationSchema = z.object({
  // Section 1: Basic Info
  nomePet: z.string().min(1, 'Nome é obrigatório').max(50),
  especie: z.enum(['cachorro', 'gato', 'coelho', 'outro']),
  raca: z.string().min(1).max(50),
  idade: z.coerce.number().int().min(0).max(50),
  genero: z.enum(['macho', 'femea']),
  tamanho: z.enum(['pequeno', 'medio', 'grande', 'extra-grande']),
  corAparencia: z.string().min(1).max(500),
  
  // Section 2: Health
  vacinado: z.enum(['sim', 'nao']).default('nao'),
  castrado: z.enum(['sim', 'nao']).default('nao'),
  microchip: z.enum(['sim', 'nao']).default('nao'),
  historicoMedico: z.string().max(300).optional(),
  alergias: z.string().max(300).optional(),
  
  // Section 3: Behavior
  temperamento: z.enum(['docil', 'brincalhao', 'timido', 'agressivo', 'calmo']),
  criancas: z.enum(['sim', 'nao', 'supervisionada']),
  outrosAnimais: z.enum(['sim', 'nao', 'depende']),
  descricaoGeral: z.string().min(10).max(500),
  
  // Section 4: Photos
  fotos: z.array(z.instanceof(File))
    .min(1, 'Pelo menos 1 foto é obrigatória')
    .max(5, 'Máximo 5 fotos'),
  
  // Section 5: Additional
  motivoAdocao: z.enum(['mudanca', 'incompatibilidade', 'outras', 'resgate']),
  nomeContatoTutor: z.string().min(1).max(100),
  telefoneTutor: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/),
  emailTutor: z.string().email(),
  aceitaCidade: z.enum(['sim', 'nao'])
});
```

### Backend API Contract

**Endpoint:** `POST /api/pets`

**Request Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body (transformed from frontend):**
```json
{
  "name": "string (1-100 chars)",
  "species": "DOG | CAT",
  "breed": "string (1-50 chars)",
  "age": "string",
  "gender": "MALE | FEMALE",
  "size": "SMALL | MEDIUM | LARGE",
  "color": "string",
  "description": "string (10-500 chars)",
  "isVaccinated": "boolean (default: false)",
  "isNeutered": "boolean (default: false)",
  "healthStatus": "string (0-300 chars, optional)",
  "personality": ["string array, max 5 items"]
}
```

**Response - Success (201):**
```json
{
  "message": "Pet created successfully",
  "data": {
    "id": "uuid",
    "name": "string",
    "species": "DOG",
    "breed": "string",
    "age": "string",
    "gender": "MALE",
    "size": "SMALL",
    "color": "string",
    "description": "string",
    "is_vaccinated": false,
    "is_neutered": false,
    "health_status": null,
    "personality": ["docil"],
    "owner_id": "uuid",
    "status": "AVAILABLE",
    "created_at": "ISO8601 timestamp",
    "updated_at": "ISO8601 timestamp"
  }
}
```

**Response - Validation Error (400):**
```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      },
      {
        "field": "age",
        "message": "Age must be between 0 and 50"
      }
    ]
  }
}
```

---

## Data Models

### Frontend FormData Interface

```typescript
interface FormData {
  // Section 1
  nomePet: string;
  especie: 'cachorro' | 'gato' | 'coelho' | 'outro';
  raca: string;
  idade: number;
  genero: 'macho' | 'femea';
  tamanho: 'pequeno' | 'medio' | 'grande' | 'extra-grande';
  corAparencia: string;
  
  // Section 2
  vacinado: 'sim' | 'nao';
  castrado: 'sim' | 'nao';
  microchip: 'sim' | 'nao';
  historicoMedico: string;
  alergias: string;
  
  // Section 3
  temperamento: 'docil' | 'brincalhao' | 'timido' | 'agressivo' | 'calmo';
  criancas: 'sim' | 'nao' | 'supervisionada';
  outrosAnimais: 'sim' | 'nao' | 'depende';
  descricaoGeral: string;
  
  // Section 4
  fotos: File[];
  
  // Section 5
  motivoAdocao: 'mudanca' | 'incompatibilidade' | 'outras' | 'resgate';
  nomeContatoTutor: string;
  telefoneTutor: string;
  emailTutor: string;
  aceitaCidade: 'sim' | 'nao';
}
```

### Backend Pet Record (Database)

```typescript
interface PetRecord {
  id: UUID;
  name: string;
  species: 'DOG' | 'CAT';
  breed: string;
  age: string;
  gender: 'MALE' | 'FEMALE';
  size: 'SMALL' | 'MEDIUM' | 'LARGE';
  color: string;
  description: string;
  is_vaccinated: boolean;
  is_neutered: boolean;
  health_status: string | null;
  personality: string[];
  owner_id: UUID;
  status: 'AVAILABLE' | 'PENDING' | 'ADOPTED' | 'UNAVAILABLE';
  created_at: ISO8601;
  updated_at: ISO8601;
}
```

### Field Mapping Reference

| Frontend Field | Frontend Type | Backend Field | Backend Type | Database Field | Transformation |
|---|---|---|---|---|---|
| nomePet | text | name | string | name | Direct |
| especie | select | species | enum | species | cachorro→DOG, gato→CAT |
| raca | text | breed | string | breed | Direct |
| idade | number | age | string | age | toString() |
| genero | select | gender | enum | gender | macho→MALE, femea→FEMALE |
| tamanho | select | size | enum | size | pequeno→SMALL, medio→MEDIUM, grande→LARGE |
| corAparencia | textarea | color | string | color | Direct |
| vacinado | select | isVaccinated | boolean | is_vaccinated | sim→true, nao→false |
| castrado | select | isNeutered | boolean | is_neutered | sim→true, nao→false |
| microchip | select | (omitted) | N/A | microchip | UI-only field, not sent |
| historicoMedico | textarea | healthStatus | string | health_status | Direct, optional |
| alergias | textarea | (omitted) | N/A | alergias | UI-only field, not sent |
| temperamento | select | personality | array | personality | Direct, array of traits |
| criancas | select | (omitted) | N/A | criancas | UI-only field, not sent |
| outrosAnimais | select | (omitted) | N/A | outros_animais | UI-only field, not sent |
| descricaoGeral | textarea | description | string | description | Direct |
| fotos | file[] | (phase 2) | N/A | N/A | Not sent in Phase 1 |
| motivoAdocao | select | (omitted) | N/A | motivo_adocao | UI-only field, not sent |
| nomeContatoTutor | text | (omitted) | N/A | N/A | UI-only field, not sent |
| telefoneTutor | tel | (omitted) | N/A | N/A | UI-only field, not sent |
| emailTutor | email | (omitted) | N/A | N/A | UI-only field, not sent |
| aceitaCidade | select | (omitted) | N/A | aceita_cidade | UI-only field, not sent |

---

## Validation Strategy

### Frontend Validation Flow

1. **On Field Change (onChange):**
   - Update formData state
   - For text fields: update character count
   - Do NOT validate yet (avoid excessive errors)

2. **On Field Blur (onBlur):**
   - Mark field as touched
   - Run validation
   - If invalid: set error message
   - If valid: clear error message

3. **On Form Submit:**
   - Validate ALL fields (even untouched)
   - Check file requirements (min 1, max 5 photos)
   - If any errors: display error summary, focus first error field
   - If valid: proceed to API submission

### Backend Validation Flow

```typescript
POST /api/pets
  1. Check Bearer token → 401 if missing/invalid
  2. Extract userId from JWT
  3. Check user type (INDIVIDUAL_OWNER or SHELTER_ADMIN) → 403 if not
  4. Parse request body
  5. Validate against petCreateSchema (Zod)
     - If validation error: return 400 with field errors
  6. Transform field values (camelCase → snake_case, enums: texto → ENUM)
  7. Build database record:
     - Add owner_id from JWT
     - Add status: 'AVAILABLE'
     - Add created_at, updated_at: current timestamp
  8. Insert into pets table
  9. Return 201 with created record
```

### Field Validation Rules (Detailed)

| Field | Frontend Rules | Backend Rules |
|---|---|---|
| nomePet | Required, max 50 | min 1, max 100 |
| especie | Required, enum | Required, DOG\|CAT |
| raca | Required, max 50 | min 1, max 50 |
| idade | Required, 0-50 | Valid string |
| genero | Required, enum | Required, MALE\|FEMALE |
| tamanho | Required, enum | Required, SMALL\|MEDIUM\|LARGE |
| corAparencia | Required, max 500 | min 1, required |
| vacinado | Default: nao | Default: false boolean |
| castrado | Default: nao | Default: false boolean |
| temperamento | Required, enum | Array element |
| descricaoGeral | Required, 10-500 | 10-500 chars |

---

## Error Handling

### Frontend Error Scenarios

1. **Validation Error:**
   - Display inline error below field in red
   - Error clears when field is corrected

2. **Submission Error (400):**
   - Display error summary at top of form
   - Map backend field errors to form fields
   - Highlight error fields

3. **Authentication Error (401):**
   - Display "Sua sessão expirou. Por favor, faça login novamente"
   - Redirect to login page after 3 seconds

4. **Authorization Error (403):**
   - Display "Você não tem permissão para realizar esta ação"

5. **Network Error:**
   - Display "Erro de conexão. Por favor, verifique sua conexão com a internet e tente novamente"
   - Offer retry button

### Backend Error Responses

```typescript
// Validation error example
{
  status: 400,
  body: {
    error: {
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      details: [
        { field: "name", message: "Name is required" },
        { field: "age", message: "Age must be between 0 and 50" }
      ]
    }
  }
}

// Authentication error
{
  status: 401,
  body: {
    error: {
      message: "Authentication required",
      code: "NOT_AUTHENTICATED"
    }
  }
}

// Authorization error
{
  status: 403,
  body: {
    error: {
      message: "Not authorized to perform this action",
      code: "INSUFFICIENT_PERMISSIONS"
    }
  }
}
```

---

## Testing Strategy

### Frontend Testing

**Unit Tests:**
- TextInput component validation
- SelectInput option rendering
- FileUploadInput file validation
- Form state reducer
- Field mapping functions
- Error message display

**Example Test:**
```typescript
describe('TextInput component', () => {
  test('displays error when field is required and empty', () => {
    render(<TextInput name="nomePet" required />);
    const input = screen.getByDisplayValue('');
    fireEvent.blur(input);
    expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
  });
});
```

**Integration Tests:**
- Full form submission flow
- Section navigation
- Form state persistence
- API call with Bearer token
- Error mapping from backend to form
- Success redirect

**Example Test:**
```typescript
describe('PetRegistrationForm', () => {
  test('submits form with valid data', async () => {
    mockAuthToken('valid-jwt-token');
    mockApiResponse(201, { data: { id: '123', name: 'Rex' } });
    
    render(<PetRegistrationForm />);
    
    // Fill all required fields
    await fillFormData(validPetData);
    
    // Submit
    fireEvent.click(screen.getByText('Cadastrar Pet'));
    
    // Assert API called with correct payload
    expect(mockPost).toHaveBeenCalledWith(
      '/api/pets',
      expect.objectContaining({ name: 'Rex' }),
      expect.objectContaining({ 
        headers: { Authorization: 'Bearer valid-jwt-token' }
      })
    );
  });
});
```

### Backend Testing

**Unit Tests:**
- Zod schema validation (valid/invalid inputs)
- Field transformation (frontend → backend)
- Default value assignment

**Example Test:**
```typescript
describe('petCreateSchema', () => {
  test('accepts valid pet data', () => {
    const valid = {
      name: 'Rex',
      species: 'DOG',
      breed: 'Labrador',
      age: '5',
      gender: 'MALE',
      size: 'LARGE',
      color: 'Brown',
      description: 'Friendly and energetic dog',
      isVaccinated: true,
      isNeutered: false,
      personality: ['playful', 'loyal']
    };
    expect(() => petCreateSchema.parse(valid)).not.toThrow();
  });

  test('rejects invalid species', () => {
    const invalid = { ...validData, species: 'BIRD' };
    expect(() => petCreateSchema.parse(invalid)).toThrow();
  });
});
```

**Integration Tests:**
- POST /api/pets with valid data → 201
- POST /api/pets with missing auth → 401
- POST /api/pets with wrong user type → 403
- POST /api/pets with validation error → 400
- Database record creation and retrieval

---

## Responsive Design Considerations

### Mobile Layout (< 768px)

- **Form Sections:** One section per screen to reduce cognitive load
- **Navigation:** Previous/Next buttons to move between sections
- **Input Size:** Minimum 44px height for touch targets
- **Keyboard:** Form adjusts when keyboard appears; submit button visible
- **File Upload:** Mobile-friendly file picker
- **Progress:** Visual progress indicator showing current section

### Tablet Layout (768px - 1024px)

- **Form Sections:** Two sections per screen or all sections
- **Column Layout:** Two-column grid for fields where appropriate
- **Input Size:** Standard input sizes with adequate spacing
- **Navigation:** Sticky header with section links

### Desktop Layout (> 1024px)

- **Form Sections:** All sections visible with accordion or tabbed interface
- **Column Layout:** Two-column grid for all field rows
- **Navigation:** Sticky sidebar with section navigation
- **Input Size:** Full-width inputs with maximum width constraint

### CSS Breakpoints

```scss
// Mobile-first approach
$mobile: 480px;
$tablet: 768px;
$desktop: 1024px;
$wide: 1440px;

// Example responsive class
.form-section {
  @media (min-width: $tablet) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
}
```

---

## API Integration Details

### Authentication

- **Token Storage:** Stored in browser context/state from login flow
- **Token Inclusion:** Added to request headers in APIClient interceptor
- **Token Refresh:** Not required (24h expiry acceptable for registration flow)
- **Failure Handling:** 401 error redirects to login page

### Request/Response Interceptors

```typescript
// APIClient instance
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000
});

// Request interceptor adds Bearer token
apiClient.interceptors.request.use(config => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor handles 401
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);
```

### Error Mapping

Backend error responses are mapped to frontend field errors:

```typescript
function mapBackendErrors(backendErrors: BackendError[]): FormErrors {
  const formErrors: FormErrors = {};
  
  backendErrors.details?.forEach(error => {
    formErrors[error.field] = error.message;
  });
  
  return formErrors;
}
```

---

## Phase 1 vs Phase 2 Feature Breakdown

### Phase 1 (Current MVP)

**Implemented:**
- All 21 form fields with frontend UI
- Frontend validation with real-time error feedback
- Multi-section navigation
- Form state management
- Backend API integration with authentication
- Core fields transmitted to backend: name, species, breed, age, gender, size, color, description, isVaccinated, isNeutered, healthStatus, personality
- Success/error handling and messaging

**Not Implemented:**
- Photo file upload to Cloudinary
- Contact information storage (nomeContatoTutor, telefoneTutor, emailTutor)
- Behavior fields storage (criancas, outrosAnimais)
- Reason for adoption storage (motivoAdocao)
- City acceptance field storage (aceitaCidade)

### Phase 2 (Future Enhancement)

**To Implement:**
- Photo upload integration with Cloudinary CDN
- Contact information linked to user profile
- Behavior field storage in database
- Reason for adoption tracking
- City acceptance preference persistence
- Photo gallery on pet detail page
- Contact information display on adoption inquiry

---

## Security Considerations

1. **Authentication:**
   - All requests require valid Bearer JWT token
   - Token extracted from Authorization header
   - User type verified (INDIVIDUAL_OWNER or SHELTER_ADMIN)

2. **Input Validation:**
   - Frontend validation for UX (can be bypassed)
   - Backend validation is authoritative (Zod schema)
   - All inputs sanitized before storage

3. **Data Integrity:**
   - owner_id set from JWT token (cannot be spoofed by user)
   - status always set to 'AVAILABLE' for new pets
   - Timestamps (created_at, updated_at) set server-side

4. **Error Information:**
   - Validation errors include field names (safe to expose)
   - System errors do not expose implementation details
   - 403 error indicates insufficient permissions without details

---

## Accessibility Features

1. **Labels:** All inputs have associated labels with for/id attributes
2. **Required Fields:** Marked with visual indicator and aria-required="true"
3. **Error Messages:** Associated with form fields using aria-describedby
4. **Color Contrast:** Text on background meets WCAG AA standards (4.5:1)
5. **Keyboard Navigation:** Full form navigable with Tab key
6. **Screen Readers:** Form announced with descriptive labels and error messages
7. **Touch Targets:** All inputs and buttons at least 44x44px on mobile

---

## Performance Considerations

1. **Form State:** Managed in React component to avoid unnecessary re-renders
2. **Validation:** Debounced on onChange (optional), immediate on blur
3. **File Previews:** Generated asynchronously to avoid UI blocking
4. **API Calls:** Single POST request (no file upload in Phase 1)
5. **Code Splitting:** Form component lazy-loaded if part of larger page
6. **Bundle Size:** Zod schema shared with backend to reduce duplication

---

## Component Implementation Notes

- Form state uses React Context API for prop drilling reduction
- Controlled inputs for all form fields
- CSS Modules for component styling to avoid global namespace conflicts
- Error message text stored in constants for i18n support
- File preview generation uses URL.createObjectURL for performance
- Phone and email regex patterns tested for Brazilian formats

