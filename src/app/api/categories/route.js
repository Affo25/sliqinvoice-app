import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import { Category } from '../../../models/ledger_models';

// GET /api/categories - Fetch categories
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const all = searchParams.get('all') === 'true';
    const hierarchical = searchParams.get('hierarchical') === 'true';

    // Build query
    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status !== 'all') {
      query.is_active = status === 'active';
    }

    // Type filter (parent/child)
    if (type === 'parent') {
      query.parentId = null;
    } else if (type === 'child') {
      query.parentId = { $ne: null };
    }

    // If all=true or hierarchical=true, return all categories without pagination (for dropdown/hierarchy)
    if (all || hierarchical) {
      const categories = await Category.find(query)
        .populate('parentId', 'name')
        .sort({ name: 1 });

      const formattedCategories = categories.map(category => ({
        id: category._id.toString(),
        _id: category._id.toString(),
        name: category.name,
        parentId: category.parentId?._id.toString() || null,
        parentName: category.parentId?.name || null,
        description: category.description || '',
        is_active: category.is_active
      }));

      return NextResponse.json({
        success: true,
        categories: formattedCategories,
        totalCount: formattedCategories.length
      });
    }

    // Pagination
    const skip = (page - 1) * limit;
    const totalCount = await Category.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const categories = await Category.find(query)
      .populate('parentId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Format categories data
    const formattedCategories = categories.map(category => ({
      id: category._id.toString(),
      _id: category._id.toString(),
      name: category.name,
      parentId: category.parentId?._id.toString() || null,
      parentName: category.parentId?.name || null,
      description: category.description || '',
      is_active: category.is_active,
      createdAt: category.createdAt?.toISOString().split('T')[0] || '',
      updatedAt: category.updatedAt?.toISOString().split('T')[0] || ''
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
      categories: formattedCategories,
      totalCount,
      pagination
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch categories', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create new category
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      name,
      parentId = null,
      description = '',
      is_active = true
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Name is required' },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp('^' + name + '$', 'i') }
    });
    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: 'Category with this name already exists' },
        { status: 409 }
      );
    }

    // Create category
    const newCategory = new Category({
      name: name.trim(),
      parentId: parentId || null,
      description: description.trim(),
      is_active
    });

    const savedCategory = await newCategory.save();

    // Populate for response
    const populatedCategory = await Category.findById(savedCategory._id)
      .populate('parentId', 'name');

    // Format response
    const formattedCategory = {
      id: populatedCategory._id.toString(),
      _id: populatedCategory._id.toString(),
      name: populatedCategory.name,
      parentId: populatedCategory.parentId?._id.toString() || null,
      parentName: populatedCategory.parentId?.name || null,
      description: populatedCategory.description,
      is_active: populatedCategory.is_active,
      createdAt: populatedCategory.createdAt?.toISOString().split('T')[0] || '',
      updatedAt: populatedCategory.updatedAt?.toISOString().split('T')[0] || ''
    };

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      category: formattedCategory
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create category', error: error.message },
      { status: 500 }
    );
  }
}