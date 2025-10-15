import { createProduct,updateProduct,deleteProduct,getAllProducts,getProduct} from "../controllers/product.controllers.js";
import { checkUser, checkAdmin } from "../middlewares/auth.middlewares.js";
import { Router } from "express";
import {upload} from '../utils/multer.js'
const router = Router();

router.get('/get-product',getAllProducts)
router.get('/get-product/:id',getProduct)
router.post("/create-product",checkUser, checkAdmin,upload.single('image'), createProduct);
router.put("/update-product/:id",checkUser, checkAdmin,upload.single('image'), updateProduct);
router.delete("/delete-product/:id",checkUser,checkAdmin,deleteProduct);

export default router;

