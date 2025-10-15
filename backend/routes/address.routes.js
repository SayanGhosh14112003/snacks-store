import { Router } from "express";
import {addAddress,removeAddress,updateAddress} from '../controllers/address.controllers.js';
import { checkUser } from "../middlewares/auth.middlewares.js";
const router=Router();
router.post('/add-address',checkUser,addAddress)
router.delete('/delete-address/:addressId',checkUser,removeAddress);
router.put('/update-address/:addressId',checkUser,updateAddress)
export default router;

