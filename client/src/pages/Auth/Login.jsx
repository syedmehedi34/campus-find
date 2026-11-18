import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { AuthContext } from "../../providers/AuthProvider";

import {
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  ArrowRight,
  ShieldCheck,
  UserRound,
  Sparkles,
  KeyRound,
  GraduationCap,
  Fingerprint,
} from "lucide-react";

const Login = () => {
  const { signInUser, resetPassword } = useContext(AuthContext);

  const location = useLocation();
  const navigate = useNavigate();

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Demo Credentials
  const demoAccounts = {
    user: {
      email: "mehedi@hasan.test",
      password: "mehEdi@123",
    },
    admin: {
      email: "admin@campusfind.test",
      password: "Admin@123",
    },
  };

  // Demo Login
  const handleDummyLogin = (type) => {
    const account = demoAccounts[type];
    const form = document.getElementById("login-form");

    form.email.value = account.email;
    form.password.value = account.password;

    setError("");
    setPasswordVisible(false);

    toast.info(
      `${type === "admin" ? "Admin" : "User"} demo credentials filled!`,
    );
  };

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    const email = form.email.value.trim();
    const password = form.password.value;

    setError("");
    setLoading(true);

    try {
      await signInUser(email, password);

      form.reset();

      toast.success("Welcome back! Login successful.");

      navigate(location.state?.from?.pathname || location.state || "/", {
        replace: true,
      });
    } catch (err) {
      let errorMessage = "Invalid email or password. Please try again.";

      if (err.code === "auth/user-not-found") {
        errorMessage = "No account found with this email.";
      } else if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        errorMessage = "Incorrect email or password.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email format.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many attempts. Please try again later.";
      }

      setError(errorMessage);
      toast.error(errorMessage);

      form.password.value = "";
    } finally {
      setLoading(false);
    }
  };

  // Password Reset
  const handlePasswordReset = async () => {
    if (!resetEmail.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    setResetLoading(true);

    try {
      await resetPassword(resetEmail.trim());

      toast.success("Password reset email sent successfully!");

      setShowReset(false);
      setResetEmail("");
    } catch (err) {
      let errorMessage = "Failed to send password reset email.";

      if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email format.";
      } else if (err.code === "auth/user-not-found") {
        errorMessage = "No account found with this email.";
      }

      toast.error(errorMessage);
    } finally {
      setResetLoading(false);
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

        {/* Decorative Circles */}
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
            <span>Welcome to CampusFind</span>
          </div>

          <div>
            <h1 className="text-5xl font-extrabold leading-[1.2] tracking-tight xl:text-6xl">
              Find What You
              <span className="block bg-gradient-to-r from-teal-300 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                Lost. Return
              </span>
              <span className="block">What You Found.</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
              Your campus, connected. A smarter way to report lost items,
              discover found belongings, and help each other.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid max-w-lg grid-cols-2 gap-4">
            <div className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-teal-400/40 hover:bg-teal-400/[0.06]">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300">
                <Fingerprint size={23} />
              </div>
              <h3 className="font-semibold">Secure Access</h3>
              <p className="mt-2 text-sm text-slate-400">
                Your account, your campus identity.
              </p>
            </div>

            <div className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-cyan-400/[0.06]">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <GraduationCap size={23} />
              </div>
              <h3 className="font-semibold">Campus Community</h3>
              <p className="mt-2 text-sm text-slate-400">
                Helping students find their belongings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-500">
            <ShieldCheck size={19} className="text-teal-400" />
            <span>A safer and smarter campus experience.</span>
          </div>
        </div>

        {/* Right Side - Login Card */}
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
              Your campus, connected.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#102433]/90 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-9">
            {/* Card Header */}
            <div className="mb-7">
              <div className="mb-5 hidden h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 shadow-lg shadow-teal-500/20 lg:flex">
                <GraduationCap size={26} className="text-[#071521]" />
              </div>

              <h2 className="text-3xl font-bold tracking-tight">
                Welcome Back!
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Sign in to continue to your account.
              </p>
            </div>

            {/* Demo Login */}
            <div className="mb-7">
              <div className="mb-3 flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-[2px] text-slate-400">
                  Quick Demo Access
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Demo User */}
                <button
                  type="button"
                  onClick={() => handleDummyLogin("user")}
                  disabled={loading}
                  className="group flex items-center gap-3 rounded-xl border border-teal-400/20 bg-teal-400/[0.06] p-3 text-left transition-all duration-300 hover:-translate-y-1 hover:border-teal-400/50 hover:bg-teal-400/10 disabled:opacity-50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-400/15 text-teal-300 transition-transform group-hover:scale-110">
                    <UserRound size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-teal-300">
                      Demo User
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Student Access
                    </p>
                  </div>
                </button>

                {/* Demo Admin */}
                <button
                  type="button"
                  onClick={() => handleDummyLogin("admin")}
                  disabled={loading}
                  className="group flex items-center gap-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-3 text-left transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/50 hover:bg-amber-400/10 disabled:opacity-50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300 transition-transform group-hover:scale-110">
                    <ShieldCheck size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-amber-300">
                      Demo Admin
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Admin Access
                    </p>
                  </div>
                </button>
              </div>

              <p className="mt-3 text-center text-[11px] text-slate-500">
                Select a demo account to auto-fill credentials.
              </p>
            </div>

            {/* Login Form */}
            <form id="login-form" onSubmit={handleLogin} className="space-y-5">
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

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">
                    Password
                  </label>
                </div>

                <div className="group relative">
                  <LockKeyhole
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-teal-400"
                  />

                  <input
                    type={passwordVisible ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
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
              </div>

              {/* Error */}
              {error && (
                <div className="animate-[fadeInUp_0.3s_ease-out] rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-slate-400">
                  <input type="checkbox" className="h-4 w-4 accent-teal-400" />
                  Remember me
                </label>

                <button
                  type="button"
                  onClick={() => setShowReset(!showReset)}
                  className="font-medium text-teal-400 transition-colors hover:text-teal-300 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Password Reset */}
              {showReset && (
                <div className="animate-[fadeInUp_0.3s_ease-out] space-y-3 rounded-xl border border-teal-400/20 bg-teal-400/[0.04] p-4">
                  <div className="flex items-center gap-2">
                    <KeyRound size={18} className="text-teal-400" />
                    <h3 className="font-semibold">Reset Password</h3>
                  </div>

                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full rounded-lg border border-white/10 bg-[#081925] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-teal-400/60"
                  />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowReset(false)}
                      className="flex-1 rounded-lg bg-white/10 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/15"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      disabled={resetLoading}
                      className="flex-1 rounded-lg bg-teal-500 py-2.5 text-sm font-semibold text-[#071521] transition-all hover:bg-teal-400 disabled:opacity-50"
                    >
                      {resetLoading ? "Sending..." : "Send Link"}
                    </button>
                  </div>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 py-3.5 font-bold text-[#071521] shadow-lg shadow-teal-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:from-teal-300 hover:to-emerald-400 hover:shadow-xl hover:shadow-teal-500/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#071521]/30 border-t-[#071521]" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In to Your Account
                    <ArrowRight
                      size={19}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-7 border-t border-white/10 pt-6 text-center">
              <p className="text-sm text-slate-400">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-teal-400 transition-colors hover:text-teal-300 hover:underline"
                >
                  Create Account
                </Link>
              </p>
            </div>

            {/* Security Footer */}
            <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck size={14} className="text-teal-500" />
              Secure authentication powered by Firebase
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-600">
            © {new Date().getFullYear()} CampusFind. All rights reserved.
          </p>
        </div>
      </div>

      {/* Animation Keyframes */}
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

export default Login;
