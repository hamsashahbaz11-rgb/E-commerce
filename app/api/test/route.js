import { NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import User from '../../../models/User';
import Product from '../../../models/Product';

export async function GET() {
  try {
    console.log('Testing database connection and models');
    
    // Test database connection
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
    
    // Test User model
    try {
      console.log('User model schema:', Object.keys(User.schema.paths));
      const userCount = await User.countDocuments();
      console.log('User count:', userCount);
    } catch (userError) {
      console.error('User model error:', userError);
      return NextResponse.json(
        { error: 'User model error', details: userError.message },
        { status: 500 }
      );
    }
    
    // Test Product model
    try {
      console.log('Product model schema:', Object.keys(Product.schema.paths));
      const productCount = await Product.countDocuments();
      console.log('Product count:', productCount);
    } catch (productError) {
      console.error('Product model error:', productError);
      return NextResponse.json(
        { error: 'Product model error', details: productError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true,
        message: 'Database and models working correctly'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('General error in test route:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error.message },
      { status: 500 }
    );
  }
} 