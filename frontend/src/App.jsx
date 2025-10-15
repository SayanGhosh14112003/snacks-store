import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Register from './pages/Register'
import Order from './pages/Order'
import ForgotPassword from './pages/ForgotPassword'
import Navbar from './components/Navbar'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import useUserStore from './store/userStore'
import ProductManagement from './pages/ProductManagement'
import OrderManagement from './pages/OrderManagement'
import CategoryManagement from './pages/CategoryManagement'
import UserManagement from './pages/UserManagement'
import Account from './pages/Account'
function App() {
  const user = useUserStore((state) => state.user)
  const checkingAuth = useUserStore((state) => state.checkingAuth);
  const checkAuth = useUserStore((state) => state.checkAuth);
  useEffect(() => {
    (async () => {
      await checkAuth();
    })()
  }, [])
  if (checkingAuth) {
    return <div className="min-h-screen flex items-center justify-center bg-[rgb(254,243,226)] px-4">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8 transition-all duration-500 text-center text-[rgb(221,3,3)] font-bold text-xl">
        Loading...
      </div>
    </div>
  }
  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-b from-[rgb(254,243,226)] via-[rgb(255,250,240)] to-[rgb(254,243,226)] text-[rgb(60,30,10)] font-sans">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/admin"
            element={user?.role === "admin" ? <Outlet/> : <Navigate to="/" />}
          >
            <Route index element={<Admin />} /> {/* default admin dashboard */}
            <Route path="product-management" element={<ProductManagement />} />
            <Route path="category-management" element={<CategoryManagement />} />
            <Route path="order-management" element={<OrderManagement />} />
            <Route path="user-management" element={<UserManagement />} />
          </Route>
          <Route path="/cart" element={user ? <Cart /> : <Navigate to="/login" />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          <Route path="/orders" element={user ? <Order /> : <Navigate to="/login" />} />
          <Route path="/account" element={user ? <Account /> : <Navigate to="/login" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<h1 className='text-3xl font-bold text-center mt-20'>404 - Page Not Found!</h1>} />
        </Routes>
      </div>

    </>
  )
}

export default App
