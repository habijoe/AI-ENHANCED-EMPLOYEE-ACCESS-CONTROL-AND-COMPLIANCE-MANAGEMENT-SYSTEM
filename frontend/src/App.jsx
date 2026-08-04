import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

// Components
import { LandingPage } from "./components/LandingPage";
import { LoginScreen } from "./components/auth/LoginPage";
import { Dashboard } from "./components/Dashboard";
import { AccessControl } from "./components/AccessControl";
import { AIMonitoring } from "./components/AIMonitoring";
import { ComplianceAudit } from "./components/ComplianceAudit";
import { IncidentsReports } from "./components/IncidentsReports";
import { Training } from "./components/Training";
import { RiskAssessment } from "./components/RiskAssessment";
import { Settings } from "./components/Settings";
import { UserManagement } from "./components/UserManagement";
import { UserProfile } from "./components/UserProfile";
import { MainLayout } from "./components/layout/MainLayout";
import { ResetPasswordPage } from "./components/auth/ResetPassword";
import { ManageTrainings } from "./components/ManageTrainings";
import { CreateTraining } from "./components/CreateNewTraining";
import { EditTraining } from "./components/EditTraining";
import { AdminViewTraining } from "./components/ViewTraining";
import { ManageTrainingCandidates } from "./components/ManageTrainingCandidates";
import { AdminCreateTrainingCandidate } from "./components/CreateNewTrainingCandidate";
import { AdminEditTrainingCandidate } from "./components/EditTrainingCandidate";
import { AdminViewTrainingCandidateDetails } from "./components/ViewCandidateDetails";
import { EmployeeTrainings } from "./components/ManageMyTrainings";
import { EmployeeViewTrainingDetails } from "./components/MyTrainingDetails";
import { ApplyNewTraining } from "./components/EmployeeTakeNewTraining";
import { MyIncidentsReports } from "./components/MyIncidentsReport";
import { ReportPage } from "./components/ReportPage";
import { useAuth } from "./context/AuthContext";

// ============================================================
// PROTECTED ROUTE COMPONENT
// ============================================================

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// ============================================================
// LAYOUT WRAPPER COMPONENT
// ============================================================

const LayoutWrapper = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <MainLayout
      user={user}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      showProfileMenu={showProfileMenu}
      setShowProfileMenu={setShowProfileMenu}
      onLogout={logout}
    >
      {children}
    </MainLayout>
  );
};

// ============================================================
// ROUTE CONFIGURATION
// ============================================================

const routeConfigs = [
  // Public Routes
  { path: "/", element: <LandingPage />, protected: false },
  { path: "/login", element: <LoginScreen />, protected: false },
  { path: "/reset-password", element: <ResetPasswordPage />, protected: false },
  
  // Protected Routes
  { 
    path: "/dashboard", 
    element: <Dashboard />, 
    protected: true,
    roles: ['admin', 'hr_manager']
  },
  { 
    path: "/access-control", 
    element: <AccessControl />, 
    protected: true,
    roles: ['admin', 'security_analyst']
  },
  { 
    path: "/ai-monitoring", 
    element: <AIMonitoring />, 
    protected: true,
    roles: ['admin', 'security_analyst']
  },
  { 
    path: "/risk-assessment", 
    element: <RiskAssessment />, 
    protected: true,
    roles: ['admin', 'compliance_officer', 'security_analyst']
  },
  { 
    path: "/compliance-audit", 
    element: <ComplianceAudit />, 
    protected: true,
    roles: ['admin', 'compliance_officer', 'security_analyst']
  },
  { 
    path: "/incidents-reports", 
    element: <IncidentsReports />, 
    protected: true,
    roles: ['admin', 'security_analyst', 'compliance_officer', 'employee']
  },
  { 
    path: "/assigned-incidents", 
    element: <MyIncidentsReports />, 
    protected: true,
    roles: ['admin', 'compliance_officer', 'security_analyst', 'employee', 'hr_manager']
  },
  { 
    path: "/report", 
    element: <ReportPage />, 
    protected: true,
    roles: ['admin', 'hr_manager']
  },
  { 
    path: "/admin/training", 
    element: <ManageTrainings />, 
    protected: true,
    roles: ['admin', 'hr_manager']
  },
  { 
    path: "/training-candidates", 
    element: <ManageTrainingCandidates />, 
    protected: true,
    roles: ['admin', 'hr_manager']
  },
  { 
    path: "/admin/createTraining", 
    element: <CreateTraining />, 
    protected: true,
    roles: ['admin', 'hr_manager']
  },
  { 
    path: "/admin/editTraining/:id", 
    element: <EditTraining />, 
    protected: true,
    roles: ['admin', 'hr_manager']
  },
  { 
    path: "/admin/viewTraining/:id", 
    element: <AdminViewTraining />, 
    protected: true,
    roles: ['admin', 'hr_manager']
  },
  { 
    path: "/user-management", 
    element: <UserManagement />, 
    protected: true,
    roles: ['admin', 'hr_manager']
  },
  { 
    path: "/settings", 
    element: <Settings />, 
    protected: true,
    roles: ['admin', 'compliance_officer', 'security_analyst']
  },
  { 
    path: "/training", 
    element: <EmployeeTrainings />, 
    protected: true,
    roles: ['employee']
  },
  { 
    path: "/learner/training", 
    element: <ApplyNewTraining />, 
    protected: true,
    roles: ['employee']
  },
  { 
    path: "/learner/apply-training/:trainingId", 
    element: <ApplyNewTraining />, 
    protected: true,
    roles: ['employee']
  },
  { 
    path: "/learner/myTrainingDetails/:id", 
    element: <EmployeeViewTrainingDetails />, 
    protected: true,
    roles: ['employee']
  },
  { 
    path: "/profile", 
    element: <UserProfile />, 
    protected: true,
    roles: []
  },
];

// ============================================================
// MAIN APP COMPONENT
// ============================================================

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          },
          success: {
            style: {
              borderLeft: '4px solid #10B981',
            },
          },
          error: {
            style: {
              borderLeft: '4px solid #EF4444',
            },
          },
        }}
      />
      <Routes>
        {routeConfigs.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              route.protected ? (
                <ProtectedRoute allowedRoles={route.roles}>
                  <LayoutWrapper>
                    {route.element}
                  </LayoutWrapper>
                </ProtectedRoute>
              ) : (
                route.element
              )
            }
          />
        ))}
        
        {/* Catch-all route */}
        <Route 
          path="*" 
          element={
            user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </>
  );
}

// ============================================================
// APP EXPORT
// ============================================================

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}