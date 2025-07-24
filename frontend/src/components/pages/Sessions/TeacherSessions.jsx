import React, { useEffect, useState } from "react";
import {
  getSessionsByRole,
  updateSessionStatus,
  proposeSessionReschedule,
} from "../../../config/api";

const TeacherSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleData, setRescheduleData] = useState({});

  const fetchSessions = async () => {
    try {
      const response = await getSessionsByRole("teacher");
      setSessions(response);
    } catch (error) {
      console.error("Error fetching teacher sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleStatusChange = async (sessionId, status) => {
    try {
      await updateSessionStatus(sessionId, status);
      fetchSessions();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleRescheduleSubmit = async (sessionId) => {
    const newTime = rescheduleData[sessionId];
    if (!newTime) return;
    try {
      await proposeSessionReschedule(sessionId, { newTime });
      fetchSessions();
    } catch (err) {
      console.error("Failed to propose reschedule:", err);
    }
  };

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
            <li
              key={session._id}
              className="border rounded-xl shadow p-4 bg-white space-y-2"
            >
              <p><strong>🙋 Learner:</strong> {session.learnerID?.fullname || "N/A"}</p>
              <p><strong>🎯 Skill:</strong> {session.skillName || session.skillListingID?.title || "N/A"}</p>
              <p><strong>💵 Price:</strong> ${session.price || session.skillListingID?.fee || "N/A"}</p>
              <p><strong>🕒 Time Slot:</strong> {session.scheduledTime}</p>
              <p>
                <strong>📌 Status:</strong>{" "}
                <span className={`inline-block px-2 py-0.5 text-sm rounded-full ${session.status === "accepted" ? "bg-green-100 text-green-800" : session.status === "pending" ? "bg-yellow-100 text-yellow-800" : session.status === "rejected" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-700"}`}>
                  {session.status}
                </span>
              </p>

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
                      type="time"
                      value={rescheduleData[session._id] || ""}
                      onChange={(e) =>
                        setRescheduleData({
                          ...rescheduleData,
                          [session._id]: e.target.value,
                        })
                      }
                      className="border p-2 rounded w-40"
                    />
                    <button
                      onClick={() => handleRescheduleSubmit(session._id)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1.5 rounded"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TeacherSessions;
