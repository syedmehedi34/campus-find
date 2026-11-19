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
  PackageSearch,
  CheckCircle2,
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
            <span>Welcome to CampusFind</span>
          </div>

          <div className="animate-[fadeInUp_0.8s_ease-out]">
            <h1 className="text-5xl font-extrabold leading-[1.15] tracking-tight text-slate-900 xl:text-6xl">
              Find What You Lost.
              <span className="block bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                Return What You Found.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
              Your campus, connected. A smarter way to report lost items,
              discover found belongings, and help each other.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid max-w-lg grid-cols-2 gap-4">
            {[
              {
                icon: Fingerprint,
                title: "Secure Access",
                desc: "Your account, your campus identity.",
                box: "bg-teal-100 text-teal-700",
                hover: "hover:border-teal-300 hover:shadow-teal-500/15",
                delay: "0.2s",
              },
              {
                icon: GraduationCap,
                title: "Campus Community",
                desc: "Helping students find their belongings.",
                box: "bg-cyan-100 text-cyan-700",
                hover: "hover:border-cyan-300 hover:shadow-cyan-500/15",
                delay: "0.35s",
              },
            ].map(({ icon: Icon, title, desc, box, hover, delay }) => (
              <div
                key={title}
                style={{ animationDelay: delay, animationFillMode: "both" }}
                className={`animate-[slideInLeft_0.7s_ease-out] rounded-2xl border border-white bg-white/70 p-5 shadow-lg shadow-slate-200/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${hover}`}
              >
                <div
                  className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${box}`}
                >
                  <Icon size={23} />
                </div>
                <h3 className="font-semibold text-slate-800">{title}</h3>
                <p className="mt-2 text-sm text-slate-500">{desc}</p>
              </div>
            ))}
          </div>

          {/* Trust strip */}
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md shadow-slate-200">
              <PackageSearch size={18} className="text-teal-600" />
            </div>
            <span>A safer and smarter campus experience.</span>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>
        </div>

        {/* ----- Right: Login Card ----- */}
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
              Your campus, connected.
            </p>
          </div>

          {/* Gradient border wrapper */}
          <div className="rounded-[28px] bg-gradient-to-br from-teal-300/70 via-white to-cyan-300/70 p-[1.5px] shadow-2xl shadow-teal-900/10">
            <div className="rounded-[27px] bg-white/90 p-6 backdrop-blur-2xl sm:p-9">
              {/* Card Header */}
              <div className="mb-7">
                <div className="mb-5 hidden h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg shadow-teal-500/30 lg:flex">
                  <GraduationCap size={26} className="text-white" />
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  Welcome Back!
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Sign in to continue to your account.
                </p>
              </div>

              {/* Demo Login */}
              <div className="mb-7">
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[2px] text-slate-400">
                    Quick Demo Access
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Demo User */}
                  <button
                    type="button"
                    onClick={() => handleDummyLogin("user")}
                    disabled={loading}
                    className="group flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50/70 p-3 text-left transition-all duration-300 hover:-translate-y-1 hover:border-teal-400 hover:bg-teal-50 hover:shadow-lg hover:shadow-teal-500/15 disabled:opacity-50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700 transition-transform group-hover:scale-110">
                      <UserRound size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-teal-700">
                        Demo User
                      </p>
                      <p className="mt-1 text-[10px] text-slate-500">
                        Student Access
                      </p>
                    </div>
                  </button>

                  {/* Demo Admin */}
                  <button
                    type="button"
                    onClick={() => handleDummyLogin("admin")}
                    disabled={loading}
                    className="group flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-left transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:bg-amber-50 hover:shadow-lg hover:shadow-amber-500/15 disabled:opacity-50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 transition-transform group-hover:scale-110">
                      <ShieldCheck size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-amber-700">
                        Demo Admin
                      </p>
                      <p className="mt-1 text-[10px] text-slate-500">
                        Admin Access
                      </p>
                    </div>
                  </button>
                </div>

                <p className="mt-3 text-center text-[11px] text-slate-400">
                  Select a demo account to auto-fill credentials.
                </p>
              </div>

              {/* Login Form */}
              <form
                id="login-form"
                onSubmit={handleLogin}
                className="space-y-5"
              >
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

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">
                      Password
                    </label>
                  </div>

                  <div className="group relative">
                    <LockKeyhole size={19} className={iconClass} />

                    <input
                      type={passwordVisible ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
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
                </div>

                {/* Error */}
                {error && (
                  <div className="animate-[shake_0.4s_ease-in-out] rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                  <label className="flex cursor-pointer items-center gap-2 text-slate-500">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded accent-teal-600"
                    />
                    Remember me
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowReset(!showReset)}
                    className="font-medium text-teal-600 transition-colors hover:text-teal-700 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Password Reset */}
                {showReset && (
                  <div className="animate-[fadeInUp_0.3s_ease-out] space-y-3 rounded-xl border border-teal-200 bg-teal-50/60 p-4">
                    <div className="flex items-center gap-2">
                      <KeyRound size={18} className="text-teal-600" />
                      <h3 className="font-semibold text-slate-800">
                        Reset Password
                      </h3>
                    </div>

                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                    />

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowReset(false)}
                        className="flex-1 rounded-lg bg-slate-100 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={handlePasswordReset}
                        disabled={resetLoading}
                        className="flex-1 rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-500/20 transition-all hover:bg-teal-700 disabled:opacity-50"
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
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 py-3.5 font-bold text-white shadow-lg shadow-teal-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:from-teal-600 hover:to-emerald-600 hover:shadow-xl hover:shadow-teal-500/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {/* Shine effect */}
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
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
              <div className="mt-7 border-t border-slate-100 pt-6 text-center">
                <p className="text-sm text-slate-500">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-teal-600 transition-colors hover:text-teal-700 hover:underline"
                  >
                    Create Account
                  </Link>
                </p>
              </div>

              {/* Security Footer */}
              <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck size={14} className="text-teal-500" />
                Secure authentication powered by Firebase
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} CampusFind. All rights reserved.
          </p>
        </div>
      </div>

      {/* ===== Animation Keyframes ===== */}
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

export default Login;
