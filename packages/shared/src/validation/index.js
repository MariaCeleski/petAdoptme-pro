// Re-export all schemas
export * from './common.schemas.js';
export * from './user.schemas.js';
export * from './pet.schemas.js';
export * from './adoption.schemas.js';

// Create aliases for the API layer expectations
export { loginSchema as userLoginSchema } from './user.schemas.js';
export { registerSchema as userRegisterSchema } from './user.schemas.js';
export { passwordResetSchema } from './user.schemas.js';
export { createPetSchema as petCreateSchema, updatePetSchema as petUpdateSchema } from './pet.schemas.js';
export { createAdoptionSchema as adoptionCreateSchema } from './adoption.schemas.js';
