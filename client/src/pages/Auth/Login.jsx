import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { AuthContext } from "../../providers/AuthProvider";
import { Eye, EyeOff } from "lucide-react";
// import GoogleLogin from "./GoogleLogin";

const Login = () => {
  const { signInUser, setUser, resetPassword } = useContext(AuthContext);

  const location = useLocation();
  const navigate = useNavigate();

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Dummy Login
  const handleDummyLogin = (e) => {
    const form = e.currentTarget.form;

    form.email.value = "mehedi@hasan.test";
    form.password.value = "mehEdi@123";
  };

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    const email = form.email.value;
    const password = form.password.value;

    setError("");
    setLoading(true);

    try {
      const result = await signInUser(email, password);

      setUser(result.user);
      form.reset();

      toast.success("Logged in successfully!");

      navigate(location.state || "/");
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
    setResetMsg("");
    setResetLoading(true);

    try {
      await resetPassword(resetEmail);

      setResetMsg("Password reset email sent successfully!");
      setResetEmail("");

      toast.success("Password reset email sent!");
      setShowReset(false);
    } catch (err) {
      let errorMessage = "Failed to send password reset email.";

      if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email format.";
      } else if (err.code === "auth/user-not-found") {
        errorMessage = "No account found with this email.";
      }

      setResetMsg(errorMessage);
      toast.error(errorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold text-center mb-6">Sign In</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Dummy Login */}
          <button
            onClick={handleDummyLogin}
            type="button"
            className="w-full bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
          >
            Dummy Login
          </button>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>

            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />

              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => setShowReset(!showReset)}
              className="text-blue-600 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {/* Password Reset */}
          {showReset && (
            <div className="border rounded-md p-4 space-y-3">
              <h3 className="font-medium">Reset Password</h3>

              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 border rounded-md"
                required
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowReset(false)}
                  className="flex-1 bg-gray-200 py-2 rounded-md"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={resetLoading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md disabled:opacity-50"
                >
                  {resetLoading ? "Sending..." : "Send Link"}
                </button>
              </div>
            </div>
          )}

          {resetMsg && <p className="text-sm text-green-600">{resetMsg}</p>}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {/* Google Login */}
          {/* <GoogleLogin setError={setError} /> */}
        </form>

        {/* Register Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
