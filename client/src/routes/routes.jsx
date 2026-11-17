/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { useContext } from "react";

import { AuthContext } from "../providers/AuthProvider";
import useUserData from "../hooks/useUserData";

import MainLayout from "../Layout/MainLayout";
import Dashboard from "../Layout/Dashboard/Dashboard";

import Home from "../pages/Home/Home";
import Login from "../pages/Auth/Login";
import Registration from "../pages/Auth/Registration";

// Future Pages
import About from "../pages/About/About";
import NewPost from "../pages/NewPost/NewPost";
import AllPosts from "../pages/AllPosts/AllPosts";

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
// Protected Route
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
// Admin Route
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

  if (loggedInUser?.role !== "hr_manager") {
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

      // all posts
      {
        path: "posts",
        element: <AllPosts />,
      },

      // create new post
      {
        path: "create-post",
        element: <NewPost />,
      },
    ],
  },

  // Protected Routes - Logged In Users
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },

      // User Profile
      // {
      //   path: "/profile",
      //   element: <Profile />,
      // },

      // My Posts
      // {
      //   path: "/my-posts",
      //   element: <MyPosts />,
      // },

      // Post Lost Item
      // {
      //   path: "/post-lost-item",
      //   element: <PostLostItem />,
      // },

      // Post Found Item
      // {
      //   path: "/post-found-item",
      //   element: <PostFoundItem />,
      // },
    ],
  },

  // Admin Routes - Only hr_manager
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
