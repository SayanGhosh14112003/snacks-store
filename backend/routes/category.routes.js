import { Router } from "express";
import { createCategory,updateCategory,deleteCategory,getCategories,getCategoryById } from "../controllers/category.controllers.js";
import { checkUser,checkAdmin } from "../middlewares/auth.middlewares.js";
const router = Router();

//http://localhost:8080/api/category/get-category
//http://localhost:8080/api/category/get-category/:id
//http://localhost:8080/api/category/create-category
//http://localhost:8080/api/category/update-category/:id
//http://localhost:8080/api/category/delete-category/:id

router.get('/get-category',getCategories)
router.get('/get-category/:id',getCategoryById)
router.post("/create-category",checkUser, checkAdmin, createCategory);
router.put("/update-category/:id",checkUser, checkAdmin, updateCategory);
router.delete("/delete-category/:id",checkUser, checkAdmin, deleteCategory);

export default router;

