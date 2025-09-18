'use client';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Button from '../../../../components/ui/button';

import {
  fetchAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  exportAccounts,
  clearError,
  setFilters,
  clearFilters
} from '../../../../redux/slices/accountsSlice';
import {
  fetchCategories
} from '../../../../redux/slices/categoriesSlice';
import { showToast } from '../../../../lib/toast';
import { useSweetAlert } from '../../../../components/SweetAlerts';
import { initializeDropdowns, cleanupDropdowns } from '../../../../lib/dropdownUtils';
import '../../../../app/globals.css';

export default function AccountsTableWidget() {
  // Redux state
  const dispatch = useDispatch();
  const { 
    accounts, 
    loading, 
    error, 
    totalCount, 
    filters, 
    pagination 
  } = useSelector((state) => state.accounts);
  
  const { 
    categories 
  } = useSelector((state) => state.categories);

  // Local state
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  
  // Local filter state
  const [localFilters, setLocalFilters] = useState({
    type: filters.type || 'all',
    status: filters.status || 'all',
    limit: filters.limit || 10
  });

  // SweetAlert hooks
  const { confirmUserDelete, confirmBulkUserDelete, handleDeleteSuccess, handleDeleteError } = useSweetAlert();

  // Form data for account (matching account model schema)
  const [formData, setFormData] = useState({
    name: '',
    cat_name: '',
    type: 'Expense',
    description: '',
    is_active: true
  });

  // Available account types
  const accountTypes = [
    { value: 'Income', label: 'Income', color: 'success' },
    { value: 'Expense', label: 'Expense', color: 'danger' },
    { value: 'Asset', label: 'Asset', color: 'primary' },
    { value: 'Liability', label: 'Liability', color: 'warning' },
    { value: 'Equity', label: 'Equity', color: 'info' }
  ];

  // Load accounts and categories on component mount
  useEffect(() => {
    console.log('Component mounted, fetching accounts with filters:', filters);
    dispatch(fetchAccounts(filters));
    dispatch(fetchCategories({ all: true })); // Fetch all categories for dropdown
  }, [dispatch]);

  // Fetch accounts when filters change
  useEffect(() => {
    console.log('Filters changed, fetching accounts:', filters);
    dispatch(fetchAccounts(filters));
  }, [dispatch, JSON.stringify(filters)]);

  // Debug log for state changes
  useEffect(() => {
    console.log('Account state updated:', { 
      accountsCount: accounts?.length || 0, 
      loading, 
      error, 
      totalCount 
    });
  }, [accounts, loading, error, totalCount]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Initialize dropdown functionality
  useEffect(() => {
    initializeDropdowns();
    return () => {
      cleanupDropdowns();
    };
  }, []);

  // Sync local filters with Redux filters
  useEffect(() => {
    setLocalFilters({
      type: filters.type || 'all',
      status: filters.status || 'all',
      limit: filters.limit || 10
    });
  }, [filters.type, filters.status, filters.limit]);

  // Sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle form submission for new account
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!formData.name || !formData.cat_name || !formData.type) {
      showToast('Account name, category name, and type are required!', 'error');
      setIsSubmitting(false);
      return;
    }
    
    try {
      await dispatch(createAccount(formData)).unwrap();
      
      // Reset form
      setFormData({
        name: '',
        cat_name: '',
        type: 'Expense',
        description: '',
        is_active: true
      });
      
      setShowModal(false);
      showToast('<h5>Account Created Successfully!</h5><p>New account has been added to the system.</p>', 'success');
    } catch (error) {
      showToast(`<h5>Error Creating Account</h5><p>${error}</p>`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit account
  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      cat_name: account.cat_name,
      type: account.type,
      description: account.description || '',
      is_active: account.is_active
    });
    setShowEditModal(true);
  };

  // Handle update account
  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!formData.name || !formData.cat_name || !formData.type) {
      showToast('Account name, category name, and type are required!', 'error');
      setIsSubmitting(false);
      return;
    }
    
    try {
      await dispatch(updateAccount({ id: editingAccount._id, accountData: formData })).unwrap();
      
      // Reset form and close modal
      setFormData({
        name: '',
        cat_name: '',
        type: 'Expense',
        description: '',
        is_active: true
      });
      
      setEditingAccount(null);
      setShowEditModal(false);
      showToast('<h5>Account Updated Successfully!</h5><p>Account information has been updated.</p>', 'success');
    } catch (error) {
      showToast(`<h5>Error Updating Account</h5><p>${error}</p>`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle checkbox selection
  const handleSelectAccount = (accountId) => {
    setSelectedAccounts(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const handleSelectAll = () => {
    if (!accounts || accounts.length === 0) return;
    
    if (selectedAccounts.length === accounts.length) {
      setSelectedAccounts([]);
    } else {
      setSelectedAccounts(accounts.map(account => account._id));
    }
  };

  // Handle search change
  const handleSearchChange = (value) => {
    dispatch(setFilters({ search: value, page: 1 }));
  };

  // Handle type filter change
  const handleTypeFilterChange = (type) => {
    setLocalFilters(prev => ({
      ...prev,
      type: type
    }));
  };

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setLocalFilters(prev => ({
      ...prev,
      status: status
    }));
  };

  // Handle items per page change
  const handleItemsPerPageChange = (limit) => {
    setLocalFilters(prev => ({
      ...prev,
      limit: Number(limit)
    }));
  };

  // Apply filters
  const handleApplyFilters = () => {
    dispatch(setFilters({ 
      ...localFilters, 
      page: 1 
    }));
    
    setTimeout(() => {
      const dropdown = document.getElementById('accountFilterDropdown');
      if (dropdown) {
        dropdown.click();
      }
    }, 100);
  };

  // Reset filters
  const handleResetFilters = () => {
    const resetFilters = {
      type: 'all',
      status: 'all',
      limit: 10
    };
    
    setLocalFilters(resetFilters);
    dispatch(clearFilters());
  };

  // Handle page change
  const handlePageChange = (page) => {
    dispatch(setFilters({ page }));
  };

  // Handle delete account with SweetAlert
  const handleDeleteAccount = async (account) => {
    const confirmed = await confirmUserDelete(`Delete Account: ${account.name}`, 
      `Are you sure you want to delete "${account.name}"? This action cannot be undone.`);
    
    if (confirmed) {
      try {
        await dispatch(deleteAccount(account._id)).unwrap();
        handleDeleteSuccess(`Account "${account.name}" has been deleted successfully.`);
      } catch (error) {
        handleDeleteError(`Failed to delete account: ${error}`);
      }
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      showToast('Exporting accounts...', 'info');
      await dispatch(exportAccounts(filters)).unwrap();
      showToast('<h5>Export Completed!</h5><p>Accounts data has been exported to CSV successfully.</p>', 'success');
    } catch (error) {
      showToast(`Error exporting accounts: ${error}`, 'error');
    }
  };

  // Sort accounts
  const sortedAccounts = accounts ? [...accounts].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  }) : [];

  // Get account type color
  const getTypeColor = (type) => {
    const typeInfo = accountTypes.find(t => t.value === type);
    return typeInfo?.color || 'secondary';
  };

  return (
    <div>
            <div className="nk-block-head nk-block-head-sm">
              <div className="nk-block-between">
                <div className="nk-block-head-content">
                  <h3 className="nk-block-title page-title">Chart of Accounts</h3>
                  <div className="nk-block-des text-soft">
                    <p>You have total {totalCount || 0} accounts.</p>
                  </div>
                </div>

                <div className="nk-block-head-content">
                  <div className="toggle-wrap nk-block-tools-toggle">
                    <a 
                      href="#" 
                      className="btn btn-icon btn-trigger toggle-expand mr-n1" 
                      data-target="pageMenu"
                    >
                      <em className="icon ni ni-menu-alt-r"></em>
                    </a>
                    
                    <div className="toggle-expand-content" data-content="pageMenu">
                      <ul className="nk-block-tools g-3">
                        {/* Search */}
                        <li>
                          <div className="form-control-wrap">
                            <div className="form-icon form-icon-right">
                              <em className="icon ni ni-search"></em>
                            </div>
                            <input 
                              type="text"
                              className="form-control"
                              placeholder="Search accounts..."
                              value={filters.search || ''}
                              onChange={(e) => handleSearchChange(e.target.value)}
                            />
                          </div>
                        </li>

                        {/* Filter Dropdown */}
                        <li>
                          <div className="drodown">
                            <a 
                              href="#" 
                              className="dropdown-toggle btn btn-white btn-dim btn-outline-light"
                              data-toggle="dropdown"
                              id="accountFilterDropdown"
                            >
                              <em className="d-none d-sm-inline icon ni ni-filter-alt"></em>
                              <span>Filter</span>
                              <em className="dd-indc icon ni ni-chevron-right"></em>
                            </a>
                            
                            <div className="dropdown-menu dropdown-menu-right">
                              <div className="dropdown-head">
                                <span className="sub-title dropdown-title">Filter Accounts</span>
                              </div>

                              <div className="dropdown-body dropdown-body-rg">
                                {/* Account Type Filter */}
                                <div className="row gx-6 gy-3">
                                  <div className="col-12">
                                    <div className="form-group">
                                      <label className="overline-title overline-title-alt">Account Type</label>
                                      <select 
                                        className="form-control"
                                        value={localFilters.type}
                                        onChange={(e) => handleTypeFilterChange(e.target.value)}
                                      >
                                        <option value="all">All Types</option>
                                        {accountTypes.map(type => (
                                          <option key={type.value} value={type.value}>
                                            {type.label}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>

                                  {/* Status Filter */}
                                  <div className="col-12">
                                    <div className="form-group">
                                      <label className="overline-title overline-title-alt">Status</label>
                                      <select 
                                        className="form-control"
                                        value={localFilters.status}
                                        onChange={(e) => handleStatusFilterChange(e.target.value)}
                                      >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                      </select>
                                    </div>
                                  </div>

                                  {/* Items Per Page */}
                                  <div className="col-12">
                                    <div className="form-group">
                                      <label className="overline-title overline-title-alt">Items Per Page</label>
                                      <select 
                                        className="form-control"
                                        value={localFilters.limit}
                                        onChange={(e) => handleItemsPerPageChange(e.target.value)}
                                      >
                                        <option value="10">10 per page</option>
                                        <option value="25">25 per page</option>
                                        <option value="50">50 per page</option>
                                        <option value="100">100 per page</option>
                                      </select>
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="col-12">
                                    <div className="form-group d-flex gap-2">
                                      <button 
                                        className="btn btn-secondary"
                                        onClick={handleResetFilters}
                                      >
                                        Reset
                                      </button>
                                      <button 
                                        className="btn btn-primary"
                                        onClick={handleApplyFilters}
                                      >
                                        Apply Filter
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>

                        {/* Export Button */}
                        <li>
                          <button 
                            className="btn btn-white btn-outline-light"
                            onClick={handleExport}
                            disabled={loading}
                          >
                            <em className="icon ni ni-download-cloud"></em>
                            <span>Export</span>
                          </button>
                        </li>

                        {/* Add Account Button */}
                        {/* <li className="nk-block-tools-opt">
                          <button 
                            className="btn btn-primary"
                            onClick={() => setShowModal(true)}
                          >
                            <em className="icon ni ni-plus"></em>
                            <span>Add Account</span>
                          </button>
                        </li> */}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          

            {/* Accounts Table */}
            <div className="nk-block">
              <div className="card card-bordered card-stretch">
                <div className="card-inner-group">
                  <div className="card-inner position-relative card-tools-toggle">
                    <div className="card-title-group">
                      <div className="card-tools mr-n1">
                        {/* <ul className="btn-toolbar gx-1">
                          <li>
                            <button 
                              className="btn btn-icon search-toggle toggle-search"
                              data-target="search"
                            >
                              <em className="icon ni ni-search"></em>
                            </button>
                          </li>
                          <li className="btn-toolbar-sep"></li>
                          <li>
                            <div className="dropdown">
                              <a 
                                href="#" 
                                className="btn btn-trigger btn-icon dropdown-toggle"
                                data-toggle="dropdown"
                              >
                                <div className="dot dot-primary"></div>
                                <em className="icon ni ni-filter-alt"></em>
                              </a>
                            </div>
                          </li>
                          <li>
                            <div className="dropdown">
                              <a 
                                href="#" 
                                className="btn btn-trigger btn-icon dropdown-toggle"
                                data-toggle="dropdown"
                              >
                                <em className="icon ni ni-setting"></em>
                              </a>
                            </div>
                          </li>
                        </ul> */}
                      </div>
                    </div>

                    {/* Search Bar */}
                    <div className="card-search search-wrap" data-search="search">
                      <div className="card-body">
                        <div className="search-content">
                          <button className="search-back btn btn-icon toggle-search" data-target="search">
                            <em className="icon ni ni-arrow-left"></em>
                          </button>
                          <input 
                            type="text"
                            className="border-transparent form-focus-none form-control"
                            placeholder="Search by account name or type"
                            value={filters.search || ''}
                            onChange={(e) => handleSearchChange(e.target.value)}
                          />
                          <button className="search-submit btn btn-icon">
                            <em className="icon ni ni-search"></em>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Loading State */}
                  {loading ? (
                    <div className="card-inner">
                      <div className="text-center">
                        <div className="spinner-border" role="status">
                          <span className="sr-only">Loading...</span>
                        </div>
                        <p className="mt-2">Loading accounts...</p>
                      </div>
                    </div>
                  ) : accounts && accounts.length > 0 ? (
                    <>
                      {/* Bulk Actions */}
                      {selectedAccounts.length > 0 && (
                        <div className="card-inner">
                          <div className="nk-tb-list-head">
                            <div className="nk-tb-item nk-tb-head">
                              <span className="sub-text">
                                {selectedAccounts.length} account(s) selected
                              </span>
                              <div className="ml-auto">
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => {
                                    // You can implement bulk delete here if needed
                                    showToast('Bulk delete feature not implemented yet', 'info');
                                  }}
                                >
                                  <em className="icon ni ni-trash"></em>
                                  Delete Selected
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Table Header */}
                      <div className="card-inner p-0">
                        <div className="nk-tb-list nk-tb-ulist">
                          <div className="nk-tb-item nk-tb-head">
                            <div className="nk-tb-col nk-tb-col-check">
                              <div className="custom-control custom-control-sm custom-checkbox notext">
                                <input 
                                  type="checkbox"
                                  className="custom-control-input"
                                  id="selectAllAccounts"
                                  checked={selectedAccounts.length === accounts.length && accounts.length > 0}
                                  onChange={handleSelectAll}
                                />
                                <label className="custom-control-label" htmlFor="selectAllAccounts"></label>
                              </div>
                            </div>

                            <div className="nk-tb-col">
                              <span 
                                className="sub-text cursor-pointer"
                                onClick={() => handleSort('name')}
                              >
                                Account Name
                                {sortConfig.key === 'name' && (
                                  <em className={`icon ni ni-chevron-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-1`}></em>
                                )}
                              </span>
                            </div>

                            <div className="nk-tb-col tb-col-mb">
                              <span 
                                className="sub-text cursor-pointer"
                                onClick={() => handleSort('type')}
                              >
                                Type
                                {sortConfig.key === 'type' && (
                                  <em className={`icon ni ni-chevron-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-1`}></em>
                                )}
                              </span>
                            </div>

                            <div className="nk-tb-col tb-col-md">
                              <span className="sub-text">Category</span>
                            </div>

                            <div className="nk-tb-col tb-col-lg">
                              <span className="sub-text">Description</span>
                            </div>

                            <div className="nk-tb-col tb-col-md">
                              <span 
                                className="sub-text cursor-pointer"
                                onClick={() => handleSort('is_active')}
                              >
                                Status
                                {sortConfig.key === 'is_active' && (
                                  <em className={`icon ni ni-chevron-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-1`}></em>
                                )}
                              </span>
                            </div>

                            <div className="nk-tb-col nk-tb-col-tools text-right">
                              <span className="sub-text">Actions</span>
                            </div>
                          </div>

                          {/* Table Body */}
                          {sortedAccounts.map((account) => (
                            <div key={account._id} className="nk-tb-item">
                              <div className="nk-tb-col nk-tb-col-check">
                                <div className="custom-control custom-control-sm custom-checkbox notext">
                                  <input 
                                    type="checkbox"
                                    className="custom-control-input"
                                    id={`account_${account._id}`}
                                    checked={selectedAccounts.includes(account._id)}
                                    onChange={() => handleSelectAccount(account._id)}
                                  />
                                  <label className="custom-control-label" htmlFor={`account_${account._id}`}></label>
                                </div>
                              </div>

                              <div className="nk-tb-col">
                                <div className="user-card">
                                  <div className="user-name">
                                    <span className="tb-lead">{account.name}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="nk-tb-col tb-col-mb">
                                <span className={`badge badge-dot badge-${getTypeColor(account.type)}`}>
                                  {account.type}
                                </span>
                              </div>

                              <div className="nk-tb-col tb-col-md">
                                <span className='badge badge-info'>{account.cat_name}</span>
                              </div>

                              <div className="nk-tb-col tb-col-lg">
                                <span className="tb-sub text-ellipsis" style={{maxWidth: '200px'}}>
                                  {account.description || 'No description'}
                                </span>
                              </div>

                              <div className="nk-tb-col tb-col-md">
                                <span className={`badge badge-${account.is_active ? 'success' : 'danger'}`}>
                                  {account.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>

                              <div className="nk-tb-col nk-tb-col-tools">
                                <ul className="nk-tb-actions gx-1">
                                  {/* Edit Button */}
                                  <li>
                                    <button 
                                      className="btn btn-trigger btn-icon"
                                      title="Edit Account"
                                      onClick={() => handleEditAccount(account)}
                                    >
                                      <em className="icon ni ni-edit"></em>
                                    </button>
                                  </li>

                                  {/* Delete Button */}
                                  <li>
                                    <button 
                                      className="btn btn-trigger btn-icon text-danger"
                                      title="Delete Account"
                                      onClick={() => handleDeleteAccount(account)}
                                    >
                                      <em className="icon ni ni-trash"></em>
                                    </button>
                                  </li>

                                
                                </ul>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pagination */}
                      {pagination && (
                        <div className="card-inner">
                          <div className="nk-block-between-md g-3">
                            <div className="g">
                              <ul className="pagination justify-content-center justify-content-md-start">
                                {/* Previous Button */}
                                <li className={`page-item ${!pagination.hasPrevPage ? 'disabled' : ''}`}>
                                  <a 
                                    href="#"
                                    className="page-link"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (pagination.hasPrevPage) {
                                        handlePageChange(pagination.currentPage - 1);
                                      }
                                    }}
                                  >
                                    Prev
                                  </a>
                                </li>

                                {/* Page Numbers */}
                                {Array.from({length: pagination.totalPages}, (_, i) => i + 1).map(page => (
                                  <li key={page} className={`page-item ${pagination.currentPage === page ? 'active' : ''}`}>
                                    <a 
                                      href="#"
                                      className="page-link"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(page);
                                      }}
                                    >
                                      {page}
                                    </a>
                                  </li>
                                ))}

                                {/* Next Button */}
                                <li className={`page-item ${!pagination.hasNextPage ? 'disabled' : ''}`}>
                                  <a 
                                    href="#"
                                    className="page-link"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (pagination.hasNextPage) {
                                        handlePageChange(pagination.currentPage + 1);
                                      }
                                    }}
                                  >
                                    Next
                                  </a>
                                </li>
                              </ul>
                            </div>

                            <div className="g">
                              <div className="pagination-goto d-flex justify-content-center justify-content-md-end gx-3">
                                <div>Page {pagination.currentPage} of {pagination.totalPages}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="card-inner">
                      <div className="text-center">
                        <div className="nk-empty-state">
                          <div className="nk-empty-icon">
                            <em className="icon ni ni-account-setting"></em>
                          </div>
                          <h3 className="nk-empty-title">No accounts found</h3>
                          <p className="nk-empty-text">
                            {filters.search ? 
                              'Try adjusting your search criteria.' : 
                              'Get started by creating your first account.'
                            }
                          </p>
                          <div className="nk-empty-action">
                            {filters.search ? (
                              <button 
                                className="btn btn-outline-light"
                                onClick={() => handleSearchChange('')}
                              >
                                Clear Search
                              </button>
                            ) : (
                              <button 
                                className="btn btn-primary"
                                onClick={() => setShowModal(true)}
                              >
                                <em className="icon ni ni-plus"></em>
                                Add First Account
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          
       
     

      {/* Add Account Modal */}
      {showModal && (
        <div className="modal fade show" style={{display: 'block'}} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Add New Account</h4>
                <button 
                  type="button" 
                  className="close"
                  onClick={() => setShowModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    {/* Account Name */}
                    <div className="col-lg-6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="account-name">
                          Account Name <span className="text-danger">*</span>
                        </label>
                        <input 
                          type="text"
                          className="form-control"
                          id="account-name"
                          placeholder="Enter account name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div className="col-lg-6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="cat-name">
                          Category <span className="text-danger">*</span>
                        </label>
                        <select 
                          className="form-control"
                          id="cat-name"
                          value={formData.cat_name}
                          onChange={(e) => setFormData({...formData, cat_name: e.target.value})}
                          required
                        >
                          <option value="">Select a category</option>
                          {categories && categories.length > 0 ? (
                            categories.filter(cat => cat.is_active).map(category => (
                              <option key={category._id} value={category.name}>
                                {category.name}
                              </option>
                            ))
                          ) : (
                            <option disabled>No categories available</option>
                          )}
                        </select>
                        {(!categories || categories.length === 0) && (
                          <small className="text-muted">
                            No categories found. Please create categories first.
                          </small>
                        )}
                      </div>
                    </div>

                    {/* Account Type */}
                    <div className="col-lg-6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="account-type">
                          Account Type <span className="text-danger">*</span>
                        </label>
                        <select 
                          className="form-control"
                          id="account-type"
                          value={formData.type}
                          onChange={(e) => setFormData({...formData, type: e.target.value})}
                          required
                        >
                          {accountTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-lg-6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="account-status">Account Status</label>
                        <div className="custom-control custom-switch">
                          <input 
                            type="checkbox"
                            className="custom-control-input"
                            id="account-status"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                          />
                          <label className="custom-control-label" htmlFor="account-status">
                            {formData.is_active ? 'Active' : 'Inactive'}
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="col-12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="account-description">Description</label>
                        <textarea 
                          className="form-control"
                          id="account-description"
                          placeholder="Enter account description (optional)"
                          rows="3"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {showEditModal && (
        <div className="modal fade show" style={{display: 'block'}} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Edit Account</h4>
                <button 
                  type="button" 
                  className="close"
                  onClick={() => setShowEditModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>

              <form onSubmit={handleUpdateAccount}>
                <div className="modal-body">
                  <div className="row g-3">
                    {/* Account Name */}
                    <div className="col-lg-6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-account-name">
                          Account Name <span className="text-danger">*</span>
                        </label>
                        <input 
                          type="text"
                          className="form-control"
                          id="edit-account-name"
                          placeholder="Enter account name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div className="col-lg-6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-cat-name">
                          Category <span className="text-danger">*</span>
                        </label>
                        <select 
                          className="form-control"
                          id="edit-cat-name"
                          value={formData.cat_name}
                          onChange={(e) => setFormData({...formData, cat_name: e.target.value})}
                          required
                        >
                          <option value="">Select a category</option>
                          {categories && categories.length > 0 ? (
                            categories.filter(cat => cat.is_active).map(category => (
                              <option key={category._id} value={category.name}>
                                {category.name}
                              </option>
                            ))
                          ) : (
                            <option disabled>No categories available</option>
                          )}
                        </select>
                        {(!categories || categories.length === 0) && (
                          <small className="text-muted">
                            No categories found. Please create categories first.
                          </small>
                        )}
                      </div>
                    </div>

                    {/* Account Type */}
                    <div className="col-lg-6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-account-type">
                          Account Type <span className="text-danger">*</span>
                        </label>
                        <select 
                          className="form-select"
                          id="edit-account-type"
                          value={formData.type}
                          onChange={(e) => setFormData({...formData, type: e.target.value})}
                          required
                        >
                          {accountTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-lg-6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-account-status">Account Status</label>
                        <div className="custom-control custom-switch">
                          <input 
                            type="checkbox"
                            className="custom-control-input"
                            id="edit-account-status"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                          />
                          <label className="custom-control-label" htmlFor="edit-account-status">
                            {formData.is_active ? 'Active' : 'Inactive'}
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="col-12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-account-description">Description</label>
                        <textarea 
                          className="form-control"
                          id="edit-account-description"
                          placeholder="Enter account description (optional)"
                          rows="3"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Updating...' : 'Update Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}