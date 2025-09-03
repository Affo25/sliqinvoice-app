import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import { Category, Transaction } from '../../../../models/ledger_models';
import mongoose from 'mongoose';

// GET /api/categories/[id] - Get single category
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid category ID' },
        { status: 400 }
      );
    }

    // Get category
    const category = await Category.findById(id).populate('parentId', 'name');
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    // Format response
    const formattedCategory = {
      id: category._id.toString(),
      _id: category._id.toString(),
      name: category.name,
      parentId: category.parentId?._id.toString() || null,
      parentName: category.parentId?.name || null,
      description: category.description,
      is_active: category.is_active,
      createdAt: category.createdAt?.toISOString().split('T')[0] || '',
      updatedAt: category.updatedAt?.toISOString().split('T')[0] || ''
    };

    return NextResponse.json({
      success: true,
      category: formattedCategory
    });

  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch category', error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - Update category
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const body = await request.json();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const { name, parentId, description, is_active } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Name is required' },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    // Check for duplicate names (excluding current category)
    const duplicateCategory = await Category.findOne({ 
      name: { $regex: new RegExp('^' + name + '$', 'i') },
      _id: { $ne: id }
    });
    if (duplicateCategory) {
      return NextResponse.json(
        { success: false, message: 'Category with this name already exists' },
        { status: 409 }
      );
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        parentId: parentId && mongoose.Types.ObjectId.isValid(parentId) ? parentId : null,
        description: description?.trim() || '',
        is_active
      },
      { new: true, runValidators: true }
    ).populate('parentId', 'name');

    // Format response
    const formattedCategory = {
      id: updatedCategory._id.toString(),
      _id: updatedCategory._id.toString(),
      name: updatedCategory.name,
      parentId: updatedCategory.parentId?._id.toString() || null,
      parentName: updatedCategory.parentId?.name || null,
      description: updatedCategory.description,
      is_active: updatedCategory.is_active,
      createdAt: updatedCategory.createdAt?.toISOString().split('T')[0] || '',
      updatedAt: updatedCategory.updatedAt?.toISOString().split('T')[0] || ''
    };

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      category: formattedCategory
    });

  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update category', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete category
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid category ID' },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has transactions
    const transactionCount = await Transaction.countDocuments({ categoryId: id });
    if (transactionCount > 0) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete category with existing transactions. Please delete all transactions first.' },
        { status: 400 }
      );
    }

    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({ parentId: id });
    if (subcategoryCount > 0) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete category with existing subcategories. Please delete all subcategories first.' },
        { status: 400 }
      );
    }

    // Delete category
    await Category.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete category', error: error.message },
      { status: 500 }
    );
  }
}