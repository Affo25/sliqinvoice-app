'use client';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  deleteMultipleUsers,
  exportUsers,
  importUsers,
  setFilters,
  clearFilters,
  clearError
} from '../../../redux/slices/usersSlice';
import { showToast } from '../../../lib/toast';
import { useSweetAlert } from '../../../components/SweetAlerts';
import { UserActionMenu, BulkUserActions, UserFormActions } from '../../../components/UserActions';
import { initializeDropdowns, cleanupDropdowns } from '../../../lib/dropdownUtils';
import '../../../app/globals.css';
import { Pages } from "../../data/routes";

export default function UsersPage() {
  // Redux state
  const dispatch = useDispatch();
  const {
    users,
    loading,
    error,
    totalCount,
    filters,
    pagination
  } = useSelector((state) => state.users);

  // Local state
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Local filter state (for temporary selections before Apply)
  const [localFilters, setLocalFilters] = useState({
    statuses: filters.statuses || [],
    roles: filters.roles || [],
    limit: filters.limit || 10
  });

  // SweetAlert hooks
  const { confirmUserDelete, confirmBulkUserDelete, handleDeleteSuccess, handleDeleteError, handleBulkDeleteSuccess, handleBulkDeleteError } = useSweetAlert();

  // Form data for new user (matching user_models.js schema exactly)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '', // For validation only, not sent to API
    client_id: null,     // MongoDB ObjectId or null, not empty string
    first_name: '',
    last_name: '',
    role: 'customers',
    permissions: [],
    is_active: true
  });





  // Load users on component mount
  useEffect(() => {
    dispatch(fetchUsers(filters));
  }, [dispatch]);

  // Fetch users when filters change
  useEffect(() => {
    dispatch(fetchUsers(filters));
  }, [dispatch, filters]);

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
      roles: filters.roles || [],
      limit: filters.limit || 10
    });
  }, [filters.statuses, filters.roles, filters.limit]);

  // Sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle form submission (both create and edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation for both create and edit
    if (editingUser) {
      // Edit mode validation
      if (formData.password && formData.password !== formData.confirmPassword) {
        showToast('Passwords do not match!', 'error');
        setIsSubmitting(false);
        return;
      }

      if (formData.password && formData.password.length < 6) {
        showToast('Password must be at least 6 characters long!', 'error');
        setIsSubmitting(false);
        return;
      }
    } else {
      // Create mode validation
      if (formData.password.length < 6) {
        showToast('Password must be at least 6 characters long!', 'error');
        setIsSubmitting(false);
        return;
      }
    }

    if (!formData.email || !formData.first_name || !formData.last_name) {
      showToast('Please fill in all required fields!', 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingUser) {
        // Edit mode
        const updateData = {
          email: formData.email,
          client_id: formData.client_id && formData.client_id !== '' ? formData.client_id : null,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          permissions: formData.permissions,
          is_active: formData.is_active
        };

        // Only include password if it's provided
        if (formData.password) {
          updateData.password = formData.password;
        }

        await dispatch(updateUser({ id: editingUser._id, userData: updateData })).unwrap();
        showToast('<h5>User Updated Successfully!</h5><p>User information has been updated.</p>', 'success');
      } else {
        // Create mode
        const userData = {
          email: formData.email,
          password: formData.password,
          client_id: formData.client_id && formData.client_id !== '' ? formData.client_id : null,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          permissions: formData.permissions,
          is_active: formData.is_active
        };

        await dispatch(createUser(userData)).unwrap();
        showToast('<h5>User Created Successfully!</h5><p>New user has been added to the system.</p>', 'success');
      }

      // Reset form and close modal
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        client_id: null,
        first_name: '',
        last_name: '',
        role: 'customers',
        permissions: [],
        is_active: true
      });

      setEditingUser(null);
      setShowModal(false);
    } catch (error) {
      const errorMessage = editingUser ? 'Error Updating User' : 'Error Creating User';
      showToast(`<h5>${errorMessage}</h5><p>${error}</p>`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      confirmPassword: '',
      client_id: user.client_id,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      permissions: user.permissions || [],
      is_active: user.is_active
    });
    setShowModal(true);
  };



  // Handle checkbox selection
  const handleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
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

  // Handle role filter change (local state only)
  const handleRoleFilterChange = (role) => {
    const currentRoles = localFilters.roles || [];
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];

    setLocalFilters(prev => ({
      ...prev,
      roles: newRoles
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
    // Dispatch filters to Redux (this triggers the API call via useEffect)
    dispatch(setFilters({
      ...localFilters,
      page: 1
    }));

    // Close the dropdown after a short delay to allow for visual feedback
    setTimeout(() => {
      const dropdown = document.getElementById('filterDropdown');
      if (dropdown) {
        dropdown.click();
      }
    }, 100);
  };

  // Reset filters
  const handleResetFilters = () => {
    const resetFilters = {
      statuses: [],
      roles: [],
      limit: 10
    };

    setLocalFilters(resetFilters);
    dispatch(clearFilters());
  };

  // Handle page change
  const handlePageChange = (page) => {
    dispatch(setFilters({ page }));
  };

  // Handle delete user with SweetAlert
  const handleDeleteUser = async (userId) => {
    try {
      await dispatch(deleteUser(userId)).unwrap();
    } catch (error) {
      throw error; // Let the component handle the error display
    }
  };

  // Handle bulk delete with SweetAlert
  const handleBulkDelete = async (userIds) => {
    if (userIds.length === 0) {
      showToast('Please select users to delete', 'warning');
      return;
    }

    try {
      await dispatch(deleteMultipleUsers(userIds)).unwrap();
      setSelectedUsers([]);
    } catch (error) {
      throw error; // Let the component handle the error display
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      showToast('Exporting users...', 'info');
      await dispatch(exportUsers(filters)).unwrap();
      showToast('<h5>Export Completed!</h5><p>Users data has been exported to Excel successfully.</p>', 'success');
    } catch (error) {
      showToast(`Error exporting users: ${error}`, 'error');
    }
  };

  // Handle import
  const handleImport = async (file) => {
    const importFormData = new FormData();
    importFormData.append('file', file);

    try {
      showToast('Importing users from Excel...', 'info');
      const result = await dispatch(importUsers(importFormData)).unwrap();

      let successMessage = '<h5>Import Completed!</h5>';
      if (result.summary.created > 0) {
        successMessage += `<p>✅ ${result.summary.created} new users created</p>`;
      }
      if (result.summary.updated > 0) {
        successMessage += `<p>🔄 ${result.summary.updated} existing users updated</p>`;
      }
      if (result.summary.failed > 0) {
        successMessage += `<p>❌ ${result.summary.failed} users failed to import</p>`;
      }

      showToast(successMessage, 'success');
      setShowImportModal(false);

      // Refresh the user list to show changes
      dispatch(fetchUsers(filters));
    } catch (error) {
      showToast(`Error importing users: ${error}`, 'error');
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
        case 'inactive': return 'badge-danger';
        case 'pending': return 'badge-warning';
        default: return 'badge-gray';
      }
    };

    return (
      <span className={`badge badge-dot ${getStatusClass(status)}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Role badge component
  const RoleBadge = ({ role }) => {
    const getRoleClass = (role) => {
      switch (role) {
        case 'superAdmin': return 'badge-primary';
        case 'moderator': return 'badge-info';
        case 'customers': return 'badge-secondary';
        case 'customerUsers': return 'badge-warning';
        default: return 'badge-gray';
      }
    };

    const getRoleDisplayName = (role) => {
      switch (role) {
        case 'superAdmin': return 'Super Admin';
        case 'moderator': return 'Moderator';
        case 'customers': return 'Customer';
        case 'customerUsers': return 'Customer User';
        default: return role;
      }
    };

    return (
      <span className={`badge ${getRoleClass(role)}`}>
        {getRoleDisplayName(role)}
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
                <h3 className="nk-block-title page-title">Users</h3>
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
                    <p className="mt-3">Loading users...</p>
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
              <h3 className="nk-block-title page-title">Users</h3>
              <div className="nk-block-des text-soft">
                <p>You have total <span className='badge badge-info'>{totalCount}</span> users.</p>
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
                        onClick={() => {
                          setEditingUser(null);
                          setFormData({
                            email: '',
                            password: '',
                            confirmPassword: '',
                            client_id: null,
                            first_name: '',
                            last_name: '',
                            role: 'customers',
                            permissions: [],
                            is_active: true
                          });
                          setShowModal(true);
                        }}
                      >
                        <em className="icon ni ni-plus"></em>
                        <span>Add User</span>
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
                          placeholder="Search users..."
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
                        id="filterDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <em className="icon ni ni-filter-alt me-1"></em>
                        Filters
                        {(filters.statuses?.length > 0 || filters.roles?.length > 0 || (filters.limit && filters.limit !== 10)) && (
                          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                            {(filters.statuses?.length || 0) + (filters.roles?.length || 0) + (filters.limit && filters.limit !== 10 ? 1 : 0)}
                            <span className="visually-hidden">active filters</span>
                          </span>
                        )}
                      </button>

                      <div className="dropdown-menu dropdown-menu-end p-3 shadow-lg" style={{ minWidth: '320px' }}>
                        <h6 className="dropdown-header d-flex justify-content-between align-items-center">
                          Filter Users
                          <small className="text-muted">
                            {localFilters.statuses?.length + localFilters.roles?.length + (localFilters.limit !== 10 ? 1 : 0)} selected
                          </small>
                        </h6>

                        {/* Status Filter */}
                        <div className="form-group mb-2">
                          <label className="form-label">Status</label>
                          {['active', 'inactive', 'pending'].map((status) => (
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

                        {/* Roles Filter */}
                        <div className="form-group mb-2">
                          <label className="form-label">Roles</label>
                          {['superAdmin', 'moderator', 'customers', 'customerUsers'].map((role) => (
                            <div className="form-check" key={role}>
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`filter-role-${role}`}
                                checked={localFilters.roles?.includes(role)}
                                onChange={() => handleRoleFilterChange(role)}
                              />
                              <label className="form-check-label" htmlFor={`filter-role-${role}`}>
                                {role === 'superAdmin'
                                  ? 'Super Admin'
                                  : role === 'customerUsers'
                                    ? 'Customer User'
                                    : role.charAt(0).toUpperCase() + role.slice(1)}
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
                                name="itemsPerPage"
                                id={`limit-${limit}`}
                                checked={localFilters.limit === limit}
                                onChange={() => handleItemsPerPageChange(limit)}
                              />
                              <label className="form-check-label" htmlFor={`limit-${limit}`}>
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

              {/* Selected Users Actions */}
              <BulkUserActions
                selectedUsers={selectedUsers}
                onBulkDelete={handleBulkDelete}
                onClearSelection={() => setSelectedUsers([])}
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
                          checked={selectedUsers.length === users.length && users.length > 0}
                          onChange={handleSelectAll}
                        />
                        <label className="custom-control-label" htmlFor="uid"></label>
                      </div>
                    </div>
                    <div className="nk-tb-col">
                      <span
                        className="sub-text cursor-pointer"
                        onClick={() => handleSort('first_name')}
                      >
                        User
                        {sortConfig.key === 'first_name' && (
                          <em className={`icon ni ni-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-1`}></em>
                        )}
                      </span>
                    </div>
                    <div className="nk-tb-col tb-col-mb">
                      <span
                        className="sub-text cursor-pointer"
                        onClick={() => handleSort('email')}
                      >
                        Email
                        {sortConfig.key === 'email' && (
                          <em className={`icon ni ni-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-1`}></em>
                        )}
                      </span>
                    </div>
                    <div className="nk-tb-col tb-col-md">
                      <span
                        className="sub-text cursor-pointer"
                        onClick={() => handleSort('role')}
                      >
                        Role
                        {sortConfig.key === 'role' && (
                          <em className={`icon ni ni-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-1`}></em>
                        )}
                      </span>
                    </div>
                    <div className="nk-tb-col tb-col-lg">
                      <span
                        className="sub-text cursor-pointer"
                        onClick={() => handleSort('is_active')}
                      >
                        Status
                        {sortConfig.key === 'is_active' && (
                          <em className={`icon ni ni-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-1`}></em>
                        )}
                      </span>
                    </div>
                    <div className="nk-tb-col tb-col-lg">
                      <span className="sub-text">Permissions</span>
                    </div>
                    <div className="nk-tb-col tb-col-md">
                      <span
                        className="sub-text cursor-pointer"
                        onClick={() => handleSort('lastLogin')}
                      >
                        Last Login
                        {sortConfig.key === 'lastLogin' && (
                          <em className={`icon ni ni-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-1`}></em>
                        )}
                      </span>
                    </div>
                    <div className="nk-tb-col nk-tb-col-tools text-right">
                    </div>
                  </div>

                  {users.map((user) => (
                    <div key={user.id} className="nk-tb-item">
                      <div className="nk-tb-col nk-tb-col-check">
                        <div className="custom-control custom-control-sm custom-checkbox notext">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id={`uid${user.id}`}
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                          />
                          <label className="custom-control-label" htmlFor={`uid${user.id}`}></label>
                        </div>
                      </div>
                      <div className="nk-tb-col">
                        <div className="user-card">
                          <div className="user-avatar bg-primary">
                            <span>{user.first_name.charAt(0)}</span>
                          </div>
                          <div className="user-info">
                            <span className="tb-lead">{user.first_name} {user.last_name} <span className="dot dot-success d-lg-none ml-1"></span></span>
                            <span>{user.role}</span>
                          </div>
                        </div>
                      </div>
                      <div className="nk-tb-col tb-col-mb">
                        <span className="tb-amount">{user.email}</span>
                        <span className="tb-amount-sm">{user.phone}</span>
                      </div>
                      <div className="nk-tb-col tb-col-md">
                        <RoleBadge role={user.role} />
                      </div>
                      <div className="nk-tb-col tb-col-lg">
                        <StatusBadge status={user.is_active ? 'active' : 'inactive'} />
                      </div>
                      <div className="nk-tb-col tb-col-lg">
                        <span className="tb-amount">
                          {user.permissions && user.permissions.length > 0
                            ? user.permissions.map(permission =>
                              permission.charAt(0).toUpperCase() + permission.slice(1).replace('_', ' ')
                            ).join(', ')
                            : 'No permissions'
                          }
                        </span>
                      </div>
                      <div className="nk-tb-col tb-col-md">
                        <span>{user.lastLogin}</span>
                      </div>
                      <UserActionMenu
                        user={user}
                        onEdit={handleEditUser}
                        onDelete={handleDeleteUser}
                      />
                    </div>
                  ))}
                </div>
              </div>

              
                   {/* pagination here */}

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
      </div>

      {/* User Modal - DashLite Theme Structure (Create/Edit) */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-xl" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingUser ? 'Edit User' : 'Add New User'}</h5>
                <a href="#" className="close" onClick={() => {
                  setShowModal(false);
                  setEditingUser(null);
                  setFormData({
                    email: '',
                    password: '',
                    confirmPassword: '',
                    client_id: null,
                    first_name: '',
                    last_name: '',
                    role: 'customers',
                    permissions: [],
                    is_active: true
                  });
                }} aria-label="Close">
                  <em className="icon ni ni-cross"></em>
                </a>
              </div>
              <div className="modal-body modal-body-xl">
                <form onSubmit={handleSubmit} className="form-validate is-alter">
                  <div className="row g-3">
                    {/* Personal Information Section */}
                    <div className="col-12">
                      <h6 className="overline-title text-primary-alt">Personal Information</h6>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label" htmlFor="first_name">First Name *</label>
                        <div className="form-control-wrap">
                          <input
                            type="text"
                            className="form-control"
                            id="first_name"
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            required
                            placeholder="Enter first name"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label" htmlFor="last_name">Last Name *</label>
                        <div className="form-control-wrap">
                          <input
                            type="text"
                            className="form-control"
                            id="last_name"
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            required
                            placeholder="Enter last name"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="form-group">
                        <label className="form-label" htmlFor="email">Email Address *</label>
                        <div className="form-control-wrap">
                          <input
                            type="email"
                            className="form-control"
                            id="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            placeholder="user@example.com"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label" htmlFor="password">
                          {editingUser ? 'Password (leave blank to keep current)' : 'Password *'}
                        </label>
                        <div className="form-control-wrap">
                          <input
                            type="password"
                            className="form-control"
                            id="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required={!editingUser}
                            placeholder={editingUser ? "Enter new password (optional)" : "Enter password"}
                          />
                        </div>
                      </div>
                    </div>
                    {editingUser && (
                      <div className="col-md-4">
                        <div className="form-group">
                          <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                          <div className="form-control-wrap">
                            <input
                              type="password"
                              className="form-control"
                              id="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                              placeholder="Confirm new password"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label" htmlFor="role">Select Role *</label>
                        <div className="form-control-wrap">
                          <select
                            id="role"
                            className="form-control"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            required
                          >
                            <option value="">Select role</option>
                            <option value="superAdmin">Super Admin</option>
                            <option value="moderator">Moderator</option>
                            <option value="customers">Customer</option>
                            <option value="customerUsers">Customer Users</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label" htmlFor="client_id">Client</label>
                        <div className="form-control-wrap">
                          <select
                            id="client_id"
                            className="form-control"
                            value={formData.client_id || ''}
                            onChange={(e) => setFormData({ ...formData, client_id: e.target.value || null })}
                          >
                            <option value="">No Client</option>
                            {availableClients.map(client => (
                              <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div> */}

                    {/* Permissions Section */}
                    <div className="col-12">
                      <h6 className="overline-title text-primary-alt">Permissions</h6>
                    </div>
                    <div className="col-12">
                      <div className="form-group">
                        <div className="custom-control-group">
                          {Array.isArray(Pages) && Pages.map((permission) => (
                            <div key={permission.path} className="custom-control custom-checkbox">
                              <input
                                type="checkbox"
                                className="custom-control-input"
                                id={`permission-${permission.path}`}
                                checked={formData.permissions.includes(permission.path)}
                                onChange={() => handlePermissionChange(permission.path)}
                              />
                              <label
                                className="custom-control-label"
                                htmlFor={`permission-${permission.path}`}
                              >
                                {permission.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>



                    {/* Account Status */}
                    <div className="col-4">
                      <div className="form-group">
                        <label className="form-label" htmlFor="is_active_checkbox">User Status</label>
                        <div className="custom-control custom-switch">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id="is_active_checkbox"
                            checked={formData.is_active}
                            onChange={(e) =>
                              setFormData({ ...formData, is_active: e.target.checked })
                            }
                          />
                          <label className="custom-control-label" htmlFor="is_active_checkbox">
                            {formData.is_active ? 'Active' : 'Inactive'}
                          </label>
                        </div>
                      </div>
                    </div>



                    {/* Form Actions */}
                    {/* <UserFormActions 
                      isSubmitting={isSubmitting}
                      onCancel={() => setShowModal(false)}
                      submitText="Save User"
                      submitLoadingText="Creating User..."
                    /> */}
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowModal(false);
                        setEditingUser(null);
                        setFormData({
                          email: '',
                          password: '',
                          confirmPassword: '',
                          client_id: null,
                          first_name: '',
                          last_name: '',
                          role: 'customers',
                          permissions: [],
                          is_active: true
                        });
                      }}
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
                          {editingUser ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        editingUser ? 'Update User' : 'Create User'
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

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Import Users from Excel</h5>
                <a href="#" className="close" onClick={() => setShowImportModal(false)} aria-label="Close">
                  <em className="icon ni ni-cross"></em>
                </a>
              </div>
              <div className="modal-body">
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
                    <strong>Excel Format:</strong> Email, First Name, Last Name, Role, Status, Permissions, Password<br />
                    <strong>Valid Roles:</strong> superAdmin, moderator, customers, customerUsers<br />
                    <strong>Valid Status:</strong> active, inactive<br />
                    <strong>Import Behavior:</strong>
                    <ul className="mt-2">
                      <li>✅ <strong>New users</strong> will be created with provided data</li>
                      <li>🔄 <strong>Existing users</strong> (matching email) will be updated</li>
                      <li>🔒 Password will only be updated if provided (leave blank to keep existing)</li>
                      <li>📋 Permissions should be comma-separated (e.g., "read,write,delete")</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-light"
                  onClick={() => setShowImportModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showImportModal && <div className="modal-backdrop fade show"></div>}

    </div>
  );
}