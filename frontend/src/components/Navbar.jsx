import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import useUserStore from "../store/userStore";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Package,
  Home,
  UserPlus,
  ClipboardList,
  LogOut,
} from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const loading = useUserStore((state) => state.loading);
  const cart = useUserStore((state) => state.cart || []);
  const getCart = useUserStore((state) => state.getCart);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  useEffect(() => {
    (async () => {
      if (user) {
        await getCart();
      }
    })();
  }, [user]);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all duration-300
    ${isActive
      ? "bg-[rgb(250,177,47)] text-white shadow-md"
      : "text-white hover:bg-[rgb(221,3,3)] hover:text-white hover:shadow-md"
    }`;

  return (
    <nav className="w-full bg-[rgb(250,129,47)] shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <h1 className="text-[rgb(254,243,226)] text-2xl font-extrabold tracking-wide">
          DEVI <span className="text-[rgb(255,213,140)]">SNACKS</span>
        </h1>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-4 font-semibold">
          <NavLink to="/" className={linkClass}>
            <Home size={18} /> Home
          </NavLink>

          {user?.role === "admin" && (
            <NavLink to="/admin" className={linkClass}>
              <Package size={18} /> Admin
            </NavLink>
          )}

          <NavLink to="/cart" className="relative flex items-center gap-2 px-4 py-2 rounded-md text-white hover:bg-[rgb(221,3,3)] transition-all duration-300">
            <ShoppingCart size={18} /> Cart
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-semibold">
                {cartCount}
              </span>
            )}
          </NavLink>

          <NavLink to="/orders" className={linkClass}>
            <ClipboardList size={18} /> Orders
          </NavLink>

          {!user ? (
            <>
              <NavLink to="/login" className={linkClass}>
                <User size={18} /> Login
              </NavLink>
              <NavLink to="/register" className={linkClass}>
                <UserPlus size={18} /> Register
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/account" className={linkClass}>
                <User size={18} /> Account
              </NavLink>
              <button
                onClick={logout}
                disabled={loading}
                className="flex items-center gap-2 text-white hover:bg-[rgb(221,3,3)] px-4 py-2 rounded-md transition-all duration-300 font-semibold"
              >
                <LogOut size={18} /> Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-[rgb(254,243,226)]"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden bg-[rgb(250,129,47)] shadow-md">
          <div className="flex flex-col items-start p-4 gap-3 font-semibold">
            <NavLink onClick={() => setOpen(false)} to="/" className={linkClass}>
              <Home size={18} /> Home
            </NavLink>

            {user?.role === "admin" && (
              <NavLink
                onClick={() => setOpen(false)}
                to="/admin"
                className={linkClass}
              >
                <Package size={18} /> Admin
              </NavLink>
            )}

            <NavLink
              onClick={() => setOpen(false)}
              to="/cart"
              className="relative flex items-center gap-2 px-4 py-2 rounded-md text-white hover:bg-[rgb(221,3,3)] transition-all duration-300"
            >
              <ShoppingCart size={18} /> Cart
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-semibold">
                  {cartCount}
                </span>
              )}
            </NavLink>

            <NavLink
              onClick={() => setOpen(false)}
              to="/orders"
              className={linkClass}
            >
              <ClipboardList size={18} /> Orders
            </NavLink>

            {!user ? (
              <>
                <NavLink
                  onClick={() => setOpen(false)}
                  to="/login"
                  className={linkClass}
                >
                  <User size={18} /> Login
                </NavLink>
                <NavLink
                  onClick={() => setOpen(false)}
                  to="/register"
                  className={linkClass}
                >
                  <UserPlus size={18} /> Register
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  onClick={() => setOpen(false)}
                  to="/account"
                  className={linkClass}
                >
                  <User size={18} /> Account
                </NavLink>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  disabled={loading}
                  className="flex items-center gap-2 text-white hover:bg-[rgb(221,3,3)] px-4 py-2 rounded-md transition-all duration-300 font-semibold"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
