"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaTrash, FaPlus, FaMinus, FaTag } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { showToast } from "@/app/utils/toast";
import Image from "next/image";
import Link from "next/link";

const Cart = () => {
  const router = useRouter();
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalPrice: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountedPrice, setDiscountedPrice] = useState(0);

  // Calculate discounted price for a product
  const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
    if (!discountPercentage || discountPercentage <= 0) return originalPrice;
    return originalPrice * (1 - discountPercentage / 100);
  };

  // Calculate total savings for an item
  const calculateItemSavings = (originalPrice, discountedPrice, quantity) => {
    return (originalPrice - discountedPrice) * quantity;
  };

  // Calculate cart totals with discounts applied
  const calculateCartTotals = (items) => {
    let totalItems = 0;
    let subtotalBeforeDiscount = 0;
    let totalPrice = 0;
    let totalSavings = 0;

    items.forEach(item => {
      const originalPrice = item.originalPrice || item.product.price;
      const discountedPrice = calculateDiscountedPrice(originalPrice, item.product.discountPercentage);
      const itemTotal = discountedPrice * item.quantity;
      const itemSavings = calculateItemSavings(originalPrice, discountedPrice, item.quantity);

      totalItems += item.quantity;
      subtotalBeforeDiscount += originalPrice * item.quantity;
      totalPrice += itemTotal;
      totalSavings += itemSavings;
    });

    return {
      totalItems,
      subtotalBeforeDiscount,
      totalPrice,
      totalSavings
    };
  };

  // Fetch cart
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          setError("Please login to view your cart");
          setLoading(false);
          return;
        }

        setLoading(true);
        const res = await fetch(`/api/cart?userId=${userId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.details || data.error || "Failed to fetch cart data"
          );
        }

        // Process cart items to ensure proper pricing
        const processedCart = data.cart || { items: [], totalItems: 0, totalPrice: 0 };
        if (processedCart.items) {
          processedCart.items = processedCart.items.map(item => ({
            ...item,
            originalPrice: item.originalPrice || item.product.price,
            discountedPrice: calculateDiscountedPrice(
              item.originalPrice || item.product.price,
              item.product.discountPercentage
            )
          }));

          // Recalculate totals
          const totals = calculateCartTotals(processedCart.items);
          processedCart.totalItems = totals.totalItems;
          processedCart.totalPrice = totals.totalPrice;
          processedCart.subtotalBeforeDiscount = totals.subtotalBeforeDiscount;
          processedCart.totalSavings = totals.totalSavings;
        }

        setCart(processedCart);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching cart:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  // Remove item
  const handleRemove = async (productId) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return toast.error("Please login to modify your cart");

      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove item");

      // Process the updated cart
      const processedCart = data.cart;
      if (processedCart.items) {
        processedCart.items = processedCart.items.map(item => ({
          ...item,
          originalPrice: item.originalPrice || item.product.price,
          discountedPrice: calculateDiscountedPrice(
            item.originalPrice || item.product.price,
            item.product.discountPercentage
          )
        }));

        const totals = calculateCartTotals(processedCart.items);
        processedCart.totalItems = totals.totalItems;
        processedCart.totalPrice = totals.totalPrice;
        processedCart.subtotalBeforeDiscount = totals.subtotalBeforeDiscount;
        processedCart.totalSavings = totals.totalSavings;
      }

      setCart(processedCart);
      toast.success("Item removed from cart");

      // Reset coupon if cart is empty
      if (processedCart.items.length === 0) {
        setAppliedCoupon(null);
        setDiscountedPrice(0);
        setCouponCode("");
      }
    } catch (err) {
      console.error("Error removing item:", err);
      toast.error(err.message);
    }
  };

  // Update quantity with automatic discount application
  const handleQuantityChange = async(productId, newQuantity = 1, newTotalPrice = null) => {
     if (newQuantity < 1) return;

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return showToast.error("Please login to modify your cart");

      // Optimistically update the UI first
      const updatedCart = { ...cart };
      const itemIndex = updatedCart.items.findIndex(item => item.product._id === productId);

      if (itemIndex !== -1) {
        const item = updatedCart.items[itemIndex];
        const originalPrice = item.originalPrice || item.product.price;
        const discountedPrice = calculateDiscountedPrice(originalPrice, item.product.discountPercentage);

        // Update the item 
        updatedCart.items[itemIndex] = {
          ...item,
          quantity: newQuantity,
          originalPrice,
          discountedPrice,
          price: discountedPrice // Update the price field to reflect discount
        };

        // Recalculate totals
        const totals = calculateCartTotals(updatedCart.items);
        updatedCart.totalItems = totals.totalItems;
        updatedCart.totalPrice = totals.totalPrice;
        updatedCart.subtotalBeforeDiscount = totals.subtotalBeforeDiscount;
        updatedCart.totalSavings = totals.totalSavings;

        setCart(updatedCart);
      }

      // Make the server call
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          productId,
          quantity: newQuantity,
          totalPrice: newTotalPrice || cart.totalPrice, // Use providedTotal if available, else fallback to cart.totalPrice
          applyDiscount: true // Signal server to apply current discount
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        // Revert optimistic update on error
        throw new Error(data.error || "Failed to update quantity");
      }

      // Process the server response
      const processedCart = data.cart;
      if (processedCart.items) {
        processedCart.items = processedCart.items.map(item => ({
          ...item,
          originalPrice: item.originalPrice || item.product.price,
          discountedPrice: calculateDiscountedPrice(
            item.originalPrice || item.product.price,
            item.product.discountPercentage
          )
        }));

        const totals = calculateCartTotals(processedCart.items);
        processedCart.totalItems = totals.totalItems;
        processedCart.totalPrice = totals.totalPrice;
        processedCart.subtotalBeforeDiscount = totals.subtotalBeforeDiscount;
        processedCart.totalSavings = totals.totalSavings;
      }

      setCart(processedCart);


      // Show success message with discount info
      const updatedItem = processedCart.items.find(item => item.product._id === productId);
      if (updatedItem && updatedItem.product.discountPercentage > 0) {
        showToast.success(`Cart updated! ${updatedItem.product.discountPercentage}% discount applied! 🏷️`);
      } else {
        showToast.success("Cart updated successfully! 🛒");
      }


      // Reapply coupon if it was applied
      if (appliedCoupon) {
        applyExistingCoupon(processedCart.totalPrice);
      } 

    } catch (err) {
      console.error("Error updating quantity:", err);
      showToast.error(err.message);

      // Refresh cart from server on error
      const userId = localStorage.getItem("userId");
      if (userId) {
        const res = await fetch(`/api/cart?userId=${userId}`);
        const data = await res.json();
        if (res.ok) {
          setCart(data.cart || { items: [], totalItems: 0, totalPrice: 0 });
        }
      }
    }
  };

  // Helper function to reapply existing coupon
  const applyExistingCoupon = (newSubtotal) => {
    if (!appliedCoupon) return;

    let discount = 0;
    if (appliedCoupon.discountType === 'percentage') {
      discount = (newSubtotal * appliedCoupon.discountAmount) / 100;
    } else {
      discount = appliedCoupon.discountAmount;
    }

    setDiscountedPrice(newSubtotal - discount);
  };

  // Add item
  const handleAddToCart = async (product) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return toast.error("Please login to add items to cart");

      // Calculate prices
      const originalPrice = product.price;
      const finalPrice = calculateDiscountedPrice(originalPrice, product.discountPercentage);
      const price = finalPrice; // same as discounted price for current quantity = 1

      // These can come from your product details page selection
      const selectedColor = product.selectedColor || null;
      const selectedSize = product.selectedSize || null;

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          productId: product._id,
          quantity: 1,
          price,
          originalPrice,
          finalPrice: finalPrice, // Corrected to send finalPrice
          selectedColor,
          selectedSize,
          applyDiscount: true
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add item to cart");

      // Process the updated cart
      const processedCart = data.cart;
      if (processedCart.items) {
        processedCart.items = processedCart.items.map(item => ({
          ...item,
          originalPrice: item.originalPrice || item.product.price,
          discountedPrice: calculateDiscountedPrice(
            item.originalPrice || item.product.price,
            item.product.discountPercentage
          )
        }));

        const totals = calculateCartTotals(processedCart.items);
        processedCart.totalItems = totals.totalItems;
        processedCart.totalPrice = totals.totalPrice;
        processedCart.subtotalBeforeDiscount = totals.subtotalBeforeDiscount;
        processedCart.totalSavings = totals.totalSavings;
      }

      setCart(processedCart);
      toast.success("Item added to cart with current discount applied!");
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error(err.message);
    }
  };

  // Apply coupon
  const handleApplyCoupon = async () => {
    try {
      if (!couponCode) {
        toast.error('Please enter a coupon code');
        return;
      }

      const res = await fetch(`/api/coupons?code=${couponCode}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to validate coupon');
      }

      const coupon = data.coupon;

      // Check minimum purchase requirement
      if (cart.totalPrice < coupon.minimumPurchase) {
        throw new Error(`Minimum purchase amount of $${coupon.minimumPurchase} required`);
      }

      // Calculate discount
      let discount = 0;
      if (coupon.discountType === 'percentage') {
        discount = (cart.totalPrice * coupon.discountAmount) / 100;
      } else {
        discount = coupon.discountAmount;
      }

      const newTotalPrice = cart.totalPrice - discount - coupon.discountAmount;
     

      setAppliedCoupon(coupon);
      setDiscountedPrice(newTotalPrice);

      // Update DB for each cart item with the new total price
      cart.items.forEach(item => {
        handleQuantityChange(item.product._id, item.quantity, newTotalPrice);
      });

      toast.success('Coupon applied successfully!');
    } catch (err) {
      console.error('Error applying coupon:', err);
      toast.error(err.message);
    }
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountedPrice(0);
    setCouponCode("");
    toast.success("Coupon removed");
  };

  // Checkout
  const handleProceeding = () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return toast.error("Please login to proceed to checkout");
    if (cart.items.length === 0) return toast.error("Your cart is empty");

    const finalPrice = appliedCoupon ? discountedPrice : cart.totalPrice;
    // Add navigation or checkout logic here
  };

  // Loading UI
  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  const finalTotal = appliedCoupon ? discountedPrice : cart.totalPrice;
 
   return (
    <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl text-white bg-black min-h-screen">
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Your Shopping Cart</h1>
        {cart.totalSavings > 0 && (
          <div className="bg-gray-800 text-green-400 px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 border border-green-600 text-sm sm:text-base">
            <FaTag className="text-green-400" />
            <span className="font-semibold">
              You&apos;re saving ${cart.totalSavings.toFixed(2)}!
            </span>
          </div>
        )}
      </motion.div>

      {/* Empty Cart */}
      {cart.items.length === 0 ? (
        <motion.div
          className="bg-gray-900 p-8 rounded-lg text-center border border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl mb-4 text-gray-300">Your cart is empty</h2>
          <motion.a
            href="/products"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500 transition duration-300 inline-block"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Continue Shopping
          </motion.a>
        </motion.div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            {cart.items.map((item, index) => {
              const originalPrice = item.originalPrice || item.product.price;
              const discountedPrice = calculateDiscountedPrice(originalPrice, item.product.discountPercentage);
              const hasDiscount = item.product.discountPercentage > 0;
              const itemSavings = calculateItemSavings(originalPrice, discountedPrice, item.quantity);

              return (
                <motion.div
                  key={item.product._id}
                  className="bg-gray-900 p-4 rounded-lg border border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div                   className="flex flex-col lg:flex-row items-start lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center mb-4 lg:mb-0 flex-1 w-full lg:w-auto">
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded mr-3 sm:mr-4 border border-gray-600"
                      />

                      <div className="flex-1">
                        <h2 className="text-base sm:text-lg font-bold text-white">{item.product.name}</h2>

                        {/* Pricing Display */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          {hasDiscount ? (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500 line-through text-sm">
                                  ${originalPrice.toFixed(2)}
                                </span>
                                <span className="text-green-400 font-semibold">
                                  ${discountedPrice.toFixed(2)}
                                </span>
                                <span className="bg-red-900 text-red-300 px-2 py-1 rounded-full text-xs font-bold border border-red-700">
                                  -{item.product.discountPercentage}% OFF
                                </span>
                              </div>
                              <div className="text-xs text-green-400">
                                Save ${itemSavings.toFixed(2)} on this item
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-300 font-semibold">
                              ${originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Color and Size Display */}
                        <div className="flex gap-4 mt-2 text-sm text-gray-400">
                          {item.selectedColor && (
                            <span>Color: <strong className="capitalize text-gray-300">{item.selectedColor}</strong></span>
                          )}
                          {item.selectedSize && (
                            <span>Size: <strong className="uppercase text-gray-300">{item.selectedSize}</strong></span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-600 rounded overflow-hidden bg-gray-800">
                        <motion.button
                          onClick={() =>
                            handleQuantityChange(item.product._id, item.quantity - 1)
                          }
                          className="bg-gray-700 px-3 py-2 hover:bg-gray-600 transition-colors text-white"
                          whileTap={{ scale: 0.9 }}
                          disabled={item.quantity <= 1}
                        >
                          <FaMinus />
                        </motion.button>
                        <span className="px-3 sm:px-4 py-2 min-w-[40px] sm:min-w-[50px] text-center font-semibold text-white text-sm sm:text-base">
                          {item.quantity}
                        </span>
                        <motion.button
                          onClick={() =>
                            handleQuantityChange(item.product._id, item.quantity + 1)
                          }
                          className="bg-gray-700 px-3 py-2 hover:bg-gray-600 transition-colors text-white"
                          whileTap={{ scale: 0.9 }}
                        >
                          <FaPlus />
                        </motion.button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right min-w-[80px] sm:min-w-[100px]">
                        <div className="font-bold text-lg text-white">
                          ${(discountedPrice * item.quantity).toFixed(2)}
                        </div>
                        {hasDiscount && (
                          <div className="text-xs text-gray-500 line-through">
                            ${(originalPrice * item.quantity).toFixed(2)}
                          </div>
                        )}
                      </div>

                      {/* Remove Button */}
                      <motion.button
                        onClick={() => handleRemove(item.product._id)}
                        className="text-red-400 hover:text-red-300 p-2"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Remove item"
                      >
                        <FaTrash />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Cart Summary */}
          <motion.div
            className="bg-gray-900 p-6 rounded-lg border border-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-4 text-white">Order Summary</h3>

            <div className="space-y-2">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal ({cart.totalItems} items):</span>
                <span>${cart.subtotalBeforeDiscount?.toFixed(2) || cart.totalPrice.toFixed(2)}</span>
              </div>

              {cart.totalSavings > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Product Discounts:</span>
                  <span>-${cart.totalSavings.toFixed(2)}</span>
                </div>
              )}

              {appliedCoupon && (
                <div className="flex justify-between text-green-400">
                  <span>Coupon Discount ({appliedCoupon.discountType === 'percentage' ?
                    `${appliedCoupon.discountAmount}%` :
                    '$' + appliedCoupon.discountAmount
                  }):</span>
                  <span>-${(cart.totalPrice - discountedPrice).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-300">
                <span>Shipping:</span>
                <span className="text-green-400 font-semibold">Free</span>
              </div>

              <div className="border-t border-gray-700 pt-2 mt-2">
                <div className="flex justify-between font-bold text-xl text-white">
                  <span>Total:</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
                {(cart.totalSavings > 0 || appliedCoupon) && (
                  <div className="text-sm text-green-400 text-right">
                    Total saved: ${((cart.subtotalBeforeDiscount || cart.totalPrice) - finalTotal + (appliedCoupon ? (cart.totalPrice - discountedPrice) : 0)).toFixed(2)}
                  </div>
                )}
              </div>
            </div>

                <Link href={"/Checkout"} prefetch={true}>
            <motion.button
              className="w-full bg-blue-600 text-white py-3 rounded-lg mt-6 hover:bg-blue-500 transition duration-300 font-semibold text-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleProceeding}
            >
              Proceed to Checkout
            </motion.button>
              </Link>
          </motion.div>

          {/* Coupon Section */}
          <motion.div
            className="mt-6 bg-gray-900 p-6 rounded-lg border border-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
              <FaTag className="text-blue-400" />
              Have a Coupon Code?
            </h3>

            <div className="flex items-center gap-4 mb-4">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className="px-4 py-2 border border-gray-600 bg-gray-800 text-white rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-500"
                disabled={appliedCoupon}
              />
              {!appliedCoupon ? (
                <button
                  onClick={handleApplyCoupon}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-500 transition duration-300 font-semibold"
                >
                  Apply
                </button>
              ) : (
                <button
                  onClick={handleRemoveCoupon}
                  className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-500 transition duration-300 font-semibold"
                >
                  Remove
                </button>
              )}
            </div>

            {appliedCoupon && (
              <div className="bg-gray-800 border border-green-600 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-400">
                  <FaTag className="text-green-400" />
                  <span className="font-semibold">
                    Coupon &apos;{appliedCoupon.code}&apos; applied successfully!
                  </span>
                </div>
                <div className="text-sm text-green-400 mt-1">
                  {appliedCoupon.discountType === 'percentage'
                    ? `${appliedCoupon.discountAmount}% discount`
                    : `$${appliedCoupon.discountAmount} off`
                  }
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
   
  );
};

export default Cart;