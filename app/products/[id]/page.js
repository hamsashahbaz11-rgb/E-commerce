'use client'
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/app/components/Layout';
import { motion } from 'framer-motion';
import { FaMinus, FaPlus, FaShoppingCart } from 'react-icons/fa';

const ProductDetail = () => {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(params)
        // Get the ID from the URL params
        const {id} = params;
        const productId = id; 
        console.log('Product ID from params:', productId);
        
        if (!productId) {
          throw new Error('Product ID not found in URL');
        }
        
        // Construct URL properly
        const url = `/api/products/${productId}`;
        
        console.log('Fetching from URL:', url);
        
        const res = await fetch(url);
        const data = await res.json();
        
        console.log('API Response:', data);

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch product');
        }

        if (!data.product) {
          throw new Error('Product data is missing from response');
        }

        if (!data.product._id) {
          throw new Error('Product _id is missing from response');
        }

        // Verify that the product ID matches the URL
        if (data.product._id !== productId) {
          throw new Error('Product ID mismatch');
        }

        setProduct(data.product);
        console.log('Product set successfully:', data.product);
      } catch (err) {
        console.error('Error in fetchProduct:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params]); // Add params.id as dependency

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      const userId = localStorage.getItem('userId');

      if (!userId) {
        router.push('/auth/login');
        return;
      }
      
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          productId: product._id, // Using _id consistently
          quantity,
          price: product.price
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add to cart');
      }

      // Show success message
      const confirmAdd = window.confirm('Product added to cart successfully! Would you like to view your cart?');
      if (confirmAdd) {
        router.push('/cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert(err.message);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
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
            Error: {error}
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="text-center">Product not found</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <motion.div
          className="bg-white rounded-lg shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="md:flex">
            {/* Product Image */}
            <div className="md:w-1/2">
              <motion.img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-96 object-cover"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Product Details */}
            <div className="md:w-1/2 p-8">
              <motion.h1
                className="text-3xl font-bold mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {product.name}
              </motion.h1>

              <motion.div
                className="text-2xl font-bold text-blue-600 mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                ${product.price.toFixed(2)}
              </motion.div>

              <motion.p
                className="text-gray-600 mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                {product.description}
              </motion.p>

              {/* Quantity Selector */}
              <motion.div
                className="flex items-center mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <span className="mr-4">Quantity:</span>
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <motion.button
                    onClick={() => handleQuantityChange(-1)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200"
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaMinus />
                  </motion.button>
                  <span className="px-6 py-2">{quantity}</span>
                  <motion.button
                    onClick={() => handleQuantityChange(1)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200"
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaPlus />
                  </motion.button>
                </div>
              </motion.div>

              {/* Add to Cart Button */}
              <motion.button
                onClick={handleAddToCart}
                className="w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={addingToCart}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <FaShoppingCart className="mr-2" />
                <span>{addingToCart ? 'Adding to Cart...' : 'Add to Cart'}</span>
              </motion.button>

              {/* Additional Product Info */}
              <motion.div
                className="mt-6 border-t pt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <span className="ml-2 font-medium">{product.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Stock:</span>
                    <span className="ml-2 font-medium">{product.stock || 'In Stock'}</span>
                  </div>
                  {product.brand && (
                    <div>
                      <span className="text-gray-600">Brand:</span>
                      <span className="ml-2 font-medium">{product.brand}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ProductDetail; 