import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req) {
  try {
    await connectDB();
    
    const { userId, shopName, description } = await req.json();

    // Validate input
    if (!userId || !shopName || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is already a seller
    if (user.isSeller) {
      return NextResponse.json(
        { error: 'User is already a seller' },
        { status: 400 }
      );
    }

    // Update user to become a seller
    user.isSeller = true;
    user.sellerInfo = {
      shopName,
      description,
      approved: false,
      createdAt: new Date(),
      products: [],
      ratings: [],
      averageRating: 0
    };

    await user.save();

    return NextResponse.json({
      message: 'Seller registration successful',
      seller: {
        id: user._id,
        shopName: user.sellerInfo.shopName,
        description: user.sellerInfo.description,
        approved: user.sellerInfo.approved
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Seller registration error:', error);
    return NextResponse.json(
      { error: 'Error registering seller' },
      { status: 500 }
    );
  }
}