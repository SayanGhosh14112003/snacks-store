import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "User is required"]
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "product",
                required: [true, "Product is required"]
            },
            title: String,
            image: String, 
            totalQuantity: {
                type: Number,
                min: 1,
                required: [true, "Total quantity is required"]
            },
            price: {
                type: Number,
                min: 0,
                required: [true, "Price is required"]
            }
        }
    ],
    status: {
        type: String,
        enum: ["PENDING", "DELIVERED", "ACCEPTED", "CANCELLED"],
        default: "PENDING"
    },
    totalAmount: {
        type: Number,
        required: [true, "Total amount is required"],
        min: 0,
    },
    payment:{
        mode:{
            type:String,
            enum:["COD","ONLINE"]
        },
       razorpay_order_id:{
            type:String,
            unique:true,
            sparse:true
        },
       razorpay_payment_id:{
            type:String,
            unique:true,
            sparse:true
        },
       razorpay_signature:{
            type:String,
            unique:true,
            sparse:true
        }
    },
    address:{
         phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
            validate: [validator.isMobilePhone, "Enter a valid phone number"]
            },
        location: {
            type: String,
            required: [true, "Location is required"],
            minlength: [5, "Location must be at least 5 characters long"],
            maxlength: [99, "Location must be less than 100 characters"]
            },
        pincode: {
            type: String,
            required: [true, "Pincode is required"],
            trim: true,
            match: [/^\d{6}$/, "Pincode must be exactly 6 digits"],
            }
        }
}, { timestamps: true });

orderSchema.pre("save", function (next) {
  let total = 0;
  this.products.forEach((item) => {
    total += item.price * item.totalQuantity;
  });
  this.totalAmount = total;
  next();
});

const orderModel = mongoose.model("order", orderSchema);
export default orderModel;

