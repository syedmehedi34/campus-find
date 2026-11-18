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
  FaSyncAlt,
  FaShieldAlt,
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

const formatDate = (date) => {
  if (!date) return "Not specified";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Not specified";

  return parsed.toLocaleDateString("en-US", {
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

const moderationColors = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-rose-50 text-rose-700",
};

const statusColors = {
  active: "bg-sky-50 text-sky-700",
  resolved: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-slate-100 text-slate-600",
};

const AllPostsManage = () => {
  const { loggedInUser } = useUserData();
  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();

  // Filters
  const [filters, setFilters] = useState({
    type: "all",
    moderationStatus: "pending",
    postStatus: "all",
    category: "",
    search: "",
    page: 1,
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [filters.search]);

  // Update filter
  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  // Fetch posts
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

  // Mutations
  const mutationOptions = {
    onSuccess: (response) => {
      toast.success(response.message || "Updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["admin-items"],
      });
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

  // Confirmation
  const confirmAction = async ({
    title,
    text,
    confirmText,
    color = "#059669",
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
      color: approve ? "#059669" : "#e11d48",
    });

    if (confirmed) {
      moderationMutation.mutate({
        id: item._id,
        status,
      });
    }
  };

  const handleStatus = async (item, status) => {
    if (status === item.postStatus) return;

    const confirmed = await confirmAction({
      title: "Change post status?",
      text: `Set "${item.itemName}" as ${status}?`,
      confirmText: "Update status",
    });

    if (confirmed) {
      statusMutation.mutate({
        id: item._id,
        status,
      });
    }
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

    if (result.isConfirmed) {
      deleteMutation.mutate(item._id);
    }
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
    setFilters((prev) => ({
      ...prev,
      page,
    }));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Initial loading
  if (isPending && !data) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
        <p className="text-sm font-medium text-slate-500">Loading posts...</p>
      </div>
    );
  }

  const mutationPending =
    moderationMutation.isPending ||
    statusMutation.isPending ||
    deleteMutation.isPending;

  const modalImages = selectedItem?.images || [];

  return (
    <div className="min-h-screen bg-[#f5f8f6] px-4 py-7 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        {/* Header */}
        <div className="mb-7 flex flex-col justify-between gap-5 rounded-2xl bg-gradient-to-r from-[#102b27] to-[#087d5d] p-6 text-white shadow-lg sm:flex-row sm:items-center sm:p-8">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-widest text-emerald-200">
              <FaShieldAlt />
              ADMINISTRATION / POSTS
            </div>

            <h1 className="text-2xl font-bold sm:text-3xl">Post Management</h1>

            <p className="mt-2 text-sm text-white/60">
              Review and manage campus lost and found submissions.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/10 p-4">
            <FaBoxOpen className="text-3xl text-emerald-200" />
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-white/60">Total submissions</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Total Posts", stats.total, "text-slate-700"],
            ["Pending", stats.pending, "text-amber-600"],
            ["Approved", stats.approved, "text-emerald-600"],
            ["Rejected", stats.rejected, "text-rose-600"],
          ].map(([label, value, color]) => (
            <div
              key={label}
              className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-semibold text-slate-400">{label}</p>
              <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <section className="mb-6 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-700">Manage submissions</h2>
              <p className="mt-1 text-xs text-slate-400">
                Search and filter campus posts.
              </p>
            </div>

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-emerald-50 disabled:opacity-50"
            >
              <FaSyncAlt className={isFetching ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* Moderation */}
          <div className="mb-4 flex flex-wrap gap-2">
            {[
              ["Pending", "pending", stats.pending],
              ["Approved", "approved", stats.approved],
              ["Rejected", "rejected", stats.rejected],
              ["All Posts", "all", stats.total],
            ].map(([label, value, count]) => (
              <button
                key={value}
                onClick={() => updateFilter("moderationStatus", value)}
                className={`rounded-lg px-4 py-2 text-xs font-bold ${
                  filters.moderationStatus === value
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-50 text-slate-500 hover:bg-emerald-50"
                }`}
              >
                {label}
                <span className="ml-2 opacity-70">{count}</span>
              </button>
            ))}
          </div>

          {/* Type */}
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="self-center text-xs font-bold text-slate-400">
              TYPE:
            </span>

            {[
              ["All", "all"],
              ["Lost", "lost"],
              ["Found", "found"],
            ].map(([label, value]) => (
              <button
                key={value}
                onClick={() => updateFilter("type", value)}
                className={`rounded-lg px-3 py-2 text-xs font-bold ${
                  filters.type === value
                    ? "bg-[#19372e] text-white"
                    : "bg-slate-50 text-slate-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600" />

              <input
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                placeholder="Search item name..."
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div className="relative">
              <FaFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600" />

              <select
                value={filters.category}
                onChange={(e) => updateFilter("category", e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs outline-none focus:border-emerald-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {formatCategory(category)}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={filters.postStatus}
              onChange={(e) => updateFilter("postStatus", e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-emerald-500"
            >
              <option value="all">All Post Statuses</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </section>

        {/* Results */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-700">
              {filters.moderationStatus === "all"
                ? "All Submissions"
                : `${filters.moderationStatus.charAt(0).toUpperCase()}${filters.moderationStatus.slice(1)} Posts`}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Showing {items.length} of {totalItems} posts
            </p>
          </div>

          {isFetching && (
            <span className="flex items-center gap-2 text-xs font-medium text-emerald-600">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
              Updating...
            </span>
          )}
        </div>

        {/* Error */}
        {isError && !data && (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <p className="font-bold text-rose-600">Failed to load posts</p>
            <p className="mt-2 text-sm text-slate-400">
              {error?.response?.data?.message || error?.message}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white"
            >
              Try again
            </button>
          </div>
        )}

        {/* Background error */}
        {isError && data && (
          <div className="mb-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
            Could not refresh results. Showing previous data.
            <button onClick={() => refetch()} className="ml-2 underline">
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!isError && !isFetching && items.length === 0 && (
          <div className="rounded-xl bg-white px-5 py-16 text-center shadow-sm">
            <FaBoxOpen className="mx-auto text-4xl text-emerald-400" />
            <h3 className="mt-4 font-bold text-slate-700">No posts found</h3>
            <p className="mt-2 text-xs text-slate-400">
              No posts match your current filters.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Cards */}
        {items.length > 0 && (
          <div
            className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 ${
              isFetching ? "opacity-60" : ""
            }`}
          >
            {items.map((item) => (
              <article
                key={item._id}
                className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Image */}
                <button
                  onClick={() => openModal(item)}
                  className="relative block h-44 w-full overflow-hidden bg-slate-100"
                >
                  {item.images?.length ? (
                    <img
                      src={item.images[0]}
                      alt={item.itemName}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FaImage className="mx-auto mt-16 text-3xl text-slate-300" />
                  )}

                  <span
                    className={`absolute left-3 top-3 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase ${
                      item.type === "lost"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {item.type}
                  </span>

                  <span
                    className={`absolute right-3 top-3 rounded-md px-2.5 py-1 text-[10px] font-bold capitalize ${
                      moderationColors[item.moderationStatus] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.moderationStatus || "pending"}
                  </span>
                </button>

                {/* Content */}
                <div className="p-4">
                  <div className="mb-2 flex justify-between gap-2">
                    <span className="text-[10px] font-bold text-emerald-700">
                      {formatCategory(item.category)}
                    </span>

                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold capitalize ${
                        statusColors[item.postStatus] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.postStatus || "active"}
                    </span>
                  </div>

                  <h3 className="truncate font-bold text-slate-700">
                    {item.itemName}
                  </h3>

                  <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-400">
                    {item.description || "No description provided."}
                  </p>

                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <p className="flex items-center gap-2 truncate text-xs text-slate-500">
                      <FaMapMarkerAlt className="shrink-0 text-emerald-500" />
                      {item.location?.area || "Location not specified"}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        <FaCalendarAlt className="mr-1 inline" />
                        {formatDate(item.createdAt)}
                      </span>

                      <button
                        onClick={() => openModal(item)}
                        className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-800"
                      >
                        <FaEye /> Details
                      </button>
                    </div>
                  </div>

                  {/* Moderation */}
                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                    {item.moderationStatus === "pending" ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          disabled={mutationPending}
                          onClick={() => handleModeration(item, "approved")}
                          className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          <FaCheck /> Approve
                        </button>

                        <button
                          disabled={mutationPending}
                          onClick={() => handleModeration(item, "rejected")}
                          className="flex items-center justify-center gap-2 rounded-lg bg-rose-50 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 disabled:opacity-50"
                        >
                          <FaBan /> Reject
                        </button>
                      </div>
                    ) : item.moderationStatus === "rejected" ? (
                      <button
                        disabled={mutationPending}
                        onClick={() => handleModeration(item, "approved")}
                        className="w-full rounded-lg bg-emerald-50 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                      >
                        <FaCheck className="mr-1 inline" />
                        Approve this post
                      </button>
                    ) : null}

                    <div className="flex gap-2">
                      <select
                        value={item.postStatus || "active"}
                        disabled={mutationPending}
                        onChange={(e) => handleStatus(item, e.target.value)}
                        className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold outline-none focus:border-emerald-500"
                      >
                        <option value="active">Active</option>
                        <option value="resolved">Resolved</option>
                        <option value="cancelled">Cancelled</option>
                      </select>

                      <button
                        disabled={mutationPending}
                        onClick={() => handleDelete(item)}
                        title="Delete post"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 disabled:opacity-50"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isError && totalPages > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button
              disabled={filters.page <= 1}
              onClick={() => changePage(filters.page - 1)}
              className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-bold disabled:opacity-40"
            >
              <FaChevronLeft /> Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (number) =>
                  number === 1 ||
                  number === totalPages ||
                  Math.abs(number - filters.page) <= 1,
              )
              .map((number, index, array) => (
                <div key={number} className="flex items-center gap-2">
                  {index > 0 && array[index - 1] !== number - 1 && (
                    <span className="text-slate-400">...</span>
                  )}

                  <button
                    onClick={() => changePage(number)}
                    className={`h-10 min-w-10 rounded-lg px-3 text-xs font-bold ${
                      filters.page === number
                        ? "bg-emerald-600 text-white"
                        : "border border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {number}
                  </button>
                </div>
              ))}

            <button
              disabled={filters.page >= totalPages}
              onClick={() => changePage(filters.page + 1)}
              className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-bold disabled:opacity-40"
            >
              Next <FaChevronRight />
            </button>
          </div>
        )}

        <div className="mt-10 text-center text-xs text-slate-400">
          Keeping your campus community safe and helpful.
        </div>
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="my-auto max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between bg-[#19372e] p-5 text-white">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-emerald-200">
                  ADMIN / POST DETAILS
                </p>
                <h2 className="mt-1 font-bold">{selectedItem.itemName}</h2>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg bg-white/10 p-3 hover:bg-white/20"
              >
                <FaTimes />
              </button>
            </div>

            <div className="grid lg:grid-cols-2">
              {/* Gallery */}
              <div className="bg-slate-50 p-5">
                <div className="flex h-64 items-center justify-center overflow-hidden rounded-xl bg-slate-200 sm:h-80">
                  {modalImages.length ? (
                    <img
                      src={modalImages[activeImage] || modalImages[0]}
                      alt={selectedItem.itemName}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <FaImage className="text-5xl text-slate-400" />
                  )}
                </div>

                {modalImages.length > 1 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {modalImages.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        onClick={() => setActiveImage(index)}
                        className={`h-14 w-14 overflow-hidden rounded-lg border-2 ${
                          activeImage === index
                            ? "border-emerald-500"
                            : "border-transparent"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Image ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-5 p-5">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    {formatCategory(selectedItem.category)}
                  </span>

                  <span
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize ${
                      moderationColors[selectedItem.moderationStatus] || ""
                    }`}
                  >
                    {selectedItem.moderationStatus}
                  </span>

                  <span
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize ${
                      statusColors[selectedItem.postStatus] || ""
                    }`}
                  >
                    {selectedItem.postStatus}
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-[#19372e]">
                    {selectedItem.itemName}
                  </h2>
                  <p className="mt-2 text-xs text-slate-400">
                    Submitted on {formatDate(selectedItem.createdAt)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <h3 className="mb-2 text-sm font-bold text-slate-700">
                    Description
                  </h3>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-500">
                    {selectedItem.description || "No description provided."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: "Campus area",
                      value: selectedItem.location?.area,
                      icon: <FaMapMarkerAlt />,
                    },
                    {
                      label: "Specific location",
                      value: selectedItem.location?.specificLocation,
                      icon: <FaMapMarkerAlt />,
                    },
                    {
                      label: "Item date",
                      value: formatDate(selectedItem.date),
                      icon: <FaCalendarAlt />,
                    },
                    {
                      label: "Approximate time",
                      value: selectedItem.approximateTime,
                      icon: <FaClock />,
                    },
                  ].map((info) => (
                    <div
                      key={info.label}
                      className="rounded-xl bg-emerald-50/70 p-3"
                    >
                      <div className="mb-2 text-emerald-600">{info.icon}</div>
                      <p className="text-[10px] text-slate-400">{info.label}</p>
                      <p className="mt-1 break-words text-xs font-bold text-slate-700">
                        {info.value || "Not specified"}
                      </p>
                    </div>
                  ))}
                </div>

                {selectedItem.identifyingFeatures && (
                  <div className="rounded-xl bg-amber-50 p-4">
                    <h3 className="mb-2 text-xs font-bold text-amber-800">
                      Identifying features
                    </h3>
                    <p className="whitespace-pre-wrap text-xs leading-6 text-amber-900/70">
                      {selectedItem.identifyingFeatures}
                    </p>
                  </div>
                )}

                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
                    <FaPhoneAlt className="text-emerald-600" />
                    Contact information
                  </h3>

                  {selectedItem.contactPreference ? (
                    <a
                      href={`tel:${selectedItem.contactPreference}`}
                      className="flex items-center justify-between rounded-lg bg-white p-3 text-sm font-bold text-emerald-700"
                    >
                      {selectedItem.contactPreference}
                      <FaPhoneAlt />
                    </a>
                  ) : (
                    <p className="text-xs text-slate-400">
                      No contact number provided.
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  {selectedItem.moderationStatus === "pending" ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        disabled={mutationPending}
                        onClick={() =>
                          handleModeration(selectedItem, "approved")
                        }
                        className="rounded-lg bg-emerald-600 py-3 text-xs font-bold text-white disabled:opacity-50"
                      >
                        <FaCheck className="mr-1 inline" />
                        Approve
                      </button>

                      <button
                        disabled={mutationPending}
                        onClick={() =>
                          handleModeration(selectedItem, "rejected")
                        }
                        className="rounded-lg bg-rose-50 py-3 text-xs font-bold text-rose-600 disabled:opacity-50"
                      >
                        <FaBan className="mr-1 inline" />
                        Reject
                      </button>
                    </div>
                  ) : selectedItem.moderationStatus === "rejected" ? (
                    <button
                      disabled={mutationPending}
                      onClick={() => handleModeration(selectedItem, "approved")}
                      className="w-full rounded-lg bg-emerald-50 py-3 text-xs font-bold text-emerald-700 disabled:opacity-50"
                    >
                      <FaCheck className="mr-1 inline" />
                      Approve this post
                    </button>
                  ) : null}

                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-500">
                      Change post status
                    </label>

                    <select
                      value={selectedItem.postStatus || "active"}
                      disabled={mutationPending}
                      onChange={(e) =>
                        handleStatus(selectedItem, e.target.value)
                      }
                      className="h-11 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-emerald-500 disabled:opacity-50"
                    >
                      <option value="active">Active</option>
                      <option value="resolved">Resolved</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <button
                    disabled={mutationPending}
                    onClick={() => handleDelete(selectedItem)}
                    className="w-full rounded-lg border border-rose-100 py-3 text-xs font-bold text-rose-500 hover:bg-rose-50 disabled:opacity-50"
                  >
                    <FaTrash className="mr-2 inline" />
                    Delete post
                  </button>

                  <button
                    onClick={closeModal}
                    className="w-full rounded-lg border border-slate-200 py-3 text-xs font-bold text-slate-500 hover:bg-slate-50"
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

export default AllPostsManage;
