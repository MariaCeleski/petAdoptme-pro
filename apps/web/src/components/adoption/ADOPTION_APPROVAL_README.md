# Adoption Approval System

This directory contains components for the adoption approval workflow that allows pet owners to review and manage adoption requests.

## Components

### AdoptionRequest
Displays a single adoption request for pet owner review.

**Features:**
- Displays pet information (name, species, breed, age, size, gender, images)
- Shows adopter personal information
- Displays living situation details
- Shows adopter experience with animals
- Shows motivations for adoption
- Approve/Reject buttons for pending requests
- Status badge showing request status
- Formatted date display

**Usage:**
```jsx
<AdoptionRequest
  adoption={adoptionData}
  onStatusChange={handleStatusChange}
  canApprove={true}
  isLoading={false}
/>
```

**Requirements Met:**
- Requirement 6.5: Allow approval, rejection, or maintaining pending status
- Requirement 6.6: Notify Adopter via email on approval/rejection

### AdoptionRequestList
Displays a list of adoption requests with filtering capabilities.

**Features:**
- Filter by status (All, Pending, Approved, Rejected, Completed)
- Status counts for each filter
- Refresh button to reload requests
- Loading state with skeletons
- Empty state with helpful messaging
- Responsive design
- Disclaimer for careful review

**Usage:**
```jsx
<AdoptionRequestList
  adoptions={adoptionsArray}
  isLoading={false}
  onRefresh={handleRefresh}
  showStatusFilter={true}
  canApprove={true}
/>
```

**Requirements Met:**
- Requirement 6.5: Allow reviewing multiple requests
- Requirement 6.8: Track adoption request history and status

### ApprovalModal
Modal for confirming adoption approval.

**Features:**
- Confirmation message with pet and adopter names
- Optional notes textarea (up to 500 characters)
- Character counter
- Loading state during submission
- Cancel/Approve buttons
- Auto-clears state on close

**Usage:**
```jsx
<ApprovalModal
  isOpen={showModal}
  onClose={handleClose}
  onConfirm={handleApprove}
  petName="Rex"
  adopterName="João Silva"
  isLoading={false}
/>
```

**Requirements Met:**
- Requirement 6.5: Allow approval of adoption requests
- Requirement 6.6: Trigger email notification on approval

### RejectionModal
Modal with form for collecting rejection reason.

**Features:**
- Dropdown with predefined rejection reasons
- Custom reason textarea for "Other" option
- Form validation
- Character counter (up to 500 characters)
- Error messages for validation failures
- Loading state during submission
- Cancel/Reject buttons
- Auto-clears state on close

**Predefined Reasons:**
- Situação de moradia incompatível
- Experiência insuficiente com animais
- Preocupações sobre cuidado
- Falta de tempo para dedicar
- Outro motivo

**Usage:**
```jsx
<RejectionModal
  isOpen={showModal}
  onClose={handleClose}
  onSubmit={handleReject}
  petName="Rex"
  adopterName="João Silva"
  isLoading={false}
/>
```

**Requirements Met:**
- Requirement 6.5: Allow rejection of adoption requests
- Requirement 6.6: Trigger email notification on rejection

## Pages

### /dashboard/adoptions
Main page for pet owners to manage adoption requests.

**Features:**
- List all adoption requests for user's pets
- Redirect non-owners to dashboard
- Loading and error states
- Refresh functionality

**Usage:**
Only accessible to users with type SHELTER_ADMIN or INDIVIDUAL_OWNER.

## API Integration

All components interact with:
- `GET /api/adoptions` - Fetch adoption requests
- `PATCH /api/adoptions/[id]` - Update adoption status

## Styling

All components use CSS Modules with:
- Responsive design (mobile-first approach)
- Breakpoints: 768px (tablet), 640px (mobile)
- Consistent color scheme with existing design system
- Accessible form inputs and buttons

## Responsive Design

### Desktop (1024px+)
- Full information display
- Side-by-side layouts
- Multi-column grids

### Tablet (768px - 1023px)
- Stacked layouts
- Adjusted spacing
- Full-width components

### Mobile (< 640px)
- Single column
- Simplified filter buttons
- Touch-friendly buttons
- Vertical stacking

## Accessibility

- Semantic HTML structure
- ARIA labels where appropriate
- Keyboard navigation support
- Focus management in modals
- Clear error messages
- Readable font sizes and colors

## Testing

Unit tests are provided for:
- AdoptionRequest component
- AdoptionRequestList component
- ApprovalModal component
- RejectionModal component

Test coverage includes:
- Rendering with various props
- User interactions (clicks, form inputs)
- Status transitions
- Error states
- Loading states
- Edge cases

## Error Handling

All components include:
- Try-catch error handling
- User-friendly error messages
- Error state displays
- Disabled buttons during errors
- Console logging for debugging

## Future Enhancements

- Email preview before sending
- Bulk actions (approve/reject multiple)
- Request filtering by date range
- Adopter profile page
- Request timeline/history view
- Automatic follow-ups for pending requests
