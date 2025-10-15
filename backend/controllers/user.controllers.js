import User from '../models/user.model.js';
import sendMail from '../config/mail.js';
import cache from '../config/nodeCache.js';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "1h",
  });

  return { accessToken, refreshToken };
};


const setCookies = (res, accessToken, refreshToken) => {
  // Access token: 15 minutes
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // cannot be accessed by JS (safer)
    secure: false,  // dev: allow HTTP
    sameSite: "lax", // dev-friendly
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Refresh token: 1 hour
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // dev: allow HTTP
    sameSite: "lax",
    maxAge: 60 * 60 * 1000, // 1 hour
  });
};


export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are mandatory" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Both passwords must be same" });
    }

    const userExists = await User.findOne({ email });

    if (!userExists) {
      const OTP = Math.floor(100000 + Math.random() * 900000).toString();
      const user = new User({
        name,
        email,
        password,
        OTP,
        OTP_EXPIRY: new Date(Date.now() + 15 * 60 * 1000),
      });

      await user.save();
      sendMail(email, "OTP", OTP);
      return res.status(200).json({ success: true, message: "OTP sent to email" });
    }

    if (userExists && userExists.isVerified) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // If user exists but not verified
    const OTP = Math.floor(100000 + Math.random() * 900000).toString();
    sendMail(email, "OTP", OTP);
    userExists.OTP = OTP;
    userExists.OTP_EXPIRY = new Date(Date.now() + 15 * 60 * 1000);
    await userExists.save();

    res.status(200).json({ success: true, message: "OTP resent to email" });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Something went wrong" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, OTP } = req.body;

    const userExists = await User.findOne({
      email,
      OTP,
      OTP_EXPIRY: { $gt: Date.now() }
    });

    if (!userExists) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    userExists.isVerified = true;
    userExists.OTP = undefined;
    userExists.OTP_EXPIRY = undefined;
    await userExists.save();

    return res.status(200).json({ success: true, message: "User successfully verified" });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Something went wrong" });
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userExists = await User.findOne({ email, isVerified: true }).populate("addresses cart.product");
    if (!userExists || !(await userExists.comparePassword(password))) {
      return res.status(400).json({ success: false, message: "User not existed or not verified" });
    }

    const { accessToken, refreshToken } = generateTokens(userExists._id);
    cache.set(`refresh_token:${userExists._id}`, refreshToken, 60 * 60);
    setCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      data: {
        _id: userExists._id,
        name: userExists.name,
        role: userExists.role,
        email: userExists.email,
        cart: userExists.cart,
        addresses: userExists.addresses
      }
    });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Something went wrong" });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      cache.del(`refresh_token:${decoded.userId}`);
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Something went wrong" });
  }
};


export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const userExists = await User.findOne({ email, isVerified: true });
    if (!userExists) {
      return res.status(400).json({ success: false, message: "User doesn't exist or not verified" });
    }
    const rawToken = uuidv4();

    userExists.FORGET_PASSWORD = rawToken;
    userExists.FORGET_PASSWORD_EXPIRY = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await userExists.save();

    const link = `http://localhost:5173/reset-password/${rawToken}`;
    sendMail(email, "Reset Password", `Click here to reset: ${link}`);

    return res.status(200).json({ success: true, message: "Reset password link sent to email" });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Something went wrong" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    const userExists = await User.findOne({
      FORGET_PASSWORD: token,
      FORGET_PASSWORD_EXPIRY: { $gt: Date.now() }
    });

    if (!userExists) {
      return res.status(400).json({ success: false, message: "Invalid or expired link" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Both passwords must be same" });
    }

    userExists.password = password; // Make sure password is hashed in model pre-save hook
    userExists.FORGET_PASSWORD = undefined;
    userExists.FORGET_PASSWORD_EXPIRY = undefined;

    await userExists.save();

    return res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Something went wrong" });
  }
};

export const getMyDetails = (req, res) => {
 
  return res.status(200).json({
    success: true,
    data: {
      _id:req.user._id,
      name:req.user.name,
      email:req.user.email,
      cart:req.user.cart,
      addresses:req.user.addresses,
      role:req.user.role
    }
  })
}
export const getAllUsers=async(_,res)=>{
  try{
    const users=await User.find({}).populate("addresses").select("-password -OTP -OTP_EXPIRY -FORGET_PASSWORD -FORGET_PASSWORD_EXPIRY");
    res.status(200).json({
      success:true,
      data:users
    })
  }
  catch(err){
    res.status(err.status || 500).json({ success: false, message: err.message || "Something went wrong" });
  }
}
export const changeRole = async (req, res) => {
  try {
    const {userId}=req.params
    const { role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: "User ID and role are required",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password -OTP -OTP_EXPIRY -FORGET_PASSWORD -FORGET_PASSWORD_EXPIRY"); // ✅ exclude password safely

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error("Error changing role:", err);
    res.status(err.status || 500).json({ success: false, message: err.message || "Something went wrong" });
  }
};

