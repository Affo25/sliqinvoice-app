import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/user_models';

// DELETE /api/users/bulk-delete - Delete multiple users
export async function DELETE(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { userIds } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No user IDs provided' },
        { status: 400 }
      );
    }

    // Validate that all IDs exist
    const existingUsers = await User.find({ _id: { $in: userIds } });
    
    if (existingUsers.length !== userIds.length) {
      return NextResponse.json(
        { success: false, message: 'Some users not found' },
        { status: 404 }
      );
    }

    // Delete multiple users
    const result = await User.deleteMany({ _id: { $in: userIds } });

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} users deleted successfully`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error deleting users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete users', error: error.message },
      { status: 500 }
    );
  }
}