import { User } from "../models/user.model.js";
import Review from "../models/review.js";
import SkillListing from "../models/skillListing.js";
import Session from "../models/session.js";

// Create Review Function
export const createReview = async (req, res) => {
    try {
        const { learnerID, teacherID, listingID, reviewText, rating } = req.body;

        // Validate required fields
        if (!learnerID || !teacherID || !listingID || !reviewText || !rating) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            });
        }

        // Validate rating value
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5",
                success: false
            });
        }

        // Validate review text length
        if (reviewText.length < 10 || reviewText.length > 1000) {
            return res.status(400).json({
                message: "Review text must be between 10 and 1000 characters",
                success: false
            });
        }

        // Check if learner exists
        const learner = await User.findById(learnerID);
        if (!learner) {
            return res.status(404).json({
                message: "Learner not found",
                success: false
            });
        }

        // Check if teacher exists
        const teacher = await User.findById(teacherID);
        if (!teacher) {
            return res.status(404).json({
                message: "Teacher not found",
                success: false
            });
        }

        // Check if listing exists
        const listing = await SkillListing.findById(listingID);
        if (!listing) {
            return res.status(404).json({
                message: "Skill listing not found",
                success: false
            });
        }

        // Check if the learner has completed ALL sessions for this listing
        const allSessionsForListing = await Session.find({
            learnerID: learnerID,
            teacherID: teacherID,
            skillListingID: listingID
        });

        if (allSessionsForListing.length === 0) {
            return res.status(403).json({
                message: "You must book at least one session for this course before reviewing it",
                success: false
            });
        }

        const completedSessions = allSessionsForListing.filter(session => session.status === "completed");
        const totalSessions = allSessionsForListing.length;

        if (completedSessions.length < totalSessions) {
            return res.status(403).json({
                message: `You can only review this course after completing all sessions. You have completed ${completedSessions.length} out of ${totalSessions} sessions.`,
                success: false,
                completedSessions: completedSessions.length,
                totalSessions: totalSessions
            });
        }

        // Check if learner has already reviewed this listing by this teacher
        console.log("=== Checking for existing review ===");
        console.log("LearnerID:", learnerID);
        console.log("TeacherID:", teacherID);
        console.log("ListingID:", listingID);
        
        const existingReview = await Review.findOne({
            learnerID,
            teacherID,
            listingID
        });
        
        console.log("Existing review found:", existingReview ? "YES" : "NO");
        if (existingReview) {
            console.log("Existing review ID:", existingReview._id);
            console.log("Existing review learner:", existingReview.learnerID);
            console.log("Existing review teacher:", existingReview.teacherID);
            console.log("Existing review listing:", existingReview.listingID);
        }

        if (existingReview) {
            return res.status(400).json({
                message: "You have already written a review for this listing. You can update your existing review instead.",
                success: false,
                existingReviewId: existingReview._id
            });
        }

        // Create new review
        const newReview = new Review({
            learnerID,
            teacherID,
            listingID,
            reviewText,
            rating
        });

        await newReview.save();

        // Populate the review with related data
        const populatedReview = await Review.findById(newReview._id)
            .populate('learnerID', 'fullname email')
            .populate('teacherID', 'fullname email')
            .populate('listingID', 'title');

        return res.status(201).json({
            message: "Review created successfully",
            success: true,
            review: populatedReview
        });

    } catch (error) {
        console.error("Error creating review:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Update Review Function
export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { reviewText, rating } = req.body;

        // Validate review ID
        if (!id) {
            return res.status(400).json({
                message: "Review ID is required",
                success: false
            });
        }

        // Validate required fields
        if (!reviewText && !rating) {
            return res.status(400).json({
                message: "At least one field (reviewText or rating) is required for update",
                success: false
            });
        }

        // Validate rating value if provided
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5",
                success: false
            });
        }

        // Validate review text length if provided
        if (reviewText && (reviewText.length < 10 || reviewText.length > 1000)) {
            return res.status(400).json({
                message: "Review text must be between 10 and 1000 characters",
                success: false
            });
        }

        // Find the existing review
        const existingReview = await Review.findById(id);
        if (!existingReview) {
            return res.status(404).json({
                message: "Review not found",
                success: false
            });
        }

        // Update the review fields
        if (reviewText) existingReview.reviewText = reviewText;
        if (rating) existingReview.rating = rating;

        await existingReview.save();

        // Populate the updated review with related data
        const populatedReview = await Review.findById(existingReview._id)
            .populate('learnerID', 'fullname email')
            .populate('teacherID', 'fullname email')
            .populate('listingID', 'title');

        return res.status(200).json({
            message: "Review updated successfully",
            success: true,
            review: populatedReview
        });

    } catch (error) {
        console.error("Error updating review:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Delete Review Function
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId; // From middleware

        // Validate review ID
        if (!id) {
            return res.status(400).json({
                message: "Review ID is required",
                success: false
            });
        }

        // Validate ID format (MongoDB ObjectId should be 24 characters)
        if (id.length !== 24) {
            return res.status(400).json({
                message: "Invalid review ID format",
                success: false
            });
        }

        // First find the review to check ownership
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({
                message: "Review not found",
                success: false
            });
        }

        // Check if the current user owns this review (only the learner who created it can delete it)
        if (review.learnerID.toString() !== userId) {
            return res.status(403).json({
                message: "You can only delete your own reviews",
                success: false
            });
        }

        // Delete the review
        await Review.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Review deleted successfully",
            success: true,
            deletedReview: {
                _id: review._id,
                learnerID: review.learnerID,
                teacherID: review.teacherID,
                listingID: review.listingID,
                reviewText: review.reviewText,
                rating: review.rating,
                deletedAt: new Date()
            }
        });

    } catch (error) {
        console.error("Error deleting review:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message
        });
    }
};

// Get Review by ID Function
export const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate review ID
        if (!id) {
            return res.status(400).json({
                message: "Review ID is required",
                success: false
            });
        }

        // Find the review and populate related data
        const review = await Review.findById(id)
            .populate('learnerID', 'fullname email')
            .populate('teacherID', 'fullname email')
            .populate('listingID', 'title');

        if (!review) {
            return res.status(404).json({
                message: "Review not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Review retrieved successfully",
            success: true,
            review: review
        });

    } catch (error) {
        console.error("Error getting review:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Get All Reviews for a Listing Function
export const getReviewsByListing = async (req, res) => {
    try {
        const { listingId } = req.params;

        // Validate listing ID
        if (!listingId) {
            return res.status(400).json({
                message: "Listing ID is required",
                success: false
            });
        }

        // Find all reviews for the listing
        const reviews = await Review.find({ listingID: listingId })
            .populate('learnerID', 'fullname email profile')
            .populate('teacherID', 'fullname email')
            .populate('listingID', 'title')
            .sort({ createdAt: -1 }); // Sort by newest first

        // Calculate average rating only if there are at least 5 reviews
        let averageRating = null;
        if (reviews.length >= 5) {
            averageRating = parseFloat((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1));
        }

        return res.status(200).json({
            message: "Reviews retrieved successfully",
            success: true,
            reviews: reviews,
            totalReviews: reviews.length,
            averageRating: averageRating,
            minimumRequired: 5,
            note: reviews.length < 5 ? "At least 5 reviews are required to show average rating" : null
        });

    } catch (error) {
        console.error("Error getting reviews by listing:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Get Average Rating from Reviews for a Listing
export const getAverageRatingFromReviews = async (req, res) => {
    try {
        const { listingId } = req.params;

        // Validate listing ID
        if (!listingId) {
            return res.status(400).json({
                message: "Listing ID is required",
                success: false
            });
        }

        // Find all reviews for the listing
        const reviews = await Review.find({ listingID: listingId });

        // Check if there are at least 5 reviews
        if (reviews.length < 5) {
            return res.status(200).json({
                message: "Average rating not available yet",
                success: true,
                averageRating: null,
                totalReviews: reviews.length,
                minimumRequired: 5,
                note: "At least 5 reviews are required to show average rating"
            });
        }

        // Calculate average rating
        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

        return res.status(200).json({
            message: "Average rating retrieved successfully",
            success: true,
            averageRating: parseFloat(averageRating.toFixed(1)),
            totalReviews: reviews.length
        });

    } catch (error) {
        console.error("Error getting average rating from reviews:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Get user's own reviews
export const getMyReviews = async (req, res) => {
    try {
        const userId = req.user.userId; // From middleware

        // Get all reviews by this user
        const reviews = await Review.find({ learnerID: userId })
            .populate('teacherID', 'fullname email')
            .populate('listingID', 'title description fee')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "User reviews retrieved successfully",
            success: true,
            reviews
        });

    } catch (error) {
        console.error("Error getting user reviews:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Get reviews received by current user (when they were a teacher)
export const getMyReceivedReviews = async (req, res) => {
    try {
        const userId = req.user.userId; // From middleware

        console.log("=== getMyReceivedReviews Debug Info ===");
        console.log("User ID:", userId);

        // Get all reviews where this user was the teacher
        const reviews = await Review.find({ teacherID: userId })
            .populate('learnerID', 'fullname email profile.profilePhoto')
            .populate('listingID', 'title description fee')
            .sort({ createdAt: -1 });

        console.log("Found received reviews:", reviews.length);

        return res.status(200).json({
            message: "Teacher received reviews retrieved successfully",
            success: true,
            reviews,
            count: reviews.length
        });

    } catch (error) {
        console.error("Error getting teacher received reviews:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Get reviews by specific user ID (for viewing other user's reviews)
export const getReviewsByUserId = async (req, res) => {
    try {
        console.log("=== getReviewsByUserId Debug Info ===");
        console.log("Request URL:", req.originalUrl);
        console.log("Request params:", req.params);
        
        const { userId } = req.params;
        console.log("Extracted userId:", userId);

        // Validate user ID
        if (!userId) {
            return res.status(400).json({
                message: "User ID is required",
                success: false
            });
        }

        // Validate user ID format (MongoDB ObjectId should be 24 characters)
        if (userId.length !== 24) {
            return res.status(400).json({
                message: "Invalid user ID format",
                success: false
            });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            console.log("User not found in database");
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        console.log("User found:", user.fullname);

        // Get all reviews by this specific user
        const reviews = await Review.find({ learnerID: userId })
            .populate('teacherID', 'fullname email')
            .populate('listingID', 'title description fee')
            .sort({ createdAt: -1 });

        console.log("Found reviews count:", reviews.length);

        return res.status(200).json({
            message: "User reviews retrieved successfully",
            success: true,
            reviews,
            user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Error getting reviews by user ID:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message
        });
    }
};

// Debug function to check existing reviews for a specific listing
export const checkExistingReviews = async (req, res) => {
    try {
        const { learnerID, teacherID, listingID } = req.query;
        
        console.log("=== DEBUG: Checking existing reviews ===");
        console.log("LearnerID:", learnerID);
        console.log("TeacherID:", teacherID);
        console.log("ListingID:", listingID);
        
        // Find any existing reviews with these IDs
        const existingReviews = await Review.find({
            $or: [
                { learnerID, teacherID, listingID },
                { learnerID, listingID },
                { teacherID, listingID }
            ]
        }).populate('learnerID', 'fullname email')
          .populate('teacherID', 'fullname email')
          .populate('listingID', 'title');
        
        console.log("Found existing reviews:", existingReviews.length);
        existingReviews.forEach(review => {
            console.log("Review ID:", review._id);
            console.log("Learner:", review.learnerID?.fullname);
            console.log("Teacher:", review.teacherID?.fullname);
            console.log("Listing:", review.listingID?.title);
            console.log("---");
        });
        
        return res.status(200).json({
            message: "Debug info retrieved",
            success: true,
            existingReviews,
            searchCriteria: { learnerID, teacherID, listingID }
        });
        
    } catch (error) {
        console.error("Error in debug function:", error);
        return res.status(500).json({
            message: "Debug error",
            success: false,
            error: error.message
        });
    }
};

// DEVELOPMENT ONLY: Clear all reviews (BE CAREFUL!)
export const clearAllReviews = async (req, res) => {
    try {
        if (process.env.NODE_ENV !== 'development') {
            return res.status(403).json({
                message: "This endpoint is only available in development mode",
                success: false
            });
        }
        
        const result = await Review.deleteMany({});
        
        return res.status(200).json({
            message: `Cleared ${result.deletedCount} reviews`,
            success: true,
            deletedCount: result.deletedCount
        });
        
    } catch (error) {
        console.error("Error clearing reviews:", error);
        return res.status(500).json({
            message: "Error clearing reviews",
            success: false,
            error: error.message
        });
    }
};

// Check course completion status for a user (for reviews)
export const checkCourseCompletionStatusForReview = async (req, res) => {
    try {
        const { learnerID, teacherID, listingID } = req.params;
        const userId = req.user.userId; // From middleware

        // Validate required fields
        if (!learnerID || !teacherID || !listingID) {
            return res.status(400).json({
                message: "Learner ID, Teacher ID, and Listing ID are required",
                success: false
            });
        }

        // Check if the current user is the learner
        if (learnerID !== userId) {
            return res.status(403).json({
                message: "You can only check your own course completion status",
                success: false
            });
        }

        // Get all sessions for this course
        const allSessionsForListing = await Session.find({
            learnerID: learnerID,
            teacherID: teacherID,
            skillListingID: listingID
        });

        if (allSessionsForListing.length === 0) {
            return res.status(200).json({
                message: "No sessions found for this course",
                success: true,
                courseCompletion: {
                    totalSessions: 0,
                    completedSessions: 0,
                    isCompleted: false,
                    canReview: false,
                    progress: 0
                }
            });
        }

        const completedSessions = allSessionsForListing.filter(session => session.status === "completed");
        const totalSessions = allSessionsForListing.length;
        const isCompleted = completedSessions.length === totalSessions;
        const progress = totalSessions > 0 ? Math.round((completedSessions.length / totalSessions) * 100) : 0;

        // Check if user can review (only if course is completed)
        const canReview = isCompleted;

        // Check if user has already reviewed this course
        const existingReview = await Review.findOne({
            learnerID,
            teacherID,
            listingID
        });

        return res.status(200).json({
            message: "Course completion status for review retrieved successfully",
            success: true,
            courseCompletion: {
                totalSessions,
                completedSessions: completedSessions.length,
                isCompleted,
                canReview,
                hasReviewed: !!existingReview,
                progress,
                sessions: allSessionsForListing.map(session => ({
                    _id: session._id,
                    status: session.status,
                    scheduledTime: session.scheduledTime,
                    skillName: session.skillName
                }))
            }
        });

    } catch (error) {
        console.error("Error checking course completion status for review:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message
        });
    }
};
