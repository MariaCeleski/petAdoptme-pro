/**
 * Pet Matching Algorithm
 * 
 * Matches pets with adopter preferences based on:
 * - Species preference
 * - Size preference
 * - Age range
 * - Gender preference
 * - Personality traits
 * - Location
 * 
 * Requirements: 8.3, 10.2, 10.3
 */

import { prisma } from './prisma';

/**
 * Check if a pet matches an adopter's search preferences
 * Returns a match score (0-100) to indicate quality of match
 * 
 * @param {Pet} pet - The pet object
 * @param {AdopterSearchPreference} preferences - The adopter's search preferences
 * @returns {number} Match score (0-100), where 0 = no match, 100 = perfect match
 */
export function calculateMatchScore(pet, preferences) {
  if (!preferences) return 0;
  
  let score = 0;
  let maxScore = 0;
  
  // Species match (20 points)
  if (preferences.species) {
    maxScore += 20;
    if (pet.species === preferences.species) {
      score += 20;
    }
  } else {
    // No species preference = match any
    score += 20;
    maxScore += 20;
  }
  
  // Size match (20 points)
  if (preferences.sizePreferences && preferences.sizePreferences.length > 0) {
    maxScore += 20;
    try {
      const sizes = JSON.parse(preferences.sizePreferences);
      if (Array.isArray(sizes) && sizes.includes(pet.size)) {
        score += 20;
      }
    } catch (e) {
      console.error('Error parsing size preferences:', e);
    }
  } else {
    // No size preference = match any
    score += 20;
    maxScore += 20;
  }
  
  // Age match (20 points)
  if (preferences.minAge || preferences.maxAge) {
    maxScore += 20;
    try {
      const petAge = parseInt(pet.age) || 0;
      const minAge = preferences.minAge ? parseInt(preferences.minAge) : 0;
      const maxAge = preferences.maxAge ? parseInt(preferences.maxAge) : 100;
      
      if (petAge >= minAge && petAge <= maxAge) {
        score += 20;
      }
    } catch (e) {
      console.error('Error parsing age preferences:', e);
    }
  } else {
    // No age preference = match any
    score += 20;
    maxScore += 20;
  }
  
  // Gender match (15 points)
  if (preferences.genderPreference) {
    maxScore += 15;
    if (pet.gender === preferences.genderPreference) {
      score += 15;
    }
  } else {
    // No gender preference = match any
    score += 15;
    maxScore += 15;
  }
  
  // Personality traits match (15 points)
  if (preferences.personalityTraits) {
    maxScore += 15;
    try {
      const prefTraits = JSON.parse(preferences.personalityTraits);
      const petTraits = JSON.parse(pet.personality || '[]');
      
      if (Array.isArray(prefTraits) && Array.isArray(petTraits)) {
        // Calculate overlap
        const overlap = prefTraits.filter(trait => petTraits.includes(trait)).length;
        if (prefTraits.length > 0) {
          const matchPercentage = (overlap / prefTraits.length) * 100;
          score += (15 * matchPercentage) / 100;
        }
      }
    } catch (e) {
      console.error('Error parsing personality traits:', e);
    }
  } else {
    // No personality preference = match any
    score += 15;
    maxScore += 15;
  }
  
  // Location match (10 points) - not critical
  if (preferences.location && pet.location) {
    maxScore += 10;
    // Simple location match - could be enhanced with geolocation
    if (pet.location.toLowerCase().includes(preferences.location.toLowerCase())) {
      score += 10;
    }
  } else {
    // No location preference or no pet location = neutral
    maxScore += 10;
    score += 5; // Slight bonus for flexibility
  }
  
  // Normalize to 0-100 scale
  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

/**
 * Find pets that match an adopter's search preferences
 * Only returns AVAILABLE pets
 * 
 * @param {string} adopterId - The adopter's user ID
 * @returns {Promise<Array>} Array of matching pets with match scores
 */
export async function findMatchingPets(adopterId) {
  try {
    // Get adopter's search preferences
    const preferences = await prisma.adopterSearchPreference.findUnique({
      where: { userId: adopterId }
    });
    
    if (!preferences || !preferences.isActive) {
      return [];
    }
    
    // Fetch all available pets
    const availablePets = await prisma.pet.findMany({
      where: {
        status: 'APPROVED'
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    // Calculate match scores
    const matchedPets = availablePets
      .map(pet => ({
        ...pet,
        personality: pet.personality ? JSON.parse(pet.personality) : [],
        images: pet.images ? JSON.parse(pet.images) : [],
        matchScore: calculateMatchScore(pet, preferences)
      }))
      .filter(pet => pet.matchScore > 0) // Only include matches
      .sort((a, b) => b.matchScore - a.matchScore); // Sort by match score descending
    
    return matchedPets;
  } catch (error) {
    console.error('Error finding matching pets:', error);
    return [];
  }
}

/**
 * Check if a notification was already sent for this adopter-pet combination
 * 
 * @param {string} userId - Adopter ID
 * @param {string} petId - Pet ID
 * @param {string} notificationType - Type of notification ('pet_matching', etc.)
 * @returns {Promise<boolean>} True if notification was already sent
 */
export async function wasNotificationSent(userId, petId, notificationType = 'pet_matching') {
  try {
    const notification = await prisma.notificationLog.findUnique({
      where: {
        userId_petId_notificationType: {
          userId,
          petId,
          notificationType
        }
      }
    });
    
    return !!notification;
  } catch (error) {
    console.error('Error checking notification log:', error);
    return false;
  }
}

/**
 * Log a notification send attempt
 * 
 * @param {string} userId - Adopter ID
 * @param {string} petId - Pet ID
 * @param {string} notificationType - Type of notification
 * @param {string} email - Email address where notification was sent
 * @param {string} deliveryStatus - Status of delivery (sent, failed, bounced)
 * @returns {Promise<void>}
 */
export async function logNotification(userId, petId, notificationType, email, deliveryStatus = 'sent') {
  try {
    await prisma.notificationLog.upsert({
      where: {
        userId_petId_notificationType: {
          userId,
          petId,
          notificationType
        }
      },
      create: {
        userId,
        petId,
        notificationType,
        email,
        deliveryStatus
      },
      update: {
        sentAt: new Date(),
        deliveryStatus,
        email
      }
    });
  } catch (error) {
    console.error('Error logging notification:', error);
  }
}

/**
 * Get all adopters with active search preferences
 * 
 * @returns {Promise<Array>} Array of adopters with preferences
 */
export async function getAdoptersWithActivePreferences() {
  try {
    return await prisma.adopterSearchPreference.findMany({
      where: {
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            emailPreference: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching adopters with preferences:', error);
    return [];
  }
}

/**
 * Save adopter's search preferences
 * Used to track preferences for automated pet matching alerts
 * Requirements: 10.6
 * 
 * @param {string} userId - Adopter ID
 * @param {object} preferences - Search preference data
 * @returns {Promise<object>} Saved preference object
 */
export async function saveAdopterSearchPreferences(userId, preferences) {
  try {
    const {
      species,
      sizePreferences,
      minAge,
      maxAge,
      genderPreference,
      personalityTraits,
      location,
      searchRadius,
      isActive = true
    } = preferences;
    
    const savedPreference = await prisma.adopterSearchPreference.upsert({
      where: { userId },
      create: {
        userId,
        species: species || null,
        sizePreferences: sizePreferences ? JSON.stringify(sizePreferences) : JSON.stringify([]),
        minAge: minAge || null,
        maxAge: maxAge || null,
        genderPreference: genderPreference || null,
        personalityTraits: personalityTraits ? JSON.stringify(personalityTraits) : null,
        location: location || null,
        searchRadius: searchRadius || null,
        isActive
      },
      update: {
        species: species || null,
        sizePreferences: sizePreferences ? JSON.stringify(sizePreferences) : JSON.stringify([]),
        minAge: minAge || null,
        maxAge: maxAge || null,
        genderPreference: genderPreference || null,
        personalityTraits: personalityTraits ? JSON.stringify(personalityTraits) : null,
        location: location || null,
        searchRadius: searchRadius || null,
        isActive,
        updatedAt: new Date()
      }
    });
    
    return savedPreference;
  } catch (error) {
    console.error('Error saving adopter search preferences:', error);
    throw error;
  }
}
