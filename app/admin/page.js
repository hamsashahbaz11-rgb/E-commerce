'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion'; 
import {
  FaBell,
  FaCog,
  FaUsers,
  FaStore,
  FaCheck,
  FaExclamationTriangle,
  FaBox,
  FaChartLine,
  FaSearch,
  FaUserPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaStar,
  FaShoppingBag,
  FaTimes
} from 'react-icons/fa';  
import CouponModal from '../components/CouponModal';
import { FaTicketAlt } from 'react-icons/fa';
import Link from 'next/link';
import { Link2 } from 'lucide-react';


const AdminDashboard = () => {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [users, setUsers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
     const [coupons, setCoupons] = useState([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');

        if (!userEmail || userEmail !== 'hamsashahbaz11@gmail.com') {
          toast.error('Unauthorized access');
          router.push('/');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Error checking admin access:', error);
        toast.error('Unauthorized access');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [router]);
 
  useEffect(() => {
    if (isAuthorized) { 
      fetchData();
    }
  }, [isAuthorized ]);  

  const fetchData = async () => {
    try {
      const userEmail = localStorage.getItem("userEmail")
      setLoading(true);
        const usersResponse = await fetch('/api/users', {
        headers: {
          "Content-Type": "application/json",
          "x-user-email": userEmail
        }
      });
      const usersData = await usersResponse.json(); 
      setUsers(usersData.users);
 
      const sellersResponse = await fetch('/api/admin/sellers');
      const sellersData = await sellersResponse.json() 
      setSellers(sellersData.sellers);
 
      const userId = localStorage.getItem('userId');
      const couponsResponse = await fetch(`/api/coupons?userId=${userId} `,{
        method: "GET", 
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        } 
      });
      const couponsData = await couponsResponse.json();
      if(!couponsData.coupons) return
      if(!couponsData.coupons.length){
        setCoupons([])
      }

      setCoupons(couponsData.coupons);
 

    } catch (error) {
      toast.error('Error fetching data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try { 
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(user => user._id !== userId));
        setSellers(sellers.filter(seller => seller._id !== userId));
        toast.success('User deleted successfully');
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      toast.error('Error deleting user');
      console.error(error);
    }
  };


 
  const handleAddCoupon = () => {
    setSelectedCoupon(null);
    setShowCouponModal(true);
  };

  const handleEditCoupon = (coupon) => {
    setSelectedCoupon(coupon);
    setShowCouponModal(true);
  };

  const handleDeleteCoupon = async (couponId) => {
    try {
      const userId = localStorage.getItem("userId")
      const response = await fetch(`/api/coupons?couponId=${couponId}&userId=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCoupons(coupons.filter(c => c._id !== couponId));
        toast.success('Coupon deleted successfully');
      } else {
        toast.error('Failed to delete coupon');
      }
    } catch (error) {
      toast.error('Error deleting coupon');
      console.error(error);
    }
  };



  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredSellers = sellers?.filter(seller => {
    const matchesSearch = seller.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.sellerInfo?.shopName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="ml-4 text-white text-xl font-medium"
        >
          Loading Dashboard...
        </motion.div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;  
  }
 
  const stats = {
    totalUsers: users.length,
    totalSellers: sellers.length,
    activeSellers: sellers.filter(s => s.sellerInfo?.approved).length,
    pendingSellers: sellers.filter(s => !s.sellerInfo?.approved).length,
    totalProducts: sellers.reduce((acc, seller) => acc + (seller.products?.length || 0), 0),
    totalRevenue: sellers.reduce((acc, seller) => acc + (seller.products?.reduce((sum, p) => sum + (p.price * (100 - p.stock)), 0) || 0), 0)
  };


  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/90 border-b border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold text-white"
            >
              Admin Dashboard
            </motion.h1>
            
            <div className="text-white text-lg font-medium flex items-center gap-2 hover:text-gray-300 transition-colors cursor-pointer">
              <Link2 size={20} />
              <span>Assign Delivery</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"
        >
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: FaUsers, bgColor: 'bg-gray-800' },
            { label: 'Total Sellers', value: stats.totalSellers, icon: FaStore, bgColor: 'bg-gray-800' },
            { label: 'Active Sellers', value: stats.activeSellers, icon: FaCheck, bgColor: 'bg-gray-800' },
            { label: 'Pending', value: stats.pendingSellers, icon: FaExclamationTriangle, bgColor: 'bg-gray-800' },
            { label: 'Products', value: stats.totalProducts, icon: FaBox, bgColor: 'bg-gray-800' },
            { label: 'Revenue', value: stats.totalRevenue.toLocaleString(), icon: FaChartLine, bgColor: 'bg-gray-800' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -2 }}
              className={`${stat.bgColor} rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gray-700">
                  <stat.icon className="text-white text-lg" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'users', label: 'Users', icon: FaUsers },
            { id: 'sellers', label: 'Sellers', icon: FaStore },
            { id: 'coupons', label: 'Coupons', icon: FaTicketAlt },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white text-black'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
              }`}
            >
              <tab.icon className="mr-2" />
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white placeholder-gray-500 rounded-lg border border-gray-700 focus:border-gray-600 focus:outline-none transition-all duration-300"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-gray-600 focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="seller">Sellers</option>
                <option value="admin">Admins</option>
              </select>
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-all duration-300"
              >
                <FaUserPlus className="mr-2" />
                Add User
              </motion.button>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {filteredUsers.map((user, index) => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ y: -2 }}
                    className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{user.name?.charAt(0) || 'U'}</span>
                      </div>
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                          <FaEye className="text-sm" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                          <FaEdit className="text-sm" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 bg-gray-700 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          <FaTrash className="text-sm" />
                        </motion.button>
                      </div>
                    </div>
                    <div className="text-white font-semibold text-lg mb-1">{user.name}</div>
                    <div className="text-gray-400 text-sm mb-3">{user.email}</div>
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-red-900 text-red-300' :
                        user.role === 'seller' ? 'bg-blue-900 text-blue-300' :
                        'bg-green-900 text-green-300'
                      }`}>
                        {user.role}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Sellers Tab */}
        {activeTab === 'sellers' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Search */}
            <div className="relative mb-6">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search sellers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white placeholder-gray-500 rounded-lg border border-gray-700 focus:border-gray-600 focus:outline-none transition-all duration-300"
              />
            </div>

            {/* Sellers Grid */}
            <div className="space-y-6">
              <AnimatePresence>
                {filteredSellers.map((seller, index) => (
                  <motion.div
                    key={seller._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ y: -1 }}
                    className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Seller Info */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-xl">{seller.name?.charAt(0) || 'S'}</span>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white">{seller.sellerInfo?.shopName || 'N/A'}</h3>
                              <p className="text-gray-300">{seller.name}</p>
                              <p className="text-gray-500 text-sm">{seller.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {seller.sellerInfo?.approved ? (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center px-3 py-1 bg-green-900 text-green-300 rounded-full text-sm font-medium"
                              >
                                <FaCheck className="mr-1" /> Approved
                              </motion.span>
                            ) : (
                              <div className="flex space-x-2">
                                <span className="flex items-center px-3 py-1 bg-yellow-900 text-yellow-300 rounded-full text-sm font-medium">
                                  <FaExclamationTriangle className="mr-1" /> Pending
                                </span>
                                <motion.button
                                  whileHover={{ y: -1 }}
                                  onClick={() => handleApproveSeller(seller._id)}
                                  className="px-4 py-1 bg-white text-black rounded text-sm hover:bg-gray-200 transition-colors font-medium"
                                >
                                  Approve
                                </motion.button>
                              </div>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              onClick={() => handleDeleteUser(seller._id)}
                              className="p-2 bg-gray-700 text-white rounded hover:bg-red-600 transition-colors"
                            >
                              <FaTrash />
                            </motion.button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="bg-gray-700 rounded-lg p-3">
                            <div className="text-gray-400 text-xs">Business Type</div>
                            <div className="text-white font-medium">{seller.sellerInfo?.businessType || 'N/A'}</div>
                          </div>
                          <div className="bg-gray-700 rounded-lg p-3">
                            <div className="text-gray-400 text-xs">Products</div>
                            <div className="text-white font-medium">{seller.products?.length || 0}</div>
                          </div>
                          <div className="bg-gray-700 rounded-lg p-3">
                            <div className="text-gray-400 text-xs">Rating</div>
                            <div className="flex items-center space-x-1">
                              <FaStar className="text-yellow-400 text-sm" />
                              <span className="text-white font-medium">{seller.sellerInfo?.averageRating || 0}/5</span>
                            </div>
                          </div>
                          <div className="bg-gray-700 rounded-lg p-3">
                            <div className="text-gray-400 text-xs">Orders</div>
                            <div className="text-white font-medium">{seller.orders.length || 0}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Products */}
                    {seller.products && seller.products.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-6 pt-6 border-t border-gray-700"
                      >
                        <h4 className="text-white font-semibold mb-4 flex items-center">
                          <FaShoppingBag className="mr-2" />
                          Products ({seller.products.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {seller.products.slice(0, 3).map((product, pIndex) => (
                            <motion.div
                              key={product._id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: pIndex * 0.1 }}
                              className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-all duration-300"
                            >
                              <h5 className="text-white font-medium mb-2">{product.name}</h5>
                              <div className="flex justify-between items-center">
                                <span className="text-green-400 font-bold">${product.price}</span>
                                <span className="text-gray-400 text-sm">Stock: {product.stock}</span>
                              </div>
                            </motion.div>
                          ))}
                          {seller.products.length > 3 && (
                            <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-center">
                              <span className="text-gray-400">+{seller.products.length - 3} more</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Coupons Tab */}
        {activeTab === 'coupons' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Coupons</h2>
              <motion.button
                onClick={handleAddCoupon}
                className="bg-white text-black px-4 py-2 rounded-lg flex items-center font-medium hover:bg-gray-200 transition-colors"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaTicketAlt className="mr-2" />
                Add Coupon
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.length === 0 && <p className="text-gray-400">No coupons found</p>}

              {coupons.map((coupon) => (
                <motion.div
                  key={coupon._id}
                  className="bg-gray-800 rounded-lg p-6 relative group border border-gray-700 hover:border-gray-600 transition-all duration-300"
                  whileHover={{ y: -2 }}
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditCoupon(coupon)}
                      className="text-gray-400 hover:text-white mr-2 transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteCoupon(coupon._id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{coupon.code}</h3>
                  <p className="text-gray-300 mb-4">{coupon.description}</p>

                  <div className="space-y-2 text-gray-300">
                    <p>Discount: {coupon.discountAmount}{coupon.discountType === 'percentage' ? '%' : ' USD'}</p>
                    <p>Valid until: {new Date(coupon.endDate).toLocaleDateString()}</p>
                    <p>Used: {coupon.usedCount} times</p>
                    <div className={`inline-block px-2 py-1 rounded text-sm ${
                      coupon.isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                    }`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {showCouponModal && (
              <CouponModal
                isOpen={showCouponModal}
                onClose={() => {
                  setShowCouponModal(false);
                  setSelectedCoupon(null);
                }}
                coupon={selectedCoupon}
              />
            )}
          </div>
        )}

        {/* Add User Modal */}
        <AnimatePresence>
          {showAddUserModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 rounded-lg p-8 w-full max-w-md border border-gray-700"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Add New User</h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setShowAddUserModal(false)}
                    className="p-2 hover:bg-gray-800 rounded transition-colors"
                  >
                    <FaTimes className="text-gray-400" />
                  </motion.button>
                </div>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded focus:border-gray-500 focus:outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded focus:border-gray-500 focus:outline-none"
                  />
                  <select className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded focus:border-gray-500 focus:outline-none">
                    <option value="user">User</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded focus:border-gray-500 focus:outline-none"
                  />
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => setShowAddUserModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setShowAddUserModal(false)}
                      className="flex-1 px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium"
                    >
                      Add User
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;

