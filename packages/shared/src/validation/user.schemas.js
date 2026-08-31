import { z } from 'zod';
import { emailSchema, passwordSchema, nameSchema } from './common.schemas.js';

/**
 * User validation schemas
 */

export const userTypeSchema = z.enum(['ADOPTER', 'SHELTER_ADMIN', 'INDIVIDUAL_OWNER']);

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string('Senha é obrigatória'),
});

// Register schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string('Confirmação de senha é obrigatória'),
  name: nameSchema,
  type: userTypeSchema.default('ADOPTER'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não correspondem',
  path: ['confirmPassword'],
});

// Password reset schema
export const passwordResetSchema = z.object({
  email: emailSchema,
});

// New password schema
export const newPasswordSchema = z.object({
  token: z.string('Token é obrigatório'),
  password: passwordSchema,
  confirmPassword: z.string('Confirmação de senha é obrigatória'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não correspondem',
  path: ['confirmPassword'],
});

// Update profile schema
export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
});
