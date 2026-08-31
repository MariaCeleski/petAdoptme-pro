/**
 * Adoption Types - Tipos relacionados a adoções
 */

/**
 * @typedef {'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED'} AdoptionStatus
 */

/**
 * @typedef {Object} AdoptionRequest
 * @property {string} id - Adoption ID (CUID)
 * @property {string} petId - Pet ID
 * @property {string} adopterId - Adopter user ID
 * @property {AdoptionStatus} status - Current status
 * @property {Object} adopterInfo - Adopter information (JSON)
 * @property {string} [message] - Adopter message/motivation
 * @property {string} [rejectionReason] - Reason for rejection
 * @property {Date} createdAt - Request creation date
 * @property {Date} updatedAt - Last update date
 * @property {Date} [approvedAt] - Approval date
 * @property {Date} [completedAt] - Completion date
 */

/**
 * @typedef {Object} AdopterInfo
 * @property {Object} personalInfo - Personal information
 * @property {string} personalInfo.fullName - Full name
 * @property {string} personalInfo.phone - Phone number
 * @property {string} personalInfo.address - Address
 * @property {string} personalInfo.city - City
 * @property {string} personalInfo.state - State
 * @property {string} personalInfo.zipCode - ZIP code
 * @property {Object} livingSituation - Living situation
 * @property {'apartment' | 'house' | 'farm' | 'other'} livingSituation.housingType - Housing type
 * @property {boolean} livingSituation.hasYard - Has yard
 * @property {'own' | 'rent'} livingSituation.ownRent - Own or rent
 * @property {boolean} [livingSituation.landlordApproval] - Landlord approval (if renting)
 * @property {Object} experience - Pet experience
 * @property {boolean} experience.hadPetsBefore - Had pets before
 * @property {Object[]} experience.currentPets - Current pets
 * @property {string} [experience.veterinarianInfo] - Veterinarian info
 * @property {Object} motivation - Motivation
 * @property {string} motivation.whyAdopt - Why adopt
 * @property {string} motivation.expectedCommitment - Expected commitment
 * @property {string} motivation.availableTime - Available time
 */

/**
 * @typedef {Object} AdoptionTimeline
 * @property {string} id - Adoption ID
 * @property {string} petName - Pet name
 * @property {AdoptionStatus} status - Current status
 * @property {string} adopterName - Adopter name
 * @property {Date} createdAt - Request date
 * @property {Date} [approvedAt] - Approval date
 * @property {Date} [completedAt] - Completion date
 */

export const AdoptionTypes = {
  Status: {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  },
};
