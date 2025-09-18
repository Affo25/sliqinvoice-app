import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import { Transaction, Account } from '../../../../models/ledger_models';

// Helper function to format transaction data
function formatTransactionData(transactions) {
  return transactions.map(transaction => ({
    id: transaction._id.toString(),
    _id: transaction._id.toString(),
    date: transaction.date?.toISOString().split('T')[0] || '',
    debit: transaction.debit || 0,
    credit: transaction.credit || 0,
    balance: transaction.balance || 0,
    note: transaction.note || '',
    createdAt: transaction.createdAt?.toISOString() || '',
    account: {
      id: transaction.accountId?._id?.toString() || '',
      name: transaction.accountId?.name || '',
      type: transaction.accountId?.type || '',
      category: transaction.accountId?.cat_name || '',

      description: transaction.accountId?.description || ''
    }
  }));
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || 'all';
    const status = searchParams.get('status') || 'all';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const category = searchParams.get('category') || 'all';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const export_data = searchParams.get('export') === 'true';

    // Build transaction query
    let transactionQuery = {};

    // Date range filter
    if (dateFrom || dateTo) {
      transactionQuery.date = {};
      if (dateFrom) {
        transactionQuery.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        transactionQuery.date.$lte = new Date(dateTo + 'T23:59:59.999Z');
      }
    }

    // Build account query for filtering
    let accountQuery = {};

    // Search filter for accounts
    if (search) {
      accountQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Account type filter
    if (type !== 'all') {
      accountQuery.type = type;
    }

    // Category filter
    if (category !== 'all') {
      accountQuery.cat_name = category;
    }

    // Status filter for accounts
    if (status !== 'all') {
      accountQuery.is_active = status === 'active';
    }

    // Get account IDs that match the account filters
    const matchingAccounts = await Account.find(accountQuery).select('_id');
    const accountIds = matchingAccounts.map(acc => acc._id);

    // Add account filter to transaction query
    if (accountIds.length > 0) {
      transactionQuery.accountId = { $in: accountIds };
    } else if (Object.keys(accountQuery).length > 0) {
      // If we have account filters but no matching accounts, return empty result
      return NextResponse.json({
        success: true,
        transactions: [],
        totalCount: 0,
        pagination: {
          currentPage: page,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
          totalCount: 0
        }
      });
    }

    // If export, return all matching records
    if (export_data) {
      const transactions = await Transaction.find(transactionQuery)
        .populate('accountId', 'name type cat_name description')
        .sort({ date: -1 });

      const formattedTransactions = formatTransactionData(transactions);

      return NextResponse.json({
        success: true,
        transactions: formattedTransactions,
        totalCount: transactions.length
      });
    }

    // Pagination for transactions
    const skip = (page - 1) * limit;
    const totalCount = await Transaction.countDocuments(transactionQuery);
    const totalPages = Math.ceil(totalCount / limit);

    const transactions = await Transaction.find(transactionQuery)
      .populate('accountId', 'name type cat_name is_active description')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    // Format transaction data
    const formattedTransactions = formatTransactionData(transactions);

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