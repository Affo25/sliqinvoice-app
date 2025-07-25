'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchModules,
  createModule,
  updateModule,
  deleteModule,
  deleteMultipleModules,
  exportModules,
  importModules,
  setFilters,
  clearFilters,
  clearError
} from '../../../redux/slices/modulesSlice';
import { showToast } from '../../../lib/toast';
import { useSweetAlert } from '../../../components/SweetAlerts';
import { ModuleActionMenu, BulkModuleActions } from '../../../components/ModuleActions';
import SeedModules from '../../../components/SeedModules';
import { initializeDropdowns, cleanupDropdowns, closeDropdown } from '../../../lib/dropdownUtils';
import '../../../app/globals.css';

export default function ModulesPage() {
  // Redux state
  const dispatch = useDispatch();
  const {
    modules,
    loading,
    error,
    totalCount,
    filters,
    pagination
  } = useSelector((state) => state.modules);

  // Local state
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedModules, setSelectedModules] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'created_time', direction: 'desc' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  // Advanced filter states
  const [statusFilters, setStatusFilters] = useState([]);
  const [itemsPerPageFilter, setItemsPerPageFilter] = useState(filters.limit || 10);

  // SweetAlert hooks
  const { confirmUserDelete, confirmBulkUserDelete, handleDeleteSuccess, handleDeleteError, handleBulkDeleteSuccess, handleBulkDeleteError } = useSweetAlert();

  // Form data for new module
  const [formData, setFormData] = useState({
    name: '',
    module_key: '',
    status: 'active',
    description: ''
  });

  // Load modules on component mount
  useEffect(() => {
    dispatch(fetchModules(filters));
  }, [dispatch]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(setFilters({ 
        search: searchTerm, 
        status: statusFilter,
        page: 1 
      }));
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, dispatch]);

  // Fetch modules when filters change
  useEffect(() => {
    dispatch(fetchModules(filters));
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

  // Sorting with enhanced functionality
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    // Sort modules locally for immediate UI feedback
    const sortedModules = [...modules].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Get sort icon
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return 'ni ni-sort';
    }
    return sortConfig.direction === 'asc' ? 'ni ni-sort-up' : 'ni ni-sort-down';
  };

  // Handle form submission (both create and edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!formData.name || !formData.module_key || !formData.status) {
      showToast('Please fill in all required fields!', 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingModule) {
        // Edit mode
        await dispatch(updateModule({ id: editingModule._id, moduleData: formData })).unwrap();
        showToast('<h5>Module Updated Successfully!</h5><p>Module information has been updated.</p>', 'success');
      } else {
        // Create mode
        await dispatch(createModule(formData)).unwrap();
        showToast('<h5>Module Created Successfully!</h5><p>New module has been added to the system.</p>', 'success');
      }

      // Reset form and close modal
      resetForm();
      setShowModal(false);
    } catch (error) {
      const errorMessage = editingModule ? 'Error Updating Module' : 'Error Creating Module';
      showToast(`<h5>${errorMessage}</h5><p>${error}</p>`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      module_key: '',
      status: 'active',
      description: ''
    });
    setEditingModule(null);
  };

  // Handle edit module
  const handleEditModule = (module) => {
    setEditingModule(module);
    setFormData({
      module_id: module.module_id, // Include in edit mode for display
      name: module.name,
      module_key: module.module_key,
      status: module.status,
      description: module.description || ''
    });
    setShowModal(true);
  };

  // Handle checkbox selection
  const handleSelectModule = (moduleId) => {
    setSelectedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSelectAll = () => {
    if (selectedModules.length === modules.length) {
      setSelectedModules([]);
    } else {
      setSelectedModules(modules.map(module => module.id));
    }
  };

  // Handle search change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  // Handle advanced status filter change (for checkboxes)
  const handleAdvancedStatusFilterChange = (status) => {
    setStatusFilters(prev => {
      const newFilters = prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status];
      
      // Apply filters to Redux
      dispatch(setFilters({ 
        statuses: newFilters,
        page: 1 
      }));
      
      return newFilters;
    });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (limit) => {
    setItemsPerPageFilter(limit);
    dispatch(setFilters({ limit: Number(limit), page: 1 }));
  };

  // Handle page change
  const handlePageChange = (page) => {
    dispatch(setFilters({ page }));
  };

  // Handle delete module with SweetAlert
  const handleDeleteModule = async (moduleId, moduleName) => {
    try {
      await confirmUserDelete(
        moduleId,
        async (id) => {
          await dispatch(deleteModule(id)).unwrap();
        },
        handleDeleteSuccess,
        handleDeleteError,
        moduleName
      );
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // Handle bulk delete with SweetAlert
  const handleBulkDelete = async () => {
    if (selectedModules.length === 0) {
      showToast('Please select modules to delete', 'warning');
      return;
    }

    try {
      await confirmBulkUserDelete(
        selectedModules,
        async (ids) => {
          await dispatch(deleteMultipleModules(ids)).unwrap();
        },
        handleBulkDeleteSuccess,
        handleBulkDeleteError,
        'modules'
      );
      setSelectedModules([]);
    } catch (error) {
      console.error('Bulk delete error:', error);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      showToast('Exporting modules...', 'info');
      await dispatch(exportModules(filters)).unwrap();
      showToast('<h5>Export Completed!</h5><p>Modules data has been exported to Excel successfully.</p>', 'success');
    } catch (error) {
      showToast(`Error exporting modules: ${error}`, 'error');
    }
  };

  // Handle import
  const handleImport = async (file) => {
    const importFormData = new FormData();
    importFormData.append('file', file);

    try {
      showToast('Importing modules from Excel...', 'info');
      const result = await dispatch(importModules(importFormData)).unwrap();

      let successMessage = '<h5>Import Completed!</h5>';
      if (result.summary.created > 0) {
        successMessage += `<p>✅ ${result.summary.created} new modules created</p>`;
      }
      if (result.summary.updated > 0) {
        successMessage += `<p>🔄 ${result.summary.updated} existing modules updated</p>`;
      }
      if (result.summary.failed > 0) {
        successMessage += `<p>❌ ${result.summary.failed} modules failed to import</p>`;
      }

      showToast(successMessage, 'success');
      setShowImportModal(false);

      // Refresh the module list to show changes
      dispatch(fetchModules(filters));
    } catch (error) {
      showToast(`Error importing modules: ${error}`, 'error');
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const getStatusClass = (status) => {
      switch (status) {
        case 'active': return 'badge-success';
        case 'inactive': return 'badge-danger';
        default: return 'badge-gray';
      }
    };

    return (
      <span className={`badge badge-dot ${getStatusClass(status)}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Enhanced pagination component
  const PaginationComponent = () => {
    const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;

    return (
      <div className="card-inner">
        <div className="nk-block-between-md g-3">
          <div className="g">
            <ul className="pagination justify-content-center justify-content-md-start">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <a
                  className="page-link"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (hasPrevPage) handlePageChange(currentPage - 1);
                  }}
                >
                  Prev
                </a>
              </li>
              {[...Array(totalPages)].map((_, i) => (
                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
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
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <a
                  className="page-link"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (hasNextPage) handlePageChange(currentPage + 1);
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
                  value={currentPage}
                  onChange={(e) => handlePageChange(Number(e.target.value))}
                >
                  {[...Array(totalPages)].map((_, i) => (
                    <option key={i} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
              <div>OF {totalPages}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && modules.length === 0) {
    return (
      <div className="nk-content-inner">
        <div className="nk-content-body">
          <div className="nk-block-head nk-block-head-sm">
            <div className="nk-block-between">
              <div className="nk-block-head-content">
                <h3 className="nk-block-title page-title">Modules</h3>
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
                    <p className="mt-3">Loading modules...</p>
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
              <h3 className="nk-block-title page-title">Modules</h3>
              <div className="nk-block-des text-soft">
                <p>You have total <span className='badge badge-info'>{totalCount}</span> modules.</p>
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
                      {selectedModules.length > 0 && (
                        <button
                          className="btn btn-outline-danger mr-2"
                          onClick={handleBulkDelete}
                          disabled={loading}
                        >
                          <em className="icon ni ni-trash"></em>
                          <span>Delete Selected ({selectedModules.length})</span>
                        </button>
                      )}
                      <button
                        className="btn btn-danger"
                        onClick={handleExport}
                        disabled={loading}
                      >
                        <em className="icon ni ni-file-download"></em>
                        <span>Export Excel</span>
                      </button>
                      <button
                        className="btn btn-info ml-3"
                        onClick={() => setShowImportModal(true)}
                        disabled={loading}
                      >
                        <em className="icon ni ni-file-upload"></em>
                        <span>Import Excel</span>
                      </button>
                      <button
                        className="btn btn-primary ml-3"
                        onClick={() => {
                          resetForm();
                          setShowModal(true);
                        }}
                        disabled={loading}
                      >
                        <em className="icon ni ni-plus"></em>
                        <span>Add Module</span>
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
              {/* Enhanced Filters */}
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
                          placeholder="Search modules..."
                          value={searchTerm}
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
                                  <a href="#" className="btn btn-trigger btn-icon dropdown-toggle" data-bs-toggle="dropdown">
                                    <div className="dot dot-primary"></div>
                                    <em className="icon ni ni-filter-alt"></em>
                                  </a>
                                  <div className="filter-wg dropdown-menu dropdown-menu-xl dropdown-menu-right">
                                    <div className="dropdown-head">
                                      <span className="sub-title dropdown-title">Filter Modules</span>
                                      <div className="dropdown-text">
                                        {statusFilters?.length > 0 && (
                                          <span className="badge badge-success">{statusFilters.length} status(es) selected</span>
                                        )}
                                        {itemsPerPageFilter && itemsPerPageFilter !== 10 && (
                                          <span className="badge badge-info ml-1">{itemsPerPageFilter} per page</span>
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
                                                  checked={statusFilters?.includes('active')}
                                                  onChange={() => handleAdvancedStatusFilterChange('active')}
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
                                                  id="filter-status-inactive"
                                                  checked={statusFilters?.includes('inactive')}
                                                  onChange={() => handleAdvancedStatusFilterChange('inactive')}
                                                  onClick={(e) => e.stopPropagation()}
                                                />
                                                <label className="custom-control-label" htmlFor="filter-status-inactive">
                                                  <span className="badge badge-danger">Inactive</span>
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
                                                  id="filter-limit-5"
                                                  name="itemsPerPage"
                                                  checked={itemsPerPageFilter === 5}
                                                  onChange={() => handleItemsPerPageChange(5)}
                                                  onClick={(e) => e.stopPropagation()}
                                                />
                                                <label className="custom-control-label" htmlFor="filter-limit-5">
                                                  <span className="badge badge-outline-primary">5 per page</span>
                                                </label>
                                              </div>
                                              <div className="custom-control custom-radio">
                                                <input
                                                  type="radio"
                                                  className="custom-control-input"
                                                  id="filter-limit-10"
                                                  name="itemsPerPage"
                                                  checked={itemsPerPageFilter === 10}
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
                                                  checked={itemsPerPageFilter === 20}
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
                                                  id="filter-limit-50"
                                                  name="itemsPerPage"
                                                  checked={itemsPerPageFilter === 50}
                                                  onChange={() => handleItemsPerPageChange(50)}
                                                  onClick={(e) => e.stopPropagation()}
                                                />
                                                <label className="custom-control-label" htmlFor="filter-limit-50">
                                                  <span className="badge badge-outline-primary">50 per page</span>
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
                                        onClick={() => {
                                          setStatusFilters([]);
                                          setItemsPerPageFilter(10);
                                          setSearchTerm('');
                                          dispatch(clearFilters());
                                        }}
                                      >
                                        Reset Filters
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-primary"
                                        onClick={() => {
                                          // Close the dropdown after applying filters
                                          closeDropdown('.filter-wg');
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

              {/* Bulk Actions */}
              <BulkModuleActions
                selectedModules={selectedModules}
                onBulkDelete={handleBulkDelete}
                onClearSelection={() => setSelectedModules([])}
                isProcessing={isSubmitting}
              />

              {/* Enhanced Table with Sorting */}
              <div className="card-inner p-0">
                <div className="nk-tb-list nk-tb-ulist">
                  <div className="nk-tb-item nk-tb-head">
                    <div className="nk-tb-col nk-tb-col-check">
                      <div className="custom-control custom-control-sm custom-checkbox notext">
                        <input 
                          type="checkbox" 
                          className="custom-control-input" 
                          id="uid"
                          checked={selectedModules.length === modules.length && modules.length > 0}
                          onChange={handleSelectAll}
                        />
                        <label className="custom-control-label" htmlFor="uid"></label>
                      </div>
                    </div>
                    <div className="nk-tb-col">
                      <span 
                        className="sub-text cursor-pointer d-flex align-items-center"
                        onClick={() => handleSort('name')}
                      >
                        Module
                        <em className={`icon ${getSortIcon('name')} ml-1`}></em>
                      </span>
                    </div>
                    <div className="nk-tb-col tb-col-mb">
                      <span 
                        className="sub-text cursor-pointer d-flex align-items-center"
                        onClick={() => handleSort('module_key')}
                      >
                        Module Key
                        <em className={`icon ${getSortIcon('module_key')} ml-1`}></em>
                      </span>
                    </div>
                    <div className="nk-tb-col tb-col-md">
                      <span 
                        className="sub-text cursor-pointer d-flex align-items-center"
                        onClick={() => handleSort('status')}
                      >
                        Status
                        <em className={`icon ${getSortIcon('status')} ml-1`}></em>
                      </span>
                    </div>
                    <div className="nk-tb-col tb-col-lg">
                      <span 
                        className="sub-text cursor-pointer d-flex align-items-center"
                        onClick={() => handleSort('created_time')}
                      >
                        Created
                        <em className={`icon ${getSortIcon('created_time')} ml-1`}></em>
                      </span>
                    </div>
                    <div className="nk-tb-col nk-tb-col-tools text-right">
                      <span className="sub-text">Action</span>
                    </div>
                  </div>

                  {modules.length === 0 ? (
                    <div className="nk-tb-item">
                      <div className="nk-tb-col" style={{textAlign: 'center', padding: '40px'}}>
                        <div>
                          <em className="icon ni ni-inbox" style={{fontSize: '48px', color: '#c4c8d4'}}></em>
                          <h6 className="mt-2">No modules found</h6>
                          <p className="text-soft">
                            {searchTerm || statusFilter !== 'all' 
                              ? 'No modules match your search criteria.' 
                              : 'No modules have been created yet.'
                            }
                          </p>
                          <button 
                            className="btn btn-primary"
                            onClick={() => {
                              resetForm();
                              setShowModal(true);
                            }}
                          >
                            <em className="icon ni ni-plus"></em>
                            Add First Module
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    modules.map((module) => (
                      <div key={module.id} className="nk-tb-item">
                        <div className="nk-tb-col nk-tb-col-check">
                          <div className="custom-control custom-control-sm custom-checkbox notext">
                            <input 
                              type="checkbox" 
                              className="custom-control-input" 
                              id={`uid-${module.id}`}
                              checked={selectedModules.includes(module.id)}
                              onChange={() => handleSelectModule(module.id)}
                            />
                            <label className="custom-control-label" htmlFor={`uid-${module.id}`}></label>
                          </div>
                        </div>
                        <div className="nk-tb-col">
                          <div className="user-card">
                            <div className="user-info">
                              <span className="tb-lead">{module.name}</span>
                              <span className="tb-sub">{module.module_id}</span>
                            </div>
                          </div>
                        </div>
                        <div className="nk-tb-col tb-col-mb">
                          <span className="tb-amount">
                            <code>{module.module_key}</code>
                          </span>
                        </div>
                        <div className="nk-tb-col tb-col-md">
                          <StatusBadge status={module.status} />
                        </div>
                        <div className="nk-tb-col tb-col-lg">
                          <span>{new Date(module.created_time).toLocaleDateString()}</span>
                        </div>
                        <ModuleActionMenu
                          module={module}
                          onEdit={handleEditModule}
                          onDelete={handleDeleteModule}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Enhanced Pagination */}
              {modules.length > 0 && <PaginationComponent />}
            </div>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="modal fade show" style={{display: 'block'}} tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
              <div className="modal-content">
                <button 
                  type="button" 
                  className="close" 
                  onClick={() => setShowModal(false)}
                  style={{position: 'absolute', top: '15px', right: '20px', zIndex: 1050}}
                >
                  <span>&times;</span>
                </button>
                <div className="modal-body modal-body-lg px-4 py-4">
                  <h5 className="title">{editingModule ? 'Edit Module' : 'Add Module'}</h5>
                  <form onSubmit={handleSubmit}>
                    <div className="row gy-4">
                      {/* Module ID - Only show in edit mode and make it read-only */}
                      {editingModule && (
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label" htmlFor="module-id">Module ID</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              id="module-id"
                              value={formData.module_id || ''}
                              readOnly
                              disabled
                              style={{backgroundColor: '#f5f6fa', cursor: 'not-allowed'}}
                            />
                            <div className="form-note">
                              Module ID is auto-generated and cannot be changed
                            </div>
                          </div>
                        </div>
                      )}
                      <div className={editingModule ? "col-md-6" : "col-md-12"}>
                        <div className="form-group">
                          <label className="form-label" htmlFor="module-key">Module Key *</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            id="module-key"
                            placeholder="Enter unique module key (e.g., products, invoices)"
                            value={formData.module_key}
                            onChange={(e) => setFormData({...formData, module_key: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label" htmlFor="module-name">Module Name *</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            id="module-name"
                            placeholder="Enter module name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                          <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label" htmlFor="status">Status *</label>
                        <div className="form-control-wrap">
                          <select
                            id="status"
                            className="form-control"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            required
                          >
                            <option value="">Select status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                      <div className="col-12">
                        <div className="form-group">
                          <label className="form-label" htmlFor="module-description">Description</label>
                          <textarea 
                            className="form-control" 
                            id="module-description"
                            placeholder="Enter module description"
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                          ></textarea>
                        </div>
                      </div>
                      <div className="col-12">
                        <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                          <li>
                            <button 
                              type="submit" 
                              className="btn btn-primary"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                  Processing...
                                </>
                              ) : (editingModule ? 'Update Module' : 'Add Module')}
                            </button>
                          </li>
                          <li>
                            <button 
                              type="button" 
                              className="btn btn-outline-light"
                              onClick={() => setShowModal(false)}
                              disabled={isSubmitting}
                            >
                              Cancel
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Import Modal */}
        {showImportModal && (
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Import Modules from Excel</h5>
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
                      <strong>Excel Format:</strong> Name, Module Key, Status, Description<br />
                      <strong>Valid Status:</strong> active, inactive<br />
                      <strong>Import Behavior:</strong>
                      <ul className="mt-2">
                        <li>✅ <strong>New modules</strong> will be created with auto-generated Module ID</li>
                        <li>🔄 <strong>Existing modules</strong> (matching Module Key) will be updated</li>
                        <li>🔑 Module Key must be unique across all modules</li>
                        <li>📝 Description is optional but recommended</li>
                        <li>🏷️ Status must be either "active" or "inactive"</li>
                      </ul>
                      <div className="alert alert-light mt-3">
                        <strong>Example Excel Format:</strong><br />
                        <table className="table table-sm table-bordered mt-2">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Module Key</th>
                              <th>Status</th>
                              <th>Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Product Management</td>
                              <td>products</td>
                              <td>active</td>
                              <td>Manage all products</td>
                            </tr>
                            <tr>
                              <td>Customer Management</td>
                              <td>customers</td>
                              <td>active</td>
                              <td>Manage customers</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
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

    

        {/* Modal backdrop */}
        {(showModal || showImportModal) && (
          <div className="modal-backdrop fade show"></div>
        )}

        {/* Loading overlay for actions */}
        {loading && modules.length > 0 && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}