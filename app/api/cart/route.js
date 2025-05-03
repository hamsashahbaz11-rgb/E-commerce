import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Cart from '@/models/Cart';
import Product from '@/models/Product';

export async function GET(req) {
  try {
    await connectDB();
    const userId = req.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart) {
      // Create a new cart if none exists
      cart = await Cart.create({
        user: userId,
        items: [],
        totalItems: 0,
        totalPrice: 0
      });
    }

    return NextResponse.json({ cart });
  } catch (error) {
    console.error('Error in cart GET:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { userId, productId, quantity = 1 } = await req.json();

    if (!userId || !productId) {
      return NextResponse.json(
        { error: 'User ID and Product ID are required' },
        { status: 400 }
      );
    }

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
        totalItems: 0,
        totalPrice: 0
      });
    }

    // Check if product already exists in cart
    const existingItem = cart.items.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      // Update quantity if product exists
      existingItem.quantity += quantity;
    } else {
      // Add new item if product doesn't exist
      cart.items.push({
        product: productId,
        quantity,
        price: product.price
      });
    }

    // Save cart and populate product details
    await cart.save();
    cart = await Cart.findById(cart._id).populate('items.product');

    return NextResponse.json({ cart });
  } catch (error) {
    console.error('Error in cart POST:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    await connectDB();
    const { userId, productId, quantity } = await req.json();

    if (!userId || !productId || !quantity) {
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