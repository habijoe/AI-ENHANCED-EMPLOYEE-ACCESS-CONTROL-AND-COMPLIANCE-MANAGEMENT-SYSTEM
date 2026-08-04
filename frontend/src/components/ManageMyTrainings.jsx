/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { 
  Calendar,
  Clock, 
  User, 
  CheckCircle, 
  AlertCircle, 
  PlayCircle,
  Search, 
  Download,
  Filter,
  BookOpen,
  GraduationCap,
  Users,
  Eye,
  Plus,
  ChevronLeft,
  ChevronRight,
  Shield,
  TrendingUp,
  Award,
  Target,
  Activity,
  FileText,
  FileSpreadsheet,
  BarChart3,
  Layers,
  Lock
} from "lucide-react";

export function EmployeeTrainings() {
  const [trainingData, setTrainingData] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [trainingsPerPage, setTrainingsPerPage] = useState(6);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);
  const navigate = useNavigate();

  const accessToken = localStorage.getItem("access_token");

  useEffect(() => {
    if (!accessToken) {
      alert("Unauthorized! Please log in again.");
      navigate("/login");
    }
  }, [accessToken, navigate]);

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  };

  const handleFetch = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/candidate/my_trainings/",
        axiosConfig
      );
      console.log("My trainings data:", res.data);
      
      if (Array.isArray(res.data)) {
        setTrainingData(res.data);
        await fetchAllProgressData(res.data);
      } else {
        setTrainingData([]);
      }
    } catch (err) {
      console.error("Error fetching trainings:", err);
      if (err.response && err.response.status === 401) {
        alert("Session expired. Please log in again.");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProgressData = async (trainings) => {
    setProgressLoading(true);
    const progressMap = {};
    
    try {
      await Promise.all(
        trainings.map(async (training) => {
          if (training.training?.id) {
            try {
              console.log(`Fetching progress for training: ${training.training.id}`);
              
              // First, get detailed training data to get modules
              const trainingDetailsRes = await axios.get(
                `http://127.0.0.1:8000/training/${training.training.id}/`,
                axiosConfig
              );
              
              const trainingDetails = trainingDetailsRes.data;
              const totalModules = trainingDetails.modules?.length || 0;
              
              // Then get progress data
              let completedModules = 0;
              let progressPercentage = 0;
              
              try {
                const progressRes = await axios.get(
                  `http://127.0.0.1:8000/learning-progress/training/${training.training.id}/progress/`,
                  axiosConfig
                );
                
                console.log(`Progress data for training ${training.training.id}:`, progressRes.data);
                
                const progressData = progressRes.data;
                
                if (progressData.module_completions && totalModules > 0) {
                  completedModules = progressData.module_completions.filter(
                    completion => completion.is_completed === true
                  ).length;
                  
                  progressPercentage = Math.round((completedModules / totalModules) * 100);
                }
              } catch (progressError) {
                console.warn(`Could not fetch progress for training ${training.training.id}:`, progressError);
                // Use fallback progress endpoint
                try {
                  const fallbackRes = await axios.get(
                    `http://127.0.0.1:8000/progress/training/${training.training.id}/progress/`,
                    axiosConfig
                  );
                  
                  const fallbackData = fallbackRes.data;
                  if (fallbackData.module_completions && totalModules > 0) {
                    completedModules = fallbackData.module_completions.filter(
                      completion => completion.is_completed === true
                    ).length;
                    
                    progressPercentage = Math.round((completedModules / totalModules) * 100);
                  }
                } catch (fallbackError) {
                  console.warn(`Fallback progress also failed for training ${training.training.id}:`, fallbackError);
                }
              }
              
              const allModulesCompleted = completedModules === totalModules && totalModules > 0;
              
              progressMap[training.training.id] = {
                completed_modules: completedModules,
                total_modules: totalModules,
                progress_percentage: progressPercentage,
                all_modules_completed: allModulesCompleted,
                is_training_completed: allModulesCompleted,
                training_name: trainingDetails.name || training.training?.name || "Untitled Training",
                training_description: trainingDetails.description || "No description available"
              };
              
            } catch (error) {
              console.error(`Error processing training ${training.training.id}:`, error);
              progressMap[training.training.id] = {
                completed_modules: 0,
                total_modules: 0,
                progress_percentage: 0,
                all_modules_completed: false,
                is_training_completed: false,
                training_name: training.training?.name || "Untitled Training",
                training_description: training.training?.description || "No description available"
              };
            }
          }
        })
      );
      setProgressData(progressMap);
    } catch (error) {
      console.error("Error fetching progress data:", error);
    } finally {
      setProgressLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      handleFetch();
    }
  }, [accessToken]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePerPageChange = (e) => {
    setTrainingsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const tableData = filteredData.map(training => {
      const progress = progressData[training.training?.id] || {};
      return [
        training.training?.name || "N/A",
        training.status,
        training.training?.created_by?.phone || "N/A",
        new Date(training.created_at).toLocaleDateString(),
        progress.total_modules || 0,
        `${progress.progress_percentage || 0}%`,
        progress.is_training_completed ? "Yes" : "No"
      ];
    });
    
    doc.autoTable({
      head: [['Training Name', 'Status', 'Created By', 'Enrolled Date', 'Total Modules', 'Progress', 'Completed']],
      body: tableData,
    });
    doc.save("my-trainings.pdf");
  };

  const handleDownloadExcel = () => {
    const excelData = filteredData.map(training => {
      const progress = progressData[training.training?.id] || {};
      return {
        'Training Name': training.training?.name || "N/A",
        'Status': training.status,
        'Created By': training.training?.created_by?.phone || "N/A",
        'Enrolled Date': new Date(training.created_at).toLocaleDateString(),
        'Total Modules': progress.total_modules || 0,
        'Completed Modules': progress.completed_modules || 0,
        'Progress': `${progress.progress_percentage || 0}%`,
        'Training Completed': progress.is_training_completed ? 'Yes' : 'No'
      };
    });
    
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "My Trainings");
    XLSX.writeFile(workbook, "my-trainings.xlsx");
  };

  const filteredData = trainingData.filter((training) => {
    const searchTerms = searchQuery.toLowerCase();
    
    // Filter by training completion status if selected
    if (statusFilter === "completed") {
      const progress = progressData[training.training?.id] || {};
      if (!progress.is_training_completed) return false;
    } else if (statusFilter === "in_progress") {
      const progress = progressData[training.training?.id] || {};
      if (progress.is_training_completed || (progress.progress_percentage || 0) === 0) return false;
    } else if (statusFilter === "pending") {
      const progress = progressData[training.training?.id] || {};
      if (progress.progress_percentage > 0 || progress.is_training_completed) return false;
    }
    
    if (searchTerms === "") return true;
    
    return (
      (training.training?.name || "").toLowerCase().includes(searchTerms) ||
      (training.status || "").toLowerCase().includes(searchTerms) ||
      (training.created_at || "").toLowerCase().includes(searchTerms)
    );
  });

  const totalTrainings = trainingData.length;
  const completedTrainings = trainingData.filter(t => {
    const progress = progressData[t.training?.id] || {};
    return progress.is_training_completed;
  }).length;
  const pendingTrainings = trainingData.filter(t => {
    const progress = progressData[t.training?.id] || {};
    return !progress.is_training_completed && (progress.progress_percentage || 0) === 0;
  }).length;
  const inProgressTrainings = trainingData.filter(t => {
    const progress = progressData[t.training?.id] || {};
    return !progress.is_training_completed && (progress.progress_percentage || 0) > 0;
  }).length;

  const averageProgress = trainingData.length > 0 
    ? trainingData.reduce((sum, training) => {
        const progress = progressData[training.training?.id] || {};
        const percentage = Number(progress.progress_percentage) || 0;
        return sum + percentage;
      }, 0) / trainingData.length
    : 0;

  const indexOfLastTraining = currentPage * trainingsPerPage;
  const indexOfFirstTraining = indexOfLastTraining - trainingsPerPage;
  const currentTrainings = filteredData.slice(
    indexOfFirstTraining,
    indexOfLastTraining
  );
  const totalPages = Math.ceil(filteredData.length / trainingsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { 
        icon: Clock, 
        text: 'Pending', 
        className: 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
      },
      completed: { 
        icon: CheckCircle, 
        text: 'Completed', 
        className: 'bg-green-100 text-green-800 border border-green-200' 
      },
      in_progress: { 
        icon: PlayCircle, 
        text: 'In Progress', 
        className: 'bg-blue-100 text-blue-800 border border-blue-200' 
      },
      rejected: { 
        icon: AlertCircle, 
        text: 'Rejected', 
        className: 'bg-red-100 text-red-800 border border-red-200' 
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${config.className}`}>
        <IconComponent className="w-3 h-3 mr-1.5" />
        {config.text}
      </span>
    );
  };

  const TrainingCard = ({ training }) => {
    const progress = progressData[training.training?.id] || {
      progress_percentage: 0,
      completed_modules: 0,
      total_modules: 0,
      is_training_completed: false
    };
    
    const progressPercentage = Math.round(progress.progress_percentage || 0);
    const isTrainingCompleted = progress.is_training_completed;
    const trainingName = training.training?.name || progress.training_name || "Untitled Training";
    
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200 overflow-hidden">
          {training.training?.picture_data ? (
            <img 
              src={`data:image/jpeg;base64,${training.training.picture_data}`}
              alt={trainingName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <GraduationCap className="w-16 h-16 text-blue-300" />
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            {isTrainingCompleted ? (
              <span className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-800 border border-green-200 rounded-full text-xs font-medium">
                <CheckCircle className="w-3 h-3 mr-1.5" />
                Training Completed
              </span>
            ) : (
              <StatusBadge status={training.status} />
            )}
          </div>
          
          {/* Progress Badge */}
          <div className="absolute top-4 left-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-3 h-3 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">{progressPercentage}%</span>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent h-16" />
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
            {trainingName}
          </h3>

          <div className="space-y-3 mb-4">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-sm">
                Enrolled: {new Date(training.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            
            <div className="flex items-center text-gray-600">
              <Layers className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-sm">
                {progress.completed_modules || 0} of {progress.total_modules || 0} modules completed
              </span>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-semibold text-blue-600">
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  isTrainingCompleted ? 'bg-green-500' :
                  progressPercentage >= 80 ? 'bg-green-500' : 
                  progressPercentage >= 50 ? 'bg-blue-500' : 
                  'bg-yellow-500'
                }`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Learning Goal</span>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                isTrainingCompleted 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {isTrainingCompleted ? 'Achieved' : 'In Progress'}
              </span>
            </div>
          </div>

          {isTrainingCompleted ? (
            <div className="w-full text-center bg-gray-50 border border-gray-200 text-gray-500 font-medium py-3 px-4 rounded-lg cursor-not-allowed">
              <div className="flex items-center justify-center">
                <Lock className="w-4 h-4 mr-2" />
                Training Completed
              </div>
              <p className="text-xs mt-1">All modules have been completed</p>
            </div>
          ) : (
            <Link
              to={`/learner/myTrainingDetails/${training.training?.id}`}
              className="block w-full text-center bg-white border border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700 font-medium py-3 px-4 rounded-lg transition-all duration-300 shadow-sm hover:shadow group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600"
            >
              <div className="flex items-center justify-center">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </div>
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Training Programs</h1>
                <p className="text-gray-600 mt-1">Track your learning progress and achievements</p>
              </div>
            </div>
            <Link
              to="/learner/training"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Enroll New Training
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Trainings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalTrainings}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{completedTrainings}</p>
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
                <p className="text-2xl font-bold text-gray-900 mt-1">{inProgressTrainings}</p>
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
                <p className="text-2xl font-bold text-gray-900 mt-1">{Math.round(averageProgress)}%</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Filter className="w-5 h-5 text-gray-400" />
                </div>
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="all">All Trainings</option>
                  <option value="completed">Completed Trainings</option>
                  <option value="in_progress">In Progress</option>
                  <option value="pending">Not Started</option>
                </select>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search trainings by name, status..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Show:</label>
                <select
                  value={trainingsPerPage}
                  onChange={handlePerPageChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value={6}>6 per page</option>
                  <option value={12}>12 per page</option>
                  <option value={24}>24 per page</option>
                </select>
              </div>

              {/* <div className="flex gap-2">
                <button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  title="Download PDF"
                >
                  <FileText className="h-4 w-4" />
                  PDF
                </button>
                <button
                  onClick={handleDownloadExcel}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  title="Download Excel"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel
                </button>
              </div> */}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your trainings...</p>
            </div>
          </div>
        ) : (
          <>
            {currentTrainings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {currentTrainings.map((training) => (
                    <TrainingCard key={training.id} training={training} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                      Showing {indexOfFirstTraining + 1}-{Math.min(indexOfLastTraining, filteredData.length)} of {filteredData.length} trainings
                      {progressLoading && (
                        <span className="ml-4 text-blue-600">
                          <Activity className="w-4 h-4 inline mr-1" />
                          Loading progress...
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === 1 
                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                          const page = index + Math.max(1, currentPage - 2);
                          if (page > totalPages) return null;
                          
                          return (
                            <button
                              key={page}
                              onClick={() => paginate(page)}
                              className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                                currentPage === page
                                  ? "bg-blue-600 text-white"
                                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button 
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === totalPages 
                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchQuery || statusFilter !== "all" ? 
                      "No matching trainings found" : 
                      "No trainings enrolled yet"
                    }
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchQuery || statusFilter !== "all" ? 
                      "Try adjusting your search or filter criteria" : 
                      "Start your learning journey by enrolling in available trainings"
                    }
                  </p>
                  {(!searchQuery && statusFilter === "all") && (
                    <Link
                      to="/learner/training"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Browse Available Trainings
                    </Link>
                  )}
                  {(searchQuery || statusFilter !== "all") && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}