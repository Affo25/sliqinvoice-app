import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import { Transaction } from '../../../../models/ledger_models';

// GET /api/transactions/recent - Get recent transactions across all accounts
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit')) || 5;

    const transactions = await Transaction.find({})
      .populate('accountId', 'name type')
      .populate('createdBy', 'first_name last_name')
      .sort({ createdAt: -1, date: -1 })
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
      amount: t.credit > 0 ? t.credit : t.debit,
      type: t.credit > 0 ? 'credit' : 'debit',
      note: t.note || '',
      createdBy: t.createdBy ? {
        id: t.createdBy._id.toString(),
        name: `${t.createdBy.first_name} ${t.createdBy.last_name}`
      } : null,
      createdAt: t.createdAt?.toISOString() || '',
      timeAgo: getTimeAgo(t.createdAt)
    }));

    return NextResponse.json({
      success: true,
      transactions: formattedTransactions
    });

  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch recent transactions', error: error.message },
      { status: 500 }
    );
  }
}

// Helper function to calculate time ago
function getTimeAgo(date) {
  if (!date) return '';
  
  const now = new Date();
  const transactionDate = new Date(date);
  const diffMs = now - transactionDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  
  return transactionDate.toLocaleDateString();
}