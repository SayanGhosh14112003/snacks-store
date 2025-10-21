import { useEffect, useState } from "react";
import useUserStore from "../store/userStore";
import { PackageCheck, MapPin, Wallet, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import Loader from "../components/Loader";

export default function Order() {
  const myOrders = useUserStore((state) => state.myOrders);
  const getMyOrders = useUserStore((state) => state.getMyOrders);
  const loading = useUserStore((state) => state.loading);
  const pagination = useUserStore((state) => state.pagination);

  const [page, setPage] = useState(1);
  const limit = 5; // number of orders per page

  useEffect(() => {
    getMyOrders(page, limit);
  }, [page]);

  const nextPage = () => {
    if (pagination && page < pagination.totalPages) setPage(page + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mt-6 text-center">
        <span className="bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text">
          My Orders
        </span>
      </h1>
      {loading && <Loader/>}
      {(!loading) && (!myOrders || myOrders.length === 0) && (
        <p className="text-center text-gray-500 text-lg">😢 You haven’t placed any orders yet.</p>
      )}

      {myOrders?.map((order) => (
        <div key={order._id} className="border rounded-lg shadow-sm bg-white p-5 hover:shadow-md transition-shadow duration-300">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 mb-4">
            <div className="flex items-center gap-2 text-blue-600 font-semibold">
              <PackageCheck size={20} />
              <span>{order.status}</span>
            </div>
            <div className="flex flex-wrap gap-3 mt-2 sm:mt-0 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>{new Date(order.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Wallet size={16} />
                <span>{order.payment.mode === "COD" ? "Cash on Delivery" : "Online Payment"}</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="space-y-3">
            {order.products.map((item) => (
              <div key={item._id} className="flex flex-col sm:flex-row items-center justify-between border rounded-md p-3 bg-gray-50">
                <div className="flex items-center gap-4">
                  <img src={item.image} alt={item.title} className="w-20 h-20 rounded-md object-cover border" />
                  <div>
                    <h3 className="font-semibold text-gray-800">{item.title}</h3>
                    <p className="text-gray-500 text-sm">Quantity: {item.totalQuantity}</p>
                    <p className="font-semibold text-gray-700">₹{item.price * item.totalQuantity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Address & Total */}
          <div className="mt-5 border-t pt-3 flex flex-col sm:flex-row sm:justify-between text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <MapPin size={18} className="text-blue-600 mt-1" />
              <div>
                <p><strong>Address:</strong> {order.address.location}</p>
                <p><strong>Pincode:</strong> {order.address.pincode}</p>
                <p><strong>Phone:</strong> {order.address.phone}</p>
              </div>
            </div>
            <div className="mt-3 sm:mt-0 text-right">
              <p className="text-gray-500">Total Amount</p>
              <p className="text-xl font-semibold text-green-600">₹{order.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-6 items-center">
          <button onClick={prevPage} disabled={page === 1} className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50">
            <ChevronLeft size={18} /> Prev
          </button>
          <span>Page {page} of {pagination.totalPages}</span>
          <button onClick={nextPage} disabled={page === pagination.totalPages} className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50">
            Next <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
