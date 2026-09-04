# Requirements Document: Fix Authentication Architecture

## Introduction

The PetAdopt application currently has a critical security flaw in its authentication architecture. Cryptographic operations (password hashing and verification) are being performed on the frontend client, which is both architecturally incorrect and a security vulnerability. The frontend application attempts to import `bcryptjs`, a server-side library, causing build failures. This feature addresses the complete separation of authentication concerns between client and server, establishing a secure and maintainable authentication flow.

## Glossary

- **Frontend/Client**: Next.js web application running in the user's browser (apps/web)
- **Backend/Server**: Express.js API server handling business logic and data persistence (apps/api)
- **Password Hashing**: Cryptographic operation that converts a plain-text password into an irreversible hash using bcrypt
- **Password Verification**: Cryptographic operation that compares a plain-text password against a stored hash to verify authentication
- **Authentication Endpoint**: HTTP API endpoint on the backend that handles user login, registration, and password reset operations
- **Client-Side Validation**: Input validation performed in the browser to provide immediate user feedback (not for security)
- **Server-Side Validation**: Input validation performed on the backend that enforces security constraints and business rules
- **Salt**: Random data added to a password before hashing to prevent rainbow table attacks
- **JWT Token**: JSON Web Token returned by the backend after successful authentication, used by the frontend to identify the user in subsequent requests
- **bcryptjs**: JavaScript library for password hashing (server-side only)
- **Sensitive Operation**: Any operation that affects security, data integrity, or privacy and must only be performed on the backend

## Requirements

### Requirement 1: Client/Server Responsibility Separation

**User Story:** As a system architect, I want clear separation of concerns between frontend and backend authentication logic, so that the system is secure and maintainable.

#### Acceptance Criteria

1. THE Frontend SHALL NOT import, depend on, or use the bcryptjs library
2. THE Frontend SHALL NOT attempt to hash passwords
3. THE Frontend SHALL NOT attempt to verify passwords against hashes
4. THE Frontend SHALL NOT perform any cryptographic operations related to authentication
5. THE Frontend SHALL only perform client-side validation of password strength and format for immediate user feedback
6. THE Backend SHALL be the sole component responsible for password hashing and verification
7. WHEN the Frontend receives user credentials THEN it SHALL transmit them to the Backend API via HTTPS
8. THE Backend SHALL be the sole component responsible for storing user passwords

### Requirement 2: Frontend Authentication Validation

**User Story:** As a frontend developer, I want client-side validation utilities for user feedback, so that users receive immediate feedback about input validity without requiring a server request.

#### Acceptance Criteria

1. THE Frontend SHALL provide a validatePasswordStrength function that returns feedback about password quality
2. THE Frontend SHALL provide a validateEmail function that checks email format
3. WHEN validating password strength THEN THE Frontend SHALL check: minimum length (8 characters), maximum length (100 characters), presence of letters, presence of numbers, and special characters
4. WHEN validating email THEN THE Frontend SHALL check format conformance to standard email patterns
5. THE validatePasswordStrength function SHALL return an object with: isValid (boolean), errors (array of strings), and strength (0-4 numeric score)
6. THE validateEmail function SHALL return an object with: isValid (boolean) and errors (array of strings)
7. THESE functions SHALL NOT perform cryptographic operations
8. THESE functions SHALL NOT depend on server-side behavior

### Requirement 3: Backend Authentication Hashing

**User Story:** As a backend developer, I want secure password hashing on the server, so that user passwords are never transmitted or stored in plain text.

#### Acceptance Criteria

1. THE Backend SHALL have a hashPassword function that accepts a plain-text password
2. THE hashPassword function SHALL use bcryptjs with a configurable salt round (default 10)
3. THE hashPassword function SHALL return a promise that resolves to the hashed password string
4. THE Backend SHALL call hashPassword before storing any user password
5. WHEN a user registers THEN THE Backend SHALL hash the password before storing it in the database
6. WHEN a user performs password reset THEN THE Backend SHALL hash the new password before storing it
7. WHEN a user changes their password THEN THE Backend SHALL hash the new password before storing it
8. PLAIN-TEXT passwords SHALL NEVER be stored in the database

### Requirement 4: Backend Authentication Verification

**User Story:** As a backend developer, I want to verify passwords securely, so that only users with correct credentials can log in.

#### Acceptance Criteria

1. THE Backend SHALL have a verifyPassword function that accepts a plain-text password and a hashed password
2. THE verifyPassword function SHALL use bcryptjs comparison to safely verify credentials
3. THE verifyPassword function SHALL return a promise that resolves to a boolean
4. WHEN a user attempts login THEN THE Backend SHALL call verifyPassword to check credentials
5. IF verifyPassword returns false THEN THE Backend SHALL return a 401 Unauthorized response
6. IF verifyPassword returns true THEN THE Backend SHALL create and return an authentication token

### Requirement 5: Secure Registration Endpoint

**User Story:** As a security engineer, I want the registration endpoint to enforce authentication security, so that user accounts are created securely.

#### Acceptance Criteria

1. WHEN a POST request is received at /api/auth/register THEN THE Backend SHALL extract email, password, name, and userType
2. THE Backend SHALL validate the password using server-side rules (minimum length, complexity requirements)
3. THE Backend SHALL validate the email format
4. IF password validation fails THEN THE Backend SHALL return 400 Bad Request with specific validation errors
5. IF email validation fails THEN THE Backend SHALL return 400 Bad Request with specific validation errors
6. IF email already exists THEN THE Backend SHALL return 409 Conflict
7. THE Backend SHALL hash the password using the hashPassword function
8. THE Backend SHALL create a new user record with the hashed password and other details
9. THE Backend SHALL return 201 Created with user data (excluding the password hash)
10. THE Backend SHALL NOT return the password hash in any response

### Requirement 6: Secure Login Endpoint

**User Story:** As a security engineer, I want the login endpoint to validate credentials securely, so that only authorized users receive authentication tokens.

#### Acceptance Criteria

1. WHEN a POST request is received at /api/auth/login THEN THE Backend SHALL extract email and password
2. THE Backend SHALL query the database for a user with the provided email
3. IF no user is found THEN THE Backend SHALL return 401 Unauthorized (without disclosing whether the email exists)
4. IF a user is found THEN THE Backend SHALL call verifyPassword with the provided password and stored hash
5. IF verifyPassword returns false THEN THE Backend SHALL return 401 Unauthorized (without disclosing that the email exists)
6. IF verifyPassword returns true THEN THE Backend SHALL create a JWT token
7. THE Backend SHALL return 200 OK with the JWT token and user data (excluding the password hash)
8. THE Backend SHALL NOT return the password hash in any response

### Requirement 7: Frontend Authentication Flow - Registration

**User Story:** As a frontend developer, I want the signup form to work correctly with the secure backend endpoint, so that new users can register.

#### Acceptance Criteria

1. THE Frontend signup component SHALL collect email, password, name, and user type from the user
2. THE Frontend SHALL call validatePasswordStrength on the password for immediate feedback
3. THE Frontend SHALL call validateEmail on the email for immediate feedback
4. WHEN the user submits the signup form THEN THE Frontend SHALL send a POST request to /api/auth/register
5. THE POST request payload SHALL contain: email, password, name, userType
6. THE Frontend SHALL NOT hash the password before sending
7. WHEN the response is 201 THEN THE Frontend SHALL store the JWT token
8. WHEN the response is 409 THEN THE Frontend SHALL display an error message: "Email already registered"
9. WHEN the response is 400 THEN THE Frontend SHALL display the validation errors returned by the Backend
10. AFTER successful registration THEN THE Frontend SHALL redirect to the verification page or login page

### Requirement 8: Frontend Authentication Flow - Login

**User Story:** As a frontend developer, I want the signin form to work correctly with the secure backend endpoint, so that users can authenticate.

#### Acceptance Criteria

1. THE Frontend signin component SHALL collect email and password from the user
2. THE Frontend SHALL call validateEmail on the email for immediate feedback
3. WHEN the user submits the signin form THEN THE Frontend SHALL send a POST request to /api/auth/login
4. THE POST request payload SHALL contain: email and password
5. THE Frontend SHALL NOT hash the password before sending
6. WHEN the response is 200 THEN THE Frontend SHALL store the JWT token in secure storage (httpOnly cookie or secure session)
7. WHEN the response is 401 THEN THE Frontend SHALL display an error message: "Email or password is incorrect"
8. AFTER successful login THEN THE Frontend SHALL redirect to the dashboard
9. THE Frontend SHALL attach the JWT token to all subsequent authenticated API requests

### Requirement 9: Frontend Authentication Flow - Password Reset

**User Story:** As a frontend developer, I want the password reset flow to work with the secure backend, so that users can recover access to their accounts.

#### Acceptance Criteria

1. WHEN a user requests password reset THEN THE Frontend SHALL send email to the Backend
2. WHEN the Backend sends a password reset email with a token THEN THE user can click the link to access the reset form
3. THE Frontend reset form SHALL collect the new password
4. THE Frontend SHALL call validatePasswordStrength on the new password for immediate feedback
5. WHEN the user submits the reset form THEN THE Frontend SHALL send a POST request to /api/auth/reset-password with: token, newPassword
6. THE Frontend SHALL NOT hash the password before sending
7. THE Backend SHALL verify the token is valid
8. THE Backend SHALL hash the new password
9. WHEN the response is 200 THEN THE Frontend SHALL display a success message and redirect to login
10. WHEN the response is 400 THEN THE Frontend SHALL display the error (invalid token, expired token, validation failed)

### Requirement 10: Removal of Cryptographic Dependencies from Frontend

**User Story:** As a developer, I want the frontend package.json to not include bcryptjs, so that the build succeeds and the frontend is lightweight.

#### Acceptance Criteria

1. THE Frontend package.json SHALL NOT include bcryptjs as a dependency
2. THE Frontend package.json SHALL NOT include bcryptjs as a dev dependency
3. WHEN the Frontend is built THEN the build SHALL complete successfully without "Module not found: Can't resolve 'bcryptjs'" error
4. THE Frontend build SHALL not include bcryptjs code or dependencies
5. AFTER removing bcryptjs THEN all Frontend imports of auth-utils hashPassword and verifyPassword SHALL be removed
6. ALL Frontend API routes and components SHALL send passwords to the Backend for hashing/verification

### Requirement 11: Refactored Client-Safe auth-utils

**User Story:** As a frontend developer, I want an auth-utils file with only safe client-side validation functions, so that I can validate inputs without security risks.

#### Acceptance Criteria

1. THE Frontend auth-utils.js file SHALL export validatePasswordStrength function
2. THE Frontend auth-utils.js file SHALL export validateEmail function
3. THE Frontend auth-utils.js file SHALL NOT import bcryptjs
4. THE Frontend auth-utils.js file SHALL NOT export hashPassword
5. THE Frontend auth-utils.js file SHALL NOT export verifyPassword
6. THE Frontend auth-utils.js file SHALL contain only pure functions that do not perform cryptographic operations
7. ALL validation functions SHALL work in the browser without server calls

### Requirement 12: Backend auth-utils Organization

**User Story:** As a backend developer, I want authentication utilities organized on the server, so that password operations are centralized and secure.

#### Acceptance Criteria

1. THE Backend SHALL have authentication utility functions in a dedicated module (e.g., authUtils or similar)
2. THE Backend SHALL export hashPassword function
3. THE Backend SHALL export verifyPassword function
4. THE Backend SHALL export validatePasswordStrength function (server-side)
5. THE Backend SHALL export validateEmail function (server-side)
6. THE Backend authentication controller SHALL use these utility functions
7. THE Backend SHALL NOT expose password hashing logic in API responses
8. ALL password operations in the Backend SHALL use the centralized utility functions

