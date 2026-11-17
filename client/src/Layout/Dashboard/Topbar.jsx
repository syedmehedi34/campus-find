/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { FaSun, FaMoon, FaBell, FaSearch } from "react-icons/fa";
import { Link } from "react-router";

const TopBar = ({ isSidebarOpen, isMobile, userRole, user }) => {
  // Fixed values for design purposes
  const darkMode = true; // Assume dark mode is enabled
  const userData = user || {
    displayName: "John Doe",
    email: "john@example.com",
  }; // Mock user
  const role = userRole || "admin"; // Fixed role
  const [showNotifications, setShowNotifications] = useState(false); // State for notification dropdown
  const [showProfileMenu, setShowProfileMenu] = useState(false); // State for profile dropdown
  const [currentNews, setCurrentNews] = useState(0); // State for news ticker
  const notificationRef = useRef(null); // Ref for notification dropdown
  const profileRef = useRef(null); // Ref for profile dropdown

  // Handle outside clicks to close both dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target) &&
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Animation variants for news ticker
  const modalVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div
      className={`fixed top-0 z-20 flex items-center justify-between px-6 py-4 shadow-md bg-teal-900 backdrop-blur-md ${
        isSidebarOpen
          ? "left-64 w-[calc(100%-16rem)]"
          : "left-16 w-[calc(100%-4rem)]"
      } transition-all duration-300`}
    >
      <div></div>
      {/* Right-side controls */}
      <div className="flex items-center space-x-4">
        {/* Dark mode toggle */}
        <button className="text-teal-100 text-xl focus:outline-none hover:bg-teal-800 p-2 rounded-full transition-colors duration-300">
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false); // Close notifications when profile is toggled
            }}
            className="flex items-center space-x-2"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-teal-300 transition-all duration-300 hover:border-teal-400">
              <div className="w-full h-full bg-teal-600 flex items-center justify-center text-teal-100 text-xl md:text-2xl font-bold">
                {userData.displayName
                  ? userData.displayName.charAt(0).toUpperCase()
                  : "U"}
              </div>
            </div>
            <div className="hidden md:flex">
              <div className="text-teal-100 text-center md:text-left">
                <p className="text-sm md:text-lg font-medium">
                  {userData?.displayName || "Guest User"}
                </p>
                {userData.email && (
                  <p className="text-xs md:text-sm font-light">
                    {userData?.email}
                  </p>
                )}
              </div>
            </div>
          </button>
          {/* Toggleable profile dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-teal-800 rounded-lg shadow-xl z-50 border border-teal-700">
              <div className="p-4">
                <p className="text-sm font-medium text-teal-100">
                  {userData?.displayName || "Guest User"}
                </p>
                <p className="text-xs text-teal-300">{role}</p>
                <div className="mt-2 space-y-1">
                  <Link
                    to="/dashboard/my-profile"
                    className="block text-sm text-teal-100 hover:bg-teal-700 p-2 rounded-lg transition-colors duration-200"
                  >
                    Profile
                  </Link>
                  <button className="w-full text-left text-sm text-teal-100 hover:bg-teal-700 p-2 rounded-lg transition-colors duration-200">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
