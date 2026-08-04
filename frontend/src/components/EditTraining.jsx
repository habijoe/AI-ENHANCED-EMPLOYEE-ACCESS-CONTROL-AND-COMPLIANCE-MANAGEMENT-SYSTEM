/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { 
  ArrowLeft, 
  Upload, 
  File, 
  X, 
  Check, 
  FileText, 
  Film, 
  Download,
  AlertCircle
} from "lucide-react";

export function EditTraining(){
  const { id } = useParams();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [newMaterials, setNewMaterials] = useState([]);
  const [existingMaterials, setExistingMaterials] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('EditTraining component mounted');
    console.log('Training ID from URL:', id);
    console.log('Full URL:', window.location.href);
    
    if (!id) {
      console.error('No ID parameter found in URL');
      alert('Invalid training ID. Redirecting to training list.');
      navigate('/admin/training');
    }
  }, [id, navigate]);

  // Fetch the training data by ID
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      console.error("No token found. Training is not authenticated.");
      setErrorMessage("No token found. Please login first.");
      return;
    }

    setLoading(true);
    axios
      .get(`http://127.0.0.1:8000/training/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data) {
          setData(res.data);
          setExistingMaterials(res.data.materials || []);
        }
      })
      .catch((err) => {
        setErrorMessage(err.response?.data?.message || "Error fetching training data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // Update the training data
  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");

    if (!token) {
      setErrorMessage("No token found. Please login first.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Create a FormData object to send data including files
    const formData = new FormData();
    formData.append("name", data.name);
    
    // Append new materials
    newMaterials.forEach((file) => {
      formData.append("materials", file);
    });

    // Also include existing materials that weren't removed
    existingMaterials.forEach((material) => {
      formData.append("existing_materials", JSON.stringify(material));
    });

    axios
      .put(`http://127.0.0.1:8000/training/update/${id}/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        setSuccessMessage("Training updated successfully!");
        setTimeout(() => {
          navigate("/admin/training");
        }, 2000);
      })
      .catch((err) => {
        setErrorMessage(err.response?.data?.message || "Error updating training.");
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewMaterials(files);
  };

  const handleRemoveNewMaterial = (index) => {
    setNewMaterials((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingMaterial = (index) => {
    setExistingMaterials((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileName) => {
    if (fileName.includes('.pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (fileName.match(/\.(mp4|avi|mkv|mov)$/i)) return <Film className="h-5 w-5 text-blue-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/training")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="font-medium">Back to Trainings</span>
          </button>
          <div className="border-l-4 border-blue-600 pl-4">
            <h1 className="text-3xl font-bold text-gray-900">Edit Training Program</h1>
            <p className="text-gray-600 mt-2">Update your training program details and materials</p>
          </div>
        </div>

        {/* Status Messages */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 font-medium">{errorMessage}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
            <div className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-green-700 font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Training Information Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Training Details</h2>
                <p className="text-sm text-gray-600 mt-1">Update the training name and materials</p>
              </div>
              <div className="px-6 py-6 space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Training Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={data.name || ""}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter training name"
                  />
                </div>

                {/* Existing Materials Section */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Existing Materials</h3>
                  {existingMaterials.length === 0 ? (
                    <div className="text-center py-8 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50">
                      <File className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No materials uploaded yet</p>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <div className="divide-y divide-gray-200">
                        {existingMaterials.map((material, index) => (
                          <div key={index} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center min-w-0 flex-1">
                              {getFileIcon(material.name || material.file)}
                              <div className="ml-3 min-w-0">
                                <p className="text-sm font-medium text-gray-700 truncate">
                                  {material.name || material.file.split('/').pop()}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {material.file.split('.').pop().toUpperCase()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 ml-4">
                              <a
                                href={material.file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                                title="Download"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                              <button
                                type="button"
                                onClick={() => handleRemoveExistingMaterial(index)}
                                className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                                title="Remove"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload New Materials Section */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Materials</h3>
                  <label
                    htmlFor="materials"
                    className="flex flex-col items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors p-8 group"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="w-10 h-10 mb-3 text-gray-400 group-hover:text-gray-600" />
                      <p className="mb-2 text-sm text-gray-600">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, MP4, AVI, MKV files up to 50MB
                      </p>
                    </div>
                    <input
                      id="materials"
                      name="materials"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.mp4,.avi,.mkv"
                      className="hidden"
                      multiple
                    />
                  </label>

                  {/* New Files Preview */}
                  {newMaterials.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">New Files to Upload:</h4>
                      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                        <div className="divide-y divide-gray-200">
                          {newMaterials.map((file, index) => (
                            <div key={index} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                              <div className="flex items-center min-w-0">
                                {getFileIcon(file.name)}
                                <span className="ml-3 text-sm text-gray-700 truncate">{file.name}</span>
                                <span className="ml-2 text-xs text-gray-500">
                                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveNewMaterial(index)}
                                className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/admin/training")}
                className="px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors shadow-sm"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="-ml-1 mr-3 h-5 w-5" />
                    Update Training
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
