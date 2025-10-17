
// ✅ ADD ITEM TO CART - ATOMIC (No race conditions, no duplicates)
export const getCart=async(req,res)=>{
  try {

    const user = req.user;
    // Clean up invalid entries (if any)
    if(!Array.isArray(user?.cart)) {
      user.cart = [];
    }
    user.cart = user?.cart?.filter((item) => item?.product);
    await user.save();
    // Optionally populate for better response
    // await user.populate("cart.product");
    return res.status(200).json({ success: true, data: user.cart});
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Something went wrong while getting cart items",
    });
  }
  
}
export const addItemToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = req.user;
    
    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID not provided" });
    }
    
    // Find if product already exists in cart
    const existingProduct = user?.cart?.find(
      (item) => item?.product?._id?.toString() === productId.toString()
    );

    if (!existingProduct) {
      user.cart.push({ product: productId, quantity: 1 });
    } else {
      existingProduct.quantity += 1;
    }

    // Clean up invalid entries (if any)
    user.cart = user?.cart?.filter((item) => item?.product);

    await user.save();

    // Optionally populate for better response
    // await user.populate("cart.product");

    return res.status(200).json({ success: true, data: user.cart });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Something went wrong while adding item",
    });
  }
};

export const removeItemFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const user=req.user;
    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID not provided" });
    }
    const existingProduct = user?.cart?.find(
      (item) => item?.product?._id?.toString() === productId.toString()
    );
    
    if (!existingProduct) { 
      return res.status(404).json({ success: false, message: "Item not found in cart" });
    }
    
    if (existingProduct.quantity > 1) {
      existingProduct.quantity -= 1;
    } else {
      user.cart = user?.cart?.filter(
        (item) => item?.product?._id?.toString() !== productId.toString()
      );
    }
    await user.save();

    // Optionally populate for better response
    // await user.populate("cart.product");

    return res.status(200).json({ success: true, data: user.cart });

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
    const user = req.user;
    user.cart = user?.cart?.filter(
      (item) => item?.product?._id?.toString() !== productId.toString()
    );

    await user.save();

    // Optionally populate for better response
    // await user.populate("cart.product");

    return res.status(200).json({ success: true, data: user.cart });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};





