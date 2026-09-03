# Implementation Notes: Pet Registration Form Specification

## Document Overview

This specification package provides a complete, production-ready specification for the PetAdopt Pet Registration Form feature. The specification follows the requirements-first workflow methodology and includes comprehensive requirements, technical design, and implementation guidance.

## Files Included

### 1. requirements.md
**Purpose:** Formal specification of all functional requirements

**Contents:**
- 15 core requirements
- 113 acceptance criteria (ACs)
- Complete field specifications for all 21 form fields
- Validation rules (frontend and backend)
- Error handling requirements
- API contract specifications
- Phase 1 scope limitations

**Key Sections:**
- Requirement 1: Multi-Section Form Structure (6 ACs)
- Requirement 2: Basic Information Section (8 ACs) - 7 fields
- Requirement 3: Health Section (8 ACs) - 5 fields
- Requirement 4: Behavior Section (6 ACs) - 4 fields
- Requirement 5: Photos Section (8 ACs) - 1 field
- Requirement 6: Additional Contact Information (8 ACs) - 5 fields
- Requirement 7: Frontend Validation (8 ACs)
- Requirement 8: Backend Validation & Transformation (7 ACs)
- Requirement 9: API Integration & Authentication (8 ACs)
- Requirement 10: Error Handling & User Feedback (8 ACs)
- Requirement 11: Data Persistence & State Management (6 ACs)
- Requirement 12: Responsive Design & Accessibility (8 ACs)
- Requirement 13: File Upload Validation (6 ACs)
- Requirement 14: Form Submission & Success Flow (6 ACs)
- Requirement 15: Phase 1 MVP Scope Limitations (7 ACs)

### 2. design.md
**Purpose:** Technical architecture and implementation design

**Contents:**
- Component hierarchy and architecture
- State management structure
- Data flow diagrams
- Component interfaces
- Backend API contract
- Field mapping (frontend ↔ backend)
- Validation strategies (frontend and backend)
- Error handling patterns
- Testing strategy with examples
- Responsive design breakpoints
- Security considerations
- Accessibility features
- Performance optimization

**Key Sections:**
- Architecture: Component hierarchy, state management, data flow
- Components and Interfaces: FormProvider, Input components, validation schemas
- Data Models: Frontend FormData interface, Backend Pet Record, Field mapping table
- Validation Strategy: Frontend flow, backend flow, field rules
- Error Handling: Frontend scenarios, backend responses
- Testing Strategy: Unit and integration test examples
- Responsive Design: Mobile, tablet, desktop layouts with CSS breakpoints
- Phase 1 vs Phase 2: Feature breakdown and roadmap
- Security, Accessibility, Performance considerations

### 3. .config.kiro
**Purpose:** Workflow metadata

**Contents:**
- specId: Unique identifier for this specification
- workflowType: "requirements-first"
- specType: "feature"

## Field Reference (All 21 Fields)

### Section 1: Basic Information (7 fields)
1. nomePet - text, required, max 50
2. especie - select (cachorro/gato/coelho/outro), required
3. raca - text, required, max 50
4. idade - number 0-50, required
5. genero - select (macho/femea), required
6. tamanho - select (pequeno/medio/grande/extra-grande), required
7. corAparencia - textarea, required, max 500

### Section 2: Health (5 fields)
8. vacinado - select (sim/nao), default: nao
9. castrado - select (sim/nao), default: nao
10. microchip - select (sim/nao), default: nao
11. historicoMedico - textarea, optional, max 300
12. alergias - textarea, optional, max 300

### Section 3: Behavior (4 fields)
13. temperamento - select (docil/brincalhao/timido/agressivo/calmo), required
14. criancas - select (sim/nao/supervisionada), required, UI-only Phase 1
15. outrosAnimais - select (sim/nao/depende), required, UI-only Phase 1
16. descricaoGeral - textarea, required, min 10, max 500

### Section 4: Photos (1 field)
17. fotos - file array, min 1, max 5, JPG/PNG, max 2MB each, UI-only Phase 1

### Section 5: Additional (4 fields)
18. motivoAdocao - select (mudanca/incompatibilidade/outras/resgate), required, UI-only Phase 1
19. nomeContatoTutor - text, required, max 100, UI-only Phase 1
20. telefoneTutor - tel, required, format: (XX) XXXXX-XXXX, UI-only Phase 1
21. emailTutor - email, required, UI-only Phase 1

## Backend Integration Summary

### API Endpoint
```
POST /api/pets
Headers: Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Fields Transmitted to Backend (Phase 1)
✅ name (from nomePet)
✅ species (DOG/CAT from especie: cachorro/gato)
✅ breed (from raca)
✅ age (from idade)
✅ gender (MALE/FEMALE from genero)
✅ size (SMALL/MEDIUM/LARGE from tamanho)
✅ color (from corAparencia)
✅ description (from descricaoGeral)
✅ isVaccinated (boolean from vacinado)
✅ isNeutered (boolean from castrado)
✅ healthStatus (from historicoMedico, optional)
✅ personality (array from temperamento)
✅ owner_id (from JWT token)

### Fields NOT Transmitted (Phase 1)
❌ fotos (photos) - Phase 2 with Cloudinary
❌ criancas (children) - UI-only
❌ outrosAnimais (other animals) - UI-only
❌ motivoAdocao (reason for adoption) - UI-only
❌ nomeContatoTutor (tutor name) - UI-only
❌ telefoneTutor (tutor phone) - UI-only
❌ emailTutor (tutor email) - UI-only
❌ alergias (allergies) - UI-only
❌ microchip - UI-only
❌ aceitaCidade (city acceptance) - UI-only

## Validation Rules Summary

### Frontend Validation (UX Layer)
- Real-time on blur (setFieldTouched)
- Highlights errors in red inline below field
- Character count for textareas
- Email/phone format validation
- Number range validation (age 0-50)
- File type/size validation
- Prevents submission if validation fails

### Backend Validation (Security Layer)
- Authoritative Zod schema validation
- Type coercion and transformation
- Enum enforcement
- String length constraints
- Required field validation
- Returns 400 with field-specific errors if validation fails

## Phase 1 Implementation Focus

**In Scope:**
- All form UI (21 fields)
- Frontend validation with error display
- Multi-section navigation
- State management
- API integration with authentication
- Core field transmission (12 fields)
- Success/error messaging
- Responsive mobile-first layout

**Out of Scope (Phase 2):**
- Photo upload to Cloudinary
- Contact information persistence
- Behavior/reason fields storage
- Photo gallery on pet detail
- Contact information integration with user profile

## Testing Recommendations

### Unit Tests (Frontend)
- Input components: validation, error display, character count
- Form reducer: field updates, error handling, reset
- Field mapping: frontend → backend transformation
- File validation: MIME type, size, count

### Integration Tests (Frontend)
- Complete form submission flow
- Section navigation
- State persistence across sections
- API call with Bearer token
- Error mapping from backend
- Success redirect

### Backend Tests
- Zod schema: valid/invalid inputs
- Field transformation: camelCase → snake_case, enum conversion
- Endpoint: authentication, authorization, validation
- Database: record creation, owner_id linkage

### E2E Tests
- Full user flow: fill form → submit → confirmation
- Error scenarios: network failure, auth expired, validation errors
- Mobile responsiveness: navigation on small screens

## Design Decisions & Rationale

1. **Dual-Layer Validation:** Frontend for UX, backend for security (cannot skip backend)
2. **Phase 1 Scope Limitation:** Focused MVP on core pet info, defer complex features to Phase 2
3. **Field Mapping Complexity:** Necessary due to frontend/backend naming conventions and enum transformations
4. **UI-Only Fields:** Social context fields (behavior, contact) included for better UX but not persisted initially
5. **Default Values:** vacinado/castrado default to "nao" (false) to avoid missing data assumptions
6. **File Upload Deferral:** Photos require Cloudinary integration; testing without backend upload is sufficient for MVP
7. **Contact Information Deferral:** Should be linked to user profile (Phase 2) rather than duplicated in pet record

## Accessibility & Responsiveness

- **WCAG 2.1 AA:** Color contrast (4.5:1), labels, error associations, keyboard navigation
- **Mobile-First:** Single section per screen on mobile, optimized touch targets (44x44px)
- **Tablet:** Two-column layout, two sections per screen
- **Desktop:** All sections visible with sidebar navigation or accordion

## Known Limitations & Future Enhancements

### Limitations (Phase 1)
- No photo upload (images not stored)
- No contact information persistence
- No behavior/reason tracking
- No multi-language support (Portuguese pt-BR only)

### Future Enhancements (Phase 2+)
- Photo upload and gallery
- Contact information management
- Behavior field persistence
- Reason for adoption tracking
- i18n support
- Auto-save with localStorage
- Draft recovery
- Pet edit functionality

## Usage Instructions for Developers

1. **Read requirements.md first:** Understand all functional requirements and acceptance criteria
2. **Review design.md:** Learn the technical architecture, component design, and implementation strategy
3. **Reference field mapping table:** Understand frontend-to-backend field transformations
4. **Follow API contract:** Implement backend endpoint matching the specified request/response formats
5. **Implement with testing:** Write tests as you implement (TDD approach recommended)
6. **Validate against Phase 1 scope:** Confirm you're only transmitting approved fields to backend

## Questions or Clarifications?

This specification is designed to be comprehensive and self-contained. If you have questions:
1. Review the relevant section in requirements.md or design.md
2. Check the field mapping and API contract sections
3. Refer to the Phase 1 scope breakdown
4. Review example test cases in design.md

---

**Specification Version:** 1.0  
**Status:** Complete - Ready for Implementation  
**Last Updated:** 2026-09-02
