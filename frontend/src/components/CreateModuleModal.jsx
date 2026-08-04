/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import axios from "axios";

export function CreateModuleModal({ onClose, onSave, trainingId }) {
  const [moduleName, setModuleName] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [moduleFiles, setModuleFiles] = useState([]); // State for the uploaded files
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files); // Convert FileList to Array
    const validTypes = ["application/pdf", "video/mp4", "video/x-msvideo"]; // Adjust according to your needs

    // Validate file types
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      setError("Please upload valid PDF or video files.");
      console.error("Invalid file types:", invalidFiles.map(file => file.type)); // Log invalid file type error
      return;
    }

    setModuleFiles(files); // Set the selected files
    setError(null); // Clear error if files are valid
  };

  const handleCreate = async () => {
    if (!moduleName || !moduleDescription) {
      setError("All fields are required.");
      return;
    }

    const formData = new FormData();
    formData.append("name", moduleName);
    formData.append("description", moduleDescription);
    formData.append("training_id", trainingId);

    // Append all selected files to formData
    moduleFiles.forEach(file => {
      formData.append("materials", file); // Append each file with a common key
    });

    try {
      await axios.post(
        `http://127.0.0.1:8000/training/module/create/${trainingId}/`,
        formData,
        { headers: { 
            Authorization: `Bearer ${localStorage.getItem("access_token")}`, 
            "Content-Type": "multipart/form-data" // Ensure the correct content type for file upload
          } 
        }
      );
      onSave();  // Refresh the list
      onClose(); // Close the modal
    } catch (err) {
      setError("An error occurred while creating the module.");
      console.error("Error creating module:", err); // Log the error for debugging
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2 className="text-black font-semibold">Create New Module</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="text"
          placeholder="Module Name"
          value={moduleName}
          onChange={(e) => setModuleName(e.target.value)}
          className="input text-gray-700 mb-4"
        />
        <br />
        <textarea
          placeholder="Module Description"
          value={moduleDescription}
          onChange={(e) => setModuleDescription(e.target.value)}
          className="textarea text-gray-700 mb-4"
        />
        <br />
        
        {/* File Upload Input */}
        <input
          type="file"
          accept="application/pdf, video/mp4, video/x-msvideo"
          onChange={handleFileChange}
          multiple // Allow multiple file uploads
          className="input text-gray-700 mb-4"
        />
        
        <div className="modal-actions">
          <button onClick={onClose} className="button-secondary bg-green-700 px-2">Cancel</button>
          <button onClick={handleCreate} className="button-primary bg-red-700 px-2 ml-10">Create</button>
        </div>
      </div>
    </div>
  );
}

