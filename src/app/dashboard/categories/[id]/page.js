'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { showToast } from '../../../../lib/toast';
import { initializeDropdowns, cleanupDropdowns } from '../../../../lib/dropdownUtils';
import Button from '../../../../components/ui/button';
import {
  fetchCategoryById,
  clearCurrentCategory
} from '../../../../redux/slices/categoriesSlice';
import {
  fetchTransactions,
  setFilters as setTransactionFilters,
  clearTransactions
} from '../../../../redux/slices/transactionsSlice';

export default function SingleCategoryPage() {
  const params = useParams();
  const categoryId = params.id;
  const dispatch = useDispatch();

  // Redux state
  const { currentCategory: category, loading: categoryLoading } = useSelector((state) => state.categories);
  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    filters: transactionFilters,
    pagination: transactionPagination
  } = useSelector((state) => state.transactions);

  // Local state
  const [activeTab, setActiveTab] = useState('overview');

  // Load data on mount
  useEffect(() => {
    if (categoryId) {
      dispatch(fetchCategoryById(categoryId));
      dispatch(fetchTransactions({ 
        categoryId, 
        filters: { ...transactionFilters, limit: 10 }
      }));
    }

    return () => {
      dispatch(clearCurrentCategory());
      dispatch(clearTransactions());
    };
  }, [dispatch, categoryId]);

  // Initialize dropdown functionality
  useEffect(() => {
    initializeDropdowns();
    return () => {
      cleanupDropdowns();
    };
  }, []);

  // Handle transaction filter changes
  const handleTransactionFilterChange = (key, value) => {
    dispatch(setTransactionFilters({
      [key]: value,
      page: 1,
      categoryId
    }));
  };

  // Handle transaction pagination
  const handleTransactionPageChange = (page) => {
    dispatch(setTransactionFilters({ 
      page, 
      categoryId 
    }));
  };

  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Get transaction type badge color
  const getTransactionBadgeColor = (type) => {
    return type === 'debit' ? 'badge-danger' : 'badge-success';
  };

  if (categoryLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="nk-block">
        <div className="card">
          <div className="card-inner text-center py-5">
            <h5>Category Not Found</h5>
            <p className="text-soft">The requested category could not be found.</p>
            <Button variant="gradient" asChild>
              <Link href="/dashboard/categories">
                Back to Categories
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
              <Link href="/dashboard/categories">
                <em className="icon ni ni-arrow-left"></em>
                <span>Back to Categories</span>
              </Link>
            </div>
            <h2 className="nk-block-title fw-normal">
              {category.name}
              <span className={`badge badge-sm ml-2 ${category.is_active ? 'badge-success' : 'badge-danger'}`}>
                {category.is_active ? 'Active' : 'Inactive'}
              </span>
              {category.parentName && (
                <span className="badge badge-outline-info badge-sm ml-1">
                  Subcategory
                </span>
              )}
            </h2>
            <div className="nk-block-des">
              <p>{category.description || 'No description available'}</p>
              {category.parentName && (
                <p className="text-primary">
                  <em className="icon ni ni-folder"></em>
                  Parent: {category.parentName}
                </p>
              )}
            </div>
          </div>
          <div className="nk-block-head-content">
            <div className="toggle-wrap nk-block-tools-toggle">
              <a href="#" className="btn btn-icon btn-trigger toggle-expand mr-n1" data-target="pageMenu">
                <em className="icon ni ni-more-v"></em>
              </a>
              <div className="toggle-expand-content" data-content="pageMenu">
                <ul className="nk-block-tools g-3">
                  <li>
                    <Button variant="outline" asChild>
                      <Link href={`/dashboard/categories`}>
                        <em className="icon ni ni-edit"></em>
                        <span>Edit Category</span>
                      </Link>
                    </Button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="nk-block">
        <div className="card card-bordered">
          <div className="card-inner">
            <div className="nav-tabs-card">
              <ul className="nav-tabs">
                <li className="nav-item">
                  <a
                    className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('overview');
                    }}
                  >
                    Overview
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${activeTab === 'transactions' ? 'active' : ''}`}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('transactions');
                    }}
                  >
                    Recent Transactions
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="nk-block">
        {activeTab === 'overview' && (
          <div className="row g-gs">
            {/* Category Info Card */}
            <div className="col-lg-6">
              <div className="card card-bordered h-100">
                <div className="card-inner">
                  <div className="card-title-group align-start mb-3">
                    <div className="card-title">
                      <h6 className="title">Category Information</h6>
                    </div>
                  </div>
                  <div className="row g-3 align-center">
                    <div className="col-lg-5">
                      <div className="profile-udp">
                        <div className="profile-img">
                          <span className="ni ni-folder-list" style={{ fontSize: '3rem', color: '#6366f1' }}></span>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-7">
                      <div className="profile-ud wider">
                        <div className="profile-ud-item">
                          <div className="profile-ud wider">
                            <span className="profile-ud-label">Name:</span>
                            <span className="profile-ud-value">{category.name}</span>
                          </div>
                        </div>
                        <div className="profile-ud-item">
                          <div className="profile-ud wider">
                            <span className="profile-ud-label">Parent:</span>
                            <span className="profile-ud-value">
                              {category.parentName || 'Root Category'}
                            </span>
                          </div>
                        </div>
                        <div className="profile-ud-item">
                          <div className="profile-ud wider">
                            <span className="profile-ud-label">Status:</span>
                            <span className="profile-ud-value">
                              <span className={`badge ${category.is_active ? 'badge-success' : 'badge-danger'}`}>
                                {category.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="profile-ud-item">
                          <div className="profile-ud wider">
                            <span className="profile-ud-label">Created:</span>
                            <span className="profile-ud-value">{category.createdAt}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Statistics Card */}
            <div className="col-lg-6">
              <div className="card card-bordered h-100">
                <div className="card-inner">
                  <div className="card-title-group align-start mb-3">
                    <div className="card-title">
                      <h6 className="title">Transaction Statistics</h6>
                    </div>
                  </div>
                  <div className="row g-gs">
                    <div className="col-6">
                      <div className="nk-ecwg nk-ecwg6">
                        <div className="card-inner">
                          <div className="data">
                            <div className="amount">{category.statistics?.totalTransactions || 0}</div>
                            <div className="info">
                              <span className="text-soft">Total Transactions</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="nk-ecwg nk-ecwg6">
                        <div className="card-inner">
                          <div className="data">
                            <div className="amount text-success">
                              {formatCurrency(category.statistics?.totalAmount || 0)}
                            </div>
                            <div className="info">
                              <span className="text-soft">Total Amount</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="nk-ecwg nk-ecwg6">
                        <div className="card-inner">
                          <div className="data">
                            <div className="amount text-danger">
                              {formatCurrency(category.statistics?.totalDebit || 0)}
                            </div>
                            <div className="info">
                              <span className="text-soft">Total Debits</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="nk-ecwg nk-ecwg6">
                        <div className="card-inner">
                          <div className="data">
                            <div className="amount text-primary">
                              {formatCurrency(category.statistics?.totalCredit || 0)}
                            </div>
                            <div className="info">
                              <span className="text-soft">Total Credits</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Card */}
            {category.description && (
              <div className="col-lg-12">
                <div className="card card-bordered">
                  <div className="card-inner">
                    <div className="card-title-group align-start mb-3">
                      <div className="card-title">
                        <h6 className="title">Description</h6>
                      </div>
                    </div>
                    <p className="text-soft">{category.description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="card card-bordered card-stretch">
            <div className="card-inner-group">
              <div className="card-inner position-relative card-tools-toggle">
                <div className="card-title-group">
                  <div className="card-title">
                    <h6 className="title">Recent Transactions</h6>
                  </div>
                  <div className="card-tools">
                    <div className="form-inline flex-nowrap gx-3">
                      <div className="form-wrap">
                        <select
                          className="form-select"
                          value={transactionFilters.type || 'all'}
                          onChange={(e) => handleTransactionFilterChange('type', e.target.value)}
                        >
                          <option value="all">All Types</option>
                          <option value="debit">Debit</option>
                          <option value="credit">Credit</option>
                        </select>
                      </div>
                      <div className="form-wrap">
                        <input
                          type="date"
                          className="form-control"
                          placeholder="Start Date"
                          value={transactionFilters.startDate || ''}
                          onChange={(e) => handleTransactionFilterChange('startDate', e.target.value)}
                        />
                      </div>
                      <div className="form-wrap">
                        <input
                          type="date"
                          className="form-control"
                          placeholder="End Date"
                          value={transactionFilters.endDate || ''}
                          onChange={(e) => handleTransactionFilterChange('endDate', e.target.value)}
                        />
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
                    <div className="nk-tb-col tb-col-md">
                      <span className="sub-text">Account</span>
                    </div>
                    <div className="nk-tb-col">
                      <span className="sub-text">Type</span>
                    </div>
                    <div className="nk-tb-col tb-col-sm">
                      <span className="sub-text">Amount</span>
                    </div>
                    <div className="nk-tb-col tb-col-lg">
                      <span className="sub-text">Note</span>
                    </div>
                    <div className="nk-tb-col nk-tb-col-tools">
                      <span className="sub-text">Actions</span>
                    </div>
                  </div>

                  {transactionsLoading ? (
                    <div className="nk-tb-item">
                      <div className="nk-tb-col" colSpan="6">
                        <div className="d-flex justify-content-center py-4">
                          <div className="spinner-border text-primary" role="status">
                            <span className="sr-only">Loading...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="nk-tb-item">
                      <div className="nk-tb-col" colSpan="6">
                        <div className="text-center py-4">
                          <div className="mb-3">
                            <em className="icon ni ni-tranx" style={{ fontSize: '3rem', color: '#c4c4c4' }}></em>
                          </div>
                          <h5>No Transactions Found</h5>
                          <p className="text-soft">No transactions found for this category with current filters.</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    transactions.map((transaction) => (
                      <div key={transaction.id} className="nk-tb-item">
                        <div className="nk-tb-col">
                          <span className="text-soft">{transaction.date}</span>
                        </div>
                        <div className="nk-tb-col tb-col-md">
                          <Link 
                            href={`/dashboard/accounts/${transaction.account?.id}`}
                            className="fw-medium text-primary"
                          >
                            {transaction.account?.name}
                          </Link>
                          <div className="text-soft small">
                            {transaction.account?.type}
                          </div>
                        </div>
                        <div className="nk-tb-col">
                          <span className={`badge ${getTransactionBadgeColor(transaction.type)}`}>
                            {transaction.type}
                          </span>
                        </div>
                        <div className="nk-tb-col tb-col-sm">
                          <span className="fw-medium">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </span>
                        </div>
                        <div className="nk-tb-col tb-col-lg">
                          <span className="text-soft">
                            {transaction.note || 'No note'}
                          </span>
                        </div>
                        <div className="nk-tb-col nk-tb-col-tools">
                          <ul className="nk-tb-actions gx-1">
                            <li>
                              <Link 
                                href={`/dashboard/accounts/${transaction.account?.id}`}
                                className="btn btn-trigger btn-icon"
                                title="View Account"
                              >
                                <em className="icon ni ni-eye"></em>
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Transaction Pagination */}
              {transactionPagination && transactionPagination.totalPages > 1 && (
                <div className="card-inner">
                  <div className="nk-block-between-md g-3">
                    <div className="g">
                      <div className="pagination-goto d-flex justify-content-center justify-content-md-start gx-3">
                        <div>Page {transactionPagination.currentPage} of {transactionPagination.totalPages}</div>
                      </div>
                    </div>
                    <div className="g">
                      <div className="pagination pagination-s1">
                        <button
                          className="page-link"
                          disabled={!transactionPagination.hasPrevPage}
                          onClick={() => handleTransactionPageChange(transactionPagination.currentPage - 1)}
                        >
                          Prev
                        </button>
                        {Array.from({ length: Math.min(5, transactionPagination.totalPages) }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            className={`page-link ${transactionPagination.currentPage === page ? 'active' : ''}`}
                            onClick={() => handleTransactionPageChange(page)}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          className="page-link"
                          disabled={!transactionPagination.hasNextPage}
                          onClick={() => handleTransactionPageChange(transactionPagination.currentPage + 1)}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}