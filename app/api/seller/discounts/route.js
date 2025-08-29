import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { verifyToken, isAuthenticated } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
  
    const isAuth = await isAuthenticated(request);
    
    if (!isAuth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { productIds, discountPercentage, startDate, endDate } = await request.json(); 

    // Validate input
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'No products selected' }, { status: 400 });
    }

    if (discountPercentage < 0 || discountPercentage > 100) {
      return NextResponse.json({ error: 'Invalid discount percentage' }, { status: 400 });
    }
    
    // Update products with discount
    // Original Price×(1−0.90)
    const products = await Product.find({ _id: { $in: productIds } });
    await Promise.all(products.map(async (product) => {
      const originalPrice = product.price;
      const discountedPrice = originalPrice * (1 - (discountPercentage / 100));
      
      await Product.updateOne(
        { _id: product._id },
        {
          $set: {
            realprice: originalPrice,
            price: discountedPrice,
            discountPercentage,
            discountStartDate: startDate,
            discountEndDate: endDate
          }
        }
      );
    }));

    // Schedule discount removal when end date is reached
    const endDateTime = new Date(endDate).getTime();
    if (endDateTime > Date.now()) {
      setTimeout(async () => {
        await Product.updateMany(
          { _id: { $in: productIds } },
          {
            $set: {
              discountPercentage: 0,
              discountStartDate: null,
              discountEndDate: null
            }
          }
        );
      }, endDateTime - Date.now());
    }

    return NextResponse.json({ message: 'Discounts applied successfully' });
  } catch (error) {
    console.error('Error applying discounts:', error);
    return NextResponse.json({ error: 'Failed to apply discounts' }, { status: 500 });
  }
}