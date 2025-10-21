import User from '../models/user.model.js';
import sendMail from '../config/mail.js';
import cache from '../config/nodeCache.js';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// ------------------- TOKEN UTILITIES -------------------
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1h" });
  return { accessToken, refreshToken };
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, { httpOnly: true, secure: false, sameSite: "lax", maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: false, sameSite: "lax", maxAge: 60 * 60 * 1000 });
};

// ------------------- EMAIL TEMPLATES -------------------
const generateOTPEmail = (OTP) => `
<div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px; background:#f9f9f9; border-radius:8px; border:1px solid #eee;">
  <h2 style="color:#333;">🔑 Your OTP Code</h2>
  <p style="color:#555;">Use the following OTP to verify your account. It expires in 15 minutes.</p>
  <p style="font-size:24px; font-weight:bold; color:#1a73e8;">${OTP}</p>
  <p style="color:#999; font-size:12px;">If you didn't request this, please ignore this email.</p>
</div>
`;

const generateWelcomeEmail = (name) => `
<div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px; background:#f9f9f9; border-radius:8px; border:1px solid #eee;">
  <h2 style="color:#333;">🎉 Welcome to Snacks Store, ${name}!</h2>
  <p style="color:#555;">Your account has been successfully verified. Start exploring our delicious snacks today!</p>
  <p style="color:#999; font-size:12px;">&copy; 2025 Devi Snacks . All rights reserved.</p>
</div>
`;

const generateLoginAlertEmail = (name) => `
<div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px; background:#f9f9f9; border-radius:8px; border:1px solid #eee;">
  <h2 style="color:#333;">🔔 Login Alert</h2>
  <p style="color:#555;">Hi ${name}, you have successfully logged into your account.</p>
  <p style="color:#999; font-size:12px;">If this wasn't you, please reset your password immediately.</p>
</div>
`;

const generateResetPasswordEmail = (link) => `
<div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px; background:#f9f9f9; border-radius:8px; border:1px solid #eee;">
  <h2 style="color:#333;">🔒 Reset Your Password</h2>
  <p style="color:#555;">Click the button below to reset your password. This link expires in 15 minutes.</p>
  <a href="${link}" style="display:inline-block; padding:12px 24px; background-color:#1a73e8; color:#fff; border-radius:4px; text-decoration:none; margin-top:10px;">Reset Password</a>
  <p style="color:#999; font-size:12px; margin-top:15px;">If you didn't request this, please ignore this email.</p>
</div>
`;

const generatePasswordResetSuccessEmail = () => `
<div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px; background:#f9f9f9; border-radius:8px; border:1px solid #eee;">
  <h2 style="color:#333;">✅ Password Reset Successful</h2>
  <p style="color:#555;">Your password has been reset successfully. You can now log in with your new password.</p>
  <p style="color:#999; font-size:12px;">If this wasn't you, please contact support immediately.</p>
</div>
`;

// ------------------- CONTROLLERS -------------------
export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) 
      return res.status(400).json({ success: false, message: "All fields are mandatory" });
    if (password !== confirmPassword) 
      return res.status(400).json({ success: false, message: "Passwords must match" });

    const userExists = await User.findOne({ email });

    const OTP = Math.floor(100000 + Math.random() * 900000).toString();
    if (!userExists) {
      const user = new User({ name, email, password, OTP, OTP_EXPIRY: new Date(Date.now() + 15 * 60 * 1000) });
      await user.save();
      await sendMail(email, "OTP Verification", generateOTPEmail(OTP));
      return res.status(200).json({ success: true, message: "OTP sent to email" });
    }

    if (userExists.isVerified) return res.status(400).json({ success: false, message: "User already exists" });

    // Resend OTP
    userExists.OTP = OTP;
    userExists.OTP_EXPIRY = new Date(Date.now() + 15 * 60 * 1000);
    await userExists.save();
    await sendMail(email, "OTP Verification", generateOTPEmail(OTP));
    return res.status(200).json({ success: true, message: "OTP resent to email" });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Something went wrong" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, OTP } = req.body;
    const userExists = await User.findOne({ email, OTP, OTP_EXPIRY: { $gt: Date.now() } });
    if (!userExists) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

    userExists.isVerified = true;
    userExists.OTP = undefined;
    userExists.OTP_EXPIRY = undefined;
    await userExists.save();

    await sendMail(email, "Welcome to Snacks Store", generateWelcomeEmail(userExists.name));
    return res.status(200).json({ success: true, message: "User successfully verified" });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Something went wrong" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userExists = await User.findOne({ email, isVerified: true }).populate("addresses cart.product");
    if (!userExists || !(await userExists.comparePassword(password))) 
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    const { accessToken, refreshToken } = generateTokens(userExists._id);
    cache.set(`refresh_token:${userExists._id}`, refreshToken, 60 * 60);
    setCookies(res, accessToken, refreshToken);

    await sendMail(email, "Login Alert", generateLoginAlertEmail(userExists.name));
    return res.status(200).json({ success: true, data: { _id: userExists._id, name: userExists.name, role: userExists.role, email: userExists.email, addresses: userExists.addresses } });
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
    if (!userExists) return res.status(400).json({ success: false, message: "User doesn't exist" });

    const rawToken = uuidv4();
    userExists.FORGET_PASSWORD = rawToken;
    userExists.FORGET_PASSWORD_EXPIRY = new Date(Date.now() + 15 * 60 * 1000);
    await userExists.save();

    const link = `http://localhost:5173/reset-password/${rawToken}`;
    await sendMail(email, "Reset Password", generateResetPasswordEmail(link));
    return res.status(200).json({ success: true, message: "Reset password link sent to email" });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Something went wrong" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    const userExists = await User.findOne({ FORGET_PASSWORD: token, FORGET_PASSWORD_EXPIRY: { $gt: Date.now() } });
    if (!userExists) return res.status(400).json({ success: false, message: "Invalid or expired link" });
    if (password !== confirmPassword) return res.status(400).json({ success: false, message: "Passwords must match" });

    userExists.password = password;
    userExists.FORGET_PASSWORD = undefined;
    userExists.FORGET_PASSWORD_EXPIRY = undefined;
    await userExists.save();

    await sendMail(userExists.email, "Password Reset Successful", generatePasswordResetSuccessEmail());
    return res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Something went wrong" });
  }
};

// ------------------- USER DATA -------------------
export const getMyDetails = (req, res) => {
  return res.status(200).json({ success: true, data: { _id: req.user._id, name: req.user.name, email: req.user.email, addresses: req.user.addresses, role: req.user.role } });
};

export const getAllUsers = async (_, res) => {
  try {
    const users = await User.find({}).populate("addresses").select("-password -OTP -OTP_EXPIRY -FORGET_PASSWORD -FORGET_PASSWORD_EXPIRY");
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Something went wrong" });
  }
};

export const changeRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    if (!userId || !role) return res.status(400).json({ success: false, message: "User ID and role are required" });

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select("-password -OTP -OTP_EXPIRY -FORGET_PASSWORD -FORGET_PASSWORD_EXPIRY");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, data: { _id: user._id, name: user.name, role: user.role, email: user.email, addresses: user.addresses } });
  } catch (err) {
    console.error("Error changing role:", err);
    res.status(err.status || 500).json({ success: false, message: err.message || "Something went wrong" });
  }
};
