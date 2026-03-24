# Implementation Plan: Folder Modal UI Refactor

## Overview

This implementation plan refactors the FolderDetailModal and StudyFlashcardsModal components to improve code maintainability, modernize visual design, optimize performance, and implement responsive design. The refactoring follows React best practices with custom hooks for business logic separation and component composition for reusability.

## Tasks

- [-] 1. Set up project structure and create custom hooks
  - [x] 1.1 Create hooks directory structure under FolderDetailModal
    - Create `engboost-frontend/src/pages/UserPage/Flashcard/FlashcardTab/Folders/FolderDetailModal/hooks/` directory
    - _Requirements: 1.1, 1.2, 1.5_

  - [x] 1.2 Implement useFlashcards hook for data fetching
    - Create `useFlashcards.js` hook with flashcard fetching, loading state, error handling, and refetch functionality
    - Return flashcards array, loading boolean, error object, refetch function, and removeFlashcard function
    - _Requirements: 1.1, 1.5, 3.3, 10.1_

  - [ ] 1.3 Implement useFolderOperations hook for edit/delete operations
    - Create `useFolderOperations.js` hook managing edit mode, folder title state, update operations, and delete operations
    - Handle async operation states (isUpdating) and integrate with parent callbacks
    - _Requirements: 1.1, 1.5, 10.2, 10.5_

  - [x] 1.4 Implement useStudySession hook for study navigation logic
    - Create `useStudySession.js` hook managing current index, flip state, navigation functions (next/previous), shuffle functionality
    - Include boundary checks (canGoNext, canGoPrevious) to prevent invalid navigation
    - _Requirements: 1.1, 1.5, 7.3, 7.5_

  - [ ]*  1.5 Write property test for study session navigation
    - **Property 1: Study Session Navigation Correctness**
    - **Validates: Requirements 7.3**
    - Use fast-check to generate random flashcard arrays and test that navigation maintains valid index bounds
    - _Requirements: 7.3, 7.5_

- [ ] 2. Create reusable presentational components
  - [ ] 2.1 Create components directory structure
    - Create `engboost-frontend/src/pages/UserPage/Flashcard/FlashcardTab/Folders/FolderDetailModal/components/` directory
    - _Requirements: 1.2_

  - [ ] 2.2 Implement FolderHeader component
    - Create `FolderHeader.jsx` displaying folder title, flashcard count badge, edit/delete action menu
    - Use Material-UI components with theme integration for consistent styling
    - Include edit mode toggle with TextField for inline editing
    - _Requirements: 1.2, 2.1, 2.4, 6.1, 6.2, 6.4, 9.1, 9.3_

  - [ ] 2.3 Implement EmptyState component
    - Create `EmptyState.jsx` as reusable component accepting icon, title, description, and action props
    - Apply modern spacing and visual hierarchy with centered layout
    - _Requirements: 1.2, 2.2, 4.1, 6.3_

  - [ ] 2.4 Implement FlashcardList component
    - Create `FlashcardList.jsx` displaying list of flashcards with delete actions
    - Use Material-UI List components with consistent spacing and hover effects
    - _Requirements: 1.2, 2.1, 2.2, 4.3_

  - [ ] 2.5 Implement DeleteConfirmDialog component
    - Create `DeleteConfirmDialog.jsx` for folder deletion confirmation
    - Include clear warning message and primary/secondary action buttons
    - _Requirements: 1.2, 4.1, 10.2_

  - [ ] 2.6 Implement FlashcardDisplay component with flip animation
    - Create `FlashcardDisplay.jsx` showing flashcard with flip animation using CSS transforms
    - Display English text on front, Vietnamese on back, and image if available
    - Ensure flip animation completes within 600ms using CSS transitions
    - _Requirements: 1.2, 2.3, 3.2, 7.1, 7.4_

  - [ ] 2.7 Implement StudyControls component
    - Create `StudyControls.jsx` with previous/next navigation buttons
    - Disable buttons at boundaries (first/last flashcard) based on props
    - Include shuffle button and flip button with clear visual hierarchy
    - _Requirements: 1.2, 4.1, 4.5, 7.3, 7.5_

  - [ ] 2.8 Implement ProgressIndicator component
    - Create `ProgressIndicator.jsx` displaying current position and total count (e.g., "3 / 10")
    - Use prominent typography and positioning for visibility
    - _Requirements: 1.2, 4.2, 7.2_

  - [ ]*  2.9 Write property test for progress indicator accuracy
    - **Property 2: Progress Indicator Accuracy**
    - **Validates: Requirements 7.2**
    - Test that for any flashcard array and index, progress displays (index + 1) / length
    - _Requirements: 7.2_

- [ ] 3. Refactor FolderDetailModal container component
  - [ ] 3.1 Refactor FolderDetailModal to use custom hooks
    - Replace inline logic with useFlashcards and useFolderOperations hooks
    - Remove unused imports and deprecated props
    - Organize state management using custom hooks
    - _Requirements: 1.1, 1.3, 1.4, 1.5_

  - [ ] 3.2 Integrate presentational components into FolderDetailModal
    - Replace inline JSX with FolderHeader, FlashcardList, EmptyState, and DeleteConfirmDialog components
    - Pass appropriate props and callbacks to child components
    - _Requirements: 1.2, 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 3.3 Apply modern Material-UI styling with sx prop
    - Replace inline styles with sx prop using theme tokens
    - Use theme.spacing, theme.palette, and theme.shape for consistency
    - Apply rounded corners, shadows, and modern spacing values
    - _Requirements: 2.1, 2.2, 2.4, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ] 3.4 Implement responsive design for mobile screens
    - Add responsive breakpoints using theme.breakpoints.down('sm')
    - Adjust modal width, button layout (vertical stacking), and font sizes for mobile
    - Ensure touch targets are minimum 44x44 pixels
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 3.5 Add loading and error states with user feedback
    - Display CircularProgress during flashcard loading
    - Show error messages with retry button on API failures
    - Disable actions during async operations to prevent race conditions
    - _Requirements: 3.1, 10.1, 10.3, 10.4, 10.5_

  - [ ]*  3.6 Write property test for async operation state management
    - **Property 4: Async Operation State Management**
    - **Validates: Requirements 10.4, 10.5**
    - Test that loading indicators appear and interactive elements are disabled during async operations
    - _Requirements: 10.4, 10.5_

- [ ] 4. Refactor StudyFlashcardsModal container component
  - [x] 4.1 Refactor StudyFlashcardsModal to use useStudySession hook
    - Replace inline navigation logic with useStudySession hook
    - Remove unused state and simplify component structure
    - _Requirements: 1.1, 1.3, 1.4, 1.5_

  - [ ] 4.2 Integrate FlashcardDisplay, StudyControls, and ProgressIndicator components
    - Replace inline JSX with presentational components
    - Wire up flip, navigation, and shuffle callbacks
    - _Requirements: 1.2, 7.1, 7.2, 7.3_

  - [x] 4.3 Apply modern Material-UI styling and theme integration
    - Use sx prop with theme tokens for consistent styling
    - Apply smooth transitions for card flip and navigation
    - Create immersive, distraction-free layout with high visual prominence for flashcard
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 7.1, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 4.4 Implement responsive design for study modal
    - Add responsive breakpoints for mobile and tablet
    - Adjust card size, button layout, and font sizes
    - Maintain readability and touch target sizes on all devices
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 4.5 Optimize image loading with lazy loading
    - Add loading="lazy" attribute to flashcard images
    - Implement proper aspect ratio handling for images
    - _Requirements: 3.4, 7.4_

  - [ ]*  4.6 Write property test for theme consistency
    - **Property 3: Theme Consistency**
    - **Validates: Requirements 9.1, 9.2, 9.4, 9.5**
    - Test that all styled elements use theme values for colors, spacing, border radius, and typography
    - _Requirements: 9.1, 9.2, 9.4, 9.5_

- [ ] 5. Implement accessibility improvements
  - [x] 5.1 Add ARIA labels to all icon buttons
    - Add aria-label props to edit, delete, close, previous, next, flip, and shuffle buttons
    - Ensure labels clearly describe button purpose
    - _Requirements: 8.2_

  - [ ] 5.2 Implement keyboard navigation support
    - Add keyboard event handlers for Tab, Enter, Escape, and Arrow keys
    - Enable keyboard navigation for all interactive elements
    - _Requirements: 8.1_

  - [ ] 5.3 Implement focus management for modals
    - Set initial focus when modal opens
    - Trap focus within modal while open
    - Restore focus to trigger element when modal closes
    - _Requirements: 8.3_

  - [ ] 5.4 Verify color contrast ratios
    - Ensure all text meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
    - Use theme colors that meet contrast requirements
    - _Requirements: 8.4_

  - [ ]*  5.5 Write property test for icon button accessibility
    - **Property 5: Icon Button Accessibility**
    - **Validates: Requirements 8.2**
    - Test that all icon buttons have aria-label or accessible name
    - _Requirements: 8.2_

  - [ ]*  5.6 Write unit tests for keyboard navigation
    - Test Tab navigation through interactive elements
    - Test Escape key closes modal
    - Test Arrow keys navigate between flashcards in study mode
    - _Requirements: 8.1_

- [ ] 6. Performance optimization and React.memo implementation
  - [ ] 6.1 Wrap presentational components with React.memo
    - Apply React.memo to FolderHeader, FlashcardList, EmptyState, FlashcardDisplay, StudyControls, ProgressIndicator
    - Prevent unnecessary re-renders when props haven't changed
    - _Requirements: 3.3_

  - [ ] 6.2 Optimize callbacks with useCallback
    - Wrap event handlers and callbacks with useCallback to maintain referential equality
    - Include proper dependency arrays
    - _Requirements: 3.3_

  - [ ] 6.3 Optimize expensive computations with useMemo
    - Use useMemo for derived state and expensive calculations
    - Memoize filtered or sorted flashcard arrays
    - _Requirements: 3.3_

  - [ ]*  6.4 Write unit tests for performance optimizations
    - Test that memoized components don't re-render when props are unchanged
    - Verify useCallback maintains function reference across renders
    - _Requirements: 3.3_

- [ ] 7. Checkpoint - Ensure all tests pass and review implementation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Final integration and validation
  - [ ] 8.1 Test complete user flows end-to-end
    - Test opening folder detail modal, editing folder title, deleting folder
    - Test starting study session, navigating flashcards, flipping cards, shuffling
    - Test empty state and error state handling
    - _Requirements: All requirements_

  - [ ] 8.2 Verify responsive design on different screen sizes
    - Test on mobile (< 600px), tablet (600-960px), and desktop (> 960px)
    - Verify layout, spacing, and touch targets on each breakpoint
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 8.3 Validate accessibility with screen reader
    - Test with screen reader to verify announcements and navigation
    - Verify focus management and keyboard navigation
    - _Requirements: 8.1, 8.2, 8.3, 8.5_

  - [ ]*  8.4 Run performance profiling
    - Use React DevTools Profiler to measure render times
    - Verify initial modal render < 200ms, flip animation < 600ms, navigation < 100ms
    - _Requirements: 3.1, 3.2, 3.5_

- [ ] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The refactoring uses React best practices with custom hooks and component composition
- Material-UI v5 patterns are used throughout (sx prop, theme tokens, slotProps)
- Property-based tests use fast-check library integrated with Jest
- All components maintain backward compatibility with existing parent components
