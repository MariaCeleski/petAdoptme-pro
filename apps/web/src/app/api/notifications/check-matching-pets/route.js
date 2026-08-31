/**
 * POST /api/notifications/check-matching-pets
 * 
 * Check for new pets matching adopters' search preferences
 * and send matching pet alerts (Requirement 8.3)
 * 
 * This endpoint should be called periodically (e.g., via cron job)
 * or triggered when a new pet is added to the system
 * 
 * Requirements: 8.3, 10.6
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getAdoptersWithActivePreferences,
  findMatchingPets,
  wasNotificationSent,
  logNotification,
  calculateMatchScore
} from '@/lib/pet-matching';
import { sendPetMatchingEmail } from '@/lib/email';

/**
 * Check if request is authorized (from cron job or admin)
 */
function isAuthorized(request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'development-secret';
  
  // Allow from Next.js internal cron or with correct secret
  return (
    authHeader === `Bearer ${cronSecret}` ||
    request.headers.get('x-vercel-cron') === 'true'
  );
}

/**
 * Check a single pet against all adopter preferences and send matching alerts
 */
async function checkPetAgainstAdopters(pet) {
  try {
    const adoptersWithPreferences = await getAdoptersWithActivePreferences();
    let notificationsSent = 0;
    
    for (const adopterPref of adoptersWithPreferences) {
      // Skip if adopter unsubscribed from all notifications or pet matching alerts
      if (!adopterPref.user.emailPreference || 
          adopterPref.user.emailPreference.unsubscribedAll ||
          !adopterPref.user.emailPreference.petMatchingAlerts) {
        continue;
      }
      
      // Skip if notification already sent for this pet to this adopter
      const alreadySent = await wasNotificationSent(
        adopterPref.userId,
        pet.id,
        'pet_matching'
      );
      
      if (alreadySent) {
        continue;
      }
      
      // Calculate match score
      const matchScore = calculateMatchScore(pet, adopterPref);
      
      // Only send if match score is above 40% (Requirement 8.3)
      if (matchScore < 40) {
        continue;
      }
      
      // Send email to adopter
      try {
        const unsubscribeUrl = `${process.env.APP_URL}/api/notifications/unsubscribe?token=${adopterPref.user.emailPreference.unsubscribeToken}`;
        
        await sendPetMatchingEmail(adopterPref.user.email, {
          adopterName: adopterPref.user.name,
          petName: pet.name,
          petSpecies: pet.species,
          petBreed: pet.breed,
          petAge: pet.age,
          petImage: pet.images ? JSON.parse(pet.images)[0] : null,
          unsubscribeUrl
        });
        
        // Log successful notification
        await logNotification(
          adopterPref.userId,
          pet.id,
          'pet_matching',
          adopterPref.user.email,
          'sent'
        );
        
        notificationsSent++;
        console.log(`[MATCHING] Sent notification to ${adopterPref.user.email} for pet ${pet.name} (score: ${matchScore}%)`);
      } catch (emailError) {
        console.error(`[MATCHING] Failed to send email to ${adopterPref.user.email}:`, emailError.message);
        
        // Log failed notification
        await logNotification(
          adopterPref.userId,
          pet.id,
          'pet_matching',
          adopterPref.user.email,
          'failed'
        );
      }
    }
    
    return notificationsSent;
  } catch (error) {
    console.error('Error checking pet against adopters:', error);
    return 0;
  }
}

/**
 * POST - Check all recent AVAILABLE pets and send matching alerts
 */
export async function POST(request) {
  try {
    // Check authorization
    if (!isAuthorized(request)) {
      return NextResponse.json({
        error: 'Unauthorized',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }
    
    const { petId, sinceDays = 7 } = await request.json().catch(() => ({}));
    
    let petsToCheck = [];
    
    if (petId) {
      // Check specific pet
      const pet = await prisma.pet.findUnique({
        where: { id: petId },
        include: {
          owner: true
        }
      });
      
      if (pet && pet.status === 'APPROVED') {
        petsToCheck = [pet];
      }
    } else {
      // Check recent AVAILABLE pets (last N days)
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - sinceDays);
      
      petsToCheck = await prisma.pet.findMany({
        where: {
          status: 'APPROVED',
          createdAt: {
            gte: sinceDate
          }
        },
        include: {
          owner: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }
    
    console.log(`[MATCHING] Checking ${petsToCheck.length} pets for matching alerts`);
    
    let totalNotificationsSent = 0;
    const results = [];
    
    // Check each pet against all adopters
    for (const pet of petsToCheck) {
      const notificationsSent = await checkPetAgainstAdopters(pet);
      totalNotificationsSent += notificationsSent;
      
      results.push({
        petId: pet.id,
        petName: pet.name,
        notificationsSent
      });
    }
    
    console.log(`[MATCHING] Total notifications sent: ${totalNotificationsSent}`);
    
    return NextResponse.json({
      success: true,
      petsChecked: petsToCheck.length,
      totalNotificationsSent,
      results
    });
  } catch (error) {
    console.error('Error in check-matching-pets:', error);
    return NextResponse.json({
      error: 'Failed to check matching pets',
      code: 'CHECK_ERROR',
      message: error.message
    }, { status: 500 });
  }
}

/**
 * GET - Health check endpoint
 */
export async function GET(request) {
  return NextResponse.json({
    status: 'ok',
    message: 'Pet matching endpoint ready',
    usage: {
      method: 'POST',
      requires_auth: 'Bearer token or cron secret',
      params: {
        petId: 'Optional - check specific pet',
        sinceDays: 'Optional - check pets created in last N days (default: 7)'
      }
    }
  });
}
