import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, KeyRound } from "lucide-react";
import toast  from "react-hot-toast";
import useUserStore from "../store/userStore";

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    OTP: "",
  });

  const navigate = useNavigate();
  const register=useUserStore((state)=>state.register);
  const verify=useUserStore((state)=>state.verify);
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleNext = async(e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
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

    const success=await register({email,name,password,confirmPassword});
    if(success)setStep(2)
  };

  const handleVerify = async(e) => {
    e.preventDefault();
    const {email,OTP}=formData;
    if (OTP.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP!");
      return;
    }
    const sucess=await verify({email,OTP});
    if(sucess)navigate("/login")
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(254,243,226)] px-4">

      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8 transition-all duration-500">
        <h2 className="text-2xl font-bold text-center text-[rgb(221,3,3)] mb-6">
          {step === 1 ? "Create Account" : "Verify OTP"}
        </h2>

        {step === 1 ? (
          <form onSubmit={handleNext} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 text-[rgb(250,129,47)]" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                className="w-full pl-10 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(250,177,47)]"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

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

            <button
              type="submit"
              className="w-full bg-[rgb(250,129,47)] text-white py-3 rounded-md hover:bg-[rgb(221,3,3)] transition-all duration-300 font-semibold"
            >
              Next
            </button>

            <p className="text-center mt-3 text-sm">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-[rgb(221,3,3)] font-semibold cursor-pointer hover:underline"
              >
                Login
              </span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-5">
            <p className="text-center text-gray-700 mb-2">
              Enter the 6-digit OTP sent to your email.
            </p>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 text-[rgb(250,129,47)]" />
              <input
                type="text"
                name="OTP"
                placeholder="Enter OTP"
                maxLength={6}
                className="w-full text-center tracking-widest p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(250,177,47)]"
                value={formData.OTP}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[rgb(250,129,47)] text-white py-3 rounded-md hover:bg-[rgb(221,3,3)] transition-all duration-300 font-semibold"
            >
              Verify & Register
            </button>

            <p
              onClick={() => setStep(1)}
              className="text-center text-sm text-gray-600 cursor-pointer hover:text-[rgb(250,129,47)]"
            >
              ← Back to Registration
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
