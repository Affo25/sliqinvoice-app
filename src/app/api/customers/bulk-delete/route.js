import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Customer from '../../../../models/customers';
import mongoose from 'mongoose';

// DELETE /api/customers/bulk-delete - Delete multiple customers
export async function DELETE(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { customerIds } = body;
    
    // Validate input
    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Customer IDs array is required' },
        { status: 400 }
      );
    }

    // Validate all ObjectIds
    const invalidIds = customerIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { success: false, message: `Invalid customer ID format: ${invalidIds.join(', ')}` },
        { status: 400 }
      );
    }

    // Find customers to be deleted (for response)
    const customersToDelete = await Customer.find({ 
      _id: { $in: customerIds } 
    }).select('_id company_name contact_email').lean();

    // Delete customers
    const deleteResult = await Customer.deleteMany({ 
      _id: { $in: customerIds } 
    });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'No customers found to delete' },
        { status: 404 }
      );
    }

    // Format response
    const deletedCustomers = customersToDelete.map(customer => ({
      id: customer._id.toString(),
      company_name: customer.company_name,
      contact_email: customer.contact_email
    }));

    return NextResponse.json({
      success: true,
      message: `${deleteResult.deletedCount} customer(s) deleted successfully`,
      deletedCount: deleteResult.deletedCount,
      customers: deletedCustomers
    });

  } catch (error) {
    console.error('Error bulk deleting customers:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete customers', error: error.message },
      { status: 500 }
    );
  }
}