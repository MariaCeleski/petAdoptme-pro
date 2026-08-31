# PetAdopt Email Service Documentation

## Overview

The PetAdopt Email Service provides a robust, production-ready email delivery system with automatic retry logic, multiple provider support, and professional HTML templates.

**Requirements Implemented:**
- Requirement 8.1: Email notifications to Pet_Owner on new adoption requests
- Requirement 8.2: Email notifications to Adopter on adoption status changes
- Requirement 8.5: Unsubscribe option in all emails
- Requirement 8.6: Email delivery status validation
- Requirement 8.7: Automatic retry with up to 3 attempts on failure

## Features

### 1. Multi-Provider Support with Fallback Chain
The email service supports multiple providers in priority order:
1. **Resend** (primary) - Modern, fast email API with reliability
2. **SendGrid** - Enterprise email service
3. **SMTP** - Generic SMTP server
4. **Development Mode** - Console logging for testing

Set environment variables to configure:
```bash
# Option 1: Resend (recommended)
RESEND_API_KEY="your-api-key"

# Option 2: SendGrid
SENDGRID_API_KEY="your-api-key"

# Option 3: SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### 2. Automatic Retry Logic (Requirement 8.7)
- Up to 3 retry attempts for failed emails
- Exponential backoff: 1s, 2s, 4s delays between attempts
- Smart retry handling:
  - Retries on network errors (5xx)
  - Doesn't retry on client errors (4xx)
  - Logs all attempts and failures

```javascript
// Automatically retried up to 3 times
const result = await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome',
  html: '<p>Welcome to PetAdopt</p>'
});
```

### 3. Professional HTML Templates
All emails feature:
- Responsive design (mobile-friendly)
- Consistent branding with PetAdopt colors (#FF8C42, #4A90E2)
- Professional layout with header, content, and footer
- Unsubscribe links (Requirement 8.5)
- Proper semantic HTML

### 4. Email Delivery Validation (Requirement 8.6)
Each email send returns delivery status:
```javascript
{
  messageId: 'unique-message-id',
  status: 'delivered',
  provider: 'resend',
  timestamp: '2024-01-15T10:30:00.000Z'
}
```

### 5. Comprehensive Logging
All email operations are logged with context:
- Sending attempts: `[EMAIL] Sending email to user@example.com (resend)`
- Retry attempts: `[EMAIL] Send email to user@example.com via Resend failed on attempt 1/3`
- Success: `[EMAIL] Successfully sent to user@example.com (MessageID: ...)`
- Failures: `[EMAIL] Failed to send email to user@example.com: Connection timeout`

## Email Templates

### 1. Welcome Email
Sent to new adopters upon registration.
```javascript
const template = getWelcomeEmailTemplate(userName, unsubscribeUrl);
```

### 2. Adoption Request Notification
Sent to pet owner when new adoption request is received (Requirement 8.1).
```javascript
await sendAdoptionRequestEmail(ownerEmail, {
  ownerName: 'João',
  petName: 'Rex',
  adopterName: 'Maria',
  adoptionId: 'adoption-123',
  unsubscribeUrl: 'https://app.com/unsubscribe?token=...'
});
```

### 3. Adoption Approved Email
Sent to adopter when adoption is approved (Requirement 8.2).
```javascript
await sendAdoptionApprovedEmail(adopterEmail, {
  adopterName: 'Maria',
  petName: 'Rex',
  petAge: '2 anos',
  petBreed: 'Labrador',
  ownerName: 'João',
  ownerPhone: '(11) 99999-9999',
  unsubscribeUrl: 'https://app.com/unsubscribe?token=...'
});
```

### 4. Adoption Rejected Email
Sent to adopter when adoption is rejected.
```javascript
await sendAdoptionRejectedEmail(adopterEmail, {
  adopterName: 'Maria',
  petName: 'Rex',
  rejectionReason: 'Já tínhamos recebido outra solicitação',
  unsubscribeUrl: 'https://app.com/unsubscribe?token=...'
});
```

### 5. Pet Matching Alert
Sent to adopters when new pets match their preferences (Requirement 8.3).
```javascript
await sendPetMatchingEmail(adopterEmail, {
  adopterName: 'Maria',
  petName: 'Bella',
  petSpecies: 'CAT',
  petBreed: 'Persa',
  petAge: '1 ano',
  petImage: 'https://cdn.example.com/bella.jpg',
  unsubscribeUrl: 'https://app.com/unsubscribe?token=...'
});
```

## Integration Examples

### In Adoption API Routes
```javascript
import { sendAdoptionRequestEmail, sendAdoptionApprovedEmail } from '@/lib/email';

// In POST /api/adoptions
await sendAdoptionRequestEmail(pet.owner.email, {
  ownerName: pet.owner.name,
  petName: pet.name,
  adopterName: session.user.name,
  adoptionId: adoption.id
});

// In PATCH /api/adoptions/[id]
if (status === 'APPROVED') {
  await sendAdoptionApprovedEmail(adoption.adopter.email, {
    adopterName: adoption.adopter.name,
    petName: adoption.pet.name,
    petAge: adoption.pet.age,
    petBreed: adoption.pet.breed,
    ownerName: adoption.pet.owner.name,
    ownerPhone: '(11) 99999-9999'
  });
}
```

### In Authentication
```javascript
import { sendWelcomeEmail } from '@/lib/email';

// After user registration
await sendWelcomeEmail(newUser.email, newUser.name);
```

## Error Handling

The email service handles errors gracefully:

```javascript
try {
  await sendEmail({
    to: userEmail,
    subject: 'Test',
    html: '<p>Test</p>'
  });
} catch (error) {
  console.error('Email failed:', error.message);
  // Error is already logged and retried
  // Handle gracefully in API routes
}
```

In API routes, email failures should not fail the entire request:
```javascript
try {
  await sendAdoptionRequestEmail(...);
} catch (error) {
  console.error('Email notification failed:', error);
  // Continue - request was created successfully
}
```

## Development Mode

When no email provider is configured, the service enters development mode:
- Logs email content to console
- Returns mock delivery status
- No actual emails are sent

```bash
[EMAIL-DEV] Would send email to user@example.com
Subject: Welcome to PetAdopt
Content preview: <!DOCTYPE html>...
```

## Best Practices

1. **Always include unsubscribeUrl** for compliance with email regulations
2. **Don't fail API requests on email errors** - email is secondary to core functionality
3. **Use descriptive email addresses** - helps with deliverability
4. **Test with development mode first** - validate template rendering
5. **Monitor email logs** - watch for retry patterns that indicate provider issues
6. **Validate email addresses** - built-in validation prevents invalid sends

## Testing

### Unit Test Example
```javascript
import { sendEmail, getAdoptionRequestEmailTemplate } from '@/lib/email';

describe('Email Service', () => {
  test('retry logic retries on network errors', async () => {
    // Test implementation
  });

  test('adoption request email includes all required fields', () => {
    const template = getAdoptionRequestEmailTemplate(
      'João',
      'Rex',
      'Maria',
      'adoption-123'
    );
    expect(template.html).toContain('João');
    expect(template.html).toContain('Rex');
    expect(template.html).toContain('Maria');
  });
});
```

### Manual Testing with Development Mode
1. Remove all email provider keys from .env
2. Run the application
3. Perform actions that trigger emails
4. Check console output for email logs

## Configuration Reference

| Environment Variable | Required | Default | Description |
|---|---|---|---|
| RESEND_API_KEY | No | - | Resend API key (priority 1) |
| SENDGRID_API_KEY | No | - | SendGrid API key (priority 2) |
| SMTP_HOST | No | - | SMTP server hostname (priority 3) |
| SMTP_PORT | No | 587 | SMTP server port |
| SMTP_USER | No | - | SMTP authentication user |
| SMTP_PASS | No | - | SMTP authentication password |
| SMTP_SECURE | No | false | Use TLS for SMTP |
| EMAIL_FROM | No | noreply@petadopt.com | Sender email address |
| APP_URL | Yes | http://localhost:3000 | Application base URL |

## Troubleshooting

### Emails not sending
1. Check environment variables are set correctly
2. Check console logs for specific error messages
3. Verify email addresses are valid format
4. Check provider credentials

### High retry rates
1. Monitor provider status pages
2. Check network connectivity
3. Verify rate limits haven't been exceeded
4. Consider provider issues

### Template rendering issues
1. Test template in development mode
2. Check for template variables being undefined
3. Validate HTML is properly escaped
4. Test responsive design in email clients

## Support

For issues or questions:
1. Check this documentation
2. Review logs in console/monitoring
3. Verify environment configuration
4. Check provider API status
