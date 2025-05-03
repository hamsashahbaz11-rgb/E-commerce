import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  // Log the product data to debug
  console.log('Product data in card:', product);
  console.log('Product ID in card:', product?._id);

  // Validate required fields
  if (!product) {
    console.error('Product is null or undefined');
    return null;
  }

  if (!product._id) {
    console.error('Product _id is missing:', product);
    return null;
  }

  if (!product.name || !product.price) {
    console.error('Required product fields are missing:', product);
    return null;
  }

  // Default image if none provided
  const productImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://via.placeholder.com/300x300?text=No+Image';

  return (
    <div className="border p-6 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 bg-gradient-to-br from-white to-blue-50 transform hover:-translate-y-2 hover:scale-105">
      <div className="relative">
        <img 
          src={productImage} 
          alt={product.name} 
          className="w-full h-52 object-cover mb-4 rounded-2xl shadow-lg" 
        />
        {product.category && (
          <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
            {product.category}
          </span>
        )}
      </div>
      <div className="p-4">
        <Link href={`/products/${product._id}`} className="block">
          <h2 className="text-2xl font-extrabold text-gray-800 mb-2 hover:text-blue-700 transition duration-300">
            {product.name}
          </h2>
        </Link>
        <div className="flex justify-between items-center mb-2">
          <p className="text-lg text-blue-600 font-semibold">${product.price.toFixed(2)}</p>
          {product.averageRating > 0 && (
            <div className="flex items-center">
              <span className="text-yellow-500 mr-1">★</span>
              <span className="text-sm text-gray-600">{product.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>
        {product.brand && (
          <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
        )}
        <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
        <Link href={`/products/${product._id}`} className="block">
          <motion.button 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-full hover:from-blue-700 hover:to-indigo-800 transition-transform duration-300 shadow-lg transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Details
          </motion.button>
        </Link>
      </div>
      
    </div>
  );
};

export default ProductCard;
