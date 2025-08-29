import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '@/models/User'; 
import { isAuthenticated } from '@/lib/auth';

// GET user by ID
export async function GET(request, { params }) {
  try { 
    const requestyUser = isAuthenticated(request);
    if(!requestyUser){
      return NextResponse.json({error: "UnAuthorized Request"}, {status: 404})
    }
    const { id } = await params;
 
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

     await connectDB();
     
    const objectId = new mongoose.Types.ObjectId(id)
    
  
    const user  = await User.findById(objectId) 
    if (!user) { 
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// UPDATE user by ID
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const updateData = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Remove fields that shouldn't be updated directly
    const { password, _id, role, ...safeUpdateData } = updateData;
    
    // Add updatedAt timestamp
    safeUpdateData.updatedAt = new Date();

    await connectDB();
    const objectId = new ObjectId(id);
    
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
      message: 'User updated successfully',
      user: updatedUser
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE user by ID
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await connectDB();
    const objectId = new ObjectId(id);
    
    // Delete user
    const result = await User.deleteOne({ _id: objectId });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: 'User deleted successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}