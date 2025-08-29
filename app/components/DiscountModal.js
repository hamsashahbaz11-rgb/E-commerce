'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const DiscountModal = ({ isOpen, onClose, products, onApplyDiscount }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filter, setFilter] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(filter.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyDiscount({
      productIds: selectedProducts,
      discountPercentage: parseFloat(discountPercentage),
      startDate: startDate,
      endDate: endDate
    });
    
    onClose();
  };

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 text-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Manage Discounts</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Search Products</label>
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-800 border-gray-600 text-white shadow-sm focus:border-gray-500 focus:ring-gray-500 p-2"
              placeholder="Search by product name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Select Products</label>
            <div className="mt-2 p-3 bg-gray-800 rounded-md border border-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
              {filteredProducts.map(product => (
                <label key={product._id} className="p-2 flex items-center space-x-3 hover:bg-gray-700 rounded-md cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts([...selectedProducts, product._id]);
                      } else {
                        setSelectedProducts(selectedProducts.filter(id => id !== product._id));
                      }
                    }}
                    className="h-4 w-4 p-2 bg-gray-700 border-gray-600 text-white focus:ring-offset-gray-800 focus:ring-white rounded"
                  />
                  <span>{product.name} - ${product.price}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                className="mt-1 block w-full p-2 rounded-md bg-gray-800 border-gray-600 text-white shadow-sm focus:border-gray-500 focus:ring-gray-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full p-2 rounded-md bg-gray-800 border-gray-600 text-white shadow-sm focus:border-gray-500 focus:ring-gray-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full p-2 rounded-md bg-gray-800 border-gray-600 text-white shadow-sm focus:border-gray-500 focus:ring-gray-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-transparent border border-gray-600 hover:bg-gray-700 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-black bg-white hover:bg-gray-200 rounded-md transition-colors"
            >
              Apply Discount
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default DiscountModal;