# Course Completion Rating System

## Overview

This update modifies the rating and review system to require users to complete the full course (all sessions) before they can rate or review a course, instead of allowing ratings after completing just a single session.

## Changes Made

### Backend Changes

#### 1. Rating Controller (`backend/controllers/ratingController.js`)

- **Modified `createRating` function**: Now checks if the user has completed ALL sessions for a course before allowing ratings
- **Added `checkCourseCompletionStatus` function**: New endpoint to check course completion status for a user

#### 2. Review Controller (`backend/controllers/reviewController.js`)

- **Modified `createReview` function**: Now checks if the user has completed ALL sessions for a course before allowing reviews
- **Added `checkCourseCompletionStatusForReview` function**: New endpoint to check course completion status specifically for reviews

#### 3. Routes

- **Rating Routes** (`backend/routes/ratingRoutes.js`): Added route for course completion status check
- **Review Routes** (`backend/routes/reviewRoutes.js`): Added route for course completion status check

### Frontend Changes

#### 1. Rating Review Page (`frontend/src/components/pages/Rating/RatingReviewPage.jsx`)

- **Added course completion check**: Now verifies course completion before allowing ratings/reviews
- **Enhanced user experience**: Shows progress and completion status
- **Better error handling**: Redirects users if course is not completed

#### 2. New Components

- **CourseCompletionChecker** (`frontend/src/components/components/CourseCompletionChecker.jsx`): Reusable component to check and display course completion status
- **CourseCompletionExample** (`frontend/src/components/components/CourseCompletionExample.jsx`): Example of how to integrate the completion checker

## New API Endpoints

### 1. Check Course Completion Status (Ratings)
```
GET /api/v1/ratings/course-completion/:learnerID/:teacherID/:listingID
```

**Response:**
```json
{
  "success": true,
  "courseCompletion": {
    "totalSessions": 5,
    "completedSessions": 3,
    "isCompleted": false,
    "canRate": false,
    "canReview": false,
    "progress": 60,
    "sessions": [...]
  }
}
```

### 2. Check Course Completion Status (Reviews)
```
GET /api/v1/reviews/course-completion/:learnerID/:teacherID/:listingID
```

**Response:**
```json
{
  "success": true,
  "courseCompletion": {
    "totalSessions": 5,
    "completedSessions": 5,
    "isCompleted": true,
    "canReview": true,
    "hasReviewed": false,
    "progress": 100,
    "sessions": [...]
  }
}
```

## How It Works

### 1. Course Completion Logic

The system now:
- Counts all sessions booked by a learner for a specific course (teacher + listing combination)
- Checks how many of those sessions have status "completed"
- Only allows ratings/reviews when all sessions are completed

### 2. User Experience Flow

1. **User books sessions** for a course
2. **Sessions are completed** by the teacher marking them as "completed"
3. **System tracks progress** - shows completed vs total sessions
4. **User can rate/review** only after completing all sessions
5. **Clear feedback** is provided about completion status

### 3. Error Messages

- If course is not completed: "You can only rate this course after completing all sessions. You have completed X out of Y sessions."
- If no sessions booked: "You must book at least one session for this course before rating it"

## Usage Examples

### Using CourseCompletionChecker Component

```jsx
import CourseCompletionChecker from './components/CourseCompletionChecker';

// In your component
<CourseCompletionChecker
  listingId={listing._id}
  teacherId={listing.teacherID}
  onCompletionStatusChange={(status) => {
    console.log('Course completion status:', status);
  }}
  showRatingButton={true}
  showReviewButton={true}
/>
```

### Checking Completion Status Programmatically

```javascript
const checkCompletion = async () => {
  const response = await fetch(
    `http://localhost:3000/api/v1/ratings/course-completion/${userId}/${teacherId}/${listingId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  const data = await response.json();
  if (data.success && data.courseCompletion.isCompleted) {
    // Allow rating/review
  }
};
```

## Benefits

1. **More Accurate Reviews**: Users can only review after experiencing the full course
2. **Better Quality Control**: Prevents premature ratings based on single sessions
3. **Clear Progress Tracking**: Users can see their completion status
4. **Improved User Experience**: Clear feedback about when they can rate/review
5. **Data Integrity**: Ensures ratings reflect complete course experience

## Migration Notes

- Existing ratings and reviews are preserved
- New ratings/reviews require full course completion
- The system is backward compatible with existing data
- No database schema changes required

## Testing

To test the new system:

1. Create a course with multiple sessions
2. Book sessions as a learner
3. Complete some but not all sessions
4. Try to rate/review - should be blocked
5. Complete all sessions
6. Try to rate/review - should be allowed

## Future Enhancements

Potential improvements:
- Add course duration tracking
- Implement partial course ratings (per session)
- Add course completion certificates
- Track learning progress metrics
- Add course difficulty ratings
