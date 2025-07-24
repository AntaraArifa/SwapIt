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

      const slot = form.time;
      const sessionData = {
        teacherID,
        skillListingID: skillId,
        slot,
        note: form.note || "",
      };

      await axios.post(
        buildApiUrl(API_ENDPOINTS.SESSIONS.CREATE),
        sessionData,
        { withCredentials: true }
      );

      setMessage("✅ Session request sent successfully!");
      setSuccess(true);
      setForm({ date: "", time: "", note: "" });
    } catch (err) {
      const backendMessage =
        err?.response?.data?.message || "❌ Failed to send session request.";
      setMessage(backendMessage);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-2xl p-8 rounded-3xl shadow-xl space-y-6 border border-blue-200"
      >
        <h2 className="text-3xl font-bold text-center text-blue-700">
          📅 Book Your 1-on-1 Session
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Time</label>
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Note to Teacher (optional)
          </label>
          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            rows="3"
            placeholder="Anything specific you want the teacher to know?"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition duration-200 flex justify-center items-center gap-2 ${
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
          {loading ? "Sending Request..." : "Send Session Request"}
        </button>

        {message && (
          <p
            className={`text-center text-sm font-medium transition duration-300 ${
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
