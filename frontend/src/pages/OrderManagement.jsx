import { useState, useEffect } from "react";
import { StepBack, Edit2, X, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../store/userStore";
import Loader from "../components/Loader";

export default function OrderManagement() {
  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const navigate = useNavigate();
  const orders = useUserStore((state) => state.orders);
  const ordersPagination = useUserStore((state) => state.ordersPagination);
  const getOrders = useUserStore((state) => state.getOrders);
  const updateOrderStatus = useUserStore((state) => state.updateOrderStatus);
  const loading = useUserStore((state) => state.loading);

  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    getOrders(currentPage, 6);
  }, [getOrders, currentPage]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!newStatus) {
      alert("Please select a status!");
      return;
    }
    await updateOrderStatus(selectedOrder._id, newStatus);
    setShowEditModal(false);
    setSelectedOrder(null);
    setNewStatus("");
    getOrders(currentPage, 5); // refresh orders after update
  };

  return (
    <div className="p-6">
      {/* Go Back */}
      <button
        onClick={() => navigate(-1)}
        className="mx-auto flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2.5 rounded-full shadow-md hover:from-orange-600 hover:to-red-600 transition-all duration-300 active:scale-95"
      >
        <StepBack className="w-5 h-5" />
        <span className="font-medium">Go Back</span>
      </button>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-800 mt-6 text-center">
        <span className="bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text">
          Order Management
        </span>
      </h1>

      {/* Orders Grid */}
      {
        loading && <Loader/>
      }
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-6">
        {orders?.length === 0 && !loading ? (
          <p className="text-center text-gray-500 col-span-full">
            No orders found.
          </p>
        ) : (
          orders?.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300 flex flex-col overflow-hidden border border-orange-200"
            >
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-800 truncate">
                    Order ID: {order._id.slice(-6).toUpperCase()}
                  </h2>
                  <span
                    className={`px-2 py-1 text-xs rounded-md font-semibold ${
                      order.status === "DELIVERED"
                        ? "bg-green-100 text-green-700"
                        : order.status === "CANCELLED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Order Details */}
                <p className="text-sm text-gray-500">
                  Total Amount:{" "}
                  <span className="font-semibold text-[rgb(221,3,3)]">
                    ₹{order.totalAmount}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Time:{" "}
                  <span className="font-semibold text-[rgb(221,3,3)]">
                    {formatDate(order.createdAt)}
                  </span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Payment Mode:{" "}
                  <span className="font-semibold">{order.payment.mode}</span>
                  {order.payment.mode === "ONLINE" &&
                    order.payment.razorpay_payment_id && (
                      <>
                        <span className="text-xs text-gray-400">
                          (Payment ID: {order.payment.razorpay_payment_id})
                        </span>
                      </>
                    )}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Customer Phone:{" "}
                  <span className="font-semibold">
                    {order.address?.phone || "N/A"}
                  </span>
                </p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  Address: {order.address?.location}
                </p>

                {/* Buttons */}
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowProductModal(true);
                    }}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center justify-center gap-2 py-2 rounded-lg transition-all duration-300 hover:from-orange-600 hover:to-red-600"
                  >
                    <Eye className="w-4 h-4" /> View Products
                  </button>

                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setNewStatus(order.status);
                      setShowEditModal(true);
                    }}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white flex items-center justify-center gap-2 py-2 rounded-lg transition-all duration-300"
                  >
                    <Edit2 className="w-4 h-4" /> Change Status
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {ordersPagination?.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-3 py-1">{currentPage} / {ordersPagination?.totalPages}</span>
          <button
            disabled={currentPage === ordersPagination?.totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Status Modal */}
      {showEditModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 md:w-1/3 relative shadow-xl">
            <button
              onClick={() => {
                setShowEditModal(false);
                setSelectedOrder(null);
                setNewStatus("");
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              Update Order Status
            </h2>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select Status</option>
                <option value="ORDERED SUCCESSFULLY">ORDERED SUCCESSFULLY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300"
              >
                Update Status
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 md:w-1/2 max-h-[80vh] overflow-y-auto relative shadow-xl">
            <button
              onClick={() => {
                setShowProductModal(false);
                setSelectedOrder(null);
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              Ordered Products
            </h2>

            <div className="space-y-3">
              {selectedOrder.products.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center gap-3 bg-gray-50 p-3 rounded-md border"
                >
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-16 h-16 rounded-md object-cover border"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{p.title}</p>
                    <p className="text-xs text-gray-600">
                      Qty: {p.totalQuantity} × ₹{p.price}
                    </p>
                    <p className="text-xs font-medium text-gray-700 mt-1">
                      Total: ₹{p.totalQuantity * p.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
