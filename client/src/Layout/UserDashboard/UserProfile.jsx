import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaBuilding,
  FaCalendarAlt,
  FaCamera,
  FaCheck,
  FaClock,
  FaEdit,
  FaEnvelope,
  FaGraduationCap,
  FaIdCard,
  FaPhone,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import Swal from "sweetalert2";

import useUserData from "../../hooks/useUserData";

// =====================================
//              HELPERS
// =====================================

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const timeAgo = (date) => {
  if (!date) return "";
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return formatDate(date);
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

const buildForm = (user) => ({
  name: user.name || "",
  phone: user.phone || "",
  department: user.department || "",
  studentId: user.studentId || "",
  batch: user.batch || "",
  bio: user.bio || "",
  photoUrl: user.photoUrl || "",
});

// =====================================
//              SMALL PIECES
// =====================================

const Panel = ({ title, hint, action, children, className = "" }) => (
  <section
    className={`rounded-[22px] border border-[#e3ebe8] bg-white p-6 ${className}`}
  >
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h3 className="cf-display text-[17px] font-semibold text-[#10312c]">
          {title}
        </h3>
        {hint && <p className="mt-0.5 text-[13px] text-[#7a8f8a]">{hint}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

const Stat = ({ icon: Icon, label, value, note }) => (
  <div className="min-w-0 flex-1 px-6 py-5">
    <div className="flex items-center gap-2 text-[13px] font-medium text-[#6d837d]">
      <Icon className="text-[#0d9467]" />
      {label}
    </div>
    <p className="cf-display mt-2 truncate text-[28px] font-bold leading-none text-[#10312c]">
      {value || <span className="text-[#b5c4c0]">—</span>}
    </p>
    <p className="mt-2 truncate text-xs text-[#8ea19c]">{note}</p>
  </div>
);

const DetailRow = ({ icon: Icon, label, value }) => (
  <li className="flex items-center gap-4 py-3.5">
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef4f2] text-[#0d9467]">
      <Icon size={15} />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-[#8ea19c]">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-[#10312c]">
        {value || <span className="font-normal text-[#a4b4b0]">Not added</span>}
      </p>
    </div>
  </li>
);

const Field = ({
  label,
  name,
  value,
  icon: Icon,
  placeholder,
  onChange,
  readOnly = false,
  note,
}) => (
  <div>
    <label
      htmlFor={name}
      className="mb-2 block text-[13px] font-medium text-[#3c5a53]"
    >
      {label}
    </label>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#93a7a2]" />
      <input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition ${
          readOnly
            ? "cursor-not-allowed border-[#e3ebe8] bg-[#f3f7f5] text-[#7a8f8a]"
            : "border-[#dbe7e3] bg-[#f8fbfa] text-[#10312c] placeholder:text-[#a4b4b0] focus:border-[#0d9467] focus:bg-white focus:ring-4 focus:ring-[#0d9467]/10"
        }`}
      />
    </div>
    {note && <p className="mt-1.5 text-xs text-[#8ea19c]">{note}</p>}
  </div>
);

// =====================================
//              MAIN PAGE
// =====================================

const MyProfile = () => {
  const {
    loggedInUser,
    loggedInUserLoading,
    updateUserProfileAsync,
    updating,
  } = useUserData();

  if (loggedInUserLoading) {
    return (
      <div className="min-h-screen bg-[#f3f7f5] px-4 py-7 md:px-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="cf-shimmer h-12 w-72 rounded-xl" />
          <div className="cf-shimmer h-72 rounded-[28px]" />
          <div className="cf-shimmer h-24 rounded-[22px]" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="cf-shimmer h-64 rounded-[22px] lg:col-span-2" />
            <div className="cf-shimmer h-64 rounded-[22px]" />
          </div>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  if (!loggedInUser) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-5">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#10312c]">
            Profile not found
          </h2>
          <p className="mt-2 text-sm text-[#7a8f8a]">
            We could not load your profile. Refresh the page or sign in again.
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

// =====================================
//           PROFILE CONTENT
// =====================================

const ProfileContent = ({ user, updateUserProfileAsync, updating }) => {
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(user.photoUrl || "");
  const [formData, setFormData] = useState(buildForm(user));
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  const initials = (user.name || user.email || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  // ---------- Profile completeness ----------
  const checklist = useMemo(
    () => [
      { label: "Photo", done: !!user.photoUrl },
      { label: "Phone", done: !!user.phone?.trim() },
      { label: "Department", done: !!user.department?.trim() },
      { label: "Student ID", done: !!user.studentId?.trim() },
      { label: "Batch", done: !!user.batch?.trim() },
      { label: "About me", done: !!user.bio?.trim() },
    ],
    [user],
  );
  const doneCount = checklist.filter((c) => c.done).length;
  const completion = Math.round((doneCount / checklist.length) * 100);
  const completionAnimated = useCountUp(completion);

  const R = 62;
  const C = 2 * Math.PI * R;
  const ringLen = (completion / 100) * C;

  // ---------- Handlers ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
        { method: "POST", body: imageData },
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || "Image upload failed.");
      }

      const imageUrl = result.data.display_url;
      setFormData((prev) => ({ ...prev, photoUrl: imageUrl }));
      setPhotoPreview(imageUrl);

      Swal.fire({
        icon: "success",
        title: "Photo uploaded",
        text: "Save your changes to keep the new picture.",
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
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
        title: "Profile updated",
        text: "Your changes have been saved.",
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

  const handleCancel = () => {
    setFormData(buildForm(user));
    setPhotoPreview(user.photoUrl || "");
    setEditMode(false);
  };

  const bioText = editMode ? formData.bio : user.bio;

  return (
    <div className="cf-root min-h-screen bg-[#f3f7f5] px-4 py-7 md:px-6">
      <style>{styles}</style>

      <div className="mx-auto max-w-7xl">
        {/* ================= Top bar ================= */}
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="cf-display text-3xl font-bold text-[#10312c] md:text-[40px] md:leading-[1.1]">
              My profile
            </h1>
            <p className="mt-2 text-[15px] text-[#6d837d]">
              Keep your details up to date so your campus can reach you.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-[#dbe7e3] bg-white px-4 py-2 text-[13px] text-[#6d837d]">
              <span className="cf-live h-2 w-2 rounded-full bg-[#2fc785]" />
              Account active
            </div>

            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="flex h-10 items-center gap-2 rounded-full bg-[#0d9467] px-5 text-[13px] font-semibold text-white transition hover:bg-[#0b7f58]"
              >
                <FaEdit size={13} />
                Edit profile
              </button>
            )}
          </div>
        </header>

        {/* ================= Hero ================= */}
        <section
          className="cf-rise relative mb-6 overflow-hidden rounded-[28px] bg-[#0b2a26] p-6 text-white md:p-9"
          style={{ animationDelay: "0.05s" }}
        >
          <div className="cf-drift pointer-events-none absolute -right-24 -top-32 h-[380px] w-[380px] rounded-full bg-[#1c8f6b]/30 blur-3xl" />
          <div
            className="cf-drift pointer-events-none absolute -bottom-40 left-1/4 h-[320px] w-[320px] rounded-full bg-[#f5a524]/10 blur-3xl"
            style={{ animationDelay: "-6s" }}
          />

          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            {/* Left: identity */}
            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
              <div className="relative shrink-0">
                <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-white/10 ring-4 ring-white/15 md:h-36 md:w-36">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt={user.name || "Profile"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="cf-display text-5xl font-bold">
                      {initials}
                    </span>
                  )}
                </div>

                {editMode && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    aria-label="Change profile picture"
                    className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full border-4 border-[#0b2a26] bg-[#3ddc97] text-[#0b2a26] transition hover:scale-105 disabled:opacity-60"
                  >
                    {uploading ? (
                      <span className="cf-spin h-4 w-4 rounded-full border-2 border-[#0b2a26] border-t-transparent" />
                    ) : (
                      <FaCamera size={14} />
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

              <div className="min-w-0 flex-1">
                <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span className="rounded-full bg-[#3ddc97]/15 px-3 py-1 text-[11px] font-semibold capitalize text-[#3ddc97] ring-1 ring-inset ring-[#3ddc97]/25">
                    {user.role || "user"}
                  </span>
                  {user.collegeId && (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase text-[#c4e0d8] ring-1 ring-inset ring-white/15">
                      {user.collegeId}
                    </span>
                  )}
                </div>

                <h2 className="cf-display break-words text-3xl font-bold md:text-[40px] md:leading-[1.1]">
                  {user.name || "Your name"}
                </h2>

                <p className="mt-2 flex items-center justify-center gap-2 break-all text-sm text-[#9fc9bd] sm:justify-start">
                  <FaEnvelope className="shrink-0" size={13} />
                  {user.email}
                </p>

                <p className="mt-4 max-w-xl text-sm leading-6 text-[#c4e0d8]">
                  {bioText?.trim() ||
                    "No introduction yet. Add a short line about yourself."}
                </p>
              </div>
            </div>

            {/* Right: completeness */}
            <div className="rounded-2xl bg-white/6 p-5 ring-1 ring-white/10 backdrop-blur-sm">
              <div className="flex flex-wrap items-center gap-6">
                <div className="relative h-[130px] w-[130px] shrink-0">
                  <svg
                    viewBox="0 0 160 160"
                    className="h-full w-full -rotate-90"
                  >
                    <circle
                      cx="80"
                      cy="80"
                      r={R}
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="16"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r={R}
                      fill="none"
                      stroke="#3ddc97"
                      strokeWidth="16"
                      strokeLinecap="round"
                      strokeDasharray={`${mounted ? ringLen : 0} ${C}`}
                      style={{
                        transition:
                          "stroke-dasharray 1.4s cubic-bezier(.2,.8,.2,1) .3s",
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="cf-display text-3xl font-bold">
                      {completionAnimated}%
                    </span>
                    <span className="text-xs text-[#9fc9bd]">complete</span>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="cf-display text-lg font-semibold">
                    Profile checklist
                  </h3>
                  <p className="mt-0.5 text-xs text-[#9fc9bd]">
                    {doneCount} of {checklist.length} details added
                  </p>
                  <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                    {checklist.map((c) => (
                      <li
                        key={c.label}
                        className="flex items-center gap-2 text-[13px]"
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                            c.done
                              ? "bg-[#3ddc97] text-[#0b2a26]"
                              : "bg-white/10 text-transparent"
                          }`}
                        >
                          <FaCheck size={8} />
                        </span>
                        <span
                          className={
                            c.done ? "text-[#c4e0d8]" : "text-[#7fa89c]"
                          }
                        >
                          {c.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= Key numbers strip ================= */}
        <section
          className="cf-rise mb-6 flex flex-col divide-y divide-[#e3ebe8] overflow-hidden rounded-[22px] border border-[#e3ebe8] bg-white sm:flex-row sm:divide-x sm:divide-y-0"
          style={{ animationDelay: "0.2s" }}
        >
          <Stat
            icon={FaBuilding}
            label="Campus"
            value={user.collegeId?.toUpperCase()}
            note="Managed by CampusFind"
          />
          <Stat
            icon={FaGraduationCap}
            label="Department"
            value={user.department}
            note={user.batch ? `Batch ${user.batch}` : "Batch not added"}
          />
          <Stat
            icon={FaIdCard}
            label="Student ID"
            value={user.studentId}
            note="Your campus ID number"
          />
          <Stat
            icon={FaClock}
            label="Member since"
            value={formatDate(user.createdAt)}
            note={
              user.updatedAt
                ? `Updated ${timeAgo(user.updatedAt)}`
                : "Not updated yet"
            }
          />
        </section>

        {/* ================= Details / Edit form ================= */}
        {editMode ? (
          <form onSubmit={handleSave}>
            <div className="mb-6 grid gap-6 lg:grid-cols-3">
              <Panel
                className="lg:col-span-2"
                title="Edit details"
                hint="Update the information shown on your profile"
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Full name"
                    name="name"
                    value={formData.name}
                    icon={FaUser}
                    onChange={handleChange}
                  />
                  <Field
                    label="Phone number"
                    name="phone"
                    value={formData.phone}
                    icon={FaPhone}
                    placeholder="01XXXXXXXXX"
                    onChange={handleChange}
                  />
                  <Field
                    label="Department"
                    name="department"
                    value={formData.department}
                    icon={FaGraduationCap}
                    onChange={handleChange}
                  />
                  <Field
                    label="Batch / session"
                    name="batch"
                    value={formData.batch}
                    icon={FaCalendarAlt}
                    placeholder="e.g. 2022-23"
                    onChange={handleChange}
                  />
                  <Field
                    label="Student ID"
                    name="studentId"
                    value={formData.studentId}
                    icon={FaIdCard}
                    onChange={handleChange}
                  />
                  <Field
                    label="Email address"
                    name="email"
                    value={user.email || ""}
                    icon={FaEnvelope}
                    readOnly
                    note="Email is managed through Firebase Authentication."
                  />

                  <div className="md:col-span-2">
                    <label
                      htmlFor="bio"
                      className="mb-2 block text-[13px] font-medium text-[#3c5a53]"
                    >
                      About me
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                      maxLength={300}
                      placeholder="Write a short line about yourself"
                      className="w-full resize-none rounded-xl border border-[#dbe7e3] bg-[#f8fbfa] px-4 py-3 text-sm text-[#10312c] outline-none transition placeholder:text-[#a4b4b0] focus:border-[#0d9467] focus:bg-white focus:ring-4 focus:ring-[#0d9467]/10"
                    />
                    <p className="mt-1 text-right text-xs text-[#8ea19c]">
                      {formData.bio.length}/300
                    </p>
                  </div>
                </div>
              </Panel>

              <Panel
                title="Account"
                hint="Protected details you can't change here"
              >
                <ul className="divide-y divide-[#edf2f0]">
                  <DetailRow
                    icon={FaBuilding}
                    label="Campus"
                    value={user.collegeId?.toUpperCase()}
                  />
                  <DetailRow icon={FaUser} label="Role" value={user.role} />
                  <DetailRow
                    icon={FaIdCard}
                    label="User ID"
                    value={user.userId}
                  />
                </ul>
              </Panel>
            </div>

            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleCancel}
                disabled={updating || uploading}
                className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#dbe7e3] bg-white px-6 text-sm font-semibold text-[#3c5a53] transition hover:bg-[#f3f7f5] disabled:opacity-50"
              >
                <FaTimes size={13} />
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating || uploading}
                className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#0d9467] px-7 text-sm font-semibold text-white transition hover:bg-[#0b7f58] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaCheck size={13} />
                {uploading
                  ? "Uploading photo..."
                  : updating
                    ? "Saving..."
                    : "Save changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <Panel
              className="lg:col-span-2"
              title="Personal information"
              hint="The details linked to your account"
              action={
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 text-[13px] font-medium text-[#0d9467] transition hover:gap-3"
                >
                  Edit <FaEdit size={11} />
                </button>
              }
            >
              <ul className="divide-y divide-[#edf2f0]">
                <DetailRow icon={FaUser} label="Full name" value={user.name} />
                <DetailRow icon={FaEnvelope} label="Email" value={user.email} />
                <DetailRow icon={FaPhone} label="Phone" value={user.phone} />
                <DetailRow
                  icon={FaGraduationCap}
                  label="Department"
                  value={user.department}
                />
                <DetailRow
                  icon={FaCalendarAlt}
                  label="Batch / session"
                  value={user.batch}
                />
                <DetailRow
                  icon={FaIdCard}
                  label="Student ID"
                  value={user.studentId}
                />
              </ul>
            </Panel>

            <div className="flex flex-col gap-6">
              <Panel title="About me" hint="Your short introduction">
                <p className="whitespace-pre-wrap text-sm leading-7 text-[#3c5a53]">
                  {user.bio?.trim() || (
                    <span className="text-[#a4b4b0]">
                      Nothing here yet. Select Edit profile to add a short
                      introduction.
                    </span>
                  )}
                </p>
              </Panel>

              <Panel title="Account" hint="Managed by CampusFind">
                <ul className="divide-y divide-[#edf2f0]">
                  <DetailRow
                    icon={FaBuilding}
                    label="Campus"
                    value={user.collegeId?.toUpperCase()}
                  />
                  <DetailRow icon={FaUser} label="Role" value={user.role} />
                </ul>
              </Panel>
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-[#9ab0aa]">
          CampusFind, your campus connected
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
  @keyframes cf-shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }
  @keyframes cf-spin { to { transform: rotate(360deg); } }
  .cf-rise { opacity: 0; animation: cf-rise .7s cubic-bezier(.2,.8,.2,1) forwards; }
  .cf-live { animation: cf-pulse 1.8s infinite; }
  .cf-drift { animation: cf-drift 14s ease-in-out infinite; }
  .cf-spin { animation: cf-spin .9s linear infinite; }
  .cf-shimmer { background: linear-gradient(90deg,#eef4f2 25%,#f8fbfa 50%,#eef4f2 75%); background-size: 200% 100%; animation: cf-shimmer 1.4s infinite; }
  @media (prefers-reduced-motion: reduce) {
    .cf-rise, .cf-live, .cf-drift, .cf-shimmer, .cf-spin { animation: none !important; opacity: 1; }
  }
`;

export default MyProfile;
