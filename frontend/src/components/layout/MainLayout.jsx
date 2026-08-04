import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Shield,
  Brain,
  FileCheck,
  AlertTriangle,
  Users,
  Settings as SettingsIcon,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronDown,
  GraduationCap,
  Target,
  User as UserIcon,
  Globe,
  Activity,
  Zap,
  AlertCircle,
  Home,
  BarChart3,
  Award,
  Clock,
  CheckCircle,
  TrendingUp,
  Fingerprint
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { NotificationDropdown } from "../../components/NotificationDropdown";
import axios from "axios";
import toast from "react-hot-toast";
import logo from "../../../public/hammerlogo.webp";

const BASE_URL = "http://127.0.0.1:8000";

// ============================================================
// MAIN LAYOUT COMPONENT
// ============================================================

export function MainLayout({
  children,
  user,
  sidebarOpen,
  setSidebarOpen,
  showProfileMenu,
  setShowProfileMenu,
  onLogout,
}) {
  const [hasAssignedIncidents, setHasAssignedIncidents] = useState(false);
  const [assignedCount, setAssignedCount] = useState(0);
  const [urgentCount, setUrgentCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const { logout } = useAuth();
  const { unreadCount, showDropdown, setShowDropdown } = useNotifications();

  // ============================================================
  // CHECK ASSIGNED INCIDENTS
  // ============================================================
  
  const checkAssignedIncidents = async () => {
    try {
      setIsChecking(true);
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await axios.get(
        `${BASE_URL}/incidents/assigned/check/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const { has_assigned_incidents, total_assigned, urgent } = response.data;
        setHasAssignedIncidents(has_assigned_incidents);
        setAssignedCount(total_assigned);
        setUrgentCount(urgent?.high_priority || 0);
      }
    } catch (error) {
      console.error('Error checking assigned incidents:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkAssignedIncidents();
      const intervalId = setInterval(checkAssignedIncidents, 300000);
      return () => clearInterval(intervalId);
    }
  }, [user]);

  // ============================================================
  // NAVIGATION CONFIGURATION - REMOVED "My Assigned" from sidebar
  // ============================================================

  const getNavigationForRole = (role) => {
    const baseNavigation = [
      {
        id: "dashboard",
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard",
        roles: ["admin", "hr_manager"],
        description: "Overview & analytics"
      },
      {
        id: "access",
        name: "Access Control",
        icon: Shield,
        path: "/access-control",
        roles: ["admin", "security_analyst"],
        description: "Manage permissions"
      },
      {
        id: "risk",
        name: "Risk Assessment",
        icon: Target,
        path: "/risk-assessment",
        roles: ["admin", "security_analyst"],
        description: "Analyze risks"
      },
      {
        id: "compliance",
        name: "Compliance Audit",
        icon: FileCheck,
        path: "/compliance-audit",
        roles: ["admin", "compliance_officer"],
        description: "Audit & compliance"
      },
      {
        id: "incidents",
        name: "Incidents & Reports",
        icon: AlertTriangle,
        path: "/incidents-reports",
        roles: ["admin", "security_analyst", "compliance_officer", "employee"],
        description: "View incidents"
      },
      {
        id: "training",
        name: "Training & Awareness",
        icon: GraduationCap,
        path: user?.role === "employee" ? "/training" : "/admin/training",
        roles: ["admin", "hr_manager", "employee"],
        description: "Learning modules"
      },
    ];

    // REMOVED: "My Assigned" from sidebar navigation
    // The assigned incidents are now only accessible via the notification bell

    return baseNavigation.filter((item) => item.roles.includes(role));
  };

  const navigation = getNavigationForRole(user?.role || "employee");

  const roleDisplayMap = {
    admin: "System Administrator",
    compliance_officer: "Compliance Officer",
    security_analyst: "Security Analyst",
    hr_manager: "HR Manager",
    employee: "Employee",
  };

  const displayRole = roleDisplayMap[user?.role] || "Employee";

  // ============================================================
  // LOGOUT HANDLER
  // ============================================================

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      const accessToken = localStorage.getItem('access_token');

      if (refreshToken && accessToken) {
        await axios.post(
          `${BASE_URL}/auth/logout/`,
          { refresh_token: refreshToken },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      if (onLogout) {
        onLogout();
      } else {
        logout();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50/50 to-slate-50 flex">
      {/* ============================================================
          SIDEBAR
          ============================================================ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-5 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg overflow-hidden">
                  <img src={logo} alt="Logo" className="w-9 h-9 object-contain" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">Hammer Tech</h3>
                  <p className="text-xs text-gray-400 font-medium">Security Platform</p>
                </div>
              </div>
              <button
                className="lg:hidden text-gray-400 hover:text-white transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* REMOVED: Assigned Incidents Badge from sidebar */}
            {/* The assigned incidents count is now only shown in the header */}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <p className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Main Menu
            </p>

            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = window.location.pathname === item.path;

              return (
                <a
                  key={item.id}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = item.path;
                    setSidebarOpen(false);
                  }}
                  className={`group relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 text-white shadow-lg'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="relative">
                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{item.name}</span>
                    {item.description && (
                      <p className={`text-[10px] ${isActive ? 'text-gray-300' : 'text-gray-500'} truncate`}>
                        {item.description}
                      </p>
                    )}
                  </div>
                  {isActive && (
                    <div className="w-1 h-6 bg-white rounded-full shadow-lg"></div>
                  )}
                </a>
              );
            })}

            <div className="pt-3 mt-3 border-t border-white/10">
              <p className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Management
              </p>

              {/* User Management */}
              {(user?.role === "admin" || user?.role === "hr_manager") && (
                <a
                  href="/user-management"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = "/user-management";
                    setSidebarOpen(false);
                  }}
                  className={`group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                    window.location.pathname === '/user-management'
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Users className={`h-5 w-5 ${window.location.pathname === '/user-management' ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`} />
                  <span className="text-sm font-medium">User Management</span>
                </a>
              )}

              {/* Reports & Analytics */}
              {["admin", "hr_manager"].includes(user?.role) && (
                <a
                  href="/report"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = "/report";
                    setSidebarOpen(false);
                  }}
                  className={`group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                    window.location.pathname === '/report'
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <BarChart3 className={`h-5 w-5 ${window.location.pathname === '/report' ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`} />
                  <span className="text-sm font-medium">Reports & Analytics</span>
                </a>
              )}
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all duration-200 group"
            >
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-bold shadow-lg">
                  {user?.full_name?.charAt(0) || user?.name?.charAt(0) || "U"}
                </div>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.full_name || user?.name || "User"}
                </p>
                <p className="text-xs text-gray-400 truncate">{displayRole}</p>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                  showProfileMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {showProfileMenu && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                <a
                  href="/profile"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = "/profile";
                    setShowProfileMenu(false);
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-gray-300 hover:text-white transition-colors"
                >
                  <UserIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">My Profile</span>
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors border-t border-white/5"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ============================================================
          MAIN CONTENT
          ============================================================ */}
      <div className="flex-1 lg:ml-72">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              <div className="hidden md:block">
                <h2 className="text-lg font-bold text-gray-900">Security Management Platform</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <Globe className="h-3.5 w-3.5 text-gray-500" />
                  <p className="text-xs text-gray-500">Powered by Hammer Group Rwanda</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* REMOVED: Assigned Incidents Badge from header - now only in notification bell */}

              {/* Notification Bell - Shows unread count */}
              <div className="relative">
                <button
                  className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  onClick={() => setShowDropdown(!showDropdown)}
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationDropdown
                  isOpen={showDropdown}
                  onClose={() => setShowDropdown(false)}
                />
              </div>

              {/* Status Indicators */}
              <div className="hidden sm:flex items-center gap-2 border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-medium">
                <Activity className="h-3 w-3 text-emerald-500" />
                <span>Active</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 border border-gray-200 bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full text-xs font-medium">
                <Zap className="h-3 w-3 text-gray-500" />
                <span>v2.1.0</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6">{children}</main>

        {/* Footer */}
        <footer className="border-t border-gray-200/50 px-4 sm:px-6 py-4 mt-8 bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-md">
                <img src={logo} alt="Logo" className="w-5 h-5 object-contain" />
              </div>
              <span className="text-gray-600">
                © {new Date().getFullYear()} Hammer Tech Ltd. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <a
                href="https://www.hammergp.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-700 transition-colors"
              >
                About Hammer Group
              </a>
              <span className="text-gray-300">•</span>
              <span>Version 2.1.0</span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Operational
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}