// Import required dependencies and modules
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

// Handle POST request for changing user password
export async function POST(request) {
  try {
    // Extract and validate the Bearer token from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify JWT token and decode user information
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Extract current and new passwords from request body
    const { currentPassword, newPassword } = await request.json();

    // Validate that both passwords are provided
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ 
        error: 'Current password and new password are required' 
      }, { status: 400 });
    }

    // Connect to MongoDB database
    await connectDB();
    const objectId = new ObjectId(decoded.id);
    
    // Find user by ID from decoded token and explicitly select password field
    const user = await User.findOne({ _id: objectId }).select('+password');
    
    // Return error if user not found
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify if current password matches stored hash
    const isPasswordValid = await bcrypt.compare(currentPassword.toString(), user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // Generate salt and hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user document with new password hash and timestamp
    await User.updateOne(
      { _id: objectId },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        } 
      }
    );
    
    // Return success response
    return NextResponse.json({ 
      message: 'Password changed successfully'
    }, { status: 200 });
  } catch (error) {
    // Log and return error response
    console.error('Error changing password:', error);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}