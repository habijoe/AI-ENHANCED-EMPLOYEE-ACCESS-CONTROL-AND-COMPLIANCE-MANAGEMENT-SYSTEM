import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  FileText,
  Download,
  Calendar,
  AlertCircle,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Shield,
  Activity,
  AlertOctagon,
  UserCheck,
  Loader2,
  Save,
  MessageSquare,
  Flag,
  FileWarning,
  Database,
  Zap,
  Target,
  TrendingUp,
  TrendingDown,
  Server,
  ShieldCheck,
  ShieldX,
  FilterX,
  Sparkles,
  Layers,
  ArrowUpDown,
  Clock as ClockIcon,
  BarChart3,
  PieChart as PieChartIcon,
  Settings,
  Link,
  Mail,
  User,
  Building,
  MoreHorizontal,
  Check,
  X,
  AlertCircle as AlertIcon
} from "lucide-react";
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const base_url = 'http://127.0.0.1:8000';

// ============================================================
// API HELPER FUNCTIONS
// ============================================================

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

    const response = await fetch(`${base_url}${endpoint}`, options);

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

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('JSON parse error:', jsonError);
      throw new Error('Invalid JSON response from server');
    }

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

    if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
      throw new Error('Server returned invalid response format.');
    }

    throw error;
  }
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

const getIncidentId = (incident) => {
  if (!incident) return null;
  if (incident.incident_id !== undefined) return incident.incident_id;
  if (incident.id !== undefined) return incident.id;
  if (incident.pk !== undefined) return incident.pk;
  return null;
};

const safeRender = (value, defaultValue = '') => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'object') return defaultValue;
  return String(value);
};

const showToast = (message, type = 'success') => {
  if (type === 'success') {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: '#fff',
        borderRadius: '12px',
      },
    });
  } else {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#EF4444',
        color: '#fff',
        borderRadius: '12px',
      },
    });
  }
};

// ============================================================
// BADGE COMPONENTS
// ============================================================

const SeverityBadge = ({ severity }) => {
  const config = {
    critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: <AlertOctagon className="h-3.5 w-3.5" />, label: 'Critical' },
    high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: <AlertTriangle className="h-3.5 w-3.5" />, label: 'High' },
    medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: <AlertCircle className="h-3.5 w-3.5" />, label: 'Medium' },
    low: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: <Shield className="h-3.5 w-3.5" />, label: 'Low' }
  };
  const cfg = config[severity?.toLowerCase()] || config.medium;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const config = {
    pending: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: <ClockIcon className="h-3.5 w-3.5" />, label: 'Pending' },
    investigating: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: <Search className="h-3.5 w-3.5" />, label: 'Investigating' },
    assigned: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: <UserCheck className="h-3.5 w-3.5" />, label: 'Assigned' },
    in_progress: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: <Activity className="h-3.5 w-3.5" />, label: 'In Progress' },
    resolved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: <CheckCircle className="h-3.5 w-3.5" />, label: 'Resolved' },
    closed: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: <CheckCircle className="h-3.5 w-3.5" />, label: 'Closed' },
    escalated: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: <AlertTriangle className="h-3.5 w-3.5" />, label: 'Escalated' }
  };
  const cfg = config[status?.toLowerCase()] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const config = {
    urgent: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Urgent' },
    high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'High' },
    medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Medium' },
    low: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', label: 'Low' }
  };
  const cfg = config[priority?.toLowerCase()] || config.medium;
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
};

// ============================================================
// LOADING & EMPTY STATES
// ============================================================

const LoadingState = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-gray-600 mx-auto"></div>
      <p className="mt-4 text-sm text-gray-500">Loading incidents...</p>
    </div>
  </div>
);

const EmptyState = ({ title, description, icon: Icon = AlertTriangle }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
      <Icon className="h-8 w-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 max-w-md mx-auto text-sm">{description}</p>
  </div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================

export function IncidentsReports() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("incidents");
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [dangerZoneLogs, setDangerZoneLogs] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('details');
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    assigned_to: '',
    due_date: '',
    priority: '',
    notes: ''
  });

  const [incidentPagination, setIncidentPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  });

  const [filters, setFilters] = useState({
    status: '',
    severity: '',
    priority: '',
    search: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch when filters or pagination change
  useEffect(() => {
    if (activeTab === 'incidents') {
      fetchIncidents();
    } else if (activeTab === 'danger-zone') {
      fetchDangerZoneLogs();
    }
  }, [activeTab, filters, incidentPagination.currentPage, incidentPagination.pageSize]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const statsResponse = await apiRequest('GET', '/incidents/statistics/');
      if (statsResponse.success) {
        setStatistics(statsResponse.statistics);
      }
      await fetchIncidents();
    } catch (err) {
      showToast(err.message || 'Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchIncidents = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '' && value !== false) {
          params.append(key, value);
        }
      });
      params.append('page', incidentPagination.currentPage);
      params.append('page_size', incidentPagination.pageSize);

      const endpoint = user?.is_admin 
        ? `/incidents/all/?${params.toString()}`
        : `/incidents/my/?${params.toString()}`;

      const response = await apiRequest('GET', endpoint);

      if (response.success) {
        const transformedIncidents = response.incidents.map(incident => ({
          id: getIncidentId(incident),
          incident_id: getIncidentId(incident),
          incident_number: safeRender(incident.incident_number, ''),
          title: safeRender(incident.title, 'Untitled Incident'),
          description: safeRender(incident.description, ''),
          status: safeRender(incident.status, 'pending'),
          severity: safeRender(incident.severity, 'medium'),
          priority: safeRender(incident.priority, 'medium'),
          risk_score: safeRender(incident.risk_score, 0),
          created_at: safeRender(incident.created_at),
          assigned_at: safeRender(incident.assigned_at),
          sla_due_date: safeRender(incident.sla_due_date),
          assigned_to: incident.assigned_to_details || null,
          department: incident.department_details || null,
          is_overdue: Boolean(incident.is_overdue),
          overdue_hours: safeRender(incident.overdue_hours, 0),
          danger_zone: Boolean(incident.danger_zone),
          resolution_notes: safeRender(incident.resolution_notes, ''),
          escalation_reason: safeRender(incident.escalation_reason, '')
        }));

        setIncidents(transformedIncidents);
        setIncidentPagination({
          ...incidentPagination,
          totalItems: response.pagination?.total_items || 0,
          totalPages: response.pagination?.total_pages || 1
        });
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch incidents', 'error');
    }
  };

  const fetchDangerZoneLogs = async () => {
    try {
      const response = await apiRequest('GET', '/incidents/danger-zone/');
      if (response.success) {
        setDangerZoneLogs(response.logs || []);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch danger zone logs', 'error');
    }
  };

  const fetchAssignableUsers = async () => {
    try {
      const response = await apiRequest('GET', '/incidents/assignable-users/');
      if (response.success) {
        setAssignableUsers(response.users || []);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch assignable users', 'error');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setFilters(prev => ({ ...prev, sortBy: field, sortOrder: sortDirection === 'asc' ? 'desc' : 'asc' }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      severity: '',
      priority: '',
      search: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  const openIncidentModal = (incident, type = 'details') => {
    setSelectedIncident(incident);
    setModalType(type);
    setIsModalOpen(true);
    if (type === 'assign') {
      fetchAssignableUsers();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedIncident(null);
    setAssignmentData({
      assigned_to: '',
      due_date: '',
      priority: '',
      notes: ''
    });
  };

  const handleAssignIncident = async () => {
    if (!selectedIncident || !assignmentData.assigned_to) {
      showToast('Please select a user to assign', 'error');
      return;
    }

    try {
      setIsAssigning(true);
      const response = await apiRequest('POST', '/incidents/incidents/manual-assign/', {
        incident_id: getIncidentId(selectedIncident),
        assigned_to_id: assignmentData.assigned_to,
        due_date: assignmentData.due_date || null,
        priority: assignmentData.priority || selectedIncident.priority
      });

      if (response.success) {
        showToast('Incident assigned successfully');
        closeModal();
        fetchIncidents();
      } else {
        showToast(response.error || 'Failed to assign incident', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to assign incident', 'error');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDeleteIncident = async (incident) => {
    if (!window.confirm('Are you sure you want to delete this incident? This action cannot be undone.')) {
      return;
    }

    try {
      const incidentId = getIncidentId(incident);
      const response = await apiRequest('DELETE', `/incidents/${incidentId}/`);
      if (response.success) {
        showToast('Incident deleted successfully');
        fetchIncidents();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete incident', 'error');
    }
  };

  const handlePageChange = (page) => {
    setIncidentPagination(prev => ({ ...prev, currentPage: page }));
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
      return format(date, 'MMM dd, yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  const canDeleteIncident = user?.is_admin || user?.is_hr;
  const canAssignIncident = user?.is_admin || user?.is_hr || user?.role === 'security_analyst';
  const canUpdateIncident = (incident) => {
    if (user?.is_admin || user?.is_hr) return true;
    if (incident.assigned_to && incident.assigned_to.id === user?.id) return true;
    return false;
  };

  if (loading && !statistics) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Security Incidents</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor and manage security incidents across your organization</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('incidents')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'incidents'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Incidents</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('danger-zone')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'danger-zone'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertOctagon className="h-4 w-4" />
                <span>Danger Zone</span>
                {statistics?.danger_zone_logs > 0 && (
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {statistics.danger_zone_logs}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {statistics && activeTab === 'incidents' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.total_incidents || 0}</p>
              <p className="text-xs text-gray-400 mt-1">All incidents</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Open</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{statistics.open_incidents || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Requiring attention</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Overdue</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{statistics.overdue || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Past SLA deadline</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Resolution Rate</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{statistics.resolution_rate || 0}%</p>
              <p className="text-xs text-gray-400 mt-1">Successfully resolved</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'incidents' ? (
        <IncidentsContent
          incidents={incidents}
          loading={loading}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          pagination={incidentPagination}
          onPageChange={handlePageChange}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onOpenIncident={openIncidentModal}
          onDeleteIncident={handleDeleteIncident}
          canDelete={canDeleteIncident}
          canAssign={canAssignIncident}
          canUpdate={canUpdateIncident}
          formatDate={formatDate}
          formatTimeAgo={formatTimeAgo}
          user={user}
          getPageRange={getPageRange}
        />
      ) : (
        <DangerZoneContent
          logs={dangerZoneLogs}
          incidents={incidents}
          loading={loading}
          formatDate={formatDate}
          formatTimeAgo={formatTimeAgo}
          user={user}
          onRefresh={fetchDangerZoneLogs}
        />
      )}

      {/* Modals */}
      {isModalOpen && selectedIncident && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={closeModal}></div>
          {modalType === 'details' && (
            <IncidentDetailModal
              incident={selectedIncident}
              onClose={closeModal}
              onAssign={() => openIncidentModal(selectedIncident, 'assign')}
              onDelete={() => handleDeleteIncident(selectedIncident)}
              formatDate={formatDate}
              formatTimeAgo={formatTimeAgo}
              canDelete={canDeleteIncident}
              canAssign={canAssignIncident}
              canUpdate={canUpdateIncident}
            />
          )}
          {modalType === 'assign' && (
            <AssignModal
              incident={selectedIncident}
              users={assignableUsers}
              assignmentData={assignmentData}
              setAssignmentData={setAssignmentData}
              isAssigning={isAssigning}
              onAssign={handleAssignIncident}
              onClose={closeModal}
              formatDate={formatDate}
            />
          )}
        </>
      )}
    </div>
  );
}

// ============================================================
// INCIDENTS CONTENT COMPONENT
// ============================================================

function IncidentsContent({
  incidents,
  loading,
  filters,
  onFilterChange,
  onClearFilters,
  pagination,
  onPageChange,
  sortField,
  sortDirection,
  onSort,
  onOpenIncident,
  onDeleteIncident,
  canDelete,
  canAssign,
  canUpdate,
  formatDate,
  formatTimeAgo,
  user,
  getPageRange
}) {
  const [showFilters, setShowFilters] = useState(false);
  const pageRange = getPageRange(pagination.currentPage, pagination.totalPages);

  if (loading) {
    return <LoadingState />;
  }

  if (!incidents || incidents.length === 0) {
    return (
      <EmptyState
        title="No Incidents Found"
        description="No incidents match your current filters. Try adjusting your search criteria."
        icon={AlertTriangle}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span className="font-medium">Filters</span>
                {Object.values(filters).some(v => v && v !== '') && (
                  <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {Object.values(filters).filter(v => v && v !== '').length}
                  </span>
                )}
              </button>
              {Object.values(filters).some(v => v && v !== '') && (
                <button
                  onClick={onClearFilters}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FilterX className="h-3.5 w-3.5" />
                  Clear all
                </button>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Showing {incidents.length} of {pagination.totalItems} incidents
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => onFilterChange('status', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
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
                <label className="block text-xs font-medium text-gray-500 mb-1">Severity</label>
                <select
                  value={filters.severity}
                  onChange={(e) => onFilterChange('severity', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                >
                  <option value="">All Severity</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => onFilterChange('priority', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                >
                  <option value="">All Priority</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => onFilterChange('search', e.target.value)}
                  placeholder="Search incidents..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Incident
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => onSort('severity')}
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                  >
                    Severity
                    {sortField === 'severity' && (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => onSort('status')}
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                  >
                    Status
                    {sortField === 'status' && (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => onSort('created_at')}
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                  >
                    Created
                    {sortField === 'created_at' && (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SLA
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {incidents.map((incident) => {
                const isOverdue = incident.is_overdue;
                const slaDueDate = incident.sla_due_date;
                const isDueSoon = slaDueDate && !isOverdue &&
                  new Date(slaDueDate) < new Date(Date.now() + 24 * 60 * 60 * 1000);

                return (
                  <tr
                    key={incident.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onOpenIncident(incident)}
                  >
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{incident.title}</div>
                        <div className="text-xs text-gray-400">{incident.incident_number}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <SeverityBadge severity={incident.severity} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={incident.status} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">{formatDate(incident.created_at)}</div>
                      <div className="text-xs text-gray-400">{formatTimeAgo(incident.created_at)}</div>
                    </td>
                    <td className="py-3 px-4">
                      {slaDueDate ? (
                        <div className={`flex items-center gap-1.5 text-xs font-medium ${
                          isOverdue ? 'text-red-600' : isDueSoon ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          <ClockIcon className="h-3.5 w-3.5" />
                          <span>{isOverdue ? 'Overdue' : isDueSoon ? 'Due soon' : 'On track'}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No SLA</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onOpenIncident(incident)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {canAssign && (
                          <button
                            onClick={() => onOpenIncident(incident, 'assign')}
                            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Assign"
                          >
                            <UserPlus className="h-4 w-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => onDeleteIncident(incident)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
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
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onPageChange(1)}
                  disabled={pagination.currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                  <ChevronsLeft className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={() => onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>

                {pageRange.map((page, index) => (
                  page === '...' ? (
                    <span key={`dots-${index}`} className="px-3 py-1 text-gray-400 text-sm">…</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        pagination.currentPage === page
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}

                <button
                  onClick={() => onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={() => onPageChange(pagination.totalPages)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                  <ChevronsRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// DANGER ZONE CONTENT COMPONENT
// ============================================================

function DangerZoneContent({
  logs,
  incidents,
  loading,
  formatDate,
  formatTimeAgo,
  user,
  onRefresh
}) {
  const highRiskIncidents = incidents?.filter(inc =>
    inc.severity === 'critical' || inc.severity === 'high' || inc.danger_zone === true
  ) || [];

  if (loading) {
    return <LoadingState />;
  }

  const hasDangerZoneItems = (logs && logs.length > 0) || highRiskIncidents.length > 0;

  if (!hasDangerZoneItems) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">All Clear</h2>
                <p className="text-sm text-gray-500">No high-risk activities detected</p>
              </div>
            </div>
            <button
              onClick={onRefresh}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
            >
              <Loader2 className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-emerald-50 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="text-gray-500">System is operating normally</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* High Risk Incidents */}
      {highRiskIncidents.length > 0 && (
        <div className="bg-white border border-red-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-red-100 bg-red-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertOctagon className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">High-Risk Incidents</h3>
                  <p className="text-sm text-gray-500">{highRiskIncidents.length} incidents require immediate attention</p>
                </div>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {highRiskIncidents.map((incident) => (
              <div key={incident.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <SeverityBadge severity={incident.severity} />
                      <span className="text-sm font-medium text-gray-900">{incident.title}</span>
                      <span className="text-xs text-gray-400">{incident.incident_number}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{incident.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>Created: {formatDate(incident.created_at)}</span>
                      <span>•</span>
                      <span>Status: {incident.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Danger Zone Logs */}
      {logs && logs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileWarning className="h-5 w-5 text-amber-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Danger Zone Logs</h3>
                  <p className="text-sm text-gray-500">{logs.length} suspicious activities detected</p>
                </div>
              </div>
              <button
                onClick={onRefresh}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
              >
                <Loader2 className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        log.risk_score > 80 ? 'bg-red-100 text-red-700' :
                        log.risk_score > 60 ? 'bg-orange-100 text-orange-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        Risk: {log.risk_score || 0}/100
                      </div>
                      <span className="text-sm font-medium text-gray-900">{log.activity || 'Unknown Activity'}</span>
                    </div>
                    <p className="text-sm text-gray-600">{log.description || 'No description available'}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>User: {log.user_email || 'Unknown'}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(log.timestamp)}</span>
                      {log.ip_address && (
                        <>
                          <span>•</span>
                          <span>IP: {log.ip_address}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// INCIDENT DETAIL MODAL
// ============================================================

function IncidentDetailModal({
  incident,
  onClose,
  onAssign,
  onDelete,
  formatDate,
  formatTimeAgo,
  canDelete,
  canAssign,
  canUpdate
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-100 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${
                incident.severity === 'critical' ? 'bg-red-50' :
                incident.severity === 'high' ? 'bg-orange-50' :
                incident.severity === 'medium' ? 'bg-amber-50' :
                'bg-gray-50'
              }`}>
                <AlertTriangle className={`h-6 w-6 ${
                  incident.severity === 'critical' ? 'text-red-600' :
                  incident.severity === 'high' ? 'text-orange-600' :
                  incident.severity === 'medium' ? 'text-amber-600' :
                  'text-gray-600'
                }`} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{incident.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500 font-mono">{incident.incident_number}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="text-sm text-gray-400">{formatTimeAgo(incident.created_at)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
              <StatusBadge status={incident.status} />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Priority</p>
              <PriorityBadge priority={incident.priority} />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Assigned To</p>
              <div className="flex items-center gap-2">
                {incident.assigned_to ? (
                  <>
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-700">{incident.assigned_to.full_name || 'Assigned User'}</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-400">Unassigned</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider">SLA Status</p>
              {incident.sla_due_date ? (
                <div className={`text-sm font-medium ${
                  incident.is_overdue ? 'text-red-600' : 'text-emerald-600'
                }`}>
                  {incident.is_overdue ? 'Overdue' : 'On Track'}
                  <span className="text-xs text-gray-400 ml-2">
                    {formatDate(incident.sla_due_date)}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-gray-400">No SLA</span>
              )}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Description</p>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{incident.description}</p>
            </div>
          </div>

          {incident.resolution_notes && (
            <div className="mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Resolution Notes</p>
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <p className="text-sm text-emerald-700 whitespace-pre-wrap">{incident.resolution_notes}</p>
              </div>
            </div>
          )}

          {incident.escalation_reason && (
            <div className="mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Escalation Reason</p>
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <p className="text-sm text-red-700 whitespace-pre-wrap">{incident.escalation_reason}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {canAssign && (
                <button
                  onClick={onAssign}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  {incident.assigned_to ? 'Reassign' : 'Assign'}
                </button>
              )}
              {canDelete && (
                <button
                  onClick={onDelete}
                  className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ASSIGN MODAL
// ============================================================

function AssignModal({
  incident,
  users,
  assignmentData,
  setAssignmentData,
  isAssigning,
  onAssign,
  onClose,
  formatDate
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="border-b border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Assign Incident</h2>
              <p className="text-sm text-gray-500 mt-1">{incident.incident_number}: {incident.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Assign To <span className="text-red-500">*</span>
            </label>
            <select
              value={assignmentData.assigned_to}
              onChange={(e) => setAssignmentData({ ...assignmentData, assigned_to: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              required
            >
              <option value="">Select a user...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.full_name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Priority
            </label>
            <select
              value={assignmentData.priority || incident.priority}
              onChange={(e) => setAssignmentData({ ...assignmentData, priority: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            >
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              SLA Due Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={assignmentData.due_date}
              onChange={(e) => setAssignmentData({ ...assignmentData, due_date: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            />
          </div>
        </div>

        <div className="border-t border-gray-100 p-6 bg-gray-50">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onAssign}
              disabled={isAssigning || !assignmentData.assigned_to}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4" />
                  Assign
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IncidentsReports;