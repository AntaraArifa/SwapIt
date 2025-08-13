import express from "express";
import * as reviewController from "../controllers/reviewController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Create a new review
router.post('/create', isAuthenticated, reviewController.createReview);

// Update an existing review
router.put('/update/:id', isAuthenticated, reviewController.updateReview);

// Delete a review
router.delete('/delete/:id', isAuthenticated, reviewController.deleteReview);

// Get user's own reviews (must come before /:id route)
router.get('/user/my-reviews', isAuthenticated, reviewController.getMyReviews);

// Get reviews received by current user (when they were a teacher)
router.get('/user/my-received-reviews', isAuthenticated, reviewController.getMyReceivedReviews);

// Debug route to check existing reviews
router.get('/debug/check-existing', isAuthenticated, reviewController.checkExistingReviews);

// DEVELOPMENT ONLY: Clear all reviews
router.delete('/debug/clear-all', isAuthenticated, reviewController.clearAllReviews);

// Test route to verify routing is working
router.get('/user/test', isAuthenticated, (req, res) => {
    res.json({ message: "Review test route working", success: true });
});

// Get all reviews by user id
router.get('/user/:userId', isAuthenticated, reviewController.getReviewsByUserId);

// Get all reviews for a listing
router.get('/listing/:listingId', isAuthenticated, reviewController.getReviewsByListing);

// Get average rating from reviews for a listing
router.get('/average/:listingId', isAuthenticated, reviewController.getAverageRatingFromReviews);

// Get a specific review by ID (must come after specific routes)
router.get('/:id', isAuthenticated, reviewController.getReviewById);

// Check course completion status for a user (for reviews)
router.get('/course-completion/:learnerID/:teacherID/:listingID', isAuthenticated, reviewController.checkCourseCompletionStatusForReview);

export default router;
