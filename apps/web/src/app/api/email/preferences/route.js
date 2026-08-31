/**
 * Email Preferences Management API Routes
 * 
 * Requirements: 8.4, 8.5
 * 
 * GET  /api/email/preferences - Get user's email preferences (requires auth)
 * POST /api/email/preferences - Update user's email preferences (requires auth)
 */

import { getServerSession } from 'next-auth';
import { 
  getEmailPreferences, 
  updateAllNotificationPreferences,
  NOTIFICATION_TYPES 
} from '@/lib/email/preferences';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const preferences = await getEmailPreferences(session.user.id);
    
    return Response.json({
      success: true,
      preferences,
      notificationTypes: NOTIFICATION_TYPES
    });
  } catch (error) {
    console.error('[EMAIL-PREFERENCES-GET] Error:', error);
    
    return Response.json(
      { error: 'Failed to fetch email preferences' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate request body
    if (!body.preferences || typeof body.preferences !== 'object') {
      return Response.json(
        { error: 'Invalid request body. Must contain preferences object.' },
        { status: 400 }
      );
    }
    
    // Update preferences
    const updated = await updateAllNotificationPreferences(
      session.user.id,
      body.preferences
    );
    
    console.log(`[EMAIL-PREFERENCES] User ${session.user.id} updated preferences`);
    
    return Response.json({
      success: true,
      message: 'Email preferences updated successfully',
      preferences: {
        adoptionNotifications: updated.adoptionNotifications,
        statusChangeNotifications: updated.statusChangeNotifications,
        petMatchingAlerts: updated.petMatchingAlerts,
        newsletter: updated.newsletter,
        unsubscribedAll: updated.unsubscribedAll,
        updatedAt: updated.updatedAt
      }
    });
  } catch (error) {
    console.error('[EMAIL-PREFERENCES-POST] Error:', error);
    
    return Response.json(
      { error: error.message || 'Failed to update email preferences' },
      { status: 500 }
    );
  }
}
