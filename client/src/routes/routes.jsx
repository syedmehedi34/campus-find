/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { useContext } from "react";

import { AuthContext } from "../providers/AuthProvider";
import useUserData from "../hooks/useUserData";

import MainLayout from "../Layout/MainLayout";
import UserDashboard from "../Layout/UserDashboard/Dashboard";

import Home from "../pages/Home/Home";
import Login from "../pages/Auth/Login";
import Registration from "../pages/Auth/Registration";

// Future Pages
import About from "../pages/About/About";
import NewPost from "../pages/NewPost/NewPost";
import AllPosts from "../pages/AllPosts/AllPosts";
import UserProfile from "../Layout/UserDashboard/UserProfile";

// import PostLostItem from "../pages/Items/PostLostItem";
// import PostFoundItem from "../pages/Items/PostFoundItem";
// import MyPosts from "../pages/Items/MyPosts";
// import Profile from "../pages/Profile/Profile";

// Admin Pages
// import AdminDashboard from "../pages/Admin/AdminDashboard";
// import ManagePosts from "../pages/Admin/ManagePosts";
// import ManageUsers from "../pages/Admin/ManageUsers";
// import ManageReports from "../pages/Admin/ManageReports";
// import ManageCampuses from "../pages/Admin/ManageCampuses";

// ===================================
// Protected Route - Logged In Users
// ===================================

const ProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <progress className="progress w-56"></progress>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// ===================================
// User Route - Only user
// ===================================

const UserRoute = () => {
  const { user, loading } = useContext(AuthContext);
  const { loggedInUser, loggedInUserLoading } = useUserData();

  if (loading || (user && loggedInUserLoading)) {
    return <progress className="progress w-56"></progress>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (loggedInUser?.role !== "user") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// ===================================
// Admin Route - Only admin
// ===================================

const AdminRoute = () => {
  const { user, loading } = useContext(AuthContext);
  const { loggedInUser, loggedInUserLoading } = useUserData();

  if (loading || (user && loggedInUserLoading)) {
    return <progress className="progress w-56"></progress>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (loggedInUser?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// ===================================
// All Routes
// ===================================

export const router = createBrowserRouter([
  // Public Routes
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },

      {
        path: "login",
        element: <Login />,
      },

      {
        path: "register",
        element: <Registration />,
      },

      // About Us
      {
        path: "about",
        element: <About />,
      },

      // All Posts
      {
        path: "posts",
        element: <AllPosts />,
      },

      // Create New Post
      {
        path: "create-post",
        element: <NewPost />,
      },
    ],
  },

  // Protected Routes - Any Logged In User
  {
    element: <ProtectedRoute />,
    children: [
      // for both user and admin common routes can be added here
    ],
  },

  // User Routes - Only user role
  {
    element: <UserRoute />,
    children: [
      {
        path: "/user-dashboard",
        element: <UserDashboard />,
        children: [
          {
            path: "/user-dashboard/my-profile",
            element: <UserProfile />,
          },
          {
            path: "/user-dashboard/all-posts",
            element: <AllPosts />,
          },
          {
            path: "/user-dashboard/create-new-post",
            element: <NewPost />,
          },
        ],
      },

      // User Profile
      // {
      //   path: "/user-dashboard/my-profile",
      //   element: <Profile />,
      // },

      // My Posts
      // {
      //   path: "/user-dashboard/my-posts",
      //   element: <MyPosts />,
      // },

      // Post Lost Item
      // {
      //   path: "/user-dashboard/post-lost-item",
      //   element: <PostLostItem />,
      // },

      // Post Found Item
      // {
      //   path: "/user-dashboard/post-found-item",
      //   element: <PostFoundItem />,
      // },
    ],
  },

  // Admin Routes - Only admin role
  {
    element: <AdminRoute />,
    children: [
      // Admin Dashboard
      // {
      //   path: "/admin/dashboard",
      //   element: <AdminDashboard />,
      // },
      // Manage All Posts
      // {
      //   path: "/admin/posts",
      //   element: <ManagePosts />,
      // },
      // Manage Users
      // {
      //   path: "/admin/users",
      //   element: <ManageUsers />,
      // },
      // Manage Reports
      // {
      //   path: "/admin/reports",
      //   element: <ManageReports />,
      // },
      // Manage Campuses
      // {
      //   path: "/admin/campuses",
      //   element: <ManageCampuses />,
      // },
    ],
  },
]);
