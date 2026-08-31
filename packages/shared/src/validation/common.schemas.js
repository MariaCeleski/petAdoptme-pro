import { z } from 'zod';

/**
 * Common validation schemas - Esquemas reutilizáveis
 */

// Email validation
export const emailSchema = z
  .string('Email é obrigatório')
  .email('Email inválido');

// Password validation (min 8 chars, case-insensitive)
export const passwordSchema = z
  .string('Senha é obrigatória')
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um número');

// Name validation
export const nameSchema = z
  .string('Nome é obrigatório')
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(100, 'Nome não pode exceder 100 caracteres');

// CUID validation
export const cuidSchema = z
  .string('ID é obrigatório')
  .regex(/^c[^\s]{24}$/, 'ID inválido');

// URL validation
export const urlSchema = z
  .string('URL é obrigatória')
  .url('URL inválida')
  .optional();

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
});

// Error response schema
export const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string(),
  timestamp: z.string(),
  details: z.record(z.any()).optional(),
});

// Success response schema
export const successResponseSchema = z.object({
  data: z.any(),
  message: z.string().optional(),
  timestamp: z.string(),
});
