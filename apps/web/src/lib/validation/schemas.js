import { z } from 'zod';
import { sanitizeInput } from './sanitizers.js';

// Helper function to create sanitized string schema
const sanitizedText = () => z.string().transform(val => sanitizeInput(val, 'text'));
const sanitizedEmail = () => z.string().transform(val => sanitizeInput(val, 'email'));
const sanitizedPhone = () => z.string().transform(val => sanitizeInput(val, 'phone'));
const sanitizedUrl = () => z.string().transform(val => sanitizeInput(val, 'url'));

// User Validation Schemas
export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome muito longo')
    .refine(val => /^[a-zA-ZÀ-ÿ\s]+$/.test(val), 'Nome deve conter apenas letras e espaços')
    .transform(val => sanitizeInput(val, 'text')),
  email: z.string()
    .email('Email inválido')
    .max(254, 'Email muito longo')
    .transform(val => sanitizeInput(val, 'email')),
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
  email: z.string()
    .email('Email inválido')
    .transform(val => sanitizeInput(val, 'email')),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// Enhanced Pet Validation Schema - Requirements 2.2 and 2.4
export const petSchema = z.object({
  // Mandatory fields (Requirement 2.2)
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(50, 'Nome muito longo')
    .refine(val => val.trim().length > 0, 'Nome não pode ser apenas espaços')
    .refine(val => /^[a-zA-ZÀ-ÿ\s\-\.]+$/.test(val), 'Nome deve conter apenas letras, espaços, hífens e pontos')
    .transform(val => sanitizeInput(val, 'text')),
    
  species: z.enum(['DOG', 'CAT'], { 
    errorMap: () => ({ message: 'Espécie inválida. Deve ser DOG ou CAT' }) 
  }),
  
  breed: z.string()
    .min(1, 'Raça é obrigatória')
    .max(50, 'Raça muito longa')
    .refine(val => val.trim().length > 0, 'Raça não pode ser apenas espaços')
    .refine(val => /^[a-zA-ZÀ-ÿ\s\-\.]+$/.test(val), 'Raça deve conter apenas letras, espaços, hífens e pontos')
    .transform(val => sanitizeInput(val, 'text')),
    
  age: z.string()
    .min(1, 'Idade é obrigatória')
    .max(30, 'Descrição de idade muito longa')
    .refine(val => {
      const cleaned = val.trim();
      return /^(\d+(-\d+)?\s*(ano|anos|mês|meses|dia|dias)?|filhote|jovem|adulto|adulto maduro|idoso|sênior|não sei a idade)$/i.test(cleaned);
    }, 'Formato de idade inválido. Use: "2 anos", "6 meses", "Filhote", etc.')
    .transform(val => sanitizeInput(val, 'text')),
    
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'XLARGE'], { 
    errorMap: () => ({ message: 'Tamanho inválido. Deve ser SMALL, MEDIUM, LARGE ou XLARGE' }) 
  }),
  
  gender: z.enum(['MALE', 'FEMALE'], { 
    errorMap: () => ({ message: 'Gênero inválido. Deve ser MALE ou FEMALE' }) 
  }),
  
  description: z.string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(1000, 'Descrição muito longa')
    .refine(val => val.trim().length >= 10, 'Descrição deve ter conteúdo substancial')
    .transform(val => sanitizeInput(val, 'text')),

  color: z.string()
    .max(30, 'Cor muito longa')
    .optional()
    .nullable()
    .transform(val => val === '' || val == null ? null : sanitizeInput(val, 'text')),
    
  // Optional fields with validation (Requirement 2.4)
  isNeutered: z.boolean().default(false),
  isVaccinated: z.boolean().default(false),
  
  healthStatus: z.string()
    .max(500, 'Status de saúde muito longo')
    .optional()
    .nullable()
    .transform(val => val === '' || val == null ? null : sanitizeInput(val, 'text')),
    
  personality: z.array(z.string())
    .max(10, 'Máximo 10 traços de personalidade')
    .default([])
    .transform(arr => {
      const cleaned = arr
        .map(item => sanitizeInput(item, 'text'))
        .filter(item => item && item.trim().length >= 2)
        .filter(item => /^[a-zA-ZÀ-ÿ\s\-]+$/.test(item));
      return [...new Set(cleaned)]; // Remove duplicates
    }),
    
  location: z.string()
    .max(100, 'Localização muito longa')
    .optional()
    .nullable()
    .transform(val => val === '' || val == null ? null : sanitizeInput(val, 'text')),
    
  images: z.array(z.string())
    .max(10, 'Máximo 10 imagens por pet')
    .default([])
    .optional()
    .transform(arr => {
      if (!arr || arr.length === 0) return [];
      
      // Aceita URLs HTTP/HTTPS, URLs locais (/uploads/...) e Base64 data URLs
      const filteredImages = arr.filter(url => {
        if (!url) return false;
        
        // HTTP/HTTPS URLs (Cloudinary, external services)
        if (url.startsWith('https://') || url.startsWith('http://')) {
          return true;
        }
        
        // Local server URLs
        if (url.startsWith('/uploads/')) {
          return true;
        }
        
        // Base64 data URLs (from client-side FileReader)
        if (url.startsWith('data:image/')) {
          return true;
        }
        
        return false;
      }).map(url => sanitizeInput(url, 'url'));
      
      return filteredImages;
    }),
    
  // New pet fields - Temperament & Behavior (Requirement 2.2, 2.4)
  temperament: z.string()
    .max(50, 'Temperamento muito longo')
    .optional()
    .nullable()
    .transform(val => val === '' || val == null ? null : sanitizeInput(val, 'text')),
    
  compatibilityChildren: z.string()
    .max(50, 'Compatibilidade com crianças muito longa')
    .optional()
    .nullable()
    .transform(val => val === '' || val == null ? null : sanitizeInput(val, 'text')),
    
  compatibilityAnimals: z.string()
    .max(50, 'Compatibilidade com animais muito longa')
    .optional()
    .nullable()
    .transform(val => val === '' || val == null ? null : sanitizeInput(val, 'text')),
    
  microchip: z.boolean().default(false),
  
  allergies: z.string()
    .max(500, 'Alergias muito longo')
    .optional()
    .nullable()
    .transform(val => val === '' || val == null ? null : sanitizeInput(val, 'text')),
    
  adoptionReason: z.string()
    .max(100, 'Motivo da adoção muito longo')
    .optional()
    .nullable()
    .transform(val => val === '' || val == null ? null : sanitizeInput(val, 'text')),
    
  adoptionReasonDetails: z.string()
    .max(1000, 'Detalhes do motivo muito longo')
    .optional()
    .nullable()
    .transform(val => val === '' || val == null ? null : sanitizeInput(val, 'text')),
    
  acceptOutsideCity: z.string()
    .max(50, 'Preferência de localidade muito longa')
    .optional()
    .nullable()
    .transform(val => val === '' || val == null ? null : sanitizeInput(val, 'text')),
}).strict();

// Enhanced Adoption Validation Schema
export const adoptionSchema = z.object({
  petId: z.string().cuid('ID do pet inválido'),
  message: z.string()
    .max(1000, 'Mensagem muito longa')
    .optional()
    .nullable()
    .transform(val => val === '' || val == null ? null : sanitizeInput(val, 'text')),
    
  adopterInfo: z.object({
    personalInfo: z.object({
      fullName: z.string()
        .min(2, 'Nome completo é obrigatório')
        .max(100, 'Nome muito longo')
        .refine(val => /^[a-zA-ZÀ-ÿ\s\-\.]+$/.test(val), 'Nome deve conter apenas letras, espaços, hífens e pontos')
        .refine(val => val.trim().split(/\s+/).length >= 2, 'Informe nome e sobrenome')
        .transform(val => sanitizeInput(val, 'text')),
        
      phone: z.string()
        .min(10, 'Telefone deve ter pelo menos 10 dígitos')
        .max(20, 'Telefone muito longo')
        .refine(val => /^\+?[\d\s\-\(\)]{10,20}$/.test(val), 'Formato de telefone inválido')
        .transform(val => sanitizeInput(val, 'phone')),
        
      address: z.string()
        .min(10, 'Endereço completo é obrigatório')
        .max(200, 'Endereço muito longo')
        .refine(val => val.trim().length >= 10, 'Endereço deve ser detalhado')
        .transform(val => sanitizeInput(val, 'text')),
        
      city: z.string()
        .min(2, 'Cidade é obrigatória')
        .max(50, 'Nome da cidade muito longo')
        .refine(val => /^[a-zA-ZÀ-ÿ\s\-\.]+$/.test(val), 'Cidade deve conter apenas letras')
        .transform(val => sanitizeInput(val, 'text')),
        
      state: z.string()
        .min(2, 'Estado é obrigatório')
        .max(50, 'Nome do estado muito longo')
        .refine(val => /^[a-zA-ZÀ-ÿ\s\-\.]+$/.test(val), 'Estado deve conter apenas letras')
        .transform(val => sanitizeInput(val, 'text')),
        
      zipCode: z.string()
        .min(8, 'CEP deve ter 8 dígitos')
        .max(10, 'CEP inválido')
        .refine(val => /^\d{5}-?\d{3}$/.test(val.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2')), 'Formato de CEP inválido (00000-000)')
        .transform(val => sanitizeInput(val, 'text')),
    }),
    
    livingSituation: z.object({
      housingType: z.enum(['apartment', 'house', 'farm', 'other'], {
        errorMap: () => ({ message: 'Tipo de moradia inválido' })
      }),
      hasYard: z.boolean(),
      ownRent: z.enum(['own', 'rent'], {
        errorMap: () => ({ message: 'Situação da moradia deve ser própria ou alugada' })
      }),
      landlordApproval: z.boolean().optional().nullable(),
    }).refine(
      (data) => {
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
        species: z.string()
          .min(1, 'Espécie do pet atual é obrigatória')
          .max(20, 'Nome da espécie muito longo')
          .transform(val => sanitizeInput(val, 'text')),
        breed: z.string()
          .min(1, 'Raça do pet atual é obrigatória')  
          .max(50, 'Nome da raça muito longo')
          .transform(val => sanitizeInput(val, 'text')),
        age: z.string()
          .min(1, 'Idade do pet atual é obrigatória')
          .max(20, 'Descrição de idade muito longa')
          .transform(val => sanitizeInput(val, 'text')),
      })).max(10, 'Máximo 10 pets atuais').default([]),
      veterinarianInfo: z.string()
        .max(200, 'Informações do veterinário muito longas')
        .optional()
        .nullable()
        .transform(val => val === '' || val == null ? null : sanitizeInput(val, 'text')),
    }),
    
    motivation: z.object({
      whyAdopt: z.string()
        .min(20, 'Explique por que deseja adotar (mínimo 20 caracteres)')
        .max(1000, 'Explicação muito longa')
        .refine(val => val.trim().length >= 20, 'Resposta deve ter conteúdo substancial')
        .transform(val => sanitizeInput(val, 'text')),
        
      expectedCommitment: z.string()
        .min(10, 'Descreva seu comprometimento esperado (mínimo 10 caracteres)')
        .max(500, 'Descrição muito longa')
        .refine(val => val.trim().length >= 10, 'Resposta deve ter conteúdo substancial')
        .transform(val => sanitizeInput(val, 'text')),
        
      availableTime: z.string()
        .min(5, 'Informe o tempo disponível (mínimo 5 caracteres)')
        .max(200, 'Descrição muito longa')
        .refine(val => val.trim().length >= 5, 'Resposta deve ter conteúdo substancial')
        .transform(val => sanitizeInput(val, 'text')),
    }),
  }),
});

// Shelter Validation Schema
export const shelterSchema = z.object({
  name: z.string()
    .min(2, 'Nome do abrigo é obrigatório')
    .max(100, 'Nome muito longo')
    .refine(val => val.trim().length > 0, 'Nome não pode ser apenas espaços')
    .transform(val => sanitizeInput(val, 'text')),
  address: z.string()
    .min(10, 'Endereço completo é obrigatório')
    .max(200, 'Endereço muito longo')
    .refine(val => val.trim().length >= 10, 'Endereço deve ser detalhado')
    .transform(val => sanitizeInput(val, 'text')),
  city: z.string()
    .min(2, 'Cidade é obrigatória')
    .max(50, 'Nome da cidade muito longo')
    .refine(val => /^[a-zA-ZÀ-ÿ\s\-\.]+$/.test(val), 'Cidade deve conter apenas letras')
    .transform(val => sanitizeInput(val, 'text')),
  state: z.string()
    .min(2, 'Estado é obrigatório')
    .max(50, 'Nome do estado muito longo')
    .refine(val => /^[a-zA-ZÀ-ÿ\s\-\.]+$/.test(val), 'Estado deve conter apenas letras')
    .transform(val => sanitizeInput(val, 'text')),
  zipCode: z.string()
    .min(8, 'CEP deve ter 8 dígitos')
    .max(10, 'CEP inválido')
    .refine(val => /^\d{5}-?\d{3}$/.test(val.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2')), 'Formato de CEP inválido (00000-000)')
    .transform(val => sanitizeInput(val, 'text')),
  phone: z.string()
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .max(20, 'Telefone muito longo')
    .refine(val => /^\+?[\d\s\-\(\)]{10,20}$/.test(val), 'Formato de telefone inválido')
    .transform(val => sanitizeInput(val, 'phone')),
  email: z.string()
    .email('Email inválido')
    .max(254, 'Email muito longo')
    .transform(val => sanitizeInput(val, 'email')),
  website: z.string()
    .url('URL inválida')
    .optional()
    .nullable()
    .transform(val => val === '' || val == null ? null : sanitizeInput(val, 'url')),
  description: z.string()
    .max(2000, 'Descrição muito longa')
    .optional()
    .nullable()
    .transform(val => val === '' || val == null ? null : sanitizeInput(val, 'text')),
});

// Image Upload Validation Schemas
export const singleImageSchema = z.object({
  name: z.string()
    .min(1, 'Nome do arquivo é obrigatório')
    .max(255, 'Nome do arquivo muito longo')
    .transform(val => sanitizeInput(val, 'filename')),
  size: z.number()
    .min(1, 'Arquivo não pode estar vazio')
    .max(5242880, 'Arquivo muito grande. Máximo 5MB'),
  type: z.string().refine(
    (type) => ['image/jpeg', 'image/png', 'image/webp'].includes(type),
    'Formato inválido. Use JPEG, PNG ou WebP'
  ),
});

export const imageUploadSchema = z.object({
  files: z.array(singleImageSchema)
    .min(1, 'Pelo menos um arquivo é obrigatório')
    .max(10, 'Máximo 10 imagens por vez'),
});

export const petImageUploadSchema = z.object({
  files: z.array(singleImageSchema)
    .min(1, 'Pelo menos uma imagem é obrigatória')
    .max(10, 'Máximo 10 imagens por pet'),
  petId: z.string().cuid('ID do pet inválido').optional(),
  ownerId: z.string().cuid('ID do proprietário inválido'),
});

export const avatarUploadSchema = z.object({
  file: singleImageSchema,
  userId: z.string().cuid('ID do usuário inválido').optional(),
});

// Filter and Search Schemas
export const filterSchema = z.object({
  species: z.union([
    z.enum(['DOG', 'CAT']),
    z.literal(''),
    z.null(),
    z.undefined()
  ]).optional()
    .transform(val => val && val !== '' ? val : undefined),
  size: z.union([
    z.enum(['SMALL', 'MEDIUM', 'LARGE']),
    z.literal(''),
    z.null(),
    z.undefined()
  ]).optional()
    .transform(val => val && val !== '' ? val : undefined),
  gender: z.union([
    z.enum(['MALE', 'FEMALE']),
    z.literal(''),
    z.null(),
    z.undefined()
  ]).optional()
    .transform(val => val && val !== '' ? val : undefined),
  location: z.union([
    z.string().max(100, 'Localização muito longa'),
    z.literal(''),
    z.null(),
    z.undefined()
  ]).optional()
    .transform(val => val && val !== '' ? sanitizeInput(val, 'text') : undefined),
  search: z.union([
    z.string().max(100, 'Termo de busca muito longo'),
    z.literal(''),
    z.null(),
    z.undefined()
  ]).optional()
    .transform(val => val && val !== '' ? sanitizeInput(val, 'text') : undefined),
  page: z.union([
    z.string(),
    z.literal(''),
    z.null(),
    z.undefined()
  ]).transform(val => {
    const num = parseInt(val);
    return isNaN(num) || num < 1 ? 1 : Math.min(num, 1000);
  })
  .default('1'),
  limit: z.union([
    z.string(),
    z.literal(''),
    z.null(),
    z.undefined()
  ]).transform(val => {
    const num = parseInt(val);
    return isNaN(num) || num < 1 ? 12 : Math.min(num, 50);
  })
  .default('12'),
});

// Additional utility schemas
export const petStatusUpdateSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'ADOPTED', 'UNAVAILABLE'], {
    errorMap: () => ({ message: 'Status inválido' })
  }),
  petId: z.string().cuid('ID do pet inválido'),
  ownerId: z.string().cuid('ID do proprietário inválido'),
});

export const adoptionStatusUpdateSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Status de adoção inválido' })
  }),
  adoptionId: z.string().cuid('ID da adoção inválido'),
  rejectionReason: z.string()
    .max(500, 'Motivo de rejeição muito longo')
    .optional()
    .nullable()
    .transform(val => val === '' || val == null ? null : sanitizeInput(val, 'text')),
});

export const passwordResetSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .transform(val => sanitizeInput(val, 'email')),
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

export const contactSchema = z.object({
  name: z.string()
    .min(2, 'Nome é obrigatório')
    .max(100, 'Nome muito longo')
    .transform(val => sanitizeInput(val, 'text')),
  email: z.string()
    .email('Email inválido')
    .transform(val => sanitizeInput(val, 'email')),
  subject: z.string()
    .min(5, 'Assunto é obrigatório')
    .max(200, 'Assunto muito longo')
    .transform(val => sanitizeInput(val, 'text')),
  message: z.string()
    .min(10, 'Mensagem deve ter pelo menos 10 caracteres')
    .max(2000, 'Mensagem muito longa')
    .transform(val => sanitizeInput(val, 'text')),
});