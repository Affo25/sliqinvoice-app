import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import { Account } from '../../../models/ledger_models';

// GET /api/accounts - Fetch accounts with filters and pagination
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || 'all';
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
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Type filter
    if (type !== 'all') {
      query.type = type;
    }

    // Status filter
    if (status !== 'all') {
      query.is_active = status === 'active';
    }

    // If export, return all matching records
    if (export_data) {
      const accounts = await Account.find(query)
        .sort({ createdAt: -1 });

      return NextResponse.json({
        success: true,
        accounts,
        totalCount: accounts.length
      });
    }

    // Pagination
    const skip = (page - 1) * limit;
    const totalCount = await Account.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const accounts = await Account.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Format accounts data
    const formattedAccounts = accounts.map(account => ({
      id: account._id.toString(),
      _id: account._id.toString(),
      cat_name: account.cat_name,
      name: account.name,
      type: account.type,
      description: account.description || '',
      is_active: account.is_active,
      createdAt: account.createdAt?.toISOString().split('T')[0] || '',
      updatedAt: account.updatedAt?.toISOString().split('T')[0] || ''
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
      accounts: formattedAccounts,
      totalCount,
      pagination
    });

  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch accounts', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/accounts - Create new account
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      name,
      cat_name,
      type,
      description = '',
      is_active = true
    } = body;

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { success: false, message: 'Name and type are required' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['Income', 'Expense', 'Asset', 'Liability', 'Equity'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid account type' },
        { status: 400 }
      );
    }

    // Check if account already exists
    const existingAccount = await Account.findOne({ 
      name: { $regex: new RegExp('^' + name + '$', 'i') }
    });
    if (existingAccount) {
      return NextResponse.json(
        { success: false, message: 'Account with this name already exists' },
        { status: 409 }
      );
    }

    // Create account
    const newAccount = new Account({
      name: name.trim(),
      cat_name: cat_name.trim(),
      type,
      description: description.trim(),
      is_active
    });

    const savedAccount = await newAccount.save();

    // Format response
    const formattedAccount = {
      id: savedAccount._id.toString(),
      _id: savedAccount._id.toString(),
      name: savedAccount.name,
      cat_name: savedAccount.cat_name,
      type: savedAccount.type,
      description: savedAccount.description,
      is_active: savedAccount.is_active,
      createdAt: savedAccount.createdAt?.toISOString().split('T')[0] || '',
      updatedAt: savedAccount.updatedAt?.toISOString().split('T')[0] || ''
    };

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      account: formattedAccount
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create account', error: error.message },
      { status: 500 }
    );
  }
}