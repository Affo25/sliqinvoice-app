import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/user_models';
import bcrypt from 'bcryptjs';

// GET /api/users - Fetch users with filters and pagination
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const roles = searchParams.get('roles') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 2;
    const export_data = searchParams.get('export') === 'true';

    // Build query
    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { first_name: { $regex: search, $options: 'i' } },
        { last_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status !== 'all') {
      if (status === 'active') {
        query.is_active = true;
      } else if (status === 'inactive') {
        query.is_active = false;
      }
    }

    // Roles filter
    if (roles) {
      const roleArray = roles.split(',').filter(role => role.trim());
      if (roleArray.length > 0) {
        query.role = { $in: roleArray };
      }
    }

    // If export, return all matching records
    if (export_data) {
      const users = await User.find(query)
        .select('-password_hash')
        .populate('client_id', 'name')
        .sort({ createdAt: -1 });

      return NextResponse.json({
        success: true,
        users,
        totalCount: users.length
      });
    }

    // Pagination
    const skip = (page - 1) * limit;
    const totalCount = await User.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const users = await User.find(query)
      .select('-password_hash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Format users data
    const formattedUsers = users.map(user => ({
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
      avatar: '/images/avatar/a-sm.jpg', // Default avatar
      lastLogin: 'N/A', // TODO: Implement last login tracking
      createdAt: user.createdAt?.toISOString().split('T')[0] || '',
      updatedAt: user.updatedAt?.toISOString().split('T')[0] || ''
    }));

    const pagination = {
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      totalCount
    };

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      totalCount,
      pagination
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      email,
      password,
      first_name,
      last_name,
      role,
      permissions = [],
      is_active = true,
      client_id = null
    } = body;

    // Validate and convert client_id if provided
    let validClientId = null;
    if (client_id && client_id !== '') {
      try {
        // Check if it's already a valid ObjectId format
        if (typeof client_id === 'string' && client_id.match(/^[0-9a-fA-F]{24}$/)) {
          const mongoose = require('mongoose');
          validClientId = new mongoose.Types.ObjectId(client_id);
        }
      } catch (error) {
        console.log('Invalid client_id format, setting to null');
        validClientId = null;
      }
    }

    // Validate required fields
    if (!email || !password || !first_name || !last_name || !role) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['superAdmin', 'moderator', 'customers', 'customerUsers'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = new User({
      email,
      password_hash,
      first_name,
      last_name,
      role,
      permissions,
      is_active,
      client_id: validClientId
    });

    const savedUser = await newUser.save();

    // Format response (exclude password_hash)
    const formattedUser = {
      id: savedUser._id.toString(),
      _id: savedUser._id.toString(),
      first_name: savedUser.first_name,
      last_name: savedUser.last_name,
      email: savedUser.email,
      role: savedUser.role,
      permissions: savedUser.permissions,
      is_active: savedUser.is_active,
      client_id: savedUser.client_id,
      avatar: '/images/avatar/a-sm.jpg',
      lastLogin: 'Never',
      createdAt: savedUser.createdAt?.toISOString().split('T')[0] || '',
      updatedAt: savedUser.updatedAt?.toISOString().split('T')[0] || ''
    };

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: formattedUser
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create user', error: error.message },
      { status: 500 }
    );
  }
}