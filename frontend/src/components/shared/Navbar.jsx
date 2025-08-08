import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Settings } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { setUser, setNotifications } from "../../redux/authSlice";
import { toast } from "sonner";
import axios from "axios";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const notifications = useSelector((state) => state.auth.notifications);
  const isLoggedIn = !!user;
  const POLLING_INTERVAL = 5000;
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Determine sessions link based on user role
  const sessionsLink =
    user?.role === "teacher" ? "/sessions/teacher" : "/sessions/learner";
  // We'll insert Sessions before About dynamically below
  const navItems = [
    { name: "Home", href: "/" },
    { name: "Skills", href: "/skills" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    let intervalId;

    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/v1/notification/get",
          {
            withCredentials: true,
          }
        );

       

        if (Array.isArray(response.data.notifications)) {
          dispatch(setNotifications(response.data.notifications));
        } else {
          console.error("Unexpected API response:", response.data);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    intervalId = setInterval(fetchNotifications, POLLING_INTERVAL);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [dispatch]);

  useEffect(() => {
    const unread = notifications.filter((n) => !n.isRead).length;
    setUnreadCount(unread);
  }, [notifications]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    dispatch(setUser(null));
    toast.success("Logged out successfully!");
    navigate("/signin");
    setProfileDropdownOpen(false);
  };

  const handleManageProfile = () => {
    navigate("/profile");
    setProfileDropdownOpen(false);
  };

  const renderNavLink = (item) => (
    <Link
      key={item.name}
      to={item.href}
      onClick={() => setMenuOpen(false)}
      className="text-gray-600 hover:text-indigo-600 transition font-medium"
    >
      {item.name}
    </Link>
  );

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-gray-800">
            Swap<span className="text-indigo-600">IT</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {/* Home, Skills */}
            {navItems.map(renderNavLink)}
            {/* Sessions (if logged in) */}
            {isLoggedIn && (
              <Link
                to={sessionsLink}
                className="text-gray-600 hover:text-indigo-600 transition font-medium"
              >
                Sessions
              </Link>
            )}
            {/* About always last */}
            {renderNavLink({ name: "About", href: "/about" })}
            {isLoggedIn && (
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    axios
                      .patch(
                        "http://localhost:3000/api/v1/notification/mark-as-read",
                        {},
                        { withCredentials: true }
                      )
                      .then(() => {
                        setUnreadCount(0);
                        dispatch(
                          setNotifications(
                            notifications.map((n) => ({ ...n, isRead: true }))
                          )
                        );
                      })
                      .catch((err) =>
                        console.error("Failed to mark as read", err)
                      );
                  }}
                  className="relative focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-gray-500 text-sm">
                        No notifications
                      </p>
                    ) : (
                      <>
                        <ul className="divide-y">
                          {notifications.slice(0, 5).map((notif) => (
                            <li key={notif._id} className="p-4 space-y-1">
                              <p className="text-sm text-gray-800 font-medium">
                                {notif.sender?.fullname || "Someone"}:{" "}
                                {notif.message}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(notif.createdAt).toLocaleString()}
                              </p>
                              {notif.meetingLink && (
                                <a
                                  href={notif.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 text-sm font-semibold hover:underline"
                                >
                                  Join Meeting
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                        <div className="text-right p-2 border-t">
                          <Link
                            to="/notifications"
                            className="text-sm text-indigo-600 hover:underline font-medium"
                            onClick={() => setShowNotifications(false)}
                          >
                            See All
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {isLoggedIn ? (
              <div className="relative ml-4" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center justify-center w-10 h-10 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
                  aria-label="Profile menu"
                >
                  {user?.profile?.profilePhoto ? (
                    <img
                      src={user.profile.profilePhoto}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User size={20} />
                  )}
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                    <button
                      onClick={handleManageProfile}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                      <Settings size={16} className="mr-3" />
                      Manage Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                      <LogOut size={16} className="mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/signin"
                className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-semibold"
              >
                Sign In
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-700 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          {/* Home, Skills */}
          {navItems.map(renderNavLink)}
          {/* Sessions (if logged in) */}
          {isLoggedIn && (
            <Link
              to={sessionsLink}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 text-gray-600 hover:text-indigo-600 transition font-medium"
            >
              Sessions
            </Link>
          )}
          {/* About always last */}
          {renderNavLink({ name: "About", href: "/about" })}
          {isLoggedIn ? (
            <>
              <button
                onClick={() => {
                  handleManageProfile();
                  setMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-gray-700 hover:text-indigo-600 transition font-medium"
              >
                <Settings size={16} className="mr-3" />
                Manage Profile
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 font-semibold"
              >
                <LogOut size={16} className="mr-3" />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/signin"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold text-center"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
