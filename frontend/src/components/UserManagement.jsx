import React, { useState, useEffect } from "react";
import {
  Users,
  Building2,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Briefcase,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  UserPlus,
  Building,
  Eye,
  RefreshCw,
  BarChart,
  Activity,
  AlertCircle,
  UserCog,
  X,
  Save,
  Loader2,
  AlertTriangle,
  Calendar,
  Tag,
  Hash,
  Target,
  TrendingUp,
  FileText,
  Key,
  Lock,
  UserCheck,
  Users as UsersIcon,
  Home,
  Info
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// ==================== MODAL COMPONENTS (EXTRACTED) ====================

// Add User Modal Component
const AddUserModalComponent = ({
  show,
  onClose,
  formData,
  setFormData,
  errors,
  actionLoading,
  handleSubmit,
  departments
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserPlus className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold">Add New User</h2>
                <p className="text-sm text-gray-600">System will generate and email password to user</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={actionLoading}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{errors.general}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.full_name || ''}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                  required
                  disabled={actionLoading}
                />
                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="user@example.com"
                  required
                  disabled={actionLoading}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone_number || ''}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+250XXXXXXXXX"
                  required
                  disabled={actionLoading}
                />
                {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={formData.role || 'employee'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                  disabled={actionLoading}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Administrator</option>
                  <option value="security_analyst">Security Analyst</option>
                  <option value="compliance_officer">Compliance Officer</option>
                  <option value="hr_manager">HR Manager</option>
                </select>
                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  disabled={formData.role === 'security_analyst' || actionLoading}
                >
                  <option value="">Select department</option>
                  {departments.filter(d => d.status === 'active').map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status || 'pending'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  disabled={actionLoading}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Active</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Department selection for Security Analysts */}
              {formData.role === 'security_analyst' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign Departments (Security Analysts can manage multiple departments)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {departments.filter(d => d.status === 'active').map(dept => (
                      <div key={dept.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`dept-${dept.id}`}
                          checked={formData.departments?.includes(dept.id) || false}
                          onChange={(e) => {
                            const currentDepts = formData.departments || [];
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                departments: [...currentDepts, dept.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                departments: currentDepts.filter(id => id !== dept.id)
                              });
                            }
                          }}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          disabled={actionLoading}
                        />
                        <label htmlFor={`dept-${dept.id}`} className="ml-2 text-sm text-gray-700">
                          {dept.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-700 font-medium">Password Information</p>
                  <p className="text-sm text-blue-600">
                    A secure, system-generated password will be created and sent to the user's email address.
                    Users will be prompted to change their password on first login.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5 mr-2" />
                      Create User
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Edit User Modal Component
const EditUserModalComponent = ({
  show,
  onClose,
  formData,
  setFormData,
  errors,
  actionLoading,
  handleSubmit,
  departments
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Edit className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold">Edit User</h2>
                <p className="text-sm text-gray-600">Update user information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={actionLoading}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{errors.general}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.full_name || ''}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={actionLoading}
                />
                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={actionLoading}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone_number || ''}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={actionLoading}
                />
                {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={formData.role || 'employee'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                  disabled={actionLoading}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Administrator</option>
                  <option value="security_analyst">Security Analyst</option>
                  <option value="compliance_officer">Compliance Officer</option>
                  <option value="hr_manager">HR Manager</option>
                </select>
                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  disabled={formData.role === 'security_analyst' || actionLoading}
                >
                  <option value="">Select department</option>
                  {departments.filter(d => d.status === 'active').map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
              </div>

              {/* Multi-department checkboxes for Security Analysts */}
              {formData.role === 'security_analyst' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned Departments
                    <span className="ml-2 text-xs text-gray-500 font-normal">
                      ({formData.departments?.length || 0} selected)
                    </span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    {departments.filter(d => d.status === 'active').map(dept => (
                      <div key={dept.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`edit-dept-${dept.id}`}
                          checked={formData.departments?.includes(dept.id) || false}
                          onChange={(e) => {
                            const current = formData.departments || [];
                            setFormData({
                              ...formData,
                              departments: e.target.checked
                                ? [...current, dept.id]
                                : current.filter(id => id !== dept.id)
                            });
                          }}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          disabled={actionLoading}
                        />
                        <label
                          htmlFor={`edit-dept-${dept.id}`}
                          className={`ml-2 text-sm cursor-pointer ${formData.departments?.includes(dept.id)
                            ? 'text-blue-700 font-medium'
                            : 'text-gray-700'
                            }`}
                        >
                          {dept.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.departments && (
                    <p className="text-red-500 text-xs mt-1">{errors.departments}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status || 'pending'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                  disabled={actionLoading}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Active</option>
                  <option value="rejected">Rejected</option>
                </select>
                {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability Status *
                </label>
                <select
                  value={formData.availability_status || 'inactive'}
                  onChange={(e) => setFormData({ ...formData, availability_status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                  disabled={actionLoading}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                {errors.availability_status && <p className="text-red-500 text-xs mt-1">{errors.availability_status}</p>}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Update User
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Add Department Modal Component
const AddDepartmentModalComponent = ({
  show,
  onClose,
  formData,
  setFormData,
  errors,
  actionLoading,
  handleSubmit
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold">Add New Department</h2>
                <p className="text-sm text-gray-600">Create a new department</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={actionLoading}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{errors.general}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter department name"
                required
                disabled={actionLoading}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter department description"
                rows={4}
                disabled={actionLoading}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
                disabled={actionLoading}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-2" />
                      Create Department
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Edit Department Modal Component
const EditDepartmentModalComponent = ({
  show,
  onClose,
  formData,
  setFormData,
  errors,
  actionLoading,
  handleSubmit
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Edit className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold">Edit Department</h2>
                <p className="text-sm text-gray-600">Update department information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={actionLoading}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{errors.general}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={actionLoading}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                disabled={actionLoading}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
                disabled={actionLoading}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Update Department
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModalComponent = ({
  show,
  onClose,
  selectedItem,
  actionLoading,
  handleDelete
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div>
                <h2 className="text-xl font-bold text-red-600">Confirm Delete</h2>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={actionLoading}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete {selectedItem.type === 'user' ? 'User' : 'Department'}
            </h3>
            <p className="text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                {selectedItem.type === 'user'
                  ? selectedItem.data?.full_name
                  : selectedItem.data?.name}
              </span>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This will permanently remove the {selectedItem.type} and all associated data.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              disabled={actionLoading}
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={actionLoading}
              type="button"
            >
              {actionLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Trash2 className="h-5 w-5 mr-2" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Success Message Component
const SuccessMessageComponent = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-slide-in">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-700 font-medium">{message}</span>
          <button
            onClick={onClose}
            className="ml-2 text-green-600 hover:text-green-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading Overlay Component
const LoadingOverlayComponent = ({ message }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
    <div className="bg-white rounded-xl p-6 shadow-2xl">
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================

export function UserManagement() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState({
    users: false,
    departments: false,
    stats: false
  });

  // Data states
  const [data, setData] = useState({
    users: [],
    departments: []
  });

  // Statistics
  const [stats, setStats] = useState({
    users: {
      total: 0,
      active: 0,
      pending: 0,
      rejected: 0,
      admins: 0,
      employees: 0,
      security_analysts: 0,
      compliance_officers: 0,
      hr_managers: 0
    },
    departments: {
      total: 0,
      active: 0,
      inactive: 0,
      withUsers: 0,
      empty: 0
    }
  });

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    users: {
      role: "all",
      status: "all",
      department: "all",
      availability: "all"
    },
    departments: {
      status: "all",
      hasUsers: "all"
    }
  });

  // Pagination
  const [pagination, setPagination] = useState({
    users: {
      current: 1,
      perPage: 10,
      totalPages: 1
    },
    departments: {
      current: 1,
      perPage: 10,
      totalPages: 1
    }
  });

  // Modal states
  const [showModal, setShowModal] = useState({
    addUser: false,
    editUser: false,
    addDepartment: false,
    editDepartment: false,
    deleteConfirm: false,
    viewDetails: false
  });

  // Selected items
  const [selectedItem, setSelectedItem] = useState({
    type: null,
    data: null
  });

  // Form states
  const [formData, setFormData] = useState({
    user: {
      phone_number: "",
      email: "",
      full_name: "",
      role: "employee",
      department: "",
      status: "pending",
      availability_status: "inactive"
    },
    editUser: {
      id: "",
      phone_number: "",
      email: "",
      full_name: "",
      role: "",
      department: "",
      status: "",
      availability_status: ""
    },
    department: {
      name: "",
      description: "",
      status: "active"
    },
    editDepartment: {
      id: "",
      name: "",
      description: "",
      status: "active"
    }
  });

  // Errors and loading
  const [errors, setErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Initial data fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch initial data
  const fetchInitialData = async () => {
    setLoading(prev => ({ ...prev, users: true, departments: true, stats: true }));
    try {
      await Promise.all([fetchUsers(), fetchDepartments()]);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      showError("Failed to load data. Please refresh the page.");
    } finally {
      setLoading(prev => ({ ...prev, users: false, departments: false, stats: false }));
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/users/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        const users = result.users || [];
        console.log("Retrived users: ", users);
        setData(prev => ({ ...prev, users }));
        updateUserStats(users);
        updatePagination('users', users.length);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/departments/all/');
      if (response.ok) {
        const result = await response.json();
        const departments = result.data || [];
        setData(prev => ({ ...prev, departments }));
        updateDepartmentStats(departments);
        updatePagination('departments', departments.length);
      } else {
        throw new Error('Failed to fetch departments');
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  };

  // Update user statistics
  const updateUserStats = (users) => {
    const stats = {
      total: users.length,
      active: users.filter(u => u.status === 'approved').length,
      pending: users.filter(u => u.status === 'pending').length,
      rejected: users.filter(u => u.status === 'rejected').length,
      admins: users.filter(u => u.role === 'admin').length,
      employees: users.filter(u => u.role === 'employee').length,
      security_analysts: users.filter(u => u.role === 'security_analyst').length,
      compliance_officers: users.filter(u => u.role === 'compliance_officer').length,
      hr_managers: users.filter(u => u.role === 'hr_manager').length
    };
    setStats(prev => ({ ...prev, users: stats }));
  };

  // Update department statistics
  const updateDepartmentStats = (departments) => {
    const userCounts = data.users.reduce((acc, user) => {
      if (user.department?.id) {
        acc[user.department.id] = (acc[user.department.id] || 0) + 1;
      }
      return acc;
    }, {});

    const stats = {
      total: departments.length,
      active: departments.filter(d => d.status === 'active').length,
      inactive: departments.filter(d => d.status === 'inactive').length,
      withUsers: departments.filter(d => userCounts[d.id] > 0).length,
      empty: departments.filter(d => !userCounts[d.id]).length
    };
    setStats(prev => ({ ...prev, departments: stats }));
  };

  // Update pagination
  const updatePagination = (type, totalItems) => {
    const perPage = pagination[type].perPage;
    const totalPages = Math.ceil(totalItems / perPage);
    setPagination(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        totalPages,
        current: prev[type].current > totalPages ? 1 : prev[type].current
      }
    }));
  };

  // Filter data
  const getFilteredData = () => {
    if (activeTab === 'users') {
      return data.users.filter(user => {
        const matchesSearch = !searchQuery ||
          user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.work_mail_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.phone_number?.includes(searchQuery);

        const matchesRole = filters.users.role === 'all' || user.role === filters.users.role;
        const matchesStatus = filters.users.status === 'all' || user.status === filters.users.status;
        const matchesAvailability = filters.users.availability === 'all' ||
          user.availability_status === filters.users.availability;

        const matchesDepartment = filters.users.department === 'all' ||
          user.department_details?.name === filters.users.department ||
          user.departments_details?.some(d => d.name === filters.users.department);
        return matchesSearch && matchesRole && matchesStatus && matchesAvailability && matchesDepartment;
      });
    } else {
      return data.departments.filter(dept => {
        const matchesSearch = !searchQuery ||
          dept.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dept.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filters.departments.status === 'all' ||
          dept.status === filters.departments.status;

        const userCount = data.users.filter(u => u.department?.id === dept.id).length;
        const matchesHasUsers = filters.departments.hasUsers === 'all' ||
          (filters.departments.hasUsers === 'with' && userCount > 0) ||
          (filters.departments.hasUsers === 'without' && userCount === 0);

        return matchesSearch && matchesStatus && matchesHasUsers;
      });
    }
  };

  // Get paginated data
  const getPaginatedData = () => {
    const filteredData = getFilteredData();
    const type = activeTab;
    const { current, perPage } = pagination[type];
    const startIndex = (current - 1) * perPage;
    const endIndex = startIndex + perPage;
    return filteredData.slice(startIndex, endIndex);
  };

  // Reset forms
  const resetForm = (formName) => {
    setFormData(prev => ({
      ...prev,
      [formName]: formName === 'user' ? {
        phone_number: "",
        email: "",
        full_name: "",
        role: "employee",
        department: "",
        status: "pending",
        availability_status: "inactive"
      } : formName === 'department' ? {
        name: "",
        description: "",
        status: "active"
      } : prev[formName]
    }));
    setErrors({});
  };

  // Show success message
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Show error message
  const showError = (message) => {
    setErrors({ general: message });
    setTimeout(() => setErrors({}), 3000);
  };

  // Handle create user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem('access_token');

      // Prepare the request data
      const requestData = {
        phone_number: formData.user.phone_number,
        email: formData.user.email,
        full_name: formData.user.full_name,
        role: formData.user.role,
        status: formData.user.status,
      };

      // Add department/departments based on role
      if (formData.user.role === 'employee' && formData.user.department) {
        requestData.department = formData.user.department;
      } else if (formData.user.role === 'security_analyst' && formData.user.departments) {
        requestData.departments = formData.user.departments;
      }

      console.log('Creating user with data:', requestData); // Debug log

      const response = await fetch('http://127.0.0.1:8000/auth/register/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
      console.log('Response from server:', result); // Debug log

      if (response.ok) {
        showSuccess('User created successfully! Password has been sent to their email.');
        setShowModal(prev => ({ ...prev, addUser: false }));
        resetForm('user');
        await fetchUsers();
      } else {
        setErrors(result.errors || { general: result.error || 'Failed to create user' });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle update user
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/users/${formData.editUser.id}/update/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData.editUser)
      });

      const result = await response.json();

      if (response.ok) {
        showSuccess('User updated successfully!');
        setShowModal(prev => ({ ...prev, editUser: false }));
        await fetchUsers();
      } else {
        setErrors(result.errors || { general: result.error || 'Failed to update user' });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle create department
  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/departments/create/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData.department)
      });

      const result = await response.json();

      if (response.ok) {
        showSuccess('Department created successfully!');
        setShowModal(prev => ({ ...prev, addDepartment: false }));
        resetForm('department');
        await fetchDepartments();
      } else {
        setErrors(result.errors || { general: result.message || 'Failed to create department' });
      }
    } catch (error) {
      console.error('Error creating department:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle update department
  const handleUpdateDepartment = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/departments/${formData.editDepartment.id}/update/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData.editDepartment)
      });

      const result = await response.json();

      if (response.ok) {
        showSuccess('Department updated successfully!');
        setShowModal(prev => ({ ...prev, editDepartment: false }));
        await fetchDepartments();
      } else {
        setErrors(result.errors || { general: result.message || 'Failed to update department' });
      }
    } catch (error) {
      console.error('Error updating department:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const { type, data: item } = selectedItem;

      let response;
      if (type === 'user') {
        response = await fetch(`http://127.0.0.1:8000/users/${item.id}/delete/`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        response = await fetch(`http://127.0.0.1:8000/departments/${item.id}/delete/`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      if (response.ok) {
        showSuccess(`${type === 'user' ? 'User' : 'Department'} deleted successfully!`);
        if (type === 'user') {
          await fetchUsers();
        } else {
          await fetchDepartments();
        }
      } else {
        const result = await response.json();
        showError(result.error || result.message || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      showError('Network error. Please try again.');
    } finally {
      setActionLoading(false);
      setShowModal(prev => ({ ...prev, deleteConfirm: false }));
      setSelectedItem({ type: null, data: null });
    }
  };

  // Open edit modal
  const openEditModal = (item, type) => {
    if (type === 'user') {
      setFormData(prev => ({
        ...prev,
        editUser: {
          id: item.id,
          phone_number: item.phone_number || "",
          email: item.email || "",
          full_name: item.full_name || "",
          role: item.role || "employee",
          department: item.department_details?.id || item.department || "",
          departments: item.departments || [],
          status: item.status || "pending",
          availability_status: item.availability_status || "inactive"
        }
      }));
      setShowModal(prev => ({ ...prev, editUser: true }));
    } else {
      setFormData(prev => ({
        ...prev,
        editDepartment: {
          id: item.id,
          name: item.name || "",
          description: item.description || "",
          status: item.status || "active"
        }
      }));
      setShowModal(prev => ({ ...prev, editDepartment: true }));
    }
    setErrors({});
  };

  // Open delete confirmation
  const openDeleteConfirm = (item, type) => {
    setSelectedItem({ type, data: item });
    setShowModal(prev => ({ ...prev, deleteConfirm: true }));
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    if (status === 'approved' || status === 'active') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          {status === 'approved' ? 'Active' : 'Active'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="w-3 h-3 mr-1" />
        {status === 'pending' ? 'Pending' : status === 'rejected' ? 'Rejected' : 'Inactive'}
      </span>
    );
  };

  // Get role display name
  const getRoleDisplay = (role) => {
    const roleMap = {
      'admin': 'Administrator',
      'employee': 'Employee',
      'security_analyst': 'Security Analyst',
      'compliance_officer': 'Compliance Officer',
      'hr_manager': 'HR Manager'
    };
    return roleMap[role] || role;
  };

  // Get department user count
  const getDepartmentUserCount = (departmentId) => {
    return data.users.filter(user => user.department?.id === departmentId).length;
  };

  // Get unique departments for filter
  const getUniqueDepartments = () => {
    const names = [];
    data.users.forEach(user => {
      // Employee: department is an integer, details are in department_details object
      if (user.department_details?.name) {
        names.push(user.department_details.name);
      }
      // Security Analyst: details are in departments_details array
      if (user.departments_details?.length > 0) {
        user.departments_details.forEach(d => {
          if (d.name) names.push(d.name);
        });
      }
    });
    return [...new Set(names)];
  };

  // Render User Table Row
  const renderUserRow = (user) => (
    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium shadow-sm">
            {user.full_name?.charAt(0) || 'U'}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
            {/* <div className="text-xs text-gray-500">ID: {user.id}</div> */}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-900">{getRoleDisplay(user.role)}</div>
          <div className="text-xs text-gray-500">
            {user.department_details?.name
              ? user.department_details?.name
              : user.departments_details?.length > 0
                ? user.departments_details.map(d => d.name).join(', ')
                : 'No department'}
          </div>

        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <Mail className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-gray-900">{user.email}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Phone className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-gray-600">{user.phone_number}</span>
          </div>
          {user.work_mail_address && (
            <div className="flex items-center gap-1 text-xs">
              <Tag className="h-3 w-3 text-gray-400" />
              <span className="text-gray-500">{user.work_mail_address}</span>
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-2">
          {getStatusBadge(user.status)}
          <div className="text-xs text-gray-500">
            {user.availability_status === 'active' ? 'Available' : 'Unavailable'}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(user.created_at)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(user, 'user')}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => openDeleteConfirm(user, 'user')}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          {/* <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="h-4 w-4" />
          </button> */}
        </div>
      </td>
    </tr>
  );

  // Render Department Table Row
  const renderDepartmentRow = (dept) => (
    <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white shadow-sm">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{dept.name}</div>
            <div className="text-xs text-gray-500">ID: {dept.id}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {dept.description || 'No description'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          {getStatusBadge(dept.status)}
          <div className="text-xs text-gray-500">
            {getDepartmentUserCount(dept.id)} users
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-1">
          <div className="text-sm text-gray-900">{dept.created_by_details?.full_name || 'System'}</div>
          <div className="text-xs text-gray-500">{dept.created_by_details?.role || 'N/A'}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(dept.created_at)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(dept, 'department')}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => openDeleteConfirm(dept, 'department')}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          {/* <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Eye className="h-4 w-4" />
          </button> */}
        </div>
      </td>
    </tr>
  );

  // Pagination controls
  const paginationControls = (type) => {
    const { current, totalPages } = pagination[type];
    const filteredData = getFilteredData();
    const totalItems = filteredData.length;
    const startItem = (current - 1) * pagination[type].perPage + 1;
    const endItem = Math.min(current * pagination[type].perPage, totalItems);

    const handlePageChange = (newPage) => {
      setPagination(prev => ({
        ...prev,
        [type]: { ...prev[type], current: newPage }
      }));
    };

    return (
      <div className="flex items-center justify-between border-t border-gray-200 pt-6">
        <div className="text-sm text-gray-700">
          Showing {startItem} to {endItem} of {totalItems} entries
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(current - 1)}
            disabled={current === 1}
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (current <= 3) {
              pageNum = i + 1;
            } else if (current >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = current - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${current === pageNum
                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(current + 1)}
            disabled={current === totalPages}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Success Message */}
      <SuccessMessageComponent
        message={successMessage}
        onClose={() => setSuccessMessage("")}
      />

      {/* Loading Overlay */}
      {actionLoading && <LoadingOverlayComponent message="Processing..." />}

      {/* Main Content */}
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <UserCog className="h-8 w-8 text-blue-600" />
                Admin Management Console
              </h1>
              <p className="text-gray-600 mt-1">
                Manage users, departments, and system configurations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  {user?.full_name || 'Administrator'}
                </span>
              </div>
              <button
                onClick={fetchInitialData}
                className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                disabled={loading.users || loading.departments}
              >
                <RefreshCw className={`h-4 w-4 ${loading.users || loading.departments ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => {
                  setActiveTab("users");
                  setSearchQuery("");
                  setFilters(prev => ({ ...prev, users: { ...prev.users, role: 'all', status: 'all', department: 'all', availability: 'all' } }));
                }}
                className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${activeTab === "users"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                <Users className="h-5 w-5 mr-2" />
                User Management
                <span className="ml-2 bg-gray-100 text-gray-900 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {stats.users.total}
                </span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("departments");
                  setSearchQuery("");
                  setFilters(prev => ({ ...prev, departments: { ...prev.departments, status: 'all', hasUsers: 'all' } }));
                }}
                className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${activeTab === "departments"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                <Building2 className="h-5 w-5 mr-2" />
                Department Management
                <span className="ml-2 bg-gray-100 text-gray-900 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {stats.departments.total}
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeTab === "users" ? (
            <>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Users</p>
                    <p className="text-3xl font-bold">{stats.users.total}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm opacity-90">All accounts</span>
                    </div>
                  </div>
                  <UsersIcon className="h-12 w-12 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Active Users</p>
                    <p className="text-3xl font-bold">{stats.users.active}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <UserCheck className="h-4 w-4" />
                      <span className="text-sm opacity-90">Currently active</span>
                    </div>
                  </div>
                  <Activity className="h-12 w-12 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Administrators</p>
                    <p className="text-3xl font-bold">{stats.users.admins}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm opacity-90">System admins</span>
                    </div>
                  </div>
                  <UserCog className="h-12 w-12 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Employees</p>
                    <p className="text-3xl font-bold">{stats.users.employees}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Briefcase className="h-4 w-4" />
                      <span className="text-sm opacity-90">Regular users</span>
                    </div>
                  </div>
                  <Users className="h-12 w-12 opacity-80" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Departments</p>
                    <p className="text-3xl font-bold">{stats.departments.total}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Building2 className="h-4 w-4" />
                      <span className="text-sm opacity-90">All departments</span>
                    </div>
                  </div>
                  <Building className="h-12 w-12 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Active Departments</p>
                    <p className="text-3xl font-bold">{stats.departments.active}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm opacity-90">Currently active</span>
                    </div>
                  </div>
                  <CheckCircle className="h-12 w-12 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Inactive Departments</p>
                    <p className="text-3xl font-bold">{stats.departments.inactive}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm opacity-90">Currently inactive</span>
                    </div>
                  </div>
                  <Building className="h-12 w-12 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Departments with Users</p>
                    <p className="text-3xl font-bold">{stats.departments.withUsers}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm opacity-90">With active users</span>
                    </div>
                  </div>
                  <BarChart className="h-12 w-12 opacity-80" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                placeholder={
                  activeTab === "users"
                    ? "Search users by name, email, phone, or work email..."
                    : "Search departments by name or description..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {activeTab === "users" ? (
                <>
                  <select
                    value={filters.users.role}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      users: { ...prev.users, role: e.target.value }
                    }))}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Administrator</option>
                    <option value="employee">Employee</option>
                    <option value="security_analyst">Security Analyst</option>
                    <option value="compliance_officer">Compliance Officer</option>
                    <option value="hr_manager">HR Manager</option>
                  </select>

                  <select
                    value={filters.users.status}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      users: { ...prev.users, status: e.target.value }
                    }))}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Active</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <select
                    value={filters.users.department}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      users: { ...prev.users, department: e.target.value }
                    }))}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
                  >
                    <option value="all">All Departments</option>
                    {getUniqueDepartments().map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>

                  <select
                    value={filters.users.availability}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      users: { ...prev.users, availability: e.target.value }
                    }))}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
                  >
                    <option value="all">All Availability</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </>
              ) : (
                <>
                  <select
                    value={filters.departments.status}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      departments: { ...prev.departments, status: e.target.value }
                    }))}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>

                  <select
                    value={filters.departments.hasUsers}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      departments: { ...prev.departments, hasUsers: e.target.value }
                    }))}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
                  >
                    <option value="all">All Departments</option>
                    <option value="with">With Users</option>
                    <option value="without">Without Users</option>
                  </select>
                </>
              )}

              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
                <Filter className="h-4 w-4" />
                Apply Filters
              </button>

              {activeTab === "users" ? (
                <button
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                  onClick={() => setShowModal(prev => ({ ...prev, addUser: true }))}
                >
                  <UserPlus className="h-4 w-4" />
                  Add User
                </button>
              ) : (
                <button
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                  onClick={() => setShowModal(prev => ({ ...prev, addDepartment: true }))}
                >
                  <Plus className="h-4 w-4" />
                  Add Department
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Count and Export */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-gray-600">
              Showing {getPaginatedData().length} of {getFilteredData().length} results
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* <button className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg font-medium transition-colors shadow-sm">
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg font-medium transition-colors shadow-sm">
              <FileText className="h-4 w-4" />
              Export PDF
            </button> */}
          </div>
        </div>

        {/* Table/List View */}
        {loading[activeTab] ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-gray-200">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading {activeTab}...</p>
            </div>
          </div>
        ) : activeTab === "users" ? (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role & Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getPaginatedData().length > 0 ? (
                    getPaginatedData().map(renderUserRow)
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <Users className="h-12 w-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                          <p className="text-gray-500 mb-4">
                            {searchQuery || Object.values(filters.users).some(v => v !== 'all')
                              ? "No users match your search criteria. Try adjusting your filters."
                              : "No users available. Add your first user to get started."}
                          </p>
                          {!searchQuery && Object.values(filters.users).every(v => v === 'all') && (
                            <button
                              className="text-blue-600 hover:text-blue-800 font-medium"
                              onClick={() => setShowModal(prev => ({ ...prev, addUser: true }))}
                            >
                              <Plus className="h-4 w-4 inline mr-1" />
                              Add New User
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {getFilteredData().length > 0 && paginationControls('users')}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getPaginatedData().length > 0 ? (
                    getPaginatedData().map(renderDepartmentRow)
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <Building2 className="h-12 w-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
                          <p className="text-gray-500 mb-4">
                            {searchQuery || Object.values(filters.departments).some(v => v !== 'all')
                              ? "No departments match your search criteria. Try adjusting your filters."
                              : "No departments available. Add your first department to get started."}
                          </p>
                          {!searchQuery && Object.values(filters.departments).every(v => v === 'all') && (
                            <button
                              className="text-blue-600 hover:text-blue-800 font-medium"
                              onClick={() => setShowModal(prev => ({ ...prev, addDepartment: true }))}
                            >
                              <Plus className="h-4 w-4 inline mr-1" />
                              Add New Department
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {getFilteredData().length > 0 && paginationControls('departments')}
          </div>
        )}
      </div>

      {/* Modals - All extracted components */}
      <AddUserModalComponent
        show={showModal.addUser}
        onClose={() => {
          setShowModal(prev => ({ ...prev, addUser: false }));
          resetForm('user');
        }}
        formData={formData.user}
        setFormData={(newData) => setFormData(prev => ({ ...prev, user: newData }))}
        errors={errors}
        actionLoading={actionLoading}
        handleSubmit={handleCreateUser}
        departments={data.departments}
      />


      <EditUserModalComponent
        show={showModal.editUser}
        onClose={() => {
          setShowModal(prev => ({ ...prev, editUser: false }));
          setErrors({});
        }}
        formData={formData.editUser}
        setFormData={(newData) => setFormData(prev => ({ ...prev, editUser: newData }))}
        errors={errors}
        actionLoading={actionLoading}
        handleSubmit={handleUpdateUser}
        departments={data.departments}
      />

      <AddDepartmentModalComponent
        show={showModal.addDepartment}
        onClose={() => {
          setShowModal(prev => ({ ...prev, addDepartment: false }));
          resetForm('department');
        }}
        formData={formData.department}
        setFormData={(newData) => setFormData(prev => ({ ...prev, department: newData }))}
        errors={errors}
        actionLoading={actionLoading}
        handleSubmit={handleCreateDepartment}
      />

      <EditDepartmentModalComponent
        show={showModal.editDepartment}
        onClose={() => {
          setShowModal(prev => ({ ...prev, editDepartment: false }));
          setErrors({});
        }}
        formData={formData.editDepartment}
        setFormData={(newData) => setFormData(prev => ({ ...prev, editDepartment: newData }))}
        errors={errors}
        actionLoading={actionLoading}
        handleSubmit={handleUpdateDepartment}
      />

      <DeleteConfirmationModalComponent
        show={showModal.deleteConfirm}
        onClose={() => {
          setShowModal(prev => ({ ...prev, deleteConfirm: false }));
          setSelectedItem({ type: null, data: null });
        }}
        selectedItem={selectedItem}
        actionLoading={actionLoading}
        handleDelete={handleDelete}
      />
    </div>

  );
}