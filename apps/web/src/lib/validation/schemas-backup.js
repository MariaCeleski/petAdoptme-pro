import { z } from 'zod';
import { 
  sanitizeInput, 
  sanitizePetData,
  sanitizeAdoptionData,
  sanitizeUserData,
  sanitizeShelterData
} from './sanitizers.js';

// Helper function to create sanitized string schema
const sanitizedString = (type = 'text') => z.string().transform(val => sanitizeInput(val, type));

// User Validation Schemas with sanitization
export const registerSchema = z.object({
  name: sanitizedString('text')
    .pipe(z.string()
      .min(2, 'Nome deve ter pelo menos 2 caracteres')
      .max(50, 'Nome muito longo')
      .refine(val => /^[a-zA-ZÀ-ÿ\s]+$/.test(val), 'Nome deve conter apenas letras e espaços')
    ),
  email: sanitizedString('email')
    .pipe(z.string()
      .email('Email inválido')
      .max(254, 'Email muito longo')
    ),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(128, 'Senha muito longa')
    .refine(val => /[A-Z]/.test(val), 'Senha deve conter pelo menos uma letra maiúscula')
    .refine(val => /[a-z]/.test(val), 'Senha deve conter pelo menos uma letra minúscula')
    .refine(val => /\d/.test(val), 'Senha deve conter pelo menos um número')
    .refine(val => /[!@#$%^&*(),.?":{}|<>]/.test(val), 'Senha deve conter pelo menos um caractere especial'),
  type: z.enum(['ADOPTER', 'SHELTER_ADMIN', 'INDIVIDUAL_OWNER']).default('ADOPTER'),
});

export const loginSchema = z.object({
  email: sanitizedString('email').pipe(z.string().email('Email inválido')),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// Enhanced Pet Validation Schema with comprehensive validation
// Implements Requirements 2.2 (mandatory fields) and 2.4 (data validation)
export const petSchema = z.object({
  // Mandatory fields (Requirement 2.2)
  name: sanitizedString('text')
    .pipe(z.string()
      .min(1, 'Nome é obrigatório')
      .max(50, 'Nome muito longo')
      .refine(val => val.trim().length > 0, 'Nome não pode ser apenas espaços')
      .refine(val => /^[a-zA-ZÀ-ÿ\s\-\.]+$/.test(val), 'Nome deve conter apenas letras, espaços, hífens e pontos')
    ),
    
  species: z.enum(['DOG', 'CAT'], { 
    errorMap: () => ({ message: 'Espécie inválida. Deve ser DOG ou CAT' }) 
  }),
  
  breed: sanitizedString('text')
    .pipe(z.string()
      .min(1, 'Raça é obrigatória')
      .max(50, 'Raça muito longa')
      .refine(val => val.trim().length > 0, 'Raça não pode ser apenas espaços')
      .refine(val => /^[a-zA-ZÀ-ÿ\s\-\.]+$/.test(val), 'Raça deve conter apenas letras, espaços, hífens e pontos')
    ),
    
  age: sanitizedString('text')
    .pipe(z.string()
      .min(1, 'Idade é obrigatória')
      .max(20, 'Descrição de idade muito longa')
      .refine(val => {
        // Accept patterns like "2 anos", "6 meses", "1-2 anos", "Filhote", etc.
        return /^(\d+(-\d+)?\s*(ano|anos|mês|meses|dia|dias)?|filhote|jovem|adulto|idoso)$/i.test(val.trim());
      }, 'Formato de idade inválido. Use: "2 anos", "6 meses", "Filhote", etc.')
    ),
    
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE'], { 
    errorMap: () => ({ message: 'Tamanho inválido. Deve ser SMALL, MEDIUM ou LARGE' }) 
  }),
  
  gender: z.enum(['MALE', 'FEMALE'], { 
    errorMap: () => ({ message: 'Gênero inválido. Deve ser MALE ou FEMALE' }) 
  }),
  
  description: sanitizedString('text')
    .pipe(z.string()
      .min(10, 'Descrição deve ter pelo menos 10 caracteres')
      .max(1000, 'Descrição muito longa')
      .refine(val => val.trim().length >= 10, 'Descrição deve ter conteúdo substancial')
    ),

  // Optional fields with validation (Requirement 2.4)
  color: sanitizedString('text')
    .pipe(z.string()
      .min(1, 'Cor é obrigatória')
      .max(30, 'Cor muito longa')
      .refine(val => /^[a-zA-ZÀ-ÿ\s\-]+$/.test(val), 'Cor deve conter apenas letras, espaços e hífens')
    ),
    
  isNeutered: z.boolean().default(false),
  isVaccinated: z.boolean().default(false),
  
  healthStatus: sanitizedString('text')
    .pipe(z.string().max(500, 'Status de saúde muito longo'))
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
    
  personality: z.array(
    sanitizedString('text')
      .pipe(z.string()
        .min(2, 'Traço de personalidade muito curto')
        .max(30, 'Traço de personalidade muito longo')
        .refine(val => /^[a-zA-ZÀ-ÿ\s\-]+$/.test(val), 'Traço deve conter apenas letras, espaços e hífens')
      )
  )
    .max(10, 'Máximo 10 traços de personalidade')
    .default([])
    .transform(arr => [...new Set(arr.filter(item => item && item.trim().length > 0))]), // Remove duplicates and empty strings
    
  location: sanitizedString('text')
    .pipe(z.string().max(100, 'Localização muito longa'))
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
    
  // Images validation
  images: z.array(
    sanitizedString('url')
      .pipe(z.string()
        .url('URL de imagem inválida')
        .refine(url => {
          try {
            const parsed = new URL(url);
            return ['http:', 'https:'].includes(parsed.protocol);
          } catch {
            return false;
          }
        }, 'URL deve usar protocolo HTTP ou HTTPS')
      )
  )
    .max(10, 'Máximo 10 imagens por pet')
    .default([])
    .optional(),
    
}).refine(
  (data) => {
    // Cross-field validation - check for required fields
    const requiredFields = ['name', 'species', 'breed', 'age', 'size', 'gender', 'description', 'color'];
    const missingFields = requiredFields.filter(field => !data[field] || data[field].toString().trim().length === 0);
    return missingFields.length === 0;
  },
  {
    message: 'Todos os campos obrigatórios devem ser preenchidos: nome, espécie, raça, idade, tamanho, gênero, descrição e cor',
    path: ['_root']
  }
);

// Enhanced Adoption Validation Schema with comprehensive form validation
// Implements comprehensive adoption form validation per requirements
export const adoptionSchema = z.object({
  petId: z.string()
    .cuid('ID do pet inválido')
    .min(1, 'ID do pet é obrigatório'),
    
  message: sanitizedStringSchemas.text
    .max(1000, 'Mensagem muito longa')
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
    
  adopterInfo: z.object({
    personalInfo: z.object({
      fullName: sanitizedStringSchemas.text
        .min(2, 'Nome completo é obrigatório')
        .max(100, 'Nome muito longo')
        .refine(val => /^[a-zA-ZÀ-ÿ\s\-\.]+$/.test(val), 'Nome deve conter apenas letras, espaços, hífens e pontos')
        .refine(val => val.trim().split(/\s+/).length >= 2, 'Informe nome e sobrenome'),
        
      phone: sanitizedStringSchemas.phone
        .min(10, 'Telefone deve ter pelo menos 10 dígitos')
        .max(20, 'Telefone muito longo')
        .refine(val => /^\+?[\d\s\-\(\)]{10,20}$/.test(val), 'Formato de telefone inválido'),
        
      address: sanitizedStringSchemas.text
        .min(10, 'Endereço completo é obrigatório')
        .max(200, 'Endereço muito longo')
        .refine(val => val.trim().length >= 10, 'Endereço deve ser detalhado'),
        
      city: sanitizedStringSchemas.text
        .min(2, 'Cidade é obrigatória')
        .max(50, 'Nome da cidade muito longo')
        .refine(val => /^[a-zA-ZÀ-ÿ\s\-\.]+$/.test(val), 'Cidade deve conter apenas letras'),
        
      state: sanitizedStringSchemas.text
        .min(2, 'Estado é obrigatório')
        .max(50, 'Nome do estado muito longo')
        .refine(val => /^[a-zA-ZÀ-ÿ\s\-\.]+$/.test(val), 'Estado deve conter apenas letras'),
        
      zipCode: sanitizedStringSchemas.text
        .min(8, 'CEP deve ter 8 dígitos')
        .max(10, 'CEP inválido')
        .refine(val => /^\d{5}-?\d{3}$/.test(val.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2')), 'Formato de CEP inválido (00000-000)'),
    }),
    
    livingSituation: z.object({
      housingType: z.enum(['apartment', 'house', 'farm', 'other'], {
        errorMap: () => ({ message: 'Tipo de moradia inválido' })
      }),
      
      hasYard: z.boolean(),
      
      ownRent: z.enum(['own', 'rent'], {
        errorMap: () => ({ message: 'Situação da moradia deve ser própria ou alugada' })
      }),
      
      landlordApproval: z.boolean()
        .optional()
        .nullable(),
        
    }).refine(
      (data) => {
        // If renting, landlord approval should be provided
        if (data.ownRent === 'rent' && data.landlordApproval === null) {
          return false;
        }
        return true;
      },
      {
        message: 'Para imóveis alugados, é necessário informar se tem aprovação do proprietário',
        path: ['landlordApproval']
      }
    ),
    
    experience: z.object({
      hadPetsBefore: z.boolean(),
      
      currentPets: z.array(z.object({
        species: sanitizedStringSchemas.text
          .min(1, 'Espécie do pet atual é obrigatória')
          .max(20, 'Nome da espécie muito longo'),
        breed: sanitizedStringSchemas.text
          .min(1, 'Raça do pet atual é obrigatória')  
          .max(50, 'Nome da raça muito longo'),
        age: sanitizedStringSchemas.text
          .min(1, 'Idade do pet atual é obrigatória')
          .max(20, 'Descrição de idade muito longa'),
      }))
        .max(10, 'Máximo 10 pets atuais')
        .default([]),
        
      veterinarianInfo: sanitizedStringSchemas.text
        .max(200, 'Informações do veterinário muito longas')
        .optional()
        .nullable()
        .transform(val => val === '' ? null : val),
    }),
    
    motivation: z.object({
      whyAdopt: sanitizedStringSchemas.text
        .min(20, 'Explique por que deseja adotar (mínimo 20 caracteres)')
        .max(1000, 'Explicação muito longa')
        .refine(val => val.trim().length >= 20, 'Resposta deve ter conteúdo substancial'),
        
      expectedCommitment: sanitizedStringSchemas.text
        .min(10, 'Descreva seu comprometimento esperado (mínimo 10 caracteres)')
        .max(500, 'Descrição muito longa')
        .refine(val => val.trim().length >= 10, 'Resposta deve ter conteúdo substancial'),
        
      availableTime: sanitizedStringSchemas.text
        .min(5, 'Informe o tempo disponível (mínimo 5 caracteres)')
        .max(200, 'Descrição muito longa')
        .refine(val => val.trim().length >= 5, 'Resposta deve ter conteúdo substancial'),
    }),
  }),
}).transform(sanitizeAdoptionData);

// Enhanced Shelter Validation Schema with sanitization
export const shelterSchema = z.object({
  name: sanitizedStringSchemas.text
    .min(2, 'Nome do abrigo é obrigatório')
    .max(100, 'Nome muito longo')
    .refine(val => val.trim().length > 0, 'Nome não pode ser apenas espaços'),
    
  address: sanitizedStringSchemas.text
    .min(10, 'Endereço completo é obrigatório')
    .max(200, 'Endereço muito longo')
    .refine(val => val.trim().length >= 10, 'Endereço deve ser detalhado'),
    
  city: sanitizedStringSchemas.text
    .min(2, 'Cidade é obrigatória')
    .max(50, 'Nome da cidade muito longo')
    .refine(val => /^[a-zA-ZÀ-ÿ\s\-\.]+$/.test(val), 'Cidade deve conter apenas letras'),
    
  state: sanitizedStringSchemas.text
    .min(2, 'Estado é obrigatório')
    .max(50, 'Nome do estado muito longo')
    .refine(val => /^[a-zA-ZÀ-ÿ\s\-\.]+$/.test(val), 'Estado deve conter apenas letras'),
    
  zipCode: sanitizedStringSchemas.text
    .min(8, 'CEP deve ter 8 dígitos')
    .max(10, 'CEP inválido')
    .refine(val => /^\d{5}-?\d{3}$/.test(val.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2')), 'Formato de CEP inválido (00000-000)'),
    
  phone: sanitizedStringSchemas.phone
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .max(20, 'Telefone muito longo')
    .refine(val => /^\+?[\d\s\-\(\)]{10,20}$/.test(val), 'Formato de telefone inválido'),
    
  email: sanitizedStringSchemas.email
    .email('Email inválido')
    .max(254, 'Email muito longo'),
    
  website: sanitizedStringSchemas.url
    .url('URL inválida')
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
    
  description: sanitizedStringSchemas.text
    .max(2000, 'Descrição muito longa')
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
    
}).transform(sanitizeShelterData);

// Enhanced Image Upload Validation Schemas with security checks
export const imageUploadSchema = z.object({
  files: z.array(z.object({
    name: sanitizedStringSchemas.filename
      .min(1, 'Nome do arquivo é obrigatório')
      .max(255, 'Nome do arquivo muito longo'),
    size: z.number()
      .min(1, 'Arquivo não pode estar vazio')
      .max(5242880, 'Arquivo muito grande. Máximo 5MB'),
    type: z.string().refine(
      (type) => ['image/jpeg', 'image/png', 'image/webp'].includes(type),
      'Formato inválido. Use JPEG, PNG ou WebP'
    ),
  }))
    .min(1, 'Pelo menos um arquivo é obrigatório')
    .max(10, 'Máximo 10 imagens por vez'),
});

// Enhanced Single Image Upload Validation
export const singleImageSchema = z.object({
  name: sanitizedStringSchemas.filename
    .min(1, 'Nome do arquivo é obrigatório')
    .max(255, 'Nome do arquivo muito longo'),
  size: z.number()
    .min(1, 'Arquivo não pode estar vazio')
    .max(5242880, 'Arquivo muito grande. Máximo 5MB'),
  type: z.string().refine(
    (type) => ['image/jpeg', 'image/png', 'image/webp'].includes(type),
    'Formato inválido. Use JPEG, PNG ou WebP'
  ),
});

// Enhanced Avatar Upload Validation
export const avatarUploadSchema = z.object({
  file: singleImageSchema,
  userId: z.string()
    .cuid('ID do usuário inválido')
    .optional(),
});

// Enhanced Pet Image Upload Validation  
export const petImageUploadSchema = z.object({
  files: z.array(singleImageSchema)
    .min(1, 'Pelo menos uma imagem é obrigatória')
    .max(10, 'Máximo 10 imagens por pet'),
  petId: z.string()
    .cuid('ID do pet inválido')
    .optional(),
  ownerId: z.string()
    .cuid('ID do proprietário inválido'),
});

// Enhanced Image Delete Validation
export const imageDeleteSchema = z.object({
  publicId: z.string()
    .min(1, 'ID público é obrigatório')
    .optional(),
  url: sanitizedStringSchemas.url
    .url('URL inválida')
    .optional(),
  publicIds: z.array(z.string().min(1, 'ID público não pode estar vazio'))
    .max(50, 'Máximo 50 imagens para deleção')
    .optional(),
  urls: z.array(sanitizedStringSchemas.url.url('URL inválida'))
    .max(50, 'Máximo 50 URLs para deleção')
    .optional(),
}).refine(
  (data) => data.publicId || data.url || data.publicIds?.length > 0 || data.urls?.length > 0,
  'ID público ou URL da imagem é obrigatório'
);

// Enhanced Filter Validation Schema with sanitization
export const filterSchema = z.object({
  species: z.enum(['DOG', 'CAT'], {
    errorMap: () => ({ message: 'Espécie deve ser DOG ou CAT' })
  }).optional(),
  
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE'], {
    errorMap: () => ({ message: 'Tamanho deve ser SMALL, MEDIUM ou LARGE' })
  }).optional(),
  
  gender: z.enum(['MALE', 'FEMALE'], {
    errorMap: () => ({ message: 'Gênero deve ser MALE ou FEMALE' })
  }).optional(),
  
  location: sanitizedStringSchemas.text
    .max(100, 'Localização muito longa')
    .optional()
    .transform(val => val === '' ? undefined : val),
    
  search: sanitizedStringSchemas.text
    .max(100, 'Termo de busca muito longo')
    .optional()
    .transform(val => val === '' ? undefined : val),
    
  page: z.string()
    .transform(val => {
      const num = parseInt(val);
      return isNaN(num) || num < 1 ? 1 : num;
    })
    .pipe(z.number().min(1, 'Página deve ser pelo menos 1').max(1000, 'Número da página muito alto'))
    .default('1'),
    
  limit: z.string()
    .transform(val => {
      const num = parseInt(val);
      return isNaN(num) || num < 1 ? 12 : Math.min(num, 50);
    })
    .pipe(z.number().min(1, 'Limite deve ser pelo menos 1').max(50, 'Limite máximo é 50'))
    .default('12'),
});

// Enhanced Search and Sorting Schemas
export const searchSchema = z.object({
  query: sanitizedStringSchemas.text
    .max(200, 'Termo de busca muito longo')
    .optional()
    .transform(val => val?.trim() === '' ? undefined : val?.trim()),
    
  filters: filterSchema.omit({ search: true, page: true, limit: true }).optional(),
  
  sort: z.enum(['newest', 'oldest', 'name_asc', 'name_desc', 'age_asc', 'age_desc'], {
    errorMap: () => ({ message: 'Ordenação inválida' })
  }).default('newest'),
  
  page: z.number().min(1).max(1000).default(1),
  limit: z.number().min(1).max(50).default(12),
});

// Pet Status Update Schema
export const petStatusUpdateSchema = z.object({
  status: z.enum(['APPROVED', 'PENDING', 'ADOPTED', 'UNAVAILABLE'], {
    errorMap: () => ({ message: 'Status inválido' })
  }),
  petId: z.string().cuid('ID do pet inválido'),
  ownerId: z.string().cuid('ID do proprietário inválido'),
});

// Adoption Status Update Schema
export const adoptionStatusUpdateSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Status de adoção inválido' })
  }),
  adoptionId: z.string().cuid('ID da adoção inválido'),
  rejectionReason: sanitizedStringSchemas.text
    .max(500, 'Motivo de rejeição muito longo')
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
});

// Password Reset Schema
export const passwordResetSchema = z.object({
  email: sanitizedStringSchemas.email.email('Email inválido'),
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  newPassword: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(128, 'Senha muito longa')
    .refine(val => /[A-Z]/.test(val), 'Senha deve conter pelo menos uma letra maiúscula')
    .refine(val => /[a-z]/.test(val), 'Senha deve conter pelo menos uma letra minúscula')
    .refine(val => /\d/.test(val), 'Senha deve conter pelo menos um número')
    .refine(val => /[!@#$%^&*(),.?":{}|<>]/.test(val), 'Senha deve conter pelo menos um caractere especial'),
});

// Contact Form Schema
export const contactSchema = z.object({
  name: sanitizedStringSchemas.text
    .min(2, 'Nome é obrigatório')
    .max(100, 'Nome muito longo'),
  email: sanitizedStringSchemas.email.email('Email inválido'),
  subject: sanitizedStringSchemas.text
    .min(5, 'Assunto é obrigatório')
    .max(200, 'Assunto muito longo'),
  message: sanitizedStringSchemas.text
    .min(10, 'Mensagem deve ter pelo menos 10 caracteres')
    .max(2000, 'Mensagem muito longa'),
});

// Export all schemas and utilities
export {
  sanitizeInput,
  sanitizedStringSchemas,
  sanitizePetData,
  sanitizeAdoptionData,
  sanitizeUserData,
  sanitizeShelterData
} from './sanitizers.js';