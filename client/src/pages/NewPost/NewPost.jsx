import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import useUserData from "../../hooks/useUserData";
import useAxiosPublic from "../../hooks/useAxiosPublic";

const NewPost = () => {
  const { loggedInUser, loggedInUserLoading } = useUserData();
  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const today = new Date();
  const localDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const [formData, setFormData] = useState({
    type: "lost",
    itemName: "",
    category: "",
    description: "",
    images: "",
    area: "",
    specificLocation: "",
    date: localDate,
    approximateTime: "",
    identifyingFeatures: "",
    contactPreference: loggedInUser?.phone || "",
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData) => {
      const res = await axiosPublic.post("/items", postData);
      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      alert("Your post has been created successfully!");
      navigate("/");
    },

    onError: (error) => {
      console.error(error);
      alert(error.response?.data?.message || "Failed to create post!");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!loggedInUser?.userId) {
      alert("Please login first!");
      return;
    }

    const postData = {
      userId: loggedInUser.userId,
      type: formData.type,
      itemName: formData.itemName.trim(),
      category: formData.category,
      description: formData.description.trim(),

      // Multiple image URLs separated by commas or new lines
      images: formData.images
        .split(/[\n,]+/)
        .map((url) => url.trim())
        .filter(Boolean),

      location: {
        area: formData.area.trim(),
        specificLocation: formData.specificLocation.trim(),
      },

      date: formData.date,
      approximateTime: formData.approximateTime,
      identifyingFeatures: formData.identifyingFeatures.trim(),
      contactPreference: formData.contactPreference.trim(),
    };

    createPostMutation.mutate(postData);
  };

  if (loggedInUserLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg text-blue-600"></span>
      </div>
    );
  }

  if (!loggedInUser) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <p className="text-center text-gray-600">
          Please login to create a post.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass = "mb-2 block text-sm font-semibold text-gray-700";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 md:py-14">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="mb-3 inline-block rounded-full bg-blue-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
            Campus Find Community
          </span>

          <h1 className="text-3xl font-extrabold text-gray-900 md:text-4xl">
            Create a New Post
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500 md:text-base">
            Lost something or found something on campus? Share the details and
            help reunite people with their belongings.
          </p>
        </div>

        {/* User Information */}
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <img
            src={
              loggedInUser.photoUrl ||
              "https://ui-avatars.com/api/?name=Campus+User"
            }
            alt={loggedInUser.name}
            className="h-12 w-12 rounded-full object-cover"
          />

          <div className="min-w-0">
            <h3 className="font-bold text-gray-800">{loggedInUser.name}</h3>
            <p className="truncate text-sm text-gray-500">
              {loggedInUser.email}
            </p>
            <p className="mt-1 text-xs font-medium text-blue-600">
              {loggedInUser.collegeId}
            </p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-7 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-8"
        >
          {/* Post Type */}
          <div>
            <label className={labelClass}>What do you want to post?</label>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, type: "lost" }))
                }
                className={`rounded-xl border-2 p-4 text-left transition ${
                  formData.type === "lost"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-100 hover:border-gray-300"
                }`}
              >
                <span className="text-2xl">🔍</span>
                <h3 className="mt-2 font-bold text-gray-800">
                  I Lost Something
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Report a missing item
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, type: "found" }))
                }
                className={`rounded-xl border-2 p-4 text-left transition ${
                  formData.type === "found"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-100 hover:border-gray-300"
                }`}
              >
                <span className="text-2xl">🎁</span>
                <h3 className="mt-2 font-bold text-gray-800">
                  I Found Something
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Report an item you found
                </p>
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100"></div>

          {/* Item Information */}
          <div>
            <h2 className="mb-5 text-lg font-bold text-gray-900">
              Item Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Item Name *</label>
                <input
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  placeholder="e.g. Scientific Calculator"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="electronics">Electronics</option>
                  <option value="gadgets">Gadgets</option>
                  <option value="accessories">Accessories</option>
                  <option value="stationery">Stationery</option>
                  <option value="books">Books</option>
                  <option value="clothing">Clothing</option>
                  <option value="footwear">Footwear</option>
                  <option value="id-cards">ID Cards</option>
                  <option value="wallets-purses">Wallets / Purses</option>
                  <option value="keys">Keys</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="mt-5">
              <label className={labelClass}>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe the item and provide any useful details..."
                className={inputClass}
                required
              />
            </div>

            <div className="mt-5">
              <label className={labelClass}>Image URLs</label>
              <textarea
                name="images"
                value={formData.images}
                onChange={handleChange}
                rows="2"
                placeholder="Paste image URLs (one URL per line or separated by commas)"
                className={inputClass}
              />
              <p className="mt-2 text-xs text-gray-400">
                You can add multiple image URLs. Leave empty if you don't have
                an image.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100"></div>

          {/* Location & Date */}
          <div>
            <h2 className="mb-5 text-lg font-bold text-gray-900">
              Location & Date
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Campus Area *</label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="e.g. Academic Building"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Specific Location</label>
                <input
                  type="text"
                  name="specificLocation"
                  value={formData.specificLocation}
                  onChange={handleChange}
                  placeholder="e.g. CSE Department, 3rd Floor"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  {formData.type === "lost" ? "Lost Date" : "Found Date"} *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  max={localDate}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Approximate Time</label>
                <input
                  type="time"
                  name="approximateTime"
                  value={formData.approximateTime}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100"></div>

          {/* Additional Information */}
          <div>
            <h2 className="mb-5 text-lg font-bold text-gray-900">
              Additional Information
            </h2>

            <div>
              <label className={labelClass}>Identifying Features</label>
              <textarea
                name="identifyingFeatures"
                value={formData.identifyingFeatures}
                onChange={handleChange}
                rows="3"
                placeholder="Mention unique marks, scratches, stickers, or other details..."
                className={inputClass}
              />
              <p className="mt-2 text-xs text-amber-600">
                Keep unique identifying details private. They can help verify
                the real owner later.
              </p>
            </div>

            <div className="mt-5">
              <label className={labelClass}>Contact Number *</label>
              <input
                type="tel"
                name="contactPreference"
                value={formData.contactPreference}
                onChange={handleChange}
                placeholder="01XXXXXXXXX"
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Submit */}
          <div className="border-t border-gray-100 pt-6">
            <button
              type="submit"
              disabled={createPostMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createPostMutation.isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Publishing...
                </>
              ) : (
                "Publish Post"
              )}
            </button>

            <p className="mt-3 text-center text-xs text-gray-400">
              Please make sure all the information is correct before publishing.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPost;
