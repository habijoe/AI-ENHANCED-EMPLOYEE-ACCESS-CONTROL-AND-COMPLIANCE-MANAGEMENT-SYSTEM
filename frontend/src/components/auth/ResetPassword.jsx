import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Award, 
  Mail, 
  CheckCircle, 
  ArrowLeft, 
  Key, 
  Clock,
  RefreshCw,
  Shield,
  Fingerprint,
  Lock,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('request-otp');
  const [workMail, setWorkMail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpExpiry, setOtpExpiry] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle OTP timer
  useEffect(() => {
    let timer;
    if (step === 'verify-otp' && otpExpiry > 0) {
      timer = setInterval(() => {
        setOtpExpiry((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, otpExpiry]);

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/\d/.test(password)) errors.push('At least one number');
    if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter');
    if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('At least one special character');
    return errors;
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://127.0.0.1:8000/auth/password-reset/request-otp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ work_mail_address: workMail }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('OTP has been sent to your registered email address.');
        setStep('verify-otp');
        setOtpExpiry(30);
        setCanResend(false);
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://127.0.0.1:8000/auth/password-reset/verify-otp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          work_mail_address: workMail, 
          otp 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpVerified(true);
        setSuccess('OTP verified successfully!');
        setTimeout(() => {
          setStep('reset-password');
          setSuccess('');
        }, 1500);
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://127.0.0.1:8000/auth/password-reset/request-otp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ work_mail_address: workMail }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('New OTP has been sent to your email.');
        setOtpExpiry(30);
        setCanResend(false);
        setOtp('');
      } else {
        setError(data.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      setError(`Password must contain: ${passwordErrors.join(', ')}`);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/auth/password-reset/confirm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          work_mail_address: workMail,
          otp,
          new_password: newPassword,
          confirm_password: confirmPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password reset successfully!');
        setStep('success');
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'request-otp':
        return (
          <form onSubmit={handleRequestOTP} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="workMail" className="block text-sm font-medium text-blue-200">
                Work Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Mail className="w-5 h-5 text-blue-400/60 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  id="workMail"
                  type="text"
                  placeholder="Enter your work email address"
                  value={workMail}
                  onChange={(e) => setWorkMail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder:text-blue-300/40 transition-all backdrop-blur-sm"
                  required
                />
              </div>
              <p className="text-xs text-blue-300/50 mt-1">
                Enter your registered work email to receive a reset OTP
              </p>
            </div>

            <button 
              type="submit" 
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl group"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  Send Reset OTP
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        );

      case 'verify-otp':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-blue-500/10 border-2 border-blue-500/20 rounded-xl backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-blue-200">
                    OTP expires in: <span className={`font-bold ${otpExpiry <= 10 ? 'text-red-400' : 'text-blue-300'}`}>{otpExpiry}s</span>
                  </span>
                </div>
                {canResend && (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-200 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Resend
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="otp" className="block text-sm font-medium text-blue-200">
                  Enter OTP Code
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Key className="w-5 h-5 text-blue-400/60" />
                  </div>
                  <input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/5 border-2 border-white/10 rounded-xl text-center text-2xl tracking-[0.5em] font-bold text-white placeholder:text-blue-300/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>
                <p className="text-xs text-blue-300/50 mt-1">
                  Enter the 6-digit OTP sent to your registered email
                </p>
              </div>

              <button 
                type="submit" 
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl group"
                disabled={isLoading || !otp || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify OTP
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep('request-otp');
                    setError('');
                    setSuccess('');
                  }}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Use a different email address
                </button>
              </div>
            </form>
          </div>
        );

      case 'reset-password':
        return (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="newPassword" className="block text-sm font-medium text-blue-200">
                  New Password
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Lock className="w-5 h-5 text-blue-400/60 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder:text-blue-300/40 transition-all backdrop-blur-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400/60 hover:text-blue-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <PasswordStrength password={newPassword} />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-200">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Lock className="w-5 h-5 text-blue-400/60 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder:text-blue-300/40 transition-all backdrop-blur-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400/60 hover:text-blue-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-sm text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4" />
                    Passwords do not match
                  </p>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-3.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl group"
              disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('verify-otp')}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to OTP verification
              </button>
            </div>
          </form>
        );

      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center mx-auto border-4 border-green-500/30 animate-in fade-in zoom-in duration-500">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Password Reset Successful!
              </h3>
              <p className="text-blue-200/70 leading-relaxed">
                Your password has been successfully reset. You can now login with your new password.
              </p>
            </div>
            <Link to="/login">
              <button className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all inline-flex items-center justify-center gap-3 shadow-lg hover:shadow-xl group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Back to Login
              </button>
            </Link>
          </div>
        );
    }
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
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white tracking-wider">HammerTech</span>
              <span className="text-xs text-blue-300 tracking-[0.2em] uppercase">Group Rwanda</span>
            </div>
          </Link>
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-blue-400/30"></div>
            <Fingerprint className="w-4 h-4 text-blue-400/50" />
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-blue-400/30"></div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
          
          <div className="relative">
            {/* Step Indicator */}
            {step !== 'success' && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  {['request-otp', 'verify-otp', 'reset-password'].map((s, index) => (
                    <React.Fragment key={s}>
                      <div className="flex flex-col items-center">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                          ${step === s ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30' : 
                            ['verify-otp', 'reset-password'].includes(step) && ['request-otp', 'verify-otp'].includes(s) ? 
                            'bg-green-500/20 text-green-400 border-2 border-green-500/30' : 
                            'bg-white/5 text-blue-300/40 border-2 border-white/10'}
                        `}>
                          {index + 1}
                        </div>
                        <span className={`text-xs mt-2 capitalize ${step === s ? 'text-blue-300 font-medium' : 'text-blue-300/40'}`}>
                          {s.replace('-', ' ')}
                        </span>
                      </div>
                      {index < 2 && (
                        <div className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${['verify-otp', 'reset-password'].includes(step) && s !== 'reset-password' ? 'bg-green-500/30' : 'bg-white/10'}`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* Headings */}
            <div className="mb-6">
              {step === 'request-otp' && (
                <>
                  <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                  <p className="text-sm text-blue-200/70">
                    Enter your work email to receive a one-time password
                  </p>
                </>
              )}
              {step === 'verify-otp' && (
                <>
                  <h2 className="text-2xl font-bold text-white mb-2">Verify OTP</h2>
                  <p className="text-sm text-blue-200/70">
                    Enter the 6-digit code sent to your email
                  </p>
                </>
              )}
              {step === 'reset-password' && (
                <>
                  <h2 className="text-2xl font-bold text-white mb-2">Create New Password</h2>
                  <p className="text-sm text-blue-200/70">
                    Choose a strong password for your account
                  </p>
                </>
              )}
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border-2 border-red-500/20 rounded-xl backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            )}
            {success && (
              <div className="mb-4 p-4 bg-green-500/10 border-2 border-green-500/20 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <p className="text-sm text-green-300">{success}</p>
                </div>
              </div>
            )}

            {/* Step Content */}
            {renderStep()}

            {/* Back to Login Link */}
            {step === 'request-otp' && (
              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
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
    </div>
  );
}

// Password Strength Component
function PasswordStrength({ password }) {
  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/\d/.test(pwd)) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const labels = ['Very Weak', 'Weak', 'Good', 'Strong'];
  const textColors = ['text-red-400', 'text-orange-400', 'text-yellow-400', 'text-green-400'];

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? colors[strength - 1] : 'bg-white/10'}`}
          />
        ))}
      </div>
      <p className={`text-sm font-medium ${textColors[strength - 1] || 'text-blue-300/50'}`}>
        Password strength: {labels[strength - 1] || 'Very Weak'}
      </p>
      <ul className="space-y-1">
        <li className={`text-xs flex items-center gap-2 ${password.length >= 8 ? 'text-green-400' : 'text-blue-300/40'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? 'bg-green-400' : 'bg-white/20'}`} />
          At least 8 characters
        </li>
        <li className={`text-xs flex items-center gap-2 ${/\d/.test(password) ? 'text-green-400' : 'text-blue-300/40'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${/\d/.test(password) ? 'bg-green-400' : 'bg-white/20'}`} />
          At least one number
        </li>
        <li className={`text-xs flex items-center gap-2 ${/[a-z]/.test(password) && /[A-Z]/.test(password) ? 'text-green-400' : 'text-blue-300/40'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(password) && /[A-Z]/.test(password) ? 'bg-green-400' : 'bg-white/20'}`} />
          Upper & lowercase letters
        </li>
        <li className={`text-xs flex items-center gap-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-400' : 'text-blue-300/40'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'bg-green-400' : 'bg-white/20'}`} />
          At least one special character
        </li>
      </ul>
    </div>
  );
}