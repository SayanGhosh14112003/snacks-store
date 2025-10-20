import useUserStore from "../store/userStore";

export default function ProductCard({ product, onAddToCart }) {
  const { title, description, price, image, merchantPrice, COD } = product;
  const user = useUserStore((state) => state.user);
  const loading = useUserStore((state) => state.loading);
  const isMerchant = user?.role === "merchant";
  const isAdmin = user?.role === "admin";

  return (
    <div className="bg-[rgb(255,255,255)] rounded-2xl shadow-md hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 flex flex-col overflow-hidden border border-[rgb(250,177,47)]">
      {/* Product Image */}
      <div className="relative w-full h-52 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
        />
        {(isAdmin || isMerchant) && (
          <span className="absolute top-3 left-3 bg-[rgb(250,177,47)] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
            {isAdmin ? "Admin View" : "Merchant View"}
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-[rgb(60,30,10)] mb-1">{title}</h3>
        <p className="text-sm text-[rgb(100,60,20)] mb-3 line-clamp-2 flex-1">
          {description}
        </p>

        {/* Price Section */}
        <div className="mt-3 flex flex-col gap-1">
          {isAdmin ? (
            <>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 font-medium">
                  Customer Price:
                </span>
                <span className="text-lg font-semibold text-[rgb(221,3,3)] tracking-wide">
                  ₹{price}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 font-medium">
                  Merchant Price:
                </span>
                <span className="text-lg font-semibold text-[rgb(250,129,47)] tracking-wide">
                  ₹{merchantPrice}
                </span>
              </div>
            </>
          ) : isMerchant ? (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-medium">
                Merchant Price:
              </span>
              <span className="text-lg font-semibold text-[rgb(250,129,47)] tracking-wide">
                ₹{merchantPrice}
              </span>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-medium">
                Price:
              </span>
              <span className="text-lg font-semibold text-[rgb(221,3,3)] tracking-wide">
                ₹{price}
              </span>
            </div>
          )}
        </div>

        {/* COD Section */}
        <p
          className={`mt-3 text-sm font-medium ${
            COD ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
          } px-3 py-1 rounded-lg text-center`}
        >
          {COD ? "✅ Cash on Delivery Available" : "❌ No Cash on Delivery"}
        </p>

        {/* Add to Cart Button */}
        {user && <button
          onClick={async() => await onAddToCart(product)}
          disabled={loading}
          className="mt-4 bg-gradient-to-r from-[rgb(250,177,47)] to-[rgb(250,129,47)] text-white font-semibold py-2.5 px-5 rounded-xl shadow-md hover:from-[rgb(250,129,47)] hover:to-[rgb(221,3,3)] transition-all duration-300"
        >
          Add to Cart
        </button>
        }
      </div>
    </div>
  );
}
