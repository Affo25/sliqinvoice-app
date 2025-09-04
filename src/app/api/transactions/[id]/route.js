import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import { Transaction, Account, Category } from '../../../../models/ledger_models';
import mongoose from 'mongoose';

// GET /api/transactions/[id] - Get single transaction
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

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
      debit: transaction.debit,
      credit: transaction.credit,
      balance: transaction.balance,
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

    const { id } = await params;
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
      type,
      amount,
      currency = 'USD',
      note = ''
    } = body;

    // Validate required fields
    if (!date || !accountId  || !type || !amount) {
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

    // Calculate new balance based on the account's transaction history
    // Get all other transactions for this account, excluding current one
    const otherTransactions = await Transaction.find({ 
      accountId: accountId, 
      _id: { $ne: id } 
    }).sort({ date: 1, createdAt: 1 });

    // Calculate running balance
    let runningBalance = 0;
    for (const txn of otherTransactions) {
      runningBalance += txn.credit - txn.debit;
    }

    // Add the new transaction amounts
    const newBalance = runningBalance + parseFloat(credit) - parseFloat(debit);

    // Update transaction
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      {
        date: new Date(date),
        accountId,
        debit: parseFloat(debit),
        credit: parseFloat(credit),
        balance: newBalance,
        note: note.trim()
      },
      { new: true, runValidators: true }
    ).populate('accountId', 'name type')
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
      debit: updatedTransaction.debit,
      credit: updatedTransaction.credit,
      balance: updatedTransaction.balance,
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

    const { id } = await params;

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