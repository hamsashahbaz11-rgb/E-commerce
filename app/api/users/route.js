import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// GET all users (admin only)
export async function GET(request) {
  try {
    await connectDB();
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      createdAt: Date,
      updatedAt: Date,
      cart: Array,
      wishlist: Array,
      orders: Array
    }));
    
    const users = await User.find({}, { password: 0 }).lean();
    
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST - Register a new user
export async function POST(request) {
  try {
    const { name, email, password, role = 'customer' } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    // Connect to database
    await connectDB();
    
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      createdAt: Date,
      updatedAt: Date,
      cart: Array,
      wishlist: Array,
      orders: Array
    }));
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      cart: [],
      wishlist: [],
      orders: []
    });

    const savedUser = await newUser.save();
    
    // Create JWT token
    const token = jwt.sign(
      { id: savedUser._id, email, role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Return user without password
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    
    return NextResponse.json({ 
      message: 'User registered successfully',
      user: userResponse,
      token
    }, { status: 201 });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
  }
}