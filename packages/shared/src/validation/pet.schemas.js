import { z } from 'zod';
import { nameSchema } from './common.schemas.js';

/**
 * Pet validation schemas
 */

export const speciesSchema = z.enum(['DOG', 'CAT', 'RABBIT', 'OTHER']);
export const sizeSchema = z.enum(['SMALL', 'MEDIUM', 'LARGE', 'XLARGE']);
export const genderSchema = z.enum(['MALE', 'FEMALE']);
export const petStatusSchema = z.enum(['AVAILABLE', 'PENDING', 'ADOPTED', 'UNAVAILABLE']);

// Create pet schema
export const createPetSchema = z.object({
  name: nameSchema,
  species: speciesSchema,
  breed: z.string('Raça é obrigatória')
    .min(1, 'Raça não pode estar vazia')
    .max(50, 'Raça não pode exceder 50 caracteres'),
  age: z.string('Idade é obrigatória')
    .min(1, 'Idade não pode estar vazia'),
  size: sizeSchema,
  gender: genderSchema,
  color: z.string('Cor é obrigatória')
    .min(1, 'Cor não pode estar vazia'),
  description: z.string('Descrição é obrigatória')
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(500, 'Descrição não pode exceder 500 caracteres'),
  isNeutered: z.boolean().default(false),
  isVaccinated: z.boolean().default(false),
  healthStatus: z.string().max(300).optional(),
  personality: z.array(z.string()).max(5, 'Máximo 5 traços de personalidade').optional(),
});

// Update pet schema
export const updatePetSchema = createPetSchema.partial();

// Pet filters schema
export const petFiltersSchema = z.object({
  species: speciesSchema.optional(),
  size: sizeSchema.optional(),
  gender: genderSchema.optional(),
  location: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

// Update pet status schema
export const updatePetStatusSchema = z.object({
  status: petStatusSchema,
  reason: z.string().optional(),
});

// Pet compatibility schema
export const petCompatibilitySchema = z.object({
  pet_id: z.string(),
  good_with_dogs: z.boolean().optional(),
  good_with_cats: z.boolean().optional(),
  good_with_children: z.boolean().optional(),
});
