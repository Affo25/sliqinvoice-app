'use client';
import { useState, useEffect, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { fetchCategories } from '../../../redux/slices/categoriesSlice';

// Separate component that uses useSearchParams
function AccountsPageContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const { categories } = useSelector((state) => state.categories);

  // Local state for UI
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    type: 'Expense',
    description: '',
    is_active: true,
    cat_name: ""
  });

  // Account types
  const accountTypes = [
    { value: 'Income', label: 'Income', color: 'badge-success', icon: 'ni ni-trend-up' },
    { value: 'Expense', label: 'Expense', color: 'badge-danger', icon: 'ni ni-trend-down' },
    { value: 'Asset', label: 'Asset', color: 'badge-info', icon: 'ni ni-coins' },
    { value: 'Liability', label: 'Liability', color: 'badge-warning', icon: 'ni ni-credit-card' },
    { value: 'Equity', label: 'Equity', color: 'badge-secondary', icon: 'ni ni-pie' }
  ];


  // Load accounts on mount and filter changes
  useEffect(() => {
    dispatch(fetchAccounts(filters));
    const categoryFilters = {
      type: filters.type || 'all',
      status: filters.status || 'all',
      search: filters.search || '',
      all: true // or false, depending on your use case
    };
    dispatch(fetchCategories(categoryFilters));
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
        is_active: true,
        cat_name: ""
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
      is_active: account.is_active,
      cat_name: account.cat_name || ''
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

  // Handle tab change
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    if (tabKey === 'all') {
      router.push('/dashboard/accounts');
    } else {
      router.push(`/dashboard/accounts?type=${tabKey}`);
    }
  };

  // Get badge color for account type
  const getTypeBadgeColor = (type) => {
    return accountTypes.find(t => t.value === type)?.color || 'badge-secondary';
  };

  // Handle URL params for tab switching
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam && accountTypes.some(t => t.value === typeParam)) {
      setActiveTab(typeParam);
    } else if (!typeParam) {
      setActiveTab('all');
    }
  }, [searchParams]);

  // Filter accounts based on active tab (client-side filtering for better UX)
  const getFilteredAccounts = () => {
    if (activeTab === 'all') {
      return accounts;
    }
    return accounts.filter(account => account.type === activeTab);
  };

  // Get account counts by type
  const getAccountCounts = () => {
    const counts = { all: accounts.length };
    accountTypes.forEach(type => {
      counts[type.value] = accounts.filter(account => account.type === type.value).length;
    });
    return counts;
  };

  // Get accounts summary for each type
  const getAccountsSummary = () => {
    const summary = {};
    accountTypes.forEach(type => {
      const typeAccounts = accounts.filter(account => account.type === type.value);
      summary[type.value] = {
        count: typeAccounts.length,
        active: typeAccounts.filter(account => account.is_active).length,
        inactive: typeAccounts.filter(account => !account.is_active).length,
        recent: typeAccounts.slice(0, 3) // Get 3 most recent for display
      };
    });
    return summary;
  };

  const accountCounts = getAccountCounts();
  const filteredAccounts = getFilteredAccounts();
  const accountsSummary = getAccountsSummary();

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
                      onClick={() => {
                        // Pre-fill form with current tab type if not 'all'
                        if (activeTab !== 'all') {
                          setFormData(prev => ({ ...prev, type: activeTab }));
                        }
                        setShowModal(true);
                      }}
                      variant="gradient"
                      className="gap-2"
                    >
                      <em className="icon ni ni-plus"></em>
                      <span>
                        {activeTab === 'all' ? 'Add Account' : `Add ${activeTab} Account`}
                      </span>
                    </Button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* // accounts summary section */}
      <div className="nk-block">
        <div className="row g-4">
          {['Income', 'Expense', 'Asset', 'Liability'].map((type) => {
            const filteredAccounts = accounts.filter(acc => acc.type === type); // All accounts of this type

            return (
              <div key={type} className="col-md-6 col-lg-3">
                <div
                  className="card card-bordered rounded-3 shadow-sm hover-shadow"
                  style={{
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div className="card-inner p-3">
                    {/* Table Title */}
                    <h6 className="card-title mb-3">{type} Accounts</h6>

                    {/* Account List */}
                    <table className="table table-sm mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Account Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAccounts.length > 0 ? (
                          filteredAccounts.map((acc, index) => (
                            <tr key={acc.id}>
                              <td>{index + 1}</td>
                              <td>
                                <a
                                  href={`/dashboard/accounts/${acc.id}`}
                                  className="text-decoration-none text-primary"
                                  style={{ cursor: 'pointer' }}
                                >
                                  {acc.name}
                                </a>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="2" className="text-muted text-center">
                              No {type} accounts
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>






      {/* Modal for Add/Edit Account */}
      {showModal && (
        <>
          <div className="modal fade show" style={{ display: 'block' }}>
            <div className="modal-dialog modal-xl" role="document">
              <div className="modal-content modal-xl">
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
                      <div className="col-md-4">
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
                      <div className="col-md-4">
                        <div className="form-group">
                          <label className="form-label" htmlFor="category">Select Categories</label>
                          <div className="form-control-wrap">
                            <select
                              id="category"
                              className="form-control"
                              value={formData.cat_name} // bind to cat_name
                              onChange={(e) => setFormData({ ...formData, cat_name: e.target.value })} // update cat_name
                              required
                            >
                              <option value="">Select Account Type</option>
                              {categories.map((category) => (
                                <option key={category.id} value={category.name}>
                                  {category.name}
                                </option>
                              ))}
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

// Main component wrapped in Suspense
export default function AccountsPage() {
  return (
    <Suspense fallback={
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    }>
      <AccountsPageContent />
    </Suspense>
  );
}