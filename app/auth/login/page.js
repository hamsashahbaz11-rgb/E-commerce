'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaShieldAlt, FaSignInAlt } from 'react-icons/fa';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const sendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send OTP');
      }
      setOtpSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpAndLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Verify OTP
     const verifyRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'OTP verification failed');
      }

      // Proceed with login
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) {
        throw new Error(loginData.error || 'Login failed');
      }

      localStorage.setItem('token', loginData.token);
      localStorage.setItem('userId', loginData.userId);
      localStorage.setItem('userEmail', loginData.email);
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div>
    //   <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    //     <motion.div 
    //       className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg"
    //       initial={{ opacity: 0, y: 20 }}
    //       animate={{ opacity: 1, y: 0 }}
    //       transition={{ duration: 0.5 }}
    //     >
    //       <div>
    //         <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
    //           Sign in to your account
    //         </h2>
    //       </div>
    //       {error && (
    //         <motion.div 
    //           className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
    //           initial={{ opacity: 0 }}
    //           animate={{ opacity: 1 }}
    //         >
    //           {error}
    //         </motion.div>
    //       )}
    //       {!otpSent ? (
    //         <form className="mt-8 space-y-6" onSubmit={(e) => { e.preventDefault(); sendOtp(); }}>
    //           <div className="rounded-md shadow-sm space-y-4">
    //             <div>
    //               <label htmlFor="email" className="block text-sm font-medium text-gray-700">
    //                 Email address
    //               </label>
    //               <input
    //                 id="email"
    //                 name="email"
    //                 type="email"
    //                 required
    //                 value={email}
    //                 onChange={(e) => setEmail(e.target.value)}
    //                 className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
    //                 placeholder="Enter your email"
    //               />
    //             </div>
    //             <div>
    //               <label htmlFor="password" className="block text-sm font-medium text-gray-700">
    //                 Password
    //               </label>
    //               <div className="relative">
    //                 <input
    //                   id="password"
    //                   name="password"
    //                   type={showPassword ? "text" : "password"}
    //                   required
    //                   value={password}
    //                   onChange={(e) => setPassword(e.target.value)}
    //                   className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
    //                   placeholder="Enter your password"
    //                 />
    //                 <button
    //                   type="button"
    //                   className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 cursor-pointer"
    //                   onClick={() => setShowPassword(!showPassword)}
    //                 >
    //                   {showPassword ? <FaEyeSlash /> : <FaEye />}
    //                 </button>
    //               </div>
    //             </div>
    //           </div>

    //           <div>
    //             <motion.button
    //               type="submit"
    //               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    //               whileHover={{ scale: 1.01 }}
    //               whileTap={{ scale: 0.99 }}
    //               disabled={loading}
    //             >
    //               {loading ? 'Sending OTP...' : 'Send OTP'}
    //             </motion.button>
    //           </div>
    //         </form>
    //       ) : (
    //         <form className="mt-8 space-y-6" onSubmit={verifyOtpAndLogin}>
    //           <div>
    //             <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
    //               Enter OTP
    //             </label>
    //             <input
    //               id="otp"
    //               name="otp"
    //               type="text"
    //               required
    //               value={otp}
    //               onChange={(e) => setOtp(e.target.value)}
    //               className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
    //               placeholder="Enter the OTP sent to your email"
    //             />
    //           </div>

    //           <div>
    //             <motion.button
    //               type="submit"
    //               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
    //               whileHover={{ scale: 1.01 }}
    //               whileTap={{ scale: 0.99 }}
    //               disabled={loading}
    //             >
    //               {loading ? 'Verifying OTP...' : 'Verify OTP & Sign In'}
    //             </motion.button>
    //           </div>
    //         </form>
    //       )}

    //       <div className="text-center">
    //         <p className="text-sm text-gray-600">
    //           Don &lsquo;t have an account?{' '}
    //           <Link href="/auth/signup">
    //             <span className="font-medium text-blue-600 hover:text-blue-500">
    //               Sign up
    //             </span>
    //           </Link>
    //         </p>
    //       </div>
    //     </motion.div>
    //   </div>
    // </div>

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
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Professional office environment"
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
            Welcome Back
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            Sign in to access your dashboard and manage your account with ease.
          </p>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          className="w-full max-w-md space-y-6"
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
              <FaSignInAlt className="text-2xl text-slate-300" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Sign In</h1>
            <p className="text-slate-400">Welcome back! Please enter your details</p>
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

          {/* Email & Password Form */}
          {!otpSent ? (
            <div className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all duration-200"
                  placeholder="Enter your email address"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all duration-200"
                    placeholder="Enter your password"
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

              {/* Send OTP Button */}
              <motion.button
                type="button"
                onClick={sendOtp}
                disabled={loading || !email || !password}
                className="w-full py-3 px-4 bg-white text-black rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </motion.button>
            </div>
          ) : (
            /* OTP Verification Form */
            <div className="space-y-5">
              {/* Success Message */}
              <div className="flex items-center text-green-400 text-sm bg-green-900/20 border border-green-700/30 px-4 py-3 rounded-lg">
                <FaShieldAlt className="mr-2" />
                OTP sent successfully to {email}
              </div>

              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all duration-200"
                  placeholder="Enter the code sent to your email"
                />
              </div>

              {/* Verify OTP Button */}
              <motion.button
                type="button"
                onClick={verifyOtpAndLogin}
                disabled={loading || !otp}
                className="w-full py-3 px-4 bg-green-700 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Verifying OTP...' : 'Verify OTP & Sign In'}
              </motion.button>

              {/* Back to Email/Password */}
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full text-slate-400 hover:text-slate-300 transition-colors duration-200 text-sm"
              >
                ← Back to login
              </button>
            </div>
          )}

          {/* Sign Up Link */}
          <div className="text-center pt-4">
            <p className="text-slate-400">
              Don&apos;t have an account?{" "}
              <button className="text-white hover:text-slate-300 font-medium transition-colors duration-200">
                Sign up
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}