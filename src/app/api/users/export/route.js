import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/user_models';
import * as XLSX from 'xlsx';

// GET /api/users/export - Export users to Excel
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const roles = searchParams.get('roles') || '';

    // Build query (same as main users API)
    let query = {};

    if (search) {
      query.$or = [
        { first_name: { $regex: search, $options: 'i' } },
        { last_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== 'all') {
      if (status === 'active') {
        query.is_active = true;
      } else if (status === 'inactive') {
        query.is_active = false;
      }
    }

    if (roles) {
      const roleArray = roles.split(',').filter(role => role.trim());
      if (roleArray.length > 0) {
        query.role = { $in: roleArray };
      }
    }

    // Fetch users
    const users = await User.find(query)
      .select('-password_hash')
      .populate('client_id', 'name')
      .sort({ createdAt: -1 });

    // Prepare data for Excel
    const excelData = users.map((user, index) => ({
      'S.No': index + 1,
      'First Name': user.first_name,
      'Last Name': user.last_name,
      'Email': user.email,
      'Role': user.role,
      'Status': user.is_active ? 'Active' : 'Inactive',
      'Client': user.client_id?.name || 'N/A',
      'Permissions': user.permissions.join(', ') || 'None',
      'Created Date': user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 8 },  // S.No
      { wch: 15 }, // First Name
      { wch: 15 }, // Last Name
      { wch: 25 }, // Email
      { wch: 15 }, // Role
      { wch: 10 }, // Status
      { wch: 20 }, // Client
      { wch: 30 }, // Permissions
      { wch: 15 }, // Created Date
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Create response with Excel file
    const response = new NextResponse(excelBuffer);
    response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.headers.set('Content-Disposition', `attachment; filename=users_export_${new Date().toISOString().split('T')[0]}.xlsx`);

    return response;

  } catch (error) {
    console.error('Error exporting users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to export users', error: error.message },
      { status: 500 }
    );
  }
}