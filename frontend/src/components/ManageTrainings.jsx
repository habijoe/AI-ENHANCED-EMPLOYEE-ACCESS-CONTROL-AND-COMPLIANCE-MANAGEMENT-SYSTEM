/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit, faTrash, faDownload, faSearch, faBook, faChartPie,
  faPlus, faFilter, faCalendarAlt, faFileAlt, faUsers,
  faUserShield, faUserGraduate, faSortAmountDown, faSortAmountUp,
  faEnvelope, faEye, faTimes, faCheck, faClock, faCalendar,
  faLayerGroup, faUser, faDatabase, faChartLine, faSort,
  faArrowUp, faArrowDown, faExternalLinkAlt, faCog,
  faChevronLeft, faChevronRight, faExpand, faCompress
} from "@fortawesome/free-solid-svg-icons";
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line,
  AreaChart, Area
} from 'recharts';
import logo from "../assets/pictures/Logo.png";

// Modern Color Scheme
const COLORS = {
  primary: '#2563eb',      // Blue-600
  secondary: '#7c3aed',    // Purple-600
  success: '#10b981',      // Emerald-500
  warning: '#f59e0b',      // Amber-500
  danger: '#ef4444',       // Red-500
  info: '#06b6d4',         // Cyan-500
  light: '#f8fafc',        // Slate-50
  dark: '#1e293b',         // Slate-800
  gray: '#64748b',         // Slate-500
  white: '#ffffff',
  cardBg: '#ffffff',
  border: '#e2e8f0'
};

const STATUS_COLORS = {
  active: '#10b981',
  draft: '#f59e0b',
  archived: '#64748b',
  upcoming: '#3b82f6'
};

const STATUS_BG_COLORS = {
  active: 'bg-green-50 border-green-200',
  draft: 'bg-amber-50 border-amber-200',
  archived: 'bg-slate-50 border-slate-200',
  upcoming: 'bg-blue-50 border-blue-200'
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 rounded-xl border border-red-200">
          <h3 className="font-semibold text-lg mb-3 text-red-800">Something went wrong</h3>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const SummaryCard = ({ icon, title, value, subtext, trend, bgColor, textColor }) => (
  <div className={`${bgColor} rounded-xl border ${COLORS.border} p-6 shadow-sm hover:shadow-md transition-shadow duration-300`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${textColor} bg-opacity-10`}>
        <FontAwesomeIcon icon={icon} className="text-lg" />
      </div>
      {trend && (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${trend > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtext && (
        <p className="text-xs text-gray-400 mt-1">{subtext}</p>
      )}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { label: 'Active', icon: faCheck, color: STATUS_COLORS.active, bg: STATUS_BG_COLORS.active },
    draft: { label: 'Draft', icon: faClock, color: STATUS_COLORS.draft, bg: STATUS_BG_COLORS.draft },
    archived: { label: 'Archived', icon: faTimes, color: STATUS_COLORS.archived, bg: STATUS_BG_COLORS.archived },
    upcoming: { label: 'Upcoming', icon: faCalendar, color: STATUS_COLORS.upcoming, bg: STATUS_BG_COLORS.upcoming }
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${config.bg} border`}>
      <FontAwesomeIcon icon={config.icon} style={{ color: config.color }} className="text-xs" />
      <span style={{ color: config.color }}>{config.label}</span>
    </span>
  );
};

const TrainingCard = ({ training, index, onEdit, onDelete, onView }) => {
  const navigate = useNavigate(); // Add this line

  const getProgressColor = (modules) => {
    if (modules === 0) return 'bg-gray-200';
    if (modules < 5) return 'bg-red-500';
    if (modules < 10) return 'bg-amber-500';
    return 'bg-green-500';
  };

  // Safely get ID display
  const getDisplayId = () => {
    if (!training.id) return 'N/A';
    const idStr = String(training.id);
    return idStr.length > 8 ? `${idStr.substring(0, 8)}...` : idStr;
  };

  // Safely get created by name
  const getCreatedByName = () => {
    if (training.created_by?.name) return training.created_by.name;
    if (training.created_by?.email) return training.created_by.email;
    return 'System';
  };

  // Safely format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const handleView = () => {
    console.log('View button clicked, ID:', training.id);
    console.log('Navigating to:', `/admin/viewTraining/${training.id}`);

    if (!training.id) {
      console.error('No training ID found');
      alert('Cannot view: Training ID is missing');
      return;
    }

    navigate(`/admin/viewTraining/${training.id}`);
  };


  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={training.status || 'active'} />
            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
              ID: {getDisplayId()}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {training.name || 'Unnamed Training'}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleView} // Changed from onView to onClick
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <FontAwesomeIcon icon={faEye} />
          </button>

          <button
            onClick={() => onDelete(training.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-gray-600">
          <FontAwesomeIcon icon={faLayerGroup} className="mr-2 text-blue-500" />
          <span className="text-sm">
            <span className="font-semibold">{training.modules?.length || 0}</span> Modules
          </span>
        </div>

        <div className="flex items-center text-gray-600">
          <FontAwesomeIcon icon={faUser} className="mr-2 text-purple-500" />
          <span className="text-sm">
            Created by: <span className="font-medium">{getCreatedByName()}</span>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <FontAwesomeIcon icon={faCalendar} className="mr-2 text-gray-500" />
            <span className="text-xs">{formatDate(training.created_at)}</span>
          </div>
          <div className="flex items-center">
            <FontAwesomeIcon icon={faClock} className="mr-1 text-gray-500 text-xs" />
            <span className="text-xs text-gray-500">
              {training.updated_at ?
                new Date(training.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                formatDate(training.created_at)
              }
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Content Coverage</span>
            <span>{training.modules?.length || 0} modules</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor(training.modules?.length || 0)} transition-all duration-500`}
              style={{
                width: `${Math.min(((training.modules?.length || 0) / 15) * 100, 100)}%`
              }}
            />
          </div>
        </div>

        {/* Tags */}
        {training.tags && training.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {training.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                {tag}
              </span>
            ))}
            {training.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                +{training.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const AdvancedFilterPanel = ({ filters, setFilters, isOpen, onClose }) => {
  if (!isOpen) return null;

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' },
    { value: 'upcoming', label: 'Upcoming' }
  ];

  const moduleCountOptions = [
    { value: '', label: 'Any' },
    { value: '0', label: 'No Modules' },
    { value: '1-5', label: '1-5 Modules' },
    { value: '6-10', label: '6-10 Modules' },
    { value: '10+', label: '10+ Modules' }
  ];

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity" 
          onClick={onClose}
          aria-hidden="true"
        ></div>

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal panel - CRITICAL: Add onClick to stop propagation */}
        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full relative z-[10000]"
          onClick={(e) => e.stopPropagation()} // THIS IS KEY - prevents click from bubbling to backdrop
        >
          <div className="bg-white px-6 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Range */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Date Range</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                    <input
                      type="date"
                      value={filters.dateFrom || ''}
                      onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
                      onClick={(e) => e.stopPropagation()} // Prevent clicks from closing modal
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                    <input
                      type="date"
                      value={filters.dateTo || ''}
                      onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Status</h4>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilters({ ...filters, status: option.value });
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filters.status === option.value
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Module Count */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Module Count</h4>
                <select
                  value={filters.moduleCount || ''}
                  onChange={e => setFilters({ ...filters, moduleCount: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {moduleCountOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Creator Filter */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Created By</h4>
                <input
                  type="text"
                  placeholder="Search creator..."
                  value={filters.creator || ''}
                  onChange={e => setFilters({ ...filters, creator: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Sort Options */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Sort By</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={filters.sortField || 'created_at'}
                      onChange={e => setFilters({ ...filters, sortField: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="created_at">Created Date</option>
                      <option value="name">Name</option>
                      <option value="modules">Module Count</option>
                      <option value="updated_at">Last Updated</option>
                    </select>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilters({
                          ...filters,
                          sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc'
                        });
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <FontAwesomeIcon icon={filters.sortDirection === 'asc' ? faArrowUp : faArrowDown} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Tags */}
            <div className="mt-6 space-y-3">
              <h4 className="font-medium text-gray-900">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {['cybersecurity', 'compliance', 'awareness', 'technical', 'beginner', 'advanced'].map(tag => (
                  <button
                    key={tag}
                    onClick={(e) => {
                      e.stopPropagation();
                      const currentTags = filters.tags || [];
                      const newTags = currentTags.includes(tag)
                        ? currentTags.filter(t => t !== tag)
                        : [...currentTags, tag];
                      setFilters({ ...filters, tags: newTags });
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      (filters.tags || []).includes(tag)
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 sm:px-6 flex justify-between">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFilters({
                  searchQuery: filters.searchQuery,
                  dateFrom: '',
                  dateTo: '',
                  status: '',
                  moduleCount: '',
                  creator: '',
                  tags: [],
                  sortField: 'created_at',
                  sortDirection: 'desc'
                });
              }}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Clear Filters
            </button>
            <div className="space-x-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function ManageTrainings() {
  const [trainingData, setTrainingData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrainings, setSelectedTrainings] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [filters, setFilters] = useState({
    searchQuery: '',
    dateFrom: '',
    dateTo: '',
    status: '',
    moduleCount: '',
    creator: '',
    tags: [],
    sortField: 'created_at',
    sortDirection: 'desc'
  });

  const navigate = useNavigate();

  // Debug logs
  useEffect(() => {
    console.log('===== MANAGE TRAININGS COMPONENT LOADED =====');
    console.log('Access token exists:', !!localStorage.getItem("access_token"));
  }, []);

  useEffect(() => {
    fetchTrainings();
  }, []);


  // In your ManageTrainings component, add this useEffect to debug
  useEffect(() => {
    console.log('Filters state:', filters);
    console.log('Show Advanced Filters:', showAdvancedFilters);
  }, [filters, showAdvancedFilters]);

  // Also update the AdvancedFilterPanel call to include logging
  <AdvancedFilterPanel
    filters={filters}
    setFilters={(newFilters) => {
      console.log('Setting new filters:', newFilters);
      setFilters(newFilters);
    }}
    isOpen={showAdvancedFilters}
    onClose={() => {
      console.log('Closing filter panel');
      setShowAdvancedFilters(false);
    }}
  />

  const fetchTrainings = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get("http://127.0.0.1:8000/training/trainings/", {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Retrieved trainings:', res.data);

      // Handle both array and object response formats
      let trainings = [];
      if (Array.isArray(res.data)) {
        trainings = res.data;
      } else if (res.data && typeof res.data === 'object') {
        // Check if response is an object with a results property (common in paginated APIs)
        if (Array.isArray(res.data.results)) {
          trainings = res.data.results;
        } else if (Array.isArray(res.data.data)) {
          trainings = res.data.data;
        } else {
          // Convert object values to array if needed
          trainings = Object.values(res.data);
        }
      }

      console.log('Processed trainings:', trainings);

      // Add mock status and tags for demonstration
      const enhancedTrainings = trainings.map(training => ({
        ...training,
        status: ['active', 'draft', 'archived', 'upcoming'][Math.floor(Math.random() * 4)],
        tags: ['cybersecurity', 'compliance', 'awareness'].slice(0, Math.floor(Math.random() * 3) + 1),
        updated_at: training.updated_at || training.created_at
      }));

      setTrainingData(enhancedTrainings);
      setMessage("");
    } catch (err) {
      console.error("Error fetching trainings:", err);
      setMessage("Failed to load trainings. Please try again.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this training?")) return;
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`http://127.0.0.1:8000/training/delete/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchTrainings();
      setMessage("Training deleted successfully");
      setMessageType("success");
      setCurrentPage(1);
    } catch (err) {
      setMessage(err.response?.data?.message || "An error occurred");
      setMessageType("error");
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedTrainings.length} trainings?`)) return;
    try {
      const token = localStorage.getItem("access_token");
      await Promise.all(
        selectedTrainings.map(id =>
          axios.delete(`http://127.0.0.1:8000/training/delete/${id}/`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );
      await fetchTrainings();
      setSelectedTrainings([]);
      setShowBulkActions(false);
      setMessage(`${selectedTrainings.length} trainings deleted successfully`);
      setMessageType("success");
    } catch (err) {
      setMessage("Error deleting selected trainings");
      setMessageType("error");
    }
  };

  const filteredSortedData = useMemo(() => {
    return trainingData
      .filter(training => {
        // Search query
        const matchesSearch = !filters.searchQuery ||
          [training.name, training.description, training.created_by?.name, training.created_by?.email]
            .some(field => field?.toString().toLowerCase().includes(filters.searchQuery.toLowerCase()));

        // Date range
        try {
          const createdDate = new Date(training.created_at);
          const matchesDateFrom = !filters.dateFrom || createdDate >= new Date(filters.dateFrom);
          const matchesDateTo = !filters.dateTo || createdDate <= new Date(filters.dateTo);

          // Status
          const matchesStatus = !filters.status || training.status === filters.status;

          // Module count
          const moduleCount = training.modules?.length || 0;
          let matchesModuleCount = true;
          if (filters.moduleCount) {
            switch (filters.moduleCount) {
              case '0': matchesModuleCount = moduleCount === 0; break;
              case '1-5': matchesModuleCount = moduleCount >= 1 && moduleCount <= 5; break;
              case '6-10': matchesModuleCount = moduleCount >= 6 && moduleCount <= 10; break;
              case '10+': matchesModuleCount = moduleCount > 10; break;
            }
          }

          // Creator
          const matchesCreator = !filters.creator ||
            training.created_by?.name?.toLowerCase().includes(filters.creator.toLowerCase()) ||
            training.created_by?.email?.toLowerCase().includes(filters.creator.toLowerCase());

          // Tags
          const matchesTags = !filters.tags?.length ||
            filters.tags.every(tag => training.tags?.includes(tag));

          return matchesSearch && matchesDateFrom && matchesDateTo &&
            matchesStatus && matchesModuleCount && matchesCreator && matchesTags;
        } catch (error) {
          console.error('Error filtering training:', training, error);
          return false;
        }
      })
      .sort((a, b) => {
        try {
          const fieldA = a[filters.sortField];
          const fieldB = b[filters.sortField];

          if (filters.sortDirection === 'asc') {
            return fieldA < fieldB ? -1 : fieldA > fieldB ? 1 : 0;
          } else {
            return fieldA > fieldB ? -1 : fieldA < fieldB ? 1 : 0;
          }
        } catch (error) {
          console.error('Error sorting training:', error);
          return 0;
        }
      });
  }, [trainingData, filters]);

  const summaryMetrics = useMemo(() => {
    const total = trainingData.length;
    const totalModules = trainingData.reduce((acc, training) =>
      acc + (training.modules?.length || 0), 0);
    const avgModules = total > 0 ? (totalModules / total).toFixed(1) : 0;

    const statusCounts = trainingData.reduce((acc, training) => {
      const status = training.status || 'draft';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const newTrainingsLast30Days = trainingData.filter(training => {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(training.created_at) >= thirtyDaysAgo;
      } catch {
        return false;
      }
    }).length;

    return {
      total,
      totalModules,
      avgModules,
      statusCounts,
      newTrainingsLast30Days,
      activeCount: statusCounts.active || 0,
      draftCount: statusCounts.draft || 0
    };
  }, [trainingData]);

  const currentItems = filteredSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredSortedData.length / itemsPerPage);

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <SummaryCard
        icon={faDatabase}
        title="Total Trainings"
        value={summaryMetrics.total}
        subtext={`${summaryMetrics.newTrainingsLast30Days} new in 30 days`}
        trend={12.5}
        bgColor="bg-blue-50"
        textColor="text-blue-600"
      />
      <SummaryCard
        icon={faLayerGroup}
        title="Total Modules"
        value={summaryMetrics.totalModules}
        subtext={`${summaryMetrics.avgModules} avg per training`}
        trend={8.3}
        bgColor="bg-purple-50"
        textColor="text-purple-600"
      />
      <SummaryCard
        icon={faCheck}
        title="Active Trainings"
        value={summaryMetrics.activeCount}
        subtext={`${summaryMetrics.draftCount} in draft`}
        trend={5.2}
        bgColor="bg-green-50"
        textColor="text-green-600"
      />
      <SummaryCard
        icon={faChartLine}
        title="Filtered Results"
        value={filteredSortedData.length}
        subtext={`${trainingData.length - filteredSortedData.length} hidden by filters`}
        bgColor="bg-amber-50"
        textColor="text-amber-600"
      />
    </div>
  );

  const renderCharts = () => {
    if (!trainingData.length) return null;

    const statusData = Object.entries(summaryMetrics.statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));

    const monthlyData = trainingData.reduce((acc, training) => {
      try {
        const month = new Date(training.created_at).toLocaleDateString('en-US', { month: 'short' });
        acc[month] = (acc[month] || 0) + 1;
      } catch (error) {
        console.error('Error processing date for chart:', training.created_at);
      }
      return acc;
    }, {});

    const trendData = Object.entries(monthlyData).map(([month, count]) => ({
      month,
      count,
      modules: trainingData
        .filter(t => {
          try {
            return new Date(t.created_at).toLocaleDateString('en-US', { month: 'short' }) === month;
          } catch {
            return false;
          }
        })
        .reduce((sum, t) => sum + (t.modules?.length || 0), 0)
    }));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name.toLowerCase()] || COLORS.gray} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Training Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={COLORS.primary}
                fill={COLORS.primary}
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="modules"
                stroke={COLORS.secondary}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trainings...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Training Management</h1>
                <p className="text-gray-600 mt-1">
                  Manage and monitor cybersecurity training programs ({filteredSortedData.length} total)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/admin/createTraining"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Create Training
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Message Alert */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${messageType === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
              }`}>
              <div className="flex items-center justify-between">
                <span>{message}</span>
                <button onClick={() => setMessage("")} className="text-gray-400 hover:text-gray-600">
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          {renderStatsCards()}

          {/* Main Control Panel */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            {/* Search and Filter Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search trainings by name, description, or creator..."
                    value={filters.searchQuery}
                    onChange={e => setFilters({ ...filters, searchQuery: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  {filters.searchQuery && (
                    <button
                      onClick={() => setFilters({ ...filters, searchQuery: '' })}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAdvancedFilters(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  <FontAwesomeIcon icon={faFilter} />
                  Filters
                  {Object.values(filters).some(filter =>
                    filter && (Array.isArray(filter) ? filter.length > 0 : filter !== '')
                  ) && (
                      <span className="ml-1 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                        •
                      </span>
                    )}
                </button>

                <div className="relative">
                  <button
                    onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  >
                    <FontAwesomeIcon icon={viewMode === "grid" ? faCompress : faExpand} />
                    {viewMode === "grid" ? "List View" : "Grid View"}
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(filters.dateFrom || filters.dateTo || filters.status || filters.moduleCount || filters.creator || filters.tags?.length > 0) && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                  <button
                    onClick={() => setFilters({
                      searchQuery: filters.searchQuery,
                      dateFrom: '',
                      dateTo: '',
                      status: '',
                      moduleCount: '',
                      creator: '',
                      tags: [],
                      sortField: filters.sortField,
                      sortDirection: filters.sortDirection
                    })}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.dateFrom && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200">
                      From: {new Date(filters.dateFrom).toLocaleDateString()}
                      <button onClick={() => setFilters({ ...filters, dateFrom: '' })}>
                        <FontAwesomeIcon icon={faTimes} className="text-xs" />
                      </button>
                    </span>
                  )}
                  {filters.dateTo && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200">
                      To: {new Date(filters.dateTo).toLocaleDateString()}
                      <button onClick={() => setFilters({ ...filters, dateTo: '' })}>
                        <FontAwesomeIcon icon={faTimes} className="text-xs" />
                      </button>
                    </span>
                  )}
                  {filters.status && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full border border-purple-200">
                      Status: {filters.status}
                      <button onClick={() => setFilters({ ...filters, status: '' })}>
                        <FontAwesomeIcon icon={faTimes} className="text-xs" />
                      </button>
                    </span>
                  )}
                  {filters.moduleCount && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full border border-green-200">
                      Modules: {filters.moduleCount}
                      <button onClick={() => setFilters({ ...filters, moduleCount: '' })}>
                        <FontAwesomeIcon icon={faTimes} className="text-xs" />
                      </button>
                    </span>
                  )}
                  {filters.tags?.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-50 text-gray-700 text-sm rounded-full border border-gray-200">
                      Tag: {tag}
                      <button onClick={() => setFilters({ ...filters, tags: filters.tags.filter(t => t !== tag) })}>
                        <FontAwesomeIcon icon={faTimes} className="text-xs" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bulk Actions Bar */}
            {selectedTrainings.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-700 font-medium">
                      {selectedTrainings.length} training(s) selected
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleBulkDelete}
                        className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                      >
                        Delete Selected
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTrainings([]);
                          setShowBulkActions(false);
                        }}
                        className="px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Training Display */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentItems.map((training, index) => (
                  <TrainingCard
                    key={training.id || index}
                    training={training}
                    index={index}
                    onEdit={(id) => navigate(`/admin/editTraining/${id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedTrainings.length === currentItems.length && currentItems.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTrainings(currentItems.map(t => t.id));
                            } else {
                              setSelectedTrainings([]);
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Training Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Modules
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created By
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((training) => (
                      <tr key={training.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedTrainings.includes(training.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTrainings([...selectedTrainings, training.id]);
                              } else {
                                setSelectedTrainings(selectedTrainings.filter(id => id !== training.id));
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{training.name || 'Unnamed Training'}</div>
                            {training.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">{training.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={training.status || 'draft'} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{training.modules?.length || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {training.created_by?.name || training.created_by?.email || 'System'}
                          </div>
                          {training.created_by?.email && (
                            <div className="text-sm text-gray-500">{training.created_by.email}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {training.created_at ? new Date(training.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">


                            <button
                              onClick={() => {
                                console.log('View clicked for ID:', training.id);
                                if (!training.id) {
                                  console.error('No ID provided for view');
                                  alert('Cannot view: Training ID is missing');
                                  return;
                                }
                                navigate(`/admin/viewTraining/${training.id}`);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                              disabled={!training.id}
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                            <button
                              onClick={() => training.id && handleDelete(training.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                              disabled={!training.id}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {filteredSortedData.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  <label className="text-sm text-gray-700">
                    Show:
                  </label>
                  <select
                    value={itemsPerPage}
                    onChange={e => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value={6}>6</option>
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                  </select>
                  <span className="text-sm text-gray-500">
                    {filteredSortedData.length} total trainings
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} className="mr-1" />
                    Previous
                  </button>

                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <FontAwesomeIcon icon={faChevronRight} className="ml-1" />
                  </button>
                </div>

                <div className="text-sm text-gray-500 mt-4 sm:mt-0">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredSortedData.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                  <FontAwesomeIcon icon={faBook} className="text-4xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {trainingData.length === 0 ? "No Trainings Found" : "No Matching Results"}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {trainingData.length === 0
                    ? "Start building your training catalog by creating your first training program."
                    : "Try adjusting your search criteria or filters to find what you're looking for."
                  }
                </p>
                {trainingData.length === 0 ? (
                  <Link
                    to="/admin/createTraining"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Create First Training
                  </Link>
                ) : (
                  <button
                    onClick={() => setFilters({
                      searchQuery: '',
                      dateFrom: '',
                      dateTo: '',
                      status: '',
                      moduleCount: '',
                      creator: '',
                      tags: [],
                      sortField: 'created_at',
                      sortDirection: 'desc'
                    })}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Analytics Section */}
          {renderCharts()}
        </div>

        {/* Advanced Filter Modal */}
        <AdvancedFilterPanel
          filters={filters}
          setFilters={setFilters}
          isOpen={showAdvancedFilters}
          onClose={() => setShowAdvancedFilters(false)}
        />
      </div>
    </ErrorBoundary>
  );
}