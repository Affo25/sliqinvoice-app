import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Module from '../../../../models/modules';
import * as XLSX from 'xlsx';

// POST /api/modules/import - Import modules from Excel
export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No data found in the Excel file' },
        { status: 400 }
      );
    }

    const results = {
      created: 0,
      updated: 0,
      failed: 0,
      errors: []
    };

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 2; // Excel row number (accounting for header)

      try {
        // Extract and validate data from Excel columns
        const moduleData = {
          module_id: row['Module ID']?.toString().trim(),
          name: row['Name']?.toString().trim(),
          module_key: row['Module Key']?.toString().trim(),
          status: row['Status']?.toString().toLowerCase().trim() || 'active',
          description: row['Description']?.toString().trim() || ''
        };

        // Validate required fields
        if (!moduleData.module_id || !moduleData.name || !moduleData.module_key) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            error: 'Missing required fields: Module ID, Name, and Module Key are required'
          });
          continue;
        }

        // Validate status
        const validStatuses = ['active', 'inactive'];
        if (!validStatuses.includes(moduleData.status)) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            error: `Invalid status '${moduleData.status}'. Must be one of: active, inactive`
          });
          continue;
        }

        // Check if module exists (by module_id or module_key)
        const existingModule = await Module.findOne({
          $or: [
            { module_id: moduleData.module_id },
            { module_key: moduleData.module_key }
          ]
        });

        if (existingModule) {
          // Update existing module
          await Module.findByIdAndUpdate(
            existingModule._id,
            {
              ...moduleData,
              updated_time: new Date()
            },
            { runValidators: true }
          );
          results.updated++;
        } else {
          // Create new module
          const newModule = new Module(moduleData);
          await newModule.save();
          results.created++;
        }

      } catch (error) {
        results.failed++;
        results.errors.push({
          row: rowNumber,
          error: error.message || 'Unknown error occurred'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Import completed',
      summary: {
        total: jsonData.length,
        created: results.created,
        updated: results.updated,
        failed: results.failed
      },
      errors: results.errors.slice(0, 10) // Limit to first 10 errors
    });

  } catch (error) {
    console.error('Error importing modules:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to import modules', error: error.message },
      { status: 500 }
    );
  }
}