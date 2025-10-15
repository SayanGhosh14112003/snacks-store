import mongoose from 'mongoose';
const categorySchema=new mongoose.Schema({
    title:{
        type:String,
        required:[true,"Title is required"],
        trim:true,
        unique:[true,"Category name must be unique"]
    }
},{timestamps:true});

const categoryModel=mongoose.model("category",categorySchema);
export default categoryModel;
