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

// Register schema - Backend only needs email, password, name, type
// confirmPassword validation is done on frontend and not needed here
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  type: userTypeSchema.default('ADOPTER'),
});

// Password reset schema
export const passwordResetSchema = z.object({
  newPassword: passwordSchema.optional(),
  password: passwordSchema.optional(),
}).refine(data => data.password || data.newPassword, {
  message: 'Nova senha é obrigatória',
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
