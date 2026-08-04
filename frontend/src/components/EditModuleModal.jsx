/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";

function EditModuleModal({ onClose, onSave, moduleId }) {
  const [moduleName, setModuleName] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [moduleFiles, setModuleFiles] = useState([]); // State for the uploaded files
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModuleData = async () => {
      const token = localStorage.getItem("access_token"); // Retrieve token from local storage
      console.log("Token retrieved for fetching:", token); // Debugging line

      if (!token) {
        setError("Authorization token is missing. Please log in again.");
        console.error("Authorization token is missing. Please log in again."); // Log error
        return;
      }

      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/training/module/${moduleId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Module data fetched:", res.data); // Log the module data
        setModuleName(res.data.name || "");
        setModuleDescription(res.data.description || "");
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setError("Unauthorized access. Please log in again.");
          console.error("Unauthorized access:", err); // Log unauthorized error
        } else {
          setError("Failed to load module data.");
          console.error("Error fetching module data:", err); // Log general error
        }
      }
    };

    fetchModuleData();
  }, [moduleId]);

  const handleEdit = async () => {
    if (!moduleName || !moduleDescription) {
      setError("All fields are required.");
      return;
    }

    const token = localStorage.getItem("token"); // Retrieve token again for the PUT request
    console.log("Token retrieved for editing:", token); // Debugging line

    if (!token) {
      setError("Authorization token is missing. Please log in again.");
      console.error("Authorization token is missing. Please log in again."); // Log error
      return;
    }

    const formData = new FormData();
    formData.append("name", moduleName);
    formData.append("description", moduleDescription);

    // Append all selected files to formData
    moduleFiles.forEach(file => {
      formData.append("materials", file); // Append each file with a common key
    });

    try {
      await axios.put(
        `http://127.0.0.1:8000/training/module/update/${moduleId}/`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } } // Set content type for file upload
      );
      console.log("Module updated successfully."); // Log success
      onSave();  // Refresh the list
      onClose(); // Close the modal
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError("Unauthorized access. Please log in again.");
        console.error("Unauthorized access while updating:", err); // Log unauthorized error
      } else {
        setError("An error occurred while updating the module.");
        console.error("Error updating module:", err); // Log general error
      }
    }
  };

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

  return (
    <div className="modal">
      <div className="modal-content">
        <h2 className="text-black font-semibold">Edit Module</h2>
        {error && <p className="error">{error}</p>}
        
        {/* Module Name Input */}
        <input
          type="text"
          placeholder="Module Name"
          value={moduleName}
          onChange={(e) => setModuleName(e.target.value)}
          className="input text-gray-700 mb-4" // Added margin for spacing
        /> <br />

        {/* Module Description Input */}
        <textarea
          placeholder="Module Description"
          value={moduleDescription}
          onChange={(e) => setModuleDescription(e.target.value)}
          className="textarea text-gray-700 mb-4" // Added margin for spacing
        /> <br />

        {/* File Upload Input */}
        <input
          type="file"
          accept="application/pdf, video/mp4, video/x-msvideo"
          onChange={handleFileChange}
          multiple // Allow multiple file uploads
          className="input text-gray-700 mb-4" // Added margin for spacing
        />
        
        <div className="modal-actions py-4">
          <button onClick={onClose} className="button-secondary bg-red-700 mr-10 px-2">Cancel</button>
          <button onClick={handleEdit} className="button-primary bg-green-700 px-2">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

export default EditModuleModal;