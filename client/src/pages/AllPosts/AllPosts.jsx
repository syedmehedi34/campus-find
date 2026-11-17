import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaTag,
  FaTimes,
  FaPhoneAlt,
  FaBoxOpen,
  FaRegFileAlt,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaFilter,
  FaImage,
  FaUser,
  FaHandHoldingHeart,
} from "react-icons/fa";

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

const AllPosts = () => {
  const location = useLocation();
  const showHero = location.pathname === "/posts";

  const { loggedInUser } = useUserData();
  const axiosPublic = useAxiosPublic();

  const [activeType, setActiveType] = useState("all");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [selectedItem, setSelectedItem] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  // Fetch all items
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: [
      "items",
      "list",
      loggedInUser?.userId,
      activeType,
      category,
      search,
      page,
    ],

    queryFn: async () => {
      const response = await axiosPublic.get("/items", {
        params: {
          userId: loggedInUser.userId,
          type: activeType === "all" ? undefined : activeType,
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

  const openModal = (item) => {
    setSelectedItem(item);
    setActiveImage(0);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setActiveImage(0);
  };

  const itemImages = selectedItem?.images || [];

  const currentImage = itemImages[activeImage] || itemImages[0] || "";

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-[#f5f8f6]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-500" />
        <p className="text-sm font-medium text-slate-500">
          Loading campus posts...
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
        {showHero && (
          <section className="relative mb-10 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#102b27] via-[#16463a] to-[#087d5d] px-6 py-10 shadow-xl shadow-emerald-950/10 sm:px-10 sm:py-12 lg:py-14">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-5 -top-20 h-64 w-64 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -bottom-40 right-1/4 h-80 w-80 rounded-full border border-emerald-200/10" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />

            <div className="relative z-10 max-w-2xl">
              <div className="mb-7 flex items-center gap-2 text-[11px] font-extrabold tracking-[2px] text-emerald-200">
                <span>LOSTHUB</span>
                <span className="text-white/40">/</span>
                <span className="text-white/70">EXPLORE POSTS</span>
              </div>

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-[11px] font-semibold text-emerald-100">
                <FaHandHoldingHeart />A COMMUNITY THAT CARES
              </div>

              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
                Lost something?
                <br />
                <span className="text-emerald-300">Found something?</span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
                Explore lost and found items from your university. You might
                find something you've been looking for, or help someone get
                their belongings back.
              </p>

              <div className="mt-7 flex flex-wrap gap-5 text-xs text-white/80">
                <div className="flex items-center gap-2">
                  <FaSearch className="text-emerald-300" />
                  Discover items
                </div>

                <div className="flex items-center gap-2">
                  <FaHandHoldingHeart className="text-emerald-300" />
                  Help students
                </div>

                <div className="flex items-center gap-2">
                  <FaBoxOpen className="text-emerald-300" />
                  Reunite belongings
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="absolute bottom-5 right-12 hidden h-48 w-48 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] lg:flex">
              <div className="flex h-36 w-36 items-center justify-center rounded-full border border-dashed border-emerald-200/30">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/20 bg-white/10 text-5xl text-emerald-200 shadow-2xl backdrop-blur-xl">
                  <FaSearch className="animate-pulse" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= PAGE HEADING ================= */}
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-[10px] font-extrabold tracking-[2px] text-emerald-600">
              CAMPUS COMMUNITY
            </span>

            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#17342d] sm:text-3xl">
              Explore all posts
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Find lost belongings or help return something to its owner.
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
                Total posts
              </p>
            </div>
          </div>
        </div>

        {/* ================= FILTER SECTION ================= */}
        <section className="mb-8 rounded-2xl border border-[#e8efeb] bg-white p-5 shadow-sm sm:p-6">
          {/* Type tabs */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-extrabold text-[#29443a]">
                Browse by type
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Choose what you're looking for.
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
                placeholder="Search by item name..."
                className="h-12 w-full rounded-xl border border-[#e5ece8] bg-[#fbfdfc] pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />

              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-rose-500"
                >
                  <FaTimes />
                </button>
              )}
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
                ? "All items"
                : activeType === "lost"
                  ? "Lost items"
                  : "Found items"}
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
              <FaRegFileAlt />
            </div>

            <h3 className="mt-4 font-bold text-slate-700">
              Couldn't load posts
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
              <FaSearch />
            </div>

            <h3 className="mt-6 text-xl font-extrabold text-[#29443a]">
              No items found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              We couldn't find any posts matching your search. Try changing the
              filters or search for something else.
            </p>

            <button
              onClick={() => {
                setActiveType("all");
                setCategory("");
                setSearch("");
                setPage(1);
              }}
              className="mt-6 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/15 transition hover:-translate-y-1 hover:bg-emerald-700"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* ================= ITEM CARDS ================= */}
        {!isError && items.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <article
                key={item._id}
                onClick={() => openModal(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openModal(item);
                  }
                }}
                role="button"
                tabIndex={0}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-[#e8efeb] bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/[0.07]"
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
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        item.type === "lost" ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                    />
                    {item.type}
                  </div>

                  {/* Image count */}
                  {item.images?.length > 1 && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                      <FaImage />
                      {item.images.length} photos
                    </div>
                  )}

                  {/* View overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-emerald-950/0 transition duration-300 group-hover:bg-emerald-950/25">
                    <span className="translate-y-3 rounded-full bg-white px-4 py-2 text-xs font-bold text-emerald-700 opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <FaEye className="mr-2 inline" />
                      View details
                    </span>
                  </div>
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

                  <h3 className="truncate text-base font-extrabold text-[#244238] transition group-hover:text-emerald-700">
                    {item.itemName}
                  </h3>

                  <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-400">
                    {item.description || "No description provided."}
                  </p>

                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FaMapMarkerAlt className="shrink-0 text-emerald-500" />
                      <span className="truncate">
                        {item.location?.area || "Location not specified"}
                        {item.location?.specificLocation
                          ? `, ${item.location.specificLocation}`
                          : ""}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] font-medium text-slate-400">
                        <FaCalendarAlt className="mr-1 inline text-emerald-500" />
                        {formatDate(item.createdAt)}
                      </span>

                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 transition group-hover:gap-2">
                        Details <FaChevronRight className="text-[9px]" />
                      </span>
                    </div>
                  </div>
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
          Together, we make our campus a better place.
        </div>
      </div>

      {/* =====================================================
          ITEM DETAILS MODAL
      ====================================================== */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6"
          onClick={closeModal}
        >
          <div
            className="relative my-auto w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="relative flex items-center justify-between gap-4 overflow-hidden bg-gradient-to-r from-[#102b27] to-[#087d5d] px-5 py-5 sm:px-8">
              <div className="pointer-events-none absolute -right-10 -top-24 h-48 w-48 rounded-full border border-white/10" />

              <div className="relative z-10">
                <div className="mb-1 text-[9px] font-extrabold tracking-[2px] text-emerald-200">
                  LOSTHUB / ITEM DETAILS
                </div>

                <h2 className="text-lg font-extrabold text-white sm:text-xl">
                  Item information
                </h2>
              </div>

              <button
                onClick={closeModal}
                className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:rotate-90 hover:bg-white/20"
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal body */}
            <div className="grid max-h-[calc(100vh-120px)] overflow-y-auto lg:grid-cols-2">
              {/* Left: Image gallery */}
              <div className="bg-[#f3f8f5] p-5 sm:p-7">
                <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-[#e5eee8] sm:h-80 lg:h-[390px]">
                  {currentImage ? (
                    <img
                      src={currentImage}
                      alt={selectedItem.itemName}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-emerald-400">
                      <FaImage className="text-6xl" />
                      <span className="text-xs font-medium">
                        No image available
                      </span>
                    </div>
                  )}

                  <span
                    className={`absolute left-4 top-4 rounded-full px-4 py-2 text-[10px] font-extrabold uppercase tracking-wide ${
                      selectedItem.type === "lost"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {selectedItem.type} item
                  </span>

                  {itemImages.length > 1 && (
                    <span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-sm">
                      {activeImage + 1} / {itemImages.length}
                    </span>
                  )}
                </div>

                {/* Thumbnails */}
                {itemImages.length > 1 && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {itemImages.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        onClick={() => setActiveImage(index)}
                        className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition ${
                          activeImage === index
                            ? "border-emerald-500 ring-2 ring-emerald-500/15"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Item image ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Image count */}
                <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
                  <FaImage className="text-emerald-600" />
                  {itemImages.length} image(s) uploaded
                </div>
              </div>

              {/* Right: Details */}
              <div className="p-5 sm:p-8">
                <div className="mb-5">
                  <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700">
                    {formatCategory(selectedItem.category)}
                  </span>

                  <h2 className="mt-4 text-2xl font-extrabold leading-tight text-[#19372e] sm:text-3xl">
                    {selectedItem.itemName}
                  </h2>

                  <p className="mt-2 text-xs text-slate-400">
                    Posted on {formatDate(selectedItem.createdAt)}
                  </p>
                </div>

                {/* Description */}
                <div className="rounded-2xl border border-[#e8efeb] bg-[#fbfdfc] p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-extrabold text-[#29443a]">
                    <FaRegFileAlt className="text-emerald-600" />
                    Description
                  </h3>

                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-500">
                    {selectedItem.description || "No description provided."}
                  </p>
                </div>

                {/* Information grid */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-emerald-50/70 p-4">
                    <FaMapMarkerAlt className="mb-2 text-emerald-600" />
                    <p className="text-[10px] font-semibold text-slate-400">
                      Campus area
                    </p>
                    <p className="mt-1 break-words text-xs font-bold text-[#29443a]">
                      {selectedItem.location?.area || "Not specified"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-emerald-50/70 p-4">
                    <FaMapMarkerAlt className="mb-2 text-emerald-600" />
                    <p className="text-[10px] font-semibold text-slate-400">
                      Specific location
                    </p>
                    <p className="mt-1 break-words text-xs font-bold text-[#29443a]">
                      {selectedItem.location?.specificLocation ||
                        "Not specified"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-emerald-50/70 p-4">
                    <FaCalendarAlt className="mb-2 text-emerald-600" />
                    <p className="text-[10px] font-semibold text-slate-400">
                      Date
                    </p>
                    <p className="mt-1 text-xs font-bold text-[#29443a]">
                      {formatDate(selectedItem.date)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-emerald-50/70 p-4">
                    <FaClock className="mb-2 text-emerald-600" />
                    <p className="text-[10px] font-semibold text-slate-400">
                      Approximate time
                    </p>
                    <p className="mt-1 text-xs font-bold text-[#29443a]">
                      {selectedItem.approximateTime || "Not specified"}
                    </p>
                  </div>
                </div>

                {/* Identifying features */}
                {selectedItem.identifyingFeatures && (
                  <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50/70 p-4">
                    <h3 className="mb-2 flex items-center gap-2 text-xs font-extrabold text-amber-800">
                      <FaTag />
                      Identifying features
                    </h3>

                    <p className="whitespace-pre-wrap text-xs leading-6 text-amber-900/70">
                      {selectedItem.identifyingFeatures}
                    </p>
                  </div>
                )}

                {/* Contact */}
                <div className="mt-5 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5">
                  <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#244238]">
                    <FaPhoneAlt className="text-emerald-600" />
                    Contact information
                  </h3>

                  {selectedItem.contactPreference ? (
                    <a
                      href={`tel:${selectedItem.contactPreference}`}
                      className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-white px-4 py-3 transition hover:border-emerald-400 hover:shadow-sm"
                    >
                      <div>
                        <p className="text-[10px] text-slate-400">
                          Contact number
                        </p>
                        <p className="mt-1 text-sm font-bold text-emerald-700">
                          {selectedItem.contactPreference}
                        </p>
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                        <FaPhoneAlt />
                      </div>
                    </a>
                  ) : (
                    <p className="mt-3 text-xs text-slate-500">
                      No contact number provided.
                    </p>
                  )}
                </div>

                {/* Close button */}
                <button
                  onClick={closeModal}
                  className="mt-6 w-full rounded-xl border border-[#e5ece8] bg-white py-3.5 text-xs font-bold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  Close details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllPosts;
