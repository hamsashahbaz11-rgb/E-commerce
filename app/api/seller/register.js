import connectDB from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    await connectDB();

    const { userId, shopName, description } = await req.json();

    // Input validation
    if (!userId || !shopName || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (shopName.length < 3) {
      return NextResponse.json(
        { error: 'Shop name must be at least 3 characters long' },
        { status: 400 }
      );
    }

    if (description.length < 10) {
      return NextResponse.json(
        { error: 'Description must be at least 10 characters long' },
        { status: 400 }
      );
    }

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
        { error: 'User is already registered as a seller' },
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
      success: true,
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
      { error: 'Failed to register seller. Please try again.' },
      { status: 500 }
    );
  }
} 