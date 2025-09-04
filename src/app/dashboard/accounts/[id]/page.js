'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { showToast } from '../../../../lib/toast';
import { initializeDropdowns, cleanupDropdowns } from '../../../../lib/dropdownUtils';
import Button from '../../../../components/ui/button';
import {fetchAccountById,clearCurrentAccount} from '../../../../redux/slices/accountsSlice';
import {fetchCategories} from '../../../../redux/slices/categoriesSlice';
import {fetchTransactions,createTransaction,setFilters,clearTransactions,clearError} from '../../../../redux/slices/transactionsSlice';

export default function SingleAccountPage() {
  const params = useParams();
  const accountId = params.id;
  const dispatch = useDispatch();

  // Redux state
  const { currentAccount: account, loading: accountLoading } = useSelector((state) => state.accounts);
  const { categories } = useSelector((state) => state.categories);
  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    filters,
    pagination
  } = useSelector((state) => state.transactions);

  // Local state for UI
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transaction form data
  const [transactionForm, setTransactionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    credit: 0,
    debit: 0,
    note: ''
  });

  // Load data on mount
  useEffect(() => {
    if (accountId) {
      dispatch(fetchAccountById(accountId));
      dispatch(fetchCategories({ all: true, status: 'active' }));
      dispatch(fetchTransactions({ accountId, filters }));
    }

    return () => {
      dispatch(clearCurrentAccount());
      dispatch(clearTransactions());
    };
  }, [dispatch, accountId]);

  // Load transactions when filters change
  useEffect(() => {
    if (accountId) {
      dispatch(fetchTransactions({ accountId, filters }));
    }
  }, [dispatch, accountId, filters]);

  // Initialize dropdown functionality
  useEffect(() => {
    initializeDropdowns();
    return () => {
      cleanupDropdowns();
    };
  }, []);

  // Handle Redux errors
  useEffect(() => {
    if (transactionsError) {
      showToast(`<h5>Error</h5><p>${transactionsError}</p>`, 'error');
      dispatch(clearError());
    }
  }, [transactionsError, dispatch]);



  // Handle transaction submission
  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!transactionForm.date || !transactionForm.note) {
      showToast('Please fill in all required fields!', 'error');
      setIsSubmitting(false);
      return;
    }


    try {
      await dispatch(createTransaction({
        accountId,
        transactionData: transactionForm
      })).unwrap();

      showToast('<h5>Transaction Added Successfully!</h5><p>New transaction has been recorded.</p>', 'success');
      
      // Reset form and close modal
      setTransactionForm({
        date: new Date().toISOString().split('T')[0],
        credit: 0,
        debit: 0,
        note: ''
      });
      setShowTransactionModal(false);
      
      // Refresh data
      dispatch(fetchAccountById(accountId));

    } catch (error) {
      showToast(`<h5>Error Adding Transaction</h5><p>${error}</p>`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    dispatch(setFilters({
      [key]: value,
      page: 1
    }));
  };

  // Handle pagination
  const handlePageChange = (page) => {
    dispatch(setFilters({ page }));
  };

  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Get account type badge color
  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'Income': return 'badge-info';
      case 'Expense': return 'badge-danger';
      case 'Asset': return 'badge-info';
      case 'Liability': return 'badge-warning';
      case 'Equity': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  };

  if (accountLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="nk-block">
        <div className="card">
          <div className="card-inner text-center py-5">
            <h5>Account Not Found</h5>
            <p className="text-soft">The requested account could not be found.</p>
            <Button variant="gradient" asChild>
              <Link href="/dashboard/accounts">
                Back to Accounts
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="nk-block-head nk-block-head-sm">
        <div className="nk-block-between">
          <div className="nk-block-head-content">
            <div className="nk-block-head-sub">
              <Link href="/dashboard/accounts">
                <em className="icon ni ni-arrow-left"></em>
                <span>Back to Accounts</span>
              </Link>
            </div>
            <h2 className="nk-block-title fw-bolder">
              {account.name.toUpperCase()}
            </h2>
             <span className={`badge badge-sm ml-2 ${getTypeBadgeColor(account.type)}`}>
                {account.type}
              </span>
          </div>
          <div className="nk-block-head-content">
            <div className="toggle-wrap nk-block-tools-toggle">
              <a href="#" className="btn btn-icon btn-trigger toggle-expand mr-n1" data-target="pageMenu">
                <em className="icon ni ni-more-v"></em>
              </a>
              <div className="toggle-expand-content" data-content="pageMenu">
                <ul className="nk-block-tools g-3">
                  <li className="nk-block-tools-opt">
                    <Button 
                      onClick={() => setShowTransactionModal(true)}
                      variant="gradient"
                      className="gap-2"
                    >
                      <em className="icon ni ni-plus"></em>
                      <span>Add Transaction</span>
                    </Button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="nk-block">
        <div className="row g-gs">
          <div className="col-xxl-3 col-sm-6">
            <div className="card">
              <div className="nk-ecwg nk-ecwg6">
                <div className="card-inner">
                  <div className="card-title-group">
                    <div className="card-title">
                      <h6 className="title">Total Transactions</h6>
                    </div>
                    <div className="card-tools">
                      <em className="card-hint icon ni ni-help-fill" data-toggle="tooltip" data-placement="left" title="Total number of transactions"></em>
                    </div>
                  </div>
                  <div className="data">
                    <div className="amount">{account.summary?.totalTransactions || 0}</div>
                    <div className="info">
                      <span className="text-soft">All time</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xxl-3 col-sm-6">
            <div className="card">
              <div className="nk-ecwg nk-ecwg6">
                <div className="card-inner">
                  <div className="card-title-group">
                    <div className="card-title">
                      <h6 className="title">Net Balance</h6>
                    </div>
                    <div className="card-tools">
                      <em className="card-hint icon ni ni-help-fill" data-toggle="tooltip" data-placement="left" title="Debit minus Credit"></em>
                    </div>
                  </div>
                  <div className="data">
                    <div className="amount">
                      <span style={{fontSize:'2rem'}} className={`${(account.summary?.balance || 0) >= 0 ? 'text-danger' : 'text-success'}`}>
                        {account.summary?.balance || 0}
                      </span>
                    </div>
                   
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="nk-block">
        <div className="card card-bordered card-stretch">
          <div className="card-inner-group">
            <div className="card-inner position-relative card-tools-toggle">
              <div className="card-title-group">
                 <div className="card-title">
                  <h6 className="title">Recent Transactions</h6>
                </div>
                  
               
                <div className="card-tools">
                <div className="form-inline flex-nowrap gx-1">
                     <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label" htmlFor="amount">
                             <span className="text-black">Start Date:</span>
                          </label>
                          <input
                          style={{marginLeft:'5px'}}
                            type="date"
                            id="amount"
                            className="form-control"
                            placeholder="Start Date"
                           value={filters.startDate}
                           onChange={(e) => handleFilterChange('startDate', e.target.value)}
                          />
                        </div>
                      </div>
                        <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label" htmlFor="amount">
                             <span className="text-black">End Date:</span>
                          </label>
                          <input
                          style={{marginLeft:'5px'}}
                            type="date"
                            id="amount"
                            className="form-control"
                            placeholder="End Date"
                           value={filters.endDate}
                           onChange={(e) => handleFilterChange('endDate', e.target.value)}
                          />
                        </div>
                      </div> 
                  </div>
                </div>
              </div>
            </div>

            <div className="card-inner p-0">
              <div className="nk-tb-list nk-tb-ulist">
                <div className="nk-tb-item nk-tb-head">
                  <div className="nk-tb-col">
                    <span className="sub-text">Date</span>
                  </div>
                   <div className="nk-tb-col tb-col-lg">
                    <span className="sub-text">Note</span>
                  </div>
                   <div className="nk-tb-col tb-col-md">
                    <span className="sub-text">Debit</span>
                  </div>
                  <div className="nk-tb-col tb-col-mb">
                    <span className="sub-text">Credit</span>
                  </div>
                   <div className="nk-tb-col tb-col-md">
                    <span className="sub-text">Balance</span>
                  </div>
                 
                </div>

                {transactionsLoading ? (
                  <div className="nk-tb-item">
                    <div className="nk-tb-col">
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                      <span className="ml-2">Loading transactions...</span>
                    </div>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="nk-tb-item">
                    <div className="nk-tb-col">
                      <span className="text-soft">No transactions found</span>
                    </div>
                  </div>
                ) : (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="nk-tb-item">
                      <div className="nk-tb-col">
                        <span className={`badge badge-sm badge-info`}>{transaction.date}</span>
                      </div>
                      <div className="nk-tb-col tb-col-mb">
                        <span className="text text-bolder">
                          {transaction.note || "N/A"}
                        </span>
                      </div>
                        <div className="nk-tb-col tb-col-mb">
                        <span className="text text-bolder">
                          {transaction.debit > 0 ? transaction.debit : 'N/A'}
                        </span>
                      </div>
                       <div className="nk-tb-col tb-col-mb">
                        <span className="text text-bolder">
                          {transaction.credit > 0 ? transaction.credit : 'N/A'}
                        </span>
                      </div>
                      <div className="nk-tb-col">
                        <span
                          className={`${transaction.balance > 0 ? 'text-success' : 'text-danger'}`}
                        >
                          {transaction.balance > 0 ? `+${transaction.balance}` : transaction.balance < 0 ? `${transaction.balance}` : 'N/A'}
                        </span>
                      </div>


                     
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="card-inner">
                <div className="nk-block-between-md g-3">
                  <div className="g">
                    <div className="pagination-wrap">
                      <div className="pagination-info">
                        Showing {((pagination.currentPage - 1) * filters.limit) + 1} to{' '}
                        {Math.min(pagination.currentPage * filters.limit, pagination.totalCount)} of{' '}
                        {pagination.totalCount} entries
                      </div>
                    </div>
                  </div>
                  <div className="g">
                    <div className="pagination-wrap">
                      <ul className="pagination">
                        <li className={`page-item ${!pagination.hasPrevPage ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={!pagination.hasPrevPage}
                          >
                            Prev
                          </button>
                        </li>
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                          <li
                            key={page}
                            className={`page-item ${page === pagination.currentPage ? 'active' : ''}`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </li>
                        ))}
                        <li className={`page-item ${!pagination.hasNextPage ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={!pagination.hasNextPage}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showTransactionModal && (
        <>
          <div className="modal fade show" style={{ display: 'block' }}>
            <div className="modal-dialog modal-xl modal-dialog-centered modal-customer" tabIndex="-1" role="document">
              <div className="modal-content modal-xl">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Transaction</h5>
                  <button
                    type="button"
                    className="close"
                    onClick={() => {
                      setShowTransactionModal(false);
                      setTransactionForm({
                        date: new Date().toISOString().split('T')[0],
                        credit: 0,
                        debit: 0,
                        note: ''
                      });
                    }}
                  >
                    <span>&times;</span>
                  </button>
                </div>
                <form onSubmit={handleTransactionSubmit}>
                  <div className="modal-body modal-xl">
                    <div className='row'>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label className="form-label" htmlFor="date">
                            Date <span className="text-danger">*</span>
                          </label>
                          <input
                            type="date"
                            id="date"
                            className="form-control"
                            value={transactionForm.date}
                            onChange={(e) => setTransactionForm(prev => ({ ...prev, date: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                       <div className="col-md-4">
                        <div className="form-group">
                          <label className="form-label" htmlFor="amount">
                            Debit <span className="text-danger">*</span>
                          </label>
                          <input
                            type="number"
                            id="amount"
                            className="form-control"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            value={transactionForm.debit}
                            onChange={(e) => setTransactionForm(prev => ({ ...prev, debit: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                       <div className="col-md-4">
                        <div className="form-group">
                          <label className="form-label" htmlFor="amount">
                            Credit <span className="text-danger">*</span>
                          </label>
                          <input
                            type="number"
                            id="amount"
                            className="form-control"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            value={transactionForm.credit}
                            onChange={(e) => setTransactionForm(prev => ({ ...prev, credit: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                    </div>
                 
                  
                  
                    <div className="form-group">
                      <label className="form-label" htmlFor="note">
                        Note
                      </label>
                      <textarea
                        id="note"
                        className="form-control"
                        rows="3"
                        placeholder="Enter transaction note"
                        value={transactionForm.note}
                        onChange={(e) => setTransactionForm(prev => ({ ...prev, note: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowTransactionModal(false);
                        setTransactionForm({
                          date: new Date().toISOString().split('T')[0],
                          categoryId: '',
                          type: 'debit',
                          amount: '',
                          currency: 'USD',
                          note: ''
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="gradient"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="spinner-border spinner-border-sm mr-2" role="status">
                            <span className="sr-only">Loading...</span>
                          </div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <em className="icon ni ni-check"></em>
                          Add Transaction
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
}