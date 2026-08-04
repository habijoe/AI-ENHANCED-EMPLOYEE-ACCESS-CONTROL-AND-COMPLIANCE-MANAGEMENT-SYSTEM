import { Brain, Activity, AlertTriangle, TrendingUp, Eye, Shield, Zap, AlertCircle } from "lucide-react";
import React, { useState } from "react";

// Mock data since imports aren't available
const mockAccessLogs = [
  { id: 1, user: "admin@company.com", action: "Login", resource: "Admin Portal", location: "Kigali, RW", timestamp: "2025-12-29 09:15", status: "success" },
  { id: 2, user: "user123@company.com", action: "Data Export", resource: "Financial Reports", location: "Nairobi, KE", timestamp: "2025-12-29 08:45", status: "flagged" },
  { id: 3, user: "contractor@company.com", action: "File Access", resource: "Project Docs", location: "Remote", timestamp: "2025-12-29 02:30", status: "suspicious" },
  { id: 4, user: "manager@company.com", action: "Permission Grant", resource: "User Management", location: "Kigali, RW", timestamp: "2025-12-28 16:20", status: "success" },
  { id: 5, user: "user456@company.com", action: "API Access", resource: "Customer Data", location: "Unknown", timestamp: "2025-12-28 23:10", status: "suspicious" }
];

const mockAlerts = [
  { id: 1, title: "Unusual Login Time", user: "admin@company.com", severity: "high", timestamp: "2 hours ago" },
  { id: 2, title: "Multiple Failed Attempts", user: "user123@company.com", severity: "critical", timestamp: "4 hours ago" },
  { id: 3, title: "Geographic Anomaly", user: "manager@company.com", severity: "medium", timestamp: "6 hours ago" },
  { id: 4, title: "Data Exfiltration Pattern", user: "contractor@company.com", severity: "critical", timestamp: "1 day ago" },
  { id: 5, title: "Privilege Escalation Attempt", user: "user456@company.com", severity: "high", timestamp: "1 day ago" }
];

export function AIMonitoring() {
  const [anomalyData] = useState([
    { time: "00:00", normal: 120, anomaly: 5 },
    { time: "04:00", normal: 45, anomaly: 2 },
    { time: "08:00", normal: 340, anomaly: 12 },
    { time: "12:00", normal: 420, anomaly: 8 },
    { time: "16:00", normal: 380, anomaly: 15 },
    { time: "20:00", normal: 180, anomaly: 6 }
  ]);

  const [mlModels] = useState([
    { name: "Anomaly Detection", status: "active", accuracy: 94.5, lastTrained: "2025-12-28" },
    { name: "Behavioral Analysis", status: "active", accuracy: 91.2, lastTrained: "2025-12-27" },
    { name: "Risk Prediction", status: "active", accuracy: 88.7, lastTrained: "2025-12-26" },
    { name: "Pattern Recognition", status: "training", accuracy: 89.3, lastTrained: "2025-12-25" }
  ]);

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'bg-red-100 text-red-600';
      case 'high': return 'bg-blue-100 text-blue-600';
      default: return 'bg-yellow-100 text-yellow-600';
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">Active</div>;
      case 'training':
        return <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">Training</div>;
      case 'success':
        return <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">Success</div>;
      case 'flagged':
        return <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">Flagged</div>;
      default:
        return <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">Suspicious</div>;
    }
  };

  const getBadge = (text) => {
    return <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">{text}</div>;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AI Behavior Monitoring</h1>
            <p className="text-gray-600">Machine learning-powered threat detection and behavioral analysis</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center font-medium transition-colors">
            <Brain className="h-4 w-4 mr-2" />
            Train Model
          </button>
        </div>
        
        {/* Requirements Description */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-blue-800">Module Requirements:</p>
              <p className="text-gray-700">
                <strong>AI-Powered Behavioral Monitoring:</strong> Advanced machine learning system utilizing 
                anomaly detection algorithms, behavioral analysis models, and predictive analytics to identify 
                unusual access patterns and potential security threats. Implements user behavior analytics (UBA), 
                real-time anomaly scoring, pattern recognition across multiple data sources, and automated threat 
                classification. Features continuous model training, accuracy metrics tracking, false positive 
                reduction, and integration with SIEM systems for comprehensive threat intelligence.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">AI Models Active</p>
              <h3 className="text-2xl font-bold">4</h3>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-red-100 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Anomalies Detected</p>
              <h3 className="text-2xl font-bold">23</h3>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Accuracy</p>
              <h3 className="text-2xl font-bold">92.8%</h3>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Events Analyzed</p>
              <h3 className="text-2xl font-bold">847K</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Anomaly Detection Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold">Real-Time Anomaly Detection</h2>
          <p className="text-gray-600">AI-powered behavioral pattern analysis over 24 hours</p>
        </div>
        <div className="h-80">
          {/* Placeholder for chart - you would integrate a chart library like recharts or chart.js here */}
          <div className="w-full h-full flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50">
            <div className="text-center">
              <p className="text-gray-500 mb-2">Chart visualization would appear here</p>
              <p className="text-sm text-gray-400">Using: {JSON.stringify(anomalyData)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ML Models Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Machine Learning Models</h2>
            <p className="text-gray-600">Status and performance of AI detection models</p>
          </div>
          <div className="space-y-4">
            {mlModels.map((model, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium">{model.name}</h4>
                  </div>
                  {model.status === "active" ? (
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">Active</div>
                  ) : (
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">Training</div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Accuracy</span>
                    <span className="font-medium">{model.accuracy}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${model.accuracy}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Last trained: {model.lastTrained}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flagged Activities */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Flagged Activities</h2>
            <p className="text-gray-600">Recent suspicious behaviors detected by AI</p>
          </div>
          <div className="space-y-3">
            {mockAlerts.slice(0, 4).map((alert) => (
              <div key={alert.id} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                    <Eye className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium">{alert.title}</h4>
                      <div className="border border-gray-300 text-gray-700 px-2 py-1 rounded-full text-xs">
                        {alert.severity}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{alert.user}</p>
                    <p className="text-xs text-gray-500">{alert.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Access Logs */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">AI-Analyzed Access Logs</h2>
          <p className="text-gray-600">Recent activity with AI risk assessment</p>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Resource</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Location</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Timestamp</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">AI Status</th>
                </tr>
              </thead>
              <tbody>
                {mockAccessLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{log.user}</td>
                    <td className="py-3 px-4">{log.action}</td>
                    <td className="py-3 px-4">{log.resource}</td>
                    <td className="py-3 px-4">{log.location}</td>
                    <td className="py-3 px-4">{log.timestamp}</td>
                    <td className="py-3 px-4">
                      {getStatusBadge(log.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Threat Intelligence */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold">AI Threat Intelligence</h2>
          <p className="text-gray-600">Proactive threat identification and recommendations</p>
        </div>
        <div className="space-y-4">
          {[
            {
              threat: "Potential Credential Stuffing Attack",
              confidence: 87,
              recommendation: "Enable rate limiting on authentication endpoints"
            },
            {
              threat: "Unusual Data Access Pattern",
              confidence: 76,
              recommendation: "Review data access policies for Finance department"
            },
            {
              threat: "Multiple Failed MFA Attempts",
              confidence: 92,
              recommendation: "Investigate user account: p.habimana@hammertech.rw"
            }
          ].map((item, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{item.threat}</h4>
                    {getBadge(`Confidence: ${item.confidence}%`)}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{item.recommendation}</p>
                  <button className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors">
                    Take Action
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}