// 'use client';
// import React, { useState, useEffect } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { motion } from 'framer-motion';
// import { FaMinus, FaPlus, FaShoppingCart, FaHeart, FaTruck, FaUndo, FaEye, FaChevronLeft, FaChevronRight, FaCheck } from 'react-icons/fa';
// import Image from 'next/image';
// import Link from 'next/link';
// import { toast, Toaster } from 'react-hot-toast';
// import { Star } from 'lucide-react';

// export async function getServerSideProps(context) {
//   const { id } = context.params;
//   try {
//     const res = await fetch(`/api/products/${id}`);
//     const productData = await res.json();
//     if (!res.ok || !productData.success || !productData.product) {
//       return { notFound: true };
//     }
//     return {
//       props: {
//         initialProduct: productData.product,
//       },
//     };
//   } catch (error) {
//     return { notFound: true };
//   }
// }

// const ProductDetail = ({ initialProduct }) => {
//   const params = useParams();
//   const router = useRouter();
//   const [product, setProduct] = useState(initialProduct);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [addingToCart, setAddingToCart] = useState(false);
//   const [selectedImageIndex, setSelectedImageIndex] = useState(0);
//   const [isWishlisted, setIsWishlisted] = useState(false);
//   const [wishlistLoading, setWishlistLoading] = useState(false);
//   const [relatedProducts, setRelatedProducts] = useState([]);
//   const [selectedColor, setSelectedColor] = useState(null);
//   const [selectedSize, setSelectedSize] = useState(null);
//   const [quantity, setQuantity] = useState(1);
//   const [variantStock, setVariantStock] = useState({});
//   const [currentVariantKey, setCurrentVariantKey] = useState('');

//   const getLocalStorageItem = (key) => {
//     if (typeof window !== 'undefined') {
//       return localStorage.getItem(key);
//     }
//     return null;
//   };

//   const generateVariantKey = (color, size) => {
//     return `${color || 'no-color'}_${size || 'no-size'}`;
//   };

//   const getCurrentVariantStock = () => {
//     if (!selectedColor && !selectedSize) {
//       return product?.stock || 0;
//     }
//     const variantKey = generateVariantKey(selectedColor, selectedSize);
//     return variantStock[variantKey] || product?.stock || 0;
//   };

//   const isValidSelection = () => {
//     const hasColors = product?.colors && product.colors.length > 0;
//     const hasSizes = product?.sizes && product.sizes.length > 0;
//     if (hasColors && !selectedColor) return false;
//     if (hasSizes && !selectedSize) return false;
//     return true;
//   };

//   const getCurrentPrice = () => {
//     return product?.price * (1 - (product?.discountPercentage || 0) / 100) || 0;
//   };

//   useEffect(() => {
//     if (product) {
//       const variants = {};
//       if (product.colors && product.sizes) {
//         product.colors.forEach((color, colorIndex) => {
//           product.sizes.forEach((size, sizeIndex) => {
//             const key = generateVariantKey(color, size);
//             variants[key] = Math.max(1, product.stock - (colorIndex + sizeIndex));
//           });
//         });
//       }
//       setVariantStock(variants);
//       if (product.colors?.length > 0) {
//         setSelectedColor(product.colors[0]);
//       }
//       if (product.sizes?.length > 0) {
//         setSelectedSize(product.sizes[0]);
//       }
//     }
//   }, [product]);

//   useEffect(() => {
//     const newKey = generateVariantKey(selectedColor, selectedSize);
//     setCurrentVariantKey(newKey);
//     const maxStock = getCurrentVariantStock();
//     if (quantity > maxStock) {
//       setQuantity(Math.max(1, Math.min(quantity, maxStock)));
//     }
//   }, [selectedColor, selectedSize, quantity]);

//   useEffect(() => {
//     const checkWishlistStatus = async () => {
//       if (!product) return;
//       try {
//         const userId = getLocalStorageItem('userId');
//         const token = getLocalStorageItem('token');
//         if (!userId || !token) return;
//         const res = await fetch(`/api/wishlist/check?userId=${userId}&productId=${product._id}`, {
//           headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//         });
//         if (res.ok) {
//           const data = await res.json();
//           setIsWishlisted(data.isWishlisted || false);
//         } else {
//           throw new Error('Failed to check wishlist status');
//         }
//       } catch (error) {
//         toast.error(error.message || 'Error checking wishlist status');
//       }
//     };
//     checkWishlistStatus();
//   }, [product]);

//   useEffect(() => {
//     const fetchRelatedProducts = async () => {
//       if (!product) return;
//       try {
//         const res = await fetch(`/api/products?category=${product.category}&limit=4&subcategory=${product.subcategory}`);
//         if (!res.ok) {
//           throw new Error('Failed to fetch related products');
//         }
//         const data = await res.json();
//         const filtered = data.products.filter(p => p._id !== product._id).slice(0, 4);
//         setRelatedProducts(filtered);
//       } catch (error) {
//         toast.error('Failed to load related products');
//       }
//     };
//     fetchRelatedProducts();
//   }, [product]);

//   const handleQuantityChange = (change) => {
//     const newQuantity = quantity + change;
//     const maxStock = getCurrentVariantStock();
//     if (newQuantity >= 1 && newQuantity <= maxStock) {
//       setQuantity(newQuantity);
//     } else if (newQuantity > maxStock) {
//       toast.error(`Only ${maxStock} items available for this variant.`);
//     }
//   };

//   const getColorInfo = (colorName) => {
//     const colorMap = {
//       red: { name: 'Red', hex: '#dc2626' },
//       blue: { name: 'Blue', hex: '#2563eb' },
//       // ... other colors
//     };
//     const colorKey = colorName?.toLowerCase() || '';
//     return colorMap[colorKey] || { name: colorName, hex: colorName?.toLowerCase() || '#000000' };
//   };

//   const isVariantAvailable = (color, size) => {
//     if (!color && !size) return true;
//     const key = generateVariantKey(color, size);
//     return variantStock[key] > 0;
//   };

//   const handleColorSelect = (color) => {
//     setSelectedColor(color);
//     if (selectedSize) {
//       const newVariantKey = generateVariantKey(color, selectedSize);
//       const stockForVariant = variantStock[newVariantKey];
//       if (stockForVariant === 0 || stockForVariant === undefined) {
//         const availableSize = product.sizes?.find(size => {
//           const testKey = generateVariantKey(color, size);
//           return variantStock[testKey] > 0;
//         });
//         if (availableSize) {
//           setSelectedSize(availableSize);
//           toast.success(`Switched to size ${availableSize} as selected combination was out of stock.`);
//         } else {
//           toast.warning('This color is currently out of stock in all sizes.');
//         }
//       }
//     }
//   };

//   const handleSizeSelect = (size) => {
//     setSelectedSize(size);
//     if (selectedColor) {
//       const newVariantKey = generateVariantKey(selectedColor, size);
//       const stockForVariant = variantStock[newVariantKey];
//       if (stockForVariant === 0 || stockForVariant === undefined) {
//         const availableColor = product.colors?.find(color => {
//           const testKey = generateVariantKey(color, size);
//           return variantStock[testKey] > 0;
//         });
//         if (availableColor) {
//           setSelectedColor(availableColor);
//           toast.success(`Switched to ${availableColor} as selected combination was out of stock.`);
//         } else {
//           toast.warning('This size is currently out of stock in all colors.');
//         }
//       }
//     }
//   };

//   const handleAddToCart = async () => {
//     try {
//       setAddingToCart(true);
//       const userId = getLocalStorageItem('userId');
//       const token = getLocalStorageItem('token');
//       if (!userId || !token) {
//         router.push('/auth/login');
//         return;
//       }
//       if (!isValidSelection()) {
//         if (product.colors?.length > 0 && !selectedColor) {
//           toast.error('Please select a color before adding to cart.');
//           return;
//         }
//         if (product.sizes?.length > 0 && !selectedSize) {
//           toast.error('Please select a size before adding to cart.');
//           return;
//         }
//       }
//       const currentStock = getCurrentVariantStock();
//       if (currentStock <= 0) {
//         toast.error('This variant is currently out of stock.');
//         return;
//       }
//       if (quantity > currentStock) {
//         toast.error(`Only ${currentStock} items available for this variant.`);
//         return;
//       }
//       const res = await fetch('/api/cart/add', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           userId,
//           productId: product._id,
//           quantity,
//           price: getCurrentPrice(),
//           originalPrice: product.price,
//           selectedColor,
//           selectedSize,
//           variantKey: currentVariantKey,
//         }),
//       });
//       const cartResponse = await res.json();
//       if (!res.ok) {
//         if (res.status === 401) {
//           localStorage.removeItem('userId');
//           localStorage.removeItem('token');
//           localStorage.setItem('redirectAfterLogin', window.location.pathname);
//           router.push('/auth/login');
//           return;
//         }
//         throw new Error(cartResponse.error || 'Failed to add to cart');
//       }
//       toast.success('Product added to cart successfully!');
//       if (typeof window !== 'undefined' && window.confirm('Would you like to view your cart?')) {
//         router.push('/cart');
//       }
//     } catch (err) {
//       toast.error(err.message || 'Failed to add product to cart.');
//     } finally {
//       setAddingToCart(false);
//     }
//   };

//   const handleWishlist = async () => {
//     try {
//       setWishlistLoading(true);
//       const userId = getLocalStorageItem('userId');
//       const token = getLocalStorageItem('token');
//       if (!userId || !token) {
//         router.push('/auth/login');
//         return;
//       }
//       const endpoint = isWishlisted ? '/api/wishlist' : '/api/wishlist';
//       const method = isWishlisted ? 'DELETE' : 'POST';
//       const res = await fetch(endpoint, {
//         method,
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           userId,
//           productId: params.id,
//         }),
//       });
//       const data = await res.json();
//       if (!res.ok) {
//         throw new Error(data.error || `Failed to ${isWishlisted ? 'remove from' : 'add to'} wishlist`);
//       }
//       setIsWishlisted(!isWishlisted);
//       toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
//     } catch (error) {
//       toast.error(error.message || 'Failed to update wishlist.');
//     } finally {
//       setWishlistLoading(false);
//     }
//   };

//   const renderStars = (rating) => {
//     return [...Array(5)].map((_, i) => (
//       <span key={i} className={`text-lg ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
//         ★
//       </span>
//     ));
//   };

//   const getRecentReviews = (reviews) => {
//     if (!reviews || reviews.length === 0) return [];
//     return reviews
//       .sort((a, b) => new Date(b.date) - new Date(a.date))
//       .slice(0, 3);
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     });
//   };

//   if (!product && !loading && !error) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <div className="container mx-auto py-8 px-4">
//           <div className="text-center">Product not found</div>
//         </div>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <div className="container mx-auto py-8 px-4">
//           <div className="animate-pulse">
//             <div className="grid md:grid-cols-2 gap-8">
//               <div>
//                 <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
//                 <div className="flex gap-2">
//                   {[...Array(4)].map((_, i) => (
//                     <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg"></div>
//                   ))}
//                 </div>
//               </div>
//               <div className="space-y-4">
//                 <div className="h-8 bg-gray-200 rounded w-3/4"></div>
//                 <div className="h-6 bg-gray-200 rounded w-1/2"></div>
//                 <div className="h-4 bg-gray-200 rounded w-full"></div>
//                 <div className="h-4 bg-gray-200 rounded w-2/3"></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <div className="container mx-auto py-8 px-4">
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//             Error: {error}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const recentReviews = getRecentReviews(product.ratings);
//   const currentStock = getCurrentVariantStock();


'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaMinus, FaPlus, FaShoppingCart, FaHeart, FaTruck, FaUndo, FaEye, FaChevronLeft, FaChevronRight, FaCheck } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import { toast, Toaster } from 'react-hot-toast';
import { Star } from 'lucide-react';


// export async function getServerSideProps(context) {
//   const { id } = await context.params;
//   try {
//     const res = await fetch(`https:localhost:3000/api/products/${id}`);
//     const productData = await res.json();
//     if (!res.ok || !productData.success || !productData.product) {
//       return { notFound: true };
//     }
//     return {
//       props: {
//         initialProduct: productData.product,
//       },
//     };
//   } catch (error) {
//     return { notFound: true };
//   }
// }

const ProductDetail = () => {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [variantStock, setVariantStock] = useState({});
  const [currentVariantKey, setCurrentVariantKey] = useState('');

  const getLocalStorageItem = (key) => {
    if (typeof(window) !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };

   

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
      if (product.colors?.length > 0) {
        setSelectedColor(product.colors[0]);
      }
      if (product.sizes?.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
    }
  }, [product]);

  useEffect(() => {
    const newKey = generateVariantKey(selectedColor, selectedSize);
    setCurrentVariantKey(newKey);
    const maxStock = getCurrentVariantStock();
    if (quantity > maxStock) {
      setQuantity(Math.max(1, Math.min(quantity, maxStock)));
    }
  }, [selectedColor, selectedSize]);

  useEffect(() => {
     const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${params.id}`);
        const productData = await res.json();
        if (!res.ok || !productData.success || !productData.product) {
          return { notFound: true };
        }
         console.log("Product fetched successfully:", productData.product);
        setProduct(productData.product);
        setLoading(false);
        setError(null); 
      } catch (error) {
        return { notFound: true };
      }
    }
    fetchProduct();

    const checkWishlistStatus = async () => {
      if (!product) return;
      try {
        const userId = getLocalStorageItem('userId');
        const token = getLocalStorageItem('token');
        if (!userId || !token) return;
        const res = await fetch(`/api/wishlist/check?userId=${userId}&productId=${params.id}`, {
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
  }, [ params.id]);

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
      // ... other colors
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
      const userId = getLocalStorageItem('userId');
      const token = getLocalStorageItem('token');
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
      if (typeof window !== 'undefined' && window.confirm('Would you like to view your cart?')) {
        router.push('/cart');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add product to cart.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    try {
      setWishlistLoading(true);
      const userId = getLocalStorageItem('userId');
      const token = getLocalStorageItem('token');
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

  if (!product && !loading && !error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">Product not found</div>
        </div>
      </div>
    );
  }

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

  const recentReviews = getRecentReviews(product.ratings);
  const currentStock = getCurrentVariantStock();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto py-8 px-4">
        <motion.div
          className="bg-gradient-to-br from-gray-800/50 via-gray-900/80 to-black/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-700/30 overflow-hidden max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Product Images Section */}
            <div className="p-8 bg-gradient-to-br from-gray-800/40 via-gray-900/60 to-black/80">
              <motion.div
                className="bg-gradient-to-br from-gray-700/20 to-gray-800/40 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl mb-6 aspect-square relative border border-gray-600/20"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <Image
                  src={product?.images?.[selectedImageIndex]?.url || product.images?.[0]?.url || '/placeholder.jpg'}
                  alt={`${product.name} - View ${selectedImageIndex + 1}`}
                  fill={true}
                  className="object-cover hover:scale-105 transition-transform duration-700 absolute"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {product?.images?.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 backdrop-blur-md p-3 rounded-full shadow-xl transition-all duration-300 border border-gray-600/30"
                    >
                      <FaChevronLeft className="text-gray-200" />
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 backdrop-blur-md p-3 rounded-full shadow-xl transition-all duration-300 border border-gray-600/30"
                    >
                      <FaChevronRight className="text-gray-200" />
                    </button>
                  </>
                )}
                {product.images?.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-gray-200 px-4 py-2 rounded-full text-sm border border-gray-600/30">
                    {selectedImageIndex + 1} / {product.images.length}
                  </div>
                )}
              </motion.div>
              {product.images?.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${selectedImageIndex === index
                          ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-xl shadow-amber-400/20'
                          : 'border-gray-600/40 hover:border-gray-500/60 hover:shadow-lg'
                        }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Image
                        src={image.url}
                        alt={`${product.name} ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
            {/* Product Details Section */}
            <div className="p-8 lg:p-12 space-y-8">
              <motion.h1
                className="text-4xl lg:text-5xl font-bold text-transparent bg-gradient-to-r from-gray-100 via-white to-gray-300 bg-clip-text leading-tight"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {product.name}
              </motion.h1>
              <motion.div
                className="flex flex-wrap items-center gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2">
                  {renderStars(product.averageRating || 0)}
                  <span className="text-sm text-gray-400 ml-1">({product.averageRating?.toFixed(1) || '0.0'})</span>
                </div>
                <span className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm text-blue-300 px-4 py-2 rounded-full text-sm font-medium border border-blue-500/20">
                  {product.numReviews || 0} reviews
                </span>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border ${currentStock > 0
                      ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border-emerald-500/20'
                      : 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border-red-500/20'
                    }`}
                >
                  {currentStock > 0 ? `${currentStock} In Stock` : 'Out of Stock'}
                </span>
              </motion.div>
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-bold text-transparent bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 bg-clip-text">
                    ${getCurrentPrice().toFixed(2)}
                  </span>
                  {product.discountPercentage > 0 && (
                    <>
                      <span className="text-2xl text-gray-500 line-through">${product.price.toFixed(2)}</span>
                      <span className="bg-gradient-to-r from-red-500/30 to-pink-500/30 backdrop-blur-sm text-red-300 px-4 py-2 rounded-full text-sm font-bold border border-red-500/30">
                        -{product.discountPercentage}% OFF
                      </span>
                    </>
                  )}
                </div>
              </motion.div>
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-lg font-semibold text-gray-200">Description</h3>
                <p className="text-gray-300 text-lg leading-relaxed">{product.description || 'No description available'}</p>
              </motion.div>
              {product.colors && product.colors.length > 0 && (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-200">
                      Color: <span className="font-normal text-gray-400 capitalize">{selectedColor ? getColorInfo(selectedColor).name : 'Select a color'}</span>
                    </h3>
                    <span className="text-sm text-gray-500">{product.colors.length} colors available</span>
                  </div>
                  <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-3">
                    {product.colors.map((color, index) => {
                      const colorInfo = getColorInfo(color);
                      const isSelected = selectedColor === color;
                      const isAvailable = isVariantAvailable(color, selectedSize);
                      return (
                        <motion.button
                          key={index}
                          onClick={() => isAvailable && handleColorSelect(color)}
                          disabled={!isAvailable}
                          className={`group relative w-16 h-16 rounded-2xl border-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-900 ${!isAvailable
                              ? 'opacity-50 cursor-not-allowed border-gray-700'
                              : isSelected
                                ? 'border-amber-400 ring-4 ring-amber-400/30 shadow-xl shadow-amber-400/20 scale-110 hover:scale-110'
                                : 'border-gray-600 hover:border-gray-500 shadow-lg hover:shadow-xl hover:scale-110'
                            }`}
                          style={{
                            backgroundColor: colorInfo.hex,
                            borderColor: colorInfo.hex === '#ffffff' ? '#374151' : colorInfo.hex,
                          }}
                          title={isAvailable ? colorInfo.name : `${colorInfo.name} (Out of stock)`}
                          whileHover={isAvailable ? { scale: 1.1 } : {}}
                          whileTap={isAvailable ? { scale: 0.95 } : {}}
                        >
                          {isSelected && (
                            <motion.div
                              className="absolute inset-0 flex items-center justify-center"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <FaCheck
                                className={`text-xl ${colorInfo.hex === '#ffffff' || colorInfo.hex === '#f5f5dc' || colorInfo.hex === '#ffd700' ? 'text-gray-800' : 'text-white'} drop-shadow-lg`}
                              />
                            </motion.div>
                          )}
                          {!isAvailable && (
                            <div className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                              <span className="text-xs text-gray-400 font-medium">N/A</span>
                            </div>
                          )}
                          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-md text-gray-200 text-xs py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-gray-700/50 z-10">
                            {colorInfo.name}
                            {!isAvailable && ' (Out of stock)'}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
              {product.sizes && product.sizes.length > 0 && (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-200">
                      Size: <span className="font-normal text-gray-400">{selectedSize || 'Select a size'}</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-3">
                    {product.sizes.map((size, index) => {
                      const isSelected = selectedSize === size;
                      const isAvailable = isVariantAvailable(selectedColor, size);
                      return (
                        <motion.button
                          key={index}
                          onClick={() => isAvailable && handleSizeSelect(size)}
                          disabled={!isAvailable}
                          className={`group relative px-6 py-4 border-2 rounded-2xl font-bold text-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-900 min-w-[80px] backdrop-blur-sm ${!isAvailable
                              ? 'opacity-50 cursor-not-allowed border-gray-700 bg-gray-800/50 text-gray-500'
                              : isSelected
                                ? 'border-amber-400 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-200 shadow-xl shadow-amber-400/20 scale-105 hover:scale-105'
                                : 'border-gray-600 hover:border-gray-500 bg-gradient-to-r from-gray-700/30 to-gray-800/50 text-gray-300 shadow-md hover:shadow-lg hover:scale-105'
                            }`}
                          whileHover={isAvailable ? { scale: 1.05 } : {}}
                          whileTap={isAvailable ? { scale: 0.95 } : {}}
                        >
                          <span className="uppercase tracking-wide">{size}</span>
                          {!isAvailable && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800/70 rounded-2xl backdrop-blur-sm">
                              <span className="text-xs text-gray-500">N/A</span>
                            </div>
                          )}
                          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-md text-gray-200 text-xs py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-gray-700/50 z-10">
                            Size {size.toUpperCase()}
                            {!isAvailable && ' (Out of stock)'}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                  <button
                    className="text-sm text-amber-400 hover:text-amber-300 underline transition-colors"
                    onClick={() => toast.success('Size guide feature coming soon!')}
                  >
                    📏 Size Guide
                  </button>
                </motion.div>
              )}
              {isValidSelection() && currentStock <= 5 && currentStock > 0 && (
                <motion.div
                  className="p-4 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-sm border border-orange-500/30 rounded-2xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-orange-300">⚠️</span>
                    <span className="text-orange-200 font-medium">Only {currentStock} left in stock for this variant!</span>
                  </div>
                </motion.div>
              )}
              <motion.div
                className="space-y-3 border-t border-gray-700/50 pt-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                  <FaUndo className="text-emerald-400" />
                  30-Day Return Policy
                </h3>
                <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 backdrop-blur-sm p-4 rounded-2xl space-y-2 border border-emerald-500/20">
                  <p className="text-gray-300 leading-relaxed">
                    We offer a hassle-free 30-day return policy. If you&apos;re not completely satisfied with your purchase, you can return it within 30 days for a full refund.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                    <li>Item must be unused and in original packaging</li>
                    <li>Return shipping cost is the responsibility of the buyer</li>
                    <li>Refund will be processed within 5-7 business days after receiving the return</li>
                  </ul>
                </div>
              </motion.div>
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
              >
                <div className="flex items-center gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-200">Quantity:</label>
                    <div className="flex items-center border-2 border-gray-600/50 rounded-2xl overflow-hidden bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm shadow-lg">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="px-4 py-3 bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-gray-600/50 hover:to-gray-700/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaMinus className="text-sm text-gray-300" />
                      </button>
                      <span className="px-6 py-3 font-bold text-xl text-gray-200 min-w-[60px] text-center">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= currentStock}
                        className="px-4 py-3 bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-gray-600/50 hover:to-gray-700/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaPlus className="text-sm text-gray-300" />
                      </button>
                    </div>
                  </div>
                </div>
                {isValidSelection() && (
                  <motion.div
                    className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-2xl border border-blue-500/20"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h4 className="font-semibold text-blue-200 mb-2">Your Selection:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {selectedColor && (
                        <div className="flex items-center gap-2">
                          <span className="text-blue-300">Color:</span>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border border-blue-400/30"
                              style={{ backgroundColor: getColorInfo(selectedColor).hex }}
                            />
                            <span className="font-medium capitalize text-gray-300">{getColorInfo(selectedColor).name}</span>
                          </div>
                        </div>
                      )}
                      {selectedSize && (
                        <div className="flex items-center gap-2">
                          <span className="text-blue-300">Size:</span>
                          <span className="font-medium text-gray-300">{selectedSize.toUpperCase()}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-blue-300">Quantity:</span>
                        <span className="font-medium text-gray-300">{quantity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-300">Total:</span>
                        <span className="font-bold text-amber-300">${(getCurrentPrice() * quantity).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-300">Stock:</span>
                        <span className={`font-medium ${currentStock <= 5 ? 'text-orange-300' : 'text-emerald-300'}`}>
                          {currentStock} available
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div className="flex gap-4">
                  <motion.button
                    onClick={handleAddToCart}
                    className={`flex-1 py-4 px-8 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-xl backdrop-blur-sm ${!isValidSelection() || currentStock <= 0 || addingToCart
                        ? 'bg-gradient-to-r from-gray-600/50 to-gray-700/50 cursor-not-allowed text-gray-400 border border-gray-600/30'
                        : 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-500 hover:via-purple-500 hover:to-blue-600 text-white border border-blue-500/30 shadow-blue-500/20'
                      }`}
                    whileHover={isValidSelection() && currentStock > 0 && !addingToCart ? { scale: 1.02 } : {}}
                    whileTap={isValidSelection() && currentStock > 0 && !addingToCart ? { scale: 0.98 } : {}}
                    disabled={!isValidSelection() || currentStock <= 0 || addingToCart}
                  >
                    <FaShoppingCart className="text-xl" />
                    {addingToCart
                      ? 'Adding...'
                      : !isValidSelection()
                        ? 'Select Options'
                        : currentStock <= 0
                          ? 'Out of Stock'
                          : 'Add to Cart'}
                  </motion.button>
                  <motion.button
                    onClick={handleWishlist}
                    className={`p-4 rounded-2xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl backdrop-blur-sm ${isWishlisted
                        ? 'border-red-500/50 bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 hover:from-red-500/30 hover:to-pink-500/30'
                        : 'border-gray-600/50 hover:border-red-400/50 bg-gradient-to-r from-gray-700/30 to-gray-800/50 text-gray-400 hover:text-red-300'
                      }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={wishlistLoading}
                    title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    {wishlistLoading ? (
                      <div className="animate-spin w-6 h-6 border-2 border-current border-t-transparent rounded-full"></div>
                    ) : (
                      <FaHeart className="text-xl" />
                    )}
                  </motion.button>
                </div>
                {!isValidSelection() && (
                  <motion.div
                    className="p-4 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-2xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-300">💡</span>
                      <span className="text-yellow-200">
                        {!selectedColor && product.colors?.length > 0 && !selectedSize && product.sizes?.length > 0
                          ? 'Please select a color and size to continue'
                          : !selectedColor && product.colors?.length > 0
                            ? 'Please select a color to continue'
                            : !selectedSize && product.sizes?.length > 0
                              ? 'Please select a size to continue'
                              : 'Please make your selections to continue'}
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
              <motion.div
                className="space-y-4 border-t border-gray-700/50 pt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
              >
                <h3 className="text-lg font-semibold text-gray-200 mb-4">Delivery Information</h3>
                <div className="grid gap-4">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 backdrop-blur-sm rounded-2xl border border-emerald-500/20">
                    <div className="p-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-sm rounded-full border border-emerald-500/30">
                      <FaTruck className="text-2xl text-emerald-300" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-emerald-200">Free Delivery</h4>
                      <p className="text-sm text-emerald-300">Enter your postal code for Delivery Availability</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-2xl border border-blue-500/20">
                    <div className="p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-full border border-blue-500/30">
                      <FaUndo className="text-2xl text-blue-300" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-200">Return Delivery</h4>
                      <p className="text-sm text-blue-300">Free 30 Days Delivery Returns. Details</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div
                className="border-t border-gray-700/50 pt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                <h3 className="text-lg font-semibold text-gray-200 mb-4">Product Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-r from-gray-700/30 to-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-600/20">
                    <span className="text-sm text-gray-400 block">Category</span>
                    <span className="font-semibold text-gray-200 capitalize">{product.category}</span>
                  </div>
                  {product.subcategory && (
                    <div className="p-4 bg-gradient-to-r from-gray-700/30 to-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-600/20">
                      <span className="text-sm text-gray-400 block">Subcategory</span>
                      <span className="font-semibold text-gray-200 capitalize">{product.subcategory}</span>
                    </div>
                  )}
                  <div className="p-4 bg-gradient-to-r from-gray-700/30 to-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-600/20">
                    <span className="text-sm text-gray-400 block">Available Stock</span>
                    <span className="font-semibold text-gray-200">
                      {isValidSelection() ? `${currentStock} units (selected variant)` : `${product.stock} units (total)`}
                    </span>
                  </div>
                  {product.brand && (
                    <div className="p-4 bg-gradient-to-r from-gray-700/30 to-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-600/20">
                      <span className="text-sm text-gray-400 block">Brand</span>
                      <span className="font-semibold text-gray-200">{product.brand}</span>
                    </div>
                  )}
                  {isValidSelection() && (
                    <div className="p-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 backdrop-blur-sm rounded-2xl col-span-full border border-amber-500/20">
                      <span className="text-sm text-amber-300 block">Selected Variant</span>
                      <span className="font-semibold text-amber-200">
                        {selectedColor ? getColorInfo(selectedColor).name : ''}
                        {selectedColor && selectedSize ? ' - ' : ''}
                        {selectedSize ? `Size ${selectedSize.toUpperCase()}` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="bg-gradient-to-br from-gray-800/50 via-gray-900/80 to-black/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-700/30 overflow-hidden mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-gray-100 via-white to-gray-300 bg-clip-text">Customer Reviews</h2>
                <p className="text-gray-400 mt-1">
                  {product.numReviews > 0 ? `Showing ${Math.min(3, recentReviews.length)} of ${product.numReviews} reviews` : 'No reviews yet'}
                </p>
              </div>
              {product.numReviews > 0 && (
                <div className="flex items-center gap-4">
                  <Link
                    href={`/products/${product._id}/reviews`}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-500 hover:via-purple-500 hover:to-blue-600 text-white px-6 py-3 rounded-2xl transition-all font-medium shadow-lg border border-blue-500/30 backdrop-blur-sm"
                  >
                    <FaEye />
                    View All Reviews
                  </Link>
                </div>
              )}
            </div>
            {product.numReviews > 0 && (
              <div className="bg-gradient-to-r from-gray-700/30 to-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-600/20">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 bg-clip-text mb-2">
                      {product.averageRating?.toFixed(1) || '0.0'}
                    </div>
                    <div className="flex items-center justify-center mb-2">{renderStars(product.averageRating || 0)}</div>
                    <p className="text-sm text-gray-400">Based on {product.numReviews} reviews</p>
                  </div>
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = (product.ratings || []).filter((r) => r.rating === star).length;
                      const percentage = product.numReviews ? (count / product.numReviews) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center text-sm mb-2">
                          <span className="w-3 text-gray-400">{star}</span>
                          <span className="text-amber-400 mx-2">★</span>
                          <div className="flex-1 bg-gray-700/50 rounded-full h-2 mx-3">
                            <div
                              className="bg-gradient-to-r from-amber-400 to-yellow-400 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="w-8 text-gray-400 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            {recentReviews.length > 0 ? (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-200">Recent Reviews</h3>
                {recentReviews.map((review, index) => (
                  <motion.div
                    key={index}
                    className="bg-gradient-to-r from-gray-700/20 to-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: review.rating }, (_, i) => (
                            <Star key={i} fill="currentColor" stroke="none" className="h-5 w-5" />
                          ))}
                        </div>
                        <span className="font-medium text-gray-200">{review.user?.name || 'Verified Buyer'}</span>
                      </div>
                      <p className="text-sm text-gray-500">{formatDate(review.date)}</p>
                    </div>
                    {review.review && <p className="text-gray-300 leading-relaxed">&quot;{review.review}&quot;</p>}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-600 mb-4">
                  <Star className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-200 mb-2">No Reviews Yet</h3>
                <p className="text-gray-400 mb-6">Be the first to share your thoughts about this product!</p>
                <Link
                  href={`/products/${product._id}/reviews`}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-500 hover:via-purple-500 hover:to-blue-600 text-white px-6 py-3 rounded-2xl transition-all font-medium shadow-lg border border-blue-500/30 backdrop-blur-sm"
                >
                  Write First Review
                </Link>
              </div>
            )}
          </div>
        </motion.div>
        <div className="mt-16 border-t border-gray-700/50 pt-8">
          <h2 className="text-2xl font-bold mb-6 text-transparent bg-gradient-to-r from-gray-100 via-white to-gray-300 bg-clip-text">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.length <= 0 && (
              <div className="text-red-300 px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-sm border border-red-500/30 rounded-2xl">
                No related products found
              </div>
            )}
            {relatedProducts.map((relatedProduct) => (
              <Link href={`/products/${relatedProduct._id}`} key={relatedProduct._id} className="group">
                <div className="bg-gradient-to-br from-gray-800/50 via-gray-900/80 to-black/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/30 overflow-hidden transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-amber-400/10 group-hover:-translate-y-2 group-hover:border-amber-400/30">
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={relatedProduct.images[0]?.url || '/placeholder.jpg'}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-200 mb-2 truncate group-hover:text-white transition-colors">{relatedProduct.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-transparent bg-gradient-to-r from-amber-300 to-yellow-300 bg-clip-text">
                        ${relatedProduct.price.toFixed(2)}
                      </span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-amber-400 fill-current" />
                        <span className="ml-1 text-sm text-gray-400">{relatedProduct.averageRating?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;