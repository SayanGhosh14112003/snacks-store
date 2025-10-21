import {cashOnDelivery,getMyOrders,getAllOrders,updateOrderStatus,createOrder,verifyPayment} from '../controllers/order.controllers.js';
import {Router} from 'express';
import { checkUser, checkAdmin } from "../middlewares/auth.middlewares.js";
const router = Router();

router.post('/cash-on-delivery', checkUser, cashOnDelivery);
router.get('/my-orders', checkUser, getMyOrders);
router.get('/all-orders', checkUser, checkAdmin, getAllOrders);
router.put('/update-order-status/:orderId', checkUser, checkAdmin,updateOrderStatus) ;
router.post('/create-order', checkUser, createOrder);
router.post('/verify-payment', checkUser, verifyPayment);

// Export
export default router;
