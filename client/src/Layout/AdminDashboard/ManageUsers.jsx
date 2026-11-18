/* eslint-disable react-hooks/static-components */
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Search,
  Users,
  ShieldCheck,
  GraduationCap,
  UserRound,
  Edit3,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Mail,
  Building2,
  RefreshCw,
  Filter,
  Camera,
  Crown,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  Shield,
} from "lucide-react";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import useAxiosPublic from "../../hooks/useAxiosPublic";
import { useAuth } from "../../providers/AuthProvider";
import colleges from "../../data/colleges";

const ITEMS_PER_PAGE = 8;

const ManageUsers = () => {
  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    collegeId: "",
    role: "user",
    photoUrl: "",
  });

  // ==============================
  // Fetch All Users
  // ==============================

  const {
    data: allUsers = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await axiosPublic.get("/users");
      return data;
    },
  });

  // ==============================
  // Helper Functions
  // ==============================

  const getCollegeName = (collegeId) => {
    const college = colleges.find((item) => item.collegeId === collegeId);

    return college?.collegeName || "Unknown Campus";
  };

  const getInitials = (name = "") => {
    return (
      name
        .trim()
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "U"
    );
  };

  // ==============================
  // Filter Users
  // ==============================

  const filteredUsers = useMemo(() => {
    return allUsers.filter((item) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        item.name?.toLowerCase().includes(search) ||
        item.email?.toLowerCase().includes(search) ||
        item.userId?.toLowerCase().includes(search);

      const matchesCollege =
        collegeFilter === "all" || item.collegeId === collegeFilter;

      const matchesRole = roleFilter === "all" || item.role === roleFilter;

      return matchesSearch && matchesCollege && matchesRole;
    });
  }, [allUsers, searchTerm, collegeFilter, roleFilter]);

  // ==============================
  // Pagination
  // ==============================

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // ==============================
  // Statistics
  // ==============================

  const totalAdmins = allUsers.filter((item) => item.role === "admin").length;

  const totalColleges = new Set(
    allUsers.map((item) => item.collegeId).filter(Boolean),
  ).size;

  const totalRegularUsers = allUsers.filter(
    (item) => item.role !== "admin",
  ).length;

  // ==============================
  // Cache Update Helper
  // ==============================

  const refreshUsers = () => {
    queryClient.invalidateQueries({
      queryKey: ["users"],
    });
  };

  // ==============================
  // Update User Mutation
  // ==============================

  const updateMutation = useMutation({
    mutationFn: async ({ userId, data }) => {
      const response = await axiosPublic.patch(`/users/${userId}`, data);

      return response.data;
    },

    onSuccess: () => {
      refreshUsers();
    },
  });

  // ==============================
  // Delete User Mutation
  // ==============================

  const deleteMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await axiosPublic.delete(`/users/${userId}`);

      return response.data;
    },

    onSuccess: () => {
      refreshUsers();
      toast.success("User deleted successfully!");
    },

    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to delete user.");
    },
  });

  // ==============================
  // Edit Modal
  // ==============================

  const openEditModal = (selectedUser) => {
    setEditingUser(selectedUser);

    setFormData({
      name: selectedUser.name || "",
      collegeId: selectedUser.collegeId || "",
      role: selectedUser.role || "user",
      photoUrl: selectedUser.photoUrl || "",
    });
  };

  const closeEditModal = () => {
    setEditingUser(null);

    setFormData({
      name: "",
      collegeId: "",
      role: "user",
      photoUrl: "",
    });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==============================
  // Save User
  // ==============================

  const handleUpdateUser = async (event) => {
    event.preventDefault();

    if (!editingUser) return;

    if (!formData.name.trim()) {
      toast.error("Please enter user's name.");
      return;
    }

    if (!formData.collegeId) {
      toast.error("Please select a campus.");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        userId: editingUser.userId,
        data: {
          name: formData.name.trim(),
          collegeId: formData.collegeId,
          role:
            editingUser.userId === currentUser?.uid
              ? editingUser.role
              : formData.role,
          photoUrl: formData.photoUrl.trim(),
        },
      });

      toast.success("User updated successfully!");
      closeEditModal();
    } catch (error) {
      console.error("Update error:", error);

      toast.error(error?.response?.data?.message || "Failed to update user.");
    }
  };

  // ==============================
  // Quick Role Change
  // ==============================

  const handleRoleChange = async (selectedUser, newRole) => {
    if (selectedUser.userId === currentUser?.uid) {
      toast.error("You cannot change your own role.");
      return;
    }

    if (selectedUser.role === newRole) return;

    const result = await Swal.fire({
      title: "Change user role?",
      text: `Change ${selectedUser.name}'s role to ${newRole}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirm Change",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#0d9488",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await updateMutation.mutateAsync({
        userId: selectedUser.userId,
        data: { role: newRole },
      });

      toast.success(`Role changed to ${newRole}.`);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Could not change user role.",
      );
    }
  };

  // ==============================
  // Delete User
  // ==============================

  const handleDeleteUser = async (selectedUser) => {
    if (selectedUser.userId === currentUser?.uid) {
      toast.error("You cannot delete your own account.");
      return;
    }

    const result = await Swal.fire({
      title: "Delete User?",
      html: `
        <p style="color:#64748b;font-size:14px">
          Are you sure you want to delete
          <strong>${selectedUser.name || "this user"}</strong>?
          <br/><br/>
          This action cannot be undone.
        </p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#e11d48",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      deleteMutation.mutate(selectedUser.userId);
    }
  };

  // ==============================
  // Reset Filters
  // ==============================

  const resetFilters = () => {
    setSearchTerm("");
    setCollegeFilter("all");
    setRoleFilter("all");
    setCurrentPage(1);
  };

  // ==============================
  // Role Badge
  // ==============================

  const RoleBadge = ({ role }) => (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold ${
        role === "admin"
          ? "bg-amber-50 text-amber-700"
          : "bg-teal-50 text-teal-700"
      }`}
    >
      {role === "admin" ? <Crown size={13} /> : <UserRound size={13} />}

      <span className="capitalize">{role || "user"}</span>
    </span>
  );

  // ==============================
  // Loading
  // ==============================

  if (isLoading) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center gap-4 bg-[#f8fafc]">
        <RefreshCw size={32} className="animate-spin text-teal-600" />

        <p className="text-sm font-semibold text-slate-500">
          Loading campus community...
        </p>
      </div>
    );
  }

  // ==============================
  // Error
  // ==============================

  if (isError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#f8fafc] px-5 text-center">
        <AlertCircle size={42} className="text-rose-500" />

        <h2 className="mt-4 text-xl font-bold text-slate-800">
          Couldn't load users
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Something went wrong while loading users.
        </p>

        <button
          onClick={() => refetch()}
          className="mt-5 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ==============================
  // Main UI
  // ==============================

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-7 text-slate-800 sm:px-6 lg:px-8 lg:py-9">
      <div className="mx-auto max-w-[1450px] space-y-8">
        {/* Header */}

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end animate-[fadeIn_.5s_ease-out]">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
              <ShieldCheck size={16} />
              CampusFind / Administration
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Manage Users
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Manage your campus community, organize members and control account
              permissions.
            </p>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm transition hover:border-teal-300 hover:text-teal-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Statistics */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Members"
            value={allUsers.length}
            description="Registered campus community"
            icon={<Users size={22} />}
            iconStyle="bg-teal-50 text-teal-700"
            accent="border-t-teal-500"
          />

          <StatCard
            title="Administrators"
            value={totalAdmins}
            description="Members with admin access"
            icon={<ShieldCheck size={22} />}
            iconStyle="bg-amber-50 text-amber-600"
            accent="border-t-amber-400"
          />

          <StatCard
            title="Regular Users"
            value={totalRegularUsers}
            description="Standard community members"
            icon={<UserRound size={22} />}
            iconStyle="bg-blue-50 text-blue-600"
            accent="border-t-blue-500"
          />

          <StatCard
            title="Connected Campuses"
            value={totalColleges}
            description="Colleges represented"
            icon={<GraduationCap size={22} />}
            iconStyle="bg-violet-50 text-violet-600"
            accent="border-t-violet-500"
          />
        </div>

        {/* Main Content */}

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_25px_rgba(15,23,42,0.035)]">
          {/* Table Header */}

          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Community Members
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Manage and organize all registered users.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start rounded-lg bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700 sm:self-auto">
              <span className="h-2 w-2 rounded-full bg-teal-500" />
              {allUsers.length} Total Members
            </div>
          </div>

          {/* Filters */}

          <div className="grid grid-cols-1 gap-3 border-b border-slate-100 bg-slate-50/60 p-4 sm:p-5 lg:grid-cols-[1fr_220px_160px_auto]">
            {/* Search */}

            <div className="relative">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search name, email or user ID..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
              />
            </div>

            {/* Campus */}

            <div className="relative">
              <Building2
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={collegeFilter}
                onChange={(e) => {
                  setCollegeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-sm text-slate-600 outline-none transition focus:border-teal-500"
              >
                <option value="all">All Campuses</option>

                {colleges.map((college) => (
                  <option key={college.collegeId} value={college.collegeId}>
                    {college.collegeName}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            {/* Role */}

            <div className="relative">
              <Shield
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-sm text-slate-600 outline-none transition focus:border-teal-500"
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            {/* Reset */}

            <button
              onClick={resetFilters}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
            >
              <X size={15} />
              Reset
            </button>
          </div>

          {/* Results Info */}

          <div className="flex items-center justify-between px-5 py-4 sm:px-6">
            <p className="text-xs font-semibold text-slate-500">
              <Filter size={13} className="mr-1 inline" />
              Showing {filteredUsers.length} matching users
            </p>
          </div>

          {/* Table */}

          {paginatedUsers.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead>
                    <tr className="border-y border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-4">User Information</th>
                      <th className="px-5 py-4">Campus</th>
                      <th className="px-5 py-4">Account Role</th>
                      <th className="px-5 py-4">User ID</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {paginatedUsers.map((item, index) => {
                      const isCurrentUser = item.userId === currentUser?.uid;

                      return (
                        <tr
                          key={item.userId}
                          style={{
                            animationDelay: `${index * 45}ms`,
                          }}
                          className="animate-[fadeIn_.35s_ease-out_both] transition-colors hover:bg-teal-50/40"
                        >
                          {/* User */}

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {item.photoUrl ? (
                                <img
                                  src={item.photoUrl}
                                  alt={item.name || "User"}
                                  className="h-11 w-11 rounded-xl border border-slate-100 object-cover"
                                />
                              ) : (
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 text-sm font-extrabold text-teal-800">
                                  {getInitials(item.name)}
                                </div>
                              )}

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="max-w-[190px] truncate text-sm font-bold text-slate-800">
                                    {item.name || "Unnamed User"}
                                  </p>

                                  {isCurrentUser && (
                                    <span className="rounded-md bg-teal-50 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-teal-700">
                                      You
                                    </span>
                                  )}
                                </div>

                                <p className="mt-1 flex max-w-[220px] items-center gap-1.5 truncate text-xs text-slate-400">
                                  <Mail size={12} />
                                  {item.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Campus */}

                          <td className="px-5 py-4">
                            <div className="flex max-w-[210px] items-center gap-2">
                              <Building2
                                size={15}
                                className="shrink-0 text-teal-600"
                              />

                              <span className="truncate text-xs font-semibold text-slate-600">
                                {getCollegeName(item.collegeId)}
                              </span>
                            </div>
                          </td>

                          {/* Role */}

                          <td className="px-5 py-4">
                            {isCurrentUser ? (
                              <RoleBadge role={item.role} />
                            ) : (
                              <select
                                value={item.role || "user"}
                                onChange={(e) =>
                                  handleRoleChange(item, e.target.value)
                                }
                                disabled={updateMutation.isPending}
                                aria-label={`Change role for ${item.name || item.email}`}
                                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 outline-none transition hover:border-teal-400 focus:border-teal-500 disabled:opacity-50"
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            )}
                          </td>

                          {/* ID */}

                          <td className="px-5 py-4">
                            <span
                              title={item.userId}
                              className="block max-w-[130px] truncate font-mono text-[11px] text-slate-400"
                            >
                              {item.userId}
                            </span>
                          </td>

                          {/* Actions */}

                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openEditModal(item)}
                                title="Edit user"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 transition hover:border-blue-200 hover:bg-blue-100 hover:shadow-md"
                              >
                                <Edit3 size={15} />
                              </button>

                              <button
                                onClick={() => handleDeleteUser(item)}
                                disabled={
                                  isCurrentUser || deleteMutation.isPending
                                }
                                title="Delete user"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-500 transition hover:border-rose-200 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}

              <div className="flex flex-col justify-between gap-4 border-t border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <span className="font-bold text-slate-800">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                    {" - "}
                    {Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      filteredUsers.length,
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-slate-800">
                    {filteredUsers.length}
                  </span>{" "}
                  users
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-400 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronLeft size={17} />
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1,
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-9 min-w-9 rounded-lg px-2 text-xs font-bold transition ${
                        currentPage === page
                          ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                          : "border border-slate-200 text-slate-500 hover:border-teal-400 hover:text-teal-700"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-400 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */

            <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Users size={30} />
              </div>

              <h3 className="mt-5 text-lg font-extrabold text-slate-800">
                No users found
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                No users match your current search or filters. Try adjusting
                your search criteria.
              </p>

              <button
                onClick={resetFilters}
                className="mt-5 rounded-xl bg-teal-50 px-5 py-2.5 text-sm font-bold text-teal-700 transition hover:bg-teal-100"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Bottom Note */}

        <div className="flex items-center gap-4 rounded-2xl border border-teal-100 bg-teal-50/60 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm">
            <ShieldCheck size={22} />
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-slate-800">
              Community Management
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Keep your campus community organized and maintain secure account
              permissions.
            </p>
          </div>
        </div>
      </div>

      {/* =================================
          EDIT USER MODAL
      ================================= */}

      {editingUser && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-900/40 px-4 py-8 backdrop-blur-sm animate-[fadeIn_.2s_ease-out]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEditModal();
            }
          }}
        >
          <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-[modalIn_.25s_ease-out]">
            {/* Modal Header */}

            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <UserRound size={21} />
                </div>

                <h2 className="text-xl font-extrabold text-slate-900">
                  Edit User
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Update user information and permissions.
                </p>
              </div>

              <button
                onClick={closeEditModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
              >
                <X size={19} />
              </button>
            </div>

            {/* Form */}

            <form onSubmit={handleUpdateUser} className="space-y-5 p-6">
              {/* Selected User */}

              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                {editingUser.photoUrl ? (
                  <img
                    src={editingUser.photoUrl}
                    alt={editingUser.name || "User"}
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 font-bold text-teal-800">
                    {getInitials(editingUser.name)}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {editingUser.name}
                  </p>

                  <p className="truncate text-xs text-slate-400">
                    {editingUser.email}
                  </p>
                </div>

                <div className="ml-auto">
                  <RoleBadge role={editingUser.role} />
                </div>
              </div>

              {/* Name */}

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Full Name
                </label>

                <div className="relative">
                  <UserRound
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    placeholder="Enter full name"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  />
                </div>
              </div>

              {/* Email */}

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    value={editingUser.email || ""}
                    readOnly
                    className="h-11 w-full cursor-not-allowed rounded-xl border border-slate-100 bg-slate-50 pl-10 pr-4 text-sm text-slate-400 outline-none"
                  />
                </div>
              </div>

              {/* College */}

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Campus / College
                </label>

                <div className="relative">
                  <Building2
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    name="collegeId"
                    value={formData.collegeId}
                    onChange={handleFormChange}
                    required
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-700 outline-none transition focus:border-teal-500"
                  >
                    <option value="">Select Campus</option>

                    {colleges.map((college) => (
                      <option key={college.collegeId} value={college.collegeId}>
                        {college.collegeName}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              {/* Role */}

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Account Role
                </label>

                <div className="relative">
                  <ShieldCheck
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleFormChange}
                    disabled={editingUser.userId === currentUser?.uid}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-700 outline-none transition focus:border-teal-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                {editingUser.userId === currentUser?.uid && (
                  <p className="mt-1.5 text-[11px] text-amber-600">
                    You cannot change your own role.
                  </p>
                )}
              </div>

              {/* Photo URL */}

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Profile Photo URL
                </label>

                <div className="relative">
                  <Camera
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="url"
                    name="photoUrl"
                    value={formData.photoUrl}
                    onChange={handleFormChange}
                    placeholder="https://example.com/photo.jpg"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  />
                </div>
              </div>

              {/* Buttons */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={updateMutation.isPending}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-600/15 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updateMutation.isPending ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Animations */}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

// =================================
// Statistics Card
// =================================

const StatCard = ({ title, value, description, icon, iconStyle, accent }) => {
  return (
    <div
      className={`group rounded-2xl border border-slate-200/80 border-t-[3px] ${accent} bg-white p-5 shadow-[0_3px_15px_rgba(15,23,42,0.025)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-slate-400">{title}</p>

          <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${iconStyle}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-[11px] font-medium text-slate-400">
        {description}
      </p>
    </div>
  );
};

export default ManageUsers;
