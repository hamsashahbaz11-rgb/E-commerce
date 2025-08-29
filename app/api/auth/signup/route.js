import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    await connectDB();
    
    const { name, email, password , role , area } = await req.json(); 

    if(!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password and role are required' },
        { status: 400 }
      );
    }
    if(!area && role === "deliveryman") { 
      return NextResponse.json(
        { error: 'Area is required when role is deliveryman' },
        { status: 400 }
      );
    }
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    let userData ;
    if (role === "deliveryman") {
           userData = {
                name,
                email,
                password,
                role,
                deliverymanInfo: {
                    area
          }
          };



} else {
   userData = {
    name,
    email,
    password,
    role
  };
  
}

const user = await User.create(userData);

    

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '300d' }
    ); 

    // Create response
    const response = NextResponse.json(
      { message: 'User created successfully', userId: user._id , token, email: user.email } ,
      { status: 201 }
    );
    
    // Set JWT token in HTTP-only cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 300 // 300 days
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Error creating user' },
      { status: 500 }
    );
  }
}