import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { isAuthenticated } from '@/lib/auth';
import nodemailer from 'nodemailer';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    const user = await isAuthenticated(request);
    console.log(user)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const activeOrders = await Order.find({
      deliveryMan: new mongoose.Types.ObjectId(user.id) ,
      deliveryStatus: { $in: ['assigned', 'processing', 'out_for_delivery'] }
    }).populate({
      path: 'user',
      select: 'name email'
    }).populate({
      path: 'items.product',
      select: 'name images'
    });
 
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayDeliveries, totalStats] = await Promise.all([
      Order.countDocuments({
        deliveryMan: new mongoose.Types.ObjectId(user.id) ,
        deliveryStatus: 'delivered',
        deliveredAt: { $gte: today }
      }),
      Order.aggregate([
        { $match: { deliveryMan: new mongoose.Types.ObjectId(user.id)  } },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: '$deliveryEarnings' },
            completedOrders: {
              $sum: { $cond: [{ $eq: ['$deliveryStatus', 'delivered'] }, 1, 0] }
            },
            pendingOrders: {
              $sum: {
                $cond: [
                  { $in: ['$deliveryStatus', ['assigned', 'processing', 'out_for_delivery']] },
                  1,
                  0
                ]
              }
            }
          }
       }
      ])
    ]);
    console.log(todayDeliveries, totalStats)

    const stats = totalStats[0] || {
      totalEarnings: 0,
      completedOrders: 0,
      pendingOrders: 0
    };


    return NextResponse.json({
      activeOrders,
      stats: {
        ...stats,
        todayDeliveries
      }
    });
  } catch (error) {
    console.error('Delivery dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = await isAuthenticated(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { orderId, status } = data;

    await connectDB();

    const order = await Order.findOne({
      _id: orderId,
      deliveryMan: user.id
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const validTransitions = {
      'assigned': ['processing'],
      'processing': ['out_for_delivery'],
      'out_for_delivery': ['delivered']
    };

    if (!validTransitions[order.deliveryStatus]?.includes(status)) {
      return NextResponse.json({
        error: 'Invalid status transition'
      }, { status: 400 });
    }

    order.deliveryStatus = status;
    if (status === 'delivered') {
      order.deliveredAt = new Date();
      order.isDelivered = true;
      order.deliveryEarnings = Math.round(order.totalPrice * 0.1);

     
      const user = await User.findById(order.user);
      if (user && user.email) {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const orderSummary = order.items.map(item =>
          `${item.name} - Quantity: ${item.quantity} - Price: $${item.price.toFixed(2)}`
        ).join('\n');
        const mailOptions = {
          from: 'H-eccomerce <no-reply@h-eccomerce.com>',
          to: user.email,
          subject: 'Your Order Has Arrived 🎉 – Tell Us What You Think!',
          html: `
  <div style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

      <!-- Header -->
      <div style="background: #4CAF50; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">H-ecommerce</h1>
      </div>

      <!-- Body -->
      <div style="padding: 30px; color: #333;">
        <h2 style="margin-top: 0; color: #4CAF50;">Your Order Has Been Delivered! ✅</h2>
        <p style="font-size: 16px;">Hello <strong>${user.name || "Customer"}</strong>,</p>
        <p style="font-size: 15px;">We’re excited to let you know that your order is safely delivered. We’d love to hear your thoughts on your shopping experience!</p>

        <!-- Order Summary -->
        <div style="background: #f9f9f9; border: 1px solid #eee; padding: 15px; margin: 20px 0; border-radius: 6px;">
          <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order._id}</p>
          <p style="margin: 5px 0;"><strong>Delivered At:</strong> ${order.deliveredAt}</p>
          <p style="margin: 10px 0;"><strong>Order Details:</strong></p>
          <pre style="white-space: pre-wrap; font-size: 14px; color: #555;">${orderSummary}</pre>
        </div>

        <!-- Address -->
        <p style="margin: 10px 0;"><strong>Delivery Address:</strong></p>
        <p style="font-size: 14px; color: #555; line-height: 1.5;">
          ${order.shippingAddress.street}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}<br>
          ${order.shippingAddress.country}
        </p>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/review/${order._id}"
             style="background-color: #4CAF50; color: white; padding: 14px 28px; 
                    text-decoration: none; border-radius: 6px; font-weight: bold;
                    display: inline-block; font-size: 16px;">
            ⭐ Leave a Review
          </a>
        </div>

        <p style="font-size: 14px; color: #555;">Your feedback helps us serve you better and guide other customers in making the right choice. It only takes a minute!</p>
      </div>

      <!-- Footer -->
      <div style="background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #888;">
        <p style="margin: 5px;">Thank you for shopping with <strong>H-ecommerce</strong> 💚</p>
        <p style="margin: 5px;">Need help? <a href="${process.env.NEXT_PUBLIC_APP_URL}/support" style="color: #4CAF50; text-decoration: none;">Contact Support</a></p>
      </div>
    </div>
  </div>
  `
        };

        // Send the email
        await transporter.sendMail(mailOptions);
      }
    }

    order.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: user.id
    });

    await order.save();

    // Return updated orders and stats
    const updatedData = await GET(request);
    return updatedData;

  } catch (error) {
    console.error('Update delivery status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}