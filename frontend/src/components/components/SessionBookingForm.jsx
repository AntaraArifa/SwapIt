import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { buildApiUrl, API_ENDPOINTS } from "../../config/api";
import axios from "axios";

export default function SessionBookingForm() {
  const { skillId } = useParams();
  const location = useLocation();
  const teacherID = location.state?.teacherID;

  const [form, setForm] = useState({
    date: "",
    time: "",
    note: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      if (!teacherID) throw new Error("Teacher ID is missing");

      // Send only the time (HH:mm) as slot, matching backend format
      const slot = form.time;

      const sessionData = {
        teacherID,
        skillListingID: skillId,
        slot,
        note: form.note || "",
      };

      console.log("Sending sessionData:", sessionData); // for debugging

      await axios.post(
        buildApiUrl(API_ENDPOINTS.SESSIONS.CREATE),
        sessionData,
        {
          withCredentials: true,
        }
      );

      setMessage("✅ Session request sent successfully!");
      setSuccess(true);
    } catch (err) {
      console.error("Session booking error:", err);
      const backendMessage =
        err?.response?.data?.message || "Failed to send session request.";
      setMessage(`❌ ${backendMessage}`);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-xl transition-all duration-300 ease-in-out"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          📅 Book a 1-on-1 Session
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Date:
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Time:
            </label>
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Note (optional):
            </label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Tell the teacher anything important..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading && (
            <svg
              className="animate-spin h-5 w-5 text-white"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.372 0 0 5.372 0 12h4z"
              ></path>
            </svg>
          )}
          {loading ? "Sending..." : "Request Session"}
        </button>

        {message && (
          <p
            className={`mt-4 text-center text-sm font-medium transition duration-300 ${
              success ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
