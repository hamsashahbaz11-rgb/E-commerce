import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import nodemailer from 'nodemailer';
import User from '@/models/User';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';

function createOrderConfirmationEmail(order, user) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - H-ecommerce</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6; color: #333; background-color: #f8fafc;
            }
            .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden; }
            .email-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 32px 24px; }
            .logo { font-size: 28px; font-weight: 700; letter-spacing: -1px; margin-bottom: 8px; }
            .header-subtitle { opacity: 0.9; font-size: 16px; }
            .email-content { padding: 32px 24px; }
            .success-icon { width: 64px; height: 64px; background: #10b981; border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; color: white; font-size: 28px; }
            .order-title { font-size: 24px; font-weight: 600; color: #1f2937; text-align: center; margin-bottom: 8px; }
            .order-subtitle { color: #6b7280; text-align: center; margin-bottom: 32px; }
            .order-info-card { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
            .order-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            .info-item { display: flex; flex-direction: column; }
            .info-label { font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 500; letter-spacing: 0.5px; margin-bottom: 4px; }
            .info-value { font-weight: 600; color: #1f2937; }
            .section-header { font-size: 18px; font-weight: 600; color: #1f2937; margin: 32px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; }
            .order-items { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
            .item-header { background: #f8fafc; padding: 12px 16px; font-weight: 600; color: #374151; font-size: 14px; }
            .order-item { padding: 16px; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center; }
            .order-item:last-child { border-bottom: none; }
            .item-details h4 { font-weight: 600; color: #1f2937; margin-bottom: 4px; }
            .item-meta { font-size: 14px; color: #6b7280; }
            .item-price { font-weight: 600; color: #1f2937; }
            .address-card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
            .address-text { color: #374151; line-height: 1.6; }
            .payment-summary { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
            .summary-row { display: flex; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid #f3f4f6; }
            .summary-row:last-child { border-bottom: none; background: #f8fafc; font-weight: 600; color: #1f2937; }
            .summary-label { color: #6b7280; }
            .summary-value { font-weight: 500; color: #1f2937; }
            .status-message { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center; }
            .status-message strong { color: #92400e; }
            .email-footer { background: #f8fafc; padding: 32px 24px; text-align: center; border-top: 1px solid #e5e7eb; }
            .footer-text { color: #6b7280; font-size: 14px; margin-bottom: 16px; }
            .footer-links { font-size: 12px; color: #9ca3af; }
            .footer-links a { color: #667eea; text-decoration: none; }
            @media (max-width: 600px) {
                .email-container { margin: 0; border-radius: 0; }
                .order-info-grid { grid-template-columns: 1fr; }
                .email-content { padding: 24px 16px; }
                .email-header { padding: 24px 16px; }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <div class="logo">H-ecommerce</div>
                <div class="header-subtitle">Your Premium Shopping Destination</div>
            </div>
            <div class="email-content">
                <div class="success-icon">✓</div>
                <h1 class="order-title">Order Confirmed!</h1>
                <p class="order-subtitle">Thank you for your purchase. We're preparing your order for shipment.</p>
                <div class="order-info-card">
                    <div class="order-info-grid">
                        <div class="info-item">
                            <span class="info-label">Order Number</span>
                            <span class="info-value">#${order._id.toString().slice(-8).toUpperCase()}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Order Date</span>
                            <span class="info-value">${new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Payment Method</span>
                            <span class="info-value">${order.paymentMethod}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Order Status</span>
                            <span class="info-value" style="color: #f59e0b;">Processing</span>
                        </div>
                    </div>
                </div>
                <h2 class="section-header">📦 Order Details</h2>
                <div class="order-items">
                    <div class="item-header">Items Ordered</div>
                    ${order.items.map(item => `
                        <div class="order-item">
                            <div class="item-details">
                                <h4>${item.name}</h4>
                                <div class="item-meta">
                                    Quantity: ${item.quantity}
                                    ${item.size ? ` • Size: ${item.size}` : ''}
                                    ${item.color ? ` • Color: ${item.color}` : ''}
                                </div>
                            </div>
                            <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                    `).join('')}
                </div>
                <h2 class="section-header">🚚 Shipping Address</h2>
                <div class="address-card">
                    <div class="address-text">
                        <strong>${user.fullName || user.name || 'Customer'}</strong><br>
                        ${order.shippingAddress.street}<br>
                        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
                        ${order.shippingAddress.country}
                        ${user.phone ? `<br><strong>Phone:</strong> ${user.phone}` : ''}
                    </div>
                </div>
                <h2 class="section-header">💳 Payment Summary</h2>
                <div class="payment-summary">
                    <div class="summary-row">
                        <span class="summary-label">Subtotal</span>
                        <span class="summary-value">$${order.itemsPrice.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Shipping</span>
                        <span class="summary-value">$${order.shippingPrice.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Tax</span>
                        <span class="summary-value">$${order.taxPrice.toFixed(2)}</span>
                    </div>
                    ${order.couponDiscount > 0 ? `
                    <div class="summary-row">
                        <span class="summary-label">Discount</span>
                        <span class="summary-value" style="color: #10b981;">-$${order.couponDiscount.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    <div class="summary-row">
                        <span class="summary-label">Total Amount</span>
                        <span class="summary-value">$${order.totalPrice.toFixed(2)}</span>
                    </div>
                </div>
                <div class="status-message">
                    <strong>🎉 Your order is being processed!</strong><br>
                    You'll receive a shipping confirmation email with tracking information once your order ships.
                </div>
            </div>
            <div class="email-footer">
                <p class="footer-text">
                    Questions about your order? Contact us at 
                    <a href="mailto:support@h-ecommerce.com" style="color: #667eea;">support@h-ecommerce.com</a>
                </p>
                <div class="footer-links">
                    <a href="#">Track Your Order</a> • 
                    <a href="#">Return Policy</a> • 
                    <a href="#">Contact Support</a><br>
                    © 2025 H-ecommerce. All rights reserved.
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

async function validateCoupon(orderData) {
  if (!orderData.couponCode) return null;

  const coupon = await Coupon.findOne({
    code: orderData.couponCode.toUpperCase(),
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  });

  if (!coupon) {
    throw new Error('Invalid or expired coupon');
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new Error('Coupon usage limit reached');
  }

  if (coupon.minimumPurchase > orderData.totalAmount) {
    throw new Error(`Minimum purchase amount of $${coupon.minimumPurchase} required`);
  }

  return coupon;
}

async function applyCouponDiscount(orderData, coupon) {
  if (!coupon) return orderData;

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (orderData.totalAmount * coupon.discountAmount) / 100;
  } else {
    discountAmount = coupon.discountAmount;
  }

  coupon.usedCount += 1;
  await coupon.save();

  orderData.coupon = coupon._id;
  orderData.couponDiscount = discountAmount;
  orderData.totalAmount -= discountAmount;

  return orderData;
}

async function enrichOrderWithSellerIds(orderData) {
  for (const item of orderData.items) {
    try {
      const product = await Product.findById(item.product._id || item.product);
      if (product && product.seller) {
        item.sellerId = product.seller;
      } else {
        console.warn(`Product not found or no seller for product ID: ${item.product._id || item.product}`);
      }
    } catch (error) {
      console.error(`Error fetching product ${item.product._id || item.product}:`, error);
    }
  }
  return orderData;
}

async function updateSellerOrders(orderData, orderId) {
  const sellerUpdates = new Set();

  for (const item of orderData.items) {
    if (item.sellerId && !sellerUpdates.has(item.sellerId.toString())) {
      try {
        const user = await User.findById(item.sellerId);
        if (user) {
          user.orders.push(orderId);
          await user.save();
          sellerUpdates.add(item.sellerId.toString());
        }
      } catch (error) {
        console.error(`Error updating seller ${item.sellerId}:`, error);
      }
    }
  }
}

async function sendOrderConfirmationEmail(order, user) {
  try {
    const transporter = nodemailer.createTransporter({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: {
        name: 'H-ecommerce',
        address: process.env.SMTP_USER
      },
      to: user.email,
      subject: 'Order Confirmation - H-ecommerce',
      html: createOrderConfirmationEmail(order, user)
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
}

export async function POST(req) {
  try {
    await connectDB();
    let orderData = await req.json();


    if (!orderData.user || !orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid order data: Missing user ID or items' },
        { status: 400 }
      );
    }

    let coupon = null;
    try {
      coupon = await validateCoupon(orderData);
      orderData = await applyCouponDiscount(orderData, coupon);

    } catch (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    await enrichOrderWithSellerIds(orderData);

  

    const order = new Order({
      user: orderData.user,
      items: orderData.items.map((item) => ({
        product: item.product._id || item.product,
        name: item.product.name || item.name,
        quantity: item.quantity,
        price: item.price,
        size: item.size || '',
        color: item.color || '',
        images: item.product.images ? item.product.images.map((image) => ({
          url: image.url,
          public_id: image.public_id
        })) : [],
        sellerId: item.sellerId
      })),
      shippingAddress: {
        street: orderData.shippingAddress.street || orderData.shippingAddress.address,
        city: orderData.shippingAddress.city,
        state: orderData.shippingAddress.state || 'Punjab',
        zipCode: orderData.shippingAddress.zipCode || '00000',
        country: orderData.shippingAddress.country
      },
      paymentMethod: orderData.paymentMethod || 'Credit Card',
      itemsPrice: orderData.itemsPrice || (orderData.totalAmount - orderData.shippingPrice),
      taxPrice: orderData.taxPrice || 0,
      shippingPrice: orderData.shippingPrice || orderData.shippingCost || 0,
      totalPrice: orderData.totalPrice || orderData.totalAmount,
      coupon: orderData.coupon || null,
      couponDiscount: orderData.couponDiscount || 0,
      isPaid: orderData.paymentMethod === 'Cash on Delivery' ? false : true,
      paidAt: orderData.paymentMethod === 'Cash on Delivery' ? null : new Date(),
      status: 'processing'
    });

      await Promise.all(
      order.items.map(async (item) => {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { stock: -item.quantity } } // decrease stock
        );
      })
    );

    await order.save();


    try {
      await Cart.findOneAndUpdate(
        { user: orderData.user },
        { $set: { items: [], totalItems: 0, totalPrice: 0 } }
      );
    } catch (error) {
      console.error('Error clearing cart:', error);
    }

    // Update seller orders
    await updateSellerOrders(orderData, order._id);

    // Get user details for email
    const user = await User.findById(orderData.user);
    if (!user || !user.email) {
      console.error('User email not found for order confirmation');
    } else {
      // Send confirmation email (async, don't wait for it)
      sendOrderConfirmationEmail(order, user);
    }

    // Populate the order for response
    const populatedOrder = await Order.findById(order._id).populate('items.product');

    return NextResponse.json({
      success: true,
      order: populatedOrder,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      {
        error: 'Failed to create order',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// GET Handler
export async function GET(req) {
  try {
    await connectDB();
    const userId = req.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists and get their role
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let orders;

    if (user.role === "admin") {
      // Admin can see all orders
      orders = await Order.find()
        .sort({ createdAt: -1 })
        .populate('user', 'name email')
        .populate('items.product')
        .populate('coupon');
    } else {
      // Regular users see only their orders
      orders = await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate('items.product')
        .populate('coupon');
    }

    return NextResponse.json({
      success: true,
      orders,
      count: orders.length
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch orders',
        details: error.message
      },
      { status: 500 }
    );
  }
}