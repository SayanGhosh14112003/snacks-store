import User from "../models/user.model.js";
import mongoose from 'mongoose'
// ✅ Add item to cart (already correct)
export const addItemToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // 1️⃣ Increment quantity if product already exists
    
    const updated = await User.findOneAndUpdate(
      { _id: userId, "cart.product": productId },
      { $inc: { "cart.$.quantity": 1 } },
      { new: true }
    ).populate("cart.product");
    console.log(updated?.cart);
      
    if (updated) {
       await getCart();
    }

    // 2️⃣ If product not in cart, push it
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { cart: { product: productId, quantity: 1 } } },
      { new: true }
    ).populate("cart.product");

    await getCart();

  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};



// ✅ Remove **1 quantity** of a specific product
export const removeItemToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Ensure productId is ObjectId type
    const productObjectId = new mongoose.Types.ObjectId(productId);

    // 1️⃣ Fetch user first
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cartItem = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Item not found in cart" });
    }

    if (cartItem.quantity > 1) {
      // Decrease quantity
      cartItem.quantity -= 1;
    } else {
      // Remove product from cart entirely
      user.cart = user.cart.filter(
        (item) => item.product.toString() !== productId
      );
    }

    await user.save();

    const updatedUser = await User.findById(userId).populate("cart.product");

    await getCart();

  } catch (err) {
    console.error("Error in removeItemToCart:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Something went wrong while removing item",
    });
  }
};


// ✅ Remove **entire product entry** from cart (regardless of quantity)
export const removeProductFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { cart: { product: productId } } },
      { new: true }
    ).populate("cart.product");

    return res.status(200).json({ success: true, data: updatedUser.cart });

  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};


export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    // Step 1: Fetch user with populated cart
    const user = await User.findById(userId).populate("cart.product");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Step 2: Filter out null or deleted products
    const cleanedCart = user.cart.filter(
      (item) => item.product && item.product._id
    );

    // Step 3: Update database (atomic, safe)
    if (cleanedCart.length !== user.cart.length) {
      await User.updateOne({ _id: userId }, { cart: cleanedCart });
    }

    // Step 4: Return only the valid items
    return res.status(200).json({
      success: true,
      data: cleanedCart,
    });
  } catch (err) {
    console.error("Error in getCart:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Something went wrong while fetching the cart",
    });
  }
};



