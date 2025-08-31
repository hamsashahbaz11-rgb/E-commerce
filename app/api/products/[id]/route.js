import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import mongoose from 'mongoose';

export async function GET(req, { params }) {
  try {
    const { id } = await params.id; 

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    await connectDB(); // ✅ ensure cached properly in db.js

    const product = await Product.findById(id).lean(); // ✅ safer for JSON

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error in product fetch:', error);
    return NextResponse.json(
      { error: 'Error fetching product', details: error.message },
      { status: 500 }
    );
  }
}
