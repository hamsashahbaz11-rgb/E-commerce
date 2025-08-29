
'use client'
const StyledWrapper = styled.div`
  .loader {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }

  .jimu-primary-loading:before,
  .jimu-primary-loading:after {
    position: absolute;
    top: 0;
    content: '';
  }

  .jimu-primary-loading:before {
    left: -19.992px;
  }

  .jimu-primary-loading:after {
    left: 19.992px;
    -webkit-animation-delay: 0.32s !important;
    animation-delay: 0.32s !important;
  }

  .jimu-primary-loading:before,
  .jimu-primary-loading:after,
  .jimu-primary-loading {
    background: #076fe5;
    -webkit-animation: loading-keys-app-loading 0.8s infinite ease-in-out;
    animation: loading-keys-app-loading 0.8s infinite ease-in-out;
    width: 13.6px;
    height: 32px;
  }

  .jimu-primary-loading {
    text-indent: -9999em;
    margin: auto;
    position: absolute;
    right: calc(50% - 6.8px);
    top: calc(50% - 16px);
    -webkit-animation-delay: 0.16s !important;
    animation-delay: 0.16s !important;
  }

  @-webkit-keyframes loading-keys-app-loading {

    0%,
    80%,
    100% {
      opacity: .75;
      box-shadow: 0 0 #076fe5;
      height: 32px;
    }

    40% {
      opacity: 1;
      box-shadow: 0 -8px #076fe5;
      height: 40px;
    }
  }

  @keyframes loading-keys-app-loading {

    0%,
    80%,
    100% {
      opacity: .75;
      box-shadow: 0 0 #076fe5;
      height: 32px;
    }

    40% {
      opacity: 1;
      box-shadow: 0 -8px #076fe5;
      height: 40px;
    }
  }`;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import {
  FaUser,
  FaShoppingBag,
  FaHeart,
  FaMapMarkerAlt,
  FaCreditCard,
  FaStore,
  FaEdit,
  FaSave,
  FaTimes,
  FaStar,
  FaBox,
  FaUndoAlt,
  FaCheck,
  FaExclamationCircle
} from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import toast, { useToasterStore } from 'react-hot-toast';
import { Finlandica } from 'next/font/google';
import ProductCard from '../components/ProductCard';

const AccountPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState({
    user: true,
    orders: false,
    wishlist: false,
    cart: false,
    products: false
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState(null);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [showReasonModal, setShowReasonModal] = useState(false)
  const [returningOrders, setReturningOrders] = useState([])




  const predefinedReasons = [
    'Product damaged/defective',
    'Wrong item received',
    'Size/fit issues',
    'Not as described',
    'Changed mind',
    'Quality issues',
    'Other'
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user) {
      if (activeTab === 'orders') fetchOrders();
      if (activeTab === 'seller') fetchSellerProducts();
      if (activeTab === 'returns') getReturningOrders()
    }
  }, [user, activeTab]);

  const fetchOrders = async () => {
    try {
      setOrderLoading(true);
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/orders?userId=${userId}`);

      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrderLoading(false);
    }
  };

  const fetchSellerProducts = async () => {
    if (!user?.isSeller) return;
    try {
      setProductLoading(true);
      const token = localStorage.getItem('token');
      const sellerId = localStorage.getItem('userId');
      const response = await fetch(`/api/seller/products?sellerId=${sellerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setProductLoading(false);
    }
  };
  const handleReasonChange = (e) => {
    setSelectedReason(e)
    setReason(e.target.value)
  }
  const renderOrderItems = (items) => {
    return items.map((item, index) => (
      <div key={index} className="flex items-center space-x-4 border-b border-gray-200 py-4">
        <Image src={item.images[0]?.url} alt={item.name} width={80} height={80} className="w-20 h-20 object-cover rounded" />
        <div>
          <h4 className="font-medium text-gray-900">{item.name}</h4>
          <p className="text-gray-600">
            {item.quantity} x ${item.price} = ${item.quantity * item.price}
          </p>
          <p className="text-sm text-gray-500">
            {item.size && `Size: ${item.size}`}
            {item.color && ` | Color: ${item.color}`}
          </p>
        </div>
      </div>
    ));
  };
  // const hanldeReturnUndelivered = async (orderId) => {
  //   try {

  //     const response = await fetch("/api/orders/return", {
  //       method: "DELETE",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "Authorization": `Bearer ${localStorage.getItem("token")}`
  //       },

  //       body: JSON.stringify(orderId)
  //     })

  //     if (!response.ok) {
  //       toast.error(error)
  //       return;
  //     }

  //     toast.success("Order returned successfully")

  //   } catch (error) {
  //     toast.error(error)
  //   }
  // }

  const getReturningOrders = async () => {
    try {
      const response = await fetch("/api/orders/return", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      })
      const data = await response.json()
      setReturningOrders(data.orders);
      console.log(data)
    } catch (error) {
      toast.error("You have no return Orders")
    }
  }

  const renderOrders = () => {
    if (orderLoading) return <div className="text-center text-white">Loading orders...</div>;

    if (orders.length === 0) {
      return (
        <div className="text-center py-8">
          <FaBox className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-600">No orders found</p>
        </div>
      );
    }

    return orders?.map((order) => (
      <div key={order._id} className="bg-white rounded-lg shadow-md p-6 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Order #{order._id.slice(-8)}</h3>
          <div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium mr-1 ${order.deliveryStatus === 'delivered' ? 'bg-green-100 text-green-800' :
              order.deliveryStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
              {order.deliveryStatus.charAt(0).toUpperCase() + order.deliveryStatus.slice(1)}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.isPaid === true ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
            `}>{order.isPaid ? 'Amount Paid' : 'Not Paid'}</span>
          </div>
        </div>
        <button onClick={() => {
          setShowReasonModal(!showReasonModal)
        }}>

          Returning Request</button>
        {showReasonModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 text-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
          >

            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6 transform transition-all duration-300 scale-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Return Order</h3>
                  <button
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for return *
                  </label>
                  <div className="space-y-2">
                    {predefinedReasons.map((reasonOption) => (
                      <label key={reasonOption} className="flex items-center">
                        <input
                          type="radio"
                          name="reason"
                          value={reasonOption}
                          checked={selectedReason === reasonOption}
                          onChange={(e) => handleReasonChange(e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">{reasonOption}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {selectedReason === 'Other' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please specify
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-bla"
                      rows="3"
                      placeholder="Please provide details..."
                      required
                    />
                  </div>
                )}

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <strong>Return Policy:</strong> Returns are accepted within 30 days of delivery.
                        Items must be in original condition with tags attached.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReasonModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"

                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    // disabled={!selectedReason || (selectedReason === 'Other' && !reason.trim()) || loading}
                    onClick={() => handleSubmitReturningRequest(order._id)}

                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {/* {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) :
                     ( */}
                    &apos;Submit Return Request&apos;
                    {/* )} */}
                  </button>
                </div>

              </div>
            </div>
          </motion.div>
        )}
        {renderOrderItems(order.items)}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-gray-600">Total: ${order.totalPrice}</p>
          <p className="text-sm text-gray-500">
            Ordered on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        {order.deliveryStatus === 'delivered' && (
          order.items.map((item) => (
            <Link href={`/review/${item.product._id}`} key={item.product._id}>
              <div className='bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow w-fit my-4 mx-5'> PLease review our product</div>
            </Link>
          ))
        )}
      </div>
    ));
  };

  const renderSellerProducts = () => {
    if (productLoading) return <div className="text-center">Loading products...</div>;

    if (products.length === 0) {
      return (
        <div className="text-center py-8">
          <FaStore className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-600">No products found</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden ">
            <Image
              src={product.images[0]?.url}
              alt={product.name}
              width={284}
              height={284}
              className="object-cover"
            />
            <div className="p-4">
              <h3 className="font-medium text-gray-900">{product.name}</h3>
              <div className="flex items-center mt-1">
                {renderStars(product.averageRating)}
                <span className="ml-2 text-sm text-gray-600">
                  ({product.numReviews} reviews)
                </span>
              </div>
              <p className="text-gray-600 mt-2">${product.price}</p>
              <p className="text-sm text-gray-500 mt-1">
                Stock: {product.stock} | {product.category}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const fetchUserData = async () => {
    try {
      setLoading(prev => ({ ...prev, user: true }));
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        window.location.href = '/auth/login';
        return;
      }

      const userResponse = await fetch(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!userResponse.ok) throw new Error('Failed to fetch user data');
      const userData = await userResponse.json();
      setUser(userData.user);
      setEditForm({
        name: userData.user.name,
        email: userData.user.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        sellerInfo: userData.user.isSeller ? {
          shopName: userData.user.sellerInfo?.shopName || '',
          businessType: userData.user.sellerInfo?.businessType || '',
          productsToSell: userData.user.sellerInfo?.productsToSell || '',
          description: userData.user.sellerInfo?.description || ''
        } : null
      });

      setLoading(prev => ({ ...prev, orders: true }));

      const ordersResponse = await fetch(`/api/orders?userId=${userId}`);

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(ordersData.orders);
      }


      setLoading(prev => ({ ...prev, wishlist: true }));
      const wishlistResponse = await fetch(`/api/wishlist?userId=${userId}`);
      if (wishlistResponse.ok) {

        const productList = [];

        const wishlistData = await wishlistResponse.json();

        setWishlist(wishlistData.wishlist);
      }


      setLoading(prev => ({ ...prev, cart: true }));
      const cartResponse = await fetch(`/api/cart?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        setCart(cartData.cart);
      }
      const sellerId = localStorage.getItem("userId")
      if (userData.user.isSeller) {
        setLoading(prev => ({ ...prev, products: true }));
        const productsResponse = await fetch(`/api/seller/products?sellerId=${sellerId}`);
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setSellerProducts(productsData.products);
        }
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      alert(error.message || 'Failed to load user data');
    } finally {
      setLoading({
        user: false,
        orders: false,
        wishlist: false,
        cart: false,
        products: false
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      if (!token) {
        window.location.href = '/auth/login';
        return;
      }

      const updateData = {
        name: editForm.name.trim(),
        email: editForm.email.trim()
      };

      if (!updateData.name || !updateData.email) {
        alert('Name and email are required');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        alert('Please enter a valid email address');
        return;
      }

      if (editForm.newPassword) {
        if (!editForm.currentPassword) {
          alert('Current password is required to set a new password');
          return;
        }
        if (editForm.newPassword.length < 6) {
          alert('New password must be at least 6 characters long');
          return;
        }
        if (editForm.newPassword !== editForm.confirmPassword) {
          alert('New passwords do not match');
          return;
        }

        updateData.currentPassword = editForm.currentPassword;
        updateData.newPassword = editForm.newPassword;
        updateData.confirmPassword = editForm.confirmPassword;
      }

      if (user.isSeller && editForm.sellerInfo) {
        const sellerInfo = {};

        if (editForm.sellerInfo.shopName.trim()) {
          sellerInfo.shopName = editForm.sellerInfo.shopName.trim();
        }
        if (editForm.sellerInfo.businessType.trim()) {
          sellerInfo.businessType = editForm.sellerInfo.businessType.trim();
        }
        if (editForm.sellerInfo.productsToSell.trim()) {
          sellerInfo.productsToSell = editForm.sellerInfo.productsToSell.trim();
        }
        if (editForm.sellerInfo.description !== undefined) {
          sellerInfo.description = editForm.sellerInfo.description.trim();
        }

        if (Object.keys(sellerInfo).length > 0) {
          updateData.sellerInfo = sellerInfo;
        }
      }

      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          window.location.href = '/auth/login';
          return;
        }
        throw new Error(errorData.details || errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      setUser(data.user);
      setIsEditing(false);

      setEditForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={`${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const handleSubmitReturningRequest = async (orderId) => {

    const finalReason = selectedReason === 'Other' ? reason : selectedReason;

    try {

      const token = localStorage.getItem("token")
      const reason = finalReason
      const response = await fetch("/api/orders/return", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ orderId, reason })
      })


      if (!response.ok) {
        toast.error(error)
        return;
      }

      toast.success("Order returned successfully")

    } catch (error) {
      toast.error(error)
    }
  }

  if (loading.user) {
    return (
      <StyledWrapper>
        <div className="loader">
          <div className='jimu-primary-loading'></div>
        </div>
      </StyledWrapper>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">User not found</h2>
          <button
            onClick={() => window.location.href = '/auth/login'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'profile', label: 'My Profile', icon: FaUser },
    { id: 'orders', label: 'My Orders', icon: FaShoppingBag },
    { id: 'returns', label: 'My Returns', icon: FaUndoAlt },
    { id: 'wishlist', label: 'My Wishlist', icon: FaHeart },
    ...(user.isSeller ? [{ id: 'seller', label: 'Seller Dashboard', icon: FaStore }] : [])
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto py-8 px-4">
        <motion.div
          className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar */}
            <div className="lg:w-1/4 bg-slate-800 p-6 border-r border-slate-700">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-600">
                  <span className="text-slate-200 text-2xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-100">{user.name}</h2>
                <p className="text-slate-400 text-sm">{user.email}</p>
                {user.isSeller && (
                  <div className="mt-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${user.sellerInfo?.approved
                      ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700'
                      : 'bg-amber-900/50 text-amber-300 border border-amber-700'
                      }`}>
                      {user.sellerInfo?.approved ? 'Approved Seller' : 'Pending Approval'}
                    </span>
                  </div>
                )}
              </div>

              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${activeTab === item.id
                      ? 'bg-slate-700 text-slate-100 border border-slate-600 shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-slate-200'
                      }`}
                  >
                    <item.icon className="text-lg" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4 p-6 lg:p-8">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-100">Edit Your Profile</h1>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-slate-700 text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors border border-slate-600"
                      >
                        <FaEdit /> Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="flex items-center gap-2 bg-emerald-700 text-slate-200 px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 border border-emerald-600"
                        >
                          <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditForm({
                              name: user.name,
                              email: user.email,
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: '',
                              sellerInfo: user.isSeller ? {
                                shopName: user.sellerInfo?.shopName || '',
                                businessType: user.sellerInfo?.businessType || '',
                                productsToSell: user.sellerInfo?.productsToSell || '',
                                description: user.sellerInfo?.description || ''
                              } : null
                            });
                          }}
                          className="flex items-center gap-2 bg-slate-600 text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-500 transition-colors border border-slate-500"
                        >
                          <FaTimes /> Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Basic Information */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">Basic Information</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={isEditing ? editForm.name : user.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 disabled:bg-slate-700 text-slate-200 placeholder-slate-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={isEditing ? editForm.email : user.email}
                          onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 disabled:bg-slate-700 text-slate-200 placeholder-slate-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Role
                        </label>
                        <input
                          type="text"
                          value={user.role}
                          disabled
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-400 capitalize"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Member Since
                        </label>
                        <input
                          type="text"
                          value={new Date(user.createdAt).toLocaleDateString()}
                          disabled
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seller Information */}
                  {user.isSeller && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-slate-200 mb-4">Seller Information</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Shop Name
                          </label>
                          <input
                            type="text"
                            value={isEditing ? editForm.sellerInfo?.shopName || '' : user.sellerInfo?.shopName || ''}
                            onChange={(e) => setEditForm(prev => ({
                              ...prev,
                              sellerInfo: { ...prev.sellerInfo, shopName: e.target.value }
                            }))}
                            disabled={!isEditing}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 disabled:bg-slate-700 text-slate-200 placeholder-slate-400"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Business Type
                          </label>
                          <input
                            type="text"
                            value={isEditing ? editForm.sellerInfo?.businessType || '' : user.sellerInfo?.businessType || ''}
                            onChange={(e) => setEditForm(prev => ({
                              ...prev,
                              sellerInfo: { ...prev.sellerInfo, businessType: e.target.value }
                            }))}
                            disabled={!isEditing}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 disabled:bg-slate-700 text-slate-200 placeholder-slate-400"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Products to Sell
                          </label>
                          <input
                            type="text"
                            value={isEditing ? editForm.sellerInfo?.productsToSell || '' : user.sellerInfo?.productsToSell || ''}
                            onChange={(e) => setEditForm(prev => ({
                              ...prev,
                              sellerInfo: { ...prev.sellerInfo, productsToSell: e.target.value }
                            }))}
                            disabled={!isEditing}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 disabled:bg-slate-700 text-slate-200 placeholder-slate-400"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Description
                          </label>
                          <textarea
                            rows="3"
                            value={isEditing ? editForm.sellerInfo?.description || '' : user.sellerInfo?.description || ''}
                            onChange={(e) => setEditForm(prev => ({
                              ...prev,
                              sellerInfo: { ...prev.sellerInfo, description: e.target.value }
                            }))}
                            disabled={!isEditing}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 disabled:bg-slate-700 text-slate-200 placeholder-slate-400 resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Average Rating
                          </label>
                          <div className="flex items-center space-x-2 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg">
                            <div className="flex">
                              {renderStars(user.sellerInfo?.averageRating || 0)}
                            </div>
                            <span className="text-slate-300">
                              ({user.sellerInfo?.averageRating || 0}/5) - {user.sellerInfo?.ratings?.length || 0} reviews
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Approval Status
                          </label>
                          <div className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${user.sellerInfo?.approved
                              ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700'
                              : 'bg-amber-900/50 text-amber-300 border border-amber-700'
                              }`}>
                              {user.sellerInfo?.approved ? (
                                <>
                                  <FaCheck className="mr-2" />
                                  Approved
                                </>
                              ) : (
                                <>
                                  <FaExclamationCircle className="mr-2" />
                                  Pending Approval
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Password Change Section */}
                  {isEditing && (
                    <div className="border-t border-slate-700 pt-6">
                      <h3 className="text-lg font-semibold text-slate-200 mb-4">Change Password</h3>
                      <p className="text-sm text-slate-400 mb-4">
                        Leave password fields empty if you don&apos;t want to change your password
                      </p>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={editForm.currentPassword}
                            onChange={(e) => setEditForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-200 placeholder-slate-400"
                            placeholder="Enter current password to change"
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              New Password
                            </label>
                            <input
                              type="password"
                              value={editForm.newPassword}
                              onChange={(e) => setEditForm(prev => ({ ...prev, newPassword: e.target.value }))}
                              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-200 placeholder-slate-400"
                              placeholder="New password (min 6 characters)"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              value={editForm.confirmPassword}
                              onChange={(e) => setEditForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-200 placeholder-slate-400"
                              placeholder="Confirm new password"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="text-2xl font-bold text-slate-100 mb-6">My Orders</h1>
                  {renderOrders()}
                </motion.div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="text-2xl font-bold text-slate-100 mb-6">My Wishlist</h1>
                  {loading.wishlist ? (
                    <div className="text-center text-slate-400">Loading wishlist...</div>
                  ) : !wishlist.length ? (
                    <div className="text-center py-12">
                      <FaHeart className="text-6xl text-slate-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-slate-400 mb-2">Your Wishlist is Empty</h3>
                      <p className="text-slate-500">Save your favorite items to see them here</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlist?.map((product) => (
                        <div key={product._id} className="bg-slate-800 flex flex-col rounded-xl shadow-lg overflow-hidden min-h-80 border border-slate-700 hover:border-slate-600 transition-all duration-200">
                          <Image
                            src={product.images[0]?.url}
                            alt={product.name}
                            height={254}
                            width={254}
                            className="object-cover"
                          />
                          <div className="p-4">
                            <h3 className="font-medium text-slate-200">{product.name}</h3>
                            <p className="text-slate-300 mt-2">${product.price}</p>
                            <div className="flex items-center mt-2">
                              {renderStars(product.averageRating)}
                              <span className="ml-2 text-sm text-slate-400">
                                ({product.numReviews} reviews)
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Seller Dashboard */}
              {activeTab === 'seller' && user.isSeller && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="text-2xl font-bold text-slate-100 mb-6">Seller Dashboard</h1>
                  {renderSellerProducts()}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 mt-8">
                    <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 text-slate-200 p-6 rounded-lg">
                      <FaStore className="text-3xl mb-4 text-slate-300" />
                      <h3 className="text-xl font-bold mb-2">{user.sellerInfo?.shopName || 'N/A'}</h3>
                      <p className="text-slate-400">{user.sellerInfo?.businessType || 'N/A'}</p>
                      <div className="flex items-center mt-4">
                        <div className="flex mr-2">
                          {renderStars(user.sellerInfo?.averageRating || 0)}
                        </div>
                        <span className="text-slate-400">({user.sellerInfo?.ratings?.length || 0} reviews)</span>
                      </div>
                    </div>

                    <div className={`text-slate-200 p-6 rounded-lg border ${user.sellerInfo?.approved
                      ? 'bg-gradient-to-br from-emerald-800 to-emerald-900 border-emerald-700'
                      : 'bg-gradient-to-br from-amber-800 to-amber-900 border-amber-700'
                      }`}>
                      {user.sellerInfo?.approved ?
                        <FaCheck className="text-3xl mb-4 text-emerald-300" /> :
                        <FaExclamationCircle className="text-3xl mb-4 text-amber-300" />
                      }
                      <h3 className="text-xl font-bold mb-2">Status</h3>
                      <p className="text-lg font-semibold">
                        {user.sellerInfo?.approved ? 'Approved' : 'Pending'}
                      </p>
                      <p className="text-sm opacity-90">
                        {user.sellerInfo?.approved
                          ? 'You can start selling!'
                          : 'Awaiting admin approval'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-slate-200 mb-4">Detailed Shop Information</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <span className="text-slate-400 font-medium">Shop Name:</span>
                          <p className="mt-1 text-slate-200">{user.sellerInfo?.shopName || 'Not set'}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium">Business Type:</span>
                          <p className="mt-1 text-slate-200">{user.sellerInfo?.businessType || 'Not set'}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium">Products to Sell:</span>
                          <p className="mt-1 text-slate-200">{user.sellerInfo?.productsToSell || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <span className="text-slate-400 font-medium">Member Since:</span>
                          <p className="mt-1 text-slate-200">
                            {user.sellerInfo?.createdAt
                              ? new Date(user.sellerInfo.createdAt).toLocaleDateString()
                              : 'N/A'
                            }
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium">Average Rating:</span>
                          <div className="flex items-center mt-1">
                            <div className="flex mr-2">
                              {renderStars(user.sellerInfo?.averageRating || 0)}
                            </div>
                            <span className="text-slate-200">
                              {user.sellerInfo?.averageRating || 0}/5 ({user.sellerInfo?.ratings?.length || 0} reviews)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <span className="text-slate-400 font-medium">Shop Description:</span>
                      <p className="mt-2 text-slate-200 bg-slate-700 p-4 rounded-lg border border-slate-600">
                        {user.sellerInfo?.description || 'No description provided'}
                      </p>
                      <Link href={'/seller'}>
                        <button className='px-4 py-2 bg-slate-700 text-slate-200 mx-6 my-3 border border-slate-600 rounded-lg hover:bg-slate-600 transition-colors'>Go to Seller Dashboard</button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}


              {/* Returns Tab */}
              {activeTab === 'returns' && (
                <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 p-4 sm:p-6 lg:p-8">
                  <div className="max-w-6xl mx-auto">
                    {/* Header Section */}
                    <div className="relative mb-8 sm:mb-12">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 blur-3xl opacity-30"></div>
                      <h1 className="relative text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-slate-100 via-slate-300 to-slate-100 bg-clip-text text-transparent mb-2">
                        Returns & Exchanges
                      </h1>
                      <p className="text-slate-400 text-base sm:text-lg font-light">Manage your return requests with elegance</p>
                      <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mt-4 sm:mt-6"></div>
                    </div>

                    {returningOrders ? (
                      <div className="space-y-6 sm:space-y-8">
                        {returningOrders.map((order, index) => (
                          <motion.div
                            key={order._id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="group relative"
                          >
                            {/* Luxury Card Container */}
                            <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-slate-800/50 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
                              {/* Shimmer Effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-400/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                              {/* Glow Border */}
                              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>

                              <div className="relative p-4 sm:p-6 lg:p-8">
                                {/* Order Header */}
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-8">
                                  <div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-slate-100 mb-2">
                                      Order #{order._id.slice(-8).toUpperCase()}
                                    </h3>
                                    <div className="flex flex-col xs:flex-row gap-2 xs:gap-4">
                                      <span className={`inline-flex items-center justify-center px-3 sm:px-4 py-2 rounded-full text-xs font-semibold ${order.isPaid
                                          ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50'
                                          : 'bg-amber-900/50 text-amber-300 border border-amber-700/50'
                                        }`}>
                                        {order.isPaid ? "✓ Paid" : "⏳ Payment Pending"}
                                      </span>
                                      <span className={`inline-flex items-center justify-center px-3 sm:px-4 py-2 rounded-full text-xs font-semibold ${order.isReturned
                                          ? 'bg-slate-900/50 text-slate-300 border border-slate-700/50'
                                          : 'bg-blue-900/50 text-blue-300 border border-blue-700/50'
                                        }`}>
                                        {order.isReturned ? "✓ Returned" : "🔄 Return Processing"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Items Grid */}
                                <div className="grid gap-4 sm:gap-6">
                                  {order.items.map((item, itemIndex) => (
                                    <motion.div
                                      key={item._id}
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ duration: 0.4, delay: itemIndex * 0.1 }}
                                      className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300"
                                    >
                                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                                        {/* Product Images */}
                                        <div className="flex-shrink-0 self-center sm:self-auto">
                                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg sm:rounded-xl overflow-hidden border border-slate-700/50 group-hover:border-slate-600/50 transition-all duration-300">
                                            {item.images?.length > 0 ? (
                                              <div className="relative w-full h-full">
                                                <Image
                                                  width={96}
                                                  height={96}
                                                  src={item.images[0].url}
                                                  alt={item.name}
                                                  className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                              </div>
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center">
                                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-600 rounded"></div>
                                              </div>
                                            )}
                                            {item.images?.length > 1 && (
                                              <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center font-bold">
                                                +{item.images.length - 1}
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0 text-center sm:text-left">
                                          <h4 className="text-lg sm:text-xl font-semibold text-slate-100 mb-2 sm:truncate">
                                            {item.name}
                                          </h4>
                                          <div className="flex flex-col xs:flex-row items-center justify-center sm:justify-start gap-3 xs:gap-6 text-sm">
                                            <div className="flex items-center justify-start">
                                              <span className="text-slate-400">Qty:</span>
                                              <span className="text-slate-200 font-medium bg-slate-800/50 px-2 py-1 rounded">
                                                {item.quantity}
                                              </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <span className="text-slate-400">Price:</span>
                                              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                                ${item.price}
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="flex-shrink-0 w-full sm:w-auto">
                                          <Link href={`/products/${item.product}`}>
                                            <button className="group/btn relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 text-sm sm:text-base">
                                              <span className="relative z-10">Reorder Now</span>
                                              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                                            </button>
                                          </Link>
                                        </div>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>

                                {/* Return Status Footer */}
                                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-700/30">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                                    <div className="text-slate-400 text-sm sm:text-base">
                                      {order.isReturned ? (
                                        <span className="flex items-center justify-center sm:justify-start space-x-2">
                                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                          <span>Return completed successfully</span>
                                        </span>
                                      ) : (
                                        <span className="flex items-center justify-center sm:justify-start space-x-2">
                                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                          <span>Return processing - we&apos;ll update you soon</span>
                                        </span>
                                      )}
                                    </div>
                                    <button className="text-slate-400 hover:text-slate-200 underline decoration-dotted transition-colors duration-200 text-sm sm:text-base text-center sm:text-right">
                                      Track Return Status
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      /* Empty State */
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center py-12 sm:py-20"
                      >
                        <div className="relative max-w-sm sm:max-w-md mx-auto px-4">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 blur-3xl"></div>
                          <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-slate-800/50 rounded-xl sm:rounded-2xl p-8 sm:p-12">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl sm:rounded-2xl flex items-center justify-center">
                              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                              </svg>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-slate-100 mb-3 sm:mb-4">No Returns Yet</h3>
                            <p className="text-slate-400 mb-6 sm:mb-8 text-sm sm:text-base">
                              You haven&apos;t initiated any returns. All your purchases are perfectly curated.
                            </p>
                            <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 text-sm sm:text-base">
                              Browse Products
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

        </motion.div>
      </div >
    </div >
  );
};

export default AccountPage;