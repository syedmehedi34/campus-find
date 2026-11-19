import { useEffect, useMemo, useState } from "react";
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
  Camera,
  Crown,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Shield,
} from "lucide-react";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import useAxiosPublic from "../../hooks/useAxiosPublic";
import { useAuth } from "../../providers/AuthProvider";
import colleges from "../../data/colleges";

const ITEMS_PER_PAGE = 8;

// =====================================
//              HELPERS
// =====================================

const getInitials = (name = "") =>
  name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

const timeAgo = (date) => {
  if (!date) return "";
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
};

const useCountUp = (target = 0, duration = 1100) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf;
    let start;
    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
};

// =====================================
//              SMALL PIECES
// =====================================

const RoleBadge = ({ role }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ring-inset ${
      role === "admin"
        ? "bg-amber-50 text-amber-700 ring-amber-600/20"
        : "bg-emerald-50 text-emerald-700 ring-emerald-600/15"
    }`}
  >
    {role === "admin" ? <Crown size={12} /> : <UserRound size={12} />}
    {role || "user"}
  </span>
);

const Avatar = ({ user, size = 44 }) =>
  user?.photoUrl ? (
    <img
      src={user.photoUrl}
      alt={user.name || "User"}
      style={{ width: size, height: size }}
      className="shrink-0 rounded-full object-cover"
    />
  ) : (
    <div
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-full bg-[#e3f4ec] text-sm font-bold text-[#0d7a55]"
    >
      {getInitials(user?.name)}
    </div>
  );

const Stat = ({ icon: Icon, label, value, note }) => {
  const n = useCountUp(value);
  return (
    <div className="flex-1 px-6 py-5">
      <div className="flex items-center gap-2 text-[13px] font-medium text-[#6d837d]">
        <Icon size={14} className="text-[#0d9467]" />
        {label}
      </div>
      <p className="cf-display mt-2 text-[34px] font-bold leading-none text-[#10312c]">
        {n}
      </p>
      <p className="mt-2 text-xs text-[#8ea19c]">{note}</p>
    </div>
  );
};

const SelectBox = ({ icon: Icon, value, onChange, children, label }) => (
  <div className="relative">
    <Icon
      size={15}
      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#93a7a2]"
    />
    <select
      value={value}
      onChange={onChange}
      aria-label={label}
      className="h-11 w-full appearance-none rounded-full border border-[#dbe7e3] bg-white pl-10 pr-9 text-sm text-[#3c5a53] outline-none transition focus:border-[#0d9467] focus:ring-4 focus:ring-[#0d9467]/10"
    >
      {children}
    </select>
    <ChevronDown
      size={15}
      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#93a7a2]"
    />
  </div>
);

const ModalField = ({ label, icon: Icon, children }) => (
  <div>
    <label className="mb-2 block text-[13px] font-medium text-[#3c5a53]">
      {label}
    </label>
    <div className="relative">
      <Icon
        size={15}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#93a7a2]"
      />
      {children}
    </div>
  </div>
);

const inputCls =
  "h-11 w-full rounded-xl border border-[#dbe7e3] bg-[#f8fbfa] pl-11 pr-4 text-sm text-[#10312c] outline-none transition placeholder:text-[#a4b4b0] focus:border-[#0d9467] focus:bg-white focus:ring-4 focus:ring-[#0d9467]/10";

// =====================================
//              MAIN PAGE
// =====================================

const ManageUsers = () => {
  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    collegeId: "",
    role: "user",
    photoUrl: "",
  });

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  // ---------- Fetch ----------
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

  const getCollegeName = (collegeId) =>
    colleges.find((item) => item.collegeId === collegeId)?.collegeName ||
    "Unknown campus";

  // ---------- Filter + paginate ----------
  const filteredUsers = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    return allUsers.filter((item) => {
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

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // ---------- Statistics ----------
  const totalAdmins = allUsers.filter((u) => u.role === "admin").length;
  const totalRegularUsers = allUsers.length - totalAdmins;
  const totalColleges = new Set(
    allUsers.map((u) => u.collegeId).filter(Boolean),
  ).size;

  // eslint-disable-next-line react-hooks/purity
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newUsers7d = allUsers.filter(
    (u) => u.createdAt && new Date(u.createdAt).getTime() >= weekAgo,
  ).length;

  const campusRows = useMemo(() => {
    const map = {};
    allUsers.forEach((u) => {
      if (u.collegeId) map[u.collegeId] = (map[u.collegeId] || 0) + 1;
    });
    return Object.entries(map)
      .map(([id, count]) => ({
        id,
        count,
        name: colleges.find((c) => c.collegeId === id)?.collegeName || id,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [allUsers]);
  const maxCampus = Math.max(1, ...campusRows.map((c) => c.count));

  const totalCount = useCountUp(allUsers.length);

  // Donut (admins vs users)
  const R = 62;
  const C = 2 * Math.PI * R;
  const segments = [
    { label: "Users", value: totalRegularUsers, color: "#3ddc97" },
    { label: "Admins", value: totalAdmins, color: "#f5a524" },
  ];
  let cum = 0;

  // ---------- Mutations ----------
  const refreshUsers = () =>
    queryClient.invalidateQueries({ queryKey: ["users"] });

  const updateMutation = useMutation({
    mutationFn: async ({ userId, data }) => {
      const response = await axiosPublic.patch(`/users/${userId}`, data);
      return response.data;
    },
    onSuccess: refreshUsers,
  });

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

  // ---------- Edit modal ----------
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
    setFormData({ name: "", collegeId: "", role: "user", photoUrl: "" });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
      confirmButtonText: "Confirm change",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#0d9467",
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

  const handleDeleteUser = async (selectedUser) => {
    if (selectedUser.userId === currentUser?.uid) {
      toast.error("You cannot delete your own account.");
      return;
    }

    const result = await Swal.fire({
      title: "Delete user?",
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
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#e11d48",
      reverseButtons: true,
    });

    if (result.isConfirmed) deleteMutation.mutate(selectedUser.userId);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCollegeFilter("all");
    setRoleFilter("all");
    setCurrentPage(1);
  };

  // ---------- Loading / error ----------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f3f7f5] px-4 py-7 md:px-6">
        <style>{styles}</style>
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="cf-shimmer h-12 w-72 rounded-xl" />
          <div className="cf-shimmer h-72 rounded-[28px]" />
          <div className="cf-shimmer h-24 rounded-[22px]" />
          <div className="cf-shimmer h-96 rounded-[22px]" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#f3f7f5] px-5 text-center">
        <AlertCircle size={40} className="text-rose-500" />
        <h2 className="mt-4 text-xl font-bold text-[#10312c]">
          Couldn&apos;t load users
        </h2>
        <p className="mt-2 text-sm text-[#7a8f8a]">
          Check your connection and try again.
        </p>
        <button
          onClick={() => refetch()}
          className="mt-5 rounded-full bg-[#0d9467] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b7f58]"
        >
          Try again
        </button>
      </div>
    );
  }

  const isSelf = editingUser?.userId === currentUser?.uid;

  return (
    <div className="cf-root min-h-screen bg-[#f3f7f5] px-4 py-7 md:px-6">
      <style>{styles}</style>

      <div className="mx-auto max-w-7xl">
        {/* ================= Top bar ================= */}
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="cf-display text-3xl font-bold text-[#10312c] md:text-[40px] md:leading-[1.1]">
              Manage users
            </h1>
            <p className="mt-2 text-[15px] text-[#6d837d]">
              See who is on CampusFind, and control roles and access.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-[#dbe7e3] bg-white px-4 py-2 text-[13px] text-[#6d837d]">
              <span className="cf-live h-2 w-2 rounded-full bg-[#2fc785]" />
              {allUsers.length} members
            </div>
            <button
              onClick={() => refetch()}
              aria-label="Refresh users"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dbe7e3] bg-white text-[#0d9467] transition hover:bg-[#e8f6ef]"
            >
              <RefreshCw size={14} className={isFetching ? "cf-spin" : ""} />
            </button>
          </div>
        </header>

        {/* ================= Hero ================= */}
        <section
          className="cf-rise relative mb-6 overflow-hidden rounded-[28px] bg-[#0b2a26] p-6 text-white md:p-9"
          style={{ animationDelay: "0.05s" }}
        >
          <div className="cf-drift pointer-events-none absolute -right-24 -top-32 h-[380px] w-[380px] rounded-full bg-[#1c8f6b]/30 blur-3xl" />
          <div
            className="cf-drift pointer-events-none absolute -bottom-40 left-1/4 h-[320px] w-[320px] rounded-full bg-[#f5a524]/10 blur-3xl"
            style={{ animationDelay: "-6s" }}
          />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_1.15fr]">
            {/* Left: number + donut */}
            <div>
              <p className="text-sm text-[#9fc9bd]">Community size</p>

              <div className="mt-2 flex items-end gap-3">
                <span className="cf-display text-[84px] font-extrabold leading-none md:text-[104px]">
                  {totalCount}
                </span>
                <span className="mb-3 text-lg text-[#9fc9bd]">
                  {allUsers.length === 1 ? "member" : "members"}
                </span>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-8">
                <div className="relative h-[150px] w-[150px] shrink-0">
                  <svg
                    viewBox="0 0 160 160"
                    className="h-full w-full -rotate-90"
                  >
                    <circle
                      cx="80"
                      cy="80"
                      r={R}
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="16"
                    />
                    {segments.map((s) => {
                      const len = allUsers.length
                        ? (s.value / allUsers.length) * C
                        : 0;
                      const offset = -cum;
                      cum += len;
                      return (
                        <circle
                          key={s.label}
                          cx="80"
                          cy="80"
                          r={R}
                          fill="none"
                          stroke={s.color}
                          strokeWidth="16"
                          strokeDasharray={`${mounted ? Math.max(len - 3, 0) : 0} ${C}`}
                          strokeDashoffset={offset}
                          style={{
                            transition:
                              "stroke-dasharray 1.4s cubic-bezier(.2,.8,.2,1) .3s",
                          }}
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="cf-display text-3xl font-bold">
                      {totalColleges}
                    </span>
                    <span className="text-xs text-[#9fc9bd]">campuses</span>
                  </div>
                </div>

                <ul className="space-y-3">
                  {segments.map((s) => (
                    <li
                      key={s.label}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: s.color }}
                      />
                      <span className="w-16 text-[#c4e0d8]">{s.label}</span>
                      <span className="cf-display text-lg font-semibold">
                        {s.value}
                      </span>
                      <span className="text-xs text-[#7fa89c]">
                        {allUsers.length
                          ? Math.round((s.value / allUsers.length) * 100)
                          : 0}
                        %
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: members per campus */}
            <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10 backdrop-blur-sm md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="cf-display text-lg font-semibold">
                  Members by campus
                </h2>
                <span className="text-xs text-[#9fc9bd]">Top 5</span>
              </div>

              {campusRows.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/15 px-4 py-10 text-center text-sm text-[#9fc9bd]">
                  No campus data yet.
                </div>
              ) : (
                <ul className="space-y-4">
                  {campusRows.map((c) => (
                    <li key={c.id}>
                      <button
                        onClick={() => {
                          setCollegeFilter(c.id);
                          setCurrentPage(1);
                        }}
                        className="block w-full text-left"
                        title={`Filter by ${c.name}`}
                      >
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {c.name}
                            </p>
                            <p className="text-xs uppercase text-[#7fa89c]">
                              {c.id}
                            </p>
                          </div>
                          <span className="cf-display text-xl font-bold">
                            {c.count}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#0d9467] to-[#3ddc97]"
                            style={{
                              width: mounted
                                ? `${(c.count / maxCampus) * 100}%`
                                : "0%",
                              transition:
                                "width 1.2s cubic-bezier(.2,.8,.2,1) .5s",
                            }}
                          />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* ================= Key numbers strip ================= */}
        <section
          className="cf-rise mb-6 flex flex-col divide-y divide-[#e3ebe8] overflow-hidden rounded-[22px] border border-[#e3ebe8] bg-white sm:flex-row sm:divide-x sm:divide-y-0"
          style={{ animationDelay: "0.2s" }}
        >
          <Stat
            icon={Users}
            label="Total members"
            value={allUsers.length}
            note="Registered on CampusFind"
          />
          <Stat
            icon={ShieldCheck}
            label="Administrators"
            value={totalAdmins}
            note="Members with admin access"
          />
          <Stat
            icon={GraduationCap}
            label="Campuses"
            value={totalColleges}
            note="Represented by members"
          />
          <Stat
            icon={UserPlus}
            label="New this week"
            value={newUsers7d}
            note="Joined in the last 7 days"
          />
        </section>

        {/* ================= Members table ================= */}
        <section className="overflow-hidden rounded-[22px] border border-[#e3ebe8] bg-white">
          <div className="flex flex-col justify-between gap-3 px-6 pb-4 pt-6 sm:flex-row sm:items-start">
            <div>
              <h3 className="cf-display text-[17px] font-semibold text-[#10312c]">
                Community members
              </h3>
              <p className="mt-0.5 text-[13px] text-[#7a8f8a]">
                {filteredUsers.length === allUsers.length
                  ? "All registered users"
                  : `${filteredUsers.length} of ${allUsers.length} users match your filters`}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 gap-3 px-6 pb-5 lg:grid-cols-[1fr_230px_170px_auto]">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#93a7a2]"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search name, email or user ID"
                className="h-11 w-full rounded-full border border-[#dbe7e3] bg-white pl-11 pr-4 text-sm text-[#10312c] outline-none transition placeholder:text-[#a4b4b0] focus:border-[#0d9467] focus:ring-4 focus:ring-[#0d9467]/10"
              />
            </div>

            <SelectBox
              icon={Building2}
              label="Filter by campus"
              value={collegeFilter}
              onChange={(e) => {
                setCollegeFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All campuses</option>
              {colleges.map((college) => (
                <option key={college.collegeId} value={college.collegeId}>
                  {college.collegeName}
                </option>
              ))}
            </SelectBox>

            <SelectBox
              icon={Shield}
              label="Filter by role"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </SelectBox>

            <button
              onClick={resetFilters}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#dbe7e3] bg-white px-5 text-sm font-medium text-[#6d837d] transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
            >
              <X size={14} />
              Reset
            </button>
          </div>

          {paginatedUsers.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left">
                  <thead>
                    <tr className="border-y border-[#edf2f0] bg-[#f8fbfa] text-xs font-medium text-[#8ea19c]">
                      <th className="px-6 py-3.5 font-medium">Member</th>
                      <th className="px-5 py-3.5 font-medium">Campus</th>
                      <th className="px-5 py-3.5 font-medium">Role</th>
                      <th className="px-5 py-3.5 font-medium">Joined</th>
                      <th className="px-6 py-3.5 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#edf2f0]">
                    {paginatedUsers.map((item) => {
                      const isCurrentUser = item.userId === currentUser?.uid;

                      return (
                        <tr
                          key={item.userId}
                          className="transition-colors hover:bg-[#f6faf8]"
                        >
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar user={item} size={44} />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="max-w-[190px] truncate text-sm font-semibold text-[#10312c]">
                                    {item.name || "Unnamed user"}
                                  </p>
                                  {isCurrentUser && (
                                    <span className="rounded-full bg-[#e3f4ec] px-2 py-0.5 text-[10px] font-semibold text-[#0d7a55]">
                                      You
                                    </span>
                                  )}
                                </div>
                                <p className="mt-0.5 flex max-w-[230px] items-center gap-1.5 truncate text-xs text-[#8ea19c]">
                                  <Mail size={12} className="shrink-0" />
                                  <span className="truncate">{item.email}</span>
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <p className="max-w-[210px] truncate text-sm font-medium text-[#3c5a53]">
                              {getCollegeName(item.collegeId)}
                            </p>
                            <p className="mt-0.5 text-[11px] uppercase text-[#a4b4b0]">
                              {item.collegeId || "—"}
                            </p>
                          </td>

                          <td className="px-5 py-3.5">
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
                                className="cursor-pointer rounded-full border border-[#dbe7e3] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#3c5a53] outline-none transition hover:border-[#0d9467] focus:border-[#0d9467] disabled:opacity-50"
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            )}
                          </td>

                          <td className="px-5 py-3.5">
                            <p className="text-sm text-[#3c5a53]">
                              {timeAgo(item.createdAt) || "—"}
                            </p>
                            <p
                              title={item.userId}
                              className="mt-0.5 max-w-[120px] truncate font-mono text-[10px] text-[#a4b4b0]"
                            >
                              {item.userId}
                            </p>
                          </td>

                          <td className="px-6 py-3.5">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openEditModal(item)}
                                aria-label={`Edit ${item.name}`}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f6ef] text-[#0d9467] transition hover:bg-[#0d9467] hover:text-white"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(item)}
                                disabled={
                                  isCurrentUser || deleteMutation.isPending
                                }
                                aria-label={`Delete ${item.name}`}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-500 transition hover:bg-rose-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-rose-50 disabled:hover:text-rose-500"
                              >
                                <Trash2 size={14} />
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
              <div className="flex flex-col justify-between gap-4 border-t border-[#edf2f0] px-6 py-5 sm:flex-row sm:items-center">
                <p className="text-xs text-[#7a8f8a]">
                  Showing{" "}
                  <span className="font-semibold text-[#10312c]">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                    {" - "}
                    {Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      filteredUsers.length,
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-[#10312c]">
                    {filteredUsers.length}
                  </span>{" "}
                  users
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dbe7e3] text-[#6d837d] transition hover:bg-[#e8f6ef] hover:text-[#0d9467] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`h-9 min-w-9 rounded-full px-2 text-xs font-semibold transition ${
                          currentPage === page
                            ? "bg-[#0b2a26] text-white"
                            : "text-[#6d837d] hover:bg-[#e8f6ef] hover:text-[#0d9467]"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages || totalPages === 0}
                    aria-label="Next page"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dbe7e3] text-[#6d837d] transition hover:bg-[#e8f6ef] hover:text-[#0d9467] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="px-6 pb-8">
              <div className="rounded-xl border border-dashed border-[#d5e2de] px-4 py-14 text-center">
                <p className="text-sm font-semibold text-[#10312c]">
                  No users found
                </p>
                <p className="mt-1 text-sm text-[#7a8f8a]">
                  Nothing matches your search or filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 rounded-full bg-[#e8f6ef] px-5 py-2 text-sm font-semibold text-[#0d7a55] transition hover:bg-[#d5efe3]"
                >
                  Clear filters
                </button>
              </div>
            </div>
          )}
        </section>

        <p className="mt-8 text-center text-xs text-[#9ab0aa]">
          CampusFind admin, role changes apply immediately
        </p>
      </div>

      {/* ================= Edit modal ================= */}
      {editingUser && (
        <div
          className="cf-fade fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#0b2a26]/50 px-4 py-8 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEditModal();
          }}
        >
          <div className="cf-modal my-auto w-full max-w-lg overflow-hidden rounded-[22px] border border-[#e3ebe8] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#edf2f0] px-6 py-5">
              <div>
                <h2 className="cf-display text-xl font-semibold text-[#10312c]">
                  Edit user
                </h2>
                <p className="mt-0.5 text-[13px] text-[#7a8f8a]">
                  Update details, campus and permissions.
                </p>
              </div>
              <button
                onClick={closeEditModal}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#8ea19c] transition hover:bg-rose-50 hover:text-rose-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-5 p-6">
              <div className="flex items-center gap-3 rounded-2xl bg-[#f3f7f5] p-4">
                <Avatar user={editingUser} size={48} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#10312c]">
                    {editingUser.name}
                  </p>
                  <p className="truncate text-xs text-[#8ea19c]">
                    {editingUser.email}
                  </p>
                </div>
                <div className="ml-auto">
                  <RoleBadge role={editingUser.role} />
                </div>
              </div>

              <ModalField label="Full name" icon={UserRound}>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  placeholder="Enter full name"
                  className={inputCls}
                />
              </ModalField>

              <ModalField label="Email address" icon={Mail}>
                <input
                  type="email"
                  value={editingUser.email || ""}
                  readOnly
                  className="h-11 w-full cursor-not-allowed rounded-xl border border-[#e3ebe8] bg-[#f3f7f5] pl-11 pr-4 text-sm text-[#7a8f8a] outline-none"
                />
              </ModalField>

              <ModalField label="Campus / college" icon={Building2}>
                <select
                  name="collegeId"
                  value={formData.collegeId}
                  onChange={handleFormChange}
                  required
                  className={`${inputCls} appearance-none pr-10`}
                >
                  <option value="">Select campus</option>
                  {colleges.map((college) => (
                    <option key={college.collegeId} value={college.collegeId}>
                      {college.collegeName}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#93a7a2]"
                />
              </ModalField>

              <div>
                <ModalField label="Account role" icon={ShieldCheck}>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleFormChange}
                    disabled={isSelf}
                    className={`${inputCls} appearance-none pr-10 disabled:cursor-not-allowed disabled:bg-[#f3f7f5] disabled:text-[#7a8f8a]`}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#93a7a2]"
                  />
                </ModalField>
                {isSelf && (
                  <p className="mt-1.5 text-xs text-amber-600">
                    You cannot change your own role.
                  </p>
                )}
              </div>

              <ModalField label="Profile photo URL" icon={Camera}>
                <input
                  type="url"
                  name="photoUrl"
                  value={formData.photoUrl}
                  onChange={handleFormChange}
                  placeholder="https://example.com/photo.jpg"
                  className={inputCls}
                />
              </ModalField>

              <div className="flex flex-col-reverse gap-3 border-t border-[#edf2f0] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={updateMutation.isPending}
                  className="h-11 rounded-full border border-[#dbe7e3] px-6 text-sm font-semibold text-[#3c5a53] transition hover:bg-[#f3f7f5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#0d9467] px-7 text-sm font-semibold text-white transition hover:bg-[#0b7f58] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updateMutation.isPending ? (
                    <>
                      <RefreshCw size={15} className="cf-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Save changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// =====================================
//              STYLES
// =====================================

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600&display=swap');
  .cf-root { font-family: 'Instrument Sans', system-ui, sans-serif; }
  .cf-display { font-family: 'Bricolage Grotesque', 'Instrument Sans', sans-serif; letter-spacing: -0.02em; }
  @keyframes cf-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
  @keyframes cf-pulse { 0% { box-shadow: 0 0 0 0 rgba(61,220,151,.55); } 100% { box-shadow: 0 0 0 10px rgba(61,220,151,0); } }
  @keyframes cf-drift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(24px,-18px); } }
  @keyframes cf-shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }
  @keyframes cf-spin { to { transform: rotate(360deg); } }
  @keyframes cf-fade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes cf-modal { from { opacity: 0; transform: translateY(12px) scale(.98); } to { opacity: 1; transform: none; } }
  .cf-rise { opacity: 0; animation: cf-rise .7s cubic-bezier(.2,.8,.2,1) forwards; }
  .cf-live { animation: cf-pulse 1.8s infinite; }
  .cf-drift { animation: cf-drift 14s ease-in-out infinite; }
  .cf-spin { animation: cf-spin .9s linear infinite; }
  .cf-fade { animation: cf-fade .2s ease-out; }
  .cf-modal { animation: cf-modal .25s ease-out; }
  .cf-shimmer { background: linear-gradient(90deg,#eef4f2 25%,#f8fbfa 50%,#eef4f2 75%); background-size: 200% 100%; animation: cf-shimmer 1.4s infinite; }
  @media (prefers-reduced-motion: reduce) {
    .cf-rise, .cf-live, .cf-drift, .cf-shimmer, .cf-spin, .cf-fade, .cf-modal { animation: none !important; opacity: 1; }
  }
`;

export default ManageUsers;
