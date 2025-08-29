import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function POST(req) {
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

    const { orderId, status } = await req.json();
    const order = await Order.findById(orderId);

    if (!order || order.deliveryMan.toString() !== decoded.id) {
      return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 404 });
    }

    order.deliveryStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: decoded.id
    });

    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
      order.deliveryEarnings = order.totalPrice * process.env.DELIVERYMAN_PAY_PER_ORDER; // 2% earnings

      // Update delivery man's earnings
      const deliveryMan = await User.findById(decoded.id);
      deliveryMan.deliverymanInfo.earnings += order.deliveryEarnings;
      deliveryMan.deliverymanInfo.deliveryHistory.push({
        orderId: order._id,
        earnedAmount: order.deliveryEarnings,
        deliveryDate: new Date(),
        status: 'delivered'
      });
      deliveryMan.deliverymanInfo.assignedOrders = 
        deliveryMan.deliverymanInfo.assignedOrders.filter(id => 
          id.toString() !== orderId.toString());
      await deliveryMan.save();
    }

    await order.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Order status updated successfully' 
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to update order status',
      details: error.message 
    }, { status: 500 });
  }
}