import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Lock, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Loader2, 
  Clock, 
  Home, 
  ShieldOff, 
  AlertTriangle, 
  X,
  Shield,
  CheckCircle,
  Mail,
  Key,
  ArrowRight,
  Building2,
  Fingerprint
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// ============================================================
// 🔐 TIME GATE CONFIGURATION - Modify these values to change login window
// ============================================================
// To test during night hours, change the values below:
// Example for 24/7 access: set START to { hour: 0, minute: 0 } and END to { hour: 23, minute: 59 }
// Example for night testing: set START to { hour: 0, minute: 0 } and END to { hour: 23, minute: 59 }
// ============================================================
const OTP_WINDOW_START = { hour: 0, minute: 0 };  // 08:30 AM - Change this for earlier/later start
const OTP_WINDOW_END = { hour: 23, minute: 59 };    // 05:00 PM - Change this for earlier/later end
// ============================================================

/**
 * Returns true if the current local time is within the allowed OTP window.
 */
function isWithinOtpWindow() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = OTP_WINDOW_START.hour * 60 + OTP_WINDOW_START.minute;
  const endMinutes = OTP_WINDOW_END.hour * 60 + OTP_WINDOW_END.minute;
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

/**
 * Returns a human-readable string of when OTP requests next become available.
 */
function getNextAvailableMessage() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = OTP_WINDOW_START.hour * 60 + OTP_WINDOW_START.minute;

  if (currentMinutes < startMinutes) {
    return `Login is available from ${OTP_WINDOW_START.hour.toString().padStart(2, '0')}:${OTP_WINDOW_START.minute.toString().padStart(2, '0')} AM. Please try again then.`;
  }
  return `Login is only available between ${OTP_WINDOW_START.hour.toString().padStart(2, '0')}:${OTP_WINDOW_START.minute.toString().padStart(2, '0')} AM and ${OTP_WINDOW_END.hour.toString().padStart(2, '0')}:${OTP_WINDOW_END.minute.toString().padStart(2, '0')} PM. Please try again tomorrow.`;
}

// ─── Account Lock Modal Component ───────────────────────────────────
const AccountLockModal = ({ isOpen, onClose, message, remainingSeconds, onRetry }) => {
  const [countdown, setCountdown] = useState(remainingSeconds);

  useEffect(() => {
    if (isOpen && remainingSeconds > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, remainingSeconds]);

  useEffect(() => {
    setCountdown(remainingSeconds);
  }, [remainingSeconds]);

  if (!isOpen) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeString = minutes > 0 
    ? `${minutes} minute${minutes !== 1 ? 's' : ''} and ${seconds} second${seconds !== 1 ? 's' : ''}`
    : `${seconds} second${seconds !== 1 ? 's' : ''}`;

  const handleRetry = () => {
    onClose();
    if (onRetry) onRetry();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Account Locked</h3>
          <p className="text-gray-600 mb-2">{message || "Too many failed login attempts."}</p>
          
          {countdown > 0 && (
            <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-orange-600 animate-pulse" />
                <span className="text-lg font-semibold text-orange-600">
                  Unlock in: {timeString}
                </span>
              </div>
              <div className="w-full bg-orange-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-2.5 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${(countdown / remainingSeconds) * 100}%`,
                    transition: 'width 1s linear'
                  }}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
          >
            Close
          </button>
          <button
            onClick={handleRetry}
            disabled={countdown > 0}
            className={`flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl transition-all font-medium shadow-lg hover:shadow-xl ${
              countdown > 0 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:from-blue-700 hover:to-blue-800'
            }`}
          >
            {countdown > 0 ? 'Please Wait...' : 'Try Again'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Login Component ───────────────────────────────────────────
export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginStep, setLoginStep] = useState("credentials");
  const [otpExpiry, setOtpExpiry] = useState(120);
  const [otpExpiryActive, setOtpExpiryActive] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Account lock states
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [lockMessage, setLockMessage] = useState("");
  const [lockRemainingSeconds, setLockRemainingSeconds] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [showAttemptsWarning, setShowAttemptsWarning] = useState(false);

  // Live clock state
  const [withinWindow, setWithinWindow] = useState(isWithinOtpWindow());

  const navigate = useNavigate();
  const { loginWithOTPRequest, loginWithOTPVerify, setAuthTokens, setUser } = useAuth();

  // ── Re-check the time window every 30 seconds ──────────────────────
  useEffect(() => {
    const tick = () => setWithinWindow(isWithinOtpWindow());
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  // ── OTP countdown timer ────────────────────────────────────────────
  useEffect(() => {
    if (!otpExpiryActive || otpExpiry <= 0) return;

    const timer = setInterval(() => {
      setOtpExpiry((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setOtpExpiryActive(false);
          setError("OTP has expired. Please request a new one.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [otpExpiryActive, otpExpiry]);

  // ── Auto-clear attempts warning after 5 seconds ────────────────────
  useEffect(() => {
    if (showAttemptsWarning) {
      const timer = setTimeout(() => setShowAttemptsWarning(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showAttemptsWarning]);

  // ── Check account lock status ──────────────────────────────────────
  const checkAccountLockStatus = async (emailToCheck) => {
    if (!emailToCheck) return null;
    
    try {
      const response = await fetch("http://127.0.0.1:8000/auth/check-lock-status/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToCheck }),
      });
      
      const data = await response.json();
      
      if (data.is_locked) {
        setLockMessage(data.message);
        setLockRemainingSeconds(data.remaining_seconds || 180);
        setLockModalOpen(true);
        setFailedAttempts(data.failed_attempts || 0);
        return data;
      }
      
      if (data.failed_attempts > 0) {
        setFailedAttempts(data.failed_attempts);
        const remaining = 3 - data.failed_attempts;
        setRemainingAttempts(remaining);
        if (remaining > 0) {
          setShowAttemptsWarning(true);
          setError(`Warning: ${data.failed_attempts} failed attempt(s) detected. ${remaining} attempt(s) remaining before account lock.`);
        }
      }
      
      return data;
    } catch (err) {
      console.error("Error checking lock status:", err);
      return null;
    }
  };

  // ── Step 1: Credentials → request OTP ─────────────────────────────
  const handleCredentialLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setShowAttemptsWarning(false);

    if (!isWithinOtpWindow()) {
      setError(getNextAvailableMessage());
      return;
    }

    if (!email || !password) {
      setError("Email and Password are required");
      return;
    }

    const lockStatus = await checkAccountLockStatus(email);
    if (lockStatus?.is_locked) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/login-with-otp/request/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 423 || data.is_locked) {
          setLockMessage(data.message || "Account is temporarily locked due to too many failed attempts.");
          setLockRemainingSeconds(data.remaining_seconds || 180);
          setLockModalOpen(true);
          setFailedAttempts(data.failed_attempts || 3);
          setError("");
        } else if (data.remaining_attempts !== undefined) {
          setRemainingAttempts(data.remaining_attempts);
          setFailedAttempts(3 - data.remaining_attempts);
          setShowAttemptsWarning(true);
          setError(data.message || `Invalid credentials. ${data.remaining_attempts} attempt(s) remaining.`);
        } else {
          setError(data.message || "Login failed. Please check your credentials.");
        }
        setLoading(false);
        return;
      }

      const masked = maskEmail(data.email || email);
      setMaskedEmail(masked);
      setLoginStep("otp");
      setOtpExpiry(120);
      setOtpExpiryActive(true);
      setSuccessMessage("OTP has been sent to your email!");
      setShowAttemptsWarning(false);
      setError("");
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: OTP verification ───────────────────────────────────────
  const handleOtpVerification = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email || !otp) {
      setError("Email and OTP are required");
      return;
    }
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    if (otpExpiry <= 0) {
      setError("OTP has expired. Please request a new one.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/login-with-otp/verify/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 423 || data.is_locked) {
          setLockMessage(data.message || "Account is temporarily locked due to too many failed attempts.");
          setLockRemainingSeconds(data.remaining_seconds || 180);
          setLockModalOpen(true);
          setFailedAttempts(data.failed_attempts || 3);
          setError("");
          setLoginStep("credentials");
          setOtp("");
          setOtpExpiryActive(false);
        } else if (data.remaining_attempts !== undefined) {
          setRemainingAttempts(data.remaining_attempts);
          setFailedAttempts(3 - data.remaining_attempts);
          setShowAttemptsWarning(true);
          setError(data.message || `OTP verification failed. ${data.remaining_attempts} attempt(s) remaining.`);
        } else {
          setError(data.message || "OTP verification failed.");
        }
        setLoading(false);
        return;
      }

      if (data.tokens) {
        localStorage.setItem("access_token", data.tokens.access);
        localStorage.setItem("refresh_token", data.tokens.refresh);
        if (setAuthTokens) setAuthTokens({ access: data.tokens.access, refresh: data.tokens.refresh });
        if (setUser && data.user) setUser(data.user);
      }

      setSuccessMessage("Login successful! Redirecting...");
      
      setFailedAttempts(0);
      setRemainingAttempts(3);
      setShowAttemptsWarning(false);

      const role = data.user?.role;

      if (role === "admin" || role === "hr_manager") {
        setTimeout(() => navigate("/dashboard"), 1500);
      } else if (role === "employee") {
        setTimeout(() => navigate("/training"), 1500);
      } else if (role === "security_analyst") {
        setTimeout(() => navigate("/incidents-reports"), 1500);
      } else if (role === "compliance_officer") {
        setTimeout(() => navigate("/assigned-incidents"), 1500);
      }

    } catch (err) {
      console.error("OTP verification error:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (!isWithinOtpWindow()) {
      setError(getNextAvailableMessage());
      return;
    }

    if (!email || !password) {
      setError("Session expired. Please login again.");
      goBackToCredentials();
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/login-with-otp/request/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 423 || data.is_locked) {
          setLockMessage(data.message || "Account is temporarily locked.");
          setLockRemainingSeconds(data.remaining_seconds || 180);
          setLockModalOpen(true);
          setLoginStep("credentials");
        } else {
          setError(data.message || "Failed to resend OTP.");
        }
        setLoading(false);
        return;
      }

      setOtpExpiry(120);
      setOtpExpiryActive(true);
      setOtp("");
      setSuccessMessage("New OTP sent successfully!");
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const goBackToCredentials = () => {
    setLoginStep("credentials");
    setOtp("");
    setOtpExpiryActive(false);
    setOtpExpiry(120);
    setError("");
    setSuccessMessage("");
    setShowAttemptsWarning(false);
  };

  const maskEmail = (email) => {
    if (!email) return "";
    const [username, domain] = email.split("@");
    if (username.length <= 3) return `${"*".repeat(username.length)}@${domain}`;
    const visibleStart = username.substring(0, 2);
    const visibleEnd = username.substring(username.length - 1);
    return `${visibleStart}${"*".repeat(username.length - 3)}${visibleEnd}@${domain}`;
  };

  const handleLockModalClose = () => {
    setLockModalOpen(false);
    setLoginStep("credentials");
    setOtp("");
    setOtpExpiryActive(false);
    setError("");
  };

  const handleLockModalRetry = () => {
    setLockModalOpen(false);
    setLoginStep("credentials");
    setOtp("");
    setOtpExpiryActive(false);
    setError("");
    setEmail("");
    setPassword("");
  };

  // ── Out-of-hours banner ────────────────────────────────────────────
  const OutOfHoursBanner = () => (
    <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl mb-6 flex items-start gap-4 shadow-sm">
      <div className="p-2 bg-amber-100 rounded-xl flex-shrink-0">
        <ShieldOff className="w-6 h-6 text-amber-600" />
      </div>
      <div>
        <p className="text-sm font-bold text-amber-800">Login Unavailable</p>
        <p className="text-sm text-amber-700 mt-1 leading-relaxed">
          Login is only permitted between <span className="font-bold">{OTP_WINDOW_START.hour.toString().padStart(2, '0')}:{OTP_WINDOW_START.minute.toString().padStart(2, '0')} AM</span> and <span className="font-bold">{OTP_WINDOW_END.hour.toString().padStart(2, '0')}:{OTP_WINDOW_END.minute.toString().padStart(2, '0')} PM</span>.
          <br />
          <span className="text-xs opacity-75">Please return during business hours.</span>
        </p>
      </div>
    </div>
  );

  // ── Attempts Warning Banner ────────────────────────────────────────
  const AttemptsWarningBanner = () => {
    if (!showAttemptsWarning) return null;
    
    return (
      <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl mb-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-orange-100 rounded-lg flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-orange-800">Security Alert</p>
            <p className="text-sm text-orange-700 mt-1">
              {failedAttempts} failed attempt(s) detected. <span className="font-bold">{remainingAttempts}</span> attempt(s) remaining before account lock.
            </p>
            <div className="mt-2 w-full bg-orange-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(failedAttempts / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white tracking-wider">HammerTech</span>
              <span className="text-xs text-blue-300 tracking-[0.2em] uppercase">Group Rwanda</span>
            </div>
          </div>
          <p className="text-sm text-blue-200/80 mt-2">
            AI-Enhanced Access Control &amp; Compliance System
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-blue-400/30"></div>
            <Fingerprint className="w-4 h-4 text-blue-400/50" />
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-blue-400/30"></div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="flex justify-start mb-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-blue-300/70 hover:text-blue-200 hover:bg-white/5 px-4 py-2 rounded-xl transition-all backdrop-blur-sm border border-white/5"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 relative overflow-hidden">
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
          
          <div className="relative">
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                {loginStep === "credentials" ? "Welcome Back" : "Verify Your Identity"}
              </h2>
              <p className="text-sm text-blue-200/70">
                {loginStep === "credentials"
                  ? "Enter your credentials to receive a secure OTP"
                  : `Code sent to ${maskedEmail}`}
              </p>
            </div>

            {/* Out-of-hours banner */}
            {!withinWindow && <OutOfHoursBanner />}

            {/* Attempts Warning Banner */}
            <AttemptsWarningBanner />

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-500/10 border-2 border-red-500/20 rounded-xl mb-6 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            )}

            {/* Success */}
            {successMessage && (
              <div className="p-4 bg-green-500/10 border-2 border-green-500/20 rounded-xl mb-6 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <p className="text-sm text-green-300">{successMessage}</p>
                </div>
              </div>
            )}

            {/* ── Credentials Step ── */}
            {loginStep === "credentials" && (
              <form onSubmit={handleCredentialLogin} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">Email Address</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Mail className="w-5 h-5 text-blue-400/60 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                      type="email"
                      placeholder="Enter your work email"
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder:text-blue-300/40 transition-all backdrop-blur-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      disabled={!withinWindow}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-blue-200">Password</label>
                    <button
                      type="button"
                      onClick={() => navigate("/reset-password")}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Key className="w-5 h-5 text-blue-400/60 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="w-full pl-12 pr-12 py-3.5 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder:text-blue-300/40 transition-all backdrop-blur-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      disabled={!withinWindow}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400/60 hover:text-blue-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-blue-300/50 mt-2">You'll receive a 6-digit OTP via email after verification</p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !withinWindow}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl mt-6 group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending OTP...
                    </>
                  ) : !withinWindow ? (
                    <>
                      <Clock className="w-5 h-5" />
                      Available 08:30 AM – 5:00 PM
                    </>
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ── OTP Step ── */}
            {loginStep === "otp" && (
              <div className="space-y-6">
                {/* Timer */}
                {otpExpiryActive && (
                  <div className="flex justify-center">
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-orange-500/10 border-2 border-orange-500/20 rounded-xl backdrop-blur-sm">
                      <Clock className={`w-4 h-4 ${otpExpiry <= 10 ? "text-red-400 animate-pulse" : "text-orange-400"}`} />
                      <span className={`text-sm font-semibold ${otpExpiry <= 10 ? "text-red-400" : "text-orange-300"}`}>
                        Expires in: {otpExpiry}s
                      </span>
                    </div>
                  </div>
                )}

                {/* Read-only email */}
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">Email</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Mail className="w-5 h-5 text-blue-400/60" />
                    </div>
                    <input
                      type="email"
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border-2 border-white/10 rounded-xl text-blue-200/70 cursor-not-allowed"
                      value={email}
                      readOnly
                    />
                  </div>
                </div>

                {/* OTP input */}
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">Enter OTP Code</label>
                  <input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-4 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-center text-3xl tracking-[0.5em] font-bold text-white placeholder:text-blue-300/30 transition-all"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && otp.length === 6 && handleOtpVerification(e)}
                    autoFocus
                  />
                </div>

                {/* Back / Verify */}
                <div className="flex gap-3">
                  <button
                    onClick={goBackToCredentials}
                    className="flex-1 py-3.5 border-2 border-white/10 text-blue-200 font-semibold rounded-xl hover:bg-white/5 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleOtpVerification}
                    disabled={loading || otp.length !== 6 || otpExpiry <= 0}
                    className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl group"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify OTP
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>

                {/* Resend */}
                <div className="text-center pt-2">
                  <p className="text-sm text-blue-300/60 mb-2">Didn't receive the code?</p>
                  <button
                    onClick={handleResendOtp}
                    disabled={loading || otpExpiry > 0 || !withinWindow}
                    className="text-sm text-blue-400 hover:text-blue-300 font-semibold hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {!withinWindow
                      ? "Resend unavailable outside business hours"
                      : otpExpiry > 0
                        ? `Resend OTP (${otpExpiry}s)`
                        : "Resend OTP"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-blue-300/40 tracking-wider">
            © {new Date().getFullYear()} Hammer Tech Group Rwanda. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <span className="text-xs text-blue-300/30">🔒 Secured</span>
            <span className="w-px h-3 bg-blue-300/20"></span>
            <span className="text-xs text-blue-300/30">⚡ AI-Powered</span>
            <span className="w-px h-3 bg-blue-300/20"></span>
            <span className="text-xs text-blue-300/30">🛡️ Enterprise Grade</span>
          </div>
        </div>
      </div>

      {/* Account Lock Modal */}
      <AccountLockModal
        isOpen={lockModalOpen}
        onClose={handleLockModalClose}
        message={lockMessage}
        remainingSeconds={lockRemainingSeconds}
        onRetry={handleLockModalRetry}
      />
    </div>
  );
}