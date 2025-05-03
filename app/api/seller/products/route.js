import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import Product from '../../../../models/Product';
import User from '../../../../models/User';

// GET handler - Get all products for a seller
export async function GET(req) {
  try {
    console.log('GET /api/seller/products - Start');
    
    try {
      await connectDB();
      console.log('Database connected successfully');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    // Get sellerId from the URL search params
    const url = new URL(req.url);
    const sellerId = url.searchParams.get('sellerId');
    console.log('Seller ID from query:', sellerId);
    
    if (!sellerId) {
      console.log('No seller ID provided');
      return NextResponse.json(
        { error: 'Seller ID is required' },
        { status: 400 }
      );
    }

    // Verify seller exists
    let seller;
    try {
      seller = await User.findById(sellerId);
      console.log('Seller found:', seller ? 'yes' : 'no');
    } catch (userError) {
      console.error('Error finding user:', userError);
      return NextResponse.json(
        { error: 'Error finding user' },
        { status: 500 }
      );
    }
    
    if (!seller) {
      console.log('Seller not found');
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }
    
    if (!seller.isSeller) {
      console.log('User is not a seller');
      return NextResponse.json(
        { error: 'User is not a seller' },
        { status: 403 }
      );
    }

    // Get all products for this seller
    let products;
    try {
      products = await Product.find({ seller: sellerId })
        .sort({ createdAt: -1 }) // Newest first
        .select('name price description stock images category subcategory brand averageRating numReviews sold');
      
      console.log('Products found:', products.length);
    } catch (productError) {
      console.error('Error finding products:', productError);
      return NextResponse.json(
        { error: 'Error finding products' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        count: products.length,
        products 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/seller/products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error.message },
      { status: 500 }
    );
  }
}

// POST handler - Add a new product
export async function POST(req) {
  try {
    console.log('POST /api/seller/products - Start');
    await connectDB();
    
    const productData = await req.json();
    console.log('Product data received:', productData);
    
    // Validate required fields
    const requiredFields = [
      'name', 'description', 'price', 'category', 
      'subcategory', 'images', 'brand', 'stock', 'seller'
    ];
    
    for (const field of requiredFields) {
      if (!productData[field]) {
        console.log('Missing required field:', field);
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Verify seller exists
    const seller = await User.findById(productData.seller);
    console.log('Seller found:', seller ? 'yes' : 'no');
    
    if (!seller || !seller.isSeller) {
      console.log('Seller not found or not a seller');
      return NextResponse.json(
        { error: 'Seller not found or user is not a seller' },
        { status: 404 }
      );
    }
    
    // Create the product
    const newProduct = await Product.create(productData);
    console.log('New product created:', newProduct._id);
    
    return NextResponse.json(
      {
        success: true,
        message: 'Product created successfully',
        product: newProduct
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/seller/products:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
} 