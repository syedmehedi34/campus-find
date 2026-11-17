import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router";
import { AuthContext } from "../../providers/AuthProvider";
import { IoIosEye, IoIosEyeOff } from "react-icons/io";
import { toast } from "react-toastify";
import GoogleLogin from "./GoogleLogin";
import useAxiosPublic from "../../hooks/useAxiosPublic";

const Registration = () => {
  const navigate = useNavigate();
  const { createNewUser, setUser, updateUser } = useContext(AuthContext);

  const axiosPublic = useAxiosPublic();

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;

    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 6 characters long and include an uppercase and a lowercase letter.",
      );
      return;
    }

    setError("");

    try {
      const result = await createNewUser(email, password);
      const user = result.user;

      setUser(user);

      await updateUser({ displayName: name });

      await axiosPublic.post("/users", {
        uid: user.uid,
        name,
        email,
        createdAt: user.metadata.creationTime,
        college: "No College Selected",
        photoURL: user.photoURL || "",
      });

      toast.success("Account created successfully!");

      navigate("/");
    } catch (err) {
      console.error(err);

      setError("Failed to create account. Please try again.");
      toast.error("Registration failed!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Create an Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1">Password</label>

            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                className="w-full border rounded-md px-3 py-2 pr-10"
                required
              />

              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {passwordVisible ? (
                  <IoIosEye size={20} />
                ) : (
                  <IoIosEyeOff size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Register Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Register
          </button>

          {/* Google Login */}
          <GoogleLogin setError={setError} />
        </form>

        <p className="text-center text-sm mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Registration;
