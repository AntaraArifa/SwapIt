import express from "express";
import * as ratingController from "../controllers/ratingController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";


const router = express.Router();

// Create a new rating
router.post('/create', isAuthenticated, ratingController.createRating);

//Update an existing rating
router.put('/update/:id', isAuthenticated, ratingController.updateRating);

// Delete a rating
router.delete('/delete/:id', isAuthenticated, ratingController.deleteRating);

// Get average rating of a listing
router.get('/average/:listingId', isAuthenticated, ratingController.getAverageRating);

// Get all ratings for a listing
router.get('/listing/:listingId', isAuthenticated, ratingController.getRatingsByListing);

// Get user's own ratings (specific route must come before parameterized route)
router.get('/user/my-ratings', isAuthenticated, ratingController.getMyRatings);

// Get ratings received by current user (when they were a teacher)
router.get('/user/my-received-ratings', isAuthenticated, ratingController.getMyReceivedRatings);

// Test route to verify routing is working
router.get('/user/test', isAuthenticated, (req, res) => {
    res.json({ message: "Test route working", success: true });
});

// Get all ratings by user id
router.get('/user/:userId', isAuthenticated, ratingController.getRatingsByUserId);

// Get all ratings given by a specific learner (ratings BY learner)
router.get('/learner/:learnerId', isAuthenticated, ratingController.getRatingsByLearnerId);

// Get average ratings for a specific teacher
router.get('/teacher/:teacherId/average', isAuthenticated, ratingController.getAverageRatingsByTeacherId);

// Check course completion status for a user
router.get('/course-completion/:learnerID/:teacherID/:listingID', isAuthenticated, ratingController.checkCourseCompletionStatus);

export default router;