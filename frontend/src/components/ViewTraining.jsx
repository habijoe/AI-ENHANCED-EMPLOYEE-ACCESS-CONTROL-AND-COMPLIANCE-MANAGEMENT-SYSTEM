/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  File,
  Image,
  Upload,
  X,
  Check,
  Edit,
  Trash2,
  Download,
  Plus,
  ChevronDown,
  ChevronUp,
  Eye,
  Video,
  FileText,
  Presentation,
  Layers,
  Users,
  Calendar,
  Clock,
  FolderOpen,
  BarChart3,
  FileSpreadsheet,
  FileImage,
  AlertCircle
} from "lucide-react";

export function AdminViewTraining() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [training, setTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expandedModules, setExpandedModules] = useState([]);
  const [editMode, setEditMode] = useState({
    training: false,
    modules: {},
  });
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    picture: null,
    picturePreview: null,
  });

  useEffect(() => {
    const fetchTraining = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/training/${id}/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        setTraining(response.data);
        setEditData({
          name: response.data.name,
          description: response.data.description || "",
          picture: null,
          picturePreview: response.data.picture_data
            ? `data:image/jpeg;base64,${response.data.picture_data}`
            : null,
        });
        setLoading(false);
      } catch (err) {
        setError(
          err.response?.data?.error || "Failed to fetch training details"
        );
        setLoading(false);
      }
    };

    fetchTraining();
  }, [id]);

  const toggleModuleExpand = (moduleId) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleTrainingEdit = () => {
    setEditMode((prev) => ({ ...prev, training: !prev.training }));
  };

  const handleTrainingChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData((prev) => ({
          ...prev,
          picture: file,
          picturePreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleModuleEdit = (moduleId) => {
    setEditMode((prev) => ({
      ...prev,
      modules: {
        ...prev.modules,
        [moduleId]: !prev.modules[moduleId],
      },
    }));
  };

  const handleModuleChange = (moduleId, e) => {
    const { name, value } = e.target;
    setTraining((prev) => ({
      ...prev,
      modules: prev.modules.map((module) =>
        module.id === moduleId ? { ...module, [name]: value } : module
      ),
    }));
  };

  const handleMaterialUpload = async (moduleId, e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("materials", file));

      const response = await axios.post(
        `http://127.0.0.1:8000/training/modules/${moduleId}/materials/upload/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedResponse = await axios.get(
        `http://127.0.0.1:8000/training/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      setTraining(updatedResponse.data);
      setSuccess("Materials uploaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload materials");
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm("Are you sure you want to delete this material?"))
      return;

    try {
      await axios.delete(
        `http://127.0.0.1:8000/training/materials/${materialId}/delete/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      const updatedResponse = await axios.get(
        `http://127.0.0.1:8000/training/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      setTraining(updatedResponse.data);
      setSuccess("Material deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete material");
    }
  };

  const handleAddModule = async () => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/training/${id}/modules/create/`,
        {
          name: "New Module",
          description: "",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      const updatedResponse = await axios.get(
        `http://127.0.0.1:8000/training/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      setTraining(updatedResponse.data);
      setSuccess("Module added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add module");
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this module and all its materials?"
      )
    )
      return;

    try {
      await axios.delete(
        `http://127.0.0.1:8000/training/modules/${moduleId}/delete/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      const updatedResponse = await axios.get(
        `http://127.0.0.1:8000/training/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      setTraining(updatedResponse.data);
      setSuccess("Module deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete module");
    }
  };

  const handleSaveTraining = async () => {
    try {
      const formData = new FormData();
      formData.append("name", editData.name);
      formData.append("description", editData.description);
      if (editData.picture) {
        formData.append("picture_data", editData.picture);
      }

      await axios.put(
        `http://127.0.0.1:8000/training/update/${id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedResponse = await axios.get(
        `http://127.0.0.1:8000/training/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      setTraining(updatedResponse.data);
      setEditMode((prev) => ({ ...prev, training: false }));
      setSuccess("Training updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update training");
    }
  };

  const handleSaveModule = async (moduleId) => {
    const module = training.modules.find((m) => m.id === moduleId);
    if (!module) return;

    try {
      await axios.put(
        `http://127.0.0.1:8000/training/modules/${moduleId}/update/`,
        {
          name: module.name,
          description: module.description,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      setEditMode((prev) => ({
        ...prev,
        modules: {
          ...prev.modules,
          [moduleId]: false,
        },
      }));
      setSuccess("Module updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update module");
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch(extension) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'ppt':
      case 'pptx':
        return <Presentation className="h-5 w-5 text-orange-500" />;
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImage className="h-5 w-5 text-purple-500" />;
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'webm':
        return <Video className="h-5 w-5 text-indigo-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const renderMaterial = (material) => {
    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 mb-2 hover:bg-gray-100 transition-colors">
        <div className="flex items-center flex-1 min-w-0">
          {getFileIcon(material.filename)}
          <div className="ml-3 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {material.filename}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded">
                {material.file_type.toUpperCase()}
              </span>
              <span className="text-xs text-gray-500">
                {material.file_size}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
          <button
            onClick={() => window.open(material.download_url, '_blank')}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDownloadMaterial(material)}
            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteMaterial(material.id)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  const handleDownloadMaterial = async (material) => {
    try {
      const response = await axios.get(material.download_url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = material.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      window.open(material.download_url, "_blank");
    }
  };

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

  if (!training) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || "Training not found"}
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors mt-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="font-medium">Back to Trainings</span>
          </button>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {editMode.training ? (
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleTrainingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Training Name"
                    />
                  ) : (
                    training.name
                  )}
                </h1>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                  Training ID: {id.slice(0, 8)}...
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Created: {new Date(training.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Last updated: {new Date(training.updated_at || training.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            <button
              onClick={
                editMode.training ? handleSaveTraining : handleTrainingEdit
              }
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                editMode.training
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {editMode.training ? (
                <>
                  <Check className="h-4 w-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4" />
                  Edit Training
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Messages */}
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
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Training Overview Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Training Overview</h2>
            <p className="text-sm text-gray-600 mt-1">Basic details and statistics</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Training Image and Description */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  {editMode.training ? (
                    <textarea
                      id="description"
                      name="description"
                      value={editData.description}
                      onChange={handleTrainingChange}
                      rows={4}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Training description"
                    />
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        {training.description || "No description provided"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center mb-2">
                      <Layers className="h-5 w-5 text-blue-600 mr-2" />
                      <p className="text-blue-700 font-medium">Modules</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {training.modules_count || training.modules?.length || 0}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <div className="flex items-center mb-2">
                      <FolderOpen className="h-5 w-5 text-purple-600 mr-2" />
                      <p className="text-purple-700 font-medium">Materials</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {training.total_materials_count || 
                       training.modules?.reduce((acc, module) => acc + (module.materials?.length || 0), 0) || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <div className="flex items-center mb-2">
                      <Users className="h-5 w-5 text-green-600 mr-2" />
                      <p className="text-green-700 font-medium">Enrolled</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {training.enrolled_count || 0}
                    </p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                    <div className="flex items-center mb-2">
                      <BarChart3 className="h-5 w-5 text-amber-600 mr-2" />
                      <p className="text-amber-700 font-medium">Completion</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {training.completion_rate ? `${training.completion_rate}%` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Training Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Training Image
                </label>
                {editMode.training ? (
                  <div className="space-y-3">
                    <label
                      htmlFor="picture"
                      className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors group"
                    >
                      {editData.picturePreview ? (
                        <img
                          src={editData.picturePreview}
                          alt="Preview"
                          className="h-full w-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-6">
                          <Upload className="w-10 h-10 mb-3 text-gray-400 group-hover:text-gray-600" />
                          <p className="mb-1 text-sm text-gray-600">
                            <span className="font-semibold">Click to upload</span>
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                      )}
                      <input
                        id="picture"
                        name="picture"
                        type="file"
                        onChange={handlePictureChange}
                        className="hidden"
                        accept="image/*"
                      />
                    </label>
                    {editData.picturePreview && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditData((prev) => ({
                            ...prev,
                            picture: null,
                            picturePreview: null,
                          }))
                        }
                        className="w-full px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg font-medium transition-colors"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="h-48 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                    {training.picture_data || editData.picturePreview ? (
                      <img
                        src={training.picture_data 
                          ? `data:image/jpeg;base64,${training.picture_data}`
                          : editData.picturePreview
                        }
                        alt="Training"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No image</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modules Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Training Modules</h2>
              <p className="text-sm text-gray-600 mt-1">
                {training.modules?.length || 0} module(s) • Expand to view materials
              </p>
            </div>
            <button
              onClick={handleAddModule}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add New Module
            </button>
          </div>
          <div className="p-6">
            {training.modules?.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Modules Yet</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  Start by adding modules to organize your training materials
                </p>
                <button
                  onClick={handleAddModule}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Module
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {training.modules?.map((module) => (
                  <div
                    key={module.id}
                    className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/50 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100/50 transition-colors"
                      onClick={() => toggleModuleExpand(module.id)}>
                      <div className="flex items-center flex-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleModuleExpand(module.id);
                          }}
                          className="mr-3 text-gray-500 hover:text-gray-700"
                        >
                          {expandedModules.includes(module.id) ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
                        <div className="flex-1">
                          {editMode.modules[module.id] ? (
                            <input
                              type="text"
                              name="name"
                              value={module.name}
                              onChange={(e) => handleModuleChange(module.id, e)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Module name"
                            />
                          ) : (
                            <h3 className="text-lg font-semibold text-gray-900">
                              {module.name}
                            </h3>
                          )}
                          {!editMode.modules[module.id] && (
                            <p className="text-sm text-gray-500 mt-1">
                              {module.materials?.length || 0} materials
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (editMode.modules[module.id]) {
                              handleSaveModule(module.id);
                            } else {
                              handleModuleEdit(module.id);
                            }
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            editMode.modules[module.id]
                              ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                              : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          }`}
                        >
                          {editMode.modules[module.id] ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <Edit className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteModule(module.id);
                          }}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {expandedModules.includes(module.id) && (
                      <div className="p-4 border-t border-gray-200 bg-white">
                        {/* Module Description */}
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                          {editMode.modules[module.id] ? (
                            <textarea
                              name="description"
                              value={module.description || ''}
                              onChange={(e) => handleModuleChange(module.id, e)}
                              rows={3}
                              className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                              placeholder="Module description"
                            />
                          ) : (
                            <div className="prose prose-sm max-w-none">
                              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                {module.description || "No description provided"}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Materials Section */}
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-700">Training Materials</h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {module.materials?.length || 0} file(s) uploaded
                              </p>
                            </div>
                            <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium cursor-pointer transition-colors">
                              <Upload className="h-4 w-4" />
                              Upload Files
                              <input
                                type="file"
                                multiple
                                onChange={(e) => handleMaterialUpload(module.id, e)}
                                className="hidden"
                                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.mp4,.mov,.avi,.webm"
                              />
                            </label>
                          </div>

                          {module.materials?.length === 0 ? (
                            <div className="text-center py-8 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50">
                              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                              <p className="text-gray-500 mb-1">No materials added yet</p>
                              <p className="text-sm text-gray-400">Upload files to get started</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {module.materials?.map((material) => (
                                <div key={material.id}>
                                  {renderMaterial(material)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}