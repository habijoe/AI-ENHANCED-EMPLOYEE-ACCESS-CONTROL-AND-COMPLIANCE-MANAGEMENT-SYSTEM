/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { LockClosedIcon, ArrowPathIcon } from "@heroicons/react/20/solid"; // For icons

export function AdminEditTrainingCandidate () {
  const { id } = useParams();

  const [data, setData] = useState({
    first_name: "",
    last_name: "",
    user: {},
    training: {},
  }); // For form data
  const [loading, setLoading] = useState(false); // For loading state
  const [errorMessage, setErrorMessage] = useState(""); // For error messages

  const navigate = useNavigate();

  // Fetch candidate and trainings when component loads
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setErrorMessage("No token found. Please login first.");
      return;
    }

    const fetchCandidate = async () => {
      try {
        const candidateResponse = await axios.get(
          `http://127.0.0.1:8000/trainingCandidate/${id}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Ensure to check if the response has the expected structure
        const workerData = candidateResponse.data.worker; // Get the worker object
        const trainingData = candidateResponse.data.training; // Get the training object if available

        setData({
          first_name: workerData.first_name || "", // Set default value
          last_name: workerData.last_name || "", // Set default value
          user: workerData.created_by || {}, // Assuming 'created_by' holds the user details
          training: trainingData || {}, // Set default value
        });
      } catch (error) {
        setErrorMessage("Error fetching candidate data. Please try again.");
      }
    };

    fetchCandidate();
  }, [id]); // Include id in dependency array

  // Validate names
  const validateName = (name) => {
    const regex = /^[A-Z][a-zA-Z]*$/; // Starts with a capital letter, followed by letters only
    return regex.test(name);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMessage("No token found. Please login first.");
      return;
    }

    if (!validateName(data.first_name)) { // Access first_name directly from data
      setErrorMessage(
        "First name must start with a capital letter and contain only letters."
      );
      return;
    }

    if (!validateName(data.last_name)) { // Access last_name directly from data
      setErrorMessage(
        "Last name must start with a capital letter and contain only letters."
      );
      return;
    }

    setLoading(true); // Start loading
    setErrorMessage(""); // Clear any previous errors

    const formData = new FormData();
    formData.append("first_name", data.first_name); // Correctly use first_name
    formData.append("last_name", data.last_name); // Correctly use last_name
    formData.append("user", data.user?.id); // Assuming you want to update using user ID

    axios
      .put(`http://127.0.0.1:8000/trainingCandidate/update/${id}/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        alert("Training Candidate updated successfully");
        navigate("/admin/learner");
      })
      .catch((err) => {
        setErrorMessage(
          err.response?.data?.message || "Error updating training candidate."
        );
      })
      .finally(() => {
        setLoading(false); // Stop loading
      });
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Update Training Candidate
        </h2>
      </div>

      {errorMessage && (
        <div className="text-red-600 text-center">
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* First Name */}
          <div>
            <label
              htmlFor="first_name"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              First Name
            </label>
            <div className="mt-2">
              <input
                id="first_name"
                name="first_name"
                type="text"
                value={data.first_name} // Use data.first_name
                onChange={(e) =>
                  setData({ ...data, first_name: e.target.value })
                }
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          {/* Last Name */}
          <div>
            <label
              htmlFor="last_name"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Last Name
            </label>
            <div className="mt-2">
              <input
                id="last_name"
                name="last_name"
                type="text"
                value={data.last_name} // Use data.last_name
                onChange={(e) =>
                  setData({ ...data, last_name: e.target.value })
                }
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          {/* User */}
          <div>
            <label
              htmlFor="user"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              User
            </label>
            <div className="mt-2">
              <input
                id="user"
                name="user"
                value={data.user?.phone || ""} // Correctly reference user's phone
                readOnly
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          {/* Training Dropdown */}
          <div>
            <label
              htmlFor="training"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Select Training
            </label>
            <div className="mt-2">
              <input
                id="training"
                name="training"
                value={data.training?.name || ""} // Make sure to access training name correctly
                readOnly
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md bg-purple-500 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <LockClosedIcon className="h-5 w-5" aria-hidden="true" />
              </span>
              {loading ? <ArrowPathIcon className="animate-spin h-5 w-5" /> : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

