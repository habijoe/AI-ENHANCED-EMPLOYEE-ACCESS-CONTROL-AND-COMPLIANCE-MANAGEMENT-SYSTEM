/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Shield,
  BookOpen,
  CheckCircle,
  BarChart2,
  ArrowLeft,
  FileText,
  Video,
  File,
  Calendar,
  Clock,
  Award,
  PlayCircle,
  AlertCircle,
  Download,
  Eye,
  Layers,
  Music,
  Image,
  X
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

export function EmployeeViewTrainingDetails() {
  const { id: trainingId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentModulePage, setCurrentModulePage] = useState(0);
  const [progressData, setProgressData] = useState(null);
  const [candidateId, setCandidateId] = useState(null);
  const [viewingMaterial, setViewingMaterial] = useState(null);
  const [materialLoading, setMaterialLoading] = useState(false);

  const fetchTrainingData = useCallback(async () => {
    if (!trainingId) {
      setErrorMessage("Training ID is required");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setErrorMessage("No token found. Please login first.");
      return;
    }

    setLoading(true);
    try {
      // Fetch candidate data
      const candidatesResponse = await fetch(
        "http://127.0.0.1:8000/candidate/my_trainings/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!candidatesResponse.ok) {
        throw new Error(`Failed to fetch candidate data: ${candidatesResponse.status}`);
      }

      const candidatesData = await candidatesResponse.json();
      const candidateForTraining = candidatesData.find(
        (candidate) => candidate.training.id === parseInt(trainingId)
      );

      if (!candidateForTraining) {
        throw new Error("You are not registered for this training");
      }

      setCandidateId(candidateForTraining.id);

      // Fetch training details
      const trainingResponse = await fetch(
        `http://127.0.0.1:8000/candidate/${candidateForTraining.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!trainingResponse.ok) {
        throw new Error(`Failed to fetch training data: ${trainingResponse.status}`);
      }

      const trainingData = await trainingResponse.json();
      setData(trainingData);

      // Fetch progress data
      const progressResponse = await fetch(
        `http://127.0.0.1:8000/progress/training/${trainingId}/progress/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!progressResponse.ok) {
        throw new Error(`Failed to fetch progress data: ${progressResponse.status}`);
      }

      const progressJson = await progressResponse.json();
      console.log("Training Learning progress: ", progressJson);
      setProgressData(progressJson);

      // Find the first incomplete module or default to first module
      if (progressJson.module_completions && trainingData.training.modules) {
        const firstIncompleteModule = trainingData.training.modules.find(module => {
          const completion = progressJson.module_completions.find(mc => mc.module === module.id);
          return !completion || !completion.is_completed;
        });

        if (firstIncompleteModule) {
          const firstIncompleteIndex = trainingData.training.modules.findIndex(
            m => m.id === firstIncompleteModule.id
          );
          if (firstIncompleteIndex >= 0) {
            setCurrentModulePage(firstIncompleteIndex);
          }
        }
      }

    } catch (error) {
      setErrorMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [trainingId]);

  useEffect(() => {
    fetchTrainingData();
  }, [fetchTrainingData]);

  const handleMarkAsCompleted = async (moduleId) => {
    if (!candidateId) return;

    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/progress/module-completion/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ module_id: moduleId, is_completed: true })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Failed to mark module as completed", errorData);
        throw new Error("Failed to mark module as completed");
      }

      const result = await response.json();

      // Update progress data - update the specific module completion
      setProgressData(prev => {
        const updatedModuleCompletions = prev.module_completions.map(mc =>
          mc.module === moduleId
            ? { ...mc, is_completed: true, completed_at: new Date().toISOString() }
            : mc
        );

        return {
          ...prev,
          module_completions: updatedModuleCompletions,
          completed_modules: result.completed_modules,
          progress_percentage: result.progress_percentage
        };
      });

      // Auto-navigate to next incomplete module if available
      if (data?.training?.modules) {
        // Find next incomplete module
        const nextIncompleteModule = data.training.modules.find((module, index) => {
          if (index <= currentModulePage) return false; // Skip current and previous modules
          const completion = progressData.module_completions.find(mc => mc.module === module.id);
          return !completion || !completion.is_completed;
        });

        if (nextIncompleteModule) {
          const nextIncompleteIndex = data.training.modules.findIndex(
            m => m.id === nextIncompleteModule.id
          );
          if (nextIncompleteIndex >= 0) {
            setCurrentModulePage(nextIncompleteIndex);
          }
        }
      }

    } catch (error) {
      console.error("Error marking module as completed:", error);
      setErrorMessage("Failed to mark module as completed. Please try again.");
    }
  };

  const isViewableInSameTab = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const viewableExtensions = ['pdf', 'mp4', 'webm', 'ogg', 'avi', 'mov', 'mp3', 'wav', 'jpg', 'jpeg', 'png', 'gif'];
    return viewableExtensions.includes(extension);
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();

    switch (extension) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'mp4':
      case 'webm':
      case 'ogg':
      case 'avi':
      case 'mov':
        return <Video className="h-5 w-5 text-blue-500" />;
      case 'mp3':
      case 'wav':
      case 'ogg':
        return <Music className="h-5 w-5 text-purple-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-5 w-5 text-green-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleViewMaterial = useCallback((material) => {
    const fileName = material.file.split("/").pop();
    
    if (!isViewableInSameTab(fileName)) {
      // For non-viewable files, trigger download
      const materialFileUrl = `http://127.0.0.1:8000${material.file}`;
      window.open(materialFileUrl, '_blank');
      return;
    }

    setViewingMaterial(material);
  }, []);

  const closeMaterialViewer = () => {
    setViewingMaterial(null);
  };

  const renderMaterial = useCallback((material) => {
    const fileName = material.file.split("/").pop();
    const materialFileUrl = `http://127.0.0.1:8000${material.file}`;
    const fileExtension = fileName.split('.').pop().toLowerCase();
    const isViewable = isViewableInSameTab(fileName);

    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
        <div className="flex items-center flex-1 min-w-0">
          {getFileIcon(fileName)}
          <div className="ml-3 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {fileName}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded">
                {fileExtension.toUpperCase()}
              </span>
              {material.file_size && (
                <span className="text-xs text-gray-500">
                  {material.file_size}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
          {isViewable ? (
            <button
              onClick={() => handleViewMaterial(material)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View"
            >
              <Eye className="h-4 w-4" />
            </button>
          ) : (
            <span className="p-2 text-gray-400" title="Cannot preview this file type">
              <Eye className="h-4 w-4" />
            </span>
          )}
          <a
            href={materialFileUrl}
            download
            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </a>
        </div>
      </div>
    );
  }, [handleViewMaterial]);

  // Material Viewer Modal
  const renderMaterialViewer = () => {
    if (!viewingMaterial) return null;

    const fileName = viewingMaterial.file.split("/").pop();
    const extension = fileName.split('.').pop().toLowerCase();
    const materialFileUrl = `http://127.0.0.1:8000${viewingMaterial.file}`;

    // Get MIME type for video and audio
    const getMimeType = (ext) => {
      const mimeTypes = {
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'ogg': 'video/ogg',
        'avi': 'video/x-msvideo',
        'mov': 'video/quicktime',
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'ogg': 'audio/ogg',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif'
      };
      return mimeTypes[ext] || 'application/octet-stream';
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              {getFileIcon(fileName)}
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {fileName}
              </h3>
            </div>
            <button
              onClick={closeMaterialViewer}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            {/* PDF Viewer */}
            {extension === 'pdf' && (
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">
                    For PDF files, please download to view or use the browser's built-in PDF viewer.
                  </p>
                </div>
                <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg p-4">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">PDF preview is not available in this view</p>
                    <div className="flex gap-3 justify-center">
                      <a
                        href={materialFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        Open in Browser
                      </a>
                      <a
                        href={materialFileUrl}
                        download
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Video Viewer */}
            {['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(extension) && (
              <div className="flex flex-col h-full">
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-full max-w-4xl">
                    <video
                      controls
                      className="w-full rounded-lg shadow-lg"
                      controlsList="nodownload"
                      autoPlay
                    >
                      <source src={materialFileUrl} type={getMimeType(extension)} />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              </div>
            )}

            {/* Audio Viewer */}
            {['mp3', 'wav'].includes(extension) && (
              <div className="flex flex-col h-full">
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-full max-w-md bg-gray-50 p-6 rounded-xl shadow-lg">
                    <div className="flex items-center gap-4 mb-6">
                      <Music className="h-12 w-12 text-purple-600" />
                      <div>
                        <h4 className="font-medium text-gray-900 text-lg">{fileName}</h4>
                        <p className="text-sm text-gray-500">Audio file</p>
                      </div>
                    </div>
                    <audio
                      controls
                      className="w-full"
                      controlsList="nodownload"
                      autoPlay
                    >
                      <source src={materialFileUrl} type={getMimeType(extension)} />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              </div>
            )}

            {/* Image Viewer */}
            {['jpg', 'jpeg', 'png', 'gif'].includes(extension) && (
              <div className="flex flex-col h-full">
                <div className="flex-1 flex items-center justify-center">
                  <img
                    src={materialFileUrl}
                    alt={fileName}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {extension.toUpperCase()} File
            </span>
            <div className="flex gap-2">
              <a
                href={materialFileUrl}
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                Download
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const currentModule = useMemo(
    () => data?.training?.modules?.[currentModulePage],
    [data, currentModulePage]
  );

  const isModuleCompleted = useMemo(() => {
    if (!progressData?.module_completions || !currentModule) return false;
    const completion = progressData.module_completions.find(mc => mc.module === currentModule.id);
    return completion?.is_completed || false;
  }, [progressData, currentModule]);

  const allModulesCompleted = useMemo(() => {
    if (!progressData?.module_completions || !data?.training?.modules) return false;
    return data.training.modules.every(module => {
      const completion = progressData.module_completions.find(mc => mc.module === module.id);
      return completion?.is_completed;
    });
  }, [progressData, data]);

  const isFirstModule = currentModulePage === 0;
  const isLastModule = currentModulePage >= (data?.training?.modules?.length || 0) - 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading training details...</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md mx-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
                <p className="text-red-700">{errorMessage}</p>
                <button
                  onClick={() => navigate(-1)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !progressData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      {renderMaterialViewer()}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="font-medium">Back to My Trainings</span>
          </button>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-8 w-8 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    {data?.training?.name || "Training Details"}
                  </h2>
                  {/* <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                    Training ID: {trainingId.slice(0, 8)}...
                  </span> */}
                </div>
                <p className="text-gray-600">
                  {data?.training?.description || "Community Health Work Training Program"}
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Enrolled: {new Date(data?.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Status: {data?.status || 'Active'}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Overall Progress
                </span>
                <span className="text-sm font-medium text-blue-600">
                  {Math.round(parseFloat(progressData.progress_percentage || 0))}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(parseFloat(progressData.progress_percentage || 0))}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">
                  {progressData.completed_modules} of {progressData.total_modules} modules completed
                </span>
                <span className="text-xs text-gray-500">
                  Module {currentModulePage + 1} of {data?.training?.modules?.length || 0}
                </span>
              </div>
            </div>

            {/* Module Progress Indicators */}
            <div className="flex items-center justify-between mt-6">
              {data?.training?.modules?.map((module, index) => {
                const completion = progressData.module_completions?.find(mc => mc.module === module.id);
                const isCompleted = completion?.is_completed || false;
                const isCurrent = index === currentModulePage;

                return (
                  <div key={module.id} className="flex flex-col items-center">
                    <button
                      onClick={() => setCurrentModulePage(index)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isCurrent
                          ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2'
                          : isCompleted
                            ? 'bg-green-100 text-green-600 border border-green-200'
                            : 'bg-gray-100 text-gray-400 border border-gray-200'
                        }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </button>
                    <span className={`mt-2 text-xs font-medium truncate max-w-[80px] text-center ${isCurrent ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                      {module.name.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Module Content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {currentModule ? (
            <div className="p-6">
              {/* Module Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                        Module {currentModulePage + 1}
                      </span>
                      {isModuleCompleted && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Completed
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {currentModule.name}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-500">
                    {currentModule.materials?.length || 0} materials
                  </div>
                </div>

                {/* Module Description */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-700">
                    {currentModule.description || "No description available for this module."}
                  </p>
                </div>
              </div>

              {/* Materials Section */}
              {currentModule.materials?.length > 0 ? (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Learning Materials</h4>
                    <Layers className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="space-y-3">
                    {currentModule.materials.map((material, index) => (
                      <div key={index}>
                        {renderMaterial(material)}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-8 text-center py-8 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No materials available for this module</p>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentModulePage((prev) => Math.max(prev - 1, 0))}
                  disabled={isFirstModule}
                  className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${isFirstModule
                      ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                  Previous Module
                </button>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {!allModulesCompleted && (
                    <button
                      onClick={() => handleMarkAsCompleted(currentModule.id)}
                      disabled={isModuleCompleted}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${isModuleCompleted
                          ? 'bg-green-50 text-green-600 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                        }`}
                    >
                      {isModuleCompleted ? (
                        <>
                          <CheckCircle className="h-5 w-5" />
                          Module Completed
                        </>
                      ) : (
                        "Mark as Completed"
                      )}
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setCurrentModulePage((prev) => Math.min(prev + 1, data.training.modules.length - 1))}
                  disabled={isLastModule}
                  className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${isLastModule
                      ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Next Module
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Modules Available</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                This training doesn't have any modules yet. Please check back later or contact the training administrator.
              </p>
            </div>
          )}
        </div>

        {/* Completion Celebration */}
        {allModulesCompleted && (
          <div className="mt-8">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Award className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800 mb-1">
                      🎉 All Modules Completed!
                    </h3>
                    <p className="text-green-700">
                      You have successfully completed all modules in this training.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}