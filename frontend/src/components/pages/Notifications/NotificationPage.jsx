import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setNotifications } from "../../../redux/authSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NotificationPage = () => {
  const notifications = useSelector((state) => state.auth.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/v1/notification/get",
          { withCredentials: true }
        );
        if (Array.isArray(response.data.notifications)) {
          dispatch(setNotifications(response.data.notifications));
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [dispatch]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">All Notifications</h1>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center">You don’t have any notifications.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notif) => (
            <li key={notif._id} className="p-4 border rounded-lg shadow-sm bg-white">
              <div className="text-sm text-gray-800 font-medium">
                {notif.sender?.fullname || "Someone"}: {notif.message}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(notif.createdAt).toLocaleString()}
              </div>
              {notif.meetingLink && (
                <a
                  href={notif.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-indigo-600 text-sm font-semibold hover:underline"
                >
                  Join Meeting
                </a>
              )}
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => navigate(-1)}
        className="mt-8 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium"
      >
        ← Back
      </button>
    </div>
  );
};

export default NotificationPage;
