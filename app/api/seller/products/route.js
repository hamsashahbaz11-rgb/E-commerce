import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import User from '@/models/User';
import { uploadImage } from '@/lib/cloudinary';
import { format } from 'date-fns';

// GET handler - Get all products for a seller
export async function GET(req) {
  try {
  try {
      await connectDB(); 
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

    if (!sellerId) { 
      return NextResponse.json(
        { error: 'Seller ID is required' },
        { status: 400 }
      );
    }

    // Verify seller exists
    let seller;
    try {
      seller = await User.findById(sellerId); 
    } catch (userError) {
      console.error('Error finding user:', userError);
      return NextResponse.json(
        { error: 'Error finding user' },
        { status: 500 }
      );
    }

    if (!seller) { 
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    if (!seller.isSeller) { 
      return NextResponse.json(
        { error: 'User is not a seller' },
        { status: 403 }
      );
    }


    // Get all products for this seller
    seller: sellerId
    try {
      const products = await Product.find({ seller })
        .sort({ createdAt: -1 }) // Newest first
        .select('name price description stock images category subcategory brand averageRating numReviews sold');

      
      return NextResponse.json(
        {
          success: true,
          count: products.length,
          products
        },
        { status: 200 })
    } catch (productError) {
      console.error('Error finding products:', productError);
      return NextResponse.json(
        { error: 'Error finding products' },
        { status: 500 }
      );
    }

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
    await connectDB();
 

    const formData = await req.formData();
    const productData = {};

    // Extract basic product data
    productData.name = formData.get('name');
    productData.description = formData.get('description');
    productData.price = parseFloat(formData.get('price'));
    productData.category = formData.get('category');
    productData.subcategory = formData.get('subcategory');
    productData.brand = formData.get('brand');
    productData.stock = parseInt(formData.get('stock'));
    productData.seller = formData.get('seller');

    // ✅ Parse arrays properly
    try {
      const colorsRaw = formData.get('colors');
      productData.colors = colorsRaw ? JSON.parse(colorsRaw) : [];

      const sizesRaw = formData.get('sizes');
      productData.sizes = sizesRaw ? JSON.parse(sizesRaw) : [];
    } catch (err) {
      console.error("Error parsing colors/sizes:", err);
      return NextResponse.json(
        { error: "Invalid format for colors or sizes. Must be JSON array." },
        { status: 400 }
      );
    }

    // ✅ Parse boolean for featured
    productData.featured = formData.get("featured") === "true";
 

    // Handle image uploads
    const imageFiles = formData.getAll('images');
    if (!imageFiles || imageFiles.length === 0) {
      return NextResponse.json(
        { error: 'At least one image is required' },
        { status: 400 }
      );
    }

    try {
      const uploadPromises = imageFiles.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64String = buffer.toString('base64');
        const dataURI = `data:${file.type};base64,${base64String}`;
        return uploadImage(dataURI);
      });

      const uploadedImages = await Promise.all(uploadPromises);
      productData.images = uploadedImages.map(img => ({
        url: img.url,
        public_id: img.public_id
      }));
    } catch (uploadError) {
      console.error('Error uploading images:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload images' },
        { status: 500 }
      );
    }
 
    // Validate required fields
    const requiredFields = [
      'name', 'description', 'price', 'category',
      'subcategory', 'images', 'brand', 'stock', 'seller'
    ];

    for (const field of requiredFields) {
      if (!productData[field]) { 
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Verify seller exists
    const seller = await User.findById(productData.seller); 

    if (!seller || !seller.isSeller) { 
      return NextResponse.json(
        { error: 'Seller not found or user is not a seller' },
        { status: 404 }
      );
    }
   productData.realprice = productData.price + (productData.price * process.env.PRICE_QUOTA / 100)

    // Create the product
    const newProduct = await Product.create(productData); 

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
