'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecentTransactions } from '../../../../redux/slices/transactionsSlice';

export default function RecentTransactionWidget() {
    const dispatch = useDispatch();
    
    // Redux state with default values
    const { 
        recentTransactions = [], 
        recentLoading = false, 
        error = null 
    } = useSelector((state) => state.transactions || {});

    // Load recent transactions on mount
    useEffect(() => {
        dispatch(fetchRecentTransactions({ limit: 5 }));
    }, [dispatch]);

    // Helper function to get transaction type color and icon
    const getTransactionTypeInfo = (type, accountType) => {
        if (type === 'credit') {
            return {
                bgColor: 'bg-success',
                icon: 'ni ni-plus',
                text: 'Credit'
            };
        } else {
            return {
                bgColor: 'bg-danger',
                icon: 'ni ni-minus',
                text: 'Debit'
            };
        }
    };

    // Helper function to get user initials
    const getUserInitials = (name) => {
        if (!name) return 'TX';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    // Helper function to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    if (recentLoading) {
        return (
            <div className="card card-bordered card-full">
                <div className="card-inner text-center">
                    <div className="spinner-border spinner-border-sm" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                    <p className="mt-2">Loading recent transactions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card card-bordered card-full">
            <div className="card-inner border-bottom">
                <div className="card-title-group">
                    <div className="card-title">
                        <h6 className="title">Recent Transactions</h6>
                    </div>
                    <div className="card-tools">
                        <ul className="card-tools-nav">
                            <li className="active">
                                <a href="/dashboard/transactions">
                                    <span>View All</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            
            {error ? (
                <div className="card-inner text-center text-danger">
                    <p>Failed to load recent transactions</p>
                </div>
            ) : !recentTransactions || !recentTransactions || recentTransactions.length === 0 ? (
                <div className="card-inner text-center text-muted">
                    <p>No recent transactions found</p>
                </div>
            ) : (
                <ul className="nk-activity">
                    {recentTransactions.map((transaction) => {
                        const typeInfo = getTransactionTypeInfo(transaction.type, transaction.account?.type);
                        const userInitials = getUserInitials(transaction.createdBy?.name);
                        
                        return (
                            <li key={transaction.id} className="nk-activity-item">
                                <div className={`nk-activity-media user-avatar ${typeInfo.bgColor}`}>
                                    <em className={`icon ${typeInfo.icon}`}></em>
                                </div>
                                <div className="nk-activity-data">
                                    <div className="label">
                                        <strong>{transaction.amount}</strong> {typeInfo.text.toLowerCase()} 
                                        {transaction.account?.name && (
                                            <> in <strong>{transaction.account.name}</strong></>
                                        )}
                                        {transaction.note && (
                                            <div className="text-muted small mt-1">
                                                Note: {transaction.note}
                                            </div>
                                        )}
                                    </div>
                                    <span className="time">{transaction.timeAgo}</span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
            
            {recentTransactions && recentTransactions.length > 0 && (
                <div className="card-inner-sm border-top text-center d-sm-none">
                    <a href="/dashboard/transactions" className="btn btn-link btn-block">
                        View All Transactions
                    </a>
                </div>
            )}
        </div>
    );
}