// src/components/pages/Sessions/TeacherSessions.jsx
"use client";

import { useEffect, useState } from "react";
import {
  getSessionsByRole,
  updateSessionStatus,
  proposeSessionReschedule,
} from "../../../config/api";
import { getSkillListingById } from "../../../config/skillListing";
import axios from "axios";

import { groupSessionsByStatus, STATUS_ORDER } from "../../../lib/sessionUtils";

const iconFor = (status) => {
  switch (status) {
    case "accepted":
      // check-circle
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 22a10 10 0 100-20 10 10 0 000 20z" />
        </svg>
      );
    case "pending":
      // hourglass
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2h12M6 22h12M8 2v5a4 4 0 004 4 4 4 0 004-4V2M8 22v-5a4 4 0 014-4 4 4 0 014 4v5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case "rejected":
      // x-circle
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 22a10 10 0 100-20 10 10 0 000 20z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case "rescheduled":
      // calendar-clock
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 2v4M16 2v4M3 9h18M21 9v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15.5 16.5H13v-3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case "completed":
      // flag
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 21V6m0 0s2-2 6-2 6 2 6 2 2-2 4-2v11s-2-2-6-2-6 2-6 2-2-2-4-2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    default:
      // dot
      return <span className="inline-block h-2 w-2 rounded-full bg-gray-400" />;
  }
};

const TeacherSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleData, setRescheduleData] = useState({});
  const [availableSlotsMap, setAvailableSlotsMap] = useState({});

  const fetchSessions = async () => {
    try {
      const response = await getSessionsByRole("teacher");
      const sessionsArray = Array.isArray(response) ? response : response.sessions || [];
      setSessions(sessionsArray);

      const uniqueListingIds = [...new Set(sessionsArray.map((s) => s.skillListingID?._id).filter(Boolean))];
      const slotsMap = {};
      await Promise.all(
        uniqueListingIds.map(async (id) => {
          try {
            const listing = await getSkillListingById(id);
            slotsMap[id] = listing.availableSlots || [];
          } catch {
            slotsMap[id] = [];
          }
        })
      );
      setAvailableSlotsMap(slotsMap);
    } catch (error) {
      console.error("Error fetching teacher sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  const handleStatusChange = async (sessionId, status) => {
    try { await updateSessionStatus(sessionId, status); fetchSessions(); }
    catch (error) { console.error("Failed to update status:", error); }
  };

  const handleRescheduleSubmit = async (sessionId) => {
    const { newDate, newTime } = rescheduleData[sessionId] || {};
    if (!newDate || !newTime) return;
    try { await proposeSessionReschedule(sessionId, { newDate, newTime }); fetchSessions(); }
    catch (err) { console.error("Failed to propose reschedule:", err); }
  };

  const isSessionNow = (scheduledTime) => {
    if (!scheduledTime) return false;
    const now = new Date();
    const scheduled = new Date(scheduledTime);
    const diff = Math.abs(now - scheduled);
    return diff <= 60 * 60 * 1000;
  };
  const hasSessionPassed = (scheduledTime) => {
    if (!scheduledTime) return false;
    return new Date() > new Date(scheduledTime);
  };

  const groupedSections = groupSessionsByStatus(sessions, STATUS_ORDER);

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto bg-gradient-to-br from-indigo-50 via-white to-indigo-50 rounded-2xl shadow-xl">
      <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-indigo-900 border-b-2 border-indigo-700 pb-3 tracking-tight select-none">
        👩‍🏫 Incoming Session Requests
      </h2>

      {loading ? (
        <p className="text-center text-base text-gray-500 my-24 animate-pulse">Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <p className="text-center text-base text-gray-400 my-24 italic select-none">No session requests yet.</p>
      ) : (
        groupedSections.map((section) => (
          <section key={section.status} className="mb-8">
            <h3 className="text-lg md:text-xl font-semibold mb-4 capitalize flex items-center justify-between border-b border-indigo-200 pb-2 select-none">
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
                <li
                  key={session._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-5 border border-indigo-100"
                >
                  <p className="text-base md:text-lg font-semibold text-indigo-900 mb-2 tracking-tight select-text">
                    🎯 {session.skillName || session.skillListingID?.title || "N/A"}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700 text-sm md:text-base select-text">
                    <p>
                      <strong className="inline-flex items-center gap-1.5 text-indigo-700 font-semibold">
                        <span>🙋 Learner:</span>
                      </strong>{" "}
                      {session.learnerID?.fullname || "N/A"}
                    </p>
                    <p>
                      <strong className="inline-flex items-center gap-1.5 text-indigo-700 font-semibold">
                        <span>💵 Price:</span>
                      </strong>{" "}
                      ৳{session.price || session.skillListingID?.fee || "N/A"}
                    </p>
                    <p>
                      <strong className="inline-flex items-center gap-1.5 text-indigo-700 font-semibold">
                        <span>🕒 Time Slot:</span>
                      </strong>{" "}
                      {session.scheduledTime
                        ? new Date(session.scheduledTime).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
                        : "N/A"}
                    </p>
                    <p>
                      <strong className="inline-flex items-center gap-1.5 text-indigo-700 font-semibold">
                        <span>📌 Status:</span>
                      </strong>{" "}
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
                    <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 mt-4 text-amber-900 text-sm font-medium">
                      <p>
                        <strong>📅 New Time Slot:</strong>{" "}
                        {(() => {
                          const { newDate, newTime } = session.rescheduleRequest;
                          if (newDate && newTime) {
                            let dateStr = newDate;
                            if (typeof dateStr === "string" && dateStr.length > 10) {
                              dateStr = new Date(dateStr).toISOString().slice(0, 10);
                            }
                            try {
                              return new Date(`${dateStr}T${newTime}`).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
                            } catch {
                              return `${dateStr} ${newTime}`;
                            }
                          } else if (newTime) {
                            return newTime.length <= 5
                              ? newTime
                              : (() => {
                                  try {
                                    return new Date(`1970-01-01T${newTime}`).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
                                  } catch {
                                    return newTime;
                                  }
                                })();
                          }
                          return "N/A";
                        })()}
                      </p>
                    </div>
                  )}

                  {session.status === "pending" && (
                    <div className="flex gap-3 mt-5">
                      <button
                        onClick={() => handleStatusChange(session._id, "accepted")}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2 rounded-xl shadow-md transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusChange(session._id, "rejected")}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold py-2 rounded-xl shadow-md transition"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {session.status === "accepted" && (
                    <>
                      <div className="mt-5 space-y-2">
                        <label className="block text-sm font-semibold text-indigo-800 select-none">
                          Propose Reschedule:
                        </label>
                        <div className="flex flex-wrap gap-3">
                          <input
                            type="date"
                            value={rescheduleData[session._id]?.newDate || ""}
                            min={new Date().toISOString().slice(0, 10)}
                            onChange={(e) =>
                              setRescheduleData((prev) => ({
                                ...prev,
                                [session._id]: { ...prev[session._id], newDate: e.target.value },
                              }))
                            }
                            className="border border-indigo-200 p-2 rounded-lg w-40 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition text-sm"
                          />
                          <select
                            value={rescheduleData[session._id]?.newTime || ""}
                            onChange={(e) =>
                              setRescheduleData((prev) => ({
                                ...prev,
                                [session._id]: { ...prev[session._id], newTime: e.target.value },
                              }))
                            }
                            className="border border-indigo-200 p-2 rounded-lg w-36 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition text-sm"
                          >
                            <option value="">--:-- --</option>
                            {(availableSlotsMap[session.skillListingID?._id] || []).map((slot) => (
                              <option key={slot} value={slot}>{slot}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleRescheduleSubmit(session._id)}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition text-sm"
                          >
                            Send
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-5">
                        {isSessionNow(session.scheduledTime) && (
                          <button
                            className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-indigo-700 shadow-md transition select-none"
                            onClick={async () => {
                              const roomCode = Math.random().toString(36).substring(2, 10);
                              const link = `http://localhost:5173/meeting/${roomCode}`;
                              try {
                                await axios.post(
                                  "http://localhost:3000/api/v1/notification/send",
                                  {
                                    recipient: session.learnerID._id,
                                    message: `Your session is starting now! Click below to join.`,
                                    meetingLink: link,
                                  },
                                  { withCredentials: true }
                                );
                                window.open(link, "_blank");
                              } catch (err) {
                                console.error("Failed to send session link", err);
                              }
                            }}
                          >
                            Start Session
                          </button>
                        )}

                        {hasSessionPassed(session.scheduledTime) && (
                          <button
                            className="bg-gray-900 text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-800 shadow-md transition select-none"
                            onClick={() => handleStatusChange(session._id, "completed")}
                          >
                            End Session
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
};

export default TeacherSessions;
