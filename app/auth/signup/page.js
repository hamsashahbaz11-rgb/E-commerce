"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaShieldAlt, FaUserPlus } from "react-icons/fa";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [area, setArea] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);


  const sendOtp = async () => {
    setError("");
    if (!email) {
      setError("Please enter your email to receive OTP");
      return;
    }
    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send OTP");
      }
      setOtpSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError("");
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }
    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "OTP verification failed");
      }
      setOtpVerified(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!otpVerified) {
      setError("Please verify OTP before signing up");
      return;
    }
    setLoading(true);

    try {
      if(role === "dileveryman" && !area) {
        setError("Please enter area");
        return;
      }
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, area }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem('userEmail', data.email);

      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
 
       <div className="min-h-screen bg-black flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          className="w-full max-w-md space-y-6"
          initial={{ opacity: 0, x: -50 }}
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
              <FaUserPlus className="text-2xl text-slate-300" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-slate-400">Join us and start your journey today</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg backdrop-blur-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all duration-200"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setOtpSent(false);
                  setOtpVerified(false);
                }}
                disabled={otpVerified}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your email address"
              />
              {otpVerified && (
                <div className="flex items-center mt-2 text-green-400 text-sm">
                  <FaShieldAlt className="mr-2" />
                  Email verified successfully
                </div>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-2">
                Choose Your Role
              </label>
              <select
                id="role"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all duration-200"
              >
                <option value="" className="bg-slate-800">Select Role</option>
                <option value="seller" className="bg-slate-800">Seller</option>
                <option value="customer" className="bg-slate-800">Customer</option>
                <option value="deliveryman" className="bg-slate-800">Delivery Person</option>
              </select>
            </div>

            {/* Delivery Area (conditional) */}
            {role === "deliveryman" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <label htmlFor="area" className="block text-sm font-medium text-slate-300 mb-2">
                  Delivery Area
                </label>
                <input
                  id="area"
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all duration-200"
                  placeholder="Enter your delivery area"
                />
              </motion.div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all duration-200"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors duration-200"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* OTP Section */}
            {!otpVerified && (
              <div className="space-y-3">
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={otpLoading || !email}
                    className="w-full py-3 px-4 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    {otpLoading ? "Sending OTP..." : "Send Verification Code"}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="otp" className="block text-sm font-medium text-slate-300 mb-2">
                        Verification Code
                      </label>
                      <input
                        id="otp"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all duration-200"
                        placeholder="Enter the code sent to your email"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={verifyOtp}
                      disabled={otpLoading || !otp}
                      className="w-full py-3 px-4 bg-green-700 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                    >
                      {otpLoading ? "Verifying..." : "Verify Code"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || !otpVerified}
              className="w-full py-3 px-4 bg-white text-black rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
              whileHover={{ scale: otpVerified ? 1.02 : 1 }}
              whileTap={{ scale: otpVerified ? 0.98 : 1 }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </motion.button>

            {/* Sign In Link */}
            <div className="text-center pt-4">
              <p className="text-slate-400">
                Already have an account?{" "}
                <button className="text-white hover:text-slate-300 font-medium transition-colors duration-200">
                  Sign in
                </button>
              </p>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.img
          src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80"
          alt="Modern workspace"
          className="w-full h-full object-cover mix-blend-overlay"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.7 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <motion.div
          className="absolute bottom-8 left-8 right-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Our Growing Community
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            Connect with thousands of users and take your business to the next level with our powerful platform.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
