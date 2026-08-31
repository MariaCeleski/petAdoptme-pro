import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import pkg from 'pg';

const { Client } = pkg;

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create users
    const hashedPassword = await bcrypt.hash('password123', 12);

    const adopter = await prisma.user.upsert({
      where: { email: 'maria.adotante@example.com' },
      update: {},
      create: {
        email: 'maria.adotante@example.com',
        name: 'Maria Santos',
        password: hashedPassword,
        type: 'ADOPTER',
        emailVerified: new Date(),
      },
    });

    const individualOwner = await prisma.user.upsert({
      where: { email: 'joao.dono@example.com' },
      update: {},
      create: {
        email: 'joao.dono@example.com',
        name: 'João Silva',
        password: hashedPassword,
        type: 'INDIVIDUAL_OWNER',
        emailVerified: new Date(),
      },
    });

    const shelterAdmin = await prisma.user.upsert({
      where: { email: 'admin@abrigo.com' },
      update: {},
      create: {
        email: 'admin@abrigo.com',
        name: 'Ana Oliveira',
        password: hashedPassword,
        type: 'SHELTER_ADMIN',
        emailVerified: new Date(),
      },
    });

    console.log('✅ Created users:', {
      adopter: adopter.email,
      owner: individualOwner.email,
      admin: shelterAdmin.email
    });

    // Create shelter
    const shelter = await prisma.shelter.upsert({
      where: { adminId: shelterAdmin.id },
      update: {},
      create: {
        name: 'Abrigo Patinhas Carinhosas',
        address: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
        phone: '(11) 99999-9999',
        email: 'contato@abrigo.com',
        website: 'https://abrigo.com',
        description: 'Abrigo dedicado ao resgate e cuidado de animais abandonados.',
        images: JSON.stringify([]),
        isVerified: true,
        adminId: shelterAdmin.id,
      },
    });

    console.log('✅ Created shelter:', shelter.name);

    // Create sample pets
    const pets = [
      {
        name: 'Rex',
        species: 'DOG',
        breed: 'Golden Retriever',
        age: '3 anos',
        size: 'LARGE',
        gender: 'MALE',
        color: 'Dourado',
        description: 'Rex é um cão carinhoso e brincalhão, adora crianças e outros animais.',
        isNeutered: true,
        isVaccinated: true,
        healthStatus: 'Excelente estado de saúde, vermifugado recentemente.',
        personality: JSON.stringify(['Brincalhão', 'Carinhoso', 'Obediente', 'Sociável']),
        images: JSON.stringify([
          'https://picsum.photos/400/300?random=1',
          'https://picsum.photos/400/300?random=2'
        ]),
        location: 'São Paulo, SP',
        status: 'APPROVED',
        ownerId: individualOwner.id,
      },
      {
        name: 'Luna',
        species: 'CAT',
        breed: 'Siamês',
        age: '2 anos',
        size: 'SMALL',
        gender: 'FEMALE',
        color: 'Branco e Marrom',
        description: 'Luna é uma gata elegante e independente, muito carinhosa com seus donos.',
        isNeutered: true,
        isVaccinated: true,
        healthStatus: 'Saudável, sem problemas conhecidos.',
        personality: JSON.stringify(['Independente', 'Carinhosa', 'Elegante', 'Calma']),
        images: JSON.stringify([
          'https://picsum.photos/400/300?random=3'
        ]),
        location: 'São Paulo, SP',
        status: 'APPROVED',
        ownerId: shelterAdmin.id,
        shelterId: shelter.id,
      },
      {
        name: 'Bolt',
        species: 'DOG',
        breed: 'Border Collie',
        age: '5 anos',
        size: 'MEDIUM',
        gender: 'MALE',
        color: 'Preto e Branco',
        description: 'Bolt é muito inteligente e ativo, precisa de bastante exercício.',
        isNeutered: false,
        isVaccinated: true,
        healthStatus: 'Saudável, precisa castrar.',
        personality: JSON.stringify(['Inteligente', 'Ativo', 'Leal', 'Protetor']),
        images: JSON.stringify([
          'https://picsum.photos/400/300?random=4',
          'https://picsum.photos/400/300?random=5',
          'https://picsum.photos/400/300?random=6'
        ]),
        location: 'São Paulo, SP',
        status: 'APPROVED',
        ownerId: shelterAdmin.id,
        shelterId: shelter.id,
      },
      {
        name: 'Mimi',
        species: 'CAT',
        breed: 'Persa',
        age: '4 anos',
        size: 'SMALL',
        gender: 'FEMALE',
        color: 'Branco',
        description: 'Mimi é uma gata muito dócil e caseira, adora carinho.',
        isNeutered: true,
        isVaccinated: true,
        healthStatus: 'Necessita cuidados especiais com pelos longos.',
        personality: JSON.stringify(['Dócil', 'Caseira', 'Carinhosa', 'Tranquila']),
        images: JSON.stringify([
          'https://picsum.photos/400/300?random=7'
        ]),
        location: 'São Paulo, SP',
        status: 'APPROVED',
        ownerId: individualOwner.id,
      },
    ];

    const createdPets = [];
    for (const petData of pets) {
      const existingPet = await prisma.pet.findFirst({
        where: {
          name: petData.name,
          ownerId: petData.ownerId
        }
      });
      
      let pet;
      if (existingPet) {
        pet = await prisma.pet.update({
          where: { id: existingPet.id },
          data: petData
        });
      } else {
        pet = await prisma.pet.create({
          data: petData
        });
      }
      createdPets.push(pet);
    }

    console.log('✅ Created pets:', createdPets.length);

    // Create sample adoption request
    await prisma.adoption.create({
      data: {
        petId: createdPets[3].id,
        adopterId: adopter.id,
        adopterInfo: JSON.stringify({
          personalInfo: {
            fullName: 'Maria Santos',
            phone: '(11) 88888-8888',
            address: 'Rua das Palmeiras, 456',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234567',
          },
          livingSituation: {
            housingType: 'apartment',
            hasYard: false,
            ownRent: 'rent',
            landlordApproval: true,
          },
          experience: {
            hadPetsBefore: true,
            currentPets: [
              {
                species: 'cat',
                breed: 'SRD',
                age: '6 anos',
              },
            ],
            veterinarianInfo: 'Dr. Carlos - Clínica VetCare',
          },
          motivation: {
            whyAdopt: 'Quero dar um lar amoroso para um animal que precisa',
            expectedCommitment: '15+ anos de cuidado e amor',
            availableTime: '4-6 horas diárias para interação',
          },
        }),
        message: 'Gostaria muito de adotar a Mimi. Tenho experiência com gatos e posso oferecer muito carinho.',
      },
    });

    console.log('✅ Created adoption request');

    console.log('\n✅ Database seeded successfully!');
    console.log(`   Users: 3`);
    console.log(`   Shelters: 1`);
    console.log(`   Pets: ${createdPets.length}`);
    console.log(`   Adoption Requests: 1`);
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
