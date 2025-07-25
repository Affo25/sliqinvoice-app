import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Module from '../../../../models/modules';
import * as XLSX from 'xlsx';

// GET /api/modules/export - Export modules to Excel
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    // Build query
    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { module_key: { $regex: search, $options: 'i' } },
        { module_id: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status !== 'all') {
      query.status = status;
    }

    // Fetch all matching modules
    const modules = await Module.find(query)
      .sort({ created_time: -1 });

    // Prepare data for Excel export
    const excelData = modules.map(module => ({
      'Module ID': module.module_id,
      'Name': module.name,
      'Module Key': module.module_key,
      'Status': module.status,
      'Description': module.description || '',
      'Created Date': module.created_time?.toISOString().split('T')[0] || '',
      'Updated Date': module.updated_time?.toISOString().split('T')[0] || ''
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 15 }, // Module ID
      { wch: 25 }, // Name
      { wch: 20 }, // Module Key
      { wch: 12 }, // Status
      { wch: 30 }, // Description
      { wch: 15 }, // Created Date
      { wch: 15 }  // Updated Date
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Modules');

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'buffer' 
    });

    // Create filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `modules_export_${timestamp}.xlsx`;

    // Return Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': excelBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error exporting modules:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to export modules', error: error.message },
      { status: 500 }
    );
  }
}