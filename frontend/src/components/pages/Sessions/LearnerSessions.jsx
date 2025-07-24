import React, { useEffect, useState } from "react";
import {
  getSessionsByRole,
  respondSessionReschedule,
} from "../../../config/api";

const LearnerSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState({});

  const handleRescheduleResponse = async (sessionId, accept) => {
    setResponding((prev) => ({ ...prev, [sessionId]: true }));
    try {
      await respondSessionReschedule(sessionId, accept);
      const response = await getSessionsByRole("learner");
      setSessions(response);
    } catch (err) {
      console.error("Failed to respond to reschedule:", err);
    } finally {
      setResponding((prev) => ({ ...prev, [sessionId]: false }));
    }
  };

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await getSessionsByRole("learner");
        setSessions(response);
      } catch (error) {
        console.error("Error fetching learner sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        📚 My Session Requests
      </h2>
      {loading ? (
        <p>Loading...</p>
      ) : sessions.length === 0 ? (
        <p>No sessions found.</p>
      ) : (
        <ul className="space-y-6">
          {sessions.map((session) => (
            <li
              key={session._id}
              className="border rounded-xl shadow p-4 bg-white space-y-2"
            >
              <p>
                <strong>👩‍🏫 Teacher:</strong>{" "}
                {session.teacherID?.fullname || "N/A"}
              </p>
              <p>
                <strong>🎯 Skill:</strong>{" "}
                {session.skillName || session.skillListingID?.title || "N/A"}
              </p>
              <p>
                <strong>💵 Price:</strong> $
                {session.price || session.skillListingID?.fee || "N/A"}
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
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {session.status}
                </span>
              </p>

              {session.status === "rescheduled" &&
                session.rescheduleRequest && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-3">
                    <p className="mb-2">
                      <strong>📅 New Time Slot:</strong>{" "}
                      {(() => {
                        const { newDate, newTime } = session.rescheduleRequest;
                        if (newDate && newTime) {
                          // Try to extract YYYY-MM-DD from newDate (could be ISO string)
                          let dateStr = newDate;
                          if (
                            typeof dateStr === "string" &&
                            dateStr.length > 10
                          ) {
                            // ISO string, extract date part
                            dateStr = new Date(dateStr)
                              .toISOString()
                              .slice(0, 10);
                          }
                          try {
                            return new Date(
                              `${dateStr}T${newTime}`
                            ).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            });
                          } catch {
                            return `${dateStr} ${newTime}`;
                          }
                        } else if (newTime) {
                          return newTime.length <= 5
                            ? newTime
                            : (() => {
                                try {
                                  return new Date(
                                    `1970-01-01T${newTime}`
                                  ).toLocaleTimeString(undefined, {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  });
                                } catch {
                                  return newTime;
                                }
                              })();
                        } else {
                          return "N/A";
                        }
                      })()}
                    </p>
                  </div>
                )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LearnerSessions;
