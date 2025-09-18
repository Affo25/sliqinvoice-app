'use client';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../../components/ui/button';
import { showToast } from '../../../lib/toast';
import { initializeDropdowns, cleanupDropdowns } from '../../../lib/dropdownUtils';
import {
  fetchAccountsReport,
  exportAccountsReport,
  setReportFilters,
  clearError
} from '../../../redux/slices/transactionsSlice';
import { fetchCategories } from '../../../redux/slices/categoriesSlice';

export default function AccountReportPage() {
  const dispatch = useDispatch();

  // Redux state
  const {
    reportTransactions,
    reportLoading,
    error,
    reportFilters,
    reportPagination
  } = useSelector((state) => state.transactions);

  const { categories } = useSelector((state) => state.categories);

  // Load data on mount
  useEffect(() => {
    dispatch(fetchAccountsReport(reportFilters));
    dispatch(fetchCategories({ all: true })); // Get all categories for dropdown
  }, [dispatch, reportFilters]);

  // Initialize dropdown functionality
  useEffect(() => {
    initializeDropdowns();
    return () => {
      cleanupDropdowns();
    };
  }, []);

  // Handle Redux errors
  useEffect(() => {
    if (error) {
      showToast(`<h5>Error</h5><p>${error}</p>`, 'error');
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    dispatch(setReportFilters({ [key]: value, page: 1 }));
  };

  // Handle search
  const handleSearchChange = (e) => {
    dispatch(setReportFilters({
      search: e.target.value,
      page: 1
    }));
  };

  // Handle page change
  const handlePageChange = (page) => {
    dispatch(setReportFilters({ page }));
  };

  // Handle export
  const handleExport = async () => {
    try {
      await dispatch(exportAccountsReport(reportFilters)).unwrap();
      showToast('<h5>Export Successful!</h5><p>Account report has been exported successfully.</p>', 'success');
    } catch (error) {
      showToast(`<h5>Export Failed</h5><p>${error}</p>`, 'error');
    }
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Get date 30 days ago
  const getThirtyDaysAgo = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  };

  return (
    <div>
      {/* Page Header */}
      <div className="nk-block-head nk-block-head-sm">
        <div className="nk-block-between">
          <div className="nk-block-head-content">
            <h3 className="nk-block-title page-title">Account Transaction Report</h3>
            <div className="nk-block-des text-soft">
              <p>View detailed transaction reports with account information and flexible filtering options.</p>
            </div>
          </div>
          <div className="nk-block-head-content">
            <div className="toggle-wrap nk-block-tools-toggle">
              <a href="#" className="btn btn-icon btn-trigger toggle-expand mr-n1" data-target="pageMenu">
                <em className="icon ni ni-menu-alt-r"></em>
              </a>
              <div className="toggle-expand-content" data-content="pageMenu">
                <ul className="nk-block-tools g-3">
                  <li className="nk-block-tools-opt">
                    <Button
                      onClick={handleExport}
                      variant="gradient"
                      className="gap-2"
                      disabled={reportLoading}
                    >
                      <em className="icon ni ni-download"></em>
                      <span>Export Report</span>
                    </Button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="nk-block">
        <div className="card card-bordered">
          <div className="card-inner">
            <div className="row g-4">
              {/* Search */}
              <div className="col-md-3">
                <div className="form-group">
                  <label className="form-label" htmlFor="search">Search</label>
                  <div className="form-control-wrap">
                    <input
                      type="text"
                      id="search"
                      className="form-control"
                      placeholder="Search accounts..."
                      value={reportFilters.search}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
              </div>

              {/* Date From */}
              <div className="col-md-3">
                <div className="form-group">
                  <label className="form-label" htmlFor="dateFrom">Date From</label>
                  <div className="form-control-wrap">
                    <input
                      type="date"
                      id="dateFrom"
                      className="form-control"
                      value={reportFilters.dateFrom}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Date To */}
              <div className="col-md-3">
                <div className="form-group">
                  <label className="form-label" htmlFor="dateTo">Date To</label>
                  <div className="form-control-wrap">
                    <input
                      type="date"
                      id="dateTo"
                      className="form-control"
                      value={reportFilters.dateTo}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Date Filters */}
              <div className="col-md-3">
                <div className="form-group">
                  <label className="form-label">Quick Filters</label>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleFilterChange('dateFrom', getTodayDate());
                        handleFilterChange('dateTo', getTodayDate());
                      }}
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleFilterChange('dateFrom', getThirtyDaysAgo());
                        handleFilterChange('dateTo', getTodayDate());
                      }}
                    >
                      Last 30 Days
                    </Button>
                  </div>
                </div>
              </div>

              {/* Account Type */}
              <div className="col-md-3">
                <div className="form-group">
                  <label className="form-label" htmlFor="type">Account Type</label>
                  <div className="form-control-wrap">
                    <select
                      id="type"
                      className="form-control"
                      value={reportFilters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="Income">Income</option>
                      <option value="Expense">Expense</option>
                      <option value="Asset">Asset</option>
                      <option value="Liability">Liability</option>
                      <option value="Equity">Equity</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="col-md-3">
                <div className="form-group">
                  <label className="form-label" htmlFor="category">Category</label>
                  <div className="form-control-wrap">
                    <select
                      id="category"
                      className="form-control"
                      value={reportFilters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                      <option value="all">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="col-md-3">
                <div className="form-group">
                  <label className="form-label">&nbsp;</label>
                  <div>
                    <Button
                      variant="outline"
                      onClick={() => dispatch(setReportFilters({
                        search: '',
                        type: 'all',
                        category: 'all',
                        dateFrom: '',
                        dateTo: '',
                        page: 1
                      }))}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Summary */}
      {!reportLoading && reportTransactions.length > 0 && (
        <div className="nk-block">
          <div className="row g-gs">
            <div className="col-md-3">
              <div className="card card-bordered">
                <div className="card-inner">
                  <div className="card-title-group align-start mb-2">
                    <div className="card-title">
                      <h6 className="title">Total Transactions</h6>
                    </div>
                  </div>
                  <div className="align-end flex-sm-wrap g-4 flex-md-nowrap">
                    <div className="nk-sale-data">
                      <span className="amount">{reportPagination.totalCount || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card card-bordered">
                <div className="card-inner">
                  <div className="card-title-group align-start mb-2">
                    <div className="card-title">
                      <h6 className="title">Total Debits</h6>
                    </div>
                  </div>
                  <div className="align-end flex-sm-wrap g-4 flex-md-nowrap">
                    <div className="nk-sale-data">
                      <span className="amount">
                        {reportTransactions.reduce((sum, t) => sum + (t.debit || 0), 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card card-bordered">
                <div className="card-inner">
                  <div className="card-title-group align-start mb-2">
                    <div className="card-title">
                      <h6 className="title">Total Credits</h6>
                    </div>
                  </div>
                  <div className="align-end flex-sm-wrap g-4 flex-md-nowrap">
                    <div className="nk-sale-data">
                      <span className="amount">
                        {reportTransactions.reduce((sum, t) => sum + (t.credit || 0), 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card card-bordered">
                <div className="card-inner">
                  <div className="card-title-group align-start mb-2">
                    <div className="card-title">
                      <h6 className="title">Net Amount</h6>
                    </div>
                  </div>
                  <div className="align-end flex-sm-wrap g-4 flex-md-nowrap">
                    <div className="nk-sale-data">
                      <span className="amount">
                        {(reportTransactions.reduce((sum, t) => sum + (t.debit || 0), 0) - 
                           reportTransactions.reduce((sum, t) => sum + (t.credit || 0), 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="nk-block">
        <div className="card card-bordered card-stretch">
          <div className="card-inner-group">
            <div className="card-inner p-0">
              <div className="nk-tb-list nk-tb-ulist">
                <div className="nk-tb-item nk-tb-head">
                  <div className="nk-tb-col">
                    <span className="sub-text">Date</span>
                  </div>
                  <div className="nk-tb-col">
                    <span className="sub-text">Account</span>
                  </div>
                  <div className="nk-tb-col tb-col-md">
                    <span className="sub-text">Type</span>
                  </div>
                  <div className="nk-tb-col text-right">
                    <span className="sub-text">Debit</span>
                  </div>
                  <div className="nk-tb-col text-right">
                    <span className="sub-text">Credit</span>
                  </div>
                  <div className="nk-tb-col text-right">
                    <span className="sub-text">Balance</span>
                  </div>
                  <div style={{ paddingLeft:"50px" }} className="nk-tb-col tb-col-md">
                    <span className="sub-text">Note</span>
                  </div>
                </div>

                {reportLoading ? (
                  <div className="nk-tb-item">
                    <div className="nk-tb-col" colSpan="8">
                      <div className="d-flex justify-content-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="sr-only">Loading...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : reportTransactions.length === 0 ? (
                  <div className="nk-tb-item">
                    <div className="nk-tb-col" colSpan="8">
                      <div className="text-center py-4">
                        <div className="mb-3">
                          <em className="icon ni ni-reports" style={{ fontSize: '3rem', color: '#c4c4c4' }}></em>
                        </div>
                        <h5>No Transactions Found</h5>
                        <p className="text-soft">No transactions match your current filter criteria.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  reportTransactions.map((transaction) => (
                    <div key={transaction.id} className="nk-tb-item">
                      <div className="nk-tb-col">
                        <span className="tb-date">{transaction.date}</span>
                      </div>
                      <div className="nk-tb-col">
                        <div>
                          <span className="fw-bold">{transaction.account?.name || 'Unknown Account'}</span>
                         
                        </div>
                      </div>
                      <div className="nk-tb-col tb-col-md">
                        <span className={`badge ${
                          transaction.account?.type === 'Income' ? 'badge-success' :
                          transaction.account?.type === 'Expense' ? 'badge-danger' :
                          transaction.account?.type === 'Asset' ? 'badge-info' :
                          transaction.account?.type === 'Liability' ? 'badge-warning' :
                          'badge-secondary'
                        }`}>
                          {transaction.account?.type || 'Unknown'}
                        </span>
                      </div>
                     
                      <div className="nk-tb-col text-right">
                        <span className={`fw-bold ${transaction.debit > 0 ? 'text-success' : 'text-muted'}`}>
                          {transaction.debit > 0 ? transaction.debit.toLocaleString() : '-'}
                        </span>
                      </div>
                      <div className="nk-tb-col text-right">
                        <span className={`fw-bold ${transaction.credit > 0 ? 'text-danger' : 'text-muted'}`}>
                          {transaction.credit > 0 ? transaction.credit.toLocaleString() : '-'}
                        </span>
                      </div>
                      <div className="nk-tb-col text-right">
                        <span className="fw-bold">{transaction.balance.toLocaleString()}</span>
                      </div>
                      <div style={{ paddingLeft:"50px" }} className="nk-tb-col tb-col-md">
                        <span className="text-soft">{transaction.note || '-'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pagination */}
            {reportPagination && reportPagination.totalPages > 1 && (
              <div className="card-inner">
                <div className="nk-block-between-md g-3">
                  <div className="g">
                    <div className="pagination-goto d-flex justify-content-center justify-content-md-start gx-3">
                      <div>Page {reportPagination.currentPage} of {reportPagination.totalPages}</div>
                      <div>({reportPagination.totalCount} total records)</div>
                    </div>
                  </div>
                  <div className="g">
                    <div className="pagination d-flex justify-content-center justify-content-md-end">
                      <button
                        className="page-link"
                        disabled={!reportPagination.hasPrevPage}
                        onClick={() => handlePageChange(reportPagination.currentPage - 1)}
                      >
                        Prev
                      </button>
                      {Array.from({ length: reportPagination.totalPages }, (_, i) => i + 1)
                        .filter(page => Math.abs(page - reportPagination.currentPage) <= 2 || page === 1 || page === reportPagination.totalPages)
                        .map((page, index, arr) => (
                          <React.Fragment key={page}>
                            {index > 0 && arr[index - 1] !== page - 1 && <span className="page-link">...</span>}
                            <button
                              className={`page-link ${reportPagination.currentPage === page ? 'active' : ''}`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        ))}
                      <button
                        className="page-link"
                        disabled={!reportPagination.hasNextPage}
                        onClick={() => handlePageChange(reportPagination.currentPage + 1)}
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
      </div>
    </div>
  );
}