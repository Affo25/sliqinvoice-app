'use client';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
  clearError
} from '../../../redux/slices/customersSlice';
import { showToast } from '../../../lib/toast';
import { useSweetAlert } from '../../../components/SweetAlerts';
import { CustomerActionMenu, BulkCustomerActions, CustomerFormActions } from '../../../components/CustomerActions';
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

  // SweetAlert hooks
  const { confirmUserDelete, confirmBulkUserDelete, handleDeleteSuccess, handleDeleteError, handleBulkDeleteSuccess, handleBulkDeleteError } = useSweetAlert();

  // Form data for new customer (matching customer model schema)
  const [formData, setFormData] = useState({
    company_name: '',
    contact_email: '',
    contact_phone: '',
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
    dispatch(fetchCustomers(filters));
  }, [dispatch]);

  // Fetch customers when filters change
  useEffect(() => {
    dispatch(fetchCustomers(filters));
  }, [dispatch, filters]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

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
    
    try {
      await dispatch(createCustomer(formData)).unwrap();
      
      // Reset form
      setFormData({
        company_name: '',
        contact_email: '',
        contact_phone: '',
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
    
    try {
      await dispatch(updateCustomer({ id: editingCustomer._id, customerData: formData })).unwrap();
      
      // Reset form and close modal
      setFormData({
        company_name: '',
        contact_email: '',
        contact_phone: '',
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

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    const currentStatuses = filters.statuses || [];
    const newStatuses = currentStatuses.includes(status) 
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    dispatch(setFilters({ statuses: newStatuses, page: 1 }));
  };

  // Handle items per page change
  const handleItemsPerPageChange = (limit) => {
    dispatch(setFilters({ limit: Number(limit), page: 1 }));
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
                      {selectedCustomers.length > 0 && (
                        <button 
                          className="btn btn-outline-danger mr-2"
                          onClick={() => handleBulkDelete(selectedCustomers)}
                          disabled={loading}
                        >
                          <em className="icon ni ni-trash"></em>
                          <span>Delete Selected ({selectedCustomers.length})</span>
                        </button>
                      )}
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
                  <div className="card-tools mr-n1">
                    <ul className="btn-toolbar gx-1">
                      <li>
                        <a href="#" className="btn btn-icon search-toggle toggle-search" data-target="search">
                          <em className="icon ni ni-search"></em>
                        </a>
                      </li>
                      <li className="btn-toolbar-sep"></li>
                      <li>
                        <div className="toggle-wrap">
                          <a href="#" className="btn btn-icon btn-trigger toggle" data-target="cardTools">
                            <em className="icon ni ni-menu-right"></em>
                          </a>
                          <div className="toggle-content" data-content="cardTools">
                            <ul className="btn-toolbar gx-1">
                              <li className="toggle-close">
                                <a href="#" className="btn btn-icon btn-trigger toggle" data-target="cardTools">
                                  <em className="icon ni ni-arrow-left"></em>
                                </a>
                              </li>
                              <li>
                                <div className="dropdown">
                                  <a href="#" className="btn btn-trigger btn-icon dropdown-toggle" data-toggle="dropdown">
                                    <div className="dot dot-primary"></div>
                                    <em className="icon ni ni-filter-alt"></em>
                                  </a>
                                  <div className="filter-wg dropdown-menu dropdown-menu-xl dropdown-menu-right">
                                    <div className="dropdown-head">
                                      <span className="sub-title dropdown-title">Filter Customers</span>
                                      <div className="dropdown-text">
                                        {filters.statuses?.length > 0 && (
                                          <span className="badge badge-success ml-1">{filters.statuses.length} status(es) selected</span>
                                        )}
                                        {filters.limit && filters.limit !== 10 && (
                                          <span className="badge badge-info ml-1">{filters.limit} per page</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="dropdown-body dropdown-body-rg" onClick={(e) => e.stopPropagation()}>
                                      <div className="row gx-6 gy-4">
                                        <div className="col-6">
                                          <div className="form-group">
                                            <label className="overline-title overline-title-alt">Status</label>
                                            <div className="custom-control-group">
                                              <div className="custom-control custom-checkbox">
                                                <input 
                                                  type="checkbox" 
                                                  className="custom-control-input" 
                                                  id="filter-status-active"
                                                  checked={filters.statuses?.includes('active')}
                                                  onChange={() => handleStatusFilterChange('active')}
                                                  onClick={(e) => e.stopPropagation()}
                                                />
                                                <label className="custom-control-label" htmlFor="filter-status-active">
                                                  <span className="badge badge-success">Active</span>
                                                </label>
                                              </div>
                                              <div className="custom-control custom-checkbox">
                                                <input 
                                                  type="checkbox" 
                                                  className="custom-control-input" 
                                                  id="filter-status-suspended"
                                                  checked={filters.statuses?.includes('suspended')}
                                                  onChange={() => handleStatusFilterChange('suspended')}
                                                  onClick={(e) => e.stopPropagation()}
                                                />
                                                <label className="custom-control-label" htmlFor="filter-status-suspended">
                                                  <span className="badge badge-warning">Suspended</span>
                                                </label>
                                              </div>
                                              <div className="custom-control custom-checkbox">
                                                <input 
                                                  type="checkbox" 
                                                  className="custom-control-input" 
                                                  id="filter-status-cancelled"
                                                  checked={filters.statuses?.includes('cancelled')}
                                                  onChange={() => handleStatusFilterChange('cancelled')}
                                                  onClick={(e) => e.stopPropagation()}
                                                />
                                                <label className="custom-control-label" htmlFor="filter-status-cancelled">
                                                  <span className="badge badge-danger">Cancelled</span>
                                                </label>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="col-6">
                                          <div className="form-group">
                                            <label className="overline-title overline-title-alt">Items Per Page</label>
                                            <div className="custom-control-group">
                                              <div className="custom-control custom-radio">
                                                <input 
                                                  type="radio" 
                                                  className="custom-control-input" 
                                                  id="filter-limit-2"
                                                  name="itemsPerPage"
                                                  checked={filters.limit === 2}
                                                  onChange={() => handleItemsPerPageChange(2)}
                                                  onClick={(e) => e.stopPropagation()}
                                                />
                                                <label className="custom-control-label" htmlFor="filter-limit-2">
                                                  <span className="badge badge-outline-primary">2 per page</span>
                                                </label>
                                              </div>
                                              <div className="custom-control custom-radio">
                                                <input 
                                                  type="radio" 
                                                  className="custom-control-input" 
                                                  id="filter-limit-10"
                                                  name="itemsPerPage"
                                                  checked={filters.limit === 10}
                                                  onChange={() => handleItemsPerPageChange(10)}
                                                  onClick={(e) => e.stopPropagation()}
                                                />
                                                <label className="custom-control-label" htmlFor="filter-limit-10">
                                                  <span className="badge badge-outline-primary">10 per page</span>
                                                </label>
                                              </div>
                                              <div className="custom-control custom-radio">
                                                <input 
                                                  type="radio" 
                                                  className="custom-control-input" 
                                                  id="filter-limit-20"
                                                  name="itemsPerPage"
                                                  checked={filters.limit === 20}
                                                  onChange={() => handleItemsPerPageChange(20)}
                                                  onClick={(e) => e.stopPropagation()}
                                                />
                                                <label className="custom-control-label" htmlFor="filter-limit-20">
                                                  <span className="badge badge-outline-primary">20 per page</span>
                                                </label>
                                              </div>
                                              <div className="custom-control custom-radio">
                                                <input 
                                                  type="radio" 
                                                  className="custom-control-input" 
                                                  id="filter-limit-100"
                                                  name="itemsPerPage"
                                                  checked={filters.limit === 100}
                                                  onChange={() => handleItemsPerPageChange(100)}
                                                  onClick={(e) => e.stopPropagation()}
                                                />
                                                <label className="custom-control-label" htmlFor="filter-limit-100">
                                                  <span className="badge badge-outline-primary">100 per page</span>
                                                </label>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="dropdown-foot between" onClick={(e) => e.stopPropagation()}>
                                      <button 
                                        type="button" 
                                        className="btn btn-sm btn-outline-light"
                                        onClick={() => dispatch(clearFilters())}
                                      >
                                        Reset Filters
                                      </button>
                                      <button 
                                        type="button" 
                                        className="btn btn-sm btn-primary"
                                        onClick={() => {
                                          // Close the dropdown after applying filters
                                          document.querySelector('[data-target="cardTools"]').click();
                                        }}
                                      >
                                        Apply Filters
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </li>
                    </ul>
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
                          checked={selectedCustomers.length === customers.length && customers.length > 0}
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

                  {customers.map((customer) => (
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
                  ))}
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

        {/* Add Customer Modal */}
        {showModal && (
          <div className="modal fade show" tabIndex="-1" style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
              <div className="modal-content">
                <a href="#" className="close" onClick={() => setShowModal(false)}><em className="icon ni ni-cross-sm"></em></a>
                <div className="modal-body modal-body-lg text-center">
                  <div className="nk-modal">
                    <em className="nk-modal-icon icon icon-circle icon-circle-xxl ni ni-building bg-primary"></em>
                    <h4 className="nk-modal-title">Add Customer</h4>
                    <div className="nk-modal-text">
                      <div className="caption-text">Create a new customer account with company details.</div>
                      <form className="form-validate is-alter" onSubmit={handleSubmit}>
                        <div className="row gy-4">
                          <div className="col-md-6">
                            <div className="form-group">
                              <label className="form-label" htmlFor="company-name">Company Name</label>
                              <input 
                                type="text" 
                                className="form-control form-control-lg" 
                                id="company-name"
                                value={formData.company_name}
                                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                                placeholder="Enter company name" 
                                required 
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label className="form-label" htmlFor="contact-email">Contact Email</label>
                              <input 
                                type="email" 
                                className="form-control form-control-lg" 
                                id="contact-email"
                                value={formData.contact_email}
                                onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                                placeholder="Enter email address" 
                                required 
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label className="form-label" htmlFor="contact-phone">Contact Phone</label>
                              <input 
                                type="tel" 
                                className="form-control form-control-lg" 
                                id="contact-phone"
                                value={formData.contact_phone}
                                onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                                placeholder="Enter phone number" 
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label className="form-label" htmlFor="subscription-status">Subscription Status</label>
                              <select 
                                className="form-control form-control-lg" 
                                id="subscription-status"
                                value={formData.subscription_status}
                                onChange={(e) => setFormData({...formData, subscription_status: e.target.value})}
                              >
                                {subscriptionStatuses.map(status => (
                                  <option key={status.value} value={status.value}>
                                    {status.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="form-group">
                              <label className="form-label" htmlFor="address">Address</label>
                              <textarea 
                                className="form-control form-control-lg" 
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                placeholder="Enter customer address"
                                rows="3"
                              />
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="form-group">
                              <label className="form-label">Permissions</label>
                              <div className="custom-control-group g-3 align-center">
                                {availablePermissions.map(permission => (
                                  <div key={permission} className="custom-control custom-control-sm custom-checkbox">
                                    <input
                                      type="checkbox"
                                      className="custom-control-input"
                                      id={permission}
                                      checked={formData.permissions.includes(permission)}
                                      onChange={() => handlePermissionChange(permission)}
                                    />
                                    <label className="custom-control-label" htmlFor={permission}>
                                      {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <CustomerFormActions 
                            isSubmitting={isSubmitting}
                            onCancel={() => setShowModal(false)}
                            submitText="Add Customer"
                            submitLoadingText="Creating Customer..."
                          />
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Customer Modal */}
        {showEditModal && (
          <div className="modal fade show" tabIndex="-1" style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
              <div className="modal-content">
                <a href="#" className="close" onClick={() => setShowEditModal(false)}><em className="icon ni ni-cross-sm"></em></a>
                <div className="modal-body modal-body-lg text-center">
                  <div className="nk-modal">
                    <em className="nk-modal-icon icon icon-circle icon-circle-xxl ni ni-building bg-warning"></em>
                    <h4 className="nk-modal-title">Edit Customer</h4>
                    <div className="nk-modal-text">
                      <div className="caption-text">Update customer information and settings.</div>
                      <form className="form-validate is-alter" onSubmit={handleUpdateCustomer}>
                        <div className="row gy-4">
                          <div className="col-md-6">
                            <div className="form-group">
                              <label className="form-label" htmlFor="edit-company-name">Company Name</label>
                              <input 
                                type="text" 
                                className="form-control form-control-lg" 
                                id="edit-company-name"
                                value={formData.company_name}
                                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                                placeholder="Enter company name" 
                                required 
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label className="form-label" htmlFor="edit-contact-email">Contact Email</label>
                              <input 
                                type="email" 
                                className="form-control form-control-lg" 
                                id="edit-contact-email"
                                value={formData.contact_email}
                                onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                                placeholder="Enter email address" 
                                required 
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label className="form-label" htmlFor="edit-contact-phone">Contact Phone</label>
                              <input 
                                type="tel" 
                                className="form-control form-control-lg" 
                                id="edit-contact-phone"
                                value={formData.contact_phone}
                                onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                                placeholder="Enter phone number" 
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label className="form-label" htmlFor="edit-subscription-status">Subscription Status</label>
                              <select 
                                className="form-control form-control-lg" 
                                id="edit-subscription-status"
                                value={formData.subscription_status}
                                onChange={(e) => setFormData({...formData, subscription_status: e.target.value})}
                              >
                                {subscriptionStatuses.map(status => (
                                  <option key={status.value} value={status.value}>
                                    {status.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="form-group">
                              <label className="form-label" htmlFor="edit-address">Address</label>
                              <textarea 
                                className="form-control form-control-lg" 
                                id="edit-address"
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                placeholder="Enter customer address"
                                rows="3"
                              />
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="form-group">
                              <label className="form-label">Permissions</label>
                              <div className="custom-control-group g-3 align-center">
                                {availablePermissions.map(permission => (
                                  <div key={permission} className="custom-control custom-control-sm custom-checkbox">
                                    <input
                                      type="checkbox"
                                      className="custom-control-input"
                                      id={`edit-${permission}`}
                                      checked={formData.permissions.includes(permission)}
                                      onChange={() => handlePermissionChange(permission)}
                                    />
                                    <label className="custom-control-label" htmlFor={`edit-${permission}`}>
                                      {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <CustomerFormActions 
                            isSubmitting={isSubmitting}
                            onCancel={() => setShowEditModal(false)}
                            submitText="Update Customer"
                            submitLoadingText="Updating Customer..."
                            isEdit={true}
                          />
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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