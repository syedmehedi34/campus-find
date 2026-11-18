import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
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
  FaImage,
  FaHandHoldingHeart,
  FaPlus,
  FaArrowRight,
} from "react-icons/fa";

import useUserData from "../../hooks/useUserData";
import useAxiosPublic from "../../hooks/useAxiosPublic";

const display = "font-['Bricolage_Grotesque',sans-serif]";

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

const typeStyle = (type) =>
  type === "lost"
    ? {
        badge: "bg-orange-500 text-white",
        soft: "bg-orange-50 text-orange-700",
        dot: "bg-orange-500",
      }
    : {
        badge: "bg-emerald-500 text-white",
        soft: "bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
      };

const tabs = [
  { label: "All posts", value: "all" },
  { label: "Lost", value: "lost" },
  { label: "Found", value: "found" },
];

/* ---------- small sample cards for the hero ---------- */
const heroCards = [
  {
    emoji: "🪪",
    title: "Student ID Card",
    tag: "Lost",
    place: "Library",
    cls: "border-orange-200 shadow-orange-200/60",
    badge: "bg-orange-500",
    pos: "left-0 top-2 rotate-[-6deg]",
    d: 0,
  },
  {
    emoji: "🧮",
    title: "Calculator",
    tag: "Found",
    place: "CSE Building",
    cls: "border-emerald-200 shadow-emerald-200/60",
    badge: "bg-emerald-500",
    pos: "right-0 top-24 rotate-[5deg]",
    d: 0.6,
  },
  {
    emoji: "☂️",
    title: "Black Umbrella",
    tag: "Found",
    place: "Cafeteria",
    cls: "border-indigo-200 shadow-indigo-200/60",
    badge: "bg-emerald-500",
    pos: "left-10 bottom-0 rotate-[3deg]",
    d: 1.2,
  },
];

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
  const handleCategoryChange = (value) => {
    setCategory(value);
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
  const goToPage = (n) => {
    setPage(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const itemImages = selectedItem?.images || [];
  const currentImage = itemImages[activeImage] || itemImages[0] || "";

  // lock body scroll + Escape to close modal
  useEffect(() => {
    if (!selectedItem) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [selectedItem]);

  const shell =
    "relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-indigo-50/40 px-4 py-8 text-slate-800 sm:px-6 lg:py-10";

  /* ---------- Loading skeleton ---------- */
  if (isLoading) {
    return (
      <div className={shell}>
        <div className="mx-auto max-w-7xl">
          <div className="h-56 animate-pulse rounded-[2rem] bg-slate-200/70" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-3xl border border-slate-100 bg-white"
              >
                <div className="h-52 animate-pulse bg-slate-200/70" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
                  <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={shell}>
      {/* background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage: "radial-gradient(#c7d2fe 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px",
          maskImage: "linear-gradient(to bottom, black, transparent 45%)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent 45%)",
        }}
      />
      <div className="pointer-events-none absolute -left-32 top-24 h-80 w-80 rounded-full bg-blue-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-[500px] h-96 w-96 rounded-full bg-fuchsia-300/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* ================= HERO ================= */}
        {showHero && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative mb-10 overflow-hidden rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-violet-100/70 px-6 py-10 shadow-2xl shadow-indigo-200/40 sm:px-10 sm:py-14"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-2 border-dashed border-indigo-200"
            />
            <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-fuchsia-200/40 blur-3xl" />

            <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm">
                  <FaHandHoldingHeart /> A community that cares
                </span>

                <h1
                  className={`${display} mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-6xl`}
                >
                  Everything lost and found{" "}
                  <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                    on your campus.
                  </span>
                </h1>

                <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
                  Browse posts from students at your university. You might spot
                  what you’ve been looking for, or help someone get their
                  belongings back.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.04, y: -3 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Link
                      to="/create-post"
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-300 transition hover:bg-indigo-700"
                    >
                      <FaPlus /> Report an item
                    </Link>
                  </motion.div>
                  <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-white px-4 py-2.5 shadow-sm">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <FaBoxOpen />
                    </span>
                    <div>
                      <p
                        className={`${display} text-xl font-extrabold leading-5 text-slate-900`}
                      >
                        {totalItems}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Posts on your campus
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* floating sample cards */}
              <div className="relative mx-auto hidden h-72 w-full max-w-sm lg:block">
                {heroCards.map((c) => (
                  <motion.div
                    key={c.title}
                    animate={{ y: [0, -12, 0] }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: c.d,
                    }}
                    className={`absolute ${c.pos} w-52 rounded-2xl border bg-white p-3.5 shadow-xl ${c.cls}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-2xl">
                        {c.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-800">
                          {c.title}
                        </p>
                        <p className="flex items-center gap-1 text-[11px] text-slate-500">
                          <FaMapMarkerAlt className="text-[9px]" /> {c.place}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${c.badge}`}
                      >
                        {c.tag}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* ================= HEADING ================= */}
        {!showHero && (
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <h2
                className={`${display} text-3xl font-extrabold tracking-tight text-slate-900`}
              >
                Explore all posts
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Find lost belongings or help return something to its owner.
              </p>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-white px-4 py-2.5 text-center shadow-sm">
              <p
                className={`${display} text-xl font-extrabold text-indigo-600`}
              >
                {totalItems}
              </p>
              <p className="text-[11px] text-slate-500">Total posts</p>
            </div>
          </div>
        )}

        {/* ================= FILTERS ================= */}
        <section className="sticky top-24 z-30 mb-8 rounded-3xl border border-white/80 bg-white/85 p-4 shadow-xl shadow-indigo-100/60 backdrop-blur-xl sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* type tabs with sliding pill */}
            <div className="flex w-full rounded-2xl bg-slate-100 p-1 lg:w-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => handleTypeChange(tab.value)}
                  className="relative flex-1 rounded-xl px-5 py-2.5 text-sm font-bold lg:flex-none"
                >
                  {activeType === tab.value && (
                    <motion.span
                      layoutId="type-pill"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 32,
                      }}
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md shadow-indigo-300/60"
                    />
                  )}
                  <span
                    className={`relative ${activeType === tab.value ? "text-white" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>

            {/* search */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-indigo-500" />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by item name..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-rose-500"
                  aria-label="Clear search"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {/* category chips */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {["", ...categories].map((c) => (
              <button
                key={c || "all"}
                onClick={() => handleCategoryChange(c)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                  category === c
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                {c ? formatCategory(c) : "All categories"}
              </button>
            ))}
          </div>
        </section>

        {/* ================= RESULTS HEADING ================= */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className={`${display} text-xl font-extrabold text-slate-900`}>
              {activeType === "all"
                ? "All items"
                : activeType === "lost"
                  ? "Lost items"
                  : "Found items"}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Showing {items.length} of {totalItems} posts
            </p>
          </div>
          {isFetching && (
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
              Updating...
            </div>
          )}
        </div>

        {/* ================= ERROR ================= */}
        {isError && (
          <div className="rounded-3xl border border-rose-100 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-2xl text-rose-500">
              <FaRegFileAlt />
            </div>
            <h3 className="mt-5 text-lg font-bold text-slate-800">
              Couldn’t load posts
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {error?.response?.data?.message ||
                "Something went wrong. Please try again."}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-6 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              Try again
            </button>
          </div>
        )}

        {/* ================= EMPTY ================= */}
        {!isError && items.length === 0 && (
          <div className="rounded-3xl border border-slate-100 bg-white px-6 py-16 text-center shadow-sm">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-50 to-violet-100 text-4xl text-indigo-500"
            >
              <FaSearch />
            </motion.div>
            <h3
              className={`${display} mt-6 text-2xl font-extrabold text-slate-900`}
            >
              No items found
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              No posts match your search. Try changing the filters or search for
              something else.
            </p>
            <button
              onClick={() => {
                setActiveType("all");
                setCategory("");
                setSearch("");
                setPage(1);
              }}
              className="mt-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-300/60 transition hover:-translate-y-1"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* ================= CARDS ================= */}
        {!isError && items.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item, i) => {
              const s = typeStyle(item.type);
              return (
                <motion.article
                  key={item._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: Math.min(i, 8) * 0.05,
                    ease: "easeOut",
                  }}
                  onClick={() => openModal(item)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openModal(item);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg shadow-slate-200/50 transition duration-300 hover:-translate-y-2 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-200/60 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
                >
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    {item.images?.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.itemName}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-100 text-5xl text-indigo-300">
                        <FaImage />
                      </div>
                    )}

                    <div
                      className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold capitalize shadow-lg ${s.badge}`}
                    >
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                      {item.type}
                    </div>

                    {item.images?.length > 1 && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                        <FaImage /> {item.images.length}
                      </div>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center bg-indigo-950/0 transition duration-300 group-hover:bg-indigo-950/30">
                      <span className="translate-y-3 rounded-full bg-white px-4 py-2 text-xs font-bold text-indigo-700 opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <FaEye className="mr-2 inline" />
                        View details
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
                        {formatCategory(item.category)}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(item.date)}
                      </span>
                    </div>

                    <h3
                      className={`${display} truncate text-lg font-extrabold text-slate-900 transition group-hover:text-indigo-700`}
                    >
                      {item.itemName}
                    </h3>

                    <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
                      {item.description || "No description provided."}
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <div className="flex min-w-0 items-center gap-2 text-xs text-slate-600">
                        <FaMapMarkerAlt className="shrink-0 text-indigo-500" />
                        <span className="truncate">
                          {item.location?.area || "Location not specified"}
                          {item.location?.specificLocation
                            ? `, ${item.location.specificLocation}`
                            : ""}
                        </span>
                      </div>
                      <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-indigo-600 transition-all group-hover:gap-2">
                        Details <FaChevronRight className="text-[9px]" />
                      </span>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        {/* ================= PAGINATION ================= */}
        {!isError && totalPages > 1 && (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => goToPage(Math.max(1, page - 1))}
              className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FaChevronLeft /> Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1,
              )
              .map((n, index, array) => (
                <div key={n} className="flex items-center gap-2">
                  {index > 0 && array[index - 1] !== n - 1 && (
                    <span className="px-1 text-slate-400">...</span>
                  )}
                  <button
                    onClick={() => goToPage(n)}
                    className={`h-11 min-w-11 rounded-xl px-3 text-xs font-bold transition ${
                      page === n
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-300/60"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-700"
                    }`}
                  >
                    {n}
                  </button>
                </div>
              ))}

            <button
              disabled={page >= totalPages}
              onClick={() => goToPage(Math.min(totalPages, page + 1))}
              className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next <FaChevronRight />
            </button>
          </div>
        )}

        <div className="mt-14 flex flex-wrap items-center justify-center gap-2 text-center text-xs text-slate-400">
          <FaHandHoldingHeart className="text-indigo-400" />
          Together, we make our campus a better place.
        </div>
      </div>

      {/* =====================================================
          ITEM DETAILS MODAL
      ====================================================== */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-md sm:p-6"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="relative my-auto w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* header */}
              <div className="relative flex items-center justify-between gap-4 overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 py-5 sm:px-8">
                <div className="pointer-events-none absolute -right-10 -top-24 h-48 w-48 rounded-full border border-white/20" />
                <div className="relative">
                  <p className="text-xs font-semibold text-indigo-100">
                    CampusFind
                  </p>
                  <h2
                    className={`${display} text-xl font-extrabold text-white sm:text-2xl`}
                  >
                    Item information
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white transition hover:rotate-90 hover:bg-white/25"
                  aria-label="Close modal"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="grid max-h-[calc(100vh-130px)] overflow-y-auto lg:grid-cols-2">
                {/* gallery */}
                <div className="bg-slate-50 p-5 sm:p-7">
                  <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-3xl bg-slate-100 sm:h-80 lg:h-[390px]">
                    <AnimatePresence mode="wait">
                      {currentImage ? (
                        <motion.img
                          key={currentImage}
                          initial={{ opacity: 0, scale: 1.04 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          src={currentImage}
                          alt={selectedItem.itemName}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-indigo-300">
                          <FaImage className="text-6xl" />
                          <span className="text-xs font-medium">
                            No image available
                          </span>
                        </div>
                      )}
                    </AnimatePresence>

                    <span
                      className={`absolute left-4 top-4 rounded-full px-4 py-2 text-[11px] font-extrabold capitalize shadow-lg ${typeStyle(selectedItem.type).badge}`}
                    >
                      {selectedItem.type} item
                    </span>

                    {itemImages.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setActiveImage(
                              (i) =>
                                (i - 1 + itemImages.length) % itemImages.length,
                            )
                          }
                          className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg transition hover:bg-white hover:text-indigo-600"
                          aria-label="Previous image"
                        >
                          <FaChevronLeft />
                        </button>
                        <button
                          onClick={() =>
                            setActiveImage((i) => (i + 1) % itemImages.length)
                          }
                          className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg transition hover:bg-white hover:text-indigo-600"
                          aria-label="Next image"
                        >
                          <FaChevronRight />
                        </button>
                        <span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-sm">
                          {activeImage + 1} / {itemImages.length}
                        </span>
                      </>
                    )}
                  </div>

                  {itemImages.length > 1 && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {itemImages.map((image, index) => (
                        <button
                          key={`${image}-${index}`}
                          onClick={() => setActiveImage(index)}
                          className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition ${
                            activeImage === index
                              ? "border-indigo-500 ring-4 ring-indigo-500/15"
                              : "border-transparent opacity-60 hover:opacity-100"
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

                  <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
                    <FaImage className="text-indigo-500" />
                    {itemImages.length} image(s) uploaded
                  </div>
                </div>

                {/* details */}
                <div className="p-5 sm:p-8">
                  <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-[11px] font-bold text-indigo-700">
                    {formatCategory(selectedItem.category)}
                  </span>
                  <h2
                    className={`${display} mt-4 text-3xl font-extrabold leading-tight text-slate-900`}
                  >
                    {selectedItem.itemName}
                  </h2>
                  <p className="mt-2 text-xs text-slate-400">
                    Posted on {formatDate(selectedItem.createdAt)}
                  </p>

                  <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <h3 className="mb-2 flex items-center gap-2 text-xs font-extrabold text-slate-700">
                      <FaRegFileAlt className="text-indigo-500" /> Description
                    </h3>
                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                      {selectedItem.description || "No description provided."}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {[
                      {
                        icon: FaMapMarkerAlt,
                        label: "Campus area",
                        value: selectedItem.location?.area,
                      },
                      {
                        icon: FaMapMarkerAlt,
                        label: "Specific location",
                        value: selectedItem.location?.specificLocation,
                      },
                      {
                        icon: FaCalendarAlt,
                        label: "Date",
                        value: selectedItem.date
                          ? formatDate(selectedItem.date)
                          : "",
                      },
                      {
                        icon: FaClock,
                        label: "Approximate time",
                        value: selectedItem.approximateTime,
                      },
                    ].map((info) => (
                      <div
                        key={info.label}
                        className="rounded-2xl bg-indigo-50/60 p-4"
                      >
                        <info.icon className="mb-2 text-indigo-500" />
                        <p className="text-[11px] font-semibold text-slate-400">
                          {info.label}
                        </p>
                        <p className="mt-1 break-words text-sm font-bold text-slate-800">
                          {info.value || "Not specified"}
                        </p>
                      </div>
                    ))}
                  </div>

                  {selectedItem.identifyingFeatures && (
                    <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                      <h3 className="mb-2 flex items-center gap-2 text-xs font-extrabold text-amber-800">
                        <FaTag /> Identifying features
                      </h3>
                      <p className="whitespace-pre-wrap text-xs leading-6 text-amber-900/70">
                        {selectedItem.identifyingFeatures}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5">
                    <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
                      <FaPhoneAlt className="text-indigo-600" /> Contact
                      information
                    </h3>
                    {selectedItem.contactPreference ? (
                      <a
                        href={`tel:${selectedItem.contactPreference}`}
                        className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-white px-4 py-3 transition hover:border-indigo-400 hover:shadow-md"
                      >
                        <div>
                          <p className="text-[11px] text-slate-400">
                            Contact number
                          </p>
                          <p className="mt-0.5 text-sm font-bold text-indigo-700">
                            {selectedItem.contactPreference}
                          </p>
                        </div>
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
                          <FaPhoneAlt />
                        </span>
                      </a>
                    ) : (
                      <p className="mt-3 text-xs text-slate-500">
                        No contact number provided.
                      </p>
                    )}
                  </div>

                  <button
                    onClick={closeModal}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    Close details <FaArrowRight className="text-xs" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllPosts;
