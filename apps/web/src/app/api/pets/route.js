import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { petSchema, filterSchema } from '@/lib/validation/schemas';

/**
 * GET /api/pets - List pets with filters and pagination
 * Requirements: 2.1, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate filter parameters
    const filterData = {
      species: searchParams.get('species'),
      size: searchParams.get('size'), 
      gender: searchParams.get('gender'),
      location: searchParams.get('location'),
      search: searchParams.get('search') || searchParams.get('q'),
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '12'
    };

    const validation = filterSchema.safeParse(filterData);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid filter parameters',
        code: 'VALIDATION_ERROR',
        details: validation.error.format(),
        timestamp: new Date().toISOString(),
        path: '/api/pets'
      }, { status: 400 });
    }

    const { species, size, gender, location, search, page, limit } = validation.data;
    const shelterId = searchParams.get('shelterId');
    const status = searchParams.get('status') || 'APPROVED';
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const whereClause = {};

    // Apply status filter - allow filtering by status or default to APPROVED
    if (status === 'ALL') {
      // Don't filter by status
    } else {
      whereClause.status = status || 'APPROVED';
    }

    // Filter by shelter if provided (Requirement 11.5)
    if (shelterId) {
      whereClause.shelterId = shelterId;
    }

    // Apply species filter (Requirement 4.2)
    if (species) {
      whereClause.species = species;
    }

    // Apply size filter (Requirement 4.3) 
    if (size) {
      whereClause.size = size;
    }

    // Apply gender filter (Requirement 4.5)
    if (gender) {
      whereClause.gender = gender;
    }

    // Apply location filter if provided
    if (location) {
      whereClause.location = {
        contains: location,
        mode: 'insensitive'
      };
    }

    // Apply text search (Requirement 4.6) - search in name and breed
    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          breed: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Execute query with pagination
    const [pets, totalCount] = await Promise.all([
      prisma.pet.findMany({
        where: whereClause,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          shelter: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.pet.count({
        where: whereClause
      })
    ]);

    // Transform pets data for response
    const transformedPets = pets.map(pet => ({
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age,
      size: pet.size,
      gender: pet.gender,
      color: pet.color,
      description: pet.description,
      isNeutered: pet.isNeutered,
      isVaccinated: pet.isVaccinated,
      healthStatus: pet.healthStatus,
      personality: Array.isArray(pet.personality) 
        ? pet.personality 
        : (pet.personality ? JSON.parse(pet.personality) : []),
      images: Array.isArray(pet.images) 
        ? pet.images 
        : (pet.images ? JSON.parse(pet.images) : []),
      status: pet.status,
      location: pet.location,
      createdAt: pet.createdAt,
      updatedAt: pet.updatedAt,
      owner: pet.owner,
      shelter: pet.shelter
    }));

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      pets: transformedPets,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        species,
        size,
        gender,
        location,
        search
      }
    });

  } catch (error) {
    console.error('GET /api/pets error:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch pets',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      path: '/api/pets'
    }, { status: 500 });
  }
}

/**
 * POST /api/pets - Create new pet
 * Requirements: 2.1, 2.2, 2.4
 * NOTE: Allows both authenticated and unauthenticated submissions
 * Unauthenticated submissions require tutor contact info (email, name, phone)
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const petData = await request.json();
    
    // Add detailed logging for debugging validation issues
    console.log('🐾 Pet creation request received');
    console.log('Raw petData keys:', Object.keys(petData));
    console.log('Raw petData:', JSON.stringify(petData, null, 2));
    
    // Extract tutor fields BEFORE validation (they are not part of petSchema)
    const tutorData = {
      tutorEmail: petData.tutorEmail || null,
      tutorName: petData.tutorName || null,
      tutorPhone: petData.tutorPhone || null
    };
    
    // Create petDataOnly with all fields EXCEPT tutor fields
    const petDataOnly = {};
    for (const [key, value] of Object.entries(petData)) {
      if (!['tutorEmail', 'tutorName', 'tutorPhone'].includes(key)) {
        petDataOnly[key] = value;
      }
    }
    
    console.log('petDataOnly keys:', Object.keys(petDataOnly));
    console.log('petDataOnly:', JSON.stringify(petDataOnly, null, 2));
    
    // Validate pet data ONLY (Requirements 2.2, 2.4)
    const validation = petSchema.safeParse(petDataOnly);
    
    if (!validation.success) {
      console.log('❌ VALIDATION FAILED!');
      console.log('Total validation issues:', validation.error.issues.length);
      
      // Detailed issue breakdown
      validation.error.issues.forEach((issue, idx) => {
        console.log(`\n📌 Issue #${idx + 1}:`);
        console.log(`   Path: ${issue.path.join('.') || '(root)'}`);
        console.log(`   Message: ${issue.message}`);
        console.log(`   Code: ${issue.code}`);
        console.log(`   Expected: ${issue.expected}`);
        console.log(`   Received: ${issue.received}`);
        console.log(`   Received type: ${typeof issue.received}`);
      });
      
      console.log('\n📊 Summary of failing fields:');
      const failingFields = validation.error.issues.map(i => i.path.join('.') || '(root)');
      console.log(`   ${failingFields.join(', ')}`);
      
      return NextResponse.json({
        error: 'Pet validation failed',
        code: 'VALIDATION_ERROR',
        details: validation.error.format(),
        issues: validation.error.issues.map(i => ({
          field: i.path.join('.') || 'root',
          message: i.message,
          code: i.code,
          expected: i.expected,
          received: i.received,
          receivedType: typeof i.received
        })),
        issueCount: validation.error.issues.length,
        failingFields: failingFields,
        timestamp: new Date().toISOString(),
        path: '/api/pets'
      }, { status: 400 });
    }
    
    console.log('✅ Validation passed!');

    const validatedData = validation.data;

    // For unauthenticated submissions, validate tutor contact info
    if (!session) {
      const requiredTutorFields = ['tutorEmail', 'tutorName', 'tutorPhone'];
      const missingFields = requiredTutorFields.filter(field => !tutorData[field]?.trim());
      
      if (missingFields.length > 0) {
        return NextResponse.json({
          error: 'Tutor contact information required for unauthenticated submissions',
          code: 'VALIDATION_ERROR',
          details: {
            missing: missingFields,
            message: 'Por favor, forneça seu nome, email e telefone'
          },
          timestamp: new Date().toISOString(),
          path: '/api/pets'
        }, { status: 400 });
      }
    }

    // For authenticated users, verify user type - only pet owners can create pets
    if (session && !['SHELTER_ADMIN', 'INDIVIDUAL_OWNER'].includes(session.user.type)) {
      return NextResponse.json({
        error: 'Only pet owners can create pet profiles',
        code: 'FORBIDDEN',
        timestamp: new Date().toISOString(),
        path: '/api/pets'
      }, { status: 403 });
    }

    // Determine ownerId first
    let ownerId;
    let shelterId;

    // Use extracted tutor info for audit purposes
    const tutorInfo = {
      tutorEmail: tutorData.tutorEmail || session?.user?.email || null,
      tutorName: tutorData.tutorName || session?.user?.name || null,
      tutorPhone: tutorData.tutorPhone || null
    };

    if (session) {
      ownerId = session.user.id;

      // Check if user is shelter admin and add shelter association
      if (session.user.type === 'SHELTER_ADMIN') {
        const shelter = await prisma.shelter.findUnique({
          where: { adminId: session.user.id }
        });
        
        if (shelter) {
          shelterId = shelter.id;
        }
      }
    } else {
      // For unauthenticated submissions, create/find a user based on tutor email
      let user = await prisma.user.findUnique({
        where: { email: tutorData.tutorEmail }
      });

      if (!user) {
        // Create new user for unauthenticated submission
        user = await prisma.user.create({
          data: {
            email: tutorData.tutorEmail,
            name: tutorData.tutorName,
            type: 'INDIVIDUAL_OWNER',
            password: null // No password for unauthenticated submissions
          }
        });
      }

      ownerId = user.id;
    }

    // Now prepare clean dbData with ONLY Pet model fields
    const dbData = {
      name: validatedData.name,
      species: validatedData.species,
      breed: validatedData.breed,
      age: validatedData.age,
      size: validatedData.size,
      gender: validatedData.gender,
      color: validatedData.color || null,
      description: validatedData.description,
      isNeutered: validatedData.isNeutered || false,
      isVaccinated: validatedData.isVaccinated || false,
      healthStatus: validatedData.healthStatus || null,
      personality: JSON.stringify(validatedData.personality || []),
      images: JSON.stringify(validatedData.images || []),
      status: 'APPROVED',
      location: validatedData.location || null,
      temperament: validatedData.temperament || null,
      compatibilityChildren: validatedData.compatibilityChildren || null,
      compatibilityAnimals: validatedData.compatibilityAnimals || null,
      microchip: validatedData.microchip || false,
      allergies: validatedData.allergies || null,
      adoptionReason: validatedData.adoptionReason || null,
      adoptionReasonDetails: validatedData.adoptionReasonDetails || null,
      acceptOutsideCity: validatedData.acceptOutsideCity || null,
      ownerId: ownerId,
      shelterId: shelterId || null
    };

    console.log('🔍 dbData keys:', Object.keys(dbData));
    console.log('🔍 About to create pet with dbData:', JSON.stringify(dbData, null, 2));
    
    const pet = await prisma.pet.create({
      data: dbData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        shelter: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true
          }
        }
      }
    });
    
    console.log('✅ Pet created successfully:', pet.id);

    // Log tutor info for unauthenticated submissions (for audit trail)
    if (!session) {
      console.log('📝 Unauthenticated pet submission:', {
        petId: pet.id,
        petName: pet.name,
        tutorEmail: tutorInfo.tutorEmail,
        tutorName: tutorInfo.tutorName,
        tutorPhone: tutorInfo.tutorPhone,
        timestamp: new Date().toISOString(),
        note: 'In production, this would trigger email verification'
      });
    }

    // Transform response data
    const transformedPet = {
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age,
      size: pet.size,
      gender: pet.gender,
      color: pet.color,
      description: pet.description,
      isNeutered: pet.isNeutered,
      isVaccinated: pet.isVaccinated,
      healthStatus: pet.healthStatus,
      personality: JSON.parse(pet.personality),
      images: JSON.parse(pet.images),
      status: pet.status,
      location: pet.location,
      createdAt: pet.createdAt,
      updatedAt: pet.updatedAt,
      owner: pet.owner,
      shelter: pet.shelter
    };

    // Trigger matching pet alerts asynchronously (Requirement 8.3)
    // Send a request to check if new pet matches any adopter preferences
    try {
      const matchingCheckUrl = `${process.env.APP_URL || 'http://localhost:3000'}/api/notifications/check-matching-pets`;
      const cronSecret = process.env.CRON_SECRET || 'development-secret';
      
      // Fire and forget - don't wait for response
      fetch(matchingCheckUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cronSecret}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          petId: pet.id
        })
      }).catch(error => {
        // Log error but don't fail pet creation
        console.error('[MATCHING] Failed to trigger matching check for new pet:', error.message);
      });
    } catch (error) {
      console.error('[MATCHING] Error triggering matching check:', error.message);
    }

    return NextResponse.json({
      message: 'Pet created successfully',
      pet: transformedPet
    }, { status: 201 });

  } catch (error) {
    console.error('❌ POST /api/pets ERROR');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    
    if (error.code === 'P2002') {
      return NextResponse.json({
        error: 'Pet with similar data already exists',
        code: 'CONFLICT',
        timestamp: new Date().toISOString(),
        path: '/api/pets'
      }, { status: 409 });
    }
    
    return NextResponse.json({
      error: 'Failed to create pet',
      code: 'INTERNAL_ERROR',
      details: error.message,
      errorCode: error.code,
      timestamp: new Date().toISOString(),
      path: '/api/pets'
    }, { status: 500 });
  }
}