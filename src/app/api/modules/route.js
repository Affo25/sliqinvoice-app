import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Module from '../../../models/modules';

// GET /api/modules - Fetch modules with filters and pagination
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const export_data = searchParams.get('export') === 'true';

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

    // If export, return all matching records
    if (export_data) {
      const modules = await Module.find(query)
        .sort({ created_time: -1 });

      return NextResponse.json({
        success: true,
        modules,
        totalCount: modules.length
      });
    }

    // Pagination
    const skip = (page - 1) * limit;
    const totalCount = await Module.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const modules = await Module.find(query)
      .sort({ created_time: -1 })
      .skip(skip)
      .limit(limit);

    // Format modules data
    const formattedModules = modules.map(module => ({
      id: module._id.toString(),
      _id: module._id.toString(),
      module_id: module.module_id,
      name: module.name,
      module_key: module.module_key,
      status: module.status,
      description: module.description || '',
      created_time: module.created_time?.toISOString().split('T')[0] || '',
      updated_time: module.updated_time?.toISOString().split('T')[0] || ''
    }));

    const pagination = {
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      totalCount
    };

    return NextResponse.json({
      success: true,
      modules: formattedModules,
      totalCount,
      pagination
    });

  } catch (error) {
    console.error('Error fetching modules:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch modules', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/modules - Create new module
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      module_id, // Optional - will be auto-generated if not provided
      name,
      module_key,
      status = 'active',
      description = ''
    } = body;

    // Validate required fields
    if (!name || !module_key) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: name and module_key are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['active', 'inactive'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status. Must be one of: active, inactive' },
        { status: 400 }
      );
    }

    // Check if module_key already exists
    const existingModule = await Module.findOne({ module_key });
    if (existingModule) {
      return NextResponse.json(
        { success: false, message: 'Module with this key already exists' },
        { status: 409 }
      );
    }

    // If module_id is provided, check for uniqueness
    if (module_id) {
      const existingModuleById = await Module.findOne({ module_id });
      if (existingModuleById) {
        return NextResponse.json(
          { success: false, message: 'Module with this ID already exists' },
          { status: 409 }
        );
      }
    }

    // Create module
    const newModule = new Module({
      module_id,
      name,
      module_key,
      status,
      description
    });

    const savedModule = await newModule.save();

    // Format response
    const formattedModule = {
      id: savedModule._id.toString(),
      _id: savedModule._id.toString(),
      module_id: savedModule.module_id,
      name: savedModule.name,
      module_key: savedModule.module_key,
      status: savedModule.status,
      description: savedModule.description,
      created_time: savedModule.created_time?.toISOString().split('T')[0] || '',
      updated_time: savedModule.updated_time?.toISOString().split('T')[0] || ''
    };

    return NextResponse.json({
      success: true,
      message: 'Module created successfully',
      module: formattedModule
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating module:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create module', error: error.message },
      { status: 500 }
    );
  }
}