import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import { Account, Transaction } from '../../../../models/ledger_models';
import mongoose from 'mongoose';

// GET /api/accounts/[id] - Get single account with transaction summary
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid account ID' },
        { status: 400 }
      );
    }

    // Get account
    const account = await Account.findById(id);
    if (!account) {
      return NextResponse.json(
        { success: false, message: 'Account not found' },
        { status: 404 }
      );
    }

    // Get transaction summary
    const transactionStats = await Transaction.aggregate([
      { $match: { accountId: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Format transaction summary
    let totalDebit = 0;
    let totalCredit = 0;
    let totalTransactions = 0;

    transactionStats.forEach(stat => {
      if (stat._id === 'debit') {
        totalDebit = stat.total;
      } else if (stat._id === 'credit') {
        totalCredit = stat.total;
      }
      totalTransactions += stat.count;
    });

    const balance = totalDebit - totalCredit;

    // Format response
    const formattedAccount = {
      id: account._id.toString(),
      _id: account._id.toString(),
      name: account.name,
      type: account.type,
      description: account.description,
      is_active: account.is_active,
      createdAt: account.createdAt?.toISOString().split('T')[0] || '',
      updatedAt: account.updatedAt?.toISOString().split('T')[0] || '',
      summary: {
        totalTransactions,
        totalDebit,
        totalCredit,
        balance
      }
    };

    return NextResponse.json({
      success: true,
      account: formattedAccount
    });

  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch account', error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/accounts/[id] - Update account
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid account ID' },
        { status: 400 }
      );
    }

    const { name, type, description, is_active } = body;

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

    // Check if account exists
    const existingAccount = await Account.findById(id);
    if (!existingAccount) {
      return NextResponse.json(
        { success: false, message: 'Account not found' },
        { status: 404 }
      );
    }

    // Check for duplicate names (excluding current account)
    const duplicateAccount = await Account.findOne({ 
      name: { $regex: new RegExp('^' + name + '$', 'i') },
      _id: { $ne: id }
    });
    if (duplicateAccount) {
      return NextResponse.json(
        { success: false, message: 'Account with this name already exists' },
        { status: 409 }
      );
    }

    // Update account
    const updatedAccount = await Account.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        type,
        description: description?.trim() || '',
        is_active
      },
      { new: true, runValidators: true }
    );

    // Format response
    const formattedAccount = {
      id: updatedAccount._id.toString(),
      _id: updatedAccount._id.toString(),
      name: updatedAccount.name,
      type: updatedAccount.type,
      description: updatedAccount.description,
      is_active: updatedAccount.is_active,
      createdAt: updatedAccount.createdAt?.toISOString().split('T')[0] || '',
      updatedAt: updatedAccount.updatedAt?.toISOString().split('T')[0] || ''
    };

    return NextResponse.json({
      success: true,
      message: 'Account updated successfully',
      account: formattedAccount
    });

  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update account', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/accounts/[id] - Delete account
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid account ID' },
        { status: 400 }
      );
    }

    // Check if account exists
    const account = await Account.findById(id);
    if (!account) {
      return NextResponse.json(
        { success: false, message: 'Account not found' },
        { status: 404 }
      );
    }

    // Check if account has transactions
    const transactionCount = await Transaction.countDocuments({ accountId: id });
    if (transactionCount > 0) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete account with existing transactions. Please delete all transactions first.' },
        { status: 400 }
      );
    }

    // Delete account
    await Account.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete account', error: error.message },
      { status: 500 }
    );
  }
}