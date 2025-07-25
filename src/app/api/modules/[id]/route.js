import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Module from '../../../../models/modules';
import mongoose from 'mongoose';

// GET /api/modules/[id] - Get single module
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid module ID' },
        { status: 400 }
      );
    }

    const module = await Module.findById(id);

    if (!module) {
      return NextResponse.json(
        { success: false, message: 'Module not found' },
        { status: 404 }
      );
    }

    const formattedModule = {
      id: module._id.toString(),
      _id: module._id.toString(),
      module_id: module.module_id,
      name: module.name,
      module_key: module.module_key,
      status: module.status,
      description: module.description || '',
      created_time: module.created_time?.toISOString().split('T')[0] || '',
      updated_time: module.updated_time?.toISOString().split('T')[0] || ''
    };

    return NextResponse.json({
      success: true,
      module: formattedModule
    });

  } catch (error) {
    console.error('Error fetching module:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch module', error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/modules/[id] - Update module
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid module ID' },
        { status: 400 }
      );
    }

    const {
      module_id,
      name,
      module_key,
      status,
      description
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
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status. Must be one of: active, inactive' },
        { status: 400 }
      );
    }

    // Check if module exists
    const existingModule = await Module.findById(id);
    if (!existingModule) {
      return NextResponse.json(
        { success: false, message: 'Module not found' },
        { status: 404 }
      );
    }

    // Check for duplicate module_id or module_key (but exclude current module)
    const duplicateModule = await Module.findOne({
      _id: { $ne: id },
      $or: [
        { module_id },
        { module_key }
      ]
    });

    if (duplicateModule) {
      return NextResponse.json(
        { success: false, message: 'Another module with this ID or key already exists' },
        { status: 409 }
      );
    }

    // Update module
    const updatedModule = await Module.findByIdAndUpdate(
      id,
      {
        module_id,
        name,
        module_key,
        status,
        description,
        updated_time: new Date()
      },
      { new: true, runValidators: true }
    );

    // Format response
    const formattedModule = {
      id: updatedModule._id.toString(),
      _id: updatedModule._id.toString(),
      module_id: updatedModule.module_id,
      name: updatedModule.name,
      module_key: updatedModule.module_key,
      status: updatedModule.status,
      description: updatedModule.description,
      created_time: updatedModule.created_time?.toISOString().split('T')[0] || '',
      updated_time: updatedModule.updated_time?.toISOString().split('T')[0] || ''
    };

    return NextResponse.json({
      success: true,
      message: 'Module updated successfully',
      module: formattedModule
    });

  } catch (error) {
    console.error('Error updating module:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update module', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/modules/[id] - Delete module
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid module ID' },
        { status: 400 }
      );
    }

    const deletedModule = await Module.findByIdAndDelete(id);

    if (!deletedModule) {
      return NextResponse.json(
        { success: false, message: 'Module not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Module deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting module:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete module', error: error.message },
      { status: 500 }
    );
  }
}