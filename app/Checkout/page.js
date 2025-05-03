'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import countries from '@/data/countries'; // Ensure you have a list of countries and cities

export default function CheckoutPage() {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cartItems] = useState([
    { id: 1, name: 'DuoComfort Sofa Premium', price: 20, image: '/sofa.png' },
    { id: 2, name: 'IronOne Desk', price: 25, image: '/desk.png' },
  ]);
  const [discount, setDiscount] = useState(10);
  const shippingCost = 5;
  
  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
  const total = subtotal + shippingCost - discount;
  console.log(countries)
  const selectedCountryObject = countries.find(
    (country) => country.code === selectedCountry
  );
  
  return (
    <div className="container mx-auto py-10 px-6 md:px-20 bg-gray-100 min-h-screen">
      <div className="grid md:grid-cols-2 gap-10 bg-white p-10 rounded-lg shadow-xl">
        {/* Left: Shipping Information */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
          <div className="mb-4">
            <label className="block text-gray-700">Full Name</label>
            <input type="text" className="w-full p-3 border rounded-md" placeholder="John Doe" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email Address</label>
            <input type="email" className="w-full p-3 border rounded-md" placeholder="john@example.com" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Phone Number</label>
            <input type="text" className="w-full p-3 border rounded-md" placeholder="+123 456 7890" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Country</label>
              {/* <select 
                className="w-full p-3 border rounded-md" 
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                <option value="">Select Country</option> */}
                {/* {Object.keys(countries).map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))} */}
                {/* {Object.entries(countries).map(([key, value]) => (
  <option key={key} value={key}>
    {value.code}
  </option>
))} */}
 <select
        className="w-full p-3 border rounded-md"
        onChange={(e) => {
          setSelectedCountry(e.target.value);
          setSelectedCity(""); // Reset city when country changes
        }}
      >
        <option value="">Select Country</option>
        {countries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </select>

              {/* </select> */}
            </div>
            <div>
            <label className="block text-gray-700 mt-3">City</label>
      <select
        className="w-full p-3 border rounded-md"
        onChange={(e) => setSelectedCity(e.target.value)}
        disabled={!selectedCountry}
      >
        <option value="">Select City</option>
        {selectedCountryObject?.cities.map(( city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>

      
      {/* Display Selected Values */}
      {selectedCountry && selectedCity && (
        <p className="mt-4 text-lg font-semibold">
          You selected: {selectedCity}, {selectedCountryObject.name}
        </p>
      )}
            </div>
          </div>
        </div>

        {/* Right: Cart Summary */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Review Your Cart</h2>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center space-x-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover" />
                  <span>{item.name}</span>
                </div>
                <span className="font-bold">${item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t pt-4 space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Shipping</span>
              <span>${shippingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Discount</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold mt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
          >
            Pay Now
          </motion.button>
        </div>
      </div>
    </div>
  );
}
