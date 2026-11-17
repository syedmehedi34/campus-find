// client/src/Layout/UserDashboard/Sidebar.jsx
import { Link, NavLink } from "react-router";
import {
  FaBars,
  FaTimes,
  FaTachometerAlt,
  FaUser,
  FaUsersCog,
  FaSignOutAlt,
  FaSearchLocation,
} from "react-icons/fa";

// Give every item a unique path (used as key too)
const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: FaTachometerAlt },
  { path: "/dashboard/my-profile", label: "My Profile", icon: FaUser },
  { path: "/dashboard/sample-user", label: "Sample User", icon: FaUsersCog },
];

const Sidebar = ({
  isSidebarOpen,
  isMobile,
  toggleSidebar,
  closeSidebar,
  userRole,
  user,
  onLogout,
}) => {
  // On mobile the drawer is always full-width; on desktop it can collapse
  const expanded = isMobile || isSidebarOpen;

  const labelClass = `whitespace-nowrap text-sm font-medium transition-all duration-300 ${
    expanded ? "w-auto opacity-100" : "w-0 overflow-hidden opacity-0"
  }`;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/10 bg-linear-to-b from-teal-900 via-teal-800 to-emerald-900 text-white shadow-2xl transition-all duration-300 ease-in-out ${
        isMobile
          ? `w-72 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`
          : isSidebarOpen
            ? "w-64"
            : "w-20"
      }`}
    >
      {/* Header */}
      <div
        className={`flex h-16 shrink-0 items-center border-b border-white/10 px-4 ${
          expanded ? "justify-between" : "justify-center"
        }`}
      >
        {expanded && (
          <Link to="/" className="group flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-lg shadow-inner transition-transform duration-300 group-hover:rotate-12">
              <FaSearchLocation />
            </span>
            <span className="bg-linear-to-r from-white to-teal-200 bg-clip-text text-xl font-bold tracking-tight text-transparent">
              CampusFind
            </span>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="rounded-lg p-2 text-teal-100 transition-colors duration-200 hover:bg-white/15 hover:text-white"
        >
          {isMobile ? (
            <FaTimes className="text-lg" />
          ) : (
            <FaBars className="text-lg" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
        {expanded && (
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-widest text-teal-300/70">
            Menu
          </p>
        )}
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <li key={path}>
              <NavLink
                to={path}
                end
                title={!expanded ? label : undefined}
                onClick={() => isMobile && closeSidebar()}
                className={({ isActive }) =>
                  `group relative flex items-center rounded-xl p-2.5 transition-all duration-200 ${
                    expanded ? "gap-3" : "justify-center"
                  } ${
                    isActive
                      ? "bg-white/15 font-semibold text-white shadow-lg shadow-black/10"
                      : "text-teal-100/80 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator bar */}
                    <span
                      className={`absolute -left-3 h-6 w-1 rounded-r-full bg-teal-300 transition-all duration-300 ${
                        isActive
                          ? "scale-y-100 opacity-100"
                          : "scale-y-0 opacity-0"
                      }`}
                    />
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center text-lg transition-transform duration-200 group-hover:scale-110">
                      <Icon />
                    </span>
                    <span className={labelClass}>{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="shrink-0 space-y-3 border-t border-white/10 p-3">
        {expanded && (
          <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-400/30 font-bold">
              {user?.displayName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {user?.displayName || "Guest"}
              </p>
              <p className="text-xs capitalize text-teal-200">{userRole}</p>
            </div>
          </div>
        )}

        <button
          onClick={onLogout}
          title={!expanded ? "Logout" : undefined}
          className={`flex w-full items-center rounded-xl p-2.5 text-teal-100/80 transition-all duration-200 hover:bg-red-500/20 hover:text-red-200 ${
            expanded ? "gap-3" : "justify-center"
          }`}
        >
          <span className="flex h-6 w-6 items-center justify-center text-lg">
            <FaSignOutAlt />
          </span>
          <span className={labelClass}>Logout</span>
        </button>

        {expanded && (
          <p className="text-center text-xs text-teal-200/60">
            © 2026 CampusFind Solutions
          </p>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
