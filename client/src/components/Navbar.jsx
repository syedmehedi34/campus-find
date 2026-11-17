import { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";

import {
  Home,
  Info,
  Search,
  Plus,
  UserRound,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  ShieldCheck,
  FileText,
  Users,
  Flag,
  Building2,
} from "lucide-react";

import { AuthContext } from "../providers/AuthProvider";
import useUserData from "../hooks/useUserData";

const Navbar = () => {
  const { user, loading, logOut } = useContext(AuthContext);

  const { loggedInUser, loggedInUserLoading } = useUserData();

  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = loggedInUser?.role === "hr_manager";

  const profileImage = loggedInUser?.photoUrl || user?.photoURL;

  const profileName = loggedInUser?.name || user?.displayName || "User";

  // Navigation link style
  const navClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? "bg-blue-50 text-blue-600"
        : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
    }`;

  // Navigation items
  const guestLinks = [
    {
      name: "Home",
      path: "/",
      icon: Home,
    },
    {
      name: "About Us",
      path: "/about",
      icon: Info,
    },
  ];

  const studentLinks = [
    {
      name: "Home",
      path: "/",
      icon: Home,
    },
    {
      name: "About Us",
      path: "/about",
      icon: Info,
    },
    {
      name: "All Posts",
      path: "/posts",
      icon: Info,
    },
    {
      name: "New Post",
      path: "/create-post",
      icon: Search,
    },
  ];

  const adminLinks = [
    {
      name: "Home",
      path: "/",
      icon: Home,
    },
    {
      name: "All Items",
      path: "/lost-items",
      icon: Search,
    },
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Manage Posts",
      path: "/admin/posts",
      icon: FileText,
    },
    {
      name: "Manage Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      name: "Reports",
      path: "/admin/reports",
      icon: Flag,
    },
    {
      name: "Campuses",
      path: "/admin/campuses",
      icon: Building2,
    },
  ];

  const links = isAdmin ? adminLinks : user ? studentLinks : guestLinks;

  // Logout
  const handleLogout = async () => {
    try {
      await logOut();

      setProfileOpen(false);
      setMobileMenuOpen(false);

      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Navigation links
  const renderLinks = () =>
    links.map((item) => {
      const Icon = item.icon;

      return (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === "/"}
          className={navClass}
          onClick={() => setMobileMenuOpen(false)}
        >
          <Icon size={17} />
          {item.name}
        </NavLink>
      );
    });

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Search size={23} />
              </div>

              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  Campus<span className="text-blue-600">Find</span>
                </h1>

                <p className="text-[10px] text-gray-500 -mt-1">
                  Campus Lost & Found
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {renderLinks()}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Guest Login/Register */}
              {!loading && !user && (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Logged In Profile */}
              {user && !loading && (
                <button
                  onClick={() => setProfileOpen(true)}
                  className="flex items-center gap-2 p-1 rounded-full border border-gray-200 hover:border-blue-500 transition"
                  title="Profile Menu"
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <UserRound size={21} />
                    </div>
                  )}
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white px-4 py-4">
            <nav className="flex flex-col gap-2">
              {renderLinks()}

              {!user && !loading && (
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 rounded-lg border border-gray-200 font-medium text-sm"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 rounded-lg bg-blue-600 text-white font-medium text-sm"
                  >
                    Register
                  </Link>
                </div>
              )}

              {user && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setProfileOpen(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  <UserRound size={17} />
                  My Account
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Profile Modal */}
      {profileOpen && user && (
        <div
          className="fixed inset-0 z-100 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setProfileOpen(false)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-blue-600 px-5 py-6 text-white relative">
              <button
                onClick={() => setProfileOpen(false)}
                className="absolute right-4 top-4 p-1 rounded-full hover:bg-white/20"
              >
                <X size={21} />
              </button>

              <div className="flex items-center gap-3">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-14 h-14 rounded-full border-2 border-white object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-white text-blue-600 flex items-center justify-center">
                    <UserRound size={30} />
                  </div>
                )}

                <div className="min-w-0">
                  <h3 className="font-bold text-lg truncate">{profileName}</h3>

                  <p className="text-sm text-blue-100 truncate">{user.email}</p>

                  {loggedInUserLoading ? (
                    <p className="text-xs text-blue-100 mt-1">
                      Loading account...
                    </p>
                  ) : (
                    <span className="inline-block mt-1 text-xs bg-white/20 px-2 py-1 rounded-full">
                      {isAdmin ? "Administrator" : "Student"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Menu */}
            <div className="p-3">
              <Link
                to="/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                <UserRound size={19} />
                <span className="text-sm font-medium">My Profile</span>
              </Link>

              {!isAdmin && (
                <Link
                  to="/my-posts"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700"
                >
                  <FileText size={19} />
                  <span className="text-sm font-medium">My Posts</span>
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700"
                >
                  <ShieldCheck size={19} />
                  <span className="text-sm font-medium">Admin Dashboard</span>
                </Link>
              )}

              {!isAdmin && (
                <Link
                  to="/user-dashboard"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700"
                >
                  <LayoutDashboard size={19} />
                  <span className="text-sm font-medium">Dashboard</span>
                </Link>
              )}

              <div className="border-t border-gray-100 my-2" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-red-600 transition"
              >
                <LogOut size={19} />

                <span className="text-sm font-semibold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
