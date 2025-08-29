import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

// POST - Add product to wishlist
export async function POST(req) {
  try {
    const { userId, productId } = await req.json();

    if (!userId || !productId) {
      return NextResponse.json({
        error: 'User ID and Product ID are required'
      }, { status: 400 });
    }

    await connectDB();

    // Find and verify the user exists
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({
        error: 'User not found or unauthorized'
      }, { status: 404 });
    }

    // Check if product is already in wishlist
    const isProductInWishlist = user.wishlist.some(
      item => item.toString() === productId
    );
    
    if (isProductInWishlist) {
      return NextResponse.json({
        success: true,
        message: 'Product already in wishlist',
        isWishlisted: true
      });
    }

    // Add product to wishlist
    user.wishlist.push(productId);
    user.updatedAt = new Date();
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Product added to wishlist successfully',
      isWishlisted: true,
      wishlistCount: user.wishlist.length
    });

  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({
      error: 'Failed to add to wishlist',
      details: error.message
    }, { status: 500 });
  }
}

// GET - Fetch user's wishlist
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

    // Find and verify the user exists
    const user = await User.findById(userId).populate({
      path: 'wishlist',
      select: 'name price images category stock averageRating numReviews'
    });
    
    if (!user) {
      return NextResponse.json({
        error: 'User not found or unauthorized'
      }, { status: 404 });
    }

     return NextResponse.json({
      success: true,
      wishlist: user.wishlist,
      wishlistCount: user.wishlist.length
    });

  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({
      error: 'Failed to fetch wishlist',
      details: error.message
    }, { status: 500 });
  }
}

// DELETE - Remove product from wishlist
export async function DELETE(req) {
  try {
    const { userId, productId } = await req.json();

    if (!userId || !productId) {
      return NextResponse.json({
        error: 'User ID and Product ID are required'
      }, { status: 400 });
    }

    await connectDB();

    // Find and verify the user exists
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({
        error: 'User not found or unauthorized'
      }, { status: 404 });
    }

    // Check if product exists in wishlist
    const productIndex = user.wishlist.findIndex(
      item => item.toString() === productId
    );

    if (productIndex === -1) {
      return NextResponse.json({
        success: true,
        message: 'Product not found in wishlist',
        isWishlisted: false
      });
    }

    // Remove product from wishlist
    user.wishlist.splice(productIndex, 1);
    user.updatedAt = new Date();
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Product removed from wishlist successfully',
      isWishlisted: false,
      wishlistCount: user.wishlist.length
    });

  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({
      error: 'Failed to remove from wishlist',
      details: error.message
    }, { status: 500 });
  }
}