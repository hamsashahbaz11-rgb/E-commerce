import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import User from '@/models/User';

// GET handler - Get a single product
export async function GET(req, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    const product = await Product.findOne(id);
    
    if (!product) {
      return NextResponse.json(  
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, product },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PATCH handler - Update a product
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const updates = await req.json();
    
    // Find the product first
    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Get seller ID from URL parameters
    const url = new URL(req.url);
    const sellerId = url.searchParams.get('sellerId');
    
    // Verify the seller exists and owns this product
    if (sellerId) {
      const seller = await User.findById(sellerId);
      if (!seller || !seller.isSeller) {
        return NextResponse.json(
          { error: 'Seller not found or user is not a seller' },
          { status: 404 }
        );
      }
      
      // Check if the product belongs to this seller
      if (product.seller.toString() !== sellerId) {
        return NextResponse.json(
          { error: 'You are not authorized to update this product' },
          { status: 403 }
        );
      }
    }
    
    // Update the product with the new data
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(
      {
        success: true,
        message: 'Product updated successfully',
        product: updatedProduct
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE handler - Delete a product
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    // Find the product first
    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Get seller ID from URL parameters
    const url = new URL(req.url);
    const sellerId = url.searchParams.get('sellerId');
    
    // Verify the seller exists and owns this product
    if (sellerId) {
      const seller = await User.findById(sellerId);
      if (!seller || !seller.isSeller) {
        return NextResponse.json(
          { error: 'Seller not found or user is not a seller' },
          { status: 404 }
        );
      }
      
      // Check if the product belongs to this seller
      if (product.seller.toString() !== sellerId) {
        return NextResponse.json(
          { error: 'You are not authorized to delete this product' },
          { status: 403 }
        );
      }
    }
    
    // Delete the product
    await Product.findByIdAndDelete(id);
    
    return NextResponse.json(
      {
        success: true,
        message: 'Product deleted successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
} 