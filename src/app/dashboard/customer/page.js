'use client';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {createUser} from '../../../redux/slices/usersSlice';

import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  deleteMultipleCustomers,
  exportCustomers,
  importCustomers,
  setFilters,
  clearFilters,
  clearError,
  setLoading
} from '../../../redux/slices/customersSlice';
import { showToast } from '../../../lib/toast';
import { useSweetAlert } from '../../../components/SweetAlerts';
import { CustomerActionMenu, BulkCustomerActions } from '../../../components/CustomerActions';
import { initializeDropdowns, cleanupDropdowns } from '../../../lib/dropdownUtils';
import '../../../app/globals.css';

export default function CustomersPage() {
  // Redux state
  const dispatch = useDispatch();
  const { 
    customers, 
    loading, 
    error, 
    totalCount, 
    filters, 
    pagination 
  } = useSelector((state) => state.customers);

  // Local state
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  
  // Local filter state (for temporary selections before Apply)
  const [localFilters, setLocalFilters] = useState({
    statuses: filters.statuses || [],
    limit: filters.limit || 10
  });

  // SweetAlert hooks
  const { confirmUserDelete, confirmBulkUserDelete, handleDeleteSuccess, handleDeleteError, handleBulkDeleteSuccess, handleBulkDeleteError } = useSweetAlert();

  // Form data for new customer (matching customer model schema)
  const [formData, setFormData] = useState({
    company_name: '',
    contact_email: '',
    contact_phone: '',
    password: '',
    address: '',
    package_id: '',
    subscription_status: 'active',
    permissions: []
  });

  // Available permissions for selection
  const availablePermissions = [
    'read_invoices', 'write_invoices', 'delete_invoices',
    'read_reports', 'write_reports',
    'billing_management', 'profile_management'
  ];

  // Available subscription statuses
  const subscriptionStatuses = [
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Load customers on component mount
  useEffect(() => {
    console.log('Component mounted, fetching customers with filters:', filters);
    
    // Test if API is reachable first
    const testAPI = async () => {
      try {
        console.log('🧪 Testing API connectivity...');
        const response = await fetch('/api/customers?limit=1');
        console.log('🧪 API Test Response:', response.status, response.ok);
        
        if (response.ok) {
          console.log('✅ API is reachable, proceeding with Redux fetch');
          const fetchPromise = dispatch(fetchCustomers(filters));
          
          // Add a timeout fallback to prevent infinite loading
          const timeout = setTimeout(() => {
            console.warn('⚠️ Fetch customers timeout - forcing loading to false');
            dispatch(setLoading(false));
          }, 15000); // 15 second timeout
          
          fetchPromise.finally(() => {
            clearTimeout(timeout);
          });
        } else {
          console.error('❌ API not reachable, setting error state');
          dispatch(setLoading(false));
          showToast('Failed to connect to server', 'error');
        }
      } catch (error) {
        console.error('❌ API connectivity test failed:', error);
        dispatch(setLoading(false));
        showToast('Network error: ' + error.message, 'error');
      }
    };
    
    testAPI();
  }, [dispatch]);

  // Fetch customers when filters change (but not on first mount)
  useEffect(() => {
    console.log('Filters changed, fetching customers:', filters);
    dispatch(fetchCustomers(filters));
  }, [dispatch, JSON.stringify(filters)]); // Use JSON.stringify to prevent infinite loop

  // Debug log for state changes
  useEffect(() => {
    console.log('Customer state updated:', { 
      customersCount: customers?.length || 0, 
      loading, 
      error, 
      totalCount 
    });
  }, [customers, loading, error, totalCount]);

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

  // Sync local filters with Redux filters (for external changes like reset)
  useEffect(() => {
    setLocalFilters({
      statuses: filters.statuses || [],
      limit: filters.limit || 10
    });
  }, [filters.statuses, filters.limit]);

  // Sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!formData.company_name || !formData.contact_email || !formData.password) {
      showToast('Company name, contact email, and password are required!', 'error');
      setIsSubmitting(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contact_email)) {
      showToast('Please enter a valid email address!', 'error');
      setIsSubmitting(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters long!', 'error');
      setIsSubmitting(false);
      return;
    }
    
    try {
      await dispatch(createCustomer(formData)).unwrap();
      
      // Reset form
      setFormData({
        company_name: '',
        contact_email: '',
        contact_phone: '',
        password: '',
        address: '',
        package_id: '',
        subscription_status: 'active',
        permissions: []
      });
      
      setShowModal(false);
      showToast('<h5>Customer Created Successfully!</h5><p>New customer has been added to the system.</p>', 'success');
    } catch (error) {
      showToast(`<h5>Error Creating Customer</h5><p>${error}</p>`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit customer
  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      company_name: customer.company_name,
      contact_email: customer.contact_email,
      contact_phone: customer.contact_phone || '',
      password: '', // Don't show existing password for security
      address: customer.address || '',
      package_id: customer.package_id || '',
      subscription_status: customer.subscription_status,
      permissions: customer.permissions || []
    });
    setShowEditModal(true);
  };

  // Handle update customer
  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!formData.company_name || !formData.contact_email) {
      showToast('Company name and contact email are required!', 'error');
      setIsSubmitting(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contact_email)) {
      showToast('Please enter a valid email address!', 'error');
      setIsSubmitting(false);
      return;
    }

    // Validate password if it's being changed
    if (formData.password && formData.password.length < 6) {
      showToast('Password must be at least 6 characters long if changing!', 'error');
      setIsSubmitting(false);
      return;
    }
    
    try {
      await dispatch(updateCustomer({ id: editingCustomer._id, customerData: formData })).unwrap();
      
      // Reset form and close modal
      setFormData({
        company_name: '',
        contact_email: '',
        contact_phone: '',
        password: '',
        address: '',
        package_id: '',
        subscription_status: 'active',
        permissions: []
      });
      
      setEditingCustomer(null);
      setShowEditModal(false);
      showToast('<h5>Customer Updated Successfully!</h5><p>Customer information has been updated.</p>', 'success');
    } catch (error) {
      showToast(`<h5>Error Updating Customer</h5><p>${error}</p>`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle checkbox selection
  const handleSelectCustomer = (customerId) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    if (!customers || customers.length === 0) return;
    
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(customer => customer.id));
    }
  };

  // Handle search change
  const handleSearchChange = (value) => {
    dispatch(setFilters({ search: value, page: 1 }));
  };

  // Handle status filter change (local state only)
  const handleStatusFilterChange = (status) => {
    const currentStatuses = localFilters.statuses || [];
    const newStatuses = currentStatuses.includes(status) 
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    setLocalFilters(prev => ({
      ...prev,
      statuses: newStatuses
    }));
  };

  // Handle items per page change (local state only)
  const handleItemsPerPageChange = (limit) => {
    setLocalFilters(prev => ({
      ...prev,
      limit: Number(limit)
    }));
  };

  // Apply filters and trigger API call
  const handleApplyFilters = () => {
    dispatch(setFilters({ 
      ...localFilters, 
      page: 1 
    }));
    
    setTimeout(() => {
      const dropdown = document.getElementById('customerFilterDropdown');
      if (dropdown) {
        dropdown.click();
      }
    }, 100);
  };

  // Reset filters
  const handleResetFilters = () => {
    const resetFilters = {
      statuses: [],
      limit: 10
    };
    
    setLocalFilters(resetFilters);
    dispatch(clearFilters());
  };

  // Handle page change
  const handlePageChange = (page) => {
    dispatch(setFilters({ page }));
  };

  // Handle delete customer with SweetAlert
  const handleDeleteCustomer = async (customerId) => {
    try {
      await dispatch(deleteCustomer(customerId)).unwrap();
    } catch (error) {
      throw error;
    }
  };

  // Handle bulk delete with SweetAlert
  const handleBulkDelete = async (customerIds) => {
    if (customerIds.length === 0) {
      showToast('Please select customers to delete', 'warning');
      return;
    }

    try {
      await dispatch(deleteMultipleCustomers(customerIds)).unwrap();
      setSelectedCustomers([]);
    } catch (error) {
      throw error;
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      showToast('Exporting customers...', 'info');
      await dispatch(exportCustomers(filters)).unwrap();
      showToast('<h5>Export Completed!</h5><p>Customers data has been exported to Excel successfully.</p>', 'success');
    } catch (error) {
      showToast(`Error exporting customers: ${error}`, 'error');
    }
  };

  // Handle import
  const handleImport = async (file) => {
    const importFormData = new FormData();
    importFormData.append('file', file);
    
    try {
      showToast('Importing customers from Excel...', 'info');
      const result = await dispatch(importCustomers(importFormData)).unwrap();
      
      let successMessage = '<h5>Import Completed!</h5>';
      if (result.summary.created > 0) {
        successMessage += `<p>✅ ${result.summary.created} new customers created</p>`;
      }
      if (result.summary.updated > 0) {
        successMessage += `<p>🔄 ${result.summary.updated} existing customers updated</p>`;
      }
      if (result.summary.failed > 0) {
        successMessage += `<p>❌ ${result.summary.failed} customers failed to import</p>`;
      }
      
      showToast(successMessage, 'success');
      setShowImportModal(false);
      
      // Refresh the customer list to show changes
      dispatch(fetchCustomers(filters));
    } catch (error) {
      showToast(`Error importing customers: ${error}`, 'error');
    }
  };

  // Handle permission checkbox change
  const handlePermissionChange = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  // Handle password change specifically
  const handlePasswordChange = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      company_name: customer.company_name,
      contact_email: customer.contact_email,
      contact_phone: customer.contact_phone || '',
      password: '', // Empty for password change
      address: customer.address || '',
      package_id: customer.package_id || '',
      subscription_status: customer.subscription_status,
      permissions: customer.permissions || []
    });
    setShowEditModal(true);
    showToast(`Opening edit form for ${customer.company_name} - You can change the password here`, 'info');
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const getStatusClass = (status) => {
      switch (status) {
        case 'active': return 'badge-success';
        case 'suspended': return 'badge-warning';
        case 'cancelled': return 'badge-danger';
        default: return 'badge-gray';
      }
    };

    return (
      <span className={`badge badge-dot ${getStatusClass(status)}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Password display component - Shows masked password with change option
  const PasswordDisplay = ({ customer }) => {
    return (
      <div className="d-flex align-items-center">
        <div className="d-flex flex-column">
          <span className="text-muted font-weight-bold" style={{ letterSpacing: '2px', fontSize: '14px' }}>
            ••••••••
          </span>
          <small className="text-soft">Protected</small>
        </div>
        <div className="ml-2">
          <button 
            className="btn btn-sm btn-icon btn-outline-gray btn-tooltip" 
            title={`Change password for ${customer.company_name}`}
            onClick={() => handlePasswordChange(customer)}
          >
            <em className="icon ni ni-lock-alt"></em>
          </button>
        </div>
      </div>
    );
  };

  // Show error if there's an error
  if (error) {
    return (
      <div className="nk-content-inner">
        <div className="nk-content-body">
          <div className="nk-block-head nk-block-head-sm">
            <div className="nk-block-between">
              <div className="nk-block-head-content">
                <h3 className="nk-block-title page-title">Customers</h3>
              </div>
            </div>
          </div>
          <div className="nk-block">
            <div className="card card-bordered card-stretch">
              <div className="card-inner-group">
                <div className="card-inner p-0">
                  <div className="text-center p-5">
                    <div className="text-danger">
                      <em className="icon ni ni-alert-circle" style={{fontSize: '3rem'}}></em>
                      <h5 className="mt-3">Error Loading Customers</h5>
                      <p>{error}</p>
                      <button 
                        className="btn btn-primary mt-3"
                        onClick={() => {
                          dispatch(clearError());
                          dispatch(fetchCustomers(filters));
                        }}
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="nk-content-inner">
        <div className="nk-content-body">
          <div className="nk-block-head nk-block-head-sm">
            <div className="nk-block-between">
              <div className="nk-block-head-content">
                <h3 className="nk-block-title page-title">Customers</h3>
              </div>
            </div>
          </div>
          <div className="nk-block">
            <div className="card card-bordered card-stretch">
              <div className="card-inner-group">
                <div className="card-inner p-0">
                  <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
                    <p className="mt-3">Loading customers...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nk-content-inner">
      <div className="nk-content-body">
        <div className="nk-block-head nk-block-head-sm">
          <div className="nk-block-between">
            <div className="nk-block-head-content">
              <h3 className="nk-block-title page-title">Customers</h3>
              <div className="nk-block-des text-soft">
                <p>You have total <span className='badge badge-info'>{totalCount}</span> customers.</p>
              </div>
            </div>
            <div className="nk-block-head-content">
              <div className="toggle-wrap nk-block-tools-toggle">
                <a href="#" className="btn btn-icon btn-trigger toggle-expand mr-n1" data-target="pageMenu">
                  <em className="icon ni ni-menu-alt-r"></em>
                </a>
                <div className="toggle-expand-content" data-content="pageMenu">
                  <ul className="nk-block-tools g-5">
                    <li className="nk-block-tools-opt">
                    
                       <button 
                        className="btn btn-danger"
                        onClick={handleExport}
                        disabled={loading}
                      >
                        <em className="icon ni ni-file"></em>
                        <span>Export Excel</span>
                      </button>
                      <button 
                        className="btn btn-info ml-3"
                        onClick={() => setShowImportModal(true)}
                        disabled={loading}
                      >
                        <em className="icon ni ni-file"></em>
                        <span>Import Excel</span>
                      </button>
                      <button 
                        className="btn btn-primary ml-3"
                        onClick={() => setShowModal(true)}
                      >
                        <em className="icon ni ni-plus"></em>
                        <span>Add Customer</span>
                      </button>
                      
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="nk-block">
          <div className="card card-bordered card-stretch">
            <div className="card-inner-group">
              <div className="card-inner position-relative card-tools-toggle">
                <div className="card-title-group">
                  <div className="card-tools">
                    <div className="form-inline flex-nowrap gx-3">
                      <div className="form-wrap flex-md-nowrap">
                        <div className="form-icon form-icon-right">
                          <em className="icon ni ni-search"></em>
                        </div>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Search customers..."
                          value={filters.search}
                          onChange={(e) => handleSearchChange(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="card-tools ms-auto">
                    <div className="dropdown">
                      <button
                        className="btn btn-outline-primary btn-sm dropdown-toggle position-relative"
                        type="button"
                        id="customerFilterDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <em className="icon ni ni-filter-alt me-1"></em>
                        Filters
                        {(filters.statuses?.length > 0 || (filters.limit && filters.limit !== 10)) && (
                          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                            {(filters.statuses?.length || 0) + (filters.limit && filters.limit !== 10 ? 1 : 0)}
                            <span className="visually-hidden">active filters</span>
                          </span>
                        )}
                      </button>

                      <div className="dropdown-menu dropdown-menu-end p-3 shadow-lg" style={{ minWidth: '320px' }}>
                        <h6 className="dropdown-header d-flex justify-content-between align-items-center">
                          Filter Customers
                          <small className="text-muted">
                            {localFilters.statuses?.length + (localFilters.limit !== 10 ? 1 : 0)} selected
                          </small>
                        </h6>

                        {/* Status Filter */}
                        <div className="form-group mb-2">
                          <label className="form-label">Status</label>
                          {['active', 'suspended', 'cancelled'].map((status) => (
                            <div className="form-check" key={status}>
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`filter-status-${status}`}
                                checked={localFilters.statuses?.includes(status)}
                                onChange={() => handleStatusFilterChange(status)}
                              />
                              <label className="form-check-label" htmlFor={`filter-status-${status}`}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </label>
                            </div>
                          ))}
                        </div>

                        {/* Items Per Page */}
                        <div className="form-group mb-3">
                          <label className="form-label">Items per page</label>
                          {[2, 5, 10, 20, 30, 50, 100].map((limit) => (
                            <div className="form-check" key={limit}>
                              <input
                                className="form-check-input"
                                type="radio"
                                name="customerItemsPerPage"
                                id={`customer-limit-${limit}`}
                                checked={localFilters.limit === limit}
                                onChange={() => handleItemsPerPageChange(limit)}
                              />
                              <label className="form-check-label" htmlFor={`customer-limit-${limit}`}>
                                {limit} items
                              </label>
                            </div>
                          ))}
                        </div>

                        <div className="d-flex justify-content-between pt-2 border-top">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={handleResetFilters}
                          >
                            Reset
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={handleApplyFilters}
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                Loading...
                              </>
                            ) : (
                              'Apply'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Customers Actions */}
              <BulkCustomerActions 
                selectedCustomers={selectedCustomers}
                onBulkDelete={handleBulkDelete}
                onClearSelection={() => setSelectedCustomers([])}
                isProcessing={isSubmitting}
              />

              <div className="card-inner p-0">
                <div className="nk-tb-list nk-tb-ulist">
                  <div className="nk-tb-item nk-tb-head">
                    <div className="nk-tb-col nk-tb-col-check">
                      <div className="custom-control custom-control-sm custom-checkbox notext">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="uid"
                          checked={customers && customers.length > 0 && selectedCustomers.length === customers.length}
                          onChange={handleSelectAll}
                        />
                        <label className="custom-control-label" htmlFor="uid"></label>
                      </div>
                    </div>
                    <div className="nk-tb-col">
                      <span 
                        className="sub-text cursor-pointer"
                        onClick={() => handleSort('company_name')}
                      >
                        Customer
                        {sortConfig.key === 'company_name' && (
                          <em className={`icon ni ni-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-1`}></em>
                        )}
                      </span>
                    </div>
                    <div className="nk-tb-col tb-col-mb">
                      <span 
                        className="sub-text cursor-pointer"
                        onClick={() => handleSort('contact_email')}
                      >
                        Email
                        {sortConfig.key === 'contact_email' && (
                          <em className={`icon ni ni-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-1`}></em>
                        )}
                      </span>
                    </div>
                    <div className="nk-tb-col tb-col-md">
                      <span 
                        className="sub-text cursor-pointer"
                        onClick={() => handleSort('contact_phone')}
                      >
                        Phone
                        {sortConfig.key === 'contact_phone' && (
                          <em className={`icon ni ni-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-1`}></em>
                        )}
                      </span>
                    </div>
                    <div className="nk-tb-col tb-col-md">
                      <span className="sub-text">Password</span>
                    </div>
                    <div className="nk-tb-col tb-col-lg">
                      <span 
                        className="sub-text cursor-pointer"
                        onClick={() => handleSort('subscription_status')}
                      >
                        Status
                        {sortConfig.key === 'subscription_status' && (
                          <em className={`icon ni ni-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-1`}></em>
                        )}
                      </span>
                    </div>
                    <div className="nk-tb-col tb-col-md">
                      <span 
                        className="sub-text cursor-pointer"
                        onClick={() => handleSort('createdAt')}
                      >
                        Created Date
                        {sortConfig.key === 'createdAt' && (
                          <em className={`icon ni ni-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-1`}></em>
                        )}
                      </span>
                    </div>
                    <div className="nk-tb-col nk-tb-col-tools text-right">
                    </div>
                  </div>

                  {customers && customers.length > 0 ? (
                    customers.map((customer) => (
                      <div key={customer.id} className="nk-tb-item">
                        <div className="nk-tb-col nk-tb-col-check">
                          <div className="custom-control custom-control-sm custom-checkbox notext">
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              id={`uid${customer.id}`}
                              checked={selectedCustomers.includes(customer.id)}
                              onChange={() => handleSelectCustomer(customer.id)}
                            />
                            <label className="custom-control-label" htmlFor={`uid${customer.id}`}></label>
                          </div>
                        </div>
                        <div className="nk-tb-col">
                          <div className="user-card">
                            <div className="user-avatar bg-primary">
                              <span>{customer.company_name.charAt(0)}</span>
                            </div>
                            <div className="user-info">
                              <span className="tb-lead">{customer.company_name} <span className="dot dot-success d-lg-none ml-1"></span></span>
                              <span>{customer.address || 'No address'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="nk-tb-col tb-col-mb">
                          <span className="tb-amount">{customer.contact_email}</span>
                          <span className="tb-amount-sm">{customer.permissions?.join(', ') || 'No permissions'}</span>
                        </div>
                        <div className="nk-tb-col tb-col-md">
                          <span>{customer.contact_phone || 'N/A'}</span>
                        </div>
                        <div className="nk-tb-col tb-col-md">
                          <PasswordDisplay customer={customer} />
                        </div>
                        <div className="nk-tb-col tb-col-lg">
                          <StatusBadge status={customer.subscription_status} />
                        </div>
                        <div className="nk-tb-col tb-col-md">
                          <span>{customer.createdAt}</span>
                        </div>
                        <CustomerActionMenu 
                          customer={customer}
                          onEdit={handleEditCustomer}
                          onDelete={handleDeleteCustomer}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="nk-tb-item">
                      <div className="nk-tb-col text-center py-5" style={{gridColumn: '1 / -1'}}>
                        <div className="text-muted">
                          <em className="icon ni ni-users" style={{fontSize: '3rem'}}></em>
                          <h5 className="mt-3">No Customers Found</h5>
                          <p>There are no customers to display. Try adjusting your filters or add a new customer.</p>
                          <button 
                            className="btn btn-primary mt-3"
                            onClick={() => setShowModal(true)}
                          >
                            <em className="icon ni ni-plus"></em>
                            <span>Add First Customer</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-inner">
                <div className="nk-block-between-md g-3">
                  <div className="g">
                    <ul className="pagination justify-content-center justify-content-md-start">
                      <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                        <a 
                          className="page-link" 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (pagination.hasPrevPage) handlePageChange(pagination.currentPage - 1);
                          }}
                        >
                          Prev
                        </a>
                      </li>
                      {[...Array(pagination.totalPages)].map((_, i) => (
                        <li key={i} className={`page-item ${pagination.currentPage === i + 1 ? 'active' : ''}`}>
                          <a 
                            className="page-link" 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(i + 1);
                            }}
                          >
                            {i + 1}
                          </a>
                        </li>
                      ))}
                      <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                        <a 
                          className="page-link" 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (pagination.hasNextPage) handlePageChange(pagination.currentPage + 1);
                          }}
                        >
                          Next
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="g">
                    <div className="pagination-goto d-flex justify-content-center justify-content-md-end gx-3">
                      <div>Page</div>
                      <div>
                        <select 
                          className="form-control form-control-sm" 
                          value={pagination.currentPage}
                          onChange={(e) => handlePageChange(Number(e.target.value))}
                        >
                          {[...Array(pagination.totalPages)].map((_, i) => (
                            <option key={i} value={i + 1}>{i + 1}</option>
                          ))}
                        </select>
                      </div>
                      <div>OF {pagination.totalPages}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Customer Modal - DashLite Theme Structure */}
        {showModal && (
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-xl" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Customer</h5>
                  <a href="#" className="close" onClick={() => setShowModal(false)} aria-label="Close">
                    <em className="icon ni ni-cross"></em>
                  </a>
                </div>
                <div className="modal-body modal-body-xl">
                  <form onSubmit={handleSubmit} className="form-validate is-alter">
                    <div className="row g-3">
                      {/* Company Information Section */}
                      <div className="col-12">
                        <h6 className="overline-title text-primary-alt">Company Information</h6>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label" htmlFor="company_name">Company Name *</label>
                          <div className="form-control-wrap">
                            <input
                              type="text"
                              className="form-control"
                              id="company_name"
                              value={formData.company_name}
                              onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                              required
                              placeholder="Enter company name"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label" htmlFor="contact_email">Contact Email *</label>
                          <div className="form-control-wrap">
                            <input
                              type="email"
                              className="form-control"
                              id="contact_email"
                              value={formData.contact_email}
                              onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                              required
                              placeholder="company@example.com"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label" htmlFor="contact_phone">Contact Phone</label>
                          <div className="form-control-wrap">
                            <input
                              type="tel"
                              className="form-control"
                              id="contact_phone"
                              value={formData.contact_phone}
                              onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                              placeholder="Enter phone number"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label" htmlFor="password">Password *</label>
                          <div className="form-control-wrap">
                            <input
                              type="password"
                              className="form-control"
                              id="password"
                              value={formData.password}
                              onChange={(e) => setFormData({...formData, password: e.target.value})}
                              required
                              placeholder="Enter password (min 6 characters)"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label" htmlFor="subscription_status">Subscription Status *</label>
                          <div className="form-control-wrap">
                            <select
                              id="subscription_status"
                              className="form-control"
                              value={formData.subscription_status}
                              onChange={(e) => setFormData({ ...formData, subscription_status: e.target.value })}
                              required
                            >
                              {subscriptionStatuses.map(status => (
                                <option key={status.value} value={status.value}>
                                  {status.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-group">
                          <label className="form-label" htmlFor="address">Address</label>
                          <div className="form-control-wrap">
                            <textarea
                              className="form-control"
                              id="address"
                              value={formData.address}
                              onChange={(e) => setFormData({...formData, address: e.target.value})}
                              placeholder="Enter customer address"
                              rows="3"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Permissions Section */}
                      <div className="col-12">
                        <h6 className="overline-title text-primary-alt">Permissions</h6>
                      </div>
                      <div className="col-12">
                        <div className="form-group">
                          <div className="custom-control-group">
                            {availablePermissions.map(permission => (
                              <div key={permission} className="custom-control custom-checkbox">
                                <input
                                  type="checkbox"
                                  className="custom-control-input"
                                  id={`permission-${permission}`}
                                  checked={formData.permissions.includes(permission)}
                                  onChange={() => handlePermissionChange(permission)}
                                />
                                <label className="custom-control-label" htmlFor={`permission-${permission}`}>
                                  {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </label>
                              </div>
                            ))}
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
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm mr-2"></span>
                            Creating...
                          </>
                        ) : (
                          'Create Customer'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
        {showModal && <div className="modal-backdrop fade show"></div>}

        {/* Edit Customer Modal - DashLite Theme Structure */}
        {showEditModal && (
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-xl" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Customer</h5>
                  <a href="#" className="close" onClick={() => setShowEditModal(false)} aria-label="Close">
                    <em className="icon ni ni-cross"></em>
                  </a>
                </div>
                <div className="modal-body modal-body-xl">
                  <form onSubmit={handleUpdateCustomer} className="form-validate is-alter">
                    <div className="row g-3">
                      {/* Company Information Section */}
                      <div className="col-12">
                        <h6 className="overline-title text-primary-alt">Company Information</h6>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label" htmlFor="edit_company_name">Company Name *</label>
                          <div className="form-control-wrap">
                            <input
                              type="text"
                              className="form-control"
                              id="edit_company_name"
                              value={formData.company_name}
                              onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                              required
                              placeholder="Enter company name"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label" htmlFor="edit_contact_email">Contact Email *</label>
                          <div className="form-control-wrap">
                            <input
                              type="email"
                              className="form-control"
                              id="edit_contact_email"
                              value={formData.contact_email}
                              onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                              required
                              placeholder="company@example.com"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label" htmlFor="edit_contact_phone">Contact Phone</label>
                          <div className="form-control-wrap">
                            <input
                              type="tel"
                              className="form-control"
                              id="edit_contact_phone"
                              value={formData.contact_phone}
                              onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                              placeholder="Enter phone number"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label" htmlFor="edit_password">Password</label>
                          <div className="form-control-wrap">
                            <input
                              type="password"
                              className="form-control"
                              id="edit_password"
                              value={formData.password}
                              onChange={(e) => setFormData({...formData, password: e.target.value})}
                              placeholder="Leave blank to keep current password"
                            />
                          </div>
                          <div className="form-note">
                            <small>Leave blank to keep the current password. Minimum 6 characters if changing.</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label" htmlFor="edit_subscription_status">Subscription Status *</label>
                          <div className="form-control-wrap">
                            <select
                              id="edit_subscription_status"
                              className="form-control"
                              value={formData.subscription_status}
                              onChange={(e) => setFormData({ ...formData, subscription_status: e.target.value })}
                              required
                            >
                              {subscriptionStatuses.map(status => (
                                <option key={status.value} value={status.value}>
                                  {status.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-group">
                          <label className="form-label" htmlFor="edit_address">Address</label>
                          <div className="form-control-wrap">
                            <textarea
                              className="form-control"
                              id="edit_address"
                              value={formData.address}
                              onChange={(e) => setFormData({...formData, address: e.target.value})}
                              placeholder="Enter customer address"
                              rows="3"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Permissions Section */}
                      <div className="col-12">
                        <h6 className="overline-title text-primary-alt">Permissions</h6>
                      </div>
                      <div className="col-12">
                        <div className="form-group">
                          <div className="custom-control-group">
                            {availablePermissions.map(permission => (
                              <div key={permission} className="custom-control custom-checkbox">
                                <input
                                  type="checkbox"
                                  className="custom-control-input"
                                  id={`edit-permission-${permission}`}
                                  checked={formData.permissions.includes(permission)}
                                  onChange={() => handlePermissionChange(permission)}
                                />
                                <label className="custom-control-label" htmlFor={`edit-permission-${permission}`}>
                                  {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </label>
                              </div>
                            ))}
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
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm mr-2"></span>
                            Updating...
                          </>
                        ) : (
                          'Update Customer'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
        {showEditModal && <div className="modal-backdrop fade show"></div>}

        {/* Import Modal */}
        {showImportModal && (
          <div className="modal fade show" tabIndex="-1" style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
              <div className="modal-content">
                <a href="#" className="close" onClick={() => setShowImportModal(false)}><em className="icon ni ni-cross-sm"></em></a>
                <div className="modal-body modal-body-lg text-center">
                  <div className="nk-modal">
                    <em className="nk-modal-icon icon icon-circle icon-circle-xxl ni ni-upload bg-info"></em>
                    <h4 className="nk-modal-title">Import Customers</h4>
                    <div className="nk-modal-text">
                      <div className="caption-text">Upload an Excel file to import customer data.</div>
                      <div className="row gy-4">
                        <div className="col-12">
                          <div className="form-group">
                            <label className="form-label">Select Excel File</label>
                            <div className="form-control-wrap">
                              <input
                                type="file"
                                className="form-control"
                                accept=".xlsx,.xls"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    handleImport(file);
                                  }
                                }}
                              />
                            </div>
                            <div className="form-note">
                              Upload an Excel file (.xlsx or .xls) with customer data.
                            </div>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="alert alert-info">
                            <h6>Excel Format Requirements:</h6>
                            <ul className="mb-0">
                              <li><strong>Company Name</strong> - Required</li>
                              <li><strong>Contact Email</strong> - Required (unique)</li>
                              <li><strong>Contact Phone</strong> - Optional</li>
                              <li><strong>Address</strong> - Optional</li>
                              <li><strong>Subscription Status</strong> - Optional (active, suspended, cancelled)</li>
                              <li><strong>Permissions</strong> - Optional (comma-separated)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}