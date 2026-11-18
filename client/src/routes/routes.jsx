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
import MyPosts from "../Layout/UserDashboard/MyPosts";
import Notifications from "../Layout/UserDashboard/Notifications";
import Overview from "../Layout/UserDashboard/Overview";
import AdminDashboard from "../Layout/AdminDashboard/Dashboard";
import Loader from "../components/Loader";
import ManageUsers from "../Layout/AdminDashboard/ManageUsers";
import AllPostsManage from "../Layout/AdminDashboard/AllPostsManage";
import ManageCampus from "../Layout/AdminDashboard/ManageCampus";
import AdminOverview from "../Layout/AdminDashboard/AdminOverview";

// ===================================
// Protected Route - Logged In Users
// ===================================

const ProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <Loader />;
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
          { path: "/user-dashboard", element: <Overview /> },
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
          {
            path: "/user-dashboard/my-posts",
            element: <MyPosts />,
          },
          {
            path: "/user-dashboard/notifications",
            element: <Notifications />,
          },
        ],
      },
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
      {
        path: "/admin-dashboard",
        element: <AdminDashboard />,
        children: [
          { path: "/admin-dashboard", element: <AdminOverview /> },
          {
            path: "/admin-dashboard/my-profile",
            element: <UserProfile />,
          },
          {
            path: "/admin-dashboard/manage-users",
            element: <ManageUsers />,
          },
          {
            path: "/admin-dashboard/all-posts",
            element: <AllPostsManage />,
          },
          {
            path: "/admin-dashboard/manage-campuses",
            element: <ManageCampus />,
          },
          {
            path: "/admin-dashboard/create-new-post",
            element: <NewPost />,
          },
          {
            path: "/admin-dashboard/my-posts",
            element: <MyPosts />,
          },
        ],
      },
      // {
      //   path: "/admin-dashboard/my-profile",
      //   element: <UserProfile />,
      // },
    ],
  },
]);
