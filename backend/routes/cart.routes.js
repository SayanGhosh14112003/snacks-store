import { addItemToCart,removeItemFromCart,removeProductFromCart,getCart} from "../controllers/cart.controllers.js"
import { checkUser } from "../middlewares/auth.middlewares.js"
import { Router } from "express"
const router=Router();
router.get('/get-cart',checkUser,getCart)
router.put('/add-to-cart/:productId',checkUser,addItemToCart);
router.put('/remove-from-cart/:productId',checkUser,removeItemFromCart);
router.delete('/remove-product-from-cart/:productId',checkUser,removeProductFromCart);
router.get('/get-cart',checkUser,getCart)
router.get('/test',checkUser,getCart)

export default router;

