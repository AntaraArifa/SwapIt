import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import CourseCompletionChecker from './CourseCompletionChecker';

const CourseCompletionExample = ({ listing }) => {
  const user = useSelector(state => state.auth.user);
  const [showCompletionChecker, setShowCompletionChecker] = useState(false);

  // Only show for learners who are logged in
  if (!user || user.role !== 'learner') {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Course Progress & Reviews
      </h3>
      
      {showCompletionChecker ? (
        <CourseCompletionChecker
          listingId={listing._id}
          teacherId={listing.teacherID}
          onCompletionStatusChange={(status) => {
            console.log('Course completion status:', status);
          }}
        />
      ) : (
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Check your progress and rate this course after completion
          </p>
          <button
            onClick={() => setShowCompletionChecker(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Check Course Progress
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseCompletionExample;
