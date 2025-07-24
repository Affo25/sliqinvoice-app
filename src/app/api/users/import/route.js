import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/user_models';
import * as XLSX from 'xlsx';
import bcrypt from 'bcryptjs';

// POST /api/users/import - Import users from Excel
export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !file.size) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { success: false, message: 'Please upload an Excel file (.xlsx or .xls)' },
        { status: 400 }
      );
    }

    // Read Excel file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (!jsonData || jsonData.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Excel file is empty or invalid' },
        { status: 400 }
      );
    }

    const validRoles = ['superAdmin', 'moderator', 'customers', 'customerUsers'];
    const results = {
      success: [],
      errors: [],
      updated: [],
      created: []
    };

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 2; // Excel row number (accounting for header)

      try {
        // Extract and validate data
        const email = row['Email']?.trim();
        const first_name = row['First Name']?.trim();
        const last_name = row['Last Name']?.trim();
        const role = row['Role']?.trim();
        const password = row['Password']?.trim() || 'defaultPassword123';
        const is_active = row['Status']?.trim().toLowerCase() === 'active';
        const permissions = row['Permissions'] ? 
          row['Permissions'].split(',').map(p => p.trim()).filter(p => p) : [];

        // Validate required fields
        if (!email || !first_name || !last_name || !role) {
          results.errors.push({
            row: rowNumber,
            email: email || 'N/A',
            error: 'Missing required fields (Email, First Name, Last Name, Role)'
          });
          continue;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          results.errors.push({
            row: rowNumber,
            email,
            error: 'Invalid email format'
          });
          continue;
        }

        // Validate role
        if (!validRoles.includes(role)) {
          results.errors.push({
            row: rowNumber,
            email,
            error: `Invalid role. Must be one of: ${validRoles.join(', ')}`
          });
          continue;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
          // Update existing user
          const updateData = {
            first_name,
            last_name,
            role,
            permissions,
            is_active
          };

          // Only update password if it's provided and different from default
          if (password && password !== 'defaultPassword123') {
            const saltRounds = 12;
            updateData.password_hash = await bcrypt.hash(password, saltRounds);
          }

          const updatedUser = await User.findByIdAndUpdate(
            existingUser._id,
            { $set: updateData },
            { new: true, runValidators: true }
          );

          results.updated.push({
            row: rowNumber,
            email,
            name: `${first_name} ${last_name}`,
            role,
            id: updatedUser._id.toString(),
            action: 'updated'
          });

          results.success.push({
            row: rowNumber,
            email,
            name: `${first_name} ${last_name}`,
            role,
            id: updatedUser._id.toString(),
            action: 'updated'
          });

        } else {
          // Create new user
          const saltRounds = 12;
          const password_hash = await bcrypt.hash(password, saltRounds);

          const newUser = new User({
            email,
            password_hash,
            first_name,
            last_name,
            role,
            permissions,
            is_active,
            client_id: null // TODO: Handle client mapping if needed
          });

          const savedUser = await newUser.save();

          results.created.push({
            row: rowNumber,
            email,
            name: `${first_name} ${last_name}`,
            role,
            id: savedUser._id.toString(),
            action: 'created'
          });

          results.success.push({
            row: rowNumber,
            email,
            name: `${first_name} ${last_name}`,
            role,
            id: savedUser._id.toString(),
            action: 'created'
          });
        }

      } catch (error) {
        results.errors.push({
          row: rowNumber,
          email: row['Email'] || 'N/A',
          error: error.message
        });
      }
    }

    // Prepare response
    const response = {
      success: true,
      message: `Import completed. ${results.created.length} users created, ${results.updated.length} users updated successfully.`,
      summary: {
        total: jsonData.length,
        successful: results.success.length,
        created: results.created.length,
        updated: results.updated.length,
        errors: results.errors.length,
        failed: results.errors.length
      },
      details: results
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error importing users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to import users', error: error.message },
      { status: 500 }
    );
  }
}