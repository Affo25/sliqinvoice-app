import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Customer from '../../../../models/customers';
import User from '../../../../models/user_models';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// GET /api/customers/[id] - Fetch single customer by ID
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid customer ID format' },
        { status: 400 }
      );
    }

    const customer = await Customer.findById(id).lean();
    
    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }

    // Format customer response
    const formattedCustomer = {
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
    };

    return NextResponse.json({
      success: true,
      customer: formattedCustomer
    });

  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch customer', error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/customers/[id] - Update customer
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid customer ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      company_name,
      contact_email,
      contact_phone,
      password,
      address,
      package_id,
      subscription_status,
      permissions
    } = body;

    // Check if customer exists
    const existingCustomer = await Customer.findById(id);
    if (!existingCustomer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check if email is being changed and if new email already exists
    if (contact_email && contact_email !== existingCustomer.contact_email) {
      const emailExists = await Customer.findOne({ 
        contact_email, 
        _id: { $ne: id } 
      });
      
      if (emailExists) {
        return NextResponse.json(
          { success: false, message: 'Email already exists for another customer' },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData = {};
    if (company_name !== undefined) updateData.company_name = company_name;
    if (contact_email !== undefined) updateData.contact_email = contact_email;
    if (contact_phone !== undefined) updateData.contact_phone = contact_phone;
    if (address !== undefined) updateData.address = address;
    if (package_id !== undefined) updateData.package_id = package_id || null;
    if (subscription_status !== undefined) updateData.subscription_status = subscription_status;
    if (permissions !== undefined) updateData.permissions = permissions;

    // Handle password update
    let hashedPassword = null;
    if (password && password.trim() !== '') {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
      updateData.password = hashedPassword;
    }

    // Update customer
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!updatedCustomer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }

    // Update corresponding user record if it exists
    try {
      const userUpdateData = {};
      
      // Update email if changed
      if (contact_email !== undefined && contact_email !== existingCustomer.contact_email) {
        userUpdateData.email = contact_email;
      }
      
      // Update password if changed
      if (hashedPassword) {
        userUpdateData.password_hash = hashedPassword;
      }
      
      // Update permissions if changed
      if (permissions !== undefined) {
        userUpdateData.permissions = permissions;
      }
      
      // Update active status based on subscription status
      if (subscription_status !== undefined) {
        userUpdateData.is_active = subscription_status === 'active';
      }

      // Only update if there are changes
      if (Object.keys(userUpdateData).length > 0) {
        await User.findOneAndUpdate(
          { client_id: id }, // Find user by customer ID
          userUpdateData,
          { new: true }
        );
        console.log('✅ User record updated successfully for customer:', updatedCustomer.contact_email);
      }
    } catch (userError) {
      console.error('⚠️ Failed to update user record for customer:', updatedCustomer.contact_email, userError);
      // Don't fail the customer update if user update fails
    }

    // Format response
    const formattedCustomer = {
      id: updatedCustomer._id.toString(),
      _id: updatedCustomer._id.toString(),
      company_name: updatedCustomer.company_name,
      contact_email: updatedCustomer.contact_email,
      contact_phone: updatedCustomer.contact_phone || '',
      address: updatedCustomer.address || '',
      package_id: updatedCustomer.package_id?.toString() || null,
      subscription_status: updatedCustomer.subscription_status,
      permissions: updatedCustomer.permissions || [],
      avatar: '/images/avatar/a-sm.jpg',
      createdAt: updatedCustomer.createdAt?.toISOString().split('T')[0] || '',
      updatedAt: updatedCustomer.updatedAt?.toISOString().split('T')[0] || ''
    };

    return NextResponse.json({
      success: true,
      message: 'Customer updated successfully',
      customer: formattedCustomer
    });

  } catch (error) {
    console.error('Error updating customer:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to update customer', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/[id] - Delete customer
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid customer ID format' },
        { status: 400 }
      );
    }

    const deletedCustomer = await Customer.findByIdAndDelete(id);
    
    if (!deletedCustomer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully',
      customer: {
        id: deletedCustomer._id.toString(),
        company_name: deletedCustomer.company_name,
        contact_email: deletedCustomer.contact_email
      }
    });

  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete customer', error: error.message },
      { status: 500 }
    );
  }
}