# Implementation Plan: Fix Authentication Architecture

## Overview

This implementation plan addresses the critical security flaw where the frontend attempts password hashing operations. The solution separates authentication concerns: the frontend provides lightweight client-side validation for UX feedback, while the backend handles all cryptographic operations. This fixes the build error, improves security, and establishes a maintainable architecture.

**Technology Stack**: 
- Frontend: JavaScript/Next.js
- Backend: JavaScript/Node.js (Express)

## Tasks

- [x] 1. Prepare Backend Authentication Service
  - [x] 1.1 Create authentication utilities service module
    - Create `apps/api/src/services/authService.js` with secure functions
    - Implement `hashPassword(password, saltRounds)` using bcryptjs
    - Implement `verifyPassword(plainPassword, hashedPassword)` using bcryptjs
    - Implement server-side `validatePasswordStrength(password)` with strict rules
    - Implement server-side `validateEmail(email)` with strict rules
    - Export all functions for use in controllers
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 12.1, 12.2, 12.3, 12.4, 12.5_

  - [x]* 1.2 Write unit tests for backend authentication utilities
    - Test hashPassword returns valid bcrypt hash
    - Test hashPassword generates different hashes for same input (salt variation)
    - Test verifyPassword returns true for matching credentials
    - Test verifyPassword returns false for non-matching credentials
    - Test validatePasswordStrength rejects weak passwords
    - Test validatePasswordStrength accepts strong passwords
    - _Requirements: 3.1, 3.2, 4.1, 4.2_

- [x] 2. Update Backend Authentication Controller
  - [x] 2.1 Refactor register endpoint to use backend utilities
    - Update `apps/api/src/controllers/authController.js`
    - Import hashPassword from authService
    - Use hashPassword before storing user password
    - Ensure password is never returned in response
    - Validate email format server-side
    - Validate password strength server-side
    - Return appropriate error codes (400, 409, 500)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10_

  - [x] 2.2 Refactor login endpoint to use backend utilities
    - Import verifyPassword from authService
    - Use verifyPassword to check credentials
    - Generate and return JWT token on success
    - Return generic 401 error for credential mismatch (no email disclosure)
    - Ensure password hash is never returned in response
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

  - [x] 2.3 Update password reset endpoint
    - Use hashPassword when resetting password
    - Validate new password strength server-side
    - Ensure password hash is never returned
    - _Requirements: 3.5, 3.6, 4.4_

  - [x] 2.4 Update change password endpoint
    - Use verifyPassword to verify old password
    - Use hashPassword for new password
    - Ensure password hashes are never returned
    - _Requirements: 3.7, 4.5_

  - [x]* 2.5 Write integration tests for authentication endpoints
    - Test successful registration with valid credentials
    - Test registration rejects duplicate email (409)
    - Test registration rejects invalid password format (400)
    - Test registration does not return password hash
    - Test successful login with correct credentials
    - Test login rejects wrong password (401, generic message)
    - Test login rejects non-existent email (401, generic message)
    - Test login does not return password hash
    - Test password reset with valid token
    - Test password reset with invalid/expired token
    - _Requirements: 5.10, 6.8, 7.9, 8.9_

- [x] 3. Refactor Frontend Authentication Utils
  - [x] 3.1 Remove cryptographic functions from frontend auth-utils
    - Edit `apps/web/src/lib/auth-utils.js`
    - Remove `hashPassword()` function
    - Remove `verifyPassword()` function
    - Remove `generateVerificationToken()` function (server-only)
    - Remove all bcryptjs imports
    - Keep `validatePasswordStrength()` function (client-side validation only)
    - Keep `validateEmail()` function (client-side validation only)
    - Keep `isValidCUID()` function (non-auth utility)
    - Ensure no remaining crypto operations in the file
    - _Requirements: 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

  - [x] 3.2 Update client-side validation functions
    - Ensure `validatePasswordStrength()` is pure function (no async, no crypto)
    - Ensure `validateEmail()` is pure function (no async, no crypto)
    - Add JSDoc comments explaining these are UX utilities, not security-critical
    - Verify functions work entirely in browser without server calls
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 11.1, 11.2, 11.7_

  - [x]* 3.3 Write tests for frontend validation utilities
    - Test validatePasswordStrength provides feedback
    - Test validateEmail provides format feedback
    - Verify tests run in browser environment
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 4. Update Frontend Dependencies
  - [x] 4.1 Remove bcryptjs from frontend package.json
    - Edit `apps/web/package.json`
    - Remove bcryptjs from dependencies
    - Remove bcryptjs from devDependencies
    - Run `pnpm install` or equivalent to update lock file
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 4.2 Verify frontend build succeeds
    - Run `pnpm build` in apps/web
    - Confirm "Module not found: Can't resolve 'bcryptjs'" error is gone
    - Check build output for any remaining bcryptjs references
    - Verify build completes successfully
    - _Requirements: 10.3, 10.4, 10.5_

- [x] 5. Update Frontend Signup Component
  - [x] 5.1 Refactor SignUpForm component
    - Edit `apps/web/src/components/auth/SignUpForm.js`
    - Keep calling validatePasswordStrength for UX feedback
    - Keep calling validateEmail for UX feedback
    - Remove any attempt to hash password locally
    - Send email and password as plain text in POST body
    - Send to backend `/api/auth/register` endpoint
    - Handle 201 response: store JWT, redirect to dashboard
    - Handle 409 response: display "Email already registered"
    - Handle 400 response: display validation errors from backend
    - Handle errors: display network error message
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_

- [x] 6. Update Frontend Login Component
  - [x] 6.1 Refactor SignInForm component
    - Edit `apps/web/src/components/auth/SignInForm.js`
    - Keep calling validateEmail for UX feedback
    - Remove any password hashing attempts
    - Send email and password as plain text in POST body
    - Send to backend `/api/auth/login` endpoint
    - Handle 200 response: store JWT in secure cookie/session, redirect to dashboard
    - Handle 401 response: display "Email or password is incorrect"
    - Handle errors: display network error message
    - Use secure storage for JWT (httpOnly cookie preferred)
    - Attach JWT to all subsequent authenticated requests via Authorization header
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9_

- [x] 7. Update Frontend Password Reset Components
  - [x] 7.1 Refactor ForgotPasswordForm component
    - Edit `apps/web/src/components/auth/ForgotPasswordForm.js`
    - Keep calling validateEmail for UX feedback
    - Send email to backend `/api/auth/forgot-password` endpoint
    - Display appropriate success message
    - _Requirements: 9.1, 9.2_

  - [x] 7.2 Refactor ResetPasswordForm component
    - Edit `apps/web/src/components/auth/ResetPasswordForm.js`
    - Keep calling validatePasswordStrength for UX feedback
    - Remove any password hashing attempts
    - Extract reset token from URL
    - Send token and newPassword as plain text to backend `/api/auth/reset-password/:token`
    - Handle 200 response: display success, redirect to login
    - Handle 400 response: display error (invalid token, expired, validation failed)
    - _Requirements: 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10_

- [x] 8. Fix Frontend API Routes
  - [x] 8.1 Review and update frontend API routes
    - Check `apps/web/src/app/api/auth/register/route.js`
    - Check `apps/web/src/app/api/auth/reset-password/route.js`
    - If they contain password hashing, remove it
    - Either remove them entirely or make them minimal proxies to backend
    - Ensure no bcryptjs imports remain
    - Recommended: Remove these routes and call backend API directly from components
    - _Requirements: 7.4, 8.3, 9.6, 10.5, 10.6_

- [x] 9. Checkpoint - Verify Frontend Build and Tests
  - Ensure `pnpm build` completes successfully in apps/web
  - Verify no bcryptjs references remain in frontend code
  - Run frontend tests: `pnpm test`
  - Verify no "Module not found: Can't resolve 'bcryptjs'" errors
  - Ask the user if questions arise.

- [x] 10. Update Backend API Endpoints Documentation
  - [x] 10.1 Document POST /api/auth/register endpoint
    - Endpoint handles: email, password, name, userType
    - Returns: 201 with user data, 409 for duplicate, 400 for validation errors
    - Password is hashed before storage
    - Password hash is never returned
    - _Requirements: 5.1 through 5.10_

  - [x] 10.2 Document POST /api/auth/login endpoint
    - Endpoint handles: email, password
    - Returns: 200 with JWT token, 401 for invalid credentials
    - Uses verifyPassword for secure comparison
    - Never discloses whether email exists
    - Password hash is never returned
    - _Requirements: 6.1 through 6.8_

  - [x] 10.3 Document POST /api/auth/reset-password/:token endpoint
    - Endpoint handles: token (URL param), newPassword (body)
    - Password is hashed before storage
    - Password hash is never returned
    - _Requirements: 9.7 through 9.10_

- [x] 11. Integration Testing - Full Authentication Flow
  - [x] 11.1 Test complete signup flow
    - User enters credentials on frontend
    - Frontend calls backend /api/auth/register
    - Backend receives plain-text password, hashes it, stores user
    - Frontend receives JWT token
    - Verify user can log in with new credentials
    - _Requirements: 1.7, 1.8, 5.1 through 5.10, 7.1 through 7.10_

  - [x] 11.2 Test complete login flow
    - User enters credentials on frontend
    - Frontend calls backend /api/auth/login
    - Backend verifies credentials, returns JWT
    - Frontend stores JWT securely
    - Frontend can make authenticated requests with JWT
    - _Requirements: 1.7, 1.8, 6.1 through 6.8, 8.1 through 8.9_

  - [x]* 11.3 Test complete password reset flow
    - User requests password reset on frontend
    - Backend sends reset email with token
    - User clicks link, enters new password
    - Frontend calls backend /api/auth/reset-password/:token
    - Backend hashes and stores new password
    - User can log in with new password
    - User cannot log in with old password
    - _Requirements: 3.5, 3.6, 4.4, 9.1 through 9.10_

- [x] 12. Final Verification
  - [x] 12.1 Verify frontend build success
    - Run `pnpm build` in apps/web directory
    - Confirm build completes without errors
    - Confirm no bcryptjs references in build output
    - _Requirements: 10.3, 10.4, 10.5_

  - [x] 12.2 Verify backend starts successfully
    - Run backend server: `pnpm dev` in apps/api
    - Confirm no errors loading authService
    - Confirm endpoints are accessible
    - _Requirements: 3.1, 4.1, 12.1_

  - [x] 12.3 Verify authentication endpoints work
    - Test register endpoint with POST request
    - Test login endpoint with POST request
    - Test password reset endpoint with POST request
    - Verify responses match specification
    - _Requirements: 5.1 through 5.10, 6.1 through 6.8, 9.1 through 9.10_

  - [x]* 12.4 Run all test suites
    - Backend tests: `pnpm test` in apps/api
    - Frontend tests: `pnpm test` in apps/web
    - Ensure all authentication tests pass
    - _Requirements: 1.1 through 12.8_

- [x] 13. Final Checkpoint - Architecture Complete
  - Confirm frontend no longer has bcryptjs dependency
  - Confirm all password operations are on backend
  - Confirm build error is resolved
  - Confirm authentication flows work end-to-end
  - Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing/verification tasks and can be skipped for faster MVP deployment
- All password operations on the backend use the centralized authService
- All validation feedback on the frontend uses pure functions (no crypto, no network calls)
- Passwords are transmitted only over HTTPS (Next.js dev server should use localhost)
- JWT tokens should be stored securely (httpOnly cookies for security)
- The build error "Module not found: Can't resolve 'bcryptjs'" will be fixed when bcryptjs is removed from frontend package.json and all imports are removed

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "3.1", "4.1"] },
    { "id": 1, "tasks": ["1.2", "2.1", "2.2", "2.3", "2.4", "3.2", "3.3"] },
    { "id": 2, "tasks": ["2.5", "4.2", "5.1", "6.1", "7.1", "7.2", "8.1"] },
    { "id": 3, "tasks": ["9.1"] },
    { "id": 4, "tasks": ["10.1", "10.2", "10.3", "11.1", "11.2", "11.3"] },
    { "id": 5, "tasks": ["12.1", "12.2", "12.3", "12.4"] }
  ]
}
```

