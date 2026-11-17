/* eslint-disable no-unused-vars */
import { Link, NavLink } from "react-router";
import {
  FaBars,
  FaTachometerAlt,
  FaUser,
  FaBoxOpen,
  FaUsersCog,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar = ({ isSidebarOpen, toggleSidebar, userRole, isMobile }) => {
  // Navigation items for admin role
  const navItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <FaTachometerAlt />,
    },
    {
      path: "/dashboard/my-profile",
      label: "My Profile",
      icon: <FaUser />,
    },
    // {
    //   path: "/dashboard/all-users",
    //   label: "All Users",
    //   icon: <FaUsersCog />,
    // },
    {
      path: "/dashboard/all-assets",
      label: "All Assets",
      icon: <FaBoxOpen />,
    },
  ];

  return (
    <div
      className={`fixed top-0 left-0 h-full z-10 ${
        isSidebarOpen ? "w-64" : "w-16"
      } bg-linear-to-b from-teal-800 to-teal-600 text-white transition-all duration-300 flex flex-col shadow-xl`}
    >
      <div className="flex-1 overflow-y-auto">
        {/* Header with logo and toggle button */}
        <div className="px-4 py-[22.6px] flex items-center justify-between border-b border-teal-500">
          <Link to="/">
            <h1
              className={`${
                isSidebarOpen ? "block" : "hidden"
              } text-xl font-semibold text-white`}
            >
              CampusFind
            </h1>
          </Link>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-teal-500 transition-colors duration-200"
          >
            <FaBars className="text-lg text-white" />
          </button>
        </div>

        {/* Navigation menu */}
        <ul className="mt-4 space-y-1 px-2">
          {navItems.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.path}
                end
                onClick={() => isMobile && toggleSidebar()}
                className={({ isActive }) =>
                  `flex items-center ${
                    isSidebarOpen ? "space-x-3" : "justify-center"
                  } p-2 rounded-md transition-all duration-200 ${
                    isSidebarOpen
                      ? isActive
                        ? "bg-teal-400 text-white font-medium"
                        : "text-teal-100 hover:bg-teal-500 hover:text-white"
                      : isActive
                        ? "bg-teal-400 text-white font-medium"
                        : "text-teal-200 hover:bg-teal-500 hover:text-white"
                  }`
                }
              >
                <span className="text-lg flex justify-center items-center w-6 h-6">
                  {item.icon}
                </span>
                <span
                  className={`${
                    isSidebarOpen ? "block" : "hidden"
                  } text-sm font-medium`}
                >
                  {item.label}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer with logout and copyright */}
      <div className="p-4 border-t border-teal-500">
        <button
          onClick={() => isMobile && toggleSidebar()}
          className={`flex items-center ${
            isSidebarOpen ? "space-x-3" : "justify-center"
          } p-2 rounded-md transition-all duration-200 w-full ${
            isSidebarOpen
              ? "text-teal-100 hover:bg-teal-500 hover:text-white"
              : "text-teal-200 hover:bg-teal-500 hover:text-white"
          }`}
        >
          <span className="text-lg flex justify-center items-center w-6 h-6">
            <FaSignOutAlt />
          </span>
          <span
            className={`${
              isSidebarOpen ? "block" : "hidden"
            } text-sm font-medium`}
          >
            Logout
          </span>
        </button>
        <div
          className={`${
            isSidebarOpen ? "block" : "hidden"
          } mt-2 text-center text-xs text-teal-100`}
        >
          © 2026 CampusFind Solutions
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
