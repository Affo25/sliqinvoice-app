import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import { Transaction, Account, Category } from '../../../../models/ledger_models';
import mongoose from 'mongoose';

// GET /api/transactions/[id] - Get single transaction
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid transaction ID' },
        { status: 400 }
      );
    }

    // Get transaction with populated data
    const transaction = await Transaction.findById(id)
      .populate('accountId', 'name type')
      .populate('categoryId', 'name')
      .populate('createdBy', 'first_name last_name');

    if (!transaction) {
      return NextResponse.json(
        { success: false, message: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Format response
    const formattedTransaction = {
      id: transaction._id.toString(),
      _id: transaction._id.toString(),
      date: transaction.date?.toISOString().split('T')[0] || '',
      account: {
        id: transaction.accountId?._id.toString(),
        name: transaction.accountId?.name,
        type: transaction.accountId?.type
      },
      category: {
        id: transaction.categoryId?._id.toString(),
        name: transaction.categoryId?.name
      },
      type: transaction.type,
      amount: transaction.amount,
      currency: transaction.currency,
      note: transaction.note || '',
      createdBy: transaction.createdBy ? {
        id: transaction.createdBy._id.toString(),
        name: `${transaction.createdBy.first_name} ${transaction.createdBy.last_name}`
      } : null,
      createdAt: transaction.createdAt?.toISOString().split('T')[0] || '',
      updatedAt: transaction.updatedAt?.toISOString().split('T')[0] || ''
    };

    return NextResponse.json({
      success: true,
      transaction: formattedTransaction
    });

  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch transaction', error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/transactions/[id] - Update transaction
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const body = await request.json();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid transaction ID' },
        { status: 400 }
      );
    }

    const {
      date,
      accountId,
      categoryId,
      type,
      amount,
      currency = 'USD',
      note = ''
    } = body;

    // Validate required fields
    if (!date || !accountId || !categoryId || !type || !amount) {
      return NextResponse.json(
        { success: false, message: 'Date, account, category, type, and amount are required' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['debit', 'credit'].includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Type must be either debit or credit' },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Check if transaction exists
    const existingTransaction = await Transaction.findById(id);
    if (!existingTransaction) {
      return NextResponse.json(
        { success: false, message: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Validate account exists
    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid account ID' },
        { status: 400 }
      );
    }

    const account = await Account.findById(accountId);
    if (!account) {
      return NextResponse.json(
        { success: false, message: 'Account not found' },
        { status: 404 }
      );
    }

    // Validate category exists
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    // Update transaction
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      {
        date: new Date(date),
        accountId,
        categoryId,
        type,
        amount: parseFloat(amount),
        currency,
        note: note.trim()
      },
      { new: true, runValidators: true }
    ).populate('accountId', 'name type')
     .populate('categoryId', 'name')
     .populate('createdBy', 'first_name last_name');

    // Format response
    const formattedTransaction = {
      id: updatedTransaction._id.toString(),
      _id: updatedTransaction._id.toString(),
      date: updatedTransaction.date?.toISOString().split('T')[0] || '',
      account: {
        id: updatedTransaction.accountId?._id.toString(),
        name: updatedTransaction.accountId?.name,
        type: updatedTransaction.accountId?.type
      },
      category: {
        id: updatedTransaction.categoryId?._id.toString(),
        name: updatedTransaction.categoryId?.name
      },
      type: updatedTransaction.type,
      amount: updatedTransaction.amount,
      currency: updatedTransaction.currency,
      note: updatedTransaction.note,
      createdBy: updatedTransaction.createdBy ? {
        id: updatedTransaction.createdBy._id.toString(),
        name: `${updatedTransaction.createdBy.first_name} ${updatedTransaction.createdBy.last_name}`
      } : null,
      createdAt: updatedTransaction.createdAt?.toISOString().split('T')[0] || '',
      updatedAt: updatedTransaction.updatedAt?.toISOString().split('T')[0] || ''
    };

    return NextResponse.json({
      success: true,
      message: 'Transaction updated successfully',
      transaction: formattedTransaction
    });

  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update transaction', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/transactions/[id] - Delete transaction
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid transaction ID' },
        { status: 400 }
      );
    }

    // Check if transaction exists
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return NextResponse.json(
        { success: false, message: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Delete transaction
    await Transaction.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete transaction', error: error.message },
      { status: 500 }
    );
  }
}