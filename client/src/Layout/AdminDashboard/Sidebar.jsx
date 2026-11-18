// client/src/Layout/AdminDashboard/Sidebar.jsx
import { Link, NavLink } from "react-router";
import {
  FaBars,
  FaTimes,
  FaTachometerAlt,
  FaUser,
  FaSignOutAlt,
  FaSearchLocation,
} from "react-icons/fa";
import { FilePlusCorner, List, Notebook } from "lucide-react";
<List />;

// Give every item a unique path (used as key too)
const NAV_ITEMS = [
  { path: "/admin-dashboard", label: "Dashboard", icon: FaTachometerAlt },
  { path: "/admin-dashboard/my-profile", label: "My Profile", icon: FaUser },
  { path: "/admin-dashboard/all-posts", label: "All Posts", icon: List },
  {
    path: "/admin-dashboard/manage-users",
    label: "Manage Users",
    icon: FaUser,
  },
  {
    path: "/admin-dashboard/manage-campuses",
    label: "Manage Campuses",
    icon: FaSearchLocation,
  },

  {
    path: "/admin-dashboard/create-new-post",
    label: "Create New Post",
    icon: FilePlusCorner,
  },
  { path: "/admin-dashboard/my-posts", label: "My Posts", icon: Notebook },
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

{
  /*

--
--
1. Overview

Route: /admin/dashboard
- Total Users
- Total Campuses
- Total Lost Posts
- Total Found Posts
- Pending Posts
- Recovered Items
- Recent Activities

2. Manage Posts


Route: /admin/posts
- All Posts
- Pending Posts
- Approved Posts
- Rejected Posts
- Reported Posts
- Edit / Delete Posts
- Approve / Reject Posts

3. Manage Users

Route: /admin/users
- All Users
- Search Users
- Filter by Campus
- User Details
- Block / Unblock Users
- Change User Role

4. Manage Campuses

Route: /admin/campuses
- All Campuses
- Add New Campus
- Edit Campus Information
- Activate / Deactivate Campus
- Campus-wise Statistics

5. Manage Reports

Route: /admin/reports
- User Reported Posts
- Reported Users
- Spam / Fake Posts
- Resolve / Reject Reports

6. Manage Claims

Route: /admin/claims
- All Claim Requests
- Pending Verification
- Approved Claims
- Rejected Claims
- Disputed Ownership

7. Manage Categories

Route: /admin/categories
- Electronics
- Books & Notes
- Bags & Accessories
- ID Cards
- Clothing
- Other Items
- Add / Edit / Delete Categories

8. Settings

Route: /admin/settings
- Website Information
- Post Approval Settings
- Platform Configuration
- Admin Profile


  */
}
