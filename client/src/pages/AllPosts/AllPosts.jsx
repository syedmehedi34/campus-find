import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "react-router";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaTag,
  FaTimes,
  FaPhoneAlt,
  FaRegFileAlt,
  FaChevronLeft,
  FaChevronRight,
  FaImage,
  FaHandHoldingHeart,
  FaPlus,
  FaArrowRight,
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

const tabs = [
  { label: "All posts", value: "all" },
  { label: "Lost", value: "lost" },
  { label: "Found", value: "found" },
];

// =====================================
//              HELPERS
// =====================================

const formatDate = (date) => {
  if (!date) return "Not specified";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;
  return parsedDate.toLocaleDateString("en-GB", {
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

const TYPE_STYLE = {
  lost: "bg-rose-50 text-rose-700 ring-rose-600/15",
  found: "bg-teal-50 text-teal-700 ring-teal-600/15",
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

const Badge = ({ className = "", children }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ring-inset ${className}`}
  >
    {children}
  </span>
);

const Thumb = ({ item, size = 46 }) => (
  <div
    style={{ width: size, height: size }}
    className="flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10 text-white/40"
  >
    {item.images?.[0] ? (
      <img src={item.images[0]} alt="" className="h-full w-full object-cover" />
    ) : (
      <FaImage />
    )}
  </div>
);

// =====================================
//              MAIN PAGE
// =====================================

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

  const totalCount = useCountUp(totalItems);

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
  const clearAllFilters = () => {
    setActiveType("all");
    setCategory("");
    setSearch("");
    setPage(1);
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

  const shell = "cf-root min-h-screen bg-[#f3f7f5] px-4 py-7 md:px-6";

  /* ---------- Loading skeleton ---------- */
  if (isLoading) {
    return (
      <div className={shell}>
        <style>{styles}</style>
        <div className="mx-auto max-w-7xl">
          <div className="cf-shimmer h-12 w-72 rounded-xl" />
          <div className="cf-shimmer mt-6 h-20 rounded-[22px]" />
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="cf-shimmer h-80 rounded-[22px]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={shell}>
      <style>{styles}</style>

      <div className="mx-auto max-w-7xl">
        {/* ================= HERO (public route only) ================= */}
        {showHero ? (
          <section className="cf-rise relative mb-8 overflow-hidden rounded-[28px] bg-[#0b2a26] p-6 text-white md:p-10">
            <div className="cf-drift pointer-events-none absolute -right-24 -top-32 h-[380px] w-[380px] rounded-full bg-[#1c8f6b]/30 blur-3xl" />
            <div
              className="cf-drift pointer-events-none absolute -bottom-40 left-1/4 h-[320px] w-[320px] rounded-full bg-[#f5a524]/10 blur-3xl"
              style={{ animationDelay: "-6s" }}
            />

            <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <p className="flex items-center gap-2 text-sm text-[#9fc9bd]">
                  <FaHandHoldingHeart />A community that cares
                </p>

                <h1 className="cf-display mt-4 text-4xl font-extrabold leading-[1.08] sm:text-5xl md:text-[56px]">
                  Everything lost and found on your campus.
                </h1>

                <p className="mt-5 max-w-xl text-base leading-7 text-[#c4e0d8]">
                  Browse posts from students at your university. You might spot
                  what you&apos;ve been looking for, or help someone get their
                  belongings back.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-6">
                  <Link
                    to="/create-post"
                    className="inline-flex h-12 items-center gap-2 rounded-full bg-[#3ddc97] px-7 text-sm font-semibold text-[#0b2a26] transition hover:bg-[#5ae6a9]"
                  >
                    <FaPlus size={12} /> Report an item
                  </Link>

                  <div className="flex items-end gap-2">
                    <span className="cf-display text-5xl font-extrabold leading-none">
                      {totalCount}
                    </span>
                    <span className="mb-1 text-sm text-[#9fc9bd]">
                      posts on
                      <br />
                      your campus
                    </span>
                  </div>
                </div>
              </div>

              {/* Latest posts (real data) */}
              <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10 backdrop-blur-sm md:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="cf-display text-lg font-semibold">
                    Latest on campus
                  </h2>
                  <span className="flex items-center gap-2 text-xs text-[#9fc9bd]">
                    <span className="cf-live h-2 w-2 rounded-full bg-[#2fc785]" />
                    Live
                  </span>
                </div>

                {items.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/15 px-4 py-10 text-center text-sm text-[#9fc9bd]">
                    No posts to show yet.
                  </div>
                ) : (
                  <ul className="space-y-2.5">
                    {items.slice(0, 3).map((p) => (
                      <li key={p._id}>
                        <button
                          onClick={() => openModal(p)}
                          className="flex w-full items-center gap-3 rounded-xl bg-white/[0.07] p-3 text-left transition hover:bg-white/[0.12]"
                        >
                          <Thumb item={p} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">
                              {p.itemName}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-[#9fc9bd]">
                              {p.type === "lost" ? "Lost" : "Found"} at{" "}
                              {p.location?.area || "campus"}
                            </p>
                          </div>
                          <FaChevronRight
                            size={11}
                            className="shrink-0 text-[#9fc9bd]"
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        ) : (
          <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="cf-display text-3xl font-bold text-[#10312c] md:text-[40px] md:leading-[1.1]">
                Explore all posts
              </h1>
              <p className="mt-2 text-[15px] text-[#6d837d]">
                Find lost belongings or help return something to its owner.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-[#dbe7e3] bg-white px-4 py-2 text-[13px] text-[#6d837d]">
                <span className="cf-live h-2 w-2 rounded-full bg-[#2fc785]" />
                {totalItems} posts
              </div>
              <Link
                to="/create-post"
                className="hidden h-10 items-center gap-2 rounded-full bg-[#0d9467] px-5 text-[13px] font-semibold text-white transition hover:bg-[#0b7f58] sm:flex"
              >
                <FaPlus size={11} /> Report an item
              </Link>
            </div>
          </header>
        )}

        {/* ================= FILTERS ================= */}
        <section className="sticky top-24 z-30 mb-6 rounded-[22px] border border-[#e3ebe8] bg-white/95 p-4 backdrop-blur md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* type tabs */}
            <div className="flex w-full gap-2 lg:w-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => handleTypeChange(tab.value)}
                  aria-pressed={activeType === tab.value}
                  className={`flex-1 rounded-full px-5 py-2.5 text-[13px] font-semibold transition lg:flex-none ${
                    activeType === tab.value
                      ? "bg-[#0b2a26] text-white"
                      : "bg-[#f3f7f5] text-[#6d837d] hover:bg-[#e8f6ef] hover:text-[#0d7a55]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* search */}
            <div className="relative flex-1">
              <FaSearch
                size={13}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#93a7a2]"
              />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by item name"
                className="h-11 w-full rounded-full border border-[#dbe7e3] bg-white pl-10 pr-10 text-sm text-[#10312c] outline-none transition placeholder:text-[#a4b4b0] focus:border-[#0d9467] focus:ring-4 focus:ring-[#0d9467]/10"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#93a7a2] transition hover:text-rose-500"
                  aria-label="Clear search"
                >
                  <FaTimes size={12} />
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
                aria-pressed={category === c}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                  category === c
                    ? "bg-[#0d9467] text-white"
                    : "border border-[#dbe7e3] bg-white text-[#3c5a53] hover:bg-[#e8f6ef] hover:text-[#0d7a55]"
                }`}
              >
                {c ? formatCategory(c) : "All categories"}
              </button>
            ))}
          </div>
        </section>

        {/* ================= RESULTS HEADING ================= */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
          <div>
            <h2 className="cf-display text-lg font-semibold text-[#10312c]">
              {activeType === "all"
                ? "All items"
                : activeType === "lost"
                  ? "Lost items"
                  : "Found items"}
            </h2>
            <p className="mt-0.5 text-[13px] text-[#7a8f8a]">
              Showing {items.length} of {totalItems} posts
            </p>
          </div>
          {isFetching && (
            <div className="flex items-center gap-2 text-xs font-medium text-[#0d9467]">
              <span className="cf-spin h-3.5 w-3.5 rounded-full border-2 border-[#bfe6d6] border-t-[#0d9467]" />
              Updating
            </div>
          )}
        </div>

        {/* ================= ERROR ================= */}
        {isError && (
          <div className="rounded-[22px] border border-[#e3ebe8] bg-white px-6 py-14 text-center">
            <FaRegFileAlt className="mx-auto text-3xl text-rose-400" />
            <h3 className="cf-display mt-4 text-lg font-semibold text-[#10312c]">
              Couldn&apos;t load posts
            </h3>
            <p className="mt-1 text-sm text-[#7a8f8a]">
              {error?.response?.data?.message ||
                "Something went wrong. Please try again."}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-5 rounded-full bg-[#0d9467] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b7f58]"
            >
              Try again
            </button>
          </div>
        )}

        {/* ================= EMPTY ================= */}
        {!isError && items.length === 0 && (
          <div className="rounded-[22px] border border-dashed border-[#d5e2de] bg-white px-6 py-16 text-center">
            <FaSearch className="mx-auto text-3xl text-[#9ab0aa]" />
            <h3 className="cf-display mt-4 text-xl font-semibold text-[#10312c]">
              No items found
            </h3>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#7a8f8a]">
              No posts match your search. Try changing the filters or search for
              something else.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-5 rounded-full bg-[#e8f6ef] px-6 py-2.5 text-sm font-semibold text-[#0d7a55] transition hover:bg-[#d5efe3]"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* ================= CARDS ================= */}
        {!isError && items.length > 0 && (
          <div
            className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
              isFetching ? "opacity-70" : ""
            }`}
          >
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
                className="group flex cursor-pointer flex-col overflow-hidden rounded-[22px] border border-[#e3ebe8] bg-white transition hover:border-[#bfd9d0] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0d9467]/20"
              >
                <div className="relative h-48 overflow-hidden bg-[#eef4f2]">
                  {item.images?.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.itemName}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl text-[#c3d3cf]">
                      <FaImage />
                    </div>
                  )}

                  <Badge
                    className={`absolute left-3 top-3 backdrop-blur-sm ${TYPE_STYLE[item.type] || ""}`}
                  >
                    {item.type}
                  </Badge>

                  {item.images?.length > 1 && (
                    <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                      <FaImage /> {item.images.length}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#0d7a55]">
                      {formatCategory(item.category)}
                    </span>
                    <span className="text-[11px] text-[#8ea19c]">
                      {formatDate(item.date)}
                    </span>
                  </div>

                  <h3 className="cf-display truncate text-[17px] font-semibold text-[#10312c]">
                    {item.itemName}
                  </h3>

                  <p className="mt-1.5 line-clamp-2 min-h-10 text-[13px] leading-5 text-[#7a8f8a]">
                    {item.description || "No description provided."}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#edf2f0] pt-4">
                    <div className="mt-4 flex min-w-0 items-center gap-2 text-xs text-[#3c5a53]">
                      <FaMapMarkerAlt className="shrink-0 text-[#0d9467]" />
                      <span className="truncate">
                        {item.location?.area || "Location not specified"}
                        {item.location?.specificLocation
                          ? `, ${item.location.specificLocation}`
                          : ""}
                      </span>
                    </div>
                    <span className="mt-4 flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-[#0d9467] transition-all group-hover:gap-2.5">
                      Details <FaArrowRight size={10} />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ================= PAGINATION ================= */}
        {!isError && totalPages > 1 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => goToPage(Math.max(1, page - 1))}
              className="flex h-10 items-center gap-2 rounded-full border border-[#dbe7e3] bg-white px-4 text-xs font-semibold text-[#3c5a53] transition hover:bg-[#e8f6ef] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FaChevronLeft size={10} /> Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1,
              )
              .map((n, index, array) => (
                <div key={n} className="flex items-center gap-1.5">
                  {index > 0 && array[index - 1] !== n - 1 && (
                    <span className="px-1 text-[#9ab0aa]">...</span>
                  )}
                  <button
                    onClick={() => goToPage(n)}
                    className={`h-10 min-w-10 rounded-full px-3 text-xs font-semibold transition ${
                      page === n
                        ? "bg-[#0b2a26] text-white"
                        : "text-[#6d837d] hover:bg-[#e8f6ef] hover:text-[#0d9467]"
                    }`}
                  >
                    {n}
                  </button>
                </div>
              ))}

            <button
              disabled={page >= totalPages}
              onClick={() => goToPage(Math.min(totalPages, page + 1))}
              className="flex h-10 items-center gap-2 rounded-full border border-[#dbe7e3] bg-white px-4 text-xs font-semibold text-[#3c5a53] transition hover:bg-[#e8f6ef] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next <FaChevronRight size={10} />
            </button>
          </div>
        )}

        <p className="mt-10 text-center text-xs text-[#9ab0aa]">
          Together, we make our campus a better place.
        </p>
      </div>

      {/* ================= ITEM DETAILS MODAL ================= */}
      {selectedItem && (
        <div
          className="cf-fade fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#0b2a26]/60 p-3 backdrop-blur-sm sm:p-6"
          onClick={closeModal}
        >
          <div
            className="cf-modal relative my-auto w-full max-w-5xl overflow-hidden rounded-[22px] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 bg-[#0b2a26] px-5 py-4 text-white sm:px-8">
              <div>
                <p className="text-xs text-[#9fc9bd]">CampusFind</p>
                <h2 className="cf-display text-lg font-semibold sm:text-xl">
                  Item information
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>

            <div className="grid max-h-[calc(100vh-130px)] overflow-y-auto lg:grid-cols-2">
              {/* gallery */}
              <div className="bg-[#f3f7f5] p-5 sm:p-7">
                <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-[#e3ebe8] sm:h-80 lg:h-[390px]">
                  {currentImage ? (
                    <img
                      key={currentImage}
                      src={currentImage}
                      alt={selectedItem.itemName}
                      className="cf-fade h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-[#9ab0aa]">
                      <FaImage className="text-6xl" />
                      <span className="text-xs font-medium">
                        No image available
                      </span>
                    </div>
                  )}

                  <Badge
                    className={`absolute left-4 top-4 backdrop-blur-sm ${TYPE_STYLE[selectedItem.type] || ""}`}
                  >
                    {selectedItem.type} item
                  </Badge>

                  {itemImages.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setActiveImage(
                            (i) =>
                              (i - 1 + itemImages.length) % itemImages.length,
                          )
                        }
                        className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#3c5a53] transition hover:bg-white hover:text-[#0d9467]"
                        aria-label="Previous image"
                      >
                        <FaChevronLeft />
                      </button>
                      <button
                        onClick={() =>
                          setActiveImage((i) => (i + 1) % itemImages.length)
                        }
                        className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#3c5a53] transition hover:bg-white hover:text-[#0d9467]"
                        aria-label="Next image"
                      >
                        <FaChevronRight />
                      </button>
                      <span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm">
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
                        aria-label={`Show image ${index + 1}`}
                        className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition ${
                          activeImage === index
                            ? "border-[#0d9467]"
                            : "border-transparent opacity-60 hover:opacity-100"
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

                <div className="mt-5 flex items-center gap-2 text-xs text-[#7a8f8a]">
                  <FaImage className="text-[#0d9467]" />
                  {itemImages.length} image(s) uploaded
                </div>
              </div>

              {/* details */}
              <div className="p-5 sm:p-8">
                <Badge className="bg-[#eef4f2] text-[#3c5a53] ring-[#3c5a53]/10">
                  {formatCategory(selectedItem.category)}
                </Badge>
                <h2 className="cf-display mt-3 text-3xl font-bold leading-tight text-[#10312c]">
                  {selectedItem.itemName}
                </h2>
                <p className="mt-1 text-xs text-[#8ea19c]">
                  Posted on {formatDate(selectedItem.createdAt)}
                </p>

                <div className="mt-5 rounded-2xl bg-[#f3f7f5] p-4">
                  <h3 className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-[#10312c]">
                    <FaRegFileAlt className="text-[#0d9467]" /> Description
                  </h3>
                  <p className="whitespace-pre-wrap text-sm leading-7 text-[#3c5a53]">
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
                  <div className="mt-4 rounded-2xl bg-amber-50 p-4">
                    <h3 className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-amber-800">
                      <FaTag size={12} /> Identifying features
                    </h3>
                    <p className="whitespace-pre-wrap text-[13px] leading-6 text-amber-900/70">
                      {selectedItem.identifyingFeatures}
                    </p>
                  </div>
                )}

                <div className="mt-4 rounded-2xl border border-[#d5efe3] bg-[#e8f6ef]/60 p-5">
                  <h3 className="flex items-center gap-2 text-[13px] font-semibold text-[#10312c]">
                    <FaPhoneAlt className="text-[#0d9467]" size={12} /> Contact
                    information
                  </h3>
                  {selectedItem.contactPreference ? (
                    <a
                      href={`tel:${selectedItem.contactPreference}`}
                      className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 transition hover:shadow-md"
                    >
                      <div>
                        <p className="text-[11px] text-[#8ea19c]">
                          Contact number
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-[#0d7a55]">
                          {selectedItem.contactPreference}
                        </p>
                      </div>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0d9467] text-white">
                        <FaPhoneAlt size={13} />
                      </span>
                    </a>
                  ) : (
                    <p className="mt-3 text-xs text-[#7a8f8a]">
                      No contact number provided.
                    </p>
                  )}
                </div>

                <button
                  onClick={closeModal}
                  className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#dbe7e3] text-sm font-semibold text-[#3c5a53] transition hover:bg-[#f3f7f5]"
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

export default AllPosts;
