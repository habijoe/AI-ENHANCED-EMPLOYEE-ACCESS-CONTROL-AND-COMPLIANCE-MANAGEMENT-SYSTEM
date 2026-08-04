import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Bell,
  Lock,
  Shield,
  Mail,
  Smartphone,
  Globe,
  Save,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    securityAlerts: true,
    complianceReports: true,
    systemUpdates: false
  });

  const [security, setSecurity] = useState({
    twoFactor: true,
    sessionTimeout: "30",
    ipWhitelist: true,
    passwordExpiry: "90"
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSwitchChange = (category, field, checked) => {
    if (category === 'notifications') {
      setNotifications({ ...notifications, [field]: checked });
    } else if (category === 'security') {
      setSecurity({ ...security, [field]: checked });
    }
  };

  const handleInputChange = (field, value) => {
    setSecurity({ ...security, [field]: value });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header with Requirements */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <SettingsIcon className="h-8 w-8 text-blue-600" />
              System Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Configure system preferences, security settings, and notification options
            </p>
          </div>
          <div className="border border-gray-300 text-gray-700 px-3 py-1 rounded-full text-xs">
            Admin Access
          </div>
        </div>
        
        {/* Requirements Description */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-blue-800">Module Requirements:</p>
              <p className="text-gray-700">
                <strong>Settings & Configuration Management:</strong> Provides centralized system configuration, 
                notification preferences, security settings (2FA, session timeout, IP whitelisting), 
                password policies, and regional settings. Implements role-based access to sensitive 
                configurations ensuring only administrators can modify critical security parameters.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Notification Preferences</h2>
                <p className="text-gray-600">Manage how you receive alerts and updates</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="block text-base font-medium">Email Notifications</label>
                <p className="text-sm text-gray-500">Receive alerts via email</p>
              </div>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${notifications.email ? 'bg-blue-600' : 'bg-gray-300'}`}
                onClick={() => handleSwitchChange('notifications', 'email', !notifications.email)}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications.email ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="block text-base font-medium">Push Notifications</label>
                <p className="text-sm text-gray-500">Browser push notifications</p>
              </div>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${notifications.push ? 'bg-blue-600' : 'bg-gray-300'}`}
                onClick={() => handleSwitchChange('notifications', 'push', !notifications.push)}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications.push ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="block text-base font-medium">SMS Alerts</label>
                <p className="text-sm text-gray-500">Critical alerts via SMS</p>
              </div>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${notifications.sms ? 'bg-blue-600' : 'bg-gray-300'}`}
                onClick={() => handleSwitchChange('notifications', 'sms', !notifications.sms)}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications.sms ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="pt-4 border-t border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="block text-base font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    Security Alerts
                  </label>
                  <p className="text-sm text-gray-500">High-priority security notifications</p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${notifications.securityAlerts ? 'bg-blue-600' : 'bg-gray-300'}`}
                  onClick={() => handleSwitchChange('notifications', 'securityAlerts', !notifications.securityAlerts)}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications.securityAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="block text-base font-medium">Compliance Reports</label>
                  <p className="text-sm text-gray-500">Weekly compliance summaries</p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${notifications.complianceReports ? 'bg-blue-600' : 'bg-gray-300'}`}
                  onClick={() => handleSwitchChange('notifications', 'complianceReports', !notifications.complianceReports)}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications.complianceReports ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="block text-base font-medium">System Updates</label>
                  <p className="text-sm text-gray-500">Platform updates and maintenance</p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${notifications.systemUpdates ? 'bg-blue-600' : 'bg-gray-300'}`}
                  onClick={() => handleSwitchChange('notifications', 'systemUpdates', !notifications.systemUpdates)}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications.systemUpdates ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Lock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Security Configuration</h2>
                <p className="text-gray-600">Manage authentication and access controls</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="block text-base font-medium flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-blue-600" />
                  Two-Factor Authentication
                </label>
                <p className="text-sm text-gray-500">Require 2FA for all users</p>
              </div>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${security.twoFactor ? 'bg-blue-600' : 'bg-gray-300'}`}
                onClick={() => handleSwitchChange('security', 'twoFactor', !security.twoFactor)}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${security.twoFactor ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="block text-base font-medium">IP Whitelist</label>
                <p className="text-sm text-gray-500">Restrict access to approved IPs</p>
              </div>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${security.ipWhitelist ? 'bg-blue-600' : 'bg-gray-300'}`}
                onClick={() => handleSwitchChange('security', 'ipWhitelist', !security.ipWhitelist)}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${security.ipWhitelist ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="space-y-2">
              <label htmlFor="session-timeout" className="block font-medium">Session Timeout (minutes)</label>
              <input
                id="session-timeout"
                type="number"
                value={security.sessionTimeout}
                onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
                className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">
                Auto-logout after inactivity period
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="password-expiry" className="block font-medium">Password Expiry (days)</label>
              <input
                id="password-expiry"
                type="number"
                value={security.passwordExpiry}
                onChange={(e) => handleInputChange('passwordExpiry', e.target.value)}
                className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">
                Force password change after specified days
              </p>
            </div>
          </div>
        </div>

        {/* Email Configuration */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Email Configuration</h2>
                <p className="text-gray-600">SMTP settings for system emails</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="smtp-host" className="block font-medium">SMTP Host</label>
              <input
                id="smtp-host"
                type="text"
                placeholder="smtp.hammertech.rw"
                defaultValue="smtp.hammertech.rw"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="smtp-port" className="block font-medium">SMTP Port</label>
              <input
                id="smtp-port"
                type="number"
                placeholder="587"
                defaultValue="587"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="sender-email" className="block font-medium">Sender Email</label>
              <input
                id="sender-email"
                type="email"
                placeholder="noreply@hammertech.rw"
                defaultValue="noreply@hammertech.rw"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
              Test Email Connection
            </button>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Regional Settings</h2>
                <p className="text-gray-600">Timezone and localization preferences</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="timezone" className="block font-medium">Timezone</label>
              <select 
                id="timezone"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                defaultValue="Africa/Kigali"
              >
                <option value="Africa/Kigali">Africa/Kigali (CAT)</option>
                <option value="UTC">UTC</option>
                <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="language" className="block font-medium">Language</label>
              <select 
                id="language"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                defaultValue="en"
              >
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="rw">Kinyarwanda</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="date-format" className="block font-medium">Date Format</label>
              <select 
                id="date-format"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                defaultValue="dd/mm/yyyy"
              >
                <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                <option value="yyyy-mm-dd">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-4">
        {saved && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Settings saved successfully</span>
          </div>
        )}
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center font-medium transition-colors"
          onClick={handleSave}
        >
          <Save className="h-5 w-5 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );
}