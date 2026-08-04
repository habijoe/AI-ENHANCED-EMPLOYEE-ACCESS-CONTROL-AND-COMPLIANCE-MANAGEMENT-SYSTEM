import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Shield, AlertTriangle, Users, Activity, CheckCircle, 
  TrendingDown, TrendingUp, BookOpen, Award, Clock, 
  Filter, Download, BarChart3, PieChart, LineChart, 
  Calendar, X, ChevronDown, RefreshCw, Search,
  FileText, Eye, AlertCircle, User, Building,
  Settings, Bell, HelpCircle, ArrowUp, ArrowDown,
  Database, Cpu, Network, Server, CalendarDays,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon
} from "lucide-react";
import {
  LineChart as RechartsLine,
  BarChart as RechartsBar,
  PieChart as RechartsPie,
  Line,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
  ComposedChart
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

// ==================== API REQUEST HELPER ====================
const apiRequest = async (method, endpoint, body = null, isBlob = false) => {
  try {
    const token = localStorage.getItem('access_token');
    
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };

    if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`http://127.0.0.1:8000${endpoint}`, options);

    if (isBlob) {
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      return await response.blob();
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return { success: true };
    }

    const data = await response.json();
    
    if (!response.ok) {
      const errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;

  } catch (error) {
    console.error('API request failed:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your connection.');
    }
    
    throw error;
  }
};

// ==================== CHART COLORS ====================
const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  indigo: '#6366f1',
  pink: '#ec4899',
  cyan: '#06b6d4',
  gray: '#6b7280',
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  }
};

const SEVERITY_COLORS = {
  critical: '#dc2626',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
  info: '#3b82f6',
};

const RISK_LEVEL_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#10b981',
  info: '#3b82f6'
};

// ==================== UTILITY FUNCTIONS ====================
const formatNumber = (num) => {
  if (typeof num !== 'number') return num;
  return new Intl.NumberFormat('en-US').format(num);
};

const formatPercentage = (num) => {
  if (typeof num !== 'number') return '0%';
  return `${num.toFixed(1)}%`;
};

const getTrendIcon = (value) => {
  if (value > 0) return <TrendingUpIcon className="h-4 w-4" />;
  if (value < 0) return <TrendingDownIcon className="h-4 w-4" />;
  return <Activity className="h-4 w-4" />;
};

const getTrendColor = (value) => {
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-600';
};

const getStatusColor = (status) => {
  switch(status?.toLowerCase()) {
    case 'active':
    case 'operational':
    case 'completed':
    case 'success':
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'in_progress':
    case 'running':
    case 'warning':
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'pending':
    case 'idle':
    case 'info':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'critical':
    case 'error':
    case 'failed':
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// ==================== COMPONENTS ====================

const SeverityBadge = ({ severity, size = 'sm' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const getIcon = () => {
    switch(severity?.toLowerCase()) {
      case 'critical': return <AlertTriangle className="h-3 w-3" />;
      case 'high': return <AlertCircle className="h-3 w-3" />;
      case 'medium': return <AlertTriangle className="h-3 w-3" />;
      default: return <CheckCircle className="h-3 w-3" />;
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses[size]} ${getStatusColor(severity)}`}>
      {getIcon()}
      <span className="capitalize">{severity || 'Unknown'}</span>
    </div>
  );
};

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`animate-spin rounded-full border-2 border-blue-200 border-t-blue-600 ${sizeClasses[size]}`}></div>
      {text && <p className="mt-2 text-sm text-gray-500">{text}</p>}
    </div>
  );
};

const EmptyState = ({ icon: Icon = Database, title = 'No data available', description = 'There is no data to display for this section.' }) => (
  <div className="flex flex-col items-center justify-center p-8 text-gray-400">
    <Icon className="h-12 w-12 mb-3" />
    <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
    <p className="text-sm text-gray-500 text-center max-w-sm">{description}</p>
  </div>
);

const StatCard = ({ 
  title, 
  value, 
  trend = 0, 
  trendLabel = '', 
  icon: Icon, 
  color = 'blue',
  loading = false,
  format = 'number'
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    gray: 'bg-gray-100 text-gray-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  const formattedValue = useMemo(() => {
    if (format === 'percentage') return formatPercentage(value);
    if (format === 'number') return formatNumber(value);
    return value;
  }, [value, format]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
          <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900">{formattedValue}</h3>
            {trend !== 0 && (
              <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor(trend)}`}>
                {getTrendIcon(trend)}
                <span>{Math.abs(trend)}% {trendLabel}</span>
              </div>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

const ActiveFiltersIndicator = ({ filters, onClearFilter }) => {
  const getFilterDisplay = (key, value) => {
    if (!value || (key === 'timeframe' && value === 'month')) return null;
    
    const displayNames = {
      timeframe: 'Time Period',
      department: 'Department',
      severity: 'Severity',
      status: 'Status',
      start_date: 'Start Date',
      end_date: 'End Date'
    };
    
    const formatValue = (key, value) => {
      switch(key) {
        case 'timeframe':
          const timeframeMap = {
            'today': 'Today',
            'week': 'Last 7 Days',
            'month': 'Last 30 Days',
            'quarter': 'Last Quarter',
            'year': 'Last Year',
            'custom': 'Custom Range'
          };
          return timeframeMap[value] || value;
        case 'severity':
          return value.charAt(0).toUpperCase() + value.slice(1);
        case 'status':
          return value.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
        default:
          return value;
      }
    };
    
    return {
      key,
      displayName: displayNames[key],
      displayValue: formatValue(key, value)
    };
  };
  
  const activeFilters = Object.entries(filters)
    .map(([key, value]) => getFilterDisplay(key, value))
    .filter(f => f && f.displayValue);
  
  if (activeFilters.length === 0) return null;
  
  return (
    <div className="flex flex-wrap items-center gap-2 mb-2">
      <span className="text-sm text-gray-600 font-medium flex items-center">
        <Filter className="h-3.5 w-3.5 mr-1" />
        Active Filters:
      </span>
      {activeFilters.map((filter, index) => (
        <div
          key={index}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200"
        >
          <span className="font-medium">{filter.displayName}:</span>
          <span>{filter.displayValue}</span>
          <button
            onClick={() => onClearFilter(filter.key)}
            className="ml-1 text-blue-500 hover:text-blue-700"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      <button
        onClick={() => onClearFilter('all')}
        className="text-sm text-gray-500 hover:text-gray-700 font-medium"
      >
        Clear All
      </button>
    </div>
  );
};

const FilterPanel = ({ 
  filters, 
  availableFilters, 
  onApplyFilters, 
  onResetFilters,
  onClose,
  isOpen,
  loading = false
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [showCustomDate, setShowCustomDate] = useState(filters.timeframe === 'custom');

  useEffect(() => {
    setLocalFilters(filters);
    setShowCustomDate(filters.timeframe === 'custom');
  }, [filters, isOpen]);

  const handleFilterChange = useCallback((key, value) => {
    setLocalFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      if (key === 'timeframe') {
        setShowCustomDate(value === 'custom');
        if (value !== 'custom') {
          newFilters.start_date = null;
          newFilters.end_date = null;
        }
      }
      return newFilters;
    });
  }, []);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose?.();
  };

  const handleReset = () => {
    const resetFilters = {
      timeframe: 'month',
      department: '',
      severity: '',
      status: '',
      start_date: null,
      end_date: null
    };
    setLocalFilters(resetFilters);
    setShowCustomDate(false);
    onResetFilters(resetFilters);
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <LoadingSpinner text="Loading filter options..." />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Filter className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Dashboard Filters</h2>
                <p className="text-sm text-gray-600">Refine your dashboard view with filters</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Time Period</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableFilters.timeframes?.map((timeframe) => (
                <button
                  key={timeframe.value}
                  onClick={() => handleFilterChange('timeframe', timeframe.value)}
                  className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    localFilters.timeframe === timeframe.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {timeframe.label}
                </button>
              ))}
            </div>
          </div>

          {showCustomDate && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Start Date</label>
                <input
                  type="date"
                  value={localFilters.start_date || ''}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">End Date</label>
                <input
                  type="date"
                  value={localFilters.end_date || ''}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {availableFilters.departments?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Department</h3>
              <select
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={localFilters.department || ''}
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

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Severity Level</h3>
            <div className="flex flex-wrap gap-2">
              {availableFilters.severities?.map((severity) => (
                <button
                  key={severity.value}
                  onClick={() => handleFilterChange('severity', 
                    localFilters.severity === severity.value ? '' : severity.value
                  )}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                    localFilters.severity === severity.value
                      ? getStatusColor(severity.value)
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {severity.label}
                </button>
              ))}
            </div>
          </div>

          {availableFilters.statuses?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Status</h3>
              <div className="flex flex-wrap gap-2">
                {availableFilters.statuses.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleFilterChange('status', 
                      localFilters.status === status.value ? '' : status.value
                    )}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                      localFilters.status === status.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <button onClick={handleReset} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">
              Reset All
            </button>
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                Cancel
              </button>
              <button onClick={handleApply} className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const formatLabel = (name) => {
    const nameMap = {
      'successful_logins': 'Successful Logins',
      'failed_logins': 'Failed Logins',
      'created_incidents': 'Created Incidents',
      'resolved_incidents': 'Resolved Incidents',
      'total_incidents': 'Total Incidents',
      'completion_rate': 'Completion Rate'
    };
    return nameMap[name] || name;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <p className="font-medium text-gray-900 mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-gray-600">{formatLabel(entry.name)}:</span>
          </div>
          <span className="font-medium">
            {entry.name === 'completion_rate' ? `${entry.value}%` : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ==================== MAIN DASHBOARD COMPONENT ====================
export function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableFilters, setAvailableFilters] = useState({
    timeframes: [],
    departments: [],
    severities: [],
    statuses: []
  });
  const [filters, setFilters] = useState({
    timeframe: 'month',
    department: '',
    severity: '',
    status: '',
    start_date: null,
    end_date: null
  });
  const [showFilters, setShowFilters] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [filterLoading, setFilterLoading] = useState(false);

  // Format date function
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }, []);

  // Format chart date
  const formatChartDate = useCallback((dateString) => {
    if (!dateString) return '';
    try {
      if (dateString.includes('T')) {
        return new Date(dateString).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      }
      return dateString;
    } catch {
      return dateString;
    }
  }, []);

  // Transform incident trends data for frontend
  const transformIncidentTrends = useCallback((data) => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => ({
      date: formatChartDate(item.date),
      created_incidents: item.total_incidents || item.created_incidents || 0,
      resolved_incidents: item.resolved_incidents || 0,
      total_incidents: item.total_incidents || 0
    }));
  }, [formatChartDate]);

  // Transform training progress for frontend
  const transformTrainingProgress = useCallback((data) => {
    if (!data) return [];
    
    // For employee view
    if (data.user_progress && Array.isArray(data.user_progress)) {
      return data.user_progress.map(training => ({
        training_name: training.training_name,
        completion_rate: training.progress_percentage || 0,
        status: training.status,
        total_modules: training.total_modules,
        completed_modules: training.completed_modules
      }));
    }
    
    // For admin/manager view
    if (data.trainings_progress && Array.isArray(data.trainings_progress)) {
      return data.trainings_progress.map(training => ({
        training_name: training.training_name,
        completion_rate: training.completion_rate || 0,
        total_candidates: training.total_candidates,
        completed_candidates: training.completed_candidates
      }));
    }
    
    return [];
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async (customFilters = null) => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      
      const activeFilters = customFilters || filters;
      const params = new URLSearchParams();
      
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value && value !== '' && value !== null) {
          params.append(key, value);
        }
      });
      
      params.append('_t', Date.now());

      const data = await apiRequest('GET', `/reports/dashboard/?${params}`);
      
      console.log('Raw dashboard data:', data);
      
      // Transform data for frontend
      const transformedData = {
        ...data,
        incident_trends: transformIncidentTrends(data.incident_trends),
        training_progress_display: transformTrainingProgress(data.training_progress),
        // Ensure access trends have required fields
        access_trends: data.access_trends?.map(trend => ({
          date: formatChartDate(trend.date),
          successful_logins: trend.successful_logins || 0,
          failed_logins: trend.failed_logins || 0
        })) || [],
        // Ensure risk distribution has proper format
        risk_distribution: data.risk_distribution?.map(risk => ({
          ...risk,
          percentage: risk.percentage || (risk.count / (data.stats?.total_incidents || 1) * 100)
        })) || []
      };
      
      setDashboardData(transformedData);
      setLastRefresh(new Date());
      
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, filters, transformIncidentTrends, transformTrainingProgress, formatChartDate]);

  // Fetch available filters
  const fetchAvailableFilters = useCallback(async () => {
    try {
      setFilterLoading(true);
      const data = await apiRequest('GET', '/reports/dashboard/filters/');
      setAvailableFilters(data);
    } catch (err) {
      console.error('Failed to fetch filters:', err);
      setAvailableFilters({
        timeframes: [
          { value: 'today', label: 'Today' },
          { value: 'week', label: 'Last 7 Days' },
          { value: 'month', label: 'Last 30 Days' },
          { value: 'quarter', label: 'Last Quarter' },
          { value: 'year', label: 'Last Year' },
          { value: 'custom', label: 'Custom Range' }
        ],
        severities: [
          { value: 'critical', label: 'Critical' },
          { value: 'high', label: 'High' },
          { value: 'medium', label: 'Medium' },
          { value: 'low', label: 'Low' }
        ],
        statuses: [
          { value: 'pending', label: 'Pending' },
          { value: 'investigating', label: 'Investigating' },
          { value: 'assigned', label: 'Assigned' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'resolved', label: 'Resolved' },
          { value: 'closed', label: 'Closed' }
        ],
        departments: []
      });
    } finally {
      setFilterLoading(false);
    }
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    fetchDashboardData(newFilters);
  }, [fetchDashboardData]);

  // Handle filter reset
  const handleResetFilters = useCallback((resetFilters) => {
    setFilters(resetFilters);
    fetchDashboardData(resetFilters);
    toast.success('Filters reset successfully');
  }, [fetchDashboardData]);

  // Handle individual filter clear
  const handleClearFilter = useCallback((key) => {
    if (key === 'all') {
      handleResetFilters({
        timeframe: 'month',
        department: '',
        severity: '',
        status: '',
        start_date: null,
        end_date: null
      });
    } else {
      const newFilters = { ...filters, [key]: '' };
      if (key === 'start_date' || key === 'end_date') {
        newFilters.timeframe = 'month';
      }
      handleFilterChange(newFilters);
    }
  }, [filters, handleFilterChange, handleResetFilters]);

  // Refresh dashboard
  const handleRefresh = useCallback(() => {
    fetchDashboardData();
    toast.success('Dashboard refreshed');
  }, [fetchDashboardData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchDashboardData();
    fetchAvailableFilters();

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchDashboardData, fetchAvailableFilters]);

  // Calculate stats based on user role
  const stats = useMemo(() => {
    if (!dashboardData?.stats) return [];

    const statsData = dashboardData.stats;
    const role = user?.role || 'employee';

    // Helper to get training progress value
    const getTrainingProgressValue = () => {
      if (dashboardData?.training_progress?.user_progress?.length > 0) {
        const avgProgress = dashboardData.training_progress.overall_stats?.average_progress || 0;
        return Math.round(avgProgress);
      } else if (dashboardData?.training_progress?.trainings_progress?.length > 0) {
        const avgProgress = dashboardData.training_progress.overall_stats?.average_training_progress || 0;
        return Math.round(avgProgress);
      }
      return 0;
    };

    const statConfigs = {
      admin: [
        {
          title: 'Total Users',
          value: statsData.total_users || 0,
          icon: Users,
          color: 'blue'
        },
        {
          title: 'Active Users',
          value: statsData.active_users || 0,
          icon: Activity,
          color: 'green'
        },
        {
          title: 'Total Incidents',
          value: statsData.total_incidents || 0,
          icon: AlertTriangle,
          color: 'red'
        },
        {
          title: 'Compliance Score',
          value: statsData.compliance_score || 0,
          icon: Shield,
          color: 'purple',
          format: 'percentage'
        }
      ],
      hr_manager: [
        {
          title: 'Total Employees',
          value: statsData.total_users || 0,
          icon: Users,
          color: 'blue'
        },
        {
          title: 'Pending Approvals',
          value: statsData.pending_users || 0,
          icon: AlertCircle,
          color: 'yellow'
        },
        {
          title: 'Active Trainings',
          value: statsData.total_trainings || 0,
          icon: BookOpen,
          color: 'green'
        },
        {
          title: 'Compliance Score',
          value: statsData.compliance_score || 0,
          icon: Shield,
          color: 'purple',
          format: 'percentage'
        }
      ],
      security_analyst: [
        {
          title: 'Active Incidents',
          value: statsData.open_incidents || 0,
          icon: AlertTriangle,
          color: 'red'
        },
        {
          title: 'Critical Alerts',
          value: statsData.critical_incidents || 0,
          icon: Shield,
          color: 'orange'
        },
        {
          title: 'Risk Score',
          value: statsData.risk_score || 0,
          icon: TrendingDown,
          color: 'blue',
          format: 'percentage'
        },
        {
          title: 'Compliance Score',
          value: statsData.compliance_score || 0,
          icon: CheckCircle,
          color: 'green',
          format: 'percentage'
        }
      ],
      compliance_officer: [
        {
          title: 'Total Audits',
          value: statsData.total_audits || 0,
          icon: FileText,
          color: 'blue'
        },
        {
          title: 'Active Audits',
          value: statsData.active_audits || 0,
          icon: Activity,
          color: 'yellow'
        },
        {
          title: 'Compliance Score',
          value: statsData.compliance_score || 0,
          icon: Shield,
          color: 'green',
          format: 'percentage'
        },
        {
          title: 'Completed Audits',
          value: statsData.completed_audits || 0,
          icon: CheckCircle,
          color: 'purple'
        }
      ],
      employee: [
        {
          title: 'My Training Progress',
          value: getTrainingProgressValue(),
          icon: BookOpen,
          color: 'blue',
          format: 'percentage'
        },
        {
          title: 'My Trainings',
          value: statsData.total_trainings || 0,
          icon: Award,
          color: 'green'
        },
        {
          title: 'My Incidents',
          value: statsData.open_incidents || 0,
          icon: AlertTriangle,
          color: statsData.open_incidents > 0 ? 'red' : 'green'
        },
        {
          title: 'Compliance Status',
          value: statsData.compliance_score >= 80 ? 'Compliant' : 'Needs Review',
          icon: CheckCircle,
          color: statsData.compliance_score >= 80 ? 'green' : 'yellow'
        }
      ]
    };

    return statConfigs[role] || statConfigs.employee;
  }, [dashboardData, user]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).filter(
      ([key, value]) => value && value !== '' && key !== 'timeframe' && value !== 'month'
    ).length;
  }, [filters]);

  // Get role title
  const getRoleTitle = useMemo(() => {
    switch(user?.role) {
      case 'admin': return 'Security Command Center';
      case 'hr_manager': return 'HR Compliance Dashboard';
      case 'security_analyst': return 'Security Operations Dashboard';
      case 'compliance_officer': return 'Compliance Monitoring Center';
      case 'employee': return 'My Security Dashboard';
      default: return 'Security Dashboard';
    }
  }, [user]);

  // Get role badge color
  const getRoleBadgeColor = useMemo(() => {
    switch(user?.role) {
      case 'admin': return 'bg-red-100 text-red-700 border-red-200';
      case 'hr_manager': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'security_analyst': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'compliance_officer': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'employee': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }, [user]);

  // Format role display name
  const formatRoleName = useMemo(() => {
    if (!user?.role) return 'USER';
    return user.role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {getRoleTitle}
              </h1>
              <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getRoleBadgeColor}`}>
                <span className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5" />
                  {formatRoleName}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                {dashboardData?.generated_at ? (
                  <span>Last updated: {formatDate(dashboardData.generated_at)}</span>
                ) : (
                  <span>Loading data...</span>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full">
                  <Filter className="h-3.5 w-3.5" />
                  <span>{activeFiltersCount} active filter{activeFiltersCount !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Active Filters Indicator */}
        <ActiveFiltersIndicator 
          filters={filters}
          onClearFilter={handleClearFilter}
        />

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-blue-800">Real-time Security Intelligence Dashboard</p>
              <p className="text-gray-700 text-sm leading-relaxed">
                Monitor security metrics, track incidents, analyze trends, and maintain compliance across your organization. 
                All data is fetched in real-time from the security system.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard 
            key={index}
            loading={loading}
            {...stat}
          />
        ))}
      </div>

      {/* Charts Section - Only show for relevant roles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Access Trends - For all roles except employee (or show limited for employee) */}
        {(user?.role !== 'employee' || dashboardData?.access_trends?.length > 0) && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Access Activity Trends</h2>
                  <p className="text-gray-600 text-sm mt-1">Authentication patterns over time</p>
                </div>
                <LineChart className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            
            <div className="h-80">
              {loading ? (
                <LoadingSpinner size="lg" text="Loading access trends..." />
              ) : dashboardData?.access_trends?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardData.access_trends}>
                    <defs>
                      <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="successful_logins" 
                      stroke={COLORS.success} 
                      fill="url(#colorSuccess)"
                      name="Successful Logins"
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="failed_logins" 
                      stroke={COLORS.danger} 
                      fill="url(#colorFailed)"
                      name="Failed Logins"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState 
                  icon={LineChart}
                  title="No Access Data"
                  description="No authentication data available for the selected period."
                />
              )}
            </div>
          </div>
        )}

        {/* Risk Distribution */}
        {(user?.role !== 'employee' || dashboardData?.risk_distribution?.length > 0) && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Risk Distribution</h2>
                  <p className="text-gray-600 text-sm mt-1">Incident severity breakdown</p>
                </div>
                <PieChart className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            
            <div className="h-80">
              {loading ? (
                <LoadingSpinner size="lg" text="Loading risk data..." />
              ) : dashboardData?.risk_distribution?.length > 0 ? (
                <div className="flex flex-col lg:flex-row h-full">
                  <div className="lg:w-2/3 h-64 lg:h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={dashboardData.risk_distribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.risk_level?.toUpperCase() || 'Unknown'}: ${entry.count}`}
                          outerRadius={100}
                          innerRadius={40}
                          paddingAngle={2}
                          dataKey="count"
                        >
                          {dashboardData.risk_distribution.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={RISK_LEVEL_COLORS[entry.risk_level] || COLORS.gray} 
                              stroke="#fff"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="lg:w-1/3 lg:pl-6 mt-4 lg:mt-0">
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-900">Severity Breakdown</h3>
                      {dashboardData.risk_distribution.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: RISK_LEVEL_COLORS[entry.risk_level] || COLORS.gray }}
                            />
                            <span className="font-medium capitalize">{entry.risk_level || 'Unknown'}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">{entry.count}</div>
                            {entry.percentage && (
                              <div className="text-sm text-gray-600">
                                {entry.percentage.toFixed(1)}%
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {dashboardData.stats?.total_incidents && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-blue-900">Total Incidents</span>
                            <span className="font-bold text-blue-700">
                              {formatNumber(dashboardData.stats.total_incidents)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState 
                  icon={AlertTriangle}
                  title="No Risk Data"
                  description="No incident data available for risk analysis."
                />
              )}
            </div>
          </div>
        )}

        {/* Incident Trends */}
        {dashboardData?.incident_trends?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Incident Trends</h2>
                  <p className="text-gray-600 text-sm mt-1">Daily incident activity</p>
                </div>
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            
            <div className="h-80">
              {loading ? (
                <LoadingSpinner size="lg" text="Loading incident trends..." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={dashboardData.incident_trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="created_incidents" 
                      fill={COLORS.blue[500]} 
                      name="Created Incidents"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="resolved_incidents" 
                      fill={COLORS.success} 
                      name="Resolved Incidents"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total_incidents" 
                      stroke={COLORS.purple} 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Total Active"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* Training Progress */}
        {dashboardData?.training_progress_display?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Training Progress</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {user?.role === 'employee' ? 'My training completion' : 'Training completion rates'}
                  </p>
                </div>
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            
            <div className="h-80">
              {loading ? (
                <LoadingSpinner size="lg" text="Loading training data..." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBar 
                    data={dashboardData.training_progress_display}
                    layout={dashboardData.training_progress_display.length > 3 ? "vertical" : "horizontal"}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    {dashboardData.training_progress_display.length > 3 ? (
                      <YAxis dataKey="training_name" type="category" width={150} />
                    ) : (
                      <XAxis dataKey="training_name" />
                    )}
                    {dashboardData.training_progress_display.length > 3 ? (
                      <XAxis type="number" domain={[0, 100]} />
                    ) : (
                      <YAxis domain={[0, 100]} />
                    )}
                    <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
                    <Legend />
                    <Bar 
                      dataKey="completion_rate" 
                      fill={COLORS.success} 
                      name="Completion Rate (%)"
                      radius={[4, 4, 0, 0]}
                    />
                  </RechartsBar>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Department Performance - For admin, HR, security analyst */}
      {['admin', 'hr_manager', 'security_analyst'].includes(user?.role) && 
       dashboardData?.department_performance?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Department Performance</h2>
                <p className="text-gray-600 text-sm mt-1">Key metrics across all departments</p>
              </div>
              <Building className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-900">Department</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-900">Users</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-900">Active Incidents</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-900">Compliance</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-900">Training Rate</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-900">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.department_performance.map((dept, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{dept.department_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{formatNumber(dept.total_users)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                        dept.active_incidents > 10 ? 'bg-red-100 text-red-800' :
                        dept.active_incidents > 5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {dept.active_incidents}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium ${
                            dept.compliance_score >= 90 ? 'text-green-600' :
                            dept.compliance_score >= 80 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {formatPercentage(dept.compliance_score)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              dept.compliance_score >= 90 ? 'bg-green-500' :
                              dept.compliance_score >= 80 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(dept.compliance_score, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{formatPercentage(dept.training_completion_rate)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <SeverityBadge severity={dept.risk_level} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Activities */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
              <p className="text-gray-600 text-sm mt-1">Latest security events and user actions</p>
            </div>
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {loading ? (
            Array(5).fill(0).map((_, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-100 rounded animate-pulse"></div>
                </div>
              </div>
            ))
          ) : dashboardData?.recent_activities?.length > 0 ? (
            dashboardData.recent_activities.slice(0, 10).map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`p-2 rounded-lg ${getStatusColor(activity.severity)}`}>
                  {activity.severity === 'critical' || activity.severity === 'high' ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <Activity className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{activity.activity}</h4>
                    <SeverityBadge severity={activity.severity} size="sm" />
                  </div>
                  <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {activity.user}
                    </span>
                    <span>•</span>
                    <span>{formatDate(activity.timestamp)}</span>
                    <span>•</span>
                    <span className="text-blue-600 font-medium">{activity.category}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState 
              icon={Activity}
              title="No Recent Activities"
              description="No user activities recorded in the selected period."
            />
          )}
        </div>
      </div>

      {/* System Health - For admin and security analyst */}
      {['admin', 'security_analyst', 'compliance_officer'].includes(user?.role) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">System Health</h2>
                <p className="text-gray-600 text-sm mt-1">Status of security components and services</p>
              </div>
              <Server className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              Array(4).fill(0).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded w-24 animate-pulse"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
              ))
            ) : dashboardData?.system_health?.length > 0 ? (
              dashboardData.system_health.map((component, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getStatusColor(component.status)}`}>
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{component.component}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <SeverityBadge severity={component.status?.toLowerCase()} size="sm" />
                        {component.issues > 0 && (
                          <span className="text-xs text-red-600">
                            {component.issues} issue{component.issues !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{component.uptime}%</div>
                    <div className="text-xs text-gray-500">uptime</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState 
                  icon={Server}
                  title="No System Health Data"
                  description="System health metrics are not available."
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        availableFilters={availableFilters}
        onApplyFilters={handleFilterChange}
        onResetFilters={handleResetFilters}
        onClose={() => setShowFilters(false)}
        isOpen={showFilters}
        loading={filterLoading}
      />

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 pt-6 border-t border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              dashboardData?.system_health?.every(c => c.status === 'Operational' || c.status === 'Healthy') 
                ? 'bg-green-500' 
                : 'bg-yellow-500'
            }`} />
            <span>
              System Status: 
              <span className={`font-medium ml-1 ${
                dashboardData?.system_health?.every(c => c.status === 'Operational' || c.status === 'Healthy')
                  ? 'text-green-600'
                  : 'text-yellow-600'
              }`}>
                {dashboardData?.system_health?.every(c => c.status === 'Operational' || c.status === 'Healthy')
                  ? 'Operational'
                  : 'Partially Degraded'}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>Data updates every 5 minutes</span>
            <span>•</span>
            <span>
              Last refresh: {lastRefresh ? lastRefresh.toLocaleTimeString() : 'Never'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}