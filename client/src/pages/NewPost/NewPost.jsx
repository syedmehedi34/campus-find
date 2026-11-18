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
  FaRegFileAlt,
  FaRegLightbulb,
  FaArrowRight,
  FaShieldAlt,
  FaCheckCircle,
} from "react-icons/fa";

import ImageUploader from "./ImageUploader";
import useUserData from "../../hooks/useUserData";
import useAxiosPublic from "../../hooks/useAxiosPublic";

import "./NewPost.css";

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

  return (
    <div className="new-post-page">
      <div className="np-glow np-glow-one"></div>
      <div className="np-glow np-glow-two"></div>
      <div className="np-grid-pattern"></div>

      <div className="np-container">
        {/* Hero section */}
        {showHero && (
          <section className="np-hero">
            <div className="np-hero-content">
              <div className="np-breadcrumb">
                <span>CampusFind</span>
                <span className="np-breadcrumb-dot">/</span>
                <span>Create Post</span>
              </div>

              <div className="np-hero-badge">
                <FaHandHoldingHeart />
                <span>Community starts with helping</span>
              </div>

              <h1>
                Lost something?
                <br />
                <span>Let's find it together.</span>
              </h1>

              <p className="np-hero-description">
                Every lost item has a story. Share the details with your campus
                community and let someone help bring it back home.
              </p>

              <div className="np-hero-features">
                <div>
                  <FaShieldAlt />
                  <span>Campus community</span>
                </div>
                <div>
                  <FaSearch />
                  <span>Easy discovery</span>
                </div>
                <div>
                  <FaHandHoldingHeart />
                  <span>Help each other</span>
                </div>
              </div>
            </div>

            <div className="np-hero-visual">
              <div className="np-orbit np-orbit-one"></div>
              <div className="np-orbit np-orbit-two"></div>

              <div className="np-visual-card">
                <div className="np-visual-icon">
                  <FaBoxOpen />
                </div>
                <span className="np-visual-small">
                  A little help goes a long way
                </span>
                <h3>Someone might be looking for this.</h3>
                <div className="np-visual-status">
                  <span></span>
                  Make someone's day better
                </div>
              </div>

              <div className="np-floating-icon np-floating-one">
                <FaSearch />
              </div>
              <div className="np-floating-icon np-floating-two">
                <FaHandHoldingHeart />
              </div>
            </div>
          </section>
        )}

        {/* Form heading */}
        <div className="np-form-heading">
          <div>
            <span className="np-section-eyebrow">CREATE A LISTING</span>
            <h2>Share your item</h2>
            <p>Fill in the details below to reach your campus community.</p>
          </div>

          <div className="np-required-note">
            <span>*</span> Required fields
          </div>
        </div>

        <form onSubmit={handleSubmit} className="np-form">
          {/* Post type */}
          <section className="np-card np-type-card">
            <div className="np-card-heading">
              <div className="np-heading-icon">
                <FaTag />
              </div>
              <div>
                <h3>What happened?</h3>
                <p>Choose the type of post you want to create.</p>
              </div>
            </div>

            <div className="np-type-options">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, type: "lost" }))
                }
                className={`np-type-option ${
                  formData.type === "lost" ? "active lost-active" : ""
                }`}
              >
                <div className="np-type-icon lost-icon">
                  <FaSearch />
                </div>
                <div className="np-type-text">
                  <strong>I lost something</strong>
                  <span>Help me find my missing item</span>
                </div>
                <span className="np-radio">
                  {formData.type === "lost" && <span />}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, type: "found" }))
                }
                className={`np-type-option ${
                  formData.type === "found" ? "active found-active" : ""
                }`}
              >
                <div className="np-type-icon found-icon">
                  <FaHandHoldingHeart />
                </div>
                <div className="np-type-text">
                  <strong>I found something</strong>
                  <span>Help return an item to its owner</span>
                </div>
                <span className="np-radio">
                  {formData.type === "found" && <span />}
                </span>
              </button>
            </div>
          </section>

          {/* Item information */}
          <section className="np-card">
            <div className="np-card-heading">
              <div className="np-heading-icon">
                <FaBoxOpen />
              </div>
              <div>
                <h3>Item information</h3>
                <p>Tell us what the item looks like.</p>
              </div>
              <span className="np-step">01</span>
            </div>

            <div className="np-field-grid">
              <div className="np-field np-full">
                <label htmlFor="itemName">
                  Item name <span>*</span>
                </label>
                <input
                  id="itemName"
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  placeholder="e.g. Black leather wallet"
                  required
                />
              </div>

              <div className="np-field np-full">
                <label htmlFor="category">
                  Category <span>*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose an item category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category
                        .split("-")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="np-field np-full">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe the item, its color, brand, condition, or anything that can help identify it..."
                />
                <span className="np-field-hint">
                  More details can make it easier to identify the item.
                </span>
              </div>
            </div>
          </section>

          {/* Images */}
          <section className="np-card">
            <div className="np-card-heading">
              <div className="np-heading-icon">
                <FaSearch />
              </div>
              <div>
                <h3>Item photos</h3>
                <p>A picture can make all the difference.</p>
              </div>
              <span className="np-step">02</span>
            </div>

            <ImageUploader images={formData.images} setImages={updateImages} />
          </section>

          {/* Location and time */}
          <section className="np-card">
            <div className="np-card-heading">
              <div className="np-heading-icon">
                <FaMapMarkerAlt />
              </div>
              <div>
                <h3>Where & when?</h3>
                <p>Help others understand where and when it happened.</p>
              </div>
              <span className="np-step">03</span>
            </div>

            <div className="np-field-grid">
              <div className="np-field">
                <label htmlFor="area">
                  <FaMapMarkerAlt /> Campus area
                </label>
                <input
                  id="area"
                  type="text"
                  name="area"
                  value={formData.location.area}
                  onChange={handleChange}
                  placeholder="e.g. Academic Building"
                />
              </div>

              <div className="np-field">
                <label htmlFor="specificLocation">Specific location</label>
                <input
                  id="specificLocation"
                  type="text"
                  name="specificLocation"
                  value={formData.location.specificLocation}
                  onChange={handleChange}
                  placeholder="e.g. Room 204, 2nd floor"
                />
              </div>

              <div className="np-field">
                <label htmlFor="date">
                  <FaCalendarAlt /> Date
                </label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>

              <div className="np-field">
                <label htmlFor="approximateTime">
                  <FaClock /> Approximate time
                </label>
                <input
                  id="approximateTime"
                  type="time"
                  name="approximateTime"
                  value={formData.approximateTime}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* Additional details */}
          <section className="np-card">
            <div className="np-card-heading">
              <div className="np-heading-icon">
                <FaRegLightbulb />
              </div>
              <div>
                <h3>Additional details</h3>
                <p>Any special information that might help.</p>
              </div>
              <span className="np-step">04</span>
            </div>

            <div className="np-field-grid">
              <div className="np-field np-full">
                <label htmlFor="identifyingFeatures">
                  Identifying features
                </label>
                <textarea
                  id="identifyingFeatures"
                  name="identifyingFeatures"
                  value={formData.identifyingFeatures}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any scratches, stickers, unique marks, initials, or special features..."
                />
              </div>

              <div className="np-field np-full">
                <label htmlFor="contactPreference">
                  <FaPhoneAlt /> Contact number
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
                />
                <span className="np-field-hint">
                  People can use this number to contact you about the item.
                </span>
              </div>
            </div>
          </section>

          {/* Submit section */}
          <section className="np-submit-card">
            <div className="np-submit-info">
              <div className="np-submit-check">
                <FaCheckCircle />
              </div>
              <div>
                <h3>Ready to publish?</h3>
                <p>
                  Your post will be shared with the LostHub campus community.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="np-submit-button"
            >
              {mutation.isPending ? (
                <>
                  <span className="np-spinner"></span>
                  Publishing...
                </>
              ) : (
                <>
                  Publish post
                  <FaArrowRight />
                </>
              )}
            </button>
          </section>

          <p className="np-footer-note">
            <FaShieldAlt />
            Please provide accurate information to help your campus community.
          </p>
        </form>
      </div>
    </div>
  );
};

export default NewPost;
