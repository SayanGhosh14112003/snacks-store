// import Razorpay from "razorpay";
// import crypto from "crypto";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import dotenv from "dotenv";
dotenv.config();

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_SECRET,
// });

// ✅ Utility to compute total amount safely on backend
function computeTotalAmount(orderProducts) {
  return orderProducts.reduce(
    (sum, item) => sum + item.price * item.totalQuantity,
    0
  );
}

// export const createOrder = async (req, res) => {
//   try {
//     const { cart, address} = req.body;
//     const user = req.user;

//     // 🔒 Input Validation
//     if (!cart || !Array.isArray(cart) || cart.length === 0) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Cart cannot be empty" });
//     }

//     // 🛒 Fetch product details (trusted from DB)
//     const productIds = cart.map((item) => item.product._id);
//     const products = await Product.find({ _id: { $in: productIds } });

//     if (products.length !== cart.length) {
//       return res.status(400).json({
//         success: false,
//         message: "Some products in your cart no longer exist",
//       });
//     }

//     // 💰 Build order products array from trusted DB data
//     const orderProducts = cart?.map((item) => {
//       const product = products.find(
//         (p) => p._id.toString() === item.product._id.toString()
//       );
//       return {
//         product: product._id,
//         title: product.title,
//         image: product.image,
//         totalQuantity: item.quantity,
//         price: user.role === "merchant" ? product.merchantPrice : product.price,
//       };
//     });

//     // 🧮 Calculate backend-verified total amount
//     const totalAmount = computeTotalAmount(orderProducts);

//     // Razorpay expects amount in *paise*
//     const amountInPaise = totalAmount * 100 * 0.99

//     // 💳 Create Razorpay order
//     const options = {
//       amount: amountInPaise,
//       currency: "INR",
//       receipt: `order_rcptid_${Date.now()}`,
//     };
//     const razorpayOrder = await razorpay.orders.create(options);

//     // 💾 Save order as PENDING in DB
//     const newOrder = new Order({
//       user: user._id,
//       products: orderProducts,
//       totalAmount,
//       status: "PENDING",
//       payment: {
//         mode: "ONLINE",
//         razorpay_order_id: razorpayOrder.id,
//       },
//       address: {
//         phone: address.phone,
//         location: address.location,
//         pincode: address.pincode,
//       },
//     });

//     await newOrder.save();

//     // 🚀 Return order details to frontend
//     res.status(200).json({
//       success: true,
//       message: "Razorpay order created successfully",
//       orderId: razorpayOrder.id,
//       amount: totalAmount,
//       key: process.env.RAZORPAY_KEY_ID,
//       currency: razorpayOrder.currency,
//     });
//   } catch (err) {
//     console.error("Create order error:", err);
//     res.status(500).json({
//       success: false,
//       message: err.message || "Something went wrong while creating order",
//     });
//   }
// };


// // ✅ 2️⃣ Verify Payment Controller
// export const verifyPayment = async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
//       req.body;
//     const user = req.user;

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Missing payment fields" });
//     }

//     // 🔐 Step 1: Verify Razorpay signature authenticity
//     const generatedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_SECRET)
//       .update(razorpay_order_id + "|" + razorpay_payment_id)
//       .digest("hex");

//     if (generatedSignature !== razorpay_signature) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid Razorpay signature" });
//     }

//     // 🔎 Step 2: Fetch order from DB (server-trusted data)
//     const existingOrder = await Order.findOne({
//       "payment.razorpay_order_id": razorpay_order_id,
//       user: user._id,
//     });
//     if (!existingOrder) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found for this user",
//       });
//     }

//     // ⚡ Step 3: Fetch payment details from Razorpay API (server→server)
//     const payment = await razorpay.payments.fetch(razorpay_payment_id);
//     if (!payment || payment.status !== "captured") {
//       return res.status(400).json({
//         success: false,
//         message: `Payment not captured yet (status: ${payment?.status || "unknown"})`,
//       });
//     }

//     // 🧮 Step 4: Validate amount matches DB record
//     const expectedAmount = existingOrder.totalAmount * 100 * 0.01; // to paise
//     if (Number(payment.amount) !== expectedAmount) {
//       return res.status(400).json({
//         success: false,
//         message: "Payment amount mismatch. Possible tampering detected.",
//       });
//     }

//     // ✅ Step 5: Update order status and save
//     existingOrder.payment.razorpay_payment_id = razorpay_payment_id;
//     existingOrder.payment.razorpay_signature = razorpay_signature;
//     existingOrder.status = "ACCEPTED"; // or DELIVERED later
//     await existingOrder.save();

//     return res.status(200).json({
//       success: true,
//       message: "Payment verified and order confirmed successfully",
//       order: existingOrder,
//     });
//   } catch (err) {
//     console.error("Verify payment error:", err);
//     res.status(500).json({
//       success: false,
//       message: err.message || "Something went wrong during verification",
//     });
//   }
// };

export const cashOnDelivery = async (req, res) => {
  try {
    const user = req.user;
    const { cart,address} = req.body;
    console.log(address)
    if (!cart || !Array.isArray(cart)) {
      return res.status(400).json({ success: false, message: "Invalid cart data" });
    }

    const productIds = cart.map(item => item.product._id);
    // Validate all products exist in user's cart
    console.log(productIds)
    const products = await Product.find({ _id: { $in: productIds } });
    console.log(products);
    console.log(cart.length);
    if (products.length !== cart.length) {
      return res.status(400).json({ success: false, message: "Some products in cart are invalid" });
    }
    products.map(item => {
      if (!item.COD) {
        return res.status(400).json({ success: false, message: `Product ${item.title} does not support Cash on Delivery` });
      }
    }
    )
    const orderProducts = cart.map(item => {
      const product = products.find(p => p._id.toString() === item.product._id.toString());
      return {
        product: product._id,
        title: product.title,
        image: product.image,
        totalQuantity: item.quantity,
        price: user.role === "merchant" ? product.merchantPrice : product.price,
      }
    });

    const totalAmount = computeTotalAmount(orderProducts);

    const newOrder = new Order({
      user: user._id,
      products: orderProducts,
      totalAmount,
      status: "ORDERED SUCCESSFULLY",
      payment: {
        mode: "COD",
      },
      address: {
        phone: address.phone,
        location: address.location,
        pincode: address.pincode,
      },
    });

    await newOrder.save();
    user.cart=[];
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Cash on Delivery order placed successfully",
      order: newOrder,
    });
  }
  catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
}

export const getMyOrders = async (req, res) => {
  try {
    const user = req.user;
    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Something went wrong while fetching orders",
    });
  }
};
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: orders });
  }
  catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Something went wrong while fetching all orders",
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ["ORDERED SUCCESSFULLY", "DELIVERED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    
    order.status = status;
    await order.save();
    return res.status(200).json({ success: true, message: "Order status updated successfully", data: order });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Something went wrong while updating order status",
    });
  }
};