import { useState } from "react";
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

  const getStatusStyle = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-700";

      case "inactive":
        return "bg-gray-100 text-gray-600";

      case "resolved":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Heading */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-emerald-600">
            Manage Your Posts
          </p>

          <h1 className="text-3xl font-extrabold text-slate-800 md:text-4xl">
            My Posts
          </h1>

          <p className="mt-2 text-slate-500">
            View, edit and manage all your lost and found posts.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-7 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          {/* Type Filter */}
          <div className="flex flex-wrap gap-2">
            {["all", "lost", "found"].map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold capitalize transition ${
                  activeType === type
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-100"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {type === "all" ? "All Posts" : type}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:max-w-sm">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search your posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-80 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="rounded-2xl bg-red-50 p-8 text-center text-red-600">
            Failed to load your posts. Please try again.
          </div>
        )}

        {/* Posts */}
        {!isLoading && !isError && posts.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((item) => {
              const isLost = item.type === "lost";

              return (
                <div
                  key={item._id}
                  onClick={() => openModal(item)}
                  className={`group cursor-pointer overflow-hidden rounded-2xl border shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    isLost
                      ? "border-rose-100 bg-rose-50/70 hover:border-rose-200"
                      : "border-emerald-100 bg-emerald-50/70 hover:border-emerald-200"
                  }`}
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden bg-white/60">
                    {item.images?.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.itemName}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-300">
                        <FaImage size={45} />
                      </div>
                    )}

                    <span
                      className={`absolute left-4 top-4 rounded-full px-4 py-1.5 text-xs font-bold uppercase ${
                        isLost
                          ? "bg-rose-600 text-white"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      {item.type}
                    </span>

                    <span
                      className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getStatusStyle(
                        item.postStatus,
                      )}`}
                    >
                      {item.postStatus}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {item.category?.replaceAll("-", " ")}
                    </p>

                    <h3 className="mb-3 line-clamp-1 text-xl font-bold text-slate-800">
                      {item.itemName}
                    </h3>

                    <p className="mb-4 line-clamp-2 min-h-10 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>

                    <div className="space-y-2 border-t border-slate-200/70 pt-4 text-sm text-slate-500">
                      <p className="flex items-center gap-2">
                        <FaMapMarkerAlt className="shrink-0 text-emerald-600" />
                        {item.location?.area || "Location not specified"}
                      </p>

                      <p className="flex items-center gap-2">
                        <FaCalendarAlt className="shrink-0 text-emerald-600" />
                        {item.date || "Date not specified"}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-200/70 pt-4">
                      <span className="text-xs font-medium text-slate-500">
                        Click to manage
                      </span>

                      <span className="text-sm font-bold text-emerald-700 transition group-hover:translate-x-1">
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && posts.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <FaBoxOpen size={32} />
            </div>

            <h3 className="text-xl font-bold text-slate-800">No Posts Found</h3>

            <p className="mt-2 text-sm text-slate-500">
              You haven't created any posts matching your search.
            </p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <div
          onClick={() => {
            setSelectedItem(null);
            setEditMode(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm md:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur md:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                  Manage Your Post
                </p>

                <h2 className="mt-1 text-xl font-extrabold text-slate-800 md:text-2xl">
                  {editMode ? "Edit Post" : "Post Details"}
                </h2>
              </div>

              <button
                onClick={() => {
                  setSelectedItem(null);
                  setEditMode(false);
                }}
                className="rounded-full bg-slate-100 p-3 text-slate-500 transition hover:bg-rose-100 hover:text-rose-600"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-5 md:p-8">
              {/* Edit Form */}
              {editMode ? (
                <form onSubmit={handleUpdate} className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    {/* Type */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Post Type
                      </label>

                      <select
                        name="type"
                        value={editForm.type}
                        onChange={handleEditChange}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                      >
                        <option value="lost">Lost</option>
                        <option value="found">Found</option>
                      </select>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Category
                      </label>

                      <select
                        name="category"
                        value={editForm.category}
                        onChange={handleEditChange}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                      >
                        {CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category.replaceAll("-", " ")}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Item Name */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Item Name
                    </label>

                    <input
                      type="text"
                      name="itemName"
                      value={editForm.itemName}
                      onChange={handleEditChange}
                      required
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Description
                    </label>

                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
                      rows="4"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Location */}
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Area
                      </label>

                      <input
                        type="text"
                        name="area"
                        value={editForm.area}
                        onChange={handleEditChange}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Specific Location
                      </label>

                      <input
                        type="text"
                        name="specificLocation"
                        value={editForm.specificLocation}
                        onChange={handleEditChange}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Date
                      </label>

                      <input
                        type="date"
                        name="date"
                        value={editForm.date}
                        onChange={handleEditChange}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Approximate Time
                      </label>

                      <input
                        type="text"
                        name="approximateTime"
                        value={editForm.approximateTime}
                        onChange={handleEditChange}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Identifying Features */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Identifying Features
                    </label>

                    <textarea
                      name="identifyingFeatures"
                      value={editForm.identifyingFeatures}
                      onChange={handleEditChange}
                      rows="3"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Contact Preference */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Contact Preference
                    </label>

                    <input
                      type="text"
                      name="contactPreference"
                      value={editForm.contactPreference}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Images */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Image URLs
                    </label>

                    <textarea
                      value={imageText}
                      onChange={(e) => setImageText(e.target.value)}
                      rows="4"
                      placeholder="Enter one image URL per line"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                    />

                    <p className="mt-1 text-xs text-slate-400">
                      Keep one image URL on each line.
                    </p>
                  </div>

                  {/* Form Buttons */}
                  <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FaSave />
                      {updateMutation.isPending
                        ? "Updating..."
                        : "Save Changes"}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {/* View Details */}
                  <div className="grid gap-7 md:grid-cols-2">
                    {/* Images */}
                    <div>
                      {selectedItem.images?.length > 0 ? (
                        <div className="space-y-3">
                          <img
                            src={selectedItem.images[0]}
                            alt={selectedItem.itemName}
                            className="h-72 w-full rounded-2xl bg-slate-100 object-cover"
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
                        <div className="flex h-72 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
                          <FaImage size={55} />
                        </div>
                      )}
                    </div>

                    {/* Information */}
                    <div>
                      <div className="mb-4 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase ${
                            selectedItem.type === "lost"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {selectedItem.type}
                        </span>

                        <span
                          className={`rounded-full px-4 py-1.5 text-xs font-bold capitalize ${getStatusStyle(selectedItem.postStatus)}`}
                        >
                          {selectedItem.postStatus}
                        </span>
                      </div>

                      <h2 className="mb-3 text-2xl font-extrabold text-slate-800">
                        {selectedItem.itemName}
                      </h2>

                      <p className="mb-5 text-sm leading-7 text-slate-600">
                        {selectedItem.description || "No description provided."}
                      </p>

                      <div className="space-y-4 border-t border-slate-100 pt-5 text-sm">
                        <div className="flex gap-3">
                          <FaBoxOpen className="mt-1 text-emerald-600" />
                          <div>
                            <p className="font-semibold text-slate-700">
                              Category
                            </p>
                            <p className="capitalize text-slate-500">
                              {selectedItem.category?.replaceAll("-", " ")}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <FaMapMarkerAlt className="mt-1 text-emerald-600" />
                          <div>
                            <p className="font-semibold text-slate-700">
                              Location
                            </p>
                            <p className="text-slate-500">
                              {selectedItem.location?.area || "Not specified"}
                            </p>
                            <p className="text-slate-500">
                              {selectedItem.location?.specificLocation || ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <FaCalendarAlt className="mt-1 text-emerald-600" />
                          <div>
                            <p className="font-semibold text-slate-700">Date</p>
                            <p className="text-slate-500">
                              {selectedItem.date || "Not specified"}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <FaClock className="mt-1 text-emerald-600" />
                          <div>
                            <p className="font-semibold text-slate-700">
                              Approximate Time
                            </p>
                            <p className="text-slate-500">
                              {selectedItem.approximateTime || "Not specified"}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <FaInfoCircle className="mt-1 text-emerald-600" />
                          <div>
                            <p className="font-semibold text-slate-700">
                              Identifying Features
                            </p>
                            <p className="text-slate-500">
                              {selectedItem.identifyingFeatures ||
                                "Not specified"}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <FaPhoneAlt className="mt-1 text-emerald-600" />
                          <div>
                            <p className="font-semibold text-slate-700">
                              Contact Preference
                            </p>
                            <p className="text-slate-500">
                              {selectedItem.contactPreference ||
                                "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Management */}
                  <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="mb-3 font-bold text-slate-800">
                      Manage Post Status
                    </h3>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium capitalize outline-none focus:border-emerald-500"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={handleStatusUpdate}
                        disabled={statusMutation.isPending}
                        className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-700 disabled:opacity-60"
                      >
                        {statusMutation.isPending
                          ? "Updating..."
                          : "Update Status"}
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-6">
                    <button
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-100 disabled:opacity-60"
                    >
                      <FaTrash />
                      {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </button>

                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                    >
                      <FaEdit />
                      Edit Post
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

export default MyPosts;
