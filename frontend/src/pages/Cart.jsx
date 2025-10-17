import { useState, useMemo, useEffect } from "react";
import useUserStore from "../store/userStore";
import { Trash2, Plus, Minus } from "lucide-react";

export default function Cart() {
  const user = useUserStore((state) => state.user);
  const getCart = useUserStore((state) => state.getCart);
  const cart= useUserStore((state) => state.cart);
  const loading= useUserStore((state) => state.loading);
  const addToCart=useUserStore((state) => state.addToCart);
  const removeFromCart=useUserStore((state) => state.removeFromCart);
  const deleteFromCart=useUserStore((state) => state.deleteFromCart);
  const [addresses]=useState(["ss"])
  const [selectedAddress, setSelectedAddress] = useState(addresses[0]);
  const [newAddress, setNewAddress] = useState("");
  const [payment, setPayment] = useState("UPI");
  // Price calculation
  const totalPrice = useMemo(() => {
    if (!cart) return 0;
    return cart.reduce((sum, item) => {
      const price = user?.role === "merchant" ? item.product.merchantPrice : item.product.price;
      return sum + price * item.quantity;
    }, 0);
  }, [cart]);

  const allCodAvailable = cart?.every((item) =>item.product.COD);
  const discount = payment === "UPI" ? totalPrice * 0.01 : 0;
  const finalAmount = totalPrice - discount;

  const handleAddAddress = () => {
    if (newAddress.trim()) {
      setAddresses([...addresses, newAddress]);
      setSelectedAddress(newAddress);
      setNewAddress("");
    }
  };
  useEffect(()=>{
    (async()=>{
      await getCart();
      console.log("My Cart",cart)
    })()
  },[])
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-2">Your Shopping Cart</h1>
      <p className="text-gray-600 mb-6">Review your selected snacks before checkout.</p>

      {/* CART ITEMS */}
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-4 sm:p-6 mb-6">
        {cart?.length === 0 ? (
          <p className="text-center text-gray-500">Your cart is empty 😢</p>
        ) : (
          cart.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row justify-between items-center border-b py-4 last:border-none"
            >
              <div className="flex flex-col items-center sm:items-start">
                <h2 className="font-semibold text-lg">{item.product.title}</h2>
                <p className="text-gray-500">
                  ₹
                  {user?.role === "merchant"
                    ? item.product.merchantPrice
                    : item.product.price}{" "}
                  × {item.quantity}
                </p>
              </div>

              <div className="flex items-center gap-3 mt-3 sm:mt-0">
                <button
                  disabled={loading}
                  onClick={async() =>await removeFromCart(item.product._id)}
                  className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full"
                >
                  <Minus size={16} />
                </button>
                <span className="text-lg font-semibold">{item.quantity}</span>
                <button
                  disabled={loading}
                  onClick={async() => await addToCart(item.product._id)}
                  className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full"
                >
                  <Plus size={16} />
                </button>
                <button
                  disabled={loading}
                  onClick={async() =>await deleteFromCart(item.product._id)}
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
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-4 sm:p-6 mb-6">
        <h2 className="text-xl font-semibold mb-3">Delivery Address</h2>
        <div className="flex flex-col gap-3">
          {addresses.map((addr, idx) => (
            <label key={idx} className="flex items-center gap-2">
              <input
                type="radio"
                name="address"
                checked={selectedAddress === addr}
                onChange={() => setSelectedAddress(addr)}
              />
              <span>{addr}</span>
            </label>
          ))}
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="Add new address"
              className="border rounded-lg px-3 py-2 flex-1"
            />
            <button
              onClick={handleAddAddress}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* ORDER SUMMARY */}
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-4 sm:p-6">
        <h2 className="text-xl font-semibold mb-3">Order Summary</h2>
        <div className="flex justify-between mb-2">
          <span>Total Price:</span>
          <span>₹{totalPrice.toFixed(2)}</span>
        </div>

        {payment === "UPI" && (
          <p className="text-green-600 text-sm mb-2">
            🎉 You get 1% off on UPI payment!
          </p>
        )}

        {discount > 0 && (
          <div className="flex justify-between mb-2 text-green-600">
            <span>Discount (1%):</span>
            <span>-₹{discount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between font-semibold text-lg border-t pt-2">
          <span>Final Amount:</span>
          <span>₹{finalAmount.toFixed(2)}</span>
        </div>

        {/* PAYMENT OPTIONS */}
        <h3 className="text-lg font-semibold mt-4 mb-2">Payment Method</h3>
        <div className="flex flex-col gap-2">
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

        <button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
