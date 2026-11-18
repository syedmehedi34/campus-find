
import { useState } from "react";
import { useLocation } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import {
  FaSearch,
  FaHandHoldingHeart,
  FaBoxOpen,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaPhoneAlt,
  FaTag,
  FaRegLightbulb,
  FaShieldAlt,
  FaCheckCircle,
  FaImage,
  FaCamera,
} from "react-icons/fa";

import ImageUploader from "./ImageUploader";
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

const initialFormData = {
  type: "lost",
  itemName: "",
  category: "",
  description: "",
  images: [],
  location: {
    area: "",
    specificLocation: "",
  },
  date: "",
  approximateTime: "",
  identifyingFeatures: "",
  contactPreference: null,
};

const formatCategory = (category = "") =>
  category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const formatDate = (date) => {
  if (!date) return "Date not set";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const typeStyle = (type) =>
  type === "lost"
    ? { badge: "bg-orange-500 text-white" }
    : { badge: "bg-emerald-500 text-white" };

/* ---------- shared input styles (same look as the search box in AllPosts) ---------- */
const inputCls =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";
const fieldCls = `${inputCls} h-12`;
const areaCls = `${inputCls} py-3 leading-6 resize-y`;
const labelCls =
  "mb-2 flex items-center gap-2 text-xs font-bold text-slate-700";

const typeOptions = [
  {
    value: "lost",
    title: "I lost something",
    hint: "Help me find my missing item",
    icon: FaSearch,
    active: "border-orange-400 bg-orange-50 shadow-lg shadow-orange-200/60",
    iconCls: "bg-orange-500 text-white",
    dot: "border-orange-500 bg-orange-500",
  },
  {
    value: "found",
    title: "I found something",
    hint: "Help return an item to its owner",
    icon: FaHandHoldingHeart,
    active: "border-emerald-400 bg-emerald-50 shadow-lg shadow-emerald-200/60",
    iconCls: "bg-emerald-500 text-white",
    dot: "border-emerald-500 bg-emerald-500",
  },
];

/* ---------- card section wrapper ---------- */
const Section = ({ icon: Icon, title, subtitle, children }) => (
  <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-lg shadow-slate-200/50 sm:p-7">
    <div className="mb-6 flex items-center gap-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100 text-lg text-indigo-600">
        <Icon />
      </span>
      <div>
        <h3 className={`${display} text-lg font-extrabold text-slate-900`}>
          {title}
        </h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
    {children}
  </section>
);

const NewPost = () => {
  const { pathname } = useLocation();

  // Hero section only for the public create-post route
  const showHero = pathname === "/create-post";

  const { loggedInUser } = useUserData();
  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState(initialFormData);

  const showToast = (icon, title) => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon,
      title,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "area" || name === "specificLocation") {
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const mutation = useMutation({
    mutationFn: async (postData) => {
      const response = await axiosPublic.post("/items", postData);
      return response.data;
    },

    onSuccess: () => {
      showToast("success", "Your post has been published!");

      queryClient.invalidateQueries({
        queryKey: ["items"],
      });

      setFormData({
        ...initialFormData,
        location: { ...initialFormData.location },
      });
    },

    onError: (error) => {
      console.error("Post creation error:", error);

      showToast(
        "error",
        error.response?.data?.message || "Failed to publish your post!",
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!loggedInUser?.userId) {
      showToast("warning", "Please login before creating a post!");
      return;
    }

    if (!formData.itemName.trim()) {
      showToast("warning", "Please enter the item name!");
      return;
    }

    if (!formData.category) {
      showToast("warning", "Please select a category!");
      return;
    }

    if (!formData.images.length) {
      showToast("warning", "Please upload at least one image!");
      return;
    }

    const postData = {
      ...formData,
      userId: loggedInUser.userId,
      contactPreference: formData.contactPreference ?? loggedInUser.phone ?? "",
    };

    mutation.mutate(postData);
  };

  const updateImages = (images) => {
    setFormData((prev) => ({
      ...prev,
      images: typeof images === "function" ? images(prev.images) : images,
    }));
  };

  const style = typeStyle(formData.type);
  const previewImage = formData.images?.[0];
  const previewLocation = [
    formData.location.area,
    formData.location.specificLocation,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-indigo-50/40 px-4 py-8 text-slate-800 sm:px-6 lg:py-10">
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
                  <FaHandHoldingHeart /> Community starts with helping
                </span>

                <h1
                  className={`${display} mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-6xl`}
                >
                  Lost or found something?{" "}
                  <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                    Let’s sort it out together.
                  </span>
                </h1>

                <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
                  Every item has an owner. Share the details with your campus
                  community and help it find its way home.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  {[
                    { icon: FaShieldAlt, text: "Campus community" },
                    { icon: FaSearch, text: "Easy discovery" },
                    { icon: FaHandHoldingHeart, text: "Help each other" },
                  ].map((f) => (
                    <div
                      key={f.text}
                      className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-white px-4 py-2.5 shadow-sm"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <f.icon />
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* floating card */}
              <div className="relative mx-auto hidden h-64 w-full max-w-sm lg:block">
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute left-4 top-6 w-64 rotate-[-4deg] rounded-3xl border border-indigo-200 bg-white p-5 shadow-xl shadow-indigo-200/60"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-xl text-white">
                    <FaBoxOpen />
                  </span>
                  <p className="mt-4 text-[11px] font-semibold text-slate-400">
                    A little help goes a long way
                  </p>
                  <p
                    className={`${display} mt-1 text-lg font-extrabold leading-6 text-slate-900`}
                  >
                    Someone might be looking for this.
                  </p>
                </motion.div>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.8,
                  }}
                  className="absolute right-0 top-0 flex h-14 w-14 rotate-[6deg] items-center justify-center rounded-2xl border border-emerald-200 bg-white text-xl text-emerald-500 shadow-xl shadow-emerald-200/60"
                >
                  <FaHandHoldingHeart />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 5.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.4,
                  }}
                  className="absolute bottom-0 right-8 flex h-14 w-14 rotate-[-6deg] items-center justify-center rounded-2xl border border-orange-200 bg-white text-xl text-orange-500 shadow-xl shadow-orange-200/60"
                >
                  <FaSearch />
                </motion.div>
              </div>
            </div>
          </motion.section>
        )}

        {/* ================= HEADING ================= */}
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <h2
              className={`${display} text-3xl font-extrabold tracking-tight text-slate-900`}
            >
              Share your item
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Fill in the details below to reach your campus community.
            </p>
          </div>
          <div className="hidden rounded-2xl border border-indigo-100 bg-white px-4 py-2.5 text-xs text-slate-500 shadow-sm sm:block">
            <span className="font-bold text-rose-500">*</span> Required fields
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid items-start gap-8 lg:grid-cols-[1fr_340px]"
        >
          {/* ================= LEFT: FORM ================= */}
          <div className="space-y-6">
            {/* Post type */}
            <Section
              icon={FaTag}
              title="What happened?"
              subtitle="Choose the type of post you want to create."
            >
              <div className="relative grid gap-4 sm:grid-cols-2">
                {typeOptions.map((opt) => {
                  const selected = formData.type === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, type: opt.value }))
                      }
                      className={`flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 ${
                        selected
                          ? opt.active
                          : "border-slate-200 bg-white hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg"
                      }`}
                    >
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg transition ${
                          selected ? opt.iconCls : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <opt.icon />
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong
                          className={`${display} block text-base font-extrabold text-slate-900`}
                        >
                          {opt.title}
                        </strong>
                        <span className="text-xs text-slate-500">
                          {opt.hint}
                        </span>
                      </span>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                          selected ? opt.dot : "border-slate-300"
                        }`}
                      >
                        {selected && (
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* Item information */}
            <Section
              icon={FaBoxOpen}
              title="Item information"
              subtitle="Tell us what the item looks like."
            >
              <div className="grid gap-5">
                <div>
                  <label htmlFor="itemName" className={labelCls}>
                    Item name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="itemName"
                    type="text"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleChange}
                    placeholder="e.g. Black leather wallet"
                    className={fieldCls}
                    required
                  />
                </div>

                <div>
                  <span className={labelCls}>
                    Category <span className="text-rose-500">*</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, category: c }))
                        }
                        className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                          formData.category === c
                            ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200"
                            : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                        }`}
                      >
                        {formatCategory(c)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className={labelCls}>
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describe the item, its color, brand, condition, or anything that can help identify it..."
                    className={areaCls}
                  />
                  <p className="mt-2 text-[11px] text-slate-400">
                    More details can make it easier to identify the item.
                  </p>
                </div>
              </div>
            </Section>

            {/* Images */}
            <Section
              icon={FaCamera}
              title="Item photos"
              subtitle="A picture can make all the difference."
            >
              <ImageUploader
                images={formData.images}
                setImages={updateImages}
              />
            </Section>

            {/* Location and time */}
            <Section
              icon={FaMapMarkerAlt}
              title="Where & when?"
              subtitle="Help others understand where and when it happened."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="area" className={labelCls}>
                    <FaMapMarkerAlt className="text-indigo-500" /> Campus area
                  </label>
                  <input
                    id="area"
                    type="text"
                    name="area"
                    value={formData.location.area}
                    onChange={handleChange}
                    placeholder="e.g. Academic Building"
                    className={fieldCls}
                  />
                </div>

                <div>
                  <label htmlFor="specificLocation" className={labelCls}>
                    <FaMapMarkerAlt className="text-indigo-500" /> Specific
                    location
                  </label>
                  <input
                    id="specificLocation"
                    type="text"
                    name="specificLocation"
                    value={formData.location.specificLocation}
                    onChange={handleChange}
                    placeholder="e.g. Room 204, 2nd floor"
                    className={fieldCls}
                  />
                </div>

                <div>
                  <label htmlFor="date" className={labelCls}>
                    <FaCalendarAlt className="text-indigo-500" /> Date
                  </label>
                  <input
                    id="date"
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={fieldCls}
                  />
                </div>

                <div>
                  <label htmlFor="approximateTime" className={labelCls}>
                    <FaClock className="text-indigo-500" /> Approximate time
                  </label>
                  <input
                    id="approximateTime"
                    type="time"
                    name="approximateTime"
                    value={formData.approximateTime}
                    onChange={handleChange}
                    className={fieldCls}
                  />
                </div>
              </div>
            </Section>

            {/* Additional details */}
            <Section
              icon={FaRegLightbulb}
              title="Additional details"
              subtitle="Any special information that might help."
            >
              <div className="grid gap-5">
                <div>
                  <label htmlFor="identifyingFeatures" className={labelCls}>
                    <FaTag className="text-amber-500" /> Identifying features
                  </label>
                  <textarea
                    id="identifyingFeatures"
                    name="identifyingFeatures"
                    value={formData.identifyingFeatures}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Any scratches, stickers, unique marks, initials, or special features..."
                    className={areaCls}
                  />
                </div>

                <div>
                  <label htmlFor="contactPreference" className={labelCls}>
                    <FaPhoneAlt className="text-indigo-500" /> Contact number
                  </label>
                  <input
                    id="contactPreference"
                    type="tel"
                    name="contactPreference"
                    value={
                      formData.contactPreference ?? loggedInUser?.phone ?? ""
                    }
                    onChange={handleChange}
                    placeholder="Enter your contact number"
                    className={fieldCls}
                  />
                  <p className="mt-2 text-[11px] text-slate-400">
                    People can use this number to contact you about the item.
                  </p>
                </div>
              </div>
            </Section>

            {/* Submit */}
            <section className="flex flex-col gap-5 rounded-3xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-violet-100/70 p-5 shadow-xl shadow-indigo-100/60 sm:flex-row sm:items-center sm:justify-between sm:p-7">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-emerald-500">
                  <FaCheckCircle />
                </span>
                <div>
                  <h3
                    className={`${display} text-lg font-extrabold text-slate-900`}
                  >
                    Ready to publish?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Your post will be shared with the CampusFind community.
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.04, y: -3 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={mutation.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-300 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {mutation.isPending ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Publishing...
                  </>
                ) : (
                  "Publish post"
                )}
              </motion.button>
            </section>

            <p className="flex items-center justify-center gap-2 text-center text-xs text-slate-400">
              <FaShieldAlt className="text-indigo-400" />
              Please provide accurate information to help your campus community.
            </p>
          </div>

          {/* ================= RIGHT: LIVE PREVIEW ================= */}
          <aside className="hidden lg:sticky lg:top-24 lg:block">
            <p className="mb-3 text-xs font-bold text-slate-500">
              Live preview
            </p>
            <article className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg shadow-slate-200/50">
              <div className="relative h-52 overflow-hidden bg-slate-100">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-indigo-50 to-violet-100 text-indigo-300">
                    <FaImage className="text-5xl" />
                    <span className="text-[11px] font-medium">
                      Your photo will appear here
                    </span>
                  </div>
                )}
                <div
                  className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold capitalize shadow-lg ${style.badge}`}
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  {formData.type}
                </div>
                {formData.images?.length > 1 && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                    <FaImage /> {formData.images.length}
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
                    {formData.category
                      ? formatCategory(formData.category)
                      : "Category"}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {formatDate(formData.date)}
                  </span>
                </div>

                <h3
                  className={`${display} truncate text-lg font-extrabold text-slate-900`}
                >
                  {formData.itemName || "Item name"}
                </h3>

                <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
                  {formData.description || "No description provided."}
                </p>

                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
                  <FaMapMarkerAlt className="shrink-0 text-indigo-500" />
                  <span className="truncate">
                    {previewLocation || "Location not specified"}
                  </span>
                </div>
              </div>
            </article>
            <p className="mt-3 text-[11px] leading-5 text-slate-400">
              This is how your post will look in the All posts list.
            </p>
          </aside>
        </form>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-2 text-center text-xs text-slate-400">
          <FaHandHoldingHeart className="text-indigo-400" />
          Together, we make our campus a better place.
        </div>
      </div>
    </div>
  );
};

export default NewPost;
