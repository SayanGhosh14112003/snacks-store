import cloudinary from "../config/cloudinary.js";
import Product from "../models/product.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import path from 'path'
export const createProduct = async (req, res) => {
  try {
    const { title, description, price, merchantPrice, category,COD } = req.body;
    const file = req.file;

    if (!title || !description || !price || !merchantPrice || !file || !category) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    
    const imageUrl = await uploadOnCloudinary(file.path);
    
    if (!imageUrl) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong while uploading image",
      });
    }
    
    const product = new Product({
      title,
      description,
      price,
      merchantPrice,
      image: imageUrl,
      category,
      COD
    });

    await product.save();
    await product.populate("category");
    return res.status(201).json({
      success: true,
      data:product,
      message: "Product created successfully",
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};



export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, merchantPrice, category,COD } = req.body;
    const file = req.file;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (file) {
      // destroy previous image from Cloudinary
      if (product.image) {
        // extract public_id from URL: Cloudinary URLs usually have format:
        // https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<public_id>.<ext>
        const publicId = path.basename(product.image).split(".")[0];

        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      }

      // upload new image
      const imageUrl = await uploadOnCloudinary(file.path);

      if (!imageUrl) {
      console.log("Hello imageUrl")
        return res.status(500).json({
          success: false,
          message: "Something went wrong while uploading image",
        });
      }

      product.image = imageUrl;
    }

    product.title = title || product.title;
    product.description = description || product.description;
    product.price = price || product.price;
    product.merchantPrice = merchantPrice || product.merchantPrice;
    product.category = category || product.category;
    product.COD=COD || product.COD

    await product.save();
    await product.populate("category");
    return res.status(200).json({
      success: true,
      data:product,
      message: "Product updated successfully",
    });
  } catch (err) {
    console.error("CAtherd",err.message);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    if (product.image) {
      const publicId = path.basename(product.image).split(".")[0];
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      } catch (err) {
        console.error("Failed to delete image from Cloudinary:", err);
      }
    }
    await Product.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      data:id,
      message: "Product deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};


export const getAllProducts=async(_,res)=>{
  try{
    const products=await Product.find({}).populate("category")
    res.status(200).json({
      success:true,
      data:products
    });
  }
  catch(err){
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
}

export const getProduct=async(req,res)=>{
  try{
    const {productId}=req.params;
    const product=await Product.findById(productId).populate("category");
    res.status(200).json({
      success:true,
      data:product
    });
  }
  catch(err){
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
}


