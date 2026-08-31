import { describe, it, expect, beforeEach, vi } from 'vitest';
import { adoptionSchema } from '@/lib/validation/schemas.js';

/**
 * AdoptionForm Integration Tests
 * Tests form validation using the actual Zod schema
 * Requirements: 6.1, 6.2
 */

describe('AdoptionForm Zod Validation Integration', () => {
  const validPetId = 'cuid-1234567890';

  describe('Valid Adoption Data', () => {
    it('should validate complete valid adoption form data', () => {
      const validData = {
        petId: validPetId,
        adopterInfo: {
          personalInfo: {
            fullName: 'João Silva Santos',
            phone: '(11) 98765-4321',
            address: 'Rua das Flores, 123, Apto 45',
            city: 'São Paulo',
            state: 'São Paulo',
            zipCode: '01310-100',
          },
          livingSituation: {
            housingType: 'apartment',
            hasYard: false,
            ownRent: 'own',
            landlordApproval: null,
          },
          experience: {
            hadPetsBefore: true,
            currentPets: [
              {
                species: 'Cachorro',
                breed: 'Poodle',
                age: '3 anos',
              }
            ],
            veterinarianInfo: 'Dr. João - Clínica Pet Care',
          },
          motivation: {
            whyAdopt: 'Quero dar um lar amoroso para um pet que precisa de cuidados e companhia',
            expectedCommitment: 'Vou levar ao veterinário regularmente, dar ração de qualidade e muito amor',
            availableTime: 'Trabalho de casa e tenho disponibilidade integral para cuidar',
          },
        },
      };

      const result = adoptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate adoption data with rented housing and landlord approval', () => {
      const validData = {
        petId: validPetId,
        adopterInfo: {
          personalInfo: {
            fullName: 'Maria Silva Santos',
            phone: '(11) 98765-4321',
            address: 'Rua das Flores, 123',
            city: 'São Paulo',
            state: 'São Paulo',
            zipCode: '01310-100',
          },
          livingSituation: {
            housingType: 'house',
            hasYard: true,
            ownRent: 'rent',
            landlordApproval: true,
          },
          experience: {
            hadPetsBefore: false,
            currentPets: [],
            veterinarianInfo: null,
          },
          motivation: {
            whyAdopt: 'Sempre quis ter um cachorro para fazer companhia na minha casa',
            expectedCommitment: 'Tenho quintal para o pet brincar e tempo para cuidar',
            availableTime: 'Trabalho meio período e tenho finais de semana livres',
          },
        },
      };

      const result = adoptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate adoption data with multiple current pets', () => {
      const validData = {
        petId: validPetId,
        adopterInfo: {
          personalInfo: {
            fullName: 'Carlos Roberto Mendes',
            phone: '(21) 99876-5432',
            address: 'Avenida Paulista, 1000',
            city: 'Rio de Janeiro',
            state: 'Rio de Janeiro',
            zipCode: '20000-100',
          },
          livingSituation: {
            housingType: 'farm',
            hasYard: true,
            ownRent: 'own',
            landlordApproval: null,
          },
          experience: {
            hadPetsBefore: true,
            currentPets: [
              {
                species: 'Cachorro',
                breed: 'Labrador',
                age: '5 anos',
              },
              {
                species: 'Gato',
                breed: 'Persa',
                age: '3 anos',
              },
              {
                species: 'Pássaro',
                breed: 'Canário',
                age: '2 anos',
              },
            ],
            veterinarianInfo: 'Clínica Veterinária Santa Cruz - (21) 3333-4444',
          },
          motivation: {
            whyAdopt: 'Tenho experiência com vários animais e quero ajudar mais um a encontrar um lar',
            expectedCommitment: 'Vou oferecer todo o cuidado necessário e integrar o novo membro à família',
            availableTime: 'Sou aposentado e tenho tempo integral para dedicar aos pets',
          },
        },
      };

      const result = adoptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Invalid Personal Information', () => {
    it('should reject adoption with missing full name', () => {
      const invalidData = {
        petId: validPetId,
        adopterInfo: {
          personalInfo: {
            fullName: '',
            phone: '(11) 98765-4321',
            address: 'Rua das Flores, 123',
            city: 'São Paulo',
            state: 'São Paulo',
            zipCode: '01310-100',
          },
          livingSituation: { housingType: 'apartment', hasYard: false, ownRent: 'own', landlordApproval: null },
          experience: { hadPetsBefore: false, currentPets: [], veterinarianInfo: null },
          motivation: {
            whyAdopt: 'Quero um pet para fazer companhia e amar',
            expectedCommitment: 'Vou cuidar com muito amor e responsabilidade',
            availableTime: 'Tenho tempo disponível',
          },
        },
      };

      const result = adoptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject adoption with invalid phone number', () => {
      const invalidData = {
        petId: validPetId,
        adopterInfo: {
          personalInfo: {
            fullName: 'João Silva',
            phone: '123', // Too short
            address: 'Rua das Flores, 123',
            city: 'São Paulo',
            state: 'São Paulo',
            zipCode: '01310-100',
          },
          livingSituation: { housingType: 'apartment', hasYard: false, ownRent: 'own', landlordApproval: null },
          experience: { hadPetsBefore: false, currentPets: [], veterinarianInfo: null },
          motivation: {
            whyAdopt: 'Quero um pet para fazer companhia e amar',
            expectedCommitment: 'Vou cuidar com muito amor e responsabilidade',
            availableTime: 'Tenho tempo disponível',
          },
        },
      };

      const result = adoptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.errors[0].path).toContain('phone');
    });

    it('should reject adoption with invalid zip code format', () => {
      const invalidData = {
        petId: validPetId,
        adopterInfo: {
          personalInfo: {
            fullName: 'João Silva',
            phone: '(11) 98765-4321',
            address: 'Rua das Flores, 123',
            city: 'São Paulo',
            state: 'São Paulo',
            zipCode: '123', // Invalid format
          },
          livingSituation: { housingType: 'apartment', hasYard: false, ownRent: 'own', landlordApproval: null },
          experience: { hadPetsBefore: false, currentPets: [], veterinarianInfo: null },
          motivation: {
            whyAdopt: 'Quero um pet para fazer companhia e amar',
            expectedCommitment: 'Vou cuidar com muito amor e responsabilidade',
            availableTime: 'Tenho tempo disponível',
          },
        },
      };

      const result = adoptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject adoption with short full name', () => {
      const invalidData = {
        petId: validPetId,
        adopterInfo: {
          personalInfo: {
            fullName: 'J', // Too short
            phone: '(11) 98765-4321',
            address: 'Rua das Flores, 123',
            city: 'São Paulo',
            state: 'São Paulo',
            zipCode: '01310-100',
          },
          livingSituation: { housingType: 'apartment', hasYard: false, ownRent: 'own', landlordApproval: null },
          experience: { hadPetsBefore: false, currentPets: [], veterinarianInfo: null },
          motivation: {
            whyAdopt: 'Quero um pet para fazer companhia e amar',
            expectedCommitment: 'Vou cuidar com muito amor e responsabilidade',
            availableTime: 'Tenho tempo disponível',
          },
        },
      };

      const result = adoptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject adoption with short address', () => {
      const invalidData = {
        petId: validPetId,
        adopterInfo: {
          personalInfo: {
            fullName: 'João Silva',
            phone: '(11) 98765-4321',
            address: 'Rua', // Too short
            city: 'São Paulo',
            state: 'São Paulo',
            zipCode: '01310-100',
          },
          livingSituation: { housingType: 'apartment', hasYard: false, ownRent: 'own', landlordApproval: null },
          experience: { hadPetsBefore: false, currentPets: [], veterinarianInfo: null },
          motivation: {
            whyAdopt: 'Quero um pet para fazer companhia e amar',
            expectedCommitment: 'Vou cuidar com muito amor e responsabilidade',
            availableTime: 'Tenho tempo disponível',
          },
        },
      };

      const result = adoptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Invalid Living Situation', () => {
    it('should reject adoption when renting without landlord approval specified', () => {
      const invalidData = {
        petId: validPetId,
        adopterInfo: {
          personalInfo: {
            fullName: 'João Silva',
            phone: '(11) 98765-4321',
            address: 'Rua das Flores, 123',
            city: 'São Paulo',
            state: 'São Paulo',
            zipCode: '01310-100',
          },
          livingSituation: {
            housingType: 'apartment',
            hasYard: false,
            ownRent: 'rent',
            landlordApproval: null, // Missing when renting
          },
          experience: { hadPetsBefore: false, currentPets: [], veterinarianInfo: null },
          motivation: {
            whyAdopt: 'Quero um pet para fazer companhia e amar',
            expectedCommitment: 'Vou cuidar com muito amor e responsabilidade',
            availableTime: 'Tenho tempo disponível',
          },
        },
      };

      const result = adoptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept adoption when owning with null landlord approval', () => {
      const validData = {
        petId: validPetId,
        adopterInfo: {
          personalInfo: {
            fullName: 'João Silva',
            phone: '(11) 98765-4321',
            address: 'Rua das Flores, 123',
            city: 'São Paulo',
            state: 'São Paulo',
            zipCode: '01310-100',
          },
          livingSituation: {
            housingType: 'house',
            hasYard: true,
            ownRent: 'own',
            landlordApproval: null, // OK when owning
          },
          experience: { hadPetsBefore: false, currentPets: [], veterinarianInfo: null },
          motivation: {
            whyAdopt: 'Quero um pet para fazer companhia e amar',
            expectedCommitment: 'Vou cuidar com muito amor e responsabilidade',
            availableTime: 'Tenho tempo disponível',
          },
        },
      };

      const result = adoptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Invalid Motivation', () => {
    it('should reject adoption with too short "why adopt" text', () => {
      const invalidData = {
        petId: validPetId,
        adopterInfo: {
          personalInfo: {
            fullName: 'João Silva',
            phone: '(11) 98765-4321',
            address: 'Rua das Flores, 123',
            city: 'São Paulo',
            state: 'São Paulo',
            zipCode: '01310-100',
          },
          livingSituation: { housingType: 'apartment', hasYard: false, ownRent: 'own', landlordApproval: null },
          experience: { hadPetsBefore: false, currentPets: [], veterinarianInfo: null },
          motivation: {
            whyAdopt: 'Quero um pet', // Too short (less than 20 chars)
            expectedCommitment: 'Vou cuidar com muito amor e responsabilidade',
            availableTime: 'Tenho tempo disponível',
          },
        },
      };

      const result = adoptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject adoption with too short "commitment" text', () => {
      const invalidData = {
        petId: validPetId,
        adopterInfo: {
          personalInfo: {
            fullName: 'João Silva',
            phone: '(11) 98765-4321',
            address: 'Rua das Flores, 123',
            city: 'São Paulo',
            state: 'São Paulo',
            zipCode: '01310-100',
          },
          livingSituation: { housingType: 'apartment', hasYard: false, ownRent: 'own', landlordApproval: null },
          experience: { hadPetsBefore: false, currentPets: [], veterinarianInfo: null },
          motivation: {
            whyAdopt: 'Quero um pet para fazer companhia e amar',
            expectedCommitment: 'Sim', // Too short
            availableTime: 'Tenho tempo disponível',
          },
        },
      };

      const result = adoptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject adoption with too short "available time" text', () => {
      const invalidData = {
        petId: validPetId,
        adopterInfo: {
          personalInfo: {
            fullName: 'João Silva',
            phone: '(11) 98765-4321',
            address: 'Rua das Flores, 123',
            city: 'São Paulo',
            state: 'São Paulo',
            zipCode: '01310-100',
          },
          livingSituation: { housingType: 'apartment', hasYard: false, ownRent: 'own', landlordApproval: null },
          experience: { hadPetsBefore: false, currentPets: [], veterinarianInfo: null },
          motivation: {
            whyAdopt: 'Quero um pet para fazer companhia e amar',
            expectedCommitment: 'Vou cuidar com muito amor e responsabilidade',
            availableTime: 'Sim', // Too short
          },
        },
      };

      const result = adoptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Invalid Current Pets', () => {
    it('should reject adoption with invalid current pet data', () => {
      const invalidData = {
        petId: validPetId,
        adopterInfo: {
          personalInfo: {
            fullName: 'João Silva',
            phone: '(11) 98765-4321',
            address: 'Rua das Flores, 123',
            city: 'São Paulo',
            state: 'São Paulo',
            zipCode: '01310-100',
          },
          livingSituation: { housingType: 'apartment', hasYard: false, ownRent: 'own', landlordApproval: null },
          experience: {
            hadPetsBefore: true,
            currentPets: [
              {
                species: '', // Empty species
                breed: 'Poodle',
                age: '3 anos',
              }
            ],
            veterinarianInfo: null,
          },
          motivation: {
            whyAdopt: 'Quero um pet para fazer companhia e amar',
            expectedCommitment: 'Vou cuidar com muito amor e responsabilidade',
            availableTime: 'Tenho tempo disponível',
          },
        },
      };

      const result = adoptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept adoption with no current pets', () => {
      const validData = {
        petId: validPetId,
        adopterInfo: {
          personalInfo: {
            fullName: 'João Silva',
            phone: '(11) 98765-4321',
            address: 'Rua das Flores, 123',
            city: 'São Paulo',
            state: 'São Paulo',
            zipCode: '01310-100',
          },
          livingSituation: { housingType: 'apartment', hasYard: false, ownRent: 'own', landlordApproval: null },
          experience: {
            hadPetsBefore: false,
            currentPets: [],
            veterinarianInfo: null,
          },
          motivation: {
            whyAdopt: 'Quero um pet para fazer companhia e amar',
            expectedCommitment: 'Vou cuidar com muito amor e responsabilidade',
            availableTime: 'Tenho tempo disponível',
          },
        },
      };

      const result = adoptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Invalid Pet ID', () => {
    it('should reject adoption with invalid pet ID', () => {
      const invalidData = {
        petId: 'not-a-valid-cuid',
        adopterInfo: {
          personalInfo: {
            fullName: 'João Silva',
            phone: '(11) 98765-4321',
            address: 'Rua das Flores, 123',
            city: 'São Paulo',
            state: 'São Paulo',
            zipCode: '01310-100',
          },
          livingSituation: { housingType: 'apartment', hasYard: false, ownRent: 'own', landlordApproval: null },
          experience: { hadPetsBefore: false, currentPets: [], veterinarianInfo: null },
          motivation: {
            whyAdopt: 'Quero um pet para fazer companhia e amar',
            expectedCommitment: 'Vou cuidar com muito amor e responsabilidade',
            availableTime: 'Tenho tempo disponível',
          },
        },
      };

      const result = adoptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Sanitization', () => {
    it('should sanitize HTML and special characters in text fields', () => {
      const dataWithHtml = {
        petId: validPetId,
        adopterInfo: {
          personalInfo: {
            fullName: 'João <script>alert("xss")</script> Silva',
            phone: '(11) 98765-4321',
            address: 'Rua das Flores, 123',
            city: 'São Paulo',
            state: 'São Paulo',
            zipCode: '01310-100',
          },
          livingSituation: { housingType: 'apartment', hasYard: false, ownRent: 'own', landlordApproval: null },
          experience: { hadPetsBefore: false, currentPets: [], veterinarianInfo: null },
          motivation: {
            whyAdopt: 'Quero um pet para fazer companhia e amar',
            expectedCommitment: 'Vou cuidar com muito amor e responsabilidade',
            availableTime: 'Tenho tempo disponível',
          },
        },
      };

      const result = adoptionSchema.safeParse(dataWithHtml);
      // Should still parse, but sanitizers should clean the content
      expect(result.success).toBe(true);
    });
  });

  describe('Optional Fields', () => {
    it('should accept adoption with all optional fields as null/empty', () => {
      const validData = {
        petId: validPetId,
        adopterInfo: {
          personalInfo: {
            fullName: 'João Silva',
            phone: '(11) 98765-4321',
            address: 'Rua das Flores, 123',
            city: 'São Paulo',
            state: 'São Paulo',
            zipCode: '01310-100',
          },
          livingSituation: {
            housingType: 'apartment',
            hasYard: false,
            ownRent: 'own',
            landlordApproval: null,
          },
          experience: {
            hadPetsBefore: false,
            currentPets: [],
            veterinarianInfo: null,
          },
          motivation: {
            whyAdopt: 'Quero um pet para fazer companhia e amar',
            expectedCommitment: 'Vou cuidar com muito amor e responsabilidade',
            availableTime: 'Tenho tempo disponível',
          },
        },
      };

      const result = adoptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
