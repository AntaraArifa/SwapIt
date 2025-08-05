"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { Star } from "lucide-react"
import { toast } from "sonner"
import { getSessionsByRole, respondSessionReschedule } from "../../../config/api"

const LearnerSessions = () => {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState({})
  const [ratedSessions, setRatedSessions] = useState(new Set())
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)

  // Function to check if a session has been rated
  const checkSessionRating = async (skillListingId) => {
    if (!user || !skillListingId) return false
    
    try {
      const response = await fetch(`http://localhost:3000/api/v1/ratings/listing/${skillListingId}`, {
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
        return !!userRating
      }
      return false
    } catch (error) {
      console.error("Error checking rating for session:", error)
      return false
    }
  }

  // Function to check ratings for all completed sessions
  const checkAllSessionRatings = async (sessionsList) => {
    const completedSessions = sessionsList.filter(session => session.status === "completed")
    const ratedSessionIds = new Set()
    
    for (const session of completedSessions) {
      const skillListingId = session.skillListingID?._id || session.skillListingID
      if (skillListingId) {
        const isRated = await checkSessionRating(skillListingId)
        if (isRated) {
          ratedSessionIds.add(session._id)
        }
      }
    }
    
    setRatedSessions(ratedSessionIds)
  }

  const handleRescheduleResponse = async (sessionId, accept) => {
    setResponding((prev) => ({ ...prev, [sessionId]: true }))
    try {
      await respondSessionReschedule(sessionId, accept)
      const response = await getSessionsByRole("learner")
      setSessions(response)
    } catch (err) {
      console.error("Failed to respond to reschedule:", err)
    } finally {
      setResponding((prev) => ({ ...prev, [sessionId]: false }))
    }
  }

  const handleRateSession = (session) => {
    // Check if user is logged in
    if (!user) {
      toast.error("Please sign in to rate sessions")
      navigate("/signin", {
        state: {
          returnUrl: `/rating/${session.skillListingID?._id || session.skillListingID}`,
          returnState: { sessionData: session },
        },
      })
      return
    }

    // Check if user is a learner
    if (user.role !== "learner") {
      toast.error("Only learners can rate sessions")
      return
    }

    // Check if already rated
    if (ratedSessions.has(session._id)) {
      toast.info("You have already rated this session")
      return
    }

    // Navigate to rating page with skillListingID
    const skillListingId = session.skillListingID?._id || session.skillListingID
    if (skillListingId) {
      navigate(`/rating/${skillListingId}`, {
        state: {
          sessionData: session,
          teacherID: session.teacherID?._id || session.teacherID,
          learnerID: session.learnerID?._id || session.learnerID || user._id,
        },
      })
    } else {
      toast.error("Unable to find skill listing information")
    }
  }

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await getSessionsByRole("learner")
        setSessions(response)
        // Check ratings for all completed sessions
        await checkAllSessionRatings(response)
      } catch (error) {
        console.error("Error fetching learner sessions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [])

  // Refresh rating status when user comes back to this page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && sessions.length > 0) {
        checkAllSessionRatings(sessions)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [sessions])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">📚 My Session Requests</h2>
      {loading ? (
        <p>Loading...</p>
      ) : sessions.length === 0 ? (
        <p>No sessions found.</p>
      ) : (
        <ul className="space-y-6">
          {sessions.map((session) => (
            <li key={session._id} className="border rounded-xl shadow p-4 bg-white space-y-2">
              <p>
                <strong>👩‍🏫 Teacher:</strong> {session.teacherID?.fullname || "N/A"}
              </p>
              <p>
                <strong>🎯 Skill:</strong> {session.skillName || session.skillListingID?.title || "N/A"}
              </p>
              <p>
                <strong>💵 Price:</strong> ৳{session.price || session.skillListingID?.fee || "N/A"}
              </p>
              <p>
                <strong>🕒 Time Slot:</strong>{" "}
                {session.scheduledTime
                  ? new Date(session.scheduledTime).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "N/A"}
              </p>
              <p>
                <strong>📌 Status:</strong>{" "}
                <span
                  className={`inline-block px-2 py-0.5 text-sm rounded-full ${
                    session.status === "accepted"
                      ? "bg-green-100 text-green-800"
                      : session.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : session.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : session.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {session.status}
                </span>
              </p>

              {session.status === "rescheduled" && session.rescheduleRequest && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-3">
                  <p className="mb-2">
                    <strong>📅 New Time Slot:</strong> {(() => {
                      const { newDate, newTime } = session.rescheduleRequest
                      if (newDate && newTime) {
                        // Try to extract YYYY-MM-DD from newDate (could be ISO string)
                        let dateStr = newDate
                        if (typeof dateStr === "string" && dateStr.length > 10) {
                          // ISO string, extract date part
                          dateStr = new Date(dateStr).toISOString().slice(0, 10)
                        }
                        try {
                          return new Date(`${dateStr}T${newTime}`).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        } catch {
                          return `${dateStr} ${newTime}`
                        }
                      } else if (newTime) {
                        return newTime.length <= 5
                          ? newTime
                          : (() => {
                              try {
                                return new Date(`1970-01-01T${newTime}`).toLocaleTimeString(undefined, {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              } catch {
                                return newTime
                              }
                            })()
                      } else {
                        return "N/A"
                      }
                    })()}
                  </p>
                </div>
              )}

              {/* Rate Us Button for Completed Sessions */}
              {session.status === "completed" && (
                <div className="mt-4">
                  {ratedSessions.has(session._id) ? (
                    <button
                      disabled
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-medium"
                    >
                      <Star size={16} />
                      Already Rated
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRateSession(session)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                    >
                      <Star size={16} />
                      Rate Us
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default LearnerSessions
