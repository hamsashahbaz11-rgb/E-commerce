"use client"
import Image from 'next/image';
import { useParams } from 'next/navigation' 
import React, { useEffect, useState } from 'react'
import styled from 'styled-components';

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

const Review = () => { 
    const params = useParams()
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [product, setProduct] = useState([]);
    const [reviews, setReviews] = useState([]);
    
    // Review form states
    const [newRating, setNewRating] = useState(0);
    const [newReview, setNewReview] = useState('');
    const [hoveredRating, setHoveredRating] = useState(0);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
 
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

                setProduct([productData.product]);
                // Set reviews from product data
                setReviews(productData.product.ratings || []);
 
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

    const renderInteractiveStars = (rating, setRating, hoveredRating, setHoveredRating) => {
        return [...Array(5)].map((_, i) => (
            <button
                key={i}
                type="button"
                className={`text-2xl transition-colors ${
                    i < (hoveredRating || rating) ? 'text-yellow-400' : 'text-gray-300'
                } hover:text-yellow-400`}
                onClick={() => setRating(i + 1)}
                onMouseEnter={() => setHoveredRating(i + 1)}
                onMouseLeave={() => setHoveredRating(0)}
            >
                ★
            </button>
        ));
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        
        if (newRating === 0) {
            setSubmitMessage('Please select a rating');
            return;
        }

        setSubmitLoading(true);
        setSubmitMessage('');

        try {
            const { id } = params;
            const response = await fetch(`/api/products/${id}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: localStorage.getItem('userId'),
                    rating: newRating,
                    review: newReview
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitMessage('Review submitted successfully!');
                setNewRating(0);
                setNewReview('');
                // Refresh reviews by fetching the product again
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                setSubmitMessage(data.error || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            setSubmitMessage('Error submitting review. Please try again.');
        } finally {
            setSubmitLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

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

    if (loading) {
        return (
            <StyledWrapper>
                <div className="loader">
                    <div className='jimu-primary-loading'></div>
                </div>
            </StyledWrapper>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Product Info */}
                    <div>
                        {product.map((product) => (
                            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <Image
                                    src={product.images[0]?.url}
                                    alt={product.name}
                                    width={500}
                                    height={500}
                                    className="w-full h-96 object-cover"
                                />
                                <div className="p-6">
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                                    <div className="flex items-center mb-4">
                                        {renderStars(product.averageRating)}
                                        <span className="ml-2 text-sm text-gray-600">
                                            ({product.numReviews} reviews)
                                        </span>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900 mb-2">${product.price}</p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Stock: {product.stock} | Category: {product.category}
                                    </p>
                                    <p className="text-gray-700">{product.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Reviews Section */}
                    <div className="space-y-6">
                        {/* Add Review Form */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4">Write a Review</h2>
                            <form onSubmit={handleSubmitReview}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Rating *
                                    </label>
                                    <div className="flex items-center space-x-1">
                                        {renderInteractiveStars(newRating, setNewRating, hoveredRating, setHoveredRating)}
                                        <span className="ml-2 text-sm text-gray-600">
                                            {newRating > 0 && `${newRating} out of 5 stars`}
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Review (Optional)
                                    </label>
                                    <textarea
                                        value={newReview}
                                        onChange={(e) => setNewReview(e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Share your thoughts about this product..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitLoading || newRating === 0}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    {submitLoading ? 'Submitting...' : 'Submit Review'}
                                </button>

                                {submitMessage && (
                                    <p className={`mt-2 text-sm ${submitMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                                        {submitMessage}
                                    </p>
                                )}
                            </form>
                        </div>

                        {/* Existing Reviews */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4">
                                Customer Reviews ({reviews.length})
                            </h2>
                            
                            {reviews.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">
                                    No reviews yet. Be the first to review this product!
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map((review, index) => (
                                        <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center">
                                                    {renderStars(review.rating)}
                                                    <span className="ml-2 font-medium text-gray-900">
                                                        {review.user?.name || 'Anonymous User'}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    {formatDate(review.date)}
                                                </span>
                                            </div>
                                            {review.review && (
                                                <p className="text-gray-700 mt-2">{review.review}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Review