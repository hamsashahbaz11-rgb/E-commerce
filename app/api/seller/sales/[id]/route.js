import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import { ObjectId } from 'mongodb';

// GET handler - Get a specific sale for a seller
export async function GET(req, { params }) {
  try {
    await connectDB();
    
    const { id } = (await params).id; // Order ID
    
    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
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
    const seller = await User.findById(sellerId);
    
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

    // Get the specific order
    const order = await Order.findById(id);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Check if this order contains items from this seller
    const sellerItems = order.items.filter(item => 
      item.sellerId && item.sellerId.toString() === sellerId
    );
    
    if (sellerItems.length === 0) {
      return NextResponse.json(
        { error: 'This order does not contain any items from this seller' },
        { status: 404 }
      );
    }
    
    // Process the sale to only include items from this seller
    const processedSale = {
      orderId: order._id,
      customer: order.customer,
      items: sellerItems,
      totalAmount: sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      status: order.status,
      createdAt: order.createdAt
    };

    return NextResponse.json(
      { success: true, sale: processedSale },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/seller/sales/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sale', details: error.message },
      { status: 500 }
    );
  }
}
// /api/seller/sales/${orderId}?sellerId=${sellerId}
// PATCH handler - Update order status (for seller's items only) 
export async function PATCH(req, { params }) {
  try {
    await connectDB();

    const orderId = params.id; // Order ID
    const { status } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Get sellerId from URL
    const url = new URL(req.url);
    const sellerId = url.searchParams.get('sellerId');

    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID is required' }, { status: 400 });
    }

    // Verify seller
    const seller = await User.findById(sellerId);
    if (!seller || !seller.isSeller) {
      return NextResponse.json({ error: 'Invalid seller' }, { status: 403 });
    }

    // Get the order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if order contains seller’s items
    const hasSellerItems = order.items.some(
      item => item.sellerId && item.sellerId.toString() === sellerId
    );

    if (!hasSellerItems) {
      return NextResponse.json({ error: 'No items from this seller in order' }, { status: 404 });
    }

    // ✅ Update status
    order.items.forEach(item => {
      if (item.sellerId && item.sellerId.toString() === sellerId) {
        item.status = status;
      }
    });

    // Optional: update global order status too
    order.status = status;

    await order.save();

    return NextResponse.json(
      { success: true, message: 'Order status updated successfully', order },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in PATCH /api/seller/sales/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to update order status', details: error.message },
      { status: 500 }
    );
  }
}
