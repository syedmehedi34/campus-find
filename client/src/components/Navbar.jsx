/* eslint-disable react-hooks/set-state-in-effect */
import { useContext, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";

import {
  Home,
  Info,
  Search,
  UserRound,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  ShieldCheck,
  FileText,
  Newspaper,
  ClipboardList,
  Plus,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import { AuthContext } from "../providers/AuthProvider";
import useUserData from "../hooks/useUserData";

/* ------------------------------------------------------------------ */
/*  Small reusable pieces                                              */
/* ------------------------------------------------------------------ */

// Avatar with graceful fallback (broken image -> first letter)
const Avatar = ({ src, name, size = "w-9 h-9", text = "text-sm" }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "U";

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${size} rounded-full object-cover bg-gray-100`}
      />
    );
  }

  return (
    <div
      className={`${size} ${text} rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold flex items-center justify-center`}
    >
      {initial}
    </div>
  );
};

// One row inside the profile dropdown
const DropdownItem = ({ to, icon: Icon, label, hint, onClick }) => (
  <Link
    to={to}
    role="menuitem"
    onClick={onClick}
    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
  >
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600">
      <Icon size={18} />
    </span>

    <span className="min-w-0 flex-1">
      <span className="block text-sm font-medium text-gray-900">{label}</span>
      <span className="block truncate text-xs text-gray-500">{hint}</span>
    </span>

    <ChevronRight
      size={16}
      className="text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500"
    />
  </Link>
);

/* ------------------------------------------------------------------ */
/*  Navbar                                                             */
/* ------------------------------------------------------------------ */

const Navbar = () => {
  const { user, loading, logOut } = useContext(AuthContext);
  const { loggedInUser, loggedInUserLoading } = useUserData();

  const navigate = useNavigate();
  const location = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const profileRef = useRef(null);

  const isAdmin = loggedInUser?.role === "admin";
  const profileImage = loggedInUser?.photoUrl || user?.photoURL;
  const profileName = loggedInUser?.name || user?.displayName || "User";

  /* ---------- Behaviour ---------- */

  // Shadow + blur once the page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close everything when the route changes
  useEffect(() => {
    setProfileOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close dropdown on outside click / Escape
  useEffect(() => {
    if (!profileOpen) return;

    const onPointerDown = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setProfileOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [profileOpen]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logOut();
      setProfileOpen(false);
      setMobileMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  /* ---------- Links ---------- */

  const guestLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "About Us", path: "/about", icon: Info },
  ];

  const studentLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "About Us", path: "/about", icon: Info },
    { name: "All Posts", path: "/posts", icon: Newspaper },
  ];

  const adminLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Dashboard", path: "/admin-dashboard", icon: LayoutDashboard },
    { name: "All Posts", path: "/posts", icon: ClipboardList },
  ];

  const links = isAdmin ? adminLinks : user ? studentLinks : guestLinks;

  // Students get a primary "New Post" button
  const showCta = !!user && !isAdmin;

  const desktopLinkClass = ({ isActive }) =>
    `relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
      isActive
        ? "bg-blue-50 text-blue-700"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3.5 py-3 text-[15px] font-medium transition-colors ${
      isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
    }`;

  const renderLinks = (variant) =>
    links.map(({ name, path, icon: Icon }) => (
      <NavLink
        key={path}
        to={path}
        end={path === "/"}
        className={variant === "mobile" ? mobileLinkClass : desktopLinkClass}
      >
        <Icon size={variant === "mobile" ? 19 : 17} />
        {name}
      </NavLink>
    ));

  /* ---------- Render ---------- */

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-gray-200/70 bg-white/85 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.18)] backdrop-blur-xl"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* ---------------- Logo ---------------- */}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2.5 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-600/25">
              <Search size={22} strokeWidth={2.5} />
            </span>

            <span className="leading-none">
              <span className="block text-xl font-extrabold tracking-tight text-gray-900">
                Campus<span className="text-blue-600">Find</span>
              </span>
              <span className="mt-1 hidden text-[11px] font-medium text-gray-500 sm:block">
                Campus Lost &amp; Found
              </span>
            </span>
          </Link>

          {/* ---------------- Desktop links ---------------- */}
          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Main navigation"
          >
            {renderLinks("desktop")}
          </nav>

          {/* ---------------- Right side ---------------- */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Loading skeleton */}
            {loading && (
              <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
            )}

            {/* Guest actions */}
            {!loading && !user && (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 active:scale-[0.98]"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Student CTA */}
            {!loading && showCta && (
              <Link
                to="/create-post"
                className="hidden items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 active:scale-[0.98] md:inline-flex"
              >
                <Plus size={17} strokeWidth={2.5} />
                New Post
              </Link>
            )}

            {/* Profile button + dropdown */}
            {!loading && user && (
              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen((v) => !v);
                    setMobileMenuOpen(false);
                  }}
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                  title="Account"
                  className={`flex items-center gap-2 rounded-full border bg-white p-1 pr-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:pr-3 ${
                    profileOpen
                      ? "border-blue-500 ring-4 ring-blue-100"
                      : "border-gray-200 hover:border-blue-400"
                  }`}
                >
                  <Avatar src={profileImage} name={profileName} />

                  <span className="hidden max-w-[7.5rem] truncate text-sm font-semibold text-gray-800 md:block">
                    {profileName}
                  </span>

                  <ChevronDown
                    size={16}
                    className={`hidden text-gray-500 transition-transform duration-200 md:block ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown (anchored under the avatar) */}
                <div
                  role="menu"
                  aria-hidden={!profileOpen}
                  className={`fixed left-4 right-4 top-[4.5rem] origin-top-right overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-slate-900/15 transition duration-200 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-80 ${
                    profileOpen
                      ? "visible translate-y-0 scale-100 opacity-100"
                      : "invisible -translate-y-2 scale-95 opacity-0"
                  }`}
                >
                  {/* User info */}
                  <div className="flex items-center gap-3 border-b border-gray-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
                    <Avatar
                      src={profileImage}
                      name={profileName}
                      size="w-14 h-14"
                      text="text-xl"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-gray-900">
                        {profileName}
                      </p>
                      <p className="truncate text-sm text-gray-500">
                        {user.email}
                      </p>

                      {loggedInUserLoading ? (
                        <span className="mt-1.5 block h-5 w-20 animate-pulse rounded-full bg-gray-200" />
                      ) : (
                        <span
                          className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isAdmin
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {isAdmin && <ShieldCheck size={12} />}
                          {isAdmin ? "Administrator" : "Student"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Menu */}
                  <div className="p-2">
                    {isAdmin ? (
                      <DropdownItem
                        to="/admin-dashboard"
                        icon={ShieldCheck}
                        label="Admin Dashboard"
                        hint="Manage users and items"
                        onClick={() => setProfileOpen(false)}
                      />
                    ) : (
                      <>
                        <DropdownItem
                          to="/user-dashboard/my-posts"
                          icon={FileText}
                          label="My Posts"
                          hint="Items you have reported"
                          onClick={() => setProfileOpen(false)}
                        />
                        <DropdownItem
                          to="/user-dashboard"
                          icon={LayoutDashboard}
                          label="Dashboard"
                          hint="Your activity overview"
                          onClick={() => setProfileOpen(false)}
                        />
                      </>
                    )}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 p-2">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-60"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
                        <LogOut size={18} />
                      </span>
                      <span className="text-sm font-semibold">
                        {loggingOut ? "Logging out..." : "Logout"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen((v) => !v);
                setProfileOpen(false);
              }}
              aria-label="Toggle navigation"
              aria-expanded={mobileMenuOpen}
              className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- Mobile menu (smooth expand) ---------------- */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out lg:hidden ${
          mobileMenuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <nav
            aria-label="Mobile navigation"
            className="flex flex-col gap-1 border-t border-gray-100 px-4 pb-5 pt-3"
          >
            {renderLinks("mobile")}

            {showCta && (
              <Link
                to="/create-post"
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 active:scale-[0.99]"
              >
                <Plus size={18} strokeWidth={2.5} />
                New Post
              </Link>
            )}

            {!user && !loading && (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-gray-100 pt-4">
                <Link
                  to="/login"
                  className="rounded-xl border border-gray-200 py-2.5 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="rounded-xl bg-blue-600 py-2.5 text-center text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
