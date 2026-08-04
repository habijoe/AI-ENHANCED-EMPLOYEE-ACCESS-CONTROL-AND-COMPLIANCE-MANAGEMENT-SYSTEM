import React from "react";
import {
  Shield,
  Brain,
  FileCheck,
  AlertTriangle,
  Users,
  TrendingUp,
  ChevronRight,
  CheckCircle,
  Zap,
  Award,
  Globe,
  Lock,
  Smartphone,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "../../public/hammerlogo.webp";

export function LandingPage() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const features = [
    {
      icon: Shield,
      title: "Advanced Access Control",
      description: "Role-based permissions with real-time monitoring and automated access reviews",
    },
    {
      icon: Brain,
      title: "AI-Powered Monitoring",
      description: "Machine learning algorithms detect anomalies and predict security threats",
    },
    {
      icon: FileCheck,
      title: "Compliance Management",
      description: "Automated auditing for GDPR, ISO 27001, SOC 2, and local regulations",
    },
    {
      icon: AlertTriangle,
      title: "Incident Response",
      description: "Rapid incident detection, tracking, and automated response workflows",
    },
    {
      icon: TrendingUp,
      title: "Risk Assessment",
      description: "Continuous risk scoring and predictive analytics for proactive security",
    },
    {
      icon: Users,
      title: "User Management",
      description: "Centralized identity management with multi-factor authentication",
    },
  ];

  const stats = [
    { value: "99.9%", label: "Uptime", icon: Zap },
    { value: "24/7", label: "Monitoring", icon: Shield },
    { value: "< 1min", label: "Response Time", icon: AlertTriangle },
    { value: "ISO Certified", label: "Compliance", icon: Award },
  ];

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Security", href: "#security" },
    { label: "About", href: "#about" },
  ];

  const handleClickGetStarted = () => {
    navigate("/login");
  };

  const handleSignIn = () => {
    navigate("/login");
  };

  const scrollToSection = (e, href) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src={Logo} 
                alt="Hammer Tech Logo" 
                className="h-10 w-auto object-contain"
              />
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-gray-900">Hammer Tech</span>
                <span className="text-xs text-blue-600 block -mt-1">Security Platform</span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="text-gray-600 hover:text-blue-600 transition-colors font-medium text-sm"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop Sign In Button */}
            <div className="hidden md:flex items-center gap-4">
              {/* <button
                onClick={handleSignIn}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign In
              </button> */}
              <button
                onClick={handleClickGetStarted}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm px-5 py-2 rounded-lg transition-all font-medium shadow-md hover:shadow-lg"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-3 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="block text-gray-600 hover:text-blue-600 transition-colors font-medium py-2"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-gray-200 space-y-3">
                <button
                  onClick={handleSignIn}
                  className="w-full px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={handleClickGetStarted}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm px-5 py-2 rounded-lg transition-all font-medium shadow-md"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white pt-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.3) 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-800/30 border border-blue-600/50">
                <Globe className="h-4 w-4 text-white" />
                <span className="text-sm text-blue-200">
                  Powered by Hammer Group Rwanda
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                AI-Enhanced Access Control & Compliance System
              </h1>

              <p className="text-lg text-blue-100">
                Enterprise-grade security platform for Hammer Tech Ltd, 
                combining artificial intelligence with comprehensive compliance 
                management to protect your organization.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  className="bg-white text-blue-700 hover:bg-gray-100 text-lg px-8 py-4 rounded-lg flex items-center justify-center transition-all font-medium shadow-lg hover:shadow-xl"
                  onClick={handleClickGetStarted}
                >
                  Get Started
                  <ChevronRight className="ml-2 h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Icon className="h-4 w-4 text-blue-300 mr-1" />
                        <div className="text-xl font-bold">{stat.value}</div>
                      </div>
                      <div className="text-xs text-blue-300">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full"></div>
                <div className="relative border border-blue-600 bg-blue-900/50 backdrop-blur rounded-xl p-6 shadow-xl">
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                          <Shield className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white text-xl font-semibold">
                            Security Dashboard
                          </h3>
                          <p className="text-blue-300 text-sm">
                            Real-time monitoring
                          </p>
                        </div>
                      </div>
                      <div className="border border-green-500/50 text-green-500 px-3 py-1 rounded-full flex items-center text-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        Active
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-800/50 p-4 rounded-lg border border-blue-700/50">
                        <div className="text-2xl font-bold text-white mb-1">
                          1,247
                        </div>
                        <div className="text-xs text-blue-300">
                          Active Users
                        </div>
                      </div>
                      <div className="bg-blue-800/50 p-4 rounded-lg border border-blue-700/50">
                        <div className="text-2xl font-bold text-green-500 mb-1">
                          98.5%
                        </div>
                        <div className="text-xs text-blue-300">
                          Compliance Score
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-300">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>All systems operational</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24 scroll-mt-20">
        <div className="text-center mb-12">
          <div className="inline-flex px-4 py-2 rounded-full bg-blue-100 text-blue-700 border border-blue-200 mb-4 font-medium">
            Comprehensive Security Platform
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for Enterprise Security
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Our AI-enhanced system provides complete visibility and control 
            over your organization's security posture with automated compliance 
            and intelligent threat detection.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="border border-gray-200 hover:border-blue-300 transition-all rounded-xl p-6 bg-white hover:shadow-lg shadow-sm"
              >
                <div className="mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-base">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Security Features */}
      <section id="security" className="bg-gray-50 py-16 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Enterprise-Grade Security
            </h3>
            <p className="text-gray-600">
              Built with industry-leading security standards
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
              <Shield className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <p className="text-gray-900 font-medium">256-bit Encryption</p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
              <Lock className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <p className="text-gray-900 font-medium">MFA Protected</p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
              <Smartphone className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <p className="text-gray-900 font-medium">AI Monitored</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="about" className="bg-gradient-to-r from-blue-50 to-blue-100 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 lg:py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 mb-6 shadow-lg">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Ready to Secure Your Organization?
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Join Hammer Tech Ltd in leveraging AI-powered security and 
            compliance management. Start protecting your assets today with 
            our enterprise-grade platform.
          </p>
          <button
            className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg px-8 py-4 rounded-lg flex items-center justify-center mx-auto transition-all font-medium shadow-lg hover:shadow-xl"
            onClick={handleClickGetStarted}
          >
            Access the Platform
            <ChevronRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-medium">© {currentYear} Hammer Tech Ltd</span>
              <p className="text-xs text-gray-400 mt-1">
                Powered by Hammer Group Rwanda
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://www.hammergp.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors"
            >
              About Hammer Group
            </a>
            <span className="text-gray-300">•</span>
            <span className="border border-blue-200 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
              v2.1.0
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}