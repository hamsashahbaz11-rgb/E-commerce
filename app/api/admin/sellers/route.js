import { NextResponse } from 'next/server';
import User from '@/models/User';
import Product from '@/models/Product';
import connectDB from '@/lib/db';

export async function GET(request) {
  try {
    await connectDB();
    const sellers = await User.find({ role: 'seller' }).select('-password');
    
    // Get products for each seller
    const sellersWithProducts = await Promise.all(
      sellers.map(async (seller) => {
        const products = await Product.find({ seller: seller._id });
        const sellerObj = seller.toObject();
        return {
          ...sellerObj,
          products
        };
      })
    );

    return NextResponse.json({ sellers: sellersWithProducts });
  } catch (error) {
    console.error('Error fetching sellers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sellers' },
      { status: 500 }
    );
  }
}