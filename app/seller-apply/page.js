"use client";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FaCheckCircle, FaStore } from "react-icons/fa";
import { motion } from "framer-motion";

const SellerApply = () => {
  const [form, setForm] = useState({
    shopName: "",
    description: "",
    businessType: "",
    productsToSell: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("Please login to apply as a seller");
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/users/apply-seller`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to apply as seller");
      toast.success("Application submitted successfully!");
      router.push("/")
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
        <div className="min-h-screen bg-black flex">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.img
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
          alt="Modern retail store"
          className="w-full h-full object-cover mix-blend-overlay"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.7 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/80" />
        <motion.div
          className="absolute bottom-8 left-8 right-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Start Your Business Journey
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            Join thousands of successful sellers on our platform and reach customers worldwide with your products.
          </p>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          className="w-full max-w-xl space-y-6"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-full mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <FaStore className="text-2xl text-slate-300" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Become a Seller</h1>
            <p className="text-slate-400">Tell us about your business and start selling today</p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Shop Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Shop Name
              </label>
              <input
                type="text"
                name="shopName"
                value={form.shopName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all duration-200"
                placeholder="Enter your shop name"
              />
            </div>

            {/* Business Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Business Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all duration-200 resize-none"
                placeholder="Describe your business and what makes it unique"
              />
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Business Type
              </label>
              <input
                type="text"
                name="businessType"
                value={form.businessType}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all duration-200"
                placeholder="e.g. Clothing, Electronics, Food & Beverage"
              />
            </div>

            {/* Products to Sell */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Products You Will Sell
              </label>
              <input
                type="text"
                name="productsToSell"
                value={form.productsToSell}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all duration-200"
                placeholder="e.g. T-shirts, Smartphones, Handmade Jewelry"
              />
            </div>

            {/* Benefits Section */}
            <motion.div
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-white font-medium mb-3">Why become a seller?</h3>
              <div className="space-y-2">
                {[
                  'Reach millions of customers',
                  'Easy inventory management',
                  'Secure payment processing',
                  'Marketing support & analytics'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center text-slate-300 text-sm">
                    <FaCheckCircle className="text-green-400 mr-2 text-xs" />
                    {benefit}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 px-4 bg-white text-black rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? "Submitting Application..." : "Submit Application"}
            </motion.button>

            {/* Additional Info */}
            <div className="text-center pt-4">
              <p className="text-slate-400 text-sm">
                Our team will review your application within 24-48 hours
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SellerApply;