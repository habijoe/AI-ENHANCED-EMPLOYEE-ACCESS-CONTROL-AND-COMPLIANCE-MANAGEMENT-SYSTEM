/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  Shield,
  Save,
  Edit,
  CheckCircle,
  Calendar,
  Clock,
  Key,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  RefreshCw,
  AlertTriangle,
  Info,
  ChevronRight,
  ShieldCheck,
  Bell,
  Settings
} from "lucide-react";

export function UserProfile() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [userData, setUserData] = useState({
    id: "",
    full_name: "",
    email: "",
    work_mail_address: "",
    phone_number: "",
    role: "",
    department: null,
    departments: [],
    status: "",
    availability_status: "",
    created_at: "",
    created_by: null,
    department_details: null,
    departments_details: [],
    created_by_name: "",
    is_admin: false,
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const accessToken = localStorage.getItem("access_token");
  const BASE_URL = "http://127.0.0.1:8000";

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    timeout: 10000,
  };

  // Fetch user profile from backend
  const fetchUserProfile = async () => {
    try {
      setProfileLoading(true);
      setError("");
      
      console.log("Fetching user profile from:", `${BASE_URL}/profile/`);
      console.log("Access token present:", !!accessToken);
      
      const response = await axios.get(
        `${BASE_URL}/profile/`,
        axiosConfig
      );
      
      console.log("Profile response:", response.data);
      
      if (response.data) {
        const data = response.data;
        
        // Map backend data to frontend state
        setUserData({
          id: data.id || "",
          full_name: data.full_name || "",
          email: data.email || "",
          work_mail_address: data.work_mail_address || "",
          phone_number: data.phone_number || "",
          role: data.role || "",
          department: data.department || null,
          departments: data.departments || [],
          status: data.status || "",
          availability_status: data.availability_status || "",
          created_at: data.created_at || "",
          created_by: data.created_by || null,
          department_details: data.department_details || null,
          departments_details: data.departments_details || [],
          created_by_name: data.created_by_name || "",
          is_admin: data.is_admin || false,
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      
      if (err.response) {
        console.error("Error response:", err.response.data);
        
        if (err.response.status === 401) {
          setError("Session expired. Please log in again.");
          // Redirect to login
          setTimeout(() => {
            logout();
          }, 2000);
        } else if (err.response.status === 404) {
          setError("Profile endpoint not found. Please contact support.");
        } else {
          setError(err.response.data?.detail || err.response.data?.error || "Failed to load profile");
        }
      } else if (err.request) {
        setError("Unable to connect to server. Please check your network.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleSave = async () => {
    setError("");
    setSuccess("");
    
    // Validation
    if (!userData.full_name?.trim()) {
      setError("Full name is required");
      return;
    }
    
    if (!userData.email?.trim()) {
      setError("Email is required");
      return;
    }
    
    if (!userData.phone_number?.trim()) {
      setError("Phone number is required");
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    // Phone validation (international format)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    const cleanedPhone = userData.phone_number.replace(/\s/g, '');
    if (!phoneRegex.test(cleanedPhone)) {
      setError("Please enter a valid phone number with country code (e.g., +250788123456)");
      return;
    }

    setLoading(true);
    
    try {
      // Prepare update data - only include fields that can be updated
      const updateData = {
        full_name: userData.full_name,
        email: userData.email,
        phone_number: cleanedPhone, // Send cleaned version
        availability_status: userData.availability_status,
      };
      
      console.log("Updating profile with data:", updateData);
      console.log("Endpoint:", `${BASE_URL}/profile/update/`);
      
      const response = await axios.put(
        `${BASE_URL}/profile/update/`,
        updateData,
        axiosConfig
      );
      
      console.log("Update response:", response.data);
      
      if (response.status === 200) {
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
        
        // Refresh profile data
        await fetchUserProfile();
        
        // Update auth context
        if (window.updateUserInContext) {
          window.updateUserInContext({
            ...user,
            full_name: userData.full_name,
            email: userData.email,
            phone_number: cleanedPhone,
            availability_status: userData.availability_status,
          });
        }
        
        setTimeout(() => {
          setSuccess("");
        }, 3000);
      }
    } catch (err) {
      console.error("Update error:", err);
      
      if (err.response) {
        const errorData = err.response.data;
        console.error("Error data:", errorData);
        
        if (err.response.status === 400) {
          // Handle validation errors
          if (errorData.email) {
            setError(`Email: ${errorData.email}`);
          } else if (errorData.phone_number) {
            setError(`Phone: ${errorData.phone_number}`);
          } else if (errorData.full_name) {
            setError(`Name: ${errorData.full_name}`);
          } else if (errorData.detail) {
            setError(errorData.detail);
          } else if (typeof errorData === 'string') {
            setError(errorData);
          } else if (errorData.error) {
            setError(errorData.error);
          } else {
            setError("Validation error. Please check your input.");
          }
        } else if (err.response.status === 403) {
          setError("You don't have permission to update this profile.");
        } else if (err.response.status === 404) {
          setError("Profile not found.");
        } else {
          setError("Failed to update profile. Please try again.");
        }
      } else if (err.request) {
        setError("Unable to connect to server. Please check your network.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");
    
    // Validation
    if (!passwordData.current_password.trim()) {
      setError("Current password is required");
      return;
    }
    
    if (!passwordData.new_password.trim()) {
      setError("New password is required");
      return;
    }
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError("New passwords do not match");
      return;
    }
    
    // Password strength validation
    const passwordError = validatePassword(passwordData.new_password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.put(
        `${BASE_URL}/profile/change-password/`,
        {
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
          confirm_password: passwordData.confirm_password,
        },
        axiosConfig
      );
      
      if (response.status === 200) {
        setSuccess("Password changed successfully!");
        
        // Reset password form
        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
        setIsChangingPassword(false);
        
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      console.error("Password change error:", err.response?.data || err);
      
      if (err.response) {
        if (err.response.status === 400) {
          setError(err.response.data?.error || "Current password is incorrect");
        } else if (err.response.status === 403) {
          setError("You don't have permission to change password");
        } else {
          setError(err.response.data?.detail || "Failed to change password");
        }
      } else if (err.request) {
        setError("Unable to connect to server. Please check your network.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter.";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number.";
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return "Password must contain at least one special character (@$!%*?&).";
    }
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      'admin': 'System Administrator',
      'hr_manager': 'HR Manager',
      'compliance_officer': 'Compliance Officer',
      'security_analyst': 'Security Analyst',
      'employee': 'Employee',
    };
    return roleMap[role] || role || 'User';
  };

  const getDepartmentDisplay = () => {
    // Check departments_details first (from serializer)
    if (userData.departments_details?.length > 0) {
      return userData.departments_details.map(dept => dept.name).join(', ');
    }
    
    // Fallback to department_details (for employees)
    if (userData.department_details?.name) {
      return userData.department_details.name;
    }
    
    // Fallback to department field
    if (userData.department?.name) {
      return userData.department.name;
    }
    
    return "N/A";
  };

  const PasswordInput = ({ value, onChange, placeholder, show, setShow, disabled = false }) => (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        disabled={disabled}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        await axios.post(
          `${BASE_URL}/auth/logout/`,
          { refresh_token: refreshToken },
          axiosConfig
        );
      }
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      // Always clear local storage and call logout
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600 mt-1">
                  Manage your personal information and account settings
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchUserProfile}
                disabled={profileLoading}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {profileLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50 rounded-lg font-medium transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Status Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg animate-fadeIn">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg animate-fadeIn">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Loading State for initial profile load */}
        {profileLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Profile</h3>
              <p className="text-gray-600">Fetching your profile information...</p>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Card & Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {getInitials(userData.full_name)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{userData.full_name || "N/A"}</h2>
                      <p className="text-gray-600 mt-1">
                        {getRoleDisplayName(userData.role)}
                      </p>
                    </div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                      userData.status === 'approved' && userData.availability_status === 'active'
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : userData.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        : 'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        userData.status === 'approved' && userData.availability_status === 'active'
                          ? 'bg-green-500'
                          : userData.status === 'pending'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}></span>
                      {userData.status === 'approved' && userData.availability_status === 'active'
                        ? 'Active'
                        : userData.status === 'pending'
                        ? 'Pending Approval'
                        : 'Inactive'
                      }
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-gray-200 space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-500 text-xs">Work Email</p>
                      <p className="text-gray-900 font-medium truncate">{userData.work_mail_address || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-500 text-xs">
                        {userData.role === 'security_analyst' ? 'Departments' : 'Department'}
                      </p>
                      <p className="text-gray-900 font-medium truncate">{getDepartmentDisplay()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-500 text-xs">Phone</p>
                      <p className="text-gray-900 font-medium">{userData.phone_number || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-500 text-xs">Member Since</p>
                      <p className="text-gray-900 font-medium">{formatDate(userData.created_at)}</p>
                    </div>
                  </div>
                  
                  {userData.created_by_name && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-gray-500 text-xs">Created By</p>
                        <p className="text-gray-900 font-medium truncate">{userData.created_by_name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Status Card */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                  Account Status
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Account Status</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        userData.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : userData.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {userData.status?.toUpperCase() || "UNKNOWN"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          userData.status === 'approved'
                            ? 'bg-green-500'
                            : userData.status === 'pending'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: userData.status === 'approved' ? '100%' : '50%' }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-500">Role</p>
                      <p className="text-sm font-semibold text-gray-900">{getRoleDisplayName(userData.role)}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-500">Admin</p>
                      <p className="text-sm font-semibold text-gray-900">{userData.is_admin ? "Yes" : "No"}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Account ID</span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                          {userData.id?.toString().slice(-8) || "N/A"}
                        </code>
                        <button
                          onClick={() => navigator.clipboard.writeText(userData.id || '')}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information Card */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Update your personal details. Some fields are read-only.
                    </p>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                      disabled={loading}
                    >
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-blue-600 font-medium animate-pulse">
                        Editing Mode
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label className="block font-medium text-gray-700">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={userData.full_name || ""}
                        onChange={(e) => setUserData({...userData, full_name: e.target.value})}
                        disabled={!isEditing || loading}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Personal Email */}
                    <div className="space-y-2">
                      <label className="block font-medium text-gray-700">
                        Personal Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={userData.email || ""}
                        onChange={(e) => setUserData({...userData, email: e.target.value})}
                        disabled={!isEditing || loading}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                        placeholder="your.email@gmail.com"
                      />
                      <p className="text-xs text-gray-500">Only Gmail addresses are allowed</p>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                      <label className="block font-medium text-gray-700">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={userData.phone_number || ""}
                        onChange={(e) => setUserData({...userData, phone_number: e.target.value})}
                        disabled={!isEditing || loading}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                        placeholder="+250788123456"
                      />
                      <p className="text-xs text-gray-500">International format with country code</p>
                    </div>

                    {/* Work Email - READ ONLY */}
                    <div className="space-y-2">
                      <label className="block font-medium text-gray-700">
                        <span className="flex items-center gap-2">
                          Work Email Address
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">System Generated</span>
                        </span>
                      </label>
                      <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700 font-medium">{userData.work_mail_address || "N/A"}</span>
                      </div>
                      <p className="text-xs text-gray-500">Used for system login</p>
                    </div>

                    {/* Role - READ ONLY */}
                    <div className="space-y-2">
                      <label className="block font-medium text-gray-700">Role</label>
                      <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700 font-medium">{getRoleDisplayName(userData.role)}</span>
                      </div>
                    </div>

                    {/* Department(s) - READ ONLY */}
                    <div className="space-y-2">
                      <label className="block font-medium text-gray-700">
                        {userData.role === 'security_analyst' ? 'Departments' : 'Department'}
                      </label>
                      <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700 font-medium">{getDepartmentDisplay()}</span>
                      </div>
                      <p className="text-xs text-gray-500">Contact admin/HR to change</p>
                    </div>

                    {/* Availability Status - EDITABLE */}
                    {isEditing && (
                      <div className="space-y-2 sm:col-span-2">
                        <label className="block font-medium text-gray-700">Availability Status</label>
                        <select
                          value={userData.availability_status || "inactive"}
                          onChange={(e) => setUserData({...userData, availability_status: e.target.value})}
                          disabled={loading}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                        <p className="text-xs text-gray-500">
                          Active: Available for assignments | Inactive: Not available
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Edit Mode Actions */}
                  {isEditing && (
                    <div className="flex gap-3 pt-8 mt-6 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setError("");
                          // Refresh original data
                          fetchUserProfile();
                        }}
                        className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center font-medium transition-colors shadow-sm disabled:opacity-50"
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Password Change Card */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Manage your password and security preferences
                  </p>
                </div>
                
                <div className="p-6">
                  {!isChangingPassword ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Lock className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Password</p>
                          <p className="text-sm text-gray-500">
                            Last changed: {formatDate(userData.created_at)}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsChangingPassword(true)}
                        className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto"
                      >
                        Change Password
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        {/* Current Password */}
                        <div className="space-y-2">
                          <label className="block font-medium text-gray-700">
                            Current Password <span className="text-red-500">*</span>
                          </label>
                          <PasswordInput
                            value={passwordData.current_password}
                            onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                            placeholder="Enter current password"
                            show={showCurrentPassword}
                            setShow={setShowCurrentPassword}
                            disabled={loading}
                          />
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                          <label className="block font-medium text-gray-700">
                            New Password <span className="text-red-500">*</span>
                          </label>
                          <PasswordInput
                            value={passwordData.new_password}
                            onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                            placeholder="Enter new password"
                            show={showNewPassword}
                            setShow={setShowNewPassword}
                            disabled={loading}
                          />
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2 sm:col-span-2">
                          <label className="block font-medium text-gray-700">
                            Confirm New Password <span className="text-red-500">*</span>
                          </label>
                          <PasswordInput
                            value={passwordData.confirm_password}
                            onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                            placeholder="Confirm new password"
                            show={showConfirmPassword}
                            setShow={setShowConfirmPassword}
                            disabled={loading}
                          />
                        </div>
                      </div>

                      {/* Password Requirements */}
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-3">Password Requirements:</p>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {[
                            { text: "At least 8 characters", test: passwordData.new_password.length >= 8 },
                            { text: "One lowercase letter", test: /(?=.*[a-z])/.test(passwordData.new_password) },
                            { text: "One uppercase letter", test: /(?=.*[A-Z])/.test(passwordData.new_password) },
                            { text: "One number", test: /(?=.*\d)/.test(passwordData.new_password) },
                            { text: "One special character", test: /(?=.*[@$!%*?&])/.test(passwordData.new_password) },
                          ].map((req, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${req.test ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              <span className={`text-sm ${req.test ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                                {req.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Password Change Actions */}
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => {
                            setIsChangingPassword(false);
                            setPasswordData({
                              current_password: "",
                              new_password: "",
                              confirm_password: "",
                            });
                            setError("");
                          }}
                          className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
                          disabled={loading}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleChangePassword}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center font-medium transition-colors shadow-sm disabled:opacity-50"
                          disabled={loading}
                        >
                          {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Key className="h-4 w-4 mr-2" />
                          )}
                          Update Password
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Additional Security Options */}
                  <div className="mt-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <Shield className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-500">
                            <span className="text-green-600 font-medium">Enabled</span> - Via Email OTP
                          </p>
                        </div>
                      </div>
                      <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto">
                        Manage 2FA
                      </button>
                    </div>

                  </div>
                </div>
              </div>

              {/* Account Information Card */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Account Details</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Complete account information and metadata
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                      <div className="flex items-center gap-3 mb-2">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-500">Account Type</p>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{getRoleDisplayName(userData.role)}</p>
                    </div>
                    
                    <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-500">Created Date</p>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{formatDate(userData.created_at)}</p>
                    </div>
                    
                    <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                      <div className="flex items-center gap-3 mb-2">
                        <ShieldCheck className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-500">Verification</p>
                      </div>
                      <p className="text-lg font-semibold text-green-600">Verified</p>
                    </div>
                  </div>
                  
                  {/* Additional Info */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Need to update other information?</p>
                        <p className="text-sm text-blue-600 mt-1">
                          Contact your administrator or HR department to update your role, departments, or other system-level information.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 py-6 border-t border-gray-200">
        <div className="text-center text-sm text-gray-500">
          <p>Profile last updated: {new Date().toLocaleString()}</p>
          <p className="mt-1">User ID: {userData.id} • System Version: 1.0.0</p>
        </div>
      </div>
    </div>
  );
}