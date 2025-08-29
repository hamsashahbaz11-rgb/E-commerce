import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import mongoose from 'mongoose';
import { Car } from 'lucide-react';

export async function GET(req) {
  try { 
    const userId = req.nextUrl.searchParams.get('userId');

    if (!userId) {
      console.error('No user ID provided in request');
      return NextResponse.json(
        { 
          error: 'User ID is required',
          details: 'Please provide a valid user ID in the query parameters'
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Invalid user ID format:', userId);
      return NextResponse.json(
        { 
          error: 'Invalid user ID format',
          details: 'The provided user ID is not in a valid format'
        },
        { status: 400 }
      );
    }

    try {
      await connectDB(); 
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          details: process.env.NODE_ENV === 'development' ? dbError.message : 'Internal server error'
        },
        { status: 500 }
      );
    }
 
    let cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart) { 
      try {
        cart = await Cart.create({
          user: userId,
          items: [],
          totalItems: 0,
          totalPrice: 0
        }); 
      } catch (createError) {
        console.error('Failed to create new cart:', createError);
        return NextResponse.json(
          { 
            error: 'Failed to create cart',
            details: 'Unable to initialize a new shopping cart'
          },
          { status: 500 }
        );
      }
    }
 
    return NextResponse.json({ cart });
  } catch (error) {
    console.error('Error in cart GET:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch cart', 
        details: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while retrieving your cart',
        code: error.code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    );
  }
}


export async function POST(req) {
  try {
    await connectDB(); 
    const { userId, productId, quantity, price, selectedColor, selectedSize, originalPrice ,totalPrice} = await req.json();
     

    // Validate product exists and has the selected color and size
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Validate color selection
    if(product.colors && product.colors.length > 0 && !selectedColor) {
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
        originalPrice: originalPrice,
        totalPrice: finalPrice,
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
export async function PATCH(req) {
  try {
    await connectDB();
    const { userId, productId, quantity , totalPrice } = await req.json(); 

    if (
  userId == null || 
  productId == null || 
  quantity == null || 
  totalPrice == null
) {
   return NextResponse.json(
        { error: 'User ID, Product ID, and quantity are required' },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }
    cart.totalPrice = totalPrice.toFixed(2);

    const item = cart.items.find(
      item => item.product.toString() === productId
    );

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      );
    }

     
    item.quantity = quantity;

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    return NextResponse.json({ cart: updatedCart });
  } catch (error) {
    console.error('Error in cart PATCH:', error);
    return NextResponse.json(
      { error: 'Failed to update cart', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { userId, productId } = await req.json();

    if (!userId || !productId) {
      return NextResponse.json(
        { error: 'User ID and Product ID are required' },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate('items.product');

    return NextResponse.json({ cart: updatedCart });
  } catch (error) {
    console.error('Error in cart DELETE:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from cart', details: error.message },
      { status: 500 }
    );
  }
}