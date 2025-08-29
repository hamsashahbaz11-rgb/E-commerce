// app/api/delivery/earnings/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
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

    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || '7days';
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '7days':
        startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        break;
      case '30days':
        startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        break;
      case '90days':
        startDate = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
        break;
      default:
        startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    }

    // Get delivery man info
    const deliveryMan = await User.findById(decoded.id);
    if (!deliveryMan || deliveryMan.role !== 'deliveryman') {
      return NextResponse.json({ error: 'Delivery man not found' }, { status: 404 });
    }

    // Get orders delivered by this delivery man in the time range
    const orders = await Order.find({
      deliveryMan: decoded.id,
      isDelivered: true,
      deliveredAt: { $gte: startDate, $lte: now }
    }).populate('user', 'name email');

    // Calculate daily earnings
    const dailyEarnings = {};
    orders.forEach(order => {
      const date = order.deliveredAt.toISOString().split('T')[0];
      if (!dailyEarnings[date]) {
        dailyEarnings[date] = {
          date,
          earnings: 0,
          deliveries: 0,
          totalOrderValue: 0
        };
      }
      dailyEarnings[date].earnings += order.deliveryEarnings || 0;
      dailyEarnings[date].deliveries += 1;
      dailyEarnings[date].totalOrderValue += order.totalPrice;
    });

    // Convert to array and sort by date
    const chartData = Object.values(dailyEarnings).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    // Calculate summary statistics
    const totalEarnings = orders.reduce((sum, order) => sum + (order.deliveryEarnings || 0), 0);
    const totalDeliveries = orders.length;
    const avgEarningPerDelivery = totalDeliveries > 0 ? totalEarnings / totalDeliveries : 0;

    // Get delivery history with more details
    const deliveryHistory = deliveryMan.deliverymanInfo.deliveryHistory
      .filter(delivery => new Date(delivery.deliveryDate) >= startDate)
      .sort((a, b) => new Date(b.deliveryDate) - new Date(a.deliveryDate));

    const response = {
      overview: {
        totalEarnings: deliveryMan.deliverymanInfo.earnings,
        periodEarnings: totalEarnings,
        totalDeliveries,
        avgEarningPerDelivery,
        availableForDelivery: deliveryMan.deliverymanInfo.availableForDelivery,
        area: deliveryMan.deliverymanInfo.area
      },
      chartData,
      deliveryHistory: deliveryHistory.slice(0, 10), // Last 10 deliveries
      recentOrders: orders.slice(-5).reverse() // Last 5 orders
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Earnings fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch earnings data',
      details: error.message 
    }, { status: 500 });
  }
}

// Update availability status
export async function PATCH(req) {
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

    const { availableForDelivery } = await req.json();

    const deliveryMan = await User.findByIdAndUpdate(
      decoded.id,
      { 
        'deliverymanInfo.availableForDelivery': availableForDelivery 
      },
      { new: true }
    );

    if (!deliveryMan) {
      return NextResponse.json({ error: 'Delivery man not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      availableForDelivery: deliveryMan.deliverymanInfo.availableForDelivery 
    });
  } catch (error) {
    console.error('Availability update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update availability',
      details: error.message 
    }, { status: 500 });
  }
}