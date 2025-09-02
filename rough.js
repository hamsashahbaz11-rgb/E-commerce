'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaMinus, FaPlus, FaShoppingCart, FaHeart, FaTruck, FaUndo, FaEye, FaChevronLeft, FaChevronRight, FaCheck } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Star } from 'lucide-react';

const ProductDetail = () => {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [variantStock, setVariantStock] = useState({});
  const [currentVariantKey, setCurrentVariantKey] = useState('');

  const generateVariantKey = (color, size) => {
    return `${color || 'no-color'}_${size || 'no-size'}`;
  };

  const getCurrentVariantStock = () => {
    if (!selectedColor && !selectedSize) {
      return product?.stock || 0;
    }
    const variantKey = generateVariantKey(selectedColor, selectedSize);
    return variantStock[variantKey] || product?.stock || 0;
  };

  const isValidSelection = () => {
    const hasColors = product?.colors && product.colors.length > 0;
    const hasSizes = product?.sizes && product.sizes.length > 0;
    if (hasColors && !selectedColor) return false;
    if (hasSizes && !selectedSize) return false;
    return true;
  };

  const getCurrentPrice = () => {
    return product?.price * (1 - (product?.discountPercentage || 0) / 100) || 0;
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !params?.id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/products/${params.id}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const productData = await res.json();
        if (!productData.success || !productData.product) {
          throw new Error(productData.error || 'Product data is missing');
        }
        if (productData.product._id.toString() !== params.id) {
          throw new Error('Product ID mismatch');
        }
        setProduct(productData.product);
        if (productData.product.colors?.length > 0) {
          setSelectedColor(productData.product.colors[0]);
        }
        if (productData.product.sizes?.length > 0) {
          setSelectedSize(productData.product.sizes[0]);
        }
      } catch (err) {
        setError(err.message);
        toast.error(err.message || 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [isMounted, params?.id]);

  useEffect(() => {
    if (product) {
      const variants = {};
      if (product.colors && product.sizes) {
        product.colors.forEach((color, colorIndex) => {
          product.sizes.forEach((size, sizeIndex) => {
            const key = generateVariantKey(color, size);
            variants[key] = Math.max(1, product.stock - (colorIndex + sizeIndex));
          });
        });
      }
      setVariantStock(variants);
    }
  }, [product]);

  useEffect(() => {
    const newKey = generateVariantKey(selectedColor, selectedSize);
    setCurrentVariantKey(newKey);
    const maxStock = getCurrentVariantStock();
    if (quantity > maxStock) {
      setQuantity(Math.max(1, Math.min(quantity, maxStock)));
    }
  }, [selectedColor, selectedSize, quantity, getCurrentVariantStock]);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!product) return;
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        if (!userId || !token) return;
        const res = await fetch(`/api/wishlist/check?userId=${userId}&productId=${product._id}`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setIsWishlisted(data.isWishlisted || false);
        } else {
          throw new Error('Failed to check wishlist status');
        }
      } catch (error) {
        toast.error(error.message || 'Error checking wishlist status');
      }
    };
    checkWishlistStatus();
  }, [product]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product) return;
      try {
        const res = await fetch(`/api/products?category=${product.category}&limit=4&subcategory=${product.subcategory}`);
        if (!res.ok) {
          throw new Error('Failed to fetch related products');
        }
        const data = await res.json();
        const filtered = data.products.filter(p => p._id !== product._id).slice(0, 4);
        setRelatedProducts(filtered);
      } catch (error) {
        console.error('Error fetching related products:', error);
        toast.error('Failed to load related products');
      }
    };
    fetchRelatedProducts();
  }, [product]);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    const maxStock = getCurrentVariantStock();
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
    } else if (newQuantity > maxStock) {
      toast.error(`Only ${maxStock} items available for this variant.`);
    }
  };

  const getColorInfo = (colorName) => {
    const colorMap = {
      red: { name: 'Red', hex: '#dc2626' },
      blue: { name: 'Blue', hex: '#2563eb' },
      green: { name: 'Green', hex: '#16a34a' },
      black: { name: 'Black', hex: '#000000' },
      white: { name: 'White', hex: '#ffffff' },
      gray: { name: 'Gray', hex: '#6b7280' },
      grey: { name: 'Grey', hex: '#6b7280' },
      yellow: { name: 'Yellow', hex: '#eab308' },
      purple: { name: 'Purple', hex: '#9333ea' },
      pink: { name: 'Pink', hex: '#ec4899' },
      orange: { name: 'Orange', hex: '#ea580c' },
      brown: { name: 'Brown', hex: '#92400e' },
      navy: { name: 'Navy', hex: '#1e3a8a' },
      beige: { name: 'Beige', hex: '#f5f5dc' },
      gold: { name: 'Gold', hex: '#ffd700' },
      silver: { name: 'Silver', hex: '#c0c0c0' },
    };
    const colorKey = colorName?.toLowerCase() || '';
    return colorMap[colorKey] || { name: colorName, hex: colorName?.toLowerCase() || '#000000' };
  };

  const isVariantAvailable = (color, size) => {
    if (!color && !size) return true;
    const key = generateVariantKey(color, size);
    return variantStock[key] > 0;
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    if (selectedSize) {
      const newVariantKey = generateVariantKey(color, selectedSize);
      const stockForVariant = variantStock[newVariantKey];
      if (stockForVariant === 0 || stockForVariant === undefined) {
        const availableSize = product.sizes?.find(size => {
          const testKey = generateVariantKey(color, size);
          return variantStock[testKey] > 0;
        });
        if (availableSize) {
          setSelectedSize(availableSize);
          toast.success(`Switched to size ${availableSize} as selected combination was out of stock.`);
        } else {
          toast.warning('This color is currently out of stock in all sizes.');
        }
      }
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    if (selectedColor) {
      const newVariantKey = generateVariantKey(selectedColor, size);
      const stockForVariant = variantStock[newVariantKey];
      if (stockForVariant === 0 || stockForVariant === undefined) {
        const availableColor = product.colors?.find(color => {
          const testKey = generateVariantKey(color, size);
          return variantStock[testKey] > 0;
        });
        if (availableColor) {
          setSelectedColor(availableColor);
          toast.success(`Switched to ${availableColor} as selected combination was out of stock.`);
        } else {
          toast.warning('This size is currently out of stock in all colors.');
        }
      }
    }
  };

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      if (!userId || !token) {
        router.push('/auth/login');
        return;
      }
      if (!isValidSelection()) {
        if (product.colors?.length > 0 && !selectedColor) {
          toast.error('Please select a color before adding to cart.');
          return;
        }
        if (product.sizes?.length > 0 && !selectedSize) {
          toast.error('Please select a size before adding to cart.');
          return;
        }
      }
      const currentStock = getCurrentVariantStock();
      if (currentStock <= 0) {
        toast.error('This variant is currently out of stock.');
        return;
      }
      if (quantity > currentStock) {
        toast.error(`Only ${currentStock} items available for this variant.`);
        return;
      }
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          productId: product._id,
          quantity,
          price: getCurrentPrice(),
          originalPrice: product.price,
          selectedColor,
          selectedSize,
          variantKey: currentVariantKey,
        }),
      });
      const cartResponse = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('userId');
          localStorage.removeItem('token');
          localStorage.setItem('redirectAfterLogin', window.location.pathname);
          router.push('/auth/login');
          return;
        }
        throw new Error(cartResponse.error || 'Failed to add to cart');
      }
      toast.success('Product added to cart successfully!');
      if (window.confirm('Would you like to view your cart?')) {
        router.push('/cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error(err.message || 'Failed to add product to cart.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    try {
      setWishlistLoading(true);
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      if (!userId || !token) {
        router.push('/auth/login');
        return;
      }
      const endpoint = isWishlisted ? '/api/wishlist' : '/api/wishlist';
      const method = isWishlisted ? 'DELETE' : 'POST';
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          productId: params.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to ${isWishlisted ? 'remove from' : 'add to'} wishlist`);
      }
      setIsWishlisted(!isWishlisted);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (error) {
      toast.error(error.message || 'Failed to update wishlist.');
    } finally {
      setWishlistLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`text-lg ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  const getRecentReviews = (reviews) => {
    if (!reviews || reviews.length === 0) return [];
    return reviews
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
                <div className="flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
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

  const recentReviews = getRecentReviews(product.ratings);
  const currentStock = getCurrentVariantStock();
