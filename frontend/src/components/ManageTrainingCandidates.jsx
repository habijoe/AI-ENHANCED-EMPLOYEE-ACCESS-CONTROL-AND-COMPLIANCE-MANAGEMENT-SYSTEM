/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  X,
  Calendar,
  User,
  BookOpen,
  Clock,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Filter,
  Users,
  Award,
  TrendingUp,
  AlertCircle,
  PlayCircle,
  Layers,
  Target,
  Book,
  FileText,
  Check,
  Phone,
  Mail,
  Briefcase,
  Timer,
  UserCheck,
  BarChart3
} from "lucide-react";

export function ManageTrainingCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [trainingFilter, setTrainingFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateProgress, setCandidateProgress] = useState({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const accessToken = localStorage.getItem("access_token");

  // Fetch all candidates
  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/candidate/candidates/",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      if (Array.isArray(response.data)) {
        setCandidates(response.data);
        
        // Fetch progress for each candidate
        await fetchAllCandidatesProgress(response.data);
      }
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setError("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  // Fetch progress for all candidates
  const fetchAllCandidatesProgress = async (candidatesList) => {
    const progressMap = {};
    
    for (const candidate of candidatesList) {
      try {
        const progress = await fetchCandidateProgress(candidate.id, candidate.training?.id);
        progressMap[candidate.id] = progress;
      } catch (err) {
        console.error(`Error fetching progress for candidate ${candidate.id}:`, err);
        progressMap[candidate.id] = {
          completed_modules: 0,
          total_modules: 0,
          progress_percentage: 0,
          status: 'pending',
          is_completed: false
        };
      }
    }
    
    setCandidateProgress(progressMap);
  };

  // Fetch progress for a specific candidate
  const fetchCandidateProgress = async (candidateId, trainingId) => {
    if (!trainingId) {
      return {
        completed_modules: 0,
        total_modules: 0,
        progress_percentage: 0,
        status: 'pending',
        is_completed: false
      };
    }

    try {
      // Use the new endpoint for admin viewing candidate progress
      const response = await axios.get(
        `http://127.0.0.1:8000/progress/candidate/${candidateId}/training/${trainingId}/progress/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = response.data;
      
      return {
        completed_modules: data.progress?.completed_modules || 0,
        total_modules: data.progress?.total_modules || 0,
        progress_percentage: data.progress?.progress_percentage || 0,
        status: data.candidate?.status || 'pending',
        is_completed: data.progress?.is_completed || false,
        module_progress: data.module_progress || [],
        last_activity: data.progress?.last_activity,
        started_at: data.progress?.started_at
      };
      
    } catch (err) {
      // Fallback to general progress endpoint
      try {
        const fallbackResponse = await axios.get(
          `http://127.0.0.1:8000/progress/training/${trainingId}/progress/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const fallbackData = fallbackResponse.data;
        const completedModules = fallbackData.completed_modules || 0;
        const totalModules = fallbackData.total_modules || 0;
        const progressPercentage = totalModules > 0 
          ? Math.round((completedModules / totalModules) * 100)
          : 0;

        return {
          completed_modules: completedModules,
          total_modules: totalModules,
          progress_percentage: progressPercentage,
          status: completedModules === 0 ? 'pending' : 
                 completedModules === totalModules ? 'completed' : 'in_progress',
          is_completed: completedModules === totalModules && totalModules > 0
        };
      } catch (fallbackErr) {
        console.error("Fallback progress fetch failed:", fallbackErr);
        throw fallbackErr;
      }
    }
  };

  // Refresh progress for a specific candidate
  const refreshCandidateProgress = async (candidateId) => {
    setProgressLoading(prev => ({ ...prev, [candidateId]: true }));
    
    try {
      const candidate = candidates.find(c => c.id === candidateId);
      if (candidate) {
        const progress = await fetchCandidateProgress(candidateId, candidate.training?.id);
        setCandidateProgress(prev => ({
          ...prev,
          [candidateId]: progress
        }));
      }
    } catch (err) {
      console.error(`Error refreshing progress for candidate ${candidateId}:`, err);
    } finally {
      setProgressLoading(prev => ({ ...prev, [candidateId]: false }));
    }
  };

  // View candidate details
  const viewCandidateDetails = async (candidate) => {
    setSelectedCandidate(candidate);
    
    try {
      // Fetch detailed progress
      const progress = await fetchCandidateProgress(candidate.id, candidate.training?.id);
      setCandidateProgress(prev => ({
        ...prev,
        [candidate.id]: progress
      }));
      
      setShowDetailsModal(true);
    } catch (err) {
      console.error("Error fetching candidate details:", err);
      setError("Failed to load candidate details");
    }
  };

  // Delete candidate
  const deleteCandidate = async (candidateId) => {
    if (!window.confirm("Are you sure you want to delete this candidate?")) {
      return;
    }

    try {
      await axios.delete(
        `http://127.0.0.1:8000/candidate/delete/${candidateId}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setCandidates(prev => prev.filter(c => c.id !== candidateId));
      setSuccess("Candidate deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error deleting candidate:", err);
      setError("Failed to delete candidate");
    }
  };

  // Update candidate status
  const updateCandidateStatus = async (candidateId, newStatus) => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/candidate/update/${candidateId}/`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update local state
      setCandidates(prev => 
        prev.map(candidate => 
          candidate.id === candidateId 
            ? { ...candidate, status: newStatus }
            : candidate
        )
      );

      // Update progress
      setCandidateProgress(prev => ({
        ...prev,
        [candidateId]: {
          ...prev[candidateId],
          status: newStatus
        }
      }));

      setSuccess("Candidate status updated");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error updating candidate status:", err);
      setError("Failed to update candidate status");
    }
  };

  // Calculate statistics
  const calculateStatistics = () => {
    const stats = {
      total: candidates.length,
      completed: 0,
      inProgress: 0,
      pending: 0,
      avgProgress: 0
    };

    let totalProgress = 0;
    let count = 0;

    Object.values(candidateProgress).forEach(progress => {
      if (progress.is_completed) {
        stats.completed++;
      } else if (progress.progress_percentage > 0) {
        stats.inProgress++;
      } else {
        stats.pending++;
      }

      totalProgress += progress.progress_percentage || 0;
      count++;
    });

    stats.avgProgress = count > 0 ? Math.round(totalProgress / count) : 0;

    return stats;
  };

  // Filter candidates
  const filteredCandidates = candidates.filter(candidate => {
    const progress = candidateProgress[candidate.id] || {};
    
    // Search filter
    const matchesSearch = !searchQuery || 
      candidate.learner?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.learner?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.learner?.phone_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.training?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "completed" && progress.is_completed) ||
      (statusFilter === "in_progress" && progress.progress_percentage > 0 && !progress.is_completed) ||
      (statusFilter === "pending" && progress.progress_percentage === 0);

    // Training filter
    const matchesTraining = !trainingFilter || candidate.training?.name === trainingFilter;

    // Date filter
    const matchesDate = !dateFilter || 
      (candidate.created_at && candidate.created_at.startsWith(dateFilter));

    return matchesSearch && matchesStatus && matchesTraining && matchesDate;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCandidates = filteredCandidates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Initialize
  useEffect(() => {
    if (accessToken) {
      fetchCandidates();
    } else {
      navigate("/login");
    }
  }, [accessToken, navigate]);

  // Get unique trainings for filter
  const uniqueTrainings = [...new Set(candidates
    .map(candidate => candidate.training?.name)
    .filter(Boolean))];

  // Status badge component
  const StatusBadge = ({ status }) => {
    const config = {
      completed: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-200",
        icon: CheckCircle,
        label: "Completed"
      },
      in_progress: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-200",
        icon: PlayCircle,
        label: "In Progress"
      },
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-200",
        icon: Clock,
        label: "Not Started"
      },
      failed: {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-200",
        icon: AlertCircle,
        label: "Failed"
      }
    };

    const style = config[status] || config.pending;
    const Icon = style.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} ${style.border}`}>
        <Icon className="w-3 h-3 mr-1.5" />
        {style.label}
      </span>
    );
  };

  // Progress bar component
  const ProgressBar = ({ percentage }) => {
    const width = Math.min(percentage, 100);
    let color = "bg-gray-500";
    
    if (percentage >= 80) color = "bg-green-500";
    else if (percentage >= 50) color = "bg-blue-500";
    else if (percentage > 0) color = "bg-yellow-500";

    return (
      <div className="flex items-center space-x-2">
        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${color}`}
            style={{ width: `${width}%` }}
          />
        </div>
        <span className="text-sm font-medium text-gray-700">
          {Math.round(percentage)}%
        </span>
      </div>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const stats = calculateStatistics();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Training Candidates</h1>
                <p className="text-gray-600 mt-1">
                  Manage and monitor training enrollment applications and learning progress
                </p>
              </div>
            </div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Candidates</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completed}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inProgress}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <PlayCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg Progress</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.avgProgress}%</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={fetchCandidates}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh Data
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
              />
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="pending">Not Started</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Training Program
                  </label>
                  <select
                    value={trainingFilter}
                    onChange={(e) => setTrainingFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Trainings</option>
                    {uniqueTrainings.map((training, index) => (
                      <option key={index} value={training}>
                        {training}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enrollment Date
                  </label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                      setTrainingFilter("");
                      setDateFilter("");
                      setSuccess("Filters reset successfully!");
                      setTimeout(() => setSuccess(""), 3000);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Training Candidates</h2>
            <p className="text-sm text-gray-600">
              {filteredCandidates.length} candidate(s) found
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Show:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {[10, 25, 50, 100].map(value => (
                <option key={value} value={value}>{value} per page</option>
              ))}
            </select>
          </div>
        </div>

        {/* Candidates Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading candidates...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Candidate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Training
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Enrollment Date
                      </th>
                      <th className="px 6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Modules
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentCandidates.length > 0 ? (
                      currentCandidates.map((candidate) => {
                        const progress = candidateProgress[candidate.id] || {};
                        const isLoading = progressLoading[candidate.id];

                        return (
                          <tr key={candidate.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <User className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {candidate.learner?.full_name || "N/A"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {candidate.learner?.phone_number || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {candidate.learner?.email || ""}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {candidate.training?.name || "N/A"}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {candidate.training?.id || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {formatDate(candidate.created_at)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {progress.completed_modules || 0} / {progress.total_modules || 0}
                              </div>
                              <div className="text-xs text-gray-500">
                                {progress.total_modules > 0 
                                  ? `${Math.round((progress.completed_modules / progress.total_modules) * 100)}% complete`
                                  : 'No modules'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                {isLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                ) : (
                                  <ProgressBar percentage={progress.progress_percentage || 0} />
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                <StatusBadge status={progress.status || 'pending'} />
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => viewCandidateDetails(candidate)}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => refreshCandidateProgress(candidate.id)}
                                  disabled={isLoading}
                                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Refresh Progress"
                                >
                                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                </button>
                                <button
                                  onClick={() => deleteCandidate(candidate.id)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center">
                          <div className="text-center">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {candidates.length === 0 ? "No candidates found" : "No matching candidates"}
                            </h3>
                            <p className="text-gray-500">
                              {candidates.length === 0 
                                ? "No training candidates have been registered yet." 
                                : "Try adjusting your search or filter criteria."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCandidates.length)} of {filteredCandidates.length} candidates
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </button>

                    <div className="flex items-center space-x-1">
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
                            key={i}
                            onClick={() => paginate(pageNum)}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium ${
                              currentPage === pageNum
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
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Candidate Details Modal */}
      {showDetailsModal && selectedCandidate && (
        <CandidateDetailsModal
          candidate={selectedCandidate}
          progress={candidateProgress[selectedCandidate.id]}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedCandidate(null);
          }}
          onUpdateStatus={updateCandidateStatus}
          onDelete={deleteCandidate}
        />
      )}
    </div>
  );
}

// Candidate Details Modal Component
function CandidateDetailsModal({ candidate, progress, onClose, onUpdateStatus, onDelete }) {
  const [updating, setUpdating] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      await onUpdateStatus(candidate.id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  if (!progress) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading candidate details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <UserCheck className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Candidate Details</h2>
              <p className="text-gray-600">Training enrollment and progress</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-auto max-h-[calc(90vh-200px)] p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Candidate Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidate Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">{candidate.learner?.full_name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">{candidate.learner?.phone_number || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">{candidate.learner?.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">Enrolled: {formatDate(candidate.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Details */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="text-lg font-bold text-gray-900">
                      {progress.progress_percentage || 0}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        progress.progress_percentage >= 80 ? 'bg-green-500' :
                        progress.progress_percentage >= 50 ? 'bg-blue-500' :
                        'bg-yellow-500'
                      }`}
                      style={{ width: `${Math.min(progress.progress_percentage || 0, 100)}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">Completed Modules</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {progress.completed_modules || 0}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">Total Modules</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {progress.total_modules || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Training Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm">{candidate.training?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Timer className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm">
                      Last Activity: {formatDate(progress.last_activity)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Control */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Control</h3>
                <div className="space-y-3">
                  <select
                    value={progress.status || 'pending'}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    disabled={updating}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                  {progress.is_completed && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center text-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">All modules completed!</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      if (progress.is_completed && progress.status !== 'completed') {
                        handleStatusUpdate('completed');
                      }
                    }}
                    disabled={!progress.is_completed || progress.status === 'completed' || updating}
                    className={`w-full py-2.5 rounded-lg font-medium ${
                      progress.is_completed && progress.status !== 'completed'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {updating ? (
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    ) : (
                      "Mark as Completed"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      onDelete(candidate.id);
                      onClose();
                    }}
                    className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-medium"
                  >
                    Delete Candidate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {progress.is_completed 
                ? "Training completed successfully" 
                : `${(progress.total_modules || 0) - (progress.completed_modules || 0)} modules remaining`}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}