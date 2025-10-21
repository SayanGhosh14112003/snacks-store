import { useState, useMemo, useEffect } from "react";
import useUserStore from "../store/userStore";
import { Trash2, Plus, Minus } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const user = useUserStore((state) => state.user);
  const getCart = useUserStore((state) => state.getCart);
  const cart = useUserStore((state) => state.cart);
  const loading = useUserStore((state) => state.loading);
  const addToCart = useUserStore((state) => state.addToCart);
  const removeFromCart = useUserStore((state) => state.removeFromCart);
  const deleteFromCart = useUserStore((state) => state.deleteFromCart);
  const addAddress = useUserStore((state) => state.addAddress);
  const deleteAddress = useUserStore((state) => state.deleteAddress);
  const updateAddress = useUserStore((state) => state.updateAddress);
  const cashOnDelivery = useUserStore((state) => state.cashOnDelivery);
  const createOrder = useUserStore((state) => state.createOrder);
  const verifyPayment = useUserStore((state) => state.verifyPayment);
  const baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({ phone: "", location: "", pincode: "" });
  const [editAddress, setEditAddress] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [payment, setPayment] = useState("UPI");
  const navigate = useNavigate();

  // -------- PRICE CALCULATION --------
  const totalPrice = useMemo(() => {
    if (!cart) return 0;
    return cart.reduce((sum, item) => {
      const price =
        user?.role === "merchant" ? item.product.merchantPrice : item.product.price;
      return sum + price * item.quantity;
    }, 0);
  }, [cart, user]);

  const allCodAvailable = cart?.every((item) => item.product.COD);
  const discount = payment === "UPI" ? totalPrice * 0.01 : 0;
  const finalAmount = totalPrice - discount;

  useEffect(() => {
    (async () => {
      await getCart();
    })();
  }, []);

  // -------- ADD ADDRESS --------
  const handleSubmit = async () => {
    const { phone, location, pincode } = newAddress;
    if (!/^\d{10}$/.test(phone.trim())) return toast.error("Phone number must be 10 digits");
    if (location.trim().length < 5) return toast.error("Location must be at least 5 characters");
    if (!/^\d{6}$/.test(pincode.trim())) return toast.error("Pincode must be 6 digits");

    await addAddress({
      phone: phone.trim(),
      location: location.trim(),
      pincode: pincode.trim(),
    });
    setNewAddress({ phone: "", location: "", pincode: "" });
  };

  // -------- EDIT ADDRESS --------
  const handleEditClick = (addr, idx) => {
    setEditAddress({ ...addr, idx });
    setIsEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (!editAddress) return;
    const { _id, phone, location, pincode } = editAddress;
    if (!/^\d{10}$/.test(phone.trim())) return toast.error("Phone number must be 10 digits");
    if (location.trim().length < 5) return toast.error("Location must be at least 5 characters");
    if (!/^\d{6}$/.test(pincode.trim())) return toast.error("Pincode must be 6 digits");

    await updateAddress({ addressId: _id, phone, location, pincode });
    setIsEditModalOpen(false);
  };

  // -------- DELETE ADDRESS --------
  const handleDeleteConfirm = async () => {
    selectedAddress === user?.addresses[deleteIndex]?._id && setSelectedAddress(null);
    await deleteAddress(user?.addresses[deleteIndex]?._id);
    setIsDeleteModalOpen(false);
  };

  // -------- USE CURRENT LOCATION --------
  const useCurrentLocation = async () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        setNewAddress((prev) => ({
          ...prev,
          location: res.data.display_name || "",
          pincode: res.data.address?.postcode || "",
        }));
      } catch {
        toast.error("Failed to fetch location");
      }
    });
  };

  // -------- CHECKOUT --------
  const handleCheckout = async () => {
    if (!selectedAddress) return toast.error("Please select a delivery address");
    const { phone, location, pincode } = user.addresses.find(
      (addr) => addr._id === selectedAddress
    );
    if (!phone || !location || !pincode)
      return toast.error("Selected address is incomplete");

    // ✅ COD flow (unchanged)
    if (payment === "COD") {
      if (!allCodAvailable)
        return toast.error("Some items in your cart do not support Cash on Delivery");
      const success = await cashOnDelivery(cart, { phone, location, pincode });
      if (success) navigate("/orders");
      return;
    }

    // ✅ Razorpay flow
    if (payment === "UPI") {
      try {
        const orderCreated = await createOrder(cart, { phone, location, pincode });
        if (!orderCreated) return;

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: orderCreated.amount, // in paise
          currency: "INR",
          name: "DEVI SNACKS",
          description: "Order Payment",
          order_id: orderCreated.orderId,
          //razorpay_order_id, razorpay_payment_id, razorpay_signature
          handler: async function (response) {
            const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;

            const verified = await verifyPayment(
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature
            );

            if (verified) {
              navigate("/orders");
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: phone,
          },
          theme: {
            color: "#FFA500",
          },
        };

        const razor = new window.Razorpay(options);
        razor.open();
      } catch (err) {
        console.error(err);
        toast.error("Payment initiation failed");
      }
    }

  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 mt-6 text-center">
        <span className="bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text">
          Shopping Cart
        </span>
      </h1>

      {/* CART ITEMS */}
      <div className="p-4 border rounded-lg shadow-sm bg-white space-y-4">
        {cart?.length === 0 ? (
          <p className="text-center text-gray-500">Your cart is empty 😢</p>
        ) : (
          cart?.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row justify-between items-center border-b pb-3 last:border-none"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h2 className="font-semibold text-lg">{item.product.title}</h2>
                <p className="text-gray-500">
                  ₹
                  {user?.role === "merchant"
                    ? item.product.merchantPrice
                    : item.product.price}{" "}
                  × {item.quantity}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <button
                  disabled={loading}
                  onClick={async () => await removeFromCart(item.product._id)}
                  className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full"
                >
                  <Minus size={16} />
                </button>
                <span className="font-semibold text-lg">{item.quantity}</span>
                <button
                  disabled={loading}
                  onClick={async () => await addToCart(item.product._id)}
                  className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full"
                >
                  <Plus size={16} />
                </button>
                <button
                  disabled={loading}
                  onClick={async () => await deleteFromCart(item.product._id)}
                  className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-full ml-3"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADDRESS SECTION */}
      <div className="p-4 border rounded-lg shadow-sm bg-white space-y-4">
        <h2 className="text-2xl font-semibold">Delivery Address</h2>

        {/* ADD NEW ADDRESS */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await handleSubmit();
          }}
          className="space-y-2"
        >
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Phone"
              value={newAddress.phone}
              onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
              className="flex-1 p-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Pincode"
              value={newAddress.pincode}
              onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
              className="w-1/3 p-2 border rounded-md"
            />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Location"
              value={newAddress.location}
              onChange={(e) => setNewAddress({ ...newAddress, location: e.target.value })}
              className="flex-1 p-2 border rounded-md"
            />
            <button
              type="button"
              onClick={useCurrentLocation}
              className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-transform duration-300 hover:scale-105"
            >
              Use My Location
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-transform duration-300 hover:scale-105"
          >
            Add Address
          </button>
        </form>

        {/* EXISTING ADDRESSES */}
        <div className="grid md:grid-cols-2 gap-4">
          {user?.addresses?.map((addr, idx) => (
            <label
              key={idx}
              className={`p-4 border rounded-lg shadow-sm bg-white flex flex-col justify-between cursor-pointer transition-transform duration-300 hover:scale-105 ${selectedAddress === addr._id ? "border-blue-500 bg-blue-50" : ""
                }`}
            >
              <div className="flex items-start gap-2">
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddress === addr._id}
                  onChange={() => setSelectedAddress(addr._id)}
                  className="mt-1"
                />
                <div>
                  <p><strong>Phone:</strong> {addr.phone}</p>
                  <p><strong>Location:</strong> {addr.location}</p>
                  <p><strong>Pincode:</strong> {addr.pincode}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEditClick(addr, idx)}
                  className="flex-1 bg-yellow-400 text-white px-2 py-1 rounded-md hover:bg-yellow-500 transition-transform duration-300 hover:scale-105"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setDeleteIndex(idx);
                    setIsDeleteModalOpen(true);
                  }}
                  className="flex-1 bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 transition-transform duration-300 hover:scale-105"
                >
                  Delete
                </button>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* ORDER SUMMARY */}
      <div className="p-4 border rounded-lg shadow-sm bg-white space-y-3">
        <h2 className="text-2xl font-semibold">Order Summary</h2>
        <div className="flex justify-between">
          <span>Total Price:</span>
          <span>₹{totalPrice.toFixed(2)}</span>
        </div>
        {payment === "UPI" && (
          <p className="text-green-600 text-sm">🎉 You get 1% off on UPI payment!</p>
        )}
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount:</span>
            <span>-₹{discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-lg border-t pt-2">
          <span>Final Amount:</span>
          <span>₹{finalAmount.toFixed(2)}</span>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="payment"
              checked={payment === "UPI"}
              onChange={() => setPayment("UPI")}
            />
            <span>UPI (1% off)</span>
          </label>
          {allCodAvailable && (
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="payment"
                checked={payment === "COD"}
                onChange={() => setPayment("COD")}
              />
              <span>Cash on Delivery</span>
            </label>
          )}
        </div>

        <button
          disabled={loading}
          onClick={async () => await handleCheckout()}
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-transform duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Proceed to Checkout
        </button>
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await handleEditSave();
            }}
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
          >
            <h2 className="text-xl font-semibold mb-4">Edit Address</h2>
            <input
              type="text"
              value={editAddress.phone}
              onChange={(e) => setEditAddress({ ...editAddress, phone: e.target.value })}
              className="w-full p-2 border rounded-md mb-2"
            />
            <input
              type="text"
              value={editAddress.location}
              onChange={(e) => setEditAddress({ ...editAddress, location: e.target.value })}
              className="w-full p-2 border rounded-md mb-2"
            />
            <input
              type="text"
              value={editAddress.pincode}
              onChange={(e) => setEditAddress({ ...editAddress, pincode: e.target.value })}
              className="w-full p-2 border rounded-md mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await handleDeleteConfirm();
            }}
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm"
          >
            <h2 className="text-xl font-semibold mb-4 text-red-600">Confirm Delete</h2>
            <p>Are you sure you want to delete this address?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
