import { z } from 'zod';
import { nameSchema, cuidSchema } from './common.schemas.js';

/**
 * Adoption validation schemas
 */

export const adoptionStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED']);

// Adopter personal info schema
const personalInfoSchema = z.object({
  fullName: nameSchema,
  phone: z.string('Telefone é obrigatório')
    .min(10, 'Telefone inválido'),
  address: z.string('Endereço é obrigatório')
    .min(5, 'Endereço muito curto'),
  city: z.string('Cidade é obrigatória')
    .min(2, 'Cidade muito curta'),
  state: z.string('Estado é obrigatório')
    .length(2, 'Estado deve ter 2 caracteres'),
  zipCode: z.string('CEP é obrigatório')
    .regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
});

// Living situation schema
const livingSituationSchema = z.object({
  housingType: z.enum(['apartment', 'house', 'farm', 'other']),
  hasYard: z.boolean(),
  ownRent: z.enum(['own', 'rent']),
  landlordApproval: z.boolean().optional(),
});

// Pet experience schema
const petExperienceSchema = z.object({
  hadPetsBefore: z.boolean(),
  currentPets: z.array(z.object({
    species: z.string(),
    breed: z.string(),
    age: z.string(),
  })),
  veterinarianInfo: z.string().optional(),
});

// Motivation schema
const motivationSchema = z.object({
  whyAdopt: z.string('Motivo é obrigatório')
    .min(20, 'Descreva por que deseja adotar (mínimo 20 caracteres)'),
  expectedCommitment: z.string('Comprometimento esperado é obrigatório')
    .min(10, 'Descreva seu comprometimento esperado'),
  availableTime: z.string('Tempo disponível é obrigatório')
    .min(5, 'Informe o tempo disponível'),
});

// Full adopter info schema
export const adopterInfoSchema = z.object({
  personalInfo: personalInfoSchema,
  livingSituation: livingSituationSchema,
  experience: petExperienceSchema,
  motivation: motivationSchema,
});

// Create adoption request schema
export const createAdoptionSchema = z.object({
  petId: cuidSchema,
  adopterInfo: adopterInfoSchema,
  message: z.string().optional(),
});

// Update adoption status schema
export const updateAdoptionSchema = z.object({
  status: adoptionStatusSchema,
  rejectionReason: z.string('Motivo da rejeição é obrigatório')
    .min(10, 'Forneça um motivo detalhado')
    .optional(),
});
