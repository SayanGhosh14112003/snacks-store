import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";
import useUserStore from "../store/userStore";

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();
  const { token } = useParams(); // assuming route: /reset-password/:token
  const resetPassword = useUserStore((state) => state.resetPassword);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { password, confirmPassword } = formData;

    if (!password || !confirmPassword) {
      toast.error("Please fill all fields!");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const success = await resetPassword({ token, password, confirmPassword });
    if (success) {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(254,243,226)] px-4">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8 transition-all duration-500">
        <h2 className="text-2xl font-bold text-center text-[rgb(221,3,3)] mb-6">
          Reset Your Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-[rgb(250,129,47)]" />
            <input
              type="password"
              name="password"
              placeholder="New Password"
              className="w-full pl-10 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(250,177,47)]"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-[rgb(250,129,47)]" />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full pl-10 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(250,177,47)]"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[rgb(250,129,47)] text-white py-3 rounded-md hover:bg-[rgb(221,3,3)] transition-all duration-300 font-semibold"
          >
            Reset Password
          </button>

          <p className="text-center text-sm mt-3">
            Remember your password?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-[rgb(221,3,3)] font-semibold cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
