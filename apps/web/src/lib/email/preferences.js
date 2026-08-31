/**
 * Email Preferences Service
 * 
 * Manages user email preferences and unsubscribe tokens
 * Requirements: 8.4, 8.5
 */

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * Notification types supported
 */
export const NOTIFICATION_TYPES = {
  ADOPTION_REQUEST: 'adoptionNotifications',
  STATUS_CHANGE: 'statusChangeNotifications',
  PET_MATCHING: 'petMatchingAlerts',
  NEWSLETTER: 'newsletter'
};

/**
 * Generate a unique, secure unsubscribe token
 */
export function generateUnsubscribeToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Get or create email preferences for a user
 */
export async function getOrCreateEmailPreferences(userId) {
  let preferences = await prisma.emailPreference.findUnique({
    where: { userId }
  });
  
  if (!preferences) {
    preferences = await prisma.emailPreference.create({
      data: {
        userId,
        unsubscribeToken: generateUnsubscribeToken()
      }
    });
  }
  
  return preferences;
}

/**
 * Check if user wants to receive a specific notification type
 * 
 * Requirements: 8.4 (email template customization support)
 * 
 * @param {string} userId - User ID
 * @param {string} notificationType - Type from NOTIFICATION_TYPES
 * @returns {boolean} Whether the user wants this notification
 */
export async function shouldSendNotification(userId, notificationType) {
  try {
    const preferences = await getOrCreateEmailPreferences(userId);
    
    // If user has unsubscribed from all, don't send anything
    if (preferences.unsubscribedAll) {
      return false;
    }
    
    // Check specific notification type preference
    const fieldName = NOTIFICATION_TYPES[notificationType];
    if (!fieldName) {
      console.warn(`Unknown notification type: ${notificationType}`);
      return true; // Default to sending if type is unknown
    }
    
    return preferences[fieldName];
  } catch (error) {
    console.error(`Error checking email preferences for user ${userId}:`, error);
    // Default to sending email if there's an error
    return true;
  }
}

/**
 * Update a specific notification preference
 * 
 * Requirements: 8.4 (support email template customization)
 * 
 * @param {string} userId - User ID
 * @param {string} notificationType - Type from NOTIFICATION_TYPES
 * @param {boolean} enabled - Whether to enable this notification
 * @returns {object} Updated preferences
 */
export async function updateNotificationPreference(userId, notificationType, enabled) {
  const fieldName = NOTIFICATION_TYPES[notificationType];
  
  if (!fieldName) {
    throw new Error(`Unknown notification type: ${notificationType}`);
  }
  
  const preferences = await getOrCreateEmailPreferences(userId);
  
  const updated = await prisma.emailPreference.update({
    where: { userId },
    data: {
      [fieldName]: enabled,
      updatedAt: new Date()
    }
  });
  
  return updated;
}

/**
 * Update all notification preferences at once
 * 
 * Requirements: 8.4
 * 
 * @param {string} userId - User ID
 * @param {object} preferences - Object with notification type keys
 * @returns {object} Updated preferences
 */
export async function updateAllNotificationPreferences(userId, preferences) {
  // Validate that all keys are valid notification types
  const updateData = {};
  
  for (const [key, value] of Object.entries(preferences)) {
    if (!Object.values(NOTIFICATION_TYPES).includes(key)) {
      throw new Error(`Unknown notification type: ${key}`);
    }
    updateData[key] = Boolean(value);
  }
  
  // Ensure we have an existing preference record
  await getOrCreateEmailPreferences(userId);
  
  const updated = await prisma.emailPreference.update({
    where: { userId },
    data: {
      ...updateData,
      updatedAt: new Date()
    }
  });
  
  return updated;
}

/**
 * Unsubscribe from all emails using unsubscribe token
 * One-click unsubscribe functionality
 * 
 * Requirements: 8.5 (include unsubscribe option in all emails)
 * 
 * @param {string} token - Unsubscribe token
 * @returns {object} Updated preferences
 */
export async function unsubscribeFromAll(token) {
  const preferences = await prisma.emailPreference.findUnique({
    where: { unsubscribeToken: token }
  });
  
  if (!preferences) {
    throw new Error('Invalid or expired unsubscribe token');
  }
  
  const updated = await prisma.emailPreference.update({
    where: { unsubscribeToken: token },
    data: {
      unsubscribedAll: true,
      adoptionNotifications: false,
      statusChangeNotifications: false,
      petMatchingAlerts: false,
      newsletter: false,
      updatedAt: new Date()
    }
  });
  
  return updated;
}

/**
 * Resubscribe to emails after unsubscribing from all
 * 
 * Requirements: 8.4
 * 
 * @param {string} userId - User ID
 * @param {object} preferences - Object with notification preferences to enable
 * @returns {object} Updated preferences
 */
export async function resubscribe(userId, preferences = {}) {
  const updateData = {
    unsubscribedAll: false,
    updatedAt: new Date()
  };
  
  // If specific preferences are provided, enable only those
  if (Object.keys(preferences).length > 0) {
    for (const [key, value] of Object.entries(preferences)) {
      if (!Object.values(NOTIFICATION_TYPES).includes(key)) {
        throw new Error(`Unknown notification type: ${key}`);
      }
      updateData[key] = Boolean(value);
    }
  } else {
    // Default: enable all notifications
    Object.values(NOTIFICATION_TYPES).forEach(fieldName => {
      updateData[fieldName] = true;
    });
  }
  
  await getOrCreateEmailPreferences(userId);
  
  const updated = await prisma.emailPreference.update({
    where: { userId },
    data: updateData
  });
  
  return updated;
}

/**
 * Get user's current email preferences
 * 
 * Requirements: 8.4
 * 
 * @param {string} userId - User ID
 * @returns {object} User's email preferences
 */
export async function getEmailPreferences(userId) {
  const preferences = await getOrCreateEmailPreferences(userId);
  
  return {
    adoptionNotifications: preferences.adoptionNotifications,
    statusChangeNotifications: preferences.statusChangeNotifications,
    petMatchingAlerts: preferences.petMatchingAlerts,
    newsletter: preferences.newsletter,
    unsubscribedAll: preferences.unsubscribedAll,
    unsubscribeToken: preferences.unsubscribeToken,
    updatedAt: preferences.updatedAt
  };
}

/**
 * Generate unsubscribe URL for email templates
 * 
 * Requirements: 8.5 (include unsubscribe option in all emails)
 * 
 * @param {string} token - Unsubscribe token
 * @returns {string} Full unsubscribe URL
 */
export function getUnsubscribeUrl(token) {
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  return `${baseUrl}/api/email/unsubscribe?token=${token}`;
}

/**
 * Generate manage preferences URL for email templates
 * 
 * Requirements: 8.4
 * 
 * @param {string} token - Unsubscribe token
 * @returns {string} Full preferences management URL
 */
export function getManagePreferencesUrl(token) {
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  return `${baseUrl}/dashboard/email-preferences?token=${token}`;
}
