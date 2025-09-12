'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAccounts } from '../../../../redux/slices/accountsSlice';

export default function AccountsWidget() {
    const dispatch = useDispatch();
    
    // Redux state
    const { accounts, loading } = useSelector((state) => state.accounts);

    // Load accounts on mount
    useEffect(() => {
        dispatch(fetchAccounts({ all: true }));
    }, [dispatch]);

    if (loading) {
        return (
            <div className="card card-bordered card-full">
                <div className="card-inner text-center">
                    <div className="spinner-border spinner-border-sm" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                    <p className="mt-2">Loading accounts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card card-bordered card-full">
            <div className="card-inner">
                <div className="card-title-group">
                    <div className="card-title">
                        <h6 className="title">
                            <span className="mr-2">Accounts Overview</span>
                            <a href="/dashboard/accounts/accounts_details" className="link d-none d-sm-inline">
                                View All
                            </a>
                        </h6>
                    </div>
                </div>
            </div>
            <div className="card-inner p-3">
                <div className="row g-3">
                    {['Income', 'Expense', 'Asset', 'Liability'].map((type) => {
                        const filteredAccounts = accounts.filter(acc => acc.type === type);
                        
                        return (
                            <div key={type} className="col-md-3 col-lg-3">
                                <div 
                                    className="card card-bordered rounded-3 shadow-sm hover-shadow"
                                    style={{
                                        transition: 'all 0.3s ease',
                                        minHeight: '200px'
                                    }}
                                >
                                    <div className="card-inner p-3">
                                        {/* Card Title */}
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="card-title mb-0">{type} Accounts</h6>
                                            <span className="badge badge-primary">{filteredAccounts.length}</span>
                                        </div>

                                        {/* Account List */}
                                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                            <table className="table table-sm mb-0">
                                                <thead className="sticky-top bg-white">
                                                    <tr>
                                                        <th className="px-2 py-1" style={{ fontSize: '0.75rem' }}>#</th>
                                                        <th className="px-2 py-1" style={{ fontSize: '0.75rem' }}>Account Name</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredAccounts.length > 0 ? (
                                                        filteredAccounts.slice(0, 5).map((acc, index) => (
                                                            <tr key={acc.id || index}>
                                                                <td className="px-2 py-1" style={{ fontSize: '0.75rem' }}>{index + 1}</td>
                                                                <td className="px-2 py-1" style={{ fontSize: '0.75rem' }}>
                                                                    <a
                                                                        href={`/dashboard/accounts/${acc.id}`}
                                                                        className="text-decoration-none text-primary"
                                                                        style={{ cursor: 'pointer' }}
                                                                        title={acc.description || acc.name}
                                                                    >
                                                                        {acc.name.length > 20 ? 
                                                                            `${acc.name.substring(0, 20)}...` : 
                                                                            acc.name
                                                                        }
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="2" className="text-muted text-center px-2 py-3" style={{ fontSize: '0.75rem' }}>
                                                                No {type.toLowerCase()} accounts
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {filteredAccounts.length > 5 && (
                                                        <tr>
                                                            <td colSpan="2" className="text-center px-2 py-1">
                                                                <a 
                                                                    href="/dashboard/accounts" 
                                                                    className="text-primary"
                                                                    style={{ fontSize: '0.75rem' }}
                                                                >
                                                                    +{filteredAccounts.length - 5} more
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}