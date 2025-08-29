
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
    const timeRange = searchParams.get('timeRange') || '30days';
    const deliveryManId = searchParams.get('deliveryManId');

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
        startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    }

    let orderQuery = {
      createdAt: { $gte: startDate, $lte: now }
    };

    if (deliveryManId && deliveryManId !== 'all') {
      orderQuery.deliveryMan = deliveryManId;
    }

    const orders = await Order.find(orderQuery)
      .populate('deliveryMan', 'name deliverymanInfo.area')
      .sort({ createdAt: 1 });

    const deliveryMen = await User.find({ role: 'deliveryman' })
      .select('name email deliverymanInfo');

    const dailyStats = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          earnings: 0,
          deliveries: 0,
          totalOrderValue: 0,
          pendingOrders: 0,
          completedOrders: 0
        };
      }
      
      if (order.deliveryEarnings) {
        dailyStats[date].earnings += order.deliveryEarnings;
      }
      
      dailyStats[date].totalOrderValue += order.totalPrice;
      
      if (order.deliveryStatus === 'delivered') {
        dailyStats[date].deliveries += 1;
        dailyStats[date].completedOrders += 1;
      } else if (order.deliveryStatus === 'pending') {
        dailyStats[date].pendingOrders += 1;
      }
    });

    const chartData = Object.values(dailyStats).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    const deliveryMenStats = await Promise.all(
      deliveryMen.map(async (dm) => {
        const dmOrders = orders.filter(order => 
          order.deliveryMan && order.deliveryMan._id.toString() === dm._id.toString()
        );
        
        const completedOrders = dmOrders.filter(order => order.deliveryStatus === 'delivered');
        const totalEarnings = completedOrders.reduce(
          (sum, order) => sum + (order.deliveryEarnings || 0), 0
        );
        
        const mockRating = 4.2 + (Math.random() * 0.6); 
        
        const assignedOrders = dmOrders.length;
        const efficiency = assignedOrders > 0 ? 
          Math.round((completedOrders.length / assignedOrders) * 100) : 0;

        return {
          id: dm._id,
          name: dm.name,
          area: dm.deliverymanInfo.area,
          totalEarnings: dm.deliverymanInfo.earnings,
          periodEarnings: totalEarnings,
          deliveries: completedOrders.length,
          avgEarningPerDelivery: completedOrders.length > 0 ? 
            totalEarnings / completedOrders.length : 0,
          rating: Math.round(mockRating * 10) / 10,
          efficiency: Math.min(efficiency, 100),
          availableForDelivery: dm.deliverymanInfo.availableForDelivery,
          assignedOrders: dm.deliverymanInfo.assignedOrders.length
        };
      })
    );

    const areaStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: now },
          deliveryStatus: 'delivered'
        }
      },
      {
        $group: {
          _id: '$deliveryArea',
          deliveries: { $sum: 1 },
          earnings: { $sum: '$deliveryEarnings' },
          totalOrderValue: { $sum: '$totalPrice' }
        }
      }
    ]);

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    const formattedAreaStats = areaStats.map((area, index) => ({
      area: area._id || 'Unknown',
      value: area.deliveries,
      earnings: area.earnings || 0,
      color: colors[index % colors.length]
    }));

    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.deliveryStatus === 'delivered').length;
    const totalEarnings = orders.reduce((sum, order) => sum + (order.deliveryEarnings || 0), 0);
    const avgEarningPerDelivery = completedOrders > 0 ? totalEarnings / completedOrders : 0;
    
    const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    const previousOrders = await Order.find({
      createdAt: { $gte: previousPeriodStart, $lt: startDate },
      deliveryStatus: 'delivered'
    });
    
    const previousEarnings = previousOrders.reduce(
      (sum, order) => sum + (order.deliveryEarnings || 0), 0
    );
    const growth = previousEarnings > 0 ? 
      ((totalEarnings - previousEarnings) / previousEarnings) * 100 : 0;

    const overview = {
      totalEarnings,
      totalDeliveries: completedOrders,
      avgEarningPerDelivery: Math.round(avgEarningPerDelivery * 100) / 100,
      activeDeliveryMen: deliveryMen.filter(dm => dm.deliverymanInfo.availableForDelivery).length,
      growth: Math.round(growth * 10) / 10,
      totalOrders,
      pendingOrders: orders.filter(o => o.deliveryStatus === 'pending').length
    };

    return NextResponse.json({
      overview,
      chartData,
      deliveryMenStats: deliveryMenStats.sort((a, b) => b.periodEarnings - a.periodEarnings),
      areaStats: formattedAreaStats,
      timeRange,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString()
      }
    });

  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch analytics data',
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

    const { timeRange, deliveryManId, format } = await req.json();

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
        startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    }

    let orderQuery = {
      createdAt: { $gte: startDate, $lte: now },
      deliveryStatus: 'delivered'
    };

    if (deliveryManId && deliveryManId !== 'all') {
      orderQuery.deliveryMan = deliveryManId;
    }

    const orders = await Order.find(orderQuery)
      .populate('deliveryMan', 'name email')
      .populate('user', 'name email')
      .sort({ deliveredAt: -1 });

    const reportData = orders.map(order => ({
      orderNumber: order.orderNumber,
      customerName: order.user.name,
      deliveryPerson: order.deliveryMan ? order.deliveryMan.name : 'N/A',
      orderValue: order.totalPrice,
      deliveryEarnings: order.deliveryEarnings || 0,
      deliveryDate: order.deliveredAt ? order.deliveredAt.toISOString().split('T')[0] : 'N/A',
      area: order.deliveryArea,
      status: order.deliveryStatus
    }));

    const summary = {
      totalOrders: orders.length,
      totalOrderValue: orders.reduce((sum, order) => sum + order.totalPrice, 0),
      totalEarnings: orders.reduce((sum, order) => sum + (order.deliveryEarnings || 0), 0),
      avgEarningPerOrder: orders.length > 0 ? 
        orders.reduce((sum, order) => sum + (order.deliveryEarnings || 0), 0) / orders.length : 0
    };

    return NextResponse.json({
      success: true,
      data: reportData,
      summary,
      generatedAt: new Date().toISOString(),
      parameters: {
        timeRange,
        deliveryManId,
        format,
        dateRange: {
          start: startDate.toISOString(),
          end: now.toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate report',
      details: error.message 
    }, { status: 500 });
  }
}