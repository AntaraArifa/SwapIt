import React, { useEffect, useState } from "react";
import { getSessionsByRole } from "../../../config/api";

const LearnerSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">My Session Requests</h2>
      {loading ? (
        <p>Loading...</p>
      ) : sessions.length === 0 ? (
        <p>No sessions found.</p>
      ) : (
        <ul className="space-y-4">
          {sessions.map((session) => (
            <li key={session._id} className="border p-3 rounded shadow">
              <div>
                <p>
                  <strong>Teacher:</strong>{" "}
                  {session.teacherID?.fullname || "N/A"}
                </p>
                <p>
                  <strong>Skill:</strong>{" "}
                  {session.skillName ||
                    (session.skillListingID?.title ?? "N/A")}
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
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LearnerSessions;
