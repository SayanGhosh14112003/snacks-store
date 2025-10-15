import mongoose from "mongoose";
import validator from "validator";

const addressSchema = new mongoose.Schema({
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
}, { timestamps: true });

const addressModel = mongoose.model("address", addressSchema);
export default addressModel;

