import React, { useState, useEffect } from 'react';
import {
  Shield, FileText, AlertTriangle, CheckCircle, XCircle,
  Search, Download, Eye, Edit, Trash2, Plus,
  Calendar, Users, TrendingUp, TrendingDown, Clock,
  BarChart, ChevronLeft, ChevronRight, RefreshCw,
  Building, Target, Award, Flag, Layers, PieChart,
  Save, X, FileBarChart, CheckSquare, Database,
  UserCheck, ShieldAlert, ClipboardCheck, Gauge,
  Percent, ListChecks, FileSearch, BarChart3, Filter
} from "lucide-react";
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Utility Components
const StatusBadge = ({ status, size = "sm" }) => {
  const statusConfig = {
    'draft': { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
    'planned': { color: 'bg-blue-100 text-blue-800', label: 'Planned' },
    'in_progress': { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' },
    'completed': { color: 'bg-green-100 text-green-800', label: 'Completed' },
    'cancelled': { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
    'open': { color: 'bg-red-100 text-red-800', label: 'Open' },
    'resolved': { color: 'bg-green-100 text-green-800', label: 'Resolved' },
    'closed': { color: 'bg-gray-100 text-gray-800', label: 'Closed' },
    'created': { color: 'bg-gray-100 text-gray-800', label: 'Created' },
    'solved': { color: 'bg-green-100 text-green-800', label: 'Solved' },
  };

  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
  const sizeClass = size === "lg" ? "px-4 py-2 text-sm" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config.color} ${sizeClass}`}>
      {config.label}
    </span>
  );
};

const RemediationStatusBadge = ({ status }) => {
  const statusConfig = {
    'waiting': { color: 'bg-gray-100 text-gray-800', label: 'Waiting' },
    'in_progress': { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' },
    'completed': { color: 'bg-green-100 text-green-800', label: 'Completed' },
    'verified': { color: 'bg-blue-100 text-blue-800', label: 'Verified' },
    'not_required': { color: 'bg-gray-100 text-gray-400', label: 'Not Required' },
  };

  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config.color} px-2 py-1 text-xs`}>
      {config.label}
    </span>
  );
};

const SeverityBadge = ({ severity, size = "sm" }) => {
  const severityConfig = {
    'critical': { color: 'bg-red-500 text-white', label: 'Critical' },
    'high': { color: 'bg-orange-500 text-white', label: 'High' },
    'medium': { color: 'bg-yellow-500 text-black', label: 'Medium' },
    'low': { color: 'bg-green-500 text-white', label: 'Low' },
  };

  const config = severityConfig[severity] || { color: 'bg-gray-500 text-white', label: severity };
  const sizeClass = size === "lg" ? "px-4 py-2 text-sm" : "px-2.5 py-1 text-xs";

  return (
    <span className={`rounded-full font-medium ${config.color} ${sizeClass}`}>
      {config.label}
    </span>
  );
};

const ProgressBar = ({ percentage, color = "blue", showLabel = true, label = null }) => {
  const colorClasses = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    yellow: "bg-yellow-600",
    red: "bg-red-600",
    purple: "bg-purple-600",
  };

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label || 'Progress'}</span>
        {showLabel && <span>{percentage}%</span>}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClasses[color]}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, icon, color, description }) => {
  const iconColors = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    red: "text-red-600 bg-red-50",
    yellow: "text-yellow-600 bg-yellow-50",
    purple: "text-purple-600 bg-purple-50",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${iconColors[color]}`}>
          {icon}
        </div>
        {change && (
          <span className={`inline-flex items-center text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="mb-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-700 mt-1">{title}</p>
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-2">{description}</p>
      )}
    </div>
  );
};

// Create Standard Modal
const CreateStandardModal = ({ isOpen, onClose, onSubmit, standard = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    standard_type: 'gdpr',
    version: '',
    description: '',
    is_active: true,
    total_controls: 0,
    mandatory_controls: 0,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (standard) {
      setFormData({
        name: standard.name || '',
        standard_type: standard.standard_type || 'gdpr',
        version: standard.version || '',
        description: standard.description || '',
        is_active: standard.is_active ?? true,
        total_controls: standard.total_controls || 0,
        mandatory_controls: standard.mandatory_controls || 0,
      });
    }
  }, [standard]);

  const standardTypes = [
    { value: 'gdpr', label: 'GDPR' },
    { value: 'iso27001', label: 'ISO 27001' },
    { value: 'soc2', label: 'SOC 2' },
    { value: 'hipaa', label: 'HIPAA' },
    { value: 'pci_dss', label: 'PCI DSS' },
    { value: 'rwanda_dpa', label: 'Rwanda Data Protection Act' },
    { value: 'nist', label: 'NIST Cybersecurity Framework' },
    { value: 'custom', label: 'Custom Standard' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData, standard?.id);
      onClose();
    } catch (error) {
      console.error('Error saving standard:', error);
      alert(error.response?.data?.error || 'Failed to save standard');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {standard ? 'Edit Compliance Standard' : 'Create New Compliance Standard'}
              </h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Standard Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Standard Type *</label>
                <select
                  required
                  value={formData.standard_type}
                  onChange={(e) => setFormData({ ...formData, standard_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
                >
                  {standardTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Version *</label>
                <input
                  type="text"
                  required
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex items-center space-x-4 mt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={formData.is_active}
                      onChange={() => setFormData({ ...formData, is_active: true })}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!formData.is_active}
                      onChange={() => setFormData({ ...formData, is_active: false })}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm">Inactive</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-4 pt-6 border-t">
              <button type="button" onClick={onClose} className="px-6 py-3 border rounded-xl hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50">
                {loading ? (standard ? 'Updating...' : 'Creating...') : (standard ? 'Update Standard' : 'Create Standard')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Create Finding Modal
const CreateFindingModal = ({ isOpen, onClose, onSubmit, audit, finding = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    finding_type: 'minor',
    risk_level: 'medium',
    status: 'created',
    target_completion_date: '',
    resolution_notes: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (finding) {
      setFormData({
        title: finding.title || '',
        description: finding.description || '',
        finding_type: finding.finding_type || 'minor',
        risk_level: finding.risk_level || 'medium',
        status: finding.status || 'created',
        target_completion_date: finding.target_completion_date || '',
        resolution_notes: finding.resolution_notes || '',
      });
    }
  }, [finding]);

  const findingTypes = [
    { value: 'major', label: 'Major Finding' },
    { value: 'minor', label: 'Minor Finding' },
    { value: 'observation', label: 'Observation' },
    { value: 'incident_related', label: 'Incident-Related' },
  ];

  const riskLevels = [
    { value: 'low', label: 'Low Risk' },
    { value: 'medium', label: 'Medium Risk' },
    { value: 'high', label: 'High Risk' },
    { value: 'critical', label: 'Critical' },
  ];

  const statusOptions = [
    { value: 'created', label: 'Created' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'solved', label: 'Solved' },
    { value: 'closed', label: 'Closed' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...formData, audit: audit.id };
      await onSubmit(data, finding?.id);
      onClose();
    } catch (error) {
      console.error('Error saving finding:', error);
      alert(error.response?.data?.error || 'Failed to save finding');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isEditMode = !!finding;
  const isSolved = finding?.status === 'solved';
  const isClosed = finding?.status === 'closed';
  const isDisabled = isSolved || isClosed;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {finding ? 'Edit Audit Finding' : 'Create New Audit Finding'}
              </h2>
              {isSolved && <p className="text-red-600 text-sm mt-1">Solved findings cannot be edited</p>}
              {isClosed && <p className="text-red-600 text-sm mt-1">Closed findings cannot be edited</p>}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Finding Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={isDisabled}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Finding Type *</label>
                <select
                  required
                  value={formData.finding_type}
                  onChange={(e) => setFormData({ ...formData, finding_type: e.target.value })}
                  disabled={isDisabled}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm disabled:bg-gray-100"
                >
                  {findingTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level *</label>
                <select
                  required
                  value={formData.risk_level}
                  onChange={(e) => setFormData({ ...formData, risk_level: e.target.value })}
                  disabled={isDisabled}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm disabled:bg-gray-100"
                >
                  {riskLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  disabled={isClosed}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm disabled:bg-gray-100"
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isDisabled}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm disabled:bg-gray-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Completion Date</label>
                <input
                  type="date"
                  value={formData.target_completion_date}
                  onChange={(e) => setFormData({ ...formData, target_completion_date: e.target.value })}
                  disabled={isDisabled}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resolution Notes</label>
                <textarea
                  value={formData.resolution_notes}
                  onChange={(e) => setFormData({ ...formData, resolution_notes: e.target.value })}
                  disabled={isDisabled}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm disabled:bg-gray-100"
                  placeholder="Add resolution notes when solving the finding..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-6 border-t">
              <button type="button" onClick={onClose} className="px-6 py-3 border rounded-xl hover:bg-gray-50">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || isDisabled}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (finding ? 'Updating...' : 'Creating...') : (finding ? 'Update Finding' : 'Create Finding')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Control Assessment Modal
const ControlAssessmentModal = ({ isOpen, onClose, onSubmit, audit, control = null }) => {
  const [formData, setFormData] = useState({
    control_name: '',
    control_description: '',
    status: 'not_assessed',
    notes: '',
    remediation_required: false,
    remediation_status: 'waiting',
    remediation_deadline: '',
    remediation_notes: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (control) {
      setFormData({
        control_name: control.control_name || '',
        control_description: control.control_description || '',
        status: control.status || 'not_assessed',
        notes: control.notes || '',
        remediation_required: control.remediation_required || false,
        remediation_status: control.remediation_status || 'waiting',
        remediation_deadline: control.remediation_deadline || '',
        remediation_notes: control.remediation_notes || '',
      });
    }
  }, [control]);

  const statusOptions = [
    { value: 'not_assessed', label: 'Not Assessed' },
    { value: 'compliant', label: 'Compliant' },
    { value: 'non_compliant', label: 'Non-Compliant' },
    { value: 'partially_compliant', label: 'Partially Compliant' },
  ];

  const remediationStatusOptions = [
    { value: 'waiting', label: 'Waiting' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'verified', label: 'Verified' },
    { value: 'not_required', label: 'Not Required' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...formData, audit: audit.id };
      await onSubmit(data, control?.id);
      onClose();
    } catch (error) {
      console.error('Error saving control:', error);
      alert(error.response?.data?.error || 'Failed to save control');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isEditMode = !!control;
  const isCompleted = control?.remediation_status === 'completed';
  const isVerified = control?.remediation_status === 'verified';
  const isDisabled = isCompleted || isVerified;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {control ? 'Edit Control Assessment' : 'Add Control Assessment'}
              </h2>
              {isCompleted && <p className="text-red-600 text-sm mt-1">Completed controls cannot be edited</p>}
              {isVerified && <p className="text-red-600 text-sm mt-1">Verified controls cannot be edited</p>}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Control Name *</label>
                <input
                  type="text"
                  required
                  value={formData.control_name}
                  onChange={(e) => setFormData({ ...formData, control_name: e.target.value })}
                  disabled={isDisabled}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Status *</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  disabled={isDisabled}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm disabled:bg-gray-100"
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Control Description *</label>
              <textarea
                required
                value={formData.control_description}
                onChange={(e) => setFormData({ ...formData, control_description: e.target.value })}
                disabled={isDisabled}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm disabled:bg-gray-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  disabled={isDisabled}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remediation Status</label>
                <select
                  value={formData.remediation_status}
                  onChange={(e) => setFormData({ ...formData, remediation_status: e.target.value })}
                  disabled={isDisabled}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm disabled:bg-gray-100"
                >
                  {remediationStatusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.remediation_required}
                    onChange={(e) => setFormData({ ...formData, remediation_required: e.target.checked })}
                    disabled={isDisabled}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Remediation Required</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remediation Deadline</label>
                <input
                  type="date"
                  value={formData.remediation_deadline}
                  onChange={(e) => setFormData({ ...formData, remediation_deadline: e.target.value })}
                  disabled={isDisabled}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm disabled:bg-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Remediation Notes</label>
              <textarea
                value={formData.remediation_notes}
                onChange={(e) => setFormData({ ...formData, remediation_notes: e.target.value })}
                disabled={isDisabled}
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm disabled:bg-gray-100"
              />
            </div>

            <div className="flex items-center justify-end gap-4 pt-6 border-t">
              <button type="button" onClick={onClose} className="px-6 py-3 border rounded-xl hover:bg-gray-50">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || isDisabled}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (control ? 'Updating...' : 'Creating...') : (control ? 'Update Control' : 'Add Control')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Create Audit Modal
const CreateAuditModal = ({ isOpen, onClose, onSubmit, standards = [], incidents = [], user }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    standard_id: '',
    audit_type: 'internal',
    incident_ids: [],
    planned_start_date: '',
    planned_end_date: '',
    lead_auditor_id: user?.id || '',
    priority: 'medium',
  });

  const [loading, setLoading] = useState(false);
  const [selectedIncidents, setSelectedIncidents] = useState([]);
  const [incidentSearch, setIncidentSearch] = useState('');

  const auditTypes = [
    { value: 'internal', label: 'Internal Audit' },
    { value: 'external', label: 'External Audit' },
    { value: 'regulatory', label: 'Regulatory Audit' },
    { value: 'certification', label: 'Certification Audit' },
    { value: 'incident_response', label: 'Incident Response Audit' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  // Filter incidents based on search
  const filteredIncidents = incidents.filter(incident =>
    incident.title?.toLowerCase().includes(incidentSearch.toLowerCase()) ||
    incident.incident_number?.toLowerCase().includes(incidentSearch.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        incident_ids: selectedIncidents.map(inc => inc.id),
      };
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error creating audit:', error);
      alert(error.response?.data?.error || 'Failed to create audit');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Compliance Audit</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Audit Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Compliance Standard *</label>
                <select
                  required
                  value={formData.standard_id}
                  onChange={(e) => setFormData({ ...formData, standard_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
                >
                  <option value="">Select standard</option>
                  {standards.map(standard => (
                    <option key={standard.id} value={standard.id}>
                      {standard.name} ({standard.standard_type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Audit Type *</label>
                <select
                  required
                  value={formData.audit_type}
                  onChange={(e) => setFormData({ ...formData, audit_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
                >
                  {auditTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
                <select
                  required
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
                >
                  {priorityOptions.map(priority => (
                    <option key={priority.value} value={priority.value}>{priority.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Planned Start Date *</label>
                <input
                  type="date"
                  required
                  value={formData.planned_start_date}
                  onChange={(e) => setFormData({ ...formData, planned_start_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Planned End Date *</label>
                <input
                  type="date"
                  required
                  value={formData.planned_end_date}
                  onChange={(e) => setFormData({ ...formData, planned_end_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Link to Incidents (Optional)</label>
              <div className="mb-3 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search incidents..."
                  value={incidentSearch}
                  onChange={(e) => setIncidentSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="border border-gray-300 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                {filteredIncidents.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No incidents found</div>
                ) : (
                  filteredIncidents.map(incident => (
                    <label
                      key={incident.id}
                      className={`flex items-center gap-3 p-3 border-b border-gray-200 last:border-b-0 cursor-pointer hover:bg-gray-50 ${selectedIncidents.some(inc => inc.id === incident.id) ? 'bg-blue-50' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIncidents.some(inc => inc.id === incident.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIncidents([...selectedIncidents, incident]);
                          } else {
                            setSelectedIncidents(selectedIncidents.filter(inc => inc.id !== incident.id));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{incident.incident_number}</div>
                        <div className="text-xs text-gray-500">{incident.title}</div>
                      </div>
                      <SeverityBadge severity={incident.severity} size="sm" />
                    </label>
                  ))
                )}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {selectedIncidents.length} incident(s) selected
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-6 border-t">
              <button type="button" onClick={onClose} className="px-6 py-3 border rounded-xl hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Creating...' : 'Create Audit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Audit Detail Modal
const AuditDetailModal = ({ isOpen, onClose, audit, user, onUpdate, onDelete, onAddFinding, onAddControl, findings = [], controls = [], onFindingUpdate, onControlUpdate, onFindingDelete, onControlDelete }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [canComplete, setCanComplete] = useState(false);
  const [completionCheck, setCompletionCheck] = useState(null);

  // Check if user has admin or security_analyst role
  const canModify = user && (user.role === 'admin' || user.role === 'security_analyst' || user.is_admin);
  const canDelete = user && (user.role === 'admin' || user.is_admin || user.role === 'compliance_officer');
  const canCompleteAudit = user && (user.role === 'admin' || user.role === 'security_analyst' || user.is_admin);
  const hasFullAccess = user && (user.role === 'admin' || user.is_admin);
  const hasMiddleAccess = user && (user.role === 'security_analyst');
  const hasLessAccess = user && !(user.role === 'admin' || user.is_admin || user.role === 'security_analyst');
  const canView = user && (user.role === 'admin' || user.role === 'security_analyst' || user.is_admin || user.role === 'compliance_officer');

  // Determine if user can edit/delete findings and controls
  const canEditFindings = user && (user.role === 'admin' || user.role === 'security_analyst' || user.role === 'compliance_officer' || user.is_admin);
  const canEditControls = user && (user.role === 'admin' || user.role === 'security_analyst' || user.role === 'compliance_officer' || user.is_admin);
  const canDeleteFindings = user && (user.role === 'admin' || user.role === 'security_analyst' || user.is_admin);
  const canDeleteControls = user && (user.role === 'admin' || user.role === 'security_analyst' || user.is_admin);

  // Check if audit can be completed
  const checkCompletionReadiness = async () => {
    if (!audit) return;
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `${API_BASE_URL}/compliance-audit/audits/${audit.id}/check-completion/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setCanComplete(response.data.can_complete);
        setCompletionCheck(response.data.readiness);
      }
    } catch (error) {
      console.error('Error checking completion readiness:', error);
    }
  };

  useEffect(() => {
    if (isOpen && audit) {
      checkCompletionReadiness();
    }
  }, [isOpen, audit, findings, controls]);

  if (!isOpen || !audit) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateAuditProgress = () => {
    if (!controls || controls.length === 0) return 0;
    const completedControls = controls.filter(control =>
      control.status === 'compliant' || control.status === 'non_compliant'
    ).length;
    return Math.round((completedControls / controls.length) * 100);
  };

  const calculateComplianceScore = () => {
    if (!controls || controls.length === 0) return 0;
    const compliantControls = controls.filter(control =>
      control.status === 'compliant'
    ).length;
    return Math.round((compliantControls / controls.length) * 100);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(audit.id);
      onClose();
    } catch (error) {
      console.error('Error deleting audit:', error);
      alert('Failed to delete audit');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!canComplete) {
      alert('Cannot complete audit. Please ensure all findings are solved and all required controls are completed.');
      return;
    }
    setLoading(true);
    try {
      await onUpdate(audit.id, { status: 'completed' });
      onClose();
    } catch (error) {
      console.error('Error completing audit:', error);
      alert('Failed to complete audit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        <div className="border-b border-gray-200 p-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{audit.title}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-medium text-gray-700">{audit.audit_id}</span>
                    <StatusBadge status={audit.status} size="lg" />
                    {audit.overall_score && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${audit.overall_score >= 90 ? 'bg-green-100 text-green-800' :
                        audit.overall_score >= 70 ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        Score: {audit.overall_score}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mt-2">{audit.description}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mt-8 flex space-x-6 overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview', icon: <BarChart3 /> },
              { key: 'findings', label: 'Findings', icon: <Flag />, count: findings.length },
              { key: 'controls', label: 'Controls', icon: <CheckSquare />, count: controls.length },
            ].map(({ key, label, icon, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`pb-3 px-1 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {icon}
                {label}
                {count !== undefined && (
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-medium text-gray-700 mb-4">Audit Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Standard:</span>
                      <span className="font-medium">{audit.standard_details?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{audit.audit_type?.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lead Auditor:</span>
                      <span className="font-medium">{audit.lead_auditor_details?.full_name || 'Unassigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <span className="font-medium capitalize">{audit.priority}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-medium text-gray-700 mb-4">Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Planned Start:</span>
                      <span className="font-medium">{formatDate(audit.planned_start_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Planned End:</span>
                      <span className="font-medium">{formatDate(audit.planned_end_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Actual Start:</span>
                      <span className="font-medium">{formatDate(audit.actual_start_date) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Actual End:</span>
                      <span className="font-medium">{formatDate(audit.actual_end_date) || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-medium text-gray-700 mb-4">Audit Progress</h3>
                  <ProgressBar
                    percentage={calculateAuditProgress()}
                    color="blue"
                    label={`${controls.filter(c => c.status === 'compliant' || c.status === 'non_compliant').length} of ${controls.length} controls assessed`}
                  />
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {controls.filter(c => c.status === 'compliant').length}
                      </div>
                      <div className="text-sm text-gray-600">Compliant</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {controls.filter(c => c.status === 'partially_compliant').length}
                      </div>
                      <div className="text-sm text-gray-600">Partial</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {controls.filter(c => c.status === 'non_compliant').length}
                      </div>
                      <div className="text-sm text-gray-600">Non-Compliant</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-medium text-gray-700 mb-4">Compliance Score</h3>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {calculateComplianceScore()}%
                    </div>
                    <div className="text-sm text-gray-600">Overall Compliance</div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-medium text-gray-700 mb-4">Completion Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Findings Solved:</span>
                      <span className={`font-medium ${completionCheck?.all_findings_solved ? 'text-green-600' : 'text-red-600'}`}>
                        {findings.filter(f => f.status === 'solved' || f.status === 'closed').length} / {findings.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Controls Completed:</span>
                      <span className={`font-medium ${completionCheck?.all_controls_completed ? 'text-green-600' : 'text-red-600'}`}>
                        {controls.filter(c => c.remediation_status === 'completed').length} / {controls.filter(c => c.remediation_required).length}
                      </span>
                    </div>
                    {completionCheck && !completionCheck.all_findings_solved && (
                      <div className="text-xs text-red-600 mt-2">
                        ⚠️ {completionCheck.unsolved_findings_count} unsolved finding(s) remaining
                      </div>
                    )}
                    {completionCheck && !completionCheck.all_controls_completed && (
                      <div className="text-xs text-red-600 mt-2">
                        ⚠️ {completionCheck.incomplete_controls_count} incomplete control(s) remaining
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'findings' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-700">Audit Findings</h3>
                {canEditFindings && audit.status !== 'completed' && (
                  <button
                    onClick={() => onAddFinding(audit)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Finding
                  </button>
                )}
              </div>

              {findings.length === 0 ? (
                <div className="text-center py-12">
                  <Flag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No findings added yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Title</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Type/Risk</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Due Date</th>
                        {canEditFindings && audit.status !== 'completed' && (
                          <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {findings.map(finding => {
                        const isSolved = finding.status === 'solved' || finding.status === 'closed';
                        const isEditable = canEditFindings && audit.status !== 'completed' && !isSolved;

                        return (
                          <tr key={finding.id} className="hover:bg-gray-50">
                            <td className="py-4 px-6">
                              <div className="max-w-xs">
                                <div className="font-medium text-sm text-gray-900 truncate">{finding.title}</div>
                                <div className="text-xs text-gray-500 truncate">{finding.description?.substring(0, 50)}...</div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex flex-col gap-1">
                                <span className={`text-xs px-2 py-1 rounded-full w-fit ${finding.finding_type === 'major' ? 'bg-red-100 text-red-800' :
                                  finding.finding_type === 'minor' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                  {finding.finding_type}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full w-fit ${finding.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                                  finding.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                  {finding.risk_level}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <StatusBadge status={finding.status} />
                            </td>
                            <td className="py-4 px-6">
                              <span className={`text-sm ${finding.target_completion_date &&
                                new Date(finding.target_completion_date) < new Date() &&
                                ['created', 'in_progress'].includes(finding.status) ?
                                'text-red-600 font-medium' : 'text-gray-600'
                                }`}>
                                {formatDate(finding.target_completion_date)}
                              </span>
                            </td>
                            {canEditFindings && audit.status !== 'completed' && (
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => onAddFinding(audit, finding)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                    title="Edit"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  {canDeleteFindings && (finding.status !== 'solved' && finding.status !== 'resolved') && (
                                    <button
                                      onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this finding?')) {
                                          onFindingDelete?.(finding.id);
                                        }
                                      }}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'controls' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-700">Control Assessments</h3>
                {canEditControls && audit.status !== 'completed' && (
                  <button
                    onClick={() => onAddControl(audit)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Control
                  </button>
                )}
              </div>

              {controls.length === 0 ? (
                <div className="text-center py-12">
                  <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No controls assessed yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Control Name</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Remediation</th>
                        {canEditControls && audit.status !== 'completed' && (
                          <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {controls.map(control => {
                        const isCompleted = control.remediation_status === 'completed' || control.remediation_status === 'verified';
                        const isEditable = canEditControls && audit.status !== 'completed' && !isCompleted;

                        return (
                          <tr key={control.id} className="hover:bg-gray-50">
                            <td className="py-4 px-6">
                              <div className="max-w-xs">
                                <div className="font-medium text-sm text-gray-900 truncate">
                                  {control.control_name}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {control.control_description?.substring(0, 50)}...
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${control.status === 'compliant' ? 'bg-green-100 text-green-800' :
                                control.status === 'non_compliant' ? 'bg-red-100 text-red-800' :
                                  control.status === 'partially_compliant' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                {control.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              {control.remediation_required ? (
                                <div className="space-y-1">
                                  <RemediationStatusBadge status={control.remediation_status} />
                                  {control.remediation_deadline && (
                                    <div className="text-xs text-gray-500">
                                      Due: {formatDate(control.remediation_deadline)}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">Not required</span>
                              )}
                            </td>
                            {canEditControls && audit.status !== 'completed' && (
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => onAddControl(audit, control)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                    title="Edit"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  {canDeleteControls && (
                                    <button
                                      onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this control assessment?')) {
                                          onControlDelete?.(control.id);
                                        }
                                      }}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-8 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              {canCompleteAudit && audit.status !== 'completed' && (
                <button
                  onClick={handleMarkComplete}
                  disabled={!canComplete || loading}
                  className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors ${canComplete
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-400 cursor-not-allowed text-white'
                    }`}
                  title={!canComplete ? "Complete all findings and controls first" : ""}
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark Complete
                </button>
              )}
            </div>

            {canDelete && (
              <div className="relative">
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Audit
                  </button>
                ) : (
                  <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-red-200">
                    <span className="text-sm text-red-700 font-medium">Confirm deletion?</span>
                    <button
                      onClick={handleDelete}
                      disabled={loading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 border border-red-300 text-red-700 rounded-lg text-sm hover:bg-red-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
export function ComplianceAudit() {
  const { user } = useAuth();
  console.log('Current user:', user);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    overview: {},
    audits: [],
    standards: [],
    findings: [],
    controls: [],
    incidents: [],
    reports: [],
  });

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    audit_type: '',
    page: 1,
    page_size: 10,
  });

  const [activeView, setActiveView] = useState('audits');
  const [showCreateAuditModal, setShowCreateAuditModal] = useState(false);
  const [showAuditDetailModal, setShowAuditDetailModal] = useState(false);
  const [showCreateStandardModal, setShowCreateStandardModal] = useState(false);
  const [showCreateFindingModal, setShowCreateFindingModal] = useState(false);
  const [showControlAssessmentModal, setShowControlAssessmentModal] = useState(false);

  const [selectedAudit, setSelectedAudit] = useState(null);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [selectedControl, setSelectedControl] = useState(null);
  const [selectedStandard, setSelectedStandard] = useState(null);

  const token = localStorage.getItem('access_token');

  // Role-based permissions
  const canCreateStandard = user && (user.role === 'admin' || user.role === 'security_analyst' || user.is_admin);
  const canCreateAudit = user && (user.role === 'admin' || user.role === 'security_analyst' || user.role === 'compliance_officer' || user.is_admin);
  const canCreateFinding = user && (user.role === 'admin' || user.role === 'security_analyst' || user.role === 'compliance_officer' || user.is_admin);
  const canCreateControl = user && (user.role === 'admin' || user.role === 'security_analyst' || user.role === 'compliance_officer' || user.is_admin);
  const canDeleteCompletedIncident = user && (user.role === 'admin' || user.is_admin);
  const hasFullAccess = user && (user.role === 'admin' && user.is_admin);
  const hasMiddleAccess = user && (user.role === 'compliance_officer');
  const hasLessAccess = user && (user.role === 'compliance_officer');
  const canView = user && (user.role === 'admin' || user.role === 'security_analyst' || user.is_admin || user.role === 'compliance_officer');

  // Fetch all data
  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Fetch standards
      const standardsRes = await axios.get(`${API_BASE_URL}/compliance-audit/standards/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const standards = standardsRes.data?.results?.standards || standardsRes.data || [];

      // Fetch audits
      const auditsRes = await axios.get(`${API_BASE_URL}/compliance-audit/audits/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: filters.search,
          status: filters.status,
          audit_type: filters.audit_type,
          page: filters.page,
          page_size: filters.page_size
        }
      });
      const audits = auditsRes.data.audits || auditsRes.data?.results?.audits || auditsRes.data || [];

      // Fetch findings
      const findingsRes = await axios.get(`${API_BASE_URL}/compliance-audit/findings/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page_size: 100 }
      });
      const findings = findingsRes.data.findings || findingsRes.data?.results?.findings || findingsRes.data || [];

      // Fetch controls
      const controlsRes = await axios.get(`${API_BASE_URL}/compliance-audit/controls/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page_size: 100 }
      }).catch(() => ({ data: [] }));
      const controls = controlsRes.data.control_assessments || controlsRes.data?.results?.control_assessments || controlsRes.data || [];

      // Fetch incidents for audit creation
      const incidentsRes = await axios.get(`${API_BASE_URL}/compliance-audit/incidents/for-audit/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page_size: 100 }
      }).catch(() => ({ data: [] }));
      const incidents = incidentsRes.data.incidents || incidentsRes.data || [];

      // Fetch dashboard overview
      const overviewRes = await axios.get(`${API_BASE_URL}/compliance-audit/dashboard/`, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => ({ data: {} }));
      const overview = overviewRes.data.dashboard || overviewRes.data || {};

      setData({
        overview,
        audits: Array.isArray(audits) ? audits : [],
        standards: Array.isArray(standards) ? standards : [],
        findings: Array.isArray(findings) ? findings : [],
        controls: Array.isArray(controls) ? controls : [],
        incidents: Array.isArray(incidents) ? incidents : [],
        reports: [],
      });

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [token, filters.page, filters.status, filters.audit_type, filters.search]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  // Handle search with debounce
  const handleSearch = (searchTerm) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1,
    }));
  };

  // Handle create standard
  const handleCreateStandard = async (standardData, standardId = null) => {
    try {
      if (standardId) {
        await axios.patch(
          `${API_BASE_URL}/compliance-audit/standards/${standardId}/`,
          standardData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/compliance-audit/standards/`,
          standardData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      fetchAllData();
      alert(`Standard ${standardId ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error saving standard:', error);
      alert(error.response?.data?.error || 'Failed to save standard');
    }
  };

  // Handle delete standard
  const handleDeleteStandard = async (standardId) => {
    if (!window.confirm('Are you sure you want to delete this standard? This action cannot be undone.')) {
      return;
    }
    try {
      await axios.delete(
        `${API_BASE_URL}/compliance-audit/standards/${standardId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAllData();
      alert('Standard deleted successfully!');
    } catch (error) {
      console.error('Error deleting standard:', error);
      alert('Failed to delete standard');
    }
  };

  // Handle create finding
  const handleCreateFinding = async (findingData, findingId = null) => {
    try {
      if (findingId) {
        await axios.patch(
          `${API_BASE_URL}/compliance-audit/findings/${findingId}/`,
          findingData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/compliance-audit/findings/`,
          findingData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      fetchAllData();
      alert(`Finding ${findingId ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error saving finding:', error);
      alert(error.response?.data?.error || 'Failed to save finding');
    }
  };

  // Handle delete finding
  const handleDeleteFinding = async (findingId) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/compliance-audit/findings/${findingId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAllData();
      alert('Finding deleted successfully!');
    } catch (error) {
      console.error('Error deleting finding:', error);
      alert(error.response?.data?.error || 'Failed to delete finding');
    }
  };

  // Handle create control
  const handleCreateControl = async (controlData, controlId = null) => {
    try {
      if (controlId) {
        await axios.patch(
          `${API_BASE_URL}/compliance-audit/controls/${controlId}/`,
          controlData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/compliance-audit/controls/`,
          controlData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      fetchAllData();
      alert(`Control assessment ${controlId ? 'updated' : 'added'} successfully!`);
    } catch (error) {
      console.error('Error saving control:', error);
      alert(error.response?.data?.error || 'Failed to save control');
    }
  };

  // Handle delete control
  const handleDeleteControl = async (controlId) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/compliance-audit/controls/${controlId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAllData();
      alert('Control deleted successfully!');
    } catch (error) {
      console.error('Error deleting control:', error);
      alert(error.response?.data?.error || 'Failed to delete control');
    }
  };

  // Handle delete audit
  const handleDeleteAudit = async (auditId) => {
    if (!window.confirm('Are you sure you want to delete this audit?')) return;
    try {
      await axios.delete(
        `${API_BASE_URL}/compliance-audit/audits/${auditId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAllData();
      alert('Audit deleted successfully!');
    } catch (error) {
      console.error('Error deleting audit:', error);
      alert('Failed to delete audit');
    }
  };

  // Handle update audit
  const handleUpdateAudit = async (auditId, updateData) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/compliance-audit/audits/${auditId}/`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAllData();
      alert('Audit updated successfully!');
    } catch (error) {
      console.error('Error updating audit:', error);
      alert('Failed to update audit');
    }
  };

  // Handle create audit
  const handleCreateAudit = async (auditData) => {
    try {
      await axios.post(
        `${API_BASE_URL}/compliance-audit/audits/`,
        auditData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowCreateAuditModal(false);
      fetchAllData();
      alert('Audit created successfully!');
    } catch (error) {
      console.error('Error creating audit:', error);
      alert(error.response?.data?.error || 'Failed to create audit');
    }
  };

  // Handle delete completed incident (admin only)
  const handleDeleteCompletedIncident = async (incidentId) => {
    if (!window.confirm('Are you sure you want to permanently delete this completed incident? This will also delete all related audits, findings, and controls.')) {
      return;
    }
    try {
      await axios.delete(
        `${API_BASE_URL}/compliance-audit/incidents/completed/${incidentId}/delete/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAllData();
      alert('Completed incident deleted successfully!');
    } catch (error) {
      console.error('Error deleting completed incident:', error);
      alert(error.response?.data?.error || 'Failed to delete incident');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const statistics = {
    totalAudits: data.audits.length,
    completedAudits: data.audits.filter(a => a.status === 'completed').length,
    incidentAudits: data.audits.filter(a => a.audit_type === 'incident_response').length,
    openFindings: data.findings.filter(f => f.status === 'created' || f.status === 'in_progress').length,
    highRiskFindings: data.findings.filter(f => f.risk_level === 'high' || f.risk_level === 'critical').length,
    totalStandards: data.standards.length,
    activeStandards: data.standards.filter(s => s.is_active).length,
    totalControls: data.controls.length,
    compliantControls: data.controls.filter(c => c.status === 'compliant').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Compliance Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Shield className="h-8 w-8" />
                <h1 className="text-3xl font-bold">Compliance Audit Management</h1>
              </div>
              <p className="text-blue-100 max-w-3xl">
                Comprehensive compliance auditing system with standards management,
                findings tracking, control assessments, and detailed reporting.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {canCreateAudit && (
                <button
                  onClick={() => setShowCreateAuditModal(true)}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                  New Audit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Audits"
            value={statistics.totalAudits}
            icon={<Shield className="h-6 w-6" />}
            color="blue"
            description="Across all standards"
          />
          <StatCard
            title="Active Standards"
            value={statistics.activeStandards}
            icon={<Award className="h-6 w-6" />}
            color="green"
            description="Compliance frameworks"
          />
          <StatCard
            title="Open Findings"
            value={statistics.openFindings}
            icon={<Flag className="h-6 w-6" />}
            color="yellow"
            description="Requiring action"
          />
          <StatCard
            title="Controls Assessed"
            value={statistics.totalControls}
            icon={<CheckSquare className="h-6 w-6" />}
            color="purple"
            description="Across all audits"
          />
        </div>

        {/* View Tabs - Only Audits*/}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex w-full">
              {[
                { key: 'audits', label: 'Audits', count: statistics.totalAudits, icon: <Shield className="h-4 w-4" /> },
                { key: 'standards', label: 'Standards', count: statistics.totalStandards, icon: <Award className="h-4 w-4" /> },
              ].map(({ key, label, count, icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveView(key)}
                  className={`flex-1 py-4 px-4 border-b-2 font-medium flex items-center justify-center gap-2 transition-colors text-sm sm:text-base ${activeView === key
                      ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {icon}
                  <span>{label}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${activeView === key
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                    }`}>
                    {count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="p-8">
            {activeView === 'audits' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search audits..."
                        value={filters.search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-64"
                      />
                    </div>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange({ status: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="planned">Planned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <select
                      value={filters.audit_type}
                      onChange={(e) => handleFilterChange({ audit_type: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">All Types</option>
                      <option value="internal">Internal</option>
                      <option value="external">External</option>
                      <option value="regulatory">Regulatory</option>
                      <option value="certification">Certification</option>
                      <option value="incident_response">Incident Response</option>
                    </select>
                  </div>
                  <button
                    onClick={fetchAllData}
                    className="p-2 text-gray-600 hover:text-gray-900"
                    title="Refresh"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Audit ID</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Title</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Standard</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Status</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Progress</th>
                        {canView && <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.audits.map(audit => {
                        const auditControls = data.controls.filter(c => c.audit === audit.id);
                        const completedControls = auditControls.filter(c =>
                          c.status === 'compliant' || c.status === 'non_compliant'
                        ).length;
                        const progress = auditControls.length > 0
                          ? Math.round((completedControls / auditControls.length) * 100)
                          : 0;

                        return (
                          <tr key={audit.id} className="hover:bg-gray-50">
                            <td className="py-4 px-6">
                              <div className="font-medium text-sm text-gray-900">{audit.audit_id}</div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="max-w-xs">
                                <div className="font-medium text-sm text-gray-900 truncate">{audit.title}</div>
                                <div className="text-xs text-gray-500 truncate">{audit.description?.substring(0, 50)}...</div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="text-sm text-gray-700">{audit.standard_details?.name || audit.standard?.name || 'N/A'}</div>
                            </td>
                            <td className="py-4 px-6">
                              <StatusBadge status={audit.status} />
                            </td>
                            <td className="py-4 px-6">
                              <ProgressBar
                                percentage={progress}
                                color={progress >= 90 ? 'green' : progress >= 70 ? 'blue' : progress >= 50 ? 'yellow' : 'red'}
                                showLabel={false}
                              />
                              <div className="text-xs text-gray-500 mt-1">
                                {completedControls} of {auditControls.length} controls
                              </div>
                            </td>
                            {canView && (
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedAudit(audit);
                                      setShowAuditDetailModal(true);
                                    }}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                    title="View Details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  {canDeleteCompletedIncident && audit.status === 'completed' && (
                                    <button
                                      onClick={() => handleDeleteAudit(audit.id)}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeView === 'standards' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-900">Compliance Standards</h3>
                  {canCreateStandard && (
                    <button
                      onClick={() => {
                        setSelectedStandard(null);
                        setShowCreateStandardModal(true);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Standard
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.standards.map(standard => (
                    <div key={standard.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-blue-50 rounded-xl">
                            <Award className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{standard.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-600">{standard.standard_type}</span>
                              <span className="text-sm text-gray-500">v{standard.version}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${standard.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {standard.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{standard.description}</p>

                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Total Controls:</span>
                          <span className="font-medium">{standard.total_controls || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Mandatory Controls:</span>
                          <span className="font-medium">{standard.mandatory_controls || 0}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => {
                            handleFilterChange({ standard_id: standard.id });
                            setActiveView('audits');
                          }}
                          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          View Audits
                        </button>
                        {hasFullAccess && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedStandard(standard);
                                setShowCreateStandardModal(true);
                              }}
                              className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteStandard(standard.id)}
                              className="px-3 border border-red-300 hover:bg-red-50 text-red-700 py-2 rounded-lg text-sm font-medium transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeView === 'incidents' && (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-gray-900">{data.incidents.length}</div>
                    <div className="text-sm text-gray-600">Total Incidents</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {data.incidents.filter(i => i.severity === 'critical').length}
                    </div>
                    <div className="text-sm text-gray-600">Critical</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {data.incidents.filter(i => i.status === 'pending' || i.status === 'investigating').length}
                    </div>
                    <div className="text-sm text-gray-600">Active</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {data.incidents.filter(i => i.compliance_audits?.length > 0).length}
                    </div>
                    <div className="text-sm text-gray-600">With Audits</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Incident ID</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Title</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Severity</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Status</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Created</th>
                        {canDeleteCompletedIncident && <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.incidents.slice(0, 10).map(incident => {
                        const isCompleted = incident.status === 'resolved' || incident.status === 'closed';
                        return (
                          <tr key={incident.id} className="hover:bg-gray-50">
                            <td className="py-4 px-6">
                              <div className="font-medium text-sm text-gray-900">{incident.incident_number}</div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="max-w-xs">
                                <div className="font-medium text-sm text-gray-900 truncate">{incident.title}</div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <SeverityBadge severity={incident.severity} />
                            </td>
                            <td className="py-4 px-6">
                              <StatusBadge status={incident.status} />
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-sm text-gray-600">{formatDate(incident.created_at)}</span>
                            </td>
                            {canDeleteCompletedIncident && isCompleted && (
                              <td className="py-4 px-6">
                                <button
                                  onClick={() => handleDeleteCompletedIncident(incident.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Delete Completed Incident"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateAuditModal
        isOpen={showCreateAuditModal}
        onClose={() => setShowCreateAuditModal(false)}
        onSubmit={handleCreateAudit}
        standards={data.standards}
        incidents={data.incidents}
        user={user}
      />

      <AuditDetailModal
        isOpen={showAuditDetailModal}
        onClose={() => {
          setShowAuditDetailModal(false);
          setSelectedAudit(null);
        }}
        audit={selectedAudit}
        user={user}
        onUpdate={handleUpdateAudit}
        onDelete={handleDeleteAudit}
        onAddFinding={(audit, finding = null) => {
          setSelectedFinding(finding);
          setSelectedAudit(audit);
          setShowCreateFindingModal(true);
        }}
        onAddControl={(audit, control = null) => {
          setSelectedControl(control);
          setSelectedAudit(audit);
          setShowControlAssessmentModal(true);
        }}
        findings={data.findings.filter(f => f.audit === selectedAudit?.id)}
        controls={data.controls.filter(c => c.audit === selectedAudit?.id)}
        onFindingUpdate={handleCreateFinding}
        onControlUpdate={handleCreateControl}
        onFindingDelete={handleDeleteFinding}
        onControlDelete={handleDeleteControl}
      />

      <CreateStandardModal
        isOpen={showCreateStandardModal}
        onClose={() => {
          setShowCreateStandardModal(false);
          setSelectedStandard(null);
        }}
        onSubmit={handleCreateStandard}
        standard={selectedStandard}
      />

      <CreateFindingModal
        isOpen={showCreateFindingModal}
        onClose={() => {
          setShowCreateFindingModal(false);
          setSelectedFinding(null);
        }}
        onSubmit={handleCreateFinding}
        audit={selectedAudit}
        finding={selectedFinding}
      />

      <ControlAssessmentModal
        isOpen={showControlAssessmentModal}
        onClose={() => {
          setShowControlAssessmentModal(false);
          setSelectedControl(null);
        }}
        onSubmit={handleCreateControl}
        audit={selectedAudit}
        control={selectedControl}
      />
    </div>
  );
}

export default ComplianceAudit;