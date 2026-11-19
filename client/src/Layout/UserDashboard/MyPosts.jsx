import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FaSearch,
  FaBoxOpen,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaImage,
  FaPhoneAlt,
  FaInfoCircle,
  FaChevronDown,
  FaArrowRight,
} from "react-icons/fa";
import Swal from "sweetalert2";

import useUserData from "../../hooks/useUserData";
import useAxiosPublic from "../../hooks/useAxiosPublic";

const CATEGORIES = [
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

const STATUS_OPTIONS = ["active", "inactive", "resolved"];

// =====================================
//              HELPERS
// =====================================

const POST_STATUS_STYLE = {
  active: "bg-sky-50 text-sky-700 ring-sky-600/15",
  inactive: "bg-slate-100 text-slate-600 ring-slate-500/15",
  resolved: "bg-violet-50 text-violet-700 ring-violet-600/15",
};

const TYPE_STYLE = {
  lost: "bg-rose-50 text-rose-700 ring-rose-600/15",
  found: "bg-teal-50 text-teal-700 ring-teal-600/15",
};

const formatDate = (date) => {
  if (!date) return "Not specified";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
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

const inputCls =
  "w-full rounded-xl border border-[#dbe7e3] bg-[#f8fbfa] px-4 py-3 text-sm text-[#10312c] outline-none transition placeholder:text-[#a4b4b0] focus:border-[#0d9467] focus:bg-white focus:ring-4 focus:ring-[#0d9467]/10";
const labelCls = "mb-2 block text-[13px] font-medium text-[#3c5a53]";

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

const InfoRow = ({ icon: Icon, label, children }) => (
  <div className="flex gap-3.5">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef4f2] text-[#0d9467]">
      <Icon size={13} />
    </span>
    <div className="min-w-0">
      <p className="text-xs text-[#8ea19c]">{label}</p>
      <div className="mt-0.5 break-words text-sm font-semibold text-[#10312c]">
        {children}
      </div>
    </div>
  </div>
);

const SelectWrap = ({ children }) => (
  <div className="relative">
    {children}
    <FaChevronDown
      size={11}
      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#93a7a2]"
    />
  </div>
);

// =====================================
//              MAIN PAGE
// =====================================

const MyPosts = () => {
  const { loggedInUser } = useUserData();
  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();

  const [activeType, setActiveType] = useState("all");
  const [search, setSearch] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [editForm, setEditForm] = useState({});
  const [imageText, setImageText] = useState("");
  const [newStatus, setNewStatus] = useState("");

  // Fetch My Posts
  const {
    data: postsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["my-items", loggedInUser?.userId, activeType, search],
    enabled: !!loggedInUser?.userId,
    queryFn: async () => {
      const res = await axiosPublic.get("/items/my-posts", {
        params: {
          userId: loggedInUser.userId,
          type: activeType,
          search,
        },
      });

      return res.data;
    },
  });

  const posts = postsData?.items || [];

  const activeCount = posts.filter((p) => p.postStatus === "active").length;
  const resolvedCount = posts.filter((p) => p.postStatus === "resolved").length;
  const inactiveCount = posts.filter((p) => p.postStatus === "inactive").length;

  // Update post
  const updateMutation = useMutation({
    mutationFn: async (updatedData) => {
      const res = await axiosPublic.patch(`/items/${selectedItem._id}`, {
        ...updatedData,
        userId: loggedInUser.userId,
      });

      return res.data;
    },

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Post Updated!",
        text: "Your post has been updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      setSelectedItem((prev) => ({
        ...prev,
        ...editForm,
        images: imageText
          .split("\n")
          .map((url) => url.trim())
          .filter(Boolean),
        location: {
          area: editForm.area,
          specificLocation: editForm.specificLocation,
        },
      }));

      setEditMode(false);
      queryClient.invalidateQueries({ queryKey: ["my-items"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },

    onError: () => {
      Swal.fire("Error!", "Failed to update your post.", "error");
    },
  });

  // Delete post
  const deleteMutation = useMutation({
    mutationFn: async (itemId) => {
      const res = await axiosPublic.delete(`/items/${itemId}`, {
        data: {
          userId: loggedInUser.userId,
        },
      });

      return res.data;
    },

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Your post has been deleted.",
        timer: 1500,
        showConfirmButton: false,
      });

      setSelectedItem(null);
      queryClient.invalidateQueries({ queryKey: ["my-items"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },

    onError: () => {
      Swal.fire("Error!", "Failed to delete your post.", "error");
    },
  });

  // Change post status
  const statusMutation = useMutation({
    mutationFn: async ({ itemId, postStatus }) => {
      const res = await axiosPublic.patch(`/items/${itemId}/status`, {
        userId: loggedInUser.userId,
        postStatus,
      });

      return res.data;
    },

    onSuccess: () => {
      setSelectedItem((prev) => ({
        ...prev,
        postStatus: newStatus,
      }));

      Swal.fire({
        icon: "success",
        title: "Status Updated!",
        timer: 1200,
        showConfirmButton: false,
      });

      queryClient.invalidateQueries({ queryKey: ["my-items"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },

    onError: () => {
      Swal.fire("Error!", "Failed to update status.", "error");
    },
  });

  // Open modal
  const openModal = (item) => {
    setSelectedItem(item);
    setEditMode(false);
    setNewStatus(item.postStatus || "active");

    setEditForm({
      type: item.type || "lost",
      itemName: item.itemName || "",
      category: item.category || "other",
      description: item.description || "",
      area: item.location?.area || "",
      specificLocation: item.location?.specificLocation || "",
      date: item.date || "",
      approximateTime: item.approximateTime || "",
      identifyingFeatures: item.identifyingFeatures || "",
      contactPreference: item.contactPreference || "",
    });

    setImageText((item.images || []).join("\n"));
  };

  const closeModal = () => {
    setSelectedItem(null);
    setEditMode(false);
  };

  // Edit input handler
  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save changes
  const handleUpdate = (e) => {
    e.preventDefault();

    const images = imageText
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean);

    updateMutation.mutate({
      type: editForm.type,
      itemName: editForm.itemName,
      category: editForm.category,
      description: editForm.description,
      images,
      location: {
        area: editForm.area,
        specificLocation: editForm.specificLocation,
      },
      date: editForm.date,
      approximateTime: editForm.approximateTime,
      identifyingFeatures: editForm.identifyingFeatures,
      contactPreference: editForm.contactPreference,
    });
  };

  // Delete confirmation
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This post will be removed from your posts.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      deleteMutation.mutate(selectedItem._id);
    }
  };

  // Status update
  const handleStatusUpdate = () => {
    if (newStatus === selectedItem.postStatus) {
      return Swal.fire(
        "No Changes",
        "Your status is already the same.",
        "info",
      );
    }

    statusMutation.mutate({
      itemId: selectedItem._id,
      postStatus: newStatus,
    });
  };

  return (
    <div className="cf-root min-h-screen bg-[#f3f7f5] px-4 py-7 md:px-6">
      <style>{styles}</style>

      <div className="mx-auto max-w-7xl">
        {/* ================= Top bar ================= */}
        <header className="mb-6">
          <h1 className="cf-display text-3xl font-bold text-[#10312c] md:text-[40px] md:leading-[1.1]">
            My posts
          </h1>
          <p className="mt-2 text-[15px] text-[#6d837d]">
            View, edit and manage all your lost and found posts.
          </p>
        </header>

        {/* ================= Key numbers strip ================= */}
        <section
          className="cf-rise mb-6 flex flex-col divide-y divide-[#e3ebe8] overflow-hidden rounded-[22px] border border-[#e3ebe8] bg-white sm:flex-row sm:divide-x sm:divide-y-0"
          style={{ animationDelay: "0.05s" }}
        >
          <Stat
            label="In this view"
            value={posts.length}
            note={
              search || activeType !== "all"
                ? "Matching your filters"
                : "All your posts"
            }
          />
          <Stat label="Active" value={activeCount} note="Still looking" />
          <Stat
            label="Resolved"
            value={resolvedCount}
            note="Closed successfully"
          />
          <Stat label="Inactive" value={inactiveCount} note="Paused by you" />
        </section>

        {/* ================= Filters ================= */}
        <section className="mb-6 flex flex-col gap-4 rounded-[22px] border border-[#e3ebe8] bg-white p-4 md:flex-row md:items-center md:justify-between md:p-5">
          <div className="flex flex-wrap gap-2">
            {["all", "lost", "found"].map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                aria-pressed={activeType === type}
                className={`rounded-full px-5 py-2.5 text-[13px] font-semibold capitalize transition ${
                  activeType === type
                    ? "bg-[#0b2a26] text-white"
                    : "bg-[#f3f7f5] text-[#6d837d] hover:bg-[#e8f6ef] hover:text-[#0d7a55]"
                }`}
              >
                {type === "all" ? "All posts" : type}
              </button>
            ))}
          </div>

          <div className="relative w-full md:max-w-sm">
            <FaSearch
              size={13}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#93a7a2]"
            />
            <input
              type="text"
              placeholder="Search your posts"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-full border border-[#dbe7e3] bg-white pl-10 pr-4 text-sm text-[#10312c] outline-none transition placeholder:text-[#a4b4b0] focus:border-[#0d9467] focus:ring-4 focus:ring-[#0d9467]/10"
            />
          </div>
        </section>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="cf-shimmer h-80 rounded-[22px]" />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="rounded-[22px] border border-rose-100 bg-rose-50 p-8 text-center text-sm text-rose-600">
            Couldn&apos;t load your posts. Please try again.
          </div>
        )}

        {/* ================= Posts ================= */}
        {!isLoading && !isError && posts.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((item) => (
              <article
                key={item._id}
                onClick={() => openModal(item)}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-[22px] border border-[#e3ebe8] bg-white transition hover:border-[#bfd9d0]"
              >
                <div className="relative h-48 overflow-hidden bg-[#eef4f2]">
                  {item.images?.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.itemName}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#c3d3cf]">
                      <FaImage size={40} />
                    </div>
                  )}

                  <Badge
                    className={`absolute left-3 top-3 backdrop-blur-sm ${TYPE_STYLE[item.type] || ""}`}
                  >
                    {item.type}
                  </Badge>
                  <Badge
                    className={`absolute right-3 top-3 backdrop-blur-sm ${
                      POST_STATUS_STYLE[item.postStatus] ||
                      POST_STATUS_STYLE.inactive
                    }`}
                  >
                    {item.postStatus}
                  </Badge>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="mb-1.5 text-xs font-medium text-[#0d7a55]">
                    {formatCategory(item.category)}
                  </p>

                  <h3 className="cf-display line-clamp-1 text-[17px] font-semibold text-[#10312c]">
                    {item.itemName}
                  </h3>

                  <p className="mt-1.5 line-clamp-2 min-h-10 text-[13px] leading-5 text-[#7a8f8a]">
                    {item.description || "No description provided."}
                  </p>

                  <div className="mt-4 space-y-1.5 border-t border-[#edf2f0] pt-4 text-xs text-[#3c5a53]">
                    <p className="flex items-center gap-2">
                      <FaMapMarkerAlt className="shrink-0 text-[#0d9467]" />
                      <span className="truncate">
                        {item.location?.area || "Location not specified"}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <FaCalendarAlt className="shrink-0 text-[#0d9467]" />
                      {formatDate(item.date)}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="text-xs text-[#8ea19c]">
                      Select to manage
                    </span>
                    <span className="flex items-center gap-2 text-[13px] font-medium text-[#0d9467] transition group-hover:gap-3">
                      View details <FaArrowRight size={11} />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && posts.length === 0 && (
          <div className="rounded-[22px] border border-dashed border-[#d5e2de] bg-white px-5 py-16 text-center">
            <FaBoxOpen className="mx-auto text-3xl text-[#9ab0aa]" />
            <h3 className="cf-display mt-4 font-semibold text-[#10312c]">
              No posts found
            </h3>
            <p className="mt-1 text-sm text-[#7a8f8a]">
              You haven&apos;t created any posts matching your search.
            </p>
          </div>
        )}

        <p className="mt-10 text-center text-xs text-[#9ab0aa]">
          CampusFind, your posts help your campus reconnect
        </p>
      </div>

      {/* ================= Details modal ================= */}
      {selectedItem && (
        <div
          onClick={closeModal}
          className="cf-fade fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0b2a26]/60 p-3 backdrop-blur-sm md:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="cf-modal relative my-auto max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-[22px] bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between bg-[#0b2a26] px-5 py-4 text-white md:px-8">
              <div>
                <p className="text-xs text-[#9fc9bd]">Manage your post</p>
                <h2 className="cf-display mt-0.5 text-lg font-semibold md:text-xl">
                  {editMode ? "Edit post" : "Post details"}
                </h2>
              </div>

              <button
                onClick={closeModal}
                aria-label="Close"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-5 md:p-8">
              {editMode ? (
                <form onSubmit={handleUpdate} className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label htmlFor="type" className={labelCls}>
                        Post type
                      </label>
                      <SelectWrap>
                        <select
                          id="type"
                          name="type"
                          value={editForm.type}
                          onChange={handleEditChange}
                          className={`${inputCls} appearance-none pr-10`}
                        >
                          <option value="lost">Lost</option>
                          <option value="found">Found</option>
                        </select>
                      </SelectWrap>
                    </div>

                    <div>
                      <label htmlFor="category" className={labelCls}>
                        Category
                      </label>
                      <SelectWrap>
                        <select
                          id="category"
                          name="category"
                          value={editForm.category}
                          onChange={handleEditChange}
                          className={`${inputCls} appearance-none pr-10`}
                        >
                          {CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                              {formatCategory(category)}
                            </option>
                          ))}
                        </select>
                      </SelectWrap>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="itemName" className={labelCls}>
                      Item name
                    </label>
                    <input
                      id="itemName"
                      type="text"
                      name="itemName"
                      value={editForm.itemName}
                      onChange={handleEditChange}
                      required
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className={labelCls}>
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
                      rows="4"
                      className={`${inputCls} resize-y`}
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label htmlFor="area" className={labelCls}>
                        Area
                      </label>
                      <input
                        id="area"
                        type="text"
                        name="area"
                        value={editForm.area}
                        onChange={handleEditChange}
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label htmlFor="specificLocation" className={labelCls}>
                        Specific location
                      </label>
                      <input
                        id="specificLocation"
                        type="text"
                        name="specificLocation"
                        value={editForm.specificLocation}
                        onChange={handleEditChange}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label htmlFor="date" className={labelCls}>
                        Date
                      </label>
                      <input
                        id="date"
                        type="date"
                        name="date"
                        value={editForm.date}
                        onChange={handleEditChange}
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label htmlFor="approximateTime" className={labelCls}>
                        Approximate time
                      </label>
                      <input
                        id="approximateTime"
                        type="text"
                        name="approximateTime"
                        value={editForm.approximateTime}
                        onChange={handleEditChange}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="identifyingFeatures" className={labelCls}>
                      Identifying features
                    </label>
                    <textarea
                      id="identifyingFeatures"
                      name="identifyingFeatures"
                      value={editForm.identifyingFeatures}
                      onChange={handleEditChange}
                      rows="3"
                      className={`${inputCls} resize-y`}
                    />
                  </div>

                  <div>
                    <label htmlFor="contactPreference" className={labelCls}>
                      Contact preference
                    </label>
                    <input
                      id="contactPreference"
                      type="text"
                      name="contactPreference"
                      value={editForm.contactPreference}
                      onChange={handleEditChange}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label htmlFor="imageText" className={labelCls}>
                      Image URLs
                    </label>
                    <textarea
                      id="imageText"
                      value={imageText}
                      onChange={(e) => setImageText(e.target.value)}
                      rows="4"
                      placeholder="Enter one image URL per line"
                      className={`${inputCls} resize-y`}
                    />
                    <p className="mt-1.5 text-xs text-[#8ea19c]">
                      Keep one image URL on each line.
                    </p>
                  </div>

                  <div className="flex flex-col-reverse gap-3 border-t border-[#edf2f0] pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="h-11 rounded-full border border-[#dbe7e3] px-6 text-sm font-semibold text-[#3c5a53] transition hover:bg-[#f3f7f5]"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#0d9467] px-7 text-sm font-semibold text-white transition hover:bg-[#0b7f58] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FaSave size={13} />
                      {updateMutation.isPending
                        ? "Updating..."
                        : "Save changes"}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="grid gap-7 md:grid-cols-2">
                    {/* Images */}
                    <div>
                      {selectedItem.images?.length > 0 ? (
                        <div className="space-y-3">
                          <img
                            src={selectedItem.images[0]}
                            alt={selectedItem.itemName}
                            className="h-72 w-full rounded-2xl bg-[#eef4f2] object-cover"
                          />

                          {selectedItem.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                              {selectedItem.images
                                .slice(1)
                                .map((image, index) => (
                                  <img
                                    key={index}
                                    src={image}
                                    alt={`${selectedItem.itemName} ${index + 2}`}
                                    className="h-20 w-full rounded-xl object-cover"
                                  />
                                ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex h-72 items-center justify-center rounded-2xl bg-[#eef4f2] text-[#c3d3cf]">
                          <FaImage size={50} />
                        </div>
                      )}
                    </div>

                    {/* Information */}
                    <div>
                      <div className="mb-4 flex flex-wrap gap-2">
                        <Badge className={TYPE_STYLE[selectedItem.type] || ""}>
                          {selectedItem.type}
                        </Badge>
                        <Badge
                          className={
                            POST_STATUS_STYLE[selectedItem.postStatus] ||
                            POST_STATUS_STYLE.inactive
                          }
                        >
                          {selectedItem.postStatus}
                        </Badge>
                      </div>

                      <h2 className="cf-display mb-2 text-2xl font-bold text-[#10312c]">
                        {selectedItem.itemName}
                      </h2>

                      <p className="mb-5 text-sm leading-7 text-[#3c5a53]">
                        {selectedItem.description || "No description provided."}
                      </p>

                      <div className="space-y-4 border-t border-[#edf2f0] pt-5">
                        <InfoRow icon={FaBoxOpen} label="Category">
                          {formatCategory(selectedItem.category)}
                        </InfoRow>

                        <InfoRow icon={FaMapMarkerAlt} label="Location">
                          <p>
                            {selectedItem.location?.area || "Not specified"}
                          </p>
                          {selectedItem.location?.specificLocation && (
                            <p className="font-normal text-[#7a8f8a]">
                              {selectedItem.location.specificLocation}
                            </p>
                          )}
                        </InfoRow>

                        <InfoRow icon={FaCalendarAlt} label="Date">
                          {formatDate(selectedItem.date)}
                        </InfoRow>

                        <InfoRow icon={FaClock} label="Approximate time">
                          {selectedItem.approximateTime || "Not specified"}
                        </InfoRow>

                        <InfoRow
                          icon={FaInfoCircle}
                          label="Identifying features"
                        >
                          {selectedItem.identifyingFeatures || "Not specified"}
                        </InfoRow>

                        <InfoRow icon={FaPhoneAlt} label="Contact preference">
                          {selectedItem.contactPreference || "Not specified"}
                        </InfoRow>
                      </div>
                    </div>
                  </div>

                  {/* Status Management */}
                  <div className="mt-8 rounded-2xl bg-[#f3f7f5] p-5">
                    <h3 className="cf-display mb-1 font-semibold text-[#10312c]">
                      Post status
                    </h3>
                    <p className="mb-3 text-[13px] text-[#7a8f8a]">
                      Mark a post resolved once the item is back with its owner.
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <div className="flex-1">
                        <SelectWrap>
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            aria-label="Post status"
                            className="h-11 w-full appearance-none rounded-full border border-[#dbe7e3] bg-white pl-4 pr-10 text-sm font-medium capitalize text-[#3c5a53] outline-none transition focus:border-[#0d9467] focus:ring-4 focus:ring-[#0d9467]/10"
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </SelectWrap>
                      </div>

                      <button
                        onClick={handleStatusUpdate}
                        disabled={statusMutation.isPending}
                        className="h-11 rounded-full bg-[#0b2a26] px-6 text-sm font-semibold text-white transition hover:bg-[#143d37] disabled:opacity-60"
                      >
                        {statusMutation.isPending
                          ? "Updating..."
                          : "Update status"}
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#edf2f0] pt-6 sm:flex-row sm:justify-end">
                    <button
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="flex h-11 items-center justify-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-6 text-sm font-semibold text-rose-600 transition hover:bg-rose-500 hover:text-white disabled:opacity-60"
                    >
                      <FaTrash size={12} />
                      {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </button>

                    <button
                      onClick={() => setEditMode(true)}
                      className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#0d9467] px-7 text-sm font-semibold text-white transition hover:bg-[#0b7f58]"
                    >
                      <FaEdit size={13} />
                      Edit post
                    </button>
                  </div>
                </>
              )}
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
  @keyframes cf-shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }
  @keyframes cf-fade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes cf-modal { from { opacity: 0; transform: translateY(12px) scale(.98); } to { opacity: 1; transform: none; } }
  .cf-rise { opacity: 0; animation: cf-rise .7s cubic-bezier(.2,.8,.2,1) forwards; }
  .cf-fade { animation: cf-fade .2s ease-out; }
  .cf-modal { animation: cf-modal .25s ease-out; }
  .cf-shimmer { background: linear-gradient(90deg,#eef4f2 25%,#f8fbfa 50%,#eef4f2 75%); background-size: 200% 100%; animation: cf-shimmer 1.4s infinite; }
  @media (prefers-reduced-motion: reduce) {
    .cf-rise, .cf-shimmer, .cf-fade, .cf-modal { animation: none !important; opacity: 1; }
  }
`;

export default MyPosts;
