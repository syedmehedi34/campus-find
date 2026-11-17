/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import Sidebar from "./Sidebar";
import TopBar from "./Topbar";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024); // Detect mobile
  const [loading, setLoading] = useState(false); // Mock loading state
  const [isRoleLoading, setIsRoleLoading] = useState(false); // Mock role loading state
  const navigate = useNavigate();

  // Mock user and role data
  const user = { name: "John Doe", email: "john@example.com" };
  const isRole = { role: "admin" };
  let userRole = isRole?.role;

  // Mock useAuth hook
  const useAuth = () => ({
    user,
    loading,
    logOut: () => {
      console.log("Logging out...");
      navigate("/");
    },
  });

  // Mock useRole hook
  const useRole = () => [isRole, isRoleLoading];

  const { user: authUser, loading: authLoading, logOut } = useAuth();
  const [role, roleLoading] = useRole();

  // Handle window resize to detect mobile/large device
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile); // Open on large screens, closed on mobile
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle authentication and role loading
  // eslint-disable-next-line react-hooks/immutability
  useEffect(() => {
    if (authLoading || roleLoading) return;
    if (!authUser) {
      navigate("/");
      return;
    }
    // eslint-disable-next-line react-hooks/immutability, react-hooks/exhaustive-deps
    userRole = role?.role;
  }, [authUser, navigate, authLoading, roleLoading, role]);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Show loading spinner while checking auth
  if (authLoading || roleLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Fixed Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        userRole={userRole}
        isMobile={isMobile}
      />

      {/* Main content */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-16"
        } mt-25`}
      >
        <TopBar
          isSidebarOpen={isSidebarOpen}
          isMobile={isMobile}
          userRole={role}
          user={authUser}
          logOut={logOut}
        />
        <div className="dark:bg-[#0B0716]">
          <Outlet />

          {/* Dashboard overview */}
          {/* {!window.location.pathname.includes("/dashboard/") && (
            <>
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-4">Dashboard Overview</h1>
              </div>
            </>
          )} */}
        </div>
      </div>

      {/* Mobile overlay when sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default Dashboard;
