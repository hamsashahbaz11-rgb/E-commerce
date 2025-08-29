
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { ObjectId } from 'mongodb';
import { verifyToken } from '@/lib/auth';
import User from '@/models/User';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Get user profile using JWT token
export async function GET(request) {
  try { 
    
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No authorization header or invalid format');
      return NextResponse.json({ 
        error: 'Authentication required',
        details: 'Please provide a valid Bearer token in the Authorization header'
      }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
      if (!decoded) throw new Error('Token verification failed');
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      return NextResponse.json({ 
        error: 'Invalid authentication',
        details: 'Your session has expired or is invalid. Please log in again.'
      }, { status: 401 });
    }
    
    // Users can only access their own profile
    const userId = decoded.id;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Invalid user ID format:', userId);
      return NextResponse.json({ 
        error: 'Invalid user ID format',
        details: 'The user ID from the token is not valid'
      }, { status: 400 });
    }
    
    try {
      await connectDB();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: process.env.NODE_ENV === 'development' ? dbError.message : 'Internal server error'
      }, { status: 500 });
    }
    
    // Find user by ID
    const user = await User.findById(userId).select('-password');
     
    if (!user) {
        return NextResponse.json({ 
        error: 'User not found',
        details: 'The requested user profile does not exist'
      }, { status: 404 });
    }
    
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch profile',
      details: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while retrieving your profile',
      code: error.code || 'UNKNOWN_ERROR'
    }, { status: 500 });
  }
}

// Update user profile - Enhanced version
export async function PATCH(request) {
  try {
     
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Authentication required',
        details: 'Please provide a valid Bearer token in the Authorization header'
      }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
      if (!decoded) throw new Error('Token verification failed');
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      return NextResponse.json({ 
        error: 'Invalid authentication',
        details: 'Your session has expired or is invalid. Please log in again.'
      }, { status: 401 });
    }
    
    const userId = decoded.id;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ 
        error: 'Invalid user ID format',
        details: 'The user ID from the token is not valid'
      }, { status: 400 });
    }
    
    const updateData = await request.json();
     // Connect to database
    await connectDB();
    
    // Find the current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return NextResponse.json({ 
        error: 'User not found',
        details: 'The user profile does not exist'
      }, { status: 404 });
    }
    
    // Prepare update object
    const updateObject = {};
    
    // Handle basic user information updates
    if (updateData.name && updateData.name.trim()) {
      updateObject.name = updateData.name.trim();
    }
    
    if (updateData.email && updateData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        return NextResponse.json({ 
          error: 'Invalid email format',
          details: 'Please provide a valid email address'
        }, { status: 400 });
      }
      
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ 
        email: updateData.email.trim(),
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        return NextResponse.json({ 
          error: 'Email already exists',
          details: 'This email is already registered to another account'
        }, { status: 409 });
      }
      
      updateObject.email = updateData.email.trim();
    }
    
    // Handle password update
    if (updateData.currentPassword && updateData.newPassword) {
      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(updateData.currentPassword, currentUser.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ 
          error: 'Incorrect current password',
          details: 'The current password you entered is incorrect'
        }, { status: 400 });
      }
      
      // Validate new password
      if (updateData.newPassword.length < 6) {
        return NextResponse.json({ 
          error: 'Password too short',
          details: 'New password must be at least 6 characters long'
        }, { status: 400 });
      }
      
      if (updateData.newPassword !== updateData.confirmPassword) {
        return NextResponse.json({ 
          error: 'Passwords do not match',
          details: 'New password and confirmation password do not match'
        }, { status: 400 });
      }
      
      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(updateData.newPassword, saltRounds);
      updateObject.password = hashedPassword;
    }
    
    // Handle seller information updates
    if (updateData.sellerInfo && currentUser.isSeller) {
      const sellerInfo = updateData.sellerInfo;
      const currentSellerInfo = currentUser.sellerInfo || {};
      
      // Create seller info update object
      const sellerInfoUpdate = {};
      
      if (sellerInfo.shopName && sellerInfo.shopName.trim()) {
        // Check if shop name is unique (optional - depends on your business logic)
        const existingShop = await User.findOne({
          'sellerInfo.shopName': sellerInfo.shopName.trim(),
          _id: { $ne: userId }
        });
        
        if (existingShop) {
          return NextResponse.json({ 
            error: 'Shop name already exists',
            details: 'This shop name is already taken. Please choose a different name.'
          }, { status: 409 });
        }
        
        sellerInfoUpdate.shopName = sellerInfo.shopName.trim();
      }
      
      if (sellerInfo.businessType && sellerInfo.businessType.trim()) {
        sellerInfoUpdate.businessType = sellerInfo.businessType.trim();
      }
      
      if (sellerInfo.productsToSell && sellerInfo.productsToSell.trim()) {
        sellerInfoUpdate.productsToSell = sellerInfo.productsToSell.trim();
      }
      
      if (sellerInfo.description !== undefined) {
        sellerInfoUpdate.description = sellerInfo.description.trim();
      }
      
      // Update seller info fields
      if (Object.keys(sellerInfoUpdate).length > 0) {
        Object.keys(sellerInfoUpdate).forEach(key => {
          updateObject[`sellerInfo.${key}`] = sellerInfoUpdate[key];
        });
        
        // Update seller info updatedAt timestamp
        updateObject['sellerInfo.updatedAt'] = new Date();
      }
    }
    
    // Add general updatedAt timestamp
    updateObject.updatedAt = new Date();
    
    // If no valid updates, return error
    if (Object.keys(updateObject).length <= 1) { // Only updatedAt
      return NextResponse.json({ 
        error: 'No valid updates provided',
        details: 'Please provide valid data to update'
      }, { status: 400 });
    }
    
    
    // Perform the update
    const result = await User.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateObject }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        error: 'User not found',
        details: 'The user profile could not be found for update'
      }, { status: 404 });
    }
    
    if (result.modifiedCount === 0) {
      return NextResponse.json({ 
        error: 'No changes made',
        details: 'The provided data is the same as current data'
      }, { status: 400 });
    }
    
    // Get updated user (excluding password)
    const updatedUser = await User.findById(userId).select('-password');
    
    
    return NextResponse.json({ 
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ 
      error: 'Failed to update profile',
      details: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while updating your profile',
      code: error.code || 'UNKNOWN_ERROR'
    }, { status: 500 });
  }
}