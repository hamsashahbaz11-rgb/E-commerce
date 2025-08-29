
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';

const ProductCard = ({ product }) => {  

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
    ? product.images[0].url 
    : 'https://via.placeholder.com/300x300?text=No+Image';

  // Check if product is new (created within last 7 days)
  const isNew = product.createdAt && new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Section */}
      <div className="relative bg-gray-100 p-6">
        {/* New Badge */}
        {isNew && (
          <span className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-md z-10">
            NEW
          </span>
        )}
        
        {/* Category and Subcategory */}
        <div className="absolute top-4 right-4 flex flex-col gap-1 z-10">
          {product.category && (
            <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
              {product.category}
            </span>
          )}
          {product.subcategory && (
            <span className="px-2 py-1 bg-gray-600 text-white text-xs font-medium rounded-full">
              {product.subcategory}
            </span>
          )}
        </div>

        {/* Product Image */}
        <Link href={`/products/${product._id}`}>
        <Image 
            src={productImage}
            alt={product.name}
            height={192}
            width={300}
            className="w-full h-48 object-contain cursor-pointer transition-transform duration-300 hover:scale-105"
          />
        </Link>
      </div>

      {/* Add to Cart Button */}
      <div className="px-6">
        <Link href={`/products/${product._id}`}>
          <motion.button 
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View Details
          </motion.button>
        </Link>
      </div>

      {/* Product Details */}
      <div className="p-6 pt-4">
        <Link href={`/products/${product._id}`}>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 hover:text-blue-600 transition-colors cursor-pointer">
            {product.name}
          </h3>
        </Link>

        {/* Price Section */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xl font-bold text-red-500">
            {/* ${product.discountPercentage > 0 ? product.price : product.realprice } */}
            ${product.discountPercentage > 0 ? product.price : product.realprice  }
          </span>
          {product.discountPercentage > 0 && (
            <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded-full">
              -{product.discountPercentage}%
            </span>
          )}
        </div>

        {/* Brand */}
        {product.brand && (
          <p className="text-sm text-gray-500 mb-2 font-medium">{product.brand}</p>
        )}

        {/* Rating Section */}
        {product.numReviews > 0 ? (
          <div className="flex items-center gap-1 mb-2">
            {/* Star Rating */}
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.floor(product.averageRating) ? 'text-yellow-400' : 'text-gray-300'}>
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-1">
              ({product.numReviews})
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-sm text-gray-500">No reviews yet</span>
          </div>
        )}

        {/* Stock Status */}
        <div className="flex items-center justify-between text-sm mb-3">
          <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
          {product.featured && (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
              Featured
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;