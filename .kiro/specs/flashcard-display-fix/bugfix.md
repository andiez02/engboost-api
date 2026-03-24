# Bugfix Requirements Document

## Introduction

When users open a folder in the FolderDetailModal, flashcards are not displayed even though the API successfully returns flashcard data. The backend returns the response in the format `{ success: true, data: flashcards }`, but the frontend code incorrectly attempts to use the entire response object as an array instead of accessing the nested `data` property. This causes the flashcard list to always be empty, preventing users from viewing their saved flashcards.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a folder is opened in FolderDetailModal THEN the system displays "Chưa có flashcard nào" (no flashcards) even though the API returns flashcard data successfully

1.2 WHEN the API response `{ success: true, data: [flashcards] }` is received THEN the system checks if the entire response object is an array (which it is not) and sets flashcards to an empty array

1.3 WHEN flashcards exist in a folder THEN the system fails to render any flashcard cards in the UI

### Expected Behavior (Correct)

2.1 WHEN a folder is opened in FolderDetailModal THEN the system SHALL extract flashcards from `response.data` and display them in the UI

2.2 WHEN the API response `{ success: true, data: [flashcards] }` is received THEN the system SHALL access the nested `data` property to retrieve the flashcard array

2.3 WHEN flashcards exist in a folder THEN the system SHALL render each flashcard using the Cards component with the correct data mapping

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a folder has no flashcards (API returns empty array) THEN the system SHALL CONTINUE TO display the "Chưa có flashcard nào" empty state message

3.2 WHEN the API request fails or returns an error THEN the system SHALL CONTINUE TO handle the error gracefully and set flashcards to an empty array

3.3 WHEN a flashcard is removed from the folder THEN the system SHALL CONTINUE TO update the local state and Redux store correctly

3.4 WHEN the loading state is active THEN the system SHALL CONTINUE TO display the CircularProgress spinner
