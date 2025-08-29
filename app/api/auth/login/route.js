import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    await connectDB(); 
    const { email, password } = await req.json();  
    const user = await User.findOne({ email }).select('+password');
     // Verify user exists and password matches
    if (!user || !(await bcrypt.compare(password, user.password))) {
    // if(!user || !(user.password == password)){
      return NextResponse.json(
        { error: `Invalid credentials ` },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '300d' }
    );
 
    // Return user data and token in response
    return NextResponse.json({
      userId: user._id,
      token: token,
      email: user.email
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error logging in' },
      { status: 500 }
    );
  }
}