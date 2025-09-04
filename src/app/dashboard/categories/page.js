'use client';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import Button from '../../../components/ui/button';
import { showToast } from '../../../lib/toast';
import { initializeDropdowns, cleanupDropdowns } from '../../../lib/dropdownUtils';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  setFilters,
  clearError
} from '../../../redux/slices/categoriesSlice';

export default function CategoriesPage() {
  const dispatch = useDispatch();

  // Redux state
  const {
    categories,
    loading,
    error,
    filters,
    pagination
  } = useSelector((state) => state.categories);

  // Local state
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    is_active: true
  });

  // Load data on mount
  useEffect(() => {
    dispatch(fetchCategories({ ...filters, hierarchical: true }));
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingCategory) {
        await dispatch(updateCategory({
          id: editingCategory.id,
          categoryData: formData
        })).unwrap();
        showToast('<h5>Category Updated!</h5><p>Category has been updated successfully.</p>', 'success');
      } else {
        await dispatch(createCategory(formData)).unwrap();
        showToast('<h5>Category Created!</h5><p>New category has been created successfully.</p>', 'success');
      }

      // Reset form and close modal
      setFormData({
        name: '',
        is_active: true
      });
      setShowModal(false);
      setEditingCategory(null);

    } catch (error) {
      showToast(`<h5>Error</h5><p>${error}</p>`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      is_active: category.is_active
    });
    setShowModal(true);
  };

  // Handle delete confirmation
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await dispatch(deleteCategory(categoryToDelete.id)).unwrap();
      showToast('<h5>Category Deleted!</h5><p>Category has been deleted successfully.</p>', 'success');
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (error) {
      showToast(`<h5>Error Deleting Category</h5><p>${error}</p>`, 'error');
    }
  };

  // Handle search
  const handleSearch = (searchTerm) => {
    dispatch(setFilters({ search: searchTerm, page: 1 }));
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value, page: 1 }));
  };


   const handleSearchChange = (e) => {
      dispatch(setFilters({
        search: e.target.value,
        page: 1
      }));
    };
  // Handle page change
  const handlePageChange = (page) => {
    dispatch(setFilters({ page }));
  };

  // Get category badge color
  const getCategoryBadge = (category) => {
    if (!category.is_active) return 'badge-danger';
    if (category.parentId) return 'badge-info';
    return 'badge-primary';
  };

  // Get parent categories (for dropdown)
  const getParentCategories = () => {
    return categories.filter(cat => !cat.parentId && cat.is_active);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="nk-block-head nk-block-head-sm">
        <div className="nk-block-between">
          <div className="nk-block-head-content">
            <h3 className="nk-block-title page-title">Categories Management</h3>
            <div className="nk-block-des text-soft">
              <p>Manage your transaction categories and subcategories.</p>
            </div>
          </div>
          <div className="nk-block-head-content">
            <div className="toggle-wrap nk-block-tools-toggle">
              <a href="#" className="btn btn-icon btn-trigger toggle-expand mr-n1" data-target="pageMenu">
                <em className="icon ni ni-menu-alt-r"></em>
              </a>
              <div className="toggle-expand-content" data-content="pageMenu">
                <ul className="nk-block-tools g-3">
                  <li>
                    <Button 
                      onClick={() => dispatch(fetchCategories({ seed: true }))}
                      variant="outline"
                      disabled={loading}
                      className="gap-2"
                    >
                      <em className="icon ni ni-seeds"></em>
                      <span>Seed Data</span>
                    </Button>
                  </li>
                  <li className="nk-block-tools-opt">
                    <Button 
                      onClick={() => setShowModal(true)}
                      variant="gradient"
                      className="gap-2"
                    >
                      <em className="icon ni ni-plus"></em>
                      <span>Add Category</span>
                    </Button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

     

      {/* Categories Table */}
      <div className="nk-block">
        <div className="card card-bordered card-stretch">
          <div className="card-inner-group">
             <div className="card-inner position-relative card-tools-toggle">
              <div className="card-title-group">
              
                <div className="card-tools">
                  <div className="form-inline flex-nowrap gx-3">
                    <div className="form-wrap">
                      
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search categories..."
                       value={filters.search}
                      onChange={(e) => handleSearch(e.target.value)}
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
                    <span className="sub-text">Category</span>
                  </div>
                  <div className="nk-tb-col tb-col-md">
                    <span className="sub-text">Status</span>
                  </div>
                  <div className="nk-tb-col tb-col-md">
                    <span className="sub-text">Created</span>
                  </div>
                  <div className="nk-tb-col nk-tb-col-tools text-right">
                    <span className="sub-text">Actions</span>
                  </div>
                </div>

                {loading ? (
                  <div className="nk-tb-item">
                    <div className="nk-tb-col" colSpan="6">
                      <div className="d-flex justify-content-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="sr-only">Loading...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="nk-tb-item">
                    <div className="nk-tb-col" colSpan="6">
                      <div className="text-center py-4">
                        <div className="mb-3">
                          <em className="icon ni ni-folder-list" style={{ fontSize: '3rem', color: '#c4c4c4' }}></em>
                        </div>
                        <h5>No Categories Found</h5>
                        <p className="text-soft">Create your first category to get started.</p>
                        <Button 
                          onClick={() => setShowModal(true)}
                          variant="gradient"
                          className="gap-2"
                        >
                          <em className="icon ni ni-plus"></em>
                          <span>Add Category</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  categories.map((category) => (
                    <div key={category.id} className="nk-tb-item">
                      <div className="nk-tb-col">
                        <Link 
                          href={`/dashboard/categories/${category.id}`}
                          className="fw-medium text-primary"
                        >
                          {category.name.toUpperCase()}
                        </Link>
                      </div>
                      <div className="nk-tb-col tb-col-md">
                        {category.is_active ? (
                          <span className="badge bg-success">Active</span>
                        ) : (
                          <span className="badge bg-danger">Inactive</span>
                        )}
                      </div>

                    <div className="nk-tb-col tb-col-md">
  <span className="badge bg-success">
    {category.createdAt
      ? new Date(category.createdAt).toLocaleString('en-US', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      : 'N/A'}
  </span>
</div>




                      <div className="nk-tb-col nk-tb-col-tools">
                        <ul className="nk-tb-actions gx-1">
                          <li>
                            <button type="button" className="btn btn-danger btn btn-sm" onClick={(e) => { e.preventDefault(); handleDeleteClick(category); }}>
                               <span>
                                <em className="icon ni ni-trash"></em>
                              </span>
                              Delete
                            </button>

                            <button type="button" className="btn btn-info btn btn-sm ml-3" onClick={(e) => { e.preventDefault(); handleEdit(category); }}>
                              <span>
                                <em className="icon ni ni-edit"></em>
                              </span>
                              Delete
                            </button>
                          
                          </li>
                        </ul>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="card-inner">
                <div className="nk-block-between-md g-3">
                  <div className="g">
                    <div className="pagination-goto d-flex justify-content-center justify-content-md-start gx-3">
                      <div>Page {pagination.currentPage} of {pagination.totalPages}</div>
                    </div>
                  </div>
                  <div className="g">
                    <div className="pagination pagination-s1">
                      <button
                        className="page-link"
                        disabled={!pagination.hasPrevPage}
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                      >
                        Prev
                      </button>
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter(page => Math.abs(page - pagination.currentPage) <= 2 || page === 1 || page === pagination.totalPages)
                        .map((page, index, arr) => (
                          <React.Fragment key={page}>
                            {index > 0 && arr[index - 1] !== page - 1 && <span className="page-link">...</span>}
                            <button
                              className={`page-link ${pagination.currentPage === page ? 'active' : ''}`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        ))}
                      <button
                        className="page-link"
                        disabled={!pagination.hasNextPage}
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
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

      {/* Add/Edit Category Modal */}
      {showModal && (
        <>
          <div className="modal fade show" style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h5>
                  <button
                    type="button"
                    className="close"
                    onClick={() => {
                      setShowModal(false);
                      setEditingCategory(null);
                      setFormData({
                        name: '',
                        is_active: true
                      });
                    }}
                  >
                    <span>&times;</span>
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="form-group">
                      <label className="form-label" htmlFor="name">
                        Category Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="form-control"
                        placeholder="Enter category name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
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
                          Active Category
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
                        setEditingCategory(null);
                        setFormData({
                          name: '',
                        
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
                          <span className="spinner-border spinner-border-sm mr-2" />
                          Processing...
                        </>
                      ) : (
                        editingCategory ? 'Update Category' : 'Create Category'
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && categoryToDelete && (
        <>
          <div className="modal fade show" style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Deletion</h5>
                  <button
                    type="button"
                    className="close"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setCategoryToDelete(null);
                    }}
                  >
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete the category <strong>{categoryToDelete.name}</strong>?</p>
                  <p className="text-warning">
                    <em className="icon ni ni-alert-circle"></em>
                    This action cannot be undone. Categories with existing transactions cannot be deleted.
                  </p>
                </div>
                <div className="modal-footer">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setCategoryToDelete(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    Delete Category
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
}