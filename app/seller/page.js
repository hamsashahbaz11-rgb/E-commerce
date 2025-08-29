 'use client';

import Image from 'next/image';
import DiscountModal from '../components/DiscountModal';
import ProductModal from '../components/ProductModal';
import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaChartLine, FaBox, FaDollarSign, FaUsers, FaPercent, FaStar, FaEye } from 'react-icons/fa';
import Link from 'next/link';
import toast from 'react-hot-toast';

const SellerPage = () => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmails, setUserEmails] = useState({});
  const [userById, setUserById] = useState('');
  const [showDiscountModal, setShowDiscountModal] = useState(false);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get seller ID from localStorage
        const sellerId = localStorage.getItem('userId');
        if (!sellerId) {
          throw new Error('Please login to access seller dashboard');
        }

        const userResponse = await fetch(`/api/users/${sellerId}`);
        const userData = await userResponse.json();

        if (!userResponse.ok) {
          throw new Error(userData.error || 'Failed to fetch user data');
        }

        if (userData.user.role !== 'seller') {
          throw new Error('You do not have permission to access the seller dashboard');
        }

        // Fetch products
        const productsResponse = await fetch(`/api/seller/products?sellerId=${sellerId}`);
        const productsData = await productsResponse.json();

        if (!productsResponse.ok) {
          throw new Error(productsData.error || 'Failed to fetch products');
        }

        setProducts(productsData.products || []);

        // Fetch sales data
        const salesResponse = await fetch(`/api/seller/sales?sellerId=${sellerId}`);
        const salesData = await salesResponse.json();

        if (!salesResponse.ok) {
          throw new Error(salesData.error || 'Failed to fetch sales data');
        }

        setSales(salesData.sales || []);

      } catch (err) {
        console.error('Error fetching seller data:', err);
        setError(err.message);
        toast.error(err.message); 
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData()
  }, []);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const sellerId = localStorage.getItem('userId');
      if (!sellerId) {
        throw new Error('Please login to delete products');
      }

      const response = await fetch(`/api/seller/products/${productId}?sellerId=${sellerId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete product');
      }

      // Remove the product from the state
      setProducts(products.filter(product => product._id !== productId));
      toast.success('Product deleted successfully'); 

    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.message); 
    }
  };

  const handleModalSubmit = async (formData) => {
    try {
      const sellerId = localStorage.getItem('userId');
      if (!sellerId) {
        throw new Error('Please login to manage products');
      }

      let response;

      if (selectedProduct) {
        // For updates, we need to handle images specially
        if (formData.getAll('images').length > 0) {
          formData.append('seller', sellerId);
          response = await fetch(`/api/seller/products/${selectedProduct._id}?sellerId=${sellerId}`, {
            method: 'PATCH',
            body: formData,
          });
        } else {
          const productData = {};
          formData.forEach((value, key) => {
            productData[key] = value;
          });
          productData.seller = sellerId;

          response = await fetch(`/api/seller/products/${selectedProduct._id}?sellerId=${sellerId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
          });
        }
      } else {
        // Create new product
        formData.append('seller', sellerId);
        response = await fetch('/api/seller/products', {
          method: 'POST',
          body: formData
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save product');
      }

      if (selectedProduct) {
        setProducts(products.map(p => p._id === selectedProduct._id ? data.product : p));
        toast.success('Product updated successfully');
      } else {
        setProducts([data.product, ...products]);
        toast.success('Product added successfully');
      }

      setIsModalOpen(false);
      setSelectedProduct(null);

    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.message);
    }
  };
  const handleStatusChange = async (orderId, newStatus) => { 
    try {
      console.log(orderId)
      const sellerId = localStorage.getItem("userId");

      const response = await fetch(`/api/seller/sales/${orderId}?sellerId=${sellerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus,  }),
      });

      if (!response.ok) throw new Error("Failed to update order status");

      const updatedSale = await response.json();
      console.log(updatedSale)

      // Update state with the new sale data
      setSales((prevSales) =>
        prevSales.map((sale) =>
          sale._id === orderId
            ? { ...sale, status: newStatus } // update status only
            : sale
        )
      );

    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Calculate summary stats from real data
  const totalSales = sales.reduce((sum, order) => {
    const orderTotal = order.items.reduce((itemSum, item) => {
      return itemSum + (item.price * item.quantity);
    }, 0);
    return sum + orderTotal;
  }, 0);

  const totalProductsSold = sales.reduce((total, order) => {
    return total + order.items.reduce((itemTotal, item) => {
      return itemTotal + item.quantity;
    }, 0);
  }, 0);

  const totalRevenue = Number(totalSales);
  const totalProducts = products.length;

  // Replace the existing getUserById function with this improved version
  const getUserById = async (user) => {
    try {
      // Check if we already have this user's email cached
      if (userEmails[user]) return userEmails[user];

      const userResponse = await fetch(`/api/users/${user}`);
      const userData = await userResponse.json();

      if (userData && userData.user && userData.user.email) {
        // Update the state with the new email
        setUserEmails(prev => ({
          ...prev,
          [user]: userData.user.email
        }));
        return userData.user.email;
      }
      return 'Email not found';
    } catch (error) {
      console.error('Error fetching user:', error);
      return 'Error loading email';
    }
  };

  // Add this useEffect to load all user emails when sales tab is activated
  useEffect(() => {
    if (activeTab === 'sales' && sales.length > 0) {
      // Load all user emails for the sales
      sales.forEach(sale => {
        if (sale.user) {
          getUserById(sale.user);
        }
      });
    }
  }, [activeTab, sales]);

  // Add this function to handle discount applications
  const handleApplyDiscount = async (discountData) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/seller/discounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(discountData),
      });

      if (!response.ok) {
        throw new Error('Failed to apply discounts');
      }
      alert(response.message);

      // Refresh products list
      const sellerId = localStorage.getItem('userId');
      const productsResponse = await fetch(`/api/seller/products?sellerId=${sellerId}`);
      const productsData = await productsResponse.json();
      setProducts(productsData.products || []);

      toast.success('Discounts applied successfully');
    } catch (error) {
      console.error('Error applying discounts:', error);
      toast.error(error.message);
    }
  };

  const StatCard = ({ icon: Icon, title, value, delay = 0 }) => (
    <div
      className="group relative overflow-hidden rounded-2xl p-6 bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all duration-700 hover:scale-105 hover:shadow-2xl cursor-pointer"
      style={{
        animation: `slideInUp 0.8s ease-out ${delay}s both`
      }}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-700"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white transform -translate-x-4 translate-y-4 group-hover:scale-125 transition-transform duration-500"></div>
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div className="flex-1">
          <p className="text-base sm:text-lg text-gray-400 mb-2 font-medium">{title}</p>
          <p className="text-2xl sm:text-4xl font-bold mb-2 text-white group-hover:scale-110 transition-transform duration-300">{value}</p>
          <div className="w-12 h-1 bg-gray-600 rounded-full group-hover:w-20 transition-all duration-500"></div>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-6">
          <Icon className="text-3xl sm:text-5xl text-gray-400 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500" />
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
    </div>
  );

  const ProductCard = ({ product }) => (
    <div className="group relative bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-700 hover:border-gray-600">
      <div className="relative z-10 p-4 sm:p-6">
        {/* Discount badge */}
        {product.discountPercentage > 0 && (
          <div className="absolute top-3 right-3 z-20 bg-gray-700 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            -{product.discountPercentage}% OFF
          </div>
        )}

        {/* Product image */}
        <div className="relative overflow-hidden rounded-xl bg-gray-900 mb-4 sm:mb-6 group-hover:scale-[1.02] transition-transform duration-500">
          <Image
            src={product.images?.[0]?.url || "https://via.placeholder.com/400x400"}
            alt={product.name || "Product image"}
            width={400}
            height={400}
            className="w-full h-48 sm:h-64 object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Quick actions on hover */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 sm:gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <Link href={`/products/${product._id}`}>
              <button className="bg-gray-700/90 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full shadow-lg hover:scale-110 transition-transform duration-200">
                <FaEye className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </Link>
            <button
              onClick={() => handleEditProduct(product)}
              className="bg-gray-700/90 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
            >
              <FaEdit className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => handleDeleteProduct(product._id)}
              className="bg-gray-700/90 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
            >
              <FaTrash className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Product info */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-gray-300 transition-all duration-300 line-clamp-2">
            {product.name}
          </h3>

          {/* Rating (if available) */}
          {(product.rating || product.reviews) && (
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={`text-sm ${i < Math.floor(product.rating || 4.5) ? 'text-yellow-400' : 'text-gray-600'}`} />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-gray-400">({product.reviews || 0} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              {product.discountPercentage > 0 ? (
                <>
                  <span className="text-gray-500 line-through text-base sm:text-lg">${product.price.toFixed(2)}</span>
                  <span className="text-xl sm:text-2xl font-bold text-white">
                    ${(product.price * (1 - product.discountPercentage / 100)).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-xl sm:text-2xl font-bold text-white">${product.price.toFixed(2)}</span>
              )}
            </div>
            {product.discountPercentage > 0 && (
              <div className="bg-gray-700 text-gray-300 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                Save ${(product.price * (product.discountPercentage / 100)).toFixed(2)}
              </div>
            )}
          </div>

          {/* Stock status */}
          <div className="flex items-center gap-2">
            <div className={`w-2 sm:w-3 h-2 sm:h-3 rounded-full ${product.stock > 10 ? 'bg-gray-400' : product.stock > 0 ? 'bg-gray-500' : 'bg-gray-600'} shadow-lg`}></div>
            <span className={`text-xs sm:text-sm font-medium ${product.stock > 10 ? 'text-gray-300' : product.stock > 0 ? 'text-gray-400' : 'text-gray-500'}`}>
              {product.stock > 10 ? `In Stock ${product.stock}` : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 sm:gap-3 pt-4 border-t border-gray-700">
            <button
              onClick={() => handleEditProduct(product)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 group/btn text-sm sm:text-base"
            >
              <FaEdit className="w-3 h-3 sm:w-4 sm:h-4 group-hover/btn:rotate-12 transition-transform duration-200" />
              Edit
            </button>
            <button
              onClick={() => handleDeleteProduct(product._id)}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 group/btn text-sm sm:text-base"
            >
              <FaTrash className="w-3 h-3 sm:w-4 sm:h-4 group-hover/btn:animate-bounce" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`relative px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-lg transition-all duration-300 ${isActive
        ? 'bg-white text-black shadow-lg scale-105'
        : 'text-gray-400 hover:text-white hover:bg-gray-800'
        }`}
    >
      {label}
      {isActive && (
        <div className="absolute inset-0 bg-gray-600 opacity-20 rounded-xl sm:rounded-2xl"></div>
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 sm:h-32 w-16 sm:w-32 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Loading Dashboard...</h2>
          <p className="text-gray-400 text-sm sm:text-base">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  if (error) { 
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-700 max-w-md mx-auto">
          <div className="text-center">
            <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTrash className="text-white text-lg sm:text-2xl" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Error</h2>
            <p className="text-gray-400 mb-4 text-sm sm:text-base">{error}</p>
            <p className="text-gray-500 text-xs sm:text-sm">Please try again later or contact support if the problem persists.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:scale-105 transition-transform duration-200 text-sm sm:text-base"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto py-6 sm:py-12 px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-16">
          <h1 className="text-4xl sm:text-6xl font-bold mb-4 sm:mb-6 text-white">
            Seller Dashboard
          </h1>
          <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto">
            Manage your products, track sales, and grow your business with our powerful seller tools
          </p>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="bg-gray-800 rounded-2xl sm:rounded-3xl p-1 sm:p-2 border border-gray-700">
            <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
              <TabButton id="dashboard" label="Dashboard" isActive={activeTab === 'dashboard'} onClick={setActiveTab} />
              <TabButton id="products" label="Products" isActive={activeTab === 'products'} onClick={setActiveTab} />
              <TabButton id="sales" label="Sales" isActive={activeTab === 'sales'} onClick={setActiveTab} />
            </div>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 sm:space-y-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              <StatCard
                icon={FaDollarSign}
                title="Total Revenue"
                value={`$${((totalRevenue * 0.8)?.toFixed(2) || '0.00')}`}
                delay={0.1}
              />
              <StatCard
                icon={FaBox}
                title="Products Sold"
                value={totalProductsSold}
                delay={0.2}
              />
              <StatCard
                icon={FaUsers}
                title="Total Orders"
                value={sales.length}
                delay={0.3}
              />
              <StatCard
                icon={FaChartLine}
                title="Total Products"
                value={totalProducts}
                delay={0.4}
              />
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-gray-700">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Recent Activity</h2>
              {sales.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <FaBox className="text-gray-600 text-4xl sm:text-6xl mx-auto mb-4" />
                  <p className="text-gray-400 text-base sm:text-lg">No sales activity yet</p>
                  <p className="text-gray-500 text-sm sm:text-base">Start selling to see your activity here</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {sales.slice(0, 5).map((sale, index) => (
                    <div key={sale._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-700 rounded-xl border border-gray-600 gap-3 sm:gap-0">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gray-600 rounded-full flex items-center justify-center">
                          <FaDollarSign className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm sm:text-base">{sale.items?.[0]?.name || 'Product'}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:block sm:text-right">
                        <p className="text-white font-bold text-sm sm:text-base">${(sale.items?.[0]?.price * sale.items?.[0]?.quantity || 0).toFixed(2)}</p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${sale.status === 'delivered'
                            ? 'bg-green-600 text-white'
                            : sale.status === 'out_for_delivery'
                              ? 'bg-blue-600 text-white'
                              : sale.status === 'processing'
                                ? 'bg-yellow-500 text-white'
                                : sale.status === 'pending'
                                  ? 'bg-gray-400 text-black'
                                  : sale.status === 'cancelled'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-300 text-gray-800'
                            }`}
                        >
                          {sale.status || 'pending'}
                        </span>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Header with Actions */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">Products</h2>
                <p className="text-gray-400">Manage your product inventory</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full lg:w-auto">
                <button
                  onClick={() => setShowDiscountModal(true)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 sm:gap-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                >
                  <FaPercent className="w-4 h-4 sm:w-5 sm:h-5" />
                  Manage Discounts
                </button>
                <button
                  onClick={handleAddProduct}
                  className="bg-white hover:bg-gray-200 text-black px-4 sm:px-6 py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 sm:gap-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                >
                  <FaPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Add Product
                </button>
              </div>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <FaBox className="text-gray-600 text-6xl sm:text-8xl mx-auto mb-4 sm:mb-6" />
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">No Products Yet</h3>
                <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">Start by adding your first product to begin selling</p>
                <button
                  onClick={handleAddProduct}
                  className="bg-white hover:bg-gray-200 text-black px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                >
                  <FaPlus className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                  Add Your First Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && (
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">Sales History</h2>
              <p className="text-gray-400">Track your sales performance</p>
            </div>

            {sales.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <FaChartLine className="text-gray-600 text-6xl sm:text-8xl mx-auto mb-4 sm:mb-6" />
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">No Sales Yet</h3>
                <p className="text-gray-400 text-sm sm:text-base">Your sales history will appear here once you start making sales</p>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-700">
                {/* Mobile view - Card layout */}
                <div className="block sm:hidden">
                  <div className="p-4 space-y-4">
                    {sales.map((sale) => (
                      <div key={sale._id} className="bg-gray-700 rounded-xl p-4 border border-gray-600">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-white font-semibold text-sm">Order Email</p>
                              <p className="text-gray-300 text-xs">{userEmails[sale.user] || 'Loading...'}</p>
                            </div>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <select
                                value={sale.status}
                                onChange={(e) => handleStatusChange(sale._id, e.target.value)}
                                className={`px-2 py-1 rounded-full text-xs font-semibold border outline-none ${sale.status === "processing"
                                  ? "bg-yellow-500 text-white"
                                  : sale.status === "out_for_delivery"
                                    ? "bg-blue-500 text-white"
                                    : sale.status === "pending"
                                      ? "bg-gray-400 text-black"
                                      : sale.status === "delivered"
                                        ? "bg-green-500 text-white"
                                        : "bg-red-500 text-white"
                                  }`}
                              >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="out_for_delivery">Out for Delivery</option> 
                              </select>
                            </td>

                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-white font-semibold text-sm">Date</p>
                              <p className="text-gray-400 text-xs">
                                {sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-white font-semibold text-sm">Product</p>
                              <p className="text-gray-400 text-xs">{sale.items?.[0]?.name || 'Product'}</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-gray-600">
                            <div>
                              <p className="text-white font-semibold text-sm">Total</p>
                              <p className="text-white font-bold">
                                ${((sale.items?.[0]?.price || 0) * (sale.items?.[0]?.quantity || 0)).toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-white font-semibold text-sm">Quantity</p>
                              <p className="text-white font-bold">{sale.items?.[0]?.quantity || 0}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop view - Table layout */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-4 sm:px-8 py-4 sm:py-6 text-left text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">Order Email</th>
                        <th className="px-4 sm:px-8 py-4 sm:py-6 text-left text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">Date</th>
                        <th className="px-4 sm:px-8 py-4 sm:py-6 text-left text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">Product</th>
                        <th className="px-4 sm:px-8 py-4 sm:py-6 text-left text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">Total</th>
                        <th className="px-4 sm:px-8 py-4 sm:py-6 text-left text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">Quantity</th>
                        <th className="px-4 sm:px-8 py-4 sm:py-6 text-left text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {sales.map((sale) => (
                        <tr key={sale._id} className="hover:bg-gray-700 transition-colors duration-200">
                          <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap text-white font-medium text-sm">
                            {userEmails[sale.user] || 'Loading...'}
                          </td>
                          <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap text-gray-400 text-sm">
                            {sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-4 sm:px-8 py-4 sm:py-6 text-gray-400 text-sm">{sale.items?.[0]?.name || 'Product'}</td>
                          <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap text-white font-bold text-sm">
                            ${((sale.items?.[0]?.price || 0) * (sale.items?.[0]?.quantity || 0)).toFixed(2)}
                          </td>
                          <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap text-white font-bold text-sm">
                            {sale.items?.[0]?.quantity || 0}
                          </td>

                          {/* <span className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${sale.status === 'delivered' ? 'bg-gray-600 text-gray-300' :
                                sale.status === 'shipped' ? 'bg-gray-500 text-gray-300' :
                                  'bg-gray-400 text-gray-800'
                              }`}>
                              {sale.status || 'pending'}
                            </span> */}
                          <td className="x-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">
                            <select
                              value={sale.status}
                              onChange={(e) => handleStatusChange(sale._id, e.target.value)}
                              className={`px-2 py-1 rounded-full text-xs font-semibold border outline-none ${sale.status === "processing"
                                ? "bg-yellow-500 text-white"
                                : sale.status === "out_for_delivery"
                                  ? "bg-blue-500 text-white"
                                  : sale.status === "pending"
                                    ? "bg-gray-400 text-black"
                                    : sale.status === "delivered"
                                      ? "bg-green-500 text-white"
                                      : "bg-red-500 text-white"
                                }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="out_for_delivery">Out for Delivery</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <ProductModal
          isOpen={true}
          product={selectedProduct}
          onSubmit={(form) => {
            handleModalSubmit(form)
          }}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {/* Discount Modal */}
      {showDiscountModal && (
        <DiscountModal
          isOpen={showDiscountModal}
          onClose={() => setShowDiscountModal(false)}
          products={products}
          onApplyDiscount={handleApplyDiscount}
        />
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Custom scrollbar for webkit browsers */
        .overflow-x-auto::-webkit-scrollbar {
          height: 6px;
        }

        .overflow-x-auto::-webkit-scrollbar-track {
          background: #374151;
          border-radius: 3px;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: #6b7280;
          border-radius: 3px;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        /* Responsive table improvements */
        @media (max-width: 640px) {
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }

        /* Animation delays for staggered effects */
        .animate-delay-100 {
          animation-delay: 0.1s;
        }
        
        .animate-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animate-delay-300 {
          animation-delay: 0.3s;
        }
        
        .animate-delay-400 {
          animation-delay: 0.4s;
        }

        /* Smooth transitions for all interactive elements */
        * {
          transition: all 0.2s ease-in-out;
        }

        /* Focus states for accessibility */
        button:focus,
        a:focus {
          outline: 2px solid #6b7280;
          outline-offset: 2px;
        }

        /* Improved touch targets for mobile */
        @media (max-width: 768px) {
          button {
            min-height: 44px;
            min-width: 44px;
          }
        }
      `}</style>
    </div>
  );
};

export default SellerPage;
