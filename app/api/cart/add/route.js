import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Cart from '@/models/Cart';

export async function POST(req) {
  try {
    await connectDB();
    
    
    const { userId, productId, quantity, price } = await req.json();

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
        totalItems: 0,
        totalPrice: 0
      });
      console.log(cart)
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item   
      cart.items.push({
        product: productId,
        quantity,
        price
      });
    }

    // Update cart totals (this will trigger the pre-save hook)
    await cart.save();

    return NextResponse.json({ cart });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Error adding to cart' },
      { status: 500 }
    );
  }
} 