import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRouter from './routes/user.routes.js'
import connectDB from './config/db.js';
import categoryRouter from './routes/category.routes.js';
import productRouter from './routes/product.routes.js';
import addressRouter from './routes/address.routes.js'
import cartRouter from './routes/cart.routes.js'
import orderRouter from './routes/order.routes.js'
import bodyParser from 'body-parser';
import { razorpayWebhook } from './controllers/order.controllers.js';
//improt routes

//dotenv configuration
dotenv.config();

const app=express({limit:"10mb"});
const PORT=process.env.PORT || 5000;
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174","https://jovial-trifle-ff0eb2.netlify.app/"],
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use('/api/auth',userRouter);
app.use('/api/category',categoryRouter);
app.use('/api/product',productRouter);
app.use('/api/address',addressRouter);
app.use('/api/cart',cartRouter);
app.use('/api/order',orderRouter);
app.post(
  "/api/webhook/razorpay",
  bodyParser.raw({ type: "application/json" }),
  razorpayWebhook
);
app.listen(PORT,()=>{
    connectDB();
    console.log("Listening at PORT: ",PORT);
})
