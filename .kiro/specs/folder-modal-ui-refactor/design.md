# Design Document: Folder Modal UI Refactor

## Overview

This design document outlines the technical approach for refactoring the FolderDetailModal and StudyFlashcardsModal components in the EngBoost flashcard application. The refactoring focuses on improving code maintainability, modernizing visual design, optimizing performance, enhancing visual hierarchy, and implementing responsive design.

### Goals

- Separate business logic from presentation logic for better maintainability
- Modernize UI with consistent design system integration
- Optimize component rendering performance
- Enhance visual hierarchy for improved user experience
- Implement responsive design for mobile and tablet devices
- Improve accessibility compliance

### Non-Goals

- Backend API changes or modifications
- Changes to the flashcard data model
- Implementation of new flashcard features beyond UI improvements
- Migration to a different UI framework

### Research Findings

**React Component Architecture Best Practices:**
- Custom hooks for separating business logic from presentation (useFlashcards, useFolderOperations)
- React.memo for preventing unnecessary re-renders of child components
- useCallback and useMemo for optimizing expensive computations and function references
- Component composition pattern for better reusability

**Material-UI v5 Best Practices:**
- Use `slotProps` instead of deprecated `PaperProps`, `inputProps`
- Leverage sx prop for styling instead of inline styles
- Use theme tokens for consistent spacing and colors
- Implement responsive breakpoints using theme.breakpoints

**Performance Optimization Techniques:**
- Lazy loading images with loading="lazy" attribute
- Debouncing user input for edit operations
- Virtual scrolling for large flashcard lists (if needed in future)
- Code splitting for modal components using React.lazy

**Accessibility Standards:**
- WCAG 2.1 AA compliance for color contrast (minimum 4.5:1 for normal text)
- Keyboard navigation support (Tab, Enter, Escape, Arrow keys)
- ARIA labels for icon buttons and interactive elements
- Focus management when modals open/close
- Screen reader announcements for state changes

## Architecture

### Component Structure

The refactored architecture follows a clear separation of concerns:

```
FolderDetailModal/
├── FolderDetailModal.jsx (Container)
├── hooks/
│   ├── useFlashcards.js (Data fetching & management)
│   ├── useFolderOperations.js (Edit, delete operations)
│   └── useModalState.js (Modal state management)
├── components/
│   ├── FolderHeader.jsx (Header with title, actions)
│   ├── FlashcardList.jsx (List of flashcards)
│   ├── EmptyState.jsx (Empty folder state)
│   └── DeleteConfirmDialog.jsx (Delete confirmation)
└── StudyFlashcardsModal/
    ├── StudyFlashcardsModal.jsx (Container)
    ├── hooks/
    │   ├── useStudySession.js (Study logic & navigation)
    │   └── useFlashcardFlip.js (Flip animation state)
    └── components/
        ├── FlashcardDisplay.jsx (Card with flip animation)
        ├── StudyControls.jsx (Navigation buttons)
        └── ProgressIndicator.jsx (Current position display)
```

### Design Patterns

**Custom Hooks Pattern:**
- Encapsulate business logic in reusable hooks
- Separate data fetching, state management, and side effects
- Enable easier testing and logic reuse

**Component Composition:**
- Break down large components into smaller, focused components
- Use props for configuration and callbacks for communication
- Enable better code reuse and maintainability

**Controlled Components:**
- Parent components manage state and pass down to children
- Children components are presentational and stateless
- Clear data flow from parent to child

## Components and Interfaces

### FolderDetailModal Component

**Props Interface:**
```typescript
interface FolderDetailModalProps {
  open: boolean;
  onClose: () => void;
  folder: Folder | null;
  onEdit: (folderId: string, updates: { title: string }) => Promise<void>;
  onDelete: (folderId: string) => Promise<void>;
  onFlashcardChange?: (folderId: string, count: number) => void;
}
```

**Internal State:**
- `flashcards`: Array of flashcard objects
- `loading`: Boolean for loading state
- `editMode`: Boolean for edit mode toggle
- `folderTitle`: String for edited title
- `isUpdating`: Boolean for save operation state
- `deleteDialogOpen`: Boolean for delete confirmation
- `isStudyModalOpen`: Boolean for study modal state

### StudyFlashcardsModal Component

**Props Interface:**
```typescript
interface StudyFlashcardsModalProps {
  open: boolean;
  onClose: () => void;
  folder: Folder;
}
```

**Internal State:**
- `flashcards`: Array of flashcard objects
- `currentIndex`: Number for current flashcard position
- `isFlipped`: Boolean for flip state
- `isLoading`: Boolean for loading state
- `isShuffled`: Boolean for shuffle state

### Custom Hooks

**useFlashcards Hook:**
```typescript
interface UseFlashcardsReturn {
  flashcards: Flashcard[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  removeFlashcard: (cardId: string) => Promise<void>;
}

function useFlashcards(folderId: string | null): UseFlashcardsReturn
```

**useFolderOperations Hook:**
```typescript
interface UseFolderOperationsReturn {
  editMode: boolean;
  folderTitle: string;
  isUpdating: boolean;
  setEditMode: (mode: boolean) => void;
  setFolderTitle: (title: string) => void;
  saveEdit: () => Promise<void>;
  deleteFolder: () => Promise<void>;
}

function useFolderOperations(
  folder: Folder | null,
  onEdit: (id: string, updates: any) => Promise<void>,
  onDelete: (id: string) => Promise<void>,
  onClose: () => void
): UseFolderOperationsReturn
```

**useStudySession Hook:**
```typescript
interface UseStudySessionReturn {
  currentIndex: number;
  isFlipped: boolean;
  goToNext: () => void;
  goToPrevious: () => void;
  flipCard: () => void;
  shuffle: () => void;
  isShuffled: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

function useStudySession(flashcards: Flashcard[]): UseStudySessionReturn
```

### Shared Components

**EmptyState Component:**
```typescript
interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}
```

**FlashcardDisplay Component:**
```typescript
interface FlashcardDisplayProps {
  flashcard: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
}
```

## Data Models

### Folder Model
```typescript
interface Folder {
  id?: string;
  _id?: string;
  title: string;
  flashcard_count: number;
  created_at?: string;
  updated_at?: string;
}
```

### Flashcard Model
```typescript
interface Flashcard {
  id?: string;
  _id?: string;
  english: string;
  vietnamese: string;
  image_url?: string;
  folder_id: string;
  created_at?: string;
  updated_at?: string;
}
```

### API Response Models
```typescript
interface FlashcardsResponse {
  data: Flashcard[];
  message?: string;
}

interface FolderUpdateRequest {
  title: string;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing the acceptance criteria, I identified the following testable properties and examples. Many requirements focus on visual design, code organization, and performance metrics that are not suitable for automated property-based testing. The testable requirements fall into these categories:

- **UI Rendering Properties**: Testing that UI elements render correctly based on state
- **Navigation Properties**: Testing that navigation controls work correctly across all flashcard positions
- **Theme Consistency Properties**: Testing that components use theme values consistently
- **Error Handling Properties**: Testing that async operations show proper loading/error states
- **Accessibility Properties**: Testing that interactive elements have proper ARIA labels

**Redundancy Analysis:**
- Properties 9.1, 9.2, 9.4, and 9.5 all test theme consistency and can be combined into a single comprehensive property
- Properties 10.4 and 10.5 both test async operation states and can be combined

### Property 1: Study Session Navigation Correctness

*For any* list of flashcards and any valid index position, navigating to the next flashcard should increment the index by 1, and navigating to the previous flashcard should decrement the index by 1, maintaining the index within valid bounds [0, length-1].

**Validates: Requirements 7.3**

### Property 2: Progress Indicator Accuracy

*For any* list of flashcards and any current index, the progress indicator should display the current position as (index + 1) and the total count as the length of the flashcard array.

**Validates: Requirements 7.2**

### Property 3: Theme Consistency

*For any* modal component element, all color values, border radius values, spacing units, and typography variants should match the corresponding values defined in the application theme configuration.

**Validates: Requirements 9.1, 9.2, 9.4, 9.5**

### Property 4: Async Operation State Management

*For any* asynchronous operation (loading flashcards, updating folder, deleting folder), the UI should display a loading indicator while the operation is in progress and disable interactive elements to prevent concurrent operations.

**Validates: Requirements 10.4, 10.5**

### Property 5: Icon Button Accessibility

*For any* icon button in the modal components, the button should have an aria-label attribute or accessible name that describes its purpose.

**Validates: Requirements 8.2**

## Error Handling

### Error Categories

**Network Errors:**
- API request failures (timeout, connection refused, 5xx errors)
- Handle with user-friendly error messages and retry options
- Display error boundary for unexpected errors

**Validation Errors:**
- Empty folder title during edit
- Invalid flashcard data
- Handle with inline validation messages

**State Errors:**
- Missing folder data
- Invalid flashcard index
- Handle with defensive checks and fallback UI

### Error Handling Strategy

**API Error Handling:**
```typescript
try {
  const response = await getFlashcardsByFolderAPI(folderId);
  setFlashcards(response.data);
} catch (error) {
  if (error.response?.status >= 500) {
    showError('Server error. Please try again later.');
  } else if (error.code === 'ECONNABORTED') {
    showError('Request timeout. Please check your connection.');
  } else {
    showError('Failed to load flashcards. Please try again.');
  }
  setFlashcards([]);
}
```

**Validation Error Handling:**
```typescript
const validateFolderTitle = (title: string): string | null => {
  if (!title.trim()) {
    return 'Folder title cannot be empty';
  }
  if (title.length > 100) {
    return 'Folder title is too long (max 100 characters)';
  }
  return null;
};
```

**Defensive State Checks:**
```typescript
// Always check for null/undefined before accessing properties
const folderId = folder?.id || folder?._id;
if (!folderId) {
  console.error('Invalid folder data');
  return null;
}

// Validate array indices before access
const currentCard = flashcards[currentIndex];
if (!currentCard) {
  console.error('Invalid flashcard index');
  return;
}
```

### Error Recovery

**Retry Mechanism:**
- Provide retry button for failed API requests
- Implement exponential backoff for automatic retries
- Clear error state on successful retry

**Graceful Degradation:**
- Show empty state when flashcards fail to load
- Allow modal to close even if operations fail
- Preserve user input during validation errors

**User Feedback:**
- Toast notifications for operation success/failure
- Inline error messages for validation errors
- Loading indicators during async operations

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests** focus on:
- Specific examples of component rendering
- Edge cases (empty folders, single flashcard, boundary conditions)
- Error conditions and error handling
- User interaction flows (click, keyboard navigation)
- Integration between components

**Property-Based Tests** focus on:
- Universal properties that hold for all inputs
- Navigation correctness across all flashcard positions
- Theme consistency across all components
- State management correctness for any valid state

### Property-Based Testing Configuration

**Library Selection:**
- Use `fast-check` for JavaScript/React property-based testing
- Integrates well with Jest testing framework
- Provides generators for common data types

**Test Configuration:**
- Each property test runs minimum 100 iterations
- Use custom generators for domain models (Folder, Flashcard)
- Tag each test with feature name and property reference

**Example Property Test:**
```javascript
import fc from 'fast-check';

describe('Study Session Navigation', () => {
  it('should maintain valid index bounds when navigating', () => {
    // Feature: folder-modal-ui-refactor, Property 1: Study Session Navigation Correctness
    fc.assert(
      fc.property(
        fc.array(flashcardGenerator(), { minLength: 1, maxLength: 50 }),
        fc.integer({ min: 0, max: 49 }),
        (flashcards, startIndex) => {
          const validIndex = startIndex % flashcards.length;
          const { result } = renderHook(() => 
            useStudySession(flashcards, validIndex)
          );
          
          // Test next navigation
          if (validIndex < flashcards.length - 1) {
            act(() => result.current.goToNext());
            expect(result.current.currentIndex).toBe(validIndex + 1);
          }
          
          // Test previous navigation
          if (validIndex > 0) {
            act(() => result.current.goToPrevious());
            expect(result.current.currentIndex).toBe(validIndex - 1);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Testing Strategy

**Component Testing:**
- Use React Testing Library for component tests
- Test user interactions and accessibility
- Mock API calls with MSW (Mock Service Worker)

**Hook Testing:**
- Use @testing-library/react-hooks for custom hook tests
- Test state transitions and side effects
- Verify cleanup on unmount

**Example Unit Test:**
```javascript
describe('FolderDetailModal', () => {
  it('should display empty state when folder has no flashcards', () => {
    const folder = { id: '1', title: 'Test Folder', flashcard_count: 0 };
    render(
      <FolderDetailModal 
        open={true} 
        folder={folder} 
        onClose={jest.fn()} 
      />
    );
    
    expect(screen.getByText('Chưa có flashcard nào')).toBeInTheDocument();
    expect(screen.getByText('Tạo Flashcard Đầu Tiên')).toBeInTheDocument();
  });
  
  it('should disable navigation at boundaries', () => {
    // Feature: folder-modal-ui-refactor, Edge case for Property 1
    const flashcards = [createFlashcard(), createFlashcard()];
    render(<StudyFlashcardsModal flashcards={flashcards} />);
    
    // At first flashcard, previous should be disabled
    const prevButton = screen.getByLabelText('Previous flashcard');
    expect(prevButton).toBeDisabled();
    
    // Navigate to last flashcard
    const nextButton = screen.getByLabelText('Next flashcard');
    fireEvent.click(nextButton);
    
    // At last flashcard, next should be disabled
    expect(nextButton).toBeDisabled();
  });
});
```

### Test Coverage Goals

- **Line Coverage**: Minimum 80%
- **Branch Coverage**: Minimum 75%
- **Function Coverage**: Minimum 85%
- **Property Tests**: All 5 correctness properties implemented
- **Unit Tests**: All edge cases and examples from prework covered

### Testing Tools

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **fast-check**: Property-based testing library
- **MSW**: API mocking for integration tests
- **@testing-library/react-hooks**: Custom hook testing
- **@testing-library/user-event**: User interaction simulation

### Continuous Integration

- Run all tests on every pull request
- Enforce minimum coverage thresholds
- Run property tests with increased iterations (500) in CI
- Generate coverage reports and track trends
