import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import toast  from "react-hot-toast";
import useUserStore from "../store/userStore";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const login=useUserStore((state)=>state.login);
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async(e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      toast.error("Please fill all fields!");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }
    const success=await login({email,password});
    if(success)navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(254,243,226)] px-4">
      {/* <Toaster position="top-center" toastOptions={{ duration: 2000 }} /> */}

      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8 transition-all duration-500">
        <h2 className="text-2xl font-bold text-center text-[rgb(221,3,3)] mb-6">
          Login to Your Account
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-[rgb(250,129,47)]" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              className="w-full pl-10 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(250,177,47)]"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-[rgb(250,129,47)]" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full pl-10 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(250,177,47)]"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-between items-center text-sm text-gray-600">
            <span
              onClick={() => navigate('/forgot-password')}
              className="cursor-pointer hover:text-[rgb(250,129,47)]"
            >
              Forgot Password?
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-[rgb(250,129,47)] text-white py-3 rounded-md hover:bg-[rgb(221,3,3)] transition-all duration-300 font-semibold"
          >
            Login
          </button>

          <p className="text-center text-sm mt-3">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-[rgb(221,3,3)] font-semibold cursor-pointer hover:underline"
            >
              Register
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
