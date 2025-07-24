import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Settings } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../../redux/authSlice";
import { toast } from "sonner";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const isLoggedIn = !!user;

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
