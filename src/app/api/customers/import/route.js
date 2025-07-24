import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Customer from '../../../../models/customers';
import * as XLSX from 'xlsx';

// POST /api/customers/import - Import customers from Excel
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

    // Check file type
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file format. Please upload Excel file (.xlsx or .xls)' },
        { status: 400 }
      );
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    if (jsonData.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Excel file is empty or has no valid data' },
        { status: 400 }
      );
    }

    // Process and validate data
    const results = {
      created: 0,
      updated: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 2; // Excel row number (starting from 2 due to header)
      
      try {
        // Extract and validate required fields
        const company_name = row['Company Name']?.toString().trim();
        const contact_email = row['Contact Email']?.toString().trim().toLowerCase();
        const contact_phone = row['Contact Phone']?.toString().trim() || '';
        const address = row['Address']?.toString().trim() || '';
        const subscription_status = row['Subscription Status']?.toString().trim().toLowerCase() || 'active';
        const permissions = row['Permissions'] ? 
          row['Permissions'].toString().split(',').map(p => p.trim()).filter(p => p) : 
          [];

        // Validate required fields
        if (!company_name || !contact_email) {
          results.failed++;
          results.errors.push(`Row ${rowNumber}: Company name and contact email are required`);
          continue;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contact_email)) {
          results.failed++;
          results.errors.push(`Row ${rowNumber}: Invalid email format for ${contact_email}`);
          continue;
        }

        // Validate subscription status
        const validStatuses = ['active', 'suspended', 'cancelled'];
        if (!validStatuses.includes(subscription_status)) {
          results.failed++;
          results.errors.push(`Row ${rowNumber}: Invalid subscription status. Must be one of: ${validStatuses.join(', ')}`);
          continue;
        }

        // Check if customer exists (upsert logic)
        const existingCustomer = await Customer.findOne({ contact_email });
        
        const customerData = {
          company_name,
          contact_email,
          contact_phone,
          address,
          subscription_status,
          permissions
        };

        if (existingCustomer) {
          // Update existing customer
          await Customer.findByIdAndUpdate(
            existingCustomer._id,
            customerData,
            { new: true, runValidators: true }
          );
          results.updated++;
        } else {
          // Create new customer
          const newCustomer = new Customer(customerData);
          await newCustomer.save();
          results.created++;
        }

      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${rowNumber}: ${error.message}`);
        console.error(`Error processing row ${rowNumber}:`, error);
      }
    }

    // Prepare response message
    let message = 'Import completed. ';
    if (results.created > 0) message += `${results.created} customers created. `;
    if (results.updated > 0) message += `${results.updated} customers updated. `;
    if (results.failed > 0) message += `${results.failed} customers failed.`;

    return NextResponse.json({
      success: true,
      message: message.trim(),
      summary: {
        total: jsonData.length,
        created: results.created,
        updated: results.updated,
        failed: results.failed
      },
      errors: results.errors.slice(0, 10) // Limit errors to first 10
    });

  } catch (error) {
    console.error('Error importing customers:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to import customers', error: error.message },
      { status: 500 }
    );
  }
}