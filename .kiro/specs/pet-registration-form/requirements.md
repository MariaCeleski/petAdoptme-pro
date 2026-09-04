# Requirements Document

## Introduction

The Pet Registration Form is a critical user-facing component that enables individual pet owners and shelter administrators to register pets for adoption on the PetAdopt platform. Accessible at the route `/tutores/cadastrar`, this feature provides a structured, multi-section form with comprehensive validation to ensure data quality and regulatory compliance. The form collects 21 fields organized across 5 distinct sections: Basic Information, Health, Behavior, Photos, and Additional Contact Information.

The feature is designed to support both web browsers and mobile devices, with real-time frontend validation and server-side enforcement to prevent invalid data from reaching the database. This document specifies all functional requirements for the registration form, including field specifications, validation rules, error handling, and backend integration.

## Glossary

- **Pet_Owner_Form**: The multi-section registration form accessible at `/tutores/cadastrar` for registering pets for adoption
- **Field**: An individual form input element (text, select, textarea, file)
- **Section**: A logical grouping of related fields within the form (Basic Info, Health, Behavior, Photos, Additional)
- **Validation**: The process of checking that input data meets specified criteria (frontend client-side, backend server-side)
- **Bearer_Token**: JWT authentication token included in request headers as `Authorization: Bearer <token>`
- **Field_Mapping**: The transformation of frontend form field names (camelCase) to backend database schema names (snake_case)
- **Error_Handling**: The process of capturing, logging, and communicating validation or submission errors to the user
- **Pet_Record**: A complete set of pet information stored in the database, referenced by a unique pet ID
- **User_Type**: Classification of authenticated user (INDIVIDUAL_OWNER, SHELTER_ADMIN, ADOPTER)
- **Responsive_Design**: Adaptive layout that functions correctly on desktop, tablet, and mobile devices
- **Personality_Trait**: A behavioral characteristic of a pet (docil, brincalhao, timido, agressivo, calmo)

---

## Requirements

### Requirement 1: Multi-Section Form Structure

**User Story:** As a pet owner, I want to register my pet using an organized, multi-section form, so that I can logically group related information and complete the registration without feeling overwhelmed.

#### Acceptance Criteria

1. THE Pet_Owner_Form SHALL present exactly five distinct sections in the following order: Basic Information, Health, Behavior, Photos, and Additional Contact Information
2. WHEN a user navigates the Pet_Owner_Form, THE form SHALL display one section at a time or all sections on desktop (responsive layout)
3. THE Pet_Owner_Form SHALL include clear visual separation between sections with headers and grouping indicators
4. WHEN a user completes a section, THE Pet_Owner_Form SHALL indicate section completion status (e.g., checkmark, progress indicator)
5. THE Pet_Owner_Form SHALL retain all entered data if the user navigates between sections without submitting
6. WHEN a user attempts to navigate away from incomplete sections, THE Pet_Owner_Form SHALL warn the user about unsaved data and offer to save

---

### Requirement 2: Basic Information Section - Field Specifications

**User Story:** As a pet owner, I want to provide essential identifying information about my pet, so that adopters can quickly understand the pet's identity and basic characteristics.

#### Acceptance Criteria

1. THE Basic_Info_Section SHALL include exactly seven fields: nomePet, especie, raca, idade, genero, tamanho, corAparencia
2. WHEN a user enters nomePet, THE field SHALL accept text input, be required, and enforce a maximum length of 50 characters
3. WHEN a user selects especie, THE field SHALL provide a dropdown with exactly four options: cachorro, gato, coelho, outro
4. WHEN a user enters raca, THE field SHALL accept text input, be required, and enforce a maximum length of 50 characters
5. WHEN a user enters idade, THE field SHALL accept numeric input, enforce range 0-50, and be required
6. WHEN a user selects genero, THE field SHALL provide a dropdown with exactly two options: macho, femea
7. WHEN a user selects tamanho, THE field SHALL provide a dropdown with exactly four options: pequeno, medio, grande, extra-grande
8. WHEN a user enters corAparencia, THE field SHALL accept textarea input, be required, and display a character count (current/maximum)

---

### Requirement 3: Health Section - Field Specifications and Defaults

**User Story:** As a pet owner, I want to document my pet's health status, so that potential adopters understand the pet's medical condition and necessary care requirements.

#### Acceptance Criteria

1. THE Health_Section SHALL include exactly five fields: vacinado, castrado, microchip, historicoMedico, alergias
2. WHEN a user selects vacinado, THE field SHALL provide a dropdown with exactly two options: sim, nao
3. WHEN a user selects castrado, THE field SHALL provide a dropdown with exactly two options: sim, nao
4. WHEN a user selects microchip, THE field SHALL provide a dropdown with exactly two options: sim, nao
5. WHEN a user enters historicoMedico, THE field SHALL accept optional textarea input with a maximum of 300 characters
6. WHEN a user enters alergias, THE field SHALL accept optional textarea input with a maximum of 300 characters
7. WHEN a user does not explicitly select a value for vacinado or castrado, THE system SHALL default these fields to false (nao) in the backend submission
8. IF historicoMedico or alergias are left empty, THE system SHALL not include these fields in the API payload or store them as null

---

### Requirement 4: Behavior Section - Field Specifications

**User Story:** As a pet owner, I want to describe my pet's behavioral characteristics, so that adopters can assess compatibility with their household.

#### Acceptance Criteria

1. THE Behavior_Section SHALL include exactly four fields: temperamento, criancas, outrosAnimais, descricaoGeral
2. WHEN a user selects temperamento, THE field SHALL provide a dropdown with exactly five options: docil, brincalhao, timido, agressivo, calmo
3. WHEN a user selects criancas, THE field SHALL provide a dropdown with exactly three options: sim, nao, supervisionada
4. WHEN a user selects outrosAnimais, THE field SHALL provide a dropdown with exactly three options: sim, nao, depende
5. WHEN a user enters descricaoGeral, THE field SHALL accept textarea input, be required, enforce minimum 10 characters and maximum 500 characters, and display a character count
6. THE Behavior_Section fields SHALL be used for display and user guidance only and SHALL NOT be transmitted to the backend in Phase 1
7. THE temperamento field values SHALL map to backend personality array values and SHALL be included in API submission

---

### Requirement 5: Photos Section - File Handling

**User Story:** As a pet owner, I want to upload photos of my pet, so that adopters can see what the pet looks like.

#### Acceptance Criteria

1. THE Photos_Section SHALL include exactly one field: fotos (file upload)
2. THE fotos field SHALL require a minimum of 1 file and allow a maximum of 5 files
3. THE fotos field SHALL accept only JPG and PNG file formats
4. WHEN a user attempts to upload a file that exceeds 2MB in size, THE form SHALL display an inline error message: "Arquivo excede o tamanho máximo de 2MB"
5. WHEN a user attempts to upload a file with an invalid extension, THE form SHALL display an inline error message: "Apenas arquivos JPG e PNG são permitidos"
6. WHEN a user uploads valid files, THE form SHALL display a preview of each image with filename and file size
7. WHEN a user wishes to remove an uploaded file, THE form SHALL provide a delete button for each preview
8. IN PHASE 1, uploaded files SHALL NOT be transmitted to the backend; the feature SHALL only validate file properties and store them client-side

---

### Requirement 6: Additional Contact Information Section

**User Story:** As a pet owner, I want to provide contact details, so that adopters can reach me regarding adoption inquiries.

#### Acceptance Criteria

1. THE Additional_Section SHALL include exactly five fields: motivoAdocao, nomeContatoTutor, telefoneTutor, emailTutor, aceitaCidade
2. WHEN a user selects motivoAdocao, THE field SHALL provide a dropdown with exactly four options: mudanca, incompatibilidade, outras, resgate
3. WHEN a user enters nomeContatoTutor, THE field SHALL accept text input, be required, and enforce a maximum length of 100 characters
4. WHEN a user enters telefoneTutor, THE field SHALL accept phone input with format validation for Brazilian phone numbers (11 digits: (XX) XXXXX-XXXX)
5. WHEN a user enters emailTutor, THE field SHALL accept email input, validate email format using standard email regex pattern, and be required
6. WHEN a user selects aceitaCidade, THE field SHALL provide a dropdown with exactly two options: sim, nao
7. IN PHASE 1, nomeContatoTutor, telefoneTutor, and emailTutor fields SHALL NOT be stored in the database but SHALL be used for display/validation purposes
8. motivoAdocao and aceitaCidade SHALL be UI-only fields in Phase 1 and SHALL NOT be transmitted to the backend

---

### Requirement 7: Frontend Validation

**User Story:** As a user, I want immediate feedback on input errors, so that I can correct mistakes before submitting the form.

#### Acceptance Criteria

1. WHEN a user interacts with a required field, THE form SHALL display an error message if the field is left empty upon blur
2. WHEN a user enters text exceeding the maximum character limit, THE form SHALL display an inline error message with the current and maximum character count
3. WHEN a user enters a phone number with invalid format, THE form SHALL display the error message: "Formato de telefone inválido. Use: (XX) XXXXX-XXXX"
4. WHEN a user enters an email address with invalid format, THE form SHALL display the error message: "Email inválido. Por favor, insira um endereço de email válido"
5. WHEN a user enters a number outside the valid range (e.g., age > 50 or < 0), THE form SHALL display an inline error message
6. WHEN a user attempts to submit the form with validation errors, THE form SHALL not submit and SHALL highlight all fields with errors in red
7. THE form SHALL display real-time character counts for textarea fields (descricaoGeral, corAparencia, historicoMedico, alergias)
8. WHEN a user corrects an error, THE corresponding error message SHALL disappear immediately

---

### Requirement 8: Backend Validation and Data Transformation

**User Story:** As a system, I want to validate all submitted data server-side, so that I ensure data integrity regardless of client behavior.

#### Acceptance Criteria

1. WHEN a POST request is received at `/api/pets`, THE backend SHALL validate the request payload against the Zod schema createPetSchema
2. WHEN validation fails, THE backend SHALL return a 400 Bad Request response with a detailed error message for each invalid field
3. THE backend SHALL transform frontend field names to database schema names: nomePet → name, vacinado → isVaccinated, castrado → isNeutered, temperamento → personality, especie (cachorro/gato) → species (DOG/CAT), genero (macho/femea) → gender (MALE/FEMALE), tamanho (pequeno/medio/grande) → size (SMALL/MEDIUM/LARGE)
4. THE backend SHALL enforce these field constraints:
   - name: minimum 1 character, maximum 100 characters
   - species: DOG or CAT only
   - breed: minimum 1 character, maximum 50 characters
   - age: string representation of numeric age
   - size: SMALL, MEDIUM, or LARGE only
   - gender: MALE or FEMALE only
   - color: minimum 1 character, required
   - description: minimum 10 characters, maximum 500 characters
   - isNeutered: boolean, default false
   - isVaccinated: boolean, default false
   - healthStatus: optional, maximum 300 characters
   - personality: array of strings, maximum 5 elements
5. WHEN validation passes, THE backend SHALL store the Pet_Record in the database with status AVAILABLE
6. WHEN validation passes, THE backend SHALL include owner_id from the authenticated user's JWT token
7. WHEN validation passes, THE backend SHALL return a 201 Created response with the created Pet_Record

---

### Requirement 9: API Integration and Authentication

**User Story:** As an authenticated user, I want my pet registration to be securely associated with my account, so that I retain ownership and control of the listing.

#### Acceptance Criteria

1. WHEN submitting the Pet_Owner_Form, THE frontend SHALL include the Bearer_Token in the Authorization header
2. WHEN receiving a POST request at `/api/pets`, THE backend middleware SHALL validate the Bearer_Token
3. IF the Bearer_Token is missing or invalid, THE backend SHALL return a 401 Unauthorized response
4. IF the user is not of type INDIVIDUAL_OWNER or SHELTER_ADMIN, THE backend SHALL return a 403 Forbidden response
5. WHEN validation passes, THE backend SHALL extract userId from the JWT token and store it as owner_id in the Pet_Record
6. WHEN the form is successfully submitted, THE backend SHALL return HTTP 201 with the created Pet_Record data
7. WHEN the form submission fails due to validation, THE backend SHALL return HTTP 400 with error details
8. WHEN the form submission fails due to authentication, THE backend SHALL return HTTP 401 or 403

---

### Requirement 10: Error Handling and User Feedback

**User Story:** As a user, I want clear error messages when submission fails, so that I understand what went wrong and how to fix it.

#### Acceptance Criteria

1. WHEN a field fails frontend validation, THE form SHALL display an inline error message below the field in red text
2. WHEN the entire form submission fails, THE form SHALL display a summary error message at the top of the form
3. WHEN the backend returns a 400 validation error, THE frontend SHALL map backend field errors to corresponding form fields and display them inline
4. WHEN a network error occurs during submission, THE form SHALL display the message: "Erro de conexão. Por favor, verifique sua conexão com a internet e tente novamente"
5. WHEN the backend returns a 401 error, THE form SHALL display: "Sua sessão expirou. Por favor, faça login novamente"
6. WHEN the backend returns a 403 error, THE form SHALL display: "Você não tem permissão para realizar esta ação"
7. WHEN submission succeeds, THE form SHALL display a success message: "Pet cadastrado com sucesso!" and redirect to a confirmation page
8. WHEN a user corrects an error and re-submits, ALL previous error messages SHALL be cleared from the UI

---

### Requirement 11: Data Persistence and State Management

**User Story:** As a user, I want my form data to be retained while I navigate the form, so that I don't lose my progress.

#### Acceptance Criteria

1. WHEN a user enters data in any form field, THE form state SHALL be updated in React component state
2. WHEN a user navigates between sections, THE form SHALL retain all previously entered data
3. IF a user refreshes the page before submitting, THE form data MAY be lost (no localStorage persistence required in Phase 1)
4. WHEN a user submits the form, THE form SHALL disable the submit button and display a loading indicator to prevent duplicate submissions
5. WHEN submission is complete or fails, THE form SHALL re-enable the submit button
6. THE form state SHALL include the current section, field values, and validation error messages

---

### Requirement 12: Responsive Design and Accessibility

**User Story:** As a mobile user, I want the form to be accessible and usable on my phone, so that I can register my pet on any device.

#### Acceptance Criteria

1. THE Pet_Owner_Form SHALL be responsive and function correctly on desktop (>1024px), tablet (768px-1024px), and mobile (<768px) viewports
2. ON mobile devices, THE form SHALL display one section per screen to reduce cognitive load
3. ON desktop devices, THE form MAY display all sections or use a multi-step layout
4. THE form inputs SHALL have a minimum touch target size of 44px x 44px on mobile devices
5. WHEN a user is on a mobile device, THE keyboard SHALL not cover the submit button; the form SHALL scroll or adjust as needed
6. THE form labels SHALL be clearly associated with their input fields using HTML for/id attributes
7. ALL required fields SHALL be marked with a visual indicator (e.g., red asterisk) and programmatically indicated
8. THE form SHALL have adequate color contrast ratios (4.5:1 for text) for accessibility compliance

---

### Requirement 13: File Upload Validation

**User Story:** As a user uploading pet photos, I want validation to ensure my files meet requirements, so that I don't waste time uploading invalid files.

#### Acceptance Criteria

1. BEFORE file upload, THE form SHALL validate file type against an allowed list: image/jpeg, image/png
2. WHEN a user selects files, THE form SHALL check each file's MIME type and file extension
3. IF file extension does not match MIME type, THE form SHALL display error: "Tipo de arquivo inválido"
4. WHEN a user has uploaded the maximum number of files (5), THE form SHALL disable the file input or display a message: "Máximo de 5 fotos atingido"
5. WHEN a user uploads files below the minimum (1), THE form SHALL display error upon submission: "Pelo menos 1 foto é obrigatória"
6. IN PHASE 1, file uploads SHALL NOT be transmitted to backend; validation SHALL be frontend-only

---

### Requirement 14: Form Submission and Success Flow

**User Story:** As a user, I want confirmation that my pet has been registered, so that I know the submission was successful.

#### Acceptance Criteria

1. WHEN all form validations pass and the user clicks submit, THE form SHALL send a POST request to `/api/pets` with the Bearer_Token
2. WHEN the backend returns HTTP 201, THE frontend SHALL display a success message and clear the form
3. WHEN successful, THE frontend SHALL navigate to a confirmation page or display a confirmation modal with the pet details
4. WHEN successful, THE system SHALL reset the form state and prepare for a new registration if the user chooses to register another pet
5. IF the user wishes to register another pet immediately, THE form SHALL clear all fields and return to Section 1
6. THE success confirmation SHALL display a summary of the registered pet information for verification

---

### Requirement 15: Phase 1 MVP Scope Limitations

**User Story:** As a project manager, I want to define what is and is not included in Phase 1, so that the MVP can be delivered on schedule.

#### Acceptance Criteria

1. IN PHASE 1, photo file uploads SHALL NOT be transmitted to backend; only validation and preview shall be implemented
2. IN PHASE 1, contact fields (nomeContatoTutor, telefoneTutor, emailTutor) SHALL NOT be stored in the database
3. IN PHASE 1, behavior fields (criancas, outrosAnimais) SHALL NOT be transmitted to backend
4. IN PHASE 1, motivoAdocao and aceitaCidade fields SHALL NOT be transmitted to backend
5. IN PHASE 1, these fields SHALL be transmitted to backend: name, species, breed, age, gender, size, color, description, isVaccinated, isNeutered, healthStatus, personality, owner_id
6. IN PHASE 2, photo upload functionality SHALL be integrated with Cloudinary CDN
7. IN PHASE 2, contact information SHALL be linked to user profile and behavior fields shall be stored

---

## Acceptance Criteria Summary

| Requirement | Acceptance Criteria Count | Key Focus |
|-------------|---------------------------|-----------|
| 1. Multi-Section Structure | 6 | Form layout and navigation |
| 2. Basic Information | 8 | Field specifications and validation |
| 3. Health Section | 8 | Optional/required field handling |
| 4. Behavior Section | 6 | Limited backend transmission |
| 5. Photos Section | 8 | File format and size validation |
| 6. Contact Information | 8 | Email/phone format validation |
| 7. Frontend Validation | 8 | Real-time error feedback |
| 8. Backend Validation | 7 | Data integrity and transformation |
| 9. API Integration | 8 | Authentication and security |
| 10. Error Handling | 8 | User-friendly error messages |
| 11. Data Persistence | 6 | Form state management |
| 12. Responsive Design | 8 | Mobile/desktop usability |
| 13. File Upload Validation | 6 | File type and size checking |
| 14. Form Submission | 6 | Success flow and confirmation |
| 15. Phase 1 Scope | 7 | MVP limitations and roadmap |

**Total Acceptance Criteria: 113**

---

## Implementation Notes

- The form is a critical user-facing feature that directly impacts adoption success
- All 21 fields are documented with their validation rules and backend mappings
- Frontend validation provides immediate user feedback; backend validation ensures data integrity
- Phase 1 focuses on core registration functionality; photos and contact information are Phase 2
- Field mappings between frontend and backend are explicitly defined to ensure correct data transformation
- Error handling emphasizes user-friendly messages in Portuguese (pt-BR)
