import { NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import User from '../../../models/User';

export async function POST(req) {
  try {
    const { userId, productId } = await req.json();
    
    if (!userId || !productId) {
      return NextResponse.json({ 
        error: 'User ID and Product ID are required' 
      }, { status: 400 });
    }

    await connectDB();

    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Check if product is already in wishlist
    const isProductInWishlist = user.wishlist.includes(productId);
    
    if (isProductInWishlist) {
      return NextResponse.json({ 
        success: true, 
        message: 'Product already in wishlist',
        user
      });
    }

    // Add product to wishlist
    user.wishlist.push(productId);
    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Product added to wishlist successfully',
      user
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ 
      error: 'Failed to add to wishlist',
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    await connectDB();

    // Find the user and populate wishlist with product details
    const user = await User.findById(userId).populate('wishlist');
    
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      wishlist: user.wishlist
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch wishlist',
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const productId = url.searchParams.get('productId');
    
    if (!userId || !productId) {
      return NextResponse.json({ 
        error: 'User ID and Product ID are required' 
      }, { status: 400 });
    }

    await connectDB();

    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Remove product from wishlist
    user.wishlist = user.wishlist.filter(
      item => item.toString() !== productId
    );
    
    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Product removed from wishlist successfully',
      user
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ 
      error: 'Failed to remove from wishlist',
      details: error.message 
    }, { status: 500 });
  }
} 