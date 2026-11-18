import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router";
import { AuthContext } from "../../providers/AuthProvider";
import { toast } from "react-toastify";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import colleges from "../../data/colleges";

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
} from "lucide-react";

const Registration = () => {
  const navigate = useNavigate();

  const { createNewUser, updateUser } = useContext(AuthContext);

  const axiosPublic = useAxiosPublic();

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
    const collegeId = form.collegeId.value;

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
      await updateUser({
        displayName: name,
      });

      // MongoDB User Save
      await axiosPublic.post("/users", {
        userId: user.uid,
        email: user.email,
        name,
        collegeId,
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

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#071521] px-4 py-10 text-white selection:bg-teal-400/30">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[450px] w-[450px] animate-pulse rounded-full bg-teal-500/15 blur-[120px]" />

        <div className="absolute -bottom-40 -right-20 h-[500px] w-[500px] animate-pulse rounded-full bg-cyan-500/10 blur-[130px] [animation-delay:2s]" />

        <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-[100px]" />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "45px 45px",
          }}
        />

        {/* Floating Circles */}
        <div className="absolute left-[10%] top-[15%] h-20 w-20 animate-[float_6s_ease-in-out_infinite] rounded-full border border-teal-400/20" />

        <div className="absolute bottom-[15%] right-[10%] h-28 w-28 animate-[float_8s_ease-in-out_infinite] rounded-full border border-cyan-400/20" />

        <div className="absolute right-[20%] top-[12%] h-3 w-3 animate-ping rounded-full bg-teal-400/50" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left Side - Branding */}
        <div className="hidden space-y-8 lg:block">
          <div className="inline-flex items-center gap-3 rounded-full border border-teal-400/20 bg-teal-400/5 px-4 py-2 text-sm text-teal-300">
            <Sparkles size={16} />
            <span>Join the CampusFind Community</span>
          </div>

          <div>
            <h1 className="text-5xl font-extrabold leading-[1.2] tracking-tight xl:text-6xl">
              Your Campus.
              <span className="block bg-gradient-to-r from-teal-300 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                Your Community.
              </span>
              <span className="block">Your Connection.</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
              Create your account and become part of a smarter campus community.
              Help others, find lost belongings, and make campus life easier.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition-all duration-300 hover:translate-x-2 hover:border-teal-400/30">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300">
                <Fingerprint size={24} />
              </div>

              <div>
                <h3 className="font-semibold">Secure Account</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Your account is protected with Firebase Authentication.
                </p>
              </div>

              <CheckCircle2 className="ml-auto text-teal-400" size={20} />
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition-all duration-300 hover:translate-x-2 hover:border-cyan-400/30">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <Building2 size={24} />
              </div>

              <div>
                <h3 className="font-semibold">Campus Connected</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Connect with your own college community.
                </p>
              </div>

              <CheckCircle2 className="ml-auto text-cyan-400" size={20} />
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition-all duration-300 hover:translate-x-2 hover:border-emerald-400/30">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                <ShieldCheck size={24} />
              </div>

              <div>
                <h3 className="font-semibold">Community Support</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Make a difference by helping others.
                </p>
              </div>

              <CheckCircle2 className="ml-auto text-emerald-400" size={20} />
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Sparkles size={18} className="text-teal-400" />
            <span>One community. Countless connections.</span>
          </div>
        </div>

        {/* Right Side - Registration Card */}
        <div className="w-full max-w-md justify-self-center animate-[fadeInUp_0.7s_ease-out]">
          {/* Mobile Branding */}
          <div className="mb-7 text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 shadow-lg shadow-teal-500/20">
              <GraduationCap size={30} className="text-[#071521]" />
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight">
              Campus<span className="text-teal-400">Find</span>
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Join your campus community.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#102433]/90 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-9">
            {/* Header */}
            <div className="mb-7">
              <div className="mb-5 hidden h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 shadow-lg shadow-teal-500/20 lg:flex">
                <GraduationCap size={26} className="text-[#071521]" />
              </div>

              <h2 className="text-3xl font-bold tracking-tight">
                Create Account
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Fill in your details to get started.
              </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Full Name
                </label>

                <div className="group relative">
                  <UserRound
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-teal-400"
                  />

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    required
                    minLength={2}
                    className="w-full rounded-xl border border-white/10 bg-[#081925]/80 py-3.5 pl-12 pr-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-600 hover:border-white/20 focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/10"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Email Address
                </label>

                <div className="group relative">
                  <Mail
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-teal-400"
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#081925]/80 py-3.5 pl-12 pr-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-600 hover:border-white/20 focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/10"
                  />
                </div>
              </div>

              {/* College */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Select Your College
                </label>

                <div className="group relative">
                  <Building2
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-teal-400"
                  />

                  <select
                    name="collegeId"
                    defaultValue=""
                    required
                    className="w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-[#081925]/80 py-3.5 pl-12 pr-10 text-sm text-white outline-none transition-all duration-300 hover:border-white/20 focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/10"
                  >
                    <option value="" disabled className="bg-[#102433]">
                      Select your college
                    </option>

                    {colleges.map((college) => (
                      <option
                        key={college.collegeId}
                        value={college.collegeId}
                        className="bg-[#102433] text-white"
                      >
                        {college.collegeName}
                      </option>
                    ))}
                  </select>

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                    ▼
                  </span>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Password
                </label>

                <div className="group relative">
                  <LockKeyhole
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-teal-400"
                  />

                  <input
                    type={passwordVisible ? "text" : "password"}
                    name="password"
                    placeholder="Create a password"
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#081925]/80 py-3.5 pl-12 pr-12 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-600 hover:border-white/20 focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/10"
                  />

                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-teal-400"
                  >
                    {passwordVisible ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  At least 6 characters with uppercase and lowercase letters.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="animate-[fadeInUp_0.3s_ease-out] rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 py-3.5 font-bold text-[#071521] shadow-lg shadow-teal-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:from-teal-300 hover:to-emerald-400 hover:shadow-xl hover:shadow-teal-500/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#071521]/30 border-t-[#071521]" />
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
            <div className="mt-7 border-t border-white/10 pt-6 text-center">
              <p className="text-sm text-slate-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-teal-400 transition-colors hover:text-teal-300 hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </div>

            {/* Security Footer */}
            <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck size={14} className="text-teal-500" />
              Your information is securely protected.
            </div>
          </div>

          {/* Copyright */}
          <p className="mt-6 text-center text-xs text-slate-600">
            © {new Date().getFullYear()} CampusFind. All rights reserved.
          </p>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-25px);
          }
        }
      `}</style>
    </div>
  );
};

export default Registration;
