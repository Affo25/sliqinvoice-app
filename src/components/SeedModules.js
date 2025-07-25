'use client';
import { useState } from 'react';
import { showToast } from '../lib/toast';

export default function SeedModules() {
  const [loading, setLoading] = useState(false);

  const handleSeedModules = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/modules/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        showToast(`✅ Successfully seeded ${result.modules.length} modules!`, 'success');
        // Refresh the page to show new data
        window.location.reload();
      } else {
        showToast(`❌ Error: ${result.message}`, 'error');
      }
    } catch (error) {
      showToast(`❌ Error seeding modules: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearModules = async () => {
    if (!confirm('Are you sure you want to delete ALL modules? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/modules/seed', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        showToast(`✅ Successfully deleted ${result.deletedCount} modules!`, 'success');
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        showToast(`❌ Error: ${result.message}`, 'error');
      }
    } catch (error) {
      showToast(`❌ Error clearing modules: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card card-bordered">
      <div className="card-inner">
        <h6 className="card-title">Development Tools</h6>
        <p className="text-soft">Use these tools to quickly populate or clear module data for testing.</p>
        <div className="d-flex gap-2">
          <button
            className="btn btn-success btn-sm"
            onClick={handleSeedModules}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm mr-2"></span>
                Seeding...
              </>
            ) : (
              <>
                <em className="icon ni ni-plus-round"></em>
                Seed Sample Modules
              </>
            )}
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={handleClearModules}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm mr-2"></span>
                Clearing...
              </>
            ) : (
              <>
                <em className="icon ni ni-trash"></em>
                Clear All Modules
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}