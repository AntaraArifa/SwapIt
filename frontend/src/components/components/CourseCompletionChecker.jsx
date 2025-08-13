import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { CheckCircle, Clock, AlertCircle, Star, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const CourseCompletionChecker = ({ 
  listingId, 
  teacherId, 
  onCompletionStatusChange,
  showRatingButton = true,
  showReviewButton = true 
}) => {
  const user = useSelector(state => state.auth.user);
  const [completionStatus, setCompletionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && listingId && teacherId) {
      checkCourseCompletion();
    }
  }, [user, listingId, teacherId]);

  const checkCourseCompletion = async () => {
    if (!user || !listingId || !teacherId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:3000/api/v1/ratings/course-completion/${user._id}/${teacherId}/${listingId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setCompletionStatus(data.courseCompletion);
        if (onCompletionStatusChange) {
          onCompletionStatusChange(data.courseCompletion);
        }
      } else {
        setError(data.message || 'Failed to check course completion');
        toast.error(data.message || 'Failed to check course completion');
      }
    } catch (error) {
      console.error('Error checking course completion:', error);
      setError('Failed to check course completion status');
      toast.error('Failed to check course completion status');
    } finally {
      setLoading(false);
    }
  };

  const handleRateClick = () => {
    if (!completionStatus?.canRate) {
      toast.error('You can only rate this course after completing all sessions');
      return;
    }
    // Navigate to rating page or trigger rating modal
    window.location.href = `/rating/${listingId}`;
  };

  const handleReviewClick = () => {
    if (!completionStatus?.canReview) {
      toast.error('You can only review this course after completing all sessions');
      return;
    }
    // Navigate to review page or trigger review modal
    window.location.href = `/rating/${listingId}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          <span className="font-medium">Error checking course completion</span>
        </div>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!completionStatus) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Clock size={20} />
          <span className="font-medium">No sessions found</span>
        </div>
        <p className="text-gray-500 text-sm mt-1">
          You haven't booked any sessions for this course yet.
        </p>
      </div>
    );
  }

  const { totalSessions, completedSessions, isCompleted, canRate, canReview, progress } = completionStatus;

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle size={20} className="text-green-600" />
          ) : (
            <Clock size={20} className="text-blue-600" />
          )}
          <span className="font-medium text-gray-900">
            Course Progress
          </span>
        </div>
        <span className="text-sm font-medium text-gray-600">
          {completedSessions}/{totalSessions} sessions
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>{progress}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Status Message */}
      <div className="mb-4">
        {isCompleted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle size={16} />
              <span className="font-medium">Course Completed!</span>
            </div>
            <p className="text-green-600 text-sm mt-1">
              You have completed all {totalSessions} sessions. You can now rate and review this course.
            </p>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-700">
              <Clock size={16} />
              <span className="font-medium">Course in Progress</span>
            </div>
            <p className="text-blue-600 text-sm mt-1">
              You have completed {completedSessions} out of {totalSessions} sessions. 
              Complete all sessions to rate and review this course.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {showRatingButton && (
          <button
            onClick={handleRateClick}
            disabled={!canRate}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              canRate
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Star size={16} />
            Rate Course
          </button>
        )}

        {showReviewButton && (
          <button
            onClick={handleReviewClick}
            disabled={!canReview}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              canReview
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <MessageSquare size={16} />
            Write Review
          </button>
        )}
      </div>

      {/* Session Details */}
      {completionStatus.sessions && completionStatus.sessions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Session Details</h4>
          <div className="space-y-2">
            {completionStatus.sessions.map((session, index) => (
              <div key={session._id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Session {index + 1}: {session.skillName}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    session.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : session.status === 'accepted'
                      ? 'bg-blue-100 text-blue-800'
                      : session.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {session.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCompletionChecker;
