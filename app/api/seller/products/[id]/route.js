import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import User from '@/models/User';
import { uploadImage } from '@/lib/cloudinary';

// GET handler - Get a single product
export async function GET(req, { params }) {
  try {
    await connectDB();
    
    const { id } = await params; 

    
    const product = await Product.find({seller: id});
    
    
    if (!product) {
      return NextResponse.json(  
        { error: 'Product not found' },
        { status: 404 }
      );
    }
     
    // Get seller ID from URL parameters
    const url = new URL(req.url); 

    
    // Verify the seller exists and owns this product if sellerId is provided
    if (id) {
      const seller = await User.findById(id);
      if (!seller || !seller.isSeller) {
        return NextResponse.json(
          { error: 'Seller not found or user is not a seller' },
          { status: 404 }
        );
      }
      
      // Check if the product belongs to this seller
      if (product.seller !== id) {
        return NextResponse.json(
          { error: 'You are not authorized to access this product' },
          { status: 403 }
        );
      }
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
    
    // Check content type to determine how to process the request
     const contentType = req.headers.get('content-type') || '';
     let updates;
     
     if (contentType.includes('multipart/form-data')) {
       // Handle FormData with possible image uploads
       const formData = await req.formData();
       updates = {};
       
       // Extract basic product data
       if (formData.has('name')) updates.name = formData.get('name');
       if (formData.has('description')) updates.description = formData.get('description');
       if (formData.has('price')) updates.price = parseFloat(formData.get('price'));
       if (formData.has('category')) updates.category = formData.get('category');
       if (formData.has('subcategory')) updates.subcategory = formData.get('subcategory');
       if (formData.has('brand')) updates.brand = formData.get('brand');
       if (formData.has('stock')) updates.stock = parseInt(formData.get('stock'));
       if (formData.has('seller')) updates.seller = formData.get('seller');
       
       // Handle original images if present
       if (formData.has('originalImages')) {
         try {
           const originalImages = JSON.parse(formData.get('originalImages'));
           // If we have original images and no new uploads, keep the original images
           if (originalImages && originalImages.length > 0) {
             updates.images = originalImages;
           }
         } catch (error) {
           console.error('Error parsing originalImages:', error);
         }
       }
       
       // Handle image uploads if present
       const imageFiles = formData.getAll('images');
       if (imageFiles && imageFiles.length > 0) {
         try {
           const uploadPromises = imageFiles.map(async (file) => {
             const arrayBuffer = await file.arrayBuffer();
             const buffer = Buffer.from(arrayBuffer);
             const base64String = buffer.toString('base64');
             const dataURI = `data:${file.type};base64,${base64String}`;
             return uploadImage(dataURI);
           });

           const uploadedImages = await Promise.all(uploadPromises);
           const newImages = uploadedImages.map(img => ({
             url: img.url,
             public_id: img.public_id
           }));
           
           // If we already have original images, append the new ones
           if (updates.images && updates.images.length > 0) {
             updates.images = [...updates.images, ...newImages];
           } else {
             updates.images = newImages;
           }
         } catch (uploadError) {
           console.error('Error uploading images:', uploadError);
           return NextResponse.json(
             { error: 'Failed to upload images' },
             { status: 500 }
           );
         }
       }
     } else {
       // Handle JSON data
       updates = await req.json();
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