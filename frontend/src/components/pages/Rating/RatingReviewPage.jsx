"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import { Star, ArrowLeft, CheckCircle, SkipForward, AlertCircle } from "lucide-react"
import { toast } from "sonner"

const RatingReviewPage = () => {
  const { skillListingID } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useSelector((state) => state.auth.user)

  // Get session data from location state
  const sessionData = location.state?.sessionData
  const teacherID = location.state?.teacherID || sessionData?.teacherID?._id || sessionData?.teacherID
  const learnerID = location.state?.learnerID || sessionData?.learnerID?._id || sessionData?.learnerID || user?._id

  const [currentStep, setCurrentStep] = useState(1) // 1 = course completion check, 2 = rating, 3 = review
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedRating, setSubmittedRating] = useState(null)
  const [courseCompletion, setCourseCompletion] = useState(null)
  const [completionLoading, setCompletionLoading] = useState(true)

  // Check authentication and course completion on mount
  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to rate sessions")
      navigate("/signin", {
        state: {
          returnUrl: `/rating/${skillListingID}`,
          returnState: location.state,
        },
      })
      return
    }

    if (user.role !== "learner") {
      toast.error("Only learners can rate sessions")
      navigate("/sessions/learner")
      return
    }

    if (!skillListingID) {
      toast.error("Invalid skill listing")
      navigate("/sessions/learner")
      return
    }

    // Check course completion status first
    checkCourseCompletion()
  }, [user, skillListingID, navigate, location.state])

  const checkCourseCompletion = async () => {
    if (!user || !skillListingID || !teacherID) return;

    try {
      setCompletionLoading(true);
      
      const response = await fetch(
        `http://localhost:3000/api/v1/ratings/course-completion/${user._id}/${teacherID}/${skillListingID}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setCourseCompletion(data.courseCompletion);
        
        // If course is not completed, show error and redirect
        if (!data.courseCompletion.isCompleted) {
          toast.error(`You can only rate this course after completing all sessions. You have completed ${data.courseCompletion.completedSessions} out of ${data.courseCompletion.totalSessions} sessions.`);
          navigate("/sessions/learner");
          return;
        }
        
        // If course is completed, proceed to check existing rating
        checkExistingRating();
      } else {
        toast.error(data.message || 'Failed to check course completion');
        navigate("/sessions/learner");
      }
    } catch (error) {
      console.error('Error checking course completion:', error);
      toast.error('Failed to check course completion status');
      navigate("/sessions/learner");
    } finally {
      setCompletionLoading(false);
    }
  };

  const checkExistingRating = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/ratings/listing/${skillListingID}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      
      const data = await response.json()
      
      if (data.success && data.ratings && data.ratings.length > 0) {
        // Check if current user already has a rating
        const userRating = data.ratings.find(rating => 
          rating.learnerID._id === user._id || rating.learnerID === user._id
        )
        
        if (userRating) {
          // User already has a rating, show it and move to review step
          setSubmittedRating(userRating)
          setRating(userRating.rating)
          toast.info("You have already rated this listing. You can optionally add a review.")
          checkExistingReview() // Check if they have a review too
          return
        }
      }
      
      // No existing rating, proceed to rating step
      setCurrentStep(2);
    } catch (error) {
      console.error("Error checking existing rating:", error)
      // Continue normally if there's an error
      setCurrentStep(2);
    }
  }

  const getRatingText = (rating) => {
    const texts = {
      1: "Poor - Not satisfied",
      2: "Fair - Below expectations",
      3: "Good - Met expectations",
      4: "Very Good - Above expectations",
      5: "Excellent - Outstanding experience",
    }
    return texts[rating] || ""
  }

  const checkExistingReview = async () => {
    try {
      // Try to fetch existing reviews for this listing
      const response = await fetch(`http://localhost:3000/api/v1/reviews/listing/${skillListingID}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      
      const data = await response.json()
      
      if (data.success && data.reviews) {
        // Check if current user already has a review
        const userReview = data.reviews.find(review => 
          review.learnerID._id === learnerID || review.learnerID === learnerID
        )
        
        if (userReview) {
          // User already has a review, show completion message with option to go back
          toast.success("Rating submitted! You have already reviewed this listing.")
          setCurrentStep(4) // Move to completion step
        } else {
          // No existing review, proceed to review step (optional)
          setCurrentStep(3)
        }
      } else {
        // Error fetching reviews, but proceed to review step anyway
        setCurrentStep(3)
      }
    } catch (error) {
      console.error("Error checking existing review:", error)
      // On error, proceed to review step
      setCurrentStep(3)
    }
  }

  const submitRating = async () => {
    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    if (!teacherID || !learnerID) {
      toast.error("Missing required information")
      return
    }

    // If user already has a submitted rating, don't allow new submission
    if (submittedRating) {
      toast.info("You have already rated this listing. You can modify your review below.")
      setCurrentStep(3)
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("http://localhost:3000/api/v1/ratings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          learnerID: learnerID,
          teacherID: teacherID,
          listingID: skillListingID,
          rating: rating,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSubmittedRating(data.rating)
        toast.success("Rating submitted successfully!")
        
        // Always proceed to review step after rating submission
        setCurrentStep(3)
      } else {
        // Handle specific error cases
        if (data.message && data.message.includes("already rated")) {
          toast.info("You have already rated this listing. Checking your existing rating...")
          // Refresh the existing rating
          checkExistingRating()
        } else {
          throw new Error(data.message || "Failed to submit rating")
        }
      }
    } catch (error) {
      console.error("Rating submission error:", error)
      if (error.message && error.message.includes("already rated")) {
        toast.info("You have already rated this listing. Checking your existing rating...")
        checkExistingRating()
      } else {
        toast.error(error.message || "Failed to submit rating")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitReview = async () => {
    if (reviewText.trim().length < 10) {
      toast.error("Review must be at least 10 characters long")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("http://localhost:3000/api/v1/reviews/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          learnerID: learnerID,
          teacherID: teacherID,
          listingID: skillListingID,
          reviewText: reviewText.trim(),
          rating: submittedRating?.rating || rating, // Keep the rating for the review
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Review submitted successfully!")
        navigate("/sessions/learner")
      } else {
        throw new Error(data.message || "Failed to submit review")
      }
    } catch (error) {
      console.error("Review submission error:", error)
      toast.error(error.message || "Failed to submit review")
    } finally {
      setIsSubmitting(false)
    }
  }

  const skipReview = () => {
    // Move to completion step without submitting a review
    setCurrentStep(4);
  };

  if (!user) {
    return null // Will redirect to login
  }

  if (completionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking course completion...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/sessions/learner")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Sessions
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Rate & Review Your Course
            </h1>
            <p className="text-gray-600">
              Share your experience and help other learners
            </p>
          </div>
        </div>

        {/* Course Completion Check Step */}
        {currentStep === 1 && courseCompletion && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Course Completed Successfully!
              </h2>
              <p className="text-gray-600">
                You have completed all {courseCompletion.totalSessions} sessions. 
                You can now rate and review this course.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <CheckCircle size={20} />
                <span className="font-medium">Course Progress</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2 mb-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <p className="text-green-600 text-sm">
                {courseCompletion.completedSessions}/{courseCompletion.totalSessions} sessions completed
              </p>
            </div>

            <button
              onClick={() => setCurrentStep(2)}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Continue to Rating
            </button>
          </div>
        )}

        {/* Rating Step */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center">
              {submittedRating ? (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Rating</h2>
                  <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={40}
                        className={`${
                          star <= submittedRating.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-lg text-gray-600 mb-6">{getRatingText(submittedRating.rating)}</p>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Continue to Review
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Rate Your Experience</h2>

                  {/* Star Rating */}
                  <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          size={40}
                          className={`${
                            star <= (hoveredRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Rating Text */}
                  {(hoveredRating || rating) > 0 && (
                    <p className="text-lg text-gray-600 mb-6">{getRatingText(hoveredRating || rating)}</p>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={submitRating}
                    disabled={rating === 0 || isSubmitting}
                    className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Rating"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Review Step */}
        {currentStep === 3 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Write a Review</h2>
              <p className="text-gray-600">
                Share your detailed experience with this course
              </p>
            </div>

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this teacher and skill. What did you learn? How was the teaching style? Would you recommend this to others?"
              className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              maxLength={500}
            />

            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">
                {reviewText.length}/500 characters
                {reviewText.length > 0 && reviewText.length < 10 && (
                  <span className="text-red-500 ml-2">(Minimum 10 characters)</span>
                )}
              </span>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={submitReview}
                disabled={reviewText.trim().length < 10 || isSubmitting}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>

              <button
                onClick={skipReview}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                <SkipForward size={18} />
                Skip Review
              </button>
            </div>
          </div>
        )}

        {/* Completion Step */}
        {currentStep === 4 && (
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Thank You!
            </h2>
            <p className="text-gray-600 mb-6">
              Your rating and review have been submitted successfully. 
              Your feedback helps other learners make informed decisions.
            </p>
            <button
              onClick={() => navigate("/sessions/learner")}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Back to Sessions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingReviewPage;
