# AdoptionForm Component

Comprehensive adoption form component for collecting adopter information and preferences.

## Overview

The `AdoptionForm` component provides a complete form for pet adoption with:
- **Personal Information Collection**: Name, phone, address, city, state, zip code
- **Housing Situation Assessment**: Type of housing, ownership status, landlord approval (if renting)
- **Pet Experience Section**: Previous pet ownership, current pets, veterinarian reference
- **Motivation & Commitment**: Reasons for adoption, expected commitment level, available time

## Features

- **Complete Zod Validation**: All fields validated using the `adoptionSchema` from `@/lib/validation/schemas.js`
- **Form State Management**: Uses `useReducer` for predictable state handling
- **Conditional Fields**: Landlord approval field only appears when housing is rented
- **Dynamic Pet List**: Add/remove current pets with inline form
- **Error Handling**: Displays validation errors for each field
- **Loading States**: Shows loading indicator during submission
- **Accessibility**: Proper labels, ARIA attributes, keyboard navigation
- **Responsive Design**: Works on mobile, tablet, and desktop

## Requirements Met

- **Requirement 6.1**: WHEN Adopter clicks "Express Interest", THE Adoption_Workflow SHALL display adoption form
- **Requirement 6.2**: THE Adoption_Workflow SHALL require Adopter personal information and living situation details

## Usage

### Basic Usage

```jsx
import { AdoptionForm } from '@/components/adoption';

export default function AdoptionPage() {
  const petId = 'pet-123';

  const handleSubmit = async (formData) => {
    // formData structure:
    // {
    //   petId: string,
    //   adopterInfo: {
    //     personalInfo: { fullName, phone, address, city, state, zipCode },
    //     livingSituation: { housingType, hasYard, ownRent, landlordApproval },
    //     experience: { hadPetsBefore, currentPets, veterinarianInfo },
    //     motivation: { whyAdopt, expectedCommitment, availableTime }
    //   }
    // }

    const response = await fetch('/api/adoptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error('Adoption request failed');
    }

    return response.json();
  };

  const handleSuccess = () => {
    console.log('Adoption form submitted successfully');
  };

  return (
    <AdoptionForm
      petId={petId}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
    />
  );
}
```

### With Error and Loading States

```jsx
import { useState } from 'react';
import { AdoptionForm } from '@/components/adoption';

export default function AdoptionModal({ petId, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/adoptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit adoption form');
      }

      setSuccessMessage('Solicitação enviada com sucesso! O proprietário entrará em contato em breve.');
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdoptionForm
      petId={petId}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
      successMessage={successMessage}
    />
  );
}
```

## Props

### `petId` (required)

Type: `string`

The ID of the pet the user is expressing interest in adopting. This is included in the form submission data.

### `onSubmit` (required)

Type: `(formData: AdoptionFormData) => Promise<void>`

Callback function called when the form is submitted with valid data. Must be an async function.

### `onSuccess` (optional)

Type: `() => void`

Callback function called after successful form submission.

### `isLoading` (optional)

Type: `boolean`
Default: `false`

Controls the loading state of the submit button. Set to `true` while submitting.

### `error` (optional)

Type: `string | null`
Default: `null`

Error message to display at the top of the form. If provided, an error alert will be shown.

### `successMessage` (optional)

Type: `string | null`
Default: `null`

Success message to display at the top of the form. If provided, a success alert will be shown.

### `className` (optional)

Type: `string`
Default: `''`

Additional CSS class names to apply to the root form element.

## Form Data Structure

The form collects data in the following structure (matches `adoptionSchema` from Zod):

```typescript
interface AdoptionFormData {
  petId: string;
  adopterInfo: {
    personalInfo: {
      fullName: string;        // Min 2 chars, max 100
      phone: string;           // Min 10 digits
      address: string;         // Min 10 chars, max 200
      city: string;            // Min 2 chars, max 50
      state: string;           // Min 2 chars, max 50
      zipCode: string;         // Format: XXXXX-XXX or XXXXXXXX
    };
    livingSituation: {
      housingType: 'apartment' | 'house' | 'farm' | 'other';
      hasYard: boolean;
      ownRent: 'own' | 'rent';
      landlordApproval: boolean | null;  // Required if ownRent === 'rent'
    };
    experience: {
      hadPetsBefore: boolean;
      currentPets: Array<{        // Max 10 pets
        species: string;
        breed: string;
        age: string;
      }>;
      veterinarianInfo: string | null;  // Max 200 chars
    };
    motivation: {
      whyAdopt: string;              // Min 20 chars, max 1000
      expectedCommitment: string;    // Min 10 chars, max 500
      availableTime: string;         // Min 5 chars, max 200
    };
  };
}
```

## Validation

The form uses the `adoptionSchema` from `@/lib/validation/schemas.js` for comprehensive validation:

- All text fields are sanitized to prevent XSS attacks
- Phone numbers must have valid format
- ZIP codes must be in the format XXXXX-XXX (Brazilian format)
- Text areas have minimum length requirements for motivation fields
- When housing status is "rent", landlord approval is required
- Current pets array is limited to 10 items
- All addresses must be detailed (minimum 10 characters)

## Sections

### 1. Informações Pessoais (Personal Information)

Collects basic contact information:
- Full name
- Phone number
- Complete address (street, number, complement)
- City
- State
- ZIP code

### 2. Situação de Moradia (Housing Situation)

Assesses living conditions:
- Type of housing (apartment, house, farm, other)
- Whether there's a yard
- Housing ownership (own or rent)
- Landlord approval (conditional, shown only if renting)

### 3. Experiência com Animais (Pet Experience)

Evaluates adopter's pet experience:
- Checkbox for previous pet ownership
- Dynamic list to add/remove current pets
- Optional veterinarian contact information

### 4. Motivação e Comprometimento (Motivation & Commitment)

Understands adoption motivation:
- Why they want to adopt (min 20 chars)
- Expected commitment level (min 10 chars)
- Available time for pet care (min 5 chars)

## Styling

The component uses CSS Modules with a custom color scheme:

- **Primary Color**: `#ff8c42` (Orange)
- **Error Color**: `#ef4444` (Red)
- **Success Color**: `#22c55e` (Green)

### Key CSS Classes

- `.adoptionForm` - Main form container
- `.formSection` - Individual form section
- `.sectionTitle` - Section heading with numbered badge
- `.formGrid` - Responsive grid for form inputs
- `.textareaGroup` - Textarea with label
- `.currentPetsList` - List of added pets
- `.errorAlert` / `.successAlert` - Alert containers
- `.submitButton` - Submit button

## Testing

Two test suites are included:

### Unit Tests (`AdoptionForm.test.js`)

Tests component rendering, state management, user interactions, and validation:

```bash
npm run test -- src/components/adoption/AdoptionForm/AdoptionForm.test.js
```

Tests cover:
- Form rendering and field presence
- Input state changes
- Conditional field visibility
- Current pets management
- Form validation
- Form submission
- Error and success states
- Accessibility features
- Responsive design

### Integration Tests (`AdoptionForm.integration.test.js`)

Tests Zod schema validation with realistic adoption data:

```bash
npm run test -- src/components/adoption/AdoptionForm/AdoptionForm.integration.test.js
```

Tests cover:
- Valid adoption data scenarios
- Personal information validation
- Living situation validation
- Pet experience validation
- Motivation field validation
- Landlord approval requirements
- Sanitization of HTML/XSS content
- Optional field handling

## Accessibility

The component includes:

- Proper label associations for all form inputs
- Required field indicators (*)
- ARIA attributes for error messages
- Keyboard navigation support
- Focus management
- Semantic HTML structure
- Screen reader friendly

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- React 19.x with hooks (`useState`, `useReducer`, `useCallback`)
- Next.js 16.x
- UI Components: `Button`, `Input`, `Select`, `Card` from `@/components/ui`
- Zod: `adoptionSchema` from `@/lib/validation/schemas.js`
- Icons: Lucide React (`HeartIcon`, `AlertCircleIcon`, `CheckCircleIcon`, `LoaderIcon`)

## Performance Considerations

- Uses `useReducer` for efficient state management
- `useCallback` memoizes event handlers to prevent unnecessary re-renders
- Conditional rendering for landlord approval field
- CSS Modules for scoped styling
- Lazy loading of pet input form

## Security

- All text input is sanitized through the Zod schema
- HTML/XSS prevention in sanitizers
- No dangerous HTML allowed in any field
- Phone number and ZIP code format validation
- Server-side validation required in API routes

## Examples

### Full Integration with ExpressInterestModal

```jsx
import { useState } from 'react';
import { AdoptionForm } from '@/components/adoption';
import { Modal } from '@/components/ui';

export function PetInterestFlow({ pet }) {
  const [showAdoptionForm, setShowAdoptionForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleAdoptionSubmit = async (formData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/adoptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit adoption form');
      }

      // Notify pet owner
      await fetch('/api/notifications/adoption-submitted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petId: pet.id,
          petName: pet.name,
          ownerId: pet.ownerId
        })
      });

      setShowAdoptionForm(false);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button onClick={() => setShowAdoptionForm(true)}>
        Manifestar Interesse
      </button>

      <Modal
        isOpen={showAdoptionForm}
        onClose={() => setShowAdoptionForm(false)}
      >
        <AdoptionForm
          petId={pet.id}
          onSubmit={handleAdoptionSubmit}
          isLoading={isSubmitting}
          error={submitError}
        />
      </Modal>
    </>
  );
}
```

## Troubleshooting

### Form not submitting

- Check that all required fields are filled
- Verify form data passes validation (check browser console for validation errors)
- Ensure `onSubmit` callback is properly handling the form data

### Landlord approval field not showing

- Check that `ownRent` value is set to `'rent'`
- The field appears conditionally only when renting

### Validation errors not displaying

- Errors only display after form submission attempt
- Check the validation schema in `@/lib/validation/schemas.js`
- Use browser DevTools to inspect validation errors in console

## Related Components

- `ExpressInterestModal` - Modal wrapper for adoption form
- `PetDetails` - Shows pet information with "Express Interest" button
- UI Components: `Button`, `Input`, `Select`, `Card`, `Modal`

## Future Enhancements

- Multi-step form wizard (progressive disclosure)
- Document upload for references
- Automatic address lookup via API
- SMS notifications during adoption process
- Mobile-optimized redesign
- Language localization options
