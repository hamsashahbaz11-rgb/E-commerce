import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';


export async function GET(req) {
  try { 

    // Connect to database
    try {
      await connectDB(); 
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed', details: dbError.message },
        { status: 500 }
      );
    }

    // Get query parameters
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const subcategory = url.searchParams.get('subcategory');
    const limit = parseInt(url.searchParams.get('limit') || '200');
    const page = parseInt(url.searchParams.get('page') || '1');
    const sort = url.searchParams.get('sort') || '-createdAt';
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const hasDiscount = url.searchParams.get('hasDiscount');
    const inStock = url.searchParams.get('inStock');
    const minRating = url.searchParams.get('minRating');

     
    // Build query
    const query = {};
    if (category && category !== 'all' || (subcategory && subcategory !== 'all')) {
      query.category = category;
      query.subcategory = subcategory;
    }

    // Add price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Add discount filter
    if (hasDiscount === 'true') {
      query.discountPercentage = { $gt: 0 };
    }

    // Add stock filter
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    } else if (inStock === 'false') {
      query.stock = 0;
    }

    // Add rating filter
    if (minRating) {
      query.averageRating = { $gte: parseFloat(minRating) };
    }

    // Count total products for pagination
    const total = await Product.countDocuments(query); 


    // Fetch products with all fields and ensure _id is included
    const products = await Product.find(query)
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit)
      .lean(); // Convert to plain JavaScript objects

     

    // Ensure each product has an _id
    const productsWithIds = products.map(product => ({
      ...product,
      _id: product._id.toString() // Convert ObjectId to string
    }));

    return NextResponse.json({
      success: true,
      count: productsWithIds.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      products: productsWithIds
    });
  } catch (error) {
    console.error('Error in products API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error.message },
      { status: 500 }
    );
  }
}