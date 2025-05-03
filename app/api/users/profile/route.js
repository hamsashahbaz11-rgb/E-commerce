import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { verifyToken } from '@/lib/auth';
import User from '@/models/User';

// Get user profile using JWT token
export async function GET(request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    
    const { db } = await connectDB();
    const objectId = new ObjectId(decoded.id);
    
    // Find user by ID
    const user = await User.findOne(
      { _id: objectId },
      { projection: { password: 0 } } // Exclude password
    );
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// Update user profile
export async function PATCH(request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    
    const updateData = await request.json();
    
    // Remove fields that shouldn't be updated directly
    const { password, _id, role, ...safeUpdateData } = updateData;
    
    // Add updatedAt timestamp
    safeUpdateData.updatedAt = new Date();

    const { db } = await connectToDatabase();
    const objectId = new ObjectId(decoded.id);
    
    // Update user
    const result = await User.updateOne(
      { _id: objectId },
      { $set: safeUpdateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get updated user
    const updatedUser = await User.findOne(
      { _id: objectId },
      { projection: { password: 0 } }
    );
    
    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: updatedUser
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}