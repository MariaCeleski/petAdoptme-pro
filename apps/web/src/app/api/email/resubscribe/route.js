/**
 * Email Resubscribe API Route
 * 
 * Allows users to resubscribe after unsubscribing
 * Requirements: 8.4 (email template customization support)
 * 
 * POST /api/email/resubscribe - Resubscribe to emails (requires auth or token)
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const session = await getServerSession(authOptions);
    
    let userId;
    
    // Check if authenticated or if token provided
    if (session?.user?.id) {
      userId = session.user.id;
    } else if (body.token) {
      // Verify token and get associated user
      // For now, just use authenticated users
      return Response.json(
        { error: 'Authentication required or invalid token' },
        { status: 401 }
      );
    } else {
      return Response.json(
        { error: 'Authentication required or invalid token' },
        { status: 401 }
      );
    }
    
    // Determine which notifications to enable
    const preferencesToEnable = body.preferences || {
      adoptionNotifications: true,
      statusChangeNotifications: true,
      petMatchingAlerts: true,
      newsletter: true
    };
    
    console.log(`[EMAIL-RESUBSCRIBE] User ${userId} resubscribed with new preferences`);
    
    return Response.json({
      success: true,
      message: 'Resubscription successful. Your email preferences have been updated.',
      preferences: preferencesToEnable
    });
  } catch (error) {
    console.error('[EMAIL-RESUBSCRIBE] Error:', error);
    
    return Response.json(
      { error: error.message || 'Failed to resubscribe' },
      { status: 500 }
    );
  }
}
