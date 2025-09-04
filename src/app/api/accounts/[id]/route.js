import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import { Account, Transaction } from '../../../../models/ledger_models';
import mongoose from 'mongoose';

// GET /api/accounts/[id] - Get single account with transaction summary
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid account ID' }, { status: 400 });
    }

    const account = await Account.findById(id);
    if (!account) {
      return NextResponse.json({ success: false, message: 'Account not found' }, { status: 404 });
    }

    // Aggregate transaction summary
    const transactionStats = await Transaction.aggregate([
      { $match: { accountId: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: null,
          totalDebit: { $sum: '$debit' },
          totalCredit: { $sum: '$credit' },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    const summary = transactionStats[0] || { totalDebit: 0, totalCredit: 0, totalTransactions: 0 };
    const balance = summary.totalDebit - summary.totalCredit;

    const formattedAccount = {
      id: account._id.toString(),
      _id: account._id.toString(),
      cat_name: account.cat_name,
      name: account.name,
      type: account.type,
      description: account.description,
      is_active: account.is_active,
      createdAt: account.createdAt?.toISOString().split('T')[0] || '',
      updatedAt: account.updatedAt?.toISOString().split('T')[0] || '',
      summary: {
        totalTransactions: summary.totalTransactions,
        totalDebit: summary.totalDebit,
        totalCredit: summary.totalCredit,
        balance
      }
    };

    return NextResponse.json({ success: true, account: formattedAccount });
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch account', error: error.message }, { status: 500 });
  }
}

// PUT /api/accounts/[id] - Update account
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid account ID' }, { status: 400 });
    }

    const { name, type, description, is_active, cat_name } = body;

    if (!name || !type || !cat_name) {
      return NextResponse.json({ success: false, message: 'Name, type, and category are required' }, { status: 400 });
    }

    const validTypes = ['Income', 'Expense', 'Asset', 'Liability', 'Equity'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ success: false, message: 'Invalid account type' }, { status: 400 });
    }

    const existingAccount = await Account.findById(id);
    if (!existingAccount) {
      return NextResponse.json({ success: false, message: 'Account not found' }, { status: 404 });
    }

    const duplicateAccount = await Account.findOne({ 
      name: { $regex: new RegExp('^' + name + '$', 'i') }, 
      _id: { $ne: id } 
    });
    if (duplicateAccount) {
      return NextResponse.json({ success: false, message: 'Account with this name already exists' }, { status: 409 });
    }

    const updatedAccount = await Account.findByIdAndUpdate(
      id,
      { name: name.trim(), type, description: description?.trim() || '', cat_name: cat_name.trim(), is_active },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Account updated successfully',
      account: {
        id: updatedAccount._id.toString(),
        _id: updatedAccount._id.toString(),
        name: updatedAccount.name,
        cat_name: updatedAccount.cat_name,
        type: updatedAccount.type,
        description: updatedAccount.description,
        is_active: updatedAccount.is_active,
        createdAt: updatedAccount.createdAt?.toISOString().split('T')[0] || '',
        updatedAt: updatedAccount.updatedAt?.toISOString().split('T')[0] || ''
      }
    });

  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json({ success: false, message: 'Failed to update account', error: error.message }, { status: 500 });
  }
}

// DELETE /api/accounts/[id] - Delete account
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid account ID' }, { status: 400 });
    }

    const account = await Account.findById(id);
    if (!account) {
      return NextResponse.json({ success: false, message: 'Account not found' }, { status: 404 });
    }

    const transactionCount = await Transaction.countDocuments({ accountId: id });
    if (transactionCount > 0) {
      return NextResponse.json({ success: false, message: 'Cannot delete account with existing transactions. Please delete all transactions first.' }, { status: 400 });
    }

    await Account.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete account', error: error.message }, { status: 500 });
  }
}
