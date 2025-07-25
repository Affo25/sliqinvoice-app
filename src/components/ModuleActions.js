// Module-specific action components
import React from 'react';
import { 
  TableActionMenu, 
  EditActionButton, 
  DeleteActionButton, 
  ActionButton, 
  ActionDivider 
} from './ActionButtons';
import { useSweetAlert } from './SweetAlerts';

// Complete module action menu for table rows
export const ModuleActionMenu = ({ 
  module, 
  onEdit, 
  onDelete,
  showViewDetails = false 
}) => {
  const { confirmUserDelete, handleDeleteSuccess, handleDeleteError } = useSweetAlert();

  const handleDelete = async () => {
    try {
      const result = await confirmUserDelete(module.name, 'module');
      
      if (result.isConfirmed) {
        await onDelete(module.id || module._id, module.name);
        handleDeleteSuccess(module.name);
      }
    } catch (error) {
      handleDeleteError(module.name, error.message || error);
    }
  };

  return (
    <TableActionMenu>
      <EditActionButton 
        onClick={() => onEdit && onEdit(module)}
        label="Edit Module"
      />
      
      <DeleteActionButton 
        onClick={handleDelete}
        label="Delete Module"
      />
      
      {showViewDetails && <ActionDivider />}
      
      {showViewDetails && (
        <ActionButton 
          onClick={() => console.log('View details:', module)}
          label="View Details"
          icon="ni-eye"
        />
      )}
    </TableActionMenu>
  );
};

// Bulk module actions component
export const BulkModuleActions = ({ 
  selectedModules, 
  onBulkDelete, 
  onClearSelection, 
  isProcessing = false 
}) => {
  if (selectedModules.length === 0) return null;

  return (
    <div className="card-inner">
      <div className="alert alert-fill alert-light">
        <div className="d-flex align-items-center">
          <div className="alert-body">
            <span className="fw-medium">{selectedModules.length} module(s) selected</span>
          </div>
          <div className="ml-auto">
            <div className="d-flex gap-2">
              <button 
                className="btn btn-sm btn-outline-light"
                onClick={onClearSelection}
                disabled={isProcessing}
              >
                Clear Selection
              </button>
              <button 
                className="btn btn-sm btn-outline-danger"
                onClick={() => onBulkDelete(selectedModules)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="spinner-border spinner-border-sm mr-1"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <em className="icon ni ni-trash"></em>
                    Delete Selected
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};