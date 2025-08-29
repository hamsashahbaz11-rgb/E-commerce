import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req) {
  try {
    await connectDB();
    const { userId, shopName, description, businessType, productsToSell } = await req.json();
    if (!userId || !shopName || !description |!businessType || !productsToSell) {
      
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    user.role = 'seller';
    user.isSeller = true;
    user.sellerInfo = {
      ...user.sellerInfo,
      shopName,
      description,
      businessType,
      productsToSell,
      approved: false,
      createdAt: new Date(),
    };
    await user.save();
    return NextResponse.json({ success: true, message: 'Seller application submitted', user });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}