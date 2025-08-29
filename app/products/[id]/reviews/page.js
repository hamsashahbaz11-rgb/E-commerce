// Component for Product Detail Page - Review Summary Section
"use client"
import ProductCard from '@/app/components/ProductCard';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

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
    0%, 80%, 100% {
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
    0%, 80%, 100% {
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
`;

const ReviewSummary = () => {
  const params = useParams();
  
  // Fix: Changed from array to single object
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { id } = params; 

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const { id } = params;
        const productId = id; 

        if (!productId) {
          throw new Error('Product ID not found in URL');
        }

        const url = `/api/products/${productId}`; 

        const res = await fetch(url);
        let productData;

        try {
          productData = await res.json(); 
        } catch (parseError) {
          console.error('Failed to parse response:', parseError);
          throw new Error('Failed to parse server response');
        }

        if (!res.ok) {
          const errorMessage = productData.details || productData.error || `HTTP error! status: ${res.status}`;
          console.error('Product fetch error:', {
            status: res.status,
            error: productData.error,
            details: productData.details,
            code: productData.code,
            productId
          });
          throw new Error(errorMessage);
        }

        if (!productData.success || !productData.product) {
          throw new Error(productData.error || 'Product data is missing from response');
        }

        if (!productData.product._id) {
          throw new Error('Invalid product data structure: Missing product ID');
        }

        if (productData.product._id.toString() !== productId) {
          throw new Error('Product ID mismatch');
        }

        // Fix: Set as single object instead of array
        setProduct(productData.product);
 
      } catch (err) {
        console.error('Error in fetchProduct:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params]);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`text-lg ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  const getRecentReviews = (reviews, count = 3) => {
    if (!reviews || !Array.isArray(reviews)) return [];
    return reviews
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, count);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Fix: Check if product exists before accessing ratings
  const recentReviews = product ? getRecentReviews(product.ratings || []) : [];

  // Fix: Corrected loading condition
  if (loading) {
    return (
      <StyledWrapper>
        <div className="loader">
          <div className='jimu-primary-loading'></div>
        </div>
      </StyledWrapper>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }
 
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">Product not found</div>
        </div>
      </div>
    );
  }

  return (
   
    <div className='w-full h-full bg-slate-900 p-0 m-0'>

    <div className="pt-8 border-t border-gray-900/50   max-w-4xl mx-auto">
      {/* Enhanced Product Card with Dark Theme */}
      <motion.div 
        className="bg-gradient-to-br from-gray-800/60 via-gray-900/80 to-black/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/30 overflow-hidden flex-col flex my-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-purple-500/5 rounded-3xl"></div>
          
          <div className="relative flex flex-col md:flex-row items-center gap-6">
            <motion.div 
              className="relative group"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-purple-400/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Image
                src={product.images[0]?.url}
                alt={product.name}
                width={200}
                height={200}
                className="relative object-cover rounded-2xl border border-gray-600/30 shadow-xl group-hover:shadow-2xl transition-all duration-500"
              />
            </motion.div>
            
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-gray-100 via-white to-gray-300 bg-clip-text mb-3">
                {product.name}
              </h3>
              
              <div className="flex items-center justify-center md:justify-start mb-3">
                <div className="flex items-center">
                  {renderStars(product.averageRating)}
                </div>
                <span className="ml-3 text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-600/30">
                  ({product.numReviews} reviews)
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                <p className="text-3xl font-bold text-transparent bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 bg-clip-text">
                  ${product.price}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-400 bg-gradient-to-r from-emerald-500/20 to-green-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                    Stock: {product.stock}
                  </span>
                  <span className="text-gray-400 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-3 py-1 rounded-full border border-blue-500/30 capitalize">
                    {product.category}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Review Summary Header */}
      <motion.div 
        className="flex flex-col sm:flex-row items-center justify-between mb-8 p-6 bg-gradient-to-r from-gray-800/40 via-gray-900/60 to-black/80 backdrop-blur-xl rounded-2xl border border-gray-700/30"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div>
          <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-gray-100 via-white to-gray-300 bg-clip-text mb-2">
            Customer Reviews
          </h3>
          <p className="text-gray-400 text-sm">
            Discover what our customers are saying about this product
          </p>
        </div>
        
        <Link 
          href={`/products/${product._id}/reviews`}
          className="group flex items-center gap-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-500 hover:via-purple-500 hover:to-blue-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-300 shadow-lg border border-blue-500/30 backdrop-blur-sm mt-4 sm:mt-0"
        >
          <span>View All Reviews</span>
          <motion.span
            className="group-hover:translate-x-1 transition-transform duration-300"
          >
            →
          </motion.span>
        </Link>
      </motion.div>

      {/* Premium Rating Overview */}
      <motion.div 
        className="bg-gradient-to-br from-gray-800/60 via-gray-900/80 to-black/90 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-gray-700/30 shadow-2xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
          {/* Rating Display */}
          <div className="text-center lg:border-r lg:border-gray-700/50 lg:pr-8">
            <motion.div 
              className="text-6xl font-bold text-transparent bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 bg-clip-text mb-3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
            >
              {product.averageRating?.toFixed(1) || '0.0'}
            </motion.div>
            
            <div className="flex items-center justify-center mb-3">
              {renderStars(product.averageRating || 0)}
            </div>
            
            <div className="text-gray-400 bg-gray-800/50 px-4 py-2 rounded-full border border-gray-600/30">
              Based on {product.numReviews || 0} reviews
            </div>
          </div>

          {/* Enhanced Rating Distribution */}
          <div className="flex-1 w-full">
            <h4 className="text-lg font-semibold text-gray-200 mb-4">Rating Breakdown</h4>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = (product.ratings || []).filter(r => r.rating === star).length;
              const percentage = product.numReviews ? (count / product.numReviews) * 100 : 0;

              return (
                <motion.div 
                  key={star} 
                  className="flex items-center text-sm mb-3 group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + (5 - star) * 0.1 }}
                >
                  <div className="flex items-center w-12">
                    <span className="text-gray-400 mr-1">{star}</span>
                    <span className="text-amber-400">★</span>
                  </div>
                  
                  <div className="flex-1 bg-gray-700/50 rounded-full h-3 mx-4 relative overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 h-3 rounded-full shadow-lg"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.8 + (5 - star) * 0.1 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                  </div>
                  
                  <span className="w-12 text-gray-400 text-right font-medium">{count}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Enhanced Recent Reviews Section */}
      {recentReviews.length > 0 ? (
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-amber-400 to-purple-400 rounded-full"></div>
            <h4 className="text-xl font-semibold text-gray-200">Recent Reviews</h4>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-700 to-transparent"></div>
          </div>
          
          {recentReviews.map((review, index) => (
            <motion.div 
              key={index} 
              className="group bg-gradient-to-br from-gray-800/40 via-gray-900/60 to-black/80 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-6 hover:shadow-2xl hover:shadow-amber-400/5 transition-all duration-500"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex flex-col sm:flex-row items-start justify-between mb-4">
                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                  <div className="flex items-center">
                    {renderStars(review.rating)}
                  </div>
                  <div className="h-4 w-px bg-gray-600"></div>
                  <span className="font-medium text-gray-200 bg-gradient-to-r from-gray-700/30 to-gray-800/50 px-3 py-1 rounded-full border border-gray-600/30">
                    {review.user?.name || 'Verified Buyer'}
                  </span>
                </div>
                <span className="text-sm text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-600/30">
                  {formatDate(review.date)}
                </span>
              </div>
              
              {review.review && (
                <div className="relative">
                  <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-amber-400 to-purple-400 rounded-full opacity-50"></div>
                  <p className="text-gray-300 text-sm leading-relaxed pl-4 italic">
                    &quot;{review.review.length > 200
                      ? `${review.review.substring(0, 200)}...`
                      : review.review
                    }&quot;
                  </p>
                </div>
              )}
            </motion.div>
          ))}

          {/* Enhanced Call to Action */}
          <motion.div 
            className="text-center pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-2xl blur-lg opacity-50"></div>
              <Link 
                href={`/products/${product._id}/reviews`}
                className="relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-500 hover:via-purple-500 hover:to-blue-600 text-white rounded-2xl font-semibold transition-all duration-300 shadow-xl border border-blue-500/30 backdrop-blur-sm group"
              >
                <span>Read All Reviews & Write a Review</span>
                <motion.div
                  className="group-hover:rotate-12 transition-transform duration-300"
                >
                  ✨
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        /* Enhanced No Reviews State */
        <motion.div 
          className="text-center py-12 bg-gradient-to-br from-gray-800/40 via-gray-900/60 to-black/80 backdrop-blur-xl rounded-3xl border border-gray-700/30"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.div
            className="mb-6"
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-gray-700 to-gray-600 rounded-full flex items-center justify-center text-3xl border border-gray-600/50">
              ⭐
            </div>
          </motion.div>
          
          <h3 className="text-2xl font-bold text-gray-200 mb-3">No Reviews Yet</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Be the pioneer! Share your experience and help other customers make informed decisions.
          </p>
          
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-2xl blur-lg opacity-50"></div>
            {/* <Link 
              href={`/products/${product._id}/reviews`}
              className="relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-500 hover:via-purple-500 hover:to-blue-600 text-white rounded-2xl font-semibold transition-all duration-300 shadow-xl border border-blue-500/30 backdrop-blur-sm group"
            > */}
              <motion.span
                className="group-hover:scale-110 transition-transform duration-300"
                onClick={()=> toast.success("First Purchase Product before Reviewing")}
              >
                🚀
              </motion.span>
              <span>Be the First to Review</span>
            {/* </Link> */}
          </div>
        </motion.div>
      )}
    </div>

    </div>
  );
};

export default ReviewSummary;