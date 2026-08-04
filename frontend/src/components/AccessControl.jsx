import React, { useState, useEffect } from "react";
import {
  X, Calendar, Activity, Clock, User, Shield, CheckCircle,
  XCircle, Search, Filter, Download, AlertCircle, RefreshCw,
  Eye, Lock, Unlock, Mail, Smartphone, Building, Globe,
  ChevronLeft, ChevronRight, BarChart, MoreVertical, TrendingUp,
  AlertTriangle, Loader2
} from "lucide-react";
import axios from "axios";

// API configuration
const API_BASE_URL = "http://127.0.0.1:8000";

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data || {});
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error("❌ Response interceptor error:", error);
    if (error.response?.status === 401) {
      console.warn("⚠️ Token expired or invalid, redirecting to login...");
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Access Control API functions
const accessControlAPI = {
  // Get statistics
  getStats: async () => {
    console.log("📊 Fetching stats from:", `${API_BASE_URL}/get_access_control_stats/`);
    try {
      const response = await api.get("/get_access_control_stats/");
      console.log("📊 Stats API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
      throw error;
    }
  },

  // Get users with filters
  getUsers: async (filters = {}) => {
    console.log("👥 Fetching users with filters:", filters);
    try {
      const response = await api.get("/get_users_for_access_control/", { params: filters });
      console.log("👥 Users API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      throw error;
    }
  },

  // Get user logs
  getUserLogs: async (userId, filters = {}) => {
    console.log("🚀 === GET USER LOGS API CALL ===");
    console.log("📌 User ID:", userId);
    console.log("🎛️ Filters:", filters);

    try {
      const response = await api.get(`/get_user_activity_logs/${userId}/`, {
        params: filters
      });

      console.log("✅ API RESPONSE RECEIVED");
      console.log("📊 Status:", response.status);
      console.log("📦 Full response data:", response.data);

      const logs = response.data.logs || [];
      const enrichedLogs = logs.map(log => ({
        ...log,
        risk_score: log.risk_score || calculateRiskScore(log),
        danger_level: log.danger_level || getDangerLevel(log.risk_score || calculateRiskScore(log))
      }));

      return {
        ...response.data,
        logs: enrichedLogs
      };

    } catch (error) {
      console.error("❌ API CALL FAILED");
      console.error("Error message:", error.message);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      throw error;
    }
  },

  // Update user status
  updateUserStatus: async (userId, action) => {
    console.log("🔄 Updating user status:", { userId, action });

    let endpoint = "";
    let method = "PUT";

    switch (action) {
      case "activate":
        endpoint = `/users/${userId}/activate/`;
        break;
      case "deactivate":
        endpoint = `/users/${userId}/deactivate/`;
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    try {
      const response = await api({ method, url: endpoint });
      console.log("✅ User status updated:", response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error ${action} user:`, error);
      throw error;
    }
  },

  // Create incident from log
  createIncidentFromLog: async (data) => {
    console.log("🚨 Creating incident with data:", data);
    console.log("📋 Incident data details:", {
      log_id: data.log_id,
      title: data.title,
      description_length: data.description?.length,
      severity: data.severity,
      priority: data.priority,
      assigned_to: data.assigned_to
    });

    try {
      const response = await api.post("/incidents/from-log/", data);
      console.log("✅ Full API Response:", response);
      console.log("📦 Response data:", response.data);
      console.log("🔍 Response status:", response.status);
      console.log("🔍 Response headers:", response.headers);
      return response.data;
    } catch (error) {
      console.error("❌ Incident creation failed:");
      console.error("Error object:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error headers:", error.response?.headers);
      throw error;
    }
  },

  // Get assignable users for incident assignment
  getAssignableUsers: async () => {
    console.log("👥 Fetching assignable users...");
    try {
      const response = await api.get("/incidents/assignable-users/");
      console.log("👥 Assignable users response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching assignable users:", error);
      throw error;
    }
  },

  // Test API connectivity
  testConnection: async () => {
    console.log("🔍 Testing API connectivity...");
    try {
      const response = await api.get("/health/");
      console.log("✅ API health check:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ API health check failed:", error);
      throw error;
    }
  }
};

// Helper function to calculate risk score based on activity
const calculateRiskScore = (log) => {
  const riskScores = {
    'login_failed': 85,
    'multiple_failed_logins': 95,
    'suspicious_activity': 75,
    'unauthorized_access': 90,
    'data_breach': 100,
    'password_change': 30,
    'profile_update': 20,
    'login': 10,
    'logout': 5,
    'view_user_logs': 40,
    'user_create': 50,
    'user_update': 35
  };

  const activity = log.activity?.toLowerCase() || '';
  for (const [key, score] of Object.entries(riskScores)) {
    if (activity.includes(key)) {
      return score;
    }
  }

  if (log.is_success === false) {
    return 70;
  }

  if (log.log_type === 'authentication') return 60;
  if (log.log_type === 'system') return 50;
  if (log.log_type === 'user_management') return 40;

  return 25;
};

// Helper function to get danger level
const getDangerLevel = (riskScore) => {
  if (riskScore >= 70) return 'high';
  if (riskScore >= 50) return 'medium';
  return 'low';
};

// Helper Components
const ActivityIcon = ({ activity }) => {
  const icons = {
    login: <Lock className="h-5 w-5 text-blue-600" />,
    logout: <Unlock className="h-5 w-5 text-gray-600" />,
    profile_update: <User className="h-5 w-5 text-green-600" />,
    password_change: <Shield className="h-5 w-5 text-purple-600" />,
    user_create: <User className="h-5 w-5 text-blue-600" />,
    user_update: <User className="h-5 w-5 text-yellow-600" />,
    department_create: <Building className="h-5 w-5 text-indigo-600" />,
    department_update: <Building className="h-5 w-5 text-orange-600" />,
    contact_us: <Mail className="h-5 w-5 text-pink-600" />,
    login_otp_request: <Smartphone className="h-5 w-5 text-teal-600" />,
    login_otp_verify: <CheckCircle className="h-5 w-5 text-green-600" />,
    view_user_logs: <Eye className="h-5 w-5 text-indigo-600" />,
    log_view: <Activity className="h-5 w-5 text-purple-600" />,
    default: <Activity className="h-5 w-5 text-gray-400" />
  };

  return icons[activity] || icons.default;
};

const StatusIcon = ({ isSuccess }) => {
  if (isSuccess) {
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  }
  return <XCircle className="h-5 w-5 text-red-500" />;
};

const RiskBadge = ({ score }) => {
  if (score < 20) {
    return (
      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
        Low Risk
      </span>
    );
  }
  if (score < 50) {
    return (
      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
        Medium Risk
      </span>
    );
  }
  return (
    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
      High Risk
    </span>
  );
};

const StatusBadge = ({ status }) => {
  if (status === "active") {
    return (
      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
        Active
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
        Pending
      </span>
    );
  }
  return (
    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
      Suspended
    </span>
  );
};

const UserAvatar = ({ user }) => {
  const getColorClass = (name) => {
    const colors = [
      "bg-blue-600", "bg-green-600", "bg-purple-600", "bg-red-600",
      "bg-yellow-600", "bg-indigo-600", "bg-pink-600", "bg-teal-600"
    ];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`w-10 h-10 rounded-full ${getColorClass(user?.name)} flex items-center justify-center text-white font-medium`}>
      {getInitials(user?.name)}
    </div>
  );
};

const LoadingSpinner = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <p className="mt-4 text-gray-600 font-medium">{text}</p>
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
    <div className="flex items-start gap-3">
      <AlertCircle className="h-6 w-6 text-red-600 mt-0.5" />
      <div className="flex-1">
        <h3 className="font-bold text-red-800 text-lg mb-1">Error loading data</h3>
        <p className="text-red-700 mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  </div>
);

// Helper Functions
const formatActivityName = (activity) => {
  if (!activity) return 'Unknown Activity';
  return activity
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

const formatDate = (dateString) => {
  if (!dateString) return 'No Date';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Date Error';
  }
};

// User Logs Modal Component
const UserLogsModal = ({ user, isOpen, onClose, accessControlAPI, onCreateIncident }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [filters, setFilters] = useState({
    activity: '',
    log_type: '',
    date_from: '',
    date_to: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUserLogs = async () => {
    if (!user || !isOpen) {
      console.log("❌ Cannot fetch logs: No user or modal not open");
      return;
    }

    console.log("🔄 ===== STARTING FETCH USER LOGS =====");
    console.log("👤 User:", user);
    console.log("🆔 User ID:", user.id);

    setLoading(true);
    setError(null);

    try {
      const response = await accessControlAPI.getUserLogs(user.id, filters);
      console.log("✅ API Response received:", response);

      if (response.success) {
        setLogs(response.logs || []);
        setSummary(response.summary || {
          total_logs: response.logs?.length || 0,
          successful_logs: (response.logs?.filter(log => log.is_success) || []).length,
          failed_logs: (response.logs?.filter(log => !log.is_success) || []).length,
          success_rate: response.logs?.length ?
            Math.round(((response.logs?.filter(log => log.is_success) || []).length / response.logs.length) * 100) : 0,
          top_activities: []
        });
      } else {
        throw new Error(response.error || "Failed to fetch logs");
      }

    } catch (error) {
      console.error("❌ Error fetching logs:", error);
      setError(error.message || "Failed to fetch logs");
      setLogs([]);
      setSummary({
        total_logs: 0,
        successful_logs: 0,
        failed_logs: 0,
        success_rate: 0,
        top_activities: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchUserLogs();
    }
  }, [isOpen, user]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      activity: '',
      log_type: '',
      date_from: '',
      date_to: ''
    });
    setSearchQuery('');
  };

  const applyFilters = () => {
    fetchUserLogs();
  };

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      (log.description?.toLowerCase() || '').includes(searchLower) ||
      (log.activity?.toLowerCase() || '').includes(searchLower) ||
      (log.endpoint?.toLowerCase() || '').includes(searchLower) ||
      (log.ip_address?.toLowerCase() || '').includes(searchLower) ||
      (log.user_email?.toLowerCase() || '').includes(searchLower)
    );
  });

  const recentLogs = [...filteredLogs]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  const displayLogs = showAllLogs ? filteredLogs : recentLogs;

  const isHighOrMediumRisk = (log) => {
    const riskScore = log.risk_score || 0;
    return riskScore >= 50;
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75" onClick={onClose}></div>

      <div className="relative z-50 w-full max-w-7xl bg-white shadow-2xl rounded-lg overflow-hidden max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">User Activity Logs</h2>
                <div className="flex items-center gap-2 mt-1 text-blue-100 text-sm">
                  <User className="h-3 w-3" />
                  <span className="font-medium">{user.name}</span>
                  <span className="text-blue-200">•</span>
                  <span>{user.email}</span>
                  <span className="text-blue-200">•</span>
                  <span className="capitalize">{user.role?.replace(/_/g, ' ')}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchUserLogs}
                disabled={loading}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh Logs"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {summary && !loading && (
          <div className="px-6 py-4 bg-gray-50 border-b flex-shrink-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Activities</p>
                    <p className="text-xl font-bold text-gray-800">{summary.total_logs}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</p>
                    <p className="text-xl font-bold text-gray-800">{summary.success_rate}%</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100 text-red-700">
                    <XCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Failed Activities</p>
                    <p className="text-xl font-bold text-gray-800">{summary.failed_logs}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Top Activity</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {summary.top_activities?.[0]?.activity
                        ? formatActivityName(summary.top_activities[0].activity)
                        : filteredLogs.length > 0
                          ? formatActivityName(filteredLogs[0].activity)
                          : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="px-6 py-4 bg-white border-b flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Filters & Search</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors font-medium border border-gray-300"
              >
                Clear All
              </button>
              <button
                onClick={applyFilters}
                disabled={loading}
                className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2 disabled:opacity-50 font-medium shadow-sm"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                Apply Filters
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">Activity Type</label>
              <select
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={filters.activity}
                onChange={(e) => handleFilterChange('activity', e.target.value)}
              >
                <option value="">All Activities</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="profile_update">Profile Update</option>
                <option value="password_change">Password Change</option>
                <option value="user_create">User Creation</option>
                <option value="user_update">User Update</option>
                <option value="view_user_logs">View User Logs</option>
                <option value="log_view">Log View</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">Log Category</label>
              <select
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={filters.log_type}
                onChange={(e) => handleFilterChange('log_type', e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="authentication">Authentication</option>
                <option value="profile">Profile</option>
                <option value="user_management">User Management</option>
                <option value="system">System</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">Date From</label>
              <input
                type="date"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">Date To</label>
              <input
                type="date"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">Search Logs</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by description, IP, endpoint..."
                className="w-full pl-9 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-red-800 text-sm mb-1">Error Loading Data</h3>
                  <p className="text-red-700 text-sm mb-3">{error}</p>
                  <button onClick={fetchUserLogs} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-xs font-medium transition-colors shadow-sm">
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium text-sm">Loading activity logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-lg border border-gray-200">
              <Eye className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Activity Logs Found</h3>
              <p className="text-gray-600 text-sm">
                {searchQuery || filters.activity || filters.date_from
                  ? "Try changing your search or filters"
                  : "No activity logs recorded for this user yet"}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-800">
                    {showAllLogs ? 'All Activity Logs' : 'Recent Activity (Top 5)'}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Showing <span className="font-semibold">{displayLogs.length}</span> of <span className="font-semibold">{filteredLogs.length}</span> logs
                  </p>
                </div>
                {filteredLogs.length > 5 && (
                  <button
                    onClick={() => setShowAllLogs(!showAllLogs)}
                    className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2 font-medium shadow-sm"
                  >
                    <BarChart className="h-3 w-3" />
                    {showAllLogs ? 'Show Top 5 Only' : `View All ${filteredLogs.length} Logs`}
                  </button>
                )}
              </div>

              <div className="overflow-hidden border border-gray-200 rounded-lg bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Activity</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Time</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">IP Address</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Risk Score</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {displayLogs.map((log, index) => {
                        const riskScore = log.risk_score || 0;
                        const isRiskLog = riskScore >= 50;

                        return (
                          <tr key={log.id || index} className={`hover:bg-blue-50 transition-colors ${isRiskLog ? 'bg-red-50' : ''}`}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <ActivityIcon activity={log.activity} />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{formatActivityName(log.activity)}</div>
                                  <div className="text-xs text-gray-500 capitalize">{log.log_type?.replace('_', ' ') || 'N/A'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="max-w-xs">
                                <div className="text-sm text-gray-900">{log.description || 'No description'}</div>
                                {log.endpoint && <div className="text-xs text-gray-600 truncate mt-1 font-mono">{log.endpoint}</div>}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <div className="text-sm text-gray-900 font-medium">{formatDate(log.timestamp)}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Globe className="h-3 w-3 text-gray-400" />
                                <span className="text-sm text-gray-900 font-mono">{log.ip_address || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div className={`h-2 rounded-full ${riskScore < 20 ? "bg-green-500" : riskScore < 50 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${Math.min(riskScore, 100)}%` }}></div>
                                  </div>
                                  <span className="text-xs font-bold">{riskScore}</span>
                                </div>
                                <RiskBadge score={riskScore} />
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <StatusIcon isSuccess={log.is_success} />
                                <span className={`text-xs font-bold px-2 py-1 rounded ${log.is_success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {log.is_success ? 'Success' : 'Failed'}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {isRiskLog && (
                                <button
                                  onClick={() => onCreateIncident && onCreateIncident(log)}
                                  className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center gap-1 font-medium shadow-sm"
                                  title="Create Incident from this log"
                                >
                                  <AlertTriangle className="h-3 w-3" />
                                  Create Incident
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-800 border-t flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-300">
              <span className="font-medium">{user.name}</span>
              <span className="mx-2">•</span>
              <span className="capitalize">{user.role}</span>
              <span className="mx-2">•</span>
              <span className="text-gray-400">{user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(logs, null, 2);
                  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                  const exportFileDefaultName = `user_${user.id}_logs_${new Date().toISOString().split('T')[0]}.json`;
                  const linkElement = document.createElement('a');
                  linkElement.setAttribute('href', dataUri);
                  linkElement.setAttribute('download', exportFileDefaultName);
                  linkElement.click();
                }}
                disabled={logs.length === 0}
                className="px-4 py-2 text-xs bg-white hover:bg-gray-100 text-gray-800 rounded-md transition-colors flex items-center gap-2 font-medium border border-gray-300 disabled:opacity-50"
              >
                <Download className="h-3 w-3" />
                Export JSON
              </button>
              <button onClick={onClose} className="px-4 py-2 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors font-medium">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create Incident Modal Component
const CreateIncidentModal = ({ log, formData, setFormData, assignableUsers, isCreating, onCreate, onClose }) => {
  // Log when modal props change
  useEffect(() => {
    console.log("📝 CreateIncidentModal - Form data updated:", formData);
  }, [formData]);

  useEffect(() => {
    console.log("🎯 CreateIncidentModal - Log data:", log);
  }, [log]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-red-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create Incident from Danger Log</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Risk Score: <span className="font-bold text-red-600">{log?.risk_score || 0}/100</span>
                  {' • '}
                  Danger Level: <span className="font-bold capitalize text-red-600">{log?.danger_level || 'medium'}</span>
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {/* Log Summary */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Source Log Information</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">User:</span>
                  <div className="font-medium">{log?.user_email || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-gray-500">Activity:</span>
                  <div className="font-medium">{log?.activity || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-gray-500">IP Address:</span>
                  <div className="font-mono text-sm">{log?.ip_address || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-gray-500">Timestamp:</span>
                  <div>{log?.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Incident Form */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter incident title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={8}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter incident description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign To (Optional)</label>
              <select
                value={formData.assigned_to || ''}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value || null })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {assignableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.name} ({user.email}) - {user.role}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onCreate}
              disabled={isCreating || !formData.title || !formData.description}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  Create Incident
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Access Control Dashboard Component
export function AccessControl() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ role: "", status: "" });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showCreateIncidentModal, setShowCreateIncidentModal] = useState(false);
  const [selectedLogForIncident, setSelectedLogForIncident] = useState(null);
  const [incidentFormData, setIncidentFormData] = useState({
    title: '',
    description: '',
    severity: 'medium',
    priority: 'medium',
    assigned_to: null
  });
  const [creatingIncident, setCreatingIncident] = useState(false);
  const [assignableUsers, setAssignableUsers] = useState([]);

  // Generate incident description from log data
  const generateIncidentDescription = (log) => {
    return `
🚨 INCIDENT FROM DANGER ZONE LOG
${'='.repeat(60)}

RISK ASSESSMENT:
- Risk Score: ${log?.risk_score || 0}/100
- Danger Level: ${log?.danger_level?.toUpperCase() || 'MEDIUM'}
- Detection Time: ${new Date().toLocaleString()}

USER INFORMATION:
- Email: ${log?.user_email || 'N/A'}
- IP Address: ${log?.ip_address || 'N/A'}

ACTIVITY DETAILS:
- Activity Type: ${log?.activity || 'Unknown'}
- Endpoint: ${log?.endpoint || 'N/A'}
- Timestamp: ${log?.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}

DESCRIPTION:
${log?.description || 'No description available'}

${'='.repeat(60)}
RECOMMENDED ACTION:
Review and investigate immediately.
    `.trim();
  };

  // Fetch assignable users for incident assignment
  const fetchAssignableUsers = async () => {
    console.log("👥 Fetching assignable users...");
    try {
      const response = await accessControlAPI.getAssignableUsers();
      console.log("✅ Assignable users fetched:", response);
      if (response.success) {
        setAssignableUsers(response.users || []);
        console.log(`📊 Loaded ${response.users?.length || 0} assignable users`);
      } else {
        console.warn("⚠️ Failed to fetch assignable users:", response.error);
      }
    } catch (error) {
      console.error('❌ Error fetching assignable users:', error);
    }
  };

  // Open create incident modal from a specific log
  const openCreateIncidentModal = (log) => {
    console.log('🚪 Opening Create Incident Modal');
    console.log('📋 Log data received:', log);
    console.log('🆔 Log ID:', log?.id);
    console.log('📊 Log risk score:', log?.risk_score);
    console.log('⚠️ Log danger level:', log?.danger_level);

    setSelectedLogForIncident(log);

    // Pre-fill form based on log risk score
    const riskScore = log?.risk_score || 0;
    let defaultSeverity = 'medium';
    let defaultPriority = 'medium';

    if (riskScore >= 85) {
      defaultSeverity = 'critical';
      defaultPriority = 'urgent';
    } else if (riskScore >= 70) {
      defaultSeverity = 'high';
      defaultPriority = 'high';
    } else if (riskScore >= 50) {
      defaultSeverity = 'medium';
      defaultPriority = 'medium';
    } else {
      defaultSeverity = 'low';
      defaultPriority = 'low';
    }

    console.log('🎯 Derived severity:', defaultSeverity);
    console.log('🎯 Derived priority:', defaultPriority);

    // Generate default title and description
    const defaultTitle = `[${log?.danger_level?.toUpperCase() || 'MEDIUM'}] ${log?.activity || 'Security Incident'}: ${log?.user_email || 'Unknown User'}`;
    const defaultDescription = generateIncidentDescription(log);

    console.log('📝 Generated title:', defaultTitle);
    console.log('📝 Generated description length:', defaultDescription.length);

    const newFormData = {
      title: defaultTitle,
      description: defaultDescription,
      severity: defaultSeverity,
      priority: defaultPriority,
      assigned_to: null
    };

    console.log('📦 Setting form data:', newFormData);
    setIncidentFormData(newFormData);

    console.log('👥 Fetching assignable users for the modal...');
    fetchAssignableUsers();

    console.log('🔓 Opening modal...');
    setShowCreateIncidentModal(true);
  };

  // Handle incident creation
  const handleCreateIncident = async () => {
    console.log('🚀 Starting incident creation process...');
    console.log('📋 Selected log:', selectedLogForIncident);
    console.log('📝 Form data:', incidentFormData);

    if (!selectedLogForIncident) {
      console.error('❌ No log selected for incident creation');
      alert('No log selected for incident creation');
      return;
    }

    if (!incidentFormData.title || !incidentFormData.description) {
      console.error('❌ Missing title or description');
      alert('Please provide title and description');
      return;
    }

    setCreatingIncident(true);

    try {
      const incidentData = {
        log_id: selectedLogForIncident.id,
        title: incidentFormData.title,
        description: incidentFormData.description,
        severity: incidentFormData.severity,
        priority: incidentFormData.priority,
        assigned_to: incidentFormData.assigned_to
      };

      console.log('📤 Sending incident data to API:', incidentData);
      console.log('📤 API endpoint: /incidents/from-log/');

      const response = await accessControlAPI.createIncidentFromLog(incidentData);

      console.log('🎉 SUCCESS! Full response received:', response);
      console.log('📊 Response type:', typeof response);
      console.log('🔑 Response keys:', Object.keys(response));

      if (response && response.success) {
        const incidentNumber = response.incident?.incident_number || 'Unknown';
        const successMessage = `✅ Incident ${incidentNumber} created successfully!`;
        console.log(successMessage);
        console.log('📋 Created incident details:', response.incident);
        alert(successMessage);

        // Reset form and close modal
        setShowCreateIncidentModal(false);
        setSelectedLogForIncident(null);
        setIncidentFormData({
          title: '',
          description: '',
          severity: 'medium',
          priority: 'medium',
          assigned_to: null
        });

        console.log('🔄 Modal closed and form reset');

        // Optionally refresh the logs or show a success notification
        if (selectedUser && showLogsModal) {
          console.log('🔄 Refreshing user logs...');
          // You could trigger a refresh of the logs here if needed
        }
      } else {
        const errorMsg = response?.error || 'Failed to create incident';
        console.error('❌ API returned success=false:', errorMsg);
        console.error('📋 Full response:', response);
        alert(errorMsg);
      }

    } catch (error) {
      console.error('🔥 CATCH BLOCK - Error creating incident:');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Full error object:', error);

      if (error.response) {
        console.error('📡 Error response data:', error.response.data);
        console.error('📡 Error response status:', error.response.status);
        console.error('📡 Error response headers:', error.response.headers);

        const errorMessage = error.response.data?.error ||
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
        alert(errorMessage);
      } else if (error.request) {
        console.error('📡 No response received:', error.request);
        alert('No response from server. Please check if the backend is running.');
      } else {
        console.error('📡 Request setup error:', error.message);
        alert(`Error: ${error.message}`);
      }
    } finally {
      setCreatingIncident(false);
      console.log('🏁 Incident creation process completed');
    }
  };

  // Fetch stats data
  const fetchStats = async () => {
    console.log("📊 Fetching stats...");
    try {
      const response = await accessControlAPI.getStats();
      console.log("📊 Stats response:", response);
      if (response.success) {
        setStats(response.data);
        console.log("✅ Stats loaded successfully");
      } else {
        throw new Error(response.error || "Failed to fetch stats");
      }
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
      setError(error.message);
    }
  };

  // Fetch users data
  const fetchUsers = async () => {
    console.log("👥 Fetching users with filters:", { searchQuery, filters });
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (filters.role) params.append("role", filters.role);
      if (filters.status) params.append("status", filters.status);

      const response = await accessControlAPI.getUsers(params);
      console.log("👥 Users response:", response);
      if (response.success) {
        setUsers(response.data);
        console.log(`✅ Loaded ${response.data?.length || 0} users`);
      } else {
        throw new Error(response.error || "Failed to fetch users");
      }
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      setError(error.message);
    }
  };

  // Load all data
  const loadData = async () => {
    console.log("🔄 Loading all data...");
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchStats(), fetchUsers()]);
      console.log("✅ All data loaded successfully");
    } catch (error) {
      console.error("❌ Error loading data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    console.log("🔄 Manual refresh triggered");
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    console.log("✅ Refresh completed");
  };

  // Test API connection on mount
  useEffect(() => {
    const testConnection = async () => {
      console.log("🔍 Testing API connection...");
      try {
        await accessControlAPI.testConnection();
        console.log("✅ API connection successful");
      } catch (error) {
        console.warn("⚠️ API connection test failed, but continuing...");
      }
    };
    testConnection();
  }, []);

  // Initial data load
  useEffect(() => {
    loadData();
  }, []);

  // Filter users based on search and filters
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) {
        fetchUsers();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, filters]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    console.log(`🔍 Filter changed: ${filterType} = ${value}`);
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  // Handle view logs
  const handleViewLogs = (user) => {
    console.log("👁️ VIEWING LOGS FOR USER:", user);
    console.log("👤 User ID:", user.id);
    console.log("👤 User name:", user.name);
    console.log("👤 User email:", user.email);
    setSelectedUser(user);
    setShowLogsModal(true);
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8 bg-white">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Access Control Management</h1>
            <p className="text-gray-600 mt-2">Real-time user access monitoring and management</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
        </div>

        {/* Requirements Description */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="font-medium text-blue-800">Live Data Dashboard</p>
              <p className="text-gray-700">
                <strong>Real-time Monitoring:</strong> This dashboard displays live data from your Django backend.
                All user statistics, access logs, and risk assessments are updated in real-time.
                Click refresh to get the latest data or use filters to drill down into specific user groups.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.total_users}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-50 text-green-600">
                <Unlock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.active_users}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-red-50 text-red-600">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Suspended Users</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.suspended_users}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Recent Activity</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.recent_activity_count}</h3>
                <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                placeholder="Search by name, email, or department..."
                className="pl-10 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
            <select
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="hr_manager">HR Manager</option>
              <option value="security_analyst">Security Analyst</option>
              <option value="compliance_officer">Compliance Officer</option>
              <option value="employee">Employee</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">User Directory</h2>
              <p className="text-gray-600 mt-1">
                Showing {users.length} user{users.length !== 1 ? "s" : ""}
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>
            {error && (
              <div className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>
        </div>

        {loading && !refreshing ? (
          <div className="p-12">
            <LoadingSpinner text="Loading users..." />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No users found</h3>
            <p className="text-gray-500">
              {searchQuery || filters.role || filters.status
                ? "Try changing your search or filters"
                : "No users in the system yet"}
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Last Login</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Risk Score</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={user} />
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {user.role === "admin" && <Shield className="h-4 w-4 text-blue-600" />}
                          <span className="capitalize text-gray-700">{user.role?.replace(/_/g, ' ')}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{user.department || 'No Department'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{user.last_login_display || 'Never'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${user.risk_score < 20 ? "bg-green-500" : user.risk_score < 50 ? "bg-yellow-500" : "bg-red-500"}`}
                              style={{ width: `${Math.min(user.risk_score || 0, 100)}%` }}
                            ></div>
                          </div>
                          <div className="w-12 text-right font-medium text-gray-700">{user.risk_score || 0}</div>
                          <RiskBadge score={user.risk_score || 0} />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewLogs(user)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1.5 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                            title="View Activity Logs"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Logs</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Additional Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Multi-Factor Authentication</h2>
              <p className="text-gray-600 mt-1">MFA adoption across organization</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Enabled</span>
                <span className="font-medium text-gray-900">
                  {stats.mfa_enabled_count} users ({stats.mfa_enabled_percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${stats.mfa_enabled_percentage}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Role Distribution</h2>
              <p className="text-gray-600 mt-1">Users by role category</p>
            </div>
            <div className="space-y-3">
              {stats.role_distribution?.map((role) => (
                <div key={role.role} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="flex-1 capitalize text-gray-700">{role.role?.replace('_', ' ')}</span>
                  <span className="font-medium text-gray-900">{role.count}</span>
                  <span className="text-sm text-gray-500">({Math.round((role.count / stats.total_users) * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Last Updated */}
      {stats && (
        <div className="text-center text-sm text-gray-500">
          <p>Data last updated: {new Date(stats.last_updated).toLocaleString()}</p>
        </div>
      )}

      {/* User Logs Modal */}
      {showLogsModal && (
        <UserLogsModal
          user={selectedUser}
          isOpen={showLogsModal}
          onClose={() => {
            setShowLogsModal(false);
            setSelectedUser(null);
          }}
          accessControlAPI={accessControlAPI}
          onCreateIncident={openCreateIncidentModal}
        />
      )}

      {/* Create Incident Modal */}
      {showCreateIncidentModal && selectedLogForIncident && (
        <CreateIncidentModal
          log={selectedLogForIncident}
          formData={incidentFormData}
          setFormData={setIncidentFormData}
          assignableUsers={assignableUsers}
          isCreating={creatingIncident}
          onCreate={handleCreateIncident}
          onClose={() => {
            console.log("🔒 Closing Create Incident Modal");
            setShowCreateIncidentModal(false);
            setSelectedLogForIncident(null);
          }}
        />
      )}
    </div>
  );
}

export default AccessControl;