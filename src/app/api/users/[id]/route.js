import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/user_models';
import bcrypt from 'bcryptjs';

// GET /api/users/[id] - Fetch single user by ID
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    const user = await User.findById(id)
      .select('-password_hash')
      .populate('client_id', 'name');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const formattedUser = {
      id: user._id.toString(),
      _id: user._id.toString(),
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      is_active: user.is_active,
      client_id: user.client_id,
      client_name: user.client_id?.name || null,
      avatar: '/images/avatar/a-sm.jpg',
      lastLogin: 'N/A',
      createdAt: user.createdAt?.toISOString().split('T')[0] || '',
      updatedAt: user.updatedAt?.toISOString().split('T')[0] || ''
    };

    return NextResponse.json({
      success: true,
      user: formattedUser
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user', error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const body = await request.json();
    const {
      email,
      password,
      first_name,
      last_name,
      role,
      permissions,
      is_active,
      client_id
    } = body;

    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Validate role if provided
    if (role) {
      const validRoles = ['superAdmin', 'moderator', 'customers', 'customerUsers'];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { success: false, message: 'Invalid role' },
          { status: 400 }
        );
      }
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: id } });
      if (emailExists) {
        return NextResponse.json(
          { success: false, message: 'Email already in use by another user' },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData = {};
    if (email) updateData.email = email;
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (role) updateData.role = role;
    if (permissions !== undefined) updateData.permissions = permissions;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (client_id !== undefined) updateData.client_id = client_id || null;

    // Hash password if provided
    if (password) {
      const saltRounds = 12;
      updateData.password_hash = await bcrypt.hash(password, saltRounds);
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('client_id', 'name');

    // Format response
    const formattedUser = {
      id: updatedUser._id.toString(),
      _id: updatedUser._id.toString(),
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      email: updatedUser.email,
      role: updatedUser.role,
      permissions: updatedUser.permissions,
      is_active: updatedUser.is_active,
      client_id: updatedUser.client_id,
      client_name: updatedUser.client_id?.name || null,
      avatar: '/images/avatar/a-sm.jpg',
      lastLogin: 'N/A',
      createdAt: updatedUser.createdAt?.toISOString().split('T')[0] || '',
      updatedAt: updatedUser.updatedAt?.toISOString().split('T')[0] || ''
    };

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: formattedUser
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update user', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user
    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete user', error: error.message },
      { status: 500 }
    );
  }
}