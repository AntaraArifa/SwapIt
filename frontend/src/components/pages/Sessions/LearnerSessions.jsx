// src/components/pages/Sessions/LearnerSessions.jsx
"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Star } from "lucide-react";
import { toast } from "sonner";
import {
  getSessionsByRole,
  respondSessionReschedule,
} from "../../../config/api";
import { groupSessionsByStatus } from "../../../lib/sessionUtils";


const iconFor = (status) => {
  switch (status) {
    case "accepted":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 22a10 10 0 100-20 10 10 0 000 20z" />
        </svg>
      );
    case "pending":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2h12M6 22h12M8 2v5a4 4 0 004 4 4 4 0 004-4V2M8 22v-5a4 4 0 014-4 4 4 0 014 4v5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case "rejected":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 22a10 10 0 100-20 10 10 0 000 20z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case "rescheduled":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 2v4M16 2v4M3 9h18M21 9v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15.5 16.5H13v-3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case "completed":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 21V6m0 0s2-2 6-2 6 2 6 2 2-2 4-2v11s-2-2-6-2-6 2-6 2-2-2-4-2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    default:
      return <span className="inline-block h-2 w-2 rounded-full bg-gray-400" />;
  }
};

const SessionCard = ({
  session,
  onRespondReschedule,
  responding,
  onRateSession,
  ratedSessions,
}) => {
  const scheduledLabel = session.scheduledTime
    ? new Date(session.scheduledTime).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "N/A";

  return (
    <li className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-5 border border-indigo-100 space-y-2.5">
      <p className="text-base md:text-lg font-semibold text-indigo-900">
        {session.skillName || session.skillListingID?.title || "N/A"}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm md:text-base text-gray-700">
        <p><strong className="text-indigo-700">Teacher:</strong> {session.teacherID?.fullname || "N/A"}</p>
        <p><strong className="text-indigo-700">Price:</strong> ৳{session.price || session.skillListingID?.fee || "N/A"}</p>
        <p><strong className="text-indigo-700">Time Slot:</strong> {scheduledLabel}</p>
        <p>
          <strong className="text-indigo-700">Status:</strong>{" "}
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full font-semibold text-[11px] tracking-wide
              ${
                session.status === "accepted"
                  ? "bg-emerald-100 text-emerald-800"
                  : session.status === "pending"
                  ? "bg-amber-100 text-amber-800"
                  : session.status === "rejected"
                  ? "bg-rose-100 text-rose-800"
                  : session.status === "completed"
                  ? "bg-sky-100 text-sky-800"
                  : "bg-gray-100 text-gray-700"
              }
            `}
          >
            {session.status.toUpperCase()}
          </span>
        </p>
      </div>

      {session.status === "rescheduled" && session.rescheduleRequest && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-amber-900 font-medium">
          <p className="mb-2 text-sm">
            <strong>New Time Slot:</strong>{" "}
            {(() => {
              const { newDate, newTime } = session.rescheduleRequest || {};
              if (newDate && newTime) {
                let dateStr = newDate;
                if (typeof dateStr === "string" && dateStr.length > 10) {
                  dateStr = new Date(dateStr).toISOString().slice(0, 10);
                }
                try {
                  return new Date(`${dateStr}T${newTime}`).toLocaleString(
                    undefined,
                    { dateStyle: "medium", timeStyle: "short" }
                  );
                } catch {
                  return `${dateStr} ${newTime}`;
                }
              } else if (newTime) {
                return newTime.length <= 5
                  ? newTime
                  : (() => {
                      try {
                        return new Date(`1970-01-01T${newTime}`).toLocaleTimeString(
                          undefined,
                          { hour: "2-digit", minute: "2-digit" }
                        );
                      } catch {
                        return newTime;
                      }
                    })();
              }
              return "N/A";
            })()}
          </p>

          <div className="flex gap-2.5">
            <button
              onClick={() => onRespondReschedule(session._id, true)}
              disabled={responding[session._id]}
              className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm font-semibold"
            >
              {responding[session._id] ? "Please wait..." : "Accept"}
            </button>
            <button
              onClick={() => onRespondReschedule(session._id, false)}
              disabled={responding[session._id]}
              className="flex-1 px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 transition text-sm font-semibold"
            >
              {responding[session._id] ? "Please wait..." : "Reject"}
            </button>
          </div>
        </div>
      )}

      {session.status === "completed" && (
        <div className="mt-2">
          {ratedSessions.has(session._id) ? (
            <button
              disabled
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-semibold text-sm"
            >
              <Star size={16} />
              Already Rated
            </button>
          ) : (
            <button
              onClick={() => onRateSession(session)}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-semibold text-sm shadow"
            >
              <Star size={16} />
              Rate Us
            </button>
          )}
        </div>
      )}
    </li>
  );
};

const LearnerSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState({});
  const [ratedSessions, setRatedSessions] = useState(new Set());
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  // rating checks
  const checkSessionRating = async (skillListingId) => {
    if (!user || !skillListingId) return false;
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/ratings/listing/${skillListingId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const data = await response.json();
      if (data.success && data.ratings && data.ratings.length > 0) {
        const userRating = data.ratings.find(
          (r) => r.learnerID._id === user._id || r.learnerID === user._id
        );
        return !!userRating;
      }
      return false;
    } catch (error) {
      console.error("Error checking rating for session:", error);
      return false;
    }
  };

  const checkAllSessionRatings = async (sessionsList) => {
    const completed = sessionsList.filter((s) => s.status === "completed");
    const ratedIds = new Set(
      (
        await Promise.all(
          completed.map(async (s) => {
            const id = s.skillListingID?._id || s.skillListingID;
            if (!id) return null;
            const isRated = await checkSessionRating(id);
            return isRated ? s._id : null;
          })
        )
      ).filter(Boolean)
    );
    setRatedSessions(ratedIds);
  };

  const handleRescheduleResponse = async (sessionId, accept) => {
    setResponding((prev) => ({ ...prev, [sessionId]: true }));
    try {
      await respondSessionReschedule(sessionId, accept);
      const fetched = await getSessionsByRole("learner");
      const sessionsArray = Array.isArray(fetched) ? fetched : fetched.sessions || [];
      setSessions(sessionsArray);
      await checkAllSessionRatings(sessionsArray);
    } catch (err) {
      console.error("Failed to respond to reschedule:", err);
    } finally {
      setResponding((prev) => ({ ...prev, [sessionId]: false }));
    }
  };

  const handleRateSession = (session) => {
    if (!user) {
      toast.error("Please sign in to rate sessions");
      navigate("/signin", {
        state: {
          returnUrl: `/rating/${session.skillListingID?._id || session.skillListingID}`,
          returnState: { sessionData: session },
        },
      });
      return;
    }
    if (user.role !== "learner") {
      toast.error("Only learners can rate sessions");
      return;
    }
    if (ratedSessions.has(session._id)) {
      toast.info("You have already rated this session");
      return;
    }
    const skillListingId = session.skillListingID?._id || session.skillListingID;
    if (skillListingId) {
      navigate(`/rating/${skillListingId}`, {
        state: {
          sessionData: session,
          teacherID: session.teacherID?._id || session.teacherID,
          learnerID: session.learnerID?._id || session.learnerID,
        },
      });
    } else {
      toast.error("Unable to find skill listing information");
    }
  };

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await getSessionsByRole("learner");
        const sessionsArray = Array.isArray(response) ? response : response.sessions || [];
        setSessions(sessionsArray);
        await checkAllSessionRatings(sessionsArray);
      } catch (error) {
        console.error("Error fetching learner sessions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  useEffect(() => {
    const whenVisible = () => {
      if (!document.hidden && sessions.length > 0) {
        checkAllSessionRatings(sessions);
      }
    };
    document.addEventListener("visibilitychange", whenVisible);
    return () => document.removeEventListener("visibilitychange", whenVisible);
  }, [sessions]);

  const sections = groupSessionsByStatus(sessions);

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto bg-gradient-to-br from-indigo-50 via-white to-indigo-50 min-h-screen rounded-2xl shadow-xl">
      <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-indigo-900 border-b-2 border-indigo-600 pb-3 tracking-tight">
        My Session Requests
      </h2>

      {loading ? (
        <p className="text-center text-base text-gray-500 my-24">Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <p className="text-center text-base text-gray-400 my-24 italic">No sessions found.</p>
      ) : (
        sections.map((section) => (
          <section key={section.status} className="mb-8">
            <h3 className="text-lg md:text-xl font-semibold mb-4 capitalize flex items-center justify-between border-b border-indigo-200 pb-2">
              <span className="flex items-center gap-2">
                {iconFor(section.status)}
                {section.status}
              </span>
              <span className="inline-block bg-indigo-200 text-indigo-900 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide shadow">
                {section.items.length}
              </span>
            </h3>

            <ul className="space-y-4">
              {section.items.map((session) => (
                <SessionCard
                  key={session._id}
                  session={session}
                  onRespondReschedule={handleRescheduleResponse}
                  responding={responding}
                  onRateSession={handleRateSession}
                  ratedSessions={ratedSessions}
                />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
};

export default LearnerSessions;
