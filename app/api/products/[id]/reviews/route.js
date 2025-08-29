import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function POST(req, { params }) {
  try {
    await connectDB();
    
    const { id } = params; // Product ID
    const { userId, rating, review } = await req.json();

    if (!userId || !rating) {
      return NextResponse.json(
        { error: 'User ID and rating are required' },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user has already reviewed this product
    const existingReview = product.ratings.find(
      r => r.user.toString() === userId
    );

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.review = review;
      existingReview.date = Date.now();
    } else {
      // Add new review
      product.ratings.push({
        user: userId,
        rating,
        review,
        date: Date.now()
      });
    }

    await product.save(); // This will trigger the pre-save hook to update averageRating

    return NextResponse.json({
      success: true,
      message: 'Review added successfully',
      averageRating: product.averageRating,
      numReviews: product.numReviews
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add review', details: error.message },
      { status: 500 }
    );
  }
}