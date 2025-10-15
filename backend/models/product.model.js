import mongoose from 'mongoose';
const productSchema=new mongoose.Schema({
    title:{
        type:String,
        required:[true,"Title is required"],
        trim:true
    },
    description:{
        type:String,
        required:[true,"Description is required"],
        trim:true
    },
    price:{
        type:Number,
        required:[true,"Price is required"],
        min:0
    },
    merchantPrice:{
        type:Number,
        required:[true,"Merchant price is required"],
        min:0
    },
    image:{
        type:String,
        required:[true,"Image is required"],
        trim:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"category",
    },
    COD:{
        type:Boolean,
        default:true
    }
},{timestamps:true});

const productModel=mongoose.model("product",productSchema);
export default productModel;
