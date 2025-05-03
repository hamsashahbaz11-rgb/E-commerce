'use client'
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaChartLine, FaBox, FaDollarSign, FaUsers } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import ProductModal from '../components/ProductModal';

const Seller = () => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        // Verify seller role
        console.log("Seller ",sellerId)
        const userResponse = await fetch(`/api/users/${sellerId}`);
        const userData = await userResponse.json();
        console.log("UserData",userData)

        if (!userResponse.ok) {
          throw new Error(userData.error || 'Failed to fetch user data');
        }

        if (userData.user.role !== 'seller') {
          throw new Error('You do not have permission to access the seller dashboard');
        }

        console.log('Fetching products for seller:', sellerId);

        // Fetch products
        // const productsResponse = await fetch(`/api/seller/products?sellerId=${sellerId}`);
        const productsResponse = await fetch(`/api/seller/products/${sellerId}`);
        const productsData = await productsResponse.json();

        if (!productsResponse.ok) {
          throw new Error(productsData.error || 'Failed to fetch products');
        }

        setProducts(productsData.products || []);
        console.log('Products set in state:', productsData.products);

        // Fetch sales data
        const salesResponse = await fetch(`/api/seller/sales?sellerId=${sellerId}`);
        // const salesResponse = await fetch(`/api/seller/${sellerId}`);
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
    
    fetchSellerData();
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

      const productData = {
        ...formData,
        seller: sellerId
      };

      let response;
      if (selectedProduct) {
        // Update existing product
        response = await fetch(`/api/seller/products/${selectedProduct._id}?sellerId=${sellerId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });
      } else {
        // Create new product
        response = await fetch('/api/seller/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save product');
      }

      if (selectedProduct) {
        // Update product in state
        setProducts(products.map(p => p._id === selectedProduct._id ? data.product : p));
        toast.success('Product updated successfully');
      } else {
        // Add new product to state
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

  // Calculate summary stats from real data
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalProductsSold = products.reduce((sum, product) => sum + (product.sold || 0), 0);
  const totalRevenue = totalSales;
  const totalProducts = products.length;

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Error: {error}</p>
            <p className="mt-2">Please try again later or contact support if the problem persists.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <motion.h1 
          className="text-3xl font-bold mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Seller Dashboard
        </motion.h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'products'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'sales'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sales
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Summary Cards */}
            <motion.div 
              className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="flex items-center">
                <FaDollarSign className="text-3xl mr-4" />
                <div>
                  <h3 className="text-lg opacity-80">Total Revenue</h3>
                  <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="flex items-center">
                <FaBox className="text-3xl mr-4" />
                <div>
                  <h3 className="text-lg opacity-80">Products Sold</h3>
                  <p className="text-2xl font-bold">{totalProductsSold}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="flex items-center">
                <FaUsers className="text-3xl mr-4" />
                <div>
                  <h3 className="text-lg opacity-80">Orders</h3>
                  <p className="text-2xl font-bold">{sales.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-lg shadow-lg text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="flex items-center">
                <FaBox className="text-3xl mr-4" />
                <div>
                  <h3 className="text-lg opacity-80">Total Products</h3>
                  <p className="text-2xl font-bold">{totalProducts}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Products</h2>
              <motion.button
                onClick={handleAddProduct}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaPlus className="mr-2" />
                Add Product
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <motion.div
                  key={product._id}
                  className="bg-white p-4 rounded-lg shadow-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-lg font-bold mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-4">${product.price.toFixed(2)}</p>
                  <div className="flex justify-between">
                    <motion.button
                      onClick={() => handleEditProduct(product)}
                      className="text-blue-600 hover:text-blue-800"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaEdit />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="text-red-600 hover:text-red-800"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaTrash />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Sales History</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sales.map((sale) => (
                    <tr key={sale._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {sale.orderId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(sale.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${sale.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          sale.status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : sale.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Product Modal */}
        {isModalOpen && (
          <ProductModal
            product={selectedProduct}
            onSubmit={handleModalSubmit}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedProduct(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default Seller; 