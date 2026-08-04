// components/FiltersModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Calendar, Filter, ChevronDown } from 'lucide-react';

const FiltersModal = ({ isOpen, onClose, onApplyFilters, initialFilters }) => {
  const [filters, setFilters] = useState(initialFilters || {});
  const [availableFilters, setAvailableFilters] = useState({
    timeframes: [],
    departments: [],
    severities: [],
    statuses: []
  });

  useEffect(() => {
    fetchAvailableFilters();
  }, []);

  const fetchAvailableFilters = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        'http://127.0.0.1:8000/api/reports/dashboard/filters/',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setAvailableFilters(data);
      }
    } catch (err) {
      console.error('Error fetching filters:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({});
    onApplyFilters({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Dashboard Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Timeframe Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Time Period
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableFilters.timeframes.map((timeframe) => (
                <button
                  key={timeframe.value}
                  onClick={() => handleFilterChange('timeframe', timeframe.value)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    filters.timeframe === timeframe.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {timeframe.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          {filters.timeframe === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Department Filter */}
          {availableFilters.departments.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Department
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.department || ''}
                onChange={(e) => handleFilterChange('department', e.target.value)}
              >
                <option value="">All Departments</option>
                {availableFilters.departments.map((dept) => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Severity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Severity Level
            </label>
            <div className="flex flex-wrap gap-2">
              {availableFilters.severities.map((severity) => (
                <button
                  key={severity.value}
                  onClick={() => handleFilterChange('severity', severity.value)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    filters.severity === severity.value
                      ? getSeverityStyle(severity.value, true)
                      : getSeverityStyle(severity.value, false)
                  }`}
                >
                  {severity.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            Reset All
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

const getSeverityStyle = (severity, isSelected) => {
  const base = {
    critical: 'border-red-300',
    high: 'border-blue-300',
    medium: 'border-yellow-300',
    low: 'border-green-300'
  };
  
  const selected = {
    critical: 'bg-red-600 text-white border-red-600',
    high: 'bg-blue-600 text-white border-blue-600',
    medium: 'bg-yellow-600 text-white border-yellow-600',
    low: 'bg-green-600 text-white border-green-600'
  };
  
  return isSelected 
    ? selected[severity] || 'bg-gray-600 text-white border-gray-600'
    : `${base[severity]} text-gray-700 hover:bg-gray-50`;
};

export default FiltersModal;