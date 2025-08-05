"use client"

import { useEffect, useState } from "react"
import { getSessionsByRole, updateSessionStatus, proposeSessionReschedule } from "../../../config/api"
import { getSkillListingById } from "../../../config/skillListing"
import axios from "axios"

const TeacherSessions = () => {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [rescheduleData, setRescheduleData] = useState({})
  const [availableSlotsMap, setAvailableSlotsMap] = useState({})

  const fetchSessions = async () => {
    try {
      const response = await getSessionsByRole("teacher")
      setSessions(response)
      // Fetch availableSlots for each unique skillListingID
      const uniqueListingIds = [...new Set(response.map((s) => s.skillListingID?._id).filter((id) => !!id))]
      const slotsMap = {}
      await Promise.all(
        uniqueListingIds.map(async (id) => {
          try {
            const listing = await getSkillListingById(id)
            slotsMap[id] = listing.availableSlots || []
          } catch {
            slotsMap[id] = []
          }
        }),
      )
      setAvailableSlotsMap(slotsMap)
    } catch (error) {
      console.error("Error fetching teacher sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const handleStatusChange = async (sessionId, status) => {
    try {
      await updateSessionStatus(sessionId, status)
      fetchSessions()
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  const handleRescheduleSubmit = async (sessionId) => {
    const { newDate, newTime } = rescheduleData[sessionId] || {}
    if (!newDate || !newTime) return
    try {
      await proposeSessionReschedule(sessionId, { newDate, newTime })
      fetchSessions()
    } catch (err) {
      console.error("Failed to propose reschedule:", err)
    }
  }

  const isSessionNow = (scheduledTime) => {
    if (!scheduledTime) return false
    const now = new Date()
    const scheduled = new Date(scheduledTime)
    const diff = Math.abs(now - scheduled) // difference in milliseconds
    const threshold = 60 * 60 * 1000 // 1 hour threshold
    return diff <= threshold
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">👩‍🏫 Incoming Session Requests</h2>
      {loading ? (
        <p>Loading...</p>
      ) : sessions.length === 0 ? (
        <p>No session requests yet.</p>
      ) : (
        <ul className="space-y-6">
          {sessions.map((session) => (
            <li key={session._id} className="border rounded-xl shadow p-4 bg-white space-y-2">
              <p>
                <strong>🙋 Learner:</strong> {session.learnerID?.fullname || "N/A"}
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
                        let dateStr = newDate
                        if (typeof dateStr === "string" && dateStr.length > 10) {
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

              {session.status === "pending" && (
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => handleStatusChange(session._id, "accepted")}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleStatusChange(session._id, "rejected")}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded"
                  >
                    Reject
                  </button>
                </div>
              )}

              {session.status === "accepted" && (
                <div className="mt-4 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Propose Reschedule:</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={rescheduleData[session._id]?.newDate || ""}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) =>
                        setRescheduleData((prev) => ({
                          ...prev,
                          [session._id]: {
                            ...prev[session._id],
                            newDate: e.target.value,
                          },
                        }))
                      }
                      className="border p-2 rounded w-36"
                    />
                    <select
                      value={rescheduleData[session._id]?.newTime || ""}
                      onChange={(e) =>
                        setRescheduleData((prev) => ({
                          ...prev,
                          [session._id]: {
                            ...prev[session._id],
                            newTime: e.target.value,
                          },
                        }))
                      }
                      className="border p-2 rounded w-32"
                    >
                      <option value="">--:-- --</option>
                      {(availableSlotsMap[session.skillListingID?._id] || []).map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleRescheduleSubmit(session._id)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1.5 rounded"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}

              {session.status === "accepted" && isSessionNow(session.scheduledTime) && (
                <button
                  className="bg-blue-500 text-white px-4 py-1.5 rounded hover:bg-blue-600 mt-2"
                  onClick={async () => {
                    const roomCode = Math.random().toString(36).substring(2, 10)
                    const link = `http://localhost:5173/meeting/${roomCode}`
                    try {
                      await axios.post(
                        "http://localhost:3000/api/v1/notification/send",
                        {
                          recipient: session.learnerID._id,
                          message: `Your session is starting now! Click below to join.`,
                          meetingLink: link,
                        },
                        { withCredentials: true },
                      )
                      window.open(link, "_blank")
                    } catch (err) {
                      console.error("Failed to send session link", err)
                    }
                  }}
                >
                  Start Session
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default TeacherSessions
