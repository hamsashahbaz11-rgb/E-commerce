
 

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();

    // 1️⃣ Find all unassigned orders
    const orders = await Order.find({
      assignedTo: { $exists: false }
    })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // 2️⃣ Find all eligible delivery men
    const deliveryMen = await User.find({
      role: 'deliveryman',
      'deliverymanInfo.availableForDelivery': true,
      $expr: { $lt: [{ $size: '$deliverymanInfo.assignedOrders' }, 5] }
    }).select('name email deliverymanInfo');

    // 3️⃣ Return both separately
    return NextResponse.json({
      orders,
      deliveryMen,
      success: true
      
    });

  } catch (error) {
    console.error('Error fetching unassigned orders & delivery men:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unassigned orders & delivery men' , success: false },
      { status: 500 }
    );
  }
}
