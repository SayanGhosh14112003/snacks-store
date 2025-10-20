import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'

export const checkUser = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;

    // ❌ No token present
    if (!accessToken) {
      return res.status(401).json({ success: false, message: "User not logged in" });
    }

    // 🔑 Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      // ❌ Token invalid or expired
      res.clearCookie("accessToken", { httpOnly: true, sameSite: "strict", path: "/" });
      res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict", path: "/" });
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    const userId = decoded?.userId;

    if (!userId) {
      res.clearCookie("accessToken", { httpOnly: true, sameSite: "strict", path: "/" });
      res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict", path: "/" });
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // 🧠 Try to populate cart and addresses
    let user;
    try {
      user = await User.findById(userId).populate("cart.product addresses");
    } catch (populateError) {
      console.warn("⚠️ Population failed, continuing without it:", populateError.message);
      user = await User.findById(userId); // fallback
    }

    if (!user) {
      res.clearCookie("accessToken", { httpOnly: true, sameSite: "strict", path: "/" });
      res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict", path: "/" });
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // ✅ Attach user to request
    req.user = user;
    next();
  } catch (err) {
    // ❌ Unexpected server error
    res.clearCookie("accessToken", { httpOnly: true, sameSite: "strict", path: "/" });
    res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict", path: "/" });
    return res.status(500).json({
      success: false,
      message: err.message || "Something went wrong while checking user",
    });
  }
};


export const checkAdmin=(req,res,next)=>{
    const {user}=req;
    if(user.role==="admin"){
        return next();
    }
    return res.status(401).json({success:false,message:"Unauthorized Access"})
}
export const checkMerchant=(req,res,next)=>{
    const {user}=req;
    if(user.role==="merchant"){
        return next();
    }
    return res.status(401).json({success:false,message:"Unauthorized Access"})
}

