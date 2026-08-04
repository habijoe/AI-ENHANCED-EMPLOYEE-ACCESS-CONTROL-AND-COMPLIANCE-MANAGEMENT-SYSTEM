/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  User,
  BookOpen,
  Calendar,
  Mail,
  Phone,
  Info,
  AlertCircle,
  Loader2,
  FileText,
  Clock
} from "lucide-react";
import NCSALogo from "../assets/pictures/Logo.png";

export function AdminViewTrainingCandidateDetails () {
  const { id } = useParams();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUserData = localStorage.getItem("userData");
    const accessToken = storedUserData ? JSON.parse(storedUserData).access_token : null;

    if (!accessToken) {
      setError("Unauthorized! Please log in again.");
      return;
    }

    setLoading(true);
    axios
      .get(`http://127.0.0.1:8000/trainingCandidate/${id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        if (res.data) {
          setData(res.data);
          setError("");
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          setError("Session expired. Please log in again.");
        } else {
          setError(
            err.response?.data?.message || "Error fetching candidate details."
          );
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // Function to format date and time in English format
  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    let bgColor = "bg-gray-600";
    let textColor = "text-gray-300";

    switch (status?.toLowerCase()) {
      case "active":
        bgColor = "bg-green-600";
        textColor = "text-green-300";
        break;
      case "completed":
        bgColor = "bg-purple-600";
        textColor = "text-purple-300";
        break;
      case "pending":
        bgColor = "bg-yellow-600";
        textColor = "text-yellow-300";
        break;
      default:
        break;
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {status || "N/A"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950">
      {/* Header */}
      <header className="bg-blue-900 py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src={NCSALogo} 
              alt="NCSA Logo" 
              className="h-12 mr-4"
            />
            <h1 className="text-white text-2xl font-bold">National Cyber Security Authority</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center px-8 py-12">
        {/* Page Title and Back Button */}
        <div className="w-full max-w-7xl mb-8">
          <Link 
            to="/admin/learner" 
            className="text-blue-200 hover:text-white flex items-center gap-2 transition-colors mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Training Candidates
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Training Candidate Details
          </h1>
          <p className="text-blue-200">Detailed information about the training candidate</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="w-full max-w-7xl p-3 rounded-lg bg-red-600 text-white text-sm mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="w-full max-w-7xl bg-white bg-opacity-10 rounded-xl shadow-lg border border-white border-opacity-20 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              {/* Candidate Information Card */}
              <div className="bg-white bg-opacity-5 rounded-xl p-6 border border-white border-opacity-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-full bg-blue-600 bg-opacity-30">
                    <User className="h-6 w-6 text-blue-300" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Candidate Information</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-1">
                        Full Name
                      </label>
                      <div className="text-white">
                        {data.learner?.first_name || "N/A"} {data.learner?.last_name || ""}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-1">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>Phone Number</span>
                        </div>
                      </label>
                      <div className="text-white">
                        {data.learner?.created_by?.phone_number || "N/A"}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>Email</span>
                        </div>
                      </label>
                      <div className="text-white">
                        {data.learner?.created_by?.email || "N/A"}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Registered On</span>
                        </div>
                      </label>
                      <div className="text-blue-300">
                        {data.created_at ? formatDateTime(data.created_at) : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Training Information Card */}
              <div className="bg-white bg-opacity-5 rounded-xl p-6 border border-white border-opacity-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-full bg-purple-600 bg-opacity-30">
                    <BookOpen className="h-6 w-6 text-purple-300" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Training Information</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-1">
                        Training Name
                      </label>
                      <div className="text-white">
                        {data.training?.name || "N/A"}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-1">
                        Status
                      </label>
                      <div>
                        {getStatusBadge(data.status)}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>Enrollment Date</span>
                        </div>
                      </label>
                      <div className="text-blue-300">
                        {data.created_at ? formatDateTime(data.created_at) : "N/A"}
                      </div>
                    </div>

                    {data.training?.materials && (
                      <div>
                        <label className="block text-sm font-medium text-blue-200 mb-1">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>Training Materials</span>
                          </div>
                        </label>
                        <a
                          href={`http://127.0.0.1:8000${data.training.materials}`}
                          className="text-blue-300 hover:text-blue-100 underline transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Materials
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-blue-900 py-6 px-6 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-blue-200 text-sm">
            © {new Date().getFullYear()} National Cyber Security Authority. All rights reserved.
          </p>
          <p className="text-blue-200 text-sm mt-2">
            8 KG 7 St, Kacyiru, Kigali-Rwanda | info@ncsa.gov.rw
          </p>
        </div>
      </footer>
    </div>
  );
};

