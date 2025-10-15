import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'
export const checkUser=async(req,res,next)=>{
    try{
        const {accessToken}=req.cookies;
        if(!accessToken)return res.status(401).json({success:false,message:"User not logged In"})
        const {userId}=jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);
        const user=await User.findById(userId).populate("cart.product addresses");
         if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }
        req.user=user;
        next();
    }
    catch(err){
        return res.status(err.status || 500).json({ success: false, message: err.message || "Something went wrong" });
    }
}
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

