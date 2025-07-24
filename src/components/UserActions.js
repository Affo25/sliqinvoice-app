// User-specific action components
import React from 'react';
import { 
  TableActionMenu, 
  EditActionButton, 
  DeleteActionButton, 
  ActionButton, 
  ActionDivider 
} from './ActionButtons';
import { useSweetAlert } from './SweetAlerts';

// Complete user action menu for table rows
export const UserActionMenu = ({ 
  user, 
  onEdit, 
  onDelete, 
  showViewDetails = true,
  showResetPassword = true,
  showSuspend = true 
}) => {
  const { confirmUserDelete, handleDeleteSuccess, handleDeleteError } = useSweetAlert();

  const handleDelete = async () => {
    try {
      const result = await confirmUserDelete(`${user.first_name} ${user.last_name}`);
      
      if (result.isConfirmed) {
        await onDelete(user._id || user.id);
        handleDeleteSuccess(`${user.first_name} ${user.last_name}`);
      }
    } catch (error) {
      handleDeleteError(`${user.first_name} ${user.last_name}`, error.message || error);
    }
  };

  return (
    <TableActionMenu>
      <EditActionButton 
        onClick={() => onEdit && onEdit(user)}
        label="Edit User"
      />
      
      <DeleteActionButton 
        onClick={handleDelete}
        label="Delete User"
      />
      
      {(showViewDetails || showResetPassword || showSuspend) && <ActionDivider />}
      
      {showViewDetails && (
        <ActionButton 
          icon="ni-eye" 
          label="View Details"
          onClick={() => {
            // TODO: Implement view details functionality
            console.log('View details for user ID:', user._id || user.id);
          }}
        />
      )}
      
      {showResetPassword && (
        <ActionButton 
          icon="ni-shield-star" 
          label="Reset Password"
          onClick={() => {
            // TODO: Implement reset password functionality
            console.log('Reset password for user ID:', user._id || user.id);
          }}
        />
      )}
      
      {showSuspend && (
        <ActionButton 
          icon="ni-na" 
          label={user.is_active ? "Suspend User" : "Activate User"}
          className={user.is_active ? "text-warning" : "text-success"}
          onClick={() => {
            // TODO: Implement suspend/activate functionality
            console.log('Toggle suspend for user ID:', user._id || user.id);
          }}
        />
      )}
    </TableActionMenu>
  );
};

// Bulk user actions component
export const BulkUserActions = ({ 
  selectedUsers, 
  onBulkDelete, 
  isProcessing = false,
  onClearSelection 
}) => {
  const { 
    confirmBulkUserDelete, 
    handleBulkDeleteSuccess, 
    handleBulkDeleteError 
  } = useSweetAlert();

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;

    try {
      const result = await confirmBulkUserDelete(selectedUsers.length);
      
      if (result.isConfirmed) {
        await onBulkDelete(selectedUsers);
        handleBulkDeleteSuccess(selectedUsers.length);
        onClearSelection && onClearSelection();
      }
    } catch (error) {
      handleBulkDeleteError(error.message || error);
    }
  };

  if (selectedUsers.length === 0) return null;

  return (
    <div className="bulk-action-bar bg-light p-3 rounded mb-3">
      <div className="d-flex align-items-center justify-content-between">
        <span className="text-muted">
          <strong>{selectedUsers.length}</strong> user(s) selected
        </span>
        <div className="bulk-actions">
          <button 
            className="btn btn-danger btn-sm mr-2"
            onClick={handleBulkDelete}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="spinner-border spinner-border-sm mr-1"></span>
                Deleting...
              </>
            ) : (
              <>
                <em className="icon ni ni-trash mr-1"></em>
                Delete ({selectedUsers.length})
              </>
            )}
          </button>
          
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={onClearSelection}
            disabled={isProcessing}
          >
            Clear Selection
          </button>
        </div>
      </div>
    </div>
  );
};

// User form actions (for modals)
export const UserFormActions = ({ 
  isSubmitting, 
  onCancel, 
  submitText = 'Save User',
  submitLoadingText = 'Saving User...',
  isEdit = false 
}) => {
  return (
    <div className="col-12 pt-3">
      <div className="form-group">
        <button 
          type="submit" 
          className="btn btn-lg btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span className="ml-2">{submitLoadingText}</span>
            </>
          ) : (
            <>
              <em className={`icon ni ${isEdit ? 'ni-save' : 'ni-user-add'}`}></em>
              <span>{submitText}</span>
            </>
          )}
        </button>
        
        <button 
          type="button" 
          className="btn btn-outline-light ml-3" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default UserActionMenu;