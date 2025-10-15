import { addItemToCart,removeItemToCart,removeProductFromCart,getCart,test} from "../controllers/cart.controllers.js"
import { checkUser } from "../middlewares/auth.middlewares.js"
import { Router } from "express"
const router=Router();

router.put('/add-to-cart/:productId',checkUser,addItemToCart);
router.put('/remove-from-cart/:productId',checkUser,removeItemToCart);
router.put('/remove-product-from-cart/:productId',checkUser,removeProductFromCart);
router.get('/get-cart',checkUser,getCart)
router.get('/test',checkUser,getCart)

export default router;

