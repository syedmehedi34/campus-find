import { useState } from "react";
import { useLocation } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  FaCheck,
  FaImage,
  FaCamera,
} from "react-icons/fa";

import ImageUploader from "./ImageUploader";
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

// =====================================
//              HELPERS
// =====================================

const formatCategory = (category = "") =>
  category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const formatDate = (date) => {
  if (!date) return "Date not set";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/* ---------- shared input styles ---------- */
const inputCls =
  "w-full rounded-xl border border-[#dbe7e3] bg-[#f8fbfa] px-4 text-sm text-[#10312c] outline-none transition placeholder:text-[#a4b4b0] focus:border-[#0d9467] focus:bg-white focus:ring-4 focus:ring-[#0d9467]/10";
const fieldCls = `${inputCls} h-11`;
const areaCls = `${inputCls} resize-y py-3 leading-6`;
const labelCls =
  "mb-2 flex items-center gap-2 text-[13px] font-medium text-[#3c5a53]";

const typeOptions = [
  {
    value: "lost",
    title: "I lost something",
    hint: "Help me find my missing item",
    icon: FaSearch,
    active: "border-rose-400 bg-rose-50/70",
    iconCls: "bg-rose-500 text-white",
    dot: "border-rose-500 bg-rose-500",
  },
  {
    value: "found",
    title: "I found something",
    hint: "Help return an item to its owner",
    icon: FaHandHoldingHeart,
    active: "border-[#0d9467] bg-[#e8f6ef]",
    iconCls: "bg-[#0d9467] text-white",
    dot: "border-[#0d9467] bg-[#0d9467]",
  },
];

const steps = [
  "Choose whether you lost or found an item",
  "Add details, photos and where it happened",
  "Publish and let your campus help",
];

// =====================================
//              SMALL PIECES
// =====================================

const Section = ({ icon: Icon, title, subtitle, children }) => (
  <section className="rounded-[22px] border border-[#e3ebe8] bg-white p-5 sm:p-6">
    <div className="mb-5 flex items-center gap-3.5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e3f4ec] text-[#0d7a55]">
        <Icon size={16} />
      </span>
      <div>
        <h3 className="cf-display text-[17px] font-semibold text-[#10312c]">
          {title}
        </h3>
        <p className="text-[13px] text-[#7a8f8a]">{subtitle}</p>
      </div>
    </div>
    {children}
  </section>
);

// =====================================
//              MAIN PAGE
// =====================================

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

  const isLost = formData.type === "lost";
  const previewImage = formData.images?.[0];
  const previewLocation = [
    formData.location.area,
    formData.location.specificLocation,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="cf-root min-h-screen bg-[#f3f7f5] px-4 py-7 md:px-6">
      <style>{styles}</style>

      <div className="mx-auto max-w-7xl">
        {/* ================= HERO (public route only) ================= */}
        {showHero && (
          <section className="cf-rise relative mb-8 overflow-hidden rounded-[28px] bg-[#0b2a26] p-6 text-white md:p-10">
            <div className="cf-drift pointer-events-none absolute -right-24 -top-32 h-[380px] w-[380px] rounded-full bg-[#1c8f6b]/30 blur-3xl" />
            <div
              className="cf-drift pointer-events-none absolute -bottom-40 left-1/4 h-[320px] w-[320px] rounded-full bg-[#f5a524]/10 blur-3xl"
              style={{ animationDelay: "-6s" }}
            />

            <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <p className="flex items-center gap-2 text-sm text-[#9fc9bd]">
                  <FaHandHoldingHeart />
                  Community starts with helping
                </p>

                <h1 className="cf-display mt-4 text-4xl font-extrabold leading-[1.08] sm:text-5xl md:text-[56px]">
                  Lost or found something? Let&apos;s sort it out together.
                </h1>

                <p className="mt-5 max-w-xl text-base leading-7 text-[#c4e0d8]">
                  Every item has an owner. Share the details with your campus
                  community and help it find its way home.
                </p>
              </div>

              <div className="rounded-2xl bg-white/6 p-5 ring-1 ring-white/10 backdrop-blur-sm">
                <h2 className="cf-display text-lg font-semibold">
                  How it works
                </h2>
                <ol className="mt-4 space-y-4">
                  {steps.map((text, i) => (
                    <li key={text} className="flex items-center gap-3.5">
                      <span className="cf-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3ddc97] text-sm font-bold text-[#0b2a26]">
                        {i + 1}
                      </span>
                      <span className="text-sm text-[#c4e0d8]">{text}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>
        )}

        {/* ================= HEADING ================= */}
        <header className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="cf-display text-3xl font-bold text-[#10312c] md:text-[40px] md:leading-[1.1]">
              Share your item
            </h2>
            <p className="mt-2 text-[15px] text-[#6d837d]">
              Fill in the details below to reach your campus community.
            </p>
          </div>
          <div className="hidden rounded-full border border-[#dbe7e3] bg-white px-4 py-2 text-[13px] text-[#6d837d] sm:block">
            <span className="font-bold text-rose-500">*</span> Required fields
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="grid items-start gap-6 lg:grid-cols-[1fr_340px]"
        >
          {/* ================= LEFT: FORM ================= */}
          <div className="space-y-6">
            {/* Post type */}
            <Section
              icon={FaTag}
              title="What happened?"
              subtitle="Choose the type of post you want to create."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {typeOptions.map((opt) => {
                  const selected = formData.type === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, type: opt.value }))
                      }
                      className={`flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0d9467]/20 ${
                        selected
                          ? opt.active
                          : "border-[#e3ebe8] bg-white hover:border-[#bfd9d0] hover:bg-[#f8fbfa]"
                      }`}
                    >
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg transition ${
                          selected ? opt.iconCls : "bg-[#eef4f2] text-[#6d837d]"
                        }`}
                      >
                        <opt.icon />
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="cf-display block text-base font-semibold text-[#10312c]">
                          {opt.title}
                        </strong>
                        <span className="text-xs text-[#7a8f8a]">
                          {opt.hint}
                        </span>
                      </span>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                          selected ? opt.dot : "border-[#c3d3cf]"
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
                        aria-pressed={formData.category === c}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, category: c }))
                        }
                        className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                          formData.category === c
                            ? "bg-[#0b2a26] text-white"
                            : "border border-[#dbe7e3] bg-white text-[#3c5a53] hover:bg-[#e8f6ef] hover:text-[#0d7a55]"
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
                  <p className="mt-2 text-xs text-[#8ea19c]">
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
              title="Where and when?"
              subtitle="Help others understand where and when it happened."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="area" className={labelCls}>
                    <FaMapMarkerAlt className="text-[#0d9467]" /> Campus area
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
                    <FaMapMarkerAlt className="text-[#0d9467]" /> Specific
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
                    <FaCalendarAlt className="text-[#0d9467]" /> Date
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
                    <FaClock className="text-[#0d9467]" /> Approximate time
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
                    <FaPhoneAlt className="text-[#0d9467]" /> Contact number
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
                  <p className="mt-2 text-xs text-[#8ea19c]">
                    People can use this number to contact you about the item.
                  </p>
                </div>
              </div>
            </Section>

            {/* Submit */}
            <section className="relative overflow-hidden rounded-[22px] bg-[#0b2a26] p-5 text-white sm:p-6">
              <div className="cf-drift pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#1c8f6b]/30 blur-3xl" />

              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#3ddc97]/15 text-[#3ddc97]">
                    <FaCheck />
                  </span>
                  <div>
                    <h3 className="cf-display text-lg font-semibold">
                      Ready to publish?
                    </h3>
                    <p className="text-[13px] text-[#9fc9bd]">
                      Your post will be shared with the CampusFind community.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#3ddc97] px-8 text-sm font-semibold text-[#0b2a26] transition hover:bg-[#5ae6a9] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {mutation.isPending ? (
                    <>
                      <span className="cf-spin h-4 w-4 rounded-full border-2 border-[#0b2a26]/30 border-t-[#0b2a26]" />
                      Publishing...
                    </>
                  ) : (
                    "Publish post"
                  )}
                </button>
              </div>
            </section>

            <p className="text-center text-xs text-[#9ab0aa]">
              Please provide accurate information to help your campus community.
            </p>
          </div>

          {/* ================= RIGHT: LIVE PREVIEW ================= */}
          <aside className="hidden lg:sticky lg:top-24 lg:block">
            <p className="mb-3 flex items-center gap-2 text-[13px] font-medium text-[#6d837d]">
              <span className="cf-live h-2 w-2 rounded-full bg-[#2fc785]" />
              Live preview
            </p>

            <article className="overflow-hidden rounded-[22px] border border-[#e3ebe8] bg-white">
              <div className="relative h-52 overflow-hidden bg-[#eef4f2]">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#b5c9c3]">
                    <FaImage className="text-5xl" />
                    <span className="text-[11px] font-medium text-[#8ea19c]">
                      Your photo will appear here
                    </span>
                  </div>
                )}

                <span
                  className={`absolute left-3 top-3 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ring-inset backdrop-blur-sm ${
                    isLost
                      ? "bg-rose-50/95 text-rose-700 ring-rose-600/15"
                      : "bg-teal-50/95 text-teal-700 ring-teal-600/15"
                  }`}
                >
                  {formData.type}
                </span>

                {formData.images?.length > 1 && (
                  <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                    <FaImage /> {formData.images.length}
                  </span>
                )}
              </div>

              <div className="p-5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-[#0d7a55]">
                    {formData.category
                      ? formatCategory(formData.category)
                      : "Category"}
                  </span>
                  <span className="text-[11px] text-[#8ea19c]">
                    {formatDate(formData.date)}
                  </span>
                </div>

                <h3 className="cf-display truncate text-[17px] font-semibold text-[#10312c]">
                  {formData.itemName || "Item name"}
                </h3>

                <p className="mt-1.5 line-clamp-2 min-h-10 text-[13px] leading-5 text-[#7a8f8a]">
                  {formData.description || "No description provided."}
                </p>

                <div className="mt-4 flex items-center gap-2 border-t border-[#edf2f0] pt-4 text-xs text-[#3c5a53]">
                  <FaMapMarkerAlt className="shrink-0 text-[#0d9467]" />
                  <span className="truncate">
                    {previewLocation || "Location not specified"}
                  </span>
                </div>
              </div>
            </article>

            <p className="mt-3 text-xs leading-5 text-[#8ea19c]">
              This is how your post will look in the posts list.
            </p>
          </aside>
        </form>

        <p className="mt-10 text-center text-xs text-[#9ab0aa]">
          Together, we make our campus a better place.
        </p>
      </div>
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
  @keyframes cf-spin { to { transform: rotate(360deg); } }
  .cf-rise { opacity: 0; animation: cf-rise .7s cubic-bezier(.2,.8,.2,1) forwards; }
  .cf-live { animation: cf-pulse 1.8s infinite; }
  .cf-drift { animation: cf-drift 14s ease-in-out infinite; }
  .cf-spin { animation: cf-spin .9s linear infinite; }
  @media (prefers-reduced-motion: reduce) {
    .cf-rise, .cf-live, .cf-drift, .cf-spin { animation: none !important; opacity: 1; }
  }
`;

export default NewPost;
