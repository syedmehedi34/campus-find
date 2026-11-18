/* eslint-disable react-hooks/set-state-in-effect */
import { useContext, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";

import {
  Home,
  Info,
  Search,
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

const display = "font-['Bricolage_Grotesque',sans-serif]";

/* ------------------------------------------------------------------ */
/*  Small reusable pieces                                              */
/* ------------------------------------------------------------------ */

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
        className={`${size} rounded-full bg-gray-100 object-cover`}
      />
    );
  }

  return (
    <div
      className={`${size} ${text} flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 font-bold text-white`}
    >
      {initial}
    </div>
  );
};

const DropdownItem = ({ to, icon: Icon, label, hint, onClick }) => (
  <Link
    to={to}
    role="menuitem"
    onClick={onClick}
    className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-indigo-50/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
  >
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-violet-500 group-hover:text-white">
      <Icon size={18} />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-semibold text-slate-900">
        {label}
      </span>
      <span className="block truncate text-xs text-slate-500">{hint}</span>
    </span>
    <ChevronRight
      size={16}
      className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500"
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

  // scroll progress line
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  const isAdmin = loggedInUser?.role === "admin";
  const profileImage = loggedInUser?.photoUrl || user?.photoURL;
  const profileName = loggedInUser?.name || user?.displayName || "User";

  /* ---------- Behaviour ---------- */

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setProfileOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
  const showCta = !!user && !isAdmin;

  // desktop link: sliding white pill behind the active item
  const DesktopLink = ({ name, path, icon: Icon }) => (
    <NavLink
      to={path}
      end={path === "/"}
      className="relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      {({ isActive }) => (
        <span
          className={`relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors ${
            isActive ? "text-indigo-700" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {isActive && (
            <motion.span
              layoutId="nav-pill"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="absolute inset-0 -z-10 rounded-full bg-white shadow-md shadow-indigo-200/60 ring-1 ring-indigo-100"
            />
          )}
          <Icon size={16} />
          {name}
        </span>
      )}
    </NavLink>
  );

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-semibold transition-colors ${
      isActive
        ? "bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700"
        : "text-slate-700 hover:bg-slate-50"
    }`;

  /* ---------- Render ---------- */

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5">
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`relative mx-auto max-w-7xl rounded-3xl border transition-all duration-300 ${
          scrolled
            ? "border-white/70 bg-white/80 shadow-2xl shadow-indigo-200/50 backdrop-blur-xl"
            : "border-slate-200/80 bg-white/95 shadow-lg shadow-slate-200/60"
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-4 px-3 sm:px-4">
          {/* ---------------- Logo ---------------- */}
          <Link
            to="/"
            className="group flex shrink-0 items-center gap-3 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <motion.span
              whileHover={{ rotate: -8, scale: 1.08 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 text-white shadow-lg shadow-indigo-300/60"
            >
              <Search size={21} strokeWidth={2.6} />
              <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
              </span>
            </motion.span>

            <span className="leading-none">
              <span
                className={`${display} block text-[22px] font-extrabold tracking-tight text-slate-900`}
              >
                Campus
                <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-500 bg-clip-text text-transparent">
                  Find
                </span>
              </span>
              <span className="mt-1 hidden text-[11px] font-medium text-slate-500 sm:block">
                Campus Lost &amp; Found
              </span>
            </span>
          </Link>

          {/* ---------------- Desktop links ---------------- */}
          <nav
            className="hidden items-center gap-1 rounded-full bg-slate-100/80 p-1 lg:flex"
            aria-label="Main navigation"
          >
            {links.map((l) => (
              <DesktopLink key={l.path} {...l} />
            ))}
          </nav>

          {/* ---------------- Right side ---------------- */}
          <div className="flex items-center gap-2 sm:gap-3">
            {loading && (
              <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
            )}

            {/* Guest actions */}
            {!loading && !user && (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  Login
                </Link>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link
                    to="/register"
                    className="inline-flex rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-300/60 transition hover:from-indigo-700 hover:to-violet-700"
                  >
                    Register
                  </Link>
                </motion.div>
              </div>
            )}

            {/* Student CTA */}
            {!loading && showCta && (
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="hidden md:block"
              >
                <Link
                  to="/create-post"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-300/60"
                >
                  <Plus size={17} strokeWidth={2.8} />
                  New Post
                </Link>
              </motion.div>
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
                  className={`flex items-center gap-2 rounded-full border bg-white p-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 md:pr-3 ${
                    profileOpen
                      ? "border-indigo-500 ring-4 ring-indigo-100"
                      : "border-slate-200 hover:border-indigo-400"
                  }`}
                >
                  <Avatar
                    src={profileImage}
                    name={profileName}
                    size="w-10 h-10"
                  />
                  <span className="hidden max-w-[7.5rem] truncate text-sm font-semibold text-slate-800 md:block">
                    {profileName}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`hidden text-slate-500 transition-transform duration-200 md:block ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      role="menu"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="fixed left-4 right-4 top-[5.5rem] origin-top-right overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-indigo-900/15 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-4 sm:w-80"
                    >
                      {/* User info */}
                      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-5">
                        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/15" />
                        <div className="relative flex items-center gap-3">
                          <div className="rounded-full border-2 border-white/80">
                            <Avatar
                              src={profileImage}
                              name={profileName}
                              size="w-14 h-14"
                              text="text-xl"
                            />
                          </div>
                          <div className="min-w-0">
                            <p
                              className={`${display} truncate text-lg font-extrabold text-white`}
                            >
                              {profileName}
                            </p>
                            <p className="truncate text-sm text-indigo-100">
                              {user.email}
                            </p>

                            {loggedInUserLoading ? (
                              <span className="mt-1.5 block h-5 w-20 animate-pulse rounded-full bg-white/30" />
                            ) : (
                              <span
                                className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                  isAdmin
                                    ? "bg-amber-300 text-amber-900"
                                    : "bg-white text-indigo-700"
                                }`}
                              >
                                {isAdmin && <ShieldCheck size={12} />}
                                {isAdmin ? "Administrator" : "Student"}
                              </span>
                            )}
                          </div>
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
                      <div className="border-t border-slate-100 p-2">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={handleLogout}
                          disabled={loggingOut}
                          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-60"
                        >
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                            <LogOut size={18} />
                          </span>
                          <span className="text-sm font-semibold">
                            {loggingOut ? "Logging out..." : "Logout"}
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 lg:hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileMenuOpen ? "x" : "menu"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex"
                >
                  {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* ---------------- Mobile menu ---------------- */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden lg:hidden"
            >
              <nav
                aria-label="Mobile navigation"
                className="flex flex-col gap-1 border-t border-slate-100 px-3 pb-4 pt-3"
              >
                {links.map(({ name, path, icon: Icon }, i) => (
                  <motion.div
                    key={path}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.06 }}
                  >
                    <NavLink
                      to={path}
                      end={path === "/"}
                      className={mobileLinkClass}
                    >
                      <Icon size={19} />
                      {name}
                    </NavLink>
                  </motion.div>
                ))}

                {showCta && (
                  <Link
                    to="/create-post"
                    className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-300/60 active:scale-[0.99]"
                  >
                    <Plus size={18} strokeWidth={2.8} />
                    New Post
                  </Link>
                )}

                {!user && !loading && (
                  <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                    <Link
                      to="/login"
                      className="rounded-2xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-center text-sm font-bold text-white shadow-lg shadow-indigo-300/60"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* scroll progress line */}
        <motion.div
          style={{ scaleX: progress }}
          className="absolute inset-x-6 bottom-0 h-[3px] origin-left rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
        />
      </motion.div>
    </header>
  );
};

export default Navbar;
