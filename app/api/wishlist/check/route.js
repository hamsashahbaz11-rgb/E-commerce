import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

// Helper function to verify JWT token
const verifyToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No valid authorization token provided');
  }
  
  const token = authHeader.split(' ')[1];
  return jwt.verify(token, process.env.JWT_SECRET);
};

// GET - Check if product is in user's wishlist
export async function GET(req) {
  try {
    const url = new URL(req.url); 
    const userId = url.searchParams.get('userId');
    const productId = url.searchParams.get('productId');
    const authHeader = req.headers.get('authorization');

    // Verify token
    try {
      const decoded = verifyToken(authHeader);
      if (decoded.userId !== userId) {
        return NextResponse.json({
          error: 'Unauthorized: User ID mismatch'
        }, { status: 401 });
      }
    } catch (tokenError) {
      return NextResponse.json({
        error: 'Invalid or expired token'
      }, { status: 401 });
    }

    if (!userId || !productId) {
      return NextResponse.json({
        error: 'User ID and Product ID are required'
      }, { status: 400 });
    }

    await connectDB();

    // Find the user
    const user = await User.findById(userId).select('wishlist');
    
    if (!user) {
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 });
    }

    // Check if product is in wishlist
    const isWishlisted = user.wishlist.some(
      item => item.toString() === productId
    );

    return NextResponse.json({
      success: true,
      isWishlisted,
      // wishlistCount: user.wishlist.length
    });

  } catch (error) {
    console.error('Error checking wishlist status:', error);
    return NextResponse.json({
      error: 'Failed to check wishlist status',
      details: error.message
    }, { status: 500 });
  }
}