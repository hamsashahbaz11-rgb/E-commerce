import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import mongoose from 'mongoose'; 

export async function GET(req, { params }) {
  try {
    console.log('GET /api/products/[id] - Start with params:', params);
    
    
    // const productId = params._id;
    const {id} = params;
    const productId = id;

    
    if (!productId) {
      console.error('No product ID provided');
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    console.log('Product ID:', productId);

    // Validate if the ID is a valid MongoDB ObjectId
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)){
      console.error('Invalid product ID format:', productId);
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }
    
    await connectDB();
    console.log('Database connected, attempting to find product');

    const product = await Product.findOne({ _id: new mongoose.Types.ObjectId(productId) });
 
    console.log('Product found:', product ? 'yes' : 'no');

    if (!product) {
      console.log('Product not found with ID:', productId);
      return NextResponse.json(
        { error: `Product not found with ID: ${productId}` },
        { status: 404 }
      );
    }

    // Ensure the product has an _id
    if (!product._id) {
      console.error('Product missing _id:', product);
      return NextResponse.json(
        { error: 'Product data is invalid - missing _id' },
        { status: 500 }
      );
    }

    console.log('Successfully found product:', product._id);
    return NextResponse.json({
      success: true,
      product 
    });
  } catch (error) {
    console.error('Error in product fetch:', error);
    return NextResponse.json(
      { 
        error: 'Error fetching product', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

 
 
