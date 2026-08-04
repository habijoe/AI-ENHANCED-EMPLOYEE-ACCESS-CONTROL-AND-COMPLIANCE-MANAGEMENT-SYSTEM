/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, File, FilePlus, FileMinus, Image, Upload, X, Check } from 'lucide-react';

export function CreateTraining() {
  const navigate = useNavigate();
  const [trainingData, setTrainingData] = useState({
    name: '',
    description: '',
    picture: null,
    picturePreview: null,
    modules: [{ name: '', description: '', materials: [] }]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleTrainingChange = (e) => {
    const { name, value } = e.target;
    setTrainingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTrainingData(prev => ({
          ...prev,
          picture: file,
          picturePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleModuleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedModules = [...trainingData.modules];
    updatedModules[index] = {
      ...updatedModules[index],
      [name]: value
    };
    setTrainingData(prev => ({
      ...prev,
      modules: updatedModules
    }));
  };

  const handleMaterialChange = (moduleIndex, e) => {
    const files = Array.from(e.target.files);
    const updatedModules = [...trainingData.modules];
    updatedModules[moduleIndex] = {
      ...updatedModules[moduleIndex],
      materials: [...updatedModules[moduleIndex].materials, ...files]
    };
    setTrainingData(prev => ({
      ...prev,
      modules: updatedModules
    }));
  };

  const removeMaterial = (moduleIndex, materialIndex) => {
    const updatedModules = [...trainingData.modules];
    updatedModules[moduleIndex].materials.splice(materialIndex, 1);
    setTrainingData(prev => ({
      ...prev,
      modules: updatedModules
    }));
  };

  const addModule = () => {
    setTrainingData(prev => ({
      ...prev,
      modules: [...prev.modules, { name: '', description: '', materials: [] }]
    }));
  };

  const removeModule = (index) => {
    if (trainingData.modules.length <= 1) return;
    const updatedModules = [...trainingData.modules];
    updatedModules.splice(index, 1);
    setTrainingData(prev => ({
      ...prev,
      modules: updatedModules
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData();
      
      formData.append('name', trainingData.name);
      formData.append('description', trainingData.description);
      if (trainingData.picture) {
        formData.append('picture_data', trainingData.picture);
      }
      
      formData.append('modules', JSON.stringify(trainingData.modules.map(module => ({
        name: module.name,
        description: module.description
      }))))
      
      trainingData.modules.forEach((module, index) => {
        module.materials.forEach((file) => {
          formData.append(`module_${index}_materials`, file);
        });
      });

      const response = await axios.post('http://127.0.0.1:8000/training/create-with-modules/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      setSuccess(true);
      setTimeout(() => navigate(`/admin/training/${response.data.id}`), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create training. Please try again.');
      console.error('Error creating training:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="font-medium">Back</span>
          </button>
          <div className="border-l-4 border-blue-600 pl-4">
            <h1 className="text-3xl font-bold text-gray-900">Create New Training Program</h1>
            <p className="text-gray-600 mt-2">Create a comprehensive training program with modules and materials</p>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex items-center">
              <X className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-green-700 font-medium">Training created successfully! Redirecting...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Training Basic Info Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Training Information</h2>
              <p className="text-sm text-gray-600 mt-1">Basic details about your training program</p>
            </div>
            <div className="px-6 py-6 space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Training Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={trainingData.name}
                  onChange={handleTrainingChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                  placeholder="e.g., Customer Service Training"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={trainingData.description}
                  onChange={handleTrainingChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Brief description of the training program"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Training Image
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label
                      htmlFor="picture"
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-gray-400 group-hover:text-gray-600" />
                        <p className="mb-2 text-sm text-gray-600">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                      <input
                        id="picture"
                        name="picture"
                        type="file"
                        onChange={handlePictureChange}
                        className="hidden"
                        accept="image/*"
                      />
                    </label>
                  </div>
                  {trainingData.picturePreview && (
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <img
                          src={trainingData.picturePreview}
                          alt="Preview"
                          className="h-40 w-40 rounded-lg object-cover border border-gray-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setTrainingData(prev => ({
                            ...prev,
                            picture: null,
                            picturePreview: null
                          }))}
                          className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
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
                <p className="text-sm text-gray-600 mt-1">Add modules and materials to your training program</p>
              </div>
              <button
                type="button"
                onClick={addModule}
                className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
              >
                <FilePlus className="w-4 h-4 mr-2" />
                Add Module
              </button>
            </div>
            <div className="px-6 py-6 space-y-6">
              {trainingData.modules.map((module, moduleIndex) => (
                <div key={moduleIndex} className="border border-gray-200 rounded-lg p-6 relative bg-gray-50/50">
                  {trainingData.modules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeModule(moduleIndex)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Remove module"
                    >
                      <FileMinus className="h-5 w-5" />
                    </button>
                  )}
                  
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Module {moduleIndex + 1}
                      </h3>
                    </div>
                    
                    <div>
                      <label htmlFor={`module-name-${moduleIndex}`} className="block text-sm font-medium text-gray-700 mb-2">
                        Module Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id={`module-name-${moduleIndex}`}
                        name="name"
                        value={module.name}
                        onChange={(e) => handleModuleChange(moduleIndex, e)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                        placeholder="e.g., Introduction to Customer Service"
                      />
                    </div>

                    <div>
                      <label htmlFor={`module-description-${moduleIndex}`} className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        id={`module-description-${moduleIndex}`}
                        name="description"
                        value={module.description}
                        onChange={(e) => handleModuleChange(moduleIndex, e)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="What will this module cover?"
                      />
                    </div>

                    <div>
                      <label htmlFor={`module-materials-${moduleIndex}`} className="block text-sm font-medium text-gray-700 mb-2">
                        Training Materials
                      </label>
                      <label
                        htmlFor={`module-materials-${moduleIndex}`}
                        className="flex flex-col items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors p-8 group"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <Upload className="w-10 h-10 mb-3 text-gray-400 group-hover:text-gray-600" />
                          <p className="mb-2 text-sm text-gray-600">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 text-center">
                            PDF, Word, Excel, PowerPoint, Images, Videos up to 50MB
                          </p>
                        </div>
                        <input
                          id={`module-materials-${moduleIndex}`}
                          name={`module-materials-${moduleIndex}`}
                          type="file"
                          multiple
                          onChange={(e) => handleMaterialChange(moduleIndex, e)}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.mp4,.mov,.avi"
                        />
                      </label>

                      {/* Uploaded files list */}
                      {module.materials.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Files:</h4>
                          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <ul className="divide-y divide-gray-200">
                              {module.materials.map((file, fileIndex) => (
                                <li key={fileIndex} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                  <div className="flex items-center min-w-0">
                                    <File className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeMaterial(moduleIndex, fileIndex)}
                                    className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors px-2 py-1 rounded hover:bg-red-50"
                                  >
                                    Remove
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <Check className="-ml-1 mr-3 h-5 w-5" />
                  Create Training Program
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};