/**
 * Unit tests for adoptions API routes
 * Tests adoption request creation and status updates
 * Requirements: 6.3, 6.4, 6.5, 6.6, 6.7, 6.8
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { NextResponse } from 'next/server';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    adoption: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn()
    },
    pet: {
      findUnique: jest.fn(),
      update: jest.fn()
    }
  }
}));

jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}));

jest.mock('@/lib/auth', () => ({
  authOptions: {}
}));

jest.mock('@/lib/email', () => ({
  sendAdoptionRequestEmail: jest.fn(),
  sendAdoptionStatusEmail: jest.fn()
}));

const { prisma } = require('@/lib/prisma');
const { getServerSession } = require('next-auth');
const { sendAdoptionRequestEmail, sendAdoptionStatusEmail } = require('@/lib/email');

describe('Adoptions API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/adoptions', () => {
    it('should require authentication', async () => {
      getServerSession.mockResolvedValueOnce(null);

      const { POST } = await import('../route.js');
      const request = new NextResponse(
        JSON.stringify({ petId: 'pet-1', adopterInfo: {} }),
        { headers: { 'content-type': 'application/json' } }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.code).toBe('UNAUTHORIZED');
    });

    it('should require adopter user type', async () => {
      getServerSession.mockResolvedValueOnce({
        user: {
          id: 'user-1',
          type: 'SHELTER_ADMIN',
          name: 'John',
          email: 'john@example.com'
        }
      });

      const { POST } = await import('../route.js');
      const request = new NextResponse(
        JSON.stringify({ petId: 'pet-1', adopterInfo: {} }),
        { headers: { 'content-type': 'application/json' } }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.code).toBe('FORBIDDEN');
    });

    it('should validate adoption form data', async () => {
      getServerSession.mockResolvedValueOnce({
        user: {
          id: 'user-1',
          type: 'ADOPTER',
          name: 'John',
          email: 'john@example.com'
        }
      });

      const { POST } = await import('../route.js');
      const invalidData = { petId: 'invalid' }; // Missing required adopterInfo

      const request = new NextResponse(
        JSON.stringify(invalidData),
        { headers: { 'content-type': 'application/json' } }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 if pet does not exist', async () => {
      getServerSession.mockResolvedValueOnce({
        user: {
          id: 'adopter-1',
          type: 'ADOPTER',
          name: 'John',
          email: 'john@example.com'
        }
      });

      prisma.pet.findUnique.mockResolvedValueOnce(null);

      const { POST } = await import('../route.js');
      const adoptionData = {
        petId: 'nonexistent-pet',
        adopterInfo: {
          personalInfo: {
            fullName: 'John Doe',
            phone: '11999999999',
            address: 'Rua Test 123',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234567'
          },
          livingSituation: {
            housingType: 'apartment',
            hasYard: false,
            ownRent: 'rent',
            landlordApproval: true
          },
          experience: {
            hadPetsBefore: true,
            currentPets: []
          },
          motivation: {
            whyAdopt: 'I love animals and want to give a pet a good home',
            expectedCommitment: 'Lifelong commitment',
            availableTime: '8 hours per day'
          }
        }
      };

      const request = new NextResponse(
        JSON.stringify(adoptionData),
        { headers: { 'content-type': 'application/json' } }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.code).toBe('NOT_FOUND');
    });

    it('should reject if pet is not available', async () => {
      getServerSession.mockResolvedValueOnce({
        user: {
          id: 'adopter-1',
          type: 'ADOPTER',
          name: 'John',
          email: 'john@example.com'
        }
      });

      prisma.pet.findUnique.mockResolvedValueOnce({
        id: 'pet-1',
        name: 'Buddy',
        status: 'ADOPTED',
        owner: {
          id: 'owner-1',
          name: 'Jane',
          email: 'jane@example.com'
        }
      });

      const { POST } = await import('../route.js');
      const adoptionData = {
        petId: 'pet-1',
        adopterInfo: {
          personalInfo: {
            fullName: 'John Doe',
            phone: '11999999999',
            address: 'Rua Test 123',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234567'
          },
          livingSituation: {
            housingType: 'apartment',
            hasYard: false,
            ownRent: 'rent',
            landlordApproval: true
          },
          experience: {
            hadPetsBefore: true,
            currentPets: []
          },
          motivation: {
            whyAdopt: 'I love animals and want to give a pet a good home',
            expectedCommitment: 'Lifelong commitment',
            availableTime: '8 hours per day'
          }
        }
      };

      const request = new NextResponse(
        JSON.stringify(adoptionData),
        { headers: { 'content-type': 'application/json' } }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe('PET_UNAVAILABLE');
    });

    it('should create adoption request with valid data', async () => {
      const adopterId = 'adopter-1';
      const petId = 'pet-1';

      getServerSession.mockResolvedValueOnce({
        user: {
          id: adopterId,
          type: 'ADOPTER',
          name: 'John',
          email: 'john@example.com'
        }
      });

      const petData = {
        id: petId,
        name: 'Buddy',
        species: 'DOG',
        breed: 'Golden Retriever',
        status: 'APPROVED',
        owner: {
          id: 'owner-1',
          name: 'Jane',
          email: 'jane@example.com'
        }
      };

      prisma.pet.findUnique.mockResolvedValueOnce(petData);
      prisma.adoption.findFirst.mockResolvedValueOnce(null); // No existing request

      const createdAdoption = {
        id: 'adoption-1',
        petId,
        adopterId,
        status: 'PENDING',
        message: null,
        adopterInfo: JSON.stringify({
          personalInfo: {
            fullName: 'John Doe',
            phone: '11999999999',
            address: 'Rua Test 123',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234567'
          },
          livingSituation: {
            housingType: 'apartment',
            hasYard: false,
            ownRent: 'rent',
            landlordApproval: true
          },
          experience: {
            hadPetsBefore: true,
            currentPets: []
          },
          motivation: {
            whyAdopt: 'I love animals and want to give a pet a good home',
            expectedCommitment: 'Lifelong commitment',
            availableTime: '8 hours per day'
          }
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
        pet: petData,
        adopter: {
          id: adopterId,
          name: 'John',
          email: 'john@example.com'
        }
      };

      prisma.adoption.create.mockResolvedValueOnce(createdAdoption);
      prisma.pet.update.mockResolvedValueOnce({ ...petData, status: 'PENDING' });
      sendAdoptionRequestEmail.mockResolvedValueOnce({ messageId: 'test' });

      const { POST } = await import('../route.js');
      const adoptionData = {
        petId,
        adopterInfo: {
          personalInfo: {
            fullName: 'John Doe',
            phone: '11999999999',
            address: 'Rua Test 123',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234567'
          },
          livingSituation: {
            housingType: 'apartment',
            hasYard: false,
            ownRent: 'rent',
            landlordApproval: true
          },
          experience: {
            hadPetsBefore: true,
            currentPets: []
          },
          motivation: {
            whyAdopt: 'I love animals and want to give a pet a good home',
            expectedCommitment: 'Lifelong commitment',
            availableTime: '8 hours per day'
          }
        }
      };

      const request = new NextResponse(
        JSON.stringify(adoptionData),
        { headers: { 'content-type': 'application/json' } }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe('adoption-1');
      expect(data.status).toBe('PENDING');
      expect(sendAdoptionRequestEmail).toHaveBeenCalledWith(
        'jane@example.com',
        expect.objectContaining({
          petName: 'Buddy',
          adopterName: 'John'
        })
      );
    });

    it('should reject duplicate pending adoption requests for same pet', async () => {
      getServerSession.mockResolvedValueOnce({
        user: {
          id: 'adopter-1',
          type: 'ADOPTER',
          name: 'John',
          email: 'john@example.com'
        }
      });

      prisma.pet.findUnique.mockResolvedValueOnce({
        id: 'pet-1',
        name: 'Buddy',
        status: 'APPROVED',
        owner: {
          id: 'owner-1',
          name: 'Jane',
          email: 'jane@example.com'
        }
      });

      // Existing pending request
      prisma.adoption.findFirst.mockResolvedValueOnce({
        id: 'adoption-1',
        status: 'PENDING'
      });

      const { POST } = await import('../route.js');
      const adoptionData = {
        petId: 'pet-1',
        adopterInfo: {
          personalInfo: {
            fullName: 'John Doe',
            phone: '11999999999',
            address: 'Rua Test 123',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234567'
          },
          livingSituation: {
            housingType: 'apartment',
            hasYard: false,
            ownRent: 'rent',
            landlordApproval: true
          },
          experience: {
            hadPetsBefore: true,
            currentPets: []
          },
          motivation: {
            whyAdopt: 'I love animals and want to give a pet a good home',
            expectedCommitment: 'Lifelong commitment',
            availableTime: '8 hours per day'
          }
        }
      };

      const request = new NextResponse(
        JSON.stringify(adoptionData),
        { headers: { 'content-type': 'application/json' } }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.code).toBe('DUPLICATE_REQUEST');
    });
  });

  describe('PATCH /api/adoptions/[id]', () => {
    it('should require authentication', async () => {
      getServerSession.mockResolvedValueOnce(null);

      const { PATCH } = await import('../[id]/route.js');
      const request = new NextResponse(
        JSON.stringify({ status: 'APPROVED' }),
        { headers: { 'content-type': 'application/json' } }
      );

      const response = await PATCH(request, { params: { id: 'adoption-1' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.code).toBe('UNAUTHORIZED');
    });

    it('should return 404 if adoption not found', async () => {
      getServerSession.mockResolvedValueOnce({
        user: {
          id: 'user-1',
          type: 'INDIVIDUAL_OWNER',
          name: 'Jane',
          email: 'jane@example.com'
        }
      });

      prisma.adoption.findUnique.mockResolvedValueOnce(null);

      const { PATCH } = await import('../[id]/route.js');
      const request = new NextResponse(
        JSON.stringify({ status: 'APPROVED' }),
        { headers: { 'content-type': 'application/json' } }
      );

      const response = await PATCH(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.code).toBe('NOT_FOUND');
    });

    it('should only allow pet owner to approve adoption', async () => {
      const petOwnerId = 'owner-1';
      const currentUserId = 'other-user-1';

      getServerSession.mockResolvedValueOnce({
        user: {
          id: currentUserId,
          type: 'ADOPTER',
          name: 'Someone',
          email: 'someone@example.com'
        }
      });

      prisma.adoption.findUnique.mockResolvedValueOnce({
        id: 'adoption-1',
        status: 'PENDING',
        petId: 'pet-1',
        adopterId: 'adopter-1',
        pet: {
          id: 'pet-1',
          name: 'Buddy',
          status: 'PENDING',
          ownerId: petOwnerId,
          owner: {
            id: petOwnerId,
            name: 'Jane',
            email: 'jane@example.com'
          }
        },
        adopter: {
          id: 'adopter-1',
          name: 'John',
          email: 'john@example.com'
        }
      });

      const { PATCH } = await import('../[id]/route.js');
      const request = new NextResponse(
        JSON.stringify({ status: 'APPROVED' }),
        { headers: { 'content-type': 'application/json' } }
      );

      const response = await PATCH(request, { params: { id: 'adoption-1' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.code).toBe('FORBIDDEN');
    });

    it('should update adoption status to APPROVED and change pet status to PENDING', async () => {
      const petOwnerId = 'owner-1';

      getServerSession.mockResolvedValueOnce({
        user: {
          id: petOwnerId,
          type: 'INDIVIDUAL_OWNER',
          name: 'Jane',
          email: 'jane@example.com'
        }
      });

      prisma.adoption.findUnique.mockResolvedValueOnce({
        id: 'adoption-1',
        status: 'PENDING',
        petId: 'pet-1',
        adopterId: 'adopter-1',
        adopterInfo: JSON.stringify({}),
        pet: {
          id: 'pet-1',
          name: 'Buddy',
          status: 'PENDING',
          ownerId: petOwnerId,
          owner: {
            id: petOwnerId,
            name: 'Jane',
            email: 'jane@example.com'
          }
        },
        adopter: {
          id: 'adopter-1',
          name: 'John',
          email: 'john@example.com'
        }
      });

      const updatedAdoption = {
        id: 'adoption-1',
        status: 'APPROVED',
        petId: 'pet-1',
        adopterId: 'adopter-1',
        adopterInfo: JSON.stringify({}),
        approvedAt: new Date(),
        rejectionReason: null,
        pet: {
          id: 'pet-1',
          name: 'Buddy',
          images: JSON.stringify([]),
          owner: {
            id: petOwnerId,
            name: 'Jane',
            email: 'jane@example.com'
          }
        },
        adopter: {
          id: 'adopter-1',
          name: 'John',
          email: 'john@example.com'
        }
      };

      prisma.adoption.update.mockResolvedValueOnce(updatedAdoption);
      prisma.pet.update.mockResolvedValueOnce({
        id: 'pet-1',
        status: 'PENDING'
      });
      sendAdoptionStatusEmail.mockResolvedValueOnce({ messageId: 'test' });

      const { PATCH } = await import('../[id]/route.js');
      const request = new NextResponse(
        JSON.stringify({ status: 'APPROVED' }),
        { headers: { 'content-type': 'application/json' } }
      );

      const response = await PATCH(request, { params: { id: 'adoption-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('APPROVED');
      expect(prisma.pet.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'pet-1' },
          data: { status: 'PENDING' }
        })
      );
    });

    it('should update adoption status to REJECTED and change pet status to AVAILABLE', async () => {
      const petOwnerId = 'owner-1';

      getServerSession.mockResolvedValueOnce({
        user: {
          id: petOwnerId,
          type: 'INDIVIDUAL_OWNER',
          name: 'Jane',
          email: 'jane@example.com'
        }
      });

      prisma.adoption.findUnique.mockResolvedValueOnce({
        id: 'adoption-1',
        status: 'PENDING',
        petId: 'pet-1',
        adopterId: 'adopter-1',
        adopterInfo: JSON.stringify({}),
        pet: {
          id: 'pet-1',
          name: 'Buddy',
          status: 'PENDING',
          ownerId: petOwnerId,
          owner: {
            id: petOwnerId,
            name: 'Jane',
            email: 'jane@example.com'
          }
        },
        adopter: {
          id: 'adopter-1',
          name: 'John',
          email: 'john@example.com'
        }
      });

      const updatedAdoption = {
        id: 'adoption-1',
        status: 'REJECTED',
        petId: 'pet-1',
        adopterId: 'adopter-1',
        adopterInfo: JSON.stringify({}),
        rejectionReason: 'Not a suitable match',
        pet: {
          id: 'pet-1',
          name: 'Buddy',
          images: JSON.stringify([]),
          owner: {
            id: petOwnerId,
            name: 'Jane',
            email: 'jane@example.com'
          }
        },
        adopter: {
          id: 'adopter-1',
          name: 'John',
          email: 'john@example.com'
        }
      };

      prisma.adoption.update.mockResolvedValueOnce(updatedAdoption);
      prisma.pet.update.mockResolvedValueOnce({
        id: 'pet-1',
        status: 'APPROVED'
      });
      sendAdoptionStatusEmail.mockResolvedValueOnce({ messageId: 'test' });

      const { PATCH } = await import('../[id]/route.js');
      const request = new NextResponse(
        JSON.stringify({ status: 'REJECTED', rejectionReason: 'Not a suitable match' }),
        { headers: { 'content-type': 'application/json' } }
      );

      const response = await PATCH(request, { params: { id: 'adoption-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('REJECTED');
      expect(data.rejectionReason).toBe('Not a suitable match');
      expect(prisma.pet.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'pet-1' },
          data: { status: 'APPROVED' }
        })
      );
    });

    it('should update adoption status to COMPLETED and change pet status to ADOPTED', async () => {
      const petOwnerId = 'owner-1';

      getServerSession.mockResolvedValueOnce({
        user: {
          id: petOwnerId,
          type: 'INDIVIDUAL_OWNER',
          name: 'Jane',
          email: 'jane@example.com'
        }
      });

      prisma.adoption.findUnique.mockResolvedValueOnce({
        id: 'adoption-1',
        status: 'APPROVED',
        petId: 'pet-1',
        adopterId: 'adopter-1',
        adopterInfo: JSON.stringify({}),
        pet: {
          id: 'pet-1',
          name: 'Buddy',
          status: 'PENDING',
          ownerId: petOwnerId,
          owner: {
            id: petOwnerId,
            name: 'Jane',
            email: 'jane@example.com'
          }
        },
        adopter: {
          id: 'adopter-1',
          name: 'John',
          email: 'john@example.com'
        }
      });

      const updatedAdoption = {
        id: 'adoption-1',
        status: 'COMPLETED',
        petId: 'pet-1',
        adopterId: 'adopter-1',
        adopterInfo: JSON.stringify({}),
        completedAt: new Date(),
        pet: {
          id: 'pet-1',
          name: 'Buddy',
          images: JSON.stringify([]),
          owner: {
            id: petOwnerId,
            name: 'Jane',
            email: 'jane@example.com'
          }
        },
        adopter: {
          id: 'adopter-1',
          name: 'John',
          email: 'john@example.com'
        }
      };

      prisma.adoption.update.mockResolvedValueOnce(updatedAdoption);
      prisma.pet.update.mockResolvedValueOnce({
        id: 'pet-1',
        status: 'ADOPTED'
      });

      const { PATCH } = await import('../[id]/route.js');
      const request = new NextResponse(
        JSON.stringify({ status: 'COMPLETED' }),
        { headers: { 'content-type': 'application/json' } }
      );

      const response = await PATCH(request, { params: { id: 'adoption-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('COMPLETED');
      expect(prisma.pet.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'pet-1' },
          data: { status: 'ADOPTED' }
        })
      );
    });
  });

  describe('GET /api/adoptions', () => {
    it('should return only adopter own adoptions for ADOPTER users', async () => {
      const adopterId = 'adopter-1';

      getServerSession.mockResolvedValueOnce({
        user: {
          id: adopterId,
          type: 'ADOPTER',
          name: 'John',
          email: 'john@example.com'
        }
      });

      const mockAdoptions = [
        {
          id: 'adoption-1',
          status: 'PENDING',
          adopterId,
          petId: 'pet-1',
          adopterInfo: JSON.stringify({}),
          pet: {
            id: 'pet-1',
            name: 'Buddy',
            images: JSON.stringify([]),
            owner: {
              id: 'owner-1',
              name: 'Jane',
              email: 'jane@example.com'
            }
          },
          adopter: {
            id: adopterId,
            name: 'John',
            email: 'john@example.com'
          }
        }
      ];

      prisma.adoption.count.mockResolvedValueOnce(1);
      prisma.adoption.findMany.mockResolvedValueOnce(mockAdoptions);

      const { GET } = await import('../route.js');
      const request = new NextResponse(null, {
        headers: { 'content-type': 'application/json' }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.adoptions).toHaveLength(1);
      expect(data.adoptions[0].adopterId).toBe(adopterId);
    });

    it('should return adoptions for pet owner adoptions', async () => {
      const ownerId = 'owner-1';

      getServerSession.mockResolvedValueOnce({
        user: {
          id: ownerId,
          type: 'INDIVIDUAL_OWNER',
          name: 'Jane',
          email: 'jane@example.com'
        }
      });

      const mockAdoptions = [
        {
          id: 'adoption-1',
          status: 'PENDING',
          adopterId: 'adopter-1',
          petId: 'pet-1',
          adopterInfo: JSON.stringify({}),
          pet: {
            id: 'pet-1',
            name: 'Buddy',
            images: JSON.stringify([]),
            ownerId,
            owner: {
              id: ownerId,
              name: 'Jane',
              email: 'jane@example.com'
            }
          },
          adopter: {
            id: 'adopter-1',
            name: 'John',
            email: 'john@example.com'
          }
        }
      ];

      prisma.adoption.count.mockResolvedValueOnce(1);
      prisma.adoption.findMany.mockResolvedValueOnce(mockAdoptions);

      const { GET } = await import('../route.js');
      const request = new NextResponse(null, {
        headers: { 'content-type': 'application/json' }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.adoptions).toHaveLength(1);
      expect(data.adoptions[0].pet.ownerId).toBe(ownerId);
    });
  });
});
