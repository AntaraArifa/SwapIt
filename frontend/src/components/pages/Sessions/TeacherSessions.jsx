import React, { useEffect, useState } from "react";
import { getSessionsByRole, updateSessionStatus } from "../../../config/api";

const TeacherSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

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
      fetchSessions(); // Refresh the list
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Incoming Session Requests</h2>
      {loading ? (
        <p>Loading...</p>
      ) : sessions.length === 0 ? (
        <p>No session requests yet.</p>
      ) : (
        <ul className="space-y-4">
          {sessions.map((session) => (
            <li key={session._id} className="border p-3 rounded shadow">
              <p>
                <strong>Learner:</strong> {session.learnerID?.fullname || "N/A"}
              </p>
              <p>
                <strong>Skill:</strong>{" "}
                {session.skillName || (session.skillListingID?.title ?? "N/A")}
              </p>
              <p>
                <strong>Price:</strong>{" "}
                {typeof session.price === "number"
                  ? `$${session.price}`
                  : session.skillListingID?.fee
                  ? `$${session.skillListingID.fee}`
                  : "N/A"}
              </p>
              <p>
                <strong>Time Slot:</strong> {session.scheduledTime}
              </p>
              <p>
                <strong>Status:</strong> {session.status}
              </p>
              {session.status === "pending" && (
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => handleStatusChange(session._id, "accepted")}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleStatusChange(session._id, "rejected")}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>
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
