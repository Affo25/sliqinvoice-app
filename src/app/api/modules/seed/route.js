import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Module from '../../../../models/modules';

// POST /api/modules/seed - Seed database with sample modules
export async function POST(request) {
  try {
    await connectDB();

    // Check if modules already exist
    const existingModules = await Module.countDocuments();
    if (existingModules > 0) {
      return NextResponse.json({
        success: false,
        message: 'Modules already exist in the database. Clear the collection first if you want to re-seed.'
      }, { status: 400 });
    }

    // Sample modules data
    const sampleModules = [
      {
        name: 'Products Management',
        module_key: 'products',
        status: 'active',
        description: 'Manage products, inventory, and product categories'
      },
      {
        name: 'Customer Management',
        module_key: 'customers',
        status: 'active',
        description: 'Manage customer information, contact details, and customer relationships'
      },
      {
        name: 'Invoice Management',
        module_key: 'invoices',
        status: 'active',
        description: 'Create, manage, and track invoices and billing'
      },
      {
        name: 'Quotations',
        module_key: 'quotations',
        status: 'active',
        description: 'Generate and manage quotations for customers'
      },
      {
        name: 'Payments',
        module_key: 'payments',
        status: 'active',
        description: 'Track payments, payment methods, and payment history'
      },
      {
        name: 'Supplier Management',
        module_key: 'suppliers',
        status: 'active',
        description: 'Manage supplier information and relationships'
      },
      {
        name: 'Accounting',
        module_key: 'accounting',
        status: 'active',
        description: 'Financial accounting, ledger management, and reporting'
      },
      {
        name: 'Reports',
        module_key: 'reports',
        status: 'active',
        description: 'Generate various business reports and analytics'
      },
      {
        name: 'User Management',
        module_key: 'users',
        status: 'active',
        description: 'Manage system users, roles, and permissions'
      },
      {
        name: 'Settings',
        module_key: 'settings',
        status: 'active',
        description: 'System configuration and application settings'
      },
      {
        name: 'Dashboard',
        module_key: 'dashboard',
        status: 'active',
        description: 'Main dashboard with overview and key metrics'
      },
      {
        name: 'Archive',
        module_key: 'archive',
        status: 'inactive',
        description: 'Archive old records and documents'
      },
      {
        name: 'Notifications',
        module_key: 'notifications',
        status: 'active',
        description: 'Email and in-app notification system'
      },
      {
        name: 'File Manager',
        module_key: 'files',
        status: 'active',
        description: 'Upload and manage documents and files'
      },
      {
        name: 'Backup System',
        module_key: 'backup',
        status: 'inactive',
        description: 'Automated backup and restore functionality'
      }
    ];

    // Insert all sample modules
    const insertedModules = await Module.insertMany(sampleModules);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${insertedModules.length} modules`,
      modules: insertedModules.map(module => ({
        id: module._id.toString(),
        module_id: module.module_id, // This will be auto-generated
        name: module.name,
        module_key: module.module_key,
        status: module.status,
        description: module.description
      }))
    }, { status: 201 });

  } catch (error) {
    console.error('Error seeding modules:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to seed modules', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/modules/seed - Clear all modules (for development purposes)
export async function DELETE(request) {
  try {
    await connectDB();

    const result = await Module.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} modules`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error clearing modules:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to clear modules', error: error.message },
      { status: 500 }
    );
  }
}