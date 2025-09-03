'use client';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { showToast } from '../../../lib/toast';
import { initializeDropdowns, cleanupDropdowns } from '../../../lib/dropdownUtils';
import { useNavigationLoader } from '../../../lib/useNavigationLoader';
import Button from '../../../components/ui/button';
import { InlineLoader } from '../../../components/loader';
import {
  fetchAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  exportAccounts,
  setFilters,
  clearError
} from '../../../redux/slices/accountsSlice';

export default function AccountsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isLoading: navLoading, navigateWithLoader } = useNavigationLoader();
  
  // Redux state
  const {
    accounts,
    loading,
    error,
    filters,
    pagination,
    totalCount
  } = useSelector((state) => state.accounts);

  // Local state for UI
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    type: 'Expense',
    description: '',
    is_active: true
  });

  // Account types
  const accountTypes = [
    { value: 'Income', label: 'Income', color: 'badge-success' },
    { value: 'Expense', label: 'Expense', color: 'badge-danger' },
    { value: 'Asset', label: 'Asset', color: 'badge-info' },
    { value: 'Liability', label: 'Liability', color: 'badge-warning' },
    { value: 'Equity', label: 'Equity', color: 'badge-secondary' }
  ];

  // Load accounts on mount and filter changes
  useEffect(() => {
    dispatch(fetchAccounts(filters));
  }, [dispatch, filters]);

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

  // Handle form submission (create/edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!formData.name.trim()) {
      showToast('Account name is required!', 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      let result;
      if (editingAccount) {
        result = await dispatch(updateAccount({ id: editingAccount.id, accountData: formData })).unwrap();
      } else {
        result = await dispatch(createAccount(formData)).unwrap();
      }

      const message = editingAccount ? 'Account Updated Successfully!' : 'Account Created Successfully!';
      showToast(`<h5>${message}</h5><p>Account has been ${editingAccount ? 'updated' : 'added'} to the system.</p>`, 'success');
      
      // Reset form and close modal
      setFormData({
        name: '',
        type: 'Expense',
        description: '',
        is_active: true
      });
      setEditingAccount(null);
      setShowModal(false);
      
    } catch (error) {
      showToast(`<h5>Error ${editingAccount ? 'Updating' : 'Creating'} Account</h5><p>${error}</p>`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit account
  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      description: account.description || '',
      is_active: account.is_active
    });
    setShowModal(true);
  };

  // Handle delete account
  const handleDeleteAccount = async (accountId, accountName) => {
    if (!confirm(`Are you sure you want to delete "${accountName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await dispatch(deleteAccount(accountId)).unwrap();
      showToast('<h5>Account Deleted Successfully!</h5><p>The account has been removed from the system.</p>', 'success');
    } catch (error) {
      showToast(`<h5>Error Deleting Account</h5><p>${error}</p>`, 'error');
    }
  };

  // Handle export accounts
  const [isExporting, setIsExporting] = useState(false);
  const handleExportAccounts = async () => {
    setIsExporting(true);
    try {
      await dispatch(exportAccounts(filters)).unwrap();
      showToast('<h5>Export Successful!</h5><p>Accounts have been exported to CSV.</p>', 'success');
    } catch (error) {
      showToast(`<h5>Export Failed</h5><p>${error}</p>`, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle search
  const handleSearchChange = (e) => {
    dispatch(setFilters({
      search: e.target.value,
      page: 1
    }));
  };

  // Handle type filter
  const handleTypeFilter = (type) => {
    dispatch(setFilters({
      type,
      page: 1
    }));
  };

  // Handle status filter
  const handleStatusFilter = (status) => {
    dispatch(setFilters({
      status,
      page: 1
    }));
  };

  // Handle pagination
  const handlePageChange = (page) => {
    dispatch(setFilters({ page }));
  };

  // Get badge color for account type
  const getTypeBadgeColor = (type) => {
    return accountTypes.find(t => t.value === type)?.color || 'badge-secondary';
  };

  return (
    <div>
      {/* Page Header */}
      <div className="nk-block-head nk-block-head-sm">
        <div className="nk-block-between">
          <div className="nk-block-head-content">
            <h3 className="nk-block-title page-title">Accounts Management</h3>
            <div className="nk-block-des text-soft">
              <p>Manage your chart of accounts - create, edit, and organize your financial accounts.</p>
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
                    <Button 
                      onClick={handleExportAccounts}
                      variant="outline"
                      disabled={loading || isExporting}
                      className="gap-2"
                    >
                      {isExporting ? (
                        <InlineLoader size="sm" color="gray" />
                      ) : (
                        <em className="icon ni ni-download-cloud"></em>
                      )}
                      <span>{isExporting ? 'Exporting...' : 'Export'}</span>
                    </Button>
                  </li>
                  <li className="nk-block-tools-opt">
                    <Button 
                      onClick={() => setShowModal(true)}
                      variant="gradient"
                      className="gap-2"
                    >
                      <em className="icon ni ni-plus"></em>
                      <span>Add Account</span>
                    </Button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="nk-block">
        <div className="card card-bordered card-stretch">
          <div className="card-inner-group">
            <div className="card-inner position-relative card-tools-toggle">
              <div className="card-title-group">
                <div className="card-tools">
                  <div className="form-inline flex-nowrap gx-3">
                    <div className="form-wrap">
                      <div className="form-icon form-icon-right">
                        <em className="icon ni ni-search"></em>
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search accounts..."
                        value={filters.search}
                        onChange={handleSearchChange}
                      />
                    </div>
                    <div className="form-wrap">
                      <select
                        className="form-select"
                        value={filters.type}
                        onChange={(e) => handleTypeFilter(e.target.value)}
                      >
                        <option value="all">All Types</option>
                        {accountTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-wrap">
                      <select
                        className="form-select"
                        value={filters.status}
                        onChange={(e) => handleStatusFilter(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Accounts Table */}
            <div className="card-inner p-0">
              <div className="nk-tb-list nk-tb-ulist">
                <div className="nk-tb-item nk-tb-head">
                  <div className="nk-tb-col">
                    <span className="sub-text">Account</span>
                  </div>
                  <div className="nk-tb-col tb-col-mb">
                    <span className="sub-text">Type</span>
                  </div>
                  <div className="nk-tb-col tb-col-md">
                    <span className="sub-text">Description</span>
                  </div>
                  <div className="nk-tb-col tb-col-lg">
                    <span className="sub-text">Status</span>
                  </div>
                  <div className="nk-tb-col tb-col-lg">
                    <span className="sub-text">Created</span>
                  </div>
                  <div className="nk-tb-col nk-tb-col-tools text-right">
                    <span className="sub-text">Action</span>
                  </div>
                </div>

                {loading ? (
                  <div className="nk-tb-item">
                    <div className="nk-tb-col">
                      <div className="flex items-center">
                        <InlineLoader size="md" color="blue" />
                        <span className="ml-2">Loading accounts...</span>
                      </div>
                    </div>
                  </div>
                ) : accounts.length === 0 ? (
                  <div className="nk-tb-item">
                    <div className="nk-tb-col">
                      <span className="text-soft">No accounts found</span>
                    </div>
                  </div>
                ) : (
                  accounts.map((account) => (
                    <div key={account.id} className="nk-tb-item">
                      <div className="nk-tb-col">
                        <div className="user-card">
                          <div className="user-avatar bg-primary">
                            <em className="icon ni ni-wallet-alt"></em>
                          </div>
                          <div className="user-info">
                            <span className="tb-lead">{account.name}</span>
                            <span className="tb-sub text-primary">
                              <button 
                                onClick={() => navigateWithLoader(`/dashboard/accounts/${account.id}`, { minLoadTime: 300 })}
                                className="link-primary"
                                disabled={navLoading}
                              >
                                View Details
                              </button>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="nk-tb-col tb-col-mb">
                        <span className={`badge badge-sm ${getTypeBadgeColor(account.type)}`}>
                          {account.type}
                        </span>
                      </div>
                      <div className="nk-tb-col tb-col-md">
                        <span className="tb-amount">
                          {account.description || <em className="text-soft">No description</em>}
                        </span>
                      </div>
                      <div className="nk-tb-col tb-col-lg">
                        <span className={`badge badge-dot ${account.is_active ? 'badge-success' : 'badge-danger'}`}>
                          {account.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="nk-tb-col tb-col-lg">
                        <span className="tb-date">{account.createdAt}</span>
                      </div>
                      <div className="nk-tb-col nk-tb-col-tools">
                        <ul className="nk-tb-actions gx-1">
                          <li className="nk-tb-action-hidden">
                            <button
                              onClick={() => navigateWithLoader(`/dashboard/accounts/${account.id}`, { minLoadTime: 300 })}
                              className="btn btn-trigger btn-icon"
                              data-toggle="tooltip"
                              data-placement="top"
                              title="View Account"
                              disabled={navLoading}
                            >
                              {navLoading ? (
                                <InlineLoader size="sm" color="gray" />
                              ) : (
                                <em className="icon ni ni-eye"></em>
                              )}
                            </button>
                          </li>
                          <li>
                            <div className="drodown">
                              <a
                                href="#"
                                className="dropdown-toggle btn btn-icon btn-trigger"
                                data-toggle="dropdown"
                              >
                                <em className="icon ni ni-more-h"></em>
                              </a>
                              <div className="dropdown-menu dropdown-menu-right">
                                <ul className="link-list-opt no-bdr">
                                  <li>
                                    <a
                                      href={`/dashboard/accounts/${account.id}`}
                                      className="dropdown-item"
                                    >
                                      <em className="icon ni ni-eye"></em>
                                      <span>View Details</span>
                                    </a>
                                  </li>
                                  <li>
                                    <button
                                      onClick={() => handleEditAccount(account)}
                                      className="dropdown-item"
                                    >
                                      <em className="icon ni ni-edit"></em>
                                      <span>Edit Account</span>
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      onClick={() => handleDeleteAccount(account.id, account.name)}
                                      className="dropdown-item text-danger"
                                    >
                                      <em className="icon ni ni-trash"></em>
                                      <span>Delete Account</span>
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </li>
                        </ul>
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

      {/* Modal for Add/Edit Account */}
      {showModal && (
        <>
          <div className="modal fade show" style={{ display: 'block' }}>
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingAccount ? 'Edit Account' : 'Add New Account'}
                  </h5>
                  <button
                    type="button"
                    className="close"
                    onClick={() => {
                      setShowModal(false);
                      setEditingAccount(null);
                      setFormData({
                        name: '',
                        type: 'Expense',
                        description: '',
                        is_active: true
                      });
                    }}
                  >
                    <span>&times;</span>
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label" htmlFor="name">
                            Account Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            id="name"
                            className="form-control"
                            placeholder="Enter account name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                         <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label" htmlFor="role">Account Type</label>
                        <div className="form-control-wrap">
                          <select
                            id="type"
                            className="form-control"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            required
                          >
                              <option value="">Select Account Type</option>
                              <option value="Income">Income</option>
                              <option value="Expense">Expense</option>
                              <option value="Liability">Liability</option>
                              <option value="Asset">Asset</option>
                              <option value="Equity">Equity</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    </div>
                  
                  
                     
                    

                    <div className="form-group">
                      <label className="form-label" htmlFor="description">
                        Description
                      </label>
                      <textarea
                        id="description"
                        className="form-control"
                        rows="3"
                        placeholder="Enter account description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <div className="custom-control custom-switch">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="is_active"
                          checked={formData.is_active}
                          onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                        />
                        <label className="custom-control-label" htmlFor="is_active">
                          Active Account
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowModal(false);
                        setEditingAccount(null);
                        setFormData({
                          name: '',
                          type: 'Expense',
                          description: '',
                          is_active: true
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
                          {editingAccount ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <em className="icon ni ni-check"></em>
                          {editingAccount ? 'Update Account' : 'Create Account'}
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