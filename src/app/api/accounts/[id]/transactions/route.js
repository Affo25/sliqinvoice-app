import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import { Account, Transaction, Category } from '../../../../../models/ledger_models';
import mongoose from 'mongoose';

// GET /api/accounts/[id]/transactions - Get account transactions
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const type = searchParams.get('type') || 'all'; // 'debit', 'credit', or 'all'
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid account ID' },
        { status: 400 }
      );
    }

    // Verify account exists
    const account = await Account.findById(id);
    if (!account) {
      return NextResponse.json(
        { success: false, message: 'Account not found' },
        { status: 404 }
      );
    }

    // Build query
    let query = { accountId: new mongoose.Types.ObjectId(id) };

    // Type filter
    if (type !== 'all') {
      query.type = type;
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Pagination
    const skip = (page - 1) * limit;
    const totalCount = await Transaction.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    // Fetch transactions with populated data
    const transactions = await Transaction.find(query)
      .populate('accountId', 'name type')
      .populate('categoryId', 'name')
      .populate('createdBy', 'first_name last_name')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Format transactions data
    const formattedTransactions = transactions.map(transaction => ({
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
      createdAt: transaction.createdAt?.toISOString().split('T')[0] || ''
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
      transactions: formattedTransactions,
      account: {
        id: account._id.toString(),
        name: account.name,
        type: account.type
      },
      totalCount,
      pagination
    });

  } catch (error) {
    console.error('Error fetching account transactions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch transactions', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/accounts/[id]/transactions - Create new transaction for account
export async function POST(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const body = await request.json();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid account ID' },
        { status: 400 }
      );
    }

    // Verify account exists
    const account = await Account.findById(id);
    if (!account) {
      return NextResponse.json(
        { success: false, message: 'Account not found' },
        { status: 404 }
      );
    }

    const {
      date,
      categoryId,
      type,
      amount,
      currency = 'USD',
      note = '',
      createdBy = null
    } = body;

    // Validate required fields
    if (!date || !categoryId || !type || !amount) {
      return NextResponse.json(
        { success: false, message: 'Date, category, type, and amount are required' },
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

    // Create transaction
    const newTransaction = new Transaction({
      date: new Date(date),
      accountId: id,
      categoryId,
      type,
      amount: parseFloat(amount),
      currency,
      note: note.trim(),
      createdBy: createdBy && mongoose.Types.ObjectId.isValid(createdBy) ? createdBy : null
    });

    const savedTransaction = await newTransaction.save();

    // Populate the saved transaction for response
    const populatedTransaction = await Transaction.findById(savedTransaction._id)
      .populate('accountId', 'name type')
      .populate('categoryId', 'name')
      .populate('createdBy', 'first_name last_name');

    // Format response
    const formattedTransaction = {
      id: populatedTransaction._id.toString(),
      _id: populatedTransaction._id.toString(),
      date: populatedTransaction.date?.toISOString().split('T')[0] || '',
      account: {
        id: populatedTransaction.accountId?._id.toString(),
        name: populatedTransaction.accountId?.name,
        type: populatedTransaction.accountId?.type
      },
      category: {
        id: populatedTransaction.categoryId?._id.toString(),
        name: populatedTransaction.categoryId?.name
      },
      type: populatedTransaction.type,
      amount: populatedTransaction.amount,
      currency: populatedTransaction.currency,
      note: populatedTransaction.note,
      createdBy: populatedTransaction.createdBy ? {
        id: populatedTransaction.createdBy._id.toString(),
        name: `${populatedTransaction.createdBy.first_name} ${populatedTransaction.createdBy.last_name}`
      } : null,
      createdAt: populatedTransaction.createdAt?.toISOString().split('T')[0] || ''
    };

    return NextResponse.json({
      success: true,
      message: 'Transaction created successfully',
      transaction: formattedTransaction
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create transaction', error: error.message },
      { status: 500 }
    );
  }
}