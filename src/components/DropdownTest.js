'use client';
import React, { useEffect } from 'react';
import { initializeDropdowns, cleanupDropdowns, debugDropdowns } from '../lib/dropdownUtils';

export default function DropdownTest() {
  useEffect(() => {
    initializeDropdowns();
    return () => {
      cleanupDropdowns();
    };
  }, []);

  return (
    <div className="card card-bordered">
      <div className="card-inner">
        <h6 className="card-title">Dropdown Test</h6>
        <p className="text-soft">Use these test dropdowns to verify functionality is working correctly.</p>
        
        <div className="d-flex gap-3">
          {/* Test Action Menu */}
          <div className="nk-tb-col nk-tb-col-tools">
            <ul className="nk-tb-actions gx-1">
              <li>
                <div className="dropdown">
                  <a href="#" className="dropdown-toggle btn btn-icon btn-trigger" data-bs-toggle="dropdown">
                    <em className="icon ni ni-more-h"></em>
                  </a>
                  <div className="dropdown-menu dropdown-menu-right">
                    <ul className="link-list-opt no-bdr">
                      <li>
                        <a href="#" onClick={(e) => e.preventDefault()}>
                          <em className="icon ni ni-edit"></em>
                          <span>Edit</span>
                        </a>
                      </li>
                      <li className="divider"></li>
                      <li>
                        <a href="#" className="text-danger" onClick={(e) => e.preventDefault()}>
                          <em className="icon ni ni-trash"></em>
                          <span>Delete</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {/* Test Filter Dropdown */}
          <div className="dropdown">
            <button className="btn btn-outline-primary dropdown-toggle" data-bs-toggle="dropdown">
              Filter Options
            </button>
            <div className="dropdown-menu">
              <div className="dropdown-body" style={{ padding: '1rem', minWidth: '200px' }}>
                <div className="form-group">
                  <label>Test Options</label>
                  <div className="custom-control custom-checkbox">
                    <input type="checkbox" className="custom-control-input" id="test1" />
                    <label className="custom-control-label" htmlFor="test1">Option 1</label>
                  </div>
                  <div className="custom-control custom-checkbox">
                    <input type="checkbox" className="custom-control-input" id="test2" />
                    <label className="custom-control-label" htmlFor="test2">Option 2</label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Debug Button */}
          <button 
            className="btn btn-info btn-sm"
            onClick={() => debugDropdowns()}
          >
            Debug Dropdowns
          </button>
        </div>
      </div>
    </div>
  );
}