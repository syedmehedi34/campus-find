import { useRef, useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaUniversity,
  FaGraduationCap,
  FaIdCard,
  FaCalendarAlt,
  FaEdit,
  FaCamera,
  FaSave,
  FaTimes,
  FaShieldAlt,
  FaCheckCircle,
  FaUserCircle,
  FaBookOpen,
} from "react-icons/fa";

import Swal from "sweetalert2";
import useUserData from "../../hooks/useUserData";

// ==============================
// Reusable Info Card
// ==============================

const InfoCard = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition hover:border-emerald-100 hover:shadow-md">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
      <Icon size={17} />
    </div>

    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-bold text-slate-700">
        {value || "Not provided"}
      </p>
    </div>
  </div>
);

// ==============================
// Reusable Input Field
// ==============================

const InputField = ({
  label,
  name,
  value,
  icon: Icon,
  placeholder,
  type = "text",
  onChange,
}) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label}
    </label>

    <div className="relative">
      {Icon && (
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
      )}

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        className={`w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 ${
          Icon ? "pl-11" : "pl-4"
        }`}
      />
    </div>
  </div>
);

// ==============================
// Main Component
// ==============================

const MyProfile = () => {
  const {
    loggedInUser,
    loggedInUserLoading,
    updateUserProfileAsync,
    updating,
  } = useUserData();

  if (loggedInUserLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-5 md:p-8">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="mb-6 h-10 w-56 rounded-xl bg-slate-200" />
          <div className="h-64 rounded-3xl bg-slate-200" />

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="h-48 rounded-3xl bg-slate-200" />
            <div className="h-48 rounded-3xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!loggedInUser) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-5">
        <div className="text-center">
          <FaUserCircle className="mx-auto mb-4 text-5xl text-slate-300" />

          <h2 className="text-xl font-bold text-slate-800">
            Profile Not Found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            We couldn't load your profile information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProfileContent
      key={loggedInUser.userId}
      user={loggedInUser}
      updateUserProfileAsync={updateUserProfileAsync}
      updating={updating}
    />
  );
};

// ==============================
// Profile Content
// ==============================

const ProfileContent = ({ user, updateUserProfileAsync, updating }) => {
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [photoPreview, setPhotoPreview] = useState(user.photoUrl || "");

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    department: user.department || "",
    studentId: user.studentId || "",
    batch: user.batch || "",
    bio: user.bio || "",
    photoUrl: user.photoUrl || "",
  });

  const initials = (user.name || user.email || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  // ==============================
  // Handle Input Change
  // ==============================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==============================
  // ImgBB Image Upload
  // ==============================

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return Swal.fire("Invalid File", "Please select an image.", "warning");
    }

    if (file.size > 5 * 1024 * 1024) {
      return Swal.fire(
        "Image Too Large",
        "Please select an image smaller than 5 MB.",
        "warning",
      );
    }

    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;

    if (!apiKey) {
      return Swal.fire(
        "Configuration Error",
        "ImgBB API key is missing. Please configure VITE_IMGBB_API_KEY.",
        "error",
      );
    }

    try {
      setUploading(true);

      const imageData = new FormData();
      imageData.append("image", file);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${apiKey}`,
        {
          method: "POST",
          body: imageData,
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || "Image upload failed.");
      }

      const imageUrl = result.data.display_url;

      setFormData((prev) => ({
        ...prev,
        photoUrl: imageUrl,
      }));

      setPhotoPreview(imageUrl);

      Swal.fire({
        icon: "success",
        title: "Photo Uploaded!",
        text: "Your new profile picture is ready to save.",
        timer: 1300,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire(
        "Upload Failed",
        error.message || "Could not upload your image.",
        "error",
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // ==============================
  // Save Profile
  // ==============================

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return Swal.fire("Required", "Please enter your name.", "warning");
    }

    if (uploading) {
      return Swal.fire(
        "Please Wait",
        "Your profile picture is still uploading.",
        "info",
      );
    }

    try {
      await updateUserProfileAsync({
        userId: user.userId,
        data: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          department: formData.department.trim(),
          studentId: formData.studentId.trim(),
          batch: formData.batch.trim(),
          bio: formData.bio.trim(),
          photoUrl: formData.photoUrl,
        },
      });

      setEditMode(false);

      Swal.fire({
        icon: "success",
        title: "Profile Updated!",
        text: "Your profile information has been saved.",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire(
        "Update Failed",
        error.response?.data?.message || "Something went wrong.",
        "error",
      );
    }
  };

  // ==============================
  // Cancel Editing
  // ==============================

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      phone: user.phone || "",
      department: user.department || "",
      studentId: user.studentId || "",
      batch: user.batch || "",
      bio: user.bio || "",
      photoUrl: user.photoUrl || "",
    });

    setPhotoPreview(user.photoUrl || "");
    setEditMode(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f8f7] px-4 py-7 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        {/* Page Heading */}

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Account Settings
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 md:text-4xl">
              My Profile
            </h1>

            <p className="mt-2 text-sm text-slate-500 md:text-base">
              Manage your personal information and account details.
            </p>
          </div>

          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700"
            >
              <FaEdit />
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Hero Card */}

        <div className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-[#102f2b] via-[#145447] to-[#087b60] shadow-xl shadow-emerald-900/10">
          {/* Decorative Background */}

          <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border-[35px] border-white/5" />

          <div className="absolute -bottom-32 right-40 h-64 w-64 rounded-full border-[25px] border-white/5" />

          <div className="relative flex flex-col items-center gap-6 px-6 py-10 text-center md:flex-row md:px-10 md:py-12 md:text-left">
            {/* Profile Picture */}

            <div className="relative shrink-0">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-[5px] border-white/30 bg-white/10 shadow-2xl md:h-36 md:w-36">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt={user.name || "Profile"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-5xl font-extrabold text-white">
                    {initials}
                  </span>
                )}
              </div>

              {editMode && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-1 right-1 flex h-11 w-11 items-center justify-center rounded-full border-4 border-[#145447] bg-white text-emerald-700 shadow-lg transition hover:scale-105 disabled:opacity-60"
                  title="Change profile picture"
                >
                  {uploading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                  ) : (
                    <FaCamera size={16} />
                  )}
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* User Information */}

            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-100">
                  {user.role || "User"}
                </span>

                <span className="flex items-center gap-1.5 rounded-full bg-emerald-300/15 px-3 py-1 text-[11px] font-bold text-emerald-100">
                  <FaCheckCircle />
                  Account Active
                </span>
              </div>

              <h2 className="break-words text-3xl font-extrabold text-white md:text-4xl">
                {user.name || "Your Name"}
              </h2>

              <p className="mt-2 flex items-center justify-center gap-2 break-all text-sm text-emerald-100/80 md:justify-start">
                <FaEnvelope className="shrink-0" />
                {user.email}
              </p>

              <p className="mt-4 max-w-xl text-sm leading-6 text-emerald-50/70">
                {editMode
                  ? formData.bio ||
                    "Welcome to your CampusFind profile. Keep your information updated so others can connect with you easily."
                  : user.bio ||
                    "Welcome to your CampusFind profile. Keep your information updated so others can connect with you easily."}
              </p>
            </div>

            {/* Member Info */}

            <div className="hidden shrink-0 rounded-2xl border border-white/10 bg-white/10 p-5 text-center backdrop-blur-sm md:block">
              <FaUniversity className="mx-auto mb-2 text-2xl text-emerald-200" />

              <p className="text-xs font-medium text-emerald-100/70">
                Campus Member
              </p>

              <p className="mt-1 max-w-32 truncate text-sm font-bold text-white">
                {user.collegeId || "CampusFind"}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Profile */}

        {editMode ? (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Personal Information */}

            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5 md:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <FaUser />
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-800">
                      Personal Information
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Update your personal details
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-6 md:grid-cols-2 md:p-8">
                <InputField
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  icon={FaUser}
                  onChange={handleChange}
                />

                <InputField
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  icon={FaPhone}
                  placeholder="01XXXXXXXXX"
                  onChange={handleChange}
                />

                <InputField
                  label="Department"
                  name="department"
                  value={formData.department}
                  icon={FaGraduationCap}
                  onChange={handleChange}
                />

                <InputField
                  label="Batch / Session"
                  name="batch"
                  value={formData.batch}
                  icon={FaCalendarAlt}
                  placeholder="e.g. 2022-23"
                  onChange={handleChange}
                />

                {/* Read-only Email */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>

                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                    <input
                      type="email"
                      value={user.email || ""}
                      readOnly
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 py-3.5 pl-11 pr-4 text-sm text-slate-500 outline-none"
                    />
                  </div>

                  <p className="mt-1.5 text-xs text-slate-400">
                    Email is managed through Firebase Authentication.
                  </p>
                </div>

                {/* Read-only College */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    University / College ID
                  </label>

                  <div className="relative">
                    <FaUniversity className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                    <input
                      value={user.collegeId || ""}
                      readOnly
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 py-3.5 pl-11 pr-4 text-sm text-slate-500 outline-none"
                    />
                  </div>

                  <p className="mt-1.5 text-xs text-slate-400">
                    Campus affiliation is managed by the platform.
                  </p>
                </div>

                {/* Bio */}

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    About Me
                  </label>

                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    maxLength={300}
                    placeholder="Write something about yourself..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />

                  <p className="mt-1 text-right text-xs text-slate-400">
                    {formData.bio.length}/300
                  </p>
                </div>
              </div>
            </div>

            {/* Account Information */}

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <FaShieldAlt />
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-800">
                    Account Information
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Protected account details
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Account Role
                  </p>

                  <p className="mt-2 text-sm font-bold capitalize text-slate-700">
                    {user.role || "user"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    User ID
                  </p>

                  <p className="mt-2 break-all text-sm font-bold text-slate-700">
                    {user.userId}
                  </p>
                </div>
              </div>
            </div>

            {/* Save / Cancel */}

            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleCancel}
                disabled={updating || uploading}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <FaTimes />
                Cancel
              </button>

              <button
                type="submit"
                disabled={updating || uploading}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaSave />
                {uploading
                  ? "Uploading Photo..."
                  : updating
                    ? "Saving Profile..."
                    : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Profile Information */}

            <div className="mb-7 grid gap-6 lg:grid-cols-3">
              {/* Personal Details */}

              <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm lg:col-span-2">
                <div className="border-b border-slate-100 px-6 py-5 md:px-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <FaUser />
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-800">
                        Personal Information
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        Your personal profile details
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 p-6 sm:grid-cols-2 md:p-8">
                  <InfoCard icon={FaUser} label="Full Name" value={user.name} />

                  <InfoCard
                    icon={FaEnvelope}
                    label="Email Address"
                    value={user.email}
                  />

                  <InfoCard
                    icon={FaPhone}
                    label="Phone Number"
                    value={user.phone}
                  />

                  <InfoCard
                    icon={FaGraduationCap}
                    label="Department"
                    value={user.department}
                  />

                  <InfoCard
                    icon={FaCalendarAlt}
                    label="Batch / Session"
                    value={user.batch}
                  />
                </div>
              </div>

              {/* University Details */}

              <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <FaUniversity />
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-800">
                        Campus Details
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        Your institution
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 p-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      College ID
                    </p>

                    <p className="mt-2 break-words font-bold text-slate-700">
                      {user.collegeId || "Not provided"}
                    </p>
                  </div>

                  <div className="h-px bg-slate-100" />

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Department
                    </p>

                    <p className="mt-2 font-bold text-slate-700">
                      {user.department || "Not provided"}
                    </p>
                  </div>

                  <div className="h-px bg-slate-100" />

                  <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
                    <FaBookOpen className="mb-2 text-xl text-emerald-600" />

                    <p className="text-xs font-semibold text-emerald-800">
                      CampusFind Community
                    </p>

                    <p className="mt-1 text-xs leading-5 text-emerald-700/70">
                      Helping your campus community reconnect with lost
                      belongings.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* About Me */}

            <div className="mb-7 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <FaUserCircle />
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-800">About Me</h3>

                  <p className="mt-1 text-xs text-slate-400">
                    A little introduction about yourself
                  </p>
                </div>
              </div>

              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {user.bio ||
                  "You haven't added anything about yourself yet. Click Edit Profile to introduce yourself."}
              </p>
            </div>

            {/* Account Security */}

            <div className="flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-emerald-50/70 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                  <FaShieldAlt size={20} />
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-800">
                    Your Account is Protected
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Your login credentials and account role are protected.
                  </p>
                </div>
              </div>

              <span className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                <FaCheckCircle />
                Secure Account
              </span>
            </div>
          </>
        )}

        <p className="mt-8 text-center text-xs text-slate-400">
          CampusFind · Your campus, connected.
        </p>
      </div>
    </div>
  );
};

export default MyProfile;
