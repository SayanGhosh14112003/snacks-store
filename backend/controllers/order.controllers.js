import Razorpay from "razorpay";
import crypto from "crypto";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import dotenv from "dotenv";
import sendMail from "../config/mail.js";

export const sendOrderReceipt = async (user, order) => {
  const productList = order.products
    .map(
      (p) => `
    <tr style="border-bottom:1px solid #ddd; vertical-align: middle;">
      <td style="padding:8px; display:flex; align-items:center;">
        <img src="${p.image}" alt="${p.title}" style="width:50px; height:50px; object-fit:cover; margin-right:10px; border-radius:4px;">
        ${p.title}
      </td>
      <td style="padding:8px; text-align:center;">${p.totalQuantity}</td>
      <td style="padding:8px; text-align:right;">₹${p.price.toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  const htmlContent = `
  <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px; border:1px solid #eee; border-radius:8px; background-color:#f9f9f9;">
    <h2 style="color:#333;">Thank you for your order, ${user.name}!</h2>
    <p style="color:#555;">Your order <strong>#${order._id}</strong> has been successfully placed.</p>

    <h3 style="color:#333;">Order Details:</h3>
    <table style="width:100%; border-collapse: collapse;">
      <thead>
        <tr style="background-color:#f2f2f2;">
          <th style="padding: 8px; text-align:left;">Product</th>
          <th style="padding: 8px; text-align:center;">Qty</th>
          <th style="padding: 8px; text-align:right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${productList}
        <tr>
          <td colspan="2" style="padding:8px; text-align:right; font-weight:bold;">Total:</td>
          <td style="padding:8px; text-align:right; font-weight:bold;">₹${order.totalAmount.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <h3 style="color:#333;">Payment Mode:</h3>
    <p style="color:#555;">
      ${order.payment.mode === "COD" ? "Cash on Delivery" : "Online Payment"}
    </p>
    <h3 style="color:#333;">Shipping Address:</h3>
    <p style="color:#555;">
      ${order.address.location}<br>
      Pincode: ${order.address.pincode}<br>
      Phone: ${order.address.phone}
    </p>
    <p style="color:#999; font-size:12px;">&copy; 2025 DEVI SNACKS. All rights reserved.</p>
  </div>
  `;

 sendMail(user.email, `Your Order #${order._id} Receipt`, htmlContent);
};
export const sendOrderConfirmationMail = async (user, order) => {
  const productList = order.products
    .map(
      (p) => `
    <tr style="border-bottom:1px solid #ddd; vertical-align: middle;">
      <td style="padding:8px; display:flex; align-items:center;">
        <img src="${p.image}" alt="${p.title}" style="width:50px; height:50px; object-fit:cover; margin-right:10px; border-radius:4px;">
        ${p.title}
      </td>
      <td style="padding:8px; text-align:center;">${p.totalQuantity}</td>
      <td style="padding:8px; text-align:right;">₹${p.price.toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  const htmlContent = `
  <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px; border:1px solid #eee; border-radius:8px; background-color:#f9f9f9;">
    <h2 style="color:#333;">🎉 Order Confirmed!</h2>
    <p style="color:#555;">Hi ${user.name},</p>
    <p style="color:#555;">Your order <strong>#${order._id}</strong> has been successfully placed. Thank you for shopping with us!</p>

    <h3 style="color:#333;">Order Summary:</h3>
    <table style="width:100%; border-collapse: collapse;">
      <thead>
        <tr style="background-color:#f2f2f2;">
          <th style="padding:8px; text-align:left;">Product</th>
          <th style="padding:8px; text-align:center;">Qty</th>
          <th style="padding:8px; text-align:right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${productList}
        <tr>
          <td colspan="2" style="padding:8px; text-align:right; font-weight:bold;">Total:</td>
          <td style="padding:8px; text-align:right; font-weight:bold;">₹${order.totalAmount.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <h3 style="color:#333;">Payment Mode:</h3>
    <p style="color:#555;">
      ${order.payment.mode === "COD" ? "Cash on Delivery" : "Online Payment"}
    </p>
    <h3 style="color:#333;">Shipping Address:</h3>
    <p style="color:#555;">
      ${order.address.location}<br>
      Pincode: ${order.address.pincode}<br>
      Phone: ${order.address.phone}
    </p>

    <p style="color:#999; font-size:12px; margin-top:20px;">&copy; 2025 DEVI SNACKS. All rights reserved.</p>
  </div>
  `;

 sendMail(user.email, `Your Order #${order._id} is Confirmed!`, htmlContent);
};



dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// ✅ Utility to compute total amount safely on backend
function computeTotalAmount(orderProducts) {
  return orderProducts.reduce(
    (sum, item) => sum + item.price * item.totalQuantity,
    0
  );
}

export const createOrder = async (req, res) => {
  try {
    const { cart, address} = req.body;
    const user = req.user;

    // 🔒 Input Validation
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Cart cannot be empty" });
    }

    // 🛒 Fetch product details (trusted from DB)
    const productIds = cart.map((item) => item.product._id);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== cart.length) {
      return res.status(400).json({
        success: false,
        message: "Some products in your cart no longer exist",
      });
    }

    // 💰 Build order products array from trusted DB data
    const orderProducts = cart?.map((item) => {
      const product = products.find(
        (p) => p._id.toString() === item.product._id.toString()
      );
      return {
        product: product._id,
        title: product.title,
        image: product.image,
        totalQuantity: item.quantity,
        price: user.role === "merchant" ? product.merchantPrice : product.price,
      };
    });

    // 🧮 Calculate backend-verified total amount
    const totalAmount = computeTotalAmount(orderProducts);

    // Razorpay expects amount in *paise*
    const amountInPaise = Math.round(totalAmount * 100 * 0.99)

    // 💳 Create Razorpay order
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`,
    };
    const razorpayOrder = await razorpay.orders.create(options);
    const finalAmount=amountInPaise/100;
    console.log(finalAmount)
    // 💾 Save order as PENDING in DB
    const newOrder = new Order({
      user: user._id,
      products: orderProducts,
      totalAmount: finalAmount,
      status: "NOT COMPLETED",
      payment: {
        mode: "ONLINE",
        razorpay_order_id: razorpayOrder.id,
      },
      address: {
        phone: address.phone,
        location: address.location,
        pincode: address.pincode,
      },
    });

    await newOrder.save();
    console.log("Order saved:", newOrder._doc.totalAmount);
    user.cart=[];
    await user.save();
    // 🚀 Return order details to frontend
    //send product details also
    await sendOrderReceipt(user, newOrder);
    res.status(200).json({
      success: true,
      data:{
        message: "Razorpay order created successfully",
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        key: process.env.RAZORPAY_KEY_ID,
        currency: razorpayOrder.currency,
      }
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Something went wrong while creating order",
    });
  }
};


// ✅ 2️⃣ Verify Payment Controller
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const user = req.user;
    console.log(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Missing payment fields" });
    }

    // 🔐 Step 1: Verify Razorpay signature authenticity
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Razorpay signature" });
    }

    // 🔎 Step 2: Fetch order from DB (server-trusted data)
    const existingOrder = await Order.findOne({
      "payment.razorpay_order_id": razorpay_order_id,
      user: user._id,
    });
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found for this user",
      });
    }

    // ⚡ Step 3: Fetch payment details from Razorpay API (server→server)
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (!payment || payment.status !== "captured") {
      return res.status(400).json({
        success: false,
        message: `Payment not captured yet (status: ${payment?.status || "unknown"})`,
      });
    }

    // 🧮 Step 4: Validate amount matches DB record
    console.log(payment.amount, existingOrder.totalAmount * 100); 
    const expectedAmount = existingOrder.totalAmount * 100; // to paise
    if (Number(payment.amount) !== expectedAmount) {
      return res.status(400).json({
        success: false,
        message: "Payment amount mismatch. Possible tampering detected.",
      });
    }

    // ✅ Step 5: Update order status and save
    existingOrder.payment.razorpay_payment_id = razorpay_payment_id;
    existingOrder.payment.razorpay_signature = razorpay_signature;
    existingOrder.status = "ORDERED SUCCESSFULLY"; // or DELIVERED later
    await existingOrder.save();
    //sending receipt email
    await sendOrderConfirmationMail(user, existingOrder);
    return res.status(200).json({
      success: true,
      message: "Payment verified and order confirmed successfully",
      order: existingOrder,
    });
  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Something went wrong during verification",
    });
  }
};

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
    sendOrderConfirmationMail(user, newOrder);
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

    // Pagination parameters
    const page = parseInt(req.query.page) || 1; // default page 1
    const limit = parseInt(req.query.limit) || 5; // default 5 orders per page
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments({ user: user._id });
    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        totalOrders,
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        limit,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Something went wrong while fetching orders",
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const totalOrders = await Order.countDocuments();
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name email'); ;

    const totalPages = Math.ceil(totalOrders / limit);

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        totalOrders,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (err) {
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

// ✅ Razorpay Webhook Handler
export const razorpayWebhook = async (req, res) => {
  try {
    // Razorpay sends the body as raw JSON string for signature verification
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET; // set this in .env
    const payload = JSON.stringify(req.body);
    const signature = req.headers["x-razorpay-signature"];

    if (!signature) {
      return res.status(400).send("Webhook signature missing");
    }

    // 🔐 Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.warn("Webhook signature mismatch");
      return res.status(400).send("Invalid signature");
    }

    const event = req.body.event;
    const paymentData = req.body.payload.payment.entity;

    // Only process successful payments
    if (event === "payment.captured" && paymentData.status === "captured") {
      const razorpay_order_id = paymentData.order_id;
      const razorpay_payment_id = paymentData.id;
      const amount = paymentData.amount; // in paise

      // ✅ Fetch order from DB
      const order = await Order.findOne({
        "payment.razorpay_order_id": razorpay_order_id,
      });

      if (!order) {
        console.warn("Order not found for Razorpay order_id:", razorpay_order_id);
        return res.status(404).send("Order not found");
      }

      // Check amount matches backend-calculated total
      const expectedAmount = Math.round(order.totalAmount * 100);
      if (amount !== expectedAmount) {
        console.warn(
          `Amount mismatch for order ${order._id}: expected ${expectedAmount}, got ${amount}`
        );
        return res.status(400).send("Amount mismatch");
      }

      // Update order safely
      order.payment.razorpay_payment_id = razorpay_payment_id;
      order.status = "ORDERED SUCCESSFULLY";
      await order.save();

      console.log(`Order ${order._id} updated via webhook`);
      return res.status(200).send("Webhook processed successfully");
    }

    // Ignore other events
    res.status(200).send("Event ignored");
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).send("Internal server error");
  }
};
