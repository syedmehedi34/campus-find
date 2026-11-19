import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router";
import { AuthContext } from "../../providers/AuthProvider";
import { toast } from "react-toastify";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useCampuses from "../../hooks/useCampuses";

import {
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  UserRound,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Building2,
  Fingerprint,
  CheckCircle2,
  ChevronDown,
  Loader2,
  RefreshCw,
  Search,
  PackageSearch,
} from "lucide-react";

const Registration = () => {
  const navigate = useNavigate();
  const { createNewUser, updateUser } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();

  // Campuses from backend
  const {
    campuses,
    isLoading: campusesLoading,
    isError: campusesError,
    refetch,
  } = useCampuses();

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const campusCode = form.campusCode.value;

    if (!campusCode) {
      setError("Please select your campus.");
      return;
    }

    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 6 characters and include uppercase and lowercase letters.",
      );
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Firebase Account Create
      const result = await createNewUser(email, password);
      const user = result.user;

      // Firebase Profile Update
      await updateUser({ displayName: name });

      // MongoDB User Save
      await axiosPublic.post("/users", {
        userId: user.uid,
        email: user.email,
        name,
        campusCode,
        photoUrl: "",
      });

      toast.success("Account created successfully!");
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);

      let errorMessage = "Failed to create account. Please try again.";

      if (err.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Please choose a stronger password.";
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white/80 py-3.5 pl-12 pr-4 text-sm text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10";

  const iconClass =
    "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-teal-600";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-teal-50 via-white to-cyan-50 px-4 py-10 text-slate-800 selection:bg-teal-200/60">
      {/* ===== Background Effects ===== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Soft blobs */}
        <div className="absolute -left-32 -top-32 h-[420px] w-[420px] animate-[blob_14s_ease-in-out_infinite] rounded-full bg-teal-300/40 blur-[110px]" />
        <div className="absolute -bottom-32 -right-24 h-[480px] w-[480px] animate-[blob_16s_ease-in-out_infinite_reverse] rounded-full bg-cyan-300/40 blur-[120px]" />
        <div className="absolute left-1/2 top-1/3 h-[320px] w-[320px] -translate-x-1/2 animate-[blob_18s_ease-in-out_infinite] rounded-full bg-emerald-200/40 blur-[100px]" />

        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(13,148,136,0.18) 1.2px, transparent 1.2px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 80%)",
          }}
        />

        {/* Floating shapes */}
        <div className="absolute left-[8%] top-[18%] h-20 w-20 animate-[float_7s_ease-in-out_infinite] rounded-3xl border-2 border-teal-300/60 bg-white/40 backdrop-blur-sm" />
        <div className="absolute bottom-[14%] right-[9%] h-28 w-28 animate-[float_9s_ease-in-out_infinite] rounded-full border-2 border-cyan-300/60 bg-white/30 backdrop-blur-sm" />
        <div className="absolute bottom-[30%] left-[6%] h-10 w-10 animate-[floatSlow_8s_ease-in-out_infinite] rounded-full bg-gradient-to-br from-teal-300/60 to-emerald-300/60" />
        <div className="absolute right-[18%] top-[12%] h-3 w-3 animate-ping rounded-full bg-teal-400/70" />
        <div className="absolute right-[32%] top-[70%] h-2.5 w-2.5 animate-ping rounded-full bg-cyan-400/70 [animation-delay:1.2s]" />
      </div>

      {/* ===== Main Container ===== */}
      <div className="relative z-10 grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* ----- Left: Branding ----- */}
        <div className="hidden space-y-8 lg:block">
          <div className="inline-flex animate-[fadeInUp_0.6s_ease-out] items-center gap-2.5 rounded-full border border-teal-200 bg-white/70 px-4 py-2 text-sm font-medium text-teal-700 shadow-sm backdrop-blur">
            <Sparkles size={16} className="animate-pulse" />
            <span>Join the CampusFind Community</span>
          </div>

          <div className="animate-[fadeInUp_0.8s_ease-out]">
            <h1 className="text-5xl font-extrabold leading-[1.15] tracking-tight text-slate-900 xl:text-6xl">
              Lost something?
              <span className="block bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                Find it on campus.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
              Create your account and become part of a smarter campus community.
              Help others, find lost belongings, and make campus life easier.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {[
              {
                icon: Fingerprint,
                title: "Secure Account",
                desc: "Protected with Firebase Authentication.",
                color: "teal",
                delay: "0.2s",
              },
              {
                icon: Building2,
                title: "Campus Connected",
                desc: "Connect with your own campus community.",
                color: "cyan",
                delay: "0.35s",
              },
              {
                icon: ShieldCheck,
                title: "Community Support",
                desc: "Make a difference by helping others.",
                color: "emerald",
                delay: "0.5s",
              },
            ].map(({ icon: Icon, title, desc, color, delay }) => {
              const styles = {
                teal: {
                  box: "bg-teal-100 text-teal-700",
                  check: "text-teal-500",
                  hover: "hover:border-teal-300 hover:shadow-teal-500/10",
                },
                cyan: {
                  box: "bg-cyan-100 text-cyan-700",
                  check: "text-cyan-500",
                  hover: "hover:border-cyan-300 hover:shadow-cyan-500/10",
                },
                emerald: {
                  box: "bg-emerald-100 text-emerald-700",
                  check: "text-emerald-500",
                  hover: "hover:border-emerald-300 hover:shadow-emerald-500/10",
                },
              }[color];

              return (
                <div
                  key={title}
                  style={{ animationDelay: delay, animationFillMode: "both" }}
                  className={`flex animate-[slideInLeft_0.7s_ease-out] items-center gap-4 rounded-2xl border border-white bg-white/70 p-4 shadow-lg shadow-slate-200/60 backdrop-blur-xl transition-all duration-300 hover:translate-x-2 ${styles.hover}`}
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${styles.box}`}
                  >
                    <Icon size={24} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="mt-0.5 text-sm text-slate-500">{desc}</p>
                  </div>

                  <CheckCircle2
                    className={`ml-auto ${styles.check}`}
                    size={20}
                  />
                </div>
              );
            })}
          </div>

          {/* Mini stats strip */}
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md shadow-slate-200">
              <PackageSearch size={18} className="text-teal-600" />
            </div>
            <span>
              {campusesLoading
                ? "Loading campuses..."
                : `${campuses.length} campuses already connected`}
            </span>
          </div>
        </div>

        {/* ----- Right: Registration Card ----- */}
        <div className="w-full max-w-md animate-[fadeInUp_0.7s_ease-out] justify-self-center">
          {/* Mobile Branding */}
          <div className="mb-7 text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg shadow-teal-500/30">
              <GraduationCap size={30} className="text-white" />
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Campus<span className="text-teal-600">Find</span>
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Join your campus community.
            </p>
          </div>

          {/* Gradient border wrapper */}
          <div className="rounded-[28px] bg-gradient-to-br from-teal-300/70 via-white to-cyan-300/70 p-[1.5px] shadow-2xl shadow-teal-900/10">
            <div className="rounded-[27px] bg-white/90 p-6 backdrop-blur-2xl sm:p-9">
              {/* Header */}
              <div className="mb-7">
                <div className="mb-5 hidden h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg shadow-teal-500/30 lg:flex">
                  <GraduationCap size={26} className="text-white" />
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  Create Account
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Fill in your details to get started.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Full Name
                  </label>
                  <div className="group relative">
                    <UserRound size={19} className={iconClass} />
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      required
                      minLength={2}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email Address
                  </label>
                  <div className="group relative">
                    <Mail size={19} className={iconClass} />
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Campus (from backend) */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Select Your Campus
                  </label>

                  <div className="group relative">
                    <Building2
                      size={19}
                      className={`pointer-events-none ${iconClass}`}
                    />

                    <select
                      name="campusCode"
                      defaultValue=""
                      required
                      disabled={campusesLoading || campusesError}
                      className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white/80 py-3.5 pl-12 pr-10 text-sm text-slate-800 outline-none transition-all duration-300 hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      <option value="" disabled>
                        {campusesLoading
                          ? "Loading campuses..."
                          : campusesError
                            ? "Failed to load campuses"
                            : "Select your campus"}
                      </option>

                      {campuses.map((campus) => (
                        <option key={campus._id} value={campus.campusCode}>
                          {campus.campusName}
                        </option>
                      ))}
                    </select>

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      {campusesLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </span>
                  </div>

                  {/* Retry on error */}
                  {campusesError && (
                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-teal-600 transition-colors hover:text-teal-700"
                    >
                      <RefreshCw size={13} />
                      Retry loading campuses
                    </button>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <div className="group relative">
                    <LockKeyhole size={19} className={iconClass} />
                    <input
                      type={passwordVisible ? "text" : "password"}
                      name="password"
                      placeholder="Create a password"
                      required
                      className={`${inputClass} !pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-teal-600"
                    >
                      {passwordVisible ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    At least 6 characters with uppercase and lowercase letters.
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="animate-[shake_0.4s_ease-in-out] rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || campusesLoading || campusesError}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 py-3.5 font-bold text-white shadow-lg shadow-teal-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:from-teal-600 hover:to-emerald-600 hover:shadow-xl hover:shadow-teal-500/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {/* Shine effect */}
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create My Account
                      <ArrowRight
                        size={19}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-7 border-t border-slate-100 pt-6 text-center">
                <p className="text-sm text-slate-500">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-teal-600 transition-colors hover:text-teal-700 hover:underline"
                  >
                    Sign In
                  </Link>
                </p>
              </div>

              {/* Security Footer */}
              <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck size={14} className="text-teal-500" />
                Your information is securely protected.
              </div>
            </div>
          </div>

          {/* Copyright */}
          <p className="mt-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} CampusFind. All rights reserved.
          </p>
        </div>
      </div>

      {/* ===== Animations ===== */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(25px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(6deg); }
        }

        @keyframes floatSlow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(12px, -18px); }
        }

        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.08); }
          66% { transform: translate(-20px, 25px) scale(0.95); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default Registration;
