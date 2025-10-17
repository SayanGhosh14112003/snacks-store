import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'

export const checkUser = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;

    // 🧩 Check if token exists
    if (!accessToken) {
      return res.status(401).json({ success: false, message: "User not logged in" });
    }

    // 🔑 Verify JWT
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    let user;
    try {
      // 🧠 Try to populate cart and addresses
      user = await User.findById(userId).populate("cart.product addresses");
    } catch (populateError) {
      console.warn("⚠️ Population failed, continuing without it:", populateError.message);
      user = await User.findById(userId); // fallback if populate fails
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // ✅ Attach to req for later routes
    req.user = user;
    next();
  } catch (err) {
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

