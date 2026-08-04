import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Shield,
  Target,
  Activity,
  AlertCircle,
  Users,
  Building,
  CheckCircle,
  BarChart,
  RefreshCw,
  Loader2,
  Clock,
  FileText,
  AlertOctagon,
  ChevronRight,
  Eye,
  UserCheck,
  UserX
} from "lucide-react";

const BASE_URL = 'http://127.0.0.1:8000';

export function RiskAssessment() {
  const [loading, setLoading] = useState({
    dashboard: true,
    departments: false,
    users: false,
    metrics: false,
    vulnerabilities: false
  });
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [riskData, setRiskData] = useState({
    overallRiskScore: null,
    riskLevel: null,
    departmentsAtRisk: null,
    highRiskUsers: null,
    criticalIncidents: null,
    mttrHours: null,
    complianceRate: null,
    departmentAssessments: [],
    userRiskProfiles: [],
    securityMetrics: null,
    riskTrends: [],
    vulnerabilityAssessments: [],
    recommendations: []
  });

  const fetchRiskData = async () => {
    try {
      setLoading({ 
        dashboard: true, 
        departments: true, 
        users: true, 
        metrics: true,
        vulnerabilities: true 
      });
      setError(null);

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication required. Please login.');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const dashboardResponse = await axios.get(
        `${BASE_URL}/risk-assessment/dashboard-data/`,
        { headers, params: { timeframe: 90 } }
      );

      console.log('Dashboard data response:', dashboardResponse.data);

      if (dashboardResponse.data.success) {
        const dashboard = dashboardResponse.data.dashboard_data;
        
        // Transform department assessments
        const departmentAssessments = (dashboard.department_risks || []).map(dept => ({
          department_name: dept.department,
          overall_risk_score: dept.risk,
          incident_count: dept.incident_count || 0,
          user_count: dept.user_count || 0,
          risk_level: dept.risk_level || getRiskLevel(dept.risk)
        }));
        
        // Filter out weeks with zero incidents for trends
        const riskTrends = (dashboard.risk_trends || [])
          .filter(trend => trend.incident_count > 0 || trend.risk > 0)
          .map(trend => ({
            period: trend.week,
            risk_score: trend.risk,
            incident_count: trend.incident_count || 0,
            user_count: trend.user_count || 0
          }));
        
        // Transform vulnerability assessments with correct severity labels
        const vulnerabilityAssessments = (dashboard.risk_categories || []).map(cat => {
          const score = cat.score || 0;
          let severityLevel = 'low';
          let severityText = 'Good';
          
          if (score < 40) {
            severityLevel = 'critical';
            severityText = 'Critical';
          } else if (score < 60) {
            severityLevel = 'high';
            severityText = 'High Risk';
          } else if (score < 80) {
            severityLevel = 'medium';
            severityText = 'Needs Improvement';
          } else {
            severityLevel = 'low';
            severityText = 'Good';
          }
          
          return {
            category: cat.category,
            score: score,
            max_score: cat.maxScore,
            severity: severityLevel,
            severity_text: severityText,
            description: cat.description || `${cat.category} security assessment`,
            recommendations: cat.recommendations || [`Review and improve ${cat.category.toLowerCase()} security measures`]
          };
        });
        
        // Generate better recommendations based on actual data
        let recommendations = [];
        
        // Department-based recommendations
        const highRiskDepts = departmentAssessments.filter(d => d.overall_risk_score >= 60);
        if (highRiskDepts.length > 0) {
          recommendations.push(`⚠️ High Risk Department: ${highRiskDepts.map(d => d.department_name).join(', ')} requires immediate security review`);
        }
        
        // Vulnerability-based recommendations
        const criticalVulns = vulnerabilityAssessments.filter(v => v.severity === 'critical');
        if (criticalVulns.length > 0) {
          recommendations.push(`🔴 Critical Vulnerabilities: Address ${criticalVulns.map(v => v.category).join(', ')} security gaps`);
        }
        
        // Incident response recommendation
        const incidentResponse = vulnerabilityAssessments.find(v => v.category === 'Incident Response');
        if (incidentResponse && incidentResponse.score < 50) {
          recommendations.push(`📋 Incident Response: Develop and implement incident response playbook (Current score: ${incidentResponse.score.toFixed(1)}/100)`);
        }
        
        // General recommendations
        if (recommendations.length === 0) {
          recommendations.push("✅ Maintain current security posture");
          recommendations.push("📊 Continue regular monitoring and assessments");
          recommendations.push("🔄 Schedule next quarterly risk assessment");
        }
        
        setRiskData({
          overallRiskScore: dashboard.overall_risk_score || 0,
          riskLevel: dashboard.overall_risk_level || 'low',
          departmentsAtRisk: dashboard.security_metrics?.departments_at_risk || 0,
          highRiskUsers: dashboard.security_metrics?.high_risk_users || 0,
          criticalIncidents: dashboard.security_metrics?.critical_incidents || 0,
          mttrHours: dashboard.security_metrics?.mttr_hours || 0,
          complianceRate: dashboard.security_metrics?.compliance_rate || 100,
          departmentAssessments: departmentAssessments,
          userRiskProfiles: dashboard.high_risk_users || [],
          securityMetrics: dashboard.security_metrics,
          riskTrends: riskTrends,
          vulnerabilityAssessments: vulnerabilityAssessments,
          recommendations: recommendations.slice(0, 6)
        });
      }

    } catch (err) {
      console.error('Error fetching risk data:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load risk assessment data');
    } finally {
      setLoading({ 
        dashboard: false, 
        departments: false, 
        users: false, 
        metrics: false,
        vulnerabilities: false 
      });
    }
  };

  const runAssessment = async () => {
    try {
      setLoading(prev => ({ ...prev, dashboard: true }));
      setError(null);

      const token = localStorage.getItem('access_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await axios.post(
        `${BASE_URL}/risk-assessment/run-assessment/`,
        {
          timeframe_days: 90,
          include_departments: true,
          include_users: true,
          generate_report: true
        },
        { headers }
      );

      if (response.data.success) {
        console.log('Assessment completed:', response.data);
        toast.success(`Assessment completed! Overall Risk Score: ${response.data.results.overall_risk_score}`);
        await fetchRiskData();
      }

    } catch (err) {
      console.error('Error running assessment:', err);
      setError(err.response?.data?.error || err.message || 'Failed to run assessment');
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false }));
    }
  };

  useEffect(() => {
    fetchRiskData();
  }, []);

  const getRiskLevel = (score) => {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    if (score >= 20) return 'Low';
    return 'Very Low';
  };

  const getRiskLevelColor = (score) => {
    if (score >= 80) return { bg: 'bg-red-100', text: 'text-red-800', icon: 'text-red-600', border: 'border-red-200' };
    if (score >= 60) return { bg: 'bg-orange-100', text: 'text-orange-800', icon: 'text-orange-600', border: 'border-orange-200' };
    if (score >= 40) return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'text-yellow-600', border: 'border-yellow-200' };
    return { bg: 'bg-green-100', text: 'text-green-800', icon: 'text-green-600', border: 'border-green-200' };
  };

  const getVulnerabilityBadge = (severity) => {
    switch(severity) {
      case 'critical':
        return <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium">Critical</span>;
      case 'high':
        return <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs font-medium">High Risk</span>;
      case 'medium':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium">Needs Work</span>;
      default:
        return <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">Good</span>;
    }
  };

  const getSeverityBadge = (score) => {
    const colors = getRiskLevelColor(score);
    return (
      <div className={`${colors.bg} ${colors.text} px-3 py-1 rounded-full text-xs font-medium`}>
        {getRiskLevel(score)}
      </div>
    );
  };

  const getTrendIcon = (trend) => {
    if (trend === 'increasing') {
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    } else if (trend === 'decreasing') {
      return <TrendingDown className="h-4 w-4 text-green-500" />;
    } else {
      return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getUserAvatar = (fullName) => {
    if (!fullName) return '?';
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  if (loading.dashboard && riskData.overallRiskScore === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading risk assessment data...</p>
          <p className="text-sm text-gray-400 mt-1">Analyzing security posture</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="font-medium text-red-800">Error Loading Risk Assessment</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              <button
                onClick={fetchRiskData}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Risk Assessment & Management</h1>
            <p className="text-gray-600 mt-1">Comprehensive security risk analysis and mitigation</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchRiskData}
              disabled={loading.dashboard}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-50 bg-white"
            >
              <RefreshCw className={`h-4 w-4 ${loading.dashboard ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={runAssessment}
              disabled={loading.dashboard}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-50"
            >
              <Target className="h-4 w-4" />
              Run Full Assessment
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Risk Score</p>
              <p className="text-2xl font-bold text-gray-900">{riskData.overallRiskScore?.toFixed(1) || 'N/A'}</p>
            </div>
            <div className={`p-3 rounded-lg ${getRiskLevelColor(riskData.overallRiskScore || 0).bg}`}>
              <Shield className={`h-5 w-5 ${getRiskLevelColor(riskData.overallRiskScore || 0).icon}`} />
            </div>
          </div>
          <p className={`text-xs font-medium mt-2 ${getRiskLevelColor(riskData.overallRiskScore || 0).text}`}>
            {getRiskLevel(riskData.overallRiskScore || 0)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Departments at Risk</p>
              <p className="text-2xl font-bold text-gray-900">{riskData.departmentsAtRisk || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-100">
              <Building className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">of {riskData.departmentAssessments.length} total</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Critical Incidents</p>
              <p className="text-2xl font-bold text-gray-900">{riskData.criticalIncidents || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Requiring immediate action</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">High Risk Users</p>
              <p className="text-2xl font-bold text-gray-900">{riskData.highRiskUsers || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <UserX className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Need security review</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">MTTR</p>
              <p className="text-2xl font-bold text-gray-900">{riskData.mttrHours?.toFixed(1) || '0'}h</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Mean time to resolution</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Compliance</p>
              <p className="text-2xl font-bold text-gray-900">{riskData.complianceRate?.toFixed(1) || '100'}%</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">SLA compliance rate</p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Risk Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Department Risk Distribution</h2>
                <p className="text-sm text-gray-500">Risk scores by organizational unit</p>
              </div>
              <Building className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="p-5">
            {loading.departments ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-100 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : riskData.departmentAssessments.length > 0 ? (
              <div className="space-y-4">
                {riskData.departmentAssessments.map((dept, index) => {
                  const riskScore = dept.overall_risk_score || 0;
                  const colors = getRiskLevelColor(riskScore);
                  return (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg border ${colors.border} hover:shadow-md transition-all cursor-pointer`}
                      onClick={() => setSelectedDepartment(dept)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{dept.department_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${colors.text}`}>{riskScore.toFixed(1)}</span>
                          <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                            {dept.risk_level?.toUpperCase() || getRiskLevel(riskScore).toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${riskScore}%`,
                            backgroundColor: riskScore >= 60 ? '#EA580C' : riskScore >= 40 ? '#EAB308' : '#22C55E'
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>📋 {dept.incident_count} incidents</span>
                        <span>👥 {dept.user_count} users</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No department data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Risk Category Analysis */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Risk Category Analysis</h2>
                <p className="text-sm text-gray-500">Security posture across key dimensions</p>
              </div>
              <BarChart className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="p-5">
            {loading.vulnerabilities ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-100 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : riskData.vulnerabilityAssessments.length > 0 ? (
              <div className="space-y-4">
                {riskData.vulnerabilityAssessments.map((category, index) => {
                  const score = category.score || 0;
                  const percentage = (score / category.max_score) * 100;
                  let barColor = 'bg-green-500';
                  if (score < 40) barColor = 'bg-red-500';
                  else if (score < 60) barColor = 'bg-orange-500';
                  else if (score < 80) barColor = 'bg-yellow-500';
                  
                  return (
                    <div key={index} className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{category.category}</span>
                        {getVulnerabilityBadge(category.severity)}
                      </div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500">Security Score</span>
                        <span className="font-medium">{score.toFixed(1)}/{category.max_score}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      {category.recommendations && category.recommendations.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2 truncate">
                          💡 {category.recommendations[0]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No category data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Risk Trend Analysis - Full Width */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Risk Trend Analysis</h2>
              <p className="text-sm text-gray-500">Weekly risk score progression (showing periods with activity)</p>
            </div>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        <div className="p-5">
          {loading.metrics ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : riskData.riskTrends.length > 0 ? (
            <div className="space-y-4">
              {riskData.riskTrends.map((trend, index) => {
                const riskScore = trend.risk_score || 0;
                const colors = getRiskLevelColor(riskScore);
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">{trend.period}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">{trend.incident_count} incidents</span>
                        <span className={`font-bold ${colors.text}`}>{riskScore.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          riskScore >= 60 ? 'bg-orange-500' : riskScore >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${riskScore}%` }}
                      />
                    </div>
                    {trend.user_count > 0 && (
                      <p className="text-xs text-gray-400">👥 {trend.user_count} users involved</p>
                    )}
                  </div>
                );
              })}
              {riskData.riskTrends.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No incident activity in selected period</p>
                  <p className="text-sm text-gray-400 mt-1">Run a new assessment to generate trends</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No trend data available</p>
              <p className="text-sm text-gray-400 mt-1">Run an assessment to generate trend data</p>
            </div>
          )}
        </div>
      </div>

      {/* High Risk Users and Vulnerabilities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Risk Users */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">High-Risk Users</h2>
                <p className="text-sm text-gray-500">Users requiring security attention</p>
              </div>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="p-5">
            {loading.users ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-100 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : riskData.userRiskProfiles.length > 0 ? (
              <div className="space-y-3">
                {riskData.userRiskProfiles.map((user, index) => {
                  const riskScore = user.riskScore || 0;
                  const colors = getRiskLevelColor(riskScore);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colors.bg}`}>
                          <span className={`text-sm font-medium ${colors.text}`}>
                            {getUserAvatar(user.name)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.department || 'No department'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                          Risk: {riskScore.toFixed(1)}
                        </div>
                        {user.incident_count > 0 && (
                          <p className="text-xs text-gray-400 mt-1">{user.incident_count} incidents</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserCheck className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-500">No high-risk users identified</p>
                <p className="text-sm text-gray-400 mt-1">All users are within acceptable risk limits</p>
              </div>
            )}
          </div>
        </div>

        {/* Critical Vulnerabilities */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Critical Vulnerabilities</h2>
                <p className="text-sm text-gray-500">Security weaknesses needing immediate attention</p>
              </div>
              <AlertOctagon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="p-5">
            {riskData.vulnerabilityAssessments.filter(v => v.severity === 'critical' || v.severity === 'high').length > 0 ? (
              <div className="space-y-3">
                {riskData.vulnerabilityAssessments
                  .filter(v => v.severity === 'critical' || v.severity === 'high')
                  .map((vuln, index) => (
                    <div key={index} className="p-3 rounded-lg border border-red-100 bg-red-50">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-red-800">{vuln.category}</h4>
                            {getVulnerabilityBadge(vuln.severity)}
                          </div>
                          <p className="text-sm text-red-700 mb-2">{vuln.description}</p>
                          <p className="text-xs text-red-600">
                            <strong>Action Required:</strong> {vuln.recommendations?.[0] || 'Review and remediate'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-500">No critical vulnerabilities detected</p>
                <p className="text-sm text-gray-400 mt-1">Security posture looks good</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      {riskData.recommendations && riskData.recommendations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Action Recommendations</h2>
                <p className="text-sm text-gray-500">Prioritized actions based on assessment</p>
              </div>
              <Target className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {riskData.recommendations.map((recommendation, index) => {
                let bgColor = 'bg-blue-50';
                let borderColor = 'border-blue-200';
                let iconColor = 'text-blue-600';
                let Icon = Shield;
                
                if (recommendation.includes('🔴') || recommendation.includes('Critical')) {
                  bgColor = 'bg-red-50';
                  borderColor = 'border-red-200';
                  iconColor = 'text-red-600';
                  Icon = AlertTriangle;
                } else if (recommendation.includes('⚠️') || recommendation.includes('High Risk')) {
                  bgColor = 'bg-orange-50';
                  borderColor = 'border-orange-200';
                  iconColor = 'text-orange-600';
                  Icon = AlertCircle;
                } else if (recommendation.includes('📋')) {
                  bgColor = 'bg-yellow-50';
                  borderColor = 'border-yellow-200';
                  iconColor = 'text-yellow-600';
                  Icon = FileText;
                }
                
                return (
                  <div key={index} className={`p-3 rounded-lg border ${borderColor} ${bgColor} flex items-start gap-2`}>
                    <Icon className={`h-4 w-4 ${iconColor} mt-0.5 flex-shrink-0`} />
                    <p className="text-sm text-gray-700">{recommendation}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 pt-4">
        <p>Data based on 90-day assessment period | Last updated: {new Date().toLocaleString()}</p>
        <p className="mt-1">
          {riskData.departmentAssessments.length} departments • 
          {riskData.vulnerabilityAssessments.length} risk categories • 
          {riskData.userRiskProfiles.length} users analyzed
        </p>
      </div>
    </div>
  );
}