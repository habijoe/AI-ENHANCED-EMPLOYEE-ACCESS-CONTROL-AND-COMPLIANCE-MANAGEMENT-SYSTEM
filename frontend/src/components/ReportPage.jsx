import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users, FileText, FileSpreadsheet, FileBarChart,
  Download, RefreshCw, Filter, Calendar, Search,
  ChevronDown, ChevronUp, Eye, Printer, CheckCircle,
  AlertCircle, Loader2, Database, BarChart3, PieChart,
  TrendingUp, Clock, Target, AlertOctagon, Shield,
  UserCheck, Activity, DollarSign, Layers,
  ArrowUpRight, ArrowDownRight, Percent, Trash2,
  Edit, ExternalLink, MoreVertical, X, Plus,
  Grid, List, Settings, ChevronRight, FileDown,
  DownloadCloud, Upload, CheckSquare, ClipboardList,
  CalendarCheck, UserCog, Bell, Building, Award,
  Briefcase, GraduationCap, BookOpen, MessageCircle,
  Sliders, Sparkles, FilterX, Columns, EyeOff
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, LineChart, Line
} from 'recharts';

import Logo from "../../public/hammerlogo.webp";

// Client-side export libraries
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// API Service for fetching report data only
const apiService = {
  baseURL: 'http://127.0.0.1:8000',
  
  async getAvailableReportTypes() {
    const accessToken = localStorage.getItem('access_token');
    
    const response = await fetch(`${this.baseURL}/reports/reports/types/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`API Error ${response.status}: ${errorData.message || response.statusText}`);
    }
    
    return await response.json();
  },

  async generateReport(reportType, filters) {
    const accessToken = localStorage.getItem('access_token');
    
    const requestData = {
      report_type: reportType,
      format: 'json',
      ...filters
    };
    
    const response = await fetch(`${this.baseURL}/reports/reports/generate/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`API Error ${response.status}: ${errorData.message || response.statusText}`);
    }
    
    return await response.json();
  },

  async getDepartments(statusFilter = null) {
    const accessToken = localStorage.getItem('access_token');
    
    let url = `${this.baseURL}/departments/all/`;
    if (statusFilter) {
      url += `?status=${statusFilter}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`API Error ${response.status}: ${errorData.message || response.statusText}`);
    }
    
    return await response.json();
  },

  async getMyDepartments(statusFilter = null) {
    const accessToken = localStorage.getItem('access_token');
    
    let url = `${this.baseURL}/departments/my-departments/`;
    if (statusFilter) {
      url += `?status=${statusFilter}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`API Error ${response.status}: ${errorData.message || response.statusText}`);
    }
    
    return await response.json();
  }
};

// Client-side Data Filtering and Processing Service
const dataProcessingService = {
  applyFilters(data, filters, reportType) {
    if (!data || data.length === 0) return [];
    
    let filteredData = [...data];
    
    // Date range filter
    if (filters.start_date && filters.end_date) {
      const startDate = new Date(filters.start_date);
      const endDate = new Date(filters.end_date);
      endDate.setHours(23, 59, 59, 999);
      
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.created_at || item.date || item.timestamp);
        return itemDate >= startDate && itemDate <= endDate;
      });
    } else if (filters.start_date) {
      const startDate = new Date(filters.start_date);
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.created_at || item.date || item.timestamp);
        return itemDate >= startDate;
      });
    } else if (filters.end_date) {
      const endDate = new Date(filters.end_date);
      endDate.setHours(23, 59, 59, 999);
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.created_at || item.date || item.timestamp);
        return itemDate <= endDate;
      });
    }
    
    // Text search filter
    if (filters.search_query) {
      const searchLower = filters.search_query.toLowerCase();
      filteredData = filteredData.filter(item => {
        return Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchLower)
        );
      });
    }
    
    // Role filter
    if (filters.role) {
      filteredData = filteredData.filter(item => 
        (item.role || item.user_role || '').toLowerCase() === filters.role.toLowerCase()
      );
    }
    
    // Status filter
    if (filters.status) {
      filteredData = filteredData.filter(item => 
        (item.status || '').toLowerCase() === filters.status.toLowerCase()
      );
    }
    
    // Department filter
    if (filters.department) {
      filteredData = filteredData.filter(item => 
        (item.department_id === parseInt(filters.department)) ||
        (item.department_name === filters.department) ||
        (item.department?.id === parseInt(filters.department)) ||
        (item.department?.name === filters.department)
      );
    }
    
    // Severity filter
    if (filters.severity) {
      filteredData = filteredData.filter(item => 
        (item.severity || '').toLowerCase() === filters.severity.toLowerCase()
      );
    }
    
    // Priority filter
    if (filters.priority) {
      filteredData = filteredData.filter(item => 
        (item.priority || '').toLowerCase() === filters.priority.toLowerCase()
      );
    }
    
    // Incident status filter
    if (filters.incident_status) {
      filteredData = filteredData.filter(item => 
        (item.incident_status || item.status || '').toLowerCase() === filters.incident_status.toLowerCase()
      );
    }
    
    if (filters.custom_filters) {
      Object.entries(filters.custom_filters).forEach(([field, value]) => {
        if (value && value !== '') {
          filteredData = filteredData.filter(item => 
            String(item[field] || '').toLowerCase().includes(String(value).toLowerCase())
          );
        }
      });
    }
    
    return filteredData;
  },
  
  generateSummaryStats(filteredData, reportType) {
    const stats = {};
    stats.total_records = filteredData.length;
    
    if (filteredData.length === 0) return stats;
    
    const categoricalFields = ['status', 'severity', 'priority', 'role', 'department_name'];
    categoricalFields.forEach(field => {
      const values = filteredData.filter(item => item[field]).map(item => item[field]);
      if (values.length > 0) {
        const uniqueValues = [...new Set(values)];
        stats[`unique_${field}s`] = uniqueValues.length;
        
        if (field === 'status' || field === 'severity') {
          const distribution = {};
          values.forEach(v => {
            distribution[v] = (distribution[v] || 0) + 1;
          });
          stats[`${field}_distribution`] = distribution;
        }
      }
    });
    
    const numericFields = ['risk_score', 'incident_count', 'failed_logins', 'success_rate'];
    numericFields.forEach(field => {
      const values = filteredData.filter(item => typeof item[field] === 'number').map(item => item[field]);
      if (values.length > 0) {
        stats[`avg_${field}`] = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
        stats[`max_${field}`] = Math.max(...values);
        stats[`min_${field}`] = Math.min(...values);
      }
    });
    
    const dateFields = ['created_at', 'date', 'timestamp'];
    let allDates = [];
    dateFields.forEach(dateField => {
      const dates = filteredData.filter(item => item[dateField]).map(item => new Date(item[dateField]));
      allDates = [...allDates, ...dates];
    });
    
    if (allDates.length > 0) {
      stats.date_range = {
        earliest: new Date(Math.min(...allDates)).toISOString().split('T')[0],
        latest: new Date(Math.max(...allDates)).toISOString().split('T')[0]
      };
    }
    
    return stats;
  },
  
  generateKeyMetrics(filteredData, summaryStats, reportType) {
    const metrics = [];
    metrics.push(`Total Records: ${summaryStats.total_records || 0}`);
    
    if (summaryStats.avg_risk_score) {
      metrics.push(`Average Risk Score: ${summaryStats.avg_risk_score}/100`);
    }
    
    if (summaryStats.status_distribution) {
      const topStatus = Object.entries(summaryStats.status_distribution)
        .sort((a, b) => b[1] - a[1])[0];
      if (topStatus) {
        metrics.push(`Most Common Status: ${topStatus[0]} (${topStatus[1]} records)`);
      }
    }
    
    if (summaryStats.severity_distribution) {
      const criticalCount = summaryStats.severity_distribution.critical || 0;
      metrics.push(`Critical Issues: ${criticalCount}`);
    }
    
    if (summaryStats.date_range) {
      metrics.push(`Date Range: ${summaryStats.date_range.earliest} to ${summaryStats.date_range.latest}`);
    }
    
    if (reportType === 'incident') {
      const resolvedCount = filteredData.filter(d => 
        d.status === 'resolved' || d.status === 'closed'
      ).length;
      const resolutionRate = summaryStats.total_records > 0 
        ? ((resolvedCount / summaryStats.total_records) * 100).toFixed(1)
        : 0;
      metrics.push(`Resolution Rate: ${resolutionRate}%`);
      
      const avgResolution = filteredData
        .filter(d => d.resolution_time)
        .reduce((sum, d) => sum + (parseFloat(d.resolution_time) || 0), 0);
      if (avgResolution > 0) {
        metrics.push(`Average Resolution Time: ${(avgResolution / filteredData.length).toFixed(1)} hours`);
      }
    }
    
    if (reportType === 'user_activity') {
      const activeUsers = new Set(filteredData.map(d => d.user_email || d.email)).size;
      metrics.push(`Active Users: ${activeUsers}`);
      const totalActions = filteredData.length;
      metrics.push(`Total User Actions: ${totalActions}`);
    }
    
    if (reportType === 'compliance') {
      const violations = filteredData.filter(d => 
        d.severity === 'critical' || d.severity === 'high'
      ).length;
      metrics.push(`Critical Violations: ${violations}`);
      
      const compliant = filteredData.filter(d => d.compliant === true).length;
      const complianceRate = summaryStats.total_records > 0 
        ? ((compliant / summaryStats.total_records) * 100).toFixed(1)
        : 0;
      metrics.push(`Compliance Rate: ${complianceRate}%`);
    }
    
    return metrics;
  },
  
  sortData(data, sortField, sortDirection = 'asc') {
    if (!sortField) return data;
    
    return [...data].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (aVal === undefined || aVal === null) aVal = '';
      if (bVal === undefined || bVal === null) bVal = '';
      
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  },
  
  paginateData(data, page, pageSize = 10) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  },
  
  getUniqueValues(data, field) {
    const values = new Set();
    data.forEach(item => {
      const value = item[field];
      if (value !== undefined && value !== null && value !== '') {
        values.add(String(value));
      }
    });
    return Array.from(values).sort();
  },
  
  detectAvailableFields(data) {
    if (!data || data.length === 0) return [];
    
    const allFields = new Set();
    data.forEach(item => {
      Object.keys(item).forEach(key => allFields.add(key));
    });
    
    return Array.from(allFields);
  },
  
  filterDataByColumns(data, selectedColumns) {
    if (!data || data.length === 0) return [];
    if (!selectedColumns || selectedColumns.length === 0) return data;
    
    return data.map(row => {
      const filteredRow = {};
      selectedColumns.forEach(col => {
        if (row.hasOwnProperty(col)) {
          filteredRow[col] = row[col];
        }
      });
      return filteredRow;
    });
  }
};

// Export Service (Client-side) - Updated to respect selected columns
const exportService = {
  async generatePDF(reportData, config = {}, selectedColumns) {
    const { summary, data, filtered_data, applied_filters } = reportData;
    
    const doc = new jsPDF();
    const { default: autoTable } = await import('jspdf-autotable');
    
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // ============================================================
    // 📄 LOAD AND ADD LOGO TO PDF
    // ============================================================
    // Load the logo image as base64
    let logoBase64 = null;
    try {
      // Import the logo - we need to fetch it as a base64 string
      const response = await fetch(Logo);
      const blob = await response.blob();
      const reader = new FileReader();
      
      logoBase64 = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn('Could not load logo for PDF:', err);
    }
    
    // Header with Logo
    if (logoBase64) {
      try {
        // Add logo on the left side
        doc.addImage(logoBase64, 'WEBP', 14, 8, 25, 25);
      } catch (err) {
        console.warn('Could not add logo to PDF:', err);
        // Fallback: draw a placeholder
        doc.setFillColor(41, 128, 185);
        doc.rect(14, 8, 25, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text('HT', 26.5, 22, { align: 'center' });
      }
    } else {
      // Fallback if logo couldn't be loaded
      doc.setFillColor(41, 128, 185);
      doc.rect(14, 8, 25, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('HT', 26.5, 22, { align: 'center' });
    }
    
    // Company name next to logo
    doc.setTextColor(41, 128, 185);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Hammer-Tech Global', 44, 18);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('AI-Enhanced Access Control & Compliance System', 44, 25);
    
    // Red banner
    doc.setFillColor(220, 50, 50);
    doc.rect(0, 33, pageWidth, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CONFIDENTIAL REPORT', pageWidth / 2, 39, { align: 'center' });
    
    let yPos = 50;
    
    // Divider line
    doc.setDrawColor(200, 200, 200);
    doc.line(14, yPos, pageWidth - 14, yPos);
    yPos += 10;
    
    // Report Title Box
    doc.setFillColor(245, 248, 250);
    doc.rect(14, yPos, pageWidth - 28, 12, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const reportTitle = summary.report_type || config.report_type || 'Report';
    doc.text(reportTitle, pageWidth / 2, yPos + 8, { align: 'center' });
    yPos += 20;
    
    // Report Information Table
    const reportInfo = [
      ['Generated on:', summary.generated_at ? new Date(summary.generated_at).toLocaleString() : new Date().toLocaleString()],
      ['Generated by:', summary.generated_by || config.generated_by || 'System Administrator'],
      ['Report Type:', summary.report_type || 'N/A'],
      ['Total Records (Original):', String(summary.total_records || 'N/A')],
      ['Records After Filtering:', String(filtered_data?.length || data?.length || 0)],
      ['Date Range:', (summary.date_range?.start_date && summary.date_range?.end_date) 
        ? `${summary.date_range.start_date} to ${summary.date_range.end_date}`
        : 'N/A'],
      ['Columns Displayed:', selectedColumns ? selectedColumns.length : (data && data[0] ? Object.keys(data[0]).length : 0)],
      ['Organization:', 'Hammer-Tech Global Rwanda'],
      ['Security Level:', 'CONFIDENTIAL']
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [['Report Information', 'Details']],
      body: reportInfo,
      theme: 'grid',
      headStyles: { 
        fillColor: [41, 128, 185], 
        textColor: 255, 
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: { 
        fontSize: 10, 
        cellPadding: 4,
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold', textColor: [50, 50, 50] },
        1: { cellWidth: 'auto' }
      },
      margin: { left: 14, right: 14 }
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
    
    // Applied Filters
    if (applied_filters && Object.keys(applied_filters).length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Applied Filters', 14, yPos);
      yPos += 10;
      
      const filterEntries = Object.entries(applied_filters)
        .filter(function(entry) {
          const value = entry[1];
          return value && value !== '';
        })
        .map(function(entry) {
          const key = entry[0];
          const value = entry[1];
          return [key.replace(/_/g, ' '), String(value)];
        });
      
      if (filterEntries.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [['Filter', 'Value']],
          body: filterEntries,
          theme: 'grid',
          headStyles: { 
            fillColor: [52, 152, 219], 
            textColor: 255, 
            fontStyle: 'bold' 
          },
          styles: { 
            fontSize: 9, 
            cellPadding: 3 
          },
          columnStyles: {
            0: { cellWidth: 80, fontStyle: 'bold' },
            1: { cellWidth: 'auto' }
          },
          margin: { left: 14, right: 14 }
        });
        yPos = doc.lastAutoTable.finalY + 15;
      }
    }
    
    // Key Metrics
    if (summary.key_metrics && summary.key_metrics.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Key Metrics', 14, yPos);
      yPos += 10;
      
      // Create a nice metrics display in a grid-like format
      const metricsPerRow = 2;
      const metricsData = [];
      let row = [];
      
      summary.key_metrics.forEach(function(metric, index) {
        row.push(metric);
        if (row.length === metricsPerRow || index === summary.key_metrics.length - 1) {
          metricsData.push(row);
          row = [];
        }
      });
      
      // If last row has only one item, pad it
      if (metricsData.length > 0 && metricsData[metricsData.length - 1].length === 1) {
        metricsData[metricsData.length - 1].push('');
      }
      
      autoTable(doc, {
        startY: yPos,
        head: [],
        body: metricsData,
        theme: 'plain',
        styles: { 
          fontSize: 10, 
          cellPadding: 4,
          valign: 'middle'
        },
        columnStyles: {
          0: { cellWidth: pageWidth / 2 - 20, fontStyle: 'bold', textColor: [41, 128, 185] },
          1: { cellWidth: pageWidth / 2 - 20, fontStyle: 'bold', textColor: [41, 128, 185] }
        },
        margin: { left: 14, right: 14 }
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
    }
    
    // Summary Statistics
    if (summary.summary_stats && Object.keys(summary.summary_stats).length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Summary Statistics', 14, yPos);
      yPos += 10;
      
      const statsData = Object.entries(summary.summary_stats).map(function(entry) {
        const key = entry[0];
        const value = entry[1];
        if (typeof value === 'object' && value !== null) {
          return [key.replace(/_/g, ' '), JSON.stringify(value, null, 2)];
        }
        return [key.replace(/_/g, ' '), String(value)];
      });
      
      autoTable(doc, {
        startY: yPos,
        head: [['Statistic', 'Value']],
        body: statsData,
        theme: 'grid',
        headStyles: { 
          fillColor: [155, 89, 182], 
          textColor: 255, 
          fontStyle: 'bold' 
        },
        styles: { 
          fontSize: 9, 
          cellPadding: 3 
        },
        columnStyles: {
          0: { cellWidth: 80, fontStyle: 'bold' },
          1: { cellWidth: 'auto' }
        },
        margin: { left: 14, right: 14 },
        pageBreak: 'auto'
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
    }
    
    // Detailed Data with selected columns
    let displayData = (filtered_data || data || []).slice(0, 100);
    if (selectedColumns && selectedColumns.length > 0 && displayData.length > 0) {
      displayData = displayData.map(row => {
        const filteredRow = {};
        selectedColumns.forEach(col => {
          if (row.hasOwnProperty(col)) {
            filteredRow[col] = row[col];
          }
        });
        return filteredRow;
      });
    }
    
    if (displayData.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Detailed Data', 14, yPos);
      yPos += 10;
      
      const headers = Object.keys(displayData[0]);
      const tableData = displayData.map(function(item) {
        return headers.map(function(header) {
          const value = item[header];
          if (value === null || value === undefined) return 'N/A';
          if (typeof value === 'object') return JSON.stringify(value).substring(0, 50);
          return String(value).substring(0, 50);
        });
      });
      
      autoTable(doc, {
        startY: yPos,
        head: [headers],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [231, 76, 60], 
          textColor: 255, 
          fontStyle: 'bold',
          fontSize: 7
        },
        styles: { 
          fontSize: 7, 
          cellPadding: 2 
        },
        margin: { left: 10, right: 10 },
        pageBreak: 'auto',
        columnStyles: {}
      });
      
      yPos = doc.lastAutoTable.finalY + 10;
      
      const totalRecords = (filtered_data || data || []).length;
      if (totalRecords > 100) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text(`Showing 100 of ${totalRecords} records. Full data available in Excel export.`, 14, yPos);
        yPos += 10;
      }
    }
    
    // Footer on all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(200, 200, 200);
      doc.line(14, doc.internal.pageSize.height - 18, pageWidth - 14, doc.internal.pageSize.height - 18);
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150, 150, 150);
      
      // Left footer - Company info
      doc.text('Hammer-Tech Global Rwanda - Confidential Information', 14, doc.internal.pageSize.height - 10);
      
      // Right footer - Page number
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, doc.internal.pageSize.height - 10, { align: 'right' });
      
      // Center footer - Security classification
      doc.setTextColor(220, 50, 50);
      doc.setFont('helvetica', 'bold');
      doc.text('• CONFIDENTIAL •', pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    }
    
    return doc.output('blob');
  },
  
  async generateExcel(reportData, config = {}, selectedColumns) {
    const { summary, data, filtered_data, applied_filters } = reportData;
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: Report Summary
    const summaryData = [
      ['Hammer-Tech Global'],
      ['AI-Enhanced Access Control & Compliance System'],
      ['CONFIDENTIAL REPORT'],
      [],
      [summary.report_type || 'Report'],
      [],
      ['Report Information'],
      ['Generated on:', summary.generated_at ? new Date(summary.generated_at).toLocaleString() : new Date().toLocaleString()],
      ['Generated by:', summary.generated_by || config.generated_by || 'System Administrator'],
      ['Report Type:', summary.report_type || 'N/A'],
      ['Total Records (Original):', String(summary.total_records || 'N/A')],
      ['Records After Filtering:', String(filtered_data?.length || data?.length || 0)],
      ['Date Range:', (summary.date_range?.start_date && summary.date_range?.end_date) 
        ? summary.date_range.start_date + ' to ' + summary.date_range.end_date
        : 'N/A'],
      ['Columns Displayed:', selectedColumns ? selectedColumns.length : (data && data[0] ? Object.keys(data[0]).length : 0)],
      [],
      ['Applied Filters']
    ];
    
    if (applied_filters && Object.keys(applied_filters).length > 0) {
      Object.entries(applied_filters).forEach(function(entry) {
        const key = entry[0];
        const value = entry[1];
        if (value && value !== '') {
          summaryData.push([key.replace(/_/g, ' '), String(value)]);
        }
      });
    } else {
      summaryData.push(['No filters applied', '']);
    }
    
    summaryData.push([], ['Key Metrics']);
    
    if (summary.key_metrics && summary.key_metrics.length > 0) {
      summary.key_metrics.forEach(function(metric) {
        summaryData.push([metric]);
      });
    }
    
    summaryData.push([], ['Summary Statistics']);
    
    if (summary.summary_stats) {
      Object.entries(summary.summary_stats).forEach(function(entry) {
        const key = entry[0];
        const value = entry[1];
        if (typeof value === 'object' && value !== null) {
          summaryData.push([key.replace(/_/g, ' '), JSON.stringify(value)]);
        } else {
          summaryData.push([key.replace(/_/g, ' '), String(value)]);
        }
      });
    }
    
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Report Summary');
    
    // Sheet 2: Filtered Data with selected columns only
    let displayData = filtered_data || data || [];
    if (selectedColumns && selectedColumns.length > 0 && displayData.length > 0) {
      displayData = displayData.map(row => {
        const filteredRow = {};
        selectedColumns.forEach(col => {
          if (row.hasOwnProperty(col)) {
            filteredRow[col] = row[col];
          }
        });
        return filteredRow;
      });
    }
    
    if (displayData.length > 0) {
      const headers = Object.keys(displayData[0]);
      const detailedData = [headers];
      
      displayData.forEach(function(item) {
        const row = headers.map(function(header) {
          const value = item[header];
          if (value === null || value === undefined) return 'N/A';
          if (typeof value === 'object') return JSON.stringify(value);
          return value;
        });
        detailedData.push(row);
      });
      
      const ws2 = XLSX.utils.aoa_to_sheet(detailedData);
      
      const range = XLSX.utils.decode_range(ws2['!ref']);
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
        if (ws2[cellAddress]) {
          ws2[cellAddress].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "2980B9" } },
            alignment: { horizontal: 'center' }
          };
        }
      }
      
      const maxWidths = {};
      for (let R = 0; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = ws2[cellAddress];
          if (cell && cell.v) {
            const cellValue = String(cell.v);
            if (!maxWidths[C] || cellValue.length > maxWidths[C]) {
              maxWidths[C] = Math.min(cellValue.length, 50);
            }
          }
        }
      }
      
      const colWidths = [];
      for (let key in maxWidths) {
        if (maxWidths.hasOwnProperty(key)) {
          colWidths[key] = { wch: maxWidths[key] + 2 };
        }
      }
      ws2['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws2, 'Filtered Data');
    }
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  },
  
  async generateCSV(reportData, config = {}, selectedColumns) {
    const { summary, data, filtered_data, applied_filters } = reportData;
    let csvContent = '';
    
    csvContent += 'Hammer-Tech Global\n';
    csvContent += 'AI-Enhanced Access Control & Compliance System\n';
    csvContent += 'CONFIDENTIAL REPORT\n\n';
    csvContent += (summary.report_type || 'Report') + '\n\n';
    
    csvContent += 'Report Information\n';
    csvContent += 'Generated on:,' + (summary.generated_at ? new Date(summary.generated_at).toLocaleString() : new Date().toLocaleString()) + '\n';
    csvContent += 'Generated by:,' + (summary.generated_by || config.generated_by || 'System Administrator') + '\n';
    csvContent += 'Report Type:,' + (summary.report_type || 'N/A') + '\n';
    csvContent += 'Total Records (Original):,' + String(summary.total_records || 'N/A') + '\n';
    csvContent += 'Records After Filtering:,' + String(filtered_data?.length || data?.length || 0) + '\n';
    
    let dateRangeText = 'N/A';
    if (summary.date_range?.start_date && summary.date_range?.end_date) {
      dateRangeText = summary.date_range.start_date + ' to ' + summary.date_range.end_date;
    }
    csvContent += 'Date Range:,' + dateRangeText + '\n';
    csvContent += 'Columns Displayed:,' + (selectedColumns ? selectedColumns.length : (data && data[0] ? Object.keys(data[0]).length : 0)) + '\n\n';
    
    csvContent += 'Applied Filters\n';
    if (applied_filters && Object.keys(applied_filters).length > 0) {
      Object.entries(applied_filters).forEach(function(entry) {
        const key = entry[0];
        const value = entry[1];
        if (value && value !== '') {
          csvContent += key.replace(/_/g, ' ') + ',' + value + '\n';
        }
      });
    } else {
      csvContent += 'No filters applied,\n';
    }
    
    csvContent += '\nKey Metrics\n';
    if (summary.key_metrics && summary.key_metrics.length > 0) {
      summary.key_metrics.forEach(function(metric) {
        csvContent += metric + '\n';
      });
    }
    
    csvContent += '\nSummary Statistics\n';
    if (summary.summary_stats) {
      Object.entries(summary.summary_stats).forEach(function(entry) {
        const key = entry[0];
        const value = entry[1];
        if (typeof value === 'object' && value !== null) {
          const jsonStr = JSON.stringify(value).replace(/"/g, '""');
          csvContent += key.replace(/_/g, ' ') + ',"' + jsonStr + '"\n';
        } else {
          csvContent += key.replace(/_/g, ' ') + ',' + value + '\n';
        }
      });
    }
    
    // Detailed Data with selected columns
    let displayData = filtered_data || data || [];
    if (selectedColumns && selectedColumns.length > 0 && displayData.length > 0) {
      displayData = displayData.map(row => {
        const filteredRow = {};
        selectedColumns.forEach(col => {
          if (row.hasOwnProperty(col)) {
            filteredRow[col] = row[col];
          }
        });
        return filteredRow;
      });
    }
    
    if (displayData.length > 0) {
      csvContent += '\n\nDetailed Data\n';
      const headers = Object.keys(displayData[0]);
      csvContent += headers.join(',') + '\n';
      
      displayData.forEach(function(row) {
        const csvRow = headers.map(function(header) {
          let cell = row[header];
          if (cell === null || cell === undefined) cell = 'N/A';
          if (typeof cell === 'object') cell = JSON.stringify(cell);
          cell = String(cell);
          
          if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
            return '"' + cell.replace(/"/g, '""') + '"';
          }
          return cell;
        });
        csvContent += csvRow.join(',') + '\n';
      });
    }
    
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }
};

// ========== CUSTOM COMPONENTS ==========

// Loading Spinner Component
const LoadingSpinner = ({ text = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className={`${sizeClasses[size]} text-blue-600 animate-spin mb-3`} />
      <span className="text-gray-600 font-medium">{text}</span>
    </div>
  );
};

// Error Message Component
const ErrorMessage = ({ message, onRetry }) => (
  <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl p-6 text-center shadow-sm">
    <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <AlertCircle className="w-8 h-8 text-red-600" />
    </div>
    <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Process</h3>
    <p className="text-red-600 mb-5">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
      >
        <RefreshCw className="w-4 h-4 inline mr-2" />
        Try Again
      </button>
    )}
  </div>
);

// Success Message Component
const SuccessMessage = ({ message }) => (
  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
    <div className="flex items-center">
      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
      <span className="text-green-800 font-medium">{message}</span>
    </div>
  </div>
);

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, change, description }) => {
  const colorClasses = {
    blue: { bg: 'from-blue-500 to-blue-600', light: 'bg-blue-50', text: 'text-blue-600' },
    green: { bg: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50', text: 'text-emerald-600' },
    purple: { bg: 'from-violet-500 to-violet-600', light: 'bg-violet-50', text: 'text-violet-600' },
    orange: { bg: 'from-orange-500 to-orange-600', light: 'bg-orange-50', text: 'text-orange-600' },
    red: { bg: 'from-rose-500 to-rose-600', light: 'bg-rose-50', text: 'text-rose-600' }
  };
  
  const { light, text } = colorClasses[color] || colorClasses.blue;
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${light}`}>
          <Icon className={`w-6 h-6 ${text}`} />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{value}</h3>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
    </div>
  );
};

// Report Type Card Component
const ReportTypeCard = ({ title, description, icon: Icon, onSelect, isActive, isAvailable = true }) => (
  <button
    onClick={onSelect}
    disabled={!isAvailable}
    className={`relative group bg-white rounded-xl border ${isActive ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'} p-5 text-left transition-all duration-300 ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <div className="flex items-start space-x-4">
      <div className={`p-3 rounded-xl ${isActive ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-blue-100'} transition-colors`}>
        <Icon className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-600'}`} />
      </div>
      <div className="flex-1">
        <h4 className={`font-semibold ${isActive ? 'text-blue-700' : 'text-gray-900'} mb-1`}>{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <ChevronRight className={`w-5 h-5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
    </div>
  </button>
);

// Advanced Filter Panel Component
const AdvancedFilterPanel = ({ filters, onFilterChange, availableFields, data, onApplyFilters, onResetFilters }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [localFilters, setLocalFilters] = useState(filters);
  
  const getFieldOptions = (field) => {
    if (!data || data.length === 0) return [];
    const values = new Set();
    data.forEach(item => {
      const value = item[field];
      if (value !== undefined && value !== null && value !== '') {
        values.add(String(value));
      }
    });
    return Array.from(values).sort();
  };
  
  const handleLocalChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const handleApply = () => {
    onFilterChange(localFilters);
    onApplyFilters();
  };
  
  const handleReset = () => {
    const resetFilters = {};
    Object.keys(localFilters).forEach(key => {
      resetFilters[key] = '';
    });
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
    onApplyFilters();
  };
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
      <div 
        className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Sliders className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Advanced Filters</h3>
          {Object.values(filters).some(v => v && v !== '') && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
              {Object.values(filters).filter(v => v && v !== '').length} active
            </span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`} />
      </div>
      
      {isExpanded && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search
              </label>
              <input
                type="text"
                value={localFilters.search_query || ''}
                onChange={(e) => handleLocalChange('search_query', e.target.value)}
                placeholder="Search all fields..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={localFilters.start_date || ''}
                onChange={(e) => handleLocalChange('start_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                End Date
              </label>
              <input
                type="date"
                value={localFilters.end_date || ''}
                onChange={(e) => handleLocalChange('end_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {availableFields.includes('status') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={localFilters.status || ''}
                  onChange={(e) => handleLocalChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  {getFieldOptions('status').map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            )}
            
            {availableFields.includes('severity') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                <select
                  value={localFilters.severity || ''}
                  onChange={(e) => handleLocalChange('severity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Severities</option>
                  {getFieldOptions('severity').map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            )}
            
            {availableFields.includes('priority') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={localFilters.priority || ''}
                  onChange={(e) => handleLocalChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Priorities</option>
                  {getFieldOptions('priority').map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            )}
            
            {availableFields.includes('role') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={localFilters.role || ''}
                  onChange={(e) => handleLocalChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Roles</option>
                  {getFieldOptions('role').map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FilterX className="w-4 h-4" />
              Reset Filters
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Data Table Component
const DataTable = ({ data, onSort, sortField, sortDirection, title, showCount = true }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <Database className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600">No records match your current filters</p>
      </div>
    );
  }
  
  const headers = Object.keys(data[0]);
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">{title}</h4>
            {showCount && <p className="text-sm text-gray-600">{data.length} records</p>}
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                  onClick={() => onSort(header)}
                >
                  <div className="flex items-center">
                    {header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    {sortField === header && (
                      sortDirection === 'asc' 
                        ? <ChevronUp className="w-4 h-4 ml-1" />
                        : <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                {headers.map((header, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(() => {
                      const cell = row[header];
                      if (cell === null || cell === undefined) return 'N/A';
                      if (typeof cell === 'object') return JSON.stringify(cell).substring(0, 50);
                      if (typeof cell === 'string' && cell.length > 100) return cell.substring(0, 100) + '...';
                      return cell;
                    })()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, data.length)} of {data.length} entries
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'border border-gray-300'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Summary Statistics Component
const SummaryStatistics = ({ stats }) => {
  if (!stats || Object.keys(stats).length === 0) return null;
  
  const excludeFromGrid = ['status_distribution', 'severity_distribution'];
  
  const gridStats = Object.entries(stats).filter(([key]) => !excludeFromGrid.includes(key));
  const distributionStats = Object.entries(stats).filter(([key]) => excludeFromGrid.includes(key));
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {gridStats.map(([key, value], index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              {key.replace(/_/g, ' ')}
            </h5>
            <div className="text-xl font-bold text-gray-900">
              {typeof value === 'object' ? JSON.stringify(value) : value}
            </div>
          </div>
        ))}
      </div>
      
      {distributionStats.map(([key, value]) => (
        <div key={key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h5 className="text-sm font-semibold text-gray-700 mb-3">
            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h5>
          <div className="space-y-2">
            {Object.entries(value).map(([subKey, subValue]) => (
              <div key={subKey} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{subKey}</span>
                <div className="flex items-center gap-3">
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(subValue / Object.values(value).reduce((a, b) => a + b, 0)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{subValue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Column Selector Modal Component
const ColumnSelectorModal = ({ isOpen, onClose, availableColumns, selectedColumns, onSave }) => {
  const [tempSelectedColumns, setTempSelectedColumns] = useState(selectedColumns);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      setTempSelectedColumns([...selectedColumns]);
    }
  }, [isOpen, selectedColumns]);
  
  if (!isOpen) return null;
  
  const filteredColumns = availableColumns.filter(col => 
    col.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleToggleColumn = (column) => {
    if (tempSelectedColumns.includes(column)) {
      setTempSelectedColumns(tempSelectedColumns.filter(c => c !== column));
    } else {
      setTempSelectedColumns([...tempSelectedColumns, column]);
    }
  };
  
  const handleSelectAll = () => {
    setTempSelectedColumns([...availableColumns]);
  };
  
  const handleDeselectAll = () => {
    setTempSelectedColumns([]);
  };
  
  const handleSave = () => {
    onSave(tempSelectedColumns);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Columns className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Select Columns to Display</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Deselect All
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search columns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Selected {tempSelectedColumns.length} of {availableColumns.length} columns
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredColumns.map((column) => (
              <div
                key={column}
                onClick={() => handleToggleColumn(column)}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  tempSelectedColumns.includes(column)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                  tempSelectedColumns.includes(column)
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-400'
                }`}>
                  {tempSelectedColumns.includes(column) && (
                    <CheckCircle className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-sm text-gray-700 capitalize">
                  {column.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Columns
          </button>
        </div>
      </div>
    </div>
  );
};

// ========== MAIN REPORT PAGE COMPONENT ==========

export function ReportPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingReportTypes, setLoadingReportTypes] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Report State
  const [availableReportTypes, setAvailableReportTypes] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [rawReportData, setRawReportData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({});
  const [keyMetrics, setKeyMetrics] = useState([]);
  const [availableFields, setAvailableFields] = useState([]);
  
  // Column Selection State
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  
  // Filter State
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    search_query: '',
    role: '',
    status: '',
    department: '',
    severity: '',
    priority: '',
    incident_status: ''
  });
  
  // UI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [availableDepartments, setAvailableDepartments] = useState([]);
  
  // Load available report types on component mount
  useEffect(() => {
    loadAvailableReportTypes();
    loadDepartments();
  }, []);
  
  const loadAvailableReportTypes = async () => {
    try {
      setLoadingReportTypes(true);
      const data = await apiService.getAvailableReportTypes();
      setAvailableReportTypes(data.report_types || []);
      
      if (data.report_types && data.report_types.length > 0) {
        const firstAvailable = data.report_types.find(rt => rt.available);
        if (firstAvailable) setSelectedReport(firstAvailable.value);
      }
    } catch (err) {
      console.error('Failed to load report types:', err);
      setError('Failed to load available report types');
    } finally {
      setLoadingReportTypes(false);
    }
  };
  
  const loadDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const response = await apiService.getMyDepartments('active');
      
      if (response.success && response.data) {
        const departments = response.data.map(dept => ({
          value: dept.id,
          label: dept.name,
          description: dept.description
        }));
        setAvailableDepartments(departments);
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
      setAvailableDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };
  
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
  
  const handleReportTypeChange = (reportType) => {
    setSelectedReport(reportType);
    setRawReportData(null);
    setFilteredData([]);
    setError(null);
    setSuccess(null);
    setSelectedColumns([]);
    setFilters({
      start_date: '',
      end_date: '',
      search_query: '',
      role: '',
      status: '',
      department: '',
      severity: '',
      priority: '',
      incident_status: ''
    });
  };
  
  const applyFiltersToData = () => {
    if (!rawReportData || !rawReportData.data) {
      setFilteredData([]);
      setSummaryStats({});
      setKeyMetrics([]);
      return;
    }
    
    let filtered = dataProcessingService.applyFilters(
      rawReportData.data, 
      filters, 
      selectedReport
    );
    
    const sorted = dataProcessingService.sortData(filtered, sortField, sortDirection);
    
    // Apply column filtering for display
    let displayFiltered = sorted;
    if (selectedColumns && selectedColumns.length > 0) {
      displayFiltered = dataProcessingService.filterDataByColumns(sorted, selectedColumns);
    }
    
    setFilteredData(displayFiltered);
    
    const stats = dataProcessingService.generateSummaryStats(sorted, selectedReport);
    setSummaryStats(stats);
    
    const metrics = dataProcessingService.generateKeyMetrics(sorted, stats, selectedReport);
    setKeyMetrics(metrics);
    
    const fields = dataProcessingService.detectAvailableFields(sorted);
    setAvailableFields(fields);
    
    // Initialize selected columns if not set
    if (selectedColumns.length === 0 && fields.length > 0) {
      setSelectedColumns([...fields]);
    }
  };
  
  useEffect(() => {
    if (rawReportData && rawReportData.data) {
      applyFiltersToData();
    }
  }, [filters, sortField, sortDirection, selectedColumns]);
  
  const handleGenerateReport = async () => {
    if (!selectedReport) {
      setError('Please select a report type first');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('🚀 Generating report:', selectedReport);
      
      const backendFilters = {};
      if (filters.start_date) backendFilters.start_date = filters.start_date;
      if (filters.end_date) backendFilters.end_date = filters.end_date;
      
      const data = await apiService.generateReport(selectedReport, backendFilters);
      
      if (data && data.data) {
        setRawReportData(data);
        
        const fields = dataProcessingService.detectAvailableFields(data.data);
        setAvailableFields(fields);
        
        // Initialize selected columns with all fields
        if (fields.length > 0) {
          setSelectedColumns([...fields]);
        }
        
        setFilteredData(data.data);
        
        const stats = dataProcessingService.generateSummaryStats(data.data, selectedReport);
        setSummaryStats(stats);
        
        const metrics = dataProcessingService.generateKeyMetrics(data.data, stats, selectedReport);
        setKeyMetrics(metrics);
        
        setSuccess('Report generated successfully!');
        setActiveTab('summary');
        
        console.log(`✅ Report generated with ${data.data.length} records`);
      }
    } catch (err) {
      console.error('Report generation error:', err);
      setError(err.message || 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleExport = async (format) => {
    if (!rawReportData) {
      setError('Please generate a report first');
      return;
    }
    
    setIsExporting(true);
    setError(null);
    
    try {
      const config = {
        generated_by: user?.full_name || user?.names || 'System Administrator',
        report_type: selectedReport,
        organization: 'Hammer-Tech Global'
      };
      
      const reportDataForExport = {
        summary: {
          report_type: selectedReport,
          generated_at: rawReportData.summary?.generated_at || new Date().toISOString(),
          generated_by: config.generated_by,
          total_records: rawReportData.data?.length || 0,
          key_metrics: keyMetrics,
          summary_stats: summaryStats,
          date_range: {
            start_date: filters.start_date || rawReportData.summary?.date_range?.start_date || 'N/A',
            end_date: filters.end_date || rawReportData.summary?.date_range?.end_date || 'N/A'
          }
        },
        data: rawReportData.data,
        filtered_data: rawReportData.data,
        applied_filters: Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v && v !== '')
        )
      };
      
      let blob;
      let filename = `HammerTech_${selectedReport}_Report_${new Date().toISOString().split('T')[0]}`;
      
      switch (format) {
        case 'pdf':
          blob = await exportService.generatePDF(reportDataForExport, config, selectedColumns);
          filename += '.pdf';
          break;
        case 'excel':
          blob = await exportService.generateExcel(reportDataForExport, config, selectedColumns);
          filename += '.xlsx';
          break;
        case 'csv':
          blob = await exportService.generateCSV(reportDataForExport, config, selectedColumns);
          filename += '.csv';
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess(`${format.toUpperCase()} report exported successfully!`);
    } catch (err) {
      console.error('Export error:', err);
      setError(`Failed to export ${format.toUpperCase()}: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };
  
  const getReportDisplayName = () => {
    if (!selectedReport) return 'Select Report';
    const reportType = availableReportTypes.find(rt => rt.value === selectedReport);
    return reportType ? reportType.label : selectedReport.replace(/_/g, ' ');
  };
  
  const handleColumnSave = (columns) => {
    setSelectedColumns(columns);
    setSuccess(`Now displaying ${columns.length} columns`);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <FileBarChart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Advanced Reporting System</h1>
              <p className="text-sm text-gray-600">
                Generate, filter, and export comprehensive system reports
              </p>
            </div>
          </div>
          
          <div className="hidden md:block text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Generated By</p>
            <p className="text-sm font-semibold text-gray-900">{user?.full_name || user?.names || 'System Administrator'}</p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}
        {success && <SuccessMessage message={success} />}
        
        {/* Report Type Selection */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Select Report Type</h2>
            <p className="text-sm text-gray-600 mt-1">Choose the type of report you want to generate</p>
          </div>
          
          <div className="p-6">
            {loadingReportTypes ? (
              <LoadingSpinner text="Loading report types..." />
            ) : availableReportTypes.length === 0 ? (
              <ErrorMessage message="No report types available for your role" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {availableReportTypes.map((report) => (
                  <ReportTypeCard
                    key={report.value}
                    title={report.label}
                    description={report.description}
                    icon={FileBarChart}
                    onSelect={() => handleReportTypeChange(report.value)}
                    isActive={selectedReport === report.value}
                    isAvailable={report.available}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Generate Report Button */}
        {selectedReport && !rawReportData && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileBarChart className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Generate Report</h3>
              <p className="text-gray-600 mb-6">
                Click the button below to generate the {getReportDisplayName()} report. 
                You'll be able to filter and customize the results after generation.
              </p>
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center mx-auto"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate {getReportDisplayName()} Report
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        {/* Report Results with Frontend Filtering */}
        {rawReportData && filteredData !== undefined && (
          <>
            {/* Advanced Filters Panel */}
            <AdvancedFilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              availableFields={availableFields}
              data={rawReportData.data}
              onApplyFilters={applyFiltersToData}
              onResetFilters={() => {
                const resetFilters = {
                  start_date: '',
                  end_date: '',
                  search_query: '',
                  role: '',
                  status: '',
                  department: '',
                  severity: '',
                  priority: '',
                  incident_status: ''
                };
                setFilters(resetFilters);
                setTimeout(() => applyFiltersToData(), 0);
              }}
            />
            
            {/* Report Tabs */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="border-b border-gray-200">
                <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex space-x-6">
                    <button
                      onClick={() => setActiveTab('summary')}
                      className={`px-4 py-2 font-medium rounded-lg transition-colors ${activeTab === 'summary' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      <FileText className="w-4 h-4 inline mr-2" />
                      Summary ({filteredData.length} records)
                    </button>
                    <button
                      onClick={() => setActiveTab('data')}
                      className={`px-4 py-2 font-medium rounded-lg transition-colors ${activeTab === 'data' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      <Database className="w-4 h-4 inline mr-2" />
                      Data View
                    </button>
                    <button
                      onClick={() => setActiveTab('export')}
                      className={`px-4 py-2 font-medium rounded-lg transition-colors ${activeTab === 'export' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      <Download className="w-4 h-4 inline mr-2" />
                      Export
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {/* Column Selector Button */}
                    {activeTab === 'data' && (
                      <button
                        onClick={() => setShowColumnSelector(true)}
                        className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        title="Select Columns to Display"
                      >
                        <Columns className="w-4 h-4 mr-2" />
                        Columns ({selectedColumns.length})
                      </button>
                    )}
                    
                    <button
                      onClick={() => window.print()}
                      className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </button>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleExport('pdf')}
                        disabled={isExporting}
                        className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                        PDF
                      </button>
                      <button
                        onClick={() => handleExport('excel')}
                        disabled={isExporting}
                        className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-2" />}
                        Excel
                      </button>
                      <button
                        onClick={() => handleExport('csv')}
                        disabled={isExporting}
                        className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileBarChart className="w-4 h-4 mr-2" />}
                        CSV
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {activeTab === 'summary' && (
                  <div className="space-y-8">
                    {/* Report Header */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          <FileText className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{getReportDisplayName()}</h3>
                          <p className="text-gray-600 mt-1">
                            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Report Information</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b border-blue-100">
                              <span className="text-gray-600">Report Type:</span>
                              <span className="font-medium text-gray-900">{getReportDisplayName()}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-blue-100">
                              <span className="text-gray-600">Generated By:</span>
                              <span className="font-medium text-gray-900">{user?.full_name || 'System Administrator'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-blue-100">
                              <span className="text-gray-600">Total Records (Original):</span>
                              <span className="font-medium text-gray-900">{rawReportData.data?.length || 0}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-blue-100">
                              <span className="text-gray-600">Records After Filtering:</span>
                              <span className="font-medium text-blue-600">{filteredData.length}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-blue-100">
                              <span className="text-gray-600">Organization:</span>
                              <span className="font-medium text-gray-900">Hammer-Tech Global</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Key Metrics</h4>
                          <div className="space-y-3">
                            {keyMetrics.map((metric, index) => (
                              <div key={index} className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                                <span className="text-gray-700 flex-1">{metric.split(':')[0]}:</span>
                                <span className="font-bold text-blue-600">{metric.split(':')[1]?.trim() || metric}</span>
                              </div>
                            ))}
                            {keyMetrics.length === 0 && (
                              <p className="text-gray-500 text-sm">No metrics available</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Summary Statistics */}
                    {Object.keys(summaryStats).length > 0 && (
                      <SummaryStatistics stats={summaryStats} />
                    )}
                    
                    {/* Active Filters Display */}
                    {Object.values(filters).some(v => v && v !== '') && (
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                          <h4 className="font-semibold text-gray-900">Active Filters</h4>
                        </div>
                        <div className="p-6">
                          <div className="flex flex-wrap gap-3">
                            {Object.entries(filters).map(([key, value]) => {
                              if (value && value !== '') {
                                let displayValue = value;
                                if (key === 'department' && availableDepartments.length > 0) {
                                  const dept = availableDepartments.find(d => d.value === parseInt(value));
                                  displayValue = dept ? dept.label : value;
                                }
                                return (
                                  <div key={key} className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg">
                                    <span className="font-medium">{key.replace(/_/g, ' ')}:</span> {displayValue}
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'data' && (
                  <DataTable
                    title="Filtered Report Data"
                    data={filteredData}
                    onSort={handleSort}
                    sortField={sortField}
                    sortDirection={sortDirection}
                  />
                )}
                
                {activeTab === 'export' && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
                    <div className="text-center max-w-2xl mx-auto">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <DownloadCloud className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Export Report</h3>
                      <p className="text-gray-600 mb-8">
                        Download your filtered report in multiple formats. The export will include 
                        all currently applied filters, {filteredData.length} records, and your selected columns.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
                          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-6 h-6 text-red-600" />
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">PDF Format</h4>
                          <p className="text-sm text-gray-600 mb-4">Best for printing and sharing</p>
                          <button
                            onClick={() => handleExport('pdf')}
                            disabled={isExporting}
                            className="w-full py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            {isExporting ? 'Exporting...' : 'Export PDF'}
                          </button>
                        </div>
                        
                        <div className="bg-white p-6 rounded-xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileSpreadsheet className="w-6 h-6 text-green-600" />
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">Excel Format</h4>
                          <p className="text-sm text-gray-600 mb-4">Best for data analysis</p>
                          <button
                            onClick={() => handleExport('excel')}
                            disabled={isExporting}
                            className="w-full py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            {isExporting ? 'Exporting...' : 'Export Excel'}
                          </button>
                        </div>
                        
                        <div className="bg-white p-6 rounded-xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileBarChart className="w-6 h-6 text-blue-600" />
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">CSV Format</h4>
                          <p className="text-sm text-gray-600 mb-4">Best for data import</p>
                          <button
                            onClick={() => handleExport('csv')}
                            disabled={isExporting}
                            className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            {isExporting ? 'Exporting...' : 'Export CSV'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        
        {/* Footer */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Advanced Reporting System</h4>
                <p className="text-sm text-gray-300">Hammer-Tech Global v2.0</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Generated By</p>
              <p className="text-sm font-semibold">{user?.full_name || user?.names || 'System Administrator'}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Column Selector Modal */}
      <ColumnSelectorModal
        isOpen={showColumnSelector}
        onClose={() => setShowColumnSelector(false)}
        availableColumns={availableFields}
        selectedColumns={selectedColumns}
        onSave={handleColumnSave}
      />
    </div>
  );
}

export default ReportPage;