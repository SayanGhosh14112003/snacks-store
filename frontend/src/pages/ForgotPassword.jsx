import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import toast from "react-hot-toast";
import useUserStore from "../store/userStore";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const forgetPassword = useUserStore((state) => state.forgetPassword);
  const navigate = useNavigate();

  const handleSendLink = async(e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email!");
      return;
    }
    const success=await forgetPassword(email);
    if(success)navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(254,243,226)] px-4">

      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8 transition-all duration-500">
        <h2 className="text-2xl font-bold text-center text-[rgb(221,3,3)] mb-6">
          Forgot Password
        </h2>

        <p className="text-center text-gray-700 mb-4">
          Enter your email address to receive a password reset link.
        </p>

        <form onSubmit={handleSendLink} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-[rgb(250,129,47)]" />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full pl-10 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(250,177,47)]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[rgb(250,129,47)] text-white py-3 rounded-md hover:bg-[rgb(221,3,3)] transition-all duration-300 font-semibold"
          >
            Send Reset Link
          </button>

          <p className="text-center text-sm mt-3">
            Remembered your password?{" "}
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
