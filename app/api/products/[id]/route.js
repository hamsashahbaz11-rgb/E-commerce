import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import mongoose from 'mongoose'; 
import { ObjectId } from 'mongodb';

export async function GET(req, { params }) {
  try { 
    
    const {id} = await params;
    const productId = new ObjectId(id)

    if(!productId) {
      console.error('No product ID provided');
      return NextResponse.json(
        { error: 'Product ID is required', details: 'The product ID parameter is missing' },
        { status: 400 }
      );
    }
 

     if(!mongoose.Types.ObjectId.isValid(productId)) {
      console.error('Invalid MongoDB ObjectId format:', productId);
      return NextResponse.json(
        { 
          error: 'Invalid product ID format', 
          details: ''
        },
        { status: 400 }
      );
    }
    
    try {
      await connectDB(); 
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { 
          error: 'Database connection failed', 
          details: process.env.NODE_ENV === 'development' ? dbError.message : 'Internal server error'
        },
        { status: 500 }
      );
    }

    const product = await Product.findById(productId).exec(); 

    if (!product) { 
      return NextResponse.json(
        { 
          error: 'Product not found', 
          details: `No product exists with ID: ${productId}`
        },
        { status: 404 }
      );
    }

    if (!product._id) {
      console.error('Invalid product data - missing _id:', product);
      return NextResponse.json(
        { 
          error: 'Invalid product data', 
          details: 'The product data is corrupted or incomplete'
        },
        { status: 500 }
      );
    }
 
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

 
 
