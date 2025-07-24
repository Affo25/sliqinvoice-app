
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Customer from '../../../models/customers';
import User from '../../../models/user_models';
import bcrypt from 'bcryptjs';

// GET /api/customers - Fetch customers with filters and pagination
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const search = searchParams.get('search') || '';
    const statuses = searchParams.get('statuses') ? searchParams.get('statuses').split(',') : [];
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    let query = {};
    
    // Search functionality
    if (search.trim()) {
      query.$or = [
        { company_name: { $regex: search, $options: 'i' } },
        { contact_email: { $regex: search, $options: 'i' } },
        { contact_phone: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (statuses.length > 0) {
      query.subscription_status = { $in: statuses };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const [customers, totalCount] = await Promise.all([
      Customer.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Customer.countDocuments(query)
    ]);

    // Format customers for frontend
    const formattedCustomers = customers.map(customer => ({
      id: customer._id.toString(),
      _id: customer._id.toString(),
      company_name: customer.company_name,
      contact_email: customer.contact_email,
      contact_phone: customer.contact_phone || '',
      address: customer.address || '',
      package_id: customer.package_id?.toString() || null,
      subscription_status: customer.subscription_status,
      permissions: customer.permissions || [],
      avatar: '/images/avatar/a-sm.jpg',
      createdAt: customer.createdAt?.toISOString().split('T')[0] || '',
      updatedAt: customer.updatedAt?.toISOString().split('T')[0] || ''
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      customers: formattedCustomers,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        search,
        statuses,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch customers', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/customers - Create new customer
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      company_name,
      contact_email,
      contact_phone,
      password,
      address,
      package_id,
      subscription_status,
      permissions = [],
    } = body;

    // Validate required fields
    if (!company_name || !contact_email || !password) {
      return NextResponse.json(
        { success: false, message: 'Company name, contact email, and password are required' },
        { status: 400 }
      );
    }

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ contact_email });
    if (existingCustomer) {
      return NextResponse.json(
        { success: false, message: 'Customer with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create customer
    const newCustomer = new Customer({
      company_name,
      contact_email,
      contact_phone: contact_phone || '',
      password: hashedPassword,
      address: address || '',
      package_id: package_id || null,
      subscription_status: subscription_status || 'active',
      permissions,
    });

    const savedCustomer = await newCustomer.save();

    // Create corresponding user record
    try {
      // Extract names from company name or use defaults
      const companyWords = company_name.trim().split(' ');
      const firstName = companyWords[0] || 'Customer';
      const lastName = companyWords.length > 1 ? companyWords.slice(1).join(' ') : 'User';

      const newUser = new User({
        email: contact_email,
        password_hash: hashedPassword,
        client_id: savedCustomer._id, // Link to customer ID
        first_name: firstName,
        last_name: lastName,
        role: 'customers',
        permissions: permissions || [],
        is_active: subscription_status === 'active',
      });

      await newUser.save();
      console.log('✅ User record created successfully for customer:', contact_email);
    } catch (userError) {
      console.error('⚠️ Failed to create user record for customer:', contact_email, userError);
      // Don't fail the customer creation if user creation fails
      // The customer is already saved, so we'll just log the error
    }

    // Format response
    const formattedCustomer = {
      id: savedCustomer._id.toString(),
      _id: savedCustomer._id.toString(),
      company_name: savedCustomer.company_name,
      contact_email: savedCustomer.contact_email,
      contact_phone: savedCustomer.contact_phone,
      address: savedCustomer.address,
      package_id: savedCustomer.package_id?.toString() || null,
      subscription_status: savedCustomer.subscription_status,
      permissions: savedCustomer.permissions,
      avatar: '/images/avatar/a-sm.jpg',
      createdAt: savedCustomer.createdAt?.toISOString().split('T')[0] || '',
      updatedAt: savedCustomer.updatedAt?.toISOString().split('T')[0] || ''
    };

    return NextResponse.json({
      success: true,
      message: 'Customer created successfully',
      customer: formattedCustomer
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create customer', error: error.message },
      { status: 500 }
    );
  }
}

