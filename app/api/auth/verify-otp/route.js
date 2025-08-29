import { NextResponse } from 'next/server';
import Otp from '@/models/Otp';
import connectDB from '@/lib/db';
import bcrypt from 'bcryptjs'

// Should be shared or use a DB/cache

export async function POST(request) {

  try {


    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    await connectDB()

    const otpDoc = await Otp.findOne({ email, expiresAt: { $gt: new Date() }, used: false });
    console.log(otp)
    if (!otpDoc) {
      return NextResponse.json({ error: 'Could not get otp from db!' }, { status: 400 })
    }

    const isMatch = await bcrypt.compare(otp.trim(), otpDoc.otp);
    otpDoc.deleteOne(); // Invalidate OTP after successful verification
    return NextResponse.json({ message: 'OTP verified successfully' });

  } catch (error) {
  return NextResponse.json({ error: `Invalid OTP ${error}` }, { status: 401 });
}
}