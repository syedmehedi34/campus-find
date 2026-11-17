import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaTag,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaImage,
  FaBoxOpen,
  FaHandHoldingHeart,
  FaFilter,
  FaPlus,
} from "react-icons/fa";
import { Link } from "react-router";

import useUserData from "../../hooks/useUserData";
import useAxiosPublic from "../../hooks/useAxiosPublic";

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

const LIMIT = 12;

const formatDate = (date) => {
  if (!date) return "Not specified";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleDateString("en-US", {
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

const MyPosts = () => {
  const { loggedInUser } = useUserData();
  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();

  const [activeType, setActiveType] = useState("all");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Fetch logged-in user's posts
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: [
      "my-items",
      loggedInUser?.userId,
      activeType,
      category,
      search,
      page,
    ],

    queryFn: async () => {
      const response = await axiosPublic.get("/items/my-posts", {
        params: {
          userId: loggedInUser.userId,
          type: activeType,
          category: category || undefined,
          search: search.trim() || undefined,
          page,
          limit: LIMIT,
        },
      });

      return response.data;
    },

    enabled: !!loggedInUser?.userId,
    placeholderData: (previousData) => previousData,
  });

  // Delete post
  const deleteMutation = useMutation({
    mutationFn: async (itemId) => {
      const response = await axiosPublic.delete(`/items/${itemId}`, {
        data: {
          userId: loggedInUser.userId,
        },
      });

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["my-items"],
      });

      queryClient.invalidateQueries({
        queryKey: ["items"],
      });

      Swal.fire({
        icon: "success",
        title: "Post deleted",
        text: "Your post has been deleted successfully.",
        confirmButtonColor: "#059669",
      });
    },

    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text:
          error?.response?.data?.message ||
          "Something went wrong. Please try again.",
        confirmButtonColor: "#059669",
      });
    },
  });

  const items = data?.items || [];
  const totalItems = data?.totalItems || 0;
  const totalPages = data?.totalPages || 0;

  const handleTypeChange = (type) => {
    setActiveType(type);
    setPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: "Delete this post?",
      text: `Are you sure you want to delete "${item.itemName}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      deleteMutation.mutate(item._id);
    }
  };

  const clearFilters = () => {
    setActiveType("all");
    setCategory("");
    setSearch("");
    setPage(1);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-[#f5f8f6]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-500" />

        <p className="text-sm font-medium text-slate-500">
          Loading your posts...
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5f8f6] px-4 py-10 text-slate-800 sm:px-6 lg:py-14">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-emerald-300/20 blur-[110px]" />

      <div className="pointer-events-none absolute -right-40 top-[600px] h-96 w-96 rounded-full bg-teal-300/15 blur-[110px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* ================= HERO ================= */}
        <section className="relative mb-10 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#102b27] via-[#16463a] to-[#087d5d] px-6 py-10 shadow-xl shadow-emerald-950/10 sm:px-10 sm:py-12">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full border border-white/10" />

          <div className="pointer-events-none absolute -right-5 -top-20 h-64 w-64 rounded-full border border-white/10" />

          <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />

          <div className="relative z-10 max-w-2xl">
            <div className="mb-7 flex items-center gap-2 text-[11px] font-extrabold tracking-[2px] text-emerald-200">
              <span>LOSTHUB</span>
              <span className="text-white/40">/</span>
              <span className="text-white/70">MY POSTS</span>
            </div>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-[11px] font-semibold text-emerald-100">
              <FaHandHoldingHeart />
              YOUR CAMPUS CONTRIBUTION
            </div>

            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              Your posts,
              <br />
              <span className="text-emerald-300">your contribution.</span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
              Manage all the lost and found posts you have shared with your
              campus community. Keep track of your posts and help belongings
              find their way home.
            </p>

            <Link
              to="/user-dashboard/create-new-post"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-xs font-extrabold text-[#10372d] shadow-lg shadow-black/10 transition hover:-translate-y-1 hover:bg-emerald-300"
            >
              <FaPlus />
              Create New Post
            </Link>
          </div>

          {/* Hero visual */}
          <div className="absolute bottom-5 right-12 hidden h-48 w-48 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] lg:flex">
            <div className="flex h-36 w-36 items-center justify-center rounded-full border border-dashed border-emerald-200/30">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/20 bg-white/10 text-5xl text-emerald-200 shadow-2xl backdrop-blur-xl">
                <FaBoxOpen />
              </div>
            </div>
          </div>
        </section>

        {/* ================= PAGE HEADING ================= */}
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-[10px] font-extrabold tracking-[2px] text-emerald-600">
              YOUR ACTIVITY
            </span>

            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#17342d] sm:text-3xl">
              Manage my posts
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              View, search and manage the items you have posted.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl border border-emerald-100 bg-white px-4 py-3 shadow-sm sm:self-auto">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <FaBoxOpen />
            </div>

            <div>
              <p className="text-lg font-extrabold leading-5 text-[#17342d]">
                {totalItems}
              </p>

              <p className="text-[10px] font-medium text-slate-400">
                Your total posts
              </p>
            </div>
          </div>
        </div>

        {/* ================= FILTER SECTION ================= */}
        <section className="mb-8 rounded-2xl border border-[#e8efeb] bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-extrabold text-[#29443a]">
                Filter your posts
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Find a specific lost or found item.
              </p>
            </div>

            <div className="flex w-full rounded-xl bg-[#f3f8f5] p-1 sm:w-auto">
              {[
                { label: "All Posts", value: "all" },
                { label: "Lost Items", value: "lost" },
                { label: "Found Items", value: "found" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => handleTypeChange(tab.value)}
                  className={`flex-1 rounded-lg px-3 py-3 text-xs font-bold transition duration-200 sm:flex-none sm:px-5 ${
                    activeType === tab.value
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/15"
                      : "text-slate-500 hover:bg-white hover:text-emerald-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_250px]">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-emerald-600" />

              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search your item name..."
                className="h-12 w-full rounded-xl border border-[#e5ece8] bg-[#fbfdfc] pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            {/* Category */}
            <div className="relative">
              <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-emerald-600" />

              <select
                value={category}
                onChange={handleCategoryChange}
                className="h-12 w-full appearance-none rounded-xl border border-[#e5ece8] bg-[#fbfdfc] pl-10 pr-4 text-xs font-semibold text-slate-600 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="">All Categories</option>

                {categories.map((itemCategory) => (
                  <option key={itemCategory} value={itemCategory}>
                    {formatCategory(itemCategory)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ================= RESULTS HEADING ================= */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-extrabold text-[#244238]">
              {activeType === "all"
                ? "All my posts"
                : activeType === "lost"
                  ? "My lost posts"
                  : "My found posts"}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Showing {items.length} of {totalItems} posts
            </p>
          </div>

          {isFetching && (
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
              Updating...
            </div>
          )}
        </div>

        {/* ================= ERROR STATE ================= */}
        {isError && (
          <div className="rounded-2xl border border-rose-100 bg-white px-6 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-2xl text-rose-500">
              <FaBoxOpen />
            </div>

            <h3 className="mt-4 font-bold text-slate-700">
              Couldn't load your posts
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              {error?.response?.data?.message ||
                "Something went wrong. Please try again."}
            </p>

            <button
              onClick={() => refetch()}
              className="mt-5 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white transition hover:bg-emerald-700"
            >
              Try again
            </button>
          </div>
        )}

        {/* ================= EMPTY STATE ================= */}
        {!isError && items.length === 0 && (
          <div className="rounded-2xl border border-[#e8efeb] bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-4xl text-emerald-500">
              <FaBoxOpen />
            </div>

            <h3 className="mt-6 text-xl font-extrabold text-[#29443a]">
              {search || category || activeType !== "all"
                ? "No matching posts"
                : "You haven't posted anything yet"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              {search || category || activeType !== "all"
                ? "We couldn't find any of your posts matching these filters. Try changing your search."
                : "Share a lost or found item with your campus community. Your post might help someone find their belongings."}
            </p>

            {search || category || activeType !== "all" ? (
              <button
                onClick={clearFilters}
                className="mt-6 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/15 transition hover:bg-emerald-700"
              >
                Clear all filters
              </button>
            ) : (
              <Link
                to="/user-dashboard/create-new-post"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/15 transition hover:bg-emerald-700"
              >
                <FaPlus />
                Create your first post
              </Link>
            )}
          </div>
        )}

        {/* ================= ITEM CARDS ================= */}
        {!isError && items.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <article
                key={item._id}
                className="group overflow-hidden rounded-2xl border border-[#e8efeb] bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/[0.07]"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden bg-[#edf5f0]">
                  {item.images?.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.itemName}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl text-emerald-300">
                      <FaImage />
                    </div>
                  )}

                  {/* Lost / Found badge */}
                  <div
                    className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide shadow-sm ${
                      item.type === "lost"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {item.type}
                  </div>

                  {/* Image count */}
                  {item.images?.length > 1 && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                      <FaImage />
                      {item.images.length} photos
                    </div>
                  )}
                </div>

                {/* Card content */}
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700">
                      {formatCategory(item.category)}
                    </span>

                    <span className="text-[10px] text-slate-400">
                      {formatDate(item.date)}
                    </span>
                  </div>

                  <h3 className="truncate text-base font-extrabold text-[#244238]">
                    {item.itemName}
                  </h3>

                  <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-400">
                    {item.description || "No description provided."}
                  </p>

                  {/* Location */}
                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                    <FaMapMarkerAlt className="shrink-0 text-emerald-500" />

                    <span className="truncate">
                      {item.location?.area || "Location not specified"}
                      {item.location?.specificLocation
                        ? `, ${item.location.specificLocation}`
                        : ""}
                    </span>
                  </div>

                  {/* Post information */}
                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400">
                        <FaCalendarAlt className="mr-1 inline text-emerald-500" />
                        Posted {formatDate(item.createdAt)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[9px] font-bold capitalize ${
                          item.postStatus === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.postStatus || "Unknown"}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[9px] font-bold capitalize ${
                          item.moderationStatus === "approved"
                            ? "bg-emerald-50 text-emerald-700"
                            : item.moderationStatus === "pending"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {item.moderationStatus || "Unknown"}
                      </span>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={deleteMutation.isPending}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50 py-3 text-xs font-bold text-rose-600 transition hover:border-rose-200 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaTrash />
                    Delete Post
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ================= PAGINATION ================= */}
        {!isError && totalPages > 1 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => {
                setPage((prev) => Math.max(1, prev - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex h-10 items-center gap-2 rounded-xl border border-[#e5ece8] bg-white px-4 text-xs font-bold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FaChevronLeft />
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (number) =>
                  number === 1 ||
                  number === totalPages ||
                  Math.abs(number - page) <= 1,
              )
              .map((number, index, array) => (
                <div key={number} className="flex items-center gap-2">
                  {index > 0 && array[index - 1] !== number - 1 && (
                    <span className="px-1 text-slate-400">...</span>
                  )}

                  <button
                    onClick={() => {
                      setPage(number);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`h-10 min-w-10 rounded-xl px-3 text-xs font-bold transition ${
                      page === number
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                        : "border border-[#e5ece8] bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                    }`}
                  >
                    {number}
                  </button>
                </div>
              ))}

            <button
              disabled={page >= totalPages}
              onClick={() => {
                setPage((prev) => Math.min(totalPages, prev + 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex h-10 items-center gap-2 rounded-xl border border-[#e5ece8] bg-white px-4 text-xs font-bold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <FaChevronRight />
            </button>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2 text-center text-[11px] text-slate-400">
          <FaHandHoldingHeart className="text-emerald-500" />
          Thank you for making your campus community better.
        </div>
      </div>
    </div>
  );
};

export default MyPosts;
