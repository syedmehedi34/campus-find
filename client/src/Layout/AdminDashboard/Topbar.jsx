// client/src/Layout/UserDashboard/Topbar.jsx
import { useState, useEffect, useRef } from "react";
import { FaSearch, FaBars } from "react-icons/fa";
import { Link } from "react-router";

const dropdownClass = (open) =>
  `absolute right-0 mt-3 origin-top-right rounded-2xl border border-white/10 bg-teal-900/95 shadow-2xl backdrop-blur-xl transition-all duration-200 ${
    open
      ? "visible translate-y-0 scale-100 opacity-100"
      : "pointer-events-none invisible -translate-y-2 scale-95 opacity-0"
  }`;

const TopBar = ({ isMobile, toggleSidebar, user, userRole, onLogout }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const displayName = user?.displayName || "Guest User";
  const initial = displayName.charAt(0).toUpperCase();

  // Close dropdowns on outside click / Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!notificationRef.current?.contains(e.target))
        if (!profileRef.current?.contains(e.target)) setShowProfileMenu(false);
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const iconBtn =
    "relative flex h-10 w-10 items-center justify-center rounded-full text-lg text-teal-100 transition-all duration-200 hover:bg-white/15 hover:text-white active:scale-95";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-white/10 bg-teal-900/80 px-4 shadow-lg shadow-black/10 backdrop-blur-xl sm:px-6">
      {/* Left: hamburger + search */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {isMobile && (
          <button
            onClick={toggleSidebar}
            aria-label="Open menu"
            className={iconBtn}
          >
            <FaBars />
          </button>
        )}

        <div className="group hidden w-full max-w-sm items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 transition-all duration-300 focus-within:border-teal-300/60 focus-within:bg-white/15 sm:flex">
          <FaSearch className="text-sm text-teal-200" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-transparent text-sm text-white placeholder-teal-200/60 outline-none"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setShowProfileMenu((p) => !p);
            }}
            className="flex items-center gap-3 rounded-full p-1 pr-1 transition-colors duration-200 hover:bg-white/10 md:pr-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-teal-300 to-emerald-500 text-lg font-bold text-teal-950 ring-2 ring-teal-300/60 transition-all duration-300 hover:ring-teal-200">
              {initial}
            </div>

            <div className="hidden text-left md:block">
              <p className="text-sm font-medium leading-tight text-white">
                {displayName}
              </p>

              {user?.email && (
                <p className="text-xs font-light text-teal-200">{user.email}</p>
              )}
            </div>
          </button>

          <div className={`${dropdownClass(showProfileMenu)} w-56`}>
            <div className="p-4">
              <p className="text-sm font-semibold text-white">{displayName}</p>

              <p className="text-xs capitalize text-teal-300">{userRole}</p>

              <div className="mt-3 space-y-1">
                <Link
                  to="/user-dashboard/my-profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="block rounded-xl p-2 text-sm text-teal-100 transition-colors duration-200 hover:bg-white/10"
                >
                  Profile
                </Link>

                <button
                  onClick={onLogout}
                  className="w-full rounded-xl p-2 text-left text-sm text-teal-100 transition-colors duration-200 hover:bg-red-500/20 hover:text-red-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
