import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';


export async function GET(req) {
  try {
    console.log('GET /api/products - Start');
    
    // Connect to database
    try {
      await connectDB();
      console.log('Database connected successfully');
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
    const limit = parseInt(url.searchParams.get('limit') || '200');
    const page = parseInt(url.searchParams.get('page') || '1');
    const sort = url.searchParams.get('sort') || '-createdAt';
    
    console.log('Query params:', { category, limit, page, sort });
    console.log("this is ")
    
    // Build query
    const query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Count total products for pagination
    const total = await Product.countDocuments(query);
    console.log(`Total products found: ${total}`);

    // // If no products exist, create a test product
    // if (total === 0) {
    //   console.log('No products found. Creating test product...');
    //   try {
    //     const testProduct = await Product.create({
    //       name: 'Test Product',
    //       price: 99.99,
    //       description: 'This is a test product',
    //       images: ["/men2.jpeg"],
    //       category: 'men',
    //       subcategory: 'clothing',
    //       brand: 'Test Brand',
    //       stock: 10,
    //       averageRating: 4.5,
    //       numReviews: 10,
    //       seller: '65f2d8b9c4f8a3e2d1c0b9a8',
    //       sizes: ['S', 'M', 'L', 'XL'],
    //       colors: ['Black', 'White'],
    //       featured: false
    //     });
    //     console.log('Test product created:', testProduct);
    //   } catch (createError) {
    //     console.error('Error creating test product:', createError);
    //     console.error('Error details:', JSON.stringify(createError, null, 2));
    //   }
    // }
    
    // Fetch products with all fields and ensure _id is included
    const products = await Product.find(query)
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit)
      .lean(); // Convert to plain JavaScript objects
    
    console.log(`Found ${products.length} products`);
    if (products.length > 0) {
      // Log the first product's ID to verify it exists
      console.log('First product ID:', products[0]._id);
      console.log('Sample product:', JSON.stringify(products[0], null, 2));
    }
    
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