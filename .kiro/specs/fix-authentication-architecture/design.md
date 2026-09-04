# Design Document: Fix Authentication Architecture

## Overview

This design establishes a secure client/server separation for authentication in the PetAdopt application. The current architecture violates fundamental security principles by attempting password hashing operations on the frontend. The solution reorganizes authentication logic with:

1. **Frontend responsibility**: Input validation, user feedback, secure credential transmission
2. **Backend responsibility**: Password hashing, verification, token generation, data persistence
3. **Communication**: Secure HTTPS endpoints with JWT tokens for session management

This design eliminates the bcryptjs dependency from the frontend build, fixes the build error, and establishes a maintainable security architecture.

## Architecture

### Current Issues

```
Current (Incorrect):
┌─────────────┐                    ┌─────────────┐
│  Browser    │                    │  Backend    │
│  (Frontend) │                    │  (API)      │
│             │                    │             │
│ • bcryptjs  │ ←─── passwords ──→ │ • bcryptjs  │
│ • hash()    │                    │ • hash()    │
│ • verify()  │                    │             │
│ BUILD ERROR │                    └─────────────┘
└─────────────┘

Problem: Frontend tries to hash passwords → bcryptjs module error
         Cryptographic operations exposed to client
         Security-sensitive logic in browser context
```

### Target Architecture

```
Target (Correct):
┌──────────────────────────────┐     ┌──────────────────────────┐
│  Browser (Frontend)          │     │  Node.js Server (Backend) │
│                              │     │                          │
│ • validatePasswordStrength() │     │ • hashPassword()         │
│ • validateEmail()            │     │ • verifyPassword()       │
│ • Form components            │     │ • Authentication logic   │
│                              │     │ • JWT token generation   │
│ (NO bcryptjs)                │     │ • Session management     │
└──────────┬───────────────────┘     └──────────┬───────────────┘
           │                                     │
           │  1. User enters credentials        │
           ├──────────────────────────────────→ │
           │  2. Validate format (client-side)  │
           │  3. Send via HTTPS POST /auth      │
           │                                     │
           │  4. Server validates, hashes,      │
           │     verifies, generates JWT        │
           │                                     │
           │  5. Return JWT + user data         │
           │ ←─────────────────────────────────┤
           │                                     │
           │  6. Store JWT securely             │
           │  7. Use for subsequent requests    │
```

### Key Design Principles

1. **Zero Knowledge Principle**: Frontend never knows passwords in their hashed form
2. **Single Source of Truth**: All password operations happen once on the backend
3. **Defense in Depth**: Client-side validation for UX, server-side validation for security
4. **Secure Transmission**: Passwords only sent over HTTPS, stored securely (JWT tokens)
5. **Cryptographic Isolation**: bcryptjs and other crypto libraries only on the backend

## Components and Interfaces

### Frontend Components

#### 1. Client-Side Validation Module (`apps/web/src/lib/auth-utils.js`)

**Removed Functions:**
- `hashPassword()` - REMOVE: Server-only operation
- `verifyPassword()` - REMOVE: Server-only operation
- `generateVerificationToken()` - REMOVE: Server-only operation
- `isValidCUID()` - Keep for non-auth use (pet validation)

**Retained Functions:**
- `validatePasswordStrength(password)` - Client-side validation
- `validateEmail(email)` - Client-side validation

**Purpose**: Provide immediate user feedback on input validity without server calls.

**Function Signatures:**

```javascript
/**
 * Validates password strength for UX feedback
 * @param {string} password - The password to validate
 * @returns {Object} { isValid, errors[], strength: 0-4 }
 * Does NOT perform cryptographic operations
 */
export function validatePasswordStrength(password)

/**
 * Validates email format for UX feedback
 * @param {string} email - The email to validate
 * @returns {Object} { isValid, errors[] }
 * Does NOT perform cryptographic operations
 */
export function validateEmail(email)
```

#### 2. Signup Form Component (`apps/web/src/components/auth/SignUpForm.js`)

**Changes:**
- Keep using `validatePasswordStrength()` and `validateEmail()` for client feedback
- Remove any attempt to hash passwords locally
- Send `email` and `password` as plain text to backend (over HTTPS)
- Backend will handle hashing before storage

**Flow:**
```
User Input → Client Validation (feedback) → Send to /api/auth/register → Backend hashes → Success
```

#### 3. SignIn Form Component (`apps/web/src/components/auth/SignInForm.js`)

**Changes:**
- Keep using `validateEmail()` for client feedback
- Remove any password hashing locally
- Send `email` and `password` as plain text to backend (over HTTPS)
- Backend will verify and return JWT token

**Flow:**
```
User Input → Client Validation (feedback) → Send to /api/auth/login → Backend verifies → Return JWT
```

#### 4. Reset Password Form (`apps/web/src/components/auth/ResetPasswordForm.js`)

**Changes:**
- Keep using `validatePasswordStrength()` for client feedback
- Remove any password hashing locally
- Send `token` and `newPassword` as plain text to backend
- Backend will hash and update

**Flow:**
```
User Input → Client Validation → Send to /api/auth/reset-password → Backend hashes → Success
```

#### 5. API Routes in Frontend

**Current Files to Update:**
- `apps/web/src/app/api/auth/register/route.js` - Redirect to backend
- `apps/web/src/app/api/auth/reset-password/route.js` - Redirect to backend
- `apps/web/src/app/api/auth/forgot-password/route.js` - May stay as proxy or be removed

**Option A - Remove from Frontend (Recommended):**
Frontend API routes become thin proxies that forward to the backend API.

**Option B - Minimal Frontend Routes:**
Keep minimal routes for Next.js API functionality if needed for middleware.

**Decision: Option A** - Remove password-related operations from frontend routes, implement proper backend endpoints.

### Backend Components

#### 1. Authentication Utilities Module (`apps/api/src/services/authService.js`)

**New File**: Create dedicated authentication service for all crypto operations.

**Exported Functions:**

```javascript
/**
 * Hashes a password using bcryptjs
 * @param {string} password - Plain text password
 * @param {number} saltRounds - Bcrypt salt rounds (default: 10)
 * @returns {Promise<string>} - Hashed password
 * @throws {ApiError} - If hashing fails
 */
export async function hashPassword(password, saltRounds = 10)

/**
 * Verifies a plain password against a hash
 * @param {string} plainPassword - Plain text password to verify
 * @param {string} hashedPassword - Stored hashed password
 * @returns {Promise<boolean>} - True if passwords match
 * @throws {ApiError} - If comparison fails
 */
export async function verifyPassword(plainPassword, hashedPassword)

/**
 * Server-side password strength validation
 * @param {string} password - Password to validate
 * @returns {Object} - { isValid, errors[], strength }
 */
export function validatePasswordStrength(password)

/**
 * Server-side email validation
 * @param {string} email - Email to validate
 * @returns {Object} - { isValid, errors[] }
 */
export function validateEmail(email)
```

#### 2. Updated Authentication Controller (`apps/api/src/controllers/authController.js`)

**Changes:**
- Import from new `authService.js`
- Use `hashPassword()` in register endpoint
- Use `verifyPassword()` in login endpoint
- Use `validatePasswordStrength()` for validation
- Use `validateEmail()` for validation

**Methods:**
- `register()` - Create new user with hashed password
- `login()` - Verify credentials, return JWT
- `logout()` - Clear session
- `verifyEmail()` - Confirm email verification token
- `requestPasswordReset()` - Generate reset token
- `resetPassword()` - Hash new password after reset
- `getCurrentUser()` - Get authenticated user info
- `changePassword()` - Change password for authenticated user

#### 3. Authentication Middleware (`apps/api/src/middleware/auth.js`)

**Purpose**: Verify JWT tokens on protected routes.

**Functionality:**
- Extract JWT from Authorization header
- Verify JWT signature and expiration
- Attach user info to `req.user`
- Return 401 if invalid or missing

#### 4. Password Reset Service (`apps/api/src/services/emailService.js`)

**Existing**: Already sends password reset emails with tokens.

**No Changes Needed**: Tokens are generated server-side, not exposed to frontend.

### API Endpoints

#### Registration Endpoint
```
POST /api/auth/register
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "MyPassword123!",
  "name": "John Doe",
  "userType": "adopter"
}

Response (201 Created):
{
  "message": "User created successfully. Check your email to verify.",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "userType": "adopter",
    "emailVerified": false
  }
}

Response (409 Conflict):
{
  "error": "Email already registered",
  "code": "EMAIL_EXISTS"
}

Response (400 Bad Request):
{
  "error": "Validation failed",
  "errors": [
    "Password must contain at least one uppercase letter",
    "Email format is invalid"
  ]
}
```

#### Login Endpoint
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "MyPassword123!"
}

Response (200 OK):
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "userType": "adopter"
  }
}

Response (401 Unauthorized):
{
  "error": "Email or password is incorrect",
  "code": "INVALID_CREDENTIALS"
}
```

#### Password Reset Request Endpoint
```
POST /api/auth/forgot-password
Content-Type: application/json

Request Body:
{
  "email": "user@example.com"
}

Response (200 OK):
{
  "message": "If an account exists with this email, a reset link was sent"
}
```

#### Password Reset Endpoint
```
POST /api/auth/reset-password/:token
Content-Type: application/json

Request Body:
{
  "newPassword": "NewPassword456!"
}

Response (200 OK):
{
  "message": "Password reset successfully. You can now login with your new password."
}

Response (400 Bad Request):
{
  "error": "Reset token is invalid or expired",
  "code": "INVALID_TOKEN"
}
```

## Data Models

### User Table (Existing)
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,  -- Always hashed, NEVER plain text
  name VARCHAR(255) NOT NULL,
  user_type VARCHAR(50) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Verification Tokens Table (Existing)
```sql
CREATE TABLE verification_tokens (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Password Reset Tokens Table (Existing)
```sql
CREATE TABLE password_reset_tokens (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Key Invariant**: `users.password` always contains a bcrypt hash, never a plain-text password.

## Error Handling

### Frontend Error Handling

```javascript
// Signup error handling
try {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, userType })
  });

  if (response.status === 409) {
    // Email already exists
    showError("This email is already registered");
  } else if (response.status === 400) {
    // Validation errors
    const data = await response.json();
    showErrors(data.errors); // Display all validation errors
  } else if (response.status === 201) {
    // Success
    redirectToVerificationPage();
  }
} catch (error) {
  showError("Network error. Please try again.");
}
```

### Backend Error Handling

**Password Hashing Errors:**
- If bcrypt fails to hash: Return 500 Internal Server Error
- Log error for debugging (never expose details to client)
- Ensure user never sees bcrypt implementation details

**Password Verification Errors:**
- If bcrypt comparison fails: Return 401 Unauthorized (generic)
- Do NOT indicate whether email exists or password is wrong (security)
- Log failed attempts for security monitoring

**Validation Errors:**
- Return 400 Bad Request with specific validation messages
- Validation errors are safe to expose (password too short, email format invalid)

## Testing Strategy

### Unit Tests (Validation Functions)

**Frontend validation tests** (Client-safe only):
```javascript
describe('validatePasswordStrength', () => {
  test('returns isValid: false for password < 8 chars');
  test('returns isValid: false for password with no numbers');
  test('returns isValid: false for password with no letters');
  test('returns isValid: true for password with letters and numbers');
  test('returns strength score 0-4');
});

describe('validateEmail', () => {
  test('returns isValid: false for invalid format');
  test('returns isValid: true for valid format');
});
```

**Backend utility tests:**
```javascript
describe('hashPassword', () => {
  test('returns a string hash');
  test('returns different hash for same password (salt variation)');
  test('hash length is approximately 60 characters');
});

describe('verifyPassword', () => {
  test('returns true for matching password and hash');
  test('returns false for non-matching password and hash');
  test('handles bcrypt errors gracefully');
});
```

### Integration Tests

**Registration flow:**
```javascript
test('POST /api/auth/register with valid credentials creates user', async () => {
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      email: 'test@example.com',
      password: 'TestPassword123',
      name: 'Test User',
      userType: 'adopter'
    });

  expect(response.status).toBe(201);
  expect(response.body.user.email).toBe('test@example.com');
  expect(response.body.user.password).toBeUndefined(); // Never expose hash
});

test('POST /api/auth/register with duplicate email returns 409', async () => {
  // Create first user
  await createUser('test@example.com', 'password');

  // Try to create again
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      email: 'test@example.com',
      password: 'TestPassword123',
      name: 'Another User',
      userType: 'adopter'
    });

  expect(response.status).toBe(409);
});
```

**Login flow:**
```javascript
test('POST /api/auth/login with correct credentials returns JWT', async () => {
  const user = await createUser('test@example.com', 'TestPassword123');

  const response = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'test@example.com',
      password: 'TestPassword123'
    });

  expect(response.status).toBe(200);
  expect(response.body.token).toBeDefined();
  expect(response.body.user.password).toBeUndefined(); // Never expose hash
});

test('POST /api/auth/login with wrong password returns 401', async () => {
  await createUser('test@example.com', 'TestPassword123');

  const response = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'test@example.com',
      password: 'WrongPassword'
    });

  expect(response.status).toBe(401);
  expect(response.body.error).toMatch(/incorrect|invalid/i);
});
```

**Password reset flow:**
```javascript
test('POST /api/auth/reset-password/:token updates password', async () => {
  const user = await createUser('test@example.com', 'OldPassword123');
  const resetToken = await generatePasswordResetToken(user.id);

  const response = await request(app)
    .post(`/api/auth/reset-password/${resetToken}`)
    .send({
      newPassword: 'NewPassword456'
    });

  expect(response.status).toBe(200);

  // Verify old password no longer works
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'test@example.com',
      password: 'OldPassword123'
    });

  expect(loginResponse.status).toBe(401);

  // Verify new password works
  const loginResponse2 = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'test@example.com',
      password: 'NewPassword456'
    });

  expect(loginResponse2.status).toBe(200);
});
```

### End-to-End Tests (E2E)

These would use tools like Cypress or Playwright to test the full flow:

1. User navigates to signup page
2. User enters credentials and submits
3. Frontend calls backend /api/auth/register
4. Backend hashes password, creates user, sends verification email
5. User receives email and clicks verification link
6. User logs in with credentials
7. Frontend receives JWT token
8. Frontend stores JWT securely
9. Frontend can now make authenticated requests

## Security Considerations

### Password Storage
- **DO**: Hash passwords with bcrypt before storing
- **DO**: Use adequate salt rounds (10+)
- **DO NOT**: Store plain-text passwords
- **DO NOT**: Use simple MD5 or SHA hashing
- **DO NOT**: Use the same salt for all passwords

### Password Transmission
- **DO**: Transmit passwords only over HTTPS
- **DO**: Never log passwords in any form
- **DO NOT**: Store passwords in browser localStorage
- **DO NOT**: Store passwords in cookies without HttpOnly flag

### Token Storage (Frontend)
- **DO**: Store JWT in secure, HttpOnly cookies
- **DO**: Or store in memory with refresh token strategy
- **DO NOT**: Store tokens in localStorage (vulnerable to XSS)
- **DO NOT**: Store tokens in easily-accessible places

### Error Messages
- **DO**: Return generic "Email or password incorrect" for login failures
- **DO NOT**: Indicate whether email exists (prevents user enumeration)
- **DO**: Return specific validation errors (help users fix input)
- **DO**: Log detailed errors server-side for debugging

### Dependencies
- **DO**: Use well-maintained, audited libraries (bcryptjs)
- **DO**: Keep dependencies updated
- **DO NOT**: Implement custom crypto (security risk)
- **DO NOT**: Use synchronous password operations (blocking)

## Notes and Decisions

### Decision 1: Move bcryptjs to Backend Only
- **Rationale**: Cryptographic operations should never run in browsers
- **Trade-offs**: Requires all password operations to go through network calls
- **Mitigation**: Use HTTPS, minimize number of password operations

### Decision 2: Remove hashPassword and verifyPassword from Frontend
- **Rationale**: These functions are security-critical and should not be exposed to client-side code
- **Trade-offs**: Frontend loses ability to validate passwords locally (acceptable - UX validation is still available)
- **Impact**: Build error fixed, security improved

### Decision 3: Keep Lightweight Validation on Frontend
- **Rationale**: Provides immediate user feedback without server calls
- **Benefit**: Better UX for users entering weak passwords
- **Security**: Validation functions don't perform crypto, so they're safe

### Decision 4: Consolidate Auth Utilities on Backend
- **Rationale**: Single source of truth for security-critical operations
- **Benefit**: Easier to audit, update, and maintain security policies
- **Impact**: Ensures password handling is consistent across all endpoints

