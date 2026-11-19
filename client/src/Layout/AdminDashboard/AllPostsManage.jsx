import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaFilter,
  FaBoxOpen,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaPhoneAlt,
  FaImage,
  FaTimes,
  FaEye,
  FaCheck,
  FaBan,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaSyncAlt,
} from "react-icons/fa";

import useUserData from "../../hooks/useUserData";
import useAxiosPublic from "../../hooks/useAxiosPublic";

const LIMIT = 12;

const categories = [
  "electronics",
  "gadgets",
  "accessories",
  "stationery",
  "books",
  "clothing",
  "footwear",
  "id-cards",
  "wallets-purses",
  "keys",
  "other",
];

// =====================================
//              HELPERS
// =====================================

const formatDate = (date) => {
  if (!date) return "Not specified";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Not specified";
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatCategory = (category = "") =>
  category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

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

const MODERATION_STYLE = {
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  rejected: "bg-rose-50 text-rose-700 ring-rose-600/15",
};

const POST_STATUS_STYLE = {
  active: "bg-sky-50 text-sky-700 ring-sky-600/15",
  resolved: "bg-violet-50 text-violet-700 ring-violet-600/15",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-500/15",
};

// =====================================
//              SMALL PIECES
// =====================================

const Badge = ({ className = "", children }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ring-inset ${className}`}
  >
    {children}
  </span>
);

const Stat = ({ label, value, note }) => {
  const n = useCountUp(value);
  return (
    <div className="flex-1 px-6 py-5">
      <p className="text-[13px] font-medium text-[#6d837d]">{label}</p>
      <p className="cf-display mt-2 text-[34px] font-bold leading-none text-[#10312c]">
        {n}
      </p>
      <p className="mt-2 text-xs text-[#8ea19c]">{note}</p>
    </div>
  );
};

const SelectBox = ({ icon: Icon, value, onChange, children, label }) => (
  <div className="relative">
    {Icon && (
      <Icon
        size={13}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#93a7a2]"
      />
    )}
    <select
      value={value}
      onChange={onChange}
      aria-label={label}
      className={`h-11 w-full appearance-none rounded-full border border-[#dbe7e3] bg-white pr-9 text-sm text-[#3c5a53] outline-none transition focus:border-[#0d9467] focus:ring-4 focus:ring-[#0d9467]/10 ${
        Icon ? "pl-10" : "pl-4"
      }`}
    >
      {children}
    </select>
    <FaChevronDown
      size={11}
      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#93a7a2]"
    />
  </div>
);

const SkeletonPage = () => (
  <div className="min-h-screen bg-[#f3f7f5] px-4 py-7 md:px-6">
    <style>{styles}</style>
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="cf-shimmer h-12 w-72 rounded-xl" />
      <div className="cf-shimmer h-72 rounded-[28px]" />
      <div className="cf-shimmer h-24 rounded-[22px]" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="cf-shimmer h-80 rounded-[22px]" />
        ))}
      </div>
    </div>
  </div>
);

// =====================================
//              MAIN PAGE
// =====================================

const AllPostsManage = () => {
  const { loggedInUser } = useUserData();
  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    type: "all",
    moderationStatus: "pending",
    postStatus: "all",
    category: "",
    search: "",
    page: 1,
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  // ---------- Fetch ----------
  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: [
      "admin-items",
      filters.type,
      filters.moderationStatus,
      filters.postStatus,
      filters.category,
      debouncedSearch,
      filters.page,
    ],
    queryFn: async () => {
      const response = await axiosPublic.get("/admin/items", {
        params: {
          type: filters.type,
          moderationStatus: filters.moderationStatus,
          postStatus: filters.postStatus,
          category: filters.category || undefined,
          search: debouncedSearch || undefined,
          page: filters.page,
          limit: LIMIT,
        },
      });
      return response.data;
    },
    enabled: !!loggedInUser?.userId,
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const items = data?.items || [];
  const totalItems = Number(data?.totalItems || 0);
  const totalPages = Math.max(1, Number(data?.totalPages || 1));

  const stats = useMemo(
    () =>
      data?.stats || {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      },
    [data?.stats],
  );

  // ---------- Mutations ----------
  const mutationOptions = {
    onSuccess: (response) => {
      toast.success(response.message || "Updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-items"] });
      setSelectedItem(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Something went wrong");
    },
  };

  const moderationMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await axiosPublic.patch(`/admin/items/${id}/moderation`, {
        moderationStatus: status,
      });
      return res.data;
    },
    ...mutationOptions,
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await axiosPublic.patch(`/admin/items/${id}/status`, {
        postStatus: status,
      });
      return res.data;
    },
    ...mutationOptions,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosPublic.delete(`/admin/items/${id}`);
      return res.data;
    },
    ...mutationOptions,
  });

  const confirmAction = async ({
    title,
    text,
    confirmText,
    color = "#0d9467",
  }) => {
    const result = await Swal.fire({
      title,
      text,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: "Cancel",
      confirmButtonColor: color,
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });
    return result.isConfirmed;
  };

  const handleModeration = async (item, status) => {
    const approve = status === "approved";

    const confirmed = await confirmAction({
      title: approve ? "Approve this post?" : "Reject this post?",
      text: approve
        ? "This post will become visible to campus users."
        : "This post will be marked as rejected.",
      confirmText: approve ? "Yes, approve" : "Yes, reject",
      color: approve ? "#0d9467" : "#e11d48",
    });

    if (confirmed) moderationMutation.mutate({ id: item._id, status });
  };

  const handleStatus = async (item, status) => {
    if (status === item.postStatus) return;

    const confirmed = await confirmAction({
      title: "Change post status?",
      text: `Set "${item.itemName}" as ${status}?`,
      confirmText: "Update status",
    });

    if (confirmed) statusMutation.mutate({ id: item._id, status });
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: "Delete this post?",
      text: `You are about to delete "${item.itemName}".`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Keep post",
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (result.isConfirmed) deleteMutation.mutate(item._id);
  };

  const openModal = (item) => {
    setSelectedItem(item);
    setActiveImage(0);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setActiveImage(0);
  };

  const resetFilters = () => {
    setFilters({
      type: "all",
      moderationStatus: "pending",
      postStatus: "all",
      category: "",
      search: "",
      page: 1,
    });
    setDebouncedSearch("");
  };

  const changePage = (page) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---------- Hero numbers (hooks before any early return) ----------
  const pendingCount = useCountUp(stats.pending);

  const R = 62;
  const C = 2 * Math.PI * R;
  const segments = [
    { label: "Approved", value: stats.approved, color: "#3ddc97" },
    { label: "Pending", value: stats.pending, color: "#f5a524" },
    { label: "Rejected", value: stats.rejected, color: "#ff6b6b" },
  ];
  let cum = 0;

  if (isPending && !data) return <SkeletonPage />;

  const mutationPending =
    moderationMutation.isPending ||
    statusMutation.isPending ||
    deleteMutation.isPending;

  const modalImages = selectedItem?.images || [];

  const moderationTabs = [
    { label: "Pending", value: "pending", count: stats.pending },
    { label: "Approved", value: "approved", count: stats.approved },
    { label: "Rejected", value: "rejected", count: stats.rejected },
    { label: "All posts", value: "all", count: stats.total },
  ];

  // Moderation buttons (used on card + modal)
  const renderModeration = (item, size = "sm") => {
    const h = size === "lg" ? "h-11" : "h-10";
    if (item.moderationStatus === "pending") {
      return (
        <div className="grid grid-cols-2 gap-2">
          <button
            disabled={mutationPending}
            onClick={() => handleModeration(item, "approved")}
            className={`${h} flex items-center justify-center gap-2 rounded-full bg-[#0d9467] text-xs font-semibold text-white transition hover:bg-[#0b7f58] disabled:opacity-50`}
          >
            <FaCheck size={11} /> Approve
          </button>
          <button
            disabled={mutationPending}
            onClick={() => handleModeration(item, "rejected")}
            className={`${h} flex items-center justify-center gap-2 rounded-full bg-rose-50 text-xs font-semibold text-rose-600 transition hover:bg-rose-500 hover:text-white disabled:opacity-50`}
          >
            <FaBan size={11} /> Reject
          </button>
        </div>
      );
    }
    if (item.moderationStatus === "rejected") {
      return (
        <button
          disabled={mutationPending}
          onClick={() => handleModeration(item, "approved")}
          className={`${h} flex w-full items-center justify-center gap-2 rounded-full bg-[#e8f6ef] text-xs font-semibold text-[#0d7a55] transition hover:bg-[#d5efe3] disabled:opacity-50`}
        >
          <FaCheck size={11} /> Approve this post
        </button>
      );
    }
    return null;
  };

  return (
    <div className="cf-root min-h-screen bg-[#f3f7f5] px-4 py-7 md:px-6">
      <style>{styles}</style>

      <div className="mx-auto max-w-7xl">
        {/* ================= Top bar ================= */}
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="cf-display text-3xl font-bold text-[#10312c] md:text-[40px] md:leading-[1.1]">
              Post management
            </h1>
            <p className="mt-2 text-[15px] text-[#6d837d]">
              Review and manage lost and found posts from every campus.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-[#dbe7e3] bg-white px-4 py-2 text-[13px] text-[#6d837d]">
              <span className="cf-live h-2 w-2 rounded-full bg-[#2fc785]" />
              {stats.total} posts
            </div>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              aria-label="Refresh posts"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dbe7e3] bg-white text-[#0d9467] transition hover:bg-[#e8f6ef] disabled:opacity-60"
            >
              <FaSyncAlt className={isFetching ? "cf-spin" : ""} size={14} />
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
            {/* Left */}
            <div>
              <p className="text-sm text-[#9fc9bd]">Waiting for your review</p>

              <div className="mt-2 flex items-end gap-3">
                <span className="cf-display text-[84px] font-extrabold leading-none md:text-[104px]">
                  {pendingCount}
                </span>
                <span className="mb-3 text-lg text-[#9fc9bd]">
                  {stats.pending === 1 ? "post" : "posts"}
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
                      const len = stats.total ? (s.value / stats.total) * C : 0;
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
                      {stats.total}
                    </span>
                    <span className="text-xs text-[#9fc9bd]">total posts</span>
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
                      <span className="w-20 text-[#c4e0d8]">{s.label}</span>
                      <span className="cf-display text-lg font-semibold">
                        {s.value}
                      </span>
                      <span className="text-xs text-[#7fa89c]">
                        {stats.total
                          ? Math.round((s.value / stats.total) * 100)
                          : 0}
                        %
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: view switcher */}
            <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10 backdrop-blur-sm md:p-5">
              <h2 className="cf-display mb-3 text-lg font-semibold">Show me</h2>

              <div className="grid grid-cols-2 gap-2.5">
                {moderationTabs.map((tab) => {
                  const active = filters.moderationStatus === tab.value;
                  return (
                    <button
                      key={tab.value}
                      onClick={() =>
                        updateFilter("moderationStatus", tab.value)
                      }
                      aria-pressed={active}
                      className={`rounded-xl p-4 text-left transition ${
                        active
                          ? "bg-[#3ddc97] text-[#0b2a26]"
                          : "bg-white/[0.07] hover:bg-white/[0.12]"
                      }`}
                    >
                      <p
                        className={`text-xs ${active ? "text-[#0b2a26]/70" : "text-[#9fc9bd]"}`}
                      >
                        {tab.label}
                      </p>
                      <p className="cf-display mt-1 text-2xl font-bold">
                        {tab.count}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="mr-1 text-xs text-[#9fc9bd]">Type</span>
                {[
                  ["All", "all"],
                  ["Lost", "lost"],
                  ["Found", "found"],
                ].map(([label, value]) => (
                  <button
                    key={value}
                    onClick={() => updateFilter("type", value)}
                    aria-pressed={filters.type === value}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                      filters.type === value
                        ? "bg-white text-[#0b2a26]"
                        : "bg-white/10 text-[#c4e0d8] hover:bg-white/20"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= Key numbers strip ================= */}
        <section
          className="cf-rise mb-6 flex flex-col divide-y divide-[#e3ebe8] overflow-hidden rounded-[22px] border border-[#e3ebe8] bg-white sm:flex-row sm:divide-x sm:divide-y-0"
          style={{ animationDelay: "0.2s" }}
        >
          <Stat
            label="Total posts"
            value={stats.total}
            note="All campuses combined"
          />
          <Stat label="Pending" value={stats.pending} note="Need a decision" />
          <Stat
            label="Approved"
            value={stats.approved}
            note="Visible to campus users"
          />
          <Stat
            label="Rejected"
            value={stats.rejected}
            note="Hidden from users"
          />
        </section>

        {/* ================= Filters ================= */}
        <section className="mb-6 rounded-[22px] border border-[#e3ebe8] bg-white p-6">
          <div className="mb-4">
            <h3 className="cf-display text-[17px] font-semibold text-[#10312c]">
              Find posts
            </h3>
            <p className="mt-0.5 text-[13px] text-[#7a8f8a]">
              Search by item name or narrow down by category and status.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_220px_190px_auto]">
            <div className="relative">
              <FaSearch
                size={13}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#93a7a2]"
              />
              <input
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                placeholder="Search item name"
                className="h-11 w-full rounded-full border border-[#dbe7e3] bg-white pl-10 pr-4 text-sm text-[#10312c] outline-none transition placeholder:text-[#a4b4b0] focus:border-[#0d9467] focus:ring-4 focus:ring-[#0d9467]/10"
              />
            </div>

            <SelectBox
              icon={FaFilter}
              label="Filter by category"
              value={filters.category}
              onChange={(e) => updateFilter("category", e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {formatCategory(category)}
                </option>
              ))}
            </SelectBox>

            <SelectBox
              label="Filter by post status"
              value={filters.postStatus}
              onChange={(e) => updateFilter("postStatus", e.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
              <option value="cancelled">Cancelled</option>
            </SelectBox>

            <button
              onClick={resetFilters}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#dbe7e3] bg-white px-5 text-sm font-medium text-[#6d837d] transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
            >
              <FaTimes size={12} />
              Reset
            </button>
          </div>
        </section>

        {/* ================= Results heading ================= */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
          <div>
            <h2 className="cf-display text-lg font-semibold text-[#10312c]">
              {filters.moderationStatus === "all"
                ? "All submissions"
                : `${formatCategory(filters.moderationStatus)} posts`}
            </h2>
            <p className="mt-0.5 text-[13px] text-[#7a8f8a]">
              Showing {items.length} of {totalItems} posts
            </p>
          </div>

          {isFetching && (
            <span className="flex items-center gap-2 text-xs font-medium text-[#0d9467]">
              <span className="cf-spin h-3 w-3 rounded-full border-2 border-[#bfe6d6] border-t-[#0d9467]" />
              Updating
            </span>
          )}
        </div>

        {/* Error */}
        {isError && !data && (
          <div className="rounded-[22px] border border-[#e3ebe8] bg-white p-12 text-center">
            <p className="font-semibold text-rose-600">
              Couldn&apos;t load posts
            </p>
            <p className="mt-2 text-sm text-[#7a8f8a]">
              {error?.response?.data?.message || error?.message}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 rounded-full bg-[#0d9467] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b7f58]"
            >
              Try again
            </button>
          </div>
        )}

        {isError && data && (
          <div className="mb-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
            Could not refresh results. Showing previous data.
            <button onClick={() => refetch()} className="ml-2 underline">
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!isError && !isFetching && items.length === 0 && (
          <div className="rounded-[22px] border border-dashed border-[#d5e2de] bg-white px-5 py-16 text-center">
            <FaBoxOpen className="mx-auto text-3xl text-[#9ab0aa]" />
            <h3 className="cf-display mt-4 font-semibold text-[#10312c]">
              No posts found
            </h3>
            <p className="mt-1 text-sm text-[#7a8f8a]">
              No posts match your current filters.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 rounded-full bg-[#e8f6ef] px-5 py-2 text-sm font-semibold text-[#0d7a55] transition hover:bg-[#d5efe3]"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* ================= Cards ================= */}
        {items.length > 0 && (
          <div
            className={`grid gap-5 sm:grid-cols-2 xl:grid-cols-3 ${
              isFetching ? "opacity-60" : ""
            }`}
          >
            {items.map((item) => (
              <article
                key={item._id}
                className="flex flex-col overflow-hidden rounded-[22px] border border-[#e3ebe8] bg-white"
              >
                <button
                  onClick={() => openModal(item)}
                  aria-label={`View details for ${item.itemName}`}
                  className="relative block h-48 w-full overflow-hidden bg-[#eef4f2]"
                >
                  {item.images?.length ? (
                    <img
                      src={item.images[0]}
                      alt={item.itemName}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FaImage className="mx-auto mt-[72px] text-3xl text-[#c3d3cf]" />
                  )}

                  <Badge
                    className={`absolute left-3 top-3 backdrop-blur-sm ${
                      item.type === "lost"
                        ? "bg-rose-50/95 text-rose-700 ring-rose-600/15"
                        : "bg-teal-50/95 text-teal-700 ring-teal-600/15"
                    }`}
                  >
                    {item.type}
                  </Badge>

                  <Badge
                    className={`absolute right-3 top-3 backdrop-blur-sm ${
                      MODERATION_STYLE[item.moderationStatus] ||
                      MODERATION_STYLE.pending
                    }`}
                  >
                    {item.moderationStatus || "pending"}
                  </Badge>
                </button>

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#0d7a55]">
                      {formatCategory(item.category)}
                    </span>
                    <Badge
                      className={
                        POST_STATUS_STYLE[item.postStatus] ||
                        POST_STATUS_STYLE.active
                      }
                    >
                      {item.postStatus || "active"}
                    </Badge>
                  </div>

                  <h3 className="cf-display truncate text-[17px] font-semibold text-[#10312c]">
                    {item.itemName}
                  </h3>

                  <p className="mt-1.5 line-clamp-2 min-h-10 text-[13px] leading-5 text-[#7a8f8a]">
                    {item.description || "No description provided."}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#edf2f0] pt-4">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate text-xs text-[#3c5a53]">
                        <FaMapMarkerAlt className="shrink-0 text-[#0d9467]" />
                        <span className="truncate">
                          {item.location?.area || "Location not specified"}
                        </span>
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-[11px] text-[#8ea19c]">
                        <FaCalendarAlt className="shrink-0" />
                        {formatDate(item.createdAt)}
                      </p>
                    </div>

                    <button
                      onClick={() => openModal(item)}
                      className="flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-[#0d9467] transition hover:gap-2.5"
                    >
                      <FaEye size={12} /> Details
                    </button>
                  </div>

                  <div className="mt-auto space-y-2.5 pt-4">
                    {renderModeration(item)}

                    <div className="flex gap-2">
                      <div className="min-w-0 flex-1">
                        <SelectBox
                          label={`Change status of ${item.itemName}`}
                          value={item.postStatus || "active"}
                          onChange={(e) => handleStatus(item, e.target.value)}
                        >
                          <option value="active">Active</option>
                          <option value="resolved">Resolved</option>
                          <option value="cancelled">Cancelled</option>
                        </SelectBox>
                      </div>

                      <button
                        disabled={mutationPending}
                        onClick={() => handleDelete(item)}
                        aria-label={`Delete ${item.itemName}`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500 transition hover:bg-rose-500 hover:text-white disabled:opacity-50"
                      >
                        <FaTrash size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ================= Pagination ================= */}
        {!isError && totalPages > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
            <button
              disabled={filters.page <= 1}
              onClick={() => changePage(filters.page - 1)}
              className="flex h-10 items-center gap-2 rounded-full border border-[#dbe7e3] bg-white px-4 text-xs font-semibold text-[#3c5a53] transition hover:bg-[#e8f6ef] disabled:opacity-40"
            >
              <FaChevronLeft size={10} /> Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (number) =>
                  number === 1 ||
                  number === totalPages ||
                  Math.abs(number - filters.page) <= 1,
              )
              .map((number, index, array) => (
                <div key={number} className="flex items-center gap-1.5">
                  {index > 0 && array[index - 1] !== number - 1 && (
                    <span className="px-1 text-[#9ab0aa]">...</span>
                  )}
                  <button
                    onClick={() => changePage(number)}
                    className={`h-10 min-w-10 rounded-full px-3 text-xs font-semibold transition ${
                      filters.page === number
                        ? "bg-[#0b2a26] text-white"
                        : "text-[#6d837d] hover:bg-[#e8f6ef] hover:text-[#0d9467]"
                    }`}
                  >
                    {number}
                  </button>
                </div>
              ))}

            <button
              disabled={filters.page >= totalPages}
              onClick={() => changePage(filters.page + 1)}
              className="flex h-10 items-center gap-2 rounded-full border border-[#dbe7e3] bg-white px-4 text-xs font-semibold text-[#3c5a53] transition hover:bg-[#e8f6ef] disabled:opacity-40"
            >
              Next <FaChevronRight size={10} />
            </button>
          </div>
        )}

        <p className="mt-10 text-center text-xs text-[#9ab0aa]">
          CampusFind admin, changes apply immediately
        </p>
      </div>

      {/* ================= Details modal ================= */}
      {selectedItem && (
        <div
          className="cf-fade fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#0b2a26]/60 p-3 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="cf-modal my-auto max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-[22px] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between bg-[#0b2a26] px-6 py-4 text-white">
              <div className="min-w-0">
                <p className="text-xs text-[#9fc9bd]">Post details</p>
                <h2 className="cf-display mt-0.5 truncate text-lg font-semibold">
                  {selectedItem.itemName}
                </h2>
              </div>
              <button
                onClick={closeModal}
                aria-label="Close details"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              >
                <FaTimes />
              </button>
            </div>

            <div className="grid lg:grid-cols-2">
              {/* Gallery */}
              <div className="bg-[#f3f7f5] p-5">
                <div className="flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-[#e3ebe8] sm:h-80">
                  {modalImages.length ? (
                    <img
                      src={modalImages[activeImage] || modalImages[0]}
                      alt={selectedItem.itemName}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <FaImage className="text-5xl text-[#9ab0aa]" />
                  )}
                </div>

                {modalImages.length > 1 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {modalImages.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        onClick={() => setActiveImage(index)}
                        aria-label={`Show image ${index + 1}`}
                        className={`h-14 w-14 overflow-hidden rounded-xl border-2 transition ${
                          activeImage === index
                            ? "border-[#0d9467]"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-5 p-6">
                <div className="flex flex-wrap gap-2">
                  <Badge
                    className={
                      selectedItem.type === "lost"
                        ? "bg-rose-50 text-rose-700 ring-rose-600/15"
                        : "bg-teal-50 text-teal-700 ring-teal-600/15"
                    }
                  >
                    {selectedItem.type}
                  </Badge>
                  <Badge className="bg-[#eef4f2] text-[#3c5a53] ring-[#3c5a53]/10">
                    {formatCategory(selectedItem.category)}
                  </Badge>
                  <Badge
                    className={
                      MODERATION_STYLE[selectedItem.moderationStatus] ||
                      MODERATION_STYLE.pending
                    }
                  >
                    {selectedItem.moderationStatus || "pending"}
                  </Badge>
                  <Badge
                    className={
                      POST_STATUS_STYLE[selectedItem.postStatus] ||
                      POST_STATUS_STYLE.active
                    }
                  >
                    {selectedItem.postStatus || "active"}
                  </Badge>
                </div>

                <div>
                  <h2 className="cf-display text-2xl font-bold text-[#10312c]">
                    {selectedItem.itemName}
                  </h2>
                  <p className="mt-1 text-xs text-[#8ea19c]">
                    Submitted on {formatDate(selectedItem.createdAt)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f3f7f5] p-4">
                  <h3 className="mb-1.5 text-[13px] font-semibold text-[#10312c]">
                    Description
                  </h3>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-[#3c5a53]">
                    {selectedItem.description || "No description provided."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: "Campus area",
                      value: selectedItem.location?.area,
                      icon: FaMapMarkerAlt,
                    },
                    {
                      label: "Specific location",
                      value: selectedItem.location?.specificLocation,
                      icon: FaMapMarkerAlt,
                    },
                    {
                      label: "Item date",
                      value: formatDate(selectedItem.date),
                      icon: FaCalendarAlt,
                    },
                    {
                      label: "Approximate time",
                      value: selectedItem.approximateTime,
                      icon: FaClock,
                    },
                  ].map((info) => (
                    <div
                      key={info.label}
                      className="rounded-2xl border border-[#e3ebe8] p-3.5"
                    >
                      <info.icon className="mb-2 text-[#0d9467]" size={13} />
                      <p className="text-[11px] text-[#8ea19c]">{info.label}</p>
                      <p className="mt-0.5 break-words text-[13px] font-semibold text-[#10312c]">
                        {info.value || "Not specified"}
                      </p>
                    </div>
                  ))}
                </div>

                {selectedItem.identifyingFeatures && (
                  <div className="rounded-2xl bg-amber-50 p-4">
                    <h3 className="mb-1.5 text-[13px] font-semibold text-amber-800">
                      Identifying features
                    </h3>
                    <p className="whitespace-pre-wrap text-[13px] leading-6 text-amber-900/70">
                      {selectedItem.identifyingFeatures}
                    </p>
                  </div>
                )}

                <div className="rounded-2xl border border-[#d5efe3] bg-[#e8f6ef]/60 p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-[#10312c]">
                    <FaPhoneAlt className="text-[#0d9467]" size={12} />
                    Contact information
                  </h3>

                  {selectedItem.contactPreference ? (
                    <a
                      href={`tel:${selectedItem.contactPreference}`}
                      className="flex items-center justify-between rounded-xl bg-white p-3 text-sm font-semibold text-[#0d7a55]"
                    >
                      {selectedItem.contactPreference}
                      <FaPhoneAlt size={12} />
                    </a>
                  ) : (
                    <p className="text-xs text-[#7a8f8a]">
                      No contact number provided.
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  {renderModeration(selectedItem, "lg")}

                  <div>
                    <label className="mb-2 block text-[13px] font-medium text-[#3c5a53]">
                      Change post status
                    </label>
                    <SelectBox
                      label="Change post status"
                      value={selectedItem.postStatus || "active"}
                      onChange={(e) =>
                        handleStatus(selectedItem, e.target.value)
                      }
                    >
                      <option value="active">Active</option>
                      <option value="resolved">Resolved</option>
                      <option value="cancelled">Cancelled</option>
                    </SelectBox>
                  </div>

                  <button
                    disabled={mutationPending}
                    onClick={() => handleDelete(selectedItem)}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-rose-100 text-sm font-semibold text-rose-500 transition hover:bg-rose-50 disabled:opacity-50"
                  >
                    <FaTrash size={12} />
                    Delete post
                  </button>

                  <button
                    onClick={closeModal}
                    className="h-11 w-full rounded-full border border-[#dbe7e3] text-sm font-semibold text-[#3c5a53] transition hover:bg-[#f3f7f5]"
                  >
                    Close details
                  </button>
                </div>
              </div>
            </div>
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

export default AllPostsManage;
