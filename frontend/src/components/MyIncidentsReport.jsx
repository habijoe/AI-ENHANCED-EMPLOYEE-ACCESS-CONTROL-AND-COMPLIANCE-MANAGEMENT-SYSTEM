import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Clock, CheckCircle, XCircle,
  Edit, Eye, Filter, Search, ChevronLeft,
  ChevronRight, ChevronsLeft, ChevronsRight, User,
  Building, Calendar, AlertCircle, Loader2,
  BarChart3, Shield, Activity, FileText,
  Download, ExternalLink, Bell, TrendingUp, RefreshCw
} from "lucide-react";
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const BASE_URL = 'http://127.0.0.1:8000';

export function MyIncidentsReports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState([]);
  const [statistics, setStatistics] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    severity: '',
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  });

  // Modal states
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Update form state
  const [updateForm, setUpdateForm] = useState({
    status: '',
    resolution_notes: '',
    priority: '',
    notes: ''
  });

  // Fetch assigned incidents on component mount
  useEffect(() => {
    fetchAssignedIncidents();
  }, [filters, pagination.currentPage, pagination.pageSize]);

  // Check if user has assigned incidents on mount
  useEffect(() => {
    checkAssignedIncidents();
  }, []);

  const checkAssignedIncidents = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BASE_URL}/incidents/assigned/check/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Assigned incidents check:', data);
        if (data.success && data.has_assigned_incidents) {
          toast.success(`You have ${data.total_assigned} assigned incident${data.total_assigned > 1 ? 's' : ''} to handle.`);
        } else {
          toast.success("You have no assigned incidents at the moment.");
        }
      }
    } catch (error) {
      console.error('Error checking assigned incidents:', error);
      toast.error('Failed to check assigned incidents');
    }
  };

  const fetchAssignedIncidents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      // Build query params
      const params = new URLSearchParams({
        page: pagination.currentPage,
        page_size: pagination.pageSize,
        ...filters
      });

      // Remove empty filters
      Object.keys(filters).forEach(key => {
        if (!filters[key]) params.delete(key);
      });

      // Remove sortBy if not needed
      if (filters.sortBy === 'created_at') {
        params.delete('sortBy');
      }

      const url = `${BASE_URL}/incidents/assigned/my-incidents/?${params}`;
      console.log('Fetching assigned incidents from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Assigned incidents response:', data);
      
      if (data.success) {
        // Ensure incidents data exists
        const incidentsData = data.incidents || [];
        
        // Transform incidents to ensure consistent structure
        const transformedIncidents = incidentsData.map(incident => ({
          id: incident.id,
          incident_number: incident.incident_number || `INC-${incident.id}`,
          title: incident.title || 'Untitled Incident',
          description: incident.description || '',
          status: incident.status || 'pending',
          severity: incident.severity || 'medium',
          priority: incident.priority || 'medium',
          risk_score: incident.risk_score || 0,
          created_at: incident.created_at,
          assigned_at: incident.assigned_at,
          sla_due_date: incident.sla_due_date,
          is_overdue: incident.is_overdue || false,
          overdue_hours: incident.overdue_hours || 0,
          department: incident.department_name || incident.department?.name || 'No Department',
          department_details: incident.department_details || {
            id: incident.department?.id,
            name: incident.department?.name || 'No Department'
          },
          assigned_to: incident.assigned_to_details || null,
          resolution_notes: incident.resolution_notes || '',
          danger_zone: incident.danger_zone || false,
          updated_at: incident.updated_at || incident.created_at
        }));

        setIncidents(transformedIncidents);
        
        setPagination(prev => ({
          ...prev,
          totalItems: data.pagination?.total_items || data.incidents?.length || 0,
          totalPages: data.pagination?.total_pages || 1
        }));

        // Set statistics if available
        if (data.statistics) {
          setStatistics(data.statistics);
        }
      } else {
        toast.error(data.error || 'Failed to load incidents');
        setIncidents([]);
        setPagination(prev => ({ ...prev, totalItems: 0, totalPages: 1 }));
      }
    } catch (error) {
      console.error('Error fetching assigned incidents:', error);
      toast.error('Failed to load assigned incidents');
      setIncidents([]);
      setPagination(prev => ({ ...prev, totalItems: 0, totalPages: 1 }));
    } finally {
      setLoading(false);
    }
  };

  const fetchIncidentStatistics = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BASE_URL}/incidents/statistics/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStatistics(data.statistics);
        }
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const openEditModal = (incident) => {
    console.log('Opening edit modal for incident:', incident);
    setSelectedIncident(incident);
    setUpdateForm({
      status: incident.status,
      resolution_notes: incident.resolution_notes || '',
      priority: incident.priority,
      notes: ''
    });
    setIsEditModalOpen(true);
  };

  const openDetailsModal = (incident) => {
    console.log('Opening details modal for incident:', incident);
    setSelectedIncident(incident);
    setIsDetailsModalOpen(true);
  };

  const closeModals = () => {
    setIsEditModalOpen(false);
    setIsDetailsModalOpen(false);
    setSelectedIncident(null);
    setUpdateForm({
      status: '',
      resolution_notes: '',
      priority: '',
      notes: ''
    });
  };

  const handleUpdateIncident = async () => {
    if (!selectedIncident || !updateForm.status) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsUpdating(true);
      const token = localStorage.getItem('access_token');
      
      // Prepare request body according to backend serializer
      const requestBody = {
        incident_id: selectedIncident.id,
        new_status: updateForm.status,
        resolution_notes: updateForm.resolution_notes || '',
        priority: updateForm.priority,
        notes: updateForm.notes || ''
      };

      console.log('Updating incident with data:', requestBody);

      const response = await fetch(`${BASE_URL}/incidents/assigned/update-status/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('Update response:', data);

      if (response.ok && data.success) {
        toast.success(data.message || 'Incident updated successfully!');
        closeModals();
        fetchAssignedIncidents(); // Refresh the list
        fetchIncidentStatistics(); // Refresh statistics
      } else {
        toast.error(data.error || data.message || 'Failed to update incident');
      }
    } catch (error) {
      console.error('Error updating incident:', error);
      toast.error('Failed to update incident');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      severity: '',
      search: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handlePageSizeChange = (size) => {
    setPagination(prev => ({ 
      ...prev, 
      pageSize: parseInt(size),
      currentPage: 1 
    }));
  };

  const getPageRange = (currentPage, totalPages) => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach(i => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  const getSeverityBadge = (severity) => {
    const config = {
      critical: { 
        color: 'bg-red-100 text-red-800 border border-red-200', 
        icon: <AlertTriangle className="h-3 w-3" />, 
        label: 'Critical' 
      },
      high: { 
        color: 'bg-orange-100 text-orange-800 border border-orange-200', 
        icon: <AlertTriangle className="h-3 w-3" />, 
        label: 'High' 
      },
      medium: { 
        color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', 
        icon: <AlertCircle className="h-3 w-3" />, 
        label: 'Medium' 
      },
      low: { 
        color: 'bg-blue-100 text-blue-800 border border-blue-200', 
        icon: <Shield className="h-3 w-3" />, 
        label: 'Low' 
      }
    };
    const cfg = config[severity?.toLowerCase()] || config.medium;
    return (
      <div className={`${cfg.color} px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5`}>
        {cfg.icon}
        <span>{cfg.label}</span>
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { 
        color: 'bg-gray-100 text-gray-800 border border-gray-200', 
        icon: <Clock className="h-3 w-3" />, 
        label: 'Pending' 
      },
      investigating: { 
        color: 'bg-blue-100 text-blue-800 border border-blue-200', 
        icon: <Search className="h-3 w-3" />, 
        label: 'Investigating' 
      },
      assigned: { 
        color: 'bg-purple-100 text-purple-800 border border-purple-200', 
        icon: <User className="h-3 w-3" />, 
        label: 'Assigned' 
      },
      in_progress: { 
        color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', 
        icon: <Activity className="h-3 w-3" />, 
        label: 'In Progress' 
      },
      resolved: { 
        color: 'bg-green-100 text-green-800 border border-green-200', 
        icon: <CheckCircle className="h-3 w-3" />, 
        label: 'Resolved' 
      },
      closed: { 
        color: 'bg-gray-100 text-gray-800 border border-gray-200', 
        icon: <CheckCircle className="h-3 w-3" />, 
        label: 'Closed' 
      },
      escalated: { 
        color: 'bg-red-100 text-red-800 border border-red-200', 
        icon: <AlertTriangle className="h-3 w-3" />, 
        label: 'Escalated' 
      }
    };
    const cfg = config[status?.toLowerCase()] || config.pending;
    return (
      <div className={`${cfg.color} px-3 py-1.5 rounded-full text-xs inline-flex items-center gap-1.5`}>
        {cfg.icon}
        <span>{cfg.label}</span>
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 30) return `${diffDays}d ago`;
      return formatDate(dateString);
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusOptions = (currentStatus) => {
    const transitions = {
      pending: ['investigating', 'assigned'],
      investigating: ['assigned', 'in_progress', 'pending'],
      assigned: ['in_progress', 'escalated', 'investigating'],
      in_progress: ['resolved', 'escalated', 'assigned'],
      resolved: ['closed', 'in_progress'],
      escalated: ['assigned', 'in_progress'],
      closed: []
    };
    
    return transitions[currentStatus] || [];
  };

  if (loading && !incidents.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your assigned incidents...</p>
        </div>
      </div>
    );
  }

  const pageRange = getPageRange(pagination.currentPage, pagination.totalPages);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Assigned Incidents</h1>
            <p className="text-gray-600 mt-1">Manage and update incidents assigned to you</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Clear Filters
            </button>
            <button
              onClick={fetchAssignedIncidents}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Assigned</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">{statistics.total || 0}</h3>
                  <p className="text-xs text-gray-500 mt-1">Incidents assigned to you</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100">
                  <AlertTriangle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-green-50 border border-green-100 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Open Incidents</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">{statistics.open || 0}</h3>
                  <p className="text-xs text-gray-500 mt-1">Requiring your attention</p>
                </div>
                <div className="p-3 rounded-lg bg-green-100">
                  <Bell className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-orange-50 border border-orange-100 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Overdue</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">{statistics.overdue || 0}</h3>
                  <p className="text-xs text-gray-500 mt-1">Past SLA deadline</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-100">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => {
                  setFilters({ ...filters, status: e.target.value });
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="investigating">Investigating</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="escalated">Escalated</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
              <select
                value={filters.severity}
                onChange={(e) => {
                  setFilters({ ...filters, severity: e.target.value });
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => {
                  setFilters({ ...filters, sortBy: e.target.value });
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created_at">Created Date</option>
                <option value="severity">Severity</option>
                <option value="priority">Priority</option>
                <option value="sla_due_date">SLA Due Date</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => {
                    setFilters({ ...filters, search: e.target.value });
                    setPagination(prev => ({ ...prev, currentPage: 1 }));
                  }}
                  placeholder="Search incidents..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {incidents.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assigned Incidents</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {loading ? 'Loading your incidents...' : 'You don\'t have any incidents assigned to you at the moment.'}
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Assigned Incidents</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{' '}
                    {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
                    {pagination.totalItems} incidents
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Show:</span>
                  <select
                    value={pagination.pageSize}
                    onChange={(e) => handlePageSizeChange(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Incident Details</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Severity</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Created</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">SLA Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {incidents.map((incident) => {
                    const isOverdue = incident.is_overdue;
                    const slaDueDate = incident.sla_due_date;
                    const isDueSoon = slaDueDate && !isOverdue &&
                      new Date(slaDueDate) < new Date(Date.now() + 24 * 60 * 60 * 1000);

                    return (
                      <tr key={incident.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${incident.severity === 'critical' ? 'bg-red-100 text-red-600' :
                              incident.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                                incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                  'bg-blue-100 text-blue-600'
                              }`}>
                              <AlertTriangle className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-gray-900 truncate">{incident.title}</div>
                              <div className="text-sm text-gray-500 truncate">{incident.incident_number}</div>
                              <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                                <Building className="h-3 w-3" />
                                {incident.department}
                              </div>
                              <div className="text-xs text-gray-400 mt-1 truncate">
                                {incident.description?.substring(0, 100) || 'No description'}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {getSeverityBadge(incident.severity)}
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(incident.status)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900">{formatDate(incident.created_at)}</div>
                          <div className="text-xs text-gray-500">{formatTimeAgo(incident.created_at)}</div>
                        </td>
                        <td className="py-4 px-6">
                          {slaDueDate ? (
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${isOverdue
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : isDueSoon
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                : 'bg-green-100 text-green-800 border border-green-200'
                              }`}>
                              <Clock className="h-3 w-3" />
                              <span>
                                {isOverdue ? 'Overdue' : isDueSoon ? 'Due soon' : 'Due'} {formatTimeAgo(slaDueDate)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">No SLA</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openDetailsModal(incident)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(incident)}
                              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Update Status"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    {pageRange.map((page, index) => (
                      page === '...' ? (
                        <span key={`dots-${index}`} className="px-3 py-1 text-gray-500">...</span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded-lg border transition-colors ${pagination.currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          {page}
                        </button>
                      )
                    ))}

                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Incident Modal */}
      {isEditModalOpen && selectedIncident && (
        <EditIncidentModal
          incident={selectedIncident}
          updateForm={updateForm}
          setUpdateForm={setUpdateForm}
          isUpdating={isUpdating}
          onUpdate={handleUpdateIncident}
          onClose={closeModals}
          getStatusOptions={getStatusOptions}
        />
      )}

      {/* Incident Details Modal */}
      {isDetailsModalOpen && selectedIncident && (
        <IncidentDetailsModal
          incident={selectedIncident}
          onClose={closeModals}
          getSeverityBadge={getSeverityBadge}
          getStatusBadge={getStatusBadge}
          formatDate={formatDate}
          formatTimeAgo={formatTimeAgo}
          openEditModal={() => {
            closeModals();
            openEditModal(selectedIncident);
          }}
        />
      )}
    </div>
  );
}

// Edit Incident Modal Component
function EditIncidentModal({
  incident,
  updateForm,
  setUpdateForm,
  isUpdating,
  onUpdate,
  onClose,
  getStatusOptions
}) {
  const statusOptions = getStatusOptions(incident.status);
  const requiresResolutionNotes = updateForm.status === 'resolved' || updateForm.status === 'closed';

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative z-10">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Update Incident</h2>
              <p className="text-gray-600 text-sm mt-1">
                {incident.incident_number}: {incident.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setUpdateForm({ ...updateForm, status })}
                    className={`p-3 border rounded-lg text-sm font-medium transition-all ${updateForm.status === status
                      ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                      : 'border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                  >
                    {status.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Current status: <span className="font-medium">{incident.status.toUpperCase()}</span>
              </p>
            </div>

            {/* Priority Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={updateForm.priority}
                onChange={(e) => setUpdateForm({ ...updateForm, priority: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Resolution Notes (Required for resolved/closed) */}
            {requiresResolutionNotes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution Notes <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">Required when resolving or closing</span>
                </label>
                <textarea
                  value={updateForm.resolution_notes}
                  onChange={(e) => setUpdateForm({ ...updateForm, resolution_notes: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe how the incident was resolved..."
                  required
                />
              </div>
            )}

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={updateForm.notes}
                onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any additional notes or context..."
              />
            </div>

            {/* Current Incident Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Current Incident Information</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Severity:</span>
                  <div className="font-medium">{incident.severity.toUpperCase()}</div>
                </div>
                <div>
                  <span className="text-gray-500">Risk Score:</span>
                  <div className="font-medium">{incident.risk_score}/100</div>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <div className="font-medium">{formatDate(incident.created_at)}</div>
                </div>
                <div>
                  <span className="text-gray-500">SLA Status:</span>
                  <div className={`font-medium ${incident.is_overdue ? 'text-red-600' : 'text-green-600'}`}>
                    {incident.is_overdue ? 'OVERDUE' : 'ON TRACK'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              onClick={onUpdate}
              disabled={isUpdating || !updateForm.status || (requiresResolutionNotes && !updateForm.resolution_notes)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Update Incident
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Incident Details Modal Component
function IncidentDetailsModal({
  incident,
  onClose,
  getSeverityBadge,
  getStatusBadge,
  formatDate,
  formatTimeAgo,
  openEditModal
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden relative z-10">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${incident.severity === 'critical' ? 'bg-red-100 text-red-600' :
                incident.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                  incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                }`}>
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{incident.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-sm text-gray-600">{incident.incident_number}</span>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-500">Created {formatTimeAgo(incident.created_at)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Status & Priority Card */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm font-medium text-gray-500 mb-2">Status & Priority</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Status:</span>
                  {getStatusBadge(incident.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Priority:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${incident.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    incident.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      incident.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                    }`}>
                    {incident.priority.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Severity & Risk Card */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm font-medium text-gray-500 mb-2">Severity & Risk</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Severity:</span>
                  {getSeverityBadge(incident.severity)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Risk Score:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${incident.risk_score > 80 ? 'bg-red-500' :
                          incident.risk_score > 60 ? 'bg-orange-500' :
                            incident.risk_score > 40 ? 'bg-yellow-500' :
                              'bg-green-500'
                          }`}
                        style={{ width: `${Math.min(incident.risk_score, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{incident.risk_score}/100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Card */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm font-medium text-gray-500 mb-2">Timeline</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Created:</span>
                  <span className="text-sm">{formatDate(incident.created_at)}</span>
                </div>
                {incident.assigned_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Assigned:</span>
                    <span className="text-sm">{formatDate(incident.assigned_at)}</span>
                  </div>
                )}
                {incident.sla_due_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">SLA Due:</span>
                    <span className={`text-sm font-medium ${incident.is_overdue ? 'text-red-600' : 'text-green-600'}`}>
                      {formatDate(incident.sla_due_date)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{incident.description}</p>
            </div>
          </div>

          {/* Resolution Notes (if any) */}
          {incident.resolution_notes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Resolution Notes</h3>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-green-700 whitespace-pre-wrap">{incident.resolution_notes}</p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Last updated: {formatTimeAgo(incident.updated_at || incident.created_at)}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onClose();
                  openEditModal();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Update Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function for date formatting
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Invalid Date';
  }
}

// Helper function for time ago formatting
function formatTimeAgo(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return formatDate(dateString);
  } catch {
    return 'Invalid Date';
  }
}