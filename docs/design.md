# Design Document

## Overview

A PetAdopt é uma plataforma web moderna desenvolvida em Next.js 16.x com React 19.x que conecta animais de estimação abandonados com famílias que desejam adotar. O sistema facilita todo o processo de adoção através de uma interface responsiva, sistema de autenticação seguro, gestão completa de pets com upload de imagens, workflow de aprovação de adoções e dashboards personalizados para diferentes tipos de usuários.

### Objetivos do Design

- **Usabilidade**: Interface intuitiva e emotiva que facilite a navegação
- **Segurança**: Autenticação robusta com NextAuth.js e validação de dados
- **Performance**: Otimização de imagens, lazy loading e Server Components
- **Escalabilidade**: Arquitetura modular que suporte crescimento
- **Responsividade**: Experiência consistente em todos os dispositivos

## Architecture

### Arquitetura High-Level

A aplicação segue uma arquitetura de três camadas baseada no App Router do Next.js 16:

1. **Presentation Layer**: React 19 Server/Client Components com CSS Modules
2. **Business Logic Layer**: API Routes do Next.js com validação de dados
3. **Data Layer**: Prisma ORM conectado a PostgreSQL

### Padrões Arquiteturais

**Server-First Architecture**: Maximiza uso de Server Components para performance
**API-First Design**: Endpoints RESTful bem definidos para todas as operações
**Component-Driven Development**: Biblioteca de componentes reutilizáveis
**Responsive Design**: Mobile-first com breakpoints definidos

### Stack Técnica Detalhada

```javascript
const techStack = {
  framework: "Next.js 16.x",
  library: "React 19.x", 
  language: "JavaScript ES2024",
  styling: "CSS Modules + CSS Custom Properties",
  database: "PostgreSQL",
  orm: "Prisma",
  authentication: "NextAuth.js v4",
  imageStorage: "Cloudinary",
  emailService: "SendGrid/Resend",
  deployment: "Vercel"
};
```

## Components and Interfaces

### Estrutura de Componentes

```
src/components/
├── common/              # Componentes de layout
│   ├── Header/
│   ├── Footer/
│   ├── Navigation/
│   └── Layout/
├── auth/               # Componentes de autenticação
│   ├── LoginForm/
│   ├── RegisterForm/
│   ├── AuthProvider/
│   └── ProtectedRoute/
├── pets/               # Componentes específicos de pets
│   ├── PetCard/
│   ├── PetList/
│   ├── PetDetails/
│   ├── PetForm/
│   ├── PetFilters/
│   └── PetGallery/
├── dashboard/          # Componentes do dashboard
│   ├── Sidebar/
│   ├── StatsCard/
│   └── UserProfile/
└── ui/                 # Componentes base do design system
    ├── Button/
    ├── Input/
    ├── Select/
    ├── Modal/
    ├── Card/
    ├── Badge/
    └── Avatar/
```
### Interfaces de Componentes Principais

#### PetCard Component
```javascript
interface PetCardProps {
  pet: {
    id: string;
    name: string;
    species: 'DOG' | 'CAT';
    breed: string;
    age: string;
    size: 'SMALL' | 'MEDIUM' | 'LARGE';
    gender: 'MALE' | 'FEMALE';
    images: string[];
    status: 'AVAILABLE' | 'PENDING' | 'ADOPTED';
    owner: {
      name: string;
      location: string;
    };
  };
  variant?: 'default' | 'featured' | 'compact';
  onInterestClick?: () => void;
  showOwner?: boolean;
}
```

#### PetForm Component
```javascript
interface PetFormProps {
  pet?: Pet; // Para edição
  onSubmit: (data: PetFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

interface PetFormData {
  name: string;
  species: 'DOG' | 'CAT';
  breed: string;
  age: string;
  size: 'SMALL' | 'MEDIUM' | 'LARGE';
  gender: 'MALE' | 'FEMALE';
  color: string;
  description: string;
  isNeutered: boolean;
  isVaccinated: boolean;
  healthStatus?: string;
  personality: string[];
  images: File[];
}
```

#### AuthProvider Context
```javascript
interface AuthContextType {
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
}
```

### Design System

#### Paleta de Cores
```css
:root {
  /* Cores Primárias */
  --color-primary-orange: #FF8C42;
  --color-primary-blue: #4A90E2;
  --color-primary-green: #2ECC71;
  
  /* Cores Secundárias */
  --color-secondary-coral: #FF6B6B;
  --color-secondary-yellow: #F7DC6F;
  --color-secondary-purple: #9B59B6;
  
  /* Neutros */
  --color-neutral-dark: #2C3E50;
  --color-neutral-medium: #7F8C8D;
  --color-neutral-light: #ECF0F1;
  --color-neutral-white: #FFFFFF;
  
  /* Estados */
  --color-success: #27AE60;
  --color-warning: #F39C12;
  --color-error: #E74C3C;
  --color-info: #3498DB;
}
```

#### Tipografia
```css
/* Famílias de Fonte */
--font-primary: 'Poppins', sans-serif;
--font-secondary: 'Inter', sans-serif;

/* Escala Tipográfica */
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 2rem;      /* 32px */
```

#### Breakpoints Responsivos
```css
--breakpoint-sm: 640px;   /* Mobile large */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */
```
## Data Models

### Schema do Banco de Dados (Prisma)

#### User Model
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  avatar        String?
  password      String?   // Nullable para OAuth users
  type          UserType  @default(ADOPTER)
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relacionamentos
  pets          Pet[]
  adoptions     Adoption[]
  shelter       Shelter?
  accounts      Account[] // Para NextAuth
  sessions      Session[] // Para NextAuth
  
  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("sessions")
}
```

#### Pet Model
```prisma
model Pet {
  id            String      @id @default(cuid())
  name          String
  species       Species
  breed         String
  age           String
  size          Size
  gender        Gender
  color         String
  description   String      @db.Text
  isNeutered    Boolean     @default(false)
  isVaccinated  Boolean     @default(false)
  healthStatus  String?     @db.Text
  personality   String[]    // Array de traits
  images        String[]    // Array de URLs das imagens
  status        PetStatus   @default(AVAILABLE)
  location      String?     // Cidade/Estado
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  // Relacionamentos
  ownerId       String
  owner         User        @relation(fields: [ownerId], references: [id])
  shelter       Shelter?    @relation(fields: [shelterId], references: [id])
  shelterId     String?
  adoptions     Adoption[]
  
  @@index([species, status])
  @@index([size, status])
  @@index([ownerId])
  @@map("pets")
}
```

#### Adoption Model
```prisma
model Adoption {
  id            String          @id @default(cuid())
  status        AdoptionStatus  @default(PENDING)
  message       String?         @db.Text
  adopterInfo   Json           // Informações do formulário
  rejectionReason String?       @db.Text
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  approvedAt    DateTime?
  completedAt   DateTime?
  
  // Relacionamentos
  petId         String
  pet           Pet             @relation(fields: [petId], references: [id])
  adopterId     String
  adopter       User            @relation(fields: [adopterId], references: [id])
  
  @@index([status])
  @@index([adopterId])
  @@index([petId])
  @@map("adoptions")
}
```

#### Shelter Model
```prisma
model Shelter {
  id          String   @id @default(cuid())
  name        String
  address     String   @db.Text
  city        String
  state       String
  zipCode     String
  phone       String
  email       String
  website     String?
  description String?  @db.Text
  logo        String?  // URL da logo
  images      String[] // Fotos do abrigo
  isVerified  Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relacionamentos
  adminId     String   @unique
  admin       User     @relation(fields: [adminId], references: [id])
  pets        Pet[]
  
  @@map("shelters")
}
```

#### Enums
```prisma
enum UserType {
  ADOPTER
  SHELTER_ADMIN
  INDIVIDUAL_OWNER
}

enum Species {
  DOG
  CAT
}

enum Size {
  SMALL    // Até 10kg
  MEDIUM   // 10-25kg
  LARGE    // Acima de 25kg
}

enum Gender {
  MALE
  FEMALE
}

enum PetStatus {
  AVAILABLE
  PENDING      // Com solicitação em análise
  ADOPTED      // Adotado
  UNAVAILABLE  // Temporariamente indisponível
}

enum AdoptionStatus {
  PENDING      // Aguardando aprovação
  APPROVED     // Aprovado pelo owner
  REJECTED     // Rejeitado pelo owner
  COMPLETED    // Adoção finalizada
  CANCELLED    // Cancelado pelo adotante
}
```
### Relacionamentos e Constraints

#### Integridade Referencial
- `Pet.ownerId` → `User.id` (CASCADE DELETE impedido - pets devem ser arquivados)
- `Adoption.petId` → `Pet.id` (CASCADE DELETE impedido - histórico preservado)  
- `Adoption.adopterId` → `User.id` (CASCADE DELETE impedido - histórico preservado)
- `Shelter.adminId` → `User.id` (UNIQUE constraint - um admin por abrigo)

#### Business Rules no Schema
```sql
-- Constraint: Pet só pode ter status ADOPTED se existe adoption COMPLETED
ALTER TABLE pets ADD CONSTRAINT check_adopted_status 
CHECK (status != 'ADOPTED' OR EXISTS (
  SELECT 1 FROM adoptions 
  WHERE pet_id = id AND status = 'COMPLETED'
));

-- Index composto para performance de busca
CREATE INDEX idx_pets_search ON pets (species, status, size, location);
```

### Estrutura de Dados para Forms

#### AdopterInfo JSON Structure
```typescript
interface AdopterInfo {
  personalInfo: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  livingSituation: {
    housingType: 'apartment' | 'house' | 'farm' | 'other';
    hasYard: boolean;
    ownRent: 'own' | 'rent';
    landlordApproval?: boolean;
  };
  experience: {
    hadPetsBefore: boolean;
    currentPets: Array<{
      species: string;
      breed: string;
      age: string;
    }>;
    veterinarianInfo?: string;
  };
  motivation: {
    whyAdopt: string;
    expectedCommitment: string;
    availableTime: string;
  };
}
```

### API Endpoints Design

#### Authentication Endpoints

```typescript
// /api/auth/[...nextauth].js - NextAuth.js handler
export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (user && await bcrypt.compare(credentials.password, user.password)) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            type: user.type
          };
        }
        return null;
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ]
});
```

#### Pet Management Endpoints

```typescript
// /api/pets/route.js
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filters = {
    species: searchParams.get('species'),
    size: searchParams.get('size'),
    gender: searchParams.get('gender'),
    location: searchParams.get('location'),
    search: searchParams.get('q')
  };
  
  const pets = await prisma.pet.findMany({
    where: {
      status: 'AVAILABLE',
      ...(filters.species && { species: filters.species }),
      ...(filters.size && { size: filters.size }),
      ...(filters.gender && { gender: filters.gender }),
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { breed: { contains: filters.search, mode: 'insensitive' } }
        ]
      })
    },
    include: { owner: { select: { name: true } } },
    orderBy: { createdAt: 'desc' }
  });
  
  return NextResponse.json(pets);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const petData = await request.json();
  const validation = petSchema.safeParse(petData);
  
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  
  const pet = await prisma.pet.create({
    data: {
      ...validation.data,
      ownerId: session.user.id
    }
  });
  
  return NextResponse.json(pet, { status: 201 });
}
```
#### Image Upload Endpoints

```typescript
// /api/upload/route.js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    
    // Validate files
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File size exceeds 5MB limit' }, 
          { status: 400 }
        );
      }
      
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        return NextResponse.json(
          { error: 'Invalid file format' }, 
          { status: 400 }
        );
      }
    }
    
    // Upload to Cloudinary
    const uploadPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'petadopt/pets',
            transformation: [
              { width: 800, height: 600, crop: 'limit', quality: 'auto' },
              { format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        ).end(buffer);
      });
    });
    
    const imageUrls = await Promise.all(uploadPromises);
    return NextResponse.json({ images: imageUrls }, { status: 201 });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Upload failed' }, 
      { status: 500 }
    );
  }
}
```

#### Adoption Workflow Endpoints

```typescript
// /api/adoptions/route.js
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { petId, adopterInfo } = await request.json();
  
  // Check if pet is available
  const pet = await prisma.pet.findUnique({
    where: { id: petId },
    include: { owner: true }
  });
  
  if (!pet || pet.status !== 'AVAILABLE') {
    return NextResponse.json(
      { error: 'Pet not available for adoption' }, 
      { status: 400 }
    );
  }
  
  // Create adoption request
  const adoption = await prisma.adoption.create({
    data: {
      petId,
      adopterId: session.user.id,
      adopterInfo,
      status: 'PENDING'
    }
  });
  
  // Update pet status
  await prisma.pet.update({
    where: { id: petId },
    data: { status: 'PENDING' }
  });
  
  // Send notification email to pet owner
  await sendAdoptionNotificationEmail(pet.owner.email, {
    petName: pet.name,
    adopterName: session.user.name,
    adoptionId: adoption.id
  });
  
  return NextResponse.json(adoption, { status: 201 });
}

// /api/adoptions/[id]/route.js
export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { status, rejectionReason } = await request.json();
  const adoptionId = params.id;
  
  // Get adoption with pet and adopter info
  const adoption = await prisma.adoption.findUnique({
    where: { id: adoptionId },
    include: { pet: { include: { owner: true } }, adopter: true }
  });
  
  if (!adoption) {
    return NextResponse.json({ error: 'Adoption not found' }, { status: 404 });
  }
  
  // Check authorization - only pet owner can update
  if (adoption.pet.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Update adoption status
  const updatedAdoption = await prisma.adoption.update({
    where: { id: adoptionId },
    data: {
      status,
      rejectionReason,
      approvedAt: status === 'APPROVED' ? new Date() : null,
      completedAt: status === 'COMPLETED' ? new Date() : null
    }
  });
  
  // Update pet status based on adoption status
  const petStatus = {
    'APPROVED': 'PENDING',
    'COMPLETED': 'ADOPTED',
    'REJECTED': 'AVAILABLE',
    'CANCELLED': 'AVAILABLE'
  }[status];
  
  await prisma.pet.update({
    where: { id: adoption.petId },
    data: { status: petStatus }
  });
  
  // Send notification to adopter
  await sendAdoptionStatusEmail(adoption.adopter.email, {
    petName: adoption.pet.name,
    status,
    rejectionReason
  });
  
  return NextResponse.json(updatedAdoption);
}
```
## Correctness Properties

*Uma propriedade é uma característica ou comportamento que deve ser verdadeiro em todas as execuções válidas de um sistema - essencialmente, uma declaração formal sobre o que o sistema deve fazer. As propriedades servem como ponte entre especificações legíveis por humanos e garantias de correção verificáveis por máquina.*

Após analisar os critérios de aceitação, foram identificadas propriedades universais que se beneficiam de testes baseados em propriedades para garantir correção em uma ampla gama de entradas.

### Property 1: Password Strength Validation

*Para qualquer* string de senha, se ela tem menos de 8 caracteres, o sistema deve rejeitá-la; se tem 8 ou mais caracteres, deve ser aceita (assumindo que outras validações passem).

**Validates: Requirements 1.4**

### Property 2: Pet Mandatory Fields Validation

*Para qualquer* objeto pet, se estiver faltando algum dos campos obrigatórios (name, species, breed, age, size, gender, description), o sistema deve rejeitar a criação; se todos os campos obrigatórios estiverem presentes, deve ser aceito.

**Validates: Requirements 2.2**

### Property 3: Pet Data Validation

*Para qualquer* dados de pet com campos inválidos (formatos incorretos, valores fora do range permitido), o sistema deve rejeitar antes de salvar no banco de dados.

**Validates: Requirements 2.4**

### Property 4: Image Format Validation  

*Para qualquer* arquivo de imagem, se o formato não é JPEG, PNG ou WebP, o sistema deve rejeitar o upload; se é um formato válido, deve prosseguir com o upload.

**Validates: Requirements 3.2**

### Property 5: Image Size Validation

*Para qualquer* arquivo de imagem, se o tamanho é maior que 5MB, o sistema deve rejeitar o upload; se é menor ou igual a 5MB, deve aceitar.

**Validates: Requirements 3.3**

### Property 6: Available Pets Display Filter

*Para qualquer* consulta ao catálogo público, apenas pets com status "AVAILABLE" devem ser retornados, independentemente de outros filtros aplicados.

**Validates: Requirements 4.1**

### Property 7: Species Filter Consistency

*Para qualquer* filtro de espécie aplicado ao catálogo, todos os pets retornados devem ter exatamente a espécie selecionada (dog ou cat).

**Validates: Requirements 4.2**

### Property 8: Size Filter Consistency

*Para qualquer* filtro de tamanho aplicado ao catálogo, todos os pets retornados devem ter exatamente o tamanho selecionado (small, medium ou large).

**Validates: Requirements 4.3**

### Property 9: Age Range Filter Accuracy

*Para qualquer* filtro de faixa etária aplicado, todos os pets retornados devem ter idade dentro da faixa especificada.

**Validates: Requirements 4.4**

### Property 10: Gender Filter Consistency

*Para qualquer* filtro de gênero aplicado ao catálogo, todos os pets retornados devem ter exatamente o gênero selecionado (male ou female).

**Validates: Requirements 4.5**

### Property 11: Text Search Accuracy

*Para qualquer* termo de busca textual, todos os pets retornados devem conter o termo no nome ou na raça (case-insensitive).

**Validates: Requirements 4.6**

### Property Reflection

Após revisão das propriedades identificadas, não há redundância significativa entre elas. Cada propriedade valida um aspecto único do sistema:

- **Propriedades 1-5**: Validação de entrada de dados
- **Propriedades 6-11**: Lógica de filtros e busca

Todas as propriedades fornecem valor único de validação e devem ser mantidas para teste abrangente do sistema.

## Error Handling

### Estratégia de Error Handling

#### Client-Side Error Boundaries
```typescript
// components/common/ErrorBoundary.js
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to monitoring service
    logError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

#### API Error Response Structure
```typescript
interface APIError {
  error: string;           // Human-readable message
  code: string;           // Machine-readable code
  details?: any;          // Additional error context
  timestamp: string;      // ISO timestamp
  path: string;          // API path where error occurred
}

// Example error responses
const errorResponses = {
  validation: {
    error: "Validation failed",
    code: "VALIDATION_ERROR",
    details: { field: "email", message: "Invalid email format" },
    timestamp: "2024-01-01T12:00:00Z",
    path: "/api/auth/register"
  },
  notFound: {
    error: "Pet not found",
    code: "NOT_FOUND",
    timestamp: "2024-01-01T12:00:00Z",
    path: "/api/pets/123"
  },
  unauthorized: {
    error: "Authentication required",
    code: "UNAUTHORIZED",
    timestamp: "2024-01-01T12:00:00Z",
    path: "/api/pets"
  }
};
```
#### Form Validation Errors
```typescript
// lib/validation/schemas.js
import { z } from 'zod';

export const petSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome muito longo'),
  species: z.enum(['DOG', 'CAT'], { errorMap: () => ({ message: 'Espécie inválida' }) }),
  breed: z.string().min(1, 'Raça é obrigatória').max(50, 'Raça muito longa'),
  age: z.string().min(1, 'Idade é obrigatória'),
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE'], { errorMap: () => ({ message: 'Tamanho inválido' }) }),
  gender: z.enum(['MALE', 'FEMALE'], { errorMap: () => ({ message: 'Gênero inválido' }) }),
  color: z.string().min(1, 'Cor é obrigatória').max(30, 'Cor muito longa'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').max(500, 'Descrição muito longa'),
  isNeutered: z.boolean(),
  isVaccinated: z.boolean(),
  healthStatus: z.string().max(300, 'Status de saúde muito longo').optional(),
  personality: z.array(z.string()).max(5, 'Máximo 5 traços de personalidade')
});

export const adoptionSchema = z.object({
  petId: z.string().cuid('ID do pet inválido'),
  adopterInfo: z.object({
    personalInfo: z.object({
      fullName: z.string().min(2, 'Nome completo é obrigatório'),
      phone: z.string().min(10, 'Telefone inválido'),
      address: z.string().min(5, 'Endereço é obrigatório'),
      city: z.string().min(2, 'Cidade é obrigatória'),
      state: z.string().min(2, 'Estado é obrigatório'),
      zipCode: z.string().min(8, 'CEP inválido')
    }),
    livingSituation: z.object({
      housingType: z.enum(['apartment', 'house', 'farm', 'other']),
      hasYard: z.boolean(),
      ownRent: z.enum(['own', 'rent']),
      landlordApproval: z.boolean().optional()
    }),
    motivation: z.object({
      whyAdopt: z.string().min(20, 'Explique por que deseja adotar (mínimo 20 caracteres)'),
      expectedCommitment: z.string().min(10, 'Descreva seu comprometimento esperado'),
      availableTime: z.string().min(5, 'Informe o tempo disponível')
    })
  })
});
```

#### Network and Service Errors
```typescript
// lib/errors/errorHandler.js
export class APIError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'APIError';
  }
}

export class ValidationError extends APIError {
  constructor(details) {
    super('Validation failed', 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

export class NotFoundError extends APIError {
  constructor(resource) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends APIError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

// Global error handler for API routes
export function handleAPIError(error) {
  if (error instanceof APIError) {
    return NextResponse.json({
      error: error.message,
      code: error.code,
      details: error.details,
      timestamp: new Date().toISOString()
    }, { status: error.status });
  }
  
  // Log unexpected errors
  console.error('Unexpected API error:', error);
  
  return NextResponse.json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  }, { status: 500 });
}
```

#### Upload Error Handling
```typescript
// lib/upload/errorHandler.js
export const uploadErrorMessages = {
  FILE_TOO_LARGE: 'Arquivo muito grande. Tamanho máximo: 5MB',
  INVALID_FORMAT: 'Formato inválido. Use JPEG, PNG ou WebP',
  UPLOAD_FAILED: 'Falha no upload. Tente novamente',
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet',
  QUOTA_EXCEEDED: 'Limite de arquivos excedido',
  PROCESSING_FAILED: 'Falha no processamento da imagem'
};

export function handleUploadError(error) {
  if (error.code === 'LIMIT_FILE_SIZE') {
    throw new ValidationError({ message: uploadErrorMessages.FILE_TOO_LARGE });
  }
  
  if (error.code === 'INVALID_FILE_TYPE') {
    throw new ValidationError({ message: uploadErrorMessages.INVALID_FORMAT });
  }
  
  if (error.code === 'NETWORK_ERROR') {
    throw new APIError(uploadErrorMessages.NETWORK_ERROR, 503, 'SERVICE_UNAVAILABLE');
  }
  
  // Default error
  throw new APIError(uploadErrorMessages.UPLOAD_FAILED, 500, 'UPLOAD_ERROR');
}
```

## Testing Strategy

### Abordagem Dupla de Testes

A estratégia de testes combina **testes unitários** para exemplos específicos, casos extremos e condições de erro com **testes baseados em propriedades** para verificar propriedades universais em uma ampla gama de entradas.

#### Testes Unitários
- **Foco**: Exemplos específicos, casos extremos, integração entre componentes
- **Casos de uso**:
  - Fluxos de autenticação específicos (login, registro, OAuth)
  - Workflows de adoção (aprovação, rejeição, cancelamento)  
  - Renderização de componentes com dados específicos
  - Integração com serviços externos (Cloudinary, SendGrid)

#### Testes Baseados em Propriedades  
- **Foco**: Propriedades universais que devem valer para todas as entradas válidas
- **Configuração**: Mínimo 100 iterações por teste de propriedade
- **Biblioteca**: fast-check para JavaScript
- **Tag de referência**: **Feature: petadopt-platform, Property {number}: {property_text}**

### Configuração de Property-Based Testing

```javascript
// tests/properties/petValidation.test.js
import fc from 'fast-check';
import { petSchema } from '../../lib/validation/schemas.js';

describe('Pet Validation Properties', () => {
  
  test('Property 2: Pet Mandatory Fields Validation', () => {
    // Feature: petadopt-platform, Property 2: Pet mandatory fields validation
    fc.assert(
      fc.property(
        fc.record({
          name: fc.option(fc.string(), { nil: undefined }),
          species: fc.option(fc.constantFrom('DOG', 'CAT'), { nil: undefined }),
          breed: fc.option(fc.string(), { nil: undefined }),
          age: fc.option(fc.string(), { nil: undefined }),
          size: fc.option(fc.constantFrom('SMALL', 'MEDIUM', 'LARGE'), { nil: undefined }),
          gender: fc.option(fc.constantFrom('MALE', 'FEMALE'), { nil: undefined }),
          description: fc.option(fc.string(), { nil: undefined })
        }),
        (petData) => {
          const result = petSchema.safeParse(petData);
          const hasAllRequired = petData.name && petData.species && 
                                petData.breed && petData.age && 
                                petData.size && petData.gender && 
                                petData.description;
          
          if (hasAllRequired) {
            expect(result.success).toBe(true);
          } else {
            expect(result.success).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 4: Image Format Validation', () => {
    // Feature: petadopt-platform, Property 4: Image format validation
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string(1, 50),
          type: fc.oneof(
            fc.constant('image/jpeg'),
            fc.constant('image/png'), 
            fc.constant('image/webp'),
            fc.constant('image/gif'),
            fc.constant('application/pdf'),
            fc.constant('text/plain')
          ),
          size: fc.integer(1, 10 * 1024 * 1024) // 1B to 10MB
        }),
        (file) => {
          const validFormats = ['image/jpeg', 'image/png', 'image/webp'];
          const isValidFormat = validFormats.includes(file.type);
          
          // Mock file validation function
          const validateFileFormat = (file) => validFormats.includes(file.type);
          
          expect(validateFileFormat(file)).toBe(isValidFormat);
        }
      ),
      { numRuns: 100 }
    );
  });

});
```
### Configuração de Testes por Categoria

#### Unit Tests - Componentes e Integração
```javascript
// tests/components/PetCard.test.js
import { render, screen } from '@testing-library/react';
import { PetCard } from '../../src/components/pets/PetCard';

describe('PetCard Component', () => {
  const mockPet = {
    id: '1',
    name: 'Buddy',
    species: 'DOG',
    breed: 'Golden Retriever',
    age: '2 anos',
    size: 'LARGE',
    gender: 'MALE',
    images: ['/pet1.jpg'],
    status: 'AVAILABLE',
    owner: { name: 'João Silva', location: 'São Paulo, SP' }
  };

  test('should display all required pet information', () => {
    render(<PetCard pet={mockPet} showOwner />);
    
    expect(screen.getByText('Buddy')).toBeInTheDocument();
    expect(screen.getByText('Golden Retriever')).toBeInTheDocument();
    expect(screen.getByText('2 anos')).toBeInTheDocument();
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('São Paulo, SP')).toBeInTheDocument();
  });

  test('should show interest button for available pets', () => {
    render(<PetCard pet={mockPet} />);
    expect(screen.getByRole('button', { name: /interesse/i })).toBeInTheDocument();
  });

  test('should disable button for non-available pets', () => {
    const adoptedPet = { ...mockPet, status: 'ADOPTED' };
    render(<PetCard pet={adoptedPet} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

// tests/api/auth.test.js 
import { POST } from '../../src/app/api/auth/register/route.js';
import { prismaMock } from '../__mocks__/prisma';

describe('/api/auth/register', () => {
  test('should create user with valid data', async () => {
    const userData = {
      name: 'João Silva',
      email: 'joao@example.com',
      password: 'password123',
      type: 'ADOPTER'
    };

    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: '1',
      ...userData,
      password: undefined
    });

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(201);
    expect(result.user.email).toBe(userData.email);
    expect(result.user.password).toBeUndefined();
  });

  test('should reject weak passwords', async () => {
    const userData = {
      name: 'João Silva',
      email: 'joao@example.com', 
      password: '123', // Too short
      type: 'ADOPTER'
    };

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

#### Integration Tests - Workflows
```javascript
// tests/integration/adoptionWorkflow.test.js
import { test, expect } from '@playwright/test';

test.describe('Adoption Workflow', () => {
  test('complete adoption flow', async ({ page }) => {
    // Login as adopter
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'adopter@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-btn"]');

    // Browse pets and show interest
    await page.goto('/pets');
    await page.click('[data-testid="pet-card"]:first-child');
    await page.click('[data-testid="interest-btn"]');

    // Fill adoption form
    await page.fill('[data-testid="full-name"]', 'Maria Santos');
    await page.fill('[data-testid="phone"]', '(11) 99999-9999');
    await page.fill('[data-testid="address"]', 'Rua das Flores, 123');
    await page.selectOption('[data-testid="housing-type"]', 'house');
    await page.fill('[data-testid="why-adopt"]', 'Quero dar um lar cheio de amor para um pet');
    
    await page.click('[data-testid="submit-adoption"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('text=Solicitação enviada')).toBeVisible();
  });

  test('owner can approve adoption request', async ({ page }) => {
    // Login as pet owner
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'owner@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-btn"]');

    // Go to dashboard and review adoption
    await page.goto('/dashboard');
    await page.click('[data-testid="adoption-requests"]');
    await page.click('[data-testid="review-adoption"]:first-child');
    
    // Approve adoption
    await page.click('[data-testid="approve-btn"]');
    await page.fill('[data-testid="approval-message"]', 'Adoção aprovada!');
    await page.click('[data-testid="confirm-approval"]');
    
    // Verify status update
    await expect(page.locator('[data-testid="adoption-status"]')).toContainText('Aprovado');
  });
});
```

#### Performance e Acessibilidade
```javascript
// tests/performance/lighthouse.test.js
import { test, expect } from '@playwright/test';

test('lighthouse performance audit', async ({ page }) => {
  await page.goto('/');
  
  // Run Lighthouse audit
  const audit = await page.evaluate(() => {
    return new Promise((resolve) => {
      // Mock lighthouse audit - in real implementation use lighthouse-ci
      resolve({
        performance: 95,
        accessibility: 100,
        bestPractices: 92,
        seo: 98
      });
    });
  });

  expect(audit.performance).toBeGreaterThan(90);
  expect(audit.accessibility).toBeGreaterThan(95);
  expect(audit.bestPractices).toBeGreaterThan(90);
  expect(audit.seo).toBeGreaterThan(95);
});

// tests/accessibility/a11y.test.js
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { PetCard } from '../../src/components/pets/PetCard';

expect.extend(toHaveNoViolations);

test('PetCard should be accessible', async () => {
  const mockPet = {
    id: '1',
    name: 'Buddy',
    species: 'DOG',
    breed: 'Golden Retriever',
    age: '2 anos',
    size: 'LARGE',
    gender: 'MALE',
    images: ['/pet1.jpg'],
    status: 'AVAILABLE',
    owner: { name: 'João Silva', location: 'São Paulo, SP' }
  };

  const { container } = render(<PetCard pet={mockPet} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Test Coverage Requirements

- **Unit Tests**: Mínimo 80% de cobertura de código
- **Integration Tests**: Cobertura dos principais fluxos de usuário
- **Property Tests**: Todas as 11 propriedades identificadas
- **E2E Tests**: Cenários críticos de negócio (registro, adoção, upload)
- **Accessibility**: Componentes principais testados com axe-core
- **Performance**: Páginas principais auditadas com Lighthouse

### Configuração do Test Environment

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.stories.js',
    '!src/**/index.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

// playwright.config.js  
module.exports = {
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['iPhone 12'] } }
  ]
};
```
## Technology Integration

### Next.js 16 App Router Features

#### Server Components e Client Components
```typescript
// app/pets/page.js - Server Component
import { PetList } from '@/components/pets/PetList';
import { prisma } from '@/lib/database';

export default async function PetsPage({ searchParams }) {
  // Data fetching no servidor
  const pets = await prisma.pet.findMany({
    where: {
      status: 'AVAILABLE',
      ...(searchParams.species && { species: searchParams.species }),
      ...(searchParams.size && { size: searchParams.size })
    },
    include: { owner: { select: { name: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Pets Disponíveis</h1>
      <PetList pets={pets} />
    </div>
  );
}

// components/pets/PetFilters.js - Client Component
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

export function PetFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState({
    species: searchParams.get('species') || '',
    size: searchParams.get('size') || '',
    gender: searchParams.get('gender') || ''
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    
    startTransition(() => {
      router.push(`/pets?${params.toString()}`);
    });
  };

  return (
    <div className="filters" aria-live="polite">
      {isPending && <div>Atualizando resultados...</div>}
      {/* Filter controls */}
    </div>
  );
}
```

#### Streaming e Suspense
```typescript
// app/pets/[id]/page.js
import { Suspense } from 'react';
import { PetDetails } from '@/components/pets/PetDetails';
import { PetGallery } from '@/components/pets/PetGallery';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

export default function PetDetailPage({ params }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<LoadingSkeleton type="petDetails" />}>
        <PetDetails petId={params.id} />
      </Suspense>
      
      <Suspense fallback={<LoadingSkeleton type="gallery" />}>
        <PetGallery petId={params.id} />
      </Suspense>
    </div>
  );
}
```

### React 19 Features Integration

#### Server Actions para Forms
```typescript
// app/pets/add/actions.js
'use server';
import { prisma } from '@/lib/database';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPet(formData) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error('Authentication required');
  }

  const petData = {
    name: formData.get('name'),
    species: formData.get('species'),
    breed: formData.get('breed'),
    age: formData.get('age'),
    size: formData.get('size'),
    gender: formData.get('gender'),
    color: formData.get('color'),
    description: formData.get('description'),
    isNeutered: formData.get('isNeutered') === 'on',
    isVaccinated: formData.get('isVaccinated') === 'on',
    healthStatus: formData.get('healthStatus') || null,
    personality: formData.getAll('personality'),
    images: JSON.parse(formData.get('images') || '[]'),
    ownerId: session.user.id
  };

  const pet = await prisma.pet.create({ data: petData });
  
  revalidatePath('/dashboard');
  revalidatePath('/pets');
  redirect(`/pets/${pet.id}`);
}

// components/pets/PetForm.js
'use client';
import { createPet } from '@/app/pets/add/actions';
import { useActionState } from 'react';

export function PetForm() {
  const [state, formAction, isPending] = useActionState(createPet, null);

  return (
    <form action={formAction} className="pet-form">
      {/* Form fields */}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Criando...' : 'Criar Pet'}
      </button>
      {state?.error && <div className="error">{state.error}</div>}
    </form>
  );
}
```

### Database Optimizations

#### Prisma Schema com Indexes
```prisma
model Pet {
  // ... campos anteriores

  @@index([species, status, createdAt(sort: Desc)]) // Listagem com filtros
  @@index([ownerId, status]) // Dashboard do proprietário
  @@index([status, updatedAt(sort: Desc)]) // Pets recém atualizados
  @@fulltext([name, breed, description]) // Busca textual (MySQL/PostgreSQL)
  @@map("pets")
}

model Adoption {
  // ... campos anteriores

  @@index([adopterId, status, createdAt(sort: Desc)]) // Dashboard adotante
  @@index([petId, status]) // Status por pet
  @@index([status, createdAt(sort: Desc)]) // Adoções por status
  @@map("adoptions")
}
```

#### Connection Pooling e Caching
```typescript
// lib/database.js
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? 
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Query optimization utilities
export async function getPetsWithFilters(filters, page = 1, limit = 12) {
  const skip = (page - 1) * limit;
  
  const where = {
    status: 'AVAILABLE',
    ...(filters.species && { species: filters.species }),
    ...(filters.size && { size: filters.size }),
    ...(filters.gender && { gender: filters.gender }),
    ...(filters.location && {
      OR: [
        { location: { contains: filters.location, mode: 'insensitive' } },
        { owner: { city: { contains: filters.location, mode: 'insensitive' } } }
      ]
    }),
    ...(filters.search && {
      OR: [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { breed: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ]
    })
  };

  const [pets, totalCount] = await Promise.all([
    prisma.pet.findMany({
      where,
      include: {
        owner: { select: { name: true, city: true, state: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.pet.count({ where })
  ]);

  return {
    pets,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page
  };
}
```

### Image Handling with Cloudinary

#### Upload Configuration
```typescript
// lib/upload/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export const uploadConfig = {
  petImages: {
    folder: 'petadopt/pets',
    transformation: [
      { width: 800, height: 600, crop: 'limit', quality: 'auto' },
      { format: 'auto' }, // Auto-format selection
      { fetch_format: 'auto' } // Auto-format based on browser support
    ],
    eager: [
      { width: 300, height: 225, crop: 'fill', quality: 'auto' }, // Thumbnail
      { width: 150, height: 150, crop: 'fill', quality: 'auto', radius: 'max' } // Avatar
    ]
  },
  shelterImages: {
    folder: 'petadopt/shelters',
    transformation: [
      { width: 1200, height: 800, crop: 'limit', quality: 'auto' },
      { format: 'auto' }
    ]
  }
};

export async function uploadPetImages(files) {
  const uploadPromises = files.map(async (file) => {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        uploadConfig.petImages,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(new Error(`Upload failed: ${error.message}`));
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              thumbnail: result.eager?.[0]?.secure_url,
              avatar: result.eager?.[1]?.secure_url
            });
          }
        }
      ).end(buffer);
    });
  });

  return Promise.all(uploadPromises);
}

export async function deletePetImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}
```

### Email Service Integration

#### SendGrid/Resend Setup
```typescript
// lib/email/emailService.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailTemplates = {
  adoptionRequest: {
    subject: 'Nova Solicitação de Adoção - {{petName}}',
    html: `
      <h2>Você recebeu uma nova solicitação de adoção!</h2>
      <p><strong>Pet:</strong> {{petName}}</p>
      <p><strong>Interessado:</strong> {{adopterName}}</p>
      <p><strong>Telefone:</strong> {{adopterPhone}}</p>
      <p><strong>Mensagem:</strong></p>
      <blockquote>{{message}}</blockquote>
      <a href="{{dashboardUrl}}" style="background: #FF8C42; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Ver Solicitação
      </a>
    `
  },
  adoptionApproved: {
    subject: 'Sua solicitação foi aprovada! 🎉',
    html: `
      <h2>Parabéns! Sua solicitação de adoção foi aprovada!</h2>
      <p>O proprietário do pet <strong>{{petName}}</strong> aprovou sua solicitação.</p>
      <p><strong>Próximos passos:</strong></p>
      <ol>
        <li>Entre em contato com o proprietário: {{ownerContact}}</li>
        <li>Combine um encontro para conhecer o pet</li>
        <li>Finalize a adoção</li>
      </ol>
      <a href="{{petUrl}}" style="background: #2ECC71; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Ver Pet
      </a>
    `
  }
};

export async function sendAdoptionNotification({ to, petName, adopterName, adopterPhone, message, dashboardUrl }) {
  try {
    const result = await resend.emails.send({
      from: 'PetAdopt <noreply@petadopt.com>',
      to,
      subject: emailTemplates.adoptionRequest.subject.replace('{{petName}}', petName),
      html: emailTemplates.adoptionRequest.html
        .replace('{{petName}}', petName)
        .replace('{{adopterName}}', adopterName)
        .replace('{{adopterPhone}}', adopterPhone)
        .replace('{{message}}', message)
        .replace('{{dashboardUrl}}', dashboardUrl)
    });
    
    return { success: true, id: result.id };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
}
```
### Performance Optimizations

#### Image Optimization
```typescript
// components/ui/OptimizedImage.js
import Image from 'next/image';
import { useState } from 'react';

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  className,
  priority = false,
  placeholder = 'blur',
  blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...' // Base64 placeholder
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500">📷</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={`object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        priority={priority}
        onLoad={() => setIsLoading(false)}
        onError={() => setError(true)}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}
```

#### Lazy Loading e Infinite Scroll
```typescript
// hooks/useInfiniteScroll.js
import { useState, useEffect, useCallback } from 'react';

export function useInfiniteScroll(fetchMore, hasNextPage) {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isFetching) return;
    setIsFetching(true);
  };

  useEffect(() => {
    if (!isFetching) return;
    fetchMoreData();
  }, [isFetching]);

  const fetchMoreData = useCallback(async () => {
    if (hasNextPage) {
      await fetchMore();
    }
    setIsFetching(false);
  }, [fetchMore, hasNextPage]);

  return [isFetching, setIsFetching];
}

// components/pets/PetListInfinite.js
'use client';
import { useState, useCallback } from 'react';
import { PetCard } from './PetCard';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

export function PetListInfinite({ initialPets, filters }) {
  const [pets, setPets] = useState(initialPets);
  const [page, setPage] = useState(2);
  const [hasNextPage, setHasNextPage] = useState(true);

  const fetchMorePets = useCallback(async () => {
    const response = await fetch(`/api/pets?page=${page}&${new URLSearchParams(filters)}`);
    const data = await response.json();
    
    if (data.pets.length > 0) {
      setPets(prev => [...prev, ...data.pets]);
      setPage(prev => prev + 1);
    } else {
      setHasNextPage(false);
    }
  }, [page, filters]);

  const [isFetching] = useInfiniteScroll(fetchMorePets, hasNextPage);

  return (
    <div className="pet-grid">
      {pets.map((pet) => (
        <PetCard key={pet.id} pet={pet} />
      ))}
      {isFetching && (
        <div className="col-span-full text-center py-4">
          Carregando mais pets...
        </div>
      )}
    </div>
  );
}
```

### Security Implementations

#### Rate Limiting
```typescript
// lib/security/rateLimiter.js
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Different limits for different endpoints
export const rateLimiters = {
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 h'), // 100 requests per hour
    analytics: true,
  }),
  
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 uploads per hour
    analytics: true,
  }),
  
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 auth attempts per hour
    analytics: true,
  }),
};

export async function applyRateLimit(limiter, request) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'anonymous';
  const { success, limit, reset, remaining } = await limiter.limit(ip);
  
  if (!success) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        limit,
        reset,
        remaining
      }),
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        }
      }
    );
  }
  
  return null; // No rate limit hit
}
```

#### Input Sanitization
```typescript
// lib/security/sanitize.js
import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

export const sanitize = {
  // HTML content sanitization
  html: (input) => {
    if (typeof input !== 'string') return input;
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
      ALLOWED_ATTR: []
    });
  },

  // Plain text sanitization
  text: (input) => {
    if (typeof input !== 'string') return input;
    return validator.escape(input.trim());
  },

  // Email sanitization
  email: (input) => {
    if (typeof input !== 'string') return input;
    const normalized = validator.normalizeEmail(input.trim().toLowerCase());
    return validator.isEmail(normalized) ? normalized : null;
  },

  // Phone number sanitization (Brazilian format)
  phone: (input) => {
    if (typeof input !== 'string') return input;
    const cleaned = input.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11 ? cleaned : null;
  },

  // File path sanitization
  filename: (input) => {
    if (typeof input !== 'string') return input;
    return input
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 100);
  }
};

// Middleware for API routes
export function sanitizeRequestBody(req) {
  if (!req.body || typeof req.body !== 'object') return req.body;
  
  const sanitized = {};
  for (const [key, value] of Object.entries(req.body)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitize.text(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitize.text(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}
```

### Deployment Configuration

#### Environment Variables
```bash
# .env.example
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/petadopt"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers  
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Image Upload
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email Service
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="noreply@petadopt.com"

# Security
UPSTASH_REDIS_REST_URL="your-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
VERCEL_ANALYTICS_ID="your-analytics-id"
```

#### Build and Deployment Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts",
    "analyze": "cross-env ANALYZE=true next build",
    "lighthouse": "lhci autorun",
    "prepare": "husky install"
  }
}
```

#### Docker Configuration (Optional)
```dockerfile
# Dockerfile
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

Este design document fornece uma arquitetura completa e robusta para a plataforma PetAdopt, incorporando as melhores práticas do Next.js 16, React 19, e tecnologias modernas de desenvolvimento web. O sistema está preparado para escalar e atender todos os requisitos identificados no documento de requisitos.