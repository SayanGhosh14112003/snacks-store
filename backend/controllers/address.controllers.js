import User from "../models/user.model.js";
import Address from "../models/address.model.js";
import validator from "validator";

export const addAddress = async (req, res) => {
  try {
    const { phone, location, pincode } = req.body;
    const user = req.user;

    // Manual validation (optional, extra safety)
    if (!phone || !validator.isMobilePhone(phone, "en-IN")) {
      return res.status(400).json({ success: false, message: "Enter a valid phone number" });
    }
    if (!location || location.length < 5 || location.length > 99) {
      return res.status(400).json({ success: false, message: "Location must be between 5 and 99 characters" });
    }
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ success: false, message: "Pincode must be exactly 6 digits" });
    }

    // Create new address
    const newAddress = await Address.create({ phone, location, pincode });

    // Add to user's addresses
    user.addresses.push(newAddress._id);
    await user.save();
    await user.populate("addresses");
    return res.status(201).json({ success: true, data: newAddress});
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || "Something went wrong" });
  }
};


export const removeAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = req.user;

    // Check if address exists in user's addresses
    if (!user.addresses.some(addr => addr._id.toString() === addressId.toString())) {
  return res.status(404).json({ success: false, message: "Address not found in user" });
}

    // Remove address from user's addresses array
    user.addresses = user.addresses.filter(x => x.id.toString() !== addressId);
    await user.save();

    // Delete address from address collection
    await Address.findByIdAndDelete(addressId);
    await user.populate("addresses");
    return res.status(200).json({ success: true,  data:addressId });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || "Something went wrong" });
  }
};


export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { phone, location, pincode } = req.body;
    const user = req.user;

    // Validate input
    if (!addressId) {
      return res.status(400).json({ success: false, message: "Address ID is required" });
    }

    if (!phone || !validator.isMobilePhone(phone, "en-IN")) {
      return res.status(400).json({ success: false, message: "Enter a valid phone number" });
    }

    if (!location || location.length < 5 || location.length > 99) {
      return res.status(400).json({ success: false, message: "Location must be between 5 and 99 characters" });
    }

    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ success: false, message: "Pincode must be exactly 6 digits" });
    }

    // Update address
    const newAddress = await Address.findByIdAndUpdate(
      addressId,
      { phone, location, pincode },
      { new: true }
    );

    if (!newAddress) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }
    await user.populate("addresses");
    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data:newAddress
    });
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({ success: false, message: err.message || "Something went wrong" });
  }
};


