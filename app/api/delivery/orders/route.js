import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'deliveryman') {
      return NextResponse.json({ error: 'Delivery man access required' }, { status: 403 });
    }

    await connectDB();

    const orders = await Order.find({ 
      deliveryMan: decoded.id,
      deliveryStatus: { $ne: 'delivered' }
    }).populate('user', 'name email');

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to fetch orders',
      details: error.message 
    }, { status: 500 });
  }
}