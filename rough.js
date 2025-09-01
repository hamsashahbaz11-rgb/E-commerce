
// 'use client'
// import React, { useState, useEffect } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { showToast } from '@/app/utils/toast';
// import toast from 'react-hot-toast';
// import { motion } from 'framer-motion';
// import Image from 'next/image';
// import Link from 'next/link';
// import { FaMinus, FaPlus, FaShoppingCart, FaHeart, FaTruck, FaUndo, FaEye, FaChevronLeft, FaChevronRight, FaCheck } from 'react-icons/fa';
// import { Star } from 'lucide-react';

// const ProductDetail = () => {
//   const params = useParams();
//   const router = useRouter();

//   // States
//   const [isMounted, setIsMounted] = useState(false);
//   const [selectedImageIndex, setSelectedImageIndex] = useState(0);
//   const [product, setProduct] = useState(null);
//   const [variantStock, setVariantStock] = useState({});
//   const [selectedColor, setSelectedColor] = useState(null);
//   const [selectedSize, setSelectedSize] = useState(null);
//   const [currentVariantKey, setCurrentVariantKey] = useState('');
//   const [quantity, setQuantity] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isWishlisted, setIsWishlisted] = useState(false);
//   const [wishlistLoading, setWishlistLoading] = useState(false);

//   // Utility
//   const generateVariantKey = (color, size) => {
//     `${color || 'no-color'}_${size || 'no-size'}`;
//   }

//   // Step 1: Only render on client (avoids hydration mismatch)
//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   // Step 2: Fetch product after mount
//   useEffect(() => {
//     if (!isMounted || !params?.id) return;

//     const fetchProduct = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//   // Step 4: Update current variant key & quantity when selections change
//   useEffect(() => {
//     const newKey = generateVariantKey(selectedColor, selectedSize);
//     setCurrentVariantKey(newKey);

//     const maxStock = variantStock[newKey] || product?.stock || 0;
//     if (quantity > maxStock) {
//       setQuantity(Math.max(1, maxStock));
//     }
//   }, [selectedColor, selectedSize, variantStock]);

//   // === Handlers ===
//   const handleQuantityChange = (change) => {
//     const maxStock = variantStock[currentVariantKey] || product?.stock || 0;
//     const newQuantity = Math.min(Math.max(1, quantity + change), maxStock);
//     setQuantity(newQuantity);
//   };

//   const handleAddToCart = async () => {
//     try {
//       let userId = localStorage.getItem('userId');
//       let token = localStorage.getItem('token');

//       if (!userId || !token) {
//         router.push('/auth/login');
//         return;
//       }

//       if (!selectedColor && product?.colors?.length) {
//         return showToast.error('Please select a color');
//       }
//       if (!selectedSize && product?.sizes?.length) {
//         return showToast.error('Please select a size');
//       }

//       const stock = variantStock[currentVariantKey] || product?.stock || 0;
//       if (quantity > stock) {
//         return showToast.error(`Only ${stock} items available`);
//       }

//       const res = await fetch('/api/cart/add', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           userId,
//           productId: product._id,
//           quantity,
//           selectedColor,
//           selectedSize,
//           variantKey: currentVariantKey,
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || 'Failed to add to cart');

//       showToast.success('Added to cart!');
//     } catch (err) {
//       toast.error(err.message);
//     }
//   };

//   const handleWishlist = async () => {
//     try {
//       setWishlistLoading(true);
//       let userId = localStorage.getItem('userId');
//       let token = localStorage.getItem('token');

//       if (!userId || !token) {
//         router.push('/auth/login');
//         return;
//       }

//       const method = isWishlisted ? 'DELETE' : 'POST';
//       const res = await fetch(`/api/wishlist`, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ userId, productId: params.id }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error);

//       setIsWishlisted(!isWishlisted);
//       showToast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
//     } catch (err) {
//       toast.error(err.message);
//     } finally {
//       setWishlistLoading(false);
//     }
//   };

//   // if (!isMounted) {
//   //     console.log('Not mounted yet, showing loading...');
//   //     return (
//   //         <div className="min-h-screen flex items-center justify-center">
//   //             <div>Loading (Not Mounted)...</div>
//   //         </div>
//   //     );
//   // }

//   if (loading) {
//     console.log('Still loading, showing loading state...');
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div>Loading Product...</div>
//       </div>
//     );
//   }

//   if (error) {
//     console.log('Error state:', error);
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-red-600">
//           <h1>Error</h1>
//           <p>{error}</p>
//         </div>
//       </div>
//     );
//   }

//   if (!product) {
//     console.log('No product found');
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div>No product found</div>
//       </div>
//     );
//   }/         const res = await fetch(`/api/products/${params.id}`);
//         const data = await res.json();

//         if (!res.ok || !data.success || !data.product) {
//           throw new Error(data.error || 'Failed to fetch product');
//         }

//         setProduct(data.product);

//         // Set defaults for color/size
//         if (data.product.colors?.length > 0) {
//           setSelectedColor(data.product.colors[0]);
//         }
//         if (data.product.sizes?.length > 0) {
//           setSelectedSize(data.product.sizes[0]);
//         }
//       } catch (err) {
//         console.error(err);
//         setError(err.message);
//         toast.error(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProduct();
//   }, [isMounted, params?.id]);

//   // Step 3: Build deterministic variant stock (no randoms!)
//   useEffect(() => {
//     if (!product) return;

//     const variants = {};
//     if (product.colors && product.sizes) {
//       product.colors.forEach((color, cIndex) => {
//         product.sizes.forEach((size, sIndex) => {
//           const key = generateVariantKey(color, size);
//           // ✅ Stable & deterministic stock
//           variants[key] = Math.max(1, product.stock - (cIndex + sIndex));
//         });
//       });
//     }
//     setVariantStock(variants);
//   }, [product]);

