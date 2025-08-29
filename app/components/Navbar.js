"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaStore,
  FaBars,
  FaSignOutAlt,
  FaArrowRight,
  FaChild,
  FaFemale,
  FaMale,
  FaChevronDown,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion"; 
const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("customer");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

   

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAuthenticated(false);
          setUserRole("customer");
          return;
        }
        setIsAuthenticated(true);
        const res = await fetch("/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            setIsAuthenticated(false);
            setUserRole("customer");
          }
          return;
        }
        console.log(data.user.role)
        if (data.user) setUserRole(data.user.role);
      } catch (error) {
        console.error("Auth check error:", error);
      }
    };
    checkAuth();
  }, []);

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 p-4 shadow-2xl sticky top-0 z-50 px-6 lg:px-32 backdrop-blur-lg w-full"> 
      <div className="flex justify-between items-center w-full">
        {/* Logo */}
        <Link href="/" className="group flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center border border-slate-600 group-hover:from-slate-500 group-hover:to-slate-600 transition-all duration-300">
            <FaStore className="text-slate-200 text-lg" />
          </div>
          <span className="text-slate-100 text-lg font-bold group-hover:text-white transition-colors duration-300">
            E-Commerce
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-6">
          {/* Categories Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 text-slate-200 hover:text-white focus:outline-none px-4 py-2 rounded-lg hover:bg-slate-700/50 transition-all duration-300 border border-transparent hover:border-slate-600"
            >
              <span className="font-medium">Categories</span>
              <motion.div
                animate={{ rotate: dropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <FaChevronDown className="text-sm" />
              </motion.div>
            </button>
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl"
                >
                  <div className="py-2">
                    <Link
                      href="/products?category=men"
                      className="flex items-center px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 group"
                    >
                      <FaMale className="mr-3 text-slate-400 group-hover:text-slate-200" />
                      <span>Men</span>
                      <FaArrowRight className="ml-auto text-slate-500 group-hover:text-slate-300 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                      href="/products?category=women"
                      className="flex items-center px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 group"
                    >
                      <FaFemale className="mr-3 text-slate-400 group-hover:text-slate-200" />
                      <span>Women</span>
                      <FaArrowRight className="ml-auto text-slate-500 group-hover:text-slate-300 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                      href="/products?category=children"
                      className="flex items-center px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 group"
                    >
                      <FaChild className="mr-3 text-slate-400 group-hover:text-slate-200" />
                      <span>Children</span>
                      <FaArrowRight className="ml-auto text-slate-500 group-hover:text-slate-300 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cart */}
          <Link href="/cart" className="group flex items-center space-x-2 text-slate-200 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-700/50 transition">
            <FaShoppingCart className="text-lg" />
            <span className="hidden sm:block">Cart</span>
          </Link>

          <Link href="/about" className="group flex items-center space-x-2 text-slate-200 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-700/50 transition">
                  <FaStore className="text-lg" />
                  <span className="hidden lg:block">About us</span>
                </Link>

          {/* Authentication */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              {userRole === "customer" && (
                <Link href="/seller-apply" className="group flex items-center space-x-2 text-slate-200 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-700/50 transition">
                  <FaStore className="text-lg" />
                  <span className="hidden lg:block">Become Seller</span>
                </Link>
              )}
               {userRole === "seller" && (
                <Link href="/seller" className="group flex items-center space-x-2 text-slate-200 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-700/50 transition">
                  <FaStore className="text-lg" />
                  <span className="hidden lg:block">Seller Dashboard</span>
                </Link>
              )}
             {userRole === "admin" && (
                <Link href="/admin" className="group flex items-center space-x-2 text-slate-200 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-700/50 transition">
                  <FaStore className="text-lg" />
                  <span className="hidden lg:block">Admin Dashboard</span>
                </Link>
              )}
                           {userRole === "deliveryman" && (
                <Link href="/admin" className="group flex items-center space-x-2 text-slate-200 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-700/50 transition">
                  <FaStore className="text-lg" />
                  <span className="hidden lg:block">Deliery Dashboard</span>
                </Link>
              )}
              <Link href="/account" className="group flex items-center space-x-2 text-slate-200 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-700/50 transition">
                <FaUser className="text-sm" />
                <span className="hidden lg:block">Account</span>
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  setIsAuthenticated(false);
                  setUserRole("customer");
                  router.push("/");
                }}
                className="group flex items-center space-x-2 text-slate-300 hover:text-red-400 px-3 py-2 rounded-lg hover:bg-red-900/30 transition"
              >
                <FaSignOutAlt className="text-lg" />
                <span className="hidden lg:block">Logout</span>
              </button>
            </div>
          ) : (
            <Link href="/auth/login" className="group flex items-center space-x-2 bg-slate-700 border border-slate-600 text-slate-200 hover:text-white px-6 py-2 rounded-full font-medium hover:bg-slate-600 transition">
              <FaUser className="text-lg" />
              <span>Login</span>
            </Link>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="lg:hidden text-slate-200 hover:text-white p-2 rounded-lg hover:bg-slate-700/50 transition"
          onClick={() => setIsOpen(!isOpen)}
        >
          <FaBars className="text-xl" />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden flex flex-col space-y-4 mt-4"
          >
            <Link href="/cart" className="flex items-center text-slate-200 hover:text-white">
              <FaShoppingCart className="mr-2" /> Cart
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/account" className="flex items-center text-slate-200 hover:text-white">
                  <FaUser className="mr-2" /> Account
                </Link>

                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    setIsAuthenticated(false);
                    setUserRole("customer");
                    router.push("/");
                  }}
                  className="flex items-center text-red-400 hover:text-red-300"
                >
                  <FaSignOutAlt className="mr-2" /> Logout
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="flex items-center text-slate-200 hover:text-white">
                <FaUser className="mr-2" /> Login
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
