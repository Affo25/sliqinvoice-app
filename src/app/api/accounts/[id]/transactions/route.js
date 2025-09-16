import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import { Account, Transaction, Category } from '../../../../../models/ledger_models';
import mongoose from 'mongoose';

// GET /api/accounts/[id]/transactions
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid account ID' }, { status: 400 });
    }

    const account = await Account.findById(id);
    if (!account) {
      return NextResponse.json({ success: false, message: 'Account not found' }, { status: 404 });
    }

    // Build query
    let query = { accountId: new mongoose.Types.ObjectId(id) };

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const totalCount = await Transaction.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const transactions = await Transaction.find(query)
      .populate('accountId', 'name type')
      .populate('createdBy', 'first_name last_name')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const formattedTransactions = transactions.map(t => ({
      id: t._id.toString(),
      date: t.date?.toISOString().split('T')[0] || '',
      account: {
        id: t.accountId?._id.toString(),
        name: t.accountId?.name,
        type: t.accountId?.type
      },
      debit: t.debit,
      credit: t.credit,
      balance: t.balance,
      note: t.note || '',
      createdBy: t.createdBy ? {
        id: t.createdBy._id.toString(),
        name: `${t.createdBy.first_name} ${t.createdBy.last_name}`
      } : null,
      createdAt: t.createdAt?.toISOString().split('T')[0] || ''
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
      pagination
    });

  } catch (error) {
    console.error('Error fetching account transactions:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch transactions', error: error.message }, { status: 500 });
  }
}

// POST /api/accounts/[id]/transactions
export async function POST(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid account ID' }, { status: 400 });
    }

    const account = await Account.findById(id);
    if (!account) {
      return NextResponse.json({ success: false, message: 'Account not found' }, { status: 404 });
    }

    const { date, debit = 0, credit = 0, note = '', createdBy = null } = body;

    // Validate required fields
    if (!date || (parseFloat(debit) === 0 && parseFloat(credit) === 0)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Date and either debit or credit amount are required' 
      }, { status: 400 });
    }

    // Validate amounts are not both provided
    if (parseFloat(debit) > 0 && parseFloat(credit) > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Cannot have both debit and credit amounts in the same transaction' 
      }, { status: 400 });
    }

    // Get last transaction to calculate running balance
    const lastTransaction = await Transaction.findOne({ accountId: id }).sort({ date: -1, createdAt: -1 });
    const previousBalance = lastTransaction ? lastTransaction.balance : 0;

    // Calculate new balance: previousBalance + credit - debit
    const newBalance = parseFloat(previousBalance) + parseFloat(credit) - parseFloat(debit);

    const newTransaction = new Transaction({
      date: new Date(date),
      accountId: id,
      debit: parseFloat(debit),
      credit: parseFloat(credit),
      balance: newBalance,
      note: note.trim(),
      createdBy: createdBy && mongoose.Types.ObjectId.isValid(createdBy) ? createdBy : null
    });

    const savedTransaction = await newTransaction.save();

    const populatedTransaction = await Transaction.findById(savedTransaction._id)
      .populate('accountId', 'name type')
      .populate('createdBy', 'first_name last_name');

    const formattedTransaction = {
      id: populatedTransaction._id.toString(),
      date: populatedTransaction.date?.toISOString().split('T')[0] || '',
      account: {
        id: populatedTransaction.accountId?._id.toString(),
        name: populatedTransaction.accountId?.name,
        type: populatedTransaction.accountId?.type
      },
      debit: populatedTransaction.debit,
      credit: populatedTransaction.credit,
      balance: populatedTransaction.balance,
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
    return NextResponse.json({ success: false, message: 'Failed to create transaction', error: error.message }, { status: 500 });
  }
}

