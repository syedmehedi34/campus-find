// client/src/Layout/AdminDashboard/Dashboard.jsx
import { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate } from "react-router";
import Sidebar from "./Sidebar";
import TopBar from "./Topbar";
import { useAuth } from "../../providers/AuthProvider";

const DESKTOP_QUERY = "(min-width: 1024px)";

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia(DESKTOP_QUERY).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY);
    const onChange = (e) => setIsDesktop(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const isMobile = !isDesktop;

  const { user, loading: authLoading, logOut } = useAuth();
  // const [roleData, roleLoading] = useRole();
  const userRole = "admin";

  // Desktop: open by default. Mobile: closed by default.
  const [isSidebarOpen, setIsSidebarOpen] = useState(isDesktop);

  // Reset sidebar only when the breakpoint changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSidebarOpen(isDesktop);
  }, [isDesktop]);

  // Auth guard
  useEffect(() => {
    if (authLoading) return;
    if (!user) navigate("/");
  }, [user, authLoading, navigate]);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isMobile && isSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, isSidebarOpen]);

  // Close drawer with Escape (mobile)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isMobile) setIsSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobile]);

  const toggleSidebar = useCallback(() => setIsSidebarOpen((p) => !p), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  const handleLogout = useCallback(async () => {
    try {
      await logOut();

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [logOut, navigate]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-500/30 border-t-teal-500" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-800">
      {/* Decorative blurred background blobs */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -left-24 -top-24 h-96 w-96 animate-pulse rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-112 w-md animate-pulse rounded-full bg-emerald-500/15 blur-3xl [animation-delay:1.5s]" />
        <div className="absolute left-1/2 top-1/3 h-72 w-72 animate-pulse rounded-full bg-cyan-500/10 blur-3xl [animation-delay:3s]" />
      </div>

      <Sidebar
        isSidebarOpen={isSidebarOpen}
        isMobile={isMobile}
        toggleSidebar={toggleSidebar}
        closeSidebar={closeSidebar}
        userRole={userRole}
        user={user}
        onLogout={handleLogout}
      />

      {/* Mobile overlay (z-30 sits BELOW sidebar z-40) */}
      <div
        onClick={closeSidebar}
        aria-hidden
        className={`fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isMobile && isSidebarOpen
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Main column: no margin on mobile, margin only on desktop */}
      <div
        className={`relative flex min-h-screen flex-col transition-[margin] duration-300 ease-in-out ${
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        <TopBar
          isMobile={isMobile}
          toggleSidebar={toggleSidebar}
          user={user}
          userRole={userRole}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
