/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  GraduationCap,
  Loader2,
  BookOpen,
  Calendar,
  Star,
  Eye,
  PlusCircle,
  Shield,
  Award,
  RefreshCw 
} from "lucide-react";

export function ApplyNewTraining() {
  const token = localStorage.getItem("access_token");
  const [unregisteredTrainings, setUnregisteredTrainings] = useState([]);
  const [filteredTrainings, setFilteredTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTraining, setSelectedTraining] = useState(null);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    popular: 0,
    new: 0,
    featured: 0
  });

  // Fetch unregistered trainings on component mount
  useEffect(() => {
    fetchUnregisteredTrainings();
  }, []);

  const fetchUnregisteredTrainings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        'http://127.0.0.1:8000/candidate/trainings/unregistered/',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const trainings = response.data.data;
        setUnregisteredTrainings(trainings);
        setFilteredTrainings(trainings);
        
        // Calculate statistics
        const total = trainings.length;
        const popular = trainings.filter(t => t.popularity_stats?.total_candidates > 10).length;
        const newTrainings = trainings.filter(t => {
          const createdDate = new Date(t.created_at);
          const now = new Date();
          const diffDays = (now - createdDate) / (1000 * 60 * 60 * 24);
          return diffDays < 7; // Less than 7 days old
        }).length;
        const featured = trainings.filter(t => t.popularity_stats?.completion_rate > 80).length;

        setStats({
          total,
          popular,
          new: newTrainings,
          featured
        });
      }
    } catch (error) {
      console.error("Error fetching unregistered trainings:", error);
      setErrorMessage("Failed to load available trainings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter trainings based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTrainings(unregisteredTrainings);
      return;
    }

    const filtered = unregisteredTrainings.filter(training =>
      training.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      training.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      training.created_by?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTrainings(filtered);
  }, [searchQuery, unregisteredTrainings]);

  // Handle training selection
  const handleTrainingSelect = (training) => {
    setSelectedTraining(training);
  };

  // Handle training application
  const handleApplyForTraining = async (trainingId) => {
    try {
      setApplying(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await axios.post(
        'http://127.0.0.1:8000/candidate/create/',
        {
          training_id: trainingId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage("Successfully enrolled in training!");
      
      // Remove the applied training from the list
      setUnregisteredTrainings(prev => prev.filter(t => t.id !== trainingId));
      setFilteredTrainings(prev => prev.filter(t => t.id !== trainingId));
      
      // Reset selected training
      setSelectedTraining(null);
      
      // Refresh stats
      setTimeout(() => {
        fetchUnregisteredTrainings();
      }, 1500);

    } catch (error) {
      console.error("Error applying for training:", error);
      setErrorMessage(
        error.response?.data?.detail || 
        error.response?.data?.error || 
        "Failed to apply for training. Please try again."
      );
    } finally {
      setApplying(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get module count
  const getModuleCount = (training) => {
    return training.modules?.length || 0;
  };

  // Get material count
  const getMaterialCount = (training) => {
    if (!training.modules) return 0;
    return training.modules.reduce((total, module) => {
      return total + (module.materials?.length || 0);
    }, 0);
  };

  // Get enrollment status badge
  const getEnrollmentBadge = (training) => {
    const candidates = training.popularity_stats?.total_candidates || 0;
    if (candidates > 20) return { label: "High Demand", color: "bg-red-100 text-red-800" };
    if (candidates > 10) return { label: "Popular", color: "bg-orange-100 text-orange-800" };
    if (candidates === 0) return { label: "New", color: "bg-blue-100 text-blue-800" };
    return { label: "Available", color: "bg-green-100 text-green-800" };
  };

  // Get completion rate color
  const getCompletionRateColor = (rate) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-sm">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Available Trainings</h1>
                <p className="text-gray-600 mt-1">Discover and enroll in new training programs</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/learner/trainings"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                My Trainings
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Trainings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Popular Courses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.popular}</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New This Week</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.new}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <Award className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Success Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.featured}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search trainings by name, description, or instructor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3 pl-12 pr-4 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Showing {filteredTrainings.length} of {unregisteredTrainings.length} available trainings
          </p>
        </div>

        {/* Status Messages */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-red-700 font-medium">Error</p>
                <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-green-700 font-medium">Success</p>
                <p className="text-green-600 text-sm mt-1">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading available trainings...</p>
          </div>
        ) : filteredTrainings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No trainings found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? "No trainings match your search criteria."
                  : "You're enrolled in all available trainings or no trainings are currently available."
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Trainings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Trainings List */}
              <div className="lg:col-span-2 space-y-4">
                {filteredTrainings.map((training) => {
                  const enrollmentBadge = getEnrollmentBadge(training);
                  const completionRate = training.popularity_stats?.completion_rate || 0;
                  
                  return (
                    <div
                      key={training.id}
                      className={`bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                        selectedTraining?.id === training.id 
                          ? 'border-blue-500 shadow-sm' 
                          : 'border-gray-200'
                      }`}
                      onClick={() => handleTrainingSelect(training)}
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-2 rounded-lg">
                                <GraduationCap className="h-5 w-5 text-blue-600" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">{training.name}</h3>
                              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${enrollmentBadge.color}`}>
                                {enrollmentBadge.label}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                              {training.description || "No description available"}
                            </p>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                              <div className="flex items-center gap-1.5">
                                <BookOpen className="h-4 w-4" />
                                <span>{getModuleCount(training)} modules</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Eye className="h-4 w-4" />
                                <span>{getMaterialCount(training)} materials</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(training.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${
                            selectedTraining?.id === training.id ? 'rotate-90' : ''
                          }`} />
                        </div>

                        {/* Progress and Stats */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">
                                {training.popularity_stats?.total_candidates || 0} enrolled
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    completionRate >= 80 ? 'bg-green-500' :
                                    completionRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(completionRate, 100)}%` }}
                                />
                              </div>
                              <span className={`text-sm font-medium ${getCompletionRateColor(completionRate)}`}>
                                {completionRate}% success
                              </span>
                            </div>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyForTraining(training.id);
                            }}
                            disabled={applying}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors text-sm"
                          >
                            {applying && selectedTraining?.id === training.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Applying...
                              </>
                            ) : (
                              <>
                                <PlusCircle className="h-4 w-4" />
                                Enroll Now
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Training Details Sidebar */}
              <div className="lg:col-span-1">
                {selectedTraining ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24 shadow-sm">
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Training Details</h3>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        <Shield className="h-4 w-4" />
                        Available for Enrollment
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Instructor</h4>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {selectedTraining.created_by?.full_name?.charAt(0) || 'I'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {selectedTraining.created_by?.full_name || 'System Administrator'}
                            </p>
                            <p className="text-sm text-gray-500">Training Creator</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Course Structure</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Modules</span>
                            <span className="font-semibold">{getModuleCount(selectedTraining)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Learning Materials</span>
                            <span className="font-semibold">{getMaterialCount(selectedTraining)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Created On</span>
                            <span className="font-semibold">{formatDate(selectedTraining.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Success Metrics</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Enrollments</span>
                            <span className="font-semibold">
                              {selectedTraining.popularity_stats?.total_candidates || 0}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Completion Rate</span>
                            <span className={`font-semibold ${getCompletionRateColor(selectedTraining.popularity_stats?.completion_rate || 0)}`}>
                              {selectedTraining.popularity_stats?.completion_rate || 0}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Active Learners</span>
                            <span className="font-semibold">
                              {selectedTraining.popularity_stats?.pending_candidates || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleApplyForTraining(selectedTraining.id)}
                          disabled={applying}
                          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
                        >
                          {applying ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Processing Enrollment...
                            </>
                          ) : (
                            <>
                              <PlusCircle className="h-5 w-5" />
                              Enroll in This Training
                            </>
                          )}
                        </button>
                        <p className="text-center text-sm text-gray-500 mt-3">
                          Enrollment is immediate. Start learning right away!
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Eye className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Training</h3>
                    <p className="text-gray-600">
                      Click on any training from the list to view detailed information and enrollment options.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Footer Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6 mt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help Choosing?</h3>
              <p className="text-gray-600">
                Browse through available trainings, check completion rates, and enroll in programs that match your learning goals.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/learner/trainings"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
              >
                View My Current Trainings
              </Link>
              <button
                onClick={fetchUnregisteredTrainings}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh List
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}