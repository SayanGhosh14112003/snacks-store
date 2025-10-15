import { Link } from "react-router-dom";
import { Package, Layers, ClipboardList, Users } from "lucide-react";

export default function Admin() {
  const links = [
    {
      name: "Product Management",
      path: "product-management",
      icon: <Package size={24} />,
      color: "bg-[rgb(250,177,47)] hover:bg-[rgb(250,129,47)]",
    },
    {
      name: "Category Management",
      path: "category-management",
      icon: <Layers size={24} />,
      color: "bg-[rgb(250,129,47)] hover:bg-[rgb(221,3,3)]",
    },
    {
      name: "Order Management",
      path: "order-management",
      icon: <ClipboardList size={24} />,
      color: "bg-[rgb(221,3,3)] hover:bg-[rgb(250,177,47)]",
    },
    {
      name: "User Management",
      path: "user-management",
      icon: <Users size={24} />,
      color: "bg-[rgb(102,153,255)] hover:bg-[rgb(51,102,255)]",
    },
  ];

  return (
    <div className="min-h-screen bg-[rgb(254,243,226)] flex flex-col items-center py-16 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-[rgb(221,3,3)] mb-3">
          Admin Dashboard
        </h1>
        <p className="text-gray-700 text-lg">
          Manage your products, categories, users, and orders efficiently 🚀
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl">
        {links.map((link, index) => (
          <Link
            key={index}
            to={link.path}
            className={`flex flex-col items-center justify-center gap-4 p-8 rounded-2xl text-white font-semibold text-lg shadow-xl transition-all duration-300 transform hover:scale-105 ${link.color}`}
          >
            <div className="bg-white text-[rgb(221,3,3)] p-3 rounded-full shadow-md">
              {link.icon}
            </div>
            {link.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
