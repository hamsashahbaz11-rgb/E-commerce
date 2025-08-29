import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Cart from '@/models/Cart';
import Product from '@/models/Product';

export async function POST(req) {
  try {
    await connectDB();
  

    const { userId, productId, quantity, price, selectedColor, selectedSize, originalPrice } = await req.json();
    

    // Validate product exists and has the selected color and size
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Validate color selection
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      return NextResponse.json({ error: 'Please select a color' }, { status: 400 });
    }

    // Validate size selection
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      return NextResponse.json({ error: 'Please select a size' }, { status: 400 });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
        totalItems: 0,
        totalPrice: 0
      });
    }

    // Check if product with same color and size already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId &&
        item.color === selectedColor &&
        item.size === selectedSize
    );

    if (existingItemIndex > -1) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item with color and size
      cart.items.push({
        product: productId,
        quantity,
        price,
        originalPrice,
        color: selectedColor,
        size: selectedSize
      });
    }

    // Update cart totals (this will trigger the pre-save hook)
    await cart.save();

    // Populate product details before returning
    cart = await Cart.findById(cart._id).populate('items.product');

    return NextResponse.json({ cart });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Error adding to cart' },
      { status: 500 }
    );
  }
}