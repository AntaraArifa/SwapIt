import { User } from "../models/user.model.js";
import Rating from "../models/rating.js";
import SkillListing from "../models/skillListing.js";
import Session from "../models/session.js";

export const createRating = async (req, res) => {
    try {
        const { learnerID, teacherID, listingID, rating } = req.body;

        // Validate required fields
        if (!learnerID || !teacherID || !listingID || !rating) {
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

        // Check if the learner has completed a session for this listing
        const completedSession = await Session.findOne({
            learnerID: learnerID,
            teacherID: teacherID,
            skillListingID: listingID,
            status: "completed"
        });

        if (!completedSession) {
            return res.status(403).json({
                message: "You can only rate courses you have completed",
                success: false
            });
        }

        // Check if learner has already rated this listing by this teacher
        const existingRating = await Rating.findOne({
            learnerID,
            teacherID,
            listingID
        });

        if (existingRating) {
            return res.status(400).json({
                message: "You have already rated this listing",
                success: false
            });
        }

        // Create new rating
        const newRating = new Rating({
            learnerID,
            teacherID,
            listingID,
            rating
        });

        await newRating.save();

        // Populate the rating with related data
        const populatedRating = await Rating.findById(newRating._id)
            .populate('learnerID', 'fullname email')
            .populate('teacherID', 'fullname email')
            .populate('listingID', 'title');

        return res.status(201).json({
            message: "Rating created successfully",
            success: true,
            rating: populatedRating
        });

    } catch (error) {
        console.error("Error creating rating:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Update Rating Function
export const updateRating = async (req, res) => {
    try {
        const { ratingId } = req.params;
        const { rating } = req.body;

        // Validate rating ID
        if (!ratingId) {
            return res.status(400).json({
                message: "Rating ID is required",
                success: false
            });
        }

        // Validate rating value
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5",
                success: false
            });
        }

        // Find the existing rating
        const existingRating = await Rating.findById(ratingId);
        if (!existingRating) {
            return res.status(404).json({
                message: "Rating not found",
                success: false
            });
        }

        // Update the rating
        existingRating.rating = rating;
        await existingRating.save();

        // Populate the updated rating with related data
        const populatedRating = await Rating.findById(existingRating._id)
            .populate('learnerID', 'fullname email')
            .populate('teacherID', 'fullname email')
            .populate('listingID', 'title');

        return res.status(200).json({
            message: "Rating updated successfully",
            success: true,
            rating: populatedRating
        });

    } catch (error) {
        console.error("Error updating rating:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Delete Rating Function
export const deleteRating = async (req, res) => {
    try {
        const { ratingId } = req.params;

        // Validate rating ID
        if (!ratingId) {
            return res.status(400).json({
                message: "Rating ID is required",
                success: false
            });
        }

        // Find and delete the rating
        const deletedRating = await Rating.findByIdAndDelete(ratingId);
        if (!deletedRating) {
            return res.status(404).json({
                message: "Rating not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Rating deleted successfully",
            success: true,
            deletedRating: {
                _id: deletedRating._id,
                learnerID: deletedRating.learnerID,
                teacherID: deletedRating.teacherID,
                listingID: deletedRating.listingID,
                rating: deletedRating.rating
            }
        });

    } catch (error) {
        console.error("Error deleting rating:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Get All Ratings for a Listing Function
export const getRatingsByListing = async (req, res) => {
    try {
        const { listingId } = req.params;

        // Validate listing ID
        if (!listingId) {
            return res.status(400).json({
                message: "Listing ID is required",
                success: false
            });
        }

        // Find all ratings for the listing
        const ratings = await Rating.find({ listingID: listingId })
            .populate('learnerID', 'fullname email')
            .populate('teacherID', 'fullname email')
            .populate('listingID', 'title')
            .sort({ createdAt: -1 }); // Sort by newest first

        // Calculate average rating
        const averageRating = ratings.length > 0 
            ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length 
            : 0;

        return res.status(200).json({
            message: "Ratings retrieved successfully",
            success: true,
            ratings: ratings,
            totalRatings: ratings.length,
            averageRating: parseFloat(averageRating.toFixed(1))
        });

    } catch (error) {
        console.error("Error getting ratings by listing:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};


// Get average rating of a listing

export const getAverageRating = async (req, res) => {
    try {
        const { listingId } = req.params;

        // Validate listing ID
        if (!listingId) {
            return res.status(400).json({
                message: "Listing ID is required",
                success: false
            });
        }

        // Find all ratings for the listing
        const ratings = await Rating.find({ listingID: listingId });

        // Calculate average rating
        const averageRating = ratings.length > 0 
            ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length 
            : 0;

        return res.status(200).json({
            message: "Average rating retrieved successfully",
            success: true,
            averageRating: parseFloat(averageRating.toFixed(1))
        });

    } catch (error) {
        console.error("Error getting average rating:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

