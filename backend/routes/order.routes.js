import {cashOnDelivery,getMyOrders,getAllOrders,updateOrderStatus} from '../controllers/order.controllers.js';
import {Router} from 'express';
import { checkUser, checkAdmin } from "../middlewares/auth.middlewares.js";
const router = Router();

router.post('/cash-on-delivery', checkUser, cashOnDelivery);
router.get('/my-orders', checkUser, getMyOrders);
router.get('/all-orders', checkUser, checkAdmin, getAllOrders);
router.put('/update-order-status/:orderId', checkUser, checkAdmin,updateOrderStatus) ;

export default router;
