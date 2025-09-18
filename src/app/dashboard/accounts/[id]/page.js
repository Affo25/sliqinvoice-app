'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation'; // ✅ Correct for app/
import { useDispatch, useSelector } from 'react-redux';
import { showToast } from '../../../../lib/toast';
import { initializeDropdowns, cleanupDropdowns } from '../../../../lib/dropdownUtils';
import Button from '../../../../components/ui/button';
import { InlineLoader } from '../../../../components/loader';
import {fetchAccountById,clearCurrentAccount} from '../../../../redux/slices/accountsSlice';
import {fetchCategories} from '../../../../redux/slices/categoriesSlice';
import {fetchTransactions,createTransaction,setFilters,clearTransactions,clearError,exportTransactions} from '../../../../redux/slices/transactionsSlice';

export default function SingleAccountPage() {
  const params = useParams();
  const accountId = params.id;
  const dispatch = useDispatch();
  const router = useRouter();

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
    const [isExporting, setIsExporting] = useState(false);
  

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

  const goBackRoute = () => {
    window.history.back();
  };
   const gotoReportPage = () => {
    router.push(`/dashboard/account-report`);
  };


  // Format date and time for display
function formatDateTimeUTC(dateString) {
  const d = new Date(dateString);

  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  const year = d.getUTCFullYear();

  let hour = d.getUTCHours();
  const minute = String(d.getUTCMinutes()).padStart(2, '0');
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;

  return `${day}-${month}-${year} ${hour}:${minute} ${ampm}`;
}





  // Handle export transactions
  const handleExportTransactions = async () => {
    setIsExporting(true);
    
    try {
      await dispatch(exportTransactions({ 
        accountId, 
        filters 
      })).unwrap();
      
      showToast('<h5>Export Completed!</h5><p>Transaction data has been exported to CSV successfully.</p>', 'success');
    } catch (error) {
      showToast(`<h5>Export Failed</h5><p>${error}</p>`, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  


  // Get last transaction balance and determine if it's debit or credit
  const getLastTransactionBalance = () => {
    if (!transactions || transactions.length === 0) {
      return { balance: 0, isDebit: true };
    }
    
    const lastTransaction = transactions[0]; // Assuming transactions are ordered by date desc
    const balance = lastTransaction.balance || 0;
    const isDebit = balance >= 0;
    
    return { balance: Math.abs(balance), isDebit };
  };

  if (accountLoading || !account) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
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
            {/* <div className="nk-block-head-sub">
              <Link href="/dashboard/accounts">
                <em className="icon ni ni-arrow-left"></em>
                <span>Back to Accounts</span>
              </Link>
            </div> */}
             <h3 className="nk-block-title page-title">{account.name}</h3>
              <div className="nk-block-des text-soft">
              <p>Manage your chart of accounts - create, edit, and organize your financial accounts.</p>
            </div>
             {/* <span className={`badge badge-sm ml-2 ${getTypeBadgeColor(account.type)}`}>
                {account.type}
              </span> */}
          </div>
          <div className="nk-block-head-content">
            <div className="toggle-wrap nk-block-tools-toggle">
              <a href="#" className="btn btn-icon btn-trigger toggle-expand mr-n1" data-target="pageMenu">
                <em className="icon ni ni-more-v"></em>
              </a>
              <div className="toggle-expand-content" data-content="pageMenu">
                <ul className="nk-block-tools g-3">
                  <li className="nk-block-tools-opt space-x-3">
                  
                    <Button
                      onClick={goBackRoute}
                      variant="outline"
                      disabled={isExporting}
                      className="gap-2"
                    >
                        <em className="icon ni ni-chevron-left"></em>
                      <span>{'Go Back'}</span>
                    </Button>

                     <Button
                      onClick={handleExportTransactions}
                      variant="outline"
                     
                      className="gap-2"
                    >
                      {isExporting ? (
                        <InlineLoader size="sm" color="gray" />
                      ) : (
                        <em className="icon ni ni-download-cloud"></em>
                      )}
                      <span>{isExporting ? 'Exporting...' : 'Export'}</span>
                    </Button>

                      <Button
                      onClick={gotoReportPage}
                      variant="outline"
                      disabled={isExporting}
                      className="gap-2"
                    >
                        <em className="icon ni ni-report"></em>
                      <span>{'View Report'}</span>
                    </Button>
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

      {/* Account Balance Card */}
      <div className="nk-block">
        <div className="row g-gs">
          <div className="col-6">
            <div className="card" style={{ minHeight: '140px' }}>
              <div className="card-inner d-flex align-items-center justify-content-between px-4 py-4">
                {/* Left Side - Net Balance Text */}
                <div className="d-flex flex-column">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    {(() => {
                      const lastTransaction = transactions && transactions.length > 0 ? transactions[0] : null;
                      const hasCredit = lastTransaction ? lastTransaction.credit > 0 : false;
                      const hasDebit = lastTransaction ? lastTransaction.debit > 0 : false;
                      const { balance } = getLastTransactionBalance();
                      
                      return (
                        <>
                          <div>
                            <h4 className="title mb-1">Net Balance</h4>
                            <span 
                              className={`${hasCredit ? 'text-success' : hasDebit ? 'text-danger' : 'text-muted'}`}
                              style={{ fontSize: '0.875rem', fontWeight: '600', letterSpacing: '0.5px' }}
                            >
                              {hasCredit ? 'CREDIT' : hasDebit ? 'DEBIT' : 'NO TRANSACTIONS'}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <span className="text-soft" style={{ fontSize: '0.875rem' }}>
                    {transactions && transactions.length > 0 ? 
                      `Last updated: ${formatDateTimeUTC(transactions[0]?.date) || 'N/A'}` : 
                      'No transactions yet'
                    }
                  </span>
                </div>

                {/* Right Side - Amount */}
                <div className="text-right">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    {(() => {
                      const lastTransaction = transactions && transactions.length > 0 ? transactions[0] : null;
                      const hasCredit = lastTransaction ? lastTransaction.credit > 0 : false;
                      const hasDebit = lastTransaction ? lastTransaction.debit > 0 : false;
                      const { balance } = getLastTransactionBalance();
                      
                      return (
                        <>
                          <em
                            className={`icon ni ${hasCredit ? 'ni-arrow-up' : hasDebit ? 'ni-arrow-down' : 'ni-help'}`}
                            style={{
                              fontSize: '2rem',
                              color: hasCredit ? '#28a745' : hasDebit ? '#e85347' : '#6c757d'
                            }}
                          ></em>

                          <div
                            className={`${hasCredit ? 'text-success' : hasDebit ? 'text-danger' : 'text-muted'}`}
                            style={{ fontSize: '2.2rem', fontWeight: 'bold', lineHeight: '1' }}
                          >
                            {balance.toFixed(2)}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="text-soft mt-2" style={{ fontSize: '0.875rem' }}>
                    Based on last transaction
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
              <div className="nk-tb-list nk-tb-ulist" style={{ border: '1px solid #e5e9f2' }}>
                <div className="nk-tb-item nk-tb-head" style={{ borderBottom: '2px solid #d1d5db', backgroundColor: '#f8fafc' }}>
                  <div className="nk-tb-col" style={{ borderRight: '1px solid #e5e9f2', padding: '12px' }}>
                    <span className="sub-text font-weight-bold">Date</span>
                  </div>
                   <div className="nk-tb-col tb-col-lg" style={{ borderRight: '1px solid #e5e9f2', padding: '12px' }}>
                    <span className="sub-text font-weight-bold">Note</span>
                  </div>
                   <div className="nk-tb-col tb-col-md" style={{ borderRight: '1px solid #e5e9f2', padding: '12px' }}>
                    <span className="sub-text font-weight-bold">Debit</span>
                  </div>
                  <div className="nk-tb-col tb-col-mb" style={{ borderRight: '1px solid #e5e9f2', padding: '12px' }}>
                    <span className="sub-text font-weight-bold">Credit</span>
                  </div>
                   <div className="nk-tb-col tb-col-md" style={{ padding: '12px' }}>
                    <span className="sub-text font-weight-bold">Balance</span>
                  </div>
                 
                </div>

                {transactionsLoading ? (
                  <div className="nk-tb-item" style={{ borderBottom: '1px solid #e5e9f2' }}>
                    <div className="nk-tb-col" style={{ padding: '16px', textAlign: 'center' }}>
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                      <span className="ml-2">Loading transactions...</span>
                    </div>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="nk-tb-item" style={{ borderBottom: '1px solid #e5e9f2' }}>
                    <div className="nk-tb-col" style={{ padding: '16px', textAlign: 'center' }}>
                      <span className="text-soft">No transactions found</span>
                    </div>
                  </div>
                ) : (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="nk-tb-item" style={{ borderBottom: '1px solid #e5e9f2' }}>
                      <div className="nk-tb-col" style={{ borderRight: '1px solid #e5e9f2', padding: '12px' }}>
                        <span className="text-bolder">
                          {formatDateTimeUTC(transaction.date) || 'N/A'}
                        </span>

                      </div>
                      <div className="nk-tb-col tb-col-mb" style={{ borderRight: '1px solid #e5e9f2', padding: '12px' }}>
                        <span className="text text-bolder">
                          {transaction.note || "0"}
                        </span>
                      </div>
                        <div className="nk-tb-col tb-col-mb" style={{ borderRight: '1px solid #e5e9f2', padding: '12px' }}>
                        <span className="text text-bolder">
                          {transaction.debit > 0 ? transaction.debit : '0'}
                        </span>
                      </div>
                       <div className="nk-tb-col tb-col-mb" style={{ borderRight: '1px solid #e5e9f2', padding: '12px' }}>
                        <span className="text text-bolder">
                          {transaction.credit > 0 ? transaction.credit : '0'}
                        </span>
                      </div>
                      <div className="nk-tb-col" style={{ padding: '12px' }}>
                        <div className="d-flex align-items-center gap-2">
                          {(() => {
                            const hasCredit = transaction.credit > 0;
                            const hasDebit = transaction.debit > 0;
                            const balanceColor = hasCredit ? 'text-success' : hasDebit ? 'text-danger' : 'text-muted';
                            
                            return (
                              <>
                                <em
                                  className={`icon ni ${hasCredit ? 'ni-plus' : hasDebit ? 'ni-minus' : 'ni-help'}`}
                                  style={{
                                    fontSize: '1rem',
                                    color: hasCredit ? '#28a745' : hasDebit ? '#e85347' : '#6c757d'
                                  }}
                                ></em>
                                <span className={balanceColor}>
                                  {transaction.balance !== null && transaction.balance !== undefined ? 
                                    Math.abs(transaction.balance).toFixed(2) : 'N/A'}
                                </span>
                              </>
                            );
                          })()}
                        </div>
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
                          <label className="form-label" htmlFor="datetime">
                            Date & Time <span className="text-danger">*</span>
                          </label>
                          <input
                            type="datetime-local"
                            id="datetime"
                            className="form-control"
                            value={transactionForm.date}
                            onChange={(e) =>
                              setTransactionForm((prev) => ({ ...prev, date: e.target.value }))
                            }
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