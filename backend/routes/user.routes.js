import { Router } from "express";
import { register,verifyEmail,login,logout,forgetPassword,resetPassword,getMyDetails,getAllUsers,changeRole} from "../controllers/user.controllers.js";
import { checkAdmin, checkUser} from "../middlewares/auth.middlewares.js";
const router=Router();

router.post('/register',register);
router.post('/verify-email',verifyEmail)
router.post('/login',login)
router.post('/logout',logout)
router.post('/forgot-password',forgetPassword);
router.post('/reset-password/:token',resetPassword);
router.get('/my-details',checkUser,getMyDetails);
router.get('/get-all-users',checkUser,checkAdmin,getAllUsers);
router.put('/change-role/:userId',checkUser,checkAdmin,changeRole)
// router.get('/check-auth',checkUser,(req,res)=>{
//     res.json(req.user)
// })
// router.get('/check-admin',checkUser,checkAdmin,(req,res)=>{
//     res.send(req.user)
// })
// router.get('/check-merchant',checkUser,checkMerchant,(req,res)=>{
//     res.send(req.user)
// })

export default router;
