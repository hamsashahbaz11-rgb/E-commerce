'use client';

import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const Cart = () => {
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalPrice: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setError('Please login to view your cart');
          setLoading(false);
          return;
        }
        
        setLoading(true);
        const res = await fetch(`/api/cart?userId=${userId}`);
        
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to fetch cart data');
        }
        
        const data = await res.json();
        setCart(data.cart || { items: [], totalItems: 0, totalPrice: 0 });
      } catch (err) {
        setError(err.message);
        console.error('Error fetching cart:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCart();
  }, []);

  const handleRemove = async (productId) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('Please login to modify your cart');
        return;
      }

      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to remove item');
      }

      const data = await res.json();
      setCart(data.cart);
      toast.success('Item removed from cart');
    } catch (err) {
      console.error('Error removing item:', err);
      toast.error(err.message);
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('Please login to modify your cart');
        return;
      }

      const res = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, quantity: newQuantity }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update quantity');
      }

      const data = await res.json();
      setCart(data.cart);
      toast.success('Cart updated');
    } catch (err) {
      console.error('Error updating quantity:', err);
      toast.error(err.message);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('Please login to add items to cart');
        return;
      }

      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, quantity: 1 }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add item to cart');
      }

      const data = await res.json();
      setCart(data.cart);
      toast.success('Item added to cart');
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error(err.message);
    }
  };

  if (loading) return (
    <Layout>
      <div className="container mx-auto py-8 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="container mx-auto py-8 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="container mx-auto py-8 w-[70vw] invert-0 text-black">
        <motion.h1 
          className="text-3xl font-bold mb-6 text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Your Shopping Cart
        </motion.h1>
        
        {cart.items.length === 0 ? (
          <motion.div 
            className="bg-gray-100 p-8 rounded-lg text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl mb-4">Your cart is empty</h2>
            <motion.a 
              href="/products"
              className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition duration-300 inline-block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Continue Shopping
            </motion.a>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 mb-8 bg-black">
              {cart.items.map((item, index) => (
                <motion.div 
                  key={item.product._id} 
                  className="bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-center sm:justify-between"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center mb-4 sm:mb-0">
                    <img 
                      src={item.product.images[0]} 
                      alt={item.product.name} 
                      className="w-16 h-16 object-cover rounded mr-4"
                    />
                    <div>
                      <h2 className="text-lg font-bold">{item.product.name}</h2>
                      <p className="text-gray-700">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center mr-6 border rounded overflow-hidden">
                      <motion.button
                        onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                        className="bg-gray-100 px-3 py-1 hover:bg-gray-200"
                        whileTap={{ scale: 0.9 }}
                      >
                        <FaMinus />
                      </motion.button>
                      <span className="px-4 py-1">{item.quantity}</span>
                      <motion.button
                        onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                        className="bg-gray-100 px-3 py-1 hover:bg-gray-200"
                        whileTap={{ scale: 0.9 }}
                      >
                        <FaPlus />
                      </motion.button>
                    </div>
                    <motion.button
                      onClick={() => handleRemove(item.product._id)}
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
            
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md text-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex justify-between mb-2">
                <span>Subtotal ({cart.totalItems} items):</span>
                <span>${cart.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>Total:</span>
                <span>${cart.totalPrice.toFixed(2)}</span>
              </div>
              <motion.button 
                className="px-8 text-center relative mx-auto w-[30vw] bg-blue-600 text-white py-3 rounded-full mt-4 hover:bg-blue-700 transition duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={()=> handleProcedding()}
              >
                Proceed to Checkout
              </motion.button>
            </motion.div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
