import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Customer from '../../../../models/customers';
import * as XLSX from 'xlsx';

// GET /api/customers/export - Export customers to Excel
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    
    // Extract filters from query parameters
    const search = searchParams.get('search') || '';
    const statuses = searchParams.get('statuses') ? searchParams.get('statuses').split(',') : [];
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

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Fetch all customers (no pagination for export)
    const customers = await Customer.find(query)
      .sort(sort)
      .lean();

    if (customers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No customers found to export' },
        { status: 404 }
      );
    }

    // Prepare data for Excel export
    const exportData = customers.map((customer, index) => ({
      'S.No': index + 1,
      'Company Name': customer.company_name,
      'Contact Email': customer.contact_email,
      'Contact Phone': customer.contact_phone || '',
      'Address': customer.address || '',
      'Package ID': customer.package_id?.toString() || '',
      'Subscription Status': customer.subscription_status,
      'Permissions': customer.permissions?.join(', ') || '',
      'Created Date': customer.createdAt?.toISOString().split('T')[0] || '',
      'Updated Date': customer.updatedAt?.toISOString().split('T')[0] || ''
    }));

    // Create Excel workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Auto-size columns
    const columnWidths = [
      { wch: 8 },   // S.No
      { wch: 25 },  // Company Name
      { wch: 30 },  // Contact Email
      { wch: 15 },  // Contact Phone
      { wch: 40 },  // Address
      { wch: 15 },  // Package ID
      { wch: 18 },  // Subscription Status
      { wch: 30 },  // Permissions
      { wch: 12 },  // Created Date
      { wch: 12 }   // Updated Date
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    });

    // Create filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `customers-export-${timestamp}.xlsx`;

    // Set response headers for file download
    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Content-Length', excelBuffer.length.toString());

    return new NextResponse(excelBuffer, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Error exporting customers:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to export customers', error: error.message },
      { status: 500 }
    );
  }
}