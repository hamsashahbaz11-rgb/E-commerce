import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Coupon from '@/models/Coupon';
import User from '@/models/User';
import { isAdmin, isAuthenticated } from '@/lib/auth';


export async function POST(req) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const user = await User.findById(userId);

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const couponData = await req.json();
    if (!couponData) {
      return NextResponse.json(
        { error: 'Could not get coupon code', details: error.message },
        { status: 500 }
      );
    }

    const coupon = new Coupon(couponData);
    await coupon.save();

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create coupon', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();

    const code = req.nextUrl.searchParams.get('code');

    if (code) {
      const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      });

      if (!coupon) {
        return NextResponse.json({ error: 'Invalid or expired coupon' }, { status: 400 });
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });
      }

      return NextResponse.json({ success: true, coupon });
    }


    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const user = await User.findById(userId)

    

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, coupons });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch coupons', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const couponId = url.searchParams.get('couponId');
    const userId = url.searchParams.get('userId');
    const user = await User.findById(userId)

    if (!user || user.role != "admin") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = couponId;
    const { ...updateData } = await req.json();
    const coupon = await Coupon.findByIdAndUpdate(id, updateData, { new: true });

    if(!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update coupon', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const url = new URL(req.url)
    const couponId = url.searchParams.get("couponId")
    const userId = url.searchParams.get("userId");

    const user = await isAdmin(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    const coupon = await Coupon.findByIdAndDelete(couponId);

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete coupon', details: error.message },
      { status: 500 }
    );
  }
}