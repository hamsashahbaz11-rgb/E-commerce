
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
 
export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const area = searchParams.get('area');
    const status = searchParams.get('status');

    let orderQuery = {};
    if (area && area !== 'all') {
      orderQuery.deliveryArea = area;
    }
    if (status && status !== 'all') {
      orderQuery.deliveryStatus = status;
    } else {
      orderQuery.deliveryStatus = { $in: ['pending', 'assigned', 'picked_up', 'out_for_delivery'] };
    }

    const orders = await Order.find(orderQuery)
      .populate('user', 'name email phone')
      .populate('deliveryMan', 'name email deliverymanInfo.area')
      .sort({ createdAt: -1 })
      .limit(50);

    const deliveryMen = await User.find({
      role: 'deliveryman',
      'deliverymanInfo.availableForDelivery': true
    }).select('name email deliverymanInfo');

    const deliveryMenByArea = {};
    deliveryMen.forEach(dm => {
      const area = dm.deliverymanInfo.area;
      if (!deliveryMenByArea[area]) {
        deliveryMenByArea[area] = [];
      }
      deliveryMenByArea[area].push({
        _id: dm._id,
        name: dm.name,
        email: dm.email,
        area: dm.deliverymanInfo.area,
        assignedOrders: dm.deliverymanInfo.assignedOrders.length,
        earnings: dm.deliverymanInfo.earnings,
        availableForDelivery: dm.deliverymanInfo.availableForDelivery
      });
    });

    const areaStats = await Order.aggregate([
      {
        $match: {
          deliveryStatus: { $in: ['pending', 'assigned', 'picked_up', 'out_for_delivery'] }
        }
      },
      {
        $group: {
          _id: '$deliveryArea',
          orderCount: { $sum: 1 },
          totalValue: { $sum: '$totalPrice' },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$deliveryStatus', 'pending'] }, 1, 0] }
          }
        }
      }
    ]);

    return NextResponse.json({
      orders,
      deliveryMenByArea,
      areaStats,
      summary: {
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.deliveryStatus === 'pending').length,
        assignedOrders: orders.filter(o => o.deliveryStatus === 'assigned').length,
        availableDeliveryMen: deliveryMen.length
      }
    });
  } catch (error) {
    console.error('Failed to fetch assignment data:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch assignment data',
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

    const { orderId, deliveryManId } = await req.json();

    if (!orderId || !deliveryManId) {
      return NextResponse.json({ 
        error: 'Order ID and Delivery Man ID are required' 
      }, { status: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.deliveryStatus !== 'pending') {
      return NextResponse.json({ 
        error: 'Order is not available for assignment' 
      }, { status: 400 });
    }

    const deliveryMan = await User.findById(deliveryManId);
    if (!deliveryMan || deliveryMan.role !== 'deliveryman') {
      return NextResponse.json({ error: 'Delivery man not found' }, { status: 404 });
    }

    if (!deliveryMan.deliverymanInfo.availableForDelivery) {
      return NextResponse.json({ 
        error: 'Delivery man is not available' 
      }, { status: 400 });
    }

    if (deliveryMan.deliverymanInfo.area !== order.deliveryArea) {
      return NextResponse.json({ 
        error: 'Delivery man is not assigned to this area' 
      }, { status: 400 });
    }

    if (deliveryMan.deliverymanInfo.assignedOrders.length >= 5) {
      return NextResponse.json({ 
        error: 'Delivery man has reached maximum order capacity' 
      }, { status: 400 });
    }

    order.deliveryMan = deliveryManId;
    order.deliveryStatus = 'assigned';
    order.assignedAt = new Date();
    order.statusHistory.push({
      status: 'assigned',
      timestamp: new Date(),
      updatedBy: decoded.id,
      note: `Assigned to ${deliveryMan.name}`
    });

    deliveryMan.deliverymanInfo.assignedOrders.push(orderId);

  
    await Promise.all([
      order.save(),
      deliveryMan.save()
    ]);

    const updatedOrder = await Order.findById(orderId)
      .populate('user', 'name email phone')
      .populate('deliveryMan', 'name email deliverymanInfo.area');

    return NextResponse.json({
      success: true,
      message: `Order ${order.orderNumber} assigned to ${deliveryMan.name}`,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Order assignment error:', error);
    return NextResponse.json({ 
      error: 'Failed to assign order',
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!order.deliveryMan) {
      return NextResponse.json({ 
        error: 'Order is not assigned to any delivery man' 
      }, { status: 400 });
    }

    if (order.deliveryStatus === 'delivered') {
      return NextResponse.json({ 
        error: 'Cannot unassign delivered order' 
      }, { status: 400 });
    }

    const deliveryMan = await User.findById(order.deliveryMan);
    if (deliveryMan) {
      deliveryMan.deliverymanInfo.assignedOrders = 
        deliveryMan.deliverymanInfo.assignedOrders.filter(
          id => id.toString() !== orderId.toString()
        );
      await deliveryMan.save();
    }

    const previousDeliveryMan = order.deliveryMan;
    order.deliveryMan = null;
    order.deliveryStatus = 'pending';
    order.assignedAt = null;
    order.statusHistory.push({
      status: 'unassigned',
      timestamp: new Date(),
      updatedBy: decoded.id,
      note: `Unassigned from delivery man`
    });

    await order.save();

    return NextResponse.json({
      success: true,
      message: 'Order unassigned successfully',
      orderId
    });
  } catch (error) {
    console.error('Order unassignment error:', error);
    return NextResponse.json({ 
      error: 'Failed to unassign order',
      details: error.message 
    }, { status: 500 });
  }
}