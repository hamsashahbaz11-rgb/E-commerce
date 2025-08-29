 
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import countries from '@/data/countries';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

export default function CheckoutPage() {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  });
  
  // Location state
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  
  // Cart and loading state
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Constants
  const shippingCost = 15;
  
  // Effects
  useEffect(() => {
    fetchCartData();
  }, []);

  // Fetch cart data from API
  const fetchCartData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        router.push('/auth/login');
        return;
      }
      
      const response = await fetch(`/api/cart?userId=${userId}`);
      const data = await response.json();
       
      
      if (data.cart && data.cart.items) {
        setCartItems(data.cart.items);
        setTotalPrice(data.cart.totalPrice || 0);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart data');
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle country selection
  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
    setSelectedCity(''); // Reset city when country changes
  };

  // Handle city selection
  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };

  // Get selected country object for cities
  const selectedCountryObject = countries.find(
    (country) => country.code === selectedCountry
  );

  // Calculate totals
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal + shippingCost;

  // Handle payment processing
  const handlePayment = async () => {
    // Validate required fields
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !selectedCountry || !selectedCity) {
      toast.error('Please fill in all required fields');
      return;
    }

    setProcessing(true);
    
    try {
      const userId = localStorage.getItem('userId');
      
      // Prepare order data to match schema
      const orderData = {
        user: userId,
        items: cartItems.map(item => ({
          product: item.product,
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
          size: item.size || '',
          color: item.color || '',
          images: item.product.images || [],
          sellerId: item.product.sellerId || item.product.seller || item.product.user
        })),
        shippingAddress: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          street: formData.address,
          city: selectedCity,
          state: selectedCity, // Using city as state for now
          zipCode: '00000', // Default value, can be made dynamic later
          country: selectedCountryObject?.name || selectedCountry,
        },paymentMethod
        : paymentMethod,
        itemsPrice: subtotal,
        shippingPrice: shippingCost,
        totalPrice: total,
        taxPrice: 0
      };
 
 
      // Send order data to the API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create order');
      }
      
      toast.success('Order placed successfully!');
      
      // Small delay to show success message before redirecting
      setTimeout(() => {
        router.push('/account');
      }, 1500);
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };
  
  return (
  <div className="container mx-auto py-10 px-6 md:px-20 bg-black min-h-screen">
      <div className="grid md:grid-cols-2 gap-10 bg-gray-900 p-10 rounded-lg shadow-2xl border border-gray-800">
        
        {/* Left: Shipping Information */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-white">Shipping Information</h2>
          
          {/* Personal Information */}
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-500"
              placeholder="John Doe"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-500"
              placeholder="john@example.com"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-500"
              placeholder="+123 456 7890"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Address *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-500"
              placeholder="Enter your shipping address"
              rows="3"
              required
            />
          </div>
          
          {/* Location Selection */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-300 mb-2">Country *</label>
              <select
                className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                value={selectedCountry}
                onChange={handleCountryChange}
                required
              >
                <option value="" className="bg-gray-800 text-gray-400">Select Country</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code} className="bg-gray-800 text-white">
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">City *</label>
              <select
                className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:opacity-50"
                value={selectedCity}
                onChange={handleCityChange}
                disabled={!selectedCountry}
                required
              >
                <option value="" className="bg-gray-800 text-gray-400">Select City</option>
                {selectedCountryObject?.cities?.map((city) => (
                  <option key={city} value={city} className="bg-gray-800 text-white">
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Selected Location Display */}
          {selectedCountry && selectedCity && selectedCountryObject && (
            <div className="mb-4 p-3 bg-gray-800 border border-green-600 rounded-md">
              <p className="text-green-400 font-medium">
                📍 Shipping to: {selectedCity}, {selectedCountryObject.name}
              </p>
            </div>
          )}
          
          {/* Payment Method */}
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Payment Method</label>
            <select
              className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="Credit Card" className="bg-gray-800 text-white">Credit Card</option>
              <option value="Cash on Delivery" className="bg-gray-800 text-white">Cash on Delivery</option>
            </select>
          </div>
        </div>

        {/* Right: Cart Summary */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-white">Review Your Cart</h2>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                <p className="mt-2 text-gray-400">Loading cart items...</p>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Your cart is empty</p>
                <button
                  onClick={() => router.push('/products')}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={`${item.product._id}-${item.size}-${item.color}`} className="flex justify-between items-center border-b border-gray-700 pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative w-16 h-16">
                      <Image 
                        width={64} 
                        height={64} 
                        src={item.product.images[0]?.url|| null} 
                        alt={item.product.name || 'Product'} 
                        className="w-16 h-16 object-cover rounded-lg border border-gray-700"
                        
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{item.product.name}</h3>
                      <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                      {item.size && (
                        <p className="text-sm text-gray-400">Size: {item.size}</p>
                      )}
                      {item.color && (
                        <p className="text-sm text-gray-400">Color: {item.color}</p>
                      )}
                      {item.product.discountPercentage > 0 && (
                        <p className="text-sm text-green-400 font-medium">
                          🏷️ {item.product.discountPercentage}% OFF
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-lg text-white">${(item.price * item.quantity).toFixed(2)}</span>
                    {item.product.discountPercentage > 0 && (
                      <p className="text-sm text-gray-500 line-through">
                        ${((item.product.originalPrice || item.price) * item.quantity).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Order Summary */}
          {cartItems.length > 0 && (
            <div className="mt-6 border-t border-gray-700 pt-4 space-y-3">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Shipping:</span>
                <span>${shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t border-gray-700 pt-2">
                <span className="text-white">Total:</span>
                <span className="text-blue-400">${total.toFixed(2)}</span>
              </div>
            </div>
          )}
          
          {/* Place Order Button */}
          <motion.button 
            whileHover={{ scale: processing || loading || cartItems.length === 0 ? 1 : 1.02 }}
            whileTap={{ scale: processing || loading || cartItems.length === 0 ? 1 : 0.98 }}
            className={`w-full mt-6 py-4 rounded-lg shadow-lg font-semibold text-lg transition duration-300 ${
              processing || loading || cartItems.length === 0
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-600' 
                : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 hover:shadow-xl border border-blue-500'
            }`}
            onClick={handlePayment}
            disabled={processing || loading || cartItems.length === 0}
          >
            {processing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Place Order'
            )}
          </motion.button>
          
          {/* Security Notice */}
          <p className="text-xs text-gray-400 text-center mt-3">
            🔒 Your payment information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}