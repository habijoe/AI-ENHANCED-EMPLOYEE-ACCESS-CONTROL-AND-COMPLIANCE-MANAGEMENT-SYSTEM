/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LockClosedIcon, ArrowPathIcon } from "@heroicons/react/20/solid"; // For icons

export function AdminCreateTrainingCandidate ()  {
  const [users, setUsers] = useState([]); // For users dropdown
  const [trainings, setTrainings] = useState([]); // For trainings dropdown
  const [data, setData] = useState({}); // For form data
  const [loading, setLoading] = useState(false); // For loading state
  const [errorMessage, setErrorMessage] = useState(""); // For error messages
  const [materials, setMaterials] = useState(null); // For file upload
  const navigate = useNavigate();

  // Fetch users and trainings when component loads
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setErrorMessage("No token found. Please login first.");
      return;
    }

    const fetchUsersAndTrainings = async () => {
      try {
        const usersResponse = await axios.get("http://127.0.0.1:8000/users/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const trainingsResponse = await axios.get(
          "http://127.0.0.1:8000/training/trainings/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUsers(usersResponse.data); // Set users for dropdown
        setTrainings(trainingsResponse.data); // Set trainings for dropdown
      } catch (error) {
        setErrorMessage("Error fetching data. Please try again.");
      }
    };

    fetchUsersAndTrainings();
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
  
    if (!token) {
      setErrorMessage("No token found. Please login first.");
      return;
    }
  
    setLoading(true); // Start loading
    setErrorMessage(""); // Clear any previous errors
  
    const formData = new FormData();
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);
    formData.append("user", data.user);
    formData.append("training_id", data.training); // Send training_id here
  
    if (materials) {
      formData.append("materials", materials);
    }
  
    axios
      .post(`http://127.0.0.1:8000/trainingCandidate/create/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        alert("Training Candidate created successfully");
        navigate("/admin/learner");
      })
      .catch((err) => {
        setErrorMessage(
          err.response?.data?.message || "Error creating training candidate."
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
          Create New Training Candidate
        </h2>
      </div>

      {errorMessage && (
        <div className="text-red-600 text-center">
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* User Dropdown */}
          <div>
            <label
              htmlFor="user"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Select User (Phone)
            </label>
            <div className="mt-2">
              <select
                id="user"
                name="user"
                value={data.user || ""}
                onChange={(e) => setData({ ...data, user: e.target.value })}
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.phone}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
                value={data.first_name || ""}
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
                value={data.last_name || ""}
                onChange={(e) =>
                  setData({ ...data, last_name: e.target.value })
                }
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
              <select
                id="training"
                name="training"
                value={data.training || ""}
                onChange={(e) => setData({ ...data, training: e.target.value })}
                required // Ensure it's required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                <option value="">Select Training</option>
                {trainings.map((training) => (
                  <option key={training.id} value={training.id}>
                    {training.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md bg-purple-500 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                {loading ? (
                  <ArrowPathIcon
                    className="h-5 w-5 text-white animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <LockClosedIcon
                    className="h-5 w-5 text-white group-hover:text-purple-400"
                    aria-hidden="true"
                  />
                )}
              </span>
              {loading ? "Submitting..." : "Create Training Candidate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

