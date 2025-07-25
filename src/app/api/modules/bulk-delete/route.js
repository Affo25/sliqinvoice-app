import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Module from '../../../../models/modules';
import mongoose from 'mongoose';

// DELETE /api/modules/bulk-delete - Delete multiple modules
export async function DELETE(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { ids } = body;

    // Validate that ids is provided and is an array
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No module IDs provided' },
        { status: 400 }
      );
    }

    // Validate all IDs are valid ObjectIds
    const invalidIds = ids.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { success: false, message: `Invalid module IDs: ${invalidIds.join(', ')}` },
        { status: 400 }
      );
    }

    // Delete multiple modules
    const result = await Module.deleteMany({
      _id: { $in: ids }
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'No modules found to delete' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} module(s)`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error bulk deleting modules:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete modules', error: error.message },
      { status: 500 }
    );
  }
}