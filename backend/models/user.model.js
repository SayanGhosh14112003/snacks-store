import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid Email"],
  },
  password: {
    type: String,
    trim: true,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"]
  },
  cart: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: [true, "Product is required"]
      },
      quantity: {
        type: Number,
        default: 1,
        min: [1, "Quantity cannot be less than 1"]
      }
    }
  ],
  addresses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "address"   // Reference to Address model
    }
  ],
  role: {
    type: String,
    enum: ["admin", "merchant", "customer"],
    default: "customer"
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  OTP: String,
  OTP_EXPIRY: Date,
  FORGET_PASSWORD: String,
  FORGET_PASSWORD_EXPIRY: Date
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next(); // hash only if password changed
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const userModel = mongoose.model("user", userSchema);
export default userModel;

